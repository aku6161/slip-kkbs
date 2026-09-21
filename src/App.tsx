import React, { useState, useEffect, useRef } from 'react';
import { Student, DocumentType, BJPLIFormData, SystemConfig, Lecturer } from './types';
import { INITIAL_STUDENTS, INITIAL_LECTURERS } from './data/initialData';
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
import { MaklumatPensyarah } from './components/MaklumatPensyarah';
import { TetapanPanel } from './components/TetapanPanel';
import { RefreshCw, Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';

import { 
  subscribeStudents, 
  saveStudentToFirebase, 
  deleteStudentFromFirebase,
  subscribeMarkah, 
  saveMarkahToFirebase, 
  subscribeSystemConfig, 
  saveSystemConfigToFirebase,
  subscribeLecturers,
  saveLecturerToFirebase,
  deleteLecturerFromFirebase,
  seedFirebaseIfEmpty 
} from './firebase';

const SESSION_KEY = 'SLIP_AUTH_SESSION';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface AuthSession {
  userRole: 'landing' | 'student' | 'admin' | 'lecturer';
  studentIc: string;
  lecturerId: string;
  currentView: 'dashboard' | 'form' | 'status' | 'industry' | 'document' | 'config' | 'penilaian' | 'pensyarah' | 'tetapan';
  lastActiveTimestamp: number;
}

export default function App() {
  // Restore session from localStorage if within 30 minutes
  const getInitialSession = (): AuthSession => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed: AuthSession = JSON.parse(saved);
        const elapsed = Date.now() - (parsed.lastActiveTimestamp || 0);
        if (elapsed < INACTIVITY_TIMEOUT_MS && parsed.userRole && parsed.userRole !== 'landing') {
          return {
            ...parsed,
            lastActiveTimestamp: Date.now()
          };
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
    return {
      userRole: 'landing',
      studentIc: '',
      lecturerId: '',
      currentView: 'dashboard',
      lastActiveTimestamp: Date.now()
    };
  };

  const initialSession = getInitialSession();

  const [userRole, setUserRole] = useState<'landing' | 'student' | 'admin' | 'lecturer'>(initialSession.userRole);
  const [studentIc, setStudentIc] = useState<string>(initialSession.studentIc);
  const [lecturerId, setLecturerId] = useState<string>(initialSession.lecturerId);
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'status' | 'industry' | 'document' | 'config' | 'penilaian' | 'pensyarah' | 'tetapan'>(initialSession.currentView);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [markah, setMarkah] = useState<any[]>([]);
  const [markahHeaders, setMarkahHeaders] = useState<string[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>(INITIAL_LECTURERS);
  
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

  const lastActiveRef = useRef<number>(Date.now());

  // Save session updates to localStorage
  const saveSession = (
    role: 'landing' | 'student' | 'admin' | 'lecturer',
    ic = studentIc,
    lecId = lecturerId,
    view = currentView
  ) => {
    if (role === 'landing') {
      localStorage.removeItem(SESSION_KEY);
    } else {
      const sess: AuthSession = {
        userRole: role,
        studentIc: ic,
        lecturerId: lecId,
        currentView: view,
        lastActiveTimestamp: Date.now()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
    }
  };

  // 1. Inactivity Tracker (Auto-Logout after 30 minutes of no user action)
  useEffect(() => {
    if (userRole === 'landing') return;

    const updateActivity = () => {
      const now = Date.now();
      lastActiveRef.current = now;
      saveSession(userRole, studentIc, lecturerId, currentView);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    let throttleTimeout: any = null;

    const handleUserActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateActivity();
          throttleTimeout = null;
        }, 3000); // throttle every 3 seconds to avoid heavy storage writes
      }
    };

    events.forEach(event => window.addEventListener(event, handleUserActivity, { passive: true }));

    // Periodic check every 15 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActiveRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        // Auto logout due to 30 mins inactivity
        setUserRole('landing');
        localStorage.removeItem(SESSION_KEY);
        alert('Sesi anda telah tamat secara automatik kerana tiada aktiviti selama 30 minit.\n\nSila log masuk semula.');
      }
    }, 15000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
      clearInterval(interval);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [userRole, studentIc, lecturerId, currentView]);

  // 2. Firebase Firestore Real-Time Subscriptions (Students, Config, Markah, Lecturers)
  useEffect(() => {
    setIsSyncing(true);

    // Initial seeding if Firestore is empty
    seedFirebaseIfEmpty(INITIAL_STUDENTS, config, INITIAL_LECTURERS).catch(() => {});

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

    // Subscribe to lecturers in real-time
    const unsubscribeLecturers = subscribeLecturers((firebaseLecturers) => {
      if (firebaseLecturers && firebaseLecturers.length > 0) {
        setLecturers(firebaseLecturers as Lecturer[]);
      }
    });

    return () => {
      unsubscribeStudents();
      unsubscribeConfig();
      unsubscribeMarkah();
      unsubscribeLecturers();
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
      saveSession('admin', '', '', 'dashboard');
    } else {
      setAdminAuthError('Kata laluan tidak sah. Sila masukkan kata laluan admin yang betul.');
    }
  };

  // Handlers
  const handleSelectStudentForDoc = (student: Student, docType: DocumentType = 'surat') => {
    setSelectedStudent(student);
    setSelectedDocType(docType);
    setCurrentView('document');
    saveSession(userRole, studentIc, lecturerId, 'document');
  };

  const handleUpdateStudent = async (id: string, updatedData: Partial<Student>) => {
    const target = students.find(s => s.id === id);
    if (!target) return;
    const updated = { ...target, ...updatedData };

    setStudents(prev =>
      prev.map(s => (s.id === id ? updated : s))
    );

    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(prev => (prev ? { ...prev, ...updatedData } : null));
    }

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

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudentFromFirebase(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (err) {
      console.error('Failed to delete student from Firebase:', err);
      throw err;
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

  const handleSaveStudentMark = async (noMatrik: string, marks: any[]) => {
    try {
      const realHeaders = ["FLI02-C1", "FLI02-C2", "TOTAL7", "FLI02-C3", "FLI02-C4", "TOTAL8", "FLI02-C5", "FLI02-C6", "TOTAL9", "GRAN TOTAL2", "FLI02-ULASAN"];
      const markObj: Record<string, any> = { noMatrik, marks, updatedAt: new Date().toISOString() };
      realHeaders.forEach((header, idx) => {
        markObj[header] = marks[idx];
      });
      
      await saveMarkahToFirebase(noMatrik, markObj);

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
      await saveMarkahToFirebase(noMatrik, dataToSave);

      setMarkah(prev => {
        const cleanNo = noMatrik.trim().toLowerCase();
        const existingIdx = prev.findIndex(m => {
          const matrikVal = String(m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || '').trim().toLowerCase();
          return matrikVal === cleanNo;
        });
        if (existingIdx !== -1) {
          const updated = [...prev];
          updated[existingIdx] = { ...updated[existingIdx], ...dataToSave };
          return updated;
        }
        return [...prev, { noMatrik, ...dataToSave }];
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Ralat semasa menyimpan markah ke Firebase.' };
    }
  };

  // Lecturer Assignment Handlers (FLI 02 & FLI 03)
  const handleAssignLecturers = async (
    studentIdOrMatrik: string,
    assignments: {
      idPemantau1?: string;
      namaPemantau1?: string;
      idPemantau2?: string;
      namaPemantau2?: string;
    }
  ) => {
    try {
      // 1. Find and update target student in students state and Firebase
      const targetStudent = students.find(
        s => s.id === studentIdOrMatrik || s.noMatrik === studentIdOrMatrik
      );

      if (targetStudent) {
        const updatedStudent: Student = {
          ...targetStudent,
          ...assignments
        };
        await saveStudentToFirebase(updatedStudent);
        setStudents(prev => prev.map(s => (s.id === targetStudent.id ? updatedStudent : s)));
      }

      // 2. Sync to markah collection
      const noMatrik = targetStudent?.noMatrik || studentIdOrMatrik;
      const markahData: Record<string, any> = {};

      if (assignments.idPemantau1 !== undefined) {
        markahData['ID PEMANTAU 1'] = assignments.idPemantau1;
        markahData['STAFF ID PEMANTAU 1'] = assignments.idPemantau1;
        markahData['STAFF ID'] = assignments.idPemantau1;
      }
      if (assignments.namaPemantau1 !== undefined) {
        markahData['NAMA PENSYARAH PEMANTAU'] = assignments.namaPemantau1;
        markahData['NAMA PEMANTAU'] = assignments.namaPemantau1;
      }
      if (assignments.idPemantau2 !== undefined) {
        markahData['ID PEMANTAU 2'] = assignments.idPemantau2;
        markahData['STAFF ID PEMANTAU 2'] = assignments.idPemantau2;
      }
      if (assignments.namaPemantau2 !== undefined) {
        markahData['NAMA PENSYARAH PENILAI'] = assignments.namaPemantau2;
        markahData['NAMA PENILAI LAPORAN'] = assignments.namaPemantau2;
      }

      if (Object.keys(markahData).length > 0 && noMatrik) {
        await saveMarkahToFirebase(noMatrik, markahData);
        setMarkah(prev => {
          const cleanNo = noMatrik.trim().toLowerCase();
          const existingIdx = prev.findIndex(m => {
            const matrikVal = String(
              m['NO. MATRIK'] || m['NO MATRIK'] || m['No. Pendaftaran'] || m['noMatrik'] || ''
            ).trim().toLowerCase();
            return matrikVal === cleanNo;
          });
          if (existingIdx !== -1) {
            const updated = [...prev];
            updated[existingIdx] = { ...updated[existingIdx], ...markahData };
            return updated;
          }
          return [...prev, { noMatrik, ...markahData }];
        });
      }

      return { success: true };
    } catch (e: any) {
      console.error('Failed to assign lecturers:', e);
      return { success: false, message: e.message || 'Ralat semasa menetapkan pensyarah.' };
    }
  };

  // Lecturer CRUD Handlers
  const handleSaveLecturer = async (lecturerData: Partial<Lecturer>) => {
    try {
      const docId = lecturerData.id || lecturerData.staffId?.replace(/[\/\s]/g, '_') || `lec_${Date.now()}`;
      const fullLecturer: Lecturer = {
        id: docId,
        nama: lecturerData.nama || '',
        staffId: lecturerData.staffId || '',
        emel: lecturerData.emel || '',
        program: lecturerData.program || 'SIJIL TEKNOLOGI ELEKTRIK',
        noTelefon: lecturerData.noTelefon || '',
        jawatan: lecturerData.jawatan || 'PENSYARAH',
        updatedAt: new Date().toISOString()
      };

      await saveLecturerToFirebase(fullLecturer);
      setLecturers(prev => [fullLecturer, ...prev.filter(l => l.id !== docId)]);
      return { success: true };
    } catch (err: any) {
      console.error('Failed to save lecturer to Firebase:', err);
      return { success: false, message: err.message || 'Ralat semasa menyimpan pensyarah.' };
    }
  };

  const handleDeleteLecturer = async (id: string) => {
    try {
      await deleteLecturerFromFirebase(id);
      setLecturers(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error('Failed to delete lecturer from Firebase:', err);
      throw err;
    }
  };

  // 1. Landing View
  if (userRole === 'landing') {
    return (
      <LandingPage
        onStudentLogin={(ic) => {
          setStudentIc(ic);
          setUserRole('student');
          saveSession('student', ic, '', 'dashboard');
        }}
        onAdminLogin={() => {
          setUserRole('admin');
          setCurrentView('dashboard');
          saveSession('admin', '', '', 'dashboard');
        }}
        onLecturerLogin={(staffId) => {
          const inputClean = staffId.trim();
          const query = inputClean.toUpperCase();
          const queryNoSlash = query.replace(/\s+/g, '');
          
          // 1. Master keywords
          if (query === 'ADMIN' || query === 'STAFF') {
            setLecturerId(inputClean);
            setUserRole('lecturer');
            saveSession('lecturer', '', inputClean, 'dashboard');
            return;
          }

          // 2. Check in lecturers list
          const matchedLecturer = lecturers.find(l => {
            const sid = (l.staffId || '').toUpperCase().trim();
            const sidNoSlash = sid.replace(/\s+/g, '');
            return sid === query || sidNoSlash === queryNoSlash;
          });

          if (matchedLecturer) {
            setLecturerId(matchedLecturer.staffId);
            setUserRole('lecturer');
            saveSession('lecturer', '', matchedLecturer.staffId, 'dashboard');
            return;
          }

          // 3. Search in markah rows for STAFF ID / NO. ID STAF (e.g. KKBS/003)
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
            const staffKey = Object.keys(matchedMarkah).find(k => {
              const uk = k.toUpperCase();
              return uk.includes('STAFF ID') || uk.includes('ID STAF') || uk.includes('ID STAFF') || uk.includes('ID PEMANTAU');
            });
            const actualStaffId = (staffKey ? String(matchedMarkah[staffKey]) : inputClean).trim();
            setLecturerId(actualStaffId);
            setUserRole('lecturer');
            saveSession('lecturer', '', actualStaffId, 'dashboard');
          } else {
            alert(`Maaf, No. ID Staf "${inputClean}" tidak ditemui dalam sistem.\n\nSila pastikan No. ID Staf dimasukkan dengan tepat (Contoh: KKBS/003, KKBS/016, KKBS/022, KKBS/035, KKBS/049, dsb.).`);
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
        onLogout={() => {
          setUserRole('landing');
          saveSession('landing');
        }}
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
        onLogout={() => {
          setUserRole('landing');
          saveSession('landing');
        }}
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
          saveSession('admin', '', '', view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isSyncing={isSyncing}
        isAdmin={true}
        onOpenAdminModal={() => {}}
        onLogoutAdmin={() => {
          setUserRole('landing');
          setCurrentView('dashboard');
          saveSession('landing');
        }}
      />

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Admin Tab 1: Statistik Permohonan */}
        {currentView === 'dashboard' && (
          <MainDashboard
            students={students}
            onNavigateTab={view => {
              setCurrentView(view);
              saveSession('admin', '', '', view);
            }}
            onOpenNewForm={() => {
              setCurrentView('form');
              saveSession('admin', '', '', 'form');
            }}
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
            onBack={() => {
              setCurrentView('status');
              saveSession('admin', '', '', 'status');
            }}
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
            lecturers={lecturers}
            config={config}
            onSaveMark={handleSaveEvaluationMark}
            onAssignLecturers={handleAssignLecturers}
          />
        )}

        {/* Admin Tab 4: Tetapan (Houses Maklumat Pensyarah, Maklumat Latihan, Maklumat Pelajar, Maklumat Syarikat) */}
        {(currentView === 'tetapan' || currentView === 'pensyarah' || currentView === 'config') && (
          <TetapanPanel
            students={students}
            lecturers={lecturers}
            config={config}
            appsScriptUrl={appsScriptUrl}
            onSaveLecturer={handleSaveLecturer}
            onDeleteLecturer={handleDeleteLecturer}
            onSaveStudent={async (studentData) => {
              await handleSaveStudentAsync(studentData);
            }}
            onDeleteStudent={handleDeleteStudent}
            onSaveConfig={updatedConfig => setConfig(updatedConfig)}
            onViewStudentDetail={student => {
              setSelectedStudent(student);
              setIsDetailModalOpen(true);
            }}
            initialSubTab={currentView === 'config' ? 'latihan' : currentView === 'pensyarah' ? 'pensyarah' : 'pensyarah'}
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
              Unit Perhubungan Industri &amp; Alumni | Kolej Komuniti Beaufort Sabah
            </p>
          </div>
          <button
            onClick={() => {
              setUserRole('landing');
              saveSession('landing');
            }}
            className="text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
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
