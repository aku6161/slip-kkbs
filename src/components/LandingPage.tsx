import React, { useState } from 'react';
import { Logo } from './Logo';
import logo3d from '../logo.png';
import { ShieldCheck, User, Lock, Laptop, CheckCircle2, AlertCircle, X, ChevronRight, GraduationCap } from 'lucide-react';

interface LandingPageProps {
  onStudentLogin: (icNumber: string) => void;
  onAdminLogin: (password: string) => void;
  onLecturerLogin: (staffId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStudentLogin, onAdminLogin, onLecturerLogin }) => {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);
  
  const [icInput, setIcInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [staffIdInput, setStaffIdInput] = useState('');
  
  const [studentError, setStudentError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [lecturerError, setLecturerError] = useState('');

  const handleLecturerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffIdInput.trim()) {
      setLecturerError('Sila masukkan ID Staf yang sah.');
      return;
    }
    onLecturerLogin(staffIdInput.trim());
  };

  // Format IC as 000000-00-0000
  const handleIcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 12) val = val.slice(0, 12);

    if (val.length > 8) {
      val = `${val.slice(0, 6)}-${val.slice(6, 8)}-${val.slice(8)}`;
    } else if (val.length > 6) {
      val = `${val.slice(0, 6)}-${val.slice(6)}`;
    }
    setIcInput(val);
    if (studentError) setStudentError('');
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIc = icInput.replace(/\D/g, '');
    if (cleanIc.length !== 12) {
      setStudentError('Sila masukkan 12 digit No. Kad Pengenalan yang sah.');
      return;
    }
    onStudentLogin(icInput);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === 'upliakkbs2022') {
      onAdminLogin(adminPasswordInput);
    } else {
      setAdminError('Kata laluan admin tidak sah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-between font-sans">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl px-4 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <Logo size="sm" showSubtitle={true} />
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-md px-5 py-8 flex-1 flex flex-col items-center justify-center text-center">
        {/* Main Banner Heading */}
        <div className="flex flex-col items-center space-y-4 mb-8">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest">
            Selamat Datang
          </p>
          <img
            src={logo3d}
            alt="Logo SLIP"
            style={{ height: '160px', mixBlendMode: 'multiply' }}
            className="w-auto object-contain select-none"
          />
          {/* Title matching SLIP logo theme */}
          <div className="flex items-center gap-0 text-center leading-none mt-1">
            <span className="text-[13px] sm:text-[15px] font-black tracking-[0.18em] uppercase text-blue-900">
              SISTEM LATIHAN INDUSTRI&nbsp;
            </span>
            <span className="text-[13px] sm:text-[15px] font-black tracking-[0.18em] uppercase text-red-600">
              PELAJAR
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-xs mx-auto mt-1">
            Permohonan Latihan Industri kini lebih mudah &amp; pantas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3.5 mt-2">
          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="w-full py-4 px-6 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
          >
            <User className="w-5 h-5" />
            <span>Log Masuk Pelajar</span>
          </button>

          <button
            onClick={() => setIsLecturerModalOpen(true)}
            className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span>Log Masuk Pensyarah Pemantau</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        © 2026 Kolej Komuniti Beaufort Sabah. Hak Cipta Terpelihara.
      </footer>

      {/* Student Login Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Log Masuk Pelajar</h3>
                  <p className="text-xs text-slate-500">Gunakan No. IC untuk akses portal permohonan</p>
                </div>
              </div>
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                  No. Kad Pengenalan Pelajar: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 060503120288"
                  value={icInput}
                  onChange={handleIcChange}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold text-slate-900 bg-slate-50/50"
                  autoFocus
                />
              </div>

              {studentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{studentError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-blue-900 hover:bg-blue-800 text-white font-extrabold rounded-2xl shadow-md uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Sahkan Kad Pengenalan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Log Masuk Admin</h3>
                  <p className="text-xs text-slate-500">Akses Pengurusan UPLI KKBS</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                  Kata Laluan Admin: *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan kata laluan"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold text-slate-900 bg-slate-50/50"
                  autoFocus
                />
              </div>

              {adminError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Log Masuk Admin</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lecturer Login Modal */}
      {isLecturerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Log Masuk Pensyarah</h3>
                  <p className="text-xs text-slate-500">Gunakan ID Staff untuk akses Portal Pemantauan</p>
                </div>
              </div>
              <button
                onClick={() => setIsLecturerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLecturerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                  ID Staf Pensyarah: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: staff123"
                  value={staffIdInput}
                  onChange={(e) => {
                    setStaffIdInput(e.target.value);
                    if (lecturerError) setLecturerError('');
                  }}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-900 outline-none text-sm font-bold text-slate-900 bg-slate-50/50"
                  autoFocus
                />
              </div>

              {lecturerError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{lecturerError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-2xl shadow-md uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Log Masuk Pensyarah</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
