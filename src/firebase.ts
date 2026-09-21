import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { Student, SystemConfig, Lecturer, IndustryCompany } from './types';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCkFiFWw5Ws98wg0hAGLL9Bcjy1lWV7W58",
  authDomain: "gen-lang-client-0270916732.firebaseapp.com",
  projectId: "gen-lang-client-0270916732",
  storageBucket: "gen-lang-client-0270916732.firebasestorage.app",
  messagingSenderId: "343211370533",
  appId: "1:343211370533:web:b7ef316cb4e78a15a6f7cc"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Collections
export const STUDENTS_COLLECTION = 'students';
export const MARKAH_COLLECTION = 'markah';
export const CONFIG_COLLECTION = 'config';
export const LECTURERS_COLLECTION = 'lecturers';
export const COMPANIES_COLLECTION = 'companies';

export function removeUndefined<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
}

/**
 * Real-time listener for companies collection
 */
export function subscribeCompanies(callback: (companies: IndustryCompany[]) => void, onError?: (error: Error) => void) {
  const q = query(collection(db, COMPANIES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const list: IndustryCompany[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as IndustryCompany);
    });
    callback(list);
  }, (err) => {
    console.error('Firestore companies subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Save or update a company in Firestore
 */
export async function saveCompanyToFirebase(company: Partial<IndustryCompany>): Promise<void> {
  const docId = company.id || `comp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const data = removeUndefined({ ...company, id: docId, updatedAt: new Date().toISOString() });
  await setDoc(doc(db, COMPANIES_COLLECTION, docId), data, { merge: true });
}

/**
 * Delete a company from Firestore
 */
export async function deleteCompanyFromFirebase(companyId: string): Promise<void> {
  await deleteDoc(doc(db, COMPANIES_COLLECTION, companyId));
}

/**
 * Real-time listener for lecturers collection
 */
export function subscribeLecturers(callback: (lecturers: any[]) => void, onError?: (error: Error) => void) {
  const q = query(collection(db, LECTURERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    callback(list);
  }, (err) => {
    console.error('Firestore lecturers subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Save or update a lecturer in Firestore
 */
export async function saveLecturerToFirebase(lecturer: any): Promise<void> {
  const docId = lecturer.id || lecturer.staffId?.replace(/[\/\s]/g, '_') || `lecturer_${Date.now()}`;
  const data = removeUndefined({ ...lecturer, id: docId, updatedAt: new Date().toISOString() });
  await setDoc(doc(db, LECTURERS_COLLECTION, docId), data, { merge: true });
}

/**
 * Delete a lecturer from Firestore
 */
export async function deleteLecturerFromFirebase(lecturerId: string): Promise<void> {
  await deleteDoc(doc(db, LECTURERS_COLLECTION, lecturerId));
}

/**
 * Real-time listener for students collection
 */
export function subscribeStudents(callback: (students: Student[]) => void, onError?: (error: Error) => void) {
  const q = query(collection(db, STUDENTS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const list: Student[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data() as Student);
    });
    callback(list);
  }, (err) => {
    console.error('Firestore students subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Save or update a student in Firestore
 */
export async function saveStudentToFirebase(student: Student): Promise<void> {
  // Use student.id or clean noMatrik as the document ID
  const docId = student.id || student.noMatrik?.replace(/\//g, '_') || `student_${Date.now()}`;
  const studentWithId = removeUndefined({ ...student, id: docId, updatedAt: new Date().toISOString() });
  await setDoc(doc(db, STUDENTS_COLLECTION, docId), studentWithId, { merge: true });
}

/**
 * Delete a student from Firestore
 */
export async function deleteStudentFromFirebase(studentId: string): Promise<void> {
  await deleteDoc(doc(db, STUDENTS_COLLECTION, studentId));
}

/**
 * Real-time listener for system configuration
 */
export function subscribeSystemConfig(callback: (config: SystemConfig) => void, onError?: (error: Error) => void) {
  const configDocRef = doc(db, CONFIG_COLLECTION, 'system');
  return onSnapshot(configDocRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as SystemConfig);
    }
  }, (err) => {
    console.error('Firestore config subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Save or update system configuration in Firestore
 */
export async function saveSystemConfigToFirebase(config: SystemConfig): Promise<void> {
  await setDoc(doc(db, CONFIG_COLLECTION, 'system'), config, { merge: true });
}

/**
 * Real-time listener for markah (lecturer evaluation marks)
 */
export function subscribeMarkah(callback: (markah: any[]) => void, onError?: (error: Error) => void) {
  const q = query(collection(db, MARKAH_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    snapshot.forEach((docSnap) => {
      list.push(docSnap.data());
    });
    callback(list);
  }, (err) => {
    console.error('Firestore markah subscription error:', err);
    if (onError) onError(err);
  });
}

/**
 * Save lecturer marks / evaluation for a student
 */
export async function saveMarkahToFirebase(noMatrik: string, markData: any): Promise<void> {
  const docId = noMatrik.replace(/\//g, '_').trim();
  const dataToSave = {
    ...markData,
    noMatrik,
    updatedAt: new Date().toISOString()
  };
  await setDoc(doc(db, MARKAH_COLLECTION, docId), dataToSave, { merge: true });
}

/**
 * Initial Seeding: Seeds initial students, config, lecturers & companies if Firestore is empty
 */
export async function seedFirebaseIfEmpty(
  initialStudents: Student[], 
  initialConfig: SystemConfig, 
  initialLecturers?: any[],
  initialCompanies?: IndustryCompany[]
): Promise<void> {
  try {
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLLECTION));
    if (studentsSnap.empty && initialStudents.length > 0) {
      console.log('Seeding initial students to Firestore...');
      const batch = writeBatch(db);
      for (const student of initialStudents) {
        const docId = student.id || student.noMatrik?.replace(/\//g, '_') || `student_${Math.random()}`;
        const ref = doc(db, STUDENTS_COLLECTION, docId);
        batch.set(ref, { ...student, id: docId });
      }
      await batch.commit();
      console.log(`Successfully seeded ${initialStudents.length} students to Firestore.`);
    }

    const configDoc = await getDoc(doc(db, CONFIG_COLLECTION, 'system'));
    if (!configDoc.exists()) {
      console.log('Seeding initial config to Firestore...');
      await setDoc(doc(db, CONFIG_COLLECTION, 'system'), initialConfig);
    }

    if (initialLecturers && initialLecturers.length > 0) {
      const lecturersSnap = await getDocs(collection(db, LECTURERS_COLLECTION));
      if (lecturersSnap.size < initialLecturers.length) {
        console.log('Seeding official registered lecturers to Firestore...');
        const batch = writeBatch(db);
        for (const lecturer of initialLecturers) {
          const docId = lecturer.id || lecturer.staffId?.replace(/[\/\s]/g, '_') || `lecturer_${Math.random()}`;
          const ref = doc(db, LECTURERS_COLLECTION, docId);
          batch.set(ref, { ...lecturer, id: docId }, { merge: true });
        }
        await batch.commit();
      }
    }

    if (initialCompanies && initialCompanies.length > 0) {
      const companiesSnap = await getDocs(collection(db, COMPANIES_COLLECTION));
      if (companiesSnap.empty || companiesSnap.size < 5) {
        console.log('Seeding registered industry companies to Firestore...');
        const batch = writeBatch(db);
        for (const comp of initialCompanies) {
          const docId = comp.id || `comp_${comp.bil || Math.random()}`;
          const ref = doc(db, COMPANIES_COLLECTION, docId);
          batch.set(ref, { ...comp, id: docId }, { merge: true });
        }
        await batch.commit();
        console.log(`Successfully seeded ${initialCompanies.length} companies to Firestore.`);
      }
    }
  } catch (err) {
    console.warn('Firestore initial seeding note/warning:', err);
  }
}
