import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === "success"
            ? CheckCircle2
            : toast.type === "error"
            ? AlertTriangle
            : Info;

        const accentClasses =
          toast.type === "success"
            ? "border-[#138808]/35 bg-white text-[#0f1e36]"
            : toast.type === "error"
            ? "border-red-300 bg-white text-red-900"
            : "border-[#0B2545]/25 bg-white text-[#0f1e36]";

        const iconColor =
          toast.type === "success"
            ? "text-[#138808]"
            : toast.type === "error"
            ? "text-red-600"
            : "text-[#0B2545]";

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-150 ${accentClasses}`}
          >
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
            <p className="text-sm font-medium flex-1 leading-snug">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded focus-visible:outline-2 focus-visible:outline-[#0B2545]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
