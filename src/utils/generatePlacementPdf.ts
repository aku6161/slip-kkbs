import { jsPDF } from 'jspdf';
import { PlacementStudentInfo, formatProgramName } from '../types';

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

/**
 * Menjana fail PDF rasmi Surat Penempatan Lapor Diri & Lampiran A
 * 100% menepati templat Google Slides:
 * https://docs.google.com/presentation/d/1Eo8sOvLi5BJMWUHOobJhLXcMhDBa7WvxqzSQTPyZC8Y/edit?usp=sharing
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
  let y = 18;

  // 1. Kepala Surat (Letterhead)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('KOLEJ KOMUNITI BEAUFORT', marginX, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI', marginX, y);
  y += 3.8;
  doc.text('KEMENTERIAN PENDIDIKAN TINGGI', marginX, y);
  y += 3.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('JALAN MELALUGUS  89807 BEAUFORT  SABAH', marginX, y);
  y += 3.2;
  doc.text('MALAYSIA', marginX, y);

  // Bahagian Kanan Kepala Surat
  const rightHeaderX = pageWidth - marginX;
  let rhY = 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Tel : 087212528', rightHeaderX, rhY, { align: 'right' });
  rhY += 3.2;
  doc.text('Faks : 087212530', rightHeaderX, rhY, { align: 'right' });
  rhY += 3.2;
  doc.text('Laman web : https://kkbeaufort.mypolycc.edu.my/', rightHeaderX, rhY, { align: 'right' });
  rhY += 3.2;
  doc.text('E-mel : adminkkbs@kkbeaufort.edu.my', rightHeaderX, rhY, { align: 'right' });

  // Garisan Melintang Kepala Surat
  y += 5;
  doc.setLineWidth(0.6);
  doc.setDrawColor(0, 0, 0);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 6;

  // 2. Rujukan & Tarikh (Sebelah Kanan)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const refLabel = `Ruj. Kami  : KKBS - ${rujukanSurat}`;
  const dateLabel = `Tarikh     : ${tarikhSurat}`;
  doc.text(refLabel, rightHeaderX, y, { align: 'right' });
  y += 4.5;
  doc.text(dateLabel, rightHeaderX, y, { align: 'right' });
  y += 7;

  // 3. Penerima Industri (Sebelah Kiri)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('PENGARAH/PENGURUS,', marginX, y);
  y += 4.5;

  doc.text(`${namaSyarikat.toUpperCase()},`, marginX, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  if (alamatBaris1 && alamatBaris1.trim() !== '') {
    doc.text(`${alamatBaris1.toUpperCase()},`, marginX, y);
    y += 4.5;
  }
  if (alamatBaris2 && alamatBaris2.trim() !== '') {
    doc.text(`${alamatBaris2.toUpperCase()}.`, marginX, y);
    y += 4.5;
  }

  y += 2;
  doc.text('Tuan,', marginX, y);
  y += 6;

  // 4. Tajuk Perkara (Bold, Upper)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  const cleanSesi = sesi.toUpperCase().startsWith('SESI') ? sesi.toUpperCase() : `SESI ${sesi.toUpperCase()}`;
  const subjectText = `PENEMPATAN PELAJAR UNTUK LATIHAN INDUSTRI SIJIL KOLEJ KOMUNITI ${cleanSesi}`;
  const splitSubject = doc.splitTextToSize(subjectText, contentWidth);
  doc.text(splitSubject, marginX, y);
  y += splitSubject.length * 4.5 + 2;

  // 5. Perenggan 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const p1 = 'Dengan segala hormatnya saya merujuk kepada perkara yang tersebut di atas.';
  doc.text(p1, marginX, y);
  y += 6.5;

  // 6. Perenggan 2
  const p2 = `2.   Sukacita dimaklumkan bahawa pelajar seperti yang tersenarai dalam lampiran akan ditempatkan di syarikat/firma tuan bagi menjalani Latihan Industri bermula ${tarikhLi}. Pelajar dikehendaki melapor diri di jabatan/firma tuan pada ${tarikhMulaLi}, jam 9.00 pagi.`;
  const splitP2 = doc.splitTextToSize(p2, contentWidth);
  doc.text(splitP2, marginX, y);
  y += splitP2.length * 4.2 + 3;

  // 7. Perenggan 3
  const p3 = '3.   Untuk makluman pihak tuan, pelajar yang menjalani Latihan Industri di syarikat tuan adalah dilindungi oleh insurans kemalangan diri berkelompok.';
  const splitP3 = doc.splitTextToSize(p3, contentWidth);
  doc.text(splitP3, marginX, y);
  y += splitP3.length * 4.2 + 3;

  // 8. Perenggan 4
  const p4 = `4.   Pihak Kolej Komuniti Beaufort amat berbesar hati sekiranya pihak tuan dapat mempertimbangkan untuk menyerap pelajar tersebut sebagai pekerja setelah mereka tamat menjalani Program Latihan Industri ini. Sebarang pertanyaan berhubung perkara ini boleh diajukan kepada Pegawai Perhubungan Industri dan Alumni, ${namaPpia} di talian ${noTelefonPpia}.`;
  const splitP4 = doc.splitTextToSize(p4, contentWidth);
  doc.text(splitP4, marginX, y);
  y += splitP4.length * 4.2 + 3.5;

  // 9. Penutup & Slogan
  doc.text('Kerjasama dari pihak tuan amat dihargai.', marginX, y);
  y += 5;
  doc.text('Sekian terima kasih.', marginX, y);
  y += 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('“MALAYSIA MADANI”', marginX, y);
  y += 4;
  doc.text('“BERKHIDMAT UNTUK NEGARA”', marginX, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Saya yang menjalankan amanah,', marginX, y);
  y += 14;

  doc.setFont('helvetica', 'bold');
  doc.text('Pengarah,', marginX, y);
  y += 4;
  doc.text('Kolej Komuniti Beaufort,', marginX, y);
  y += 4;
  doc.text('Kementerian Pendidikan tinggi.', marginX, y);

  // Nota kaki muka surat 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text('Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ==========================================
  // MUKA SURAT 2: LAMPIRAN A (SENARAI PELAJAR)
  // ==========================================
  doc.addPage();
  y = 20;

  // Header Muka Surat 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`KKBS - ${rujukanSurat}`, rightHeaderX, y, { align: 'right' });
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('SENARAI PELAJAR', marginX, y);

  doc.setFontSize(10.5);
  doc.text('LAMPIRAN A', rightHeaderX, y, { align: 'right' });
  y += 8;

  // Jadual Lampiran A: BIL (15mm) | NAMA (100mm) | PROGRAM (55mm) = 170mm
  const colWidths = [15, 100, 55];
  const tableX = marginX;
  const rowHeight = 9.5;

  // Header Table
  doc.setLineWidth(0.3);
  doc.rect(tableX, y, contentWidth, rowHeight);
  doc.line(tableX + colWidths[0], y, tableX + colWidths[0], y + rowHeight);
  doc.line(tableX + colWidths[0] + colWidths[1], y, tableX + colWidths[0] + colWidths[1], y + rowHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('BIL', tableX + colWidths[0] / 2, y + 6, { align: 'center' });
  doc.text('NAMA', tableX + colWidths[0] + 4, y + 6);
  doc.text('PROGRAM', tableX + colWidths[0] + colWidths[1] + 4, y + 6);
  y += rowHeight;

  // Data Pelajar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  for (let i = 0; i < students.length; i++) {
    const st = students[i];
    const bilStr = (i + 1).toString();
    const namaStr = (st.namaPelajar || '').toUpperCase();
    const progStr = formatProgramName(st.program || st.program || '').toUpperCase();

    // Check pagination if list is very long
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }

    doc.rect(tableX, y, contentWidth, rowHeight);
    doc.line(tableX + colWidths[0], y, tableX + colWidths[0], y + rowHeight);
    doc.line(tableX + colWidths[0] + colWidths[1], y, tableX + colWidths[0] + colWidths[1], y + rowHeight);

    doc.text(bilStr, tableX + colWidths[0] / 2, y + 6, { align: 'center' });
    
    // Nama dengan trim jika terlalu panjang
    const splitNama = doc.splitTextToSize(namaStr, colWidths[1] - 8);
    doc.text(splitNama[0] || '', tableX + colWidths[0] + 4, y + 6);

    const splitProg = doc.splitTextToSize(progStr, colWidths[2] - 8);
    doc.text(splitProg[0] || '', tableX + colWidths[0] + colWidths[1] + 4, y + 6);

    y += rowHeight;
  }

  // Nota kaki muka surat 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text('Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan', pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // Jana Blob & Object URL
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
