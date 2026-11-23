import type {
  AssessmentQuestion,
  BadgeDefinition,
  RewardTier,
  RewardTierId,
  ShapeType,
  StudentProfile,
} from '../types/mpi';

export const HERO_IMAGE_PATH = '/src/assets/images/hero_geometry_studio_1795473672428.jpg';

export const REWARD_TIERS: Record<RewardTierId, RewardTier> = {
  emas: {
    id: 'emas',
    name: 'Medali Emas Geometri',
    predikat: 'Sangat Baik (Mahir)',
    minScore: 90,
    stars: 3,
    imagePath: '/src/assets/images/reward_gold_medal_1795473670951.jpg',
    accentHex: '#D97706',
    message: 'Luar biasa! Kamu telah menguasai konsep keliling bangun datar dengan sangat teliti.',
  },
  perak: {
    id: 'perak',
    name: 'Medali Perak Geometri',
    predikat: 'Baik (Cakap)',
    minScore: 75,
    stars: 2,
    imagePath: '/src/assets/images/reward_silver_medal_1795473670798.jpg',
    accentHex: '#059669',
    message: 'Kerja bagus! Pemahamanmu sudah kuat, sedikit latihan lagi untuk meraih Emas.',
  },
  perunggu: {
    id: 'perunggu',
    name: 'Medali Perunggu Geometri',
    predikat: 'Cukup (Berkembang)',
    minScore: 60,
    stars: 2,
    imagePath: '/src/assets/images/reward_bronze_medal_1795473671764.jpg',
    accentHex: '#0284C7',
    message: 'Cukup baik! Coba tinjau kembali bagian eksplorasi untuk memperkuat rumus.',
  },
  pemula: {
    id: 'pemula',
    name: 'Lencana Bintang Pemula',
    predikat: 'Perlu Bimbingan',
    minScore: 0,
    stars: 1,
    imagePath: '/src/assets/images/reward_bronze_medal_1795473671764.jpg',
    accentHex: '#64748B',
    message: 'Terus semangat belajar! Gunakan laboratorium eksplorasi untuk memahami keliling sisi demi sisi.',
  },
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'penjelajah-geometri',
    name: 'Penjelajah Geometri',
    description: 'Menjelajahi simulasi ketiga bangun datar di laboratorium.',
    criterion: 'Eksplorasi Persegi, Persegi Panjang, & Segitiga',
    accentColor: '#0284C7',
  },
  {
    id: 'ahli-persegi',
    name: 'Ahli Persegi',
    description: 'Menjawab benar semua soal keliling persegi pada asesmen.',
    criterion: 'Akurasi 100% pada materi Persegi',
    accentColor: '#0369A1',
  },
  {
    id: 'master-persegi-panjang',
    name: 'Master Persegi Panjang',
    description: 'Menjawab benar semua soal keliling persegi panjang pada asesmen.',
    criterion: 'Akurasi 100% pada materi Persegi Panjang',
    accentColor: '#059669',
  },
  {
    id: 'juara-segitiga',
    name: 'Juara Segitiga',
    description: 'Menjawab benar semua soal keliling segitiga pada asesmen.',
    criterion: 'Akurasi 100% pada materi Segitiga',
    accentColor: '#D97706',
  },
  {
    id: 'kilat-tepat',
    name: 'Kilat Tepat',
    description: 'Menjawab benar 5 soal beruntun tanpa kesalahan.',
    criterion: 'Streak minimal 5 jawaban benar beruntun',
    accentColor: '#0F172A',
  },
  {
    id: 'nilai-sempurna',
    name: 'Nilai Sempurna 100',
    description: 'Meraih skor sempurna 100 pada asesmen keliling bangun datar.',
    criterion: 'Skor 100/100 pada Asesmen',
    accentColor: '#B45309',
  },
];

export interface ShapeLessonContent {
  id: ShapeType;
  number: string;
  title: string;
  shortDesc: string;
  keyProperty: string;
  formula: string;
  accentHex: string;
  realWorldExamples: {
    title: string;
    description: string;
    dims: { sisi?: number; panjang?: number; lebar?: number; sisiA?: number; sisiB?: number; sisiC?: number };
  }[];
  miniChallenge: {
    question: string;
    answer: number;
    hint: string;
    unit: string;
  };
}

