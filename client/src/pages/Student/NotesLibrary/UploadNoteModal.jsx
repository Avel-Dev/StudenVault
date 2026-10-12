import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, FileText, AlertCircle } from 'lucide-react';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export const UploadNoteModal = ({
  isOpen,
  onClose,
  subject,
  module: currentModule,
  semester,
  onSuccess,
}) => {
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState('midterm');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setExamType('midterm');
      setSelectedFile(null);
      setUploadProgress(0);
      setUploading(false);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !uploading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, uploading, onClose]);

  if (!isOpen) return null;

  const validateFile = (file) => {
    if (!file) return 'Please choose a file to upload';

    if (file.size > MAX_FILE_SIZE) {
      return `File exceeds maximum allowed size of 20 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB selected).`;
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    const isAllowedExt = ALLOWED_EXTS.includes(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.has(file.type.toLowerCase()) || file.type === '';

    if (!isAllowedExt && !isAllowedMime) {
      return `File format not supported. Allowed formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, WEBP.`;
    }

    return null;
  };

  const handleFileChange = (file) => {
    setError(null);
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto-suggest title based on filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please provide a note title');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    const validationErr = validateFile(selectedFile);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    const formData = new FormData();
    formData.append('title', cleanTitle);
    formData.append('semester', semester);
    formData.append('subject', subject?._id || '');
    if (currentModule?._id) {
      formData.append('module', currentModule._id);
    }
    formData.append('examType', examType);
    formData.append('file', selectedFile);

    const xhr = new XMLHttpRequest();
    const token = localStorage.getItem('studyvault_token');

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          onSuccess(res.note, 'Note uploaded successfully');
          onClose();
        } else {
          setError(res.message || `Upload failed with status ${xhr.status}`);
        }
      } catch {
        setError('Unexpected server response during upload');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('Network error occurred during upload. Please try again.');
    };

    setUploading(true);
    setUploadProgress(0);
    xhr.open('POST', '/api/notes');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F3E4A]/35 backdrop-blur-[2px] transition-all"
      onClick={(e) => {
        if (!uploading && modalRef.current && !modalRef.current.contains(e.target)) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-[#FAF9F0] border border-[#D6D6C2] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D6D6C2]/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <UploadCloud className="w-4 h-4 text-[#2F3E4A]" />
            </div>
            <div>
              <h3
                id="upload-modal-title"
                className="font-heading text-lg font-bold text-[#2F3E4A]"
              >
                Upload Study Note
              </h3>
              <p className="text-[11px] text-[#2F3E4A]/60">
                Attach revision notes or cheatsheet to this syllabus module
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            aria-label="Close modal"
            className="text-[#2F3E4A]/50 hover:text-[#2F3E4A] p-1.5 rounded-xl hover:bg-[#E4E4D4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Read-Only Context Badge */}
        <div className="p-3 rounded-2xl bg-[#E4E4D4]/50 border border-[#D6D6C2]/60 flex items-center flex-wrap gap-2 text-xs text-[#2F3E4A]">
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#FAF9F0] border border-[#D6D6C2]">
            {subject?.code}
          </span>
          <span className="font-medium text-[#2F3E4A]/80">{subject?.name}</span>
          <span className="text-[#8C966D] font-bold">•</span>
          <span className="font-semibold text-[#8C966D]">
            Module {currentModule?.number}: {currentModule?.title}
          </span>
          <span className="ml-auto text-[10px] text-[#2F3E4A]/60 font-mono">
            Sem {semester}
          </span>
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
          {/* Note Title */}
          <div>
            <label
              htmlFor="note-title-input"
              className="block text-xs font-bold text-[#2F3E4A] mb-1"
            >
              Note Title <span className="text-[#C48E5A]">*</span>
            </label>
            <input
              id="note-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Cheat Sheet & Solved Proofs"
              className="w-full bg-[#FAF9F0] border border-[#D6D6C2] rounded-xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
            />
          </div>

          {/* Exam Type Segmented Control */}
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

          {/* Drag & Drop File Picker */}
          <div>
            <label className="block text-xs font-bold text-[#2F3E4A] mb-1.5">
              File Document <span className="text-[#C48E5A]">*</span>{' '}
              <span className="text-[#2F3E4A]/40 font-normal">(Max 20 MB)</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {!selectedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-[#8C966D] bg-[#C0D5C3]/20'
                    : 'border-[#D6D6C2] hover:border-[#8C966D] bg-[#FAF9F0]'
                }`}
              >
                <UploadCloud className="w-8 h-8 text-[#8C966D] mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold text-[#2F3E4A]">
                  Click to choose a file or drag & drop here
                </p>
                <p className="text-[11px] text-[#2F3E4A]/60 mt-1">
                  PDF, DOCX, PPTX, or Images up to 20 MB
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#E4E4D4]/60 border border-[#D6D6C2] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#C0D5C3] flex items-center justify-center shrink-0 text-[#2F3E4A]">
                    <FileText className="w-4 h-4 text-[#2F3E4A]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2F3E4A] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-[#2F3E4A]/60 font-mono">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={uploading}
                  className="text-xs text-[#C48E5A] hover:underline font-bold px-2 py-1"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#2F3E4A]">
                <span>Uploading study material...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#E4E4D4] overflow-hidden">
                <div
                  className="h-full bg-[#8C966D] rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D6D6C2]/60">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-[#FAF9F0] border border-[#D6D6C2] hover:bg-[#E4E4D4]/70 text-[#2F3E4A] text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className={`px-5 py-2 rounded-xl bg-[#8C966D] hover:bg-[#788258] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                uploading || !selectedFile ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <span>{uploading ? `Uploading (${uploadProgress}%)` : 'Upload Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
