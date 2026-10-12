import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  isDestructive = false,
  isBlocked = false,
  blockedReason = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  loading = false,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E4A]/35 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (!loading && dialogRef.current && !dialogRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                isBlocked
                  ? 'bg-[#D4A93C]/20 text-[#C48E5A]'
                  : isDestructive
                  ? 'bg-[#C48E5A]/20 text-[#C48E5A]'
                  : 'bg-[#C0D5C3] text-[#2F3E4A]'
              }`}
            >
              {isBlocked ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <h3
              id="confirm-dialog-title"
              className="font-heading text-lg font-bold text-[#2F3E4A] leading-snug"
            >
              {title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="text-[#2F3E4A]/50 hover:text-[#2F3E4A] p-1 rounded-xl hover:bg-[#E4E4D4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div id="confirm-dialog-desc" className="text-xs text-[#2F3E4A]/80 leading-relaxed space-y-2">
          {message && <p>{message}</p>}
          {isBlocked && (
            <div className="p-3 rounded-2xl bg-[#F9F7E8] border border-[#D4A93C]/40 text-[#2F3E4A] text-xs font-medium">
              <span className="font-bold text-[#C48E5A] block mb-0.5">Action Blocked</span>
              {blockedReason}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6D6C2]/50">
          {isBlocked ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2F3E4A] hover:bg-[#445868] text-white text-xs font-bold transition-all shadow-xs"
            >
              Understood
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#FAF9F0] border border-[#D6D6C2] hover:bg-[#E4E4D4]/70 text-[#2F3E4A] text-xs font-semibold transition-all"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                  isDestructive
                    ? 'bg-[#C48E5A] hover:bg-[#B27B47]'
                    : 'bg-[#8C966D] hover:bg-[#788258]'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span>{loading ? 'Processing...' : confirmText}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
