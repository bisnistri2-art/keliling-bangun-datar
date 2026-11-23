export type ShapeType = 'persegi' | 'persegi-panjang' | 'segitiga';

export type AppView = 'beranda' | 'eksplorasi' | 'asesmen' | 'papan-skor';

export type TriangleKind =
  | 'Sama Sisi'
  | 'Sama Kaki'
  | 'Siku-Siku'
  | 'Sembarang'
  | 'Tidak Valid';

export interface ShapeDimensions {
  // Persegi
  sisi: number;
  // Persegi panjang
  panjang: number;
  lebar: number;
  // Segitiga
  sisiA: number;
  sisiB: number;
  sisiC: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface EdgeSegment {
  id: string;
  from: Point2D;
  to: Point2D;
  lengthCm: number;
  label: string;
  color: string;
  labelPosition: Point2D;
  tickCount?: number;
}

export interface ComputedShapeGeometry {
  shape: ShapeType;
  valid: boolean;
  perimeterCm: number;
  vertices: Point2D[];
  vertexLabels: { label: string; x: number; y: number }[];
  edges: EdgeSegment[];
  rightAngleVertexIndices: number[];
  triangleKind?: TriangleKind;
  formulaSymbolic: string;
  formulaExpanded: string;
  formulaSubstitution: string;
  formulaResult: string;
}

export type QuestionFormat = 'pilihan-ganda' | 'isian';

export interface AssessmentQuestion {
  id: string;
  shape: ShapeType;
  format: QuestionFormat;
  difficulty: 'Dasar' | 'Menengah' | 'Tantangan';
  prompt: string;
  contextLabel: string;
  diagram?: {
    shape: ShapeType;
    dims: Partial<ShapeDimensions>;
    hideDimension?: 'sisi' | 'lebar' | 'sisiC';
    knownPerimeter?: number;
  };
  options?: { value: string; label: string }[];
  correctAnswer: number;
  unit: string;
  explanation: string;
  formulaHint: string;
  points: number;
}

export interface ShapeMastery {
  correct: number;
  total: number;
  percentage: number;
}

export type RewardTierId = 'emas' | 'perak' | 'perunggu' | 'pemula';

export interface RewardTier {
  id: RewardTierId;
  name: string;
  predikat: string;
  minScore: number;
  stars: number;
  imagePath: string;
  accentHex: string;
  message: string;
}

export type BadgeId =
  | 'penjelajah-geometri'
  | 'ahli-persegi'
  | 'master-persegi-panjang'
  | 'juara-segitiga'
  | 'nilai-sempurna'
  | 'kilat-tepat';

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
  criterion: string;
  accentColor: string;
}

export interface AssessmentAttempt {
  id: string;
  completedAt: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  maxStreak: number;
  pointsEarned: number;
  rewardTier: RewardTierId;
  stars: number;
  masteryByShape: Record<ShapeType, ShapeMastery>;
}

export interface StudentProfile {
  id: string;
  name: string;
  kelas: string;
  avatarColor: string;
  exploredShapes: ShapeType[];
  completedMiniChallenges: ShapeType[];
  explorationPoints: number;
  attempts: AssessmentAttempt[];
  bestScore: number;
  totalPoints: number;
  highestReward: RewardTierId;
  badges: BadgeId[];
  createdAt: string;
}
