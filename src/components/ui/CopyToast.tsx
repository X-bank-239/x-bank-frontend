"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const COPY_TOAST_EVENT = "xbank-copy-toast";
const VISIBLE_MS = 2200;
const EXIT_MS = 320;

export function notifyCopied(message = "ID счёта скопирован") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COPY_TOAST_EVENT, { detail: { message } }));
}

export function CopyToastHost() {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onCopy = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      setVisible(false);
      setToast({
        message: detail?.message ?? "Скопировано",
        key: Date.now(),
      });
    };

    window.addEventListener(COPY_TOAST_EVENT, onCopy);
    return () => window.removeEventListener(COPY_TOAST_EVENT, onCopy);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const enterFrame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    const hideTimer = window.setTimeout(() => setVisible(false), VISIBLE_MS);
    const removeTimer = window.setTimeout(() => setToast(null), VISIBLE_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(enterFrame);
      window.clearTimeout(hideTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast?.key]);

  if (!toast) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
      aria-hidden={!visible}
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700",
          "bg-slate-900/95 dark:bg-slate-100/95 text-white dark:text-slate-900",
          "px-4 py-3 text-sm font-medium shadow-lg",
          "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.98] opacity-0"
        )}
      >
        <svg
          className="h-5 w-5 shrink-0 text-teal-400 dark:text-teal-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {toast.message}
      </div>
    </div>
  );
}
