/**
 * ============================================================================
 * SISTEM LATIHAN INDUSTRI PELAJAR (SLIP) - GOOGLE APPS SCRIPT BACKEND (v2.1)
 * ============================================================================
 * Skrip ini menghubungkan Web App SLIP ke Google Sheets dan Gmail anda untuk:
 * 1. Membaca data pelajar secara langsung (GET).
 * 2. Menyimpan status permohonan & data BJPLI secara kekal (POST).
 * 3. Menguruskan tetapan latihan industri terkini (Sesi, Tarikh, Tempoh) di helaian "TETAPAN_SISTEM".
 * 4. Menjana surat permohonan PDF secara automatik berdasarkan template Google Slides
 *    dan menghantarnya ke emel HR Industri apabila status bertukar ke "Memohon" (POST).
 * ============================================================================
 */

var SHEET_NAME = "Form Responses 1"; // Sila tukar mengikut nama tab helaian anda jika berbeza

// ==========================================
// KONFIGURASI GOOGLE DRIVE & TEMPLATE SLIDES
// Sila pastikan anda menggantikan ID di bawah dengan ID daripada akaun Google Drive/Slides anda sendiri.
// ==========================================
var GOOGLE_DRIVE_PARENT_FOLDER_ID = "17Lha5OMy2st2W_hpJmZgaOVx5NjofkIH"; 
var TEMPLATE_KULINARI_ID = "1CWGwlsXoCB6o-rR3WnAg2nyttBOT8chVZ1qtnwvAfZ8";
var TEMPLATE_HOTEL_ID = "1jDt2oVc57XMCfC-hwsLuE0vDQbPkwNyNyjD-gkj-fks";
var TEMPLATE_ELEKTRIK_ID = "1m0x1MMTsXbTaKupFt4j7cPrQrEMwgPAmP1LNwGQVHHg";

/**
 * SETUP: Jalankan fungsi ini sekali sahaja di Editor Apps Script untuk persediaan.
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  
  // Pastikan ruangan Status dan BJPLI ada di hujung lajur
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  var requiredHeaders = ["STATUS", "BJPLI_DATA", "RUJUKAN_SURAT", "TARIKH_SURAT", "KELAS"];
  for (var i = 0; i < requiredHeaders.length; i++) {
    if (headers.indexOf(requiredHeaders[i]) === -1) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue(requiredHeaders[i]);
      Logger.log("Lajur baru ditambah: " + requiredHeaders[i]);
    }
  }
  
  // Buat helaian tetapan sistem jika belum wujud
  var configSheet = ss.getSheetByName("TETAPAN_SISTEM");
  var newConfigHeaders = ["SESI_LATIHAN", "TARIKH_LATIHAN", "TEMPOH_LATIHAN", "TARIKH_AKHIR_JAWAPAN", "NAMA_PPIA", "NO_TELEFON_PPIA", "TARIKH_PEMANTAUAN", "TARIKH_PEMBENTANGAN", "TARIKH_KEPUTUSAN"];
  var newConfigDefaults = ["SESI I 2026/2027", "30 NOVEMBER 2026 HINGGA 19 MAC 2027", "4 BULAN (16 MINGGU)", "15 OKTOBER 2026", "SHAMSUDDIN BIN AMIN", "012-2455616", "15 JANUARI 2027 HINGGA 15 FEBRUARI 2027", "22 MAC 2027 HINGGA 26 MAC 2027", "5 APRIL 2027"];

  if (!configSheet) {
    configSheet = ss.insertSheet("TETAPAN_SISTEM");
    configSheet.appendRow(newConfigHeaders);
    configSheet.appendRow(newConfigDefaults);
    Logger.log("Helaian TETAPAN_SISTEM berjaya disediakan!");
  } else {
    // Jika helaian wujud, pastikan lajur baharu ditambah jika tiada
    configSheet.getRange(1, 1, 1, newConfigHeaders.length).setValues([newConfigHeaders]);
    
    // Pastikan baris 2 mempunyai nilai (jika ruangan baru kosong, masukkan default)
    var row2Values = configSheet.getRange(2, 1, 1, newConfigHeaders.length).getValues()[0];
    var updatedRow2 = [];
    for (var k = 0; k < newConfigHeaders.length; k++) {
      updatedRow2.push(row2Values[k] || newConfigDefaults[k]);
    }
    configSheet.getRange(2, 1, 1, newConfigHeaders.length).setValues([updatedRow2]);
    Logger.log("Helaian TETAPAN_SISTEM sedia ada berjaya dikemaskini dengan lajur baharu!");
  }
  
  // Mencetuskan dialog kebenaran (Authorization) untuk Google Drive, Slides, dan Gmail
  try {
    DriveApp.getRootFolder();
    var tempPres = SlidesApp.create("Temp Auth Slides");
    DriveApp.getFileById(tempPres.getId()).setTrashed(true);
    GmailApp.getInboxThreads();
  } catch(e) {
    // Abaikan ralat, kita hanya mahu mencetuskan dialog kebenaran
  }

  Logger.log("Persediaan Sistem SLIP berjaya!");
}

/**
 * GET: Membaca data dari Google Sheet (Senarai pelajar + Tetapan Sistem)
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Cari index lajur dinamik
    var idxMatrik = headers.indexOf("NO. MATRIK");
    
    var students = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[idxMatrik]) continue;
      
      var studentObj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j].toString().trim();
        studentObj[key] = row[j];
      }
      students.push(studentObj);
    }
    
    // Ambil tetapan sistem
    var configSheet = ss.getSheetByName("TETAPAN_SISTEM");
    var config = {
      sesi: "SESI I 2026/2027",
      tarikh: "30 NOVEMBER 2026 HINGGA 19 MAC 2027",
      tempoh: "4 BULAN (16 MINGGU)",
      tarikhAkhirJawapan: "15 OKTOBER 2026",
      namaPpia: "SHAMSUDDIN BIN AMIN",
      noTelefonPpia: "012-2455616",
      tarikhPemantauan: "15 JANUARI 2027 HINGGA 15 FEBRUARI 2027",
      tarikhPembentangan: "22 MAC 2027 HINGGA 26 MAC 2027",
      tarikhKeputusan: "5 APRIL 2027"
    };
    if (configSheet) {
      var configData = configSheet.getDataRange().getValues();
      if (configData.length > 1) {
        config.sesi = configData[1][0] || config.sesi;
        config.tarikh = configData[1][1] || config.tarikh;
        config.tempoh = configData[1][2] || config.tempoh;
        config.tarikhAkhirJawapan = configData[1][3] || config.tarikhAkhirJawapan;
        config.namaPpia = configData[1][4] || config.namaPpia;
        config.noTelefonPpia = configData[1][5] || config.noTelefonPpia;
        config.tarikhPemantauan = configData[1][6] || config.tarikhPemantauan;
        config.tarikhPembentangan = configData[1][7] || config.tarikhPembentangan;
        config.tarikhKeputusan = configData[1][8] || config.tarikhKeputusan;
      }
    }

    // Ambil data Markah Pelajar
    var markahSheet = ss.getSheetByName("MARKAH_PELAJAR");
    var markahData = [];
    var markahHeaders = [];
    if (markahSheet) {
      var fullData = markahSheet.getDataRange().getValues();
      if (fullData.length > 0) {
        markahHeaders = fullData[0];
        for (var i = 1; i < fullData.length; i++) {
          var row = fullData[i];
          var rowObj = {};
          for (var j = 0; j < markahHeaders.length; j++) {
            var key = markahHeaders[j].toString().trim();
            var val = row[j];
            if (val !== undefined && val !== null) {
              var strVal = val.toString().trim();
              if (strVal.indexOf(',') !== -1 && !strVal.startsWith('0') && !isNaN(strVal.replace(',', '.'))) {
                var parseFloatVal = parseFloat(strVal.replace(',', '.'));
                if (!isNaN(parseFloatVal)) {
                  val = parseFloatVal;
                }
              }
            }
            rowObj[key] = val;
          }
          markahData.push(rowObj);
        }
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        students: students, 
        config: config,
        markah: markahData,
        markahHeaders: markahHeaders
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST: Menguruskan kemas kini status, tetapan sistem, dan penghantaran emel
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action; // "update_student", "send_email", "add_student", "update_config"
    
    if (action === "update_student") {
      return handleUpdateStudent(postData);
    } else if (action === "send_email") {
      return handleSendEmail(postData);
    } else if (action === "add_student") {
      return handleAddStudent(postData);
    } else if (action === "update_config") {
      return handleUpdateConfig(postData);
    } else if (action === "update_student_mark") {
      return handleUpdateStudentMark(postData);
    } else if (action === "trigger_backup" || action === "backup_data") {
      return handleTriggerBackup();
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: "Aksi tidak dikenali" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Kemas kini Sesi, Tarikh, dan Tempoh Latihan Industri terkini
 */
