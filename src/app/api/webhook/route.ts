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

type LocalFaq = {
  pattern: RegExp;
  reply: string;
};

const DEDUPE_TTL_MS = 10 * 60 * 1000;
const OPENAI_TIMEOUT_MS = 7_000;
const OPENROUTER_MODELS = [
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
];
const seenEventIds = new Map<string, number>();

export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://linq-ai-assistant.vercel.app",
    "X-Title": "Linq AI Assistant",
  },
});

const LOCAL_FAQS: LocalFaq[] = [
  {
    pattern: /appointment|book|booking|schedule|reservation/i,
    reply:
      "Yes, we can help book an appointment. Please share your preferred day and time, and our team will confirm.",
  },
  {
    pattern: /hour|hours|open|close|closing|timing|available/i,
    reply:
      "We are open Monday through Friday, 9 AM to 5 PM. Reply here if you need help with anything specific.",
  },
  {
    pattern: /location|address|where|directions|located/i,
    reply:
      "We are located at 123 Main St. Let us know if you need directions or parking details.",
  },
  {
    pattern: /parking|park/i,
    reply:
      "Yes, free on-site parking is available. You can park near the main entrance when you arrive.",
  },
  {
    pattern: /price|pricing|cost|fee|quote|estimate|how much/i,
    reply:
      "Pricing depends on the service. Tell us what you need, and our team will share the best estimate.",
  },
  {
    pattern: /service|services|offer|do you do|provide/i,
    reply:
      "We would be happy to help. Please tell us what service you need, and our team will confirm the details.",
  },
  {
    pattern: /cancel|reschedule|change.*appointment|move.*appointment/i,
    reply:
      "No problem. Please share your name and preferred new time, and our team will help update your appointment.",
  },
  {
    pattern: /contact|phone|call|email|reach/i,
    reply:
      "You can reply here or call us during business hours. Our team will be happy to help.",
  },
  {
    pattern: /thank|thanks|appreciate/i,
    reply: "You are welcome! Let us know if there is anything else we can help with.",
  },
];

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

function localReplyFor(incomingMessage: string) {
  return LOCAL_FAQS.find(({ pattern }) => pattern.test(incomingMessage))?.reply ?? null;
}

function fallbackReplyFor(incomingMessage: string) {
  const localReply = localReplyFor(incomingMessage);

  if (localReply) {
    console.log("Using local FAQ reply");
    return localReply;
  }

  return "Thanks for reaching out! Our team received your message and will help you shortly.";
}

async function getAiReply(incomingMessage: string) {
  const localReply = localReplyFor(incomingMessage);

  if (localReply) {
    return localReply;
  }

  for (const model of OPENROUTER_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS);

    try {
      const completion = await openai.chat.completions.create(
        {
          model,
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
        },
        { signal: controller.signal }
      );

      return (
        completion.choices[0].message.content ?? fallbackReplyFor(incomingMessage)
      );
    } catch (error) {
      console.error(`OpenRouter model ${model} failed:`, error);
    } finally {
      clearTimeout(timeout);
    }
  }

  console.error("All OpenRouter models failed, using fallback reply");
  return fallbackReplyFor(incomingMessage);
}

async function sendAiReply(senderPhone: string, incomingMessage: string) {
  const aiReply = await getAiReply(incomingMessage);

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
      timeout: 8_000,
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
