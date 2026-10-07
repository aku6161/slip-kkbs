import React, { useState, useMemo, useCallback } from 'react';
import { 
  LogOut, 
  GraduationCap, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Search, 
  AlertCircle, 
  Edit, 
  Printer, 
  Award, 
  FileText, 
  User, 
  BookOpen, 
  SlidersHorizontal 
} from 'lucide-react';
import { Student, SystemConfig, Lecturer } from '../types';
import { renderBorangFLI02Html } from './documents/BorangFLI02Html';
import { renderBorangFLI03Html } from './documents/BorangFLI03Html';
import { BorangFLI02Modal } from './evaluations/BorangFLI02Modal';
import { BorangFLI03Modal } from './evaluations/BorangFLI03Modal';

interface LecturerPortalProps {
  staffId: string;
  students: Student[];
  markah: any[];
  markahHeaders: string[];
  onSaveMark: (noMatrik: string, dataToSave: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
  onLogout: () => void;
  config: SystemConfig;
  lecturers?: Lecturer[];
}

export const LecturerPortal: React.FC<LecturerPortalProps> = ({
  staffId,
  students,
  markah,
  markahHeaders,
  onSaveMark,
  onLogout,
  config,
  lecturers = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'fli02' | 'fli03'>('all');
  
  // Active evaluation modal
  const [activeModal, setActiveModal] = useState<{
    type: 'fli02' | 'fli03';
    student: any;
    markData: any;
  } | null>(null);

  // Match current lecturer details from `lecturers`
  const currentLecturer = useMemo(() => {
    const cleanStaffId = staffId.toUpperCase().replace(/\s+/g, '');
    return lecturers.find(l => {
      const lId = (l.staffId || '').toUpperCase().replace(/\s+/g, '');
      return lId === cleanStaffId || (cleanStaffId.length > 3 && lId.includes(cleanStaffId));
    });
  }, [lecturers, staffId]);

  // Lecturer display name
  const lecturerName = useMemo(() => {
    if (currentLecturer?.nama) return currentLecturer.nama;
    for (const row of markah) {
      const keys = Object.keys(row);
      const staffKey = keys.find(k => {
        const uk = k.toUpperCase();
        return uk.includes('ID STAF') || uk.includes('ID STAFF') || uk.includes('STAFF ID') || uk.includes('ID PEMANTAU');
      });
      if (staffKey && String(row[staffKey] || '').toUpperCase().replace(/\s+/g, '') === staffId.toUpperCase().replace(/\s+/g, '')) {
        const name = row['NAMA PENSYARAH PEMANTAU'] || row['NAMA PEMANTAU'] || row['NAMA PENSYARAH PENILAI'];
        if (name) return name;
      }
    }
    return `PENSYARAH (${staffId})`;
  }, [currentLecturer, markah, staffId]);

  // Helper to extract markData for a student
  const getMarkDataForStudent = useCallback((s: any) => {
    const cleanMatrik = (s.noMatrik || s['NO. MATRIK'] || s['NO MATRIK'] || s['No. Pendaftaran'] || s.id || '').trim().toLowerCase().replace(/\s+/g, '');
    const cleanIc = (s.noIc || s['NO KAD PENGENALAN'] || s['NO. K/P'] || s['NO. KAD PENGENALAN'] || '').replace(/\D/g, '');

    const found = markah.find(m => {
      const mMatrik = String(m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '');
      const mIc = String(m['NO KAD PENGENALAN'] || m['NO. K/P'] || m['NO. KAD PENGENALAN'] || m.noIc || '')
        .toLowerCase()
        .replace(/\D/g, '');

      return (cleanMatrik && mMatrik === cleanMatrik) || (cleanIc && mIc === cleanIc);
    });

    return found || {};
  }, [markah]);

  // Check if assigned for FLI 02 (Pemantauan Temubual)
  const isAssignedFli02 = useCallback((s: any, m: any): boolean => {
    const cleanStaffId = staffId.toUpperCase().replace(/\s+/g, '');
    if (cleanStaffId === 'ADMIN' || cleanStaffId === 'STAFF') return true;

    const sId = (s.idPemantau1 || '').toUpperCase().replace(/\s+/g, '');
    const mId = (m.idPemantau1 || m['ID PEMANTAU'] || m['ID STAF'] || m['STAFF ID'] || m['STAF ID'] || '').toUpperCase().replace(/\s+/g, '');
    if (sId === cleanStaffId || mId === cleanStaffId) return true;
    if (cleanStaffId.length > 3 && (sId.includes(cleanStaffId) || mId.includes(cleanStaffId))) return true;

    const cleanName = (currentLecturer?.nama || lecturerName || '').toUpperCase().trim();
    if (cleanName && cleanName.length > 3) {
      const sName = (s.namaPemantau1 || '').toUpperCase().trim();
      const mName1 = String(m['NAMA PENSYARAH PEMANTAU'] || '').toUpperCase().trim();
      const mName2 = String(m['NAMA PEMANTAU'] || '').toUpperCase().trim();
      if (sName === cleanName || mName1 === cleanName || mName2 === cleanName) return true;
      if (sName.includes(cleanName) || mName1.includes(cleanName) || mName2.includes(cleanName)) return true;
    }
    return false;
  }, [currentLecturer, lecturerName, staffId]);

  // Check if assigned for FLI 03 (Laporan Akhir)
  const isAssignedFli03 = useCallback((s: any, m: any): boolean => {
    const cleanStaffId = staffId.toUpperCase().replace(/\s+/g, '');
    if (cleanStaffId === 'ADMIN' || cleanStaffId === 'STAFF') return true;

    const sId = (s.idPemantau2 || '').toUpperCase().replace(/\s+/g, '');
    const mId = (m.idPemantau2 || '').toUpperCase().replace(/\s+/g, '');
    if (sId === cleanStaffId || mId === cleanStaffId) return true;
    if (cleanStaffId.length > 3 && (sId.includes(cleanStaffId) || mId.includes(cleanStaffId))) return true;

    const cleanName = (currentLecturer?.nama || lecturerName || '').toUpperCase().trim();
    if (cleanName && cleanName.length > 3) {
      const sName = (s.namaPemantau2 || '').toUpperCase().trim();
      const mName1 = String(m['NAMA PENSYARAH PENILAI'] || '').toUpperCase().trim();
      const mName2 = String(m['NAMA PENILAI LAPORAN'] || '').toUpperCase().trim();
      if (sName === cleanName || mName1 === cleanName || mName2 === cleanName) return true;
      if (sName.includes(cleanName) || mName1.includes(cleanName) || mName2.includes(cleanName)) return true;
    }

    // Default fallback: If student has this lecturer assigned for FLI 02, and no separate FLI 03 evaluator is set, evaluate both
    const hasSpecificFli03 = Boolean(
      (s.idPemantau2 && s.idPemantau2 !== s.idPemantau1) || 
      (s.namaPemantau2 && s.namaPemantau2 !== s.namaPemantau1) ||
      (m['NAMA PENSYARAH PENILAI'] && m['NAMA PENSYARAH PENILAI'] !== m['NAMA PENSYARAH PEMANTAU'])
    );
    if (!hasSpecificFli03 && isAssignedFli02(s, m)) {
      return true;
    }
    return false;
  }, [currentLecturer, isAssignedFli02, lecturerName, staffId]);

  // Check completion & score for FLI 02
  const checkFli02 = (m: any): { completed: boolean; score: number } => {
    if (!m) return { completed: false, score: 0 };
    const hasScores = (m['FLI02-C1'] !== undefined && m['FLI02-C1'] !== '') || 
                      (m.TOTAL7 !== undefined && m.TOTAL7 !== '') ||
                      (m['GRAN TOTAL2'] !== undefined && m['GRAN TOTAL2'] !== '');
    const score = parseFloat(m['GRAN TOTAL2'] || m.total_fli02 || '0') || 0;
    return { completed: hasScores && score > 0, score };
  };

  // Check completion & score for FLI 03
  const checkFli03 = (m: any): { completed: boolean; score: number } => {
    if (!m) return { completed: false, score: 0 };
    const hasScores = (m['FLI03-D1'] !== undefined && m['FLI03-D1'] !== '') || 
                      (m.TOTAL10 !== undefined && m.TOTAL10 !== '') ||
                      (m['GRAND TOTAL3'] !== undefined && m['GRAND TOTAL3'] !== '');
    const score = parseFloat(m['GRAND TOTAL3'] || m.total_fli03 || '0') || 0;
    return { completed: hasScores && score > 0, score };
  };

  // Build the list of all students assigned to this lecturer
  const assignedStudents = useMemo(() => {
    const combinedList: Array<{
      student: any;
      markData: any;
      assignedFli02: boolean;
      assignedFli03: boolean;
      fli02: { completed: boolean; score: number };
      fli03: { completed: boolean; score: number };
      noMatrik: string;
      namaPelajar: string;
      program: string;
      kelas: string;
    }> = [];

    const seenMatriks = new Set<string>();

    // 1. Process from `students` collection
    students.forEach(s => {
      const matrik = (s.noMatrik || s.id || '').trim();
      const markData = getMarkDataForStudent(s);
      const fli02Assigned = isAssignedFli02(s, markData);
      const fli03Assigned = isAssignedFli03(s, markData);

      if (fli02Assigned || fli03Assigned) {
        if (matrik) seenMatriks.add(matrik.toLowerCase());
        combinedList.push({
          student: s,
          markData,
          assignedFli02: fli02Assigned,
          assignedFli03: fli03Assigned,
          fli02: checkFli02(markData),
          fli03: checkFli03(markData),
          noMatrik: s.noMatrik || s.id || '-',
          namaPelajar: s.namaPelajar || 'NAMA PELAJAR',
          program: s.program || 'SIJIL KKBS',
          kelas: s.kelas || ''
        });
      }
    });

    // 2. Process any remaining entries in `markah` that were not in `students`
    markah.forEach(m => {
      const matrik = String(m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || '').trim();
      if (matrik && seenMatriks.has(matrik.toLowerCase())) return;

      const dummyStudent: any = {
        id: matrik,
        noMatrik: matrik,
        namaPelajar: m['NAMA PELAJAR'] || m['NAMA'] || 'NAMA PELAJAR',
        program: m['PROGRAM'] || m['KURSUS'] || 'SIJIL KKBS',
        kelas: m['KELAS'] || '',
        noIc: m['NO KAD PENGENALAN'] || m['NO. K/P'] || ''
      };

      const fli02Assigned = isAssignedFli02(dummyStudent, m);
      const fli03Assigned = isAssignedFli03(dummyStudent, m);

      if (fli02Assigned || fli03Assigned) {
        if (matrik) seenMatriks.add(matrik.toLowerCase());
        combinedList.push({
          student: dummyStudent,
          markData: m,
          assignedFli02: fli02Assigned,
          assignedFli03: fli03Assigned,
          fli02: checkFli02(m),
          fli03: checkFli03(m),
          noMatrik: matrik || '-',
          namaPelajar: dummyStudent.namaPelajar,
          program: dummyStudent.program,
          kelas: dummyStudent.kelas
        });
      }
    });

    return combinedList;
  }, [students, markah, getMarkDataForStudent, isAssignedFli02, isAssignedFli03]);

  // Filter based on tab and search
  const filteredStudents = useMemo(() => {
    return assignedStudents.filter(item => {
      // Tab filter
      if (filterTab === 'fli02' && !item.assignedFli02) return false;
      if (filterTab === 'fli03' && !item.assignedFli03) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.namaPelajar.toLowerCase().includes(q);
        const matchMatrik = item.noMatrik.toLowerCase().includes(q);
        const matchProg = item.program.toLowerCase().includes(q);
        return matchName || matchMatrik || matchProg;
      }

      return true;
    });
  }, [assignedStudents, filterTab, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const fli02List = assignedStudents.filter(item => item.assignedFli02);
    const fli02Done = fli02List.filter(item => item.fli02.completed).length;

    const fli03List = assignedStudents.filter(item => item.assignedFli03);
    const fli03Done = fli03List.filter(item => item.fli03.completed).length;

    return {
      total: assignedStudents.length,
      fli02Total: fli02List.length,
      fli02Done,
      fli02Pending: fli02List.length - fli02Done,
      fli03Total: fli03List.length,
      fli03Done,
      fli03Pending: fli03List.length - fli03Done,
    };
  }, [assignedStudents]);

  // Print Handlers
  const handlePrintFli02 = useCallback((student: any, markData: any) => {
    try {
      const rowToPrint = { ...student, ...markData };
      const htmlContent = renderBorangFLI02Html(rowToPrint);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      }
    } catch (err) {
      alert('Ralat semasa menjana cetakan Borang FLI 02.');
    }
  }, []);

