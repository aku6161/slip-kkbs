import React, { useState, useMemo, useRef } from 'react';
import { Student, ApplicationStatus, formatProgramName } from '../types';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Upload, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  Save, 
  Building, 
  Phone, 
  Mail, 
  GraduationCap, 
  IdCard, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Download,
  Check,
  RefreshCw,
  FileUp
} from 'lucide-react';

interface MaklumatPelajarProps {
  students: Student[];
  onSaveStudent: (student: Partial<Student>) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onViewStudentDetail: (student: Student) => void;
}

export const MaklumatPelajar: React.FC<MaklumatPelajarProps> = ({
  students,
  onSaveStudent,
  onDeleteStudent,
  onViewStudentDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionFilter, setSessionFilter] = useState('SEMUA');
  const [programFilter, setProgramFilter] = useState('SEMUA');
  const [kelasFilter, setKelasFilter] = useState('SEMUA');

  // Modal State for Edit Single Student
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<Partial<Student>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Single Edit
  const [formData, setFormData] = useState<Partial<Student>>({
    namaPelajar: '',
    noIc: '',
    noMatrik: '',
    program: 'SIJIL KULINARI',
    sesi: 'SESI I 2026/2027',
    kelas: '',
    noTelefon: '',
    emelPelajar: '',
    alamat: '',
    namaSekolahMenengah: '',
    namaSyarikat: '',
    emelHrSyarikat: '',
    status: 'Belum Memohon',
    namaPa: 'NUR AZHARI BIN AZHARUDDIN',
    noTelefonPa: '012-3456789',
    emelPa: '',
  });

  // Dynamic Options
  const dynamicSessions = useMemo(() => Array.from(new Set(students.map(s => s.sesi).filter(Boolean))), [students]);
  const sessionOptions = ['SEMUA', ...dynamicSessions];

  const dynamicClasses = useMemo(() => Array.from(new Set(students.map(s => s.kelas).filter(Boolean))), [students]);
  const classOptions = ['SEMUA', ...dynamicClasses];

  // Filtered List
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch =
        s.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.noMatrik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.noIc.includes(searchTerm) ||
        (s.namaSyarikat && s.namaSyarikat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.kelas && s.kelas.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchSession = sessionFilter === 'SEMUA' || s.sesi === sessionFilter;
      const matchProgram = programFilter === 'SEMUA' || s.program.toLowerCase().includes(programFilter.toLowerCase());
      const matchKelas = kelasFilter === 'SEMUA' || s.kelas === kelasFilter;

      return matchSearch && matchSession && matchProgram && matchKelas;
    });
  }, [students, searchTerm, sessionFilter, programFilter, kelasFilter]);

  // Handle Edit Single Student
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingStudent(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPelajar || !formData.noMatrik || !formData.noIc) {
      setNotification({ type: 'error', message: 'Sila lengkapkan Nama, No. IC dan No. Matrik.' });
      return;
    }

    setIsSaving(true);
    try {
      const studentData: Partial<Student> = {
        ...formData,
        program: formatProgramName(formData.program),
        namaPelajar: formData.namaPelajar?.toUpperCase(),
        noMatrik: formData.noMatrik?.toUpperCase(),
        kelas: formData.kelas?.toUpperCase(),
        id: editingStudent ? editingStudent.id : formData.noMatrik?.replace(/\//g, '_'),
        timestamp: editingStudent ? editingStudent.timestamp : new Date().toISOString(),
      };

      await onSaveStudent(studentData);
      setNotification({
        type: 'success',
        message: 'Maklumat pelajar berjaya dikemaskini!'
      });
      handleCloseEditModal();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Ralat semasa menyimpan maklumat pelajar.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteStudent(id);
      setNotification({ type: 'success', message: 'Rekod pelajar telah berjaya dipadam.' });
      setDeleteConfirmId(null);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Gagal memadam maklumat pelajar.' });
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Helper to normalize header names
  const normalizeKey = (k: string) => {
    return k.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  };

  // Process File Upload (.xlsx / .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setNotification({ type: 'error', message: 'Fail yang dimuat naik kosong atau tiada data sah.' });
          setIsParsing(false);
          return;
        }

        const parsedList: Partial<Student>[] = [];

        rawJson.forEach((row, index) => {
          // Map fields dynamically based on normalized column header keys
          const normRow: Record<string, any> = {};
          Object.keys(row).forEach(key => {
            normRow[normalizeKey(key)] = String(row[key] || '').trim();
          });

          // Helper to find value from possible key names
          const getValue = (...keys: string[]) => {
            for (const key of keys) {
              const nKey = normalizeKey(key);
              if (normRow[nKey] !== undefined && normRow[nKey] !== '') {
                return normRow[nKey];
              }
            }
            return '';
          };

          // 6 Asas Maklumat Pelajar:
          const sesi = getValue('sesi', 'sesipengajian', 'session') || 'SESI I 2026/2027';
          const namaPelajar = getValue('namapelajar', 'nama', 'namapenuh', 'studentname', 'name');
          const noMatrik = getValue('nomatrik', 'matrik', 'matrix', 'matricno', 'nopendaftaran', 'matrikno');
          const noIc = getValue('nokadpengenalan', 'noic', 'ic', 'nokp', 'kp', 'nric', 'kadpengenalan');
          const rawProg = getValue('programpengajian', 'program', 'kursus', 'bidang', 'course') || 'SIJIL KULINARI';
          let program = 'SIJIL KULINARI';
          const upProg = rawProg.toUpperCase();
          if (upProg.includes('KULINARI') || upProg.includes('SKU')) {
            program = 'SIJIL KULINARI';
          } else if (upProg.includes('PERHOTELAN') || upProg.includes('HOTEL') || upProg.includes('SOP')) {
            program = 'SIJIL OPERASI PERHOTELAN';
          } else if (upProg.includes('ELEKTRIK') || upProg.includes('SKE') || upProg.includes('STE')) {
            program = 'SIJIL TEKNOLOGI ELEKTRIK';
          } else {
            program = upProg;
          }
          const kelas = getValue('kelas', 'class');

          // Skip empty rows without name or matric
          if (!namaPelajar && !noMatrik && !noIc) return;

          // Check if student already exists to retain existing application data
          const existing = students.find(
            s => (noMatrik && s.noMatrik?.toUpperCase() === noMatrik.toUpperCase()) ||
                 (noIc && s.noIc?.replace(/[^0-9]/g, '') === noIc.replace(/[^0-9]/g, ''))
          );

          const docId = noMatrik ? noMatrik.replace(/[\/\s]/g, '_') : (noIc ? noIc : `student_${Date.now()}_${index}`);

          parsedList.push({
            id: docId,
            timestamp: existing?.timestamp || new Date().toISOString(),
            sesi: sesi || existing?.sesi || 'SESI I 2026/2027',
            namaPelajar: namaPelajar.toUpperCase(),
            noMatrik: noMatrik.toUpperCase(),
            noIc: noIc ? noIc.replace(/[^0-9]/g, '') : '',
            program: program || existing?.program || 'SIJIL KULINARI',
            kelas: kelas ? kelas.toUpperCase() : (existing?.kelas || ''),
            // Retain or initialize other fields that will be updated automatically upon student application
            status: existing?.status || 'Belum Memohon',
            namaSyarikat: existing?.namaSyarikat || '',
            emelHrSyarikat: existing?.emelHrSyarikat || '',
            noTelefon: existing?.noTelefon || '',
            emelPelajar: existing?.emelPelajar || '',
            alamat: existing?.alamat || '',
            namaSekolahMenengah: existing?.namaSekolahMenengah || '',
            namaPa: existing?.namaPa || 'NUR AZHARI BIN AZHARUDDIN',
            noTelefonPa: existing?.noTelefonPa || '012-3456789',
            emelPa: existing?.emelPa || '',
            bjpliData: existing?.bjpliData,
          });
        });

        if (parsedList.length === 0) {
          setNotification({ type: 'error', message: 'Tiada rekod pelajar sah yang berjaya diproses daripada fail.' });
        } else {
          setParsedStudents(parsedList);
        }
      } catch (err: any) {
        console.error('Error parsing spreadsheet:', err);
        setNotification({ type: 'error', message: `Gagal membaca fail: ${err.message || 'Format tidak disokong'}` });
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit Parsed Students to Firebase
  const handleSaveImportedStudents = async () => {
    if (parsedStudents.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: parsedStudents.length });

    try {
      let count = 0;
      for (const st of parsedStudents) {
        await onSaveStudent(st);
        count++;
        setUploadProgress({ current: count, total: parsedStudents.length });
      }

      setNotification({
        type: 'success',
        message: `Tahniah! ${count} maklumat asas pelajar telah berjaya disimpan ke dalam database.`
      });
      setIsUploadModalOpen(false);
      setUploadedFile(null);
      setParsedStudents([]);
    } catch (err: any) {
      setNotification({ type: 'error', message: `Ralat semasa menyimpan ke database: ${err.message}` });
    } finally {
      setIsUploading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Download Sample Template .xlsx with 6 Core Fields
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'SESI': 'SESI I 2026/2027',
        'NAMA PELAJAR': 'MOHD AZIZI BIN ABDULLAH',
        'NO. MATRIK': 'S04SKU23F001',
        'NO. KAD PENGENALAN': '040512125543',
        'PROGRAM PENGAJIAN': 'SIJIL KULINARI',
        'KELAS': 'SKU4A',
      },
      {
        'SESI': 'SESI I 2026/2027',
        'NAMA PELAJAR': 'SITI NURHALIZA BINTI JAAFAR',
        'NO. MATRIK': 'S04SOP23F015',
        'NO. KAD PENGENALAN': '040920126622',
        'PROGRAM PENGAJIAN': 'SIJIL OPERASI PERHOTELAN',
        'KELAS': 'SOP4A',
      },
      {
        'SESI': 'SESI I 2026/2027',
        'NAMA PELAJAR': 'DANIEL LEE JIA WEI',
        'NO. MATRIK': 'S04SKE23F008',
        'NO. KAD PENGENALAN': '041103125891',
        'PROGRAM PENGAJIAN': 'SIJIL TEKNOLOGI ELEKTRIK',
        'KELAS': 'SKE4A',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 20 }, // SESI
      { wch: 32 }, // NAMA PELAJAR
      { wch: 18 }, // NO. MATRIK
      { wch: 22 }, // NO. KAD PENGENALAN
      { wch: 28 }, // PROGRAM PENGAJIAN
      { wch: 12 }, // KELAS
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Templat Pelajar');
    XLSX.writeFile(wb, 'Templat_Maklumat_Asas_Pelajar_KKBS.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              <Users className="w-5 h-5 text-blue-900" />
              Pengurusan Maklumat Pelajar
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Muat naik senarai pelajar daripada fail Excel/CSV, kemas kini profil, syarikat dan status latihan industri.
            </p>
          </div>

          {/* Button: Muat Naik Maklumat Pelajar Baharu */}
          <button
            onClick={() => {
              setUploadedFile(null);
              setParsedStudents([]);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4 text-blue-200" />
            <span>Muat Naik Maklumat Pelajar Baharu</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, no IC, matrik..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div>
            <select
              value={sessionFilter}
              onChange={e => setSessionFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              {sessionOptions.map(sesi => (
                <option key={sesi} value={sesi}>{sesi === 'SEMUA' ? 'Semua Sesi' : sesi}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="SEMUA">Semua Program</option>
              <option value="Kulinari">Sijil Kulinari</option>
              <option value="Perhotelan">Sijil Operasi Perhotelan</option>
              <option value="Elektrik">Sijil Teknologi Elektrik</option>
            </select>
          </div>

          <div>
            <select
              value={kelasFilter}
              onChange={e => setKelasFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              {classOptions.map(kls => (
                <option key={kls} value={kls}>{kls === 'SEMUA' ? 'Semua Kelas' : `Kelas: ${kls}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">Bil</th>
                <th className="py-3 px-4">Maklumat Pelajar</th>
                <th className="py-3 px-4">Program & Sesi</th>
                <th className="py-3 px-4">Syarikat Industri</th>
                <th className="py-3 px-4">Penasihat Akademik</th>
                <th className="py-3 px-4 text-center w-28">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                    Tiada rekod pelajar dijumpai mengikut kriteria carian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {student.namaPelajar.charAt(0)}
                        </div>
                        <div>
                          <p 
                            onClick={() => onViewStudentDetail(student)}
                            className="font-bold text-slate-900 hover:text-blue-900 hover:underline cursor-pointer uppercase leading-snug"
                          >
                            {student.namaPelajar}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-blue-900 font-bold">{student.noMatrik}</span>
                            <span>•</span>
                            <span className="font-mono">{student.noIc}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Program & Sesi */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 uppercase">{formatProgramName(student.program)}</p>
                      <p className="text-[11px] text-slate-500">{student.sesi} {student.kelas && `• ${student.kelas}`}</p>
                    </td>

                    {/* Syarikat & Status */}
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{student.namaSyarikat || 'Belum Ditetapkan'}</p>
                      <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold ${
                        student.status === 'Diterima' || student.status === 'Lulus / Diterima'
                          ? 'bg-blue-100 text-blue-900'
                          : student.status === 'Memohon' || student.status === 'Permohonan Dihantar' || student.status === 'Menunggu Jawapan'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    {/* PA */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 uppercase text-[11px]">{student.namaPa || 'NUR AZHARI'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{student.noTelefonPa}</p>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewStudentDetail(student)}
                          className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Maklumat Pelajar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profil Pelajar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(student.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Padam Rekod Pelajar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Muat Naik Maklumat Pelajar (Excel / CSV) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                if (!isUploading) setIsUploadModalOpen(false);
              }}
              disabled={isUploading}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-xs">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Muat Naik Maklumat Asas Pelajar Baharu
                </h3>
                <p className="text-xs text-slate-500">
                  Sokongan fail <span className="font-bold text-slate-700">.xlsx, .xls</span> atau <span className="font-bold text-slate-700">.csv</span> untuk 6 medan asas.
                </p>
              </div>
            </div>

            {/* Step 1: Upload Box & Template Download */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-900 shrink-0" />
                  <span className="text-slate-700 font-medium">
                    Templat mengandungi 6 lajur asas: <span className="font-bold text-blue-950">Sesi, Nama Pelajar, No. Matrik, No. IC, Program, dan Kelas</span>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-900 border border-blue-300 rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Muat Turun Templat (.xlsx)</span>
                </button>
              </div>

              {/* Note on Auto-updates */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                <span className="text-amber-500 font-bold">ℹ️</span>
                <p>
                  <span className="font-bold text-slate-800">Maklumat Automatik:</span> Data selebihnya (nama syarikat, emel HR, nombor telefon, alamat, dan dokumen latihan) akan dikemaskini secara automatik ke dalam database apabila pelajar mengisi borang permohonan dalam sistem SLIP.
                </p>
              </div>

              {/* Drag and drop / Select File Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-900 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <FileUp className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {uploadedFile ? uploadedFile.name : 'Klik untuk memilih fail atau seret fail ke sini'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Format yang disokong: .xlsx, .xls, atau .csv (Maksimum 10MB)
                  </p>
                </div>
              </div>

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-900" />
                  <span>Sedang memproses dan membaca kandungan fail...</span>
                </div>
              )}

              {/* Preview Extracted Students */}
              {parsedStudents.length > 0 && !isParsing && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Pratonton: {parsedStudents.length} Rekod Asas Pelajar Dikesan
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sila semak 6 data asas sebelum disimpan ke database.
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                        <tr>
                          <th className="py-2 px-3">Bil</th>
                          <th className="py-2 px-3">Sesi</th>
                          <th className="py-2 px-3">Nama Pelajar</th>
                          <th className="py-2 px-3">No. Matrik</th>
                          <th className="py-2 px-3">No. Kad Pengenalan</th>
                          <th className="py-2 px-3">Program Pengajian</th>
                          <th className="py-2 px-3">Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {parsedStudents.map((st, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 text-slate-600">{st.sesi}</td>
                            <td className="py-2 px-3 font-bold text-slate-900 uppercase">{st.namaPelajar}</td>
                            <td className="py-2 px-3 font-mono text-blue-900 font-bold">{st.noMatrik}</td>
                            <td className="py-2 px-3 font-mono">{st.noIc}</td>
                            <td className="py-2 px-3 text-slate-700">{st.program}</td>
                            <td className="py-2 px-3 font-semibold">{st.kelas || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-2 p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-950">
                    <span>Sedang menyimpan data ke pangkalan data Firebase...</span>
                    <span>{uploadProgress.current} / {uploadProgress.total}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-900 h-2 transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={parsedStudents.length === 0 || isUploading || isParsing}
                  onClick={handleSaveImportedStudents}
                  className={`px-5 py-2 rounded-xl font-bold flex items-center gap-2 text-xs shadow-sm transition-all cursor-pointer ${
                    parsedStudents.length > 0 && !isUploading
                      ? 'bg-blue-900 hover:bg-blue-800 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ({uploadProgress.current}/{uploadProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Sahkan &amp; Simpan ke Database ({parsedStudents.length} Pelajar)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Profil Pelajar Tunggal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseEditModal}
              className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">
                  Kemas Kini Maklumat Pelajar
                </h3>
                <p className="text-xs text-slate-500">
                  No. Matrik: {editingStudent?.noMatrik}
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              {/* Personal Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 border-b pb-2 border-slate-200">
                  <IdCard className="w-4 h-4 text-blue-900" />
                  Maklumat Peribadi &amp; Pengajian
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Nama Penuh Pelajar *</label>
                    <input
                      type="text"
                      required
                      value={formData.namaPelajar || ''}
                      onChange={e => setFormData({ ...formData, namaPelajar: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Kad Pengenalan *</label>
                    <input
                      type="text"
                      required
                      value={formData.noIc || ''}
                      onChange={e => setFormData({ ...formData, noIc: e.target.value.replace(/[^0-9]/g, '') })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Matrik *</label>
                    <input
                      type="text"
                      required
                      value={formData.noMatrik || ''}
                      onChange={e => setFormData({ ...formData, noMatrik: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Program Pengajian</label>
                    <select
                      value={
                        (formData.program || '').toUpperCase().includes('KULINARI')
                          ? 'SIJIL KULINARI'
                          : (formData.program || '').toUpperCase().includes('PERHOTELAN') || (formData.program || '').toUpperCase().includes('HOTEL') || (formData.program || '').toUpperCase().includes('SOP')
                          ? 'SIJIL OPERASI PERHOTELAN'
                          : (formData.program || '').toUpperCase().includes('ELEKTRIK') || (formData.program || '').toUpperCase().includes('SKE') || (formData.program || '').toUpperCase().includes('STE')
                          ? 'SIJIL TEKNOLOGI ELEKTRIK'
                          : formData.program?.toUpperCase() || 'SIJIL KULINARI'
                      }
                      onChange={e => setFormData({ ...formData, program: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold uppercase bg-white focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="SIJIL KULINARI">SIJIL KULINARI</option>
                      <option value="SIJIL OPERASI PERHOTELAN">SIJIL OPERASI PERHOTELAN</option>
                      <option value="SIJIL TEKNOLOGI ELEKTRIK">SIJIL TEKNOLOGI ELEKTRIK</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sesi Pengajian</label>
                    <input
                      type="text"
                      value={formData.sesi || ''}
                      onChange={e => setFormData({ ...formData, sesi: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                    <input
                      type="text"
                      value={formData.kelas || ''}
                      onChange={e => setFormData({ ...formData, kelas: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Telefon Pelajar</label>
                    <input
                      type="text"
                      value={formData.noTelefon || ''}
                      onChange={e => setFormData({ ...formData, noTelefon: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Emel Pelajar</label>
                    <input
                      type="email"
                      value={formData.emelPelajar || ''}
                      onChange={e => setFormData({ ...formData, emelPelajar: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Alamat Kediaman</label>
                    <textarea
                      rows={2}
                      value={formData.alamat || ''}
                      onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Industry & Status */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-blue-950 uppercase flex items-center gap-1.5 border-b pb-2 border-blue-200">
                  <Building className="w-4 h-4 text-blue-900" />
                  Syarikat Industri &amp; Status Permohonan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Syarikat Industri Sasaran</label>
                    <input
                      type="text"
                      value={formData.namaSyarikat || ''}
                      onChange={e => setFormData({ ...formData, namaSyarikat: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Emel HR Syarikat</label>
                    <input
                      type="email"
                      value={formData.emelHrSyarikat || ''}
                      onChange={e => setFormData({ ...formData, emelHrSyarikat: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status Permohonan</label>
                    <select
                      value={formData.status || 'Belum Memohon'}
                      onChange={e => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Belum Memohon">Belum Memohon</option>
                      <option value="Memohon">Memohon</option>
                      <option value="Permohonan Dihantar">Permohonan Dihantar</option>
                      <option value="Menunggu Jawapan">Menunggu Jawapan</option>
                      <option value="Diterima">Diterima</option>
                      <option value="Lulus / Diterima">Lulus / Diterima</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Academic Advisor */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-amber-950 uppercase flex items-center gap-1.5 border-b pb-2 border-amber-200">
                  <GraduationCap className="w-4 h-4 text-amber-900" />
                  Maklumat Penasihat Akademik (PA)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Penasihat Akademik (PA)</label>
                    <input
                      type="text"
                      value={formData.namaPa || ''}
                      onChange={e => setFormData({ ...formData, namaPa: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Telefon PA</label>
                    <input
                      type="text"
                      value={formData.noTelefonPa || ''}
                      onChange={e => setFormData({ ...formData, noTelefonPa: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Kemas Kini'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">Padam Maklumat Pelajar?</h3>
              <p className="text-xs text-slate-500">
                Tindakan ini akan memadam data pelajar ini daripada pangkalan data secara kekal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
