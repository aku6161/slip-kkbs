import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { INITIAL_STUDENTS, SHEET_URL } from './src/data/initialData.js';
import { Student } from './src/types.js';

let __filename = '';
let __dirname = '';
try {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
  }
} catch (e) {
  // Fallback
}


const app = express();
app.use(express.json());

// In-memory data store seeded with initial students from Google Sheet
let studentsData: Student[] = [...INITIAL_STUDENTS];

// System configuration for Sesi, Tarikh, Tempoh
let systemConfig = {
  sesi: 'SESI I 2026/2027',
  tarikh: '30 NOVEMBER 2026 HINGGA 19 MAC 2027',
  tempoh: '4 BULAN (16 MINGGU)',
  tarikhAkhirJawapan: '15 OKTOBER 2026',
  namaPpia: 'SHAMSUDDIN BIN AMIN',
  noTelefonPpia: '012-2455616'
};

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper: Parse raw CSV text from Google Sheet robustly
function parseCsv(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cur += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cur.trim());
      cur = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(cur.trim());
      result.push(row);
      row = [];
      cur = '';
    } else {
      cur += char;
    }
  }
  
  if (row.length > 0 || cur.length > 0) {
    row.push(cur.trim());
    result.push(row);
  }
  
  return result;
}

function parseCsvToStudents(csvText: string): Student[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const parsedStudents: Student[] = [];
  // Skip header (index 0)
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length < 5) continue;

    const timestamp = cols[0] || '';
    const email = cols[1] || '';
    const sesi = cols[2] || '';
    const namaPelajar = cols[3] || '';
    const noIc = cols[4] || '';
    const noMatrik = cols[5] || '';
    const program = cols[6] || 'Sijil Operasi Perhotelan (SOP)';
    const noTelefon = cols[7] || '';
    const emelPelajar = cols[8] || email;
    const alamat = cols[9] || '';
    const namaSekolahMenengah = cols[10] || '';
    const jawatanKkbs = cols[11] || 'TIADA';
    const programKkbs1 = cols[12] || '';
    const programKkbs2 = cols[13] || '';
    const programKkbs3 = cols[14] || '';
    const pencapaian1 = cols[15] || '';
    const pencapaian2 = cols[16] || '';
    const pencapaian3 = cols[17] || '';
    const namaPa = cols[18] || 'NUR AZHARI BIN AZHARUDDIN';
    const noTelefonPa = cols[19] || '018-9744013';
    const emelPa = cols[20] || 'azhari@kkbeaufort.edu.my';
    const namaSyarikat = cols[21] || 'Syarikat Industri / Hotel';
    const emelHrSyarikat = cols[22] || '';

    let progCode = 'SOP';
    if (program.toUpperCase().includes('ELEKTRIK') || program.toUpperCase().includes('SKE') || program.toUpperCase().includes('TEKNOLOGI ELEKTRIK')) {
      progCode = 'SKE';
    } else if (program.toUpperCase().includes('KULINARI') || program.toUpperCase().includes('SKU')) {
      progCode = 'SKU';
    }

    const status = cols[23] || 'Belum Memohon';
    const bjpliStr = cols[24] || '';
    let bjpliData = undefined;
    if (bjpliStr) {
      try {
        bjpliData = JSON.parse(bjpliStr);
      } catch (e) {}
    }
    const rujukanSurat = cols[25] || `KKBS/LI/2026/${progCode}/${String(i).padStart(3, '0')}`;
    const tarikhSurat = cols[26] || '15 Mac 2026';

    const existing = studentsData.find(s => s.noMatrik === noMatrik || s.emelPelajar === emelPelajar);

    parsedStudents.push({
      id: existing ? existing.id : `SLIP-2026-${String(i).padStart(3, '0')}`,
      timestamp,
      email,
      sesi,
      namaPelajar,
      noIc,
      noMatrik,
      program: program || 'Sijil Operasi Perhotelan (SOP)',
      noTelefon,
      emelPelajar,
      alamat,
      namaSekolahMenengah,
      jawatanKkbs,
      programKkbs1,
      programKkbs2,
      programKkbs3,
      pencapaian1,
      pencapaian2,
      pencapaian3,
      namaPa,
      noTelefonPa,
      emelPa,
      emelHrSyarikat,
      namaSyarikat: existing?.namaSyarikat || namaSyarikat,
      status: existing?.status || status,
      rujukanSurat: existing?.rujukanSurat || rujukanSurat,
      tarikhSurat: existing?.tarikhSurat || tarikhSurat,
      tempohLatihan: '20 Minggu (5 Bulan)',
      tarikhLatihanMula: '2026-07-01',
      tarikhLatihanTamat: '2026-11-15',
      bjpliData: existing?.bjpliData || bjpliData
    });
  }
  return parsedStudents;
}

