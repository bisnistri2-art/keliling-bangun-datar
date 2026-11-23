import { ArrowRight, CheckCircle2, Compass, Ruler, Trophy, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { HERO_IMAGE_PATH, REWARD_TIERS, SHAPE_LESSONS } from '../data/curriculum';
import type { AppView, ShapeType, StudentProfile } from '../types/mpi';

interface HomeViewProps {
  activeStudent: StudentProfile;
  totalStudents: number;
  onStartExploration: (shape?: ShapeType) => void;
  onNavigate: (view: AppView) => void;
  onOpenStudentModal: () => void;
}

export function HomeView({
  activeStudent,
  totalStudents,
  onStartExploration,
  onNavigate,
  onOpenStudentModal,
}: HomeViewProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const reward = REWARD_TIERS[activeStudent.highestReward];
  const shapesOrder: ShapeType[] = ['persegi', 'persegi-panjang', 'segitiga'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-14">
      {/* 2-Column Editorial Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-slate-500">
              Matematika Fase B &amp; C · Persegi, Persegi Panjang, &amp; Segitiga · 10 Soal Asesmen
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.12] [text-wrap:balance]">
              Pahami Keliling Bangun Datar Lewat Simulasi Visual Interaktif
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              Ubah panjang sisi secara langsung, amati bentangan pita keliling langkah demi
              langkah, selesaikan asesmen terukur, dan kumpulkan medali serta lencana prestasi
              untuk setiap peserta didik.
            </p>
          </div>

          {/* Active Student Identity Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-display font-bold text-lg shrink-0"
                style={{ backgroundColor: activeStudent.avatarColor }}
                aria-hidden="true"
              >
                {activeStudent.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Peserta Didik Aktif</p>
                <p className="font-semibold text-slate-900 truncate">{activeStudent.name}</p>
                <p className="text-xs text-slate-600 font-mono-math">
                  {activeStudent.kelas} · {activeStudent.exploredShapes.length}/3 Eksplorasi · Skor{' '}
                  {activeStudent.bestScore}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenStudentModal}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              Ganti / Tambah Siswa
            </button>
          </div>

          {/* Primary & Secondary Action */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onStartExploration('persegi')}
              className="inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0284C7]"
            >
              Mulai Eksplorasi
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('asesmen')}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Ikuti Asesmen
            </button>
          </div>
        </div>

        {/* Right Hero Artwork Container (stretched to match left column) */}
        <div className="lg:col-span-6">
          <div className="h-full min-h-[280px] rounded-2xl border border-slate-200 bg-white overflow-hidden relative">
            {!heroImgFailed ? (
              <img
                src={HERO_IMAGE_PATH}
                alt="Alat ukur geometri persegi, penggaris skala, dan segitiga kayu di atas kertas berpetak"
                referrerPolicy="no-referrer"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full blueprint-grid flex flex-col items-center justify-center p-8 text-center">
                <Compass className="w-12 h-12 text-[#0284C7] mb-3" aria-hidden="true" />
                <p className="font-display font-semibold text-slate-900">
                  Laboratorium Geometri KelilingLab
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-width 4-column Progress Strip below Hero */}
      <section
        aria-label="Ringkasan capaian belajar"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y border-slate-200 py-6"
      >
        <div>
          <p className="text-xs text-slate-500">Materi Terjelajahi</p>
          <p className="font-mono-math text-2xl font-semibold text-slate-900 mt-1">
            {activeStudent.exploredShapes.length} / 3
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Bangun datar utama</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Skor Asesmen Terbaik</p>
          <p className="font-mono-math text-2xl font-semibold text-[#0284C7] mt-1">
            {activeStudent.bestScore}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{reward.predikat}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Reward &amp; Lencana</p>
          <p className="font-mono-math text-2xl font-semibold text-amber-600 mt-1">
            {activeStudent.badges.length}
            <span className="text-sm font-normal text-slate-400"> / 6</span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{reward.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Peserta Didik Kelas</p>
          <p className="font-mono-math text-2xl font-semibold text-emerald-700 mt-1">
            {totalStudents}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('papan-skor')}
            className="text-xs font-medium text-[#0284C7] hover:underline mt-0.5 cursor-pointer"
          >
            Lihat papan skor kelas
          </button>
        </div>
      </section>

      {/* 3-Column Learning Modules */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Materi Keliling Bangun Datar
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Pilih bangun datar untuk membuka simulasi ukuran sisi, animasi keliling, dan latihan
              cepat.
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Keliling adalah jumlah panjang seluruh sisi pembatas bangun datar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shapesOrder.map((shapeId) => {
            const lesson = SHAPE_LESSONS[shapeId];
            const explored = activeStudent.exploredShapes.includes(shapeId);
            const challengeDone = activeStudent.completedMiniChallenges.includes(shapeId);

            return (
              <div
                key={shapeId}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between gap-6 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-mono-math font-semibold text-slate-800">
                      {lesson.number}. {lesson.title}
                    </span>
                    {explored ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Dieksplorasi
                      </span>
                    ) : (
                      <span>Belum dibuka</span>
                    )}
                  </div>

                  {/* Clean geometric schematic icon */}
                  <div className="h-24 rounded-lg blueprint-grid border border-slate-100 flex items-center justify-center">
                    {shapeId === 'persegi' && (
                      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
                        <rect
                          x="14"
                          y="14"
                          width="44"
                          height="44"
                          fill="rgba(2, 132, 199, 0.1)"
                          stroke="#0284C7"
                          strokeWidth="2.5"
                        />
                        <text x="36" y="10" textAnchor="middle" fontSize="10" fill="#0F172A" className="font-mono-math">
                          s
                        </text>
                      </svg>
                    )}
                    {shapeId === 'persegi-panjang' && (
                      <svg width="108" height="72" viewBox="0 0 108 72" aria-hidden="true">
                        <rect
                          x="14"
                          y="18"
                          width="80"
                          height="36"
                          fill="rgba(5, 150, 105, 0.1)"
                          stroke="#059669"
                          strokeWidth="2.5"
                        />
                        <text x="54" y="13" textAnchor="middle" fontSize="10" fill="#0F172A" className="font-mono-math">
                          p
                        </text>
                        <text x="101" y="39" textAnchor="middle" fontSize="10" fill="#0F172A" className="font-mono-math">
                          l
                        </text>
                      </svg>
                    )}
                    {shapeId === 'segitiga' && (
                      <svg width="96" height="72" viewBox="0 0 96 72" aria-hidden="true">
                        <polygon
                          points="18,56 78,56 48,14"
                          fill="rgba(217, 119, 6, 0.1)"
                          stroke="#D97706"
                          strokeWidth="2.5"
                        />
                        <text x="48" y="67" textAnchor="middle" fontSize="10" fill="#0F172A" className="font-mono-math">
                          a
                        </text>
                        <text x="72" y="34" textAnchor="middle" fontSize="10" fill="#0F172A" className="font-mono-math">
                          b
                        </text>
                        <text x="24" y="34" textAnchor="middle" fontSize="10" fill="#0F172A" className="font-mono-math">
                          c
                        </text>
                      </svg>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display text-xl font-bold text-slate-900">
                      Keliling {lesson.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{lesson.shortDesc}</p>
                    <p className="font-mono-math text-sm font-semibold text-slate-900 pt-1">
                      Rumus: {lesson.formula}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {challengeDone ? 'Latihan cepat selesai' : '+15 Poin latihan'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStartExploration(shapeId)}
                    aria-label={`Buka simulasi keliling ${lesson.title}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0284C7] hover:text-[#0369A1] cursor-pointer whitespace-nowrap"
                  >
                    Buka Simulasi
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curriculum Objectives & Reward System Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#0284C7]" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tujuan Pembelajaran
            </h2>
          </div>
          <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside leading-relaxed">
            <li>
              Menjelaskan konsep keliling bangun datar sebagai jumlah panjang seluruh sisi yang
              mengelilinginya.
            </li>
            <li>
              Menentukan keliling persegi, persegi panjang, dan berbagai jenis segitiga (sama sisi,
              sama kaki, siku-siku, sembarang) secara akurat.
            </li>
            <li>
              Menyelesaikan masalah kontekstual sehari-hari dan penalaran balik mencari sisi yang
              belum diketahui dari kelilingnya.
            </li>
          </ol>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Sistem Skor &amp; Reward Peserta Didik
            </h2>
          </div>
          <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
            <p>
              Setiap peserta didik memiliki catatan progres tersendiri yang otomatis tersimpan:
            </p>
            <ul className="space-y-2">
              <li className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-900">Medali Emas (3 Bintang)</span>
                <span className="font-mono-math text-xs text-slate-600">Skor 90 – 100</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-900">Medali Perak (2 Bintang)</span>
                <span className="font-mono-math text-xs text-slate-600">Skor 75 – 89</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2">
                <span className="font-medium text-slate-900">Medali Perunggu (2 Bintang)</span>
                <span className="font-mono-math text-xs text-slate-600">Skor 60 – 74</span>
              </li>
              <li className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-slate-900">6 Lencana Prestasi &amp; Sertifikat</span>
                <span className="font-mono-math text-xs text-slate-600">Dapat dicetak</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
