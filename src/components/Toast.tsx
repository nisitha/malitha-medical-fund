'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  subMessage?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, subMessage?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', subMessage?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type, subMessage };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container only rendered after client mount to eliminate hydration mismatches */}
      {isMounted && (
        <div
          suppressHydrationWarning
          className="fixed top-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-5 z-50 flex flex-col gap-2 max-w-[92vw] sm:max-w-md w-full pointer-events-none"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              suppressHydrationWarning
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border transition-all duration-200 animate-in fade-in slide-in-from-top-2 bg-white ${
                toast.type === 'success'
                  ? 'border-emerald-200 text-slate-900'
                  : toast.type === 'error'
                  ? 'border-rose-200 text-slate-900'
                  : 'border-slate-200 text-slate-900'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold tracking-tight text-slate-900 leading-snug">
                  {toast.message}
                </p>
                {toast.subMessage && (
                  <p className="text-xs text-slate-600 mt-0.5 break-words">
                    {toast.subMessage}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors shrink-0 cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
