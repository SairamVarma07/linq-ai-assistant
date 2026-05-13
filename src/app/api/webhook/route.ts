import { after, NextRequest } from "next/server";
import OpenAI from "openai";
import axios from "axios";

type LinqWebhookPayload = {
  id?: string;
  event_id?: string;
  event_type?: string;
  data?: {
    id?: string;
    direction?: string;
    parts?: Array<{
      value?: string;
    }>;
    sender_handle?: {
      handle?: string;
    };
  };
};

const DEDUPE_TTL_MS = 10 * 60 * 1000;
const seenEventIds = new Map<string, number>();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://linq-ai-assistant.vercel.app",
    "X-Title": "Linq AI Assistant",
  },
});

function parseLinqPayload(raw: unknown): LinqWebhookPayload {
  return typeof raw === "string" ? JSON.parse(raw) : (raw as LinqWebhookPayload);
}

function getEventId(body: LinqWebhookPayload) {
  return body.event_id ?? body.id ?? body.data?.id;
}

function hasSeenEvent(eventId: string) {
  const now = Date.now();

  for (const [id, seenAt] of seenEventIds) {
    if (now - seenAt > DEDUPE_TTL_MS) {
      seenEventIds.delete(id);
    }
  }

  if (seenEventIds.has(eventId)) {
    return true;
  }

  seenEventIds.set(eventId, now);
  return false;
}

async function sendAiReply(senderPhone: string, incomingMessage: string) {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-oss-20b:free",
    messages: [
      {
        role: "system",
        content:
          "You are a friendly and concise SMS assistant for a small business. " +
          "Keep all replies under 160 characters when possible. " +
          "Answer questions about hours, location, services, and general inquiries. " +
          "If asked about something you don't know specifically, give a helpful generic answer.",
      },
      {
        role: "user",
        content: incomingMessage,
      },
    ],
    max_tokens: 150,
  });

  const aiReply =
    completion.choices[0].message.content ??
    "Thanks for your message! We'll get back to you shortly.";

  console.log(`AI reply to ${senderPhone}: "${aiReply}"`);

  await axios.post(
    "https://api.linqapp.com/api/partner/v3/chats",
    {
      from: process.env.LINQ_PHONE_NUMBER,
      to: [senderPhone],
      message: {
        parts: [
          {
            type: "text",
            value: aiReply,
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LINQ_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  console.log("SMS reply sent successfully via Linq");
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();

    // Linq sends the payload as a double-encoded JSON string
    const body = parseLinqPayload(raw);

    console.log("Linq webhook received:", JSON.stringify(body, null, 2));

    // Ignore outbound messages (our own AI replies) to prevent feedback loops
    if (body?.data?.direction === "outbound" || body?.event_type === "message.sent") {
      return Response.json({ success: true, ignored: true });
    }

    // Linq v3 message.received payload structure
    const incomingMessage = body?.data?.parts?.[0]?.value || "Hello";
    const senderPhone = body?.data?.sender_handle?.handle;
    const eventId = getEventId(body);

    if (!senderPhone) {
      console.warn("No sender phone found in webhook payload:", JSON.stringify(body?.data));
      return Response.json({ success: true, ignored: true });
    }

    if (eventId && hasSeenEvent(eventId)) {
      console.log(`Duplicate Linq webhook ignored: ${eventId}`);
      return Response.json({ success: true, duplicate: true });
    }

    console.log(`Incoming from ${senderPhone}: "${incomingMessage}"`);

    after(async () => {
      try {
        await sendAiReply(senderPhone, incomingMessage);
      } catch (error) {
        console.error("Background webhook processing failed:", error);
      }
    });

    return Response.json({ success: true, queued: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
