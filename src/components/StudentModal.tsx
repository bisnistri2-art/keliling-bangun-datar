import { Check, Plus, User, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AVATAR_COLORS, CLASS_OPTIONS } from '../data/curriculum';
import type { StudentProfile } from '../types/mpi';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  activeStudentId: string;
  onSelectStudent: (id: string) => void;
  onAddStudent: (name: string, kelas: string, avatarColor: string) => void;
}

export function StudentModal({
  isOpen,
  onClose,
  students,
  activeStudentId,
  onSelectStudent,
  onAddStudent,
}: StudentModalProps) {
  const [name, setName] = useState('');
  const [kelas, setKelas] = useState(CLASS_OPTIONS[0]);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].hex);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Masukkan nama lengkap peserta didik minimal 2 huruf.');
      return;
    }
    const duplicate = students.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.kelas === kelas
    );
    if (duplicate) {
      setError('Peserta didik dengan nama dan kelas tersebut sudah terdaftar.');
      return;
    }

    setError(null);
    onAddStudent(trimmed, kelas, avatarColor);
    setName('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 id="student-modal-title" className="font-display text-lg font-semibold text-slate-900">
              Profil Peserta Didik
            </h2>
            <p className="text-sm text-slate-500">
              Pilih siswa yang sedang belajar atau daftarkan peserta didik baru.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog profil siswa"
            className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Existing students list */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Daftar Peserta Didik Terdaftar ({students.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {students.map((student) => {
                const isSelected = student.id === activeStudentId;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      onSelectStudent(student.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-[#0284C7] bg-sky-50/70'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        style={{ backgroundColor: student.avatarColor }}
                        aria-hidden="true"
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-slate-500 font-mono-math">
                          {student.kelas} · Skor {student.bestScore}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0284C7] shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Register new student form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-900">
                Tambah Peserta Didik Baru
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="new-student-name"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Nama Lengkap
                </label>
                <input
                  id="new-student-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Contoh: Nadia Kusuma"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="new-student-class"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Kelas
                </label>
                <select
                  id="new-student-class"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20"
                >
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">
                Warna Profil
              </span>
              <div className="flex items-center gap-2.5">
                {AVATAR_COLORS.map((color) => {
                  const selected = avatarColor === color.hex;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setAvatarColor(color.hex)}
                      aria-label={`Pilih warna ${color.label}`}
                      aria-pressed={selected}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform cursor-pointer ${
                        selected ? 'ring-2 ring-offset-2 ring-slate-900 scale-105' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selected && <Check className="w-4 h-4 text-white" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#0284C7] rounded-lg hover:bg-[#0369A1] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Simpan Siswa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
