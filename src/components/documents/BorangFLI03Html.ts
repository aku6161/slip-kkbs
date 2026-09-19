/**
 * Generates a full HTML string for the Borang FLI 03 (Penilaian Laporan Akhir) print document.
 * Optimized to fit strictly on a single A4 page.
 */
export function renderBorangFLI03Html(row: any, config?: any): string {
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

  const f2 = (val: number | string): string => {
    const num = parseFloat(String(val)) || 0;
    return num.toFixed(2);
  };

  // Extract FLI03 scores
  const score_d1_1 = parseInt(getVal('FLI03-D1', getVal('fli03_d1_1', '0'))) || 0;
  const score_d1_2 = parseInt(getVal('FLI03-D2', getVal('fli03_d1_2', '0'))) || 0;
  const score_d1_3 = parseInt(getVal('FLI03-D3', getVal('fli03_d1_3', '0'))) || 0;
  const total_d1_raw = score_d1_1 + score_d1_2 + score_d1_3;
  const peratus_d1 = ((total_d1_raw / 15) * 15).toFixed(2);

  const score_d2_1 = parseInt(getVal('FLI03-D4', getVal('FLI03-D3_2', getVal('fli03_d2_1', '0')))) || 0;
  const total_d2_raw = score_d2_1;
  const peratus_d2 = ((total_d2_raw / 5) * 5).toFixed(2);

  const total_d = (parseFloat(peratus_d1) + parseFloat(peratus_d2)).toFixed(2);

  // Extract ulasan
  const ulasanKey = Object.keys(row).find(k => k.includes('FLI03-ULASAN') || k.toUpperCase().includes('ULASAN'));
  const savedUlasan = ulasanKey ? (row[ulasanKey] || '').toString().trim() : (row['fli03_ulasan'] || '');

  const renderScaleChecks = (score: number): string => {
    return [1, 2, 3, 4, 5].map(val => {
      const isChecked = score === val;
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:1px;">
          <span style="font-size:8px;color:#64748b;">${val}</span>
          <span style="width:16px;height:16px;border:1px solid ${isChecked ? '#0f172a' : '#94a3b8'};${isChecked ? 'background:#0f172a;color:white;' : ''}display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:900;border-radius:2px;">
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
  <title>Borang Penilaian FLI 03 - ${getNama()}</title>
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
      font-size: 9.5px;
      color: #0f172a;
      background: white;
      padding: 10px 15px;
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
    td, th { padding: 3px 6px; vertical-align: middle; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid #0f172a; padding-bottom: 5px; margin-bottom: 6px; }
    .header-text h1 { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px; }
    .header-text p { font-size: 8px; font-weight: 600; color: #334155; }
    .doc-code { font-size: 8.5px; font-family: monospace; font-weight: 800; border: 1px solid #334155; padding: 2px 6px; border-radius: 2px; }
    .title-banner { text-align: center; background: #0f172a; color: white; padding: 4px; border-radius: 3px; margin-bottom: 6px; }
    .title-banner h2 { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-table td { padding: 2px 4px; font-size: 9px; }
    .info-label { font-weight: 700; color: #475569; width: 18%; text-transform: uppercase; }
    .info-val { font-weight: 700; color: #0f172a; width: 32%; }
    .eval-table { border: 1.2px solid #0f172a; margin-top: 5px; }
    .eval-table th { background: #f1f5f9; font-weight: 800; font-size: 8.5px; text-transform: uppercase; border: 1px solid #cbd5e1; text-align: center; padding: 3.5px 4px; }
    .eval-table td { border: 1px solid #cbd5e1; font-size: 9px; }
    .section-title { font-weight: 800; background: #e2e8f0; text-transform: uppercase; font-size: 8.5px; letter-spacing: 0.3px; padding: 3px 6px; border-top: 1.5px solid #0f172a; border-bottom: 1px solid #cbd5e1; }
    .criteria-title { font-weight: 800; color: #0f172a; font-size: 9px; margin-bottom: 2px; }
    .criteria-desc { font-size: 8.5px; color: #475569; line-height: 1.2; }
    .subtotal-row { background: #f8fafc; font-weight: 800; }
    .rubric-box { border: 1px solid #cbd5e1; background: #f8fafc; padding: 4px 8px; margin-top: 5px; border-radius: 3px; font-size: 8px; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; page-break-inside: avoid; }
    .sig-card { border: 1px solid #cbd5e1; padding: 6px 10px; border-radius: 3px; background:#f8fafc; }
  </style>
</head>
<body>

  <!-- No-print Bar -->
  <div class="no-print" style="background:#0f172a;color:white;padding:8px 15px;margin:-10px -15px 10px -15px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <span style="font-weight:800;font-size:11px;">📑 Pratinjau Borang Penilaian Laporan Akhir (FLI 03)</span>
      <span style="font-size:9.5px;color:#94a3b8;margin-left:8px;">Pelajar: ${getNama()} (${getMatrik()})</span>
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
    <div class="doc-code">FLI 03</div>
  </div>

  <!-- Title Banner -->
  <div class="title-banner">
    <h2>BORANG PENILAIAN LAPORAN AKHIR LATIHAN INDUSTRI (FLI 03)</h2>
  </div>

  <!-- Student Info Table -->
  <table class="info-table" style="border:1px solid #cbd5e1;margin-bottom:5px;background:#f8fafc;">
    <tr>
      <td class="info-label">Nama Pelajar:</td>
      <td class="info-val">${getNama() || '-'}</td>
      <td class="info-label">No. Pendaftaran:</td>
      <td class="info-val" style="font-family:monospace;font-weight:900;">${getMatrik() || '-'}</td>
    </tr>
    <tr>
      <td class="info-label">Program:</td>
      <td class="info-val">${getProgram() || '-'}</td>
      <td class="info-label">Kelas / Sesi:</td>
      <td class="info-val">${getKelas()} / ${getSesi()}</td>
    </tr>
  </table>

  <!-- Rubric guide -->
  <div class="rubric-box">
    <strong>Panduan Skala Markah:</strong> 1 = Lemah / Sangat Tidak Memuaskan | 2 = Kurang Memuaskan | 3 = Sederhana / Memuaskan | 4 = Baik | 5 = Cemerlang
  </div>

  <!-- Section D: Penilaian Laporan Akhir -->
  <div class="section-title">BAHAGIAN D: PENILAIAN LAPORAN AKHIR (PEMBERAT: 20%)</div>
  <table class="eval-table">
    <thead>
      <tr>
        <th style="width:42%;text-align:left;">Aspek Penilaian &amp; Kriteria</th>
        <th style="width:10%;">CLO</th>
        <th style="width:12%;">Pemberat</th>
        <th style="width:22%;">Skala (1 - 5)</th>
        <th style="width:14%;">Markah (%)</th>
      </tr>
    </thead>
    <tbody>
      <!-- Criteria 1 -->
      <tr>
        <td>
          <div class="criteria-title">1. Kemahiran di tempat kerja</div>
          <div class="criteria-desc">1.1 Perincian kerja</div>
        </td>
        <td style="text-align:center;font-weight:700;">CLO 1</td>
        <td rowspan="3" style="text-align:center;font-weight:800;vertical-align:middle;background:#f8fafc;">15%</td>
        <td style="text-align:center;">
          <div style="display:flex;justify-content:center;gap:4px;">
            ${renderScaleChecks(score_d1_1)}
          </div>
        </td>
        <td rowspan="3" style="text-align:center;font-weight:900;font-size:10px;vertical-align:middle;background:#f8fafc;">
          <span style="color:#0f172a;">${f2(peratus_d1)} %</span>
          <div style="font-size:7.5px;color:#64748b;">(${total_d1_raw}/15 x 15%)</div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="criteria-desc">1.2 Lampiran perincian kerja</div>
        </td>
        <td style="text-align:center;font-weight:700;">CLO 1</td>
        <td style="text-align:center;">
          <div style="display:flex;justify-content:center;gap:4px;">
            ${renderScaleChecks(score_d1_2)}
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div class="criteria-desc">1.3 Analisa kerja, cadangan dan kesimpulan</div>
        </td>
        <td style="text-align:center;font-weight:700;">CLO 1</td>
        <td style="text-align:center;">
          <div style="display:flex;justify-content:center;gap:4px;">
            ${renderScaleChecks(score_d1_3)}
          </div>
        </td>
      </tr>

      <!-- Criteria 2 -->
      <tr>
        <td>
          <div class="criteria-title">2. Komunikasi bertulis</div>
          <div class="criteria-desc">2.1 Kekemasan penulisan laporan</div>
        </td>
        <td style="text-align:center;font-weight:700;">CLO 2</td>
        <td style="text-align:center;font-weight:800;background:#f8fafc;">5%</td>
        <td style="text-align:center;">
          <div style="display:flex;justify-content:center;gap:4px;">
            ${renderScaleChecks(score_d2_1)}
          </div>
        </td>
        <td style="text-align:center;font-weight:900;font-size:10px;background:#f8fafc;">
          <span style="color:#0f172a;">${f2(peratus_d2)} %</span>
          <div style="font-size:7.5px;color:#64748b;">(${total_d2_raw}/5 x 5%)</div>
        </td>
      </tr>

      <!-- Subtotal -->
      <tr class="subtotal-row">
        <td colspan="4" style="text-align:right;padding:5px;font-weight:900;text-transform:uppercase;">
          Jumlah Markah Penilaian Laporan Akhir (Bahagian D):
        </td>
        <td style="text-align:center;font-weight:900;font-size:11px;background:#0f172a;color:white;">
          ${f2(total_d)} %
        </td>
      </tr>
    </tbody>
  </table>

  <!-- Ulasan -->
  <div style="margin-top:6px;border:1px solid #cbd5e1;padding:5px 8px;border-radius:3px;background:#f8fafc;">
    <div style="font-weight:800;font-size:8.5px;text-transform:uppercase;color:#334155;margin-bottom:2px;">Ulasan Pensyarah Penilai Laporan Akhir:</div>
    <div style="min-height:26px;font-style:${savedUlasan ? 'normal' : 'italic'};color:${savedUlasan ? '#0f172a' : '#94a3b8'};font-size:9px;">
      ${savedUlasan || 'Tiada ulasan dinyatakan.'}
    </div>
  </div>

  <!-- Signatures: FLI 02 style with PPIA -->
  <div class="sig-grid">
    <div class="sig-card">
      <div style="font-size:8.5px;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:25px;">Disediakan / Dinilai Oleh:</div>
      <div style="border-bottom:1px solid #0f172a;width:75%;margin-bottom:4px;"></div>
      <div style="font-size:8.5px;color:#475569;">Pensyarah Penilai Laporan Akhir</div>
      <div style="font-size:8px;color:#64748b;margin-top:2px;">Tarikh:</div>
    </div>

    <div class="sig-card">
      <div style="font-size:8.5px;font-weight:800;text-transform:uppercase;color:#475569;margin-bottom:25px;">Disahkan Oleh:</div>
      <div style="border-bottom:1px solid #0f172a;width:75%;margin-bottom:4px;"></div>
      <div style="font-size:8.5px;color:#475569;">Pegawai Perhubungan Industri dan Alumni (PPIA)</div>
      <div style="font-size:8px;color:#64748b;margin-top:2px;">Tarikh:</div>
    </div>
  </div>

</body>
</html>`;
}
