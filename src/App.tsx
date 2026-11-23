import { useEffect, useMemo, useState } from 'react';
import { AssessmentView } from './components/AssessmentView';
import { CertificateModal } from './components/CertificateModal';
import { ExplorationLab } from './components/ExplorationLab';
import { HomeView } from './components/HomeView';
import { LeaderboardView } from './components/LeaderboardView';
import { StudentModal } from './components/StudentModal';
import { TopBar } from './components/TopBar';
import { SEED_STUDENTS } from './data/curriculum';
import type {
  AppView,
  AssessmentAttempt,
  BadgeId,
  ShapeType,
  StudentProfile,
} from './types/mpi';
import { applyAttemptToStudent, computeUnlockedBadges } from './utils/scoring';

const STORAGE_KEY_STUDENTS = 'kelilinglab_students_v1';
const STORAGE_KEY_ACTIVE_ID = 'kelilinglab_active_student_v1';

function loadInitialStudents(): StudentProfile[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) return SEED_STUDENTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_STUDENTS;
  } catch {
    return SEED_STUDENTS;
  }
}

function loadInitialActiveId(students: StudentProfile[]): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (saved && students.some((s) => s.id === saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return students[0].id;
}

function getInitialView(): AppView {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'eksplorasi';
    }
  } catch {
    // ignore URL parse errors
  }
  return 'beranda';
}

export default function App() {
  const [students, setStudents] = useState<StudentProfile[]>(() => loadInitialStudents());
  const [activeStudentId, setActiveStudentId] = useState<string>(() =>
    loadInitialActiveId(loadInitialStudents())
  );
  const [activeView, setActiveView] = useState<AppView>(() => getInitialView());
  const [selectedLabShape, setSelectedLabShape] = useState<ShapeType>('persegi');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [certificateStudentId, setCertificateStudentId] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {
      // ignore quota errors
    }
  }, [students]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeStudentId);
    } catch {
      // ignore quota errors
    }
  }, [activeStudentId]);

  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) ?? students[0],
    [students, activeStudentId]
  );

  const certificateStudent = useMemo(
    () =>
      certificateStudentId
        ? students.find((s) => s.id === certificateStudentId) ?? null
        : null,
    [students, certificateStudentId]
  );

  const handleAddStudent = (name: string, kelas: string, avatarColor: string) => {
    const newStudent: StudentProfile = {
      id: `student-${Date.now()}`,
      name,
      kelas,
      avatarColor,
      exploredShapes: [],
      completedMiniChallenges: [],
      explorationPoints: 0,
      attempts: [],
      bestScore: 0,
      totalPoints: 0,
      highestReward: 'pemula',
      badges: [],
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    setActiveStudentId(newStudent.id);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((s) => s.id !== id);
      if (activeStudentId === id && next.length > 0) {
        setActiveStudentId(next[0].id);
      }
      return next;
    });
  };

  const handleMarkExplored = (shape: ShapeType) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudent.id) return student;
        if (student.exploredShapes.includes(shape)) return student;
        const nextExplored = [...student.exploredShapes, shape];
        const nextBadges = computeUnlockedBadges({
          exploredShapes: nextExplored,
          attempts: student.attempts,
        });
        return {
          ...student,
          exploredShapes: nextExplored,
          badges: nextBadges,
        };
      })
    );
  };

  const handleCompleteMiniChallenge = (shape: ShapeType, points: number) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== activeStudent.id) return student;
        if (student.completedMiniChallenges.includes(shape)) return student;
        return {
          ...student,
          completedMiniChallenges: [...student.completedMiniChallenges, shape],
          explorationPoints: student.explorationPoints + points,
          totalPoints: student.totalPoints + points,
        };
      })
    );
  };

  const handleCompleteAttempt = (
    attempt: AssessmentAttempt
  ): { newlyUnlockedBadges: BadgeId[] } => {
    const previousBadges = new Set(activeStudent.badges);
    const updatedStudent = applyAttemptToStudent(activeStudent, attempt);
    const newlyUnlockedBadges = updatedStudent.badges.filter((b) => !previousBadges.has(b));

    setStudents((prev) =>
      prev.map((student) => (student.id === activeStudent.id ? updatedStudent : student))
    );

    return { newlyUnlockedBadges };
  };

  const handleStartExploration = (shape?: ShapeType) => {
    if (shape) setSelectedLabShape(shape);
    setActiveView('eksplorasi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeView={activeView}
        onNavigate={handleNavigate}
        activeStudent={activeStudent}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
      />

      <main className="flex-1">
        {activeView === 'beranda' && (
          <HomeView
            activeStudent={activeStudent}
            totalStudents={students.length}
            onStartExploration={handleStartExploration}
            onNavigate={handleNavigate}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
          />
        )}

        {activeView === 'eksplorasi' && (
          <ExplorationLab
            initialShape={selectedLabShape}
            activeStudent={activeStudent}
            onMarkExplored={handleMarkExplored}
            onCompleteMiniChallenge={handleCompleteMiniChallenge}
            onGoToAssessment={() => handleNavigate('asesmen')}
          />
        )}

        {activeView === 'asesmen' && (
          <AssessmentView
            activeStudent={activeStudent}
            onCompleteAttempt={handleCompleteAttempt}
            onOpenStudentModal={() => setIsStudentModalOpen(true)}
            onOpenCertificate={(student) => setCertificateStudentId(student.id)}
            onGoToLeaderboard={() => handleNavigate('papan-skor')}
          />
        )}

        {activeView === 'papan-skor' && (
          <LeaderboardView
            students={students}
            activeStudentId={activeStudent.id}
            onSelectStudent={setActiveStudentId}
            onDeleteStudent={handleDeleteStudent}
            onOpenAddStudentModal={() => setIsStudentModalOpen(true)}
            onOpenCertificate={(student) => setCertificateStudentId(student.id)}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>KelilingLab — Media Pembelajaran Interaktif Keliling Bangun Datar</p>
          <p>Materi: Persegi, Persegi Panjang, &amp; Segitiga</p>
        </div>
      </footer>

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        activeStudentId={activeStudent.id}
        onSelectStudent={setActiveStudentId}
        onAddStudent={handleAddStudent}
      />

      <CertificateModal
        student={certificateStudent}
        onClose={() => setCertificateStudentId(null)}
      />
    </div>
  );
}
