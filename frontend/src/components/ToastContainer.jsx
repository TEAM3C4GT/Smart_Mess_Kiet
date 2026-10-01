import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info' || (!isSuccess && !isWarning && !isError);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl border animate-fade-in transition-all ${
              isSuccess
                ? 'bg-slate-900 border-slate-800 text-white shadow-slate-950/20'
                : isError
                ? 'bg-rose-600 border-rose-500 text-white shadow-rose-900/20'
                : isWarning
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-amber-900/10'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
              {isError && <AlertTriangle className="w-5 h-5 text-white shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-slate-900 shrink-0" />}
              {isInfo && <Info className="w-5 h-5 text-slate-600 shrink-0" />}
              <p className="text-xs sm:text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-lg transition-colors ${
                isSuccess || isError
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
