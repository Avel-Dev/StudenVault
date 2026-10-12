import React, { useState, useEffect, useRef } from 'react';
import { X, Layers } from 'lucide-react';
import { apiFetch } from '../../../api/client';

export const ModuleFormModal = ({
  isOpen,
  onClose,
  subjectId,
  subjectCode,
  initialData = null,
  nextModuleNumber = 1,
  onSuccess,
}) => {
  const isEditing = !!initialData;
  const modalRef = useRef(null);

  const [number, setNumber] = useState(nextModuleNumber);
  const [title, setTitle] = useState('');
  const [topics, setTopics] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setNumber(initialData.number || 1);
      setTitle(initialData.title || '');
      setTopics(Array.isArray(initialData.topics) ? initialData.topics.join(', ') : '');
    } else {
      setNumber(nextModuleNumber);
      setTitle('');
      setTopics('');
    }
    setError(null);
  }, [initialData, nextModuleNumber, isOpen]);

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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    const modNumber = Number(number);

    if (!modNumber || modNumber < 1) {
      setError('Module number must be a positive integer');
      return;
    }
    if (!cleanTitle) {
      setError('Module title is required');
      return;
    }

    try {
      setSubmitting(true);
      const parsedTopics = topics
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (isEditing) {
        const res = await apiFetch(`/subjects/${subjectId}/modules/${initialData._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            number: modNumber,
            title: cleanTitle,
            topics: parsedTopics,
          }),
        });
        onSuccess(res.module, 'Module updated successfully');
      } else {
        const res = await apiFetch(`/subjects/${subjectId}/modules`, {
          method: 'POST',
          body: JSON.stringify({
            number: modNumber,
            title: cleanTitle,
            topics: parsedTopics,
          }),
        });
        onSuccess(res.module, 'Module added successfully');
      }
      onClose();
    } catch (err) {
      console.error('Error saving module:', err);
      setError(err.message || 'Failed to save module');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="module-modal-title"
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
              <Layers className="w-4 h-4 text-[#2F3E4A]" />
            </div>
            <div>
              <h3
                id="module-modal-title"
                className="font-heading text-lg font-bold text-[#2F3E4A]"
              >
                {isEditing ? 'Edit Module' : 'Add Module'}
              </h3>
              <p className="text-[11px] text-[#2F3E4A]/60 font-mono">
                Course: {subjectCode}
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
            className="p-3 rounded-2xl bg-[#C48E5A]/15 border border-[#C48E5A]/30 text-xs text-[#C48E5A] font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label
                htmlFor="module-num-input"
                className="block text-xs font-bold text-[#2F3E4A] mb-1"
              >
                Mod # <span className="text-[#C48E5A]">*</span>
              </label>
              <input
                id="module-num-input"
                type="number"
                min="1"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-center text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
              />
            </div>

            <div className="col-span-3">
              <label
                htmlFor="module-title-input"
                className="block text-xs font-bold text-[#2F3E4A] mb-1"
              >
                Module Title <span className="text-[#C48E5A]">*</span>
              </label>
              <input
                id="module-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Graph Traversals & Shortest Paths"
                className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="module-topics-input"
              className="block text-xs font-bold text-[#2F3E4A] mb-1"
            >
              Topics <span className="text-[#2F3E4A]/40 font-normal">(comma-separated)</span>
            </label>
            <input
              id="module-topics-input"
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="e.g. BFS, DFS, Dijkstra, Bellman-Ford"
              className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
            />
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
              <span>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Module'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
