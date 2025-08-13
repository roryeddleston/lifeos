"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: "success" | "error" | "info";
  duration?: number; // ms
  action?: { label: string; onClick: () => void };
};

type ToastContextValue = {
  toast: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const uid = () => Math.random().toString(36).slice(2);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const item: ToastItem = {
      id: uid(),
      duration: 3500,
      variant: "info",
      ...t,
    };
    setToasts((list) => [item, ...list]);
    const dur = item.duration!;
    const id = item.id;
    const timer = setTimeout(() => {
      setToasts((list) => list.filter((x) => x.id !== id));
    }, dur);
    return () => clearTimeout(timer);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        toasts={toasts}
        onClose={(id) => setToasts((l) => l.filter((t) => t.id !== id))}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.toast;
}

function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "min-w-[220px] max-w-xs rounded-lg border px-3 py-2 text-sm shadow-lg transition-all bg-white",
            t.variant === "success" && "border-emerald-200",
            t.variant === "error" && "border-red-200",
            t.variant === "info" && "border-gray-200",
            "animate-in fade-in-0 slide-in-from-bottom-2",
          ]
            .filter(Boolean)
            .join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {t.title && <div className="font-medium">{t.title}</div>}
              {t.description && (
                <div className="text-gray-600">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => onClose(t.id)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {t.action && (
            <div className="mt-2">
              <button
                onClick={() => {
                  t.action!.onClick();
                  onClose(t.id);
                }}
                className="text-gray-900 hover:underline text-xs font-medium"
              >
                {t.action.label}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>,
    document.body
  );
}
