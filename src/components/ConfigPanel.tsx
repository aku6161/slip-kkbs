import React, { useState } from 'react';
import { Calendar, Clock, Save, ShieldCheck, Settings } from 'lucide-react';
import { SystemConfig } from '../types';

interface ConfigPanelProps {
  config: SystemConfig;
  appsScriptUrl: string;
  onSaveSuccess: (updatedConfig: SystemConfig) => void;
}

const cleanDate = (val: any): string => {
  if (!val) return '';
  const str = String(val).trim();
  if (str.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const monthNames = ['JANUARI', 'FEBRUARI', 'MAC', 'APRIL', 'MEI', 'JUN', 'JULAI', 'OGOS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DISEMBER'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
  }
  return str;
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, appsScriptUrl, onSaveSuccess }) => {
  const [formData, setFormData] = useState<SystemConfig>({
    sesi: cleanDate(config.sesi) || 'SESI I 2026/2027',
    tarikh: cleanDate(config.tarikh) || '30 NOVEMBER 2026 HINGGA 19 MAC 2027',
    tempoh: cleanDate(config.tempoh) || '4 BULAN (16 MINGGU)',
    tarikhAkhirJawapan: cleanDate(config.tarikhAkhirJawapan) || '15 OKTOBER 2026',
    namaPpia: cleanDate(config.namaPpia) || 'SHAMSUDDIN BIN AMIN',
    noTelefonPpia: cleanDate(config.noTelefonPpia) || '012-2455616',
    tarikhPemantauan: cleanDate(config.tarikhPemantauan) || '15 JANUARI 2027 HINGGA 15 FEBRUARI 2027',
    tarikhPembentangan: cleanDate(config.tarikhPembentangan) || '22 MAC 2027 HINGGA 26 MAC 2027',
    tarikhKeputusan: cleanDate(config.tarikhKeputusan) || '5 APRIL 2027'
  });

  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    if (!isDirty) {
      setFormData({
        sesi: cleanDate(config.sesi) || 'SESI I 2026/2027',
        tarikh: cleanDate(config.tarikh) || '30 NOVEMBER 2026 HINGGA 19 MAC 2027',
        tempoh: cleanDate(config.tempoh) || '4 BULAN (16 MINGGU)',
        tarikhAkhirJawapan: cleanDate(config.tarikhAkhirJawapan) || '15 OKTOBER 2026',
        namaPpia: cleanDate(config.namaPpia) || 'SHAMSUDDIN BIN AMIN',
        noTelefonPpia: cleanDate(config.noTelefonPpia) || '012-2455616',
        tarikhPemantauan: cleanDate(config.tarikhPemantauan) || '15 JANUARI 2027 HINGGA 15 FEBRUARI 2027',
        tarikhPembentangan: cleanDate(config.tarikhPembentangan) || '22 MAC 2027 HINGGA 26 MAC 2027',
        tarikhKeputusan: cleanDate(config.tarikhKeputusan) || '5 APRIL 2027'
      });
    }
  }, [config, isDirty]);

  const handleChange = (field: keyof SystemConfig, value: string) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-apps-script-url': appsScriptUrl
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal mengemaskini tetapan latihan');
      }

      const data = await res.json();
      setIsDirty(false);
      setMessage('Tetapan maklumat latihan industri berjaya disimpan & disegerak!');
      onSaveSuccess(data.config || formData);
    } catch (err: any) {
      setError(err.message || 'Ralat berlaku semasa menyimpan tetapan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in font-sans">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-900 rounded-xl">
              <Settings className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                KONFIGURASI ADMIN
              </span>
              <h1 className="text-xl font-black uppercase tracking-tight mt-1">
                Maklumat Latihan Industri Terkini
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Tetapkan sesi, tarikh mula/tamat, dan tempoh latihan untuk permohonan aktif pelajar.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-800">
          <div className="bg-blue-50/50 p-4.5 rounded-xl border border-blue-100 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-900 shrink-0" />
            <p className="text-[11px] text-blue-950 leading-relaxed font-semibold">
              Maklumat di bawah akan disuntik secara automatik ke dalam draf **Surat Permohonan Rasmi** 
              yang dihantar ke emel HR industri serta dipaparkan pada semua layout dokumen digital pelajar (Resume, Skop Latihan, dll.).
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                1. Sesi Latihan Industri: *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SESI I 2026/2027"
                  value={formData.sesi}
                  onChange={e => handleChange('sesi', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                2. Tarikh Latihan: *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 30 NOVEMBER 2026 HINGGA 19 MAC 2027"
                  value={formData.tarikh}
                  onChange={e => handleChange('tarikh', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                3. Tempoh Latihan: *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 4 BULAN (16 MINGGU) atau 20 MINGGU (5 BULAN)"
                  value={formData.tempoh}
                  onChange={e => handleChange('tempoh', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                4. Tarikh Akhir Jawapan: *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 15 OKTOBER 2026"
                  value={formData.tarikhAkhirJawapan}
                  onChange={e => handleChange('tarikhAkhirJawapan', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                5. Nama Pegawai Perhubungan Industri & Alumni (PPIA): *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SHAMSUDDIN BIN AMIN"
                  value={formData.namaPpia}
                  onChange={e => handleChange('namaPpia', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-950 outline-none uppercase font-bold text-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                6. No. Telefon PPIA: *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 012-2455616"
                  value={formData.noTelefonPpia}
                  onChange={e => handleChange('noTelefonPpia', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-950 outline-none uppercase font-bold text-slate-900 bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-extrabold text-blue-900 uppercase text-xs mb-3">Tetapan Takwim Latihan Industri (Pelajar)</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    7. Tarikh Pemantauan LI:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: 15 JANUARI 2027 HINGGA 15 FEBRUARI 2027"
                      value={formData.tarikhPemantauan || ''}
                      onChange={e => handleChange('tarikhPemantauan', e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    8. Tarikh Pembentangan Laporan Akhir:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: 22 MAC 2027 HINGGA 26 MAC 2027"
                      value={formData.tarikhPembentangan || ''}
                      onChange={e => handleChange('tarikhPembentangan', e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1.5 uppercase tracking-wide">
                    9. Tarikh Keputusan LI:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: 5 APRIL 2027"
                      value={formData.tarikhKeputusan || ''}
                      onChange={e => handleChange('tarikhKeputusan', e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-900 outline-none uppercase font-bold text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action alerts */}
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2 animate-in fade-in">
              <span>{error}</span>
            </div>
          )}

          {/* Form Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-sm uppercase tracking-wider"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Menyimpan Tetapan...' : 'Simpan Maklumat Latihan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
