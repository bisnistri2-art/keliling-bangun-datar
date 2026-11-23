import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  RotateCcw,
  Star,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { ASSESSMENT_QUESTIONS, BADGE_DEFINITIONS, REWARD_TIERS } from '../data/curriculum';
import type {
  AssessmentAttempt,
  BadgeId,
  ShapeDimensions,
  StudentProfile,
} from '../types/mpi';
import { computeShapeGeometry } from '../utils/geometry';
import { gradeAssessment } from '../utils/scoring';
import { ShapeDiagram } from './ShapeDiagram';

interface AssessmentViewProps {
  activeStudent: StudentProfile;
  onCompleteAttempt: (attempt: AssessmentAttempt) => { newlyUnlockedBadges: BadgeId[] };
  onOpenStudentModal: () => void;
  onOpenCertificate: (student: StudentProfile) => void;
  onGoToLeaderboard: () => void;
}

type QuizPhase = 'briefing' | 'active' | 'results';

const FALLBACK_DIMS: ShapeDimensions = {
  sisi: 7,
  panjang: 10,
  lebar: 6,
  sisiA: 8,
  sisiB: 8,
  sisiC: 8,
};

export function AssessmentView({
  activeStudent,
  onCompleteAttempt,
  onOpenStudentModal,
  onOpenCertificate,
  onGoToLeaderboard,
}: AssessmentViewProps) {
  const [phase, setPhase] = useState<QuizPhase>('briefing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [selectedInput, setSelectedInput] = useState('');
  const [submittedCurrent, setSubmittedCurrent] = useState(false);
  const [liveStreak, setLiveStreak] = useState(0);
  const [inputError, setInputError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<AssessmentAttempt | null>(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState<BadgeId[]>([]);
  const [medalImgFailed, setMedalImgFailed] = useState(false);

  const currentQuestion = ASSESSMENT_QUESTIONS[currentIndex];

  const questionGeometry = useMemo(() => {
    if (!currentQuestion?.diagram) return null;
    const mergedDims: ShapeDimensions = {
      ...FALLBACK_DIMS,
      ...currentQuestion.diagram.dims,
    };
    return computeShapeGeometry(currentQuestion.diagram.shape, mergedDims, {
      hideDimension: currentQuestion.diagram.hideDimension,
    });
  }, [currentQuestion]);

  const handleStart = () => {
    setPhase('active');
    setCurrentIndex(0);
    setAnswers({});
    setSelectedInput('');
    setSubmittedCurrent(false);
    setLiveStreak(0);
    setInputError(null);
    setLastAttempt(null);
    setNewlyUnlocked([]);
    setMedalImgFailed(false);
  };

  const handleCheckAnswer = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (submittedCurrent) return;

    const raw = selectedInput.trim().replace(',', '.');
    if (!raw) {
      setInputError(
        currentQuestion.format === 'pilihan-ganda'
          ? 'Pilih salah satu jawaban terlebih dahulu.'
          : 'Masukkan angka jawaban terlebih dahulu.'
      );
      return;
    }

    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setInputError('Masukkan bilangan positif yang valid.');
      return;
    }

    setInputError(null);
    const isCorrect = Math.abs(numeric - currentQuestion.correctAnswer) < 1e-4;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: numeric }));
    setSubmittedCurrent(true);
    setLiveStreak((prev) => (isCorrect ? prev + 1 : 0));
  };

  const handleNext = () => {
    if (currentIndex + 1 < ASSESSMENT_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedInput('');
      setSubmittedCurrent(false);
      setInputError(null);
    } else {
      const evaluated = gradeAssessment(ASSESSMENT_QUESTIONS, answers);
      const attempt: AssessmentAttempt = {
        id: `att-${Date.now()}`,
        completedAt: new Date().toISOString(),
        score: evaluated.score,
        correctCount: evaluated.correctCount,
        totalQuestions: evaluated.totalQuestions,
        maxStreak: evaluated.maxStreak,
        pointsEarned: evaluated.pointsEarned,
        rewardTier: evaluated.rewardTier,
        stars: evaluated.stars,
        masteryByShape: evaluated.masteryByShape,
      };
      const { newlyUnlockedBadges } = onCompleteAttempt(attempt);
      setLastAttempt(attempt);
      setNewlyUnlocked(newlyUnlockedBadges);
      setPhase('results');
    }
  };

  if (phase === 'briefing') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-slate-500">
              Asesmen Formatif · 10 Soal · Pilihan Ganda &amp; Isian Singkat
            </p>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              Uji Pemahaman Keliling Bangun Datar
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Kerjakan 10 soal terstruktur mulai dari perhitungan langsung, soal cerita kontekstual,
              hingga penalaran balik mencari sisi yang belum diketahui. Hasil dan reward langsung
              tersimpan atas nama peserta didik aktif.
            </p>
          </div>

          {/* Active student confirmation */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shrink-0"
                style={{ backgroundColor: activeStudent.avatarColor }}
                aria-hidden="true"
              >
                {activeStudent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500">Peserta Asesmen Saat Ini</p>
                <p className="font-semibold text-slate-900">{activeStudent.name}</p>
                <p className="text-xs text-slate-500 font-mono-math">
                  {activeStudent.kelas} · Percobaan sebelumnya: {activeStudent.attempts.length} ·
                  Skor terbaik: {activeStudent.bestScore}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenStudentModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Ganti Siswa
            </button>
          </div>

          {/* Assessment blueprint breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-slate-200 py-5">
            <div>
              <p className="text-xs text-slate-500">Komposisi Materi</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                3 Persegi · 3 Persegi Panjang · 4 Segitiga
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Pembahasan Langsung</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                Koreksi rumus otomatis setiap soal
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Reward Prestasi</p>
              <p className="text-sm font-semibold text-slate-900 mt-1">
                Medali, 6 Lencana, &amp; Sertifikat Cetak
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Tips: Siapkan catatan kecil untuk menghitung dengan teliti.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] transition-colors whitespace-nowrap cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
              Mulai Asesmen
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' && lastAttempt) {
    const reward = REWARD_TIERS[lastAttempt.rewardTier];
    const unlockedDefs = BADGE_DEFINITIONS.filter((b) => newlyUnlocked.includes(b.id));

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div
          data-testid="assessment-results"
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6"
        >
          {/* Top Reward Banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-200 pb-5">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500">
                Hasil Asesmen · {activeStudent.name} ({activeStudent.kelas})
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {reward.name}
              </h1>
              <p className="text-sm text-slate-600 max-w-xl">{reward.message}</p>
              <div
                className="flex items-center gap-1.5 pt-1.5"
                aria-label={`Memperoleh ${lastAttempt.stars} dari 3 bintang`}
              >
                {[1, 2, 3].map((i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i <= lastAttempt.stars
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-slate-800">
                  {reward.predikat}
                </span>
              </div>
            </div>

            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-slate-200 bg-[#F8FAFC] overflow-hidden shrink-0 flex items-center justify-center">
              {!medalImgFailed ? (
                <img
                  src={reward.imagePath}
                  alt={reward.name}
                  referrerPolicy="no-referrer"
                  onError={() => setMedalImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Award className="w-10 h-10 text-amber-500" aria-hidden="true" />
              )}
            </div>
          </div>

          {/* Quantitative Score Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500">Skor Akhir</p>
              <p
                data-testid="final-score-value"
                className="font-mono-math text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5"
              >
                {lastAttempt.score}
              </p>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500">Jawaban Benar</p>
              <p className="font-mono-math text-2xl sm:text-3xl font-bold text-emerald-700 mt-0.5">
                {lastAttempt.correctCount}/{lastAttempt.totalQuestions}
              </p>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500">Poin Diperoleh</p>
              <p className="font-mono-math text-2xl sm:text-3xl font-bold text-[#0284C7] mt-0.5">
                +{lastAttempt.pointsEarned}
              </p>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-3.5">
              <p className="text-xs text-slate-500">Streak Terbaik</p>
              <p className="font-mono-math text-2xl sm:text-3xl font-bold text-amber-600 mt-0.5">
                {lastAttempt.maxStreak}×
              </p>
            </div>
          </div>

          {/* Per-Shape Diagnostic Mastery */}
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Analisis Penguasaan per Bangun Datar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(
                [
                  { id: 'persegi', label: 'Persegi', color: '#0284C7' },
                  { id: 'persegi-panjang', label: 'Persegi Panjang', color: '#059669' },
                  { id: 'segitiga', label: 'Segitiga', color: '#D97706' },
                ] as const
              ).map((item) => {
                const m = lastAttempt.masteryByShape[item.id];
                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-4 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      <span className="font-mono-math font-semibold text-slate-700">
                        {m.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${m.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 font-mono-math">
                      {m.correct} dari {m.total} soal benar
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Newly Unlocked Badges */}
          {unlockedDefs.length > 0 && (
            <div className="space-y-3 bg-amber-50/60 border border-amber-200 rounded-xl p-5">
              <h2 className="font-display text-base font-bold text-slate-900">
                Lencana Baru Terbuka ({unlockedDefs.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unlockedDefs.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white border border-amber-200/80 rounded-lg p-3 flex items-start gap-2.5"
                  >
                    <Award
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: badge.accentColor }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                      <p className="text-xs text-slate-600">{badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Ulangi Asesmen
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onGoToLeaderboard}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Lihat Papan Skor Kelas
              </button>
              <button
                type="button"
                onClick={() => onOpenCertificate(activeStudent)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] cursor-pointer"
              >
                <Award className="w-4 h-4" aria-hidden="true" />
                Lihat &amp; Cetak Sertifikat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Question Stage
  const userAnswerVal = answers[currentQuestion.id];
  const isCurrentCorrect =
    submittedCurrent &&
    typeof userAnswerVal === 'number' &&
    Math.abs(userAnswerVal - currentQuestion.correctAnswer) < 1e-4;

  const progressPct = ((currentIndex + (submittedCurrent ? 1 : 0)) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Progress & Live Metadata Header */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-mono-math font-semibold text-slate-900">
              Soal {currentIndex + 1} dari {ASSESSMENT_QUESTIONS.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>{currentQuestion.contextLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Tingkat {currentQuestion.difficulty}</span>
          </div>

          <div className="flex items-center gap-3 font-mono-math text-xs">
            <span className="text-slate-600">{activeStudent.name}</span>
            {liveStreak >= 2 && (
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                Streak {liveStreak}
              </span>
            )}
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0284C7] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Diagram Column */}
          {questionGeometry && (
            <div className="lg:col-span-5">
              <ShapeDiagram
                geometry={questionGeometry}
                showGrid={true}
                knownPerimeter={currentQuestion.diagram?.knownPerimeter}
                compact={true}
              />
            </div>
          )}

          {/* Prompt & Input Column */}
          <div className={questionGeometry ? 'lg:col-span-7 space-y-5' : 'lg:col-span-12 space-y-5'}>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h2>

            <form onSubmit={handleCheckAnswer} className="space-y-4">
              {currentQuestion.format === 'pilihan-ganda' && currentQuestion.options ? (
                <fieldset className="space-y-2.5" disabled={submittedCurrent}>
                  <legend className="sr-only">Pilihan jawaban</legend>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedInput === opt.value;
                    const optNumeric = Number(opt.value);
                    const isRightOpt =
                      Math.abs(optNumeric - currentQuestion.correctAnswer) < 1e-4;

                    let stateStyle =
                      'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
                    if (submittedCurrent) {
                      if (isRightOpt) {
                        stateStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950';
                      } else if (isSelected && !isRightOpt) {
                        stateStyle = 'border-red-400 bg-red-50 text-red-950';
                      } else {
                        stateStyle = 'border-slate-200 bg-white text-slate-400';
                      }
                    } else if (isSelected) {
                      stateStyle = 'border-[#0284C7] bg-sky-50 text-slate-900';
                    }

                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          if (!submittedCurrent) {
                            setSelectedInput(opt.value);
                            setInputError(null);
                          }
                        }}
                        aria-pressed={isSelected}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors cursor-pointer disabled:cursor-default ${stateStyle}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md border border-current/25 flex items-center justify-center text-xs font-mono-math font-semibold shrink-0">
                            {letter}
                          </span>
                          <span className="font-mono-math text-sm sm:text-base font-medium">
                            {opt.label}
                          </span>
                        </span>
                        {submittedCurrent && isRightOpt && (
                          <CheckCircle2
                            className="w-5 h-5 text-emerald-600 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {submittedCurrent && isSelected && !isRightOpt && (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                </fieldset>
              ) : (
                <div className="space-y-2">
                  <label
                    htmlFor="assessment-numeric-input"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Tulis hasil perhitunganmu ({currentQuestion.unit})
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      id="assessment-numeric-input"
                      type="number"
                      inputMode="decimal"
                      disabled={submittedCurrent}
                      value={selectedInput}
                      onChange={(e) => {
                        setSelectedInput(e.target.value);
                        setInputError(null);
                      }}
                      placeholder="Masukkan angka..."
                      className="w-full px-4 py-3 pr-14 text-base font-mono-math bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 disabled:bg-slate-50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono-math text-slate-500">
                      {currentQuestion.unit}
                    </span>
                  </div>
                </div>
              )}

              {inputError && (
                <p role="alert" className="text-sm text-red-700">
                  {inputError}
                </p>
              )}

              {/* Pedagogical Feedback Box after submission */}
              {submittedCurrent && (
                <div
                  role="status"
                  className={`rounded-xl p-4 border space-y-1.5 ${
                    isCurrentCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-red-50 border-red-200 text-red-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {isCurrentCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        <span>Jawaban Benar (+{currentQuestion.points} Poin)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                        <span>
                          Belum Tepat — Jawaban yang benar: {currentQuestion.correctAnswer}{' '}
                          {currentQuestion.unit}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    <span className="font-mono-math font-semibold">
                      {currentQuestion.formulaHint}:
                    </span>{' '}
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {!submittedCurrent ? (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Periksa Jawaban
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] transition-colors cursor-pointer"
                  >
                    {currentIndex + 1 < ASSESSMENT_QUESTIONS.length
                      ? 'Soal Berikutnya'
                      : 'Lihat Skor & Reward'}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
