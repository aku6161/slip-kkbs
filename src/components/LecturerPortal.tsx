import React, { useState, useCallback } from 'react';
import { LogOut, GraduationCap, ClipboardList, UserCheck, CheckCircle2, ChevronRight, AlertCircle, Save, X, Edit, Award, Printer } from 'lucide-react';
import { Student, SystemConfig } from '../types';
import { renderBorangFLI02Html } from './documents/BorangFLI02Html';

interface LecturerPortalProps {
  staffId: string;
  students: Student[];
  markah: any[];
  markahHeaders: string[];
  onSaveMark: (noMatrik: string, marks: any[]) => Promise<{ success: boolean; message?: string }>;
  onLogout: () => void;
  config: SystemConfig;
}

export const LecturerPortal: React.FC<LecturerPortalProps> = ({
  staffId,
  students,
  markah,
  markahHeaders,
  onSaveMark,
  onLogout,
  config
}) => {
  const [selectedStudentRow, setSelectedStudentRow] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [ulasan, setUlasan] = useState('');

  // Form State for marks (scales 1-5)
  const [scores, setScores] = useState({
    c1_1: 1, // Kefahaman dan kebolehan menjawab soalan
    c1_2: 1, // Penyampaian idea
    c2_1: 1, // Membina hubungan baik
    c2_2: 1, // Tanggungjawab kerja
    c3_1: 1, // Organisasi idea
    c3_2: 1, // Bermotivasi dalam menyiapkan kerja
  });

  // Helper to find the key for ID STAF / STAFF ID in markah row
  const getStaffKey = (row: any) => {
    if (!row) return '';
    return Object.keys(row).find(key => {
      const uKey = key.toUpperCase();
      return uKey.includes('ID STAF') || 
             uKey.includes('ID STAFF') || 
             uKey.includes('ID PEMANTAU') || 
             uKey.includes('STAFF ID') || 
             uKey.includes('STAF ID') ||
             (uKey.includes('PEMANTAU') && (uKey.includes('IC') || uKey.includes('KP') || uKey.includes('NO.')));
    }) || '';
  };

  // Helper to get Matric Number key in markah row
  const getMatrikKey = (row: any) => {
    if (!row) return '';
    return Object.keys(row).find(key => {
      const uKey = key.toUpperCase();
      return uKey === 'NO. MATRIK' || uKey === 'NO MATRIK' || uKey === 'NO PENDAFTARAN' || uKey === 'NO. PENDAFTARAN';
    }) || '';
  };

  // Helper to get Student Name key in markah row
  const getNameKey = (row: any) => {
    if (!row) return '';
    return Object.keys(row).find(key => {
      const uKey = key.toUpperCase();
      return uKey === 'NAMA PELAJAR' || uKey === 'NAMA' || uKey === 'NAMA PELAJAR ';
    }) || '';
  };

  // Helper to get Program/Kelas key in markah row
  const getProgramKey = (row: any) => {
    if (!row) return '';
    return Object.keys(row).find(key => {
      const uKey = key.toUpperCase();
      return uKey === 'PROGRAM' || uKey === 'KURSUS';
    }) || '';
  };

  const getKelasKey = (row: any) => {
    if (!row) return '';
    return Object.keys(row).find(key => {
      const uKey = key.toUpperCase();
      return uKey === 'KELAS';
    }) || '';
  };

  // Filter markah rows where staff ID matches (checks Pemantau 1, Pemantau 2, or general Staff ID)
  const lecturerStudents = React.useMemo(() => {
    const isMaster = staffId.toUpperCase() === 'ADMIN' || staffId.toUpperCase() === 'STAFF';
    if (isMaster) return markah;

    const cleanStaffId = staffId.toUpperCase().replace(/\s+/g, '');
    const filteredMarkah = markah.filter(row => {
      if (!row) return false;
      const keys = Object.keys(row).filter(key => {
        const uKey = key.toUpperCase();
        return uKey.includes('ID STAF') || 
               uKey.includes('ID STAFF') || 
               uKey.includes('ID PEMANTAU') || 
               uKey.includes('STAFF ID') || 
               uKey.includes('STAF ID') ||
               (uKey.includes('PEMANTAU') && (uKey.includes('IC') || uKey.includes('KP') || uKey.includes('NO.')));
      });
      return keys.some(key => {
        const val = String(row[key] || '').toUpperCase().replace(/\s+/g, '');
        return val === cleanStaffId || (cleanStaffId.length > 3 && val.includes(cleanStaffId));
      });
    });

    return filteredMarkah;
  }, [markah, staffId]);

  // Name of the lecturer (from first matched student row, if any)
  const lecturerName = React.useMemo(() => {
    if (lecturerStudents.length > 0) {
      const first = lecturerStudents[0];
      return first['NAMA PENSYARAH PEMANTAU'] || first['NAMA PEMANTAU'] || first['PENSYARAH PEMANTAU'] || `PENSYARAH (${staffId})`;
    }
    return `PENSYARAH (${staffId})`;
  }, [lecturerStudents, staffId]);

  // Calculate percentage values
  const calcC1Peratus = (c1_1: number, c1_2: number) => {
    return Number(((c1_1 + c1_2) / 10 * 10).toFixed(2)); // Weight 10%
  };

  const calcC2Peratus = (c2_1: number, c2_2: number) => {
    return Number(((c2_1 + c2_2) / 10 * 5).toFixed(2)); // Weight 5%
  };

  const calcC3Peratus = (c3_1: number, c3_2: number) => {
    return Number(((c3_1 + c3_2) / 10 * 5).toFixed(2)); // Weight 5%
  };

  const calcTotalC = (c1: number, c2: number, c3: number) => {
    return Number((c1 + c2 + c3).toFixed(2)); // Total Bahagian C (20%)
  };

  const c1_peratus = calcC1Peratus(scores.c1_1, scores.c1_2);
  const c2_peratus = calcC2Peratus(scores.c2_1, scores.c2_2);
  const c3_peratus = calcC3Peratus(scores.c3_1, scores.c3_2);
  const total_c = calcTotalC(c1_peratus, c2_peratus, c3_peratus);

  // Handle print borang FLI 02 in new window
  const handlePrintBorang = useCallback((row: any) => {
    try {
      const htmlContent = renderBorangFLI02Html(row);
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        alert('Sila benarkan pop-up untuk mencetak borang.');
      }
    } catch (err) {
      console.error('Print error:', err);
      alert('Ralat semasa mencetak borang. Sila cuba semula.');
    }
  }, []);

  // Check if evaluation is already completed for a row
  const isEvaluated = (row: any) => {
    if (!row) return false;
    const keys = Object.keys(row);
    console.log("Checking student:", row['NAMA PELAJAR'] || row['NAMA'] || '', "keys:", keys, "values:", row);
    
    // Check for empty string key fallback (which holds the last value if headers are empty)
    if (row[""] !== undefined && row[""] !== null && row[""] !== '') {
      return true;
    }
    
    // Find keys matching Bahagian C
    const totalKey = keys.find(k => {
      const uk = k.toUpperCase();
      return uk.includes('JUMLAH BAHAGIAN C') || uk.includes('BAHAGIAN C (%)') || (uk.includes('JUMLAH') && uk.includes('C'));
    });
    if (totalKey && row[totalKey] !== undefined && row[totalKey] !== null && row[totalKey] !== '') {
      return true;
    }
    
    // Alternatively check if C1.1 column has values
    const c1_1Key = keys.find(k => k.includes('FLI02-C1') || k.includes('C1.1') || k.includes('c1_1'));
    return !!(c1_1Key && row[c1_1Key] !== undefined && row[c1_1Key] !== null && row[c1_1Key] !== '');
  };

  const handleOpenEvaluationModal = (row: any) => {
    setSelectedStudentRow(row);
    setErrorMessage('');
    setSuccessMessage('');

    // Prepopulate if scores already exist
    const keys = Object.keys(row);
    const getVal = (pattern: string, fallback = 1) => {
      const k = keys.find(key => key.includes(pattern));
      if (k && row[k] !== undefined && row[k] !== '') {
        const val = parseInt(row[k]);
        return isNaN(val) ? fallback : val;
      }
      return fallback;
    };

    const ulasanKey = keys.find(key => key.includes('FLI02-ULASAN') || key.toUpperCase().includes('ULASAN'));
    setUlasan(ulasanKey ? (row[ulasanKey] || '') : '');

    setScores({
      c1_1: getVal('FLI02-C1', 1),
      c1_2: getVal('FLI02-C2', 1),
      c2_1: getVal('FLI02-C3', 1),
      c2_2: getVal('FLI02-C4', 1),
      c3_1: getVal('FLI02-C5', 1),
      c3_2: getVal('FLI02-C6', 1),
    });
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentRow) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const matrikKey = getMatrikKey(selectedStudentRow);
    const noMatrik = selectedStudentRow[matrikKey];

    const c1 = calcC1Peratus(scores.c1_1, scores.c1_2);
    const c2 = calcC2Peratus(scores.c2_1, scores.c2_2);
    const c3 = calcC3Peratus(scores.c3_1, scores.c3_2);
    const total = calcTotalC(c1, c2, c3);

    // Prepare the 11 columns payload for columns AF to AP
    const marksPayload = [
      scores.c1_1,
      scores.c1_2,
      c1,
      scores.c2_1,
      scores.c2_2,
      c2,
      scores.c3_1,
      scores.c3_2,
      c3,
      total,
      ulasan
    ];

    try {
      const res = await onSaveMark(noMatrik, marksPayload);
      if (res.success) {
        setSuccessMessage('Markah pemantauan berjaya dihantar dan disimpan!');
        
        // Update local object row directly so UI updates without waiting for sync
        const realHeaders = ["FLI02-C1", "FLI02-C2", "TOTAL7", "FLI02-C3", "FLI02-C4", "TOTAL8", "FLI02-C5", "FLI02-C6", "TOTAL9", "GRAN TOTAL2", "FLI02-ULASAN"];
        const limit = Math.min(marksPayload.length, realHeaders.length);
        for (let i = 0; i < limit; i++) {
          selectedStudentRow[realHeaders[i]] = marksPayload[i];
        }
        
        setTimeout(() => {
          setSelectedStudentRow(null);
          setSuccessMessage('');
        }, 1500);
      } else {
        setErrorMessage(res.message || 'Gagal menyimpan markah ke Google Sheets.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ralat berlaku semasa menyambung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const renderRadioGroup = (name: keyof typeof scores, label: string) => {
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
          {label}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {[1, 2, 3, 4, 5].map((val) => {
            const labelText = val === 1 ? '1 - Amat Lemah' : val === 2 ? '2 - Lemah' : val === 3 ? '3 - Memuaskan' : val === 4 ? '4 - Baik' : '5 - Cemerlang';
            return (
              <label 
                key={val} 
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  scores[name] === val 
                    ? 'bg-blue-900 border-blue-900 text-white shadow-xs' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="radio" 
                  name={name} 
                  value={val}
                  checked={scores[name] === val}
                  onChange={() => setScores(prev => ({ ...prev, [name]: val }))}
                  className="sr-only"
                />
                <span>{labelText}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="print:hidden min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <header className="w-full bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl w-full mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-bold shadow-inner shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider uppercase">Portal Pemantauan</h1>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{lecturerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700/80">
              Staff ID: {staffId}
            </span>
            <button
              onClick={onLogout}
              className="p-2 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-200 hover:text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Statistics section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jumlah Pelajar</p>
              <h3 className="text-2xl font-black text-slate-950 mt-0.5">{lecturerStudents.length}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Telah Dinilai</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-0.5">
                {lecturerStudents.filter(row => isEvaluated(row)).length}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Belum Dinilai</p>
              <h3 className="text-2xl font-black text-amber-700 mt-0.5">
                {lecturerStudents.filter(row => !isEvaluated(row)).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Students List Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-900" />
              Senarai Pelajar Di Bawah Pemantauan Anda
            </h3>
          </div>

          {lecturerStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-350" />
              <p>Tiada pelajar ditemui di bawah Staff ID anda ({staffId}) dalam tab MARKAH_PELAJAR.</p>
              <p className="text-[11px] font-normal text-slate-400">Sila pastikan nama/staff ID pemantau dikonfigurasikan dengan betul di Google Sheets.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Nama Pelajar & Matrik</th>
                    <th className="py-3 px-5">Program / Kelas</th>
                    <th className="py-3 px-5 text-center">Status FLI 02</th>
                    <th className="py-3 px-5 text-center">Markah Temubual (20%)</th>
                    <th className="py-3 px-5 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-xs">
                  {lecturerStudents.map((row, idx) => {
                    const matrikKey = getMatrikKey(row);
                    const nameKey = getNameKey(row);
                    const progKey = getProgramKey(row);
                    const kelasKey = getKelasKey(row);

                    const noMatrik = row[matrikKey] || 'TIADA MATRIK';
                    const namaPelajar = row[nameKey] || 'NAMA PELAJAR';
                    const program = row[progKey] || 'SIJIL KKBS';
                    const kelas = row[kelasKey] || '';

                    const evaluated = isEvaluated(row);
                    
                    // Retrieve total score
                    const keys = Object.keys(row);
                    const totalKey = keys.find(k => {
                      const uk = k.toUpperCase();
                      return uk.includes('GRAN TOTAL2') || uk.includes('GRAND TOTAL2') || uk.includes('JUMLAH BAHAGIAN C') || (uk.includes('JUMLAH') && uk.includes('C'));
                    });
                    const totalScore = totalKey ? row[totalKey] : '';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-all">
                        <td className="py-4 px-5">
                          <div>
                            <p className="font-extrabold text-slate-900 uppercase leading-snug">{namaPelajar}</p>
                            <span className="font-mono text-blue-900 font-extrabold text-[10px] mt-0.5 block">{noMatrik}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-700">
                          <div>
                            <p className="uppercase text-[11px]">{program}</p>
                            {kelas && <span className="mt-1 inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-black text-[10px]">{kelas}</span>}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            evaluated 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {evaluated ? 'Selesai Dinilai' : 'Belum Dinilai'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center font-bold text-slate-900 text-sm">
                          {evaluated && totalScore !== undefined && totalScore !== '' ? (
                            <span className="flex items-center justify-center gap-1 text-blue-900">
                              <Award className="w-4 h-4 text-amber-500" />
                              {totalScore}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-center">
                          {evaluated ? (
                            <div className="flex flex-wrap items-center justify-center gap-2 mx-auto">
                              <button
                                onClick={() => handleOpenEvaluationModal(row)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs bg-slate-100 hover:bg-slate-200 text-slate-700"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Kemaskini</span>
                              </button>
                              <button
                                onClick={() => handlePrintBorang(row)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs bg-emerald-700 hover:bg-emerald-600 text-white"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Cetak</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenEvaluationModal(row)}
                              className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer shadow-xs bg-blue-900 hover:bg-blue-800 text-white"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span>Isi Markah</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Evaluation Modal (FLI 02 Form) */}
      {selectedStudentRow && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold shadow-inner shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-wide">Borang Penilaian FLI 02</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {selectedStudentRow[getNameKey(selectedStudentRow)]} ({selectedStudentRow[getMatrikKey(selectedStudentRow)]})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentRow(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
              
              {/* Info Header */}
              <div className="p-4 bg-slate-950 text-white rounded-2xl text-[10px] font-bold tracking-widest uppercase flex flex-col gap-1 shadow-inner">
                <p>KURSUS: SUT40078 - LATIHAN INDUSTRI</p>
                <p>BAHAGIAN C: TEMUBUAL (PEMBERAT: 20%)</p>
              </div>

              {/* Criterion 1: Komunikasi Lisan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-black text-blue-900 text-xs uppercase tracking-wider">1. Komunikasi Lisan (CLO 2) - 10%</h4>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-900 px-2 py-0.5 rounded-lg border border-blue-200">
                    Peratus: {c1_peratus}% / 10%
                  </span>
                </div>
                {renderRadioGroup('c1_1', '1.1 Kefahaman dan kebolehan menjawab soalan')}
                {renderRadioGroup('c1_2', '1.2 Penyampaian idea')}
              </div>

              {/* Criterion 2: Kerja Berpasukan */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-black text-blue-900 text-xs uppercase tracking-wider">2. Kerja Berpasukan & Tanggungjawab (CLO 3) - 5%</h4>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-900 px-2 py-0.5 rounded-lg border border-blue-200">
                    Peratus: {c2_peratus}% / 5%
                  </span>
                </div>
                {renderRadioGroup('c2_1', '2.1 Membina hubungan baik')}
                {renderRadioGroup('c2_2', '2.2 Tanggungjawab kerja')}
              </div>

              {/* Criterion 3: Kemahiran Personal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="font-black text-blue-900 text-xs uppercase tracking-wider">3. Kemahiran Personal (CLO 4) - 5%</h4>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-900 px-2 py-0.5 rounded-lg border border-blue-200">
                    Peratus: {c3_peratus}% / 5%
                  </span>
                </div>
                {renderRadioGroup('c3_1', '3.1 Organisasi idea')}
                {renderRadioGroup('c3_2', '3.2 Bermotivasi dalam menyiapkan kerja')}
              </div>

              {/* Calculation Summary Footer */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <h5 className="text-[10px] font-bold text-slate-350 uppercase tracking-widest">JUMLAH MARKAH BAHAGIAN C</h5>
                  <p className="text-xs text-slate-400 mt-1">Komunikasi (10%) + Berpasukan (5%) + Personal (5%)</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-amber-400">{total_c}%</span>
                  <span className="text-xs text-slate-300 font-bold block mt-0.5">/ 20.00%</span>
                </div>
              </div>

              {/* Ulasan / Cadangan */}
              <div className="space-y-2">
                <label htmlFor="ulasan" className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Ulasan / Cadangan Pensyarah Pemantau
                </label>
                <textarea
                  id="ulasan"
                  rows={3}
                  value={ulasan}
                  onChange={(e) => setUlasan(e.target.value)}
                  placeholder="Masukkan ulasan dan cadangan anda di sini..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-all font-medium text-slate-800"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentRow(null)}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Menyimpan...' : 'Hantar & Simpan'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      </div>

    </>
  );
};
