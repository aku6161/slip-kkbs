import { Student, ScopeModule, Lecturer } from '../types';

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1E52qMDhPQjJES0q_QMRrxAW_bz27RABSDom7HFaMLJo/edit?usp=sharing';

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_LECTURERS: Lecturer[] = [
  {
    id: 'lec_kkbs_003',
    nama: 'SHAMSUDDIN BIN AMIN',
    staffId: 'KKBS/003',
    emel: 'shamsuddin@kkbs.edu.my',
    program: 'UNIT PERHUBUNGAN INDUSTRI & ALUMNI (UPLI)',
    noTelefon: '012-2455616',
    jawatan: 'PEGAWAI PERHUBUNGAN INDUSTRI & ALUMNI'
  },
  {
    id: 'lec_kkbs_016',
    nama: 'NUR AZHARI BIN AZHARUDDIN',
    staffId: 'KKBS/016',
    emel: 'azhari@kkbs.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    noTelefon: '019-8765432',
    jawatan: 'PENSYARAH / PENASIHAT AKADEMIK'
  },
  {
    id: 'lec_kkbs_022',
    nama: 'MUHAMMAD SYAFIQ BIN ABDULLAH',
    staffId: 'KKBS/022',
    emel: 'syafiq@kkbs.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    noTelefon: '013-1234567',
    jawatan: 'PENSYARAH / PENASIHAT AKADEMIK'
  },
  {
    id: 'lec_kkbs_035',
    nama: 'SITI NORAINI BINTI HASSAN',
    staffId: 'KKBS/035',
    emel: 'noraini@kkbs.edu.my',
    program: 'SIJIL KULINARI',
    noTelefon: '014-9876543',
    jawatan: 'PENSYARAH / PENASIHAT AKADEMIK'
  },
  {
    id: 'lec_kkbs_049',
    nama: 'AHMAD FAIZAL BIN ISMAIL',
    staffId: 'KKBS/049',
    emel: 'faizal@kkbs.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    noTelefon: '011-23456789',
    jawatan: 'PENSYARAH PEMANTAU'
  }
];

export const STANDARD_SOP_SCOPES: ScopeModule[] = [
  {
    id: 'm1',
    kod: 'SOP 101',
    tajuk: 'Modul 1: Operasi Pejabat Depan (Front Office Operations)',
    penerangan: 'Melatih pelajar dalam perkhidmatan kaunter hadapan hotel, pendaftaran tetamu, dan pengurusan pertanyaan pelanggan secara profesional.',
    tempohMinggu: 'Minggu 1 - 4 (4 Minggu)',
    subTopik: [
      'Prosedur Daftar Masuk (Check-in) & Daftar Keluar (Check-out) Tetamu',
      'Pengurusan Sistem Tempahan Bilik (Property Management System - PMS)',
      'Pengendalian Panggilan Telefon & Khidmat Pesanan Tetamu',
      'Etika Perkhidmatan Pelanggan & Pengurusan Sikap Mesra Tetamu'
    ],
    hasilPembelajaran: [
      'Pelajar mampu mengendalikan kaunter hadapan dengan yakin dan ramah',
      'Pelajar menguasai operasi Property Management System (PMS)'
    ]
  },
  {
    id: 'm2',
    kod: 'SOP 102',
    tajuk: 'Modul 2: Operasi Pengemasan (Housekeeping Operations)',
    penerangan: 'Pendedahan kepada kemasan bilik hotel, penyediaan katil (bed making), sanitasi bilik tetamu, serta pengurusan dobi (laundry).',
    tempohMinggu: 'Minggu 5 - 8 (4 Minggu)',
    subTopik: [
      'Teknik Pembersihan Bilik & Sanitasi Tandas Bilik Tetamu',
      'Bed Making (Kemasan Katil mengikut Standard Industri / Hotel)',
      'Pengendalian Bahan Kimia Pembersihan & Prosedur Keselamatan',
      'Pengurusan Kain Cadar (Linen Control) & Operasi Laundry'
    ],
    hasilPembelajaran: [
      'Pelajar cekap mengemas bilik mengikut jangka masa standard hotel',
      'Pelajar faham keselamatan pengendalian bahan kimia pencuci'
    ]
  },
  {
    id: 'm3',
    kod: 'SOP 103',
    tajuk: 'Modul 3: Perkhidmatan Makanan & Minuman (F&B Service & Banquet)',
    penerangan: 'Melatih pelajar dalam persediaan restoran, susunan meja makan (table setting), perkhidmatan hidangan, dan pengurusan majlis bankuet.',
    tempohMinggu: 'Minggu 9 - 13 (5 Minggu)',
    subTopik: [
      'Persediaan Restoran, Table Setting (Fine Dining & Buffet Style)',
      'Teknik Pengambilan Pesanan & Perkhidmatan Makanan/Minuman',
      'Pengendalian Perkhidmatan Bankuet, Perkahwinan & Seminar',
      'Penyediaan Minuman Asas & Kemahiran Cashiering Restoran'
    ],
    hasilPembelajaran: [
      'Pelajar dapat memberikan perkhidmatan F&B mengikut SOP industri',
      'Pelajar berpengalaman mengendalikan majlis berskala besar'
    ]
  },
  {
    id: 'm4',
    kod: 'SOP 104',
    tajuk: 'Modul 4: Kebersihan Makanan & Keselamatan Industri (Food Safety & Hygiene)',
    penerangan: 'Penerapan amalan keselamatan makanan HACCP, pengendalian makanan berwaspada, dan amalan Kesihatan Pekerjaan (OSHA).',
    tempohMinggu: 'Minggu 14 - 17 (4 Minggu)',
    subTopik: [
      'Prinsip HACCP & Pengendalian Makanan Selamat',
      'Pembersihan Peralatan Dapur & Kawalan Suhu Simpanan Makanan',
      'Langkah Keselamatan Kebakaran & Pertolongan Cemas Asas',
      'Pengurusan Sisa Makanan & Kelestarian Hijau Hotel'
    ],
    hasilPembelajaran: [
      'Pelajar memegang Sijil Pengendali Makanan dan mengamalkan keselamatan tinggi'
    ]
  },
  {
    id: 'm5',
    kod: 'SOP 105',
    tajuk: 'Modul 5: Etika Profesionalisme & Kepimpinan (Professional Ethics & Soft Skills)',
    penerangan: 'Pengukuhan disiplin, ketepatan masa, komunikasi korporat, serta persediaan memasuki alam pekerjaan sebenar.',
    tempohMinggu: 'Minggu 18 - 20 (3 Minggu)',
    subTopik: [
      'Komunikasi Profesional Bahasa Melayu & Bahasa Inggeris Industri',
      'Pengurusan Masa, Disiplin & Penampilan Diri Grooming Hotel',
      'Kerja Berpasukan, Kepimpinan Asas & Penyelesaian Masalah',
      'Penyediaan Laporan Akhir Latihan Industri'
    ],
    hasilPembelajaran: [
      'Pelajar bersedia sepenuhnya menjadi tenaga kerja profesional perhotelan'
    ]
  }
];
