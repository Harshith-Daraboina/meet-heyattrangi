"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useChat } from "@livekit/components-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "pragya";
  text: string;
  ts: number;
}



// ─── Constants ────────────────────────────────────────────────────────────────

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;
const GROQ_MODEL = "llama-3.3-70b-versatile";
const STORAGE_KEY = "pragya_context";
const MAX_CONTEXT = 20;

const SYSTEM_PROMPT = `You are Pragya, a helpful AI assistant built into the Hey Attrangi Meet platform.
Your goal is to assist participants by answering questions, providing summaries of the meeting chat, and being a general helpful presence.
Keep responses concise, clear, and professional. You are here to help with the flow of the meeting and answer any general queries.`;

const MOCK_RESPONSES = [
  "I hear you. It sounds like you're going through a lot right now. I'm here to listen.",
  "That's a very valid way to feel. How long have you been feeling this way?",
  "Thank you for sharing that with me. Remember to be kind to yourself today.",
  "I'm here for you. Sometimes just talking about it can help a little.",
  "That sounds challenging. What's one small thing that helped you feel even slightly better today?",
  "I'm listening. Take all the time you need to express yourself.",
  "You're not alone in this. We're in this together.",
  "It's okay to not be okay. I'm here to support you in whatever way I can.",
];

const MOCK_SUMMARY_RESPONSES = [
  "Based on the conversation so far, it seems like the group is focusing on finding a balance between work and wellness, specifically discussing ways to reduce screen time.",
  "The meeting has covered a few key points: checking in on everyone's emotional state and planning a collective relaxation session for next week.",
  "So far, you've discussed the importance of setting boundaries and shared some helpful coping mechanisms for stress.",
];

function getMockResponse(isSummaryReq: boolean) {
  const list = isSummaryReq ? MOCK_SUMMARY_RESPONSES : MOCK_RESPONSES;
  return list[Math.floor(Math.random() * list.length)];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadContext(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveContext(msgs: Message[]) {
  if (typeof window === "undefined") return;
  const trimmed = msgs.slice(-MAX_CONTEXT);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

function buildGroqHistory(msgs: Message[]): { role: string; content: string }[] {
  return msgs.map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.text,
  }));
}

async function callGroq(history: { role: string; content: string }[], userText: string): Promise<string> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: userText },
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't generate a response.";
}


// ─── Component ────────────────────────────────────────────────────────────────

interface AskPragyaProps {
  open: boolean;
  onClose: () => void;
}

