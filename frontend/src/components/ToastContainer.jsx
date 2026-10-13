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

        const borderClass = isSuccess
          ? 'border-[#c9e6d6]'
          : isError
          ? 'border-[#f3cdd8]'
          : isWarning
          ? 'border-[#f2e2c0]'
          : 'border-[#dce4ef]';

        const iconClass = isSuccess
          ? 'text-[#2f855a]'
          : isError
          ? 'text-[#c63352]'
          : isWarning
          ? 'text-[#b7791f]'
          : 'text-[#355f97]';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border bg-white text-[#293749] animate-fade-in transition-all ${borderClass}`}
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className={`w-5 h-5 shrink-0 ${iconClass}`} />}
              {isError && <AlertTriangle className={`w-5 h-5 shrink-0 ${iconClass}`} />}
              {isWarning && <AlertTriangle className={`w-5 h-5 shrink-0 ${iconClass}`} />}
              {isInfo && <Info className={`w-5 h-5 shrink-0 ${iconClass}`} />}
              <p className="text-xs sm:text-sm font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-[#8494ab] hover:text-[#293749] hover:bg-[#edf2f9] transition-colors"
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
