"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";

/* ─────────────────────────────────────────────
   PHONE DEMO
───────────────────────────────────────────── */
const DEMO_MESSAGES = [
  { from: "customer", text: "What are your business hours?", delay: 0 },
  { from: "ai", text: "We're open Mon–Fri 9am–6pm, Sat 10am–4pm. Closed Sundays 😊", delay: 1400 },
  { from: "customer", text: "Do you offer same-day appointments?", delay: 3200 },
  { from: "ai", text: "Yes! Book before noon for same-day slots. Reply BOOK to schedule.", delay: 4800 },
  { from: "customer", text: "What's your cancellation policy?", delay: 6600 },
  { from: "ai", text: "Cancel up to 2 hours before for a full refund. No worries at all! 👍", delay: 8200 },
];

type Message = { from: string; text: string };

function PhoneDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [running, setRunning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runDemo = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setMessages([]);
    setTyping(false);
    setRunning(true);
    DEMO_MESSAGES.forEach((msg, i) => {
      const t1 = setTimeout(() => { if (msg.from === "ai") setTyping(true); }, Math.max(0, msg.delay - 700));
      const t2 = setTimeout(() => {
        setTyping(false);
        setMessages((p) => [...p, { from: msg.from, text: msg.text }]);
        if (i === DEMO_MESSAGES.length - 1) setRunning(false);
      }, msg.delay);
      timeoutsRef.current.push(t1, t2);
    });
  };

  useEffect(() => { runDemo(); return () => timeoutsRef.current.forEach(clearTimeout); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const el = scrollContainerRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, typing]);

  return (
    <div className="relative mx-auto w-[272px]">
      <div className="absolute inset-0 rounded-[2.8rem] bg-gradient-to-br from-cyan-500/30 to-purple-600/30 blur-2xl -z-10 scale-110" />
      <div className="relative rounded-[2.5rem] border-[5px] border-slate-700/80 bg-[#0d1117] shadow-2xl overflow-hidden">
        <div className="flex justify-center pt-3 pb-1"><div className="w-20 h-[18px] rounded-full bg-slate-800" /></div>
        <div className="flex items-center justify-between px-4 py-1 text-[10px] text-slate-400">
          <span>9:41 AM</span><span className="text-emerald-400">●●●●</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/60 bg-[#0d1117]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-cyan-500/30">AI</div>
          <div>
            <p className="text-[11px] font-semibold text-white">Linq AI Assistant</p>
            <p className="text-[9px] text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />Online</p>
          </div>
        </div>
        <div ref={scrollContainerRef} className="h-60 overflow-y-auto px-3 py-3 space-y-2 scrollbar-hide bg-[#080c12]">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }}
                className={`flex ${msg.from === "customer" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed shadow-sm ${
                  msg.from === "customer"
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700/50"
                }`}>{msg.text}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1 items-center border border-slate-700/50">
                {[0, 150, 300].map((d) => <span key={d} style={{ animationDelay: `${d}ms` }} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />)}
              </div>
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border-t border-slate-800/60 bg-[#0d1117]">
          <div className="flex-1 h-7 rounded-full bg-slate-800/80 text-[10px] text-slate-500 flex items-center px-3 border border-slate-700/40">Message…</div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-md shadow-cyan-500/40">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z" /></svg>
          </div>
        </div>
        <div className="flex justify-center py-2"><div className="w-20 h-1 rounded-full bg-slate-700" /></div>
      </div>
      <button onClick={runDemo} disabled={running}
        className="mt-4 w-full text-[11px] text-slate-500 hover:text-cyan-400 transition-colors disabled:opacity-30 flex items-center justify-center gap-1.5">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
        {running ? "Running demo…" : "Replay demo"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REUSABLE FADE-IN WRAPPER
───────────────────────────────────────────── */
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FLOATING ORBS (decorative SVG blobs)
───────────────────────────────────────────── */
function Orb({ color, size, x, y, blur }: { color: string; size: number; x: string; y: string; blur: number }) {
  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y, width: size, height: size }}>
      <div className="w-full h-full rounded-full" style={{ background: color, filter: `blur(${blur}px)`, opacity: 0.18 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); } else setVal(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div className="flex flex-col min-h-screen bg-[#060a12] text-white overflow-x-hidden font-sans">

      {/* ── NAVBAR ── */}
      <motion.nav initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#060a12]/70 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-bold shadow-lg shadow-cyan-500/20">AI</div>
            <span className="font-semibold text-sm tracking-tight">Linq AI</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400">
            {["How it works", "Features", "Stack", "Setup"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <a href="https://github.com/SairamVarma07/linq-ai-assistant" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              GitHub
            </a>
            <a href="https://linqapp.com" target="_blank" rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 transition-all text-slate-900 font-semibold px-4 py-1.5 rounded-full text-xs shadow-lg shadow-cyan-500/25">
              Linq Dashboard →
            </a>
          </div>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        {/* Background orbs */}
        <Orb color="radial-gradient(circle, #06b6d4, transparent)" size={700} x="-15%" y="-10%" blur={120} />
        <Orb color="radial-gradient(circle, #8b5cf6, transparent)" size={600} x="60%" y="5%" blur={140} />
        <Orb color="radial-gradient(circle, #10b981, transparent)" size={400} x="20%" y="55%" blur={100} />

        {/* Animated grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col lg:flex-row items-center gap-16 max-w-6xl w-full">
          {/* Left copy */}
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 self-center lg:self-start border border-cyan-500/30 bg-cyan-500/8 text-cyan-300 text-xs font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AI-powered SMS · Built on Linq + OpenRouter
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Your AI SMS Agent,
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                text to reply in under 3s.
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
              className="text-slate-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              Customers text your number. An AI assistant, trained on your business, responds instantly. 24/7, zero staff required.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a href="#how-it-works"
                className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all text-white font-semibold px-7 py-3.5 rounded-full text-sm shadow-xl shadow-cyan-500/25">
                <span className="relative z-10">See how it works</span>
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              </a>
              <a href="https://github.com/SairamVarma07/linq-ai-assistant" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 hover:text-white transition-all px-7 py-3.5 rounded-full text-sm font-medium backdrop-blur-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                View Source
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start text-[11px] text-slate-500">
              {["✓ No credit card", "✓ Open source", "✓ Deploy in < 5 min"].map((b) => (
                <span key={b} className="border border-white/[0.06] bg-white/[0.02] px-3 py-1 rounded-full">{b}</span>
              ))}
            </motion.div>
          </div>

          {/* Right phone */}
          <motion.div initial={{ opacity: 0, x: 40, rotateY: -10 }} animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="flex-shrink-0">
            <PhoneDemo />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 text-[11px]">
          <span>scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5H7z" /></svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-14 border-y border-white/[0.06] bg-gradient-to-r from-[#0a0f1e] via-[#0d1220] to-[#0a0f1e] overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #06b6d4 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center relative z-10">
          {[
            { value: 3, suffix: "s", label: "Avg response time", color: "from-cyan-400 to-blue-400" },
            { value: 99, suffix: "%", label: "Uptime on Vercel", color: "from-purple-400 to-pink-400" },
            { value: 100, suffix: "%", label: "Automated replies", color: "from-emerald-400 to-teal-400" },
          ].map((s) => (
            <FadeIn key={s.label} className="flex flex-col gap-1">
              <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                &lt;<Counter to={s.value} suffix={s.suffix} />
              </span>
              <span className="text-slate-500 text-xs sm:text-sm">{s.label}</span>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-28 px-6 overflow-hidden bg-[#060a12]">
        <Orb color="radial-gradient(circle, #8b5cf6, transparent)" size={500} x="70%" y="10%" blur={130} />

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn className="text-center mb-20">
            <span className="inline-block text-xs font-semibold text-purple-400 tracking-widest uppercase mb-4 border border-purple-500/30 bg-purple-500/8 px-4 py-1.5 rounded-full">How it works</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Four steps. Fully automated.</h2>
            <p className="text-slate-400 max-w-md mx-auto">From text message to AI reply in under 3 seconds - no human in the loop.</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                n: "01", color: "from-cyan-500 to-blue-500", border: "border-cyan-500/20", hover: "hover:border-cyan-500/30",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" /></svg>,
                title: "Customer texts your number",
                desc: "They SMS your Linq virtual number. No app, no signup - just a regular text message.",
              },
              {
                n: "02", color: "from-purple-500 to-pink-500", border: "border-purple-500/20", hover: "hover:border-purple-500/30",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>,
                title: "Linq fires a webhook",
                desc: "Linq delivers the message payload to your Next.js API route via a secure POST webhook.",
              },
              {
                n: "03", color: "from-emerald-500 to-teal-500", border: "border-emerald-500/20", hover: "hover:border-emerald-500/30",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" /></svg>,
                title: "LLM generates a reply",
                desc: "OpenRouter routes the message to an LLM with a business-tuned system prompt. Reply generated in ~1s.",
              },
              {
                n: "04", color: "from-orange-500 to-amber-500", border: "border-orange-500/20", hover: "hover:border-orange-500/30",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z" /></svg>,
                title: "Customer gets the reply",
                desc: "The AI response is sent back as an SMS via the Linq API. End-to-end in under 3 seconds.",
              },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.1}>
                <motion.div whileHover={{ scale: 1.02, y: -3 }} transition={{ duration: 0.2 }}
                  className={`group relative rounded-2xl border ${s.border} ${s.hover} bg-white/[0.02] hover:bg-white/[0.04] transition-all p-6 overflow-hidden`}>
                  <div className="absolute top-3 right-4 text-5xl font-black text-white/[0.035] select-none group-hover:text-white/[0.065] transition-all">{s.n}</div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg`}>{s.icon}</div>
                  <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES SPLIT ── */}
      <section id="features" className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-[#0a0d1c] to-[#06090f]">
        <Orb color="radial-gradient(circle, #10b981, transparent)" size={500} x="0%" y="20%" blur={130} />

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn className="text-center mb-20">
            <span className="inline-block text-xs font-semibold text-emerald-400 tracking-widest uppercase mb-4 border border-emerald-500/30 bg-emerald-500/8 px-4 py-1.5 rounded-full">Features</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Built for real businesses</h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "⚡", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                title: "Instant responses",
                desc: "No customer waits. The full webhook → AI → SMS loop completes in under 3 seconds.",
              },
              {
                icon: "🧠", color: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                title: "Context-aware AI",
                desc: "System prompt tuned to your business. The AI knows your hours, services, and policies.",
              },
              {
                icon: "🔁", color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                title: "Loop prevention",
                desc: "Outbound messages are automatically ignored - no runaway reply loops.",
              },
              {
                icon: "🔒", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                title: "Secure by default",
                desc: "All credentials in environment variables. Never exposed to the client.",
              },
              {
                icon: "📱", color: "bg-pink-500/10 border-pink-500/20 text-pink-400",
                title: "Works with iMessage",
                desc: "Linq routes messages over iMessage and SMS - no carrier restrictions.",
              },
              {
                icon: "🚀", color: "bg-orange-500/10 border-orange-500/20 text-orange-400",
                title: "Deploy to Vercel",
                desc: "One-click deploy. Permanent URL, no ngrok, no local server needed.",
              },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.07}>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-6 transition-colors group">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl mb-4 ${f.color} group-hover:scale-110 transition-transform`}>{f.icon}</div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── WEBHOOK PAYLOAD VISUALISER ── */}
      <section className="relative py-28 px-6 overflow-hidden bg-[#060a12]">
        <Orb color="radial-gradient(circle, #06b6d4, transparent)" size={400} x="55%" y="30%" blur={120} />

        <div className="max-w-5xl mx-auto relative z-10 grid lg:grid-cols-2 gap-14 items-center">
          <FadeIn>
            <span className="inline-block text-xs font-semibold text-cyan-400 tracking-widest uppercase mb-4 border border-cyan-500/30 bg-cyan-500/8 px-4 py-1.5 rounded-full">Webhook Payload</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5">Real Linq v3 data,<br />parsed correctly.</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-6">
              The webhook handler extracts the customer's message and phone number from the actual Linq v3 <code className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded text-sm">message.received</code> payload structure, not assumptions.
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Sender phone", path: "data.sender_handle.handle", color: "text-emerald-400" },
                { label: "Message text", path: "data.parts[0].value", color: "text-purple-400" },
                { label: "Direction check", path: "data.direction === 'inbound'", color: "text-cyan-400" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 w-28 flex-shrink-0">{f.label}</span>
                  <code className={`${f.color} bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg text-[12px] font-mono`}>{f.path}</code>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0d1117]">
                <div className="flex gap-1.5">{["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{background:c}} />)}</div>
                <span className="text-xs text-slate-500 ml-2 font-mono">message.received payload</span>
              </div>
              <pre className="px-5 py-4 text-[11.5px] font-mono text-slate-300 overflow-x-auto leading-relaxed">{`{
  "event_type": <span class="text-cyan-400">"message.received"</span>,
  "data": {
    "direction": <span class="text-emerald-400">"inbound"</span>,
    "parts": [{
      "type": <span class="text-yellow-400">"text"</span>,
      "value": <span class="text-purple-400">"What are your hours?"</span>
    }],
    "sender_handle": {
      "handle": <span class="text-pink-400">"+16787942399"</span>
    }
  }
}`}</pre>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section id="stack" className="relative py-24 px-6 overflow-hidden bg-gradient-to-b from-[#06090f] to-[#0a0d1c]">
        <Orb color="radial-gradient(circle, #f59e0b, transparent)" size={400} x="80%" y="40%" blur={120} />

        <div className="max-w-4xl mx-auto relative z-10">
          <FadeIn className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-amber-400 tracking-widest uppercase mb-4 border border-amber-500/30 bg-amber-500/8 px-4 py-1.5 rounded-full">Tech Stack</span>
            <h2 className="text-4xl font-bold tracking-tight">Simple. Modern. Shippable.</h2>
          </FadeIn>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "Next.js 16", color: "bg-white/10 text-white border-white/15" },
              { name: "TypeScript", color: "bg-blue-500/10 text-blue-300 border-blue-500/25" },
              { name: "OpenRouter", color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25" },
              { name: "Linq API v3", color: "bg-cyan-500/10 text-cyan-300 border-cyan-500/25" },
              { name: "Framer Motion", color: "bg-pink-500/10 text-pink-300 border-pink-500/25" },
              { name: "Tailwind CSS v4", color: "bg-sky-500/10 text-sky-300 border-sky-500/25" },
              { name: "Webhooks", color: "bg-orange-500/10 text-orange-300 border-orange-500/25" },
              { name: "ngrok", color: "bg-purple-500/10 text-purple-300 border-purple-500/25" },
              { name: "Vercel", color: "bg-slate-400/10 text-slate-300 border-slate-400/25" },
              { name: "Axios", color: "bg-teal-500/10 text-teal-300 border-teal-500/25" },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.04}>
                <motion.span whileHover={{ scale: 1.07, y: -2 }} transition={{ duration: 0.15 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border cursor-default ${t.color}`}>
                  {t.name}
                </motion.span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SETUP ── */}
      <section id="setup" className="relative py-24 px-6 overflow-hidden bg-[#060a12]">
        <Orb color="radial-gradient(circle, #8b5cf6, transparent)" size={450} x="10%" y="30%" blur={130} />

        <div className="max-w-3xl mx-auto relative z-10">
          <FadeIn className="text-center mb-14">
            <span className="inline-block text-xs font-semibold text-purple-400 tracking-widest uppercase mb-4 border border-purple-500/30 bg-purple-500/8 px-4 py-1.5 rounded-full">Quick Setup</span>
            <h2 className="text-4xl font-bold tracking-tight">Live in 5 minutes.</h2>
          </FadeIn>

          <div className="space-y-3">
            {[
              { n: 1, title: "Clone and install", code: "git clone <your-repo>\nnpm install", accent: "bg-cyan-500" },
              { n: 2, title: "Set environment variables (.env.local)", code: "OPENROUTER_API_KEY=sk-or-...\nLINQ_API_TOKEN=...\nLINQ_PHONE_NUMBER=+1650...", accent: "bg-purple-500" },
              { n: 3, title: "Run locally and tunnel with ngrok", code: "npm run dev\nngrok http 3000", accent: "bg-emerald-500" },
              { n: 4, title: "Configure Linq webhook", code: "URL: https://<ngrok-id>.ngrok-free.app/api/webhook\nEvent: message.received", accent: "bg-orange-500" },
            ].map((s, i) => (
              <FadeIn key={s.n} delay={i * 0.08}>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] transition-colors">
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
                    <span className={`w-6 h-6 rounded-full ${s.accent} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{s.n}</span>
                    <span className="text-sm font-medium text-slate-200">{s.title}</span>
                  </div>
                  <pre className="px-5 py-3 text-xs text-slate-400 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">{s.code}</pre>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-[#0a0d1c] to-[#060a12]">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.07] via-purple-500/[0.05] to-emerald-500/[0.07]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <FadeIn className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold shadow-2xl shadow-cyan-500/30">AI</div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">Ready to deploy?</h2>
          <p className="text-slate-400 text-lg max-w-md">Push to GitHub, connect to Vercel, add your env vars, and your AI SMS assistant is live.</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              href="https://vercel.com/new" target="_blank" rel="noopener noreferrer"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-8 py-3.5 rounded-full text-sm shadow-xl shadow-cyan-500/25 transition-all">
              Deploy to Vercel →
            </motion.a>
            <motion.a whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              href="https://github.com/SairamVarma07/linq-ai-assistant" target="_blank" rel="noopener noreferrer"
              className="border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.07] text-slate-300 hover:text-white px-8 py-3.5 rounded-full text-sm font-medium transition-all flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
              View on GitHub
            </motion.a>
          </div>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-8 px-6 bg-[#060a12]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white">AI</div>
            <span>Linq AI Assistant · Linq Candidate Technical Challenge</span>
          </div>
          <div className="flex gap-5">
            {[["Linq", "https://linqapp.com"], ["OpenRouter", "https://openrouter.ai"], ["GitHub", "https://github.com"], ["Vercel", "https://vercel.com"]].map(([name, href]) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{name}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
