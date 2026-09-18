import React from 'react';
import { Student, SystemConfig } from '../../types';

interface SuratPermohonanDocProps {
  student: Student;
  config?: SystemConfig;
  onUpdate?: (updated: Partial<Student>) => void;
  isEditable?: boolean;
}

export const SuratPermohonanDoc: React.FC<SuratPermohonanDocProps> = ({
  student,
  config,
  onUpdate,
  isEditable = false,
}) => {
  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-12 max-w-4xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
      {/* Official Header / Letterhead */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/26/Coat_of_arms_of_Malaysia.svg" 
            alt="Jata Negara Malaysia" 
            className="w-16 h-auto print:w-16 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-sans">
              KOLEJ KOMUNITI BEAUFORT
            </h1>
            <p className="text-xs font-bold font-sans text-slate-800">
              JABATAN PENDIDIKAN POLITEKNIK DAN KOLEJ KOMUNITI
            </p>
            <p className="text-xs font-sans text-slate-700">
              KEMENTERIAN PENDIDIKAN TINGGI
            </p>
            <p className="text-xs font-sans text-slate-600">
              JALAN MELALUGUS, 89807 BEAUFORT, SABAH, MALAYSIA
            </p>
          </div>
        </div>
        <div className="text-right text-xs font-sans font-semibold text-slate-700 border-l-2 border-red-700 pl-3 hidden sm:block">
          <p>Tel : 087212528</p>
          <p>Faks : 087212530</p>
          <p className="text-[10px] text-slate-600">Laman web : https://kkbeaufort.mypolycc.edu.my/</p>
          <p className="text-[10px] text-slate-600">E-mel : adminkkbs@kkbeaufort.edu.my</p>
        </div>
      </div>

      {/* Reference & Date */}
      <div className="flex justify-between items-start text-xs font-sans mb-6">
        <div>
          <p className="font-semibold">Ruj. Kami: <span className="font-sans text-slate-900">{student.rujukanSurat || 'KKBFT 700-2/1/1 ( )'}</span></p>
          <p className="font-semibold">Tarikh: <span className="text-slate-900">{student.tarikhSurat || '24 Julai 2026'}</span></p>
        </div>
      </div>

      {/* Recipient Details */}
      <div className="text-sm leading-relaxed mb-6 font-sans">
        <p className="font-bold uppercase text-slate-900">KEPADA PIHAK BERKENAAN</p>
      </div>

      {/* Salutation */}
      <p className="text-sm font-sans mb-4">Tuan,</p>

      {/* Subject Line */}
      <div className="bg-slate-100 p-3 rounded font-sans font-bold text-sm text-slate-900 mb-6 border-l-4 border-red-700 uppercase tracking-wide">
        PERMOHONAN PENEMPATAN PROGRAM LATIHAN INDUSTRI PELAJAR SIJIL KOLEJ KOMUNITI (SKK) {config?.sesi || 'SESI II: 2026/2027'}
      </div>

      {/* Body Paragraphs */}
      <div className="text-sm leading-relaxed text-slate-800 space-y-4 font-sans text-justify">
        <p>
          Dengan segala hormatnya saya merujuk kepada perkara yang tersebut di atas.
        </p>

        <p>
          2. Adalah dimaklumkan bahawa pelajar seperti berikut merupakan pelajar berdaftar di Kolej Komuniti Beaufort.
        </p>

        {/* Student Particulars Table */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4 text-xs font-sans space-y-2 max-w-xl">
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-600">Nama</span>
            <span className="col-span-2 font-bold text-slate-900 uppercase">: {student.namaPelajar}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-600">No. Kad Pengenalan</span>
            <span className="col-span-2 text-slate-900">: {student.noIc}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-600">No. Pendaftaran</span>
            <span className="col-span-2 font-sans font-bold text-blue-900">: {student.noMatrik}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-600">Program</span>
            <span className="col-span-2 text-slate-900">: {student.program?.toUpperCase()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-1.5">
            <span className="font-bold text-slate-600">Tempoh</span>
            <span className="col-span-2 font-bold text-slate-900">: {config?.tempoh || '4 BULAN (16 MINGGU)'}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <span className="font-bold text-slate-600">Tarikh</span>
            <span className="col-span-2 text-slate-900">: {config?.tarikh || '30 NOVEMBER 2026 HINGGA 19 MAC 2027'}</span>
          </div>
        </div>

        <p>
          3. Sehubungan dengan itu, diharap pihak tuan dapat mempertimbangkan permohonan pelajar ini untuk menjalani latihan industri di syarikat tuan. Pihak kami juga amat berbesar hati jika pelajar ini dapat diserapkan terus ke syarikat tuan sekiranya menepati kriteria dan spesifikasi organisasi tuan setelah tamat latihan industri.
        </p>

        <p>
          4. Bersama-sama ini dilampirkan <strong>Resume Pelajar</strong>, <strong>Borang BJPLI</strong> dan <strong>Borang Skop Latihan Pelajar Latihan Industri</strong> untuk perhatian dan tindakan tuan. Sekiranya pihak tuan bersetuju menerima pelajar kami, kerjasama pihak tuan adalah diharapkan untuk melengkapkan dan mengembalikan Borang Jawapan Penempatan Latihan Industri (BJPLI) bersama Borang Skop Latihan Pelajar Latihan Industri selewat-lewatnya pada <strong>{config?.tarikhAkhirJawapan || '30 OKTOBER 2026'}</strong>. Surat rasmi akan menyusul sebelum pelajar melapor diri di syarikat tuan.
        </p>

        <p>
          5. Sebarang pertanyaan mengenai perkara ini, mohon berhubung dengan <strong>{config?.namaPpia || 'SHAMSUDDIN BIN AMIN'}</strong>, Pegawai Perhubungan Industri dan Alumni di talian <strong>{config?.noTelefonPpia || '012-2455616'}</strong>.
        </p>

        <p>
          Kerjasama pihak tuan amat dihargai.
        </p>

        <p>
          Sekian, terima kasih.
        </p>
      </div>

      {/* Slogans */}
      <div className="mt-8 text-xs font-sans font-bold space-y-1 text-slate-900">
        <p>"MALAYSIA MADANI"</p>
        <p>"BERKHIDMAT UNTUK NEGARA"</p>
      </div>

      {/* Signature Section */}
      <div className="mt-8 pt-4 border-t border-slate-200 text-xs font-sans flex justify-between items-end">
        <div>
          <p className="text-slate-800 mb-8">Saya yang menjalankan amanah,</p>
          <p className="font-bold text-slate-900">Pengarah,</p>
          <p className="text-slate-700">Kolej Komuniti Beaufort,</p>
          <p className="text-slate-600">Kementerian Pendidikan Tinggi.</p>
        </div>

        <div className="bg-slate-50 p-3 rounded border border-slate-200 max-w-xs text-right">
          <p className="text-[10px] text-slate-500 italic">
            Surat ini adalah cetakan komputer dan tandatangan tidak diperlukan.
          </p>
        </div>
      </div>
    </div>
  );
};
