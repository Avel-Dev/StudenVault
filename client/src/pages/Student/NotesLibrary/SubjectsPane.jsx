import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, BookOpen, AlertCircle, RefreshCw, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export const SubjectsPane = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  loading,
  error,
  onRetry,
  semester,
  getSubjectNoteCount,
  onKeyDownNav,
  isAdmin = false,
  onCreateSubject,
  onEditSubject,
  onDeleteSubject,
  className = '',
}) => {
  const itemRefs = useRef([]);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Close overflow menu on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-overflow-menu]')) {
        setActiveMenuId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleKeyDown = (e, index, subjectId) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % subjects.length;
      itemRefs.current[nextIndex]?.focus();
      onSelectSubject(subjects[nextIndex]._id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + subjects.length) % subjects.length;
      itemRefs.current[prevIndex]?.focus();
      onSelectSubject(subjects[prevIndex]._id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onKeyDownNav?.('right');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSelectSubject(subjectId);
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 w-full bg-[#FAF9F0] border-r border-[#D6D6C2] ${className}`}>
      {/* Pane Header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-[#D6D6C2] bg-[#F4F4EB]/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8C966D]" />
          <h2 className="font-heading text-sm font-bold text-[#2F3E4A] tracking-tight">
            Subjects
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#2F3E4A]/60">
            Sem {semester} · {subjects.length} {subjects.length === 1 ? 'course' : 'courses'}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={onCreateSubject}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C966D] hover:text-[#2F3E4A] hover:bg-[#E4E4D4]/70 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-[#D6D6C2]/60"
            >
              <Plus className="w-3 h-3" />
              <span>New subject</span>
            </button>
          )}
        </div>
      </div>

      {/* Pane Scrollable Body */}
      <div
        tabIndex={0}
        aria-label="Subjects list"
        className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8C966D]"
      >
        {loading ? (
          <div className="space-y-2 p-1" aria-busy="true" aria-label="Loading subjects">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-[#ECECE0] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
            <AlertCircle className="w-5 h-5 text-[#C48E5A]" />
            <p className="text-xs text-[#2F3E4A]/80">{error}</p>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-[#C0D5C3] hover:bg-[#A9B28C] text-xs font-bold text-[#2F3E4A] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : subjects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[#2F3E4A]/70 space-y-2">
            <p className="font-semibold text-[#2F3E4A]">
              {isAdmin ? 'No subjects yet. Create the first one.' : 'No subjects found'}
            </p>
            <p className="text-[11px] text-[#2F3E4A]/60">
              {isAdmin
                ? `Get started by adding a curriculum subject for Semester ${semester}.`
                : `None registered for Semester ${semester}.`}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={onCreateSubject}
                className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Subject</span>
              </button>
            )}
          </div>
        ) : (
          subjects.map((subject, index) => {
            const isSelected = String(subject._id) === String(selectedSubjectId);
            const noteCount = getSubjectNoteCount?.(subject._id) ?? 0;
            const isMenuOpen = activeMenuId === subject._id;

            return (
              <div
                key={subject._id}
                className="relative group flex items-center rounded-lg"
              >
                <button
                  ref={(el) => (itemRefs.current[index] = el)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelectSubject(subject._id)}
                  onKeyDown={(e) => handleKeyDown(e, index, subject._id)}
                  className={`flex-1 min-w-0 text-left flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C966D] ${
                    isSelected
                      ? 'bg-[#C0D5C3] border-[#A5C0A9] shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-[#EAEADF]/70 text-[#2F3E4A]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded border ${
                          isSelected
                            ? 'bg-[#F4F4EB] text-[#2F3E4A] border-[#A5C0A9]'
                            : 'bg-[#E4E4D4] text-[#2F3E4A] border-[#D6D6C2]'
                        }`}
                      >
                        {subject.code}
                      </span>
                      {noteCount > 0 && (
                        <span className="text-[10px] text-[#2F3E4A]/60">
                          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate ${
                        isSelected
                          ? 'font-bold text-[#2F3E4A]'
                          : 'font-medium text-[#2F3E4A]/90'
                      }`}
                    >
                      {subject.name}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-[#2F3E4A] translate-x-0.5' : 'text-[#A9B28C]'
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {/* Admin Overflow Menu Button */}
                {isAdmin && (
                  <div className="relative shrink-0 pr-1" data-overflow-menu>
                    <button
                      type="button"
                      aria-label={`Actions for ${subject.code}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : subject._id);
                      }}
                      className={`p-1 rounded-md text-[#2F3E4A]/50 hover:text-[#2F3E4A] hover:bg-[#E4E4D4] transition-colors ${
                        isMenuOpen ? 'bg-[#E4E4D4] text-[#2F3E4A]' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
                      }`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-[#FAF9F0] border border-[#D6D6C2] shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onEditSubject(subject);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#2F3E4A] hover:bg-[#C0D5C3]/40 flex items-center gap-2 font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8C966D]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            onDeleteSubject(subject);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-[#C48E5A] hover:bg-[#C48E5A]/15 flex items-center gap-2 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
