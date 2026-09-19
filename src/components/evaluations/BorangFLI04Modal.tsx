import React from 'react';
import { X, Printer, Award, FileText } from 'lucide-react';
import { Student, SystemConfig } from '../../types';
import { renderBorangFLI04Html } from '../documents/BorangFLI04Html';

interface BorangFLI04ModalProps {
  student: Student | any;
  markData: any;
  onClose: () => void;
  config?: SystemConfig;
}

export const BorangFLI04Modal: React.FC<BorangFLI04ModalProps> = ({
  student,
  markData,
  onClose,
  config
}) => {
  const getVal = (key: string, fallback = '0'): string => {
    return markData && markData[key] !== undefined && markData[key] !== null ? markData[key].toString() : fallback;
  };

  const f2 = (val: number | string): string => {
    const num = parseFloat(String(val)) || 0;
    return num.toFixed(2);
  };

  const calcCCMS = (mark: number | string, weight: number): string => {
    const num = parseFloat(String(mark)) || 0;
    if (!weight || weight <= 0) return '0.00';
    return ((num / weight) * 100).toFixed(2);
  };

  // FLI 01 Breakdown
  const fli01_a1_pct = parseFloat(getVal('TOTAL1', getVal('fli01_a1_pct', '0'))) || 0;
  const fli01_a2_pct = parseFloat(getVal('TOTAL2', getVal('fli01_a2_pct', '0'))) || 0;
  const fli01_a3_pct = parseFloat(getVal('TOTAL3', getVal('fli01_a3_pct', '0'))) || 0;
  const fli01_a4_pct = parseFloat(getVal('TOTAL4', getVal('fli01_a4_pct', '0'))) || 0;
  const fli01_a5_pct = parseFloat(getVal('TOTAL5', getVal('fli01_a5_pct', '0'))) || 0;
  const fli01_b_pct = parseFloat(getVal('TOTAL6', getVal('fli01_b_pct', '0'))) || 0;
  const total_fli01 = parseFloat(getVal('GRAND TOTAL1', (fli01_a1_pct + fli01_a2_pct + fli01_a3_pct + fli01_a4_pct + fli01_a5_pct + fli01_b_pct).toFixed(2))) || (fli01_a1_pct + fli01_a2_pct + fli01_a3_pct + fli01_a4_pct + fli01_a5_pct + fli01_b_pct);

  // FLI 02 Breakdown
  const fli02_c1_pct = parseFloat(getVal('TOTAL7', getVal('fli02_c1_pct', '0'))) || 0;
  const fli02_c2_pct = parseFloat(getVal('TOTAL8', getVal('fli02_c2_pct', '0'))) || 0;
  const fli02_c3_pct = parseFloat(getVal('TOTAL9', getVal('fli02_c3_pct', '0'))) || 0;
  const total_fli02 = parseFloat(getVal('GRAN TOTAL2', (fli02_c1_pct + fli02_c2_pct + fli02_c3_pct).toFixed(2))) || (fli02_c1_pct + fli02_c2_pct + fli02_c3_pct);

  // FLI 03 Breakdown
  const fli03_d1_pct = parseFloat(getVal('TOTAL10', getVal('fli03_d1_pct', '0'))) || 0;
  const fli03_d2_pct = parseFloat(getVal('TOTAL11', getVal('fli03_d2_pct', '0'))) || 0;
  const total_fli03 = parseFloat(getVal('GRAND TOTAL3', (fli03_d1_pct + fli03_d2_pct).toFixed(2))) || (fli03_d1_pct + fli03_d2_pct);

  // Grand Total
  const grand_total = parseFloat((total_fli01 + total_fli02 + total_fli03).toFixed(2));

  const handlePrint = () => {
    try {
      const rowToPrint = {
        ...student,
        ...markData,
        TOTAL1: fli01_a1_pct,
        TOTAL2: fli01_a2_pct,
        TOTAL3: fli01_a3_pct,
        TOTAL4: fli01_a4_pct,
        TOTAL5: fli01_a5_pct,
        TOTAL6: fli01_b_pct,
        'GRAND TOTAL1': total_fli01,
        TOTAL7: fli02_c1_pct,
        TOTAL8: fli02_c2_pct,
        TOTAL9: fli02_c3_pct,
        'GRAN TOTAL2': total_fli02,
        TOTAL10: fli03_d1_pct,
        TOTAL11: fli03_d2_pct,
        'GRAND TOTAL3': total_fli03
      };
      const html = renderBorangFLI04Html(rowToPrint, config);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
              FLI 04
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">Rumusan Penilaian Latihan Industri (FLI 04)</h2>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary Score Cards with 2 decimal places */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">1. Industri (FLI 01)</span>
              <h4 className="text-lg font-black text-blue-950 mt-0.5">{f2(total_fli01)} / 60%</h4>
              <p className="text-[10px] font-mono text-blue-700 mt-0.5">CCMS: {calcCCMS(total_fli01, 60)}</p>
            </div>
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide">2. Pemantauan (FLI 02)</span>
              <h4 className="text-lg font-black text-indigo-950 mt-0.5">{f2(total_fli02)} / 20%</h4>
              <p className="text-[10px] font-mono text-indigo-700 mt-0.5">CCMS: {calcCCMS(total_fli02, 20)}</p>
            </div>
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wide">3. Laporan (FLI 03)</span>
              <h4 className="text-lg font-black text-teal-950 mt-0.5">{f2(total_fli03)} / 20%</h4>
              <p className="text-[10px] font-mono text-teal-700 mt-0.5">CCMS: {calcCCMS(total_fli03, 20)}</p>
            </div>
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-md">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">Jumlah Keseluruhan</span>
              <h4 className="text-lg font-black text-amber-400 mt-0.5">{f2(grand_total)} / 100</h4>
              <p className="text-[10px] font-mono text-amber-300 mt-0.5">CCMS: {calcCCMS(grand_total, 100)}</p>
            </div>
          </div>

          {/* Detailed Breakdown Table with CCMS Column */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-black uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">Bil</th>
                  <th className="py-2.5 px-3">Kriteria Penilaian</th>
                  <th className="py-2.5 px-3 text-center w-16">CLO</th>
                  <th className="py-2.5 px-3 text-center w-20">Pemberat</th>
                  <th className="py-2.5 px-3 text-center w-24">Markah (%)</th>
                  <th className="py-2.5 px-3 text-center w-28 bg-slate-900 text-amber-300">Markah CCMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {/* 1. PENILAIAN INDUSTRI */}
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={6} className="py-1.5 px-3 uppercase text-[10px]">1. PENILAIAN INDUSTRI (FLI 01)</td>
                </tr>
                <tr className="bg-slate-50/70 font-bold text-slate-700">
                  <td colSpan={6} className="py-1 px-3 text-[9.5px]">BAHAGIAN A: PENILAIAN PRESTASI (50%)</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">1</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kemahiran di tempat kerja</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">1</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">30%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli01_a1_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli01_a1_pct, 30)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">2</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Komunikasi berkesan</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">2</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli01_a2_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli01_a2_pct, 5)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">3</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kerja berpasukan dan tanggungjawab</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">3</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli01_a3_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli01_a3_pct, 5)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">4</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kemahiran personal</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">4</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli01_a4_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli01_a4_pct, 5)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">5</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Nilai, etika dan profesionalisme</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">5</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli01_a5_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli01_a5_pct, 5)}</td>
                </tr>
                <tr className="bg-slate-50/70 font-bold text-slate-700">
                  <td colSpan={6} className="py-1 px-3 text-[9.5px]">BAHAGIAN B: BUKU LOG LI (10%)</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">1</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kemahiran di tempat kerja</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">1</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">10%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli01_b_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli01_b_pct, 10)}</td>
                </tr>
                <tr className="bg-blue-50/60 font-black text-blue-900">
                  <td colSpan={3} className="py-1.5 px-3 text-right uppercase text-[10px]">Jumlah Penilaian Industri (FLI 01):</td>
                  <td className="py-1.5 px-3 text-center">60%</td>
                  <td className="py-1.5 px-3 text-center font-mono">{f2(total_fli01)}%</td>
                  <td className="py-1.5 px-3 text-center font-mono text-blue-950 font-black">{calcCCMS(total_fli01, 60)}</td>
                </tr>

                {/* 2. PENILAIAN PEMANTAUAN */}
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={6} className="py-1.5 px-3 uppercase text-[10px]">2. PENILAIAN PEMANTAUAN (FLI 02)</td>
                </tr>
                <tr className="bg-slate-50/70 font-bold text-slate-700">
                  <td colSpan={6} className="py-1 px-3 text-[9.5px]">BAHAGIAN C: TEMUBUAL (20%)</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">1</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Komunikasi lisan</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">2</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">10%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli02_c1_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli02_c1_pct, 10)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">2</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kerja berpasukan dan tanggungjawab</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">3</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli02_c2_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli02_c2_pct, 5)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">3</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kemahiran personal</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">4</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli02_c3_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli02_c3_pct, 5)}</td>
                </tr>
                <tr className="bg-indigo-50/60 font-black text-indigo-900">
                  <td colSpan={3} className="py-1.5 px-3 text-right uppercase text-[10px]">Jumlah Penilaian Pemantauan (FLI 02):</td>
                  <td className="py-1.5 px-3 text-center">20%</td>
                  <td className="py-1.5 px-3 text-center font-mono">{f2(total_fli02)}%</td>
                  <td className="py-1.5 px-3 text-center font-mono text-indigo-950 font-black">{calcCCMS(total_fli02, 20)}</td>
                </tr>

                {/* 3. PENILAIAN LAPORAN AKHIR */}
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={6} className="py-1.5 px-3 uppercase text-[10px]">3. PENILAIAN LAPORAN AKHIR (FLI 03)</td>
                </tr>
                <tr className="bg-slate-50/70 font-bold text-slate-700">
                  <td colSpan={6} className="py-1 px-3 text-[9.5px]">BAHAGIAN D: LAPORAN AKHIR (20%)</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">1</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Kemahiran di tempat kerja</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">1</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">15%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli03_d1_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli03_d1_pct, 15)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-center text-slate-500">2</td>
                  <td className="py-1.5 px-3 font-semibold text-slate-800">Komunikasi bertulis</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-700">2</td>
                  <td className="py-1.5 px-3 text-center text-slate-600">5%</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{f2(fli03_d2_pct)}%</td>
                  <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-800">{calcCCMS(fli03_d2_pct, 5)}</td>
                </tr>
                <tr className="bg-teal-50/60 font-black text-teal-900">
                  <td colSpan={3} className="py-1.5 px-3 text-right uppercase text-[10px]">Jumlah Penilaian Laporan Akhir (FLI 03):</td>
                  <td className="py-1.5 px-3 text-center">20%</td>
                  <td className="py-1.5 px-3 text-center font-mono">{f2(total_fli03)}%</td>
                  <td className="py-1.5 px-3 text-center font-mono text-teal-950 font-black">{calcCCMS(total_fli03, 20)}</td>
                </tr>

                {/* GRAND TOTAL */}
                <tr className="bg-slate-900 text-white font-black text-xs">
                  <td colSpan={3} className="py-2.5 px-3 text-right uppercase tracking-wider">
                    Jumlah Keseluruhan (A + B + C + D):
                  </td>
                  <td className="py-2.5 px-3 text-center">100%</td>
                  <td className="py-2.5 px-3 text-center text-amber-400 font-mono text-sm">
                    {f2(grand_total)}
                  </td>
                  <td className="py-2.5 px-3 text-center text-amber-300 font-mono text-sm bg-slate-950">
                    {calcCCMS(grand_total, 100)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Box formatted as requested */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs font-bold text-slate-800">
              Disediakan oleh Pegawai Perhubungan Industri dan Alumni,
            </p>
            <div className="mt-8 border-b border-slate-400 w-56"></div>
            {/* Space for cop hidup */}
            <p className="text-xs font-bold text-slate-700 mt-6">
              Tarikh:
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Borang FLI 04 (1 Halaman A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