function mapAppsScriptToStudents(rawStudents: any[]): Student[] {
  return rawStudents.map((s, idx) => {
    const timestamp = s["Timestamp"] || '';
    const email = s["KELAS"] || '';
    const sesi = s["SESI LATIHAN INDUSTRI"] || '';
    const namaPelajar = s["NAMA PELAJAR"] || '';
    const noIc = s["NO. KAD PENGENALAN"] || '';
    const noMatrik = s["NO. MATRIK"] || '';
    const program = s["PROGRAM"] || 'Sijil Operasi Perhotelan (SOP)';
    const noTelefon = s["NO. TELEFON"] || '';
    const emelPelajar = s["EMEL PELAJAR"] || email;
    const alamat = s["ALAMAT"] || '';
    const namaSekolahMenengah = s["NAMA SEKOLAH MENENGAH"] || s["NAMA SEKOLAH MENENGAH "] || '';
    const jawatanKkbs = s["JAWATAN YANG PERNAH DISANDANG DI KKBS"] || 'TIADA';
    const programKkbs1 = s["PROGRAM 1 YANG PERNAH DIIKUTI DI KKBS"] || '';
    const programKkbs2 = s["PROGRAM 2 YANG PERNAH DIIKUTI DI KKBS"] || '';
    const programKkbs3 = s["PROGRAM 3 YANG PERNAH DIIKUTI DI KKBS"] || '';
    const pencapaian1 = s["PENCAPAIAN 1"] || '';
    const pencapaian2 = s["PENCAPAIAN 2"] || '';
    const pencapaian3 = s["PENCAPAIAN 3"] || '';
    const namaPa = s["NAMA PA"] || 'NUR AZHARI BIN AZHARUDDIN';
    const noTelefonPa = s["NO. TELEFON PA"] || '018-9744013';
    const emelPa = s["EMEL PA"] || 'azhari@kkbeaufort.edu.my';
    const namaSyarikat = s["NAMA INDUSTRI"] || 'Syarikat Industri / Hotel';
    const emelHrSyarikat = s["EMEL HR SYARIKAT YANG DIPILIH"] || '';
    const status = s["STATUS"] || 'Belum Memohon';
    
    const bjpliStr = s["BJPLI_DATA"] || '';
    let bjpliData = undefined;
    if (bjpliStr) {
      try {
        bjpliData = typeof bjpliStr === 'string' ? JSON.parse(bjpliStr) : bjpliStr;
      } catch (e) {}
    }
    
    let progCode = 'SOP';
    if (program.toUpperCase().includes('ELEKTRIK') || program.toUpperCase().includes('SKE') || program.toUpperCase().includes('TEKNOLOGI ELEKTRIK')) {
      progCode = 'SKE';
    } else if (program.toUpperCase().includes('KULINARI') || program.toUpperCase().includes('SKU')) {
      progCode = 'SKU';
    }
    
    const rujukanSurat = s["RUJUKAN_SURAT"] || `KKBS/LI/2026/${progCode}/${String(idx + 1).padStart(3, '0')}`;
    const tarikhSurat = s["TARIKH_SURAT"] || '15 Mac 2026';

    return {
      id: `SLIP-2026-${String(idx + 1).padStart(3, '0')}`,
      timestamp,
      email,
      sesi,
      namaPelajar,
      noIc,
      noMatrik,
      program,
      noTelefon,
      emelPelajar,
      alamat,
      namaSekolahMenengah,
      jawatanKkbs,
      programKkbs1,
      programKkbs2,
      programKkbs3,
      pencapaian1,
      pencapaian2,
      pencapaian3,
      namaPa,
      noTelefonPa,
      emelPa,
      namaSyarikat,
      emelHrSyarikat,
      status,
      tempohLatihan: '20 Minggu (5 Bulan)',
      tarikhLatihanMula: '2026-07-01',
      tarikhLatihanTamat: '2026-11-15',
      bjpliData,
      rujukanSurat,
      tarikhSurat
    };
  });
}

// API Routes

