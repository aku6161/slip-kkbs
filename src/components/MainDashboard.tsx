import React, { useState } from 'react';
import { Student } from '../types';
import { SHEET_URL } from '../data/initialData';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Send, 
  Filter, 
  Utensils, 
  Zap, 
  Hotel, 
  UserCheck, 
  UserX, 
  UserPlus, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

interface MainDashboardProps {
  students: Student[];
  onNavigateTab: (view: 'form' | 'status') => void;
  onOpenNewForm: () => void;
  hideWelcomeHeader?: boolean;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  students,
  onNavigateTab,
  onOpenNewForm,
  hideWelcomeHeader = false,
}) => {
  const [selectedSession, setSelectedSession] = useState<string>('SEMUA');

  // Available sessions dynamically generated from live student data
  const dynamicSessions = Array.from(new Set(students.map(s => s.sesi).filter(Boolean)));
  const sessions = ['SEMUA', ...dynamicSessions];

  // Filter students by selected session
  const filteredStudents = students.filter(s => {
    if (selectedSession === 'SEMUA') return true;
    return s.sesi === selectedSession;
  });

  // Overall Statistics Calculation
  const totalCount = filteredStudents.length;
  
  // Memohon count (Permohonan Dihantar or Memohon)
  const memohonCount = filteredStudents.filter(s => 
    s.status === 'Permohonan Dihantar' || s.status === 'Memohon'
  ).length;

  // Diterima count (Lulus / Diterima or Diterima)
  const diterimaCount = filteredStudents.filter(s => 
    s.status === 'Lulus / Diterima' || s.status === 'Diterima'
  ).length;

  // Belum Memohon count
  const belumMemohonCount = filteredStudents.filter(s => 
    s.status === 'Belum Memohon'
  ).length;



  // Function to calculate program statistics flexibly
  const getProgramStats = (...keywords: string[]) => {
    const proStudents = filteredStudents.filter(s => {
      const prog = (s.program || '').toLowerCase();
      return keywords.some(kw => prog.includes(kw.toLowerCase()));
    });

    const total = proStudents.length;
    const memohon = proStudents.filter(s => 
      s.status === 'Permohonan Dihantar' || s.status === 'Memohon'
    ).length;
    const diterima = proStudents.filter(s => 
      s.status === 'Lulus / Diterima' || s.status === 'Diterima'
    ).length;
    const belumMemohon = proStudents.filter(s => s.status === 'Belum Memohon').length;

    const rate = total > 0 ? Math.round((diterima / total) * 100) : 0;

    return { total, memohon, diterima, belumMemohon, rate };
  };

  const skuStats = getProgramStats('Kulinari', 'SKU');
  const steStats = getProgramStats('Elektrik', 'SKE', 'STE');
  const sopStats = getProgramStats('Perhotelan', 'SOP', 'Hotel');

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      {!hideWelcomeHeader && (
        <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
            <Building2 className="w-96 h-96 text-white" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black tracking-wide uppercase">
              <Award className="w-3.5 h-3.5" /> Portal Rasmi Kolej Komuniti Beaufort Sabah
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat datang ke laman sistem latihan industri pelajar (SLIP)
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Pengurusan bersepadu permohonan latihan industri (LI).
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab('form')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Mohon / Kemaskini Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sesi Latihan Industri */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-900 rounded-lg">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase">Sesi Latihan Industri</h2>
            <p className="text-xs text-slate-500">Pilih sesi pengajian untuk menyaring data permohonan & statistik</p>
          </div>
        </div>

        <div>
          <select
            value={selectedSession}
            onChange={e => setSelectedSession(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
          >
            {sessions.map(sesi => (
              <option key={sesi} value={sesi}>
                {sesi === 'SEMUA' ? 'Semua Sesi' : sesi}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistik Keseluruhan Permohonan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-900" />
            Statistik Keseluruhan Permohonan
            <span className="text-xs font-normal text-slate-500">({selectedSession})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Pelajar</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900">{totalCount}</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">100%</span>
            </div>
          </div>

          {/* Memohon */}
          <div className="bg-white p-4.5 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[11px] font-bold uppercase tracking-wider">Memohon</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-700">{memohonCount}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                {totalCount > 0 ? Math.round((memohonCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Diterima */}
          <div className="bg-white p-4.5 rounded-xl border border-blue-200 shadow-xs flex flex-col justify-between bg-blue-50/20">
            <div className="flex items-center justify-between text-blue-900">
              <span className="text-[11px] font-bold uppercase tracking-wider">Diterima</span>
              <CheckCircle2 className="w-4 h-4 text-blue-700" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-blue-900">{diterimaCount}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">
                {totalCount > 0 ? Math.round((diterimaCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Belum Memohon */}
          <div className="bg-white p-4.5 rounded-xl border border-rose-200 shadow-xs flex flex-col justify-between bg-rose-50/20">
            <div className="flex items-center justify-between text-rose-800">
              <span className="text-[11px] font-bold uppercase tracking-wider">Belum Memohon</span>
              <UserX className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-rose-700">{belumMemohonCount}</span>
              <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">
                {totalCount > 0 ? Math.round((belumMemohonCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>


        </div>
      </div>

      {/* Statistik Mengikut Program */}
      <div className="space-y-4">
        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-900" />
          Statistik Mengikut Program Pengajian
          <span className="text-xs font-normal text-slate-500">({selectedSession})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Program 1: Sijil Kulinari (SKU) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-pink-400 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                  <Utensils className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Sijil Kulinari</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-pink-50 text-pink-800 font-mono font-bold text-xs rounded-lg border border-pink-200">
                {skuStats.total} Pelajar
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Belum Memohon:
                </span>
                <span className="font-bold text-rose-600">{skuStats.belumMemohon} Pelajar</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Memohon:
                </span>
                <span className="font-bold text-emerald-700">{skuStats.memohon} Pelajar</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Diterima:
                </span>
                <span className="font-bold text-blue-900">{skuStats.diterima} Pelajar</span>
              </div>
            </div>
          </div>

          {/* Program 2: Sijil Teknologi Elektrik (STE) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-emerald-400 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Sijil Teknologi Elektrik</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-mono font-bold text-xs rounded-lg border border-emerald-200">
                {steStats.total} Pelajar
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Belum Memohon:
                </span>
                <span className="font-bold text-rose-600">{steStats.belumMemohon} Pelajar</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Memohon:
                </span>
                <span className="font-bold text-emerald-700">{steStats.memohon} Pelajar</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Diterima:
                </span>
                <span className="font-bold text-blue-900">{steStats.diterima} Pelajar</span>
              </div>
            </div>
          </div>

          {/* Program 3: Sijil Operasi Perhotelan (SOP) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Hotel className="w-5 h-5 text-blue-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Sijil Operasi Perhotelan</h3>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-900 font-mono font-bold text-xs rounded-lg border border-blue-200">
                {sopStats.total} Pelajar
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Belum Memohon:
                </span>
                <span className="font-bold text-rose-600">{sopStats.belumMemohon} Pelajar</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Memohon:
                </span>
                <span className="font-bold text-emerald-700">{sopStats.memohon} Pelajar</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Diterima:
                </span>
                <span className="font-bold text-blue-900">{sopStats.diterima} Pelajar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