  const handlePrintFli03 = useCallback((student: any, markData: any) => {
    try {
      const rowToPrint = { ...student, ...markData };
      const htmlContent = renderBorangFLI03Html(rowToPrint, config);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
      }
    } catch (err) {
      alert('Ralat semasa menjana cetakan Borang FLI 03.');
    }
  }, [config]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-900 text-amber-400 flex items-center justify-center font-black shadow-inner border border-blue-700">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm uppercase tracking-wider text-white">
                  Portal Penilaian Pensyarah
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold uppercase">
                  FLI 02 &amp; FLI 03
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-semibold truncate max-w-xs sm:max-w-md">
                {lecturerName} &bull; <span className="text-amber-300 font-mono font-bold">ID: {staffId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white transition-all text-xs font-bold border border-slate-700 cursor-pointer shadow-xs"
            title="Log Keluar"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Log Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold mb-3 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Sesi Penilaian: {config.sesi || 'SESI I 2026/2027'}
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Selamat Datang, {lecturerName}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Berikut adalah senarai pelajar yang ditetapkan di bawah pemantauan dan penilaian anda bagi borang 
              <strong className="text-amber-300 mx-1">FLI 02 (Pemantauan Temubual 20%)</strong> dan 
              <strong className="text-amber-300 mx-1">FLI 03 (Laporan Akhir 20%)</strong>.
            </p>
          </div>
        </div>

        {/* 3 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Total Students */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 border border-blue-100">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pelajar Ditugaskan</p>
              <h3 className="text-2xl font-black text-slate-950 mt-0.5">{stats.total} Orang</h3>
              <p className="text-[10px] text-slate-400 font-medium">Bagi Sesi Penilaian Ini</p>
            </div>
          </div>

          {/* Card 2: FLI 02 Status */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center shrink-0 border border-indigo-100">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider">FLI 02: Pemantauan (20%)</p>
                <span className="text-xs font-black text-indigo-900">{stats.fli02Done}/{stats.fli02Total}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all" 
                  style={{ width: `${stats.fli02Total > 0 ? (stats.fli02Done / stats.fli02Total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
                <span className="text-emerald-700 font-bold">{stats.fli02Done} Selesai</span>
                <span className="text-amber-700 font-bold">{stats.fli02Pending} Belum</span>
              </p>
            </div>
          </div>

          {/* Card 3: FLI 03 Status */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-900 flex items-center justify-center shrink-0 border border-teal-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-teal-950 uppercase tracking-wider">FLI 03: Laporan Akhir (20%)</p>
                <span className="text-xs font-black text-teal-900">{stats.fli03Done}/{stats.fli03Total}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all" 
                  style={{ width: `${stats.fli03Total > 0 ? (stats.fli03Done / stats.fli03Total) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
                <span className="text-emerald-700 font-bold">{stats.fli03Done} Selesai</span>
                <span className="text-amber-700 font-bold">{stats.fli03Pending} Belum</span>
              </p>
            </div>
          </div>
        </div>

        {/* Students List Table Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Controls Bar (Filter Tabs + Search) */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Pelajar ({stats.total})
              </button>
              <button
                onClick={() => setFilterTab('fli02')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'fli02'
                    ? 'bg-indigo-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FLI 02: Temubual ({stats.fli02Total})
              </button>
              <button
                onClick={() => setFilterTab('fli03')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'fli03'
                    ? 'bg-teal-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FLI 03: Laporan Akhir ({stats.fli03Total})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau no. matrik..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          {/* Table View */}
          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
              <p>Tiada pelajar ditemui mengikut tapisan atau carian anda.</p>
              <p className="text-[11px] font-normal text-slate-400">
                Sila pastikan nama atau ID Staf anda ({staffId}) telah ditetapkan pada jadual penugasan pemantauan (FLI 02 / FLI 03).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-center w-12">Bil</th>
                    <th className="py-3.5 px-5 min-w-[220px]">Maklumat Pelajar</th>
                    <th className="py-3.5 px-5 text-center min-w-[200px] bg-indigo-950/40 border-x border-slate-800">
                      Penilaian FLI 02 (Temubual 20%)
                    </th>
                    <th className="py-3.5 px-5 text-center min-w-[200px] bg-teal-950/40 border-r border-slate-800">
                      Penilaian FLI 03 (Laporan 20%)
                    </th>
                    <th className="py-3.5 px-4 text-center w-28">Jumlah (40%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredStudents.map((item, idx) => {
                    const totalLecturerScore = (
                      (item.assignedFli02 && item.fli02.completed ? item.fli02.score : 0) +
                      (item.assignedFli03 && item.fli03.completed ? item.fli03.score : 0)
                    );

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                        {/* Bil */}
                        <td className="py-4 px-4 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>

                        {/* Student Details */}
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-extrabold text-slate-950 uppercase leading-snug">
                              {item.namaPelajar}
                            </p>
                            <span className="font-mono text-blue-900 font-extrabold text-[10px] mt-0.5 block">
                              {item.noMatrik}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[10px] font-semibold text-slate-600 uppercase">
                                {item.program}
                              </span>
                              {item.kelas && (
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-black text-[9px] border border-slate-200">
                                  {item.kelas}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* FLI 02 Column */}
                        <td className="py-4 px-5 text-center bg-indigo-50/20 border-x border-slate-100">
                          {item.assignedFli02 ? (
                            <div className="space-y-2">
                              {/* Status Badge */}
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                item.fli02.completed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}>
                                {item.fli02.completed ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{item.fli02.score.toFixed(1)} / 20%</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Belum Dinilai</span>
                                  </>
                                )}
                              </span>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setActiveModal({ type: 'fli02', student: item.student, markData: item.markData })}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
                                    item.fli02.completed
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                      : 'bg-indigo-900 hover:bg-indigo-800 text-white'
                                  }`}
                                >
                                  {item.fli02.completed ? <Edit className="w-3 h-3" /> : <ClipboardList className="w-3 h-3" />}
                                  <span>{item.fli02.completed ? 'Kemaskini' : 'Isi Markah'}</span>
                                </button>

                                {item.fli02.completed && (
                                  <button
                                    onClick={() => handlePrintFli02(item.student, item.markData)}
                                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs bg-emerald-700 hover:bg-emerald-600 text-white"
                                    title="Cetak Borang FLI 02"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Cetak</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              Bukan Penilai FLI 02
                            </span>
                          )}
                        </td>

                        {/* FLI 03 Column */}
                        <td className="py-4 px-5 text-center bg-teal-50/20 border-r border-slate-100">
                          {item.assignedFli03 ? (
                            <div className="space-y-2">
                              {/* Status Badge */}
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                item.fli03.completed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}>
                                {item.fli03.completed ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>{item.fli03.score.toFixed(1)} / 20%</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Belum Dinilai</span>
                                  </>
                                )}
                              </span>

                              {/* Action Buttons */}
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => setActiveModal({ type: 'fli03', student: item.student, markData: item.markData })}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs ${
                                    item.fli03.completed
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                      : 'bg-teal-900 hover:bg-teal-800 text-white'
                                  }`}
                                >
                                  {item.fli03.completed ? <Edit className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                                  <span>{item.fli03.completed ? 'Kemaskini' : 'Isi Markah'}</span>
                                </button>

                                {item.fli03.completed && (
                                  <button
                                    onClick={() => handlePrintFli03(item.student, item.markData)}
                                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs bg-emerald-700 hover:bg-emerald-600 text-white"
                                    title="Cetak Borang FLI 03"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Cetak</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 italic">
                              Bukan Penilai FLI 03
                            </span>
                          )}
                        </td>

                        {/* Overall Lecturer Total (40%) */}
                        <td className="py-4 px-4 text-center">
                          {totalLecturerScore > 0 ? (
                            <div className="font-extrabold text-slate-900 flex flex-col items-center">
                              <span className="text-sm font-black text-blue-950 font-mono">
                                {totalLecturerScore.toFixed(1)}%
                              </span>
                              <span className="text-[9px] text-slate-400 font-semibold">/ 40.0%</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Evaluation Modals */}
      {activeModal && activeModal.type === 'fli02' && (
        <BorangFLI02Modal
          student={activeModal.student}
          markData={activeModal.markData}
          onClose={() => setActiveModal(null)}
          onSave={onSaveMark}
        />
      )}

      {activeModal && activeModal.type === 'fli03' && (
        <BorangFLI03Modal
          student={activeModal.student}
          markData={activeModal.markData}
          onClose={() => setActiveModal(null)}
          onSave={onSaveMark}
          config={config}
        />
      )}

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        &copy; 2026 Kolej Komuniti Beaufort Sabah &bull; Portal Penilaian Pensyarah
      </footer>
    </div>
  );
};