export const SHAPE_LESSONS: Record<ShapeType, ShapeLessonContent> = {
  persegi: {
    id: 'persegi',
    number: '01',
    title: 'Persegi',
    shortDesc: 'Empat sisi sama panjang dengan empat sudut siku-siku (90°).',
    keyProperty: 'Keempat sisi memiliki panjang yang tepat sama (AB = BC = CD = DA = s).',
    formula: 'K = 4 × s',
    accentHex: '#0284C7',
    realWorldExamples: [
      {
        title: 'Keramik Lantai',
        description: 'Ubin persegi berukuran sisi 8 cm disusun beraturan. Berapa panjang garis tepinya?',
        dims: { sisi: 8 },
      },
      {
        title: 'Papan Catur Mini',
        description: 'Papan permainan berbentuk persegi dengan panjang sisi 12 cm di setiap tepi.',
        dims: { sisi: 12 },
      },
    ],
    miniChallenge: {
      question: 'Sebuah sapu tangan berbentuk persegi memiliki sisi 9 cm. Berapa kelilingnya?',
      answer: 36,
      hint: 'Kalikan panjang satu sisi dengan 4 (4 × 9 cm).',
      unit: 'cm',
    },
  },
  'persegi-panjang': {
    id: 'persegi-panjang',
    number: '02',
    title: 'Persegi Panjang',
    shortDesc: 'Dua pasang sisi berhadapan yang sejajar dan sama panjang.',
    keyProperty: 'Memiliki dua sisi panjang (p) yang sama dan dua sisi lebar (l) yang sama.',
    formula: 'K = 2 × (p + l)',
    accentHex: '#059669',
    realWorldExamples: [
      {
        title: 'Bingkai Foto Kelas',
        description: 'Bingkai kayu dengan panjang 12 cm dan lebar 8 cm akan dihias pita di sekelilingnya.',
        dims: { panjang: 12, lebar: 8 },
      },
      {
        title: 'Buku Gambar',
        description: 'Sampul buku berukuran panjang 14 cm dan lebar 9 cm.',
        dims: { panjang: 14, lebar: 9 },
      },
    ],
    miniChallenge: {
      question: 'Sebuah meja belajar berbentuk persegi panjang berukuran panjang 11 cm dan lebar 6 cm pada denah. Berapa kelilingnya?',
      answer: 34,
      hint: 'Jumlahkan panjang dan lebar terlebih dahulu (11 + 6), lalu kalikan 2.',
      unit: 'cm',
    },
  },
  segitiga: {
    id: 'segitiga',
    number: '03',
    title: 'Segitiga',
    shortDesc: 'Bangun datar tertutup yang dibatasi oleh tiga ruas garis lurus.',
    keyProperty: 'Keliling diperoleh dengan menjumlahkan panjang ketiga sisinya (a + b + c).',
    formula: 'K = a + b + c',
    accentHex: '#D97706',
    realWorldExamples: [
      {
        title: 'Rambu Lalu Lintas',
        description: 'Rambu peringatan berbentuk segitiga sama sisi dengan panjang setiap sisi 9 cm.',
        dims: { sisiA: 9, sisiB: 9, sisiC: 9 },
      },
      {
        title: 'Penggaris Siku-Siku',
        description: 'Penggaris segitiga siku-siku bersisi alas 8 cm, tegak 6 cm, dan sisi miring 10 cm.',
        dims: { sisiA: 8, sisiB: 10, sisiC: 6 },
      },
    ],
    miniChallenge: {
      question: 'Sebuah bendera pramuka berbentuk segitiga memiliki sisi 7 cm, 7 cm, dan 6 cm. Berapa kelilingnya?',
      answer: 20,
      hint: 'Jumlahkan ketiga panjang sisinya: 7 + 7 + 6.',
      unit: 'cm',
    },
  },
};

