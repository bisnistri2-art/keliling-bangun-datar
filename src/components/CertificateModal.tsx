import { Award, Printer, Star, X } from 'lucide-react';
import { useState } from 'react';
import { BADGE_DEFINITIONS, REWARD_TIERS } from '../data/curriculum';
import type { StudentProfile } from '../types/mpi';

interface CertificateModalProps {
  student: StudentProfile | null;
  onClose: () => void;
}

export function CertificateModal({ student, onClose }: CertificateModalProps) {
  const [imgError, setImgError] = useState(false);

  if (!student) return null;

  const reward = REWARD_TIERS[student.highestReward];
  const latestAttempt = student.attempts[0] ?? null;
  const unlockedBadges = BADGE_DEFINITIONS.filter((b) => student.badges.includes(b.id));
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(latestAttempt?.completedAt ?? student.createdAt));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 no-print">
          <div>
            <h2 id="certificate-modal-title" className="font-display text-lg font-semibold text-slate-900">
              Rapor & Sertifikat Penghargaan
            </h2>
            <p className="text-xs text-slate-500">
              {student.name} · {student.kelas}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Cetak Sertifikat
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup rapor dan sertifikat"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-6 overflow-y-auto">
          <div className="certificate-print-area bg-[#F8FAFC] border-2 border-slate-900 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200 pb-6">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-500">
                  Sertifikat Capaian Belajar · KelilingLab MPI
                </p>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  {student.name}
                </h3>
                <p className="text-sm text-slate-600">
                  {student.kelas} · Tanggal Capaian: {formattedDate}
                </p>
                <div className="flex items-center gap-1 pt-2" aria-label={`Peringkat ${reward.stars} dari 3 bintang`}>
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-5 h-5 ${
                        starIdx <= reward.stars
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-800">
                    {reward.name}
                  </span>
                </div>
              </div>

              {/* Medal artwork */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                {!imgError ? (
                  <img
                    src={reward.imagePath}
                    alt={reward.name}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Award className="w-10 h-10 text-amber-600" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* Key Quantitative Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                <p className="text-xs text-slate-500">Skor Terbaik</p>
                <p className="font-mono-math text-2xl font-semibold text-slate-900 mt-1">
                  {student.bestScore}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                <p className="text-xs text-slate-500">Predikat</p>
                <p className="text-sm font-semibold text-slate-900 mt-1.5 leading-snug">
                  {reward.predikat}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                <p className="text-xs text-slate-500">Total Poin</p>
                <p className="font-mono-math text-2xl font-semibold text-[#0284C7] mt-1">
                  {student.totalPoints}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg p-3.5">
                <p className="text-xs text-slate-500">Eksplorasi</p>
                <p className="font-mono-math text-2xl font-semibold text-emerald-700 mt-1">
                  {student.exploredShapes.length}/3
                </p>
              </div>
            </div>

            {/* Per-shape mastery breakdown from latest attempt */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">
                Penguasaan Materi per Bangun Datar
              </h4>
              {latestAttempt ? (
                <div className="space-y-3 bg-white border border-slate-200 rounded-xl p-4">
                  {(
                    [
                      { key: 'persegi', label: 'Keliling Persegi', color: '#0284C7' },
                      {
                        key: 'persegi-panjang',
                        label: 'Keliling Persegi Panjang',
                        color: '#059669',
                      },
                      { key: 'segitiga', label: 'Keliling Segitiga', color: '#D97706' },
                    ] as const
                  ).map((item) => {
                    const m = latestAttempt.masteryByShape[item.key];
                    return (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.label}</span>
                          <span className="font-mono-math text-slate-900 font-semibold">
                            {m.correct}/{m.total} benar ({m.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${m.percentage}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-white border border-slate-200 rounded-xl p-4">
                  Peserta didik ini belum menyelesaikan asesmen. Arahkan ke menu Asesmen untuk
                  memperoleh nilai dan analisis penguasaan materi.
                </p>
              )}
            </div>

            {/* Earned Badges */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2.5">
                Lencana Prestasi Diperoleh ({unlockedBadges.length}/{BADGE_DEFINITIONS.length})
              </h4>
              {unlockedBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {unlockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-lg p-3"
                    >
                      <Award
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: badge.accentColor }}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                        <p className="text-xs text-slate-500">{badge.criterion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Belum ada lencana yang terbuka. Selesaikan eksplorasi 3 bangun datar dan asesmen
                  untuk membuka lencana prestasi.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Media Pembelajaran Interaktif — Matematika Keliling Bangun Datar</span>
              <span>{reward.message}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
