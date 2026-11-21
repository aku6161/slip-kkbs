import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  Sparkles,
  Info,
  Layers,
  GraduationCap,
  Award,
  Clock,
  UserCheck,
  Building2,
  ChevronDown,
  FileSpreadsheet,
  Check,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { Student, Lecturer, SystemConfig } from '../types';

interface LaporanTabProps {
  students: Student[];
  lecturers: Lecturer[];
  markah: any[];
  config: SystemConfig;
}

// Helper: Tentukan jantina pelajar berdasarkan IC atau nama
export const getStudentGender = (student: any): 'Lelaki' | 'Perempuan' => {
  if (student.jantina) {
    const j = String(student.jantina).toUpperCase().trim();
    if (j.includes('PEREMPUAN') || j === 'P' || j === 'FEMALE') return 'Perempuan';
    if (j.includes('LELAKI') || j === 'L' || j === 'MALE') return 'Lelaki';
  }
  const ic = String(student.noIc || student['NO. KAD PENGENALAN'] || student['NO KAD PENGENALAN'] || student.nokp || '').replace(/\D/g, '');
  if (ic.length > 0) {
    const lastDigit = parseInt(ic[ic.length - 1], 10);
    if (!isNaN(lastDigit)) {
      return lastDigit % 2 === 1 ? 'Lelaki' : 'Perempuan';
    }
  }
  const nama = String(student.namaPelajar || student['NAMA PELAJAR'] || '').toUpperCase();
  if (
    nama.includes(' BINTI ') || 
    nama.includes(' BT ') || 
    nama.includes(' BTE ') || 
    nama.includes(' A/P ') ||
    nama.startsWith('NUR ') ||
    nama.startsWith('SITI ') ||
    nama.startsWith('DAYANG ')
  ) {
    return 'Perempuan';
  }
  return 'Lelaki';
};

// Helper: Tentukan jantina pensyarah berdasarkan nama
export const getLecturerGender = (name: string): 'Lelaki' | 'Perempuan' => {
  const up = name.toUpperCase().trim();
  if (
    up.includes(' BINTI ') || 
    up.includes(' BT ') || 
    up.includes(' BTE ') || 
    up.includes(' A/P ') ||
    up.includes('PUAN') ||
    up.includes('PN.') ||
    up.includes('CIK') ||
    up.includes('JEANY') ||
    up.includes('LENNY') ||
    up.includes('WASTI') ||
    up.includes('ERMINEYANTI') ||
    up.includes('JUNAINAH') ||
    up.includes('REZIELLA') ||
    up.includes('NORFAZIRAH') ||
    up.includes('RADHIYAH') ||
    up.includes('MARDHIYYAH') ||
    up.includes('NURHAYATI') ||
    up.includes('NURUL') ||
    up.includes('KHAIRONISA') ||
    up.includes('UMMU') ||
    up.includes('FLORENCE') ||
    up.includes('MARY')
  ) {
    return 'Perempuan';
  }
  return 'Lelaki';
};

// Standardisasikan kod dan nama program
const normalizeProgramCode = (prog?: string): 'SKU' | 'SKE' | 'SOP' | 'LAIN' => {
  if (!prog) return 'LAIN';
  const up = prog.toUpperCase().trim();
  if (up.includes('KULINARI') || up === 'SKU') return 'SKU';
  if (up.includes('ELEKTRIK') || up === 'SKE' || up === 'STE') return 'SKE';
  if (up.includes('PERHOTELAN') || up.includes('HOTEL') || up === 'SOP') return 'SOP';
  return 'LAIN';
};

export const LaporanTab: React.FC<LaporanTabProps> = ({
  students,
  lecturers,
  markah,
  config
}) => {
  // Sub-tabs: 'penempatan' | 'pemantauan' | 'industri'
  const [activeSubTab, setActiveSubTab] = useState<'penempatan' | 'pemantauan' | 'industri'>('penempatan');

  // Senarai sesi dinamik
  const availableSessions = useMemo(() => {
    const set = new Set<string>();
    if (config?.sesi?.trim()) set.add(config.sesi.trim());
    students.forEach(s => {
      if (s.sesi?.trim()) set.add(s.sesi.trim());
    });
    return Array.from(set);
  }, [config?.sesi, students]);

  // Sesi pilihan lalai: Sesi daripada tetapan jika wujud
  const defaultSession = config?.sesi?.trim() || availableSessions[0] || 'SEMUA';
  const [selectedSession, setSelectedSession] = useState<string>(defaultSession);

  // Kemas kini jika config.sesi bertukar dan pilihan masih lalai
  React.useEffect(() => {
    if (config?.sesi?.trim() && !selectedSession) {
      setSelectedSession(config.sesi.trim());
    }
  }, [config?.sesi]);

  // Pelajar ditapis mengikut sesi
  const filteredStudents = useMemo(() => {
    if (selectedSession === 'SEMUA') return students;
    return students.filter(s => (s.sesi || '').trim() === selectedSession.trim());
  }, [students, selectedSession]);

  // Helper cari markah bagi pelajar
  const getStudentMark = (student: Student) => {
    const cleanMatrik = (student.noMatrik || (student as any)['No. Pendaftaran'] || (student as any)['NO. MATRIK'] || '').trim().toLowerCase();
    const cleanIc = (student.noIc || (student as any)['NO. KAD PENGENALAN'] || (student as any)['NO KAD PENGENALAN'] || '').replace(/\D/g, '');

    return markah.find(m => {
      const mMatrik = String(
        m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || ''
      ).trim().toLowerCase();
      const mIc = String(
        m['NO. KAD PENGENALAN'] || m['NO KAD PENGENALAN'] || m['NO. KP'] || m['noIc'] || ''
      ).replace(/\D/g, '');

      return (cleanMatrik && mMatrik === cleanMatrik) || (cleanIc && mIc === cleanIc);
    });
  };

  // Cetak Laporan
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden print:border-none print:shadow-none print:p-4">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Modul Analitik &amp; Pelaporan Rasmi LI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              Laporan &amp; Statistik Latihan Industri
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Analisis menyeluruh penempatan pelajar mengikut program, pemantauan pensyarah (FLI 02), dan maklum balas penilaian majikan industri (FLI 01).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20 shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation & Global Session Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        {/* Sub-tabs buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('penempatan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'penempatan'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Statistik Penempatan LI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pemantauan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'pemantauan'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span>2. Statistik Pemantauan LI</span>
          </button>

          <button
            onClick={() => setActiveSubTab('industri')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'industri'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. Statistik Maklum Balas Industri</span>
          </button>
        </div>

        {/* Filter Sesi Controls (Tanpa perkataan sesi terkini / kad sesi tetapan) */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-blue-900" />
            <span className="text-[11px] font-bold text-slate-700">Tapis Sesi:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent text-xs font-black text-blue-950 focus:outline-none cursor-pointer pr-1"
            >
              {config?.sesi && (
                <option value={config.sesi.trim()}>
                  {config.sesi.trim()}
                </option>
              )}
              {availableSessions
                .filter(s => s !== config?.sesi?.trim())
                .map(sesi => (
                  <option key={sesi} value={sesi}>
                    {sesi}
                  </option>
                ))}
              <option value="SEMUA">SEMUA SESI</option>
            </select>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: STATISTIK PENEMPATAN LI */}
      {activeSubTab === 'penempatan' && (
        <StatistikPenempatanSubTab
          students={filteredStudents}
          selectedSession={selectedSession}
        />
      )}

      {/* SUBTAB 2: STATISTIK PEMANTAUAN LI */}
      {activeSubTab === 'pemantauan' && (
        <StatistikPemantauanSubTab
          students={filteredStudents}
          lecturers={lecturers}
          markah={markah}
          selectedSession={selectedSession}
          getStudentMark={getStudentMark}
        />
      )}

      {/* SUBTAB 3: STATISTIK MAKLUM BALAS INDUSTRI */}
      {activeSubTab === 'industri' && (
        <StatistikMaklumBalasIndustriSubTab
          students={filteredStudents}
          markah={markah}
          selectedSession={selectedSession}
          getStudentMark={getStudentMark}
        />
      )}
    </div>
  );
};