export const TRIANGLE_PRESETS = [
  { label: 'Sama Sisi', sisiA: 8, sisiB: 8, sisiC: 8 },
  { label: 'Sama Kaki', sisiA: 7, sisiB: 10, sisiC: 10 },
  { label: 'Siku-Siku', sisiA: 8, sisiB: 10, sisiC: 6 },
  { label: 'Sembarang', sisiA: 11, sisiB: 8, sisiC: 6 },
];

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1',
    shape: 'persegi',
    format: 'pilihan-ganda',
    difficulty: 'Dasar',
    contextLabel: 'Konsep Dasar Persegi',
    prompt: 'Perhatikan gambar persegi ABCD di samping. Jika panjang setiap sisinya 7 cm, berapakah keliling persegi tersebut?',
    diagram: { shape: 'persegi', dims: { sisi: 7 } },
    options: [
      { value: '14', label: '14 cm' },
      { value: '21', label: '21 cm' },
      { value: '28', label: '28 cm' },
      { value: '49', label: '49 cm' },
    ],
    correctAnswer: 28,
    unit: 'cm',
    formulaHint: 'K = 4 × s',
    explanation: 'Persegi memiliki 4 sisi sama panjang. Maka K = 4 × 7 cm = 28 cm.',
    points: 10,
  },
  {
    id: 'q2',
    shape: 'persegi-panjang',
    format: 'pilihan-ganda',
    difficulty: 'Dasar',
    contextLabel: 'Konsep Dasar Persegi Panjang',
    prompt: 'Hitunglah keliling persegi panjang PQRS yang memiliki panjang 12 cm dan lebar 5 cm!',
    diagram: { shape: 'persegi-panjang', dims: { panjang: 12, lebar: 5 } },
    options: [
      { value: '17', label: '17 cm' },
      { value: '34', label: '34 cm' },
      { value: '48', label: '48 cm' },
      { value: '60', label: '60 cm' },
    ],
    correctAnswer: 34,
    unit: 'cm',
    formulaHint: 'K = 2 × (p + l)',
    explanation: 'K = 2 × (12 + 5) = 2 × 17 = 34 cm.',
    points: 10,
  },
  {
    id: 'q3',
    shape: 'segitiga',
    format: 'pilihan-ganda',
    difficulty: 'Dasar',
    contextLabel: 'Segitiga Siku-Siku',
    prompt: 'Sebuah segitiga siku-siku memiliki panjang sisi 8 cm, 10 cm, dan 6 cm. Berapakah keliling segitiga tersebut?',
    diagram: { shape: 'segitiga', dims: { sisiA: 8, sisiB: 10, sisiC: 6 } },
    options: [
      { value: '18', label: '18 cm' },
      { value: '24', label: '24 cm' },
      { value: '30', label: '30 cm' },
      { value: '48', label: '48 cm' },
    ],
    correctAnswer: 24,
    unit: 'cm',
    formulaHint: 'K = a + b + c',
    explanation: 'Jumlahkan seluruh ketiga sisinya: K = 8 + 10 + 6 = 24 cm.',
    points: 10,
  },
  {
    id: 'q4',
    shape: 'persegi',
    format: 'isian',
    difficulty: 'Menengah',
    contextLabel: 'Soal Cerita Taman Sekolah',
    prompt: 'Taman bunga di halaman sekolah berbentuk persegi dengan panjang sisi 15 m. Jika sekeliling taman akan dipasang pagar kayu, berapa meter panjang pagar yang dibutuhkan?',
    diagram: { shape: 'persegi', dims: { sisi: 15 } },
    correctAnswer: 60,
    unit: 'm',
    formulaHint: 'K = 4 × s',
    explanation: 'Panjang pagar sama dengan keliling taman persegi: K = 4 × 15 m = 60 m.',
    points: 12,
  },
  {
    id: 'q5',
    shape: 'segitiga',
    format: 'pilihan-ganda',
    difficulty: 'Menengah',
    contextLabel: 'Segitiga Sama Sisi',
    prompt: 'Sebuah rambu peringatan lalu lintas berbentuk segitiga sama sisi dengan panjang satu sisi 11 cm. Berapakah keliling rambu tersebut?',
    diagram: { shape: 'segitiga', dims: { sisiA: 11, sisiB: 11, sisiC: 11 } },
    options: [
      { value: '22', label: '22 cm' },
      { value: '33', label: '33 cm' },
      { value: '44', label: '44 cm' },
      { value: '36', label: '36 cm' },
    ],
    correctAnswer: 33,
    unit: 'cm',
    formulaHint: 'K = 3 × s (untuk segitiga sama sisi)',
    explanation: 'Karena ketiga sisinya sama panjang (11 cm), maka K = 11 + 11 + 11 = 3 × 11 = 33 cm.',
    points: 10,
  },
  {
    id: 'q6',
    shape: 'persegi-panjang',
    format: 'isian',
    difficulty: 'Menengah',
    contextLabel: 'Soal Cerita Bingkai Pita',
    prompt: 'Rani menghias tepi sebuah poster berbentuk persegi panjang berukuran panjang 14 cm dan lebar 9 cm dengan pita warna. Berapa cm panjang pita minimal yang diperlukan?',
    diagram: { shape: 'persegi-panjang', dims: { panjang: 14, lebar: 9 } },
    correctAnswer: 46,
    unit: 'cm',
    formulaHint: 'K = 2 × (p + l)',
    explanation: 'K = 2 × (14 + 9) = 2 × 23 = 46 cm.',
    points: 12,
  },
  {
    id: 'q7',
    shape: 'persegi',
    format: 'pilihan-ganda',
    difficulty: 'Tantangan',
    contextLabel: 'Penalaran Balik Persegi',
    prompt: 'Diketahui keliling sebuah persegi adalah 36 cm. Berapakah panjang setiap sisi persegi tersebut?',
    diagram: { shape: 'persegi', dims: { sisi: 9 }, hideDimension: 'sisi', knownPerimeter: 36 },
    options: [
      { value: '6', label: '6 cm' },
      { value: '8', label: '8 cm' },
      { value: '9', label: '9 cm' },
      { value: '12', label: '12 cm' },
    ],
    correctAnswer: 9,
    unit: 'cm',
    formulaHint: 's = K ÷ 4',
    explanation: 'Karena K = 4 × s, maka panjang sisi s = 36 ÷ 4 = 9 cm.',
    points: 15,
  },
  {
    id: 'q8',
    shape: 'segitiga',
    format: 'isian',
    difficulty: 'Menengah',
    contextLabel: 'Segitiga Sama Kaki',
    prompt: 'Atap miniatur rumah berbentuk segitiga sama kaki memiliki panjang alas 10 cm dan panjang kedua sisi miringnya masing-masing 13 cm. Berapa cm kelilingnya?',
    diagram: { shape: 'segitiga', dims: { sisiA: 10, sisiB: 13, sisiC: 13 } },
    correctAnswer: 36,
    unit: 'cm',
    formulaHint: 'K = alas + sisi miring 1 + sisi miring 2',
    explanation: 'K = 10 + 13 + 13 = 36 cm.',
    points: 12,
  },
  {
    id: 'q9',
    shape: 'persegi-panjang',
    format: 'pilihan-ganda',
    difficulty: 'Tantangan',
    contextLabel: 'Penalaran Balik Persegi Panjang',
    prompt: 'Keliling sebuah persegi panjang adalah 30 cm. Jika panjangnya 9 cm, berapakah lebar persegi panjang tersebut?',
    diagram: {
      shape: 'persegi-panjang',
      dims: { panjang: 9, lebar: 6 },
      hideDimension: 'lebar',
      knownPerimeter: 30,
    },
    options: [
      { value: '5', label: '5 cm' },
      { value: '6', label: '6 cm' },
      { value: '7', label: '7 cm' },
      { value: '12', label: '12 cm' },
    ],
    correctAnswer: 6,
    unit: 'cm',
    formulaHint: 'l = (K ÷ 2) − p',
    explanation: 'Setengah keliling = 30 ÷ 2 = 15 cm. Maka lebar l = 15 − 9 = 6 cm.',
    points: 15,
  },
  {
    id: 'q10',
    shape: 'segitiga',
    format: 'isian',
    difficulty: 'Tantangan',
    contextLabel: 'Penalaran Balik Segitiga',
    prompt: 'Sebuah segitiga memiliki keliling 32 cm. Jika panjang sisi a = 12 cm dan sisi b = 11 cm, berapakah panjang sisi c?',
    diagram: {
      shape: 'segitiga',
      dims: { sisiA: 12, sisiB: 11, sisiC: 9 },
      hideDimension: 'sisiC',
      knownPerimeter: 32,
    },
    correctAnswer: 9,
    unit: 'cm',
    formulaHint: 'c = K − (a + b)',
    explanation: 'Sisi c = 32 − (12 + 11) = 32 − 23 = 9 cm.',
    points: 15,
  },
];

