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
import { PenilaianPelajar } from './components/PenilaianPelajar';
import { RefreshCw, Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

import { 
  subscribeStudents, 
  saveStudentToFirebase, 
  subscribeMarkah, 
  saveMarkahToFirebase, 
  subscribeSystemConfig, 
  saveSystemConfigToFirebase,
  seedFirebaseIfEmpty 
} from './firebase';

export default function App() {
  const [userRole, setUserRole] = useState<'landing' | 'student' | 'admin' | 'lecturer'>('landing');
  const [studentIc, setStudentIc] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [markah, setMarkah] = useState<any[]>([]);
  const [markahHeaders, setMarkahHeaders] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'status' | 'industry' | 'document' | 'config' | 'penilaian'>('dashboard');
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

  // Apps Script configuration for Document Generation & Drive Templates (stored in localStorage)
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => localStorage.getItem('APPS_SCRIPT_URL') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Admin Mode State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // 1. Firebase Firestore Real-Time Subscriptions (Students, Config, Markah)
  useEffect(() => {
    setIsSyncing(true);

    // Initial seeding if Firestore is empty
    seedFirebaseIfEmpty(INITIAL_STUDENTS, config).catch(() => {});

    // Subscribe to students collection in real-time
    const unsubscribeStudents = subscribeStudents(
      (firebaseStudents) => {
        if (firebaseStudents && firebaseStudents.length > 0) {
          setStudents(firebaseStudents);
        }
        setIsSyncing(false);
      },
      (err) => {
        console.warn('Firebase students sync note:', err);
        setIsSyncing(false);
      }
    );

    // Subscribe to system config in real-time
    const unsubscribeConfig = subscribeSystemConfig((firebaseConfig) => {
      if (firebaseConfig) {
        setConfig(firebaseConfig);
      }
    });

    // Subscribe to markah in real-time
    const unsubscribeMarkah = subscribeMarkah((firebaseMarkah) => {
      if (firebaseMarkah && firebaseMarkah.length > 0) {
        setMarkah(firebaseMarkah);
        const headers = Array.from(new Set(firebaseMarkah.flatMap(m => Object.keys(m))));
        setMarkahHeaders(headers);
      }
    });

    return () => {
      unsubscribeStudents();
      unsubscribeConfig();
      unsubscribeMarkah();
    };
  }, []);

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
    const target = students.find(s => s.id === id);
    if (!target) return;
    const updated = { ...target, ...updatedData };

    setStudents(prev =>
      prev.map(s => (s.id === id ? updated : s))
    );

    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(prev => (prev ? { ...prev, ...updatedData } : null));
    }

    // Save directly to Firebase Firestore
    try {
      await saveStudentToFirebase(updated);
    } catch (err) {
      console.error('Failed to sync update to Firebase:', err);
    }
  };

  const handleSaveStudentAsync = async (studentData: Partial<Student>) => {
    try {
      const docId = studentData.id || studentData.noMatrik?.replace(/\//g, '_') || `student_${Date.now()}`;
      const fullStudent: Student = {
        id: docId,
        timestamp: new Date().toLocaleString('ms-MY'),
        email: studentData.email || studentData.emelPelajar || '',
        namaPelajar: studentData.namaPelajar || '',
        noIc: studentData.noIc || '',
        noMatrik: studentData.noMatrik || '',
        program: studentData.program || '',
        sesi: studentData.sesi || config.sesi || '',
        noTelefon: studentData.noTelefon || '',
        emelPelajar: studentData.emelPelajar || '',
        alamat: studentData.alamat || '',
        namaSekolahMenengah: studentData.namaSekolahMenengah || '',
        jawatanKkbs: studentData.jawatanKkbs || '',
        programKkbs1: studentData.programKkbs1 || '',
        programKkbs2: studentData.programKkbs2 || '',
        programKkbs3: studentData.programKkbs3 || '',
        pencapaian1: studentData.pencapaian1 || '',
        pencapaian2: studentData.pencapaian2 || '',
        pencapaian3: studentData.pencapaian3 || '',
        namaPa: studentData.namaPa || '',
        noTelefonPa: studentData.noTelefonPa || '',
        emelPa: studentData.emelPa || '',
        emelHrSyarikat: studentData.emelHrSyarikat || '',
        namaSyarikat: studentData.namaSyarikat || '',
        status: (studentData.status || 'Permohonan Dihantar') as any,
        ...studentData
      };

      await saveStudentToFirebase(fullStudent);
      setStudents(prev => [fullStudent, ...prev.filter(s => s.id !== docId)]);
      return { success: true, student: fullStudent };
    } catch (err) {
      console.error('Failed to save student to Firebase:', err);
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
      alert(`Permohonan telah disimpan, tetapi penghantaran emel GAGAL: ${emailError}. Sila semak semula emel HR atau laporkan kepada pentadbir.`);
    } else {
      alert('Permohonan telah berjaya disimpan ke Firebase. Sila semak emel anda!');
    }
  };

  const handleSaveStudentMark = async (noMatrik: string, marks: any[]) => {
    try {
      const realHeaders = ["FLI02-C1", "FLI02-C2", "TOTAL7", "FLI02-C3", "FLI02-C4", "TOTAL8", "FLI02-C5", "FLI02-C6", "TOTAL9", "GRAN TOTAL2", "FLI02-ULASAN"];
      const markObj: Record<string, any> = { noMatrik, marks, updatedAt: new Date().toISOString() };
      realHeaders.forEach((header, idx) => {
        markObj[header] = marks[idx];
      });
      
      await saveMarkahToFirebase(noMatrik, markObj);

      // Local state update for immediate UI reflection
      setMarkah(prev => {
        const cleanNo = noMatrik.trim().toLowerCase();
        const existingIdx = prev.findIndex(m => {
          const matrikVal = String(m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || '').trim().toLowerCase();
          return matrikVal === cleanNo;
        });
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...markObj };
          return updated;
        }
        return [...prev, markObj];
      });

      // Also sync to Google Apps Script if URL is configured
      if (appsScriptUrl) {
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_student_mark',
            noMatrik,
            marks
          })
        }).catch(err => console.warn('Sync mark to Apps Script note:', err));
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Ralat semasa menyimpan markah ke Firebase.' };
    }
  };

  const handleSaveEvaluationMark = async (noMatrik: string, dataToSave: Record<string, any>) => {
    try {
      const markObj: Record<string, any> = {
        ...dataToSave,
        noMatrik,
        updatedAt: new Date().toISOString()
      };

      await saveMarkahToFirebase(noMatrik, markObj);

      // Update local state immediately
      setMarkah(prev => {
        const cleanNo = noMatrik.trim().toLowerCase();
        const existingIdx = prev.findIndex(m => {
          const matrikVal = String(m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || '').trim().toLowerCase();
          return matrikVal === cleanNo;
        });
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...markObj };
          return updated;
        }
        return [...prev, markObj];
      });

      // Sync FLI 02 to Apps Script if marks array is present
      if (appsScriptUrl && dataToSave['FLI02-C1'] !== undefined) {
        const c1_1 = dataToSave['FLI02-C1'] || 1;
        const c1_2 = dataToSave['FLI02-C2'] || 1;
        const c1 = dataToSave['TOTAL7'] || 10;
        const c2_1 = dataToSave['FLI02-C3'] || 1;
        const c2_2 = dataToSave['FLI02-C4'] || 1;
        const c2 = dataToSave['TOTAL8'] || 5;
        const c3_1 = dataToSave['FLI02-C5'] || 1;
        const c3_2 = dataToSave['FLI02-C6'] || 1;
        const c3 = dataToSave['TOTAL9'] || 5;
        const total = dataToSave['GRAN TOTAL2'] || 20;
        const ulasan = dataToSave['FLI02-ULASAN'] || '';
        
        fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_student_mark',
            noMatrik,
            marks: [c1_1, c1_2, c1, c2_1, c2_2, c2, c3_1, c3_2, c3, total, ulasan]
          })
        }).catch(err => console.warn('Sync mark to Apps Script note:', err));
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Ralat semasa menyimpan markah ke Firebase.' };
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
          const inputClean = staffId.trim();
          const query = inputClean.toUpperCase();
          const queryNoSlash = query.replace(/\s+/g, '');
          
          // 1. Master keywords
          if (query === 'ADMIN' || query === 'STAFF') {
            setLecturerId(inputClean);
            setUserRole('lecturer');
            return;
          }

          // 2. Search in markah rows for STAFF ID / NO. ID STAF (e.g. KKBS/003)
          const matchedMarkah = markah.find(row => {
            return Object.keys(row).some(key => {
              const uKey = key.toUpperCase();
              if (uKey.includes('STAFF ID') || uKey.includes('ID STAF') || uKey.includes('ID STAFF') || uKey.includes('ID PEMANTAU') || (uKey.includes('PEMANTAU') && uKey.includes('NO.'))) {
                const val = String(row[key] || '').toUpperCase().trim();
                const valNoSlash = val.replace(/\s+/g, '');
                return val === query || valNoSlash === queryNoSlash;
              }
              return false;
            });
          });

          if (matchedMarkah) {
            // Find the exact staff key value
            const staffKey = Object.keys(matchedMarkah).find(k => {
              const uk = k.toUpperCase();
              return uk.includes('STAFF ID') || uk.includes('ID STAF') || uk.includes('ID STAFF') || uk.includes('ID PEMANTAU');
            });
            const actualStaffId = (staffKey ? String(matchedMarkah[staffKey]) : inputClean).trim();
            setLecturerId(actualStaffId);
            setUserRole('lecturer');
          } else {
            alert(`Maaf, No. ID Staf "${inputClean}" tidak ditemui dalam sistem (Tab MARKAH_PELAJAR).\n\nSila pastikan No. ID Staf dimasukkan dengan tepat (Contoh: KKBS/003, KKBS/016, KKBS/049, dsb.).`);
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

        {/* Admin Tab 3: Penilaian Pelajar */}
        {currentView === 'penilaian' && (
          <PenilaianPelajar
            students={students}
            markah={markah}
            config={config}
            onSaveMark={handleSaveEvaluationMark}
          />
        )}

        {/* Admin Tab 4: Maklumat Latihan */}
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
