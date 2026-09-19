import React, { useState } from 'react';
import { X, Save, Printer, AlertCircle, CheckCircle2, Award } from 'lucide-react';
import { Student } from '../../types';
import { renderBorangFLI02Html } from '../documents/BorangFLI02Html';

interface BorangFLI02ModalProps {
  student: Student | any;
  markData: any;
  onClose: () => void;
  onSave: (noMatrik: string, dataToSave: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
}

export const BorangFLI02Modal: React.FC<BorangFLI02ModalProps> = ({
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

  // Bahagian C: Temubual (20%)
  const [c1_1, setC1_1] = useState(getInitialScore('FLI02-C1', 1));
  const [c1_2, setC1_2] = useState(getInitialScore('FLI02-C2', 1));

  const [c2_1, setC2_1] = useState(getInitialScore('FLI02-C3', 1));
  const [c2_2, setC2_2] = useState(getInitialScore('FLI02-C4', 1));

  const [c3_1, setC3_1] = useState(getInitialScore('FLI02-C5', 1));
  const [c3_2, setC3_2] = useState(getInitialScore('FLI02-C6', 1));

  const [ulasan, setUlasan] = useState(
    markData?.['FLI02-ULASAN'] || markData?.['ULASAN'] || markData?.['fli02_ulasan'] || ''
  );

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Calculations
  const peratus_c1 = Number((((c1_1 + c1_2) / 10) * 10).toFixed(2));
  const peratus_c2 = Number((((c2_1 + c2_2) / 10) * 5).toFixed(2));
  const peratus_c3 = Number((((c3_1 + c3_2) / 10) * 5).toFixed(2));
  const total_c = Number((peratus_c1 + peratus_c2 + peratus_c3).toFixed(2));

  const handlePrint = () => {
    try {
      const rowToPrint = {
        ...student,
        ...markData,
        'FLI02-C1': c1_1,
        'FLI02-C2': c1_2,
        'TOTAL7': peratus_c1,
        'FLI02-C3': c2_1,
        'FLI02-C4': c2_2,
        'TOTAL8': peratus_c2,
        'FLI02-C5': c3_1,
        'FLI02-C6': c3_2,
        'TOTAL9': peratus_c3,
        'GRAN TOTAL2': total_c,
        'FLI02-ULASAN': ulasan
      };
      const html = renderBorangFLI02Html(rowToPrint);
      const printWin = window.open('', '_blank', 'width=900,height=700');
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
        printWin.onload = () => {
          setTimeout(() => printWin.print(), 500);
        };
      }
    } catch (err) {
      alert('Ralat semasa membuka cetakan borang.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const noMatrik = student.noMatrik || student['No. Pendaftaran'] || student['NO. MATRIK'] || student.id;

    const dataToSave: Record<string, any> = {
      'FLI02-C1': c1_1,
      'FLI02-C2': c1_2,
      'TOTAL7': peratus_c1,
      'FLI02-C3': c2_1,
      'FLI02-C4': c2_2,
      'TOTAL8': peratus_c2,
      'FLI02-C5': c3_1,
      'FLI02-C6': c3_2,
      'TOTAL9': peratus_c3,
      'GRAN TOTAL2': total_c,
      'FLI02-ULASAN': ulasan,
      'fli02_completed': true,
      'fli02_updatedAt': new Date().toISOString()
    };

    try {
      const res = await onSave(noMatrik, dataToSave);
      if (res.success) {
        setMessage('Markah Penilaian Pemantauan (FLI 02) berjaya disimpan!');
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
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xs">
              FLI 02
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">Borang Penilaian Pemantauan (FLI 02)</h2>
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
          {/* BAHAGIAN C: TEMUBUAL (20%) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-black uppercase text-slate-900">BAHAGIAN C: PENILAIAN TEMUBUAL (20%)</h3>
              <span className="text-xs font-black px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full">
                {total_c} / 20%
              </span>
            </div>

            {/* Criteria 1: Komunikasi lisan (10%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">1. Komunikasi Lisan (10% - CLO 2)</span>
                <span className="text-xs font-bold text-indigo-900 font-mono">{peratus_c1}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('1.1 Kefahaman dan kebolehan menjawab soalan berkaitan kerja', c1_1, setC1_1)}
                {renderRadioRow('1.2 Kebolehan menyampaikan idea dan maklum balas secara lisan', c1_2, setC1_2)}
              </div>
            </div>

            {/* Criteria 2: Kerja berpasukan & tanggungjawab (5%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">2. Kerja berpasukan & tanggungjawab (5% - CLO 3)</span>
                <span className="text-xs font-bold text-indigo-900 font-mono">{peratus_c2}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('2.1 Menunjukkan usaha membina hubungan baik dengan majikan/rakan kerja', c2_1, setC2_1)}
                {renderRadioRow('2.2 Menunjukkan komitmen dan tanggungjawab kerja', c2_2, setC2_2)}
              </div>
            </div>

            {/* Criteria 3: Kemahiran personal (5%) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 uppercase">3. Kemahiran Personal (5% - CLO 4)</span>
                <span className="text-xs font-bold text-indigo-900 font-mono">{peratus_c3}%</span>
              </div>
              <div className="space-y-2">
                {renderRadioRow('3.1 Berupaya mengorganisasikan idea atau tugasan secara sistematik', c3_1, setC3_1)}
                {renderRadioRow('3.2 Bermotivasi dan bersikap positif dalam menyiapkan kerja', c3_2, setC3_2)}
              </div>
            </div>

            {/* Ulasan */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900 uppercase">
                Ulasan Pensyarah Pemantau:
              </label>
              <textarea
                rows={3}
                value={ulasan}
                onChange={(e) => setUlasan(e.target.value)}
                placeholder="Masukkan catatan / maklum balas pemantauan pelajar..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-indigo-900 outline-none"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Jumlah Markah Temubual FLI 02:</p>
              <h4 className="text-2xl font-black text-amber-400">{total_c} / 20%</h4>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full border border-indigo-500/30">
                Pemberat: 20%
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
          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak FLI 02</span>
            </button>

            <div className="flex items-center gap-3">
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
                className="px-6 py-3 bg-indigo-900 hover:bg-indigo-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Markah FLI 02'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
