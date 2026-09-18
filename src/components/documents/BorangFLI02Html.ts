/**
 * Generates a full HTML string for the Borang FLI 02 print document.
 * This is used by opening a new browser window and writing the HTML directly.
 */
export function renderBorangFLI02Html(row: any): string {
  // Helpers
  const getVal = (key: string, fallback = ''): string => {
    return row[key] !== undefined && row[key] !== null ? row[key].toString() : fallback;
  };

  const getMatrik = (): string => {
    return row['No. Pendaftaran'] || row['NO. MATRIK'] || row['NO MATRIK'] || row['NO PENDAFTARAN'] || '';
  };

  const getNama = (): string => {
    return row['NAMA PELAJAR'] || row['NAMA'] || '';
  };

  const getProgram = (): string => {
    return row['Program'] || row['PROGRAM'] || '';
  };

  const getKelas = (): string => {
    return row['Kelas'] || row['KELAS'] || '';
  };

  const getSesi = (): string => {
    return row['SESI'] || row['SESI '] || 'SESI I 2026/2027';
  };

  // Extract score numeric values
  const score_c1_1 = parseInt(getVal('FLI02-C1', '0')) || 0;
  const score_c1_2 = parseInt(getVal('FLI02-C2', '0')) || 0;
  const peratus_c1 = parseFloat(getVal('TOTAL7', '0')) || 0;

  const score_c2_1 = parseInt(getVal('FLI02-C3', '0')) || 0;
  const score_c2_2 = parseInt(getVal('FLI02-C4', '0')) || 0;
  const peratus_c2 = parseFloat(getVal('TOTAL8', '0')) || 0;

  const score_c3_1 = parseInt(getVal('FLI02-C5', '0')) || 0;
  const score_c3_2 = parseInt(getVal('FLI02-C6', '0')) || 0;
  const peratus_c3 = parseFloat(getVal('TOTAL9', '0')) || 0;

  const total_c = parseFloat(getVal('GRAN TOTAL2', '0')) || 0;

  // Extract ulasan
  const ulasanKey = Object.keys(row).find(k => k.includes('FLI02-ULASAN') || k.toUpperCase().includes('ULASAN'));
  const savedUlasan = ulasanKey ? (row[ulasanKey] || '').toString().trim() : '';

  // Helper to render checkmark grid for scales 1 to 5
  const renderScaleChecks = (score: number): string => {
    return [1, 2, 3, 4, 5].map(val => {
      const isChecked = score === val;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
          <span style="font-size:9px;color:#64748b;">${val}</span>
          <span style="width:18px;height:18px;border:1px solid ${isChecked ? '#0f172a' : '#94a3b8'};${isChecked ? 'background:#0f172a;color:white;' : ''}display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;border-radius:2px;">
            ${isChecked ? '✓' : ''}
          </span>
        </div>
      `;
    }).join('');
  };

  return `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Borang Penilaian FLI 02 - ${getNama()}</title>
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
    td, th { padding: 6px 8px; vertical-align: top; }
    .header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .header img { width: 50px; height: auto; }
    .header-text h1 { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    .header-text p { font-size: 9px; font-weight: 600; color: #334155; }
    .doc-code { font-size: 9px; font-family: monospace; font-weight: 700; border: 1px solid #334155; padding: 3px 8px; border-radius: 3px; }
    .title-banner { text-align: center; background: #0f172a; color: white; padding: 8px; border-radius: 4px; margin-bottom: 14px; }
    .title-banner h2 { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
    .title-banner p { font-size: 9px; font-weight: 600; color: #cbd5e1; margin-top: 2px; }
    .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #0f172a; padding-bottom: 3px; margin-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; font-size: 10px; margin-bottom: 14px; }
    .info-row { display: grid; grid-template-columns: 140px 1fr; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
    .info-label { color: #0f172a; font-weight: 700; font-family: inherit; font-size: 10px; }
    .info-value { color: #0f172a; font-weight: 700; font-family: inherit; font-size: 10px; text-transform: uppercase; }
    .eval-table { border: 1px solid #94a3b8; font-size: 10px; }
    .eval-table th { background: #f1f5f9; font-weight: 800; text-transform: uppercase; font-size: 9px; border: 1px solid #94a3b8; padding: 6px 8px; }
    .eval-table td { border: 1px solid #94a3b8; }
    .scale-row { display: flex; justify-content: center; align-items: center; gap: 12px; }
    .criterion-title { font-weight: 900; text-transform: uppercase; font-size: 10px; }
    .criterion-desc { color: #475569; margin-top: 3px; line-height: 1.4; }
    .total-row { background: #0f172a; color: white; font-weight: 900; text-transform: uppercase; font-size: 10px; }
    .total-row td { border-color: #334155; }
    .total-value { color: #fbbf24; font-size: 12px; font-weight: 900; }
    .ulasan-box { border: 1px solid #94a3b8; border-radius: 4px; padding: 10px; background: #fafafa; margin-bottom: 20px; }
    .ulasan-title { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .ulasan-line { height: 18px; border-bottom: 1px dashed #94a3b8; width: 100%; margin-top: 6px; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 10px; padding-top: 20px; margin-top: auto; }
    .sig-block { }
    .sig-title { font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .sig-line { border-bottom: 1px solid #0f172a; width: 200px; height: 40px; }
    .sig-label { font-weight: 700; color: #1e293b; margin-top: 6px; }
    .peratus-cell { text-align: center; font-weight: 800; }
    .peratus-label { font-size: 8px; text-transform: uppercase; font-weight: 700; color: #64748b; }
    .peratus-value { font-size: 13px; font-weight: 900; color: #0f172a; }
    .peratus-limit { font-size: 8px; color: #94a3b8; }
    /* Print button */
    .print-bar { background: #0f172a; color: white; padding: 10px 16px; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 0; }
    .print-bar span { font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .print-btn { background: #1e3a8a; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 11px; text-transform: uppercase; cursor: pointer; }
    .print-btn:hover { background: #1e40af; }
    .close-btn { background: #334155; color: #e2e8f0; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 900; font-size: 11px; text-transform: uppercase; cursor: pointer; margin-left: 8px; }
    .close-btn:hover { background: #475569; color: white; }
  </style>
</head>
<body>
  <!-- Print Control Bar -->
  <div class="print-bar no-print">
    <span>🏅 Pratinjau Borang Penilaian FLI 02</span>
    <div>
      <button class="print-btn" onclick="window.print()">🖨️ Cetak Borang</button>
      <button class="close-btn" onclick="window.close()">✕ Tutup</button>
    </div>
  </div>

  <!-- Header / Letterhead -->
  <div class="header">
    <img src="https://upload.wikimedia.org/wikipedia/commons/2/26/Coat_of_arms_of_Malaysia.svg" alt="Jata Negara" />
    <div class="header-text" style="flex:1;">
      <h1>KOLEJ KOMUNITI BEAUFORT</h1>
      <p>JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI</p>
      <p style="font-size:8px;color:#64748b;">KEMENTERIAN PENDIDIKAN TINGGI MALAYSIA</p>
    </div>
    <div style="text-align:right;">
      <span class="doc-code">KOD DOKUMEN: FLI 02</span>
    </div>
  </div>

  <!-- Title Banner -->
  <div class="title-banner">
    <h2>BORANG PENILAIAN PENSYARAH PEMANTAU (FLI 02)</h2>
    <p>KURSUS: SUT40078 - LATIHAN INDUSTRI (SESI: ${getSesi()})</p>
  </div>

  <!-- Section A: Maklumat Pelajar -->
  <div style="margin-bottom:14px;">
    <div class="section-title">BAHAGIAN A: MAKLUMAT PELAJAR &amp; INSTITUSI</div>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Nama Pelajar</span>
        <span class="info-value">: ${getNama()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">No. Pendaftaran</span>
        <span class="info-value">: ${getMatrik()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Program Pengajian</span>
        <span class="info-value">: ${getProgram()}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Kelas</span>
        <span class="info-value">: ${getKelas()}</span>
      </div>
    </div>
  </div>

  <!-- Section C: Penilaian Temubual -->
  <div style="margin-bottom:14px;">
    <div class="section-title">BAHAGIAN C: PENILAIAN TEMUBUAL (PEMBERAT: 20%)</div>
    <table class="eval-table">
      <thead>
        <tr>
          <th style="width:50%;text-align:left;">Aspek Penilaian &amp; Kriteria</th>
          <th style="width:33%;text-align:center;">Skala Pemarkahan (1 - 5)</th>
          <th style="width:17%;text-align:center;">Pemberat &amp; Markah</th>
        </tr>
      </thead>
      <tbody>
        <!-- Criterion 1 -->
        <tr>
          <td>
            <div class="criterion-title">1. KOMUNIKASI LISAN (CLO 2)</div>
            <div class="criterion-desc">1.1 Kefahaman dan kebolehan menjawab soalan dengan tepat, jelas dan tenang.</div>
          </td>
          <td><div class="scale-row">${renderScaleChecks(score_c1_1)}</div></td>
          <td rowspan="2" class="peratus-cell" style="vertical-align:middle;">
            <div class="peratus-label">CLO 2</div>
            <div class="peratus-value">${peratus_c1.toFixed(1)}</div>
            <div class="peratus-limit">Had: 10</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="criterion-desc">1.2 Penyampaian idea yang teratur, menarik, berkesan serta berkeyakinan tinggi.</div>
          </td>
          <td><div class="scale-row">${renderScaleChecks(score_c1_2)}</div></td>
        </tr>

        <!-- Criterion 2 -->
        <tr>
          <td>
            <div class="criterion-title">2. KERJA BERPASUKAN &amp; TANGGUNGJAWAB (CLO 3)</div>
            <div class="criterion-desc">2.1 Membina hubungan baik dan bekerjasama dengan rakan sekerja pelbagai peringkat.</div>
          </td>
          <td><div class="scale-row">${renderScaleChecks(score_c2_1)}</div></td>
          <td rowspan="2" class="peratus-cell" style="vertical-align:middle;">
            <div class="peratus-label">CLO 3</div>
            <div class="peratus-value">${peratus_c2.toFixed(1)}</div>
            <div class="peratus-limit">Had: 5</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="criterion-desc">2.2 Bertanggungjawab melaksanakan tugasan individu dan kumpulan secara proaktif.</div>
          </td>
          <td><div class="scale-row">${renderScaleChecks(score_c2_2)}</div></td>
        </tr>

        <!-- Criterion 3 -->
        <tr>
          <td>
            <div class="criterion-title">3. KEMAHIRAN PERSONAL (CLO 4)</div>
            <div class="criterion-desc">3.1 Kebolehan mengorganisasi idea dan menyusun atur laporan kerja secara bersistem.</div>
          </td>
          <td><div class="scale-row">${renderScaleChecks(score_c3_1)}</div></td>
          <td rowspan="2" class="peratus-cell" style="vertical-align:middle;">
            <div class="peratus-label">CLO 4</div>
            <div class="peratus-value">${peratus_c3.toFixed(1)}</div>
            <div class="peratus-limit">Had: 5</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="criterion-desc">3.2 Bermotivasi, berdisiplin serta menunjukkan inisiatif tinggi menyiapkan tugasan.</div>
          </td>
          <td><div class="scale-row">${renderScaleChecks(score_c3_2)}</div></td>
        </tr>

        <!-- Total Row -->
        <tr class="total-row">
          <td colspan="2" style="padding:8px;">Jumlah Markah Penilaian Temubual (Bahagian C)</td>
          <td style="text-align:center;padding:8px;"><span class="total-value">${total_c.toFixed(1)}<span style="font-size: 8px; color: #94a3b8; font-weight: normal; margin-left: 2px;"> / 20.0</span></span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Section D: Ulasan -->
  <div class="ulasan-box">
    <div class="ulasan-title">ULASAN / CADANGAN PENSYARAH PEMANTAU:</div>
    ${savedUlasan ? `<div style="font-size:10px;font-weight:700;line-height:1.5;color:#0f172a;min-height:50px;white-space:pre-wrap;padding:4px 0;text-transform:uppercase;">${savedUlasan}</div>` : `
      <div class="ulasan-line"></div>
      <div class="ulasan-line"></div>
      <div class="ulasan-line"></div>
    `}
  </div>

  <!-- Signature Area -->
  <div class="sig-grid">
    <div class="sig-block">
      <div class="sig-title">Tandatangan Pensyarah Pemantau</div>
      <div class="sig-line"></div>
      <div class="sig-label">Nama &amp; Cop:</div>
      <div class="sig-label" style="margin-top:48px;">Tarikh: .......................................</div>
    </div>
    <div class="sig-block" style="text-align:left;">
      <div class="sig-title">Pengesahan PPIA</div>
      <div class="sig-line"></div>
      <div class="sig-label">Nama &amp; Cop:</div>
      <div class="sig-label" style="margin-top:48px;">Tarikh: .......................................</div>
    </div>
  </div>

</body>
</html>`;
}
