import React, { useState } from 'react';
import { Student, BJPLIFormData, formatProgramName } from '../../types';
import { Check, Building2, CheckCircle2, XCircle, FileText, Send } from 'lucide-react';

interface BorangBJPLIDocProps {
  student: Student;
  onSaveBjpli?: (data: BJPLIFormData) => void;
  isInteractive?: boolean;
}

export const BorangBJPLIDoc: React.FC<BorangBJPLIDocProps> = ({
  student,
  onSaveBjpli,
  isInteractive = true,
}) => {
  const defaultBjpli: BJPLIFormData = student.bjpliData || {
    keputusan: 'DITERIMA',
    namaPegawaiIndustri: '',
    jawatanPegawai: '',
    jabatan: 'Jabatan Sumber Manusia / Latihan',
    noTelSyarikat: '',
    emelSyarikat: student.emelHrSyarikat || '',
    alamatSyarikat: student.namaSyarikat || '',
    elaunBulanan: 'RM 500.00 / bulan',
    kemudahanAsrama: true,
    kemudahanPengangkutan: false,
    kemudahanMakan: true,
    tarikhMulaDitetapkan: '2026-07-01',
    tarikhTamatDitetapkan: '2026-11-15',
    syaratTambahan: 'Sila bawa pakaian seragam perhotelan yang kemas dan dokumen pengenalan.',
    tarikhRespon: new Date().toISOString().split('T')[0],
  };

  const [formData, setFormData] = useState<BJPLIFormData>(defaultBjpli);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveBjpli) {
      onSaveBjpli(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-white text-slate-900 font-sans p-6 sm:p-10 max-w-4xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Header Form Banner */}
      <div className="border-b-2 border-red-700 pb-4 mb-6 flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">
            KOD BORANG: BJPLI-KKBS-01
          </span>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 mt-1">
            BORANG JAWAPAN PERMOHONAN LATIHAN INDUSTRI
          </h1>
          <p className="text-xs font-semibold text-slate-600">
            KOLEJ KOMUNITI BEAUFORT SABAH | KEMENTERIAN PENDIDIKAN TINGGI
          </p>
        </div>
        <div className="text-right text-xs font-mono text-slate-600">
          <p>SISTEM SLIP KKBS</p>
          <p className="font-bold text-red-700">SESI I: 2026/2027</p>
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded mb-6 text-xs text-amber-900 print:hidden">
        <strong>Peringatan kepada Pihak Industri / HR:</strong> Sila lengkapkan Bahagian B borang jawapan ini dan kembalikan kepada Unit Latihan Industri KKBS atau simpan untuk pengesahan digital pelajar.
      </div>

      {/* BAHAGIAN A: MAKLUMAT PELAJAR & INSTITUSI (Pre-filled) */}
      <div className="mb-6 bg-slate-50 p-4 rounded border border-slate-200">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 bg-slate-200 p-1.5 rounded">
          BAHAGIAN A: MAKLUMAT PELAJAR & INSTITUSI (Diisi Oleh KKBS)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Nama Pelajar:</span>
            <p className="font-bold text-slate-900 uppercase">{student.namaPelajar}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">No. Matrik & No. K/P:</span>
            <p className="font-bold text-blue-900 font-mono">{student.noMatrik} | {student.noIc}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Program Pengajian:</span>
            <p className="font-semibold text-slate-800 uppercase">{formatProgramName(student.program)}</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Tempoh Latihan Dimohon:</span>
            <p className="font-semibold text-slate-800">20 Minggu (01/07/2026 - 15/11/2026)</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Penasihat Akademik (PA):</span>
            <p className="font-semibold text-slate-800">{student.namaPa} ({student.noTelefonPa})</p>
          </div>
          <div>
            <span className="text-slate-500 font-medium">No. Rujukan Surat KKBS:</span>
            <p className="font-mono text-slate-800">{student.rujukanSurat}</p>
          </div>
        </div>
      </div>

      {/* BAHAGIAN B: JAWAPAN / PENGESAHAN SYARIKAT */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border border-slate-300 rounded p-4 bg-white">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 bg-blue-900 text-white p-2 rounded">
            BAHAGIAN B: JAWAPAN & KEPUTUSAN SYARIKAT / INDUSTRI
          </h2>

          {/* Decision Radio / Selection */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-800 uppercase mb-2">
              1. Keputusan Permohonan Latihan Industri:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer text-xs font-bold transition-all ${
                formData.keputusan === 'DITERIMA' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="keputusan"
                  value="DITERIMA"
                  checked={formData.keputusan === 'DITERIMA'}
                  onChange={e => setFormData({ ...formData, keputusan: e.target.value as any })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>[ ] DITERIMA (Accepted)</span>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer text-xs font-bold transition-all ${
                formData.keputusan === 'DITOLAK' 
                  ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="keputusan"
                  value="DITOLAK"
                  checked={formData.keputusan === 'DITOLAK'}
                  onChange={e => setFormData({ ...formData, keputusan: e.target.value as any })}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>[ ] DITOLAK (Declined)</span>
              </label>

              <label className={`flex items-center gap-2 p-3 rounded border cursor-pointer text-xs font-bold transition-all ${
                formData.keputusan === 'MEMERLUKAN_TEMUDUGA' 
                  ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}>
                <input
                  type="radio"
                  name="keputusan"
                  value="MEMERLUKAN_TEMUDUGA"
                  checked={formData.keputusan === 'MEMERLUKAN_TEMUDUGA'}
                  onChange={e => setFormData({ ...formData, keputusan: e.target.value as any })}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>[ ] TEMUDUGA DAHULU</span>
              </label>
            </div>
          </div>

          {/* Officer & Company Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pegawai Penyelia / HR:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Puan Noraini Ahmad / Ms. Shenynn Ng"
                value={formData.namaPegawaiIndustri}
                onChange={e => setFormData({ ...formData, namaPegawaiIndustri: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jawatan Pegawai:</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pengarah HR / Assistant HR Director"
                value={formData.jawatanPegawai}
                onChange={e => setFormData({ ...formData, jawatanPegawai: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Syarikat / Hotel:</label>
              <input
                type="text"
                required
                value={formData.alamatSyarikat}
                onChange={e => setFormData({ ...formData, alamatSyarikat: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 outline-none text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Emel Syarikat / HR:</label>
              <input
                type="email"
                required
                value={formData.emelSyarikat}
                onChange={e => setFormData({ ...formData, emelSyarikat: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 outline-none text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Allowances & Facilities */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6 text-xs space-y-3">
            <h3 className="font-bold text-slate-900 uppercase text-xs">2. Elaun & Kemudahan Disediakan Syarikat:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Elaun Bulanan (Sertakan Nilai):</label>
                <input
                  type="text"
                  placeholder="Contoh: RM 500.00 / bulan / Tiada Elaun"
                  value={formData.elaunBulanan}
                  onChange={e => setFormData({ ...formData, elaunBulanan: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 outline-none font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kemudahan Disediakan:</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.kemudahanAsrama}
                      onChange={e => setFormData({ ...formData, kemudahanAsrama: e.target.checked })}
                      className="rounded text-blue-900 focus:ring-blue-900"
                    />
                    [x] Asrama / Penginapan
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.kemudahanMakan}
                      onChange={e => setFormData({ ...formData, kemudahanMakan: e.target.checked })}
                      className="rounded text-blue-900 focus:ring-blue-900"
                    />
                    [x] Makan / Minum
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.kemudahanPengangkutan}
                      onChange={e => setFormData({ ...formData, kemudahanPengangkutan: e.target.checked })}
                      className="rounded text-blue-900 focus:ring-blue-900"
                    />
                    [x] Pengangkutan
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Syarat / Catatan Tambahan Kepada Pelajar:</label>
              <textarea
                rows={2}
                placeholder="Contoh: Sila jalani ujian Typhiod & sediakan kasut hitam perhotelan."
                value={formData.syaratTambahan}
                onChange={e => setFormData({ ...formData, syaratTambahan: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-900 outline-none text-slate-900"
              />
            </div>
          </div>

          {/* Stamp & Verification */}
          <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="font-bold text-slate-900 mb-2">TANDATANGAN & COP RASMI SYARIKAT:</p>
              <div className="border-2 border-dashed border-slate-300 h-28 rounded flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <Building2 className="w-8 h-8 text-slate-400 mb-1" />
                <span className="text-[10px] text-center px-4">RUANG COP RASMI & TANDATANGAN PEGAWAI SYARIKAT</span>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tarikh Pengesahan Jawapan:</label>
                <input
                  type="date"
                  value={formData.tarikhRespon}
                  onChange={e => setFormData({ ...formData, tarikhRespon: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded text-slate-900 font-mono"
                />
              </div>

              {isInteractive && (
                <div className="mt-4 print:hidden">
                  <button
                    type="submit"
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    SIMPAN / SAHKAN BORANG BJPLI
                  </button>
                  {savedSuccess && (
                    <p className="text-emerald-700 font-bold text-center text-xs mt-2 flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Borang BJPLI Berjaya Disimpan!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
