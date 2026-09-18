import React from 'react';
import { Award, Printer, User, GraduationCap, Calendar, CheckSquare, Square } from 'lucide-react';

interface BorangFLI02DocProps {
  row: any;
  onClose: () => void;
}

export const BorangFLI02Doc: React.FC<BorangFLI02DocProps> = ({ row, onClose }) => {
  // Helpers to get data from row dynamically
  const getVal = (key: string, fallback = '') => {
    return row[key] !== undefined && row[key] !== null ? row[key].toString() : fallback;
  };

  const getMatrik = () => {
    return row['No. Pendaftaran'] || row['NO. MATRIK'] || row['NO MATRIK'] || row['NO PENDAFTARAN'] || '';
  };

  const getNama = () => {
    return row['NAMA PELAJAR'] || row['NAMA'] || '';
  };

  const getProgram = () => {
    return row['Program'] || row['PROGRAM'] || '';
  };

  const getKelas = () => {
    return row['Kelas'] || row['KELAS'] || '';
  };

  const getStaffId = () => {
    return row['STAFF ID'] || row['ID STAF'] || row['ID STAFF'] || '';
  };

  const getPensyarah = () => {
    return row['NAMA PENSYARAH PEMANTAU'] || row['NAMA PEMANTAU'] || '';
  };

  const getSesi = () => {
    return row['SESI'] || row['SESI '] || 'SESI I 2026/2027';
  };

  // Extract score numeric values
  const score_c1_1 = parseInt(getVal('FLI02-C1', '0')) || 0;
  const score_c1_2 = parseInt(getVal('FLI02-C2', '0')) || 0;
  const peratus_c1 = parseFloat(getVal('TOTAL7', '0')) || 0;

  const score_c2_1 = parseInt(getVal('FLI02-C3', '0')) || 0;
  const score_c2_2 = parseInt(getVal('FLI02-C4', '0')) || 0;
  const peratus_c2 = parseFloat(getVal('TOTAL8', '0')) || 0;

  const score_c3_1 = parseInt(getVal('FLI02-C5', '0')) || 0;
  const score_c3_2 = parseInt(getVal('FLI02-C6', '0')) || 0;
  const peratus_c3 = parseFloat(getVal('TOTAL9', '0')) || 0;

  const total_c = parseFloat(getVal('GRAN TOTAL2', '0')) || 0;

  const handlePrint = () => {
    window.print();
  };

  // Helper to render checkmark grid for scales 1 to 5
  const renderScaleChecks = (score: number) => {
    return (
      <div className="flex justify-center items-center gap-4 text-center font-bold">
        {[1, 2, 3, 4, 5].map((val) => (
          <div key={val} className="flex flex-col items-center">
            <span className="text-[10px] text-slate-500 font-normal">{val}</span>
            {score === val ? (
              <span className="w-5 h-5 border border-slate-900 bg-slate-900 text-white flex items-center justify-center text-[10px] font-black rounded-xs">
                ✓
              </span>
            ) : (
              <span className="w-5 h-5 border border-slate-400 flex items-center justify-center text-[10px] font-normal text-slate-350 rounded-xs">
                
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-800 p-4 sm:p-8 flex flex-col items-center justify-start overflow-y-auto print:bg-white print:p-0">
      
      {/* Control Banner for Printing - Hidden in Print Mode */}
      <div className="max-w-4xl w-full bg-slate-900 text-white p-4 rounded-t-3xl border border-slate-700 flex items-center justify-between shadow-lg print:hidden">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="font-extrabold text-xs uppercase tracking-wider">Pratinjau Borang Penilaian FLI 02</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 cursor-pointer shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            Cetak Borang
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-750 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-black uppercase cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* The Printable Page Body */}
      <div className="max-w-4xl w-full bg-white text-slate-900 p-8 sm:p-12 border-x border-b border-slate-300 shadow-2xl print:shadow-none print:border-none print:p-0 flex flex-col font-sans">
        
        {/* Header / Letterhead */}
        <div className="border-b-2 border-slate-900 pb-3 mb-5 flex items-center gap-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/26/Coat_of_arms_of_Malaysia.svg" 
            alt="Jata Negara" 
            className="w-14 h-auto object-contain shrink-0"
          />
          <div className="flex-1">
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900 font-sans leading-none">
              KOLEJ KOMUNITI BEAUFORT
            </h1>
            <p className="text-[10px] font-bold text-slate-800 font-sans leading-tight mt-0.5">
              JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI
            </p>
            <p className="text-[9px] text-slate-700 font-sans leading-none mt-0.5">
              KEMENTERIAN PENDIDIKAN TINGGI MALAYSIA
            </p>
          </div>
          <div className="text-right text-[9px] font-mono text-slate-500 font-bold shrink-0">
            <p className="border border-slate-800 px-2 py-1 rounded text-slate-900">KOD DOKUMEN: FLI 02</p>
          </div>
        </div>

        {/* Form Title Banner */}
        <div className="text-center bg-slate-950 text-white py-2 px-4 rounded-md mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider">
            BORANG PENILAIAN PENSYARAH PEMANTAU (FLI 02)
          </h2>
          <p className="text-[9px] font-bold tracking-widest text-slate-300 mt-0.5">
            KURSUS: SUT40078 - LATIHAN INDUSTRI (SESI: {getSesi()})
          </p>
        </div>

        {/* Section A: Student Details */}
        <div className="mb-5">
          <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-wider mb-2 border-b-2 border-slate-900 pb-0.5">
            BAHAGIAN A: MAKLUMAT PELAJAR & INSTITUSI
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] leading-relaxed">
            <div className="grid grid-cols-3 border-b pb-1 border-slate-150">
              <span className="text-slate-900 font-bold">Nama Pelajar</span>
              <span className="col-span-2 font-bold text-slate-900 uppercase">: {getNama()}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-1 border-slate-150">
              <span className="text-slate-900 font-bold">No. Pendaftaran</span>
              <span className="col-span-2 font-bold text-slate-900 uppercase">: {getMatrik()}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-1 border-slate-150">
              <span className="text-slate-900 font-bold">Program Pengajian</span>
              <span className="col-span-2 font-bold text-slate-900 uppercase">: {getProgram()}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-1 border-slate-150">
              <span className="text-slate-900 font-bold">Kelas</span>
              <span className="col-span-2 font-bold text-slate-900 uppercase">: {getKelas()}</span>
            </div>
          </div>
        </div>

        {/* Section C: Evaluation Criteria */}
        <div className="mb-5 flex-1">
          <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-wider mb-2 border-b-2 border-slate-900 pb-0.5">
            BAHAGIAN C: PENILAIAN TEMUBUAL (PEMBERAT: 20%)
          </h3>
          <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-bold uppercase border-b border-slate-400">
                <th className="py-2 px-3 border-r border-slate-400 w-1/2">Aspek Penilaian & Kriteria</th>
                <th className="py-2 px-3 border-r border-slate-400 text-center w-1/3">Skala Pemarkahan (1 - 5)</th>
                <th className="py-2 px-3 text-center w-1/6">Pemberat & Markah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400">
              
              {/* Criterion 1 */}
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  <p className="font-extrabold text-slate-950 uppercase">1. KOMUNIKASI LISAN (CLO 2)</p>
                  <p className="text-slate-600 mt-1 leading-snug">
                    1.1 Kefahaman dan kebolehan menjawab soalan dengan tepat, jelas dan tenang.
                  </p>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  {renderScaleChecks(score_c1_1)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-800" rowSpan={2}>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500">CLO 2</span>
                    <span className="text-sm font-black text-slate-900">{peratus_c1.toFixed(1)}</span>
                    <span className="text-[8px] text-slate-400">Had: 10</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  <p className="text-slate-600 leading-snug">
                    1.2 Penyampaian idea yang teratur, menarik, berkesan serta berkeyakinan tinggi.
                  </p>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  {renderScaleChecks(score_c1_2)}
                </td>
              </tr>

              {/* Criterion 2 */}
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  <p className="font-extrabold text-slate-950 uppercase">2. KERJA BERPASUKAN & TANGGUNGJAWAB (CLO 3)</p>
                  <p className="text-slate-600 mt-1 leading-snug">
                    2.1 Membina hubungan baik dan bekerjasama dengan rakan sekerja pelbagai peringkat.
                  </p>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  {renderScaleChecks(score_c2_1)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-800" rowSpan={2}>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500">CLO 3</span>
                    <span className="text-sm font-black text-slate-900">{peratus_c2.toFixed(1)}</span>
                    <span className="text-[8px] text-slate-400">Had: 5</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  <p className="text-slate-600 leading-snug">
                    2.2 Bertanggungjawab melaksanakan tugasan individu dan kumpulan secara proaktif.
                  </p>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  {renderScaleChecks(score_c2_2)}
                </td>
              </tr>

              {/* Criterion 3 */}
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  <p className="font-extrabold text-slate-950 uppercase">3. KEMAHIRAN PERSONAL (CLO 4)</p>
                  <p className="text-slate-600 mt-1 leading-snug">
                    3.1 Kebolehan mengorganisasi idea dan menyusun atur laporan kerja secara bersistem.
                  </p>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  {renderScaleChecks(score_c3_1)}
                </td>
                <td className="py-2.5 px-3 text-center font-bold text-slate-800" rowSpan={2}>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[8px] uppercase font-bold text-slate-500">CLO 4</span>
                    <span className="text-sm font-black text-slate-900">{peratus_c3.toFixed(1)}</span>
                    <span className="text-[8px] text-slate-400">Had: 5</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  <p className="text-slate-600 leading-snug">
                    3.2 Bermotivasi, berdisiplin serta menunjukkan inisiatif tinggi menyiapkan tugasan.
                  </p>
                </td>
                <td className="py-2.5 px-3 border-r border-slate-400">
                  {renderScaleChecks(score_c3_2)}
                </td>
              </tr>

              {/* Total Row */}
              <tr className="bg-slate-900 text-white font-extrabold">
                <td className="py-3 px-3 uppercase border-r border-slate-400 text-[11px]" colSpan={2}>
                  Jumlah Markah Penilaian Temubual (Bahagian C)
                </td>
                <td className="py-3 px-3 text-center text-sm font-black text-amber-400">
                  {total_c.toFixed(1)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">/ 20.0</span>
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Section D: Feedback/Comments */}
        <div className="mb-8 border border-slate-400 rounded p-4 bg-slate-50/50">
          <h4 className="text-[9px] font-black uppercase text-slate-800 tracking-wider mb-2">
            ULASAN / CADANGAN PENSYARAH PEMANTAU:
          </h4>
          <div className="h-16 border-b border-dashed border-slate-400 w-full mt-2"></div>
          <div className="h-6 border-b border-dashed border-slate-400 w-full mt-2"></div>
        </div>

        <div className="grid grid-cols-2 gap-12 text-[10px] pt-8 mt-auto">
          <div className="space-y-2">
            <p className="font-extrabold text-slate-950 uppercase tracking-wide">Tandatangan Pensyarah Pemantau</p>
            <div className="pt-12 border-b border-slate-900 w-56"></div>
            <p className="text-slate-800 font-bold mt-2">Nama & Cop:</p>
            <p className="text-slate-800 font-bold mt-12">Tarikh: .......................................</p>
          </div>

          <div className="space-y-2 ml-auto text-left w-56">
            <p className="font-extrabold text-slate-950 uppercase tracking-wide">Pengesahan PPIA</p>
            <div className="pt-12 border-b border-slate-900 w-56"></div>
            <p className="text-slate-800 font-bold mt-2">Nama & Cop:</p>
            <p className="text-slate-800 font-bold mt-12">Tarikh: .......................................</p>
          </div>
        </div>

      </div>
    </div>
  );
};
