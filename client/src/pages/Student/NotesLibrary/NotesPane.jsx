import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Search,
  Download,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
} from 'lucide-react';

export const NotesPane = ({
  moduleId,
  currentModule,
  notes,
  loading,
  error,
  onRetry,
  onKeyDownNav,
  isAdmin = false,
  onUploadNote,
  onEditNote,
  onDeleteNote,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('all'); // 'all', 'midterm', 'endsem'
  const [activeMenuId, setActiveMenuId] = useState(null);
  const noteRefs = useRef([]);

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

  // Client-side filtering
  const filteredNotes = useMemo(() => {
    return (notes || []).filter((note) => {
      const matchesSearch = searchQuery
        ? note.title.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesExam =
        examTypeFilter === 'all' ? true : note.examType === examTypeFilter;
      return matchesSearch && matchesExam;
    });
  }, [notes, searchQuery, examTypeFilter]);

  const getCleanFileType = (fileType = '', fileUrl = '') => {
    const lowerType = fileType.toLowerCase();
    const lowerUrl = fileUrl.toLowerCase();
    if (lowerType.includes('pdf') || lowerUrl.endsWith('.pdf')) return 'PDF';
    if (lowerType.includes('word') || lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'DOC';
    if (lowerType.includes('presentation') || lowerUrl.endsWith('.ppt') || lowerUrl.endsWith('.pptx')) return 'PPT';
    if (lowerType.startsWith('image/') || lowerUrl.match(/\.(jpg|jpeg|png|webp)$/)) return 'IMAGE';
    return 'DOC';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleKeyDown = (e, index, note) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % filteredNotes.length;
      noteRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + filteredNotes.length) % filteredNotes.length;
      noteRefs.current[prevIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onKeyDownNav?.('left');
    } else if (e.key === 'Enter') {
      if (note.fileUrl) {
        window.open(note.fileUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-0 w-full bg-[#FAF9F0] ${className}`}>
      {/* Pane Header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-[#D6D6C2] bg-[#F4F4EB]/90 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <FileText className="w-4 h-4 text-[#8C966D] shrink-0" />
          <h2 className="font-heading text-sm font-bold text-[#2F3E4A] truncate">
            {currentModule ? `Notes — ${currentModule.title}` : 'Notes'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {currentModule && (
            <span className="text-[11px] font-semibold text-[#2F3E4A]/60 shrink-0">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'resource' : 'resources'}
            </span>
          )}
          {isAdmin && moduleId && (
            <button
              type="button"
              onClick={onUploadNote}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C966D] hover:text-[#2F3E4A] hover:bg-[#E4E4D4]/70 px-2 py-0.5 rounded-md transition-colors cursor-pointer border border-[#D6D6C2]/60"
            >
              <Plus className="w-3 h-3" />
              <span>Upload note</span>
            </button>
          )}
        </div>
      </div>

      {/* Pane Controls (Search & Exam Segmented Filter) */}
      {moduleId && (
        <div className="shrink-0 px-4 py-2.5 border-b border-[#D6D6C2] bg-[#F4F4EB]/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Title search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#2F3E4A]/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notes by title..."
              className="w-full bg-[#E4E4D4]/80 border border-[#D6D6C2] rounded-md py-1 pl-8 pr-2.5 text-xs text-[#2F3E4A] placeholder:text-[#2F3E4A]/40 focus:outline-none focus:border-[#8C966D]"
            />
          </div>

          {/* Exam Type Segmented Control */}
          <div
            role="radiogroup"
            aria-label="Filter by exam type"
            className="flex items-center bg-[#E4E4D4] p-0.5 rounded-md border border-[#D6D6C2] shrink-0 self-start sm:self-auto"
          >
            <button
              type="button"
              role="radio"
              aria-checked={examTypeFilter === 'all'}
              onClick={() => setExamTypeFilter('all')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-colors ${
                examTypeFilter === 'all'
                  ? 'bg-[#2F3E4A] text-white shadow-xs'
                  : 'text-[#2F3E4A]/80 hover:bg-[#D5E4D7]/40'
              }`}
            >
              All
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={examTypeFilter === 'midterm'}
              onClick={() => setExamTypeFilter('midterm')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-colors ${
                examTypeFilter === 'midterm'
                  ? 'bg-[#2F3E4A] text-white shadow-xs'
                  : 'text-[#2F3E4A]/80 hover:bg-[#D5E4D7]/40'
              }`}
            >
              Midterm
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={examTypeFilter === 'endsem'}
              onClick={() => setExamTypeFilter('endsem')}
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded transition-colors ${
                examTypeFilter === 'endsem'
                  ? 'bg-[#2F3E4A] text-white shadow-xs'
                  : 'text-[#2F3E4A]/80 hover:bg-[#D5E4D7]/40'
              }`}
            >
              End Sem
            </button>
          </div>
        </div>
      )}

      {/* Pane Scrollable Body */}
      <div
        tabIndex={0}
        aria-label="Notes list"
        className="flex-1 min-h-0 overflow-y-auto p-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8C966D]"
      >
        {!moduleId ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#2F3E4A]/60 space-y-2">
            <FolderOpen className="w-8 h-8 text-[#A9B28C] opacity-70" />
            <p className="font-semibold text-[#2F3E4A] text-sm">Select a module</p>
            <p className="max-w-xs mx-auto">
              Select a module from the middle column to see its study materials and revision notes.
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-2 p-1" aria-busy="true" aria-label="Loading notes">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-[#ECECE0] animate-pulse" />
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
        ) : filteredNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-[#2F3E4A]/70 space-y-2">
            <FileText className="w-6 h-6 text-[#A9B28C] opacity-70" />
            <p className="font-semibold text-[#2F3E4A]">
              {notes.length === 0
                ? (isAdmin ? 'No notes in this module yet. Upload the first note.' : 'No notes in this module yet')
                : 'No notes match your filter'}
            </p>
            <p className="text-[11px] text-[#2F3E4A]/60">
              {notes.length === 0
                ? (isAdmin ? 'Share lecture slides, reference guides, or question banks.' : 'Faculty has not uploaded notes for this module yet.')
                : 'Try clearing the search query or exam type filter.'}
            </p>
            {isAdmin && notes.length === 0 && (
              <button
                type="button"
                onClick={onUploadNote}
                className="mt-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Note</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#D6D6C2]/60 rounded-lg border border-[#D6D6C2] bg-[#FAF9F0] overflow-hidden">
            {filteredNotes.map((note, index) => {
              const fileTypeBadge = getCleanFileType(note.fileType, note.fileUrl);
              const dateStr = formatDate(note.createdAt);
              const isMidterm = note.examType === 'midterm';
              const isMenuOpen = activeMenuId === note._id;

              return (
                <div
                  key={note._id}
                  ref={(el) => (noteRefs.current[index] = el)}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, index, note)}
                  className="group flex items-center justify-between px-3.5 py-3 hover:bg-[#EAEADF]/60 focus:bg-[#EAEADF]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C966D] transition-colors duration-150 gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-md bg-[#E4E4D4] border border-[#D6D6C2] flex items-center justify-center shrink-0 mt-0.5 text-[#2F3E4A]">
                      <FileText className="w-3.5 h-3.5 text-[#8C966D]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-[#2F3E4A] leading-snug truncate">
                        {note.title}
                      </h3>

                      <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-[#2F3E4A]/60 mt-0.5">
                        <span className="font-mono font-semibold px-1 py-0.2 rounded bg-[#E4E4D4] border border-[#D6D6C2]">
                          {fileTypeBadge}
                        </span>

                        <span
                          className={`font-semibold px-1 py-0.2 rounded uppercase tracking-wider ${
                            isMidterm
                              ? 'bg-[#C48E5A]/15 text-[#C48E5A]'
                              : 'bg-[#A9B28C]/25 text-[#2F3E4A]'
                          }`}
                        >
                          {isMidterm ? 'Midterm' : 'End Sem'}
                        </span>

                        {dateStr && <span>Uploaded {dateStr}</span>}

                        {note.uploadedBy?.name && (
                          <span className="hidden sm:inline">by {note.uploadedBy.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on the right */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={note.originalName || true}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-[#C0D5C3] text-[#2F3E4A] hover:bg-[#C48E5A] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C966D] transition-colors border border-[#A5C0A9] shadow-xs"
                    >
                      <span>Open</span>
                      <Download className="w-3 h-3 opacity-70" />
                    </a>

                    {/* Admin Overflow Menu Button */}
                    {isAdmin && (
                      <div className="relative" data-overflow-menu>
                        <button
                          type="button"
                          aria-label={`Actions for note ${note.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : note._id);
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
                                onEditNote(note);
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
                                onDeleteNote(note);
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
