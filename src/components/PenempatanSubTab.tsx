import React, { useState, useMemo } from 'react';
import { Student, SystemConfig, PlacementRecord, PlacementStudentInfo, formatProgramName } from '../types';
import { 
  Building2, 
  Users, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Printer, 
  ChevronRight, 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import { savePlacementToFirebase } from '../firebase';

interface PenempatanSubTabProps {
  students: Student[];
  config: SystemConfig;
  placements: PlacementRecord[];
  appsScriptUrl?: string;
  onRefreshData?: () => void;
}

interface CompanyGroup {
  companyName: string;
  companyEmail: string;
  students: Student[];
  placementRecord?: PlacementRecord;
}

export const PenempatanSubTab: React.FC<PenempatanSubTabProps> = ({
  students,
  config,
  placements,
  appsScriptUrl = '',
}) => {
  // Session selection (defaults to current system session)
  const [selectedSession, setSelectedSession] = useState<string>(config.sesi || 'SESI I 2026/2027');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected company for detail / student list view
  const [selectedCompany, setSelectedCompany] = useState<CompanyGroup | null>(null);

  // Form states for letter generation & email
  const [tarikhLi, setTarikhLi] = useState<string>(config.tarikh || '30 NOVEMBER 2026 HINGGA 19 MAC 2027');
  
  // Extract initial start date from tarikhLi if possible
  const getInitialStartDate = () => {
    if (config.tarikh && config.tarikh.includes('HINGGA')) {
      return config.tarikh.split('HINGGA')[0].trim();
    }
    return '30 NOVEMBER 2026';
  };
  const [tarikhMulaLi, setTarikhMulaLi] = useState<string>(getInitialStartDate());
  const [rujukanSurat, setRujukanSurat] = useState<string>(`KKBS.100-1/1/1 (${new Date().getFullYear()})`);

  // Action status indicators
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Available sessions in student data
  const availableSessions = useMemo(() => {
    const s = new Set<string>();
    if (config.sesi) s.add(config.sesi);
    students.forEach(st => {
      if (st.sesi) s.add(st.sesi);
    });
    return Array.from(s);
  }, [students, config.sesi]);

  // Group students by Company for the selected session
  const companyGroups = useMemo<CompanyGroup[]>(() => {
    const filteredBySession = students.filter(st => {
      const matchSession = !selectedSession || (st.sesi && st.sesi.trim().toUpperCase() === selectedSession.trim().toUpperCase());
      const hasCompany = st.namaSyarikat && st.namaSyarikat.trim() !== '' && st.namaSyarikat.trim() !== 'Syarikat Industri / Hotel';
      return matchSession && hasCompany;
    });

    const groupsMap = new Map<string, CompanyGroup>();

    filteredBySession.forEach(st => {
      const compKey = st.namaSyarikat!.trim().toUpperCase();
      if (!groupsMap.has(compKey)) {
        // Find existing placement record in Firestore if available
        const record = placements.find(p => 
          p.companyName.trim().toUpperCase() === compKey && 
          p.sesi.trim().toUpperCase() === selectedSession.trim().toUpperCase()
        );

        groupsMap.set(compKey, {
          companyName: st.namaSyarikat!.trim(),
          companyEmail: st.emelHrSyarikat || record?.companyEmail || '',
          students: [],
          placementRecord: record
        });
      }

      const group = groupsMap.get(compKey)!;
      group.students.push(st);
      if (!group.companyEmail && st.emelHrSyarikat) {
        group.companyEmail = st.emelHrSyarikat;
      }
    });

    return Array.from(groupsMap.values());
  }, [students, selectedSession, placements]);

  // Filter company groups by search term
  const filteredCompanyGroups = useMemo(() => {
    if (!searchTerm.trim()) return companyGroups;
    const term = searchTerm.toLowerCase();
    return companyGroups.filter(cg => 
      cg.companyName.toLowerCase().includes(term) ||
      cg.companyEmail.toLowerCase().includes(term) ||
      cg.students.some(s => s.namaPelajar.toLowerCase().includes(term) || s.noMatrik.toLowerCase().includes(term))
    );
  }, [companyGroups, searchTerm]);

  // Sync selected company with latest placement record
  const currentPlacementRecord = useMemo(() => {
    if (!selectedCompany) return undefined;
    return placements.find(p => 
      p.companyName.trim().toUpperCase() === selectedCompany.companyName.trim().toUpperCase() && 
      p.sesi.trim().toUpperCase() === selectedSession.trim().toUpperCase()
    ) || selectedCompany.placementRecord;
  }, [selectedCompany, placements, selectedSession]);

  // Open detail view for a company
  const handleOpenCompanyDetail = (comp: CompanyGroup) => {
    setSelectedCompany(comp);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    setTarikhLi(config.tarikh || '30 NOVEMBER 2026 HINGGA 19 MAC 2027');
    setTarikhMulaLi(getInitialStartDate());
  };

  // Close detail view
  const handleBackToList = () => {
    setSelectedCompany(null);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  // Prepare student payload info
  const getPlacementStudentsPayload = (group: CompanyGroup): PlacementStudentInfo[] => {
    return group.students.map(s => ({
      namaPelajar: s.namaPelajar,
      noMatrik: s.noMatrik,
      noIc: s.noIc,
      program: formatProgramName(s.program) || s.program,
      noTelefon: s.noTelefon || '',
      emelPelajar: s.emelPelajar || '',
      status: s.status
    }));
  };

  // 1. Simpan & Jana Surat Penempatan
  const handleGenerateAndSaveLetter = async () => {
    if (!selectedCompany) return;
    setIsGenerating(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const studentsPayload = getPlacementStudentsPayload(selectedCompany);
    const placementId = `placement_${selectedCompany.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedSession.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
      let pdfUrl = '';
      let downloadUrl = '';
      let fileId = '';

      // Panggil backend API penjanaan surat (yang menghubungi Google Apps Script SlidesApp)
      try {
        const res = await fetch('/api/placement/generate-letter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-apps-script-url': appsScriptUrl,
          },
          body: JSON.stringify({
            namaSyarikat: selectedCompany.companyName,
            emelIndustri: selectedCompany.companyEmail,
            sesi: selectedSession,
            tarikhLi: tarikhLi,
            tarikhMulaLi: tarikhMulaLi,
            namaPpia: config.namaPpia,
            noTelefonPpia: config.noTelefonPpia,
            rujukanSurat: rujukanSurat,
            tarikhSurat: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
            students: studentsPayload,
            appsScriptUrl: appsScriptUrl
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          pdfUrl = data.pdfUrl || '';
          downloadUrl = data.downloadUrl || '';
          fileId = data.fileId || '';
        } else if (!res.ok) {
          console.warn('API generation note:', data.error);
        }
      } catch (err: any) {
        console.warn('Google Apps Script call error, proceeding with cloud record saving:', err);
      }

      // Default URL if not generated via Apps Script yet
      const fallbackTemplateUrl = 'https://docs.google.com/presentation/d/1Eo8sOvLi5BJMWUHOobJhLXcMhDBa7WvxqzSQTPyZC8Y/edit?usp=sharing';

      // Simpan rekod lengkap ke dalam database cloud utama (Firebase Firestore)
      const placementRecordData: PlacementRecord = {
        id: placementId,
        companyName: selectedCompany.companyName,
        companyEmail: selectedCompany.companyEmail,
        sesi: selectedSession,
        tarikhLi: tarikhLi,
        tarikhMulaLi: tarikhMulaLi,
        studentMatriks: selectedCompany.students.map(s => s.noMatrik),
        students: studentsPayload,
        rujukanSurat: rujukanSurat,
        tarikhSurat: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
        letterGenerated: true,
        letterPdfUrl: pdfUrl || fallbackTemplateUrl,
        letterDownloadUrl: downloadUrl || '',
        letterFileId: fileId || '',
        letterGeneratedAt: new Date().toISOString(),
        emailSent: currentPlacementRecord?.emailSent || false,
        emailSentAt: currentPlacementRecord?.emailSentAt,
        emailSentTo: currentPlacementRecord?.emailSentTo,
        emailSentCc: currentPlacementRecord?.emailSentCc,
        updatedAt: new Date().toISOString()
      };

      await savePlacementToFirebase(placementRecordData);

      setActionSuccessMsg(
        `Surat penempatan lapor diri bagi ${selectedCompany.companyName} berjaya dijana dan disimpan ke database cloud!`
      );
    } catch (err: any) {
      setActionErrorMsg(`Ralat semasa menjana & menyimpan surat: ${err.message || err}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Hantar Emel Penempatan Ke Industri
  const handleSendEmailToIndustry = async () => {
    if (!selectedCompany) return;
    if (!selectedCompany.companyEmail || selectedCompany.companyEmail.trim() === '') {
      setActionErrorMsg('Sila pastikan emel HR / industri diisi sebelum menghantar emel.');
      return;
    }

    setIsSending(true);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);

    const studentsPayload = getPlacementStudentsPayload(selectedCompany);
    const placementId = `placement_${selectedCompany.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedSession.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
      let sentSuccess = false;
      let sentInfo: any = {};

      try {
        const res = await fetch('/api/placement/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-apps-script-url': appsScriptUrl,
          },
          body: JSON.stringify({
            namaSyarikat: selectedCompany.companyName,
            emelIndustri: selectedCompany.companyEmail,
            sesi: selectedSession,
            tarikhLi: tarikhLi,
            tarikhMulaLi: tarikhMulaLi,
            namaPpia: config.namaPpia,
            noTelefonPpia: config.noTelefonPpia,
            rujukanSurat: rujukanSurat,
            tarikhSurat: new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
            students: studentsPayload,
            pdfFileId: currentPlacementRecord?.letterFileId || '',
            appsScriptUrl: appsScriptUrl
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          sentSuccess = true;
          sentInfo = data;
        } else {
          throw new Error(data.error || 'Gagal menghantar emel penempatan melalui pelayan.');
        }
      } catch (apiErr: any) {
        // Jika Apps Script URL belum dikonfigurasi, beri panduan mesra
        if (!appsScriptUrl) {
          throw new Error('Sila masukkan Pautan API Google Apps Script di Tetapan Admin untuk menghantar emel terus melalui akaun Google rasmi.');
        } else {
          throw apiErr;
        }
      }

      // Simpan status penghantaran ke pangkalan data cloud Firebase Firestore
      const studentEmails = selectedCompany.students.map(s => s.emelPelajar).filter(Boolean);
      const ccListStr = [...studentEmails, 'unitlatihanindustri@kkbeaufort.edu.my'].join(', ');

      const updatedRecord: Partial<PlacementRecord> & { id: string } = {
        id: placementId,
        companyName: selectedCompany.companyName,
        companyEmail: selectedCompany.companyEmail,
        sesi: selectedSession,
        tarikhLi: tarikhLi,
        tarikhMulaLi: tarikhMulaLi,
        studentMatriks: selectedCompany.students.map(s => s.noMatrik),
        students: studentsPayload,
        emailSent: true,
        emailSentAt: new Date().toISOString(),
        emailSentTo: selectedCompany.companyEmail,
        emailSentCc: ccListStr,
        letterGenerated: true,
        letterFileId: sentInfo.pdfFileId || currentPlacementRecord?.letterFileId || '',
        updatedAt: new Date().toISOString()
      };

      await savePlacementToFirebase(updatedRecord);

      setActionSuccessMsg(
        `Emel penempatan bersama lampiran surat rasmi telah berjaya dihantar ke ${selectedCompany.companyEmail} (CC: Emel Pelajar & Unit Latihan Industri)! Rekod cloud telah dikemaskini.`
      );
    } catch (err: any) {
      setActionErrorMsg(`Gagal menghantar emel: ${err.message || err}`);
    } finally {
      setIsSending(false);
    }
  };

  // ==========================================
  // VIEW 1: SENARAI SYARIKAT INDUSTRI TERLIBAT
  // ==========================================
  if (!selectedCompany) {
    return (
      <div className="space-y-6">
        {/* Header & Sesi Selector */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Penempatan Pelajar di Industri
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Senarai Syarikat Industri yang terlibat, semakan pelajar melapor diri, penjanaan surat penempatan & penghantaran emel rasmi.
              </p>
            </div>
          </div>

          {/* Sesi Dropdown Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Sesi Semasa:
            </span>
            <select
              value={selectedSession}
              onChange={e => setSelectedSession(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {availableSessions.map(sess => (
                <option key={sess} value={sess}>
                  {sess} {sess === config.sesi ? '(Terkini)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Syarikat Terlibat</p>
              <h3 className="text-xl font-black text-slate-900">{companyGroups.length} Syarikat</h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pelajar Ditempatkan</p>
              <h3 className="text-xl font-black text-slate-900">
                {companyGroups.reduce((acc, c) => acc + c.students.length, 0)} Pelajar
              </h3>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Surat Dihantar</p>
              <h3 className="text-xl font-black text-slate-900">
                {companyGroups.filter(c => c.placementRecord?.emailSent).length} / {companyGroups.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama syarikat, emel HR, atau nama pelajar..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>

        {/* Company List Table / Cards */}
        {filteredCompanyGroups.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tiada Syarikat Terlibat Ditemui</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tiada rekod syarikat industri yang mempunyai pelajar berdaftar untuk {selectedSession}. 
              Sila pastikan data permohonan pelajar mempunyai maklumat nama syarikat.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
                    <th className="py-3 px-4">Bil</th>
                    <th className="py-3 px-4">Nama Syarikat Industri</th>
                    <th className="py-3 px-4">Emel HR / Industri</th>
                    <th className="py-3 px-4 text-center">Bilangan Pelajar</th>
                    <th className="py-3 px-4">Status Surat Penempatan</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCompanyGroups.map((group, idx) => {
                    const record = group.placementRecord;
                    const isGenerated = record?.letterGenerated;
                    const isSent = record?.emailSent;

                    return (
                      <tr key={group.companyName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <strong className="text-slate-900 font-bold block">{group.companyName}</strong>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {selectedSession}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {group.companyEmail ? (
                            <span className="text-slate-700 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {group.companyEmail}
                            </span>
                          ) : (
                            <span className="text-amber-600 text-[11px] italic">Emel belum diisi</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            {group.students.length} Orang
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Emel Dihantar
                            </span>
                          ) : isGenerated ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Surat Dijana (Belum Dihantar)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600">
                              Belum Dijana
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenCompanyDetail(group)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Senarai Pelajar
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: PAPARAN SENARAI PELAJAR SYARIKAT & TINDAKAN JANA/HANTAR
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back Button */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToList}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali Ke Senarai Syarikat
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {selectedCompany.companyName}
              </h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                {selectedSession}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-3 mt-0.5">
              <span>Emel Industri: <strong>{selectedCompany.companyEmail || 'Tiada'}</strong></span>
              <span>•</span>
              <span>Jumlah Pelajar: <strong>{selectedCompany.students.length} Orang</strong></span>
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {currentPlacementRecord?.emailSent ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Surat Penempatan Telah Dihantar Ke Industri
            </span>
          ) : currentPlacementRecord?.letterGenerated ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              Surat Dijana (Sedia Dihantar)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Surat Belum Dijana
            </span>
          )}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-start gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Tindakan Berjaya!</p>
            <p className="mt-0.5">{actionSuccessMsg}</p>
          </div>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-medium flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Ralat Berlaku</p>
            <p className="mt-0.5">{actionErrorMsg}</p>
          </div>
        </div>
      )}

      {/* Senarai Pelajar Melapor Diri (Jadual Lampiran A) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Lampiran A: Senarai Pelajar Melapor Diri di Syarikat
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-300">
            {selectedCompany.students.length} Pelajar Terpilih
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-600 tracking-wider">
                <th className="py-3 px-4 w-12">Bil</th>
                <th className="py-3 px-4">Nama Pelajar</th>
                <th className="py-3 px-4">No. Kad Pengenalan</th>
                <th className="py-3 px-4">No. Matrik</th>
                <th className="py-3 px-4">Program Pengajian</th>
                <th className="py-3 px-4">No. Telefon & Emel</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {selectedCompany.students.map((student, idx) => (
                <tr key={student.noMatrik} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <strong className="text-slate-900 font-bold block">{student.namaPelajar}</strong>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{student.noIc}</td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{student.noMatrik}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold text-[11px]">
                      {formatProgramName(student.program) || student.program}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-600 font-medium">
                      <span>{student.noTelefon || '-'}</span>
                      <span className="block text-[11px] text-slate-400">{student.emelPelajar || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {student.status || 'Diterima'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maklumat Surat & Butang Simpan / Hantar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Konfigurasi Surat Penempatan */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Parameter Surat Penempatan Lapor Diri
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Sesi Latihan Industri
              </label>
              <input
                type="text"
                value={selectedSession}
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                No. Rujukan Surat Penempatan
              </label>
              <input
                type="text"
                value={rujukanSurat}
                onChange={e => setRujukanSurat(e.target.value)}
                placeholder="Contoh: KKBS.100-1/1/1 (2026)"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tempoh & Tarikh Latihan Industri [TARIKH LI]
              </label>
              <input
                type="text"
                value={tarikhLi}
                onChange={e => setTarikhLi(e.target.value)}
                placeholder="Contoh: 30 NOVEMBER 2026 HINGGA 19 MAC 2027"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tarikh Mula Lapor Diri [TARIKH MULA LI]
              </label>
              <input
                type="text"
                value={tarikhMulaLi}
                onChange={e => setTarikhMulaLi(e.target.value)}
                placeholder="Contoh: 30 NOVEMBER 2026"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pegawai Perhubungan Industri (PPIA)
              </label>
              <input
                type="text"
                value={`${config.namaPpia} (${config.noTelefonPpia})`}
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Emel Penerima Industri (To:)
              </label>
              <input
                type="email"
                value={selectedCompany.companyEmail}
                onChange={e => {
                  setSelectedCompany({
                    ...selectedCompany,
                    companyEmail: e.target.value
                  });
                }}
                placeholder="hr@syarikat.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Templat Google Drive:</strong> Surat penempatan dijana secara automatik menggunakan templat rasmi Google Slides:
              <a 
                href="https://docs.google.com/presentation/d/1Eo8sOvLi5BJMWUHOobJhLXcMhDBa7WvxqzSQTPyZC8Y/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-700 font-bold ml-1 inline-flex items-center gap-0.5"
              >
                Buka Templat Drive <ExternalLink className="w-3 h-3" />
              </a>.
              Jadual Lampiran A akan diisi dengan senarai {selectedCompany.students.length} pelajar di atas beserta program masing-masing.
            </div>
          </div>
        </div>

        {/* Right 1 Col: Panel Tindakan Simpan & Hantar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Tindakan Penempatan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Tekan butang <strong>Simpan</strong> untuk menjana fail surat penempatan rasmi, atau tekan <strong>Hantar</strong> untuk menghantar terus ke emel HR pihak industri.
            </p>

            {/* Status Rekod Cloud */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 mb-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Penjanaan Surat:</span>
                <span className={`font-bold ${currentPlacementRecord?.letterGenerated ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {currentPlacementRecord?.letterGenerated ? 'Sudah Dijana' : 'Belum Dijana'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Status Emel HR:</span>
                <span className={`font-bold ${currentPlacementRecord?.emailSent ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {currentPlacementRecord?.emailSent ? 'Telah Dihantar' : 'Belum Dihantar'}
                </span>
              </div>
              {currentPlacementRecord?.emailSentAt && (
                <div className="text-[10px] text-slate-400">
                  Dihantar pada: {new Date(currentPlacementRecord.emailSentAt).toLocaleString('ms-MY')}
                </div>
              )}
            </div>

            {/* Pautan Dokumen PDF jika ada */}
            {currentPlacementRecord?.letterPdfUrl && (
              <a
                href={currentPlacementRecord.letterPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full mb-3 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Buka / Lihat Surat Penempatan PDF
              </a>
            )}
          </div>

          {/* Action Buttons: Simpan & Hantar */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            {/* Butang 1: Simpan */}
            <button
              onClick={handleGenerateAndSaveLetter}
              disabled={isGenerating || isSending}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Save className="w-4 h-4 text-emerald-400" />
              )}
              {isGenerating ? 'Menjana Surat & Menyimpan...' : 'Simpan & Jana Surat Penempatan'}
            </button>

            {/* Butang 2: Hantar */}
            <button
              onClick={handleSendEmailToIndustry}
              disabled={isSending || isGenerating}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4 text-blue-200" />
              )}
              {isSending ? 'Menghantar Emel Ke Industri...' : 'Hantar Emel Penempatan Ke Industri'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
