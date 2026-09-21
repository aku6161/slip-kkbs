import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Layers, 
  GraduationCap,
  UserCheck,
  FileCheck,
  Check
} from 'lucide-react';
import { Student, SystemConfig, Lecturer, formatProgramName } from '../types';
import { BorangFLI01Modal } from './evaluations/BorangFLI01Modal';
import { BorangFLI02Modal } from './evaluations/BorangFLI02Modal';
import { BorangFLI03Modal } from './evaluations/BorangFLI03Modal';
import { BorangFLI04Modal } from './evaluations/BorangFLI04Modal';

interface PenilaianPelajarProps {
  students: Student[];
  markah: any[];
  lecturers: Lecturer[];
  config: SystemConfig;
  onSaveMark: (noMatrik: string, markData: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
  onAssignLecturers: (
    studentIdOrMatrik: string,
    assignments: {
      idPemantau1?: string;
      namaPemantau1?: string;
      idPemantau2?: string;
      namaPemantau2?: string;
    }
  ) => Promise<{ success: boolean; message?: string }>;
}

export const PenilaianPelajar: React.FC<PenilaianPelajarProps> = ({
  students,
  markah,
  lecturers,
  config,
  onSaveMark,
  onAssignLecturers
}) => {
  // 1. Filter States
  const [selectedSesi, setSelectedSesi] = useState<string>('SEMUA');
  const [selectedProgram, setSelectedProgram] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedFeedback, setSavedFeedback] = useState<{ [key: string]: boolean }>({});

  // 2. Active Modals State
  const [activeModal, setActiveModal] = useState<{
    type: 'fli01' | 'fli02' | 'fli03' | 'fli04' | null;
    student: Student | any;
    markData: any;
  } | null>(null);

  // Available sessions extracted from data + config
  const availableSesi = useMemo(() => {
    const set = new Set<string>();
    if (config?.sesi) set.add(config.sesi.toUpperCase().trim());
    students.forEach(s => {
      if (s.sesi) set.add(s.sesi.toUpperCase().trim());
    });
    markah.forEach(m => {
      const s = m.SESI || m.sesi || m['SESI '];
      if (s) set.add(s.toUpperCase().trim());
    });
    return Array.from(set);
  }, [config, students, markah]);

