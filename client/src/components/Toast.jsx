import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF9F0] border border-[#D6D6C2] shadow-xl text-xs font-semibold text-[#2F3E4A] animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-sm"
    >
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#8C966D] shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-[#C48E5A] shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-[#8C966D] shrink-0" />}

      <span className="flex-1 leading-snug">{toast.message}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-[#2F3E4A]/50 hover:text-[#2F3E4A] p-0.5 rounded-lg hover:bg-[#E4E4D4] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
