import React from 'react';
import { Student, SystemConfig } from '../../types';
import { STANDARD_SOP_SCOPES } from '../../data/initialData';
import { BookOpen, CheckCircle, Clock, FileCheck } from 'lucide-react';

interface SkopLatihanDocProps {
  student: Student;
  config?: SystemConfig;
}

export const SkopLatihanDoc: React.FC<SkopLatihanDocProps> = ({ student, config }) => {
  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-12 max-w-4xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Header Banner */}
      <div className="border-b-2 border-blue-900 pb-4 mb-6 flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded uppercase">
            SILABUS OPERASI INDUSTRI
          </span>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
            DOKUMEN SKOP LATIHAN INDUSTRI ({config?.tempoh || '20 MINGGU'})
          </h1>
          <p className="text-xs font-bold text-blue-900 uppercase">
            {student.program || 'Sijil Operasi Perhotelan (SOP)'} - KOLEJ KOMUNITI BEAUFORT SABAH
          </p>
        </div>
        <div className="text-right text-xs font-mono text-slate-600">
          <p>RUJUKAN SILABUS</p>
          <p className="font-bold text-blue-900">SKOP-KKBS-SOP-2026</p>
        </div>
      </div>

      {/* Overview & Objective */}
      <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6 text-xs leading-relaxed">
        <h2 className="font-bold text-slate-900 uppercase text-xs mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-900" />
          Tujuan & Objektif Skop Latihan Industri:
        </h2>
        <p className="text-slate-700">
          Dokumen ini merupakan panduan skop kerja dan pembelajaran praktikal bagi pelajar <strong className="text-slate-900">{student.namaPelajar}</strong> ({student.noMatrik}) sepanjang tempoh {config?.tempoh ? config.tempoh.toLowerCase() : '20 minggu'} penempatan di <strong className="text-slate-900">{student.namaSyarikat}</strong>. Pihak penyelia industri dipohon untuk memandu dan menilai pelajar berdasarkan modul-modul berikut:
        </p>
      </div>

      {/* Modules Table / List */}
      <div className="space-y-6">
        {STANDARD_SOP_SCOPES.map((module, idx) => (
          <div key={module.id} className="border border-slate-300 rounded overflow-hidden shadow-xs">
            <div className="bg-blue-900 text-white p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-900 font-mono font-bold text-xs px-2 py-0.5 rounded">
                  {module.kod}
                </span>
                <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                  {module.tajuk}
                </h3>
              </div>
              <span className="text-xs bg-blue-800 text-blue-100 px-2.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {module.tempohMinggu}
              </span>
            </div>

            <div className="p-4 bg-white text-xs space-y-3">
              <p className="text-slate-700 italic border-l-2 border-amber-500 pl-2">
                {module.penerangan}
              </p>

              <div>
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1.5 text-blue-900">
                  Sub-Topik / Aktiviti Industri Diperlukan:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {module.subTopik.map((sub, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-1.5 bg-slate-50 p-2 rounded border border-slate-100">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-900 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium">{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-1 text-emerald-900">
                  Hasil Pembelajaran Diharapkan (Learning Outcomes):
                </h4>
                <ul className="list-disc pl-5 text-slate-700 space-y-0.5 text-[11px]">
                  {module.hasilPembelajaran.map((hasil, hIdx) => (
                    <li key={hIdx}>{hasil}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supervisor Verification Footer */}
      <div className="mt-8 pt-6 border-t-2 border-slate-300 text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="font-bold text-slate-900 mb-1">PENGESAHAN PENASIHAT AKADEMIK KKBS:</p>
          <p className="font-bold text-blue-900 uppercase">{student.namaPa || 'NUR AZHARI BIN AZHARUDDIN'}</p>
          <p className="text-slate-600">Pegawai Latihan Industri KKBS</p>
          <p className="text-slate-500 font-mono text-[11px]">Tarikh Diluluskan: {student.tarikhSurat || '15 Mac 2026'}</p>
        </div>

        <div className="bg-slate-50 p-3 rounded border border-slate-200">
          <p className="font-bold text-slate-900 mb-1">AKUAN TERIMA PENYELIA INDUSTRI:</p>
          <p className="text-slate-600 text-[11px] mb-4">
            Saya mengesahkan menerima Skop Latihan Industri ini untuk dijadikan panduan latihan pelajar di syarikat kami.
          </p>
          <div className="border-b border-slate-400 w-36 mb-1"></div>
          <p className="text-[10px] text-slate-500 uppercase font-mono">Tandatangan & Cop Penyelia Industri</p>
        </div>
      </div>
    </div>
  );
};
