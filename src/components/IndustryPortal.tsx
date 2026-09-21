import React, { useState } from 'react';
import { Student, BJPLIFormData, formatProgramName } from '../types';
import { Building2, CheckCircle2, XCircle, FileText, Send, User, MapPin, Mail, Phone, Award, Sparkles } from 'lucide-react';
import { BorangBJPLIDoc } from './documents/BorangBJPLIDoc';

interface IndustryPortalProps {
  students: Student[];
  onUpdateStudent: (id: string, updatedData: Partial<Student>) => void;
  onOpenDocuments: (student: Student, docType: 'surat' | 'resume' | 'bjpli' | 'skop') => void;
}

export const IndustryPortal: React.FC<IndustryPortalProps> = ({
  students,
  onUpdateStudent,
  onOpenDocuments,
}) => {
  const [selectedHotel, setSelectedHotel] = useState<string>('SEMUA');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  // Extract unique hotel names
  const hotelList = Array.from(new Set(students.map(s => s.namaSyarikat).filter(Boolean)));

  const filteredStudents = students.filter(s =>
    selectedHotel === 'SEMUA' || s.namaSyarikat === selectedHotel
  );

  const handleSaveBjpliResponse = (studentId: string, bjpliData: BJPLIFormData) => {
    let newStatus = studentId;
    let statusText: any = 'Permohonan Dihantar';
    if (bjpliData.keputusan === 'DITERIMA') statusText = 'Lulus / Diterima';
    else if (bjpliData.keputusan === 'DITOLAK') statusText = 'Ditolak';
    else statusText = 'Menunggu Jawapan';

    onUpdateStudent(studentId, {
      bjpliData: bjpliData,
      status: statusText,
      emelHrSyarikat: bjpliData.emelSyarikat || activeStudent?.emelHrSyarikat || ''
    });

    if (activeStudent && activeStudent.id === studentId) {
      setActiveStudent({
        ...activeStudent,
        bjpliData: bjpliData,
        status: statusText
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
            PORTAL RAKAN INDUSTRI & HR HOTEL
          </span>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1">
            Pusat Semakan Permohonan Pelajar KKBS
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sistem SLIP membolehkan Pengurus HR & Penyelia Industri menyemak profil pelajar, memuat turun pakej 4 dokumen rasmi, serta mengesahkan Borang BJPLI secara atas talian.
          </p>
        </div>

        {/* Hotel Filter Selector */}
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 w-full md:w-auto shrink-0">
          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
            Pilih Syarikat / Hotel Anda:
          </label>
          <select
            value={selectedHotel}
            onChange={e => {
              setSelectedHotel(e.target.value);
              setActiveStudent(null);
            }}
            className="w-full bg-slate-900 text-white border border-slate-600 rounded p-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="SEMUA">Semua Syarikat / Hotel Rakan (6)</option>
            {hotelList.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student List for Selected Hotel */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-blue-900" />
            Senarai Permohonan Pelajar ({filteredStudents.length})
          </h2>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                Tiada permohonan pelajar untuk hotel ini.
              </div>
            ) : (
              filteredStudents.map(student => (
                <div
                  key={student.id}
                  onClick={() => setActiveStudent(student)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeStudent?.id === student.id
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md ring-2 ring-blue-400'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      activeStudent?.id === student.id ? 'bg-blue-800 text-amber-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {student.noMatrik}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student.status === 'Lulus / Diterima'
                        ? 'bg-emerald-100 text-emerald-800'
                        : student.status === 'Ditolak'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm uppercase mt-2">{student.namaPelajar}</h3>
                  <p className={`text-xs mt-0.5 font-medium uppercase ${activeStudent?.id === student.id ? 'text-blue-200' : 'text-slate-600'}`}>
                    {formatProgramName(student.program)}
                  </p>

                  <div className={`mt-3 pt-2 border-t text-[11px] flex justify-between items-center ${
                    activeStudent?.id === student.id ? 'border-blue-800 text-blue-200' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span>PA: {student.namaPa}</span>
                    <span className="font-bold">Klik untuk Urus ➔</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Review & Borang BJPLI Editor */}
        <div className="lg:col-span-2">
          {activeStudent ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Active Student Top Info & Documents Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded uppercase">
                    PEMOHON LATIHAN INDUSTRI
                  </span>
                  <h2 className="text-xl font-black uppercase text-slate-900 mt-1">{activeStudent.namaPelajar}</h2>
                  <p className="text-xs text-slate-600 font-medium uppercase">
                    {formatProgramName(activeStudent.program)} | {activeStudent.noMatrik} ({activeStudent.noIc})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onOpenDocuments(activeStudent, 'surat')}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" /> Surat
                  </button>
                  <button
                    onClick={() => onOpenDocuments(activeStudent, 'resume')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => onOpenDocuments(activeStudent, 'skop')}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Skop (20 Mggu)
                  </button>
                </div>
              </div>

              {/* Student Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Pencapaian Terbaik:</span>
                  <p className="font-bold text-slate-900">{activeStudent.pencapaian1 || 'Anugerah Pengarah KKBS'}</p>
                  <p className="text-slate-600">{activeStudent.pencapaian2}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Aktiviti & Kepimpinan:</span>
                  <p className="font-bold text-blue-900">{activeStudent.jawatanKkbs || 'AJK Perhotelan'}</p>
                  <p className="text-slate-600">{activeStudent.programKkbs1}</p>
                </div>
              </div>

              {/* Form BJPLI Interactive Section */}
              <div className="pt-2">
                <h3 className="font-bold text-slate-900 uppercase text-xs mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-700" />
                  Ganti / Sahkan Borang BJPLI-KKBS-01 (Jawapan Industri)
                </h3>
                <BorangBJPLIDoc
                  student={activeStudent}
                  onSaveBjpli={(bjpliData) => handleSaveBjpliResponse(activeStudent.id, bjpliData)}
                  isInteractive={true}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[400px]">
              <Building2 className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-slate-700 text-base">Pilih Pelajar Untuk Menyemak Dokumen</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Sila klik pada mana-mana permohonan pelajar di senarai sebelah kiri untuk melihat pakej 4 dokumen dan mengisikan keputusannya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
