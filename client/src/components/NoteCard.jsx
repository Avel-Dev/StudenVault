import React from 'react';
import { FileText, Download, ExternalLink, Calendar, BookOpen, Layers } from 'lucide-react';

export const NoteCard = ({ note, onDelete }) => {
  const isMidterm = note.examType === 'midterm';

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileBadge = (fileType = '', fileUrl = '') => {
    if (fileType.includes('pdf') || fileUrl.endsWith('.pdf')) return 'PDF Document';
    if (fileType.includes('word') || fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc')) return 'Word Doc';
    if (fileType.includes('presentation') || fileUrl.endsWith('.pptx') || fileUrl.endsWith('.ppt')) return 'Slide Deck';
    if (fileType.startsWith('image/')) return 'Diagram Image';
    return 'Study Resource';
  };

  return (
    <div className="bg-[#E4E4D4]/90 rounded-3xl p-5 border border-[#D6D6C2] hover:border-[#A9B28C] transition-lift flex flex-col justify-between shadow-xs">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C0D5C3] text-[#2F3E4A]">
            {note.subject?.code || 'GEN'} • Sem {note.semester}
          </span>
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
              isMidterm
                ? 'bg-[#C48E5A]/20 text-[#C48E5A] border border-[#C48E5A]/30'
                : 'bg-[#A9B28C]/30 text-[#2F3E4A] border border-[#A9B28C]/40'
            }`}
          >
            {isMidterm ? 'Midterm Exam' : 'End Semester'}
          </span>
        </div>

        {/* Note Title */}
        <h3 className="font-heading text-lg font-bold text-[#2F3E4A] mb-2 line-clamp-2 leading-snug">
          {note.title}
        </h3>

        {/* Module & Subject info */}
        <div className="space-y-1 mb-4 text-xs text-[#2F3E4A]/80">
          <p className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#8C966D]" />
            <span>{note.subject?.name}</span>
          </p>
          {note.module && (
            <p className="flex items-center gap-1.5 text-[#2F3E4A]/70">
              <Layers className="w-3.5 h-3.5 text-[#8C966D]" />
              <span>
                Module {note.module.number}: {note.module.title}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Footer & Actions */}
      <div className="pt-3 border-t border-[#D6D6C2]/70 flex items-center justify-between">
        <div className="text-[11px] text-[#2F3E4A]/60">
          <span>{getFileBadge(note.fileType, note.fileUrl)}</span>
          {note.fileSize ? ` • ${formatFileSize(note.fileSize)}` : ''}
        </div>

        <div className="flex items-center gap-2">
          {note.fileUrl && (
            <a
              href={note.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={note.originalName || true}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#C0D5C3] hover:bg-[#A9B28C] text-[#2F3E4A] text-xs font-bold transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>View & Download</span>
            </a>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(note._id)}
              className="text-xs text-[#C48E5A] hover:underline px-2 py-1"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
