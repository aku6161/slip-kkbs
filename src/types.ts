export type ApplicationStatus = 
  | 'Belum Memohon'
  | 'Memohon'
  | 'Permohonan Dihantar' 
  | 'Belum Diterima'
  | 'Menunggu Jawapan' 
  | 'Diterima'
  | 'Lulus / Diterima' 
  | 'Ditolak' 
  | 'Dalam Semakan';

export type DocumentType = 'surat' | 'resume' | 'bjpli' | 'skop';

export const formatProgramName = (prog?: string): string => {
  if (!prog) return '';
  const up = prog.toUpperCase().trim();
  if (up.includes('KULINARI') || up === 'SKU') return 'SIJIL KULINARI';
  if (up.includes('PERHOTELAN') || up.includes('HOTEL') || up === 'SOP') return 'SIJIL OPERASI PERHOTELAN';
  if (up.includes('ELEKTRIK') || up === 'SKE' || up === 'STE') return 'SIJIL TEKNOLOGI ELEKTRIK';
  return up.replace(/\s*\([^)]*\)/g, '').trim();
};

/**
 * Format No Kad Pengenalan kepada format ID Malaysia standard: 000000-00-0000
 */
export const formatMalaysianIc = (val?: string): string => {
  if (!val) return '';
  let digits = String(val).replace(/\D/g, '');
  // Khas untuk kes kesilapan input di mana bulan 1 digit tertinggal angka sifar di hadapan (11 digit: cth 05906120320 -> 050906120320)
  if (digits.length === 11 && /^\d{2}[1-9]\d{8}$/.test(digits)) {
    digits = `${digits.substring(0, 2)}0${digits.substring(2)}`;
  }
  digits = digits.substring(0, 12);
  if (digits.length <= 6) return digits;
  if (digits.length <= 8) return `${digits.substring(0, 6)}-${digits.substring(6)}`;
  return `${digits.substring(0, 6)}-${digits.substring(6, 8)}-${digits.substring(8, 12)}`;
};

/**
 * Memastikan semua data yang dimasukkan dan disimpan dalam pangkalan data adalah HURUF BESAR
 * kecuali medan emel (huruf kecil) dan no kad pengenalan diformat standard ID Malaysia (000000-00-0000).
 */
export const sanitizeDataForDatabase = <T extends Record<string, any>>(data: T): T => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(item => (typeof item === 'object' && item !== null ? sanitizeDataForDatabase(item) : item)) as unknown as T;
  }

  const result: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      result[key] = value;
      continue;
    }

    const lowerKey = key.toLowerCase();

    // 1. Medan Emel: Sentiasa huruf kecil
    if (
      lowerKey.includes('emel') || 
      lowerKey.includes('email') || 
      lowerKey === 'companyemail'
    ) {
      result[key] = typeof value === 'string' ? value.trim().toLowerCase() : value;
      continue;
    }

    // 2. Medan No. Kad Pengenalan: Format ID Malaysia (000000-00-0000)
    if (
      lowerKey === 'noic' || 
      lowerKey === 'ic' || 
      lowerKey === 'nokp' || 
      lowerKey === 'nokadpengenalan'
    ) {
      result[key] = typeof value === 'string' ? formatMalaysianIc(value) : value;
      continue;
    }

    // 3. Medan URL atau ID teknikal / timestamp / status
    if (
      lowerKey.endsWith('url') || 
      lowerKey === 'id' || 
      lowerKey === 'staffid' ||
      lowerKey === 'timestamp' || 
      lowerKey === 'createdat' || 
      lowerKey === 'updatedat' ||
      lowerKey === 'migratedfromgooglesheetat' ||
      lowerKey === 'status'
    ) {
      if (lowerKey === 'staffid' && typeof value === 'string') {
        result[key] = value.trim().toUpperCase();
      } else {
        result[key] = value;
      }
      continue;
    }

    // 4. Objek bertingkat (seperti bjpliData)
    if (typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeDataForDatabase(value);
      continue;
    }

    // 5. Rentetan biasa: Tukar ke HURUF BESAR
    if (typeof value === 'string') {
      const trimmed = value.trim();
      // Kekalkan format nombor telefon
      if (lowerKey.includes('telefon') || lowerKey.includes('notel') || lowerKey.includes('phone')) {
        result[key] = trimmed;
      } else {
        result[key] = trimmed.toUpperCase();
      }
      continue;
    }

    result[key] = value;
  }

  return result as T;
};

