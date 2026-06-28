import React, { useState, useEffect } from 'react';
import { toast, type ToastItem } from '../utils/toast';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration !== 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, newToast.duration || 4000);
      }
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((item) => {
        let borderClass = 'border-l-blue-500';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (item.type === 'success') {
          borderClass = 'border-l-emerald-500';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (item.type === 'error') {
          borderClass = 'border-l-rose-500';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (item.type === 'warning') {
          borderClass = 'border-l-amber-500';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 w-full bg-[#14161f]/95 border border-zinc-800/80 border-l-4 ${borderClass} rounded-xl shadow-2xl p-4 backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 animate-[slideIn_0.2s_ease-out]`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconColor} mt-0.5`} />
            <div className="flex-1 text-zinc-200 text-xs font-semibold leading-relaxed break-words">
              {item.message}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
