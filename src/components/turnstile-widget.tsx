"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

interface TurnstileApi {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme: "auto";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    }
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
}

function turnstileApi(): TurnstileApi | undefined {
  return (window as Window & { turnstile?: TurnstileApi }).turnstile;
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  resetKey?: number;
}

export function TurnstileWidget({ onToken, resetKey = 0 }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const renderWidget = useCallback(() => {
    const turnstile = turnstileApi();
    if (!siteKey || !turnstile || !containerRef.current || widgetIdRef.current) {
      return;
    }
    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  }, [onToken, siteKey]);

  useEffect(
    () => () => {
      const turnstile = turnstileApi();
      if (widgetIdRef.current && turnstile) {
        turnstile.remove(widgetIdRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const turnstile = turnstileApi();
    if (widgetIdRef.current && turnstile) {
      turnstile.reset(widgetIdRef.current);
      onToken("");
    }
  }, [onToken, resetKey]);

  if (!siteKey) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderWidget}
      />
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