export interface BJPLIFormData {
  keputusan: 'DITERIMA' | 'DITOLAK' | 'MEMERLUKAN_TEMUDUGA' | 'PENDING';
  namaPegawaiIndustri: string;
  jawatanPegawai: string;
  jabatan: string;
  noTelSyarikat: string;
  emelSyarikat: string;
  alamatSyarikat: string;
  elaunBulanan: string;
  kemudahanAsrama: boolean;
  kemudahanPengangkutan: boolean;
  kemudahanMakan: boolean;
  tarikhMulaDitetapkan: string;
  tarikhTamatDitetapkan: string;
  syaratTambahan: string;
  tarikhRespon: string;
}

export interface Student {
  id: string;
  timestamp: string;
  email: string;
  namaPelajar: string;
  noIc: string;
  noMatrik: string;
  program: string;
  sesi?: string;
  noTelefon: string;
  emelPelajar: string;
  alamat: string;
  namaSekolahMenengah: string;
  jawatanKkbs: string;
  programKkbs1: string;
  programKkbs2: string;
  programKkbs3: string;
  pencapaian1: string;
  pencapaian2: string;
  pencapaian3: string;
  namaPa: string;
  noTelefonPa: string;
  emelPa: string;
  emelHrSyarikat: string;
  namaSyarikat?: string;
  kelas?: string;
  status: ApplicationStatus;
  tarikhLatihanMula?: string;
  tarikhLatihanTamat?: string;
  tempohLatihan?: string;
  catatan?: string;
  rujukanSurat?: string;
  tarikhSurat?: string;
  bjpliData?: BJPLIFormData;
  // Pensyarah Penilai FLI 02 & FLI 03
  idPemantau1?: string;
  namaPemantau1?: string;
  idPemantau2?: string;
  namaPemantau2?: string;
}

export interface ScopeModule {
  id: string;
  kod: string;
  tajuk: string;
  penerangan: string;
  subTopik: string[];
  tempohMinggu: string;
  hasilPembelajaran: string[];
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  recommendations: string[];
  customCoverLetter?: string;
  tailoredResumeBullets?: string[];
  customScopeSuggestions?: string[];
  thinkingProcess?: string;
}

export interface SystemConfig {
  sesi: string;
  tarikh: string;
  tempoh: string;
  tarikhAkhirJawapan: string;
  namaPpia: string;
  noTelefonPpia: string;
  tarikhPemantauan?: string;
  tarikhPembentangan?: string;
  tarikhKeputusan?: string;
  appsScriptUrl?: string;
  lockedEvaluations?: Record<string, {
    fli02?: boolean;
    fli03?: boolean;
  }>;
}

export const isEvaluationLocked = (
  config: SystemConfig | undefined,
  session: string | undefined,
  type: 'fli02' | 'fli03'
): boolean => {
  if (!config?.lockedEvaluations || !session) return false;
  const cleanSession = session.toUpperCase().trim();
  const sessionLocks = config.lockedEvaluations[cleanSession];
  if (!sessionLocks) return false;
  return Boolean(sessionLocks[type]);
};

export interface Lecturer {
  id: string;
  nama: string;
  staffId: string;
  emel: string;
  program: string;
  noTelefon?: string;
  jawatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IndustryCompany {
  id: string;
  bil?: number | string;
  namaSyarikat: string;
  alamat1?: string;
  alamat2?: string;
  emelHr?: string;
  nomborTel?: string;
  elaun?: string;
  penginapan?: string;
  makan?: string;
  offday?: string | number;
  pengangkutan?: string;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlacementStudentInfo {
  namaPelajar: string;
  noMatrik: string;
  noIc: string;
  program: string;
  noTelefon?: string;
  emelPelajar?: string;
  status?: string;
}

export interface PlacementRecord {
  id: string;
  companyName: string;
  companyEmail: string;
  sesi: string;
  tarikhLi: string;
  tarikhMulaLi: string;
  studentMatriks: string[];
  students: PlacementStudentInfo[];
  rujukanSurat?: string;
  tarikhSurat?: string;
  alamatBaris1?: string;
  alamatBaris2?: string;
  letterGenerated: boolean;
  letterPdfUrl?: string;
  letterDownloadUrl?: string;
  letterFileId?: string;
  letterGeneratedAt?: string;
  emailSent: boolean;
  emailSentAt?: string;
  emailSentTo?: string;
  emailSentCc?: string;
  createdAt?: string;
  updatedAt?: string;
}

