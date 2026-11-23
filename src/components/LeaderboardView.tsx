import {
  Award,
  Download,
  FileCheck2,
  Search,
  Star,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { BADGE_DEFINITIONS, CLASS_OPTIONS, REWARD_TIERS } from '../data/curriculum';
import type { StudentProfile } from '../types/mpi';
import { generateGradebookCsv, sortLeaderboard } from '../utils/scoring';

interface LeaderboardViewProps {
  students: StudentProfile[];
  activeStudentId: string;
  onSelectStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onOpenAddStudentModal: () => void;
  onOpenCertificate: (student: StudentProfile) => void;
}

export function LeaderboardView({
  students,
  activeStudentId,
  onSelectStudent,
  onDeleteStudent,
  onOpenAddStudentModal,
  onOpenCertificate,
}: LeaderboardViewProps) {
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const rankedAll = useMemo(() => sortLeaderboard(students), [students]);

  const filteredStudents = useMemo(() => {
    return rankedAll.filter((student) => {
      const matchesClass = selectedClass === 'Semua' || student.kelas === selectedClass;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.kelas.toLowerCase().includes(q);
      return matchesClass && matchesQuery;
    });
  }, [rankedAll, selectedClass, searchQuery]);

  const classAverage = useMemo(() => {
    const withAttempts = students.filter((s) => s.attempts.length > 0);
    if (withAttempts.length === 0) return 0;
    const sum = withAttempts.reduce((acc, s) => acc + s.bestScore, 0);
    return Math.round(sum / withAttempts.length);
  }, [students]);

  const goldCount = useMemo(
    () => students.filter((s) => s.highestReward === 'emas').length,
    [students]
  );

  const handleExportCsv = () => {
    const csvContent = generateGradebookCsv(filteredStudents);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rekap-nilai-kelilinglab.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs text-slate-500">
            Rekap Nilai &amp; Penghargaan Kelas · Data tersimpan otomatis di perangkat
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Papan Skor &amp; Reward Peserta Didik
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            Unduh Rekap CSV
          </button>
          <button
            type="button"
            onClick={onOpenAddStudentModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] transition-colors whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Tambah Peserta Didik
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Peserta Didik</p>
          <p className="font-mono-math text-2xl font-bold text-slate-900 mt-1">{students.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Rata-rata Skor Asesmen</p>
          <p className="font-mono-math text-2xl font-bold text-[#0284C7] mt-1">
            {classAverage}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Peraih Medali Emas</p>
          <p className="font-mono-math text-2xl font-bold text-amber-600 mt-1">{goldCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Total Lencana Kelas</p>
          <p className="font-mono-math text-2xl font-bold text-emerald-700 mt-1">
            {students.reduce((sum, s) => sum + s.badges.length, 0)}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {['Semua', ...CLASS_OPTIONS].map((cls) => {
            const active = selectedClass === cls;
            return (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cls}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <label htmlFor="search-student" className="sr-only">
            Cari nama peserta didik
          </label>
          <input
            id="search-student"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa..."
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
          />
        </div>
      </div>

      {/* Ranked Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-semibold text-slate-600">
                <th className="py-3.5 px-4 w-16">Rank</th>
                <th className="py-3.5 px-4">Peserta Didik</th>
                <th className="py-3.5 px-4">Eksplorasi</th>
                <th className="py-3.5 px-4">Skor Terbaik</th>
                <th className="py-3.5 px-4">Total Poin</th>
                <th className="py-3.5 px-4">Reward &amp; Bintang</th>
                <th className="py-3.5 px-4">Lencana</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Tidak ada peserta didik yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const reward = REWARD_TIERS[student.highestReward];
                  const isActive = student.id === activeStudentId;
                  return (
                    <tr
                      key={student.id}
                      className={isActive ? 'bg-sky-50/45' : 'hover:bg-slate-50/70'}
                    >
                      <td className="py-3.5 px-4 font-mono-math font-semibold text-slate-700">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-xs shrink-0"
                            style={{ backgroundColor: student.avatarColor }}
                            aria-hidden="true"
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {student.name}{' '}
                              {isActive && (
                                <span className="text-xs font-normal text-[#0284C7]">
                                  (Aktif)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.kelas} · {student.attempts.length} percobaan
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-math text-slate-700">
                        {student.exploredShapes.length}/3 bangun
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono-math font-bold text-slate-900">
                          {student.bestScore}
                        </span>
                        <span className="font-mono-math text-xs text-slate-400">/100</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-math font-semibold text-[#0284C7]">
                        {student.totalPoints}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-900">{reward.name}</p>
                          <div
                            className="flex items-center gap-0.5"
                            aria-label={`${reward.stars} bintang`}
                          >
                            {[1, 2, 3].map((sIdx) => (
                              <Star
                                key={sIdx}
                                className={`w-3.5 h-3.5 ${
                                  sIdx <= reward.stars
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-200'
                                }`}
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-math text-xs text-slate-700">
                        {student.badges.length} / {BADGE_DEFINITIONS.length}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenCertificate(student)}
                            aria-label={`Lihat rapor dan sertifikat ${student.name}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-md hover:bg-slate-50 whitespace-nowrap cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
                            Rapor
                          </button>

                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => onSelectStudent(student.id)}
                              aria-label={`Aktifkan peserta didik ${student.name}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#0284C7] hover:bg-sky-50 rounded-md whitespace-nowrap cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                              Pilih
                            </button>
                          )}

                          {students.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteStudent(student.id)}
                              aria-label={`Hapus peserta didik ${student.name}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badge Guide Catalog */}
      <section className="space-y-4 pt-2">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Katalog Lencana Prestasi Peserta Didik
          </h2>
          <p className="text-sm text-slate-600">
            Lencana otomatis terbuka saat peserta didik memenuhi syarat capaian berikut.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const earners = students.filter((s) => s.badges.includes(badge.id)).length;
            return (
              <div
                key={badge.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center shrink-0">
                  <Award
                    className="w-5 h-5"
                    style={{ color: badge.accentColor }}
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm font-bold text-slate-900 truncate">
                      {badge.name}
                    </h3>
                    <span className="font-mono-math text-xs text-slate-500 shrink-0">
                      {earners} siswa
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>
                  <p className="text-[11px] text-slate-500">{badge.criterion}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
