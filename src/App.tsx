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
import { LandingPage } from './components/LandingPage';
import { StudentPortal } from './components/StudentPortal';
import { LecturerPortal } from './components/LecturerPortal';
import { RefreshCw, Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

export default function App() {
  const [userRole, setUserRole] = useState<'landing' | 'student' | 'admin' | 'lecturer'>('landing');
  const [studentIc, setStudentIc] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [markah, setMarkah] = useState<any[]>([]);
  const [markahHeaders, setMarkahHeaders] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'status' | 'industry' | 'document' | 'config'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('surat');
  
  // Centralized System config state
  const [config, setConfig] = useState<SystemConfig>({
    sesi: 'SESI I 2026/2027',
    tarikh: '30 NOVEMBER 2026 HINGGA 19 MAC 2027',
    tempoh: '4 BULAN (16 MINGGU)',
    tarikhAkhirJawapan: '15 OKTOBER 2026',
    namaPpia: 'SHAMSUDDIN BIN AMIN',
    noTelefonPpia: '012-2455616',
    tarikhPemantauan: '15 JANUARI 2027 HINGGA 15 FEBRUARI 2027',
    tarikhPembentangan: '22 MAC 2027 HINGGA 26 MAC 2027',
    tarikhKeputusan: '5 APRIL 2027'
  });
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Apps Script configuration (stored in localStorage)
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => localStorage.getItem('APPS_SCRIPT_URL') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Admin Mode State
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
        if (data.markah) {
          setMarkah(data.markah);
        }
        if (data.markahHeaders) {
          setMarkahHeaders(data.markahHeaders);
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
      setUserRole('admin');
      setIsAdminModalOpen(false);
      setAdminPasswordInput('');
      setAdminAuthError('');
      setCurrentView('dashboard');
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

  const handleSaveStudentAsync = async (studentData: Partial<Student>) => {
    try {
      const url = appsScriptUrl 
        ? `/api/students?appsScriptUrl=${encodeURIComponent(appsScriptUrl)}`
        : '/api/students';

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.student) {
          setStudents(prev => [data.student, ...prev.filter(s => s.id !== data.student.id)]);
          return { success: true, student: data.student };
        }
      }
      return { success: false };
    } catch (err) {
      console.error('Failed to save student:', err);
      return { success: false };
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
  };

  const handleSaveStudentMark = async (noMatrik: string, marks: any[]) => {
    try {
      const url = appsScriptUrl 
        ? `/api/students/mark?appsScriptUrl=${encodeURIComponent(appsScriptUrl)}`
        : '/api/students/mark';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noMatrik, marks })
      });
      if (res.ok) {
        fetchStudents(appsScriptUrl);
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({ error: 'Gagal menyimpan markah.' }));
        return { success: false, message: err.error || 'Gagal menyimpan markah.' };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Ralat pelayan semasa menghantar markah.' };
    }
  };

  // 1. Landing View
  if (userRole === 'landing') {
    return (
      <LandingPage
        onStudentLogin={(ic) => {
          setStudentIc(ic);
          setUserRole('student');
        }}
        onAdminLogin={() => {
          setUserRole('admin');
          setCurrentView('dashboard');
        }}
        onLecturerLogin={(staffId) => {
          // Verify if staffId exists in markah rows
          const staffKey = Object.keys(markah[0] || {}).find(key => {
            const uKey = key.toUpperCase();
            return uKey.includes('ID STAF') || uKey.includes('ID STAFF') || uKey.includes('ID PEMANTAU') || uKey.includes('STAFF ID') || uKey.includes('STAF ID') || (uKey.includes('PEMANTAU') && (uKey.includes('IC') || uKey.includes('KP') || uKey.includes('NO.')));
          });
          const match = markah.find(row => staffKey && String(row[staffKey]).toUpperCase().trim() === staffId.toUpperCase().trim());
          
          if (match || staffId.toLowerCase() === 'admin' || staffId.toLowerCase() === 'staff') {
            setLecturerId(staffId);
            setUserRole('lecturer');
          } else {
            alert('Maaf, ID tidak ditemui.');
          }
        }}
      />
    );
  }

  // 2. Student Portal View
  if (userRole === 'student') {
    return (
      <StudentPortal
        icNumber={studentIc}
        students={students}
        config={config}
        appsScriptUrl={appsScriptUrl}
        onSaveStudent={handleSaveStudentAsync}
        onSelectStudentForDoc={handleSelectStudentForDoc}
        onLogout={() => setUserRole('landing')}
      />
    );
  }

  // 2.5. Lecturer Portal View
  if (userRole === 'lecturer') {
    return (
      <LecturerPortal
        staffId={lecturerId}
        students={students}
        markah={markah}
        markahHeaders={markahHeaders}
        onSaveMark={handleSaveStudentMark}
        onLogout={() => setUserRole('landing')}
        config={config}
      />
    );
  }

  // 3. Admin View
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col antialiased selection:bg-blue-900 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={view => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isSyncing={isSyncing}
        isAdmin={true}
        onOpenAdminModal={() => {}}
        onLogoutAdmin={() => {
          setUserRole('landing');
          setCurrentView('dashboard');
        }}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Admin Tab 1: Statistik Permohonan (No welcome header) */}
        {currentView === 'dashboard' && (
          <MainDashboard
            students={students}
            onNavigateTab={view => setCurrentView(view)}
            onOpenNewForm={() => setCurrentView('form')}
            hideWelcomeHeader={true}
          />
        )}

        {/* Admin Tab 2: Status Permohonan */}
        {currentView === 'status' && (
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

        {/* Document Viewer (accessible by Admin) */}
        {currentView === 'document' && selectedStudent && (
          <DocumentViewer
            student={selectedStudent}
            config={config}
            appsScriptUrl={appsScriptUrl}
            initialDoc={selectedDocType}
            onBack={() => setCurrentView('status')}
            onSaveBjpli={handleSaveBjpliData}
            onOpenAiAssist={student => {
              setSelectedStudent(student);
              setIsAiModalOpen(true);
            }}
          />
        )}

        {/* Admin Tab 3: Maklumat Latihan */}
        {currentView === 'config' && (
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
          <button
            onClick={() => setUserRole('landing')}
            className="text-slate-400 hover:text-white font-bold text-xs"
          >
            ← Kembali ke Paparan Utama
          </button>
        </div>
      </footer>

      {/* Student Detail Modal */}
      {isDetailModalOpen && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setIsDetailModalOpen(false)}
          onOpenDocument={(student, docType) => {
            setIsDetailModalOpen(false);
            handleSelectStudentForDoc(student, docType);
          }}
          onOpenAiAssist={student => {
            setIsDetailModalOpen(false);
            setSelectedStudent(student);
            setIsAiModalOpen(true);
          }}
        />
      )}

      {/* AI Assistant Modal */}
      {isAiModalOpen && selectedStudent && (
        <AIAssistantModal
          student={selectedStudent}
          onClose={() => setIsAiModalOpen(false)}
          onUpdateStudent={handleUpdateStudent}
        />
      )}
    </div>
  );
}
