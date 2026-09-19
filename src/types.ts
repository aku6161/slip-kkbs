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
}

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