function handleUpdateConfig(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName("TETAPAN_SISTEM");
  if (!configSheet) {
    configSheet = ss.insertSheet("TETAPAN_SISTEM");
    configSheet.appendRow(["SESI_LATIHAN", "TARIKH_LATIHAN", "TEMPOH_LATIHAN", "TARIKH_AKHIR_JAWAPAN", "NAMA_PPIA", "NO_TELEFON_PPIA", "TARIKH_PEMANTAUAN", "TARIKH_PEMBENTANGAN", "TARIKH_KEPUTUSAN"]);
  }
  
  // Tulis tetapan ke baris 2
  configSheet.getRange(2, 1, 1, 9).setValues([[
    (payload.config.sesi || '').toString().toUpperCase(),
    (payload.config.tarikh || '').toString().toUpperCase(),
    (payload.config.tempoh || '').toString().toUpperCase(),
    (payload.config.tarikhAkhirJawapan || '').toString().toUpperCase(),
    (payload.config.namaPpia || '').toString().toUpperCase(),
    (payload.config.noTelefonPpia || '').toString().toUpperCase(),
    (payload.config.tarikhPemantauan || '').toString().toUpperCase(),
    (payload.config.tarikhPembentangan || '').toString().toUpperCase(),
    (payload.config.tarikhKeputusan || '').toString().toUpperCase()
  ]]);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: "Tetapan latihan berjaya dikemas kini di Google Sheet!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Dapatkan atau bina folder khas pelajar berdasarkan Nama dan No Matrik
 */
function getOrCreateStudentFolder(student) {
  var parentFolderId = GOOGLE_DRIVE_PARENT_FOLDER_ID;
  var parentFolder = DriveApp.getFolderById(parentFolderId);
  var folderName = student.namaPelajar;
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

/**
 * Menjana surat permohonan rasmi PDF dari Google Slides template dan menghantar emel ke HR
 */
function generateAndSendPdfEmail(student) {
  var program = student.program || "";
  var templateId = "";
  
  // Pilih template mengikut program pengajian
  if (program.toUpperCase().includes("KULINARI")) {
    templateId = TEMPLATE_KULINARI_ID;
  } else if (program.toUpperCase().includes("HOTEL") || program.toUpperCase().includes("PERHOTELAN") || program.toUpperCase().includes("SOP")) {
    templateId = TEMPLATE_HOTEL_ID;
  } else if (program.toUpperCase().includes("ELEKTRIK") || program.toUpperCase().includes("SKE") || program.toUpperCase().includes("TEKNOLOGI ELEKTRIK")) {
    templateId = TEMPLATE_ELEKTRIK_ID;
  } else {
    // Fallback jika tiada padanan
    templateId = TEMPLATE_HOTEL_ID;
  }

  var recipientEmail = student.emelHrSyarikat;
  if (!recipientEmail) return false;

  // Dapatkan tetapan sistem terkini untuk disuntik ke dalam template
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName("TETAPAN_SISTEM");
  var config = {
    sesi: student.sesi || "SESI I 2026/2027",
    tarikh: "30 NOVEMBER 2026 HINGGA 19 MAC 2027",
    tempoh: "4 BULAN (16 MINGGU)",
    tarikhAkhirJawapan: "15 OKTOBER 2026",
    namaPpia: "SHAMSUDDIN BIN AMIN",
    noTelefonPpia: "012-2455616"
  };
  if (configSheet) {
    var configData = configSheet.getDataRange().getValues();
    if (configData.length > 1) {
      config.sesi = configData[1][0] || config.sesi;
      config.tarikh = configData[1][1] || config.tarikh;
      config.tempoh = configData[1][2] || config.tempoh;
      config.tarikhAkhirJawapan = configData[1][3] || config.tarikhAkhirJawapan;
      config.namaPpia = configData[1][4] || config.namaPpia;
      config.noTelefonPpia = configData[1][5] || config.noTelefonPpia;
    }
  }

  // 1. Sediakan folder khas pelajar di Google Drive
  var studentFolder = getOrCreateStudentFolder(student);
  
  // Bersihkan fail lama di dalam folder untuk mengelakkan pertindihan
  var files = studentFolder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    try {
      file.setTrashed(true);
    } catch(err) {
      // Abaikan jika tidak boleh buang
    }
  }

  var attachments = [];

  var placeholders = {
    // Format Bracket [...]
    "[NAMA PELAJAR]": student.namaPelajar,
    "[NAMA]": student.namaPelajar,
    "[NO KAD PENGENALAN]": student.noIc,
    "[NO. KAD PENGENALAN]": student.noIc,
    "[NO KP]": student.noIc,
    "[NO. KP]": student.noIc,
    "[NO MATRIK]": student.noMatrik,
    "[NO. MATRIK]": student.noMatrik,
    "[PROGRAM]": student.program,
    "[PROGRAM PENGAJIAN]": student.program,
    "[SESI LATIHAN INDUSTRI]": config.sesi,
    "[SESI LI]": config.sesi,
    "[SESI]": config.sesi,
    "[ALAMAT]": student.alamat,
    "[ALAMAT PELAJAR]": student.alamat,
    "[RUJUKAN SURAT]": student.rujukanSurat || "",
    "[RUJUKAN KAMI]": student.rujukanSurat || "",
    "[RUJUKAN]": student.rujukanSurat || "",
    "[TARIKH SURAT]": student.tarikhSurat || "",
    "[TARIKH]": student.tarikhSurat || "",
    "[TARIKH LATIHAN]": config.tarikh,
    "[TARIKH LI]": config.tarikh,
    "[TEMPOH LATIHAN]": config.tempoh,
    "[TEMPOH LI]": config.tempoh,
    "[TEMPOH]": config.tempoh,
    "[NAMA SYARIKAT]": student.namaSyarikat || "",
    "[NAMA INDUSTRI]": student.namaSyarikat || "",
    "[INDUSTRI]": student.namaSyarikat || "",
    "[EMEL HR]": student.emelHrSyarikat || "",
    "[NAMA PA]": student.namaPa || "",
    "[NO TEL PA]": student.noTelefonPa || "",
    "[NO. TEL PA]": student.noTelefonPa || "",
    "[NO TELEFON PA]": student.noTelefonPa || "",
    "[NO. TELEFON PA]": student.noTelefonPa || "",
    "[EMEL PA]": student.emelPa || "",
    "[TARIKH AKHIR JAWAPAN]": config.tarikhAkhirJawapan || "",
    "[NAMA PPIA]": config.namaPpia || "",
    "[NO TEL PPIA]": config.noTelefonPpia || "",
    "[NO. TEL PPIA]": config.noTelefonPpia || "",
    "[NO TELEFON PPIA]": config.noTelefonPpia || "",
    "[NO. TELEFON PPIA]": config.noTelefonPpia || "",
    "[JAWATAN]": student.jawatanKkbs || "TIADA",
    "[NAMA SEKOLAH MENENGAH]": student.namaSekolahMenengah || "",
    "[PROGRAM 1]": student.programKkbs1 || "",
    "[PROGRAM 2]": student.programKkbs2 || "",
    "[PROGRAM 3]": student.programKkbs3 || "",
    "[PENCAPAIAN 1]": student.pencapaian1 || "",
    "[PENCAPAIAN 2]": student.pencapaian2 || "",
    "[PENCAPAIAN 3]": student.pencapaian3 || "",
    "[NO. TELEFON]": student.noTelefon || "",
    "[NO TELEFON]": student.noTelefon || "",
    "[NO TEL PELAJAR]": student.noTelefon || "",
    "[EMEL PELAJAR]": student.emelPelajar || "",
    
    // Format Double-Brace {{...}}
    "{{NAMA_PELAJAR}}": student.namaPelajar,
    "{{NAMA}}": student.namaPelajar,
    "{{NO_KP}}": student.noIc,
    "{{NO_IC}}": student.noIc,
    "{{IC}}": student.noIc,
    "{{NO_MATRIK}}": student.noMatrik,
    "{{MATRIK}}": student.noMatrik,
    "{{PROGRAM}}": student.program,
    "{{SESI}}": config.sesi,
    "{{SESI_LATIHAN}}": config.sesi,
    "{{ALAMAT}}": student.alamat,
    "{{RUJUKAN_SURAT}}": student.rujukanSurat || "",
    "{{RUJUKAN}}": student.rujukanSurat || "",
    "{{RUJ_KAMI}}": student.rujukanSurat || "",
    "{{TARIKH_SURAT}}": student.tarikhSurat || "",
    "{{TARIKH}}": student.tarikhSurat || "",
    "{{TARIKH_LATIHAN}}": config.tarikh,
    "{{TARIKH_LI}}": config.tarikh,
    "{{TEMPOH_LATIHAN}}": config.tempoh,
    "{{TEMPOH_LI}}": config.tempoh,
    "{{TEMPOH}}": config.tempoh,
    "{{NAMA_SYARIKAT}}": student.namaSyarikat || "",
    "{{NAMA_INDUSTRI}}": student.namaSyarikat || "",
    "{{INDUSTRI}}": student.namaSyarikat || "",
    "{{EMEL_HR}}": student.emelHrSyarikat || "",
    "{{NAMA_PA}}": student.namaPa || "",
    "{{NO_TEL_PA}}": student.noTelefonPa || "",
    "{{NO_TELEFON_PA}}": student.noTelefonPa || "",
    "{{EMEL_PA}}": student.emelPa || "",
    "{{TARIKH_AKHIR_JAWAPAN}}": config.tarikhAkhirJawapan || "",
    "{{NAMA_PPIA}}": config.namaPpia || "",
    "{{NO_TEL_PPIA}}": config.noTelefonPpia || "",
    "{{NO_TELEFON_PPIA}}": config.noTelefonPpia || "",
    "{{JAWATAN}}": student.jawatanKkbs || "TIADA",
    "{{JAWATAN_KKBS}}": student.jawatanKkbs || "TIADA",
    "{{NAMA_SEKOLAH_MENENGAH}}": student.namaSekolahMenengah || "",
    "{{SEKOLAH}}": student.namaSekolahMenengah || "",
    "{{PROGRAM_1}}": student.programKkbs1 || "",
    "{{PROGRAM_2}}": student.programKkbs2 || "",
    "{{PROGRAM_3}}": student.programKkbs3 || "",
    "{{PENCAPAIAN_1}}": student.pencapaian1 || "",
    "{{PENCAPAIAN_2}}": student.pencapaian2 || "",
    "{{PENCAPAIAN_3}}": student.pencapaian3 || "",
    "{{NO_TELEFON}}": student.noTelefon || "",
    "{{NO_TEL}}": student.noTelefon || "",
    "{{NO_TEL_PELAJAR}}": student.noTelefon || "",
    "{{EMEL_PELAJAR}}": student.emelPelajar || ""
  };

  // 2. Bina SATU FAIL PDF TUNGGAL bernama "PERMOHONAN.pdf" (mengandungi semua muka surat template)
  var docName = "PERMOHONAN";
  var tempFile = DriveApp.getFileById(templateId).makeCopy(docName, studentFolder);
  var tempId = tempFile.getId();

  try {
    var presentation = SlidesApp.openById(tempId);
    for (var key in placeholders) {
      presentation.replaceAllText(key, placeholders[key]);
    }
    presentation.saveAndClose();

    // Eksport sebagai 1 fail PDF tunggal
    var pdfBlob = tempFile.getAs(MimeType.PDF).setName(docName + ".pdf");
    studentFolder.createFile(pdfBlob);
    
    // Pastikan lampiran HANYA 1 fail PDF tunggal ini sahaja
    attachments = [pdfBlob];
  } catch (e) {
    Logger.log("Ralat menjana fail Dokumen Permohonan LI: " + e.toString());
  } finally {
    try { DriveApp.getFileById(tempId).setTrashed(true); } catch (e) {}
  }

  // 6. Hantar emel ke HR, CC ke pelajar & PA, ReplyTo ke pelajar
  try {
    var subject = "PERMOHONAN UNTUK MENJALANKAN LATIHAN INDUSTRI - KOLEJ KOMUNITI BEAUFORT";
    
    var today = new Date();
    var deadlineDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 minggu dari sekarang
    var deadlineStr = deadlineDate.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });

    var bodyPlain = "Assalamualaikum dan salam Sejahtera.\n\n" +
                    "Tuan/Puan,\n\n" +
                    "Dengan segala hormatnya saya merujuk perkara di atas.\n\n" +
                    "2. Saya, " + student.namaPelajar + " (No. Kad Pengenalan: " + student.noIc + "), pelajar " + student.program + " dari Kolej Komuniti Beaufort, dengan hormatnya memohon pertimbangan pihak tuan/puan untuk menerima saya menjalani Latihan Industri bagi " + config.sesi + " yang dijadualkan bermula pada " + config.tarikh + ".\n\n" +
                    "3. Bersama-sama ini dilampirkan Resume Pelajar, Borang BJPLI dan Borang Skop Latihan Pelajar Latihan Industri untuk perhatian dan tindakan tuan. Sekiranya pihak tuan bersetuju menerima pelajar kami, kerjasama pihak tuan adalah diharapkan untuk melengkapkan dan mengembalikan Borang Jawapan Penempatan Latihan Industri (BJPLI) bersama Borang Skop Latihan Pelajar Latihan Industri selewat-lewatnya pada " + config.tarikhAkhirJawapan + ". Sebarang pertanyaan mengenai perkara ini, mohon berhubung dengan " + config.namaPpia + ", Pegawai Perhubungan Industri dan Alumni di talian " + config.noTelefonPpia + ".\n\n" +
                    "Sekian, terima kasih.\n\n" +
                    "Yang benar,\n" +
                    student.namaPelajar + "\n" +
                    "No. Telefon: " + (student.noTelefon || "-") + "\n" +
                    "Emel: " + (student.emelPelajar || "-");

    var ccEmails = [];
    if (student.emelPelajar) {
      ccEmails.push(student.emelPelajar);
    }
    if (student.emelPa) {
      ccEmails.push(student.emelPa);
    }

    var mailOptions = {
      attachments: attachments,
      name: "Unit Perhubungan Industri & Alumni KKBS"
    };

    if (ccEmails.length > 0) {
      mailOptions.cc = ccEmails.join(",");
    }
    if (student.emelPelajar) {
      mailOptions.replyTo = student.emelPelajar;
    }

    GmailApp.sendEmail(recipientEmail, subject, bodyPlain, mailOptions);
    return true;
  } catch(e) {
    Logger.log("Ralat hantar emel: " + e.toString());
    throw e;
  }
}

