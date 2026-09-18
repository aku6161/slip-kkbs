import React from 'react';
import { Student } from '../types';
import { X, User, GraduationCap, Award, Building2, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onOpenDocuments: (docType: 'surat' | 'resume' | 'bjpli' | 'skop') => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onOpenDocuments,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 relative animate-fade-in my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
            {student.namaPelajar.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded mr-2">
              {student.noMatrik}
            </span>
            {student.kelas && (
              <span className="text-[10px] font-bold font-mono bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                Kelas: {student.kelas}
              </span>
            )}
            <h2 className="text-xl font-bold uppercase text-slate-900 mt-1">{student.namaPelajar}</h2>
            <p className="text-xs text-slate-600 font-medium">{student.program} - Kolej Komuniti Beaufort Sabah</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 text-xs text-slate-800 max-h-[60vh] overflow-y-auto pr-1">
          {/* Section 1: Personal & Contact Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-1.5 border-b pb-2 border-slate-200">
              <User className="w-4 h-4 text-blue-900" />
              Maklumat Peribadi Pelajar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-medium">No. Kad Pengenalan:</span>
                <p className="font-bold text-slate-900">{student.noIc}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">No. Telefon:</span>
                <p className="font-bold text-blue-900">{student.noTelefon}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Emel Pelajar:</span>
                <p className="font-bold text-slate-900 truncate">{student.emelPelajar}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Sekolah Menengah:</span>
                <p className="font-semibold text-slate-800">{student.namaSekolahMenengah || 'SMK'}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-medium">Alamat Kediaman:</span>
                <p className="font-semibold text-slate-800">{student.alamat}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Targeted Industry & Academic Advisor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-2">
              <h3 className="font-bold text-blue-900 uppercase text-xs flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-900" />
                Syarikat Industri Sasaran
              </h3>
              <p className="font-bold text-slate-900 uppercase">{student.namaSyarikat}</p>
              <p className="text-blue-900 font-mono text-[11px] truncate">{student.emelHrSyarikat}</p>
              <div className="pt-2 border-t border-blue-200 text-[11px]">
                <span className="text-slate-600 font-medium">Status Permohonan:</span>
                <p className="font-bold text-blue-900">{student.status}</p>
              </div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2">
              <h3 className="font-bold text-amber-900 uppercase text-xs flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-900" />
                Penasihat Akademik (PA)
              </h3>
              <p className="font-bold text-slate-900 uppercase">{student.namaPa || 'NUR AZHARI BIN AZHARUDDIN'}</p>
              <p className="text-slate-700 font-mono">Tel: {student.noTelefonPa}</p>
              <p className="text-slate-700 font-mono text-[11px] truncate">{student.emelPa}</p>
            </div>
          </div>

          {/* Section 3: Achievements & KKBS Activities */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-1.5 border-b pb-2 border-slate-200">
              <Award className="w-4 h-4 text-blue-900" />
              Jawatan, Pencapaian & Program KKBS
            </h3>

            <div>
              <span className="text-slate-500 font-semibold">Jawatan Disandang:</span>
              <p className="font-bold text-blue-900">{student.jawatanKkbs || 'TIADA'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Pencapaian Terbaik:</span>
              <ul className="list-disc pl-4 space-y-1 mt-1 font-medium text-slate-800">
                {[student.pencapaian1, student.pencapaian2, student.pencapaian3]
                  .filter(p => p && p !== 'TIADA')
                  .map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
              </ul>
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Program Diikuti di KKBS:</span>
              <ul className="list-disc pl-4 space-y-1 mt-1 text-slate-700">
                {[student.programKkbs1, student.programKkbs2, student.programKkbs3]
                  .filter(p => p && p !== 'TIADA')
                  .map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer / Document Quick Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-slate-600">Buka 4 Dokumen Latihan Industri SLIP:</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                onClose();
                onOpenDocuments('surat');
              }}
              className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" /> Surat Permohonan
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDocuments('resume');
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              Resume
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDocuments('bjpli');
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              Borang BJPLI
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDocuments('skop');
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              Skop Latihan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
