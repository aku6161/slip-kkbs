import React, { useState } from 'react';
import { Student, ApplicationStatus } from '../types';
import { Search, Filter, FileText, CheckCircle2, Clock, XCircle, Send, Sparkles, Eye, UserPlus, Building, Phone, Mail, AlertCircle, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentListProps {
  students: Student[];
  onSelectStudent: (student: Student, defaultDoc?: 'surat' | 'resume' | 'bjpli' | 'skop') => void;
  onOpenSettings: () => void;
  onOpenAiAssist: (student: Student) => void;
  onViewStudentDetail: (student: Student) => void;
  onUpdateStudentStatus?: (studentId: string, newStatus: ApplicationStatus) => void;
  appsScriptUrl?: string;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudent,
  onOpenSettings,
  onOpenAiAssist,
  onViewStudentDetail,
  onUpdateStudentStatus,
  appsScriptUrl = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [sessionFilter, setSessionFilter] = useState<string>('SEMUA');
  const [programFilter, setProgramFilter] = useState<string>('SEMUA');

  // Dynamic session options from live student data
  const dynamicSessions = Array.from(new Set(students.map(s => s.sesi).filter(Boolean)));
  const sessionOptions = ['SEMUA', ...dynamicSessions];

  // Filter students based on search, status, session, and program
  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.noMatrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.noIc.includes(searchTerm) ||
      (s.kelas && s.kelas.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.namaSyarikat && s.namaSyarikat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.emelHrSyarikat.toLowerCase().includes(searchTerm.toLowerCase());

    const isMemohon = s.status === 'Memohon' || s.status === 'Permohonan Dihantar' || s.status === 'Menunggu Jawapan';
    const isDiterima = s.status === 'Diterima' || s.status === 'Lulus / Diterima';
    const isBelumMemohon = s.status === 'Belum Memohon' || (!isMemohon && !isDiterima);

    let matchesStatus = true;
    if (statusFilter === 'Memohon') {
      matchesStatus = isMemohon;
    } else if (statusFilter === 'Diterima') {
      matchesStatus = isDiterima;
    } else if (statusFilter === 'Belum Memohon') {
      matchesStatus = isBelumMemohon;
    }

    const matchesSession =
      sessionFilter === 'SEMUA' || s.sesi === sessionFilter;

    const matchesProgram =
      programFilter === 'SEMUA' || s.program.toLowerCase().includes(programFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesSession && matchesProgram;
  });

  // Handle Export Report to .xlsx
  const handleExportXLSX = () => {
    if (filteredStudents.length === 0) {
      alert('Tiada rekod pelajar untuk dicetak mengikut tapisan semasa.');
      return;
    }

    const exportData = filteredStudents.map((s, index) => {
      let displayStatus = s.status;
      if (s.status === 'Lulus / Diterima') displayStatus = 'Diterima';
      else if (s.status === 'Permohonan Dihantar' || s.status === 'Menunggu Jawapan') displayStatus = 'Memohon';

      return {
        'BIL': index + 1,
        'NAMA PELAJAR': s.namaPelajar?.toUpperCase() || '',
        'NO. MATRIK': s.noMatrik || '',
        'NO. KAD PENGENALAN': s.noIc ? `${s.noIc}` : '',
        'PROGRAM PENGAJIAN': s.program || '',
        'KELAS': s.kelas || '',
        'SESI': s.sesi || '',
        'STATUS PERMOHONAN': displayStatus || 'Belum Memohon',
        'NAMA SYARIKAT INDUSTRI': s.namaSyarikat || 'Belum Ditetapkan',
        'EMEL HR SYARIKAT': s.emelHrSyarikat || '',
        'NO. TELEFON PELAJAR': s.noTelefon ? `${s.noTelefon}` : '',
        'EMEL PELAJAR': s.emelPelajar || '',
        'NAMA PENASIHAT AKADEMIK (PA)': s.namaPa || '',
        'NO. TELEFON PA': s.noTelefonPa ? `${s.noTelefonPa}` : '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set custom column widths for clear readability in Excel
    worksheet['!cols'] = [
      { wch: 6 },  // BIL
      { wch: 32 }, // NAMA PELAJAR
      { wch: 16 }, // NO. MATRIK
      { wch: 18 }, // NO. KAD PENGENALAN
      { wch: 28 }, // PROGRAM PENGAJIAN
      { wch: 10 }, // KELAS
      { wch: 12 }, // SESI
      { wch: 20 }, // STATUS PERMOHONAN
      { wch: 35 }, // NAMA SYARIKAT INDUSTRI
      { wch: 30 }, // EMEL HR SYARIKAT
      { wch: 18 }, // NO. TELEFON PELAJAR
      { wch: 28 }, // EMEL PELAJAR
      { wch: 30 }, // NAMA PA
      { wch: 18 }, // NO. TELEFON PA
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Status Permohonan');

    // Generate descriptive filename with filter details
    const cleanDate = new Date().toISOString().slice(0, 10);
    const sessionTag = sessionFilter !== 'SEMUA' ? `_${sessionFilter.replace(/[\/\s]/g, '_')}` : '';
    const statusTag = statusFilter !== 'SEMUA' ? `_${statusFilter.replace(/[\/\s]/g, '_')}` : '';
    const fileName = `Laporan_Status_Permohonan_KKBS${sessionTag}${statusTag}_${cleanDate}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">

      {/* Toolbar: Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pelajar, no IC, no matrik, atau syarikat..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          {/* Configure API Button */}
          <button
            onClick={onOpenSettings}
            className="w-full md:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            ⚙️ Tetapan API Google Sheets
          </button>
        </div>

        {/* Dropdown Filters for Sesi, Program, Status & Cetak Laporan Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 items-end">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Filter Sesi</label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              {sessionOptions.map(sesi => (
                <option key={sesi} value={sesi}>
                  {sesi === 'SEMUA' ? 'Semua Sesi' : sesi}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Filter Program</label>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="SEMUA">Semua Program</option>
              <option value="Kulinari">Sijil Kulinari</option>
              <option value="Perhotelan">Sijil Operasi Perhotelan</option>
              <option value="Elektrik">Sijil Teknologi Elektrik</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Filter Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="Memohon">Memohon</option>
              <option value="Diterima">Diterima</option>
              <option value="Belum Memohon">Belum Memohon</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Cetak Laporan</label>
            <button
              type="button"
              onClick={handleExportXLSX}
              className="w-full px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white border border-emerald-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Cetak Laporan Pelajar"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Maklumat Pelajar</th>
                <th className="py-3 px-4">Program Pengajian</th>
                <th className="py-3 px-4">Syarikat Industri</th>
                <th className="py-3 px-4">Status Permohonan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-500 font-medium">
                    Tiada rekod pelajar dijumpai mengikut carian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-all">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onViewStudentDetail(student)}
                          className="flex items-start gap-2.5 cursor-pointer group w-fit"
                          title="Klik untuk lihat maklumat permohonan pelajar"
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:bg-blue-700 group-hover:scale-105 transition-all shadow-2xs">
                            {student.namaPelajar.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-900 group-hover:underline uppercase leading-snug transition-colors">
                              {student.namaPelajar}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono text-blue-900 font-bold">{student.noMatrik}</span>
                              {student.kelas && (
                                <>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-black text-[10px]">{student.kelas}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Program */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {student.program}
                      </td>

                      {/* Industry & HR */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{student.namaSyarikat || 'Belum Ditetapkan'}</p>
                      </td>

                      {/* Status Dropdown Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={
                            student.status === 'Diterima' || student.status === 'Lulus / Diterima'
                              ? 'Diterima'
                              : student.status === 'Memohon' || student.status === 'Permohonan Dihantar' || student.status === 'Menunggu Jawapan'
                              ? 'Memohon'
                              : 'Belum Memohon'
                          }
                          onChange={(e) => {
                            if (onUpdateStudentStatus) {
                              onUpdateStudentStatus(student.id, e.target.value as ApplicationStatus);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white font-sans ${
                            student.status === 'Diterima' || student.status === 'Lulus / Diterima'
                              ? 'bg-blue-50 text-blue-900 border-blue-400'
                              : student.status === 'Memohon' || student.status === 'Permohonan Dihantar' || student.status === 'Menunggu Jawapan'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Belum Memohon" className="bg-white text-slate-800 font-bold">Belum Memohon</option>
                          <option value="Memohon" className="bg-white text-emerald-700 font-bold">Memohon</option>
                          <option value="Diterima" className="bg-white text-blue-900 font-bold">Diterima</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
