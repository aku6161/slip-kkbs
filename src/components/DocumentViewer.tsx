import React, { useState } from 'react';
import { Student, DocumentType, BJPLIFormData, SystemConfig } from '../types';
import { SuratPermohonanDoc } from './documents/SuratPermohonanDoc';
import { ResumeDoc } from './documents/ResumeDoc';
import { BorangBJPLIDoc } from './documents/BorangBJPLIDoc';
import { SkopLatihanDoc } from './documents/SkopLatihanDoc';
import { Printer, Sparkles, Send, ArrowLeft, FileText, UserCheck, CheckCircle2, Copy } from 'lucide-react';

interface DocumentViewerProps {
  student: Student;
  config: SystemConfig;
  appsScriptUrl?: string;
  initialDoc?: DocumentType;
  onBack: () => void;
  onSaveBjpli?: (data: BJPLIFormData) => void;
  onOpenAiAssist?: (student: Student, docType: DocumentType) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  student,
  config,
  appsScriptUrl = '',
  initialDoc = 'surat',
  onBack,
  onSaveBjpli,
  onOpenAiAssist,
}) => {
  const [activeTab, setActiveTab] = useState<DocumentType>(initialDoc);
  const [aiText, setAiText] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string>('');

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmailPackage = async () => {
    setSendingEmail(true);
    setEmailError('');
    setEmailSent(false);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-apps-script-url': appsScriptUrl,
        },
        body: JSON.stringify({
          namaPelajar: student.namaPelajar,
          noIc: student.noIc,
          noMatrik: student.noMatrik,
          program: student.program,
          sesi: student.sesi || config.sesi,
          noTelefon: student.noTelefon,
          emelPelajar: student.emelPelajar,
          alamat: student.alamat,
          rujukanSurat: student.rujukanSurat,
          tarikhSurat: student.tarikhSurat,
          namaSyarikat: student.namaSyarikat,
          emelHrSyarikat: student.emelHrSyarikat,
          emelPa: student.emelPa,
          namaPa: student.namaPa,
          noTelefonPa: student.noTelefonPa,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghantar emel permohonan.');
      }
      setEmailSent(true);
    } catch (err: any) {
      setEmailError(err.message || 'Ralat semasa memproses penghantaran emel.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions (Hidden during print) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={onBack}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <div>
            <span className="text-[10px] font-bold font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              {student.noMatrik}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
              {student.namaPelajar}
            </h2>
            <p className="text-xs text-slate-500">
              Syarikat Sasaran: <strong className="text-slate-800">{student.namaSyarikat}</strong> ({student.emelHrSyarikat})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          {onOpenAiAssist && (
            <button
              onClick={() => onOpenAiAssist(student, activeTab)}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              Poles Menerusi AI
            </button>
          )}

          <button
            onClick={handleSendEmailPackage}
            disabled={sendingEmail}
            className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {sendingEmail ? (
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sendingEmail ? 'Menghantar Emel...' : 'Emelkan Ke HR Syarikat'}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Muat Turun PDF
          </button>
        </div>
      </div>

      {emailSent && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Paket 4 Dokumen SLIP (Surat + Resume + Borang BJPLI + Skop Latihan) berjaya dihantar ke emel HR Syarikat (<strong>{student.emelHrSyarikat}</strong>)! Salinan CC juga dihantar ke emel pelajar & emel PA.</span>
        </div>
      )}

      {emailError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-lg text-xs font-bold flex items-start gap-2 shadow-sm animate-fade-in print:hidden">
          <span className="w-4 h-4 text-rose-600 flex items-center justify-center font-bold text-sm bg-rose-200 rounded-full shrink-0">!</span>
          <div className="flex flex-col gap-0.5">
            <span>Gagal menghantar emel permohonan ke HR Syarikat:</span>
            <span className="text-[11px] font-mono font-medium text-rose-800">{emailError}</span>
            <span className="text-[10px] text-slate-500 font-normal mt-1 leading-normal">
              Sila pastikan **Tetapan API Google Sheets** anda di bahagian Admin adalah betul, skrip telah di-authorize di Google Apps Script editor, dan kuota Gmail harian anda belum melebihi had.
            </span>
          </div>
        </div>
      )}

      {/* 4 Document Selector Tabs (Hidden during print) */}
      <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex flex-wrap gap-1 print:hidden">
        <button
          onClick={() => setActiveTab('surat')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'surat'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          1. Surat Permohonan
        </button>

        <button
          onClick={() => setActiveTab('resume')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'resume'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          2. Resume Pelajar
        </button>

        <button
          onClick={() => setActiveTab('bjpli')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'bjpli'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          3. Borang BJPLI
        </button>

        <button
          onClick={() => setActiveTab('skop')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'skop'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          4. Skop Latihan (20 Minggu)
        </button>
      </div>

      {/* Render Active Document */}
      <div className="printable-document">
        {activeTab === 'surat' && <SuratPermohonanDoc student={student} config={config} />}
        {activeTab === 'resume' && <ResumeDoc student={student} aiEnhancedText={aiText} />}
        {activeTab === 'bjpli' && <BorangBJPLIDoc student={student} onSaveBjpli={onSaveBjpli} />}
        {activeTab === 'skop' && <SkopLatihanDoc student={student} config={config} />}
      </div>
    </div>
  );
};
