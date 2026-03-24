"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Toast = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(() => ({
    showToast(message: string) {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message }]);
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 2800);
    },
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-2xl border border-white/10 bg-zinc-950/95 px-4 py-3 text-sm text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur">
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
