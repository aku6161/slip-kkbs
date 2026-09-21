import React, { useState } from 'react';
import { Student, DocumentType, SystemConfig, Lecturer, IndustryCompany } from '../types';
import { ApplicationForm } from './ApplicationForm';
import { Logo } from './Logo';
import { Calendar, FileText, BookOpen, LogOut, ExternalLink, Utensils, Hotel, Zap, CheckCircle2, Clock } from 'lucide-react';

interface StudentPortalProps {
  icNumber: string;
  students: Student[];
  lecturers?: Lecturer[];
  companies?: IndustryCompany[];
  config: SystemConfig;
  appsScriptUrl: string;
  onSaveStudent: (studentData: Partial<Student>) => Promise<{ success: boolean; student?: Student }>;
  onSelectStudentForDoc: (student: Student, docType: DocumentType) => void;
  onLogout: () => void;
}

const cleanDate = (val: any): string => {
  if (!val) return '';
  const str = String(val).trim();
  if (str.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthNames = ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
  }
  return str;
};

export const StudentPortal: React.FC<StudentPortalProps> = ({
  icNumber,
  students,
  lecturers = [],
  companies = [],
  config,
  appsScriptUrl,
  onSaveStudent,
  onSelectStudentForDoc,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'permohonan' | 'takwim' | 'bukulog'>('permohonan');

  // Check if student already exists
  const cleanIc = icNumber.replace(/\D/g, '');
  const existingStudent = students.find(s => (s.noIc || '').replace(/\D/g, '') === cleanIc);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showSubtitle={false} />
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
            <div className="hidden sm:block">
              <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                PORTAL PELAJAR
              </span>
              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                {existingStudent?.namaPelajar || 'Permohonan Latihan Industri'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Keluar</span>
          </button>
        </div>
      </header>

      {/* Student Nav Tabs */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('permohonan')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'permohonan'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Borang Permohonan</span>
          </button>

          <button
            onClick={() => setActiveTab('takwim')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'takwim'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Takwim &amp; Tarikh LI</span>
          </button>

          <button
            onClick={() => setActiveTab('bukulog')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'bukulog'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Buku Log &amp; Dokumen</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-1">
        {/* Tab 1: Permohonan LI */}
        {activeTab === 'permohonan' && (
          <div>
            <ApplicationForm
              students={students}
              lecturers={lecturers}
              companies={companies}
              config={config}
              appsScriptUrl={appsScriptUrl}
              onSaveStudent={onSaveStudent}
              onSelectStudentForDoc={onSelectStudentForDoc}
              initialIc={icNumber}
              onSuccessSubmit={() => setActiveTab('takwim')}
            />
          </div>
        )}

        {/* Tab 2: Takwim LI */}
        {activeTab === 'takwim' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-amber-400 text-slate-950 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="bg-blue-800 text-blue-100 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                    Sesi Latihan Industri
                  </span>
                  <h1 className="text-xl font-black uppercase tracking-tight text-white">
                    {config.sesi || 'SESI I 2026/2027'}
                  </h1>
                </div>
              </div>
              <p className="text-xs text-slate-300">
                Berikut adalah takwim rasmi latihan industri pelajar Kolej Komuniti Beaufort Sabah.
              </p>
            </div>

            {/* Dates Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Tarikh Latihan Industri */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-900 rounded-xl shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TARIKH LATIHAN INDUSTRI</span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {cleanDate(config.tarikh) || '30 NOVEMBER 2026 HINGGA 19 MAC 2027'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Tempoh: {config.tempoh || '4 BULAN (16 MINGGU)'}</p>
                </div>
              </div>

              {/* Card 2: Tarikh Pemantauan */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-900 rounded-xl shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TARIKH PEMANTAUAN</span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {cleanDate(config.tarikhPemantauan) || '15 JANUARI 2027 HINGGA 15 FEBRUARI 2027'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Pemantauan oleh Pensyarah Penilai (PPIA)</p>
                </div>
              </div>

              {/* Card 3: Tarikh Pembentangan Laporan Akhir */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-900 rounded-xl shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TARIKH PEMBENTANGAN LAPORAN AKHIR</span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {cleanDate(config.tarikhPembentangan) || '22 MAC 2027 HINGGA 26 MAC 2027'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Sesi Penilaian & Pembentangan Akhir LI</p>
                </div>
              </div>

              {/* Card 4: Tarikh Keputusan LI */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TARIKH KEPUTUSAN LI</span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {cleanDate(config.tarikhKeputusan) || '5 APRIL 2027'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Pengumuman Keputusan Gred Latihan Industri</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Buku Log LI */}
        {activeTab === 'bukulog' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 bg-blue-100 text-blue-900 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase">Contoh Penulisan Buku Log LI</h2>
                  <p className="text-xs text-slate-500">
                    Sila pilih program pengajian anda di bawah untuk menyemak panduan & contoh penulisan buku log yang betul.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                {/* Program 1: SKU */}
                <a
                  href="https://drive.google.com/file/d/14UsyaCF3R6FxN2ZuZNZCQfzDVEQ8xTIK/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-5 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-2xl flex items-center justify-between group transition-all shadow-xs cursor-pointer block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-200 text-pink-700 flex items-center justify-center font-bold">
                      <Utensils className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-pink-950 text-base">SKU (Sijil Kulinari)</h3>
                      <p className="text-xs text-pink-700">Contoh penulisan & format panduan buku log SKU</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white text-pink-700 rounded-xl group-hover:scale-105 transition-transform shadow-xs">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </a>

                {/* Program 2: SOP */}
                <a
                  href="https://drive.google.com/file/d/17IiZV7wgZbSkkHf0QpueHCFh3pN_o4LA/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-5 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl flex items-center justify-between group transition-all shadow-xs cursor-pointer block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center font-bold">
                      <Hotel className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-blue-950 text-base">SOP (Sijil Operasi Perhotelan)</h3>
                      <p className="text-xs text-blue-700">Contoh penulisan & format panduan buku log SOP</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white text-blue-800 rounded-xl group-hover:scale-105 transition-transform shadow-xs">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </a>

                {/* Program 3: SKE */}
                <a
                  href="https://drive.google.com/file/d/1bx7OpoA-HwHCe8Z6QnEWVaBP8BIeSPBR/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-2xl flex items-center justify-between group transition-all shadow-xs cursor-pointer block"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-emerald-950 text-base">SKE (Sijil Teknologi Elektrik)</h3>
                      <p className="text-xs text-emerald-700">Contoh penulisan & format panduan buku log SKE</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white text-emerald-800 rounded-xl group-hover:scale-105 transition-transform shadow-xs">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
