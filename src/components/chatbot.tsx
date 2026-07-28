"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Send, X } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile-widget";

const SUPPORT_CHAT_ENABLED =
  process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED === "true";
const TURNSTILE_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
);
const SUPPORT_PHONE_DISPLAY = "734-338-8453";
const SUPPORT_PHONE_HREF = "tel:+17343388453";
const SUPPORT_EMAIL = "Tory@myeyerx.net";
const QUICK_QUESTIONS = [
  "How much does it cost?",
  "How long does the process take?",
  "What documents can I upload?",
  "Why are documents required?",
  "What happens after I submit?",
  "How does payment work?",
] as const;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const INTRO_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi — I’m an automated MyEyeRx support assistant. I can answer general questions about the tint-exemption intake process. Please do not share medical records, your date of birth, address, contact details, payment information, or other personal information in this chat.",
};

function stateSlugFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/book\/([a-z0-9-]+)(?:\/|$)/);
  return match?.[1];
}

export function Chatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botToken, setBotToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    const openFromSupportAnchor = () => {
      if (window.location.hash === "#support-chat") setOpen(true);
    };
    window.addEventListener("hashchange", openFromSupportAnchor);
    return () => window.removeEventListener("hashchange", openFromSupportAnchor);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!SUPPORT_CHAT_ENABLED || !message || loading) return;
    if (TURNSTILE_ENABLED && !botToken) {
      setError("Complete the security check before sending a message.");
      return;
    }

    setMessages((current) => [...current, { role: "user", content: message }]);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          stateSlug: stateSlugFromPath(pathname),
          botToken: botToken || undefined,
        }),
      });
      const body = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !body.reply) {
        throw new Error(
          body.error ||
            `Automated support is unavailable. Call ${SUPPORT_PHONE_DISPLAY} and ask for Tory, or email ${SUPPORT_EMAIL}.`
        );
      }
      setMessages((current) => [
        ...current,
        { role: "assistant", content: body.reply as string },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Automated support is unavailable. Call ${SUPPORT_PHONE_DISPLAY} and ask for Tory, or email ${SUPPORT_EMAIL}.`
      );
    } finally {
      setLoading(false);
      setBotToken("");
      setTurnstileResetKey((current) => current + 1);
    }
  }

  return (
    <>
      {!open && (
        <button
          id="support-chat"
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open customer support"
          aria-haspopup="dialog"
        >
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {open && (
        <section
          id="support-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="support-chat-title"
          className="fixed bottom-3 left-3 right-3 z-50 flex h-[min(34rem,calc(100dvh-1.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-96"
        >
          <header className="flex items-center justify-between bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle
                className="h-5 w-5 text-primary-foreground"
                aria-hidden="true"
              />
              <div>
                <h2
                  id="support-chat-title"
                  className="text-sm font-semibold text-primary-foreground"
                >
                  MyEyeRx Support
                </h2>
                <p className="text-xs text-primary-foreground/75">
                  {SUPPORT_CHAT_ENABLED ? "Automated assistant" : "Contact our team"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
              aria-label="Close customer support"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          {SUPPORT_CHAT_ENABLED ? (
            <>
              <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                aria-live="polite"
                aria-relevant="additions"
              >
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <p className="text-sm text-muted-foreground" role="status">
                    Automated support is responding…
                  </p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border p-3">
                {error && (
                  <p className="mb-2 text-xs text-red-700" role="alert">
                    {error}
                  </p>
                )}
                <div
                  className="mb-3"
                  role="group"
                  aria-label="Suggested support questions"
                >
                  <p className="mb-1.5 text-xs font-medium text-foreground">
                    Suggested questions
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {QUICK_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => {
                          setInput(question);
                          setError(null);
                          inputRef.current?.focus();
                        }}
                        disabled={loading}
                        className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mb-2 text-xs text-muted-foreground">
                  General questions only. Never paste personal, medical, or payment
                  information here.
                </p>
                <form onSubmit={handleSend} className="space-y-2">
                  <TurnstileWidget
                    onToken={setBotToken}
                    resetKey={turnstileResetKey}
                  />
                  <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="support-chat-input" className="sr-only">
                      Ask a general support question
                    </label>
                    <input
                      ref={inputRef}
                      id="support-chat-input"
                      type="text"
                      value={input}
                      maxLength={500}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="Ask a general question…"
                      disabled={loading}
                      autoComplete="off"
                      className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                    />
                    <span className="mt-1 block text-right text-[11px] text-muted-foreground">
                      {input.length}/500
                    </span>
                  </div>
                  <button
                    type="submit"
                    disabled={
                      !input.trim() ||
                      loading ||
                      (TURNSTILE_ENABLED && !botToken)
                    }
                    className="mb-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col justify-center p-6 text-center">
              <p className="text-base font-semibold text-foreground">
                Our team is ready to help.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Automated chat is not enabled. Please contact MyEyeRx directly and
                do not email medical records or payment information.
              </p>
              <a
                href={SUPPORT_PHONE_HREF}
                className="mt-5 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Call {SUPPORT_PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-3 rounded-lg border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Email {SUPPORT_EMAIL}
              </a>
            </div>
          )}
        </section>
      )}
    </>
  );
}
