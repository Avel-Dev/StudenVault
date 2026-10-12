import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, BookOpen } from 'lucide-react';
import { apiFetch } from '../../../api/client';

export const SubjectFormModal = ({
  isOpen,
  onClose,
  semester,
  initialData = null,
  onSuccess,
}) => {
  const isEditing = !!initialData;
  const modalRef = useRef(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [sem, setSem] = useState(semester || 3);
  const [description, setDescription] = useState('');
  const [modules, setModules] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form state
  useEffect(() => {
    if (initialData) {
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setSem(initialData.semester || semester || 3);
      setDescription(initialData.description || '');
      setModules([]);
    } else {
      setCode('');
      setName('');
      setSem(semester || 3);
      setDescription('');
      setModules([]);
    }
    setError(null);
  }, [initialData, semester, isOpen]);

  // Escape listener
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

  const handleAddModuleRow = () => {
    const nextNum = modules.length > 0 ? Math.max(...modules.map((m) => m.number || 0)) + 1 : 1;
    setModules([...modules, { number: nextNum, title: '', topics: '' }]);
  };

  const handleRemoveModuleRow = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index] = { ...updated[index], [field]: value };
    setModules(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      setError('Course code is required (e.g. CS301)');
      return;
    }
    if (!cleanName) {
      setError('Course name is required');
      return;
    }

    // Validate module rows if present
    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      if (!m.title.trim()) {
        setError(`Module #${m.number} title is required`);
        return;
      }
      if (!m.number || m.number < 1) {
        setError('Module number must be a positive integer');
        return;
      }
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        const res = await apiFetch(`/subjects/${initialData._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            code: cleanCode,
            name: cleanName,
            semester: Number(sem),
            description: description.trim(),
          }),
        });
        onSuccess(res.subject, 'Subject updated successfully');
      } else {
        const payload = {
          code: cleanCode,
          name: cleanName,
          semester: Number(sem),
          description: description.trim(),
          modules: modules.map((m) => ({
            number: Number(m.number),
            title: m.title.trim(),
            topics: m.topics,
          })),
        };
        const res = await apiFetch('/subjects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        onSuccess({ ...res.subject, modules: res.modules }, 'Subject created successfully');
      }
      onClose();
    } catch (err) {
      console.error('Error saving subject:', err);
      setError(err.message || 'Failed to save subject');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E4A]/35 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (!submitting && modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D6D6C2]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <BookOpen className="w-4 h-4 text-[#2F3E4A]" />
            </div>
            <div>
              <h3
                id="subject-modal-title"
                className="font-heading text-lg font-bold text-[#2F3E4A]"
              >
                {isEditing ? 'Edit Subject' : 'Create New Subject'}
              </h3>
              <p className="text-[11px] text-[#2F3E4A]/60">
                {isEditing ? 'Update course details' : 'Register course and optional syllabus modules'}
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

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-2xl bg-[#C48E5A]/15 border border-[#C48E5A]/30 text-xs text-[#C48E5A] font-semibold"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Course Code */}
            <div>
              <label
                htmlFor="subject-code-input"
                className="block text-xs font-bold text-[#2F3E4A] mb-1"
              >
                Course Code <span className="text-[#C48E5A]">*</span>
              </label>
              <input
                id="subject-code-input"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS304"
                className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
              />
              <span className="text-[10px] text-[#2F3E4A]/50 mt-0.5 block">Format: CS301</span>
            </div>

            {/* Course Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="subject-name-input"
                className="block text-xs font-bold text-[#2F3E4A] mb-1"
              >
                Course Name <span className="text-[#C48E5A]">*</span>
              </label>
              <input
                id="subject-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Semester */}
            <div>
              <label
                htmlFor="subject-sem-select"
                className="block text-xs font-bold text-[#2F3E4A] mb-1"
              >
                Semester <span className="text-[#C48E5A]">*</span>
              </label>
              <select
                id="subject-sem-select"
                value={sem}
                onChange={(e) => setSem(Number(e.target.value))}
                className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="subject-desc-input"
                className="block text-xs font-bold text-[#2F3E4A] mb-1"
              >
                Description <span className="text-[#2F3E4A]/40 font-normal">(optional)</span>
              </label>
              <input
                id="subject-desc-input"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief course overview"
                className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
              />
            </div>
          </div>

          {/* Add modules section (only on creation) */}
          {!isEditing && (
            <div className="pt-3 border-t border-[#D6D6C2]/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#2F3E4A]">Initial Syllabus Modules</h4>
                  <p className="text-[10px] text-[#2F3E4A]/60">
                    Add modules now or attach them later in the Modules column
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddModuleRow}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D6D6C2] bg-[#FAF9F0] hover:bg-[#C0D5C3]/40 text-[11px] font-bold text-[#2F3E4A] transition-colors"
                >
                  <Plus className="w-3 h-3 text-[#8C966D]" />
                  <span>Add module row</span>
                </button>
              </div>

              {modules.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {modules.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-[#E4E4D4]/40 border border-[#D6D6C2]/60 flex items-start gap-2"
                    >
                      <div className="w-14 shrink-0">
                        <label className="text-[9px] uppercase font-bold text-[#2F3E4A]/60 block mb-0.5">
                          Mod #
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={m.number}
                          onChange={(e) =>
                            handleModuleChange(idx, 'number', Number(e.target.value))
                          }
                          className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-lg px-2 py-1 text-xs font-mono font-bold text-center text-[#2F3E4A]"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <label className="text-[9px] uppercase font-bold text-[#2F3E4A]/60 block mb-0.5">
                          Module Title
                        </label>
                        <input
                          type="text"
                          required
                          value={m.title}
                          onChange={(e) => handleModuleChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Protocol Stack & Physical Layer"
                          className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-lg px-2 py-1 text-xs font-medium text-[#2F3E4A]"
                        />
                      </div>

                      <div className="flex-1 min-w-0 hidden sm:block">
                        <label className="text-[9px] uppercase font-bold text-[#2F3E4A]/60 block mb-0.5">
                          Topics (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={m.topics}
                          onChange={(e) => handleModuleChange(idx, 'topics', e.target.value)}
                          placeholder="OSI, TCP/IP, Framing"
                          className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-lg px-2 py-1 text-xs text-[#2F3E4A]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveModuleRow(idx)}
                        aria-label={`Remove module ${m.number}`}
                        className="p-1 rounded-lg hover:bg-[#E4E4D4] text-[#C48E5A] mt-4 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer buttons */}
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
              <span>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
