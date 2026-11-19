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
 * secara lancar pada baris dan saiz fon yang seragam.
 */
function renderRichParagraph(
  doc: jsPDF,
  segments: TextSegment[],
  startX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number = 4.8
): number {
  let curX = startX;
  let curY = startY;

  for (const seg of segments) {
    const isBold = !!seg.bold;
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');

    const words = seg.text.split(/(\s+)/);
    for (const word of words) {
      if (word === '') continue;

      if (/^\s+$/.test(word)) {
        const spaceW = doc.getTextWidth(word);
        if (curX > startX) {
          curX += spaceW;
        }
      } else {
        const wordW = doc.getTextWidth(word);
        if (curX + wordW > startX + maxWidth && curX > startX) {
          curY += lineHeight;
          curX = startX;
        }
        doc.text(word, curX, curY);
        curX += wordW;
      }
    }
  }

  return curY + lineHeight;
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
  const logoWidth = 20;
  const logoHeight = 15.1; // nisbah aspek rasmi jata negara

  try {
    doc.addImage(JATA_NEGARA_BASE64, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (err) {
    console.warn('Gagal memuatkan logo Jata Negara:', err);
  }

  // 2. Alamat Kolej Komuniti Beaufort (Sebelah kanan logo jata negara)
  // Syarat: Boldkan nama kolej sahaja, alamat lain TIDAK PERLU BOLD
  const addrX = logoX + logoWidth + 4; // 44mm
  let addrY = 16.5;

  // Nama Kolej (BOLD)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('KOLEJ KOMUNITI BEAUFORT', addrX, addrY);
  addrY += 4.2;

  // Bahagian lain (TIDAK BOLD / NORMAL)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.text('JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI', addrX, addrY);
  addrY += 3.5;
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI', addrX, addrY);
  addrY += 3.5;
  doc.text('JALAN MELALUGUS  89807 BEAUFORT  SABAH', addrX, addrY);
  addrY += 3.2;
  doc.text('MALAYSIA', addrX, addrY);

  // Bahagian Kanan Kepala Surat (No. Telefon, Faks, Web, Emel)
  const rightHeaderX = pageWidth - marginX;
  let rhY = 16.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Tel : 087212528', rightHeaderX, rhY, { align: 'right' });
  rhY += 3.2;
  doc.text('Faks : 087212530', rightHeaderX, rhY, { align: 'right' });
  rhY += 3.2;
  doc.text('Laman web : https://kkbeaufort.mypolycc.edu.my/', rightHeaderX, rhY, { align: 'right' });
  rhY += 3.2;
  doc.text('E-mel : adminkkbs@kkbeaufort.edu.my', rightHeaderX, rhY, { align: 'right' });

  // Garisan Melintang Pemisah Kepala Surat
  const dividerY = 32.5;
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

  // ==========================================
  // ISI SURAT: JENIS & SAIZ FON SERAGAM (9.5pt)
  // ==========================================
  let y = dividerY + 6.5;
  const uniformFontSize = 9.5;
  doc.setFontSize(uniformFontSize);

  // 3. Rujukan & Tarikh (Sebelah Kanan)
  doc.setFont('helvetica', 'normal');
  const refLabel = `Ruj. Kami  : KKBS - ${rujukanSurat}`;
  const dateLabel = `Tarikh     : ${tarikhSurat}`;
  doc.text(refLabel, rightHeaderX, y, { align: 'right' });
  y += 4.5;
  doc.text(dateLabel, rightHeaderX, y, { align: 'right' });
  y += 6.5;

  // 4. Penerima Industri (Sebelah Kiri)
  // Syarat: Nama dan alamat syarikat TIDAK PERLU BOLD
  doc.setFont('helvetica', 'normal');
  doc.text('PENGARAH/PENGURUS,', marginX, y);
  y += 4.5;

  doc.text(`${namaSyarikat.toUpperCase()},`, marginX, y);
  y += 4.5;

  if (alamatBaris1 && alamatBaris1.trim() !== '') {
    doc.text(`${alamatBaris1.toUpperCase()},`, marginX, y);
    y += 4.5;
  }
  if (alamatBaris2 && alamatBaris2.trim() !== '') {
    doc.text(`${alamatBaris2.toUpperCase()}.`, marginX, y);
    y += 4.5;
  }

  y += 2.5;
  doc.text('Tuan,', marginX, y);
  y += 6;

  // 5. Tajuk Perkara (Bold, saiz seragam 9.5pt)
  doc.setFont('helvetica', 'bold');
  const cleanSesi = sesi.toUpperCase().startsWith('SESI') ? sesi.toUpperCase() : `SESI ${sesi.toUpperCase()}`;
  const subjectText = `PENEMPATAN PELAJAR UNTUK LATIHAN INDUSTRI SIJIL KOLEJ KOMUNITI ${cleanSesi}`;
  const splitSubject = doc.splitTextToSize(subjectText, contentWidth);
  doc.text(splitSubject, marginX, y);
  y += splitSubject.length * 4.5 + 2.5;

  // 6. Perenggan 1 (Normal)
  doc.setFont('helvetica', 'normal');
  const p1 = 'Dengan segala hormatnya saya merujuk kepada perkara yang tersebut di atas.';
  doc.text(p1, marginX, y);
  y += 6.5;

  // 7. Perenggan 2
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
  y = renderRichParagraph(doc, p2Segments, marginX, y, contentWidth, 4.6);
  y += 2.5;

  // 8. Perenggan 3 (Normal)
  const p3 = '3.   Untuk makluman pihak tuan, pelajar yang menjalani Latihan Industri di syarikat tuan adalah dilindungi oleh insurans kemalangan diri berkelompok.';
  const splitP3 = doc.splitTextToSize(p3, contentWidth);
  doc.text(splitP3, marginX, y);
  y += splitP3.length * 4.5 + 2.5;

  // 9. Perenggan 4
  // Syarat: Boldkan nama PPIA dan no. tel PPIA
  const p4Segments: TextSegment[] = [
    { text: '4.   Pihak Kolej Komuniti Beaufort amat berbesar hati sekiranya pihak tuan dapat mempertimbangkan untuk menyerap pelajar tersebut sebagai pekerja setelah mereka tamat menjalani Program Latihan Industri ini. Sebarang pertanyaan berhubung perkara ini boleh diajukan kepada Pegawai Perhubungan Industri dan Alumni, ' },
    { text: namaPpia, bold: true },
    { text: ' di talian ' },
    { text: noTelefonPpia, bold: true },
    { text: '.' }
  ];
  y = renderRichParagraph(doc, p4Segments, marginX, y, contentWidth, 4.6);
  y += 2.5;

  // 10. Penutup & Slogan
  doc.setFont('helvetica', 'normal');
  doc.text('Kerjasama dari pihak tuan amat dihargai.', marginX, y);
  y += 4.5;
  doc.text('Sekian, terima kasih.', marginX, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('“MALAYSIA MADANI”', marginX, y);
  y += 4.2;
  doc.text('“BERKHIDMAT UNTUK NEGARA”', marginX, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Saya yang menjalankan amanah,', marginX, y);
  y += 13;

  // 11. Tandatangan
  // Syarat: Boldkan pengarah sahaja, kolej komuniti beaufort dan kementerian pendidikan tinggi tidak perlu bold
  doc.setFont('helvetica', 'bold');
  doc.text('Pengarah,', marginX, y);
  y += 4.2;

  doc.setFont('helvetica', 'normal');
  doc.text('Kolej Komuniti Beaufort,', marginX, y);
  y += 4.2;
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

  // Rujukan di sebelah kanan atas
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(uniformFontSize);
  doc.text(`KKBS - ${rujukanSurat}`, rightHeaderX, y, { align: 'right' });
  y += 8;

  // LAMPIRAN A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('LAMPIRAN A', rightHeaderX, y, { align: 'right' });
  
  // Syarat: Senarai pelajar bawah satu space dari lampiran A
  y += 7; // Bawah satu space dari LAMPIRAN A

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('SENARAI PELAJAR', marginX, y);
  y += 6.5;

  // Jadual Lampiran A: BIL (15mm) | NAMA (100mm) | PROGRAM (55mm) = 170mm
  const colWidths = [15, 100, 55];
  const tableX = marginX;
  const rowHeight = 9.5;

  // Header Jadual
  doc.setLineWidth(0.3);
  doc.rect(tableX, y, contentWidth, rowHeight);
  doc.line(tableX + colWidths[0], y, tableX + colWidths[0], y + rowHeight);
  doc.line(tableX + colWidths[0] + colWidths[1], y, tableX + colWidths[0] + colWidths[1], y + rowHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(uniformFontSize);
  doc.text('BIL', tableX + colWidths[0] / 2, y + 6, { align: 'center' });
  doc.text('NAMA', tableX + colWidths[0] + 4, y + 6);
  doc.text('PROGRAM', tableX + colWidths[0] + colWidths[1] + 4, y + 6);
  y += rowHeight;

  // Data Senarai Pelajar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(uniformFontSize);

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

    doc.text(bilStr, tableX + colWidths[0] / 2, y + 6, { align: 'center' });

    const splitNama = doc.splitTextToSize(namaStr, colWidths[1] - 8);
    doc.text(splitNama[0] || '', tableX + colWidths[0] + 4, y + 6);

    const splitProg = doc.splitTextToSize(progStr, colWidths[2] - 8);
    doc.text(splitProg[0] || '', tableX + colWidths[0] + colWidths[1] + 4, y + 6);

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
