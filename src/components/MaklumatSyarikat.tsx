import React, { useState, useMemo } from 'react';
import { IndustryCompany } from '../types';
import { 
  Building2, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Save, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Utensils,
  Home,
  Car,
  Calendar,
  DollarSign
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface MaklumatSyarikatProps {
  companies: IndustryCompany[];
  onSaveCompany?: (company: Partial<IndustryCompany>) => Promise<{ success: boolean; message?: string }>;
  onDeleteCompany?: (companyId: string) => Promise<void>;
}

export const MaklumatSyarikat: React.FC<MaklumatSyarikatProps> = ({
  companies = [],
  onSaveCompany,
  onDeleteCompany,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [offdayFilter, setOffdayFilter] = useState('SEMUA');
  const [makanFilter, setMakanFilter] = useState('SEMUA');
  const [penginapanFilter, setPenginapanFilter] = useState('SEMUA');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<IndustryCompany | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<IndustryCompany>>({
    namaSyarikat: '',
    alamat1: '',
    alamat2: '',
    emelHr: '',
    nomborTel: '',
    elaun: '500',
    penginapan: '-',
    makan: '-',
    offday: '1',
    pengangkutan: '-',
    catatan: ''
  });

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.namaSyarikat && c.namaSyarikat.toLowerCase().includes(q)) ||
        (c.emelHr && c.emelHr.toLowerCase().includes(q)) ||
        (c.alamat1 && c.alamat1.toLowerCase().includes(q)) ||
        (c.alamat2 && c.alamat2.toLowerCase().includes(q)) ||
        (c.nomborTel && c.nomborTel.toLowerCase().includes(q)) ||
        (c.elaun && c.elaun.toLowerCase().includes(q));

      const matchOffday =
        offdayFilter === 'SEMUA' ||
        String(c.offday || '') === offdayFilter;

      const matchMakan =
        makanFilter === 'SEMUA' ||
        (makanFilter === 'ADA' && c.makan === '/') ||
        (makanFilter === 'TIADA' && (c.makan === '-' || !c.makan));

      const matchPenginapan =
        penginapanFilter === 'SEMUA' ||
        (penginapanFilter === 'ADA' && c.penginapan === '/') ||
        (penginapanFilter === 'TIADA' && (c.penginapan === '-' || !c.penginapan));

      return matchSearch && matchOffday && matchMakan && matchPenginapan;
    });
  }, [companies, searchTerm, offdayFilter, makanFilter, penginapanFilter]);

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      bil: companies.length + 1,
      namaSyarikat: '',
      alamat1: '',
      alamat2: '',
      emelHr: '',
      nomborTel: '',
      elaun: '500',
      penginapan: '-',
      makan: '-',
      offday: '1',
      pengangkutan: '-',
      catatan: ''
    });
    setNotification(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: IndustryCompany) => {
    setEditingCompany(comp);
    setFormData({
      id: comp.id,
      bil: comp.bil,
      namaSyarikat: comp.namaSyarikat || '',
      alamat1: comp.alamat1 || '',
      alamat2: comp.alamat2 || '',
      emelHr: comp.emelHr || '',
      nomborTel: comp.nomborTel || '',
      elaun: comp.elaun || '-',
      penginapan: comp.penginapan || '-',
      makan: comp.makan || '-',
      offday: comp.offday || '1',
      pengangkutan: comp.pengangkutan || '-',
      catatan: comp.catatan || ''
    });
    setNotification(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaSyarikat?.trim()) {
      setNotification({ type: 'error', message: 'Sila masukkan Nama Syarikat.' });
      return;
    }

    if (!onSaveCompany) {
      setNotification({ type: 'error', message: 'Fungsi simpan syarikat tidak tersedia.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await onSaveCompany({
        ...formData,
        id: editingCompany ? editingCompany.id : formData.id,
        namaSyarikat: formData.namaSyarikat.trim(),
        alamat1: formData.alamat1?.trim() || '',
        alamat2: formData.alamat2?.trim() || '',
        emelHr: formData.emelHr?.trim() || '',
        nomborTel: formData.nomborTel?.trim() || '',
        elaun: formData.elaun?.trim() || '-',
        penginapan: formData.penginapan || '-',
        makan: formData.makan || '-',
        offday: formData.offday || '1',
        pengangkutan: formData.pengangkutan || '-',
        catatan: formData.catatan?.trim() || ''
      });

      if (res.success) {
        setNotification({ 
          type: 'success', 
          message: editingCompany ? 'Maklumat syarikat berjaya dikemaskini!' : 'Syarikat baharu berjaya ditambah!' 
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setNotification(null);
        }, 1200);
      } else {
        setNotification({ type: 'error', message: res.message || 'Gagal menyimpan maklumat syarikat.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Ralat semasa menyimpan data.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async (companyId: string) => {
    if (!onDeleteCompany) return;
    try {
      await onDeleteCompany(companyId);
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Ralat memadam maklumat syarikat.');
    }
  };

  const handleExportExcel = () => {
    if (companies.length === 0) {
      alert('Tiada data syarikat untuk dieksport.');
      return;
    }

    const exportData = companies.map((c, idx) => ({
      'BIL': c.bil || idx + 1,
      'NAMA SYARIKAT': c.namaSyarikat || '',
      'ALAMAT 1': c.alamat1 || '',
      'ALAMAT 2': c.alamat2 || '',
      'EMEL HR': c.emelHr || '',
      'NOMBOR TEL': c.nomborTel || '',
      'ELAUN': c.elaun || '',
      'PENGINAPAN': c.penginapan === '/' ? 'Disediakan' : 'Tiada',
      'MAKAN': c.makan === '/' ? 'Disediakan' : 'Tiada',
      'OFFDAY (HARI)': c.offday || '1',
      'PENGANGKUTAN': c.pengangkutan === '/' ? 'Disediakan' : 'Tiada'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Maklumat Industri');
    XLSX.writeFile(wb, `Senarai_Maklumat_Industri_KKBS_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                Maklumat Rakan Industri
              </h2>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[11px] font-black rounded-full">
                {companies.length} Syarikat
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direktori syarikat rakan industri, lokasi, emel perhubungan HR, dan kemudahan faedah latihan pelajar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            title="Eksport ke Excel"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Eksport Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Syarikat</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama syarikat, alamat, emel HR, elaun..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 bg-slate-50 focus:bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Offday Filter */}
          <div>
            <select
              value={offdayFilter}
              onChange={e => setOffdayFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="SEMUA">Semua Cuti (Offday)</option>
              <option value="1">1 Hari Cuti Seminggu</option>
              <option value="2">2 Hari Cuti Seminggu</option>
            </select>
          </div>

          {/* Makan Filter */}
          <div>
            <select
              value={makanFilter}
              onChange={e => setMakanFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="SEMUA">Kemudahan Makan (Semua)</option>
              <option value="ADA">Makan Disediakan (/)</option>
              <option value="TIADA">Makan Tiada (-)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Companies Table / Cards List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium text-xs space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Tiada Maklumat Syarikat Dijumpai</p>
            <p className="text-slate-400">Sila cuba kata kunci carian lain atau klik butang "+ Tambah Syarikat" di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <th className="py-3.5 px-4 w-12 text-center">BIL</th>
                  <th className="py-3.5 px-4 min-w-[240px]">NAMA SYARIKAT & ALAMAT</th>
                  <th className="py-3.5 px-4 min-w-[200px]">HUBUNGAN & EMEL HR</th>
                  <th className="py-3.5 px-3 min-w-[110px] text-center">ELAUN</th>
                  <th className="py-3.5 px-3 min-w-[200px] text-center">KEMUDAHAN & OFFDAY</th>
                  <th className="py-3.5 px-3 w-24 text-center">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredCompanies.map((company, index) => {
                  const displayBil = company.bil || index + 1;
                  const hasAccommodation = company.penginapan === '/';
                  const hasFood = company.makan === '/';
                  const hasTransport = company.pengangkutan === '/';

                  return (
                    <tr 
                      key={company.id || index}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* BIL */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                        {displayBil}
                      </td>

                      {/* NAMA SYARIKAT & ALAMAT */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 uppercase text-xs tracking-tight group-hover:text-blue-900">
                            {company.namaSyarikat}
                          </p>
                          {(company.alamat1 || company.alamat2) && (
                            <div className="flex items-start gap-1.5 text-slate-500 text-[11px] leading-relaxed">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                              <span>
                                {[company.alamat1, company.alamat2].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* HUBUNGAN & EMEL HR */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {company.emelHr ? (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                              <span className="font-mono text-blue-900 text-[11px] font-medium truncate max-w-[190px]">
                                {company.emelHr}
                              </span>
                              <button
                                onClick={() => handleCopyEmail(company.emelHr!)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer rounded hover:bg-slate-100"
                                title="Salin Emel"
                              >
                                {copiedEmail === company.emelHr ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Tiada emel direkod</span>
                          )}

                          {company.nomborTel && company.nomborTel !== '-' && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono text-[11px]">{company.nomborTel}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ELAUN */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black tracking-tight ${
                          company.elaun && company.elaun !== '-' && !company.elaun.toUpperCase().includes('TBA') && !company.elaun.toUpperCase().includes('TBD')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {company.elaun && !isNaN(Number(company.elaun)) 
                            ? `RM ${company.elaun}` 
                            : company.elaun || '-'}
                        </span>
                      </td>

                      {/* KEMUDAHAN & OFFDAY */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {/* Penginapan */}
                          <span 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              hasAccommodation
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title={hasAccommodation ? 'Penginapan Disediakan' : 'Penginapan Tiada'}
                          >
                            <Home className="w-3 h-3" />
                            <span>{hasAccommodation ? 'Asrama' : '-'}</span>
                          </span>

                          {/* Makan */}
                          <span 
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              hasFood
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                            title={hasFood ? 'Makan Disediakan' : 'Makan Tiada'}
                          >
                            <Utensils className="w-3 h-3" />
                            <span>{hasFood ? 'Makan' : '-'}</span>
                          </span>

                          {/* Offday */}
                          <span 
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200"
                            title={`Cuti ${company.offday || 1} Hari Seminggu`}
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Cuti {company.offday || 1}H</span>
                          </span>

                          {/* Pengangkutan */}
                          {hasTransport && (
                            <span 
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200"
                              title="Pengangkutan Disediakan"
                            >
                              <Car className="w-3 h-3" />
                              <span>Van/Bas</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* TINDAKAN */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(company)}
                            className="p-1.5 text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Kemaskini Syarikat"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(company.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Padam Syarikat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Menunjukkan <strong>{filteredCompanies.length}</strong> daripada <strong>{companies.length}</strong> syarikat berdaftar</span>
          <span className="text-[11px] text-slate-400">Unit Perhubungan Industri &amp; Alumni (UPLI) KKBS</span>
        </div>
      </div>

      {/* Modal: Tambah / Kemaskini Maklumat Syarikat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight">
                    {editingCompany ? 'Kemaskini Maklumat Syarikat' : 'Tambah Syarikat Industri Baharu'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sila lengkapkan butiran perhubungan dan kemudahan faedah syarikat.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Alert */}
            {notification && (
              <div className={`mx-6 mt-4 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                notification.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              {/* Nama Syarikat */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                  Nama Syarikat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HYATT CENTRIC KOTA KINABALU"
                  value={formData.namaSyarikat || ''}
                  onChange={e => setFormData({ ...formData, namaSyarikat: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 uppercase"
                />
              </div>

              {/* Alamat 1 & Alamat 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                    Alamat Baris 1
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: LOT 341, INDUSTRIAL PARK"
                    value={formData.alamat1 || ''}
                    onChange={e => setFormData({ ...formData, alamat1: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                    Alamat Baris 2 (Poskod & Bandar)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 88460 KOTA KINABALU, SABAH."
                    value={formData.alamat2 || ''}
                    onChange={e => setFormData({ ...formData, alamat2: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Emel HR & No Telefon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                    Emel HR / Syarikat
                  </label>
                  <input
                    type="email"
                    placeholder="hr@syarikat.com.my"
                    value={formData.emelHr || ''}
                    onChange={e => setFormData({ ...formData, emelHr: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                    Nombor Telefon
                  </label>
                  <input
                    type="text"
                    placeholder="088-123456 / 019-8765432"
                    value={formData.nomborTel || ''}
                    onChange={e => setFormData({ ...formData, nomborTel: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              {/* Elaun & Offday */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                    Kadar Elaun (Bulanan/Harian)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 500 / 30/Hari / TBA / -"
                    value={formData.elaun || ''}
                    onChange={e => setFormData({ ...formData, elaun: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-tight">
                    Hari Cuti (Offday Seminggu)
                  </label>
                  <select
                    value={formData.offday || '1'}
                    onChange={e => setFormData({ ...formData, offday: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="1">1 Hari Seminggu</option>
                    <option value="2">2 Hari Seminggu</option>
                    <option value="-">Tidak Dinyatakan (-)</option>
                  </select>
                </div>
              </div>

              {/* Kemudahan: Penginapan, Makan, Pengangkutan */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800 uppercase text-[11px] tracking-tight">
                  Kemudahan & Faedah Yang Disediakan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                      Penginapan (Asrama)
                    </label>
                    <select
                      value={formData.penginapan === '/' ? '/' : '-'}
                      onChange={e => setFormData({ ...formData, penginapan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="/">Disediakan (/)</option>
                      <option value="-">Tiada (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                      Makanan / Elaun Makan
                    </label>
                    <select
                      value={formData.makan === '/' ? '/' : '-'}
                      onChange={e => setFormData({ ...formData, makan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="/">Disediakan (/)</option>
                      <option value="-">Tiada (-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1 text-[11px]">
                      Pengangkutan
                    </label>
                    <select
                      value={formData.pengangkutan === '/' ? '/' : '-'}
                      onChange={e => setFormData({ ...formData, pengangkutan: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="-">Tiada (-)</option>
                      <option value="/">Disediakan (/)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all cursor-pointer text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold transition-all cursor-pointer text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : editingCompany ? 'Kemaskini Syarikat' : 'Simpan Syarikat'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm uppercase">Sahkan Padam Syarikat?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Adakah anda pasti ingin memadam rekod syarikat ini daripada direktori?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Padam Rekod
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
