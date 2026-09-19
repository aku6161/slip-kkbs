import React, { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle2, Award, ClipboardCheck } from 'lucide-react';
import { Student } from '../../types';

interface BorangFLI01ModalProps {
  student: Student | any;
  markData: any;
  onClose: () => void;
  onSave: (noMatrik: string, dataToSave: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
}

export const BorangFLI01Modal: React.FC<BorangFLI01ModalProps> = ({
  student,
  markData,
  onClose,
  onSave
}) => {
  const getInitialScore = (key: string, fallback = 1): number => {
    if (markData && markData[key] !== undefined && markData[key] !== '') {
      const val = parseInt(markData[key]);
      return isNaN(val) ? fallback : val;
    }
    return fallback;
  };

  // Bahagian A: Penilaian Prestasi (50%)
  const [a1_1, setA1_1] = useState(getInitialScore('FLI01-A1', 1));
  const [a1_2, setA1_2] = useState(getInitialScore('FLI01-A2', 1));
  const [a1_3, setA1_3] = useState(getInitialScore('FLI01-A3', 1));
  const [a1_4, setA1_4] = useState(getInitialScore('FLI01-A4', 1));
  const [a1_5, setA1_5] = useState(getInitialScore('FLI01-A5', 1));
  const [a1_6, setA1_6] = useState(getInitialScore('FLI01-A6', 1));

  const [a2_1, setA2_1] = useState(getInitialScore('FLI01-A7', 1));
  const [a2_2, setA2_2] = useState(getInitialScore('FLI01-A8', 1));

  const [a3_1, setA3_1] = useState(getInitialScore('FLI01-A9', 1));
  const [a3_2, setA3_2] = useState(getInitialScore('FLI01-A10', 1));

  const [a4_1, setA4_1] = useState(getInitialScore('FLI01-A11', 1));
  const [a4_2, setA4_2] = useState(getInitialScore('FLI01-A12', 1));

  const [a5_1, setA5_1] = useState(getInitialScore('FLI01-A13', 1));
  const [a5_2, setA5_2] = useState(getInitialScore('FLI01-A14', 1));

  // Bahagian B: Buku Log LI (10%)
  const [b1_1, setB1_1] = useState(getInitialScore('FLI01-B1', 1));
  const [b1_2, setB1_2] = useState(getInitialScore('FLI01-B2', 1));
  const [b1_3, setB1_3] = useState(getInitialScore('FLI01-B3', 1));

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Calculations
  const total_a1_raw = a1_1 + a1_2 + a1_3 + a1_4 + a1_5 + a1_6;
  const peratus_a1 = Number(((total_a1_raw / 30) * 30).toFixed(2));

  const total_a2_raw = a2_1 + a2_2;
  const peratus_a2 = Number(((total_a2_raw / 10) * 5).toFixed(2));

  const total_a3_raw = a3_1 + a3_2;
  const peratus_a3 = Number(((total_a3_raw / 10) * 5).toFixed(2));

  const total_a4_raw = a4_1 + a4_2;
  const peratus_a4 = Number(((total_a4_raw / 10) * 5).toFixed(2));

  const total_a5_raw = a5_1 + a5_2;
  const peratus_a5 = Number(((total_a5_raw / 10) * 5).toFixed(2));

  const total_bahagian_a = Number((peratus_a1 + peratus_a2 + peratus_a3 + peratus_a4 + peratus_a5).toFixed(2));

  const total_b_raw = b1_1 + b1_2 + b1_3;
  const peratus_b = Number(((total_b_raw / 15) * 10).toFixed(2));

  const total_fli01 = Number((total_bahagian_a + peratus_b).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const noMatrik = student.noMatrik || student['No. Pendaftaran'] || student['NO. MATRIK'] || student.id;

    const dataToSave: Record<string, any> = {
      'FLI01-A1': a1_1,
      'FLI01-A2': a1_2,
      'FLI01-A3': a1_3,
      'FLI01-A4': a1_4,
      'FLI01-A5': a1_5,
      'FLI01-A6': a1_6,
      'TOTAL1': peratus_a1,
      'FLI01-A7': a2_1,
      'FLI01-A8': a2_2,
      'TOTAL2': peratus_a2,
      'FLI01-A9': a3_1,
      'FLI01-A10': a3_2,
      'TOTAL3': peratus_a3,
      'FLI01-A11': a4_1,
      'FLI01-A12': a4_2,
      'TOTAL4': peratus_a4,
      'FLI01-A13': a5_1,
      'FLI01-A14': a5_2,
      'TOTAL5': peratus_a5,
      'FLI01-B1': b1_1,
      'FLI01-B2': b1_2,
      'FLI01-B3': b1_3,
      'TOTAL6': peratus_b,
      'GRAND TOTAL1': total_fli01,
      'fli01_completed': true,
      'fli01_updatedAt': new Date().toISOString()
    };

    try {
      const res = await onSave(noMatrik, dataToSave);
      if (res.success) {
        setMessage('Markah Penilaian Industri (FLI 01) berjaya disimpan!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Gagal menyimpan markah.');
      }
    } catch (err: any) {
      setError(err.message || 'Ralat berlaku semasa menyimpan markah.');
    } finally {
      setLoading(false);
    }
  };

  const renderRadioRow = (label: string, value: number, onChange: (val: number) => void) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 gap-2">
      <span className="text-xs font-bold text-slate-800 leading-snug">{label}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        {[1, 2, 3, 4, 5].map((num) => (
          <label
            key={num}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black cursor-pointer transition-all ${
              value === num
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <input
              type="radio"
              name={label}
              value={num}
              checked={value === num}
              onChange={() => onChange(num)}
              className="sr-only"
            />
            {num}
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs">
              FLI 01
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">Borang Penilaian Industri (FLI 01)</h2>
              <p className="text-xs text-slate-300">
                {student.namaPelajar || student['NAMA PELAJAR']} • <span className="font-mono text-amber-300 font-bold">{student.noMatrik || student['No. Pendaftaran']}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Note Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 font-semibold flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-blue-900 shrink-0" />
            <span>Medan untuk pentadbir / pensyarah memasukkan markah Penilaian Prestasi Industri (Bahagian A: 50%) dan Buku Log (Bahagian B: 10%).</span>
          </div>

          {/* BAHAGIAN A: PENILAIAN PRESTASI (50%) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black uppercase text-slate-900">BAHAGIAN A: PENILAIAN PRESTASI (50%)</h3>
              <span className="text-xs font-black px-3 py-1 bg-blue-100 text-blue-900 rounded-full">
                {total_bahagian_a} / 50%
              </span>
            </div>

            {/* Criteria 1: Kemahiran di tempat kerja (30%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">1. Kemahiran di tempat kerja (30% - CLO 1)</span>
                <span className="text-xs font-bold text-blue-900 font-mono">{peratus_a1}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('1.1 Menunjukkan kemahiran secara hands-on di tempat kerja', a1_1, setA1_1)}
                {renderRadioRow('1.2 Pengetahuan sedia ada dengan kerja', a1_2, setA1_2)}
                {renderRadioRow('1.3 Kemahiran penggunaan alatan dan kelengkapan', a1_3, setA1_3)}
                {renderRadioRow('1.4 Pelaksanaan kerja mengikut Prosedur Operasi Standard (SOP)', a1_4, setA1_4)}
                {renderRadioRow('1.5 Tindak balas terhadap masalah semasa melaksanakan kerja', a1_5, setA1_5)}
                {renderRadioRow('1.6 Kemahiran pengurusan masa ketika melaksanakan kerja', a1_6, setA1_6)}
              </div>
            </div>

            {/* Criteria 2: Komunikasi berkesan (5%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">2. Komunikasi berkesan (5% - CLO 2)</span>
                <span className="text-xs font-bold text-blue-900 font-mono">{peratus_a2}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('2.1 Komunikasi yang berkesan', a2_1, setA2_1)}
                {renderRadioRow('2.2 Hubungan baik dalam organisasi', a2_2, setA2_2)}
              </div>
            </div>

            {/* Criteria 3: Kerja berpasukan dan bertanggungjawab (5%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">3. Kerja berpasukan & bertanggungjawab (5% - CLO 3)</span>
                <span className="text-xs font-bold text-blue-900 font-mono">{peratus_a3}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('3.1 Menghormati dan menerima pendapat', a3_1, setA3_1)}
                {renderRadioRow('3.2 Tanggungjawab kerja', a3_2, setA3_2)}
              </div>
            </div>

            {/* Criteria 4: Kemahiran personal (5%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">4. Kemahiran personal (5% - CLO 4)</span>
                <span className="text-xs font-bold text-blue-900 font-mono">{peratus_a4}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('4.1 Penambahbaikan semasa melaksanakan kerja', a4_1, setA4_1)}
                {renderRadioRow('4.2 Bermotivasi dalam menyiapkan kerja', a4_2, setA4_2)}
              </div>
            </div>

            {/* Criteria 5: Nilai, etika dan profesionalisme (5%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">5. Nilai, etika dan profesionalisme (5% - CLO 5)</span>
                <span className="text-xs font-bold text-blue-900 font-mono">{peratus_a5}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('5.1 Budaya kerja yang baik', a5_1, setA5_1)}
                {renderRadioRow('5.2 Penampilan diri dan pemakaian yang bersesuaian di tempat kerja', a5_2, setA5_2)}
              </div>
            </div>
          </div>

          {/* BAHAGIAN B: BUKU LOG LI (10%) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black uppercase text-slate-900">BAHAGIAN B: BUKU LOG LI (10%)</h3>
              <span className="text-xs font-black px-3 py-1 bg-purple-100 text-purple-900 rounded-full">
                {peratus_b} / 10%
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">1. Kemahiran di tempat kerja (10% - CLO 1)</span>
                <span className="text-xs font-bold text-purple-900 font-mono">{peratus_b}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('1.1 Perincian kerja', b1_1, setB1_1)}
                {renderRadioRow('1.2 Lampiran perincian kerja', b1_2, setB1_2)}
                {renderRadioRow('1.3 Kekemasan penulisan buku log', b1_3, setB1_3)}
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jumlah Keseluruhan FLI 01 (A + B):</p>
              <h4 className="text-2xl font-black text-amber-400">{total_fli01} / 60%</h4>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                Pemberat: 60%
              </span>
            </div>
          </div>

          {message && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Markah FLI 01'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
