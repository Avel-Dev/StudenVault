import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../../api/client';

export const EditNoteModal = ({ isOpen, onClose, note, onSuccess }) => {
  const modalRef = useRef(null);
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setExamType(note.examType || 'midterm');
      setError(null);
    }
  }, [note, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !note) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Note title is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch(`/notes/${note._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: cleanTitle,
          examType,
        }),
      });
      onSuccess(res.note, 'Note updated successfully');
      onClose();
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err.message || 'Failed to update note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-note-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E4A]/35 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (!submitting && modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D6D6C2]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <FileText className="w-4 h-4 text-[#2F3E4A]" />
            </div>
            <div>
              <h3
                id="edit-note-modal-title"
                className="font-heading text-lg font-bold text-[#2F3E4A]"
              >
                Edit Note
              </h3>
              <p className="text-[11px] text-[#2F3E4A]/60">
                Update note title or exam target
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="text-[#2F3E4A]/50 hover:text-[#2F3E4A] p-1.5 rounded-xl hover:bg-[#E4E4D4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-2xl bg-[#C48E5A]/15 border border-[#C48E5A]/30 text-xs text-[#C48E5A] font-semibold flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-note-title"
              className="block text-xs font-bold text-[#2F3E4A] mb-1"
            >
              Note Title <span className="text-[#C48E5A]">*</span>
            </label>
            <input
              id="edit-note-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2F3E4A] mb-1.5">
              Exam Target <span className="text-[#C48E5A]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExamType('midterm')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  examType === 'midterm'
                    ? 'bg-[#C0D5C3] border-[#8C966D] text-[#2F3E4A] shadow-xs'
                    : 'bg-[#FAF9F0] border-[#D6D6C2] text-[#2F3E4A]/70 hover:bg-[#E4E4D4]'
                }`}
              >
                Midterm Exam
              </button>
              <button
                type="button"
                onClick={() => setExamType('endsem')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                  examType === 'endsem'
                    ? 'bg-[#C0D5C3] border-[#8C966D] text-[#2F3E4A] shadow-xs'
                    : 'bg-[#FAF9F0] border-[#D6D6C2] text-[#2F3E4A]/70 hover:bg-[#E4E4D4]'
                }`}
              >
                End Semester
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D6D6C2]/60">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#FAF9F0] border border-[#D6D6C2] hover:bg-[#E4E4D4]/70 text-[#2F3E4A] text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