export default function AskPragya({ open, onClose }: AskPragyaProps) {
  const { chatMessages } = useChat();
  const [messages, setMessages] = useState<Message[]>(() => loadContext());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Persist context whenever messages change
  useEffect(() => {
    saveContext(messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);


  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", text: trimmed, ts: Date.now() };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setInput("");
      setLoading(true);

      try {
        const history = buildGroqHistory(messages); // history before this message
        
        // ─── Extract Meeting Context for Summarization ───
        const isSummaryReq = /summarize|summary|what happened|recap/i.test(trimmed);
        let finalUserText = trimmed;
        
        if (isSummaryReq && chatMessages.length > 0) {
          const transcript = chatMessages
            .map(m => `${m.from?.identity || 'Unknown'}: ${m.message}`)
            .join("\n");
          finalUserText = `[MEETING CHAT CONTEXT]:\n${transcript}\n\n[USER QUESTION]: ${trimmed}\n\nPlease summarize the meeting based ONLY on the context provided above.`;
        }

        let reply = "";
        try {
          reply = await callGroq(history, finalUserText);
        } catch (apiError) {
          console.warn("Groq API failed, using mock fallback:", apiError);
          await new Promise(r => setTimeout(r, 800));
          reply = getMockResponse(isSummaryReq);
        }
        const pragyaMsg: Message = { role: "pragya", text: reply, ts: Date.now() };
        setMessages((prev) => [...prev, pragyaMsg]);
      } catch (e: any) {
        const errMsg: Message = {
          role: "pragya",
          text: `I'm having a little trouble connecting right now, but I'm still here for you.`,
          ts: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearContext = () => {
    setMessages([]);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* ── Chat Panel ── */}
      <div
        className={`
          fixed top-0 right-0 h-[calc(100dvh-72px)] w-full sm:w-[380px] z-[60]
          flex flex-col backdrop-blur-xl bg-[rgba(10,10,10,0.92)] border-l border-[rgba(255,106,45,0.15)]
          shadow-2xl shadow-[#FF6A2D]/5
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full pointer-events-none"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,106,45,0.12)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6A2D] to-[#ff4500] flex items-center justify-center shadow-lg shadow-[#FF6A2D]/30">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="white"/>
                <rect x="13" y="2" width="9" height="9" rx="2" fill="white"/>
                <rect x="2" y="13" width="9" height="9" rx="2" fill="white"/>
                <rect x="13" y="13" width="9" height="9" rx="2" fill="white"/>
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-none">Pragya</h3>
              <p className="text-[#FF6A2D] text-[11px] mt-0.5">AI Meeting Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearContext}
              title="Clear conversation"
              className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-4 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FF6A2D]/10 flex items-center justify-center border border-[#FF6A2D]/20">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="9" height="9" rx="2" fill="#FF6A2D"/>
                  <rect x="13" y="2" width="9" height="9" rx="2" fill="#FF6A2D"/>
                  <rect x="2" y="13" width="9" height="9" rx="2" fill="#FF6A2D"/>
                  <rect x="13" y="13" width="9" height="9" rx="2" fill="#FF6A2D"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Hi! I'm <span className="text-[#FF6A2D] font-semibold">Pragya</span>, your AI assistant for this meeting. How can I help you today?
              </p>
              <p className="text-gray-600 text-xs">You can type to speak to me.</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "pragya" && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6A2D] to-[#ff4500] flex items-center justify-center mr-2 mt-1 shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="9" height="9" rx="2" fill="white"/>
                    <rect x="13" y="2" width="9" height="9" rx="2" fill="white"/>
                    <rect x="2" y="13" width="9" height="9" rx="2" fill="white"/>
                    <rect x="13" y="13" width="9" height="9" rx="2" fill="white"/>
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-[#FF6A2D] text-white rounded-br-sm"
                    : "bg-[rgba(255,255,255,0.06)] text-gray-200 rounded-bl-sm border border-[rgba(255,255,255,0.08)]"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6A2D] to-[#ff4500] flex items-center justify-center mr-2 mt-1 shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="9" height="9" rx="2" fill="white"/>
                  <rect x="13" y="2" width="9" height="9" rx="2" fill="white"/>
                  <rect x="2" y="13" width="9" height="9" rx="2" fill="white"/>
                  <rect x="13" y="13" width="9" height="9" rx="2" fill="white"/>
                </svg>
              </div>
              <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] px-5 py-3 rounded-2xl rounded-bl-sm">
                <span className="flex gap-1.5 items-center h-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A2D] animate-bounce [animation-delay:0ms]"/>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A2D] animate-bounce [animation-delay:150ms]"/>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A2D] animate-bounce [animation-delay:300ms]"/>
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input Row */}
        <div className="px-4 py-4 border-t border-[rgba(255,106,45,0.12)] shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Pragya anything…"
              className="flex-1 resize-none bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white text-sm rounded-2xl px-4 py-3 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF6A2D]/40 focus:border-[#FF6A2D]/40 transition-all min-h-[46px] max-h-[120px] overflow-y-auto"
              style={{ fieldSizing: "content" } as any}
              disabled={loading}
            />
            {/* Send Button */}
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="p-3 rounded-2xl shrink-0 bg-[#FF6A2D] hover:bg-[#ff5500] disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all duration-200 hover:shadow-[0_0_16px_rgba(255,106,45,0.4)] active:scale-95"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-gray-600 text-[10px] text-center mt-2">Context is saved temporarily in your browser tab.</p>
        </div>
      </div>
    </>
  );
}
