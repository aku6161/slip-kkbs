import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  UserPlus, 
  Search, 
  Mail, 
  Phone, 
  Layers, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  CheckCircle2, 
  GraduationCap, 
  IdCard, 
  Sparkles,
  Users,
  AlertCircle
} from 'lucide-react';
import { Lecturer, Student } from '../types';

interface MaklumatPensyarahProps {
  lecturers: Lecturer[];
  students: Student[];
  onSaveLecturer: (lecturer: Partial<Lecturer>) => Promise<{ success: boolean; message?: string }>;
  onDeleteLecturer: (id: string) => Promise<void>;
}

export const MaklumatPensyarah: React.FC<MaklumatPensyarahProps> = ({
  lecturers,
  students,
  onSaveLecturer,
  onDeleteLecturer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('SEMUA');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    staffId: '',
    emel: '',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    noTelefon: '',
    jawatan: 'PENSYARAH'
  });

  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available programs for filtering / dropdown
  const programsList = [
    'SIJIL TEKNOLOGI ELEKTRIK',
    'SIJIL KULINARI',
    'SIJIL OPERASI PERHOTELAN',
    'UNIT PERHUBUNGAN INDUSTRI & ALUMNI (UPLI)',
    'UNIT PENGURUSAN AKADEMIK',
    'UNIT PENGAJIAN AM'
  ];

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingLecturer(null);
    setFormData({
      nama: '',
      staffId: '',
      emel: '',
      program: 'SIJIL TEKNOLOGI ELEKTRIK',
      noTelefon: '',
      jawatan: 'PENSYARAH'
    });
    setFeedbackMsg(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (lec: Lecturer) => {
    setEditingLecturer(lec);
    setFormData({
      nama: lec.nama || '',
      staffId: lec.staffId || '',
      emel: lec.emel || '',
      program: lec.program || 'SIJIL TEKNOLOGI ELEKTRIK',
      noTelefon: lec.noTelefon || '',
      jawatan: lec.jawatan || 'PENSYARAH'
    });
    setFeedbackMsg(null);
    setIsModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.staffId.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Sila lengkapkan Nama dan No. ID Staf.' });
      return;
    }

    setLoading(true);
    setFeedbackMsg(null);

    try {
      const payload: Partial<Lecturer> = {
        ...(editingLecturer ? { id: editingLecturer.id } : {}),
        nama: formData.nama.trim().toUpperCase(),
        staffId: formData.staffId.trim().toUpperCase(),
        emel: formData.emel.trim().toLowerCase(),
        program: formData.program.trim().toUpperCase(),
        noTelefon: formData.noTelefon.trim(),
        jawatan: formData.jawatan.trim().toUpperCase()
      };

      const res = await onSaveLecturer(payload);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: editingLecturer ? 'Maklumat pensyarah berjaya dikemaskini!' : 'Pensyarah baharu berjaya didaftarkan!' });
        setTimeout(() => {
          setIsModalOpen(false);
          setFeedbackMsg(null);
        }, 1200);
      } else {
        setFeedbackMsg({ type: 'error', text: res.message || 'Ralat semasa menyimpan maklumat.' });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Ralat sambungan pangkalan data.' });
    } finally {
      setLoading(false);
    }
  };

  // Delete Lecturer with confirmation
  const handleDelete = async (lec: Lecturer) => {
    const confirm = window.confirm(`Adakah anda pasti ingin memadamkan rekod pensyarah ${lec.nama} (${lec.staffId})?`);
    if (!confirm) return;

    try {
      await onDeleteLecturer(lec.id);
    } catch (err) {
      alert('Ralat semasa memadamkan rekod pensyarah.');
    }
  };

  // Filtered lecturers
  const filteredLecturers = useMemo(() => {
    return lecturers.filter(lec => {
      // 1. Program filter
      if (selectedProgram !== 'SEMUA') {
        if ((lec.program || '').trim().toUpperCase() !== selectedProgram.trim().toUpperCase()) {
          return false;
        }
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nama = (lec.nama || '').toLowerCase();
        const id = (lec.staffId || '').toLowerCase();
        const emel = (lec.emel || '').toLowerCase();
        const prog = (lec.program || '').toLowerCase();

        return nama.includes(q) || id.includes(q) || emel.includes(q) || prog.includes(q);
      }

      return true;
    });
  }, [lecturers, selectedProgram, searchQuery]);


  // Count advisees (pelajar PA) for each lecturer
  const getStudentCountForLecturer = (lecName: string, staffId: string) => {
    const cleanName = (lecName || '').trim().toLowerCase();
    const cleanId = (staffId || '').trim().toLowerCase();
    return students.filter(s => {
      const pa = (s.namaPa || '').trim().toLowerCase();
      return pa && (pa === cleanName || cleanName.includes(pa) || pa.includes(cleanName));
    }).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold mb-3 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Direktori Pensyarah &amp; Penasihat Akademik (PA)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              MAKLUMAT PENSYARAH
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Senarai maklumat pensyarah, Penasihat Akademik (PA), dan pensyarah pemantau latihan industri bagi Kolej Komuniti Beaufort Sabah.
            </p>
          </div>

          {/* Quick Action: Tambah Pensyarah Button */}
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-amber-400/20 transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-slate-950" />
            <span>Tambah Pensyarah Baharu</span>
          </button>
        </div>
      </div>


      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Program Filter */}
          <div className="w-full md:w-auto flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-wide">Program:</span>
            </div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-900 outline-none cursor-pointer w-full md:w-auto"
            >
              <option value="SEMUA">Semua Program</option>
              {programsList.map(prog => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, ID staf, emel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-900 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Lecturers Table / Card View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-150 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-900" />
            Senarai Pensyarah Berdaftar ({filteredLecturers.length})
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">
            Data disandarkan secara langsung ke Firebase
          </span>
        </div>

        {filteredLecturers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-sm text-slate-700">Tiada rekod pensyarah ditemui.</p>
            <p className="text-xs text-slate-500">Klik butang "Tambah Pensyarah Baharu" di atas untuk memasukkan data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Bil</th>
                  <th className="py-3.5 px-4">Nama Pensyarah</th>
                  <th className="py-3.5 px-4 text-center w-36">No. ID Staf</th>
                  <th className="py-3.5 px-4">Emel Rasmi</th>
                  <th className="py-3.5 px-4">Program</th>
                  <th className="py-3.5 px-4 text-center w-28">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs">
                {filteredLecturers.map((lec, idx) => {
                  const studentCount = getStudentCountForLecturer(lec.nama, lec.staffId);
                  return (
                    <tr key={lec.id || lec.staffId || idx} className="hover:bg-slate-50/80 transition-colors">
                      {/* Bil */}
                      <td className="py-3.5 px-4 text-center text-slate-500 font-bold text-xs">
                        {idx + 1}
                      </td>

                      {/* Nama */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-950 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                            {lec.nama ? lec.nama.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 uppercase tracking-tight">
                              {lec.nama}
                            </div>
                            {lec.jawatan && (
                              <div className="text-[10px] text-slate-500 font-semibold uppercase">
                                {lec.jawatan}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* No. ID Staf */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs font-black px-2.5 py-1 bg-amber-50 text-amber-950 border border-amber-300 rounded-lg shadow-2xs inline-block">
                          {lec.staffId}
                        </span>
                      </td>

                      {/* Emel Rasmi */}
                      <td className="py-3.5 px-4">
                        <a
                          href={`mailto:${lec.emel}`}
                          className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="font-mono text-[11px]">{lec.emel || '-'}</span>
                        </a>
                        {lec.noTelefon && (
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            {lec.noTelefon}
                          </div>
                        )}
                      </td>

                      {/* Program */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg font-bold text-[10px] uppercase inline-block">
                          {lec.program}
                        </span>
                      </td>

                      {/* Tindakan */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(lec)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Kemaskini Pensyarah"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(lec)}
                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Padam Pensyarah"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Kad Tambah / Kemaskini Pensyarah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-950 shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-wide">
                    {editingLecturer ? 'Kemaskini Maklumat Pensyarah' : 'Kad Tambah Pensyarah Baharu'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Masukkan maklumat pensyarah untuk disimpan ke pangkalan data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {feedbackMsg && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedbackMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              {/* 1. Nama Penuh */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Nama Pensyarah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: NUR AZHARI BIN AZHARUDDIN"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 uppercase focus:ring-2 focus:ring-indigo-900 outline-none"
                />
              </div>

              {/* 2. No. ID Staf */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  No. ID Staf <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: KKBS/003 atau KKBS/016"
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 uppercase font-mono focus:ring-2 focus:ring-indigo-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">
                  ID Staf ini akan digunakan pensyarah untuk log masuk ke portal pensyarah pemantau.
                </p>
              </div>

              {/* 3. Emel Rasmi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Emel Rasmi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: azhari@kkbs.edu.my"
                  value={formData.emel}
                  onChange={(e) => setFormData({ ...formData, emel: e.target.value.toLowerCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-900 outline-none font-mono"
                />
              </div>

              {/* 4. Program */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Program <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-900 outline-none cursor-pointer"
                >
                  {programsList.map(prog => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              {/* 5. No. Telefon & Jawatan (Pilihan) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    No. Telefon (Pilihan)
                  </label>
                  <input
                    type="text"
                    placeholder="012-3456789"
                    value={formData.noTelefon}
                    onChange={(e) => setFormData({ ...formData, noTelefon: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-900 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Jawatan (Pilihan)
                  </label>
                  <input
                    type="text"
                    placeholder="PENSYARAH / PPIA"
                    value={formData.jawatan}
                    onChange={(e) => setFormData({ ...formData, jawatan: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 uppercase focus:ring-2 focus:ring-indigo-900 outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Menyimpan...' : 'Simpan Maklumat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
