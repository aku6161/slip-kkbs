import React, { useState, useMemo, useEffect } from 'react';
import { Student, SystemConfig, PlacementRecord, PlacementStudentInfo, IndustryCompany, formatProgramName } from '../types';
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
  Check,
  Eye,
  X,
  Copy
} from 'lucide-react';
import { savePlacementToFirebase } from '../firebase';

interface PenempatanSubTabProps {
  students: Student[];
  config: SystemConfig;
  placements: PlacementRecord[];
  companies?: IndustryCompany[];
  appsScriptUrl?: string;
  onRefreshData?: () => void;
}

interface CompanyGroup {
  companyName: string;
  companyEmail: string;
  students: Student[];
  placementRecord?: PlacementRecord;
  index: number;
}

export const PenempatanSubTab: React.FC<PenempatanSubTabProps> = ({
  students,
  config,
  placements,
  companies = [],
  appsScriptUrl = '',
}) => {
  // Session selection (defaults to current system session)
  const [selectedSession, setSelectedSession] = useState<string>(config.sesi || 'SESI I 2026/2027');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected company for detail / student list view
  const [selectedCompany, setSelectedCompany] = useState<CompanyGroup | null>(null);

  // Form states for letter generation & email
  const currentYear = new Date().getFullYear();
  const [rujukanSurat, setRujukanSurat] = useState<string>(`${currentYear}/001`);
  const [tarikhSurat, setTarikhSurat] = useState<string>(() => 
    new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  );
  const [alamatBaris1, setAlamatBaris1] = useState<string>('');
  const [alamatBaris2, setAlamatBaris2] = useState<string>('');

  const [tarikhLi, setTarikhLi] = useState<string>(config.tarikh || '30 NOVEMBER 2026 HINGGA 19 MAC 2027');
  
  // Extract initial start date from tarikhLi if possible
  const getInitialStartDate = () => {
    if (config.tarikh && config.tarikh.includes('HINGGA')) {
      return config.tarikh.split('HINGGA')[0].trim();
    }
    return '30 NOVEMBER 2026';
  };
  const [tarikhMulaLi, setTarikhMulaLi] = useState<string>(getInitialStartDate());

  // Action status indicators
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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
    let orderIndex = 0;

    filteredBySession.forEach(st => {
      const compKey = st.namaSyarikat!.trim().toUpperCase();
      if (!groupsMap.has(compKey)) {
        orderIndex++;
        // Find existing placement record in Firestore if available
        const record = placements.find(p => 
          p.companyName.trim().toUpperCase() === compKey && 
          p.sesi.trim().toUpperCase() === selectedSession.trim().toUpperCase()
        );

        groupsMap.set(compKey, {
          companyName: st.namaSyarikat!.trim(),
          companyEmail: st.emelHrSyarikat || record?.companyEmail || '',
          students: [],
          placementRecord: record,
          index: orderIndex
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

  // Helper: Kira No Rujukan Berurutan auto: [TAHUN/001], cth: 2026/001
  const getAutoRujukanForCompany = (compGroup: CompanyGroup): string => {
    if (compGroup.placementRecord?.rujukanSurat && compGroup.placementRecord.rujukanSurat.trim() !== '') {
      return compGroup.placementRecord.rujukanSurat.trim();
    }
    const seqStr = String(compGroup.index).padStart(3, '0');
    return `${currentYear}/${seqStr}`;
  };

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

  // Open detail view for a company & auto-populate alamat and rujukan
  const handleOpenCompanyDetail = (comp: CompanyGroup) => {
    setSelectedCompany(comp);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    setTarikhLi(config.tarikh || '30 NOVEMBER 2026 HINGGA 19 MAC 2027');
    setTarikhMulaLi(getInitialStartDate());
    setTarikhSurat(new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase());

    // 1. Auto Rujukan Berurutan
    const autoRuj = getAutoRujukanForCompany(comp);
    setRujukanSurat(autoRuj);

    // 2. Cari Alamat Syarikat dari Database Syarikat / Rekod Pelajar
    const matchedComp = companies.find(c => 
      c.namaSyarikat.trim().toUpperCase() === comp.companyName.trim().toUpperCase()
    );

    let a1 = currentPlacementRecord?.alamatBaris1 || matchedComp?.alamat1 || '';
    let a2 = currentPlacementRecord?.alamatBaris2 || matchedComp?.alamat2 || '';

    if (!a1 && !a2) {
      // Cari daripada rekod pelajar jika ada BJPLI
      const withBjpli = comp.students.find(s => s.bjpliData?.alamatSyarikat);
      if (withBjpli?.bjpliData?.alamatSyarikat) {
        const fullAddr = withBjpli.bjpliData.alamatSyarikat.trim();
        const parts = fullAddr.split(',');
        if (parts.length >= 2) {
          const mid = Math.ceil(parts.length / 2);
          a1 = parts.slice(0, mid).join(', ').trim();
          a2 = parts.slice(mid).join(', ').trim();
        } else {
          a1 = fullAddr;
          a2 = 'SABAH, MALAYSIA';
        }
      } else {
        a1 = matchedComp?.alamat1 || 'PETI SURAT / JALAN UTAMA';
        a2 = matchedComp?.alamat2 || '89808 BEAUFORT, SABAH';
      }
    }

    setAlamatBaris1(a1);
    setAlamatBaris2(a2);
  };

  // Close detail view
  const handleBackToList = () => {
    setSelectedCompany(null);
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
    setIsPreviewModalOpen(false);
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
            alamatBaris1: alamatBaris1,
            alamatBaris2: alamatBaris2,
            emelIndustri: selectedCompany.companyEmail,
            sesi: selectedSession,
            tarikhLi: tarikhLi,
            tarikhMulaLi: tarikhMulaLi,
            namaPpia: config.namaPpia,
            noTelefonPpia: config.noTelefonPpia,
            rujukanSurat: rujukanSurat,
            tarikhSurat: tarikhSurat,
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
        tarikhSurat: tarikhSurat,
        alamatBaris1: alamatBaris1,
        alamatBaris2: alamatBaris2,
        letterGenerated: true,
        letterPdfUrl: pdfUrl || (fileId ? `https://drive.google.com/file/d/${fileId}/view` : ''),
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
        `Surat penempatan lapor diri No Rujukan KKBS - ${rujukanSurat} bagi ${selectedCompany.companyName} berjaya dijana dan disimpan ke database cloud!`
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
            alamatBaris1: alamatBaris1,
            alamatBaris2: alamatBaris2,
            emelIndustri: selectedCompany.companyEmail,
            sesi: selectedSession,
            tarikhLi: tarikhLi,
            tarikhMulaLi: tarikhMulaLi,
            namaPpia: config.namaPpia,
            noTelefonPpia: config.noTelefonPpia,
            rujukanSurat: rujukanSurat,
            tarikhSurat: tarikhSurat,
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
        rujukanSurat: rujukanSurat,
        tarikhSurat: tarikhSurat,
        alamatBaris1: alamatBaris1,
        alamatBaris2: alamatBaris2,
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

  // Cetak Surat Penempatan Rasmi (window.print)
  const handlePrintDocument = () => {
    window.print();
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
                    <th className="py-3 px-4">No. Rujukan Auto</th>
                    <th className="py-3 px-4">Nama Syarikat Industri</th>
                    <th className="py-3 px-4">Emel HR / Industri</th>
                    <th className="py-3 px-4 text-center">Bilangan Pelajar</th>
                    <th className="py-3 px-4">Status Surat Penempatan</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCompanyGroups.map((group) => {
                    const record = group.placementRecord;
                    const isGenerated = record?.letterGenerated;
                    const isSent = record?.emailSent;
                    const autoRuj = getAutoRujukanForCompany(group);

                    return (
                      <tr key={group.companyName} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          KKBS - {autoRuj}
                        </td>
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
              <span>No. Rujukan Auto: <strong className="text-blue-700 font-mono">KKBS - {rujukanSurat}</strong></span>
              <span>•</span>
              <span>Emel Industri: <strong>{selectedCompany.companyEmail || 'Tiada'}</strong></span>
              <span>•</span>
              <span>Jumlah Pelajar: <strong>{selectedCompany.students.length} Orang</strong></span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Preview Modal Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            Pratonton & Cetak Surat Rasmi
          </button>

          <div>
            {currentPlacementRecord?.emailSent ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Emel Telah Dihantar Ke Industri
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
              Data & Parameter Surat Penempatan Lapor Diri
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* No Rujukan Auto */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                No. Rujukan Auto [RUJUKAN] <span className="text-blue-600 font-mono font-normal">(cth: 2026/001)</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg font-mono font-bold text-slate-700">
                  KKBS -
                </span>
                <input
                  type="text"
                  value={rujukanSurat}
                  onChange={e => setRujukanSurat(e.target.value)}
                  placeholder="2026/001"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-r-lg text-slate-800 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Tarikh Surat */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tarikh Surat [TARIKH SURAT]
              </label>
              <input
                type="text"
                value={tarikhSurat}
                onChange={e => setTarikhSurat(e.target.value)}
                placeholder="19 NOVEMBER 2026"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Nama Syarikat */}
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                Nama Syarikat Industri [NAMA SYARIKAT]
              </label>
              <input
                type="text"
                value={selectedCompany.companyName}
                onChange={e => {
                  setSelectedCompany({
                    ...selectedCompany,
                    companyName: e.target.value
                  });
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Alamat Baris 1 */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Alamat Syarikat Baris 1 [ALAMAT BARIS 1]
              </label>
              <input
                type="text"
                value={alamatBaris1}
                onChange={e => setAlamatBaris1(e.target.value)}
                placeholder="Contoh: LOT 123, JALAN MERPATI"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Alamat Baris 2 */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Alamat Syarikat Baris 2 [ALAMAT BARIS 2]
              </label>
              <input
                type="text"
                value={alamatBaris2}
                onChange={e => setAlamatBaris2(e.target.value)}
                placeholder="Contoh: 89808 BEAUFORT, SABAH"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Tempoh & Tarikh LI */}
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

            {/* Tarikh Mula Lapor Diri */}
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

            {/* Emel Industri */}
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

            {/* Sesi */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Sesi Latihan Industri [SESI LI]
              </label>
              <input
                type="text"
                value={selectedSession}
                readOnly
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Templat Google Slides Rasmi:</strong> Surat penempatan dijana secara automatik menggunakan templat rasmi Google Slides:
              <a 
                href="https://docs.google.com/presentation/d/1Eo8sOvLi5BJMWUHOobJhLXcMhDBa7WvxqzSQTPyZC8Y/edit?usp=sharing"
                target="_blank"
                rel="noreferrer"
                className="underline text-blue-700 font-bold ml-1 inline-flex items-center gap-0.5"
              >
                Buka Templat Drive <ExternalLink className="w-3 h-3" />
              </a>.
              Semua medan <strong>[NAMA SYARIKAT]</strong>, <strong>[ALAMAT BARIS 1]</strong>, <strong>[ALAMAT BARIS 2]</strong>, <strong>KKBS - [RUJUKAN]</strong>, dan jadual <strong>Lampiran A (BIL, NAMA, PROGRAM)</strong> disuntik secara automatik.
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
                <span className="text-slate-500 font-medium">No. Rujukan Terkini:</span>
                <span className="font-mono font-bold text-blue-700">KKBS - {rujukanSurat}</span>
              </div>
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

            {/* Butang Pratonton & Cetak Terus */}
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="w-full mb-3 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              Pratonton / Cetak Surat PDF
            </button>

            {/* Pautan Dokumen PDF Google Drive jika ada */}
            {currentPlacementRecord?.letterPdfUrl && (
              <a
                href={currentPlacementRecord.letterPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full mb-3 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Buka Fail Google Drive
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

      {/* ============================================================== */}
      {/* MODAL PRATONTON & CETAK SURAT PENEMPATAN RASMI (SURAT + LAMPIRAN A) */}
      {/* ============================================================== */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Pratonton Surat Rasmi Penempatan Lapor Diri & Lampiran A
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak / Simpan PDF
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Document Body (Printable Paper Style) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
              <div className="bg-white shadow-md border border-slate-300 w-full max-w-[794px] p-8 sm:p-12 text-slate-900 font-sans text-xs sm:text-sm leading-relaxed space-y-12">
                
                {/* ----------------- MUKA SURAT 1: SURAT RASMI ----------------- */}
                <div className="min-h-[1050px] flex flex-col justify-between">
                  <div>
                    {/* Kepala Surat Rasmi KKBS */}
                    <div className="border-b-2 border-slate-900 pb-4 mb-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src="/logo.jpg" 
                            alt="Logo Kolej Komuniti" 
                            className="w-16 h-16 object-contain"
                            onError={(e) => { (e.target as any).style.display = 'none'; }}
                          />
                          <div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                              KOLEJ KOMUNITI BEAUFORT
                            </h2>
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight">
                              JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI<br />
                              KEMENTERIAN PENDIDIKAN TINGGI
                            </p>
                            <p className="text-[9px] text-slate-500 mt-1 leading-snug">
                              JALAN MELALUGUS, 89807 BEAUFORT, SABAH, MALAYSIA<br />
                              Tel: 087-212528 | Faks: 087-212530 | E-mel: adminkkbs@kkbeaufort.edu.my
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Rujukan & Tarikh */}
                    <div className="flex justify-end mb-6 text-xs">
                      <table className="text-left font-medium">
                        <tbody>
                          <tr>
                            <td className="pr-2 font-bold text-slate-700">Ruj. Kami</td>
                            <td>: <span className="font-mono font-bold text-slate-900">KKBS - {rujukanSurat}</span></td>
                          </tr>
                          <tr>
                            <td className="pr-2 font-bold text-slate-700">Tarikh</td>
                            <td>: <span className="font-bold text-slate-900">{tarikhSurat}</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Alamat Penerima Industri */}
                    <div className="mb-6 font-bold leading-snug">
                      <p>PENGARAH / PENGURUS,</p>
                      <p className="uppercase text-blue-950 text-sm font-black">{selectedCompany.companyName},</p>
                      <p className="uppercase">{alamatBaris1 || 'LOT / BANGUNAN INDUSTRI'},</p>
                      <p className="uppercase">{alamatBaris2 || '89808 BEAUFORT, SABAH'}.</p>
                    </div>

                    <p className="mb-4">Tuan,</p>

                    {/* Tajuk Perkara */}
                    <div className="font-black text-xs sm:text-sm uppercase text-slate-950 border-b border-slate-900 pb-1.5 mb-4">
                      PENEMPATAN PELAJAR UNTUK LATIHAN INDUSTRI SIJIL KOLEJ KOMUNITI [{selectedSession}]
                    </div>

                    {/* Kandungan Perenggan */}
                    <div className="space-y-3 text-justify">
                      <p>
                        Dengan segala hormatnya saya merujuk kepada perkara yang tersebut di atas.
                      </p>

                      <p>
                        2. &nbsp;&nbsp;&nbsp;&nbsp; Sukacita dimaklumkan bahawa pelajar seperti yang tersenarai dalam lampiran akan ditempatkan di syarikat/firma tuan bagi menjalani Latihan Industri bermula <strong>{tarikhLi}</strong>. Pelajar dikehendaki melapor diri di jabatan/firma tuan pada <strong>{tarikhMulaLi}</strong>, jam 9.00 pagi.
                      </p>

                      <p>
                        3. &nbsp;&nbsp;&nbsp;&nbsp; Untuk makluman pihak tuan, pelajar yang menjalani Latihan Industri di syarikat tuan adalah dilindungi oleh insurans kemalangan diri berkelompok.
                      </p>

                      <p>
                        4. &nbsp;&nbsp;&nbsp;&nbsp; Pihak Kolej Komuniti Beaufort amat berbesar hati sekiranya pihak tuan dapat mempertimbangkan untuk menyerap pelajar tersebut sebagai pekerja setelah mereka tamat menjalani Program Latihan Industri ini. Sebarang pertanyaan berhubung perkara ini boleh diajukan kepada Pegawai Perhubungan Industri dan Alumni, <strong>{config.namaPpia}</strong> di talian <strong>{config.noTelefonPpia}</strong>.
                      </p>

                      <p>
                        Kerjasama dari pihak tuan amat dihargai.
                      </p>

                      <p>
                        Sekian terima kasih.
                      </p>
                    </div>

                    {/* Slogan & Penutup */}
                    <div className="mt-6 font-bold text-xs">
                      <p>“MALAYSIA MADANI”</p>
                      <p>“BERKHIDMAT UNTUK NEGARA”</p>
                    </div>

                    <div className="mt-6">
                      <p className="font-medium">Saya yang menjalankan amanah,</p>
                      <div className="h-12"></div>
                      <p className="font-bold text-slate-900">PENGARAH</p>
                      <p className="text-xs text-slate-600">Kolej Komuniti Beaufort</p>
                      <p className="text-xs text-slate-600">Kementerian Pendidikan Tinggi</p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic text-center pt-4 border-t border-slate-100">
                    Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan
                  </div>
                </div>

                {/* ----------------- MUKA SURAT 2: LAMPIRAN A (SENARAI PELAJAR) ----------------- */}
                <div className="min-h-[1050px] flex flex-col justify-between pt-8 border-t-2 border-dashed border-slate-300">
                  <div>
                    {/* Header Lampiran */}
                    <div className="flex items-start justify-between border-b border-slate-900 pb-3 mb-6">
                      <div>
                        <h3 className="font-black text-sm uppercase text-slate-900">
                          SENARAI PELAJAR MELAPOR DIRI
                        </h3>
                        <p className="text-xs text-slate-600 uppercase font-bold">
                          {selectedCompany.companyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          KKBS - {rujukanSurat}
                        </span>
                        <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded uppercase">
                          LAMPIRAN A
                        </span>
                      </div>
                    </div>

                    {/* Jadual Rasmi Lampiran A: BIL | NAMA | PROGRAM */}
                    <div className="overflow-hidden border border-slate-800 rounded-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-800 text-slate-900 font-black">
                            <th className="py-2.5 px-3 border-r border-slate-800 w-12 text-center">BIL</th>
                            <th className="py-2.5 px-4 border-r border-slate-800">NAMA</th>
                            <th className="py-2.5 px-4">PROGRAM</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-900">
                          {selectedCompany.students.map((st, i) => (
                            <tr key={st.noMatrik}>
                              <td className="py-3 px-3 border-r border-slate-800 text-center font-bold">
                                {i + 1}
                              </td>
                              <td className="py-3 px-4 border-r border-slate-800 font-bold uppercase">
                                {st.namaPelajar}
                                <span className="block font-mono text-[10px] text-slate-500 font-normal">
                                  No. Matrik: {st.noMatrik} | No. KP: {st.noIc}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold uppercase">
                                {formatProgramName(st.program) || st.program}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-slate-800">Catatan Melapor Diri:</p>
                      <p className="text-slate-600">
                        1. Tarikh Mula Lapor Diri: <strong>{tarikhMulaLi} (Jam 9.00 Pagi)</strong>
                      </p>
                      <p className="text-slate-600">
                        2. Tempoh Latihan: <strong>{tarikhLi}</strong>
                      </p>
                      <p className="text-slate-600">
                        3. Sebarang pertanyaan hubungi Pegawai Perhubungan Industri: <strong>{config.namaPpia} ({config.noTelefonPpia})</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 italic text-center pt-4 border-t border-slate-100">
                    Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between print:hidden">
              <span className="text-xs text-slate-500 font-mono">
                No. Rujukan: KKBS - {rujukanSurat}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handlePrintDocument}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak / Muat Turun PDF Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