  // Available programs
  const availablePrograms = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.program) set.add(formatProgramName(s.program));
    });
    return Array.from(set).sort();
  }, [students]);

  // Helper to find markah row for a given student
  const getMarkDataForStudent = (student: Student) => {
    const cleanMatrik = (student.noMatrik || student.id || '').toLowerCase().replace(/\s+/g, '');
    const cleanIc = (student.noIc || '').toLowerCase().replace(/\D/g, '');

    const found = markah.find(m => {
      const mMatrik = String(m['No. Pendaftaran'] || m['NO. MATRIK'] || m['NO MATRIK'] || m['NO PENDAFTARAN'] || m.noMatrik || '')
        .toLowerCase()
        .replace(/\s+/g, '');
      const mIc = String(m['NO KAD PENGENALAN'] || m['NO. K/P'] || m['NO. KAD PENGENALAN'] || m.noIc || '')
        .toLowerCase()
        .replace(/\D/g, '');

      return (cleanMatrik && mMatrik === cleanMatrik) || (cleanIc && mIc === cleanIc);
    });

    return found || {};
  };

  // Helper functions to check completion status
  const isFli01Completed = (m: any): { completed: boolean; score: number } => {
    if (!m) return { completed: false, score: 0 };
    const hasScores = (m['FLI01-A1'] !== undefined && m['FLI01-A1'] !== '') || 
                      (m.TOTAL1 !== undefined && m.TOTAL1 !== '') ||
                      (m['GRAND TOTAL1'] !== undefined && m['GRAND TOTAL1'] !== '');
    
    const score = parseFloat(m['GRAND TOTAL1'] || m.total_fli01 || '0') || 0;
    return { completed: hasScores && score > 0, score };
  };

  const isFli02Completed = (m: any): { completed: boolean; score: number } => {
    if (!m) return { completed: false, score: 0 };
    const hasScores = (m['FLI02-C1'] !== undefined && m['FLI02-C1'] !== '') || 
                      (m.TOTAL7 !== undefined && m.TOTAL7 !== '') ||
                      (m['GRAN TOTAL2'] !== undefined && m['GRAN TOTAL2'] !== '');
    
    const score = parseFloat(m['GRAN TOTAL2'] || m.total_fli02 || '0') || 0;
    return { completed: hasScores && score > 0, score };
  };

  const isFli03Completed = (m: any): { completed: boolean; score: number } => {
    if (!m) return { completed: false, score: 0 };
    const hasScores = (m['FLI03-D1'] !== undefined && m['FLI03-D1'] !== '') || 
                      (m.TOTAL10 !== undefined && m.TOTAL10 !== '') ||
                      (m['GRAND TOTAL3'] !== undefined && m['GRAND TOTAL3'] !== '');
    
    const score = parseFloat(m['GRAND TOTAL3'] || m.total_fli03 || '0') || 0;
    return { completed: hasScores && score > 0, score };
  };

  const isFli04Completed = (m: any): { completed: boolean; total: number } => {
    const f1 = isFli01Completed(m);
    const f2 = isFli02Completed(m);
    const f3 = isFli03Completed(m);
    const total = Number((f1.score + f2.score + f3.score).toFixed(2));
    return { completed: f1.completed && f2.completed && f3.completed, total };
  };

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // 1. Sesi Filter
      if (selectedSesi !== 'SEMUA') {
        const studentSesi = (student.sesi || config?.sesi || '').toUpperCase().trim();
        if (studentSesi !== selectedSesi) return false;
      }

      // 2. Program Filter
      if (selectedProgram !== 'SEMUA') {
        if (formatProgramName(student.program) !== selectedProgram) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nama = (student.namaPelajar || '').toLowerCase();
        const matrik = (student.noMatrik || '').toLowerCase();
        const ic = (student.noIc || '').toLowerCase();
        const kelas = (student.kelas || '').toLowerCase();
        const syarikat = (student.namaSyarikat || '').toLowerCase();

        return (
          nama.includes(q) ||
          matrik.includes(q) ||
          ic.includes(q) ||
          kelas.includes(q) ||
          syarikat.includes(q)
        );
      }

      return true;
    });
  }, [students, selectedSesi, selectedProgram, searchQuery, config]);

  // Overall Statistics
  const stats = useMemo(() => {
    let completeCount = 0;
    let partialCount = 0;
    let notStartedCount = 0;

    filteredStudents.forEach(s => {
      const m = getMarkDataForStudent(s);
      const f1 = isFli01Completed(m);
      const f2 = isFli02Completed(m);
      const f3 = isFli03Completed(m);

      if (f1.completed && f2.completed && f3.completed) {
        completeCount++;
      } else if (f1.completed || f2.completed || f3.completed) {
        partialCount++;
      } else {
        notStartedCount++;
      }
    });

    return {
      total: filteredStudents.length,
      complete: completeCount,
      partial: partialCount,
      notStarted: notStartedCount
    };
  }, [filteredStudents, markah]);

  // Handle setting FLI 02 lecturer
  const handleAssignFli02 = async (student: Student, staffId: string) => {
    const selectedLec = lecturers.find(l => l.staffId === staffId);
    const key = `${student.noMatrik || student.id}_fli02`;
    
    await onAssignLecturers(student.id || student.noMatrik, {
      idPemantau1: staffId,
      namaPemantau1: selectedLec ? selectedLec.nama : ''
    });

    setSavedFeedback(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedFeedback(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Handle setting FLI 03 lecturer
  const handleAssignFli03 = async (student: Student, staffId: string) => {
    const selectedLec = lecturers.find(l => l.staffId === staffId);
    const key = `${student.noMatrik || student.id}_fli03`;
    
    await onAssignLecturers(student.id || student.noMatrik, {
      idPemantau2: staffId,
      namaPemantau2: selectedLec ? selectedLec.nama : ''
    });

    setSavedFeedback(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedFeedback(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-blue-400" />
            Pengurusan &amp; Pemantauan Penilaian Pelajar
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
            PENILAIAN PELAJAR
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Pantau dan masukkan markah Penilaian Industri (60%), Pemantauan Temubual (20%), Laporan Akhir (20%) dan Rumusan Keseluruhan (100%).
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah Pelajar</p>
            <h3 className="text-2xl font-black text-slate-950 mt-0.5">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selesai Sepenuhnya</p>
            <h3 className="text-2xl font-black text-emerald-800 mt-0.5">{stats.complete}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sedang Dinilai</p>
            <h3 className="text-2xl font-black text-amber-700 mt-0.5">{stats.partial}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum Dinilai</p>
            <h3 className="text-2xl font-black text-rose-700 mt-0.5">{stats.notStarted}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 1. Filter Sesi Dropdown */}
          <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-900 shrink-0" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Sesi:</span>
            </div>
            <select
              value={selectedSesi}
              onChange={(e) => setSelectedSesi(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none cursor-pointer"
            >
              <option value="SEMUA">Semua Sesi</option>
              {availableSesi.map(sesi => (
                <option key={sesi} value={sesi}>{sesi}</option>
              ))}
            </select>

            {/* 2. Filter Program */}
            <div className="flex items-center gap-2 ml-0 sm:ml-2">
              <Layers className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Program:</span>
            </div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none cursor-pointer max-w-[200px]"
            >
              <option value="SEMUA">Semua Program</option>
              {availablePrograms.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          {/* 3. Search Bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, no matrik, kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Student Evaluations List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-150 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-900" />
            Senarai Penilaian Pelajar
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">
            Klik pada kad penilaian untuk mengisi markah | Tetapkan Penilai FLI 02 &amp; FLI 03
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-sm">Tiada rekod pelajar ditemui bagi tapisan ini.</p>
            <p className="text-xs">Cuba tukar pilihan sesi atau carian kata kunci.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-150">
            {filteredStudents.map((student) => {
              const markData = getMarkDataForStudent(student);
              const fli01 = isFli01Completed(markData);
              const fli02 = isFli02Completed(markData);
              const fli03 = isFli03Completed(markData);
              const fli04 = isFli04Completed(markData);

              const currentFli02StaffId = student.idPemantau1 || markData['ID PEMANTAU 1'] || markData['STAFF ID PEMANTAU 1'] || markData['STAFF ID'] || markData['ID STAF'] || '';
              const currentFli03StaffId = student.idPemantau2 || markData['ID PEMANTAU 2'] || markData['STAFF ID PEMANTAU 2'] || '';

              const isFli02Saved = savedFeedback[`${student.noMatrik || student.id}_fli02`];
              const isFli03Saved = savedFeedback[`${student.noMatrik || student.id}_fli03`];

              return (
                <div
                  key={student.id || student.noMatrik}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Student Name & Assign Pensyarah Penilai */}
                  <div className="space-y-2.5 flex-1">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide">
                      {student.namaPelajar || student['NAMA PELAJAR']}
                    </h4>

                    {/* Evaluator Assignment Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                      {/* Penilai FLI 02 (Pemantauan) */}
                      <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/80 rounded-xl px-2.5 py-1 text-slate-700 shadow-xs">
                        <UserCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="text-[10px] font-bold text-blue-900 uppercase tracking-tight shrink-0">
                          Penilai FLI 02:
                        </span>
                        <select
                          value={currentFli02StaffId}
                          onChange={(e) => handleAssignFli02(student, e.target.value)}
                          className="bg-transparent text-[11px] font-bold text-slate-900 outline-none cursor-pointer max-w-[180px] sm:max-w-[210px] truncate"
                        >
                          <option value="">-- Pilih Penilai FLI 02 --</option>
                          {lecturers.map(lec => (
                            <option key={`fli02_${lec.id || lec.staffId}`} value={lec.staffId}>
                              {lec.staffId} - {lec.nama}
                            </option>
                          ))}
                        </select>
                        {isFli02Saved && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 animate-in fade-in">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Penilai FLI 03 (Laporan Akhir) */}
                      <div className="flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-2.5 py-1 text-slate-700 shadow-xs">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                        <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-tight shrink-0">
                          Penilai FLI 03:
                        </span>
                        <select
                          value={currentFli03StaffId}
                          onChange={(e) => handleAssignFli03(student, e.target.value)}
                          className="bg-transparent text-[11px] font-bold text-slate-900 outline-none cursor-pointer max-w-[180px] sm:max-w-[210px] truncate"
                        >
                          <option value="">-- Pilih Penilai FLI 03 --</option>
                          {lecturers.map(lec => (
                            <option key={`fli03_${lec.id || lec.staffId}`} value={lec.staffId}>
                              {lec.staffId} - {lec.nama}
                            </option>
                          ))}
                        </select>
                        {isFli03Saved && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 animate-in fade-in">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: 4 Interactive Evaluation Cards (Clean: Name Only + Red/Green status) */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    {/* Kad FLI 01 */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'fli01', student, markData })}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs border ${
                        fli01.completed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-600/20'
                          : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-rose-600/20'
                      }`}
                    >
                      FLI 01
                    </button>

                    {/* Kad FLI 02 */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'fli02', student, markData })}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs border ${
                        fli02.completed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-600/20'
                          : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-rose-600/20'
                      }`}
                    >
                      FLI 02
                    </button>

                    {/* Kad FLI 03 */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'fli03', student, markData })}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs border ${
                        fli03.completed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-600/20'
                          : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-rose-600/20'
                      }`}
                    >
                      FLI 03
                    </button>

                    {/* Kad FLI 04 */}
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: 'fli04', student, markData })}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs border ${
                        fli04.completed
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-600/20'
                          : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-rose-600/20'
                      }`}
                    >
                      FLI 04
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: FLI 01 */}
      {activeModal && activeModal.type === 'fli01' && (
        <BorangFLI01Modal
          student={activeModal.student}
          markData={activeModal.markData}
          onClose={() => setActiveModal(null)}
          onSave={onSaveMark}
        />
      )}

      {/* Modal 2: FLI 02 */}
      {activeModal && activeModal.type === 'fli02' && (
        <BorangFLI02Modal
          student={activeModal.student}
          markData={activeModal.markData}
          onClose={() => setActiveModal(null)}
          onSave={onSaveMark}
        />
      )}

      {/* Modal 3: FLI 03 */}
      {activeModal && activeModal.type === 'fli03' && (
        <BorangFLI03Modal
          student={activeModal.student}
          markData={activeModal.markData}
          onClose={() => setActiveModal(null)}
          onSave={onSaveMark}
          config={config}
        />
      )}

      {/* Modal 4: FLI 04 */}
      {activeModal && activeModal.type === 'fli04' && (
        <BorangFLI04Modal
          student={activeModal.student}
          markData={activeModal.markData}
          onClose={() => setActiveModal(null)}
          config={config}
        />
      )}
    </div>
  );
};
