import React, { useState, useRef } from 'react';
import { Student, SystemConfig, Lecturer, IndustryCompany, formatProgramName } from '../types';
import { INITIAL_COMPANIES } from '../data/initialData';
import { UserPlus, Send, User, Building, Award, BookOpen, Info, Lock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ApplicationFormProps {
  students?: Student[];
  lecturers?: Lecturer[];
  companies?: IndustryCompany[];
  config: SystemConfig;
  appsScriptUrl?: string;
  onSuccess?: (newStudent: Student, message?: string, emailError?: string) => void;
  onCancel?: () => void;
  onSaveStudent?: (studentData: Partial<Student>) => Promise<{ success: boolean; student?: Student }>;
  onSelectStudentForDoc?: (student: Student, docType: any) => void;
  initialIc?: string;
  onSuccessSubmit?: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ 
  students = [], 
  lecturers = [],
  companies = INITIAL_COMPANIES,
  config, 
  appsScriptUrl = '', 
  onSuccess, 
  onCancel,
  onSaveStudent,
  onSelectStudentForDoc,
  initialIc,
  onSuccessSubmit
}) => {
  const [icSearchInput, setIcSearchInput] = useState('');
  const [searchStatus, setSearchStatus] = useState<{ found: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Student>>({
    namaPelajar: '',
    noIc: '',
    noMatrik: '',
    program: '',
    sesi: config?.sesi || 'SESI I 2026/2027',
    noTelefon: '',
    emelPelajar: '',
    alamat: '',
    namaSekolahMenengah: '',
    jawatanKkbs: '',
    programKkbs1: '',
    programKkbs2: '',
    programKkbs3: '',
    pencapaian1: '',
    pencapaian2: '',
    pencapaian3: '',
    namaPa: '',
    noTelefonPa: '',
    emelPa: '',
    emelHrSyarikat: '',
    namaSyarikat: '',
    kelas: '',
    status: 'Memohon',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Gunakan ref untuk pastikan form hanya diisi sekali sahaja (tidak reset bila students refresh)
  const hasInitialized = useRef(false);

  React.useEffect(() => {
    if (initialIc && !hasInitialized.current) {
      const found = students.find(s => (s.noIc || '').replace(/\D/g, '') === initialIc.replace(/\D/g, ''));
      if (found) {
        hasInitialized.current = true;
        setFormData({ ...found });
      } else if (students.length > 0) {
        // students sudah diload tapi tiada rekod — tetapkan IC sahaja, jangan reset lagi
        hasInitialized.current = true;
        setFormData(prev => ({ ...prev, noIc: formatIc(initialIc) }));
      }
    }
  }, [initialIc, students]);

  // Reset hasInitialized bila initialIc bertukar (pelajar baru log masuk)
  React.useEffect(() => {
    hasInitialized.current = false;
  }, [initialIc]);

  // Format Helpers
  const formatIc = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 12);
    const match = cleaned.match(/^(\d{6})(\d{2})?(\d{4})?$/);
    if (match) {
      let formatted = match[1];
      if (match[2]) formatted += '-' + match[2];
      if (match[3]) formatted += '-' + match[3];
      return formatted;
    }
    return cleaned;
  };

  const formatPhone = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 11);
    if (cleaned.length > 3) {
      return cleaned.substring(0, 3) + '-' + cleaned.substring(3);
    }
    return cleaned;
  };

  const handleSearchIc = () => {
    if (!icSearchInput.trim()) {
      setSearchStatus({ found: false, message: 'Sila masukkan No. IC untuk carian.' });
      return;
    }

    const cleanedSearch = icSearchInput.replace(/[^0-9]/g, '');
    const foundStudent = students.find(s => {
      const cleanedStudentIc = s.noIc.replace(/[^0-9]/g, '');
      return cleanedStudentIc === cleanedSearch || s.noIc.toLowerCase().includes(icSearchInput.toLowerCase().trim());
    });

    if (foundStudent) {
      setFormData(prev => ({
        ...foundStudent,
        // Jika pelajar sudah pilih program baharu, kekalkan pilihan baharu tersebut
        program: prev.program && prev.program !== '' ? prev.program : (foundStudent.program || '')
      }));
      setSearchStatus({
        found: true,
        message: `Rekod dijumpai untuk ${foundStudent.namaPelajar}! Data permohonan telah dimuatkan.`
      });
    } else {
      setFormData(prev => ({
        ...prev,
        noIc: formatIc(icSearchInput)
      }));
      setSearchStatus({
        found: false,
        message: `Tiada rekod dijumpai untuk No. IC '${icSearchInput}'. Anda boleh meneruskan borang permohonan baru di bawah.`
      });
    }
  };

  const isAccepted = 
    formData.status === 'Diterima' || 
    formData.status === 'Lulus / Diterima' || 
    formData.bjpliData?.keputusan === 'DITERIMA';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccepted) {
      setErrorMessage('Permohonan yang telah berstatus Diterima tidak boleh dikemaskini.');
      return;
    }
    setLoading(true);
    setErrorMessage('');

    const cleanUpper = (val?: string) => val ? val.trim().toUpperCase() : '';
    const cleanLower = (val?: string) => val ? val.trim().toLowerCase() : '';

    // Final clean up and enforcement of capitalization
    const cleanedData = {
      ...formData,
      status: 'Memohon', // Always force status to 'Memohon' on submission
      namaPelajar: cleanUpper(formData.namaPelajar),
      noMatrik: cleanUpper(formData.noMatrik),
      program: formatProgramName(formData.program), // Standardized uppercase program name without abbreviations
      kelas: cleanUpper(formData.kelas),
      sesi: config.sesi, // Force the student's Sesi to the active session configured in the system
      alamat: cleanUpper(formData.alamat),
      namaSekolahMenengah: cleanUpper(formData.namaSekolahMenengah),
      jawatanKkbs: cleanUpper(formData.jawatanKkbs) || 'TIADA',
      programKkbs1: cleanUpper(formData.programKkbs1),
      programKkbs2: cleanUpper(formData.programKkbs2),
      programKkbs3: cleanUpper(formData.programKkbs3),
      pencapaian1: cleanUpper(formData.pencapaian1),
      pencapaian2: cleanUpper(formData.pencapaian2),
      pencapaian3: cleanUpper(formData.pencapaian3),
      namaPa: cleanUpper(formData.namaPa),
      namaSyarikat: cleanUpper(formData.namaSyarikat),
      // Email addresses explicitly lowercase
      emelPelajar: cleanLower(formData.emelPelajar),
      emelPa: cleanLower(formData.emelPa),
      emelHrSyarikat: cleanLower(formData.emelHrSyarikat),
    };

    try {
      if (onSaveStudent) {
        const result = await onSaveStudent(cleanedData);
        if (result.success && result.student) {
          onSuccess?.(result.student, 'Permohonan latihan industri berjaya dihantar!');
          onSuccessSubmit?.();
          return;
        }
      }

      const url = appsScriptUrl 
        ? `/api/students?appsScriptUrl=${encodeURIComponent(appsScriptUrl)}`
        : '/api/students';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menyimpan permohonan');
      }

      const data = await res.json();
      onSuccess?.(data.student, data.message || 'Permohonan latihan industri berjaya dihantar!', data.emailError);
      onSuccessSubmit?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat berlaku semasa menghantar permohonan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 max-w-3xl mx-auto my-6 font-sans">
      {/* Form Header with Status */}
      <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black uppercase text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-900" />
            BORANG PERMOHONAN LATIHAN INDUSTRI (SLIP KKBS)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Kolej Komuniti Beaufort Sabah
          </p>
        </div>

        {/* Status Permohonan Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xs ${
            isAccepted
              ? 'bg-emerald-600 text-white border-emerald-700'
              : formData.status === 'Ditolak'
              ? 'bg-rose-600 text-white border-rose-700'
              : formData.status === 'Memohon' || formData.status === 'Permohonan Dihantar' || formData.status === 'Menunggu Jawapan'
              ? 'bg-blue-800 text-white border-blue-900'
              : 'bg-slate-700 text-white border-slate-800'
          }`}>
            {isAccepted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : formData.status === 'Ditolak' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span>STATUS: {formData.status || 'BELUM MEMOHON'}</span>
          </div>
        </div>
      </div>

      {/* Locked Alert Banner for Diterima */}
      {isAccepted && (
        <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-4 rounded-2xl flex items-start gap-3 shadow-xs mb-6 animate-fade-in">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-xs uppercase tracking-tight text-emerald-900">
                STATUS PERMOHONAN: DITERIMA (LULUS) — DATA TERKUNCI
              </h3>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-md">
                KEMASKINI DITUTUP
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Tahniah! Permohonan latihan industri anda telah <strong>DITERIMA / DILULUSKAN</strong> oleh pihak industri. Maklumat permohonan telah dikunci dan tidak boleh dikemaskini lagi. Sila maklum kepada Pegawai Perhubungan Industri dan Alumni (PPIA) sekiranya terdapat sebarang keperluan pertukaran atau pindaan.
            </p>
          </div>
        </div>
      )}

      {/* Carian Kad Pengenalan (Hanya jika tidak dipanggil dari portal pelajar) */}
      {!initialIc && (
        <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 mb-6 space-y-3">
          <label className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-900" />
            CARIAN KAD PENGENALAN (PERMOHONAN/KEMASKINI)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan No. Kad Pengenalan (contoh: 060503-12-0288)..."
              value={icSearchInput}
              onChange={(e) => setIcSearchInput(formatIc(e.target.value))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchIc(); } }}
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-900/20 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleSearchIc}
              className="px-4 py-2.5 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              Cari Kad Pengenalan
            </button>
          </div>

          {searchStatus && (
            <div className={`p-3 rounded-xl text-xs font-bold border ${
              searchStatus.found ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              {searchStatus.message}
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3 rounded-lg text-xs font-bold mb-6">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-slate-800">
        <fieldset disabled={isAccepted} className="space-y-6 disabled:opacity-85">
        {/* Section 1: Student Personal Details */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2 border-b pb-2 border-slate-200">
            <User className="w-4 h-4 text-blue-900" />
            1. Maklumat Peribadi Pelajar
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">NAMA PELAJAR (Seperti Dalam Kad Pengenalan): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: SITI KHADIZAH AISYAH BINTI OMAR"
                value={formData.namaPelajar}
                onChange={e => setFormData({ ...formData, namaPelajar: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NO. KAD PENGENALAN: *</label>
              <input
                type="text"
                required
                readOnly={!!initialIc}
                placeholder="Contoh: 060503-12-0288"
                value={formData.noIc}
                onChange={e => setFormData({ ...formData, noIc: formatIc(e.target.value) })}
                className={`w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono text-slate-900 font-bold ${
                  initialIc ? 'bg-slate-100 cursor-not-allowed text-slate-600' : 'bg-white'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NO. MATRIK: *</label>
              <input
                type="text"
                required
                placeholder="Contoh: S04SOP24F507"
                value={formData.noMatrik}
                onChange={e => setFormData({ ...formData, noMatrik: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono uppercase font-bold text-blue-900 bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PROGRAM PENGAJIAN: *</label>
              <select
                value={formData.program || ''}
                required
                onChange={e => setFormData({ ...formData, program: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-bold text-slate-900 bg-white uppercase"
              >
                <option value="">-- SILA PILIH PROGRAM PENGAJIAN --</option>
                <option value="SIJIL KULINARI">SIJIL KULINARI</option>
                <option value="SIJIL OPERASI PERHOTELAN">SIJIL OPERASI PERHOTELAN</option>
                <option value="SIJIL TEKNOLOGI ELEKTRIK">SIJIL TEKNOLOGI ELEKTRIK</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">KELAS: *</label>
              <select
                value={formData.kelas || ''}
                required
                onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-bold text-slate-900 bg-white uppercase"
              >
                <option value="">-- SILA PILIH KELAS --</option>
                <option value="SKU4A">SKU4A</option>
                <option value="SKU4B">SKU4B</option>
                <option value="SOP4A">SOP4A</option>
                <option value="SOP4B">SOP4B</option>
                <option value="SKE4A">SKE4A</option>
                <option value="SKE4B">SKE4B</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NO. TELEFON PELAJAR: *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 011-12710288"
                value={formData.noTelefon}
                onChange={e => setFormData({ ...formData, noTelefon: formatPhone(e.target.value) })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono text-slate-900 bg-white font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">EMEL PELAJAR: *</label>
              <input
                type="email"
                required
                placeholder="Contoh: pelajar@gmail.com"
                value={formData.emelPelajar}
                onChange={e => setFormData({ ...formData, emelPelajar: e.target.value.toLowerCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono text-slate-900 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">ALAMAT KEDIAMAN: *</label>
              <textarea
                required
                rows={3}
                placeholder={`Contoh:
KAMPUNG BINGKUL,
JALAN MELALUGUS,
89807 BEAUFORT, SABAH`}
                value={formData.alamat}
                onChange={e => setFormData({ ...formData, alamat: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none uppercase text-slate-900 bg-white leading-relaxed font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">NAMA SEKOLAH MENENGAH: *</label>
              <input
                type="text"
                required
                placeholder="Contoh: SMK MEMBAKUT II, MEMBAKUT"
                value={formData.namaSekolahMenengah}
                onChange={e => setFormData({ ...formData, namaSekolahMenengah: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none uppercase text-slate-900 bg-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Achievements & Programs */}
        <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-4">
          <h2 className="font-bold text-slate-900 uppercase text-xs flex items-center gap-2 border-b pb-2 border-slate-200">
            <Award className="w-4 h-4 text-blue-900" />
            2. JAWATAN, PROGRAM & PENCAPAIAN SEPANJANG PENGAJIAN DI KKBS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">JAWATAN (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Yang Di-Pertua JPP / AHLI KELAB PERHOTELAN"
                value={formData.jawatanKkbs}
                onChange={e => setFormData({ ...formData, jawatanKkbs: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 uppercase bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PROGRAM 1 (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: KEMBARA MERDEKA BUKIT BENDERA 2023"
                value={formData.programKkbs1}
                onChange={e => setFormData({ ...formData, programKkbs1: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PROGRAM 2 (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: CAMP HOSPEX (HOSPITALITY EXPERIENCE) 2026"
                value={formData.programKkbs2}
                onChange={e => setFormData({ ...formData, programKkbs2: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 bg-white font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">PROGRAM 3 (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: PROGRAM MERDEKA FUN FIESTA 2025"
                value={formData.programKkbs3}
                onChange={e => setFormData({ ...formData, programKkbs3: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PENCAPAIAN 1 (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: ANUGERAH PENGARAH SESI II 2025/2026"
                value={formData.pencapaian1}
                onChange={e => setFormData({ ...formData, pencapaian1: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 bg-white font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">PENCAPAIAN 2 (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: BED MAKING CHALLENGE 2025- BRONZE"
                value={formData.pencapaian2}
                onChange={e => setFormData({ ...formData, pencapaian2: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 bg-white font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">PENCAPAIAN 3 (Tulis 'TIADA' jika tiada): *</label>
              <input
                type="text"
                required
                placeholder="Contoh: JOHAN FUTSAL - SIHAT JPP 2025"
                value={formData.pencapaian3}
                onChange={e => setFormData({ ...formData, pencapaian3: e.target.value.toUpperCase() })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 bg-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Academic Advisor Details */}
        <div className="bg-amber-50/80 p-4.5 rounded-xl border border-amber-200 space-y-3">
          <h2 className="font-bold text-amber-900 uppercase text-xs flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-900" />
            3. MAKLUMAT PENASIHAT AKADEMIK (PA)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">NAMA PENASIHAT AKADEMIK: *</label>
              <select
                required
                value={formData.namaPa || ''}
                onChange={e => {
                  const selectedName = e.target.value;
                  const matched = lecturers.find(
                    l => l.nama.trim().toUpperCase() === selectedName.trim().toUpperCase()
                  );
                  setFormData(prev => ({
                    ...prev,
                    namaPa: selectedName,
                    emelPa: matched?.emel ? matched.emel.toLowerCase() : (selectedName === '' ? '' : prev.emelPa || ''),
                    noTelefonPa: matched?.noTelefon ? matched.noTelefon : (selectedName === '' ? '' : prev.noTelefonPa || '')
                  }));
                }}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-800 outline-none font-bold text-slate-900 bg-white uppercase cursor-pointer"
              >
                <option value="">[SILA PILIH PENASIHAT AKADEMIK]</option>
                {lecturers && lecturers.length > 0 ? (
                  [...lecturers]
                    .sort((a, b) => a.nama.localeCompare(b.nama))
                    .map(lec => (
                      <option key={lec.id || lec.staffId || lec.nama} value={lec.nama}>
                        {lec.nama}
                      </option>
                    ))
                ) : (
                  <option value="" disabled>Tiada data pensyarah</option>
                )}
                {/* Sertakan pilihan jika nama sedia ada tiada dalam senarai pensyarah */}
                {formData.namaPa && !lecturers?.some(l => l.nama.trim().toUpperCase() === formData.namaPa?.trim().toUpperCase()) && (
                  <option value={formData.namaPa}>{formData.namaPa}</option>
                )}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NO. TELEFON PENASIHAT AKADEMIK: *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 012-3456789"
                  value={formData.noTelefonPa || ''}
                  onChange={e => setFormData({ ...formData, noTelefonPa: formatPhone(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-800 outline-none font-mono text-blue-900 bg-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">EMEL PENASIHAT AKADEMIK: *</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: pensyarah@kkbeaufort.edu.my"
                  value={formData.emelPa || ''}
                  onChange={e => setFormData({ ...formData, emelPa: e.target.value.toLowerCase() })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-800 outline-none font-mono text-blue-900 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Industry Information */}
        <div className="bg-blue-50/80 p-4.5 rounded-xl border border-blue-200 space-y-3">
          <h2 className="font-bold text-blue-900 uppercase text-xs flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-900" />
            4. MAKLUMAT INDUSTRI
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">NAMA INDUSTRI: *</label>
                <select
                  required
                  value={formData.namaSyarikat || ''}
                  onChange={e => {
                    const selectedName = e.target.value;
                    const matched = companies.find(
                      c => c.namaSyarikat.trim().toUpperCase() === selectedName.trim().toUpperCase()
                    );
                    setFormData(prev => ({
                      ...prev,
                      namaSyarikat: selectedName,
                      emelHrSyarikat: matched?.emelHr ? matched.emelHr.toLowerCase() : (selectedName === '' ? '' : prev.emelHrSyarikat || '')
                    }));
                  }}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white cursor-pointer"
                >
                  <option value="">[SILA PILIH SYARIKAT INDUSTRI]</option>
                  {companies && companies.length > 0 ? (
                    [...companies]
                      .sort((a, b) => a.namaSyarikat.localeCompare(b.namaSyarikat))
                      .map(comp => (
                        <option key={comp.id || comp.namaSyarikat} value={comp.namaSyarikat}>
                          {comp.namaSyarikat}
                        </option>
                      ))
                  ) : (
                    <option value="" disabled>Tiada data syarikat</option>
                  )}
                  {/* Sertakan pilihan jika nama sedia ada tiada dalam senarai syarikat berdaftar */}
                  {formData.namaSyarikat && !companies?.some(c => c.namaSyarikat.trim().toUpperCase() === formData.namaSyarikat?.trim().toUpperCase()) && (
                    <option value={formData.namaSyarikat}>{formData.namaSyarikat}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">EMEL HR: *</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: hr@syarikat.com"
                  value={formData.emelHrSyarikat || ''}
                  onChange={e => setFormData({ ...formData, emelHrSyarikat: e.target.value.toLowerCase() })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono text-blue-900 bg-white font-medium"
                />
              </div>
            </div>

            {/* Note */}
            <div className="p-3 bg-blue-100/80 border border-blue-300 rounded-xl text-xs font-semibold text-blue-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
              <span>
                <strong>Nota:</strong> Sekiranya senarai syarikat tiada dalam senarai, sila maklum PPIA untuk mendaftar syarikat baharu.
              </span>
            </div>
          </div>
        </div>
        </fieldset>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {isAccepted ? (
            <div className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 border border-slate-300 text-slate-500 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-2xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>PERMOHONAN TELAH DITERIMA (KEMASKINI DIKUNCI)</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider font-sans"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Menghantar / Mengemaskini...' : 'Hantar / Kemaskini'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
