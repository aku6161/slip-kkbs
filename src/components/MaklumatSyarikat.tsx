import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { 
  Building2, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check 
} from 'lucide-react';

interface MaklumatSyarikatProps {
  students: Student[];
  onViewStudentDetail: (student: Student) => void;
}

interface CompanyItem {
  name: string;
  emelHr: string;
  noTel: string;
  alamat: string;
  namaPegawai: string;
  jawatanPegawai: string;
  students: Student[];
  acceptedCount: number;
  pendingCount: number;
}

export const MaklumatSyarikat: React.FC<MaklumatSyarikatProps> = ({
  students,
  onViewStudentDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [programFilter, setProgramFilter] = useState('SEMUA');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  // Group students by Company
  const companiesList = useMemo(() => {
    const map = new Map<string, CompanyItem>();

    students.forEach(s => {
      const compName = (s.namaSyarikat || '').trim();
      if (!compName) return;

      const key = compName.toUpperCase();
      const isAccepted = s.status === 'Diterima' || s.status === 'Lulus / Diterima';
      const isPending = s.status === 'Memohon' || s.status === 'Permohonan Dihantar' || s.status === 'Menunggu Jawapan';

      if (!map.has(key)) {
        map.set(key, {
          name: compName,
          emelHr: s.emelHrSyarikat || s.bjpliData?.emelSyarikat || '',
          noTel: s.bjpliData?.noTelSyarikat || '',
          alamat: s.bjpliData?.alamatSyarikat || '',
          namaPegawai: s.bjpliData?.namaPegawaiIndustri || '',
          jawatanPegawai: s.bjpliData?.jawatanPegawai || '',
          students: [s],
          acceptedCount: isAccepted ? 1 : 0,
          pendingCount: isPending ? 1 : 0,
        });
      } else {
        const item = map.get(key)!;
        item.students.push(s);
        if (isAccepted) item.acceptedCount += 1;
        if (isPending) item.pendingCount += 1;
        if (!item.emelHr && s.emelHrSyarikat) item.emelHr = s.emelHrSyarikat;
        if (!item.noTel && s.bjpliData?.noTelSyarikat) item.noTel = s.bjpliData.noTelSyarikat;
        if (!item.alamat && s.bjpliData?.alamatSyarikat) item.alamat = s.bjpliData.alamatSyarikat;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [students]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companiesList.filter(c => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.emelHr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.students.some(s => s.namaPelajar.toLowerCase().includes(searchTerm.toLowerCase()) || s.noMatrik.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchProgram =
        programFilter === 'SEMUA' ||
        c.students.some(s => s.program.toLowerCase().includes(programFilter.toLowerCase()));

      return matchSearch && matchProgram;
    });
  }, [companiesList, searchTerm, programFilter]);

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const totalAcceptedAll = useMemo(() => {
    return companiesList.reduce((acc, c) => acc + c.acceptedCount, 0);
  }, [companiesList]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Jumlah Rakan Industri</p>
            <h3 className="text-2xl font-black text-slate-900">{companiesList.length} Syarikat</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Pelajar Berstatus Diterima</p>
            <h3 className="text-2xl font-black text-emerald-700">{totalAcceptedAll} Orang</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase">Jumlah Penempatan Aktif</p>
            <h3 className="text-2xl font-black text-slate-900">{students.filter(s => s.namaSyarikat).length} Penempatan</h3>
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <Building2 className="w-5 h-5 text-blue-900" />
            Direktori Maklumat Syarikat Industri
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Senarai rakan industri tempat latihan pelajar, maklumat perhubungan HR, dan status penerimaan pelajar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama syarikat, emel HR, lokasi, atau nama pelajar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div>
            <select
              value={programFilter}
              onChange={e => setProgramFilter(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="SEMUA">Semua Program</option>
              <option value="Kulinari">Sijil Kulinari</option>
              <option value="Perhotelan">Sijil Operasi Perhotelan</option>
              <option value="Elektrik">Sijil Teknologi Elektrik</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies List Cards / Table */}
      <div className="space-y-3">
        {filteredCompanies.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 font-medium text-xs">
            Tiada syarikat dijumpai mengikut carian.
          </div>
        ) : (
          filteredCompanies.map(company => {
            const isExpanded = expandedCompany === company.name;

            return (
              <div
                key={company.name}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Company details */}
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 uppercase text-sm tracking-tight">
                        {company.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded-full">
                        {company.students.length} Pelajar
                      </span>
                      {company.acceptedCount > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {company.acceptedCount} Diterima
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      {company.emelHr && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                          <span className="font-mono text-blue-900 text-[11px]">{company.emelHr}</span>
                          <button
                            onClick={() => handleCopyEmail(company.emelHr)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            title="Salin Emel"
                          >
                            {copiedEmail === company.emelHr ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {company.noTel && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{company.noTel}</span>
                        </div>
                      )}

                      {company.alamat && (
                        <div className="flex items-center gap-1.5 w-full mt-0.5 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{company.alamat}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Expand / View Students */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedCompany(isExpanded ? null : company.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isExpanded
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Tutup Senarai' : `Lihat Pelajar (${company.students.length})`}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Student List */}
                {isExpanded && (
                  <div className="bg-slate-50 p-4 border-t border-slate-100 text-xs animate-fade-in">
                    <p className="font-bold text-slate-700 uppercase text-[11px] mb-2">
                      Senarai Pelajar Memohon / Ditempatkan di {company.name}:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {company.students.map(st => (
                        <div
                          key={st.id}
                          onClick={() => onViewStudentDetail(st)}
                          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer flex items-start justify-between gap-2 group"
                        >
                          <div>
                            <p className="font-bold text-slate-900 uppercase group-hover:text-blue-900 group-hover:underline">
                              {st.namaPelajar}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {st.noMatrik} • {st.program}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            st.status === 'Diterima' || st.status === 'Lulus / Diterima'
                              ? 'bg-blue-100 text-blue-900'
                              : st.status === 'Memohon' || st.status === 'Permohonan Dihantar' || st.status === 'Menunggu Jawapan'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {st.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
