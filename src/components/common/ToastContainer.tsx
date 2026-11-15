import React from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLabPulse();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg p-3.5 shadow-md border transition-[opacity,transform] duration-150 animate-in fade-in slide-in-from-bottom-1 ${
              isSuccess
                ? 'bg-white border-emerald-200 text-slate-800'
                : isError
                ? 'bg-white border-rose-200 text-slate-800'
                : isWarning
                ? 'bg-white border-amber-200 text-slate-800'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isError && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-blue-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <h5 className="text-xs font-semibold text-slate-900 leading-snug">{toast.title}</h5>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

