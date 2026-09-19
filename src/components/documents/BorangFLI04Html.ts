/**
 * Generates a full HTML string for the Borang FLI 04 (Rumusan Penilaian Latihan Industri) print document.
 * Optimized to fit strictly on a single A4 page.
 */
export function renderBorangFLI04Html(row: any, config?: any): string {
  const getVal = (key: string, fallback = ''): string => {
    return row[key] !== undefined && row[key] !== null ? row[key].toString() : fallback;
  };

  const getMatrik = (): string => {
    return row['No. Pendaftaran'] || row['NO. MATRIK'] || row['NO MATRIK'] || row['NO PENDAFTARAN'] || row['noMatrik'] || '';
  };

  const getNama = (): string => {
    return row['NAMA PELAJAR'] || row['NAMA'] || row['namaPelajar'] || '';
  };

  const getProgram = (): string => {
    return row['Program'] || row['PROGRAM'] || row['program'] || '';
  };

  const getKelas = (): string => {
    return row['Kelas'] || row['KELAS'] || row['kelas'] || '';
  };

  const getSesi = (): string => {
    return row['SESI'] || row['SESI '] || row['sesi'] || (config?.sesi) || 'SESI I 2026/2027';
  };

  // Helper for 2 decimal places
  const f2 = (val: number | string): string => {
    const num = parseFloat(String(val)) || 0;
    return num.toFixed(2);
  };

  // Helper for CCMS [(Markah / Pemberat) * 100]
  const calcCCMS = (mark: number | string, weight: number): string => {
    const m = parseFloat(String(mark)) || 0;
    if (!weight || weight <= 0) return '0.00';
    return ((m / weight) * 100).toFixed(2);
  };

  // FLI 01 Breakdown
  const a1 = parseFloat(getVal('TOTAL1', getVal('fli01_a1_pct', '0'))) || 0;
  const a2 = parseFloat(getVal('TOTAL2', getVal('fli01_a2_pct', '0'))) || 0;
  const a3 = parseFloat(getVal('TOTAL3', getVal('fli01_a3_pct', '0'))) || 0;
  const a4 = parseFloat(getVal('TOTAL4', getVal('fli01_a4_pct', '0'))) || 0;
  const a5 = parseFloat(getVal('TOTAL5', getVal('fli01_a5_pct', '0'))) || 0;
  const b1 = parseFloat(getVal('TOTAL6', getVal('fli01_b_pct', '0'))) || 0;
  const total_fli01 = parseFloat(getVal('GRAND TOTAL1', (a1 + a2 + a3 + a4 + a5 + b1).toFixed(2))) || (a1 + a2 + a3 + a4 + a5 + b1);

  // FLI 02 Breakdown
  const c1 = parseFloat(getVal('TOTAL7', getVal('fli02_c1_pct', '0'))) || 0;
  const c2 = parseFloat(getVal('TOTAL8', getVal('fli02_c2_pct', '0'))) || 0;
  const c3 = parseFloat(getVal('TOTAL9', getVal('fli02_c3_pct', '0'))) || 0;
  const total_fli02 = parseFloat(getVal('GRAN TOTAL2', (c1 + c2 + c3).toFixed(2))) || (c1 + c2 + c3);

  // FLI 03 Breakdown
  const d1 = parseFloat(getVal('TOTAL10', getVal('fli03_d1_pct', '0'))) || 0;
  const d2 = parseFloat(getVal('TOTAL11', getVal('fli03_d2_pct', '0'))) || 0;
  const total_fli03 = parseFloat(getVal('GRAND TOTAL3', (d1 + d2).toFixed(2))) || (d1 + d2);

  // FLI 04 Total
  const grand_total = parseFloat((total_fli01 + total_fli02 + total_fli03).toFixed(2));

  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rumusan Penilaian FLI 04 - ${getNama()}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9px;
      color: #0f172a;
      background: white;
      padding: 10px 20px;
      line-height: 1.25;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      @page { 
        margin: 8mm 14mm 8mm 14mm; 
        size: A4 portrait; 
      }
    }
    table { border-collapse: collapse; width: 100%; }
    td, th { padding: 2.5px 5px; vertical-align: middle; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 4px; margin-bottom: 4px; }
    .header-text h1 { font-size: 10.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px; }
    .header-text p { font-size: 8px; font-weight: 600; color: #334155; }
    .doc-code { font-size: 8.5px; font-family: monospace; font-weight: 800; border: 1px solid #334155; padding: 2px 6px; border-radius: 2px; }
    .title-banner { text-align: center; background: #0f172a; color: white; padding: 3px; border-radius: 3px; margin-bottom: 4px; }
    .title-banner h2 { font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-table td { padding: 2px 4px; font-size: 8.5px; }
    .info-label { font-weight: 700; color: #475569; width: 18%; text-transform: uppercase; }
    .info-val { font-weight: 700; color: #0f172a; width: 32%; }
    .summary-table { border: 1.2px solid #0f172a; margin-top: 4px; }
    .summary-table th { background: #0f172a; color: white; font-weight: 800; font-size: 8px; text-transform: uppercase; border: 1px solid #334155; text-align: center; padding: 3px 4px; }
    .summary-table td { border: 1px solid #cbd5e1; font-size: 8.5px; }
    .section-head { background: #e2e8f0; font-weight: 800; text-transform: uppercase; font-size: 8px; color: #0f172a; }
    .subtotal-row { background: #f1f5f9; font-weight: 800; }
    .grand-total-row { background: #0f172a; color: white; font-weight: 900; font-size: 10px; }
    .sig-section { margin-top: 10px; page-break-inside: avoid; font-size: 9px; }
    .sig-line { margin-top: 32px; border-bottom: 1px solid #0f172a; width: 220px; }
  </style>
</head>
<body>

  <!-- No-print Top Bar -->
  <div class="no-print" style="background:#0f172a;color:white;padding:8px 15px;margin:-10px -20px 10px -20px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <span style="font-weight:800;font-size:11px;">📊 Pratinjau Rumusan Penilaian Latihan Industri (FLI 04)</span>
      <span style="font-size:9.5px;color:#94a3b8;margin-left:8px;">${getNama()} (${getMatrik()})</span>
    </div>
    <button onclick="window.print()" style="background:#2563eb;color:white;border:none;padding:5px 14px;border-radius:4px;font-weight:700;cursor:pointer;font-size:10px;">
      🖨️ Cetak Borang (1 Halaman A4)
    </button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="header-text">
      <h1>KOLEJ KOMUNITI BEAUFORT SABAH</h1>
      <p>UNIT PERHUBUNGAN INDUSTRI &amp; ALUMNI (UPLI) | KEMENTERIAN PENDIDIKAN TINGGI</p>
    </div>
    <div class="doc-code">FLI 04</div>
  </div>

  <!-- Title Banner -->
  <div class="title-banner">
    <h2>RUMUSAN PENILAIAN LATIHAN INDUSTRI (FLI 04)</h2>
  </div>

  <!-- Student Info Table -->
  <table class="info-table" style="border:1px solid #cbd5e1;margin-bottom:4px;background:#f8fafc;">
    <tr>
      <td class="info-label">Kod &amp; Nama Kursus:</td>
      <td class="info-val">SUT40078 - LATIHAN INDUSTRI</td>
      <td class="info-label">Sesi Pengajian:</td>
      <td class="info-val">${getSesi()}</td>
    </tr>
    <tr>
      <td class="info-label">Nama Pelajar:</td>
      <td class="info-val" style="font-weight:900;">${getNama() || '-'}</td>
      <td class="info-label">No. Pendaftaran:</td>
      <td class="info-val" style="font-family:monospace;font-weight:900;">${getMatrik() || '-'}</td>
    </tr>
    <tr>
      <td class="info-label">Program Pengajian:</td>
      <td class="info-val">${getProgram() || '-'}</td>
      <td class="info-label">Kelas:</td>
      <td class="info-val">${getKelas() || '-'}</td>
    </tr>
  </table>

  <!-- Summary Table with [CCMS] Column -->
  <table class="summary-table">
    <thead>
      <tr>
        <th style="width:4%;">Bil</th>
        <th style="width:39%;text-align:left;">Kriteria Penilaian</th>
        <th style="width:7%;">CLO</th>
        <th style="width:11%;">Pemberat</th>
        <th style="width:16%;">Markah (%)</th>
        <th style="width:23%;">CCMS [Markah (%)/pemberat*100]</th>
      </tr>
    </thead>
    <tbody>
      <!-- Section 1: PENILAIAN INDUSTRI -->
      <tr class="section-head">
        <td colspan="6" style="padding:2.5px 6px;font-weight:900;">1. PENILAIAN INDUSTRI (FLI 01)</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:700;">
        <td colspan="6" style="padding:2px 6px;color:#334155;font-size:8px;">BAHAGIAN A: PENILAIAN PRESTASI (50%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Kemahiran di tempat kerja</td>
        <td style="text-align:center;font-weight:700;">1</td>
        <td style="text-align:center;">30%</td>
        <td style="text-align:center;font-weight:700;">${f2(a1)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(a1, 30)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>Komunikasi berkesan</td>
        <td style="text-align:center;font-weight:700;">2</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(a2)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(a2, 5)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">3</td>
        <td>Kerja berpasukan dan tanggungjawab</td>
        <td style="text-align:center;font-weight:700;">3</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(a3)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(a3, 5)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">4</td>
        <td>Kemahiran personal</td>
        <td style="text-align:center;font-weight:700;">4</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(a4)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(a4, 5)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">5</td>
        <td>Nilai, etika dan profesionalisme</td>
        <td style="text-align:center;font-weight:700;">5</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(a5)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(a5, 5)}</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:700;">
        <td colspan="6" style="padding:2px 6px;color:#334155;font-size:8px;">BAHAGIAN B: BUKU LOG LI (10%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Kemahiran di tempat kerja</td>
        <td style="text-align:center;font-weight:700;">1</td>
        <td style="text-align:center;">10%</td>
        <td style="text-align:center;font-weight:700;">${f2(b1)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(b1, 10)}</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="3" style="text-align:right;font-weight:900;">JUMLAH PENILAIAN INDUSTRI (FLI 01):</td>
        <td style="text-align:center;font-weight:900;">60%</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;">${f2(total_fli01)}</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;font-family:monospace;">${calcCCMS(total_fli01, 60)}</td>
      </tr>

      <!-- Section 2: PENILAIAN PEMANTAUAN -->
      <tr class="section-head">
        <td colspan="6" style="padding:2.5px 6px;font-weight:900;">2. PENILAIAN PEMANTAUAN (FLI 02)</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:700;">
        <td colspan="6" style="padding:2px 6px;color:#334155;font-size:8px;">BAHAGIAN C: TEMUBUAL (20%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Komunikasi lisan</td>
        <td style="text-align:center;font-weight:700;">2</td>
        <td style="text-align:center;">10%</td>
        <td style="text-align:center;font-weight:700;">${f2(c1)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(c1, 10)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>Kerja berpasukan dan tanggungjawab</td>
        <td style="text-align:center;font-weight:700;">3</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(c2)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(c2, 5)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">3</td>
        <td>Kemahiran personal</td>
        <td style="text-align:center;font-weight:700;">4</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(c3)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(c3, 5)}</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="3" style="text-align:right;font-weight:900;">JUMLAH PENILAIAN PEMANTAUAN (FLI 02):</td>
        <td style="text-align:center;font-weight:900;">20%</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;">${f2(total_fli02)}</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;font-family:monospace;">${calcCCMS(total_fli02, 20)}</td>
      </tr>

      <!-- Section 3: PENILAIAN LAPORAN AKHIR -->
      <tr class="section-head">
        <td colspan="6" style="padding:2.5px 6px;font-weight:900;">3. PENILAIAN LAPORAN AKHIR (FLI 03)</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:700;">
        <td colspan="6" style="padding:2px 6px;color:#334155;font-size:8px;">BAHAGIAN D: LAPORAN AKHIR (20%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Kemahiran di tempat kerja</td>
        <td style="text-align:center;font-weight:700;">1</td>
        <td style="text-align:center;">15%</td>
        <td style="text-align:center;font-weight:700;">${f2(d1)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(d1, 15)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>Komunikasi bertulis</td>
        <td style="text-align:center;font-weight:700;">2</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:700;">${f2(d2)}</td>
        <td style="text-align:center;font-weight:700;font-family:monospace;">${calcCCMS(d2, 5)}</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="3" style="text-align:right;font-weight:900;">JUMLAH PENILAIAN LAPORAN AKHIR (FLI 03):</td>
        <td style="text-align:center;font-weight:900;">20%</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;">${f2(total_fli03)}</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;font-family:monospace;">${calcCCMS(total_fli03, 20)}</td>
      </tr>

      <!-- GRAND TOTAL -->
      <tr class="grand-total-row">
        <td colspan="3" style="text-align:right;padding:4px 8px;letter-spacing:0.3px;">
          JUMLAH KESELURUHAN (A + B + C + D):
        </td>
        <td style="text-align:center;">100%</td>
        <td style="text-align:center;font-size:10px;background:#1e3a8a;">
          ${f2(grand_total)}
        </td>
        <td style="text-align:center;font-size:10px;background:#1e3a8a;font-family:monospace;">
          ${calcCCMS(grand_total, 100)}
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Signature section formatted strictly like FLI 02 with space for cop hidup -->
  <div class="sig-section">
    <div>Disediakan oleh Pegawai Perhubungan Industri dan Alumni,</div>
    <div class="sig-line"></div>
    <!-- Space for cop hidup between signature line and Tarikh -->
    <div style="margin-top:28px;font-weight:700;font-size:9px;">Tarikh:</div>
  </div>

</body>
</html>`;
}
