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
  FileSpreadsheet
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

        {/* Filter Sesi Controls */}
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
                  {config.sesi.trim()} (Sesi Terkini)
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

          {/* Sesi Terkini Badge */}
          {config?.sesi && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Sesi Terkini Tetapan: <strong className="font-black text-amber-950">{config.sesi}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* SUBTAB 1: STATISTIK PENEMPATAN LI */}
      {activeSubTab === 'penempatan' && (
        <StatistikPenempatanSubTab
          students={filteredStudents}
          selectedSession={selectedSession}
          activeConfigSession={config?.sesi}
        />
      )}

      {/* SUBTAB 2: STATISTIK PEMANTAUAN LI */}
      {activeSubTab === 'pemantauan' && (
        <StatistikPemantauanSubTab
          students={filteredStudents}
          lecturers={lecturers}
          markah={markah}
          selectedSession={selectedSession}
          activeConfigSession={config?.sesi}
          getStudentMark={getStudentMark}
        />
      )}

      {/* SUBTAB 3: STATISTIK MAKLUM BALAS INDUSTRI */}
      {activeSubTab === 'industri' && (
        <StatistikMaklumBalasIndustriSubTab
          students={filteredStudents}
          markah={markah}
          selectedSession={selectedSession}
          activeConfigSession={config?.sesi}
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
  activeConfigSession?: string;
  lecturers?: Lecturer[];
  markah?: any[];
  getStudentMark?: (student: Student) => any;
}

const StatistikPenempatanSubTab: React.FC<SubTabProps> = ({
  students,
  selectedSession,
  activeConfigSession
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

        {activeConfigSession && (
          <span className="text-[11px] px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-200">
            Sesi Semasa Tetapan: <strong className="text-blue-900">{activeConfigSession}</strong>
          </span>
        )}
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
 * 2. SUBTAB: STATISTIK PEMANTAUAN LI (Carta Pie Pensyarah & FLI 02 Bar)
 * ========================================================================= */
const StatistikPemantauanSubTab: React.FC<SubTabProps> = ({
  students,
  lecturers = [],
  markah = [],
  selectedSession,
  activeConfigSession,
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

    // Jika tiada penugasan aktif bagi sesi ini, gunakan senarai pensyarah yang berdaftar
    return lecturers.map(lec => ({
      id: lec.id || lec.staffId,
      nama: lec.nama,
      gender: getLecturerGender(lec.nama),
      studentCount: 0
    }));
  }, [students, lecturers]);

  const totalPemantau = pemantauLecturers.length;
  const pemantauLelaki = pemantauLecturers.filter(p => p.gender === 'Lelaki').length;
  const pemantauPerempuan = pemantauLecturers.filter(p => p.gender === 'Perempuan').length;

  const lelakiPercent = totalPemantau > 0 ? Math.round((pemantauLelaki / totalPemantau) * 100) : 50;
  const perempuanPercent = totalPemantau > 0 ? 100 - lelakiPercent : 50;

  // 2. Kira Purata FLI 02 (Mengikut Elemen Sesi)
  // Sesi I 2026/2027 menggunakan 3 elemen utama:
  // Q1 - Komunikasi Lisan (CLO 2, 10%)
  // Q2 - Kerja Berpasukan & Tanggungjawab (CLO 3, 5%)
  // Q3 - Kemahiran Personal (CLO 4, 5%)
  const isSesi2026 = useMemo(() => {
    const s = (selectedSession || '').toUpperCase().trim();
    return s.includes('2026/2027') || s.includes('2026') || s === 'SEMUA';
  }, [selectedSession]);

  const [displayMode, setDisplayMode] = useState<'3_elements' | '6_questions'>('3_elements');

  // Selaraskan mod paparan apabila sesi bertukar: Jika 2026/2027, gunakan 3 elemen secara lalai
  React.useEffect(() => {
    if (isSesi2026) {
      setDisplayMode('3_elements');
    }
  }, [isSesi2026, selectedSession]);

  const fli02Scores = useMemo(() => {
    let count = 0;
    // 3 Elemen Utama bagi Sesi I 2026/2027
    const sums3 = [0, 0, 0];
    // 6 Sub-kriteria terperinci
    const sums6 = [0, 0, 0, 0, 0, 0];

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

          // Rekod 6 sub-kriteria
          if (!isNaN(c1_1)) sums6[0] += c1_1;
          if (!isNaN(c1_2)) sums6[1] += c1_2;
          if (!isNaN(c2_1)) sums6[2] += c2_1;
          if (!isNaN(c2_2)) sums6[3] += c2_2;
          if (!isNaN(c3_1)) sums6[4] += c3_1;
          if (!isNaN(c3_2)) sums6[5] += c3_2;

          count += 1;
        }
      }
    });

    if (count > 0) {
      return {
        isLive: true,
        evaluatedCount: count,
        averages3: sums3.map(sum => Number((sum / count).toFixed(2))),
        averages6: sums6.map(sum => Number((sum / count).toFixed(2)))
      };
    }

    return {
      isLive: false,
      evaluatedCount: 0,
      // Benchmark: Q1 (4.46), Q2 (4.65), Q3 (4.29)
      averages3: [4.46, 4.65, 4.29],
      averages6: [4.49, 4.43, 4.26, 4.32, 4.64, 4.65]
    };
  }, [students, getStudentMark]);

  // Senarai kriteria aktif mengikut mod (3 Elemen Utama atau 6 Sub-kriteria)
  const isThreeElements = displayMode === '3_elements';

  const questionsList = useMemo(() => {
    if (isThreeElements) {
      return [
        { 
          code: 'Q1', 
          text: 'Komunikasi Lisan', 
          desc: '1.1 & 1.2 Kemahiran menjawab soalan & penyampaian idea', 
          clo: 'CLO 2', 
          weight: '10%',
          score: fli02Scores.averages3[0] 
        },
        { 
          code: 'Q2', 
          text: 'Kerja Berpasukan & Tanggungjawab', 
          desc: '2.1 & 2.2 Hubungan rakan sekerja & tanggungjawab tugasan', 
          clo: 'CLO 3', 
          weight: '5%',
          score: fli02Scores.averages3[1] 
        },
        { 
          code: 'Q3', 
          text: 'Kemahiran Personal', 
          desc: '3.1 & 3.2 Organisasi maklumat & inisiatif bermotivasi', 
          clo: 'CLO 4', 
          weight: '5%',
          score: fli02Scores.averages3[2] 
        },
      ];
    }

    return [
      { code: 'Q1', text: 'Kemahiran menjawab soalan', desc: 'Kefahaman dan ketepatan menjawab', clo: 'CLO 2', weight: '5%', score: fli02Scores.averages6[0] },
      { code: 'Q2', text: 'Penyampaian idea', desc: 'Penyampaian yang teratur dan berkesan', clo: 'CLO 2', weight: '5%', score: fli02Scores.averages6[1] },
      { code: 'Q3', text: 'Organisasi idea', desc: 'Kebolehan menyusun maklumat kerja', clo: 'CLO 4', weight: '2.5%', score: fli02Scores.averages6[2] },
      { code: 'Q4', text: 'Visi', desc: 'Bermotivasi dan berpandangan jauh', clo: 'CLO 4', weight: '2.5%', score: fli02Scores.averages6[3] },
      { code: 'Q5', text: 'Kerja berpasukan', desc: 'Membina hubungan baik dalam organisasi', clo: 'CLO 3', weight: '2.5%', score: fli02Scores.averages6[4] },
      { code: 'Q6', text: 'Tanggungjawab kerja', desc: 'Melaksanakan tugasan dengan proaktif', clo: 'CLO 3', weight: '2.5%', score: fli02Scores.averages6[5] },
    ];
  }, [isThreeElements, fli02Scores]);

  // SVG Donut calculation
  // Angle for Lelaki
  const angleLelaki = (lelakiPercent / 100) * 360;
  // Arc calculation for SVG Pie/Donut (center at 100, 100, radius 80)
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

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

        {activeConfigSession && (
          <span className="text-[11px] px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-200">
            Sesi Semasa Tetapan: <strong className="text-blue-900">{activeConfigSession}</strong>
          </span>
        )}
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

          {/* SVG Donut Chart */}
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
        </div>
      </div>

      {/* =====================================================================
       * DAPATAN PEMANTAUAN (FLI 02) - MENGIKUT ELEMEN SESI
       * Sesi I 2026/2027: Q1, Q2, Q3
       * ===================================================================== */}
      <div className="bg-[#f8fafc] p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Title and Element Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Dapatan Pemantauan
              </h2>
              {fli02Scores.isLive ? (
                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full border border-emerald-300">
                  Data Sebenar: {fli02Scores.evaluatedCount} Pelajar Dinilai
                </span>
              ) : (
                <span className="text-xs px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full border border-amber-300">
                  Data Penanda Aras (Benchmark)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isThreeElements 
                ? 'Penilaian 3 Elemen Utama bagi Sesi I 2026/2027 berasaskan skala 1.00 hingga 5.00'
                : 'Pecahan 6 Sub-Kriteria Terperinci Borang FLI 02'}
            </p>
          </div>

          {/* Elemen Selector Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setDisplayMode('3_elements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayMode === '3_elements'
                  ? 'bg-[#14532d] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              3 Elemen Utama (Sesi I 2026/2027)
            </button>
            <button
              onClick={() => setDisplayMode('6_questions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                displayMode === '6_questions'
                  ? 'bg-[#14532d] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              6 Sub-Kriteria
            </button>
          </div>
        </div>

        {/* Layout: Chart on Left, Legend on Right */}
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

              {/* Bars: 3 Elemen Utama atau 6 Sub-kriteria */}
              {questionsList.map((q, idx) => {
                // Konfigurasi saiz dan kedudukan bar
                const barWidth = isThreeElements ? 74 : 46;
                const totalBars = questionsList.length;
                const availableWidth = 435; // 480 - 45
                const totalBarWidth = totalBars * barWidth;
                const gap = (availableWidth - totalBarWidth) / (totalBars + 1);
                const x = 45 + gap + (idx * (barWidth + gap));

                // Skala: 3.0 -> y=210, 5.0 -> y=30 (tinggi penuh = 180px bagi julat 2.0)
                const clampedScore = Math.max(3.0, Math.min(5.0, q.score));
                const barHeight = ((clampedScore - 3.0) / 2.0) * 180;
                const y = 210 - barHeight;

                return (
                  <g key={q.code} className="cursor-pointer group">
                    {/* Bar */}
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
                    {/* Value inside bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y + 24}
                      textAnchor="middle"
                      fontSize={isThreeElements ? "13" : "11"}
                      fontWeight="bold"
                      fill="#ffffff"
                      fontFamily="monospace"
                    >
                      {q.score.toFixed(2)}
                    </text>
                    {/* X-axis Label below bar */}
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
                    <span>{q.desc || q.text}</span>
                    <span className="font-semibold text-slate-700">{q.clo} ({q.weight})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footnote matching Image 1 */}
        <p className="text-xs italic text-slate-500 font-medium pt-2 border-t border-slate-200">
          Penilaian dijalankan menggunakan Borang Penilaian Pensyarah Pemantau, <strong>FLI 02</strong>.
        </p>
      </div>

      {/* =====================================================================
       * ANALISA DAPATAN PEMANTAUAN
       * ===================================================================== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Award className="w-5 h-5 text-emerald-700" />
          <h3 className="text-sm font-black text-slate-900 uppercase">
            Analisa Dapatan Pemantauan
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
          Secara keseluruhannya, dapatan penilaian pemantauan pensyarah (FLI 02) bagi <strong>{selectedSession}</strong> menunjukkan tahap pencapaian kompetensi pelajar yang sangat memuaskan dengan purata skor keseluruhan melebihi <strong>4.20 daripada 5.00</strong>. Aspek <strong>{questionsList[1]?.text || 'Kerja Berpasukan & Tanggungjawab'} (Skor: {questionsList[1]?.score.toFixed(2)})</strong> mencatatkan pencapaian tertinggi, disusuli oleh <strong>{questionsList[0]?.text || 'Komunikasi Lisan'} (Skor: {questionsList[0]?.score.toFixed(2)})</strong> yang membuktikan kemahiran berkomunikasi dan interaksi pelajar bersama pensyarah serta rakan sekerja di tempat latihan berada pada standard terpuji. Manakala aspek <strong>{questionsList[2]?.text || 'Kemahiran Personal'} (Skor: {questionsList[2]?.score.toFixed(2)})</strong> turut menunjukkan kesiapsiagaan kendiri yang baik dengan ruang penambahbaikan dari sudut inisiatif berterusan dan pengurusan organisasi idea.
        </p>
      </div>
    </div>
  );
};

/* =========================================================================
 * 3. SUBTAB: STATISTIK MAKLUM BALAS INDUSTRI (FLI 01 - IMAGE 2)
 * ========================================================================= */
const StatistikMaklumBalasIndustriSubTab: React.FC<SubTabProps> = ({
  students,
  markah = [],
  selectedSession,
  activeConfigSession,
  getStudentMark
}) => {
  // Baseline data daripada lampiran Image 2
  const baselineSKE = [4.56, 4.18, 4.28, 4.35, 4.40, 4.24, 4.55, 4.59, 4.51, 4.20, 4.63, 4.52, 4.41, 4.20];
  const baselineSKU = [3.82, 3.65, 3.69, 3.82, 3.62, 3.76, 3.61, 3.75, 3.61, 3.58, 4.08, 4.14, 4.04, 4.11];
  const baselineSOP = [3.72, 3.50, 3.72, 3.50, 3.54, 3.64, 3.58, 3.68, 3.34, 3.30, 3.72, 3.55, 3.54, 3.68];

  // Kira data sebenar daripada markah FLI 01 mengikut program jika wujud
  const evaluatedStats = useMemo(() => {
    const calcProgramAverages = (progCode: 'SKU' | 'SKE' | 'SOP', baseline: number[]) => {
      const progStudents = students.filter(s => normalizeProgramCode(s.program) === progCode);
      let count = 0;
      const sums = new Array(14).fill(0);

      progStudents.forEach(s => {
        const m = getStudentMark ? getStudentMark(s) : null;
        if (m && (m['FLI01-A1'] !== undefined || m['TOTAL1'] !== undefined)) {
          let hasVal = false;
          for (let i = 1; i <= 14; i++) {
            const val = parseFloat(m[`FLI01-A${i}`]);
            if (!isNaN(val)) {
              sums[i - 1] += val;
              hasVal = true;
            }
          }
          if (hasVal) count++;
        }
      });

      if (count > 0) {
        return {
          isLive: true,
          count,
          scores: sums.map(sum => Number((sum / count).toFixed(2)))
        };
      }

      return {
        isLive: false,
        count: 0,
        scores: baseline
      };
    };

    return {
      SKU: calcProgramAverages('SKU', baselineSKU),
      SKE: calcProgramAverages('SKE', baselineSKE),
      SOP: calcProgramAverages('SOP', baselineSOP)
    };
  }, [students, getStudentMark]);

  // Reusable Component for SVG Line Chart
  const RenderLineChart = ({
    title,
    questions,
    isHighlighted = false
  }: {
    title: string;
    questions: { index: number; label: string }[];
    isHighlighted?: boolean;
  }) => {
    const n = questions.length;
    // Dimensions
    const svgWidth = isHighlighted ? 580 : 380;
    const svgHeight = 175;
    const padLeft = 40;
    const padRight = 30;
    const padTop = 20;
    const padBottom = 30;
    const innerW = svgWidth - padLeft - padRight;
    const innerH = svgHeight - padTop - padBottom;

    // Y mapping: scale 3.0 -> y=padTop+innerH (145), 5.0 -> y=padTop (20)
    const getY = (val: number) => {
      const clamped = Math.max(3.0, Math.min(5.0, val));
      return padTop + innerH * (1 - (clamped - 3.0) / 2.0);
    };

    const getX = (i: number) => {
      if (n === 1) return padLeft + innerW / 2;
      return padLeft + (i / (n - 1)) * innerW;
    };

    // Series lines
    const getPathData = (scores: number[]) => {
      return questions
        .map((q, i) => {
          const x = getX(i);
          const y = getY(scores[q.index]);
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
    };

    const pathSKE = getPathData(evaluatedStats.SKE.scores);
    const pathSKU = getPathData(evaluatedStats.SKU.scores);
    const pathSOP = getPathData(evaluatedStats.SOP.scores);

    return (
      <div
        className={`bg-white p-4 rounded-2xl shadow-xs transition-all ${
          isHighlighted
            ? 'border-2 border-purple-300 ring-2 ring-purple-100/50'
            : 'border border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
            {title}
          </h4>
        </div>

        <div className="pt-2">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none overflow-visible">
            {/* Gridlines for 3.0, 3.5, 4.0, 4.5, 5.0 */}
            {[5.0, 4.5, 4.0, 3.5, 3.0].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={padLeft - 5}
                    y1={y}
                    x2={svgWidth - padRight + 10}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1.2"
                  />
                  <text
                    x={padLeft - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* SKE Line (Green #15803d) */}
            <path
              d={pathSKE}
              fill="none"
              stroke="#15803d"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* SKU Line (Orange #f97316) */}
            <path
              d={pathSKU}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* SOP Line (Navy Blue #1e3a8a) */}
            <path
              d={pathSOP}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Markers for Each Question */}
            {questions.map((q, i) => {
              const x = getX(i);
              const ySKE = getY(evaluatedStats.SKE.scores[q.index]);
              const ySKU = getY(evaluatedStats.SKU.scores[q.index]);
              const ySOP = getY(evaluatedStats.SOP.scores[q.index]);

              return (
                <g key={q.label}>
                  {/* SKE Dot */}
                  <circle cx={x} cy={ySKE} r="4.5" fill="#15803d" stroke="#ffffff" strokeWidth="1.5" />
                  {/* SKU Dot */}
                  <circle cx={x} cy={ySKU} r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                  {/* SOP Dot */}
                  <circle cx={x} cy={ySOP} r="4.5" fill="#1e3a8a" stroke="#ffffff" strokeWidth="1.5" />

                  {/* X-axis Label below */}
                  <text
                    x={x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#64748b"
                  >
                    {q.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
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
              Statistik Maklum Balas Industri (FLI 01)
            </h2>
            <p className="text-xs text-slate-500">
              Analisis dapatan penilaian prestasi pelajar oleh pihak majikan industri bagi sesi: <span className="font-bold text-blue-950 font-mono">{selectedSession}</span>
            </p>
          </div>
        </div>

        {activeConfigSession && (
          <span className="text-[11px] px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-200">
            Sesi Semasa Tetapan: <strong className="text-blue-900">{activeConfigSession}</strong>
          </span>
        )}
      </div>

      {/* Main Container: Dapatan Penilaian matching Image 2 */}
      <div className="bg-[#f8fafc] p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Title and Program Legend at Top-Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dapatan Penilaian
            </h2>
            <p className="text-xs text-slate-500">
              Skor purata berasaskan skala 3.0 hingga 5.0 merentasi 5 domain kompetensi industri
            </p>
          </div>

          {/* Program Legend matching Image 2 */}
          <div className="flex items-center gap-5 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <span className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="w-3.5 h-3.5 rounded-full bg-[#f97316]"></span>
              <span>SKU</span>
            </span>
            <span className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="w-3.5 h-3.5 rounded-full bg-[#15803d]"></span>
              <span>SKE</span>
            </span>
            <span className="flex items-center gap-2 text-xs font-black text-slate-800">
              <span className="w-3.5 h-3.5 rounded-full bg-[#1e3a8a]"></span>
              <span>SOP</span>
            </span>
          </div>
        </div>

        {/* 1. Kemahiran di tempat kerja (Q1 to Q6) - Featured Highlighted Chart */}
        <div>
          <RenderLineChart
            title="Kemahiran di tempat kerja"
            isHighlighted={true}
            questions={[
              { index: 0, label: 'Q1' },
              { index: 1, label: 'Q2' },
              { index: 2, label: 'Q3' },
              { index: 3, label: 'Q4' },
              { index: 4, label: 'Q5' },
              { index: 5, label: 'Q6' },
            ]}
          />
        </div>

        {/* 2x2 Grid for Remaining 4 Aspect Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 2: Komunikasi berkesan (Q7, Q8) */}
          <RenderLineChart
            title="Komunikasi berkesan"
            questions={[
              { index: 6, label: 'Q7' },
              { index: 7, label: 'Q8' },
            ]}
          />

          {/* Chart 3: Kerja berpasukan dan bertanggungjawab (Q9, Q10) */}
          <RenderLineChart
            title="Kerja berpasukan dan bertanggungjawab"
            questions={[
              { index: 8, label: 'Q9' },
              { index: 9, label: 'Q10' },
            ]}
          />

          {/* Chart 4: Kemahiran Personal (Q11, Q12) */}
          <RenderLineChart
            title="Kemahiran Personal"
            questions={[
              { index: 10, label: 'Q11' },
              { index: 11, label: 'Q12' },
            ]}
          />

          {/* Chart 5: Nilai, etika dan profesionalisme (Q13, Q14) */}
          <RenderLineChart
            title="Nilai, etika dan profesionalisme"
            questions={[
              { index: 12, label: 'Q13' },
              { index: 13, label: 'Q14' },
            ]}
          />
        </div>

        {/* Analisis Box matching Image 2 with orange/coral border */}
        <div className="border-2 border-orange-500 rounded-2xl p-5 sm:p-6 bg-white shadow-xs space-y-2">
          <h3 className="text-sm font-black text-slate-900 uppercase">
            Analisis:
          </h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
            Secara keseluruhannya, penilaian majikan terhadap pelajar adalah positif, dengan aspek kemahiran di tempat kerja, komunikasi, kerja berpasukan, tanggungjawab serta etika dan profesionalisme menunjukkan pencapaian yang baik. Pelajar SKE mencatat pencapaian yang lebih tinggi dalam kebanyakan aspek, manakala pelajar SKU dan SOP berada pada tahap baik. Namun, aspek kemahiran mengurus dan minda keusahawanan masih perlu diperkukuhkan bagi meningkatkan kompetensi dan kesiapsiagaan pelajar menghadapi alam pekerjaan.
          </p>
        </div>
      </div>
    </div>
  );
};