export const CLASS_OPTIONS = ['Kelas 4A', 'Kelas 4B', 'Kelas 5A', 'Kelas 5B', 'Kelas 6A'];

export const AVATAR_COLORS = [
  { id: 'cobalt', hex: '#0284C7', label: 'Biru Kobalt' },
  { id: 'emerald', hex: '#059669', label: 'Hijau Zamrud' },
  { id: 'amber', hex: '#D97706', label: 'Kuning Emas' },
  { id: 'slate', hex: '#334155', label: 'Abu Batu' },
  { id: 'rose', hex: '#E11D48', label: 'Merah Delima' },
];

export const SEED_STUDENTS: StudentProfile[] = [
  {
    id: 'student-alya',
    name: 'Alya Putri Ramadhani',
    kelas: 'Kelas 4A',
    avatarColor: '#0284C7',
    exploredShapes: ['persegi', 'persegi-panjang', 'segitiga'],
    completedMiniChallenges: ['persegi', 'persegi-panjang', 'segitiga'],
    explorationPoints: 45,
    attempts: [
      {
        id: 'att-alya-1',
        completedAt: '2026-11-22T09:15:00.000Z',
        score: 100,
        correctCount: 10,
        totalQuestions: 10,
        maxStreak: 10,
        pointsEarned: 156,
        rewardTier: 'emas',
        stars: 3,
        masteryByShape: {
          persegi: { correct: 3, total: 3, percentage: 100 },
          'persegi-panjang': { correct: 3, total: 3, percentage: 100 },
          segitiga: { correct: 4, total: 4, percentage: 100 },
        },
      },
    ],
    bestScore: 100,
    totalPoints: 201,
    highestReward: 'emas',
    badges: [
      'penjelajah-geometri',
      'ahli-persegi',
      'master-persegi-panjang',
      'juara-segitiga',
      'nilai-sempurna',
      'kilat-tepat',
    ],
    createdAt: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 'student-bima',
    name: 'Bima Pratama Wijaya',
    kelas: 'Kelas 4A',
    avatarColor: '#059669',
    exploredShapes: ['persegi', 'persegi-panjang', 'segitiga'],
    completedMiniChallenges: ['persegi', 'persegi-panjang'],
    explorationPoints: 30,
    attempts: [
      {
        id: 'att-bima-1',
        completedAt: '2026-11-22T10:05:00.000Z',
        score: 80,
        correctCount: 8,
        totalQuestions: 10,
        maxStreak: 5,
        pointsEarned: 112,
        rewardTier: 'perak',
        stars: 2,
        masteryByShape: {
          persegi: { correct: 3, total: 3, percentage: 100 },
          'persegi-panjang': { correct: 2, total: 3, percentage: 67 },
          segitiga: { correct: 3, total: 4, percentage: 75 },
        },
      },
    ],
    bestScore: 80,
    totalPoints: 142,
    highestReward: 'perak',
    badges: ['penjelajah-geometri', 'ahli-persegi', 'kilat-tepat'],
    createdAt: '2026-11-21T08:15:00.000Z',
  },
  {
    id: 'student-citra',
    name: 'Citra Lestari Dewi',
    kelas: 'Kelas 4B',
    avatarColor: '#D97706',
    exploredShapes: ['persegi', 'segitiga'],
    completedMiniChallenges: ['persegi'],
    explorationPoints: 15,
    attempts: [
      {
        id: 'att-citra-1',
        completedAt: '2026-11-22T11:20:00.000Z',
        score: 70,
        correctCount: 7,
        totalQuestions: 10,
        maxStreak: 4,
        pointsEarned: 88,
        rewardTier: 'perunggu',
        stars: 2,
        masteryByShape: {
          persegi: { correct: 3, total: 3, percentage: 100 },
          'persegi-panjang': { correct: 2, total: 3, percentage: 67 },
          segitiga: { correct: 2, total: 4, percentage: 50 },
        },
      },
    ],
    bestScore: 70,
    totalPoints: 103,
    highestReward: 'perunggu',
    badges: ['ahli-persegi'],
    createdAt: '2026-11-21T08:30:00.000Z',
  },
];
