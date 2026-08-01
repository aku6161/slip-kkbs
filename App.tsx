import React, { useState, useEffect } from 'react';
import { Student, DocumentType, BJPLIFormData, SystemConfig } from './types';
import { INITIAL_STUDENTS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { MainDashboard } from './components/MainDashboard';
import { StudentList } from './components/StudentList';
import { DocumentViewer } from './components/DocumentViewer';
import { ApplicationForm } from './components/ApplicationForm';
import { IndustryPortal } from './components/IndustryPortal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ConfigPanel } from './components/ConfigPanel';
import { RefreshCw, Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'status' | 'industry' | 'document' | 'config'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('surat');
  
  // System config state
  const [config, setConfig] = useState<SystemConfig>({
    sesi: 'SESI I 2026/2027',
    tarikh: '30 NOVEMBER 2026 HINGGA 19 MAC 2027',
    tempoh: '4 BULAN (16 MINGGU)',
    tarikhAkhirJawapan: '15 OKTOBER 2026',
    namaPpia: 'SHAMSUDDIN BIN AMIN',
    noTelefonPpia: '012-2455616'
  });
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Apps Script configuration (stored in localStorage)
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => localStorage.getItem('APPS_SCRIPT_URL') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Admin Mode State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Load students from backend API on mount & auto-refresh every 5 seconds
  const fetchStudents = async (targetUrl = appsScriptUrl) => {
    setIsSyncing(true);
    try {
      const url = targetUrl
        ? `/api/students?appsScriptUrl=${encodeURIComponent(targetUrl)}`
        : '/api/students';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.students) {
          setStudents(data.students);
        }
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (err) {
      console.warn('Backend sync warning, using local initial state:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStudents(appsScriptUrl);
    const interval = setInterval(() => {
      fetchStudents(appsScriptUrl);
    }, 5000);
    return () => clearInterval(interval);
  }, [appsScriptUrl]);

  // Admin login handler
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === 'upliakkbs2022') {
      setIsAdmin(true);
      setIsAdminModalOpen(false);
      setAdminPasswordInput('');
      setAdminAuthError('');
      setCurrentView('status');
    } else {
      setAdminAuthError('Kata laluan tidak sah. Sila masukkan kata laluan admin yang betul.');
    }
  };

  // Handlers
  const handleSelectStudentForDoc = (student: Student, docType: DocumentType = 'surat') => {
    setSelectedStudent(student);
    setSelectedDocType(docType);
    setCurrentView('document');
  };

  const handleUpdateStudent = async (id: string, updatedData: Partial<Student>) => {
    // Update local state immediately
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updatedData } : s))
    );

    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(prev => (prev ? { ...prev, ...updatedData } : null));
    }

    // Sync with server backend
    try {
      await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-apps-script-url': appsScriptUrl
        },
        body: JSON.stringify(updatedData),
      });
    } catch (err) {
      console.error('Failed to sync update to server:', err);
    }
  };

  const handleSaveBjpliData = (data: BJPLIFormData) => {
    if (!selectedStudent) return;
    let newStatus: any = selectedStudent.status;
    if (data.keputusan === 'DITERIMA') newStatus = 'Lulus / Diterima';
    else if (data.keputusan === 'DITOLAK') newStatus = 'Ditolak';
    else newStatus = 'Menunggu Jawapan';

    handleUpdateStudent(selectedStudent.id, {
      bjpliData: data,
      status: newStatus,
      emelHrSyarikat: data.emelSyarikat || selectedStudent.emelHrSyarikat,
    });
  };

  const handleNewStudentCreated = (newStudent: Student, message?: string, emailError?: string) => {
    setStudents(prev => [newStudent, ...prev]);
    if (emailError) {
      alert(`Permohonan telah disimpan di Google Sheets, tetapi penghantaran emel GAGAL: ${emailError}. Sila semak semula emel HR atau laporkan kepada pentadbir.`);
    } else {
      alert('Permohonan telah dihantar. Sila semak emel anda!');
    }
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased selection:bg-blue-900 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={view => {
          if ((view === 'status' || view === 'config') && !isAdmin) {
            setIsAdminModalOpen(true);
            return;
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isSyncing={isSyncing}
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setAdminAuthError('');
          setAdminPasswordInput('');
          setIsAdminModalOpen(true);
        }}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          if (currentView === 'status') {
            setCurrentView('dashboard');
          }
        }}
      />


      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'dashboard' && (
          <MainDashboard
            students={students}
            onNavigateTab={view => {
              if (view === 'status' && !isAdmin) {
                setIsAdminModalOpen(true);
                return;
              }
              setCurrentView(view);
            }}
            onOpenNewForm={() => setCurrentView('form')}
          />
        )}

        {currentView === 'status' && isAdmin && (
          <StudentList
            students={students}
            appsScriptUrl={appsScriptUrl}
            onSelectStudent={handleSelectStudentForDoc}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAiAssist={student => {
              setSelectedStudent(student);
              setIsAiModalOpen(true);
            }}
            onViewStudentDetail={student => {
              setSelectedStudent(student);
              setIsDetailModalOpen(true);
            }}
            onUpdateStudentStatus={(id, status) => handleUpdateStudent(id, { status })}
          />
        )}

        {currentView === 'status' && !isAdmin && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-md">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900 uppercase">Akses Terhad (Admin Sahaja)</h2>
            <p className="text-xs text-slate-600 mt-2">
              Tab Status Permohonan hanya boleh diakses dan dikemaskini oleh pentadbir (Admin).
            </p>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="mt-6 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              Log Masuk Pentadbir
            </button>
          </div>
        )}

        {currentView === 'document' && selectedStudent && (
          <DocumentViewer
            student={selectedStudent}
            config={config}
            appsScriptUrl={appsScriptUrl}
            initialDoc={selectedDocType}
            onBack={() => setCurrentView(isAdmin ? 'status' : 'dashboard')}
            onSaveBjpli={handleSaveBjpliData}
            onOpenAiAssist={student => {
              setSelectedStudent(student);
              setIsAiModalOpen(true);
            }}
          />
        )}

        {currentView === 'form' && (
          <ApplicationForm
            students={students}
            config={config}
            appsScriptUrl={appsScriptUrl}
            onSuccess={handleNewStudentCreated}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'industry' && (
          <IndustryPortal
            students={students}
            onUpdateStudent={handleUpdateStudent}
            onOpenDocuments={(student, docType) => {
              setSelectedStudent(student);
              setSelectedDocType(docType);
              setCurrentView('document');
            }}
          />
        )}

        {currentView === 'config' && isAdmin && (
          <ConfigPanel
            config={config}
            appsScriptUrl={appsScriptUrl}
            onSaveSuccess={updatedConfig => setConfig(updatedConfig)}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12 print:hidden font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="font-bold text-slate-200">
              SISTEM LATIHAN INDUSTRI PELAJAR (SLIP) © 2026
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Unit Perhubungan Industri & Alumni | Kolej Komuniti Beaufort Sabah
            </p>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 text-blue-900 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Log Masuk Admin</h3>
                <p className="text-xs text-slate-500">Sistem Latihan Industri Pelajar</p>
              </div>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Laluan Admin:
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  placeholder="Masukkan kata laluan admin"
                  value={adminPasswordInput}
                  onChange={e => {
                    setAdminPasswordInput(e.target.value);
                    setAdminAuthError('');
                  }}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {adminAuthError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adminAuthError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Log Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      {isDetailModalOpen && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setIsDetailModalOpen(false)}
          onOpenDocuments={docType => {
            setSelectedDocType(docType);
            setCurrentView('document');
          }}
        />
      )}

      {isAiModalOpen && (
        <AIAssistantModal
          student={selectedStudent || students[0]}
          onClose={() => setIsAiModalOpen(false)}
        />
      )}

      {/* Settings/API Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 font-sans">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase">Tetapan API Google Sheets</h3>
                <p className="text-xs text-slate-500">Sistem Latihan Industri Pelajar (SLIP)</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sila tampal **URL Web App Google Apps Script** yang anda perolehi selepas mendeploy skrip Apps Script sebagai Web App (pilihan: <em>Anyone</em> & <em>Me</em>).
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pautan Web App URL:
                </label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={appsScriptUrl}
                  onChange={e => setAppsScriptUrl(e.target.value.trim())}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('APPS_SCRIPT_URL', appsScriptUrl);
                    setIsSettingsOpen(false);
                    fetchStudents(appsScriptUrl);
                  }}
                  className="w-1/2 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
                >
                  Simpan Tetapan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

