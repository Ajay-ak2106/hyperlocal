import React from 'react';
import { useRealtime, ToastMessage } from '../../contexts/RealtimeContext.js';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRealtime();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isEmergency = toast.type === 'emergency';
        const isSafety = toast.type === 'safety';
        const isSuccess = toast.type === 'success';

        let borderColor = 'border-slate-700';
        let bgColor = 'bg-slate-900/95';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (isEmergency) {
          borderColor = 'border-rose-500/80';
          bgColor = 'bg-rose-950/95';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (isSafety || isSuccess) {
          borderColor = 'border-emerald-500/80';
          bgColor = 'bg-emerald-950/95';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${bgColor} ${borderColor}`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-tight truncate">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
