import {
  ArrowRight,
  CheckCircle2,
  Grid3X3,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { SHAPE_LESSONS, TRIANGLE_PRESETS } from '../data/curriculum';
import type { ShapeDimensions, ShapeType, StudentProfile } from '../types/mpi';
import { computeShapeGeometry, interpolateWalkerPosition } from '../utils/geometry';
import { ShapeDiagram } from './ShapeDiagram';

interface ExplorationLabProps {
  initialShape: ShapeType;
  activeStudent: StudentProfile;
  onMarkExplored: (shape: ShapeType) => void;
  onCompleteMiniChallenge: (shape: ShapeType, points: number) => void;
  onGoToAssessment: () => void;
}

const DEFAULT_DIMS: ShapeDimensions = {
  sisi: 7,
  panjang: 11,
  lebar: 6,
  sisiA: 8,
  sisiB: 10,
  sisiC: 6,
};

export function ExplorationLab({
  initialShape,
  activeStudent,
  onMarkExplored,
  onCompleteMiniChallenge,
  onGoToAssessment,
}: ExplorationLabProps) {
  const [shape, setShape] = useState<ShapeType>(initialShape);
  const [dims, setDims] = useState<ShapeDimensions>(DEFAULT_DIMS);
  const [showGrid, setShowGrid] = useState(true);

  // Perimeter Walker Animation state (0..1 or null)
  const [walkProgress, setWalkProgress] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Mini Challenge state
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeFeedback, setChallengeFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  useEffect(() => {
    setShape(initialShape);
  }, [initialShape]);

  // Mark shape as explored whenever student visits it
  useEffect(() => {
    if (!activeStudent.exploredShapes.includes(shape)) {
      onMarkExplored(shape);
    }
    setWalkProgress(null);
    setIsPlaying(false);
    setChallengeInput('');
    setChallengeFeedback('idle');
  }, [shape, activeStudent.id]);

  const geometry = useMemo(() => computeShapeGeometry(shape, dims), [shape, dims]);
  const lesson = SHAPE_LESSONS[shape];
  const miniChallengeDone = activeStudent.completedMiniChallenges.includes(shape);

  // Smooth requestAnimationFrame animation for Perimeter Walker
  useEffect(() => {
    if (!isPlaying || !geometry.valid) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const durationMs = 3600;
    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setWalkProgress((prev) => {
        const current = prev ?? 0;
        const next = current + delta / durationMs;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, geometry.valid]);

  const walkerState = useMemo(() => {
    if (!geometry.valid) return null;
    if (walkProgress === null) return null;
    return interpolateWalkerPosition(geometry.edges, walkProgress);
  }, [geometry, walkProgress]);

  const handlePlayToggle = () => {
    if (!geometry.valid) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (walkProgress === null || walkProgress >= 1) {
        setWalkProgress(0);
      }
      setIsPlaying(true);
    }
  };

  const handleStepEdge = () => {
    if (!geometry.valid) return;
    setIsPlaying(false);
    const totalCm = geometry.perimeterCm;
    if (totalCm <= 0) return;

    // Jump to end of next edge
    const currentCm = (walkProgress ?? 0) * totalCm;
    let accum = 0;
    for (const edge of geometry.edges) {
      accum += edge.lengthCm;
      if (accum > currentCm + 0.05) {
        setWalkProgress(Math.min(1, accum / totalCm));
        return;
      }
    }
    setWalkProgress(0);
  };

  const handleResetWalker = () => {
    setIsPlaying(false);
    setWalkProgress(null);
  };

  const handleDimensionChange = (key: keyof ShapeDimensions, value: number) => {
    setDims((prev) => ({ ...prev, [key]: value }));
    setIsPlaying(false);
    setWalkProgress(null);
  };

  const handleApplyRealWorld = (exampleDims: Partial<ShapeDimensions>) => {
    setDims((prev) => ({ ...prev, ...exampleDims }));
    setIsPlaying(false);
    setWalkProgress(0);
    setIsPlaying(true);
  };

  const handleMiniChallengeSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numeric = Number(challengeInput.trim().replace(',', '.'));
    if (!challengeInput.trim() || !Number.isFinite(numeric)) {
      setChallengeFeedback('wrong');
      return;
    }
    if (Math.abs(numeric - lesson.miniChallenge.answer) < 1e-4) {
      setChallengeFeedback('correct');
      if (!miniChallengeDone) {
        onCompleteMiniChallenge(shape, 15);
      }
    } else {
      setChallengeFeedback('wrong');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Shape Segmented Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs text-slate-500">
            Laboratorium Eksplorasi Interaktif · Progres {activeStudent.exploredShapes.length}/3
            Bangun Datar
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Keliling {lesson.title}
          </h1>
        </div>

        {/* Interactive Segmented Control */}
        <div
          role="tablist"
          aria-label="Pilih bangun datar"
          className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto"
        >
          {(['persegi', 'persegi-panjang', 'segitiga'] as ShapeType[]).map((s) => {
            const active = shape === s;
            const visited = activeStudent.exploredShapes.includes(s);
            return (
              <button
                key={s}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setShape(s)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{SHAPE_LESSONS[s].title}</span>
                {visited && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: 65% Stage (Left) + 35% Control & Concept Deck (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT ZONE: Interactive Visual Stage */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Stage Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  disabled={!geometry.valid}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" aria-hidden="true" />
                      Jeda Animasi
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" aria-hidden="true" />
                      Jalankan Keliling
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleStepEdge}
                  disabled={!geometry.valid}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <StepForward className="w-4 h-4" aria-hidden="true" />
                  Langkah per Sisi
                </button>

                <button
                  type="button"
                  onClick={handleResetWalker}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Reset
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowGrid((prev) => !prev)}
                aria-pressed={showGrid}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                  showGrid
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
                {showGrid ? 'Kertas Petak: Aktif' : 'Kertas Petak: Nonaktif'}
              </button>
            </div>

            {/* Interactive SVG Geometry Stage */}
            <ShapeDiagram
              geometry={geometry}
              showGrid={showGrid}
              walkProgress={walkProgress}
            />

            {/* Unfolded Perimeter Tape Visualization (Pita Keliling Terbentang) */}
            {geometry.valid && (
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
                  <span className="font-semibold text-slate-800">
                    Bentangan Pita Keliling (Jumlah Seluruh Sisi)
                  </span>
                  <span
                    data-testid="live-perimeter-readout"
                    className="font-mono-math font-semibold text-slate-900 whitespace-nowrap"
                  >
                    {walkerState
                      ? `Terukur: ${walkerState.traveledCm} / ${geometry.perimeterCm} cm`
                      : `Total Keliling: ${geometry.perimeterCm} cm`}
                  </span>
                </div>

                <div
                  className="w-full h-10 bg-slate-100 rounded-lg p-1 flex items-center gap-1 overflow-hidden border border-slate-200"
                  aria-label="Visualisasi bentangan pita keliling setiap sisi"
                >
                  {geometry.edges.map((edge, idx) => {
                    const widthPct = (edge.lengthCm / geometry.perimeterCm) * 100;
                    const fillFraction = walkerState ? walkerState.edgeFillFractions[idx] : 1;
                    return (
                      <div
                        key={`tape-${edge.id}`}
                        style={{ width: `${widthPct}%` }}
                        className="h-full bg-white rounded relative overflow-hidden border border-slate-200/80 flex items-center justify-center"
                      >
                        <div
                          className="absolute inset-y-0 left-0 transition-none"
                          style={{
                            width: `${fillFraction * 100}%`,
                            backgroundColor: edge.color,
                            opacity: 0.22,
                          }}
                        />
                        <span className="relative z-10 font-mono-math text-xs font-semibold text-slate-900 truncate px-1">
                          {edge.lengthCm} cm
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  {shape === 'segitiga' && geometry.triangleKind
                    ? `Jenis segitiga saat ini: Segitiga ${geometry.triangleKind}. `
                    : ''}
                  Bayangkan seluruh tepi bangun datar dibuka menjadi satu garis lurus — panjang
                  total garis itulah kelilingnya.
                </p>
              </div>
            )}
          </div>

          {/* Real-world context presets */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <h2 className="font-display text-base font-bold text-slate-900">
                Contoh Konteks Dunia Nyata
              </h2>
              <span className="text-xs text-slate-500">Klik untuk mencoba ukurannya</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.realWorldExamples.map((ex) => (
                <button
                  key={ex.title}
                  type="button"
                  onClick={() => handleApplyRealWorld(ex.dims)}
                  className="text-left p-3.5 rounded-lg border border-slate-200 hover:border-[#0284C7] hover:bg-sky-50/40 transition-colors cursor-pointer"
                >
                  <p className="text-sm font-semibold text-slate-900">{ex.title}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ex.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT ZONE: Control & Concept Deck */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Parameter Sliders Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Pengatur Ukuran Sisi
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{lesson.keyProperty}</p>
            </div>

            {shape === 'persegi' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="slider-sisi" className="font-medium text-slate-700">
                    Panjang Sisi (s)
                  </label>
                  <span className="font-mono-math font-semibold text-[#0284C7]">
                    {dims.sisi} cm
                  </span>
                </div>
                <input
                  id="slider-sisi"
                  type="range"
                  min={2}
                  max={15}
                  step={1}
                  value={dims.sisi}
                  onChange={(e) => handleDimensionChange('sisi', Number(e.target.value))}
                  className="w-full mpi-slider"
                />
                <div className="flex justify-between text-[11px] font-mono-math text-slate-400">
                  <span>2 cm</span>
                  <span>8 cm</span>
                  <span>15 cm</span>
                </div>
              </div>
            )}

            {shape === 'persegi-panjang' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="slider-panjang" className="font-medium text-slate-700">
                      Panjang (p)
                    </label>
                    <span className="font-mono-math font-semibold text-emerald-700">
                      {dims.panjang} cm
                    </span>
                  </div>
                  <input
                    id="slider-panjang"
                    type="range"
                    min={3}
                    max={18}
                    step={1}
                    value={dims.panjang}
                    onChange={(e) => handleDimensionChange('panjang', Number(e.target.value))}
                    className="w-full mpi-slider"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="slider-lebar" className="font-medium text-slate-700">
                      Lebar (l)
                    </label>
                    <span className="font-mono-math font-semibold text-[#0284C7]">
                      {dims.lebar} cm
                    </span>
                  </div>
                  <input
                    id="slider-lebar"
                    type="range"
                    min={2}
                    max={14}
                    step={1}
                    value={dims.lebar}
                    onChange={(e) => handleDimensionChange('lebar', Number(e.target.value))}
                    className="w-full mpi-slider"
                  />
                </div>
              </div>
            )}

            {shape === 'segitiga' && (
              <div className="space-y-4">
                {/* Quick triangle type presets */}
                <div className="flex flex-wrap gap-1.5">
                  {TRIANGLE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setDims((prev) => ({
                          ...prev,
                          sisiA: preset.sisiA,
                          sisiB: preset.sisiB,
                          sisiC: preset.sisiC,
                        }));
                        setIsPlaying(false);
                        setWalkProgress(null);
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {(
                  [
                    { id: 'sisiA', label: 'Sisi Alas (a)', color: 'text-amber-700' },
                    { id: 'sisiB', label: 'Sisi Kanan (b)', color: 'text-[#0284C7]' },
                    { id: 'sisiC', label: 'Sisi Kiri (c)', color: 'text-emerald-700' },
                  ] as const
                ).map((s) => (
                  <div key={s.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <label htmlFor={`slider-${s.id}`} className="font-medium text-slate-700">
                        {s.label}
                      </label>
                      <span className={`font-mono-math font-semibold ${s.color}`}>
                        {dims[s.id]} cm
                      </span>
                    </div>
                    <input
                      id={`slider-${s.id}`}
                      type="range"
                      min={2}
                      max={15}
                      step={1}
                      value={dims[s.id]}
                      onChange={(e) => handleDimensionChange(s.id, Number(e.target.value))}
                      className="w-full mpi-slider"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Step-by-Step Live Formula Derivation */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <p className="text-xs font-semibold text-slate-500">Langkah Perhitungan Rumus</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 font-mono-math text-sm">
                <p className="text-slate-500 text-xs">{geometry.formulaExpanded}</p>
                <p className="text-slate-900 font-semibold">{geometry.formulaSymbolic}</p>
                <p className="text-slate-700">{geometry.formulaSubstitution}</p>
                <p className="text-lg font-bold text-[#0284C7] pt-1 border-t border-slate-200">
                  K = {geometry.formulaResult}
                </p>
              </div>
            </div>
          </div>

          {/* Mini Practice Check Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold text-slate-900">
                Uji Cepat {lesson.title}
              </h2>
              <span className="text-xs font-mono-math font-medium text-slate-500">
                {miniChallengeDone ? 'Selesai (+15 Poin)' : '+15 Poin'}
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {lesson.miniChallenge.question}
            </p>

            <form onSubmit={handleMiniChallengeSubmit} className="flex items-center gap-2">
              <label htmlFor="mini-challenge-input" className="sr-only">
                Jawaban uji cepat dalam satuan {lesson.miniChallenge.unit}
              </label>
              <div className="relative flex-1">
                <input
                  id="mini-challenge-input"
                  type="number"
                  inputMode="numeric"
                  value={challengeInput}
                  onChange={(e) => {
                    setChallengeInput(e.target.value);
                    if (challengeFeedback !== 'idle') setChallengeFeedback('idle');
                  }}
                  placeholder="Tulis angka..."
                  className="w-full px-3 py-2 pr-10 text-sm font-mono-math bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-math text-slate-400">
                  {lesson.miniChallenge.unit}
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
              >
                Periksa
              </button>
            </form>

            {challengeFeedback === 'correct' && (
              <div
                role="status"
                className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Benar! Kelilingnya adalah {lesson.miniChallenge.answer}{' '}
                  {lesson.miniChallenge.unit}. Poin latihan berhasil dicatat.
                </span>
              </div>
            )}

            {challengeFeedback === 'wrong' && (
              <div
                role="status"
                className="flex items-start gap-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>Belum tepat. Petunjuk: {lesson.miniChallenge.hint}</span>
              </div>
            )}
          </div>

          {/* Ready for Assessment CTA */}
          {activeStudent.exploredShapes.length === 3 && (
            <button
              type="button"
              onClick={onGoToAssessment}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer"
            >
              Semua Bangun Dieksplorasi — Lanjut ke Asesmen
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
