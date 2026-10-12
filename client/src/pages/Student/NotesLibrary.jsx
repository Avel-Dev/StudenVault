import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../api/client';
import { NoteCard } from '../../components/NoteCard';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  GraduationCap,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const NotesLibrary = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || 3);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch subjects for selected semester
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const query = selectedSemester ? `?semester=${selectedSemester}` : '';
        const data = await apiFetch(`/subjects${query}`);
        setSubjects(data.subjects || []);
        // Reset subject and module if semester changed
        setSelectedSubject('');
        setSelectedModule('');
        setModules([]);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };

    fetchSubjects();
  }, [selectedSemester]);

  // 2. Fetch modules when subject is chosen
  useEffect(() => {
    const fetchModules = async () => {
      if (!selectedSubject) {
        setModules([]);
        setSelectedModule('');
        return;
      }
      try {
        const data = await apiFetch(`/subjects/${selectedSubject}/modules`);
        setModules(data.modules || []);
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    fetchModules();
  }, [selectedSubject]);

  // 3. Fetch notes with all active filters
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSemester) params.append('semester', selectedSemester);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedModule) params.append('module', selectedModule);
      if (selectedExamType) params.append('examType', selectedExamType);
      if (searchQuery) params.append('search', searchQuery);

      const data = await apiFetch(`/notes?${params.toString()}`);
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSemester, selectedSubject, selectedModule, selectedExamType, searchQuery]);

  const resetFilters = () => {
    setSelectedSemester(user?.semester || 3);
    setSelectedSubject('');
    setSelectedModule('');
    setSelectedExamType('');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <BookOpen className="w-4 h-4 text-[#2F3E4A]" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8C966D]">
              Academic Repository
            </span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-[#2F3E4A]">
            Study <span className="text-[#8C966D]">Material Vault</span>
          </h1>
          <p className="text-sm text-[#2F3E4A]/70 mt-1">
            Curated lecture slides, formula sheets, and exam prep modules
          </p>
        </div>

        {/* Total count badge */}
        <div className="flex items-center gap-2 bg-[#C0D5C3]/40 px-4 py-2 rounded-2xl border border-[#A9B28C]/40 self-start sm:self-auto">
          <FileText className="w-4 h-4 text-[#8C966D]" />
          <span className="text-xs font-bold text-[#2F3E4A]">
            {notes.length} {notes.length === 1 ? 'Resource' : 'Resources'} Found
          </span>
        </div>
      </div>

      {/* Advanced Filter Bar Panel */}
      <div className="bg-[#E4E4D4] rounded-3xl p-5 border border-[#D6D6C2] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#2F3E4A]/50 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, topic, algorithm..."
            className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-full py-2.5 pl-11 pr-4 text-sm text-[#2F3E4A] placeholder:text-[#2F3E4A]/40 focus:outline-none focus:border-[#8C966D] transition-colors"
          />
        </div>

        {/* Dropdowns Row: Semester, Subject, Module */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Semester Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2F3E4A]/70 mb-1">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-2xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2F3E4A]/70 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-2xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D]"
            >
              <option value="">All Subjects</option>
              {subjects.map((subj) => (
                <option key={subj._id} value={subj._id}>
                  {subj.code} — {subj.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Selector (1 to N) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#2F3E4A]/70 mb-1">
              Module
            </label>
            <select
              value={selectedModule}
              disabled={!selectedSubject || modules.length === 0}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="w-full bg-[#F4F4EB] border border-[#D6D6C2] rounded-2xl px-3 py-2 text-xs font-semibold text-[#2F3E4A] focus:outline-none focus:border-[#8C966D] disabled:opacity-50"
            >
              <option value="">All Modules</option>
              {modules.map((mod) => (
                <option key={mod._id} value={mod._id}>
                  Module {mod.number}: {mod.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Exam Type Pills & Reset */}
        <div className="pt-2 border-t border-[#D6D6C2]/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F3E4A]/70 mr-1">
              Exam Type:
            </span>
            <button
              onClick={() => setSelectedExamType('')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedExamType === ''
                  ? 'bg-[#2F3E4A] text-white'
                  : 'bg-[#D6D6C2]/60 text-[#2F3E4A] hover:bg-[#C0D5C3]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedExamType('midterm')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedExamType === 'midterm'
                  ? 'bg-[#C48E5A] text-white shadow-xs'
                  : 'bg-[#D6D6C2]/60 text-[#2F3E4A] hover:bg-[#C48E5A]/20'
              }`}
            >
              Midterm
            </button>
            <button
              onClick={() => setSelectedExamType('endsem')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                selectedExamType === 'endsem'
                  ? 'bg-[#8C966D] text-white shadow-xs'
                  : 'bg-[#D6D6C2]/60 text-[#2F3E4A] hover:bg-[#A9B28C]/30'
              }`}
            >
              End Semester
            </button>
          </div>

          {(selectedSubject || selectedModule || selectedExamType || searchQuery) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-[#C48E5A] hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Notes Grid Display */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#C0D5C3] border-t-[#2F3E4A] animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#2F3E4A]/70">Filtering materials...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-3xl bg-[#E4E4D4] border border-[#D6D6C2] p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#C0D5C3]/50 flex items-center justify-center mx-auto text-[#2F3E4A]">
            <Layers className="w-6 h-6 text-[#8C966D]" />
          </div>
          <h3 className="font-heading text-lg font-bold text-[#2F3E4A]">No Study Materials Found</h3>
          <p className="text-xs text-[#2F3E4A]/70 leading-relaxed">
            There are no documents matching your selected filters. Try broadening the semester or clearing the exam type.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-full bg-[#C0D5C3] text-xs font-bold text-[#2F3E4A] hover:bg-[#A9B28C] transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
};
