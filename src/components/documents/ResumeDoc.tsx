import React from 'react';
import { Student } from '../../types';
import { User, Award, BookOpen, Building, Mail, Phone, MapPin, CheckCircle, GraduationCap } from 'lucide-react';

interface ResumeDocProps {
  student: Student;
  aiEnhancedText?: string;
}

export const ResumeDoc: React.FC<ResumeDocProps> = ({ student, aiEnhancedText }) => {
  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-12 max-w-4xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Resume Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-lg mb-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded tracking-widest uppercase">
              RESUME PELAJAR LATIHAN INDUSTRI
            </span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-2 text-white">
              {student.namaPelajar}
            </h1>
            <p className="text-blue-300 font-semibold text-sm mt-1">
              {student.program || 'Sijil Operasi Perhotelan (SOP)'} - Kolej Komuniti Beaufort Sabah
            </p>
          </div>
          <div className="text-right text-xs font-mono bg-slate-800 p-3 rounded border border-slate-700">
            <p className="text-slate-400">NO. MATRIK</p>
            <p className="text-amber-400 font-bold text-base">{student.noMatrik}</p>
            <p className="text-slate-400 mt-1">NO. K/P: {student.noIc}</p>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{student.noTelefon}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{student.emelPelajar}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-1">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">{student.alamat}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (1/3) */}
        <div className="space-y-6">
          {/* Education Section */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 border-b pb-2 border-slate-300">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              PENDIDIKAN
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-900">Sijil Operasi Perhotelan (SOP)</p>
                <p className="text-slate-700 font-medium">Kolej Komuniti Beaufort Sabah</p>
                <p className="text-slate-500 font-mono text-[11px]">2024 - Kini (Semester Akhir)</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900">Sijil Pelajaran Malaysia (SPM)</p>
                <p className="text-slate-700">{student.namaSekolahMenengah || 'Sekolah Menengah Kebangsaan'}</p>
              </div>
            </div>
          </div>

          {/* Academic Reference */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2 mb-3 border-b pb-2 border-blue-200">
              <User className="w-4 h-4 text-blue-900" />
              RUJUKAN PA / PENSYARAH
            </h2>
            <div className="text-xs text-slate-800 space-y-1">
              <p className="font-bold text-slate-900 uppercase">{student.namaPa || 'NUR AZHARI BIN AZHARUDDIN'}</p>
              <p className="text-slate-700 font-medium">Penasihat Akademik / Pensyarah Perhotelan</p>
              <p className="text-slate-600">Kolej Komuniti Beaufort Sabah</p>
              <p className="font-mono text-blue-900 pt-1">Tel: {student.noTelefonPa}</p>
              <p className="font-mono text-blue-900 text-[11px] truncate">{student.emelPa}</p>
            </div>
          </div>

          {/* Target Industry */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-blue-900" />
              SYARIKAT SASARAN
            </h2>
            <p className="text-xs font-bold text-slate-900 uppercase">{student.namaSyarikat}</p>
            <p className="text-[11px] text-slate-600 font-mono mt-1">{student.emelHrSyarikat}</p>
          </div>
        </div>

        {/* Right Column (2/3) */}
        <div className="md:col-span-2 space-y-6">
          {/* Executive Summary / AI Enhanced Overview */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2 border-b-2 border-blue-900 pb-1">
              <BookOpen className="w-4 h-4 text-blue-900" />
              PROFIL & OBJEKTIF KERJAYA
            </h2>
            <p className="text-xs leading-relaxed text-slate-800 text-justify">
              {aiEnhancedText || (
                `Pelajar Sijil Operasi Perhotelan (SOP) dari Kolej Komuniti Beaufort Sabah yang komited, berdisiplin dan mempunyai semangat tinggi untuk menjalani Latihan Industri. Mempunyai asas kukuh dalam perkhidmatan Kaunter Depan (Front Office), Kemas Bilik (Housekeeping), dan Perkhidmatan Makanan & Minuman (F&B) berlandaskan standard perhotelan profesional.`
              )}
            </p>
          </div>

          {/* Leadership & Positions */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 border-b-2 border-blue-900 pb-1">
              <User className="w-4 h-4 text-blue-900" />
              JAWATAN & KEPIMPILAN DI KKBS
            </h2>
            <div className="bg-slate-50 p-3 rounded border border-slate-200">
              <p className="text-xs font-bold text-blue-900 uppercase">{student.jawatanKkbs || 'Ahli Kelab Perhotelan KKBS'}</p>
              <p className="text-xs text-slate-700 mt-1">
                Bertanggungjawab menguruskan program pelajar, kerja berpasukan, serta membantu penganjuran aktiviti perhotelan di Kolej Komuniti Beaufort Sabah.
              </p>
            </div>
          </div>

          {/* Achievements & Awards */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 border-b-2 border-blue-900 pb-1">
              <Award className="w-4 h-4 text-blue-900" />
              PENCAPAIAN & ANUGERAH AKADEMIK
            </h2>
            <div className="space-y-2 text-xs">
              {[student.pencapaian1, student.pencapaian2, student.pencapaian3]
                .filter(p => p && p !== 'TIADA')
                .map((pencapaian, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-amber-50/60 p-2.5 rounded border border-amber-200/80">
                    <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">{pencapaian}</p>
                      <p className="text-[11px] text-slate-600">Peringkat Kolej Komuniti Beaufort / Negeri Sabah</p>
                    </div>
                  </div>
                ))}
              {(!student.pencapaian1 || student.pencapaian1 === 'TIADA') && (
                <p className="text-xs text-slate-500 italic">Peserta Aktif Program Pengajian Perhotelan KKBS</p>
              )}
            </div>
          </div>

          {/* Programs & Workshops Attended */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 border-b-2 border-blue-900 pb-1">
              <BookOpen className="w-4 h-4 text-blue-900" />
              PROGRAM & KURSUS YANG DIIKUTI DI KKBS
            </h2>
            <div className="space-y-2 text-xs">
              {[student.programKkbs1, student.programKkbs2, student.programKkbs3]
                .filter(p => p && p !== 'TIADA')
                .map((prog, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-blue-900 shrink-0"></span>
                    <span className="font-medium text-slate-800">{prog}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Core Hospitality Competencies */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3 border-b-2 border-blue-900 pb-1">
              <CheckCircle className="w-4 h-4 text-blue-900" />
              KOMPETENSI OPERASI PERHOTELAN
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-100 p-2 rounded text-slate-800 font-medium">✓ Front Office Check-in / Out</div>
              <div className="bg-slate-100 p-2 rounded text-slate-800 font-medium">✓ Bed Making Standard (Tuck-it-Right)</div>
              <div className="bg-slate-100 p-2 rounded text-slate-800 font-medium">✓ Table Setting & Banquet Service</div>
              <div className="bg-slate-100 p-2 rounded text-slate-800 font-medium">✓ Sijil Pengendalian Makanan & Hygiene</div>
              <div className="bg-slate-100 p-2 rounded text-slate-800 font-medium">✓ Komunikasi Pelanggan & Etika Hotel</div>
              <div className="bg-slate-100 p-2 rounded text-slate-800 font-medium">✓ Kerja Berpasukan & Disiplin Tinggi</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
