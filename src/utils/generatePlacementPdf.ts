import { jsPDF } from 'jspdf';
import { PlacementStudentInfo, formatProgramName } from '../types';
import { JATA_NEGARA_BASE64 } from './jataNegaraBase64';

export interface GeneratePlacementPdfParams {
  rujukanSurat: string;
  tarikhSurat: string;
  namaSyarikat: string;
  alamatBaris1: string;
  alamatBaris2: string;
  sesi: string;
  tarikhLi: string;
  tarikhMulaLi: string;
  namaPpia: string;
  noTelefonPpia: string;
  students: PlacementStudentInfo[];
}

interface TextSegment {
  text: string;
  bold?: boolean;
}

/**
 * Pembantu untuk melukis perenggan dengan gabungan teks biasa dan tebal (bold)
 * secara justified (lurus kiri & kanan) pada saiz fon yang seragam.
 */
function renderRichParagraph(
  doc: jsPDF,
  segments: TextSegment[],
  startX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number = 5.2
): number {
  let curY = startY;

  // 1. Ekstrak setiap patah perkataan bersama status bold
  const words: { text: string; bold: boolean; width: number }[] = [];
  for (const seg of segments) {
    const isBold = !!seg.bold;
    const parts = seg.text.split(/\s+/);
    for (const p of parts) {
      if (p.length > 0) {
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const w = doc.getTextWidth(p);
        words.push({ text: p, bold: isBold, width: w });
      }
    }
  }

  // 2. Pecahkan perkataan ke dalam baris mengikut maxWidth
  const lines: { text: string; bold: boolean; width: number }[][] = [];
  let currentLine: { text: string; bold: boolean; width: number }[] = [];
  let currentLineWidth = 0;

  for (const w of words) {
    doc.setFont('helvetica', 'normal');
    const standardSpaceW = doc.getTextWidth(' ');
    const neededWidth = currentLine.length === 0 ? w.width : currentLineWidth + standardSpaceW + w.width;

    if (neededWidth > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [w];
      currentLineWidth = w.width;
    } else {
      currentLine.push(w);
      currentLineWidth = neededWidth;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // 3. Lukis setiap baris secara Justify (kecuali baris terakhir perenggan)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isLastLine = i === lines.length - 1;

    let totalWordsWidth = 0;
    for (const item of line) {
      totalWordsWidth += item.width;
    }

    doc.setFont('helvetica', 'normal');
    let spaceWidth = doc.getTextWidth(' ');
    // Jika bukan baris terakhir dan mempunyai lebih daripada 1 perkataan, bahagikan ruang baki (justify)
    if (!isLastLine && line.length > 1) {
      spaceWidth = (maxWidth - totalWordsWidth) / (line.length - 1);
    }

    let curX = startX;
    for (const item of line) {
      doc.setFont('helvetica', item.bold ? 'bold' : 'normal');
      doc.text(item.text, curX, curY);
      curX += item.width + spaceWidth;
    }
    curY += lineHeight;
  }

  return curY;
}

/**
 * Menjana fail PDF rasmi Surat Penempatan Lapor Diri & Lampiran A
 * Mengikut spesifikasi rasmi Kolej Komuniti Beaufort & Kementerian Pendidikan Tinggi
 */
export function generatePlacementPdfDocument(params: GeneratePlacementPdfParams): {
  doc: jsPDF;
  blob: Blob;
  blobUrl: string;
  fileName: string;
} {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2; // 170mm

  const {
    rujukanSurat,
    tarikhSurat,
    namaSyarikat,
    alamatBaris1,
    alamatBaris2,
    sesi,
    tarikhLi,
    tarikhMulaLi,
    namaPpia,
    noTelefonPpia,
    students,
  } = params;

  // ==========================================
  // MUKA SURAT 1: SURAT MAKLUMAN LAPOR DIRI
  // ==========================================
  
  // 1. Logo Jata Negara (Sebelah kiri alamat kolej komuniti beaufort)
  const logoX = marginX;
  const logoY = 12.5;
  const logoWidth = 24;
  const logoHeight = 18.1;

  try {
    doc.addImage(JATA_NEGARA_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.warn('Gagal memuatkan logo Jata Negara:', err);
  }

  // 2. Alamat Kolej Komuniti Beaufort (Sebelah kanan logo jata negara)
  // Syarat:
  // - KOLEJ KOMUNITI BEAUFORT saiz 14 bold
  // - JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI saiz 12 normal
  // - KEMENTERIAN PENDIDIKAN TINGGI saiz 12 normal
  // - JALAN MELALUGUS saiz 12 normal
  // - 89807 BEAUFORT, SABAH. saiz 12 normal
  const addrX = logoX + logoWidth + 4; // 48mm
  let addrY = 16.5;

  // Nama Kolej (Saiz 14, BOLD)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('KOLEJ KOMUNITI BEAUFORT', addrX, addrY);
  addrY += 5.0;

  // Jabatan & Kementerian (Saiz 12, Normal)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI', addrX, addrY);
  addrY += 5.0;
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI', addrX, addrY);
  addrY += 5.0;

  // Alamat: JALAN MELALUGUS & 89807 BEAUFORT, SABAH. (Saiz 12, Normal - Tanpa perkataan Malaysia)
  doc.text('JALAN MELALUGUS', addrX, addrY);
  addrY += 5.0;
  doc.text('89807 BEAUFORT, SABAH.', addrX, addrY);

  // Bahagian Kanan Kepala Surat (No. Telefon, Faks, Web, Emel)
  // Syarat: Turunkan maklumat tel, faks, laman web dan emel ke bawah sedikit
  // sehingga bahagian emel sebaris dengan perkataan 89807 BEAUFORT, SABAH. (addrY)
  const rightHeaderX = pageWidth - marginX; // 190mm
  const emailY = addrY; // Sebaris dengan 89807 BEAUFORT, SABAH.
  const webY = emailY - 3.8;
  const faksY = webY - 3.8;
  const telY = faksY - 3.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Tel : 087212528', rightHeaderX, telY, { align: 'right' });
  doc.text('Faks : 087212530', rightHeaderX, faksY, { align: 'right' });
  doc.text('Laman web : https://kkbeaufort.mypolycc.edu.my/', rightHeaderX, webY, { align: 'right' });
  doc.text('E-mel : adminkkbs@kkbeaufort.edu.my', rightHeaderX, emailY, { align: 'right' });

  // Garisan Melintang Pemisah Kepala Surat
  const dividerY = addrY + 4.5; // ~41mm
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

  // =========================================================================
  // ISI SURAT:
  // - Ruj. Kami & Tarikh: KEKALKAN SAIZ 10
  // - Alamat Syarikat hingga Tandatangan Pengarah: SAIZ 12
  // =========================================================================
  let y = dividerY + 6.0;

  // 3. Rujukan & Tarikh (Sebelah Kanan) - KEKALKAN SAIZ 10
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const refLabel = `Ruj. Kami  : KKBS - ${rujukanSurat}`;
  const dateLabel = `Tarikh     : ${tarikhSurat}`;
  doc.text(refLabel, rightHeaderX, y, { align: 'right' });
  y += 4.5;
  doc.text(dateLabel, rightHeaderX, y, { align: 'right' });
  
  // Turun satu space ke alamat syarikat
  y += 9.5;

  // 4. Penerima Industri (Sebelah Kiri) - SAIZ 12
  const bodyFontSize = 12;
  doc.setFontSize(bodyFontSize);

  // Boldkan [Pengarah/PENGURUS]
  doc.setFont('helvetica', 'bold');
  doc.text('PENGARAH/PENGURUS,', marginX, y);
  y += 5.2;

  // Nama dan alamat syarikat normal
  doc.setFont('helvetica', 'normal');
  doc.text(`${namaSyarikat.toUpperCase()},`, marginX, y);
  y += 5.2;

  if (alamatBaris1 && alamatBaris1.trim() !== '') {
    doc.text(`${alamatBaris1.toUpperCase()},`, marginX, y);
    y += 5.2;
  }
  if (alamatBaris2 && alamatBaris2.trim() !== '') {
    doc.text(`${alamatBaris2.toUpperCase()}.`, marginX, y);
    y += 5.2;
  }

  y += 2.5;
  doc.text('Tuan,', marginX, y);
  
  // Syarat: Selepas Tuan, jarak 1 space kemudian tajuk surat
  y += 8.5;

  // 5. Tajuk Perkara (Bold, saiz seragam 12)
  doc.setFont('helvetica', 'bold');
  const cleanSesi = sesi.toUpperCase().startsWith('SESI') ? sesi.toUpperCase() : `SESI ${sesi.toUpperCase()}`;
  const subjectText = `PENEMPATAN PELAJAR UNTUK LATIHAN INDUSTRI SIJIL KOLEJ KOMUNITI ${cleanSesi}`;
  const splitSubject = doc.splitTextToSize(subjectText, contentWidth);
  doc.text(splitSubject, marginX, y);
  y += splitSubject.length * 5.2 + 3.0;

  // 6. Perenggan 1 (Justify, saiz 12)
  doc.setFont('helvetica', 'normal');
  const p1Segments: TextSegment[] = [
    { text: 'Dengan segala hormatnya saya merujuk kepada perkara yang tersebut di atas.' }
  ];
  y = renderRichParagraph(doc, p1Segments, marginX, y, contentWidth, 5.2);
  y += 2.8;

  // 7. Perenggan 2 (Justify, saiz 12)
  // Syarat: Boldkan tarikh lapor diri dan jam lapor diri
  const p2Segments: TextSegment[] = [
    { text: '2.   Sukacita dimaklumkan bahawa pelajar seperti yang tersenarai dalam lampiran akan ditempatkan di syarikat/firma tuan bagi menjalani Latihan Industri bermula ' },
    { text: tarikhLi },
    { text: '. Pelajar dikehendaki melapor diri di jabatan/firma tuan pada ' },
    { text: tarikhMulaLi, bold: true },
    { text: ', ' },
    { text: 'jam 9.00 pagi', bold: true },
    { text: '.' }
  ];
  y = renderRichParagraph(doc, p2Segments, marginX, y, contentWidth, 5.2);
  y += 2.8;

  // 8. Perenggan 3 (Justify, saiz 12)
  const p3Segments: TextSegment[] = [
    { text: '3.   Untuk makluman pihak tuan, pelajar yang menjalani Latihan Industri di syarikat tuan adalah dilindungi oleh insurans kemalangan diri berkelompok.' }
  ];
  y = renderRichParagraph(doc, p3Segments, marginX, y, contentWidth, 5.2);
  y += 2.8;

  // 9. Perenggan 4 (Justify, saiz 12)
  // Syarat: Boldkan nama PPIA dan no. tel PPIA
  const p4Segments: TextSegment[] = [
    { text: '4.   Pihak Kolej Komuniti Beaufort amat berbesar hati sekiranya pihak tuan dapat mempertimbangkan untuk menyerap pelajar tersebut sebagai pekerja setelah mereka tamat menjalani Program Latihan Industri ini. Sebarang pertanyaan berhubung perkara ini boleh diajukan kepada Pegawai Perhubungan Industri dan Alumni, ' },
    { text: namaPpia, bold: true },
    { text: ' di talian ' },
    { text: noTelefonPpia, bold: true },
    { text: '.' }
  ];
  y = renderRichParagraph(doc, p4Segments, marginX, y, contentWidth, 5.2);
  y += 2.8;

  // 10. Penutup & Slogan (Saiz 12)
  doc.setFont('helvetica', 'normal');
  doc.text('Kerjasama dari pihak tuan amat dihargai.', marginX, y);
  
  // Syarat: Selepas kerjasama dari pihak tuan ... jarak satu space kemudian sekian terima kasih
  y += 8.5;
  doc.text('Sekian, terima kasih.', marginX, y);

  // Syarat: Kemudian jarak 1 space baru perkataan malaysia madani
  y += 8.5;

  doc.setFont('helvetica', 'bold');
  doc.text('“MALAYSIA MADANI”', marginX, y);
  y += 4.8;
  doc.text('“BERKHIDMAT UNTUK NEGARA”', marginX, y);

  // Syarat: Jarak satu space juga dari berkhidmat untuk negara kemudian saya yang menjalankan amanah
  y += 8.5;

  doc.setFont('helvetica', 'normal');
  doc.text('Saya yang menjalankan amanah,', marginX, y);
  y += 12.5;

  // 11. Tandatangan Pengarah (Saiz 12)
  // Syarat: Boldkan pengarah sahaja, kolej komuniti beaufort dan kementerian pendidikan tinggi tidak perlu bold
  doc.setFont('helvetica', 'bold');
  doc.text('Pengarah,', marginX, y);
  y += 5.0;

  doc.setFont('helvetica', 'normal');
  doc.text('Kolej Komuniti Beaufort,', marginX, y);
  y += 5.0;
  doc.text('Kementerian Pendidikan Tinggi.', marginX, y);

  // Nota kaki muka surat 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ==========================================
  // MUKA SURAT 2: LAMPIRAN A (SENARAI PELAJAR)
  // ==========================================
  doc.addPage();
  y = 20;

  // Syarat: No rujukan surat pada lampiran A juga ubah kepada saiz 10
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`KKBS - ${rujukanSurat}`, rightHeaderX, y, { align: 'right' });
  y += 8;

  // LAMPIRAN A (Saiz 12 bold)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('LAMPIRAN A', rightHeaderX, y, { align: 'right' });
  
  // Senarai pelajar bawah satu space dari lampiran A
  y += 8; // Bawah satu space dari LAMPIRAN A

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SENARAI PELAJAR', marginX, y);
  y += 7.0;

  // Jadual Lampiran A: BIL (15mm) | NAMA (100mm) | PROGRAM (55mm) = 170mm
  const colWidths = [15, 100, 55];
  const tableX = marginX;
  const rowHeight = 10;

  // Header Jadual
  doc.setLineWidth(0.3);
  doc.rect(tableX, y, contentWidth, rowHeight);
  doc.line(tableX + colWidths[0], y, tableX + colWidths[0], y + rowHeight);
  doc.line(tableX + colWidths[0] + colWidths[1], y, tableX + colWidths[0] + colWidths[1], y + rowHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BIL', tableX + colWidths[0] / 2, y + 6.5, { align: 'center' });
  doc.text('NAMA', tableX + colWidths[0] + 4, y + 6.5);
  doc.text('PROGRAM', tableX + colWidths[0] + colWidths[1] + 4, y + 6.5);
  y += rowHeight;

  // Data Senarai Pelajar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);

  for (let i = 0; i < students.length; i++) {
    const st = students[i];
    const bilStr = (i + 1).toString();
    const namaStr = (st.namaPelajar || '').toUpperCase();
    const progStr = formatProgramName(st.program || '').toUpperCase();

    // Semakan muka surat baharu jika senarai panjang
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.rect(tableX, y, contentWidth, rowHeight);
    doc.line(tableX + colWidths[0], y, tableX + colWidths[0], y + rowHeight);
    doc.line(tableX + colWidths[0] + colWidths[1], y, tableX + colWidths[0] + colWidths[1], y + rowHeight);

    doc.text(bilStr, tableX + colWidths[0] / 2, y + 6.5, { align: 'center' });

    const splitNama = doc.splitTextToSize(namaStr, colWidths[1] - 8);
    doc.text(splitNama[0] || '', tableX + colWidths[0] + 4, y + 6.5);

    const splitProg = doc.splitTextToSize(progStr, colWidths[2] - 8);
    doc.text(splitProg[0] || '', tableX + colWidths[0] + colWidths[1] + 4, y + 6.5);

    y += rowHeight;
  }

  // Nota kaki muka surat 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Jana fail Blob & Object URL
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const cleanCompName = namaSyarikat.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `SURAT_PENEMPATAN_${cleanCompName}_${rujukanSurat.replace('/', '_')}.pdf`;

  return {
    doc,
    blob: pdfBlob,
    blobUrl,
    fileName,
  };
}