// 1. GET /api/students - Return student records
app.get('/api/students', async (req: Request, res: Response) => {
  const appsScriptUrl = getAppsScriptUrl(req);
  
  if (appsScriptUrl) {
    try {
      const scriptRes = await fetch(appsScriptUrl);
      if (scriptRes.ok) {
        const payload = await scriptRes.json();
        if (payload.success) {
          if (payload.students) {
            studentsData = mapAppsScriptToStudents(payload.students);
          }
          if (payload.config) {
            systemConfig = payload.config;
          }
          return res.json({ students: studentsData, config: systemConfig, sheetUrl: SHEET_URL });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch from Apps Script, falling back to CSV:', err);
    }
  }

  try {
    // Optionally sync from live Google Sheet CSV
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1E52qMDhPQjJES0q_QMRrxAW_bz27RABSDom7HFaMLJo/export?format=csv';
    const sheetRes = await fetch(csvUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (sheetRes.ok) {
      const csvText = await sheetRes.text();
      const fetchedStudents = parseCsvToStudents(csvText);
      if (fetchedStudents.length > 0) {
        // Merge with existing local state edits
        fetchedStudents.forEach(fs => {
          const idx = studentsData.findIndex(s => s.noMatrik === fs.noMatrik);
          if (idx === -1) {
            studentsData.push(fs);
          } else {
            // Keep status & bjpliData if modified locally
            studentsData[idx] = {
              ...fs,
              status: studentsData[idx].status,
              bjpliData: studentsData[idx].bjpliData || fs.bjpliData,
              namaSyarikat: studentsData[idx].namaSyarikat || fs.namaSyarikat
            };
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch live sheet, returning in-memory state:', err);
  }
  res.json({ students: studentsData, config: systemConfig, sheetUrl: SHEET_URL });
});

// GET /api/config - Get active system configuration
app.get('/api/config', (req: Request, res: Response) => {
  res.json(systemConfig);
});

// POST /api/config - Update active system configuration
app.post('/api/config', async (req: Request, res: Response) => {
  const newConfig = req.body;
  if (!newConfig.sesi || !newConfig.tarikh || !newConfig.tempoh || !newConfig.tarikhAkhirJawapan || !newConfig.namaPpia || !newConfig.noTelefonPpia) {
    return res.status(400).json({ error: 'Sesi, tarikh, tempoh, tarikh akhir jawapan, nama PPIA, dan no telefon PPIA adalah medan wajib.' });
  }

  systemConfig = {
    sesi: newConfig.sesi.toUpperCase(),
    tarikh: newConfig.tarikh.toUpperCase(),
    tempoh: newConfig.tempoh.toUpperCase(),
    tarikhAkhirJawapan: newConfig.tarikhAkhirJawapan.toUpperCase(),
    namaPpia: newConfig.namaPpia.toUpperCase(),
    noTelefonPpia: newConfig.noTelefonPpia.toUpperCase()
  };

  // Sync to Google Sheet via Google Apps Script Web App if URL is defined
  const appsScriptUrl = getAppsScriptUrl(req);
  if (appsScriptUrl) {
    try {
      await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_config', config: systemConfig })
      });
    } catch (err: any) {
      console.warn('Failed to sync config to Google Sheets via Apps Script:', err);
    }
  }

  res.json({ success: true, config: systemConfig, message: 'Tetapan latihan berjaya dikemas kini!' });
});

const getAppsScriptUrl = (req: Request) => {
  return (req.query.appsScriptUrl as string) || (req.body.appsScriptUrl as string) || (req.headers['x-apps-script-url'] as string) || process.env.APPS_SCRIPT_URL;
};

// 2. POST /api/students - Add new application
app.post('/api/students', async (req: Request, res: Response) => {
  const newStudentData = req.body;
  
  let progCode = 'SOP';
  const programStr = newStudentData.program || '';
  if (programStr.toUpperCase().includes('ELEKTRIK') || programStr.toUpperCase().includes('SKE') || programStr.toUpperCase().includes('TEKNOLOGI ELEKTRIK')) {
    progCode = 'SKE';
  } else if (programStr.toUpperCase().includes('KULINARI') || programStr.toUpperCase().includes('SKU')) {
    progCode = 'SKU';
  }

  const existingIdx = studentsData.findIndex(
    s => s.noIc === newStudentData.noIc || s.noMatrik === newStudentData.noMatrik
  );

  let studentToSave: Student;
  if (existingIdx !== -1) {
    studentToSave = {
      ...studentsData[existingIdx],
      ...newStudentData,
      status: newStudentData.status || 'Memohon',
      timestamp: new Date().toLocaleString()
    };
  } else {
    const newId = `SLIP-2026-${String(studentsData.length + 1).padStart(3, '0')}`;
    studentToSave = {
      ...newStudentData,
      id: newId,
      timestamp: new Date().toLocaleString(),
      status: newStudentData.status || 'Memohon',
      rujukanSurat: newStudentData.rujukanSurat || `KKBS/LI/2026/${progCode}/${String(studentsData.length + 1).padStart(3, '0')}`,
      tarikhSurat: newStudentData.tarikhSurat || new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }),
      tempohLatihan: '20 Minggu (5 Bulan)',
      tarikhLatihanMula: '2026-07-01',
      tarikhLatihanTamat: '2026-11-15'
    };
  }

  // Persist to Google Sheet via Google Apps Script Web App if URL is defined
  const appsScriptUrl = getAppsScriptUrl(req);
  if (!appsScriptUrl) {
    return res.status(400).json({ error: 'Konfigurasi URL Google Apps Script (APPS_SCRIPT_URL) tidak ditemui. Sila konfigurasikan di halaman Admin atau tetapan persekitaran pelayan (Vercel) untuk membolehkan penyimpanan data dan penghantaran emel.' });
  }

  let scriptResult: any = null;
  try {
    const scriptRes = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_student', student: studentToSave })
    });
    
    const responseText = await scriptRes.text();
    try {
      scriptResult = JSON.parse(responseText);
    } catch (e) {
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        return res.status(400).json({
          error: 'Sambungan Google Sheets Gagal (Pautan API Tidak Sah / Kebenaran Disekat). Sila pastikan tetapan "Who has access" adalah "Anyone" dan kod skrip telah di-authorize.'
        });
      }
      return res.status(400).json({ error: `Ralat respon Google Sheets: ${responseText.substring(0, 100)}` });
    }

    if (scriptResult && !scriptResult.success) {
      return res.status(400).json({ error: `Gagal menyimpan ke Google Sheets: ${scriptResult.error}` });
    }

    console.log('Saved to Google Sheets via Apps Script:', scriptResult);
  } catch (err: any) {
    console.error('Failed to write to Google Sheets via Apps Script:', err);
    return res.status(500).json({ error: `Ralat pelayan semasa menulis ke Google Sheets: ${err.message}` });
  }

  if (existingIdx !== -1) {
    studentsData[existingIdx] = studentToSave;
  } else {
    studentsData.unshift(studentToSave);
  }

  res.status(201).json({ 
    student: studentToSave, 
    message: scriptResult?.message || 'Permohonan berjaya ditambah/dikemaskini!',
    emailError: scriptResult?.emailError
  });
});

// 3. PUT /api/students/:id - Update student status or BJPLI data
app.put('/api/students/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = studentsData.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Pelajar tidak dijumpai' });
  }
  
  studentsData[idx] = {
    ...studentsData[idx],
    ...req.body
  };

  const updatedStudent = studentsData[idx];

  // Persist to Google Sheet via Google Apps Script Web App if URL is defined
  const appsScriptUrl = getAppsScriptUrl(req);
  if (!appsScriptUrl) {
    return res.status(400).json({ error: 'Konfigurasi URL Google Apps Script (APPS_SCRIPT_URL) tidak ditemui.' });
  }

  let scriptResult: any = null;
  try {
    const scriptRes = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_student',
        noMatrik: updatedStudent.noMatrik,
        status: updatedStudent.status,
        bjpliData: updatedStudent.bjpliData,
        rujukanSurat: updatedStudent.rujukanSurat,
        tarikhSurat: updatedStudent.tarikhSurat
      })
    });

    const responseText = await scriptRes.text();
    try {
      scriptResult = JSON.parse(responseText);
    } catch (e) {
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        return res.status(400).json({
          error: 'Sambungan Google Sheets Gagal (Pautan API Tidak Sah / Kebenaran Disekat). Sila pastikan tetapan "Who has access" adalah "Anyone" dan kod skrip telah di-authorize.'
        });
      }
      return res.status(400).json({ error: `Ralat respon Google Sheets: ${responseText.substring(0, 100)}` });
    }

    if (scriptResult && !scriptResult.success) {
      return res.status(400).json({ error: `Gagal mengemaskini Google Sheets: ${scriptResult.error}` });
    }

    console.log('Updated Google Sheets via Apps Script:', scriptResult);
  } catch (err: any) {
    console.error('Failed to update Google Sheets via Apps Script:', err);
    return res.status(500).json({ error: `Ralat pelayan semasa mengemaskini Google Sheets: ${err.message}` });
  }

  res.json({ 
    student: updatedStudent, 
    message: scriptResult?.message || 'Maklumat permohonan dikemaskini.',
    emailError: scriptResult?.emailError
  });
});

