import { Student, ScopeModule, Lecturer } from '../types';

export const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1E52qMDhPQjJES0q_QMRrxAW_bz27RABSDom7HFaMLJo/edit?usp=sharing';

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_LECTURERS: Lecturer[] = [
  {
    id: 'lec_kkbs_022',
    nama: 'REZIELLA BINTI LAHAJI',
    staffId: 'KKBS/022',
    emel: 'reziella.lahaji@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_003',
    nama: 'SHAMSUDDIN BIN AMIN',
    staffId: 'KKBS/003',
    emel: 'shamsuddin.amin@kkbeaufort.edu.my',
    program: 'PEGAWAI PERHUBUNGAN INDUSTRI DAN ALUMNI',
    noTelefon: '012-2455616',
    jawatan: 'PEGAWAI PERHUBUNGAN INDUSTRI DAN ALUMNI'
  },
  {
    id: 'lec_kkbs_010',
    nama: 'LENNY MELON',
    staffId: 'KKBS/010',
    emel: 'lenny.melon@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_029',
    nama: 'NORFAZIRAH BINTI KUSIN',
    staffId: 'KKBS/029',
    emel: 'norfazirah@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_020',
    nama: 'MOHD YUSOF BIN YAAKOB',
    staffId: 'KKBS/020',
    emel: 'yusof.yaakob@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_009',
    nama: 'MOHD FIKRI BIN MURSHIDI',
    staffId: 'KKBS/009',
    emel: 'fikri.murshidi@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_053',
    nama: 'ERMINEYANTI BINTI BACHTERAN',
    staffId: 'KKBS/053',
    emel: 'ermineyanti@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_004',
    nama: 'NURHAYATI BINTI HASSAN',
    staffId: 'KKBS/004',
    emel: 'nurhayati_hassan@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_044',
    nama: 'RADHIYAH MARDHIYYAH BINTI MD SHUKRI',
    staffId: 'KKBS/044',
    emel: 'mardhiyyahshukri@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_054',
    nama: 'JEANY AMBROSE',
    staffId: 'KKBS/054',
    emel: 'jeany.ambrose@kkbeaufort.edu.my',
    program: 'SIJIL KULINARI',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_013',
    nama: 'NURUL AIDILA SURAYA BINTI JAPRI',
    staffId: 'KKBS/013',
    emel: 'surayajapri@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_018',
    nama: "UMMU 'AMMARAH BINTI ABDUL HALIM",
    staffId: 'KKBS/018',
    emel: 'ummu.ammarah@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_027',
    nama: 'NUR AZHARI BIN AZHARUDDIN',
    staffId: 'KKBS/027',
    emel: 'azhari@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_030',
    nama: 'NURUL HAYATI BINTI ABDUL HAMID',
    staffId: 'KKBS/030',
    emel: 'nurulhayati@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_043',
    nama: 'WASTI DOMINIC',
    staffId: 'KKBS/043',
    emel: 'wasti@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_042',
    nama: 'NUR KHAIRONISA BINTI WET',
    staffId: 'KKBS/042',
    emel: 'khaironisa@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_051',
    nama: 'JUNAINAH BT JUSTIN @ JOHARI',
    staffId: 'KKBS/051',
    emel: 'junainahjustin@kkbeaufort.edu.my',
    program: 'SIJIL OPERASI PERHOTELAN',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_016',
    nama: 'CHRISTOPER BIN ASOK',
    staffId: 'KKBS/016',
    emel: 'christoper.asok@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_040',
    nama: 'SHALIZAN BIN KADIR',
    staffId: 'KKBS/040',
    emel: 'shalizan@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_028',
    nama: 'MUHAMMAD ABDUL HAQ BIN AZIZ',
    staffId: 'KKBS/028',
    emel: 'mhaq@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_048',
    nama: 'MUHAMMAD FARIS BIN HAMDANI',
    staffId: 'KKBS/048',
    emel: 'faris@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_047',
    nama: 'GRACE JENNIFER PHILIP',
    staffId: 'KKBS/047',
    emel: 'grace@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_045',
    nama: 'NUR SYAFIQAH BINTI MOHD ROBI',
    staffId: 'KKBS/045',
    emel: 'nursyafiqah@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_046',
    nama: 'AHMAD KHUDRI BIN SHAMSUDDIN',
    staffId: 'KKBS/046',
    emel: 'ahmad_khudri@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
  },
  {
    id: 'lec_kkbs_049',
    nama: 'Ts. HAIDIE BIN INUN',
    staffId: 'KKBS/049',
    emel: 'haidie@kkbeaufort.edu.my',
    program: 'SIJIL TEKNOLOGI ELEKTRIK',
    jawatan: 'PENSYARAH'
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
