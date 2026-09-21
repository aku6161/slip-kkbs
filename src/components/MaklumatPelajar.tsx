import React, { useState, useMemo } from 'react';
import { Student, ApplicationStatus } from '../types';
import { 
  Users, 
  UserPlus, 
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
  AlertCircle 
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    namaPelajar: '',
    noIc: '',
    noMatrik: '',
    program: 'Sijil Kulinari',
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

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      namaPelajar: '',
      noIc: '',
      noMatrik: '',
      program: 'Sijil Kulinari',
      sesi: dynamicSessions[0] || 'SESI I 2026/2027',
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
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPelajar || !formData.noMatrik || !formData.noIc) {
      setNotification({ type: 'error', message: 'Sila lengkapkan Nama, No. IC dan No. Matrik.' });
      return;
    }

    setIsSaving(true);
    try {
      const studentData: Partial<Student> = {
        ...formData,
        id: editingStudent ? editingStudent.id : formData.noMatrik?.replace(/\//g, '_'),
        timestamp: editingStudent ? editingStudent.timestamp : new Date().toISOString(),
      };

      await onSaveStudent(studentData);
      setNotification({
        type: 'success',
        message: editingStudent ? 'Maklumat pelajar berjaya dikemaskini!' : 'Pelajar baharu berjaya didaftarkan!'
      });
      handleCloseModal();
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
              Urus profil pelajar, kemas kini perincian peribadi, program, syarikat dan status latihan industri.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pelajar Baharu</span>
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
                      <p className="font-semibold text-slate-900">{student.program}</p>
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

      {/* Modal: Tambah / Edit Pelajar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-fade-in my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
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
                  {editingStudent ? 'Kemas Kini Maklumat Pelajar' : 'Daftar Pelajar Baharu'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingStudent ? `No. Matrik: ${editingStudent.noMatrik}` : 'Masukkan maklumat pelajar secara manual ke dalam pangkalan data.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Personal Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase flex items-center gap-1.5 border-b pb-2 border-slate-200">
                  <IdCard className="w-4 h-4 text-blue-900" />
                  Maklumat Peribadi & Pengajian
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Nama Penuh Pelajar *</label>
                    <input
                      type="text"
                      required
                      value={formData.namaPelajar || ''}
                      onChange={e => setFormData({ ...formData, namaPelajar: e.target.value.toUpperCase() })}
                      placeholder="CONTOH: AHMAD BIN ALI"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold uppercase focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Kad Pengenalan *</label>
                    <input
                      type="text"
                      required
                      value={formData.noIc || ''}
                      onChange={e => setFormData({ ...formData, noIc: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="CONTOH: 030512125543"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Matrik *</label>
                    <input
                      type="text"
                      required
                      value={formData.noMatrik || ''}
                      onChange={e => setFormData({ ...formData, noMatrik: e.target.value.toUpperCase() })}
                      placeholder="CONTOH: S04SKU23F001"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Program Pengajian</label>
                    <select
                      value={formData.program || 'Sijil Kulinari'}
                      onChange={e => setFormData({ ...formData, program: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold bg-white focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Sijil Kulinari">Sijil Kulinari (SKU)</option>
                      <option value="Sijil Operasi Perhotelan">Sijil Operasi Perhotelan (SOP)</option>
                      <option value="Sijil Teknologi Elektrik">Sijil Teknologi Elektrik (SKE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sesi Pengajian</label>
                    <input
                      type="text"
                      value={formData.sesi || ''}
                      onChange={e => setFormData({ ...formData, sesi: e.target.value })}
                      placeholder="CONTOH: SESI I 2026/2027"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                    <input
                      type="text"
                      value={formData.kelas || ''}
                      onChange={e => setFormData({ ...formData, kelas: e.target.value.toUpperCase() })}
                      placeholder="CONTOH: SKU4A"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Telefon Pelajar</label>
                    <input
                      type="text"
                      value={formData.noTelefon || ''}
                      onChange={e => setFormData({ ...formData, noTelefon: e.target.value })}
                      placeholder="CONTOH: 012-8889999"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Emel Pelajar</label>
                    <input
                      type="email"
                      value={formData.emelPelajar || ''}
                      onChange={e => setFormData({ ...formData, emelPelajar: e.target.value })}
                      placeholder="CONTOH: pelajar@gmail.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Alamat Kediaman</label>
                    <textarea
                      rows={2}
                      value={formData.alamat || ''}
                      onChange={e => setFormData({ ...formData, alamat: e.target.value })}
                      placeholder="Alamat tempat tinggal pelajar"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>
              </div>

              {/* Industry & Status */}
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3">
                <h4 className="font-bold text-blue-950 uppercase flex items-center gap-1.5 border-b pb-2 border-blue-200">
                  <Building className="w-4 h-4 text-blue-900" />
                  Syarikat Industri & Status Permohonan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Syarikat Industri Sasaran</label>
                    <input
                      type="text"
                      value={formData.namaSyarikat || ''}
                      onChange={e => setFormData({ ...formData, namaSyarikat: e.target.value.toUpperCase() })}
                      placeholder="CONTOH: HOTEL SHANGRI-LA"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Emel HR Syarikat</label>
                    <input
                      type="email"
                      value={formData.emelHrSyarikat || ''}
                      onChange={e => setFormData({ ...formData, emelHrSyarikat: e.target.value })}
                      placeholder="hr@syarikat.com"
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
                      placeholder="NUR AZHARI BIN AZHARUDDIN"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">No. Telefon PA</label>
                    <input
                      type="text"
                      value={formData.noTelefonPa || ''}
                      onChange={e => setFormData({ ...formData, noTelefonPa: e.target.value })}
                      placeholder="012-3456789"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Maklumat'}</span>
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
