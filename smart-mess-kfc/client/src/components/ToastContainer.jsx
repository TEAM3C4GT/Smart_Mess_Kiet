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
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl border animate-fade-in transition-all bg-white ${
              isSuccess
                ? 'border-emerald-200 text-emerald-950 shadow-emerald-500/10'
                : isWarning
                ? 'border-amber-200 text-amber-950 shadow-amber-500/10'
                : 'border-purple-200 text-purple-950 shadow-purple-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
              {isInfo && <Info className="w-5 h-5 text-purple-600 shrink-0" />}
              <p className="text-xs sm:text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
