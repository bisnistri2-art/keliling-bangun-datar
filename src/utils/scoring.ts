import type {
  AssessmentAttempt,
  AssessmentQuestion,
  BadgeId,
  RewardTierId,
  ShapeMastery,
  ShapeType,
  StudentProfile,
} from '../types/mpi';

export interface GradedQuestionResult {
  questionId: string;
  shape: ShapeType;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface AssessmentEvaluation {
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  pointsEarned: number;
  rewardTier: RewardTierId;
  stars: number;
  predikat: string;
  masteryByShape: Record<ShapeType, ShapeMastery>;
  results: GradedQuestionResult[];
}

export function determineRewardTier(score: number): {
  tier: RewardTierId;
  stars: number;
  predikat: string;
} {
  if (score >= 90) {
    return { tier: 'emas', stars: 3, predikat: 'Sangat Baik (Mahir)' };
  }
  if (score >= 75) {
    return { tier: 'perak', stars: 2, predikat: 'Baik (Cakap)' };
  }
  if (score >= 60) {
    return { tier: 'perunggu', stars: 2, predikat: 'Cukup (Berkembang)' };
  }
  return { tier: 'pemula', stars: 1, predikat: 'Perlu Bimbingan' };
}

export function compareRewardTier(a: RewardTierId, b: RewardTierId): number {
  const rank: Record<RewardTierId, number> = {
    pemula: 0,
    perunggu: 1,
    perak: 2,
    emas: 3,
  };
  return rank[a] - rank[b];
}

export function gradeAssessment(
  questions: AssessmentQuestion[],
  answersById: Record<string, number | null>
): AssessmentEvaluation {
  const shapes: ShapeType[] = ['persegi', 'persegi-panjang', 'segitiga'];
  const shapeCounts: Record<ShapeType, { correct: number; total: number }> = {
    persegi: { correct: 0, total: 0 },
    'persegi-panjang': { correct: 0, total: 0 },
    segitiga: { correct: 0, total: 0 },
  };

  let correctCount = 0;
  let currentStreak = 0;
  let maxStreak = 0;
  let pointsEarned = 0;

  const results: GradedQuestionResult[] = questions.map((q) => {
    const raw = answersById[q.id];
    const userAnswer = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
    const isCorrect = userAnswer !== null && Math.abs(userAnswer - q.correctAnswer) < 1e-4;

    shapeCounts[q.shape].total += 1;
    if (isCorrect) {
      correctCount += 1;
      shapeCounts[q.shape].correct += 1;
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      // Base question points + small streak bonus
      pointsEarned += q.points + (currentStreak >= 3 ? 5 : 0);
    } else {
      currentStreak = 0;
    }

    return {
      questionId: q.id,
      shape: q.shape,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      pointsEarned: isCorrect ? q.points : 0,
    };
  });

  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const { tier, stars, predikat } = determineRewardTier(score);

  const masteryByShape = shapes.reduce(
    (acc, shape) => {
      const { correct, total } = shapeCounts[shape];
      acc[shape] = {
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
      return acc;
    },
    {} as Record<ShapeType, ShapeMastery>
  );

  return {
    score,
    correctCount,
    totalQuestions,
    maxStreak,
    pointsEarned,
    rewardTier: tier,
    stars,
    predikat,
    masteryByShape,
    results,
  };
}

export function computeUnlockedBadges(student: Pick<StudentProfile, 'exploredShapes' | 'attempts'>): BadgeId[] {
  const badges = new Set<BadgeId>();

  if (
    student.exploredShapes.includes('persegi') &&
    student.exploredShapes.includes('persegi-panjang') &&
    student.exploredShapes.includes('segitiga')
  ) {
    badges.add('penjelajah-geometri');
  }

  for (const attempt of student.attempts) {
    if (attempt.masteryByShape.persegi.total > 0 && attempt.masteryByShape.persegi.percentage === 100) {
      badges.add('ahli-persegi');
    }
    if (
      attempt.masteryByShape['persegi-panjang'].total > 0 &&
      attempt.masteryByShape['persegi-panjang'].percentage === 100
    ) {
      badges.add('master-persegi-panjang');
    }
    if (attempt.masteryByShape.segitiga.total > 0 && attempt.masteryByShape.segitiga.percentage === 100) {
      badges.add('juara-segitiga');
    }
    if (attempt.score === 100) {
      badges.add('nilai-sempurna');
    }
    if (attempt.maxStreak >= 5) {
      badges.add('kilat-tepat');
    }
  }

  return Array.from(badges);
}

export function applyAttemptToStudent(
  student: StudentProfile,
  attempt: AssessmentAttempt
): StudentProfile {
  const updatedAttempts = [attempt, ...student.attempts];
  const bestScore = Math.max(student.bestScore, attempt.score);
  const highestReward =
    compareRewardTier(attempt.rewardTier, student.highestReward) > 0
      ? attempt.rewardTier
      : student.highestReward;

  const totalPoints = student.totalPoints + attempt.pointsEarned;
  const badges = computeUnlockedBadges({
    exploredShapes: student.exploredShapes,
    attempts: updatedAttempts,
  });

  return {
    ...student,
    attempts: updatedAttempts,
    bestScore,
    totalPoints,
    highestReward,
    badges,
  };
}

export function sortLeaderboard(students: StudentProfile[]): StudentProfile[] {
  return [...students].sort((a, b) => {
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    return a.name.localeCompare(b.name, 'id');
  });
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateGradebookCsv(students: StudentProfile[]): string {
  const ranked = sortLeaderboard(students);
  const headers = [
    'Peringkat',
    'Nama Peserta Didik',
    'Kelas',
    'Eksplorasi Selesai',
    'Skor Terbaik',
    'Jumlah Percobaan',
    'Total Poin',
    'Reward Medali',
    'Jumlah Lencana',
  ];

  const rows = ranked.map((s, idx) => [
    idx + 1,
    s.name,
    s.kelas,
    `${s.exploredShapes.length}/3`,
    s.bestScore,
    s.attempts.length,
    s.totalPoints,
    s.highestReward.toUpperCase(),
    s.badges.length,
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}