/* =========================================================================
 * 1. SUBTAB: STATISTIK PENEMPATAN LI (Mengikut Program - Lelaki & Perempuan)
 * ========================================================================= */
interface SubTabProps {
  students: Student[];
  selectedSession: string;
  lecturers?: Lecturer[];
  markah?: any[];
  getStudentMark?: (student: Student) => any;
}

const StatistikPenempatanSubTab: React.FC<SubTabProps> = ({
  students,
  selectedSession,
}) => {
  // Pengiraan mengikut program dan jantina
  const programData = useMemo(() => {
    const list = [
      { key: 'SKU', code: 'SKU', name: 'SIJIL KULINARI', color: '#f97316' },
      { key: 'SOP', code: 'SOP', name: 'SIJIL OPERASI PERHOTELAN', color: '#1e3a8a' },
      { key: 'SKE', code: 'SKE', name: 'SIJIL TEKNOLOGI ELEKTRIK', color: '#15803d' }
    ];

    return list.map(item => {
      const progStudents = students.filter(s => normalizeProgramCode(s.program) === item.code);
      const total = progStudents.length;

      const lelakiCount = progStudents.filter(s => getStudentGender(s) === 'Lelaki').length;
      const perempuanCount = progStudents.filter(s => getStudentGender(s) === 'Perempuan').length;

      const lelakiPercent = total > 0 ? Number(((lelakiCount / total) * 100).toFixed(1)) : 0;
      const perempuanPercent = total > 0 ? Number(((perempuanCount / total) * 100).toFixed(1)) : 0;

      // Status penempatan
      const diterimaCount = progStudents.filter(s => 
        s.status === 'Lulus / Diterima' || s.status === 'Diterima'
      ).length;
      const memohonCount = progStudents.filter(s => 
        s.status === 'Permohonan Dihantar' || s.status === 'Memohon'
      ).length;
      const belumCount = progStudents.filter(s => 
        s.status === 'Belum Memohon' || !s.status
      ).length;

      const placementRate = total > 0 ? Number(((diterimaCount / total) * 100).toFixed(1)) : 0;

      return {
        ...item,
        total,
        lelakiCount,
        perempuanCount,
        lelakiPercent,
        perempuanPercent,
        diterimaCount,
        memohonCount,
        belumCount,
        placementRate
      };
    });
  }, [students]);

  // Statistik Keseluruhan
  const totalStudents = students.length;
  const totalLelaki = students.filter(s => getStudentGender(s) === 'Lelaki').length;
  const totalPerempuan = students.filter(s => getStudentGender(s) === 'Perempuan').length;
  const totalLelakiPercent = totalStudents > 0 ? Number(((totalLelaki / totalStudents) * 100).toFixed(1)) : 0;
  const totalPerempuanPercent = totalStudents > 0 ? Number(((totalPerempuan / totalStudents) * 100).toFixed(1)) : 0;

  const totalDiterima = students.filter(s => s.status === 'Lulus / Diterima' || s.status === 'Diterima').length;
  const overallRate = totalStudents > 0 ? Number(((totalDiterima / totalStudents) * 100).toFixed(1)) : 0;

  // Max value for chart scaling
  const maxBarValue = Math.max(...programData.map(d => Math.max(d.lelakiCount, d.perempuanCount)), 5);

  return (
    <div className="space-y-6">
      {/* Top Banner Sesi */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase">
              Statistik Penempatan Pelajar LI Mengikut Program
            </h2>
            <p className="text-xs text-slate-500">
              Analisis pecahan jantina (Lelaki / Perempuan) dan status penerimaan penempatan bagi sesi: <span className="font-bold text-blue-950 font-mono">{selectedSession}</span>
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Pelajar</p>
            <p className="text-2xl font-black text-slate-900 font-mono">{totalStudents}</p>
            <p className="text-[11px] text-slate-400">Semua program berdaftar</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pelajar Lelaki</p>
            <p className="text-2xl font-black text-blue-900 font-mono">
              {totalLelaki} <span className="text-xs font-bold text-blue-600">({totalLelakiPercent}%)</span>
            </p>
            <p className="text-[11px] text-slate-400">Daripada keseluruhan</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pelajar Perempuan</p>
            <p className="text-2xl font-black text-rose-900 font-mono">
              {totalPerempuan} <span className="text-xs font-bold text-rose-600">({totalPerempuanPercent}%)</span>
            </p>
            <p className="text-[11px] text-slate-400">Daripada keseluruhan</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kadar Penempatan</p>
            <p className="text-2xl font-black text-emerald-700 font-mono">
              {overallRate}%
            </p>
            <p className="text-[11px] text-slate-400">{totalDiterima} / {totalStudents} telah diterima</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Grouped Bar Chart & Program Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Carta Bar Mengikut Program (Lelaki vs Perempuan) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Perbandingan Pelajar Mengikut Jantina
              </h3>
              <p className="text-xs text-slate-500">
                Taburan pelajar lelaki dan perempuan bagi setiap program
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
                <span>Lelaki</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                <span>Perempuan</span>
              </span>
            </div>
          </div>

          {/* SVG Grouped Column Chart */}
          <div className="pt-2">
            <svg viewBox="0 0 540 240" className="w-full h-auto select-none overflow-visible">
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = 30 + (180 * (1 - ratio));
                const val = Math.round(maxBarValue * ratio);
                return (
                  <g key={idx}>
                    <line x1="45" y1={y} x2="520" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="35" y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="monospace">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Programs Bars */}
              {programData.map((prog, pIdx) => {
                const groupWidth = 140;
                const groupX = 65 + (pIdx * 155);
                const barWidth = 38;

                // Lelaki Bar
                const lelakiH = maxBarValue > 0 ? (prog.lelakiCount / maxBarValue) * 180 : 0;
                const lelakiY = 210 - lelakiH;

                // Perempuan Bar
                const perempuanH = maxBarValue > 0 ? (prog.perempuanCount / maxBarValue) * 180 : 0;
                const perempuanY = 210 - perempuanH;

                return (
                  <g key={prog.key}>
                    {/* Lelaki Bar */}
                    <rect
                      x={groupX}
                      y={lelakiY}
                      width={barWidth}
                      height={Math.max(lelakiH, 2)}
                      rx="4"
                      fill="#2563eb"
                      className="transition-all hover:opacity-85"
                    />
                    <text
                      x={groupX + barWidth / 2}
                      y={lelakiY - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1e40af"
                    >
                      {prog.lelakiCount}
                    </text>

                    {/* Perempuan Bar */}
                    <rect
                      x={groupX + barWidth + 8}
                      y={perempuanY}
                      width={barWidth}
                      height={Math.max(perempuanH, 2)}
                      rx="4"
                      fill="#f43f5e"
                      className="transition-all hover:opacity-85"
                    />
                    <text
                      x={groupX + barWidth + 8 + barWidth / 2}
                      y={perempuanY - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#be123c"
                    >
                      {prog.perempuanCount}
                    </text>

                    {/* X-axis Program Label */}
                    <text
                      x={groupX + (barWidth * 2 + 8) / 2}
                      y="230"
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {prog.code}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold">Petunjuk Kod Program:</span>
            <div className="flex gap-4 font-bold text-slate-800">
              <span>SKU: Sijil Kulinari</span>
              <span>SOP: Operasi Perhotelan</span>
              <span>SKE: Teknologi Elektrik</span>
            </div>
          </div>
        </div>

        {/* Status Penempatan Setiap Program Cards */}
        <div className="lg:col-span-5 space-y-4">
          {programData.map((prog) => (
            <div
              key={prog.key}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: prog.color }}
                  ></span>
                  <h4 className="text-xs font-black text-slate-900 uppercase">
                    {prog.name} ({prog.code})
                  </h4>
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                  {prog.total} Pelajar
                </span>
              </div>

              {/* Pecahan Jantina Mini Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span className="text-blue-900">Lelaki: {prog.lelakiCount} ({prog.lelakiPercent}%)</span>
                  <span className="text-rose-700">Perempuan: {prog.perempuanCount} ({prog.perempuanPercent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${prog.lelakiPercent}%` }}
                    title={`Lelaki: ${prog.lelakiPercent}%`}
                  ></div>
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${prog.perempuanPercent}%` }}
                    title={`Perempuan: ${prog.perempuanPercent}%`}
                  ></div>
                </div>
              </div>

              {/* Status Penempatan Progress */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Kadar Ditempatkan:</span>
                  <span className="font-black text-emerald-700">{prog.placementRate}%</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    Lulus: {prog.diterimaCount}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                    Memohon: {prog.memohonCount}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    Belum: {prog.belumCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jadual Terperinci Penempatan Program */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-black text-slate-900 uppercase">
              Jadual Ringkasan Statistik Penempatan &amp; Jantina
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {students.length} Rekod Sesi Ini
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4 text-center text-blue-900">Lelaki</th>
                <th className="py-3 px-4 text-center text-rose-700">Perempuan</th>
                <th className="py-3 px-4 text-center">Jumlah Pelajar</th>
                <th className="py-3 px-4 text-center text-emerald-700">Ditempatkan (Lulus)</th>
                <th className="py-3 px-4 text-center text-amber-700">Dalam Proses</th>
                <th className="py-3 px-4 text-center text-slate-500">Belum Memohon</th>
                <th className="py-3 px-4 text-right">Kadar Penempatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {programData.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-black flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }}></span>
                    <span>{row.name} ({row.code})</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-900 font-mono">
                    {row.lelakiCount} <span className="text-[10px] text-blue-600 font-normal">({row.lelakiPercent}%)</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-rose-800 font-mono">
                    {row.perempuanCount} <span className="text-[10px] text-rose-600 font-normal">({row.perempuanPercent}%)</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-black font-mono">
                    {row.total}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700 font-mono">
                    {row.diterimaCount}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-700 font-mono">
                    {row.memohonCount}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                    {row.belumCount}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-black font-mono text-[11px] border border-emerald-200">
                      {row.placementRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-slate-50/90 font-black text-slate-900 border-t-2 border-slate-300">
                <td className="py-3.5 px-4 uppercase font-black">Jumlah Keseluruhan</td>
                <td className="py-3.5 px-4 text-center text-blue-900 font-mono">{totalLelaki}</td>
                <td className="py-3.5 px-4 text-center text-rose-800 font-mono">{totalPerempuan}</td>
                <td className="py-3.5 px-4 text-center font-mono">{totalStudents}</td>
                <td className="py-3.5 px-4 text-center text-emerald-700 font-mono">{totalDiterima}</td>
                <td className="py-3.5 px-4 text-center text-amber-700 font-mono">
                  {students.filter(s => s.status === 'Permohonan Dihantar' || s.status === 'Memohon').length}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                  {students.filter(s => s.status === 'Belum Memohon' || !s.status).length}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-blue-900 text-white font-black font-mono text-[11px]">
                    {overallRate}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
 * 2. SUBTAB: STATISTIK PEMANTAUAN LI (Carta Pie Pensyarah & 3 Elemen FLI 02)
 * ========================================================================= */
const StatistikPemantauanSubTab: React.FC<SubTabProps> = ({
  students,
  lecturers = [],
  markah = [],
  selectedSession,
  getStudentMark
}) => {
  // 1. Tentukan Pensyarah Pemantau
  const pemantauLecturers = useMemo(() => {
    // Kumpul nama pensyarah pemantau daripada pelajar sesi ini
    const assignedMap = new Map<string, { id?: string; nama: string; count: number }>();
    students.forEach(s => {
      const name = s.namaPemantau1?.trim();
      if (name) {
        const existing = assignedMap.get(name) || { id: s.idPemantau1, nama: name, count: 0 };
        existing.count += 1;
        assignedMap.set(name, existing);
      }
    });

    if (assignedMap.size > 0) {
      return Array.from(assignedMap.values()).map(item => ({
        id: item.id || `lec_${item.nama}`,
        nama: item.nama,
        gender: getLecturerGender(item.nama),
        studentCount: item.count
      }));
    }

    // Jika tiada penugasan aktif bagi sesi ini, pulangkan senarai kosong
    return [];
  }, [students]);

  const totalPemantau = pemantauLecturers.length;
  const pemantauLelaki = pemantauLecturers.filter(p => p.gender === 'Lelaki').length;
  const pemantauPerempuan = pemantauLecturers.filter(p => p.gender === 'Perempuan').length;

  const lelakiPercent = totalPemantau > 0 ? Math.round((pemantauLelaki / totalPemantau) * 100) : 0;
  const perempuanPercent = totalPemantau > 0 ? 100 - lelakiPercent : 0;

  // 2. Kira Purata FLI 02 (3 Elemen Utama Sahaja Berdasarkan Data Sebenar)
  // Q1 - Komunikasi Lisan (CLO 2, 10%)
  // Q2 - Kerja Berpasukan & Tanggungjawab (CLO 3, 5%)
  // Q3 - Kemahiran Personal (CLO 4, 5%)
  const fli02Scores = useMemo(() => {
    let count = 0;
    const sums3 = [0, 0, 0];

    students.forEach(s => {
      const m = getStudentMark ? getStudentMark(s) : null;
      if (m && (m['FLI02-C1'] !== undefined || m['TOTAL7'] !== undefined || m['GRAN TOTAL2'] !== undefined)) {
        const c1_1 = parseFloat(m['FLI02-C1']);
        const c1_2 = parseFloat(m['FLI02-C2']);
        const c2_1 = parseFloat(m['FLI02-C3']);
        const c2_2 = parseFloat(m['FLI02-C4']);
        const c3_1 = parseFloat(m['FLI02-C5']);
        const c3_2 = parseFloat(m['FLI02-C6']);
        const total7 = parseFloat(m['TOTAL7']);
        const total8 = parseFloat(m['TOTAL8']);
        const total9 = parseFloat(m['TOTAL9']);

        // 1. Q1: Komunikasi Lisan (Skala 1 - 5)
        let q1_val = NaN;
        if (!isNaN(c1_1) && !isNaN(c1_2)) q1_val = (c1_1 + c1_2) / 2;
        else if (!isNaN(c1_1)) q1_val = c1_1;
        else if (!isNaN(total7)) q1_val = total7 / 2;

        // 2. Q2: Kerja Berpasukan & Tanggungjawab (Skala 1 - 5)
        let q2_val = NaN;
        if (!isNaN(c2_1) && !isNaN(c2_2)) q2_val = (c2_1 + c2_2) / 2;
        else if (!isNaN(c2_1)) q2_val = c2_1;
        else if (!isNaN(total8)) q2_val = total8;

        // 3. Q3: Kemahiran Personal (Skala 1 - 5)
        let q3_val = NaN;
        if (!isNaN(c3_1) && !isNaN(c3_2)) q3_val = (c3_1 + c3_2) / 2;
        else if (!isNaN(c3_1)) q3_val = c3_1;
        else if (!isNaN(total9)) q3_val = total9;

        if (!isNaN(q1_val) && !isNaN(q2_val) && !isNaN(q3_val)) {
          sums3[0] += q1_val;
          sums3[1] += q2_val;
          sums3[2] += q3_val;
          count += 1;
        }
      }
    });

    if (count > 0) {
      return {
        hasData: true,
        evaluatedCount: count,
        averages: sums3.map(sum => Number((sum / count).toFixed(2)))
      };
    }

    // Jika tiada penilaian sebenar, biarkan kosong tanpa data penanda aras
    return {
      hasData: false,
      evaluatedCount: 0,
      averages: [0, 0, 0]
    };
  }, [students, getStudentMark]);

  // 3 Elemen Utama FLI 02
  const questionsList = useMemo(() => {
    return [
      { 
        code: 'Q1', 
        text: 'Komunikasi Lisan', 
        desc: '1.1 & 1.2 Kemahiran menjawab soalan & penyampaian idea', 
        clo: 'CLO 2', 
        weight: '10%',
        score: fli02Scores.averages[0] 
      },
      { 
        code: 'Q2', 
        text: 'Kerja Berpasukan & Tanggungjawab', 
        desc: '2.1 & 2.2 Hubungan rakan sekerja & tanggungjawab tugasan', 
        clo: 'CLO 3', 
        weight: '5%',
        score: fli02Scores.averages[1] 
      },
      { 
        code: 'Q3', 
        text: 'Kemahiran Personal', 
        desc: '3.1 & 3.2 Organisasi maklumat & inisiatif bermotivasi', 
        clo: 'CLO 4', 
        weight: '5%',
        score: fli02Scores.averages[2] 
      },
    ];
  }, [fli02Scores]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase">
              Statistik Pemantauan Latihan Industri
            </h2>
            <p className="text-xs text-slate-500">
              Pecahan pensyarah pemantau dan dapatan skor penilaian temubual pemantauan borang FLI 02 bagi sesi: <span className="font-bold text-blue-950 font-mono">{selectedSession}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Carta Pie Pensyarah & Ringkasan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Carta Pie Pensyarah Pemantau (Lelaki / Perempuan) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">
                Carta Pensyarah Pemantau
              </h3>
              <p className="text-xs text-slate-500">
                Pecahan jantina pensyarah pemantau
              </p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
              {totalPemantau} Pensyarah
            </span>
          </div>

          {/* SVG Donut Chart atau Empty State jika tiada pensyarah pemantau */}
          {totalPemantau > 0 ? (
            <>
              <div className="flex items-center justify-center py-2">
                <div className="relative w-52 h-52 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    {/* Background Ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="75"
                      stroke="#f1f5f9"
                      strokeWidth="28"
                      fill="transparent"
                    />
                    {/* Perempuan Arc (Pink/Rose) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="75"
                      stroke="#ec4899"
                      strokeWidth="28"
                      fill="transparent"
                      strokeDasharray={`${(perempuanPercent / 100) * 471.2} 471.2`}
                      strokeDashoffset="0"
                      className="transition-all duration-700"
                    />
                    {/* Lelaki Arc (Royal Blue) */}
                    <circle
                      cx="100"
                      cy="100"
                      r="75"
                      stroke="#2563eb"
                      strokeWidth="28"
                      fill="transparent"
                      strokeDasharray={`${(lelakiPercent / 100) * 471.2} 471.2`}
                      strokeDashoffset={`${-((perempuanPercent / 100) * 471.2)}`}
                      className="transition-all duration-700"
                    />
                  </svg>

                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                      {totalPemantau}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      Pensyarah
                    </span>
                  </div>
                </div>
              </div>

              {/* Donut Legend */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span className="text-xs font-bold text-slate-800">Lelaki</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-blue-900 font-mono block">{pemantauLelaki}</span>
                    <span className="text-[10px] font-semibold text-blue-600">{lelakiPercent}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-pink-500"></span>
                    <span className="text-xs font-bold text-slate-800">Perempuan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-rose-900 font-mono block">{pemantauPerempuan}</span>
                    <span className="text-[10px] font-semibold text-rose-600">{perempuanPercent}%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase">Tiada Pensyarah Pemantau Ditetapkan</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Belum ada pensyarah pemantau ditetapkan bagi sesi ini.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Senarai Pensyarah Pemantau */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase">
              Senarai Pensyarah Pemantau Terlibat
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold">
              {students.filter(s => s.namaPemantau1).length} pelajar ditugaskan pemantauan
            </span>
          </div>

          {pemantauLecturers.length > 0 ? (
            <div className="flex-1 overflow-y-auto max-h-72 space-y-2 pr-1">
              {pemantauLecturers.map((lec, idx) => (
                <div
                  key={lec.id || idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                      lec.gender === 'Lelaki' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">{lec.nama}</p>
                      <p className="text-[10px] text-slate-500">
                        {lec.studentCount > 0 ? `${lec.studentCount} pelajar diselia pemantauan` : 'Pensyarah berdaftar'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    lec.gender === 'Lelaki'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {lec.gender}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 py-12 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase">Tiada Senarai Pensyarah Pemantau</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Tiada pensyarah pemantau ditetapkan bagi sesi ini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================================
       * DAPATAN PEMANTAUAN (FLI 02) - 3 ELEMEN UTAMA
       * ===================================================================== */}
      <div className="bg-[#f8fafc] p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Dapatan Pemantauan
              </h2>
              {fli02Scores.hasData && (
                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full border border-emerald-300">
                  Data Sebenar: {fli02Scores.evaluatedCount} Pelajar Dinilai
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Penilaian 3 Elemen Utama berasaskan skala 1.00 hingga 5.00 bagi sesi {selectedSession}
            </p>
          </div>
        </div>

        {/* Layout: Chart on Left, Legend on Right */}
        {fli02Scores.hasData ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Bar Chart Section */}
            <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <svg viewBox="0 0 500 280" className="w-full h-auto select-none overflow-visible">
                {/* Ticks & Horizontal Lines (3.0, 3.5, 4.0, 4.5, 5.0) */}
                {[
                  { val: 5.0, y: 30 },
                  { val: 4.5, y: 75 },
                  { val: 4.0, y: 120 },
                  { val: 3.5, y: 165 },
                  { val: 3.0, y: 210 },
                ].map((tick) => (
                  <g key={tick.val}>
                    <line
                      x1="45"
                      y1={tick.y}
                      x2="480"
                      y2={tick.y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                    <text
                      x="35"
                      y={tick.y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="500"
                      fill="#64748b"
                      fontFamily="monospace"
                    >
                      {tick.val.toFixed(1)}
                    </text>
                  </g>
                ))}

                {/* 3 Bars bagi Q1, Q2, Q3 */}
                {questionsList.map((q, idx) => {
                  const barWidth = 74;
                  const totalBars = 3;
                  const availableWidth = 435;
                  const totalBarWidth = totalBars * barWidth;
                  const gap = (availableWidth - totalBarWidth) / (totalBars + 1);
                  const x = 45 + gap + (idx * (barWidth + gap));

                  const clampedScore = Math.max(3.0, Math.min(5.0, q.score));
                  const barHeight = ((clampedScore - 3.0) / 2.0) * 180;
                  const y = 210 - barHeight;

                  return (
                    <g key={q.code} className="cursor-pointer group">
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(barHeight, 2)}
                        rx="7"
                        ry="7"
                        fill="#14532d"
                        className="transition-all duration-300 group-hover:fill-[#15803d]"
                      />
                      <text
                        x={x + barWidth / 2}
                        y={y + 24}
                        textAnchor="middle"
                        fontSize="13"
                        fontWeight="bold"
                        fill="#ffffff"
                        fontFamily="monospace"
                      >
                        {q.score.toFixed(2)}
                      </text>
                      <text
                        x={x + barWidth / 2}
                        y="235"
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="bold"
                        fill="#64748b"
                      >
                        {q.code}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Right Legend Section */}
            <div className="md:col-span-5 space-y-4 pl-0 md:pl-4">
              {questionsList.map((q) => (
                <div key={q.code} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#14532d] text-base tracking-wide">
                        {q.code}
                      </span>
                      <span className="text-slate-400 font-bold">-</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {q.text}
                      </span>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono border border-emerald-200">
                      {q.score.toFixed(2)}
                    </span>
                  </div>
                  {q.clo && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>{q.desc}</span>
                      <span className="font-semibold text-slate-700">{q.clo} ({q.weight})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State bila tiada data penilaian */
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3 py-14">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase">Tiada Data Penilaian FLI 02</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Tiada rekod penilaian pemantauan pensyarah (FLI 02) yang dimasukkan bagi sesi <span className="font-semibold text-slate-700 font-mono">{selectedSession}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Footnote */}
        <p className="text-xs italic text-slate-500 font-medium pt-2 border-t border-slate-200">
          Penilaian dijalankan menggunakan Borang Penilaian Pensyarah Pemantau, <strong>FLI 02</strong>.
        </p>
      </div>

      {/* =====================================================================
       * ANALISA DAPATAN PEMANTAUAN (Dinamik berasaskan data sebenar)
       * ===================================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Award className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-black text-slate-900 uppercase">
            Analisa Dapatan Pemantauan
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
          {fli02Scores.hasData ? (
            <>
              Secara keseluruhannya, dapatan penilaian pemantauan pensyarah (FLI 02) bagi <strong>{selectedSession}</strong> menunjukkan tahap pencapaian kompetensi pelajar dengan purata skor keseluruhan <strong>{((questionsList[0].score + questionsList[1].score + questionsList[2].score) / 3).toFixed(2)} daripada 5.00</strong> (berdasarkan {fli02Scores.evaluatedCount} orang pelajar dinilai). Aspek <strong>{questionsList.slice().sort((a,b)=>b.score - a.score)[0].text} (Skor: {questionsList.slice().sort((a,b)=>b.score - a.score)[0].score.toFixed(2)})</strong> mencatatkan pencapaian tertinggi, manakala aspek <strong>{questionsList.slice().sort((a,b)=>a.score - b.score)[0].text} (Skor: {questionsList.slice().sort((a,b)=>a.score - b.score)[0].score.toFixed(2)})</strong> mencatatkan skor {questionsList.slice().sort((a,b)=>a.score - b.score)[0].score.toFixed(2)} dengan ruang peningkatan berterusan melalui bimbingan pemantau dan pihak industri.
            </>
          ) : (
            <>
              Tiada data penilaian pemantauan pensyarah (FLI 02) bagi sesi <strong>{selectedSession}</strong> untuk dianalisa. Analisis akan dijana secara automatik sebaik sahaja markah penilaian pensyarah pemantau dimasukkan pada sistem.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

/* =========================================================================
 * 3. SUBTAB: STATISTIK MAKLUM BALAS INDUSTRI (FLI 01)
 * ========================================================================= */
const FLI01_CRITERIA_LIST = [
  { code: 'Q1', field: 'FLI01-A1', label: 'Menunjukkan kemahiran secara hands-on di tempat kerja', domain: 'Kemahiran di Tempat Kerja' },
  { code: 'Q2', field: 'FLI01-A2', label: 'Pengetahuan sedia ada dengan kerja', domain: 'Kemahiran di Tempat Kerja' },
  { code: 'Q3', field: 'FLI01-A3', label: 'Kemahiran penggunaan alatan dan kelengkapan', domain: 'Kemahiran di Tempat Kerja' },
  { code: 'Q4', field: 'FLI01-A4', label: 'Pelaksanaan kerja mengikut Prosedur Operasi Standard (SOP)', domain: 'Kemahiran di Tempat Kerja' },
  { code: 'Q5', field: 'FLI01-A5', label: 'Tindak balas terhadap masalah semasa melaksanakan kerja', domain: 'Kemahiran di Tempat Kerja' },
  { code: 'Q6', field: 'FLI01-A6', label: 'Kemahiran pengurusan masa ketika melaksanakan kerja', domain: 'Kemahiran di Tempat Kerja' },
  { code: 'Q7', field: 'FLI01-A7', label: 'Komunikasi yang berkesan', domain: 'Komunikasi Berkesan' },
  { code: 'Q8', field: 'FLI01-A8', label: 'Hubungan baik dalam organisasi', domain: 'Komunikasi Berkesan' },
  { code: 'Q9', field: 'FLI01-A9', label: 'Menghormati dan menerima pendapat', domain: 'Kerja Berpasukan & Bertanggungjawab' },
  { code: 'Q10', field: 'FLI01-A10', label: 'Tanggungjawab kerja', domain: 'Kerja Berpasukan & Bertanggungjawab' },
  { code: 'Q11', field: 'FLI01-A11', label: 'Penambahbaikan semasa melaksanakan kerja', domain: 'Kemahiran Personal' },
  { code: 'Q12', field: 'FLI01-A12', label: 'Bermotivasi dalam menyiapkan kerja', domain: 'Kemahiran Personal' },
  { code: 'Q13', field: 'FLI01-A13', label: 'Budaya kerja yang baik', domain: 'Nilai, Etika & Profesionalisme' },
  { code: 'Q14', field: 'FLI01-A14', label: 'Penampilan diri dan pemakaian yang bersesuaian di tempat kerja', domain: 'Nilai, Etika & Profesionalisme' },
];

const StatistikMaklumBalasIndustriSubTab: React.FC<SubTabProps> = ({
  students,
  markah = [],
  selectedSession,
  getStudentMark
}) => {
  // Slicer State: 'SEMUA' | 'SOP' | 'SKU' | 'SKE'
  const [selectedSlicer, setSelectedSlicer] = useState<'SEMUA' | 'SOP' | 'SKU' | 'SKE'>('SEMUA');

  // Ringkasan setiap Slicer (untuk paparan kad penapis)
  const slicerSummary = useMemo(() => {
    const calcSummary = (progCode?: 'SOP' | 'SKU' | 'SKE') => {
      const target = !progCode ? students : students.filter(s => normalizeProgramCode(s.program) === progCode);
      let count = 0;
      let totalSum = 0;
      let totalItems = 0;

      target.forEach(s => {
        const m = getStudentMark ? getStudentMark(s) : null;
        if (m && (m['FLI01-A1'] !== undefined || m['TOTAL1'] !== undefined)) {
          let hasVal = false;
          for (let i = 1; i <= 14; i++) {
            const val = parseFloat(m[`FLI01-A${i}`]);
            if (!isNaN(val)) {
              totalSum += val;
              totalItems += 1;
              hasVal = true;
            }
          }
          if (hasVal) count += 1;
        }
      });

      const mean = totalItems > 0 ? Number((totalSum / totalItems).toFixed(2)) : null;
      return { count, totalStudents: target.length, mean };
    };

    return {
      SEMUA: calcSummary(),
      SOP: calcSummary('SOP'),
      SKU: calcSummary('SKU'),
      SKE: calcSummary('SKE')
    };
  }, [students, getStudentMark]);

  // Pelajar ditapis mengikut Slicer
  const filteredStudents = useMemo(() => {
    if (selectedSlicer === 'SEMUA') return students;
    return students.filter(s => normalizeProgramCode(s.program) === selectedSlicer);
  }, [students, selectedSlicer]);

  // Kira Skor Min (Mean) bagi Q1 hingga Q14 berdasarkan data sebenar sesi & slicer terpilih
  const slicerStats = useMemo(() => {
    let evaluatedCount = 0;
    const sums = new Array(14).fill(0);
    const counts = new Array(14).fill(0);

    filteredStudents.forEach(s => {
      const m = getStudentMark ? getStudentMark(s) : null;
      if (m && (m['FLI01-A1'] !== undefined || m['TOTAL1'] !== undefined)) {
        let hasScore = false;
        for (let i = 0; i < 14; i++) {
          const val = parseFloat(m[`FLI01-A${i + 1}`]);
          if (!isNaN(val)) {
            sums[i] += val;
            counts[i] += 1;
            hasScore = true;
          }
        }
        if (hasScore) evaluatedCount += 1;
      }
    });

    if (evaluatedCount === 0) {
      return {
        hasData: false,
        evaluatedCount: 0,
        overallMean: 0,
        highest: null,
        lowest: null,
        items: FLI01_CRITERIA_LIST.map(q => ({ ...q, count: 0, mean: 0 }))
      };
    }

    const items = FLI01_CRITERIA_LIST.map((q, idx) => {
      const c = counts[idx];
      const mean = c > 0 ? Number((sums[idx] / c).toFixed(2)) : 0;
      return {
        ...q,
        count: c,
        mean
      };
    });

    const validItems = items.filter(it => it.count > 0);
    const overallMean = validItems.length > 0
      ? Number((validItems.reduce((acc, curr) => acc + curr.mean, 0) / validItems.length).toFixed(2))
      : 0;

    const sorted = [...validItems].sort((a, b) => b.mean - a.mean);
    const highest = sorted.length > 0 ? sorted[0] : null;
    const lowest = sorted.length > 0 ? sorted[sorted.length - 1] : null;

    return {
      hasData: true,
      evaluatedCount,
      overallMean,
      highest,
      lowest,
      items
    };
  }, [filteredStudents, getStudentMark]);

  // Nama label Slicer terpilih
  const slicerLabel = useMemo(() => {
    switch (selectedSlicer) {
      case 'SOP': return 'Sijil Operasi Perhotelan';
      case 'SKU': return 'Sijil Kulinari';
      case 'SKE': return 'Sijil Teknologi Elektrik';
      default: return 'Semua Program';
    }
  }, [selectedSlicer]);

  // Warna tema Slicer terpilih
  const slicerColor = useMemo(() => {
    switch (selectedSlicer) {
      case 'SOP': return '#1e3a8a';
      case 'SKU': return '#ea580c';
      case 'SKE': return '#15803d';
      default: return '#0f766e';
    }
  }, [selectedSlicer]);

  // Tentukan skala minimum (baseline) untuk carta: jika ada skor bawah 3.0, guna 1.0, jika tidak guna 3.0 seperti lampiran
  const chartMinScale = useMemo(() => {
    if (!slicerStats.hasData || !slicerStats.lowest) return 3.0;
    return slicerStats.lowest.mean < 3.0 ? 1.0 : 3.0;
  }, [slicerStats]);

  // Ticks dinamik carta
  const chartTicks = chartMinScale === 1.0
    ? [5.0, 4.0, 3.0, 2.0, 1.0]
    : [5.0, 4.5, 4.0, 3.5, 3.0];

  // Helper fungsi tahap pencapaian
  const getRatingBadge = (score: number) => {
    if (score >= 4.50) {
      return { text: 'Cemerlang', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
    if (score >= 4.00) {
      return { text: 'Sangat Baik', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
    }
    if (score >= 3.50) {
      return { text: 'Baik', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { text: 'Sederhana', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase">
              STATISTIK MAKLUM BALAS INDUSTRI
            </h2>
            <p className="text-xs text-slate-500">
              Analisis dapatan skor min penilaian prestasi pelajar oleh pihak majikan industri bagi sesi: <span className="font-bold text-blue-950 font-mono">{selectedSession}</span>
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
       * KAD FILTER / SLICER: SEMUA, SOP, SKU, SKE
       * ===================================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              TAPISAN PROGRAM
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Klik kad untuk melihat hasil min mengikut program
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Slicer: SEMUA */}
          <button
            type="button"
            onClick={() => setSelectedSlicer('SEMUA')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedSlicer === 'SEMUA'
                ? 'bg-gradient-to-br from-blue-950 to-slate-900 text-white border-blue-900 shadow-md ring-2 ring-blue-500/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-end h-5">
              {selectedSlicer === 'SEMUA' && (
                <Check className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="mt-1">
              <p className={`text-base font-black uppercase tracking-tight ${selectedSlicer === 'SEMUA' ? 'text-white' : 'text-slate-900'}`}>
                SEMUA PROGRAM
              </p>
              <p className={`text-[11px] font-semibold mt-0.5 ${selectedSlicer === 'SEMUA' ? 'text-slate-300' : 'text-slate-500'}`}>
                {slicerSummary.SEMUA.count} daripada {slicerSummary.SEMUA.totalStudents} dinilai
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/30 flex items-center justify-between text-xs font-mono">
              <span className={selectedSlicer === 'SEMUA' ? 'text-slate-400 text-[10px]' : 'text-slate-400 text-[10px]'}>Min Keseluruhan:</span>
              <span className={`font-black ${selectedSlicer === 'SEMUA' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {slicerSummary.SEMUA.mean !== null ? `${slicerSummary.SEMUA.mean.toFixed(2)}` : '-'}
              </span>
            </div>
          </button>

          {/* Slicer: SOP */}
          <button
            type="button"
            onClick={() => setSelectedSlicer('SOP')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedSlicer === 'SOP'
                ? 'bg-blue-900 text-white border-blue-950 shadow-md ring-2 ring-blue-400/50'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-end h-5">
              {selectedSlicer === 'SOP' && (
                <Check className="w-4 h-4 text-emerald-300" />
              )}
            </div>
            <div className="mt-1">
              <p className={`text-base font-black uppercase tracking-tight ${selectedSlicer === 'SOP' ? 'text-white' : 'text-slate-900'}`}>
                Sijil Perhotelan
              </p>
              <p className={`text-[11px] font-semibold mt-0.5 ${selectedSlicer === 'SOP' ? 'text-blue-100' : 'text-slate-500'}`}>
                {slicerSummary.SOP.count} daripada {slicerSummary.SOP.totalStudents} dinilai
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/30 flex items-center justify-between text-xs font-mono">
              <span className={selectedSlicer === 'SOP' ? 'text-blue-200 text-[10px]' : 'text-slate-400 text-[10px]'}>Min Keseluruhan:</span>
              <span className={`font-black ${selectedSlicer === 'SOP' ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {slicerSummary.SOP.mean !== null ? `${slicerSummary.SOP.mean.toFixed(2)}` : '-'}
              </span>
            </div>
          </button>

          {/* Slicer: SKU */}
          <button
            type="button"
            onClick={() => setSelectedSlicer('SKU')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedSlicer === 'SKU'
                ? 'bg-orange-600 text-white border-orange-700 shadow-md ring-2 ring-orange-300/60'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-end h-5">
              {selectedSlicer === 'SKU' && (
                <Check className="w-4 h-4 text-amber-200" />
              )}
            </div>
            <div className="mt-1">
              <p className={`text-base font-black uppercase tracking-tight ${selectedSlicer === 'SKU' ? 'text-white' : 'text-slate-900'}`}>
                Sijil Kulinari
              </p>
              <p className={`text-[11px] font-semibold mt-0.5 ${selectedSlicer === 'SKU' ? 'text-orange-100' : 'text-slate-500'}`}>
                {slicerSummary.SKU.count} daripada {slicerSummary.SKU.totalStudents} dinilai
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/30 flex items-center justify-between text-xs font-mono">
              <span className={selectedSlicer === 'SKU' ? 'text-orange-100 text-[10px]' : 'text-slate-400 text-[10px]'}>Min Keseluruhan:</span>
              <span className={`font-black ${selectedSlicer === 'SKU' ? 'text-white' : 'text-orange-700'}`}>
                {slicerSummary.SKU.mean !== null ? `${slicerSummary.SKU.mean.toFixed(2)}` : '-'}
              </span>
            </div>
          </button>

          {/* Slicer: SKE */}
          <button
            type="button"
            onClick={() => setSelectedSlicer('SKE')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
              selectedSlicer === 'SKE'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400/50'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-end h-5">
              {selectedSlicer === 'SKE' && (
                <Check className="w-4 h-4 text-emerald-200" />
              )}
            </div>
            <div className="mt-1">
              <p className={`text-base font-black uppercase tracking-tight ${selectedSlicer === 'SKE' ? 'text-white' : 'text-slate-900'}`}>
                Sijil Elektrik
              </p>
              <p className={`text-[11px] font-semibold mt-0.5 ${selectedSlicer === 'SKE' ? 'text-emerald-100' : 'text-slate-500'}`}>
                {slicerSummary.SKE.count} daripada {slicerSummary.SKE.totalStudents} dinilai
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200/30 flex items-center justify-between text-xs font-mono">
              <span className={selectedSlicer === 'SKE' ? 'text-emerald-200 text-[10px]' : 'text-slate-400 text-[10px]'}>Min Keseluruhan:</span>
              <span className={`font-black ${selectedSlicer === 'SKE' ? 'text-white' : 'text-emerald-800'}`}>
                {slicerSummary.SKE.mean !== null ? `${slicerSummary.SKE.mean.toFixed(2)}` : '-'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* =====================================================================
       * PAPARAN HASIL MIN PENILAIAN MAKLUM BALAS INDUSTRI
       * ===================================================================== */}
      <div className="bg-[#f8fafc] p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Header & KPI Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dapatan Penilaian Maklum Balas Industri
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Paparan hasil skor min penilaian majikan bagi <span className="font-bold text-slate-800">{slicerLabel}</span> (Skala 1.00 hingga 5.00)
            </p>
          </div>
        </div>

        {slicerStats.hasData ? (
          <>
            {/* KPI Cards Ringkasan Min */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Keseluruhan</p>
                  <p className="text-2xl font-black text-emerald-800 font-mono">
                    {slicerStats.overallMean.toFixed(2)} <span className="text-xs text-slate-400 font-normal">/ 5.00</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Tertinggi</p>
                  <p className="text-lg font-black text-blue-900 font-mono truncate">
                    {slicerStats.highest?.code}: {slicerStats.highest?.mean.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-black">
                  <Info className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Terendah</p>
                  <p className="text-lg font-black text-amber-900 font-mono truncate">
                    {slicerStats.lowest?.code}: {slicerStats.lowest?.mean.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-black">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pelajar Dinilai</p>
                  <p className="text-2xl font-black text-slate-900 font-mono">
                    {slicerStats.evaluatedCount} <span className="text-xs text-slate-400 font-normal">orang</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Carta Bar Menegak Q1 hingga Q14 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    SKOR MIN MAKLUM BALAS INDUSTRI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Skor min penilaian majikan bagi setiap kriteria pada skala {chartMinScale.toFixed(1)} hingga 5.00
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slicerColor }}></span>
                  <span className="text-xs font-black text-slate-700">{slicerLabel}</span>
                </div>
              </div>

              {/* SVG Column Chart Q1-Q14 */}
              <div className="pt-2 overflow-x-auto">
                <div className="min-w-[680px]">
                  <svg viewBox="0 0 780 270" className="w-full h-auto select-none overflow-visible">
                    {/* Ticks & Horizontal Guidelines */}
                    {chartTicks.map((val) => {
                      const range = 5.0 - chartMinScale;
                      const ratio = (val - chartMinScale) / range;
                      const y = 30 + (170 * (1 - ratio));
                      return (
                        <g key={val}>
                          <line
                            x1="45"
                            y1={y}
                            x2="760"
                            y2={y}
                            stroke="#f1f5f9"
                            strokeWidth="1.2"
                          />
                          <text
                            x="35"
                            y={y + 4}
                            textAnchor="end"
                            fontSize="10"
                            fontWeight="500"
                            fill="#94a3b8"
                            fontFamily="monospace"
                          >
                            {val.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {/* 14 Bars bagi Q1 hingga Q14 */}
                    {slicerStats.items.map((item, idx) => {
                      const totalBars = 14;
                      const availableWidth = 715; // 760 - 45
                      const barWidth = 36;
                      const gap = (availableWidth - (totalBars * barWidth)) / (totalBars + 1);
                      const x = 45 + gap + (idx * (barWidth + gap));

                      const clamped = Math.max(chartMinScale, Math.min(5.0, item.mean));
                      const range = 5.0 - chartMinScale;
                      const barHeight = range > 0 ? ((clamped - chartMinScale) / range) * 170 : 0;
                      const y = 200 - barHeight;

                      return (
                        <g key={item.code} className="cursor-pointer group">
                          {/* Bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(barHeight, 2)}
                            rx="5"
                            ry="5"
                            fill={slicerColor}
                            className="transition-all duration-300 group-hover:opacity-85"
                          />

                          {/* Nilai Min di atas bar */}
                          <text
                            x={x + barWidth / 2}
                            y={y > 45 ? y - 6 : y + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill={y > 45 ? "#1e293b" : "#ffffff"}
                            fontFamily="monospace"
                          >
                            {item.mean > 0 ? item.mean.toFixed(2) : '-'}
                          </text>

                          {/* Kod Q di bawah bar */}
                          <text
                            x={x + barWidth / 2}
                            y="225"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#475569"
                          >
                            {item.code}
                          </text>
                        </g>
                      );
                    })}

                    {/* Baseline */}
                    <line x1="45" y1="200" x2="760" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Senarai 14 Kriteria Terperinci Lengkap */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    PERINCIAN MAKLUM BALAS INDUSTRI
                  </h3>
                  <p className="text-xs text-slate-500">
                    Senarai lengkap kriteria bersama skor min dan tahap pencapaian
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-lg text-slate-700">
                  14 Kriteria Penilaian
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {slicerStats.items.map((q) => {
                  const rating = getRatingBadge(q.mean);
                  const percentOf5 = Math.min(100, Math.max(0, (q.mean / 5.0) * 100));

                  return (
                    <div
                      key={q.code}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white shrink-0 mt-0.5 shadow-2xs"
                            style={{ backgroundColor: slicerColor }}
                          >
                            {q.code}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900 leading-snug">
                              {q.label}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Domain: {q.domain}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-base font-black text-slate-900 font-mono block">
                            {q.mean.toFixed(2)}
                          </span>
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${rating.bg}`}>
                            {rating.text}
                          </span>
                        </div>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="space-y-1 pt-1 border-t border-slate-200/50">
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentOf5}%`,
                              backgroundColor: slicerColor
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Empty State bila tiada data penilaian FLI 01 bagi sesi / slicer terpilih */
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Info className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase">
                Tiada Data Penilaian Industri (FLI 01)
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Tiada rekod penilaian majikan industri (FLI 01) bagi <strong>{slicerLabel}</strong> pada sesi <span className="font-semibold text-slate-700 font-mono">{selectedSession}</span>.
              </p>
            </div>
          </div>
        )}

        {/* =====================================================================
         * KOTAK ANALISIS KESELURUHAN PENILAIAN (Border oren/coral seperti lampiran)
         * ===================================================================== */}
        <div className="border-2 border-orange-500 rounded-2xl p-5 sm:p-6 bg-white shadow-xs space-y-2">
          <h3 className="text-sm font-black text-slate-900 uppercase">
            Analisis:
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
            {slicerStats.hasData ? (
              <>
                Secara keseluruhannya, dapatan maklum balas industri (FLI 01) bagi <strong>{selectedSession}</strong> ({slicerLabel}) adalah positif dengan skor min keseluruhan <strong>{slicerStats.overallMean.toFixed(2)} daripada skala 5.00</strong> (berdasarkan penilaian terhadap {slicerStats.evaluatedCount} orang pelajar). Aspek <strong>{slicerStats.highest?.code} - {slicerStats.highest?.label}</strong> mencatatkan pencapaian tertinggi dengan skor min <strong>{slicerStats.highest?.mean.toFixed(2)}</strong>. Manakala aspek <strong>{slicerStats.lowest?.code} - {slicerStats.lowest?.label}</strong> mencatatkan skor min <strong>{slicerStats.lowest?.mean.toFixed(2)}</strong>, yang boleh dijadikan fokus bimbingan dan pemantapan berterusan sebelum pelajar melangkah ke alam kerjaya sepenuhnya.
              </>
            ) : (
              <>
                Tiada data penilaian majikan industri (FLI 01) bagi program <strong>{slicerLabel}</strong> pada sesi <strong>{selectedSession}</strong> untuk dianalisa. Analisis akan dijana secara automatik sebaik sahaja pihak industri mengisi atau markah FLI 01 dimasukkan ke dalam sistem.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
