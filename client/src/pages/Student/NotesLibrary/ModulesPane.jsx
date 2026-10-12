import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, Layers, AlertCircle, RefreshCw, Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';

export const ModulesPane = ({
  subjectId,
  course,
  modules,
  selectedModuleId,
  onSelectModule,
  loading,
  error,
  onRetry,
  getModuleNoteCount,
  onKeyDownNav,
  isAdmin = false,
  onAddModule,
  onEditModule,
  onDeleteModule,
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

  const handleKeyDown = (e, index, moduleId) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % modules.length;
      itemRefs.current[nextIndex]?.focus();
      onSelectModule(modules[nextIndex]._id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + modules.length) % modules.length;
      itemRefs.current[prevIndex]?.focus();
      onSelectModule(modules[prevIndex]._id);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onKeyDownNav?.('right');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onKeyDownNav?.('left');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onSelectModule(moduleId);
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 w-full bg-[#FAF9F0] border-r border-[#D6D6C2] ${className}`}>
      {/* Pane Header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-[#D6D6C2] bg-[#F4F4EB]/90 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <Layers className="w-4 h-4 text-[#8C966D] shrink-0" />
          <h2 className="font-heading text-sm font-bold text-[#2F3E4A] truncate">
            {course ? `Modules — ${course.code}` : 'Modules'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {course && (
            <span className="text-[11px] font-semibold text-[#2F3E4A]/60 shrink-0">
              {modules.length} {modules.length === 1 ? 'module' : 'modules'}
            </span>
          )}
          {isAdmin && subjectId && (
            <button
              type="button"
              onClick={onAddModule}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C966D] hover:text-[#2F3E4A] hover:bg-[#E4E4D4]/70 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-[#D6D6C2]/60"
            >
              <Plus className="w-3 h-3" />
              <span>Add module</span>
            </button>
          )}
        </div>
      </div>

      {/* Pane Scrollable Body */}
      <div
        tabIndex={0}
        aria-label="Modules list"
        className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8C966D]"
      >
        {!subjectId ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[#2F3E4A]/60 space-y-2">
            <Layers className="w-6 h-6 text-[#A9B28C] opacity-70" />
            <p className="font-semibold text-[#2F3E4A]">No subject selected</p>
            <p>Select a subject from the left column to view its modules.</p>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-1" aria-busy="true" aria-label="Loading modules">
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
        ) : modules.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-[#2F3E4A]/70 space-y-2">
            <p className="font-semibold text-[#2F3E4A]">
              {isAdmin ? 'No modules yet. Add the first module.' : 'No modules yet'}
            </p>
            <p className="text-[11px] text-[#2F3E4A]/60">
              {isAdmin
                ? `Add units or chapters for ${course?.code || 'this subject'}.`
                : `Syllabus modules for ${course?.code || 'this subject'} will appear here.`}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={onAddModule}
                className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            )}
          </div>
        ) : (
          modules.map((mod, index) => {
            const isSelected = String(mod._id) === String(selectedModuleId);
            const noteCount = getModuleNoteCount?.(mod._id) ?? 0;
            const isMenuOpen = activeMenuId === mod._id;

            return (
              <div
                key={mod._id}
                className="relative group flex items-center rounded-lg"
              >
                <button
                  ref={(el) => (itemRefs.current[index] = el)}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelectModule(mod._id)}
                  onKeyDown={(e) => handleKeyDown(e, index, mod._id)}
                  className={`flex-1 min-w-0 text-left flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C966D] ${
                    isSelected
                      ? 'bg-[#C0D5C3] border-[#A5C0A9] shadow-xs'
                      : 'bg-transparent border-transparent hover:bg-[#EAEADF]/70 text-[#2F3E4A]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#8C966D] shrink-0">
                        {mod.number}.
                      </span>
                      <span
                        className={`text-xs truncate ${
                          isSelected
                            ? 'font-bold text-[#2F3E4A]'
                            : 'font-medium text-[#2F3E4A]/90'
                        }`}
                      >
                        {mod.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 pl-4 text-[10px] text-[#2F3E4A]/60 truncate">
                      {noteCount > 0 && (
                        <span className="font-semibold text-[#2F3E4A]/70">
                          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                        </span>
                      )}
                      {mod.topics && mod.topics.length > 0 && (
                        <span className="truncate">
                          {noteCount > 0 && '· '}
                          {mod.topics.join(', ')}
                        </span>
                      )}
                    </div>
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
                      aria-label={`Actions for module ${mod.number}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : mod._id);
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
                            onEditModule(mod);
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
                            onDeleteModule(mod);
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
