import React from 'react';
import { Logo } from './Logo';
import { Users, FileText, Lock, LogOut, ShieldCheck, Settings, Award } from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'form' | 'status' | 'industry' | 'document' | 'config' | 'penilaian' | 'pensyarah' | 'tetapan';
  onNavigate: (view: 'dashboard' | 'form' | 'status' | 'industry' | 'config' | 'penilaian' | 'pensyarah' | 'tetapan') => void;
  isSyncing?: boolean;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-40 print:hidden">
      {/* Top Institutional Bar */}
      <div className="bg-blue-950 text-slate-300 px-4 py-1.5 text-[11px] font-semibold flex flex-col sm:flex-row items-center justify-between border-b border-blue-900 gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>KOLEJ KOMUNITI BEAUFORT SABAH | KEMENTERIAN PENDIDIKAN TINGGI</span>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Mode Admin Aktif
              </span>
              <button
                onClick={onLogoutAdmin}
                className="text-slate-300 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer text-[10px]"
              >
                <LogOut className="w-3 h-3" /> Log Keluar Admin
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminModal}
              className="text-amber-300 hover:text-amber-200 flex items-center gap-1 font-bold transition-colors cursor-pointer text-[11px]"
            >
              <Lock className="w-3 h-3" /> Log Masuk Admin
            </button>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="rounded-xl overflow-hidden shadow-xs shrink-0">
            <Logo size="sm" showSubtitle={false} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase text-white font-sans flex items-center gap-2">
              SLIP KKBS
              <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-black">
                2026
              </span>
            </h1>
            <p className="text-[11px] text-slate-300 font-semibold tracking-wide uppercase">
              Sistem Latihan Industri Pelajar
            </p>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-center w-full md:w-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            1. Statistik Permohonan
          </button>

          <button
            onClick={() => onNavigate('status')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'status'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            2. Status Permohonan
          </button>

          <button
            onClick={() => onNavigate('penilaian')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'penilaian'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            3. Penilaian Pelajar
          </button>

          <button
            onClick={() => onNavigate('tetapan')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'tetapan' || currentView === 'pensyarah' || currentView === 'config'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            4. Tetapan
          </button>
        </div>
      </div>
    </header>
  );
};