/**
 * Kemas kini status pelajar dan data BJPLI di Google Sheet
 */
function handleUpdateStudent(payload) {
  var noMatrik = payload.noMatrik;
  var status = payload.status;
  var bjpliData = payload.bjpliData;
  var rujukanSurat = payload.rujukanSurat;
  var tarikhSurat = payload.tarikhSurat;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var idxMatrik = headers.indexOf("NO. MATRIK");
  var idxStatus = headers.indexOf("STATUS");
  var idxBjpli = headers.indexOf("BJPLI_DATA");
  var idxRujukan = headers.indexOf("RUJUKAN_SURAT");
  var idxTarikhSurat = headers.indexOf("TARIKH_SURAT");
  
  var rowFound = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idxMatrik].toString().trim() === noMatrik.toString().trim()) {
      rowFound = i + 1; // 1-indexed row number
      break;
    }
  }
  
  if (rowFound === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Pelajar tidak dijumpai" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var prevStatus = "";
  if (idxStatus !== -1) {
    prevStatus = sheet.getRange(rowFound, idxStatus + 1).getValue().toString().trim();
  }

  // Tulis data baharu
  if (idxStatus !== -1 && status !== undefined) {
    sheet.getRange(rowFound, idxStatus + 1).setValue(status);
  }
  if (idxBjpli !== -1 && bjpliData !== undefined) {
    sheet.getRange(rowFound, idxBjpli + 1).setValue(typeof bjpliData === 'object' ? JSON.stringify(bjpliData) : bjpliData);
  }
  if (idxRujukan !== -1 && rujukanSurat !== undefined) {
    sheet.getRange(rowFound, idxRujukan + 1).setValue(rujukanSurat);
  }
  if (idxTarikhSurat !== -1 && tarikhSurat !== undefined) {
    sheet.getRange(rowFound, idxTarikhSurat + 1).setValue(tarikhSurat);
  }
  
  // Hantar emel automatik jika status ditukar kepada "Memohon"
  var emailErrorMsg = null;
  if (status === "Memohon" && prevStatus !== "Memohon") {
    var updatedStudent = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().trim();
      updatedStudent[key] = sheet.getRange(rowFound, j + 1).getValue();
    }
    
    var sObj = {
      namaPelajar: updatedStudent["NAMA PELAJAR"],
      noIc: updatedStudent["NO. KAD PENGENALAN"],
      noMatrik: updatedStudent["NO. MATRIK"],
      program: updatedStudent["PROGRAM"],
      sesi: updatedStudent["SESI LATIHAN INDUSTRI"] || updatedStudent["Sesi Latihan Industri"] || updatedStudent["Sesi"] || updatedStudent["SESI"],
      noTelefon: updatedStudent["NO. TELEFON"],
      emelPelajar: updatedStudent["EMEL PELAJAR"],
      alamat: updatedStudent["ALAMAT"],
      rujukanSurat: updatedStudent["RUJUKAN_SURAT"],
      tarikhSurat: updatedStudent["TARIKH_SURAT"],
      namaSyarikat: updatedStudent["NAMA INDUSTRI"],
      emelHrSyarikat: updatedStudent["EMEL HR SYARIKAT YANG DIPILIH"],
      emelPa: updatedStudent["EMEL PA"],
      namaPa: updatedStudent["NAMA PA"],
      noTelefonPa: updatedStudent["NO. TELEFON PA"]
    };
    
    if (sObj.emelHrSyarikat) {
      try {
        generateAndSendPdfEmail(sObj);
      } catch(e) {
        emailErrorMsg = e.toString();
        Logger.log("Gagal hantar emel automatik semasa update: " + emailErrorMsg);
      }
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Data pelajar berjaya dikemas kini di Google Sheet!" + (emailErrorMsg ? " PENTING: Namun, emel gagal dihantar: " + emailErrorMsg : ""),
      emailError: emailErrorMsg
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Menghantar Emel Surat Permohonan & Dokumen ke HR secara manual (Triggered from admin UI)
 */
function handleSendEmail(payload) {
  var sObj = {
    namaPelajar: payload.namaPelajar,
    noIc: payload.noIc,
    noMatrik: payload.noMatrik,
    program: payload.program,
    sesi: payload.sesi,
    noTelefon: payload.noTelefon,
    emelPelajar: payload.emelPelajar,
    alamat: payload.alamat,
    rujukanSurat: payload.rujukanSurat,
    tarikhSurat: payload.tarikhSurat,
    namaSyarikat: payload.namaSyarikat,
    emelHrSyarikat: payload.emelHrSyarikat,
    emelPa: payload.emelPa,
    namaPa: payload.namaPa,
    noTelefonPa: payload.noTelefonPa
  };
  
  if (!sObj.emelHrSyarikat) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Emel HR tidak diisi" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    generateAndSendPdfEmail(sObj);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: "Emel permohonan berjaya dihantar ke HR!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Menambah permohonan pelajar baru ke Google Sheet
 */
function handleAddStudent(payload) {
  var student = payload.student;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var idxIc = headers.indexOf("NO. KAD PENGENALAN");
  var idxMatrik = headers.indexOf("NO. MATRIK");
  
  var rowFound = -1;
  for (var i = 1; i < data.length; i++) {
    var matchIc = idxIc !== -1 && data[i][idxIc].toString().trim() === student.noIc.toString().trim();
    var matchMatrik = idxMatrik !== -1 && data[i][idxMatrik].toString().trim() === student.noMatrik.toString().trim();
    if (matchIc || matchMatrik) {
      rowFound = i + 1; // 1-indexed row number
      break;
    }
  }
  
  // Sediakan baris data
  var rowValues = [];
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i].toString().trim();
    var val = "";
    if (header === "Timestamp") {
      val = student.timestamp || new Date().toLocaleString();
    } else if (header === "Email Address") {
      val = student.email || "";
    } else if (header.toUpperCase() === "SESI LATIHAN INDUSTRI" || header.toUpperCase() === "SESI") {
      val = student.sesi || "";
    } else if (header === "NAMA PELAJAR") {
      val = student.namaPelajar || "";
    } else if (header === "NO. KAD PENGENALAN") {
      val = student.noIc || "";
    } else if (header === "NO. MATRIK") {
      val = student.noMatrik || "";
    } else if (header === "PROGRAM") {
      val = student.program || "";
    } else if (header === "NO. TELEFON") {
      val = student.noTelefon || "";
    } else if (header === "EMEL PELAJAR") {
      val = student.emelPelajar || "";
    } else if (header === "ALAMAT") {
      val = student.alamat || "";
    } else if (header === "NAMA SEKOLAH MENENGAH") {
      val = student.namaSekolahMenengah || "";
    } else if (header === "JAWATAN YANG PERNAH DISANDANG DI KKBS" || header === "JAWATAN KKBS") {
      val = student.jawatanKkbs || "TIADA";
    } else if (header === "PROGRAM 1 YANG PERNAH DIIKUTI DI KKBS") {
      val = student.programKkbs1 || "";
    } else if (header === "PROGRAM 2 YANG PERNAH DIIKUTI DI KKBS") {
      val = student.programKkbs2 || "";
    } else if (header === "PROGRAM 3 YANG PERNAH DIIKUTI DI KKBS") {
      val = student.programKkbs3 || "";
    } else if (header === "PENCAPAIAN 1") {
      val = student.pencapaian1 || "";
    } else if (header === "PENCAPAIAN 2") {
      val = student.pencapaian2 || "";
    } else if (header === "PENCAPAIAN 3") {
      val = student.pencapaian3 || "";
    } else if (header === "NAMA PA") {
      val = student.namaPa || "";
    } else if (header === "NO. TELEFON PA") {
      val = student.noTelefonPa || "";
    } else if (header === "EMEL PA") {
      val = student.emelPa || "";
    } else if (header === "NAMA INDUSTRI") {
      val = student.namaSyarikat || "";
    } else if (header === "EMEL HR SYARIKAT YANG DIPILIH") {
      val = student.emelHrSyarikat || "";
    } else if (header === "STATUS") {
      val = student.status || "Memohon";
    } else if (header === "BJPLI_DATA") {
      val = student.bjpliData ? (typeof student.bjpliData === 'object' ? JSON.stringify(student.bjpliData) : student.bjpliData) : "";
    } else if (header === "RUJUKAN_SURAT") {
      val = student.rujukanSurat || "";
    } else if (header === "TARIKH_SURAT") {
      val = student.tarikhSurat || "";
    } else if (header === "KELAS") {
      val = student.kelas || "";
    }
    rowValues.push(val);
  }
  
  if (rowFound !== -1) {
    sheet.getRange(rowFound, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  
  // Hantar emel automatik jika status permohonan baharu adalah "Memohon"
  var emailErrorMsg = null;
  if (student.status === "Memohon" && student.emelHrSyarikat) {
    try {
      generateAndSendPdfEmail(student);
    } catch (e) {
      emailErrorMsg = e.toString();
      Logger.log("Gagal hantar emel automatik semasa tambah/kemaskini pelajar: " + emailErrorMsg);
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Permohonan berjaya ditambah/dikemaskini di Google Sheet!" + (emailErrorMsg ? " PENTING: Namun, emel gagal dihantar: " + emailErrorMsg : ""),
      emailError: emailErrorMsg
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Kemaskini markah pemantauan pelajar di tab MARKAH_PELAJAR
 */
function handleUpdateStudentMark(payload) {
  var noMatrik = payload.noMatrik;
  var marks = payload.marks; // Array of 10 numeric/string values for columns AF to AO
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("MARKAH_PELAJAR");
  if (!sheet) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Tab MARKAH_PELAJAR tidak ditemui." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Cari index lajur NO. MATRIK atau NO PENDAFTARAN
  var idxMatrik = -1;
  for (var i = 0; i < headers.length; i++) {
    var h = headers[i].toString().toUpperCase().trim();
    if (h === "NO. MATRIK" || h === "NO MATRIK" || h === "NO PENDAFTARAN" || h === "NO. PENDAFTARAN") {
      idxMatrik = i;
      break;
    }
  }
  
  if (idxMatrik === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Lajur NO. MATRIK / NO PENDAFTARAN tidak ditemui dalam tab MARKAH_PELAJAR." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var rowFound = -1;
  for (var i = 1; i < data.length; i++) {
    if (data[i][idxMatrik].toString().trim() === noMatrik.toString().trim()) {
      rowFound = i + 1; // 1-indexed row number
      break;
    }
  }
  
  if (rowFound === -1) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: "Pelajar dengan No. Matrik " + noMatrik + " tidak ditemui dalam tab MARKAH_PELAJAR." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Tulis data ke kolum AF (32) hingga AP (42). 
  // Pastikan ruangan header di baris 1 diisi
  var newHeaders = ["FLI02-C1", "FLI02-C2", "TOTAL7", "FLI02-C3", "FLI02-C4", "TOTAL8", "FLI02-C5", "FLI02-C6", "TOTAL9", "GRAN TOTAL2", "FLI02-ULASAN"];
  var currentHeadersRange = sheet.getRange(1, 32, 1, 11);
  var currentHeaders = currentHeadersRange.getValues()[0];
  var needsHeadersUpdate = false;
  
  for (var k = 0; k < 11; k++) {
    if (!currentHeaders[k] || currentHeaders[k].toString().trim() === "") {
      needsHeadersUpdate = true;
      break;
    }
  }
  
  if (needsHeadersUpdate) {
    currentHeadersRange.setValues([newHeaders]);
  }
  
  sheet.getRange(rowFound, 32, 1, 11).setValues([marks]);
  SpreadsheetApp.flush();
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: "Markah pemantauan pelajar berjaya dikemaskini!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
// MODUL SANDARAN AUTOMATIK (AUTO BACKUP TO GOOGLE DRIVE)
// ============================================================================
var BACKUP_FOLDER_ID = "1OfPHbDXjqwGHIQuCzn5EJiFCD_aIq_LX";
var FIREBASE_PROJECT_ID = "gen-lang-client-0270916732";
var RETENTION_DAYS = 14; // Simpan sandaran 2 minggu terkini, selebihnya dipadam

/**
 * Persediaan Trigger Automatik Setiap Ahad Jam 2.00 Pagi Waktu Malaysia.
 * Jalankan fungsi ini SEKALI di Google Apps Script editor.
 */
function setupAutoBackupTrigger() {
  // Padam trigger lama jika wujud untuk elak pertindihan
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    if (allTriggers[i].getHandlerFunction() === "runAutoBackupSunday") {
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }

  // Cipta trigger baharu: Setiap Ahad, Jam 2.00 Pagi (Waktu Malaysia)
  ScriptApp.newTrigger("runAutoBackupSunday")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(2)
    .inTimezone("Asia/Kuala_Lumpur")
    .create();

  Logger.log("✓ Trigger Sandaran Automatik BERJAYA disetup! (Setiap Hari Ahad, Jam 2.00 Pagi Asia/Kuala_Lumpur)");
}

/**
 * Fungsi Utama Sandaran Automatik (Dipanggil oleh Trigger atau secara manual)
 */
function runAutoBackupSunday() {
  try {
    Logger.log("Memulakan sandaran data SLIP...");
    var targetFolder = DriveApp.getFolderById(BACKUP_FOLDER_ID);
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "Asia/Kuala_Lumpur", "yyyy-MM-dd_HHmm");
    var humanDate = Utilities.formatDate(now, "Asia/Kuala_Lumpur", "yyyy-MM-dd HH:mm:ss");

    // 1. Dapatkan Data Pelajar (Dari Firestore REST API atau Google Sheet)
    var students = getStudentsForBackup();
    if (students && students.length > 0) {
      var studentCsv = convertStudentsToCsv(students);
      var studentFileName = "SLIP_Pelajar_Backup_" + dateStr + ".csv";
      targetFolder.createFile(studentFileName, studentCsv, MimeType.CSV);
      Logger.log("✓ Fail sandaran pelajar dicipta: " + studentFileName + " (" + students.length + " rekod)");
    }

    // 2. Dapatkan Data Markah Pensyarah
    var markahList = getMarkahForBackup();
    if (markahList && markahList.length > 0) {
      var markahCsv = convertMarkahToCsv(markahList);
      var markahFileName = "SLIP_Markah_Backup_" + dateStr + ".csv";
      targetFolder.createFile(markahFileName, markahCsv, MimeType.CSV);
      Logger.log("✓ Fail sandaran markah dicipta: " + markahFileName + " (" + markahList.length + " rekod)");
    }

    // 3. Dapatkan Tetapan Sistem
    var systemConfig = getSystemConfigForBackup();
    if (systemConfig) {
      var configCsv = convertConfigToCsv(systemConfig);
      var configFileName = "SLIP_Tetapan_Backup_" + dateStr + ".csv";
      targetFolder.createFile(configFileName, configCsv, MimeType.CSV);
      Logger.log("✓ Fail sandaran tetapan sistem dicipta: " + configFileName);
    }

    // 4. Polisi Pengekalan Data: Padam fail lama melebihi 14 hari (2 minggu)
    cleanupOldBackups(targetFolder, RETENTION_DAYS);

    Logger.log("✓ PROSES SANDARAN SELESAI PADA: " + humanDate);
    return { success: true, timestamp: humanDate };
  } catch (err) {
    Logger.log("Ralat semasa sandaran automatik: " + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * Handle manual backup trigger dari API POST
 */
function handleTriggerBackup() {
  var result = runAutoBackupSunday();
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Dapatkan semua data pelajar (utamakan Firestore REST API, sandar ke Sheet jika gagal)
 */
function getStudentsForBackup() {
  try {
    var url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/students?pageSize=1000";
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      var json = JSON.parse(response.getContentText());
      if (json.documents && json.documents.length > 0) {
        var list = [];
        for (var i = 0; i < json.documents.length; i++) {
          list.push(flattenFirestoreDoc(json.documents[i]));
        }
        return list;
      }
    }
  } catch (e) {
    Logger.log("Nota: Firestore REST fallback ke Google Sheet: " + e.toString());
  }

  // Fallback dari Sheet
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var list = [];
    for (var r = 1; r < data.length; r++) {
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        obj[headers[c].toString().trim()] = data[r][c];
      }
      list.push(obj);
    }
    return list;
  } catch (err) {
    Logger.log("Gagal membaca dari helaian: " + err.toString());
    return [];
  }
}

/**
 * Dapatkan semua data markah
 */
function getMarkahForBackup() {
  try {
    var url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/markah?pageSize=1000";
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      var json = JSON.parse(response.getContentText());
      if (json.documents && json.documents.length > 0) {
        var list = [];
        for (var i = 0; i < json.documents.length; i++) {
          list.push(flattenFirestoreDoc(json.documents[i]));
        }
        return list;
      }
    }
  } catch (e) {}

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("MARKAH_PELAJAR");
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    var headers = data[0];
    var list = [];
    for (var r = 1; r < data.length; r++) {
      var obj = {};
      for (var c = 0; c < headers.length; c++) {
        obj[headers[c].toString().trim()] = data[r][c];
      }
      list.push(obj);
    }
    return list;
  } catch (e) {
    return [];
  }
}

/**
 * Dapatkan Tetapan Sistem
 */
function getSystemConfigForBackup() {
  try {
    var url = "https://firestore.googleapis.com/v1/projects/" + FIREBASE_PROJECT_ID + "/databases/(default)/documents/config/system";
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (response.getResponseCode() === 200) {
      var json = JSON.parse(response.getContentText());
      if (json.fields) {
        return flattenFirestoreDoc(json);
      }
    }
  } catch (e) {}

  return {
    sesi: "SESI I 2026/2027",
    tarikh: "30 NOVEMBER 2026 HINGGA 19 MAC 2027",
    tempoh: "4 BULAN (16 MINGGU)",
    tarikhAkhirJawapan: "15 OKTOBER 2026",
    namaPpia: "SHAMSUDDIN BIN AMIN",
    noTelefonPpia: "012-2455616",
    tarikhPemantauan: "15 JANUARI 2027 HINGGA 15 FEBRUARI 2027",
    tarikhPembentangan: "22 MAC 2027 HINGGA 26 MAC 2027",
    tarikhKeputusan: "5 APRIL 2027"
  };
}

/**
 * Tukar Firestore Document Fields ke Objek JavaScript Rata
 */
function flattenFirestoreDoc(doc) {
  var out = {};
  if (doc.name) {
    var parts = doc.name.split('/');
    out["_id"] = parts[parts.length - 1];
  }
  if (!doc.fields) return out;
  
  for (var key in doc.fields) {
    var valObj = doc.fields[key];
    if (valObj.stringValue !== undefined) {
      out[key] = valObj.stringValue;
    } else if (valObj.integerValue !== undefined) {
      out[key] = valObj.integerValue;
    } else if (valObj.doubleValue !== undefined) {
      out[key] = valObj.doubleValue;
    } else if (valObj.booleanValue !== undefined) {
      out[key] = valObj.booleanValue;
    } else if (valObj.timestampValue !== undefined) {
      out[key] = valObj.timestampValue;
    } else if (valObj.mapValue !== undefined) {
      out[key] = JSON.stringify(valObj.mapValue.fields || {});
    } else if (valObj.arrayValue !== undefined) {
      out[key] = JSON.stringify(valObj.arrayValue.values || []);
    } else {
      out[key] = JSON.stringify(valObj);
    }
  }
  return out;
}

/**
 * Escape nilai untuk format CSV selamat
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  var str = val.toString();
  if (str.indexOf('"') !== -1 || str.indexOf(',') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
    str = str.replace(/"/g, '""');
  }
  return '"' + str + '"';
}

/**
 * Format CSV Pelajar
 */
function convertStudentsToCsv(students) {
  if (!students || students.length === 0) return "";
  
  // Kumpulkan semua keys unik untuk headers
  var headerSet = {};
  for (var i = 0; i < students.length; i++) {
    for (var k in students[i]) {
      headerSet[k] = true;
    }
  }
  
  // Susun header dengan tertib
  var preferredOrder = [
    "_id", "noMatrik", "namaPelajar", "noIc", "program", "sesi", "kelas",
    "noTelefon", "emelPelajar", "alamat", "status", "namaSyarikat", "emelHrSyarikat",
    "rujukanSurat", "tarikhSurat", "tempohLatihan", "tarikhLatihanMula", "tarikhLatihanTamat",
    "namaPa", "noTelefonPa", "emelPa", "namaSekolahMenengah", "jawatanKkbs",
    "programKkbs1", "programKkbs2", "programKkbs3", "pencapaian1", "pencapaian2", "pencapaian3",
    "bjpliData", "timestamp", "migratedFromGoogleSheetAt"
  ];
  
  var headers = [];
  for (var p = 0; p < preferredOrder.length; p++) {
    if (headerSet[preferredOrder[p]]) {
      headers.push(preferredOrder[p]);
      delete headerSet[preferredOrder[p]];
    }
  }
  for (var remaining in headerSet) {
    headers.push(remaining);
  }

  var lines = [];
  lines.push(headers.map(escapeCsvValue).join(","));

  for (var r = 0; r < students.length; r++) {
    var row = [];
    for (var c = 0; c < headers.length; c++) {
      var val = students[r][headers[c]];
      row.push(escapeCsvValue(val));
    }
    lines.push(row.join(","));
  }

  return lines.join("\r\n");
}

/**
 * Format CSV Markah
 */
function convertMarkahToCsv(markahList) {
  if (!markahList || markahList.length === 0) return "";
  var headerSet = {};
  for (var i = 0; i < markahList.length; i++) {
    for (var k in markahList[i]) {
      headerSet[k] = true;
    }
  }
  var headers = Object.keys(headerSet);
  var lines = [];
  lines.push(headers.map(escapeCsvValue).join(","));

  for (var r = 0; r < markahList.length; r++) {
    var row = [];
    for (var c = 0; c < headers.length; c++) {
      var val = markahList[r][headers[c]];
      row.push(escapeCsvValue(val));
    }
    lines.push(row.join(","));
  }

  return lines.join("\r\n");
}

/**
 * Format CSV Tetapan
 */
function convertConfigToCsv(config) {
  var headers = Object.keys(config);
  var values = headers.map(function(h) { return config[h]; });
  return headers.map(escapeCsvValue).join(",") + "\r\n" + values.map(escapeCsvValue).join(",");
}

/**
 * Padam fail sandaran lama melebihi bilangan hari pengekalan (14 Hari / 2 Minggu)
 */
function cleanupOldBackups(folder, maxDays) {
  try {
    var nowMs = new Date().getTime();
    var maxAgeMs = maxDays * 24 * 60 * 60 * 1000;
    var files = folder.getFiles();
    var deletedCount = 0;

    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();
      // Pastikan hanya proses fail sandaran SLIP (.csv)
      if (fileName.indexOf("SLIP_") === 0 && fileName.indexOf(".csv") !== -1) {
        var createdMs = file.getDateCreated().getTime();
        var ageMs = nowMs - createdMs;
        if (ageMs > maxAgeMs) {
          Logger.log("Memadam sandaran lama (> " + maxDays + " hari): " + fileName);
          file.setTrashed(true);
          deletedCount++;
        }
      }
    }
    Logger.log("✓ Selesai pembersihan fail lama. Bilangan fail dipadam: " + deletedCount);
  } catch (err) {
    Logger.log("Ralat semasa pembersihan fail lama: " + err.toString());
  }
}

