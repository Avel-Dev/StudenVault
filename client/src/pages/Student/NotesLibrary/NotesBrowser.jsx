import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../api/client';
import { SubjectsPane } from './SubjectsPane';
import { ModulesPane } from './ModulesPane';
import { NotesPane } from './NotesPane';
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  ArrowLeft,
} from 'lucide-react';

export const NotesBrowser = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Read selection directly and solely from the URL as the single source of truth
  const pathParts = location.pathname.replace(/^\/notes\/?/, '').split('/').filter(Boolean);
  const subjectId = pathParts[0] || null;
  const moduleId = pathParts[1] || null;

  // Semester state (defaults to student's current semester)
  const [semester, setSemester] = useState(user?.semester || 3);

  // Pane 1: Subjects state
  const [subjects, setSubjects] = useState([]);
  const [semesterNotes, setSemesterNotes] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  // Pane 2: Modules state for current subject
  const [modules, setModules] = useState([]);
  const [subjectNotes, setSubjectNotes] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modulesError, setModulesError] = useState(null);

  // 1. Fetch subjects & all notes for current semester
  const loadSemesterData = useCallback(async () => {
    try {
      setLoadingSubjects(true);
      setSubjectsError(null);
      const [subjectsData, notesData] = await Promise.all([
        apiFetch(`/subjects?semester=${semester}`),
        apiFetch(`/notes?semester=${semester}`),
      ]);
      const fetchedSubjects = subjectsData.subjects || [];
      setSubjects(fetchedSubjects);
      setSemesterNotes(notesData.notes || []);

      // Auto-select first subject if none selected in URL or if current subject doesn't belong to this semester
      if (fetchedSubjects.length > 0) {
        if (!subjectId || !fetchedSubjects.some((s) => String(s._id) === String(subjectId))) {
          navigate(`/notes/${fetchedSubjects[0]._id}`, { replace: true });
        }
      } else {
        setModules([]);
        setSubjectNotes([]);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setSubjectsError(err.message || 'Unable to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  }, [semester, subjectId, navigate]);

  useEffect(() => {
    loadSemesterData();
  }, [loadSemesterData]);

  // Derive currentCourse synchronously from loaded subjects using consistent string comparison
  const currentCourse = useMemo(() => {
    if (!subjectId || subjects.length === 0) return null;
    return subjects.find((s) => String(s._id) === String(subjectId)) || null;
  }, [subjectId, subjects]);

  // 2. Fetch modules and notes for active subject whenever subjectId changes
  const fetchSubjectData = useCallback(async () => {
    if (!subjectId) {
      setModules([]);
      setSubjectNotes([]);
      return;
    }

    try {
      setLoadingModules(true);
      setModulesError(null);

      const [modData, notesData] = await Promise.all([
        apiFetch(`/subjects/${subjectId}/modules`),
        apiFetch(`/notes?subject=${subjectId}`),
      ]);

      setModules(modData.modules || []);
      setSubjectNotes(notesData.notes || []);
    } catch (err) {
      console.error('Failed to load course modules and notes:', err);
      setModulesError(err.status === 404 ? 'Subject not found' : (err.message || 'Failed to load modules'));
      setModules([]);
      setSubjectNotes([]);
    } finally {
      setLoadingModules(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchSubjectData();
  }, [fetchSubjectData]);

  // Derived note count helpers using consistent string comparisons
  const getSubjectNoteCount = useCallback(
    (sid) => {
      return semesterNotes.filter((n) => {
        const id = n.subject?._id || n.subject;
        return String(id) === String(sid);
      }).length;
    },
    [semesterNotes]
  );

  const getModuleNoteCount = useCallback(
    (mid) => {
      return subjectNotes.filter((n) => {
        const id = n.module?._id || n.module;
        return String(id) === String(mid);
      }).length;
    },
    [subjectNotes]
  );

  // Active module object using consistent string comparison
  const currentModule = useMemo(() => {
    if (!moduleId || modules.length === 0) return null;
    return modules.find((m) => String(m._id) === String(moduleId)) || null;
  }, [moduleId, modules]);

  // Notes filtered for the active module
  const notesForActiveModule = useMemo(() => {
    if (!moduleId) return [];
    return subjectNotes.filter((n) => {
      const id = n.module?._id || n.module;
      return String(id) === String(moduleId);
    });
  }, [moduleId, subjectNotes]);

  // Navigation handlers update URL as the single source of truth
  const handleSelectSubject = (newSubjectId) => {
    if (String(newSubjectId) !== String(subjectId)) {
      navigate(`/notes/${newSubjectId}`);
    }
  };

  const handleSelectModule = (newModuleId) => {
    if (String(newModuleId) !== String(moduleId)) {
      navigate(`/notes/${subjectId}/${newModuleId}`);
    }
  };

  const handleSemesterChange = (newSemester) => {
    setSemester(Number(newSemester));
    navigate('/notes');
  };

  // Keyboard navigation cross-panes
  const handleKeyDownNav = (direction) => {
    if (direction === 'right') {
      if (modules.length > 0 && !moduleId) {
        navigate(`/notes/${subjectId}/${modules[0]._id}`);
      }
    } else if (direction === 'left') {
      if (moduleId) {
        navigate(`/notes/${subjectId}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 font-sans flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Top Header & Semester Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-6 h-6 rounded-md bg-[#C0D5C3] flex items-center justify-center text-[#2F3E4A]">
              <BookOpen className="w-3.5 h-3.5 text-[#2F3E4A]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C966D]">
              Digital University Repository
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#2F3E4A]">
            Study <span className="text-[#8C966D]">Library</span>
          </h1>
        </div>

        {/* Light Semester Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F4F4EB] px-3 py-1.5 rounded-lg border border-[#D6D6C2] shadow-2xs">
          <GraduationCap className="w-4 h-4 text-[#8C966D]" />
          <label htmlFor="library-semester" className="text-xs font-semibold text-[#2F3E4A]/80">
            Semester:
          </label>
          <select
            id="library-semester"
            value={semester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#2F3E4A] cursor-pointer focus:outline-none pr-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s} className="bg-[#E4E4D4]">
                Sem {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slim Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-3 shrink-0">
        <ol className="flex items-center flex-wrap gap-1.5 text-xs text-[#2F3E4A]/70">
          <li>
            <Link
              to="/notes"
              className="hover:text-[#2F3E4A] hover:underline underline-offset-2 transition-colors font-medium"
            >
              Notes Library
            </Link>
          </li>

          {currentCourse && (
            <li className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-[#A9B28C] shrink-0" aria-hidden="true" />
              {moduleId ? (
                <Link
                  to={`/notes/${currentCourse._id}`}
                  className="hover:text-[#2F3E4A] hover:underline underline-offset-2 transition-colors font-medium max-w-[200px] sm:max-w-xs truncate"
                >
                  {currentCourse.code} {currentCourse.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-bold text-[#2F3E4A] max-w-[200px] sm:max-w-xs truncate">
                  {currentCourse.code} {currentCourse.name}
                </span>
              )}
            </li>
          )}

          {currentModule && (
            <li className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-[#A9B28C] shrink-0" aria-hidden="true" />
              <span aria-current="page" className="font-bold text-[#2F3E4A] max-w-[200px] sm:max-w-xs truncate">
                {currentModule.title}
              </span>
            </li>
          )}
        </ol>
      </nav>

      {/* Mobile Back Bar (Visible only on mobile when navigated deeper) */}
      <div className="lg:hidden mb-2 shrink-0 flex items-center justify-between bg-[#F4F4EB] px-3 py-1.5 rounded-lg border border-[#D6D6C2]">
        {moduleId ? (
          <button
            onClick={() => navigate(`/notes/${subjectId}`)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2F3E4A]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Modules</span>
          </button>
        ) : subjectId ? (
          <button
            onClick={() => navigate('/notes')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2F3E4A]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Subjects</span>
          </button>
        ) : (
          <span className="text-xs font-medium text-[#2F3E4A]/70">All Courses</span>
        )}
      </div>

      {/* Main 3-Pane Persistent Browser Container (CSS Grid with exact 3 direct children) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,28%)_minmax(240px,28%)_1fr] items-stretch h-[calc(100vh-190px)] min-h-[520px] rounded-xl border border-[#D6D6C2] bg-[#FAF9F0] shadow-[0_2px_10px_rgba(47,62,74,0.05)] overflow-hidden">
        {/* Child 1: Subjects Pane */}
        <SubjectsPane
          subjects={subjects}
          selectedSubjectId={subjectId}
          onSelectSubject={handleSelectSubject}
          loading={loadingSubjects}
          error={subjectsError}
          onRetry={loadSemesterData}
          semester={semester}
          getSubjectNoteCount={getSubjectNoteCount}
          onKeyDownNav={handleKeyDownNav}
          className={subjectId ? 'hidden lg:flex' : 'flex'}
        />

        {/* Child 2: Modules Pane */}
        <ModulesPane
          subjectId={subjectId}
          course={currentCourse}
          modules={modules}
          selectedModuleId={moduleId}
          onSelectModule={handleSelectModule}
          loading={loadingModules}
          error={modulesError}
          onRetry={fetchSubjectData}
          getModuleNoteCount={getModuleNoteCount}
          onKeyDownNav={handleKeyDownNav}
          className={moduleId ? 'hidden lg:flex' : subjectId ? 'flex' : 'hidden lg:flex'}
        />

        {/* Child 3: Notes Pane */}
        <NotesPane
          moduleId={moduleId}
          currentModule={currentModule}
          notes={notesForActiveModule}
          loading={loadingModules}
          error={null}
          onRetry={fetchSubjectData}
          onKeyDownNav={handleKeyDownNav}
          className={moduleId ? 'flex' : 'hidden lg:flex'}
        />
      </div>
    </div>
  );
};
