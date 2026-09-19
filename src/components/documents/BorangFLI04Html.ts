/**
 * Generates a full HTML string for the Borang FLI 04 (Rumusan Penilaian Latihan Industri) print document.
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

  // FLI 01 Breakdown
  const fli01_a1_pct = parseFloat(getVal('TOTAL1', getVal('fli01_a1_pct', '0'))) || 0;
  const fli01_a2_pct = parseFloat(getVal('TOTAL2', getVal('fli01_a2_pct', '0'))) || 0;
  const fli01_a3_pct = parseFloat(getVal('TOTAL3', getVal('fli01_a3_pct', '0'))) || 0;
  const fli01_a4_pct = parseFloat(getVal('TOTAL4', getVal('fli01_a4_pct', '0'))) || 0;
  const fli01_a5_pct = parseFloat(getVal('TOTAL5', getVal('fli01_a5_pct', '0'))) || 0;
  const fli01_b_pct = parseFloat(getVal('TOTAL6', getVal('fli01_b_pct', '0'))) || 0;
  const total_fli01 = parseFloat(getVal('GRAND TOTAL1', (fli01_a1_pct + fli01_a2_pct + fli01_a3_pct + fli01_a4_pct + fli01_a5_pct + fli01_b_pct).toFixed(2))) || (fli01_a1_pct + fli01_a2_pct + fli01_a3_pct + fli01_a4_pct + fli01_a5_pct + fli01_b_pct);

  // FLI 02 Breakdown
  const fli02_c1_pct = parseFloat(getVal('TOTAL7', getVal('fli02_c1_pct', '0'))) || 0;
  const fli02_c2_pct = parseFloat(getVal('TOTAL8', getVal('fli02_c2_pct', '0'))) || 0;
  const fli02_c3_pct = parseFloat(getVal('TOTAL9', getVal('fli02_c3_pct', '0'))) || 0;
  const total_fli02 = parseFloat(getVal('GRAN TOTAL2', (fli02_c1_pct + fli02_c2_pct + fli02_c3_pct).toFixed(2))) || (fli02_c1_pct + fli02_c2_pct + fli02_c3_pct);

  // FLI 03 Breakdown
  const fli03_d1_pct = parseFloat(getVal('TOTAL10', getVal('fli03_d1_pct', '0'))) || 0;
  const fli03_d2_pct = parseFloat(getVal('TOTAL11', getVal('fli03_d2_pct', '0'))) || 0;
  const total_fli03 = parseFloat(getVal('GRAND TOTAL3', (fli03_d1_pct + fli03_d2_pct).toFixed(2))) || (fli03_d1_pct + fli03_d2_pct);

  // FLI 04 Total
  const grand_total = parseFloat((total_fli01 + total_fli02 + total_fli03).toFixed(2));

  // Determine Grade
  let grade = 'E';
  let statusLulus = 'GAGAL';
  if (grand_total >= 90) { grade = 'A+'; statusLulus = 'LULUS CEMERLANG'; }
  else if (grand_total >= 80) { grade = 'A'; statusLulus = 'LULUS CEMERLANG'; }
  else if (grand_total >= 75) { grade = 'A-'; statusLulus = 'LULUS'; }
  else if (grand_total >= 70) { grade = 'B+'; statusLulus = 'LULUS'; }
  else if (grand_total >= 65) { grade = 'B'; statusLulus = 'LULUS'; }
  else if (grand_total >= 60) { grade = 'B-'; statusLulus = 'LULUS'; }
  else if (grand_total >= 55) { grade = 'C+'; statusLulus = 'LULUS'; }
  else if (grand_total >= 50) { grade = 'C'; statusLulus = 'LULUS'; }
  else if (grand_total >= 40) { grade = 'D'; statusLulus = 'GAGAL'; }

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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11px;
      color: #0f172a;
      background: white;
      padding: 20px 30px;
      line-height: 1.4;
    }
    @media print {
      body { padding: 10px 15px; }
      .no-print { display: none !important; }
      @page { margin: 10mm 12mm; size: A4; }
    }
    table { border-collapse: collapse; width: 100%; }
    td, th { padding: 5px 8px; vertical-align: middle; }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .header-text h1 { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    .header-text p { font-size: 9px; font-weight: 600; color: #334155; }
    .doc-code { font-size: 9px; font-family: monospace; font-weight: 700; border: 1px solid #334155; padding: 3px 8px; border-radius: 3px; }
    .title-banner { text-align: center; background: #0f172a; color: white; padding: 8px; border-radius: 4px; margin-bottom: 12px; }
    .title-banner h2 { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
    .info-table td { padding: 4px 6px; font-size: 10.5px; }
    .info-label { font-weight: 700; color: #475569; width: 18%; text-transform: uppercase; }
    .info-val { font-weight: 700; color: #0f172a; width: 32%; }
    .summary-table { border: 1.5px solid #0f172a; margin-top: 10px; }
    .summary-table th { background: #0f172a; color: white; font-weight: 800; font-size: 10px; text-transform: uppercase; border: 1px solid #334155; text-align: center; padding: 6px; }
    .summary-table td { border: 1px solid #cbd5e1; font-size: 10.5px; }
    .section-head { background: #e2e8f0; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #0f172a; }
    .subtotal-row { background: #f1f5f9; font-weight: 800; }
    .grand-total-row { background: #0f172a; color: white; font-weight: 900; font-size: 12px; }
    .signature-card { border: 1px solid #cbd5e1; padding: 12px 16px; border-radius: 4px; margin-top: 18px; width: 55%; background: #f8fafc; page-break-inside: avoid; }
  </style>
</head>
<body>

  <!-- No-print Bar -->
  <div class="no-print" style="background:#0f172a;color:white;padding:10px 20px;margin:-20px -30px 15px -30px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <span style="font-weight:800;font-size:12px;">📊 Pratinjau Rumusan Penilaian Latihan Industri (FLI 04)</span>
      <span style="font-size:10px;color:#94a3b8;margin-left:10px;">Pelajar: ${getNama()} (${getMatrik()})</span>
    </div>
    <button onclick="window.print()" style="background:#2563eb;color:white;border:none;padding:6px 16px;border-radius:4px;font-weight:700;cursor:pointer;font-size:11px;">
      🖨️ Cetak Borang
    </button>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="header-text" style="flex:1;">
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
  <table class="info-table" style="border:1px solid #cbd5e1;margin-bottom:12px;background:#f8fafc;">
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

  <!-- Summary Table matching CSV -->
  <table class="summary-table">
    <thead>
      <tr>
        <th style="width:6%;">Bil</th>
        <th style="width:48%;text-align:left;">Kriteria Penilaian</th>
        <th style="width:10%;">CLO</th>
        <th style="width:14%;">Pemberat</th>
        <th style="width:22%;">Markah Diperolehi (%)</th>
      </tr>
    </thead>
    <tbody>
      <!-- Section 1: PENILAIAN INDUSTRI -->
      <tr class="section-head">
        <td colspan="5" style="padding:6px 8px;font-weight:900;">1. PENILAIAN INDUSTRI (FLI 01 - 60%)</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:800;">
        <td colspan="5" style="padding:4px 8px;color:#334155;">BAHAGIAN A: PENILAIAN PRESTASI (50%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Kemahiran di tempat kerja</td>
        <td style="text-align:center;font-weight:700;">CLO 1</td>
        <td style="text-align:center;">30%</td>
        <td style="text-align:center;font-weight:800;">${fli01_a1_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>Komunikasi berkesan</td>
        <td style="text-align:center;font-weight:700;">CLO 2</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli01_a2_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">3</td>
        <td>Kerja berpasukan dan tanggungjawab</td>
        <td style="text-align:center;font-weight:700;">CLO 3</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli01_a3_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">4</td>
        <td>Kemahiran personal</td>
        <td style="text-align:center;font-weight:700;">CLO 4</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli01_a4_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">5</td>
        <td>Nilai, etika dan profesionalisme</td>
        <td style="text-align:center;font-weight:700;">CLO 5</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli01_a5_pct} %</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:800;">
        <td colspan="5" style="padding:4px 8px;color:#334155;">BAHAGIAN B: BUKU LOG LI (10%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Kemahiran di tempat kerja</td>
        <td style="text-align:center;font-weight:700;">CLO 1</td>
        <td style="text-align:center;">10%</td>
        <td style="text-align:center;font-weight:800;">${fli01_b_pct} %</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="3" style="text-align:right;font-weight:900;">JUMLAH PENILAIAN INDUSTRI (FLI 01):</td>
        <td style="text-align:center;font-weight:900;">60%</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;">${total_fli01} %</td>
      </tr>

      <!-- Section 2: PENILAIAN PEMANTAUAN -->
      <tr class="section-head">
        <td colspan="5" style="padding:6px 8px;font-weight:900;">2. PENILAIAN PEMANTAUAN (FLI 02 - 20%)</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:800;">
        <td colspan="5" style="padding:4px 8px;color:#334155;">BAHAGIAN C: TEMUBUAL (20%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Komunikasi lisan</td>
        <td style="text-align:center;font-weight:700;">CLO 2</td>
        <td style="text-align:center;">10%</td>
        <td style="text-align:center;font-weight:800;">${fli02_c1_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>Kerja berpasukan dan tanggungjawab</td>
        <td style="text-align:center;font-weight:700;">CLO 3</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli02_c2_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">3</td>
        <td>Kemahiran personal</td>
        <td style="text-align:center;font-weight:700;">CLO 4</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli02_c3_pct} %</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="3" style="text-align:right;font-weight:900;">JUMLAH PENILAIAN PEMANTAUAN (FLI 02):</td>
        <td style="text-align:center;font-weight:900;">20%</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;">${total_fli02} %</td>
      </tr>

      <!-- Section 3: PENILAIAN LAPORAN AKHIR -->
      <tr class="section-head">
        <td colspan="5" style="padding:6px 8px;font-weight:900;">3. PENILAIAN LAPORAN AKHIR (FLI 03 - 20%)</td>
      </tr>
      <tr style="background:#f8fafc;font-weight:800;">
        <td colspan="5" style="padding:4px 8px;color:#334155;">BAHAGIAN D: LAPORAN AKHIR (20%)</td>
      </tr>
      <tr>
        <td style="text-align:center;">1</td>
        <td>Kemahiran di tempat kerja</td>
        <td style="text-align:center;font-weight:700;">CLO 1</td>
        <td style="text-align:center;">15%</td>
        <td style="text-align:center;font-weight:800;">${fli03_d1_pct} %</td>
      </tr>
      <tr>
        <td style="text-align:center;">2</td>
        <td>Komunikasi bertulis</td>
        <td style="text-align:center;font-weight:700;">CLO 2</td>
        <td style="text-align:center;">5%</td>
        <td style="text-align:center;font-weight:800;">${fli03_d2_pct} %</td>
      </tr>
      <tr class="subtotal-row">
        <td colspan="3" style="text-align:right;font-weight:900;">JUMLAH PENILAIAN LAPORAN AKHIR (FLI 03):</td>
        <td style="text-align:center;font-weight:900;">20%</td>
        <td style="text-align:center;font-weight:900;color:#1e3a8a;">${total_fli03} %</td>
      </tr>

      <!-- Grand Total -->
      <tr class="grand-total-row">
        <td colspan="3" style="text-align:right;padding:10px;font-size:12px;letter-spacing:0.5px;">
          JUMLAH KESELURUHAN (A + B + C + D):
        </td>
        <td style="text-align:center;font-size:12px;">100%</td>
        <td style="text-align:center;font-size:14px;background:#1e3a8a;">
          ${grand_total} / 100
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Result badge box -->
  <div style="display:flex;justify-content:space-between;align-items:center;border:1px solid #cbd5e1;background:#f8fafc;padding:10px 15px;margin-top:10px;border-radius:4px;">
    <div>
      <span style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;">Status Keputusan:</span>
      <span style="margin-left:8px;font-weight:900;font-size:12px;color:${grand_total >= 50 ? '#166534' : '#991b1b'};">${statusLulus}</span>
    </div>
    <div>
      <span style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;">Gred:</span>
      <span style="margin-left:8px;font-weight:900;font-size:14px;color:#0f172a;">${grade}</span>
    </div>
  </div>

  <!-- Signatures: PPIA ONLY as requested -->
  <div class="signature-card">
    <div style="font-size:9.5px;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:28px;">
      Disediakan Oleh:
    </div>
    <div style="border-bottom:1px dashed #94a3b8;width:90%;margin-bottom:6px;"></div>
    <div style="font-weight:900;text-transform:uppercase;font-size:11px;color:#0f172a;">
      ${config?.namaPpia || 'SHAMSUDDIN BIN AMIN'}
    </div>
    <div style="font-size:10px;color:#334155;font-weight:700;">
      Pegawai Perhubungan Industri dan Alumni (PPIA)
    </div>
    <div style="font-size:9.5px;color:#64748b;">
      Kolej Komuniti Beaufort Sabah
    </div>
    <div style="font-size:9px;color:#64748b;margin-top:4px;">
      Tarikh: ${new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
  </div>

</body>
</html>`;
}