// 3.5. POST /api/send-email - Send cover letter / documents to HR via Apps Script
app.post('/api/send-email', async (req: Request, res: Response) => {
  const appsScriptUrl = getAppsScriptUrl(req);
  if (!appsScriptUrl) {
    return res.status(400).json({ error: 'Sila konfigurasikan Environment Variable APPS_SCRIPT_URL di dalam tetapan Vercel atau masukkan Pautan API di tetapan laman web.' });
  }

  try {
    const scriptRes = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_email',
        ...req.body
      })
    });
    const result = await scriptRes.json();
    if (result.success) {
      res.json({ success: true, message: 'Emel permohonan berjaya dihantar ke HR Industri!' });
    } else {
      res.status(500).json({ error: result.error || 'Gagal menghantar emel.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Ralat semasa menghubungi pelayan emel Google Apps Script.' });
  }
});


// 4. POST /api/ai/assist - Gemini AI feature for Cover Letter, Resume Enhancement & Thinking Mode
app.post('/api/ai/assist', async (req: Request, res: Response) => {
  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in server environment.' });
  }

  const { student, task, customPrompt, enableThinking } = req.body;

  try {
    let modelName = 'gemini-3.6-flash';
    let configObj: any = {};

    if (enableThinking) {
      modelName = 'gemini-3.1-pro-preview';
      configObj.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    let prompt = '';

    if (task === 'draft_cover_letter') {
      prompt = `
Anda adalah Pegawai Penasihat Akademik di Kolej Komuniti Beaufort Sabah (KKBS).
Tulis Surat Permohonan Latihan Industri rasmi dan profesional yang sangat berkesan dalam Bahasa Melayu.

Maklumat Pelajar:
- Nama: ${student.namaPelajar}
- No. Matrik: ${student.noMatrik}
- Program: ${student.program}
- Pencapaian Utama: ${student.pencapaian1}, ${student.pencapaian2}, ${student.pencapaian3}
- Penglibatan KKBS: ${student.programKkbs1}, ${student.programKkbs2}
- Syarikat Sasaran: ${student.namaSyarikat} (HR Email: ${student.emelHrSyarikat})
- Penasihat Akademik: ${student.namaPa} (${student.noTelefonPa})

Tuliskan perenggan permohonan yang meyakinkan pengurus HR untuk menerima pelajar ini bagi tempoh 20 minggu (1 Julai 2026 - 15 November 2026).
Sertakan sebab kenapa pelajar ini sangat sesuai untuk industri perhotelan mereka.
Formatkan jawapan dalam teks permohonan rasmi Bahasa Melayu yang sopan, teratur dan sedia untuk dicetak.
`;
    } else if (task === 'enhance_resume') {
      prompt = `
Sebagai pakar kerjaya industri perhotelan, analisis dan tingkatkan profil resume pelajar berikut:

Nama Pelajar: ${student.namaPelajar} (${student.program})
Pencapaian: ${student.pencapaian1}, ${student.pencapaian2}, ${student.pencapaian3}
Aktiviti KKBS: ${student.programKkbs1}, ${student.programKkbs2}, ${student.programKkbs3}
Jawatan: ${student.jawatanKkbs}

Sila berikan:
1. Ringkasan Profil Eksekutif (2-3 ayat) yang menekankan daya saing pelajar ini.
2. 5 Poin Kemahiran Utama & Kompetensi Perhotelan yang terperinci.
3. Cadangan tindakan untuk menyerlah semasa temuduga/latihan industri.
Formatkan dalam Bahasa Melayu yang kemas dan profesional.
`;
    } else if (task === 'tailor_scope') {
      prompt = `
Berdasarkan program ${student.program} dan syarikat sasaran ${student.namaSyarikat}, cadangkan penyesuaian Skop Latihan Industri (Training Syllabus) 20 Minggu.
Cadangkan modul-modul praktikal yang memberi keutamaan kepada piawaian perhotelan masa kini.
Formatkan secara teratur mengikut minggu dan hasil pembelajaran.
`;
    } else {
      prompt = customPrompt || `Sila berikan panduan permohonan latihan industri untuk pelajar ${student.namaPelajar}.`;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: configObj
    });

    res.json({
      result: response.text,
      modelUsed: modelName,
      thinkingUsed: !!enableThinking
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: err.message || 'Gagal memproses permintaan AI' });
  }
});

// Vite Middleware & Static Serving Setup
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SLIP Server is running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

