import React, { useState } from 'react';
import { UserCheck, Settings, Users, Building2 } from 'lucide-react';
import { Student, Lecturer, SystemConfig, IndustryCompany } from '../types';
import { MaklumatPensyarah } from './MaklumatPensyarah';
import { ConfigPanel } from './ConfigPanel';
import { MaklumatPelajar } from './MaklumatPelajar';
import { MaklumatSyarikat } from './MaklumatSyarikat';

interface TetapanPanelProps {
  students: Student[];
  lecturers: Lecturer[];
  companies?: IndustryCompany[];
  config: SystemConfig;
  appsScriptUrl: string;
  onSaveLecturer: (lecturer: Partial<Lecturer>) => Promise<{ success: boolean; message?: string }>;
  onDeleteLecturer: (id: string) => Promise<void>;
  onSaveCompany?: (company: Partial<IndustryCompany>) => Promise<{ success: boolean; message?: string }>;
  onDeleteCompany?: (companyId: string) => Promise<void>;
  onSaveStudent: (student: Partial<Student>) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onSaveConfig: (updatedConfig: SystemConfig) => void;
  onViewStudentDetail: (student: Student) => void;
  initialSubTab?: 'pensyarah' | 'latihan' | 'pelajar' | 'syarikat';
}

export const TetapanPanel: React.FC<TetapanPanelProps> = ({
  students,
  lecturers,
  companies = [],
  config,
  appsScriptUrl,
  onSaveLecturer,
  onDeleteLecturer,
  onSaveCompany,
  onDeleteCompany,
  onSaveStudent,
  onDeleteStudent,
  onSaveConfig,
  onViewStudentDetail,
  initialSubTab = 'pensyarah',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pensyarah' | 'latihan' | 'pelajar' | 'syarikat'>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation Header */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Sub-Tab 1: Maklumat Pensyarah */}
          <button
            onClick={() => setActiveSubTab('pensyarah')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'pensyarah'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Maklumat Pensyarah</span>
          </button>

          {/* Sub-Tab 2: Maklumat Latihan */}
          <button
            onClick={() => setActiveSubTab('latihan')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'latihan'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>2. Maklumat Latihan</span>
          </button>

          {/* Sub-Tab 3: Maklumat Pelajar */}
          <button
            onClick={() => setActiveSubTab('pelajar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'pelajar'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. Maklumat Pelajar</span>
          </button>

          {/* Sub-Tab 4: Maklumat Industri */}
          <button
            onClick={() => setActiveSubTab('syarikat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'syarikat'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>4. Maklumat Industri</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Content Rendering */}
      <div className="animate-fade-in">
        {activeSubTab === 'pensyarah' && (
          <MaklumatPensyarah
            lecturers={lecturers}
            students={students}
            onSaveLecturer={onSaveLecturer}
            onDeleteLecturer={onDeleteLecturer}
          />
        )}

        {activeSubTab === 'latihan' && (
          <ConfigPanel
            config={config}
            appsScriptUrl={appsScriptUrl}
            onSaveSuccess={onSaveConfig}
          />
        )}

        {activeSubTab === 'pelajar' && (
          <MaklumatPelajar
            students={students}
            lecturers={lecturers}
            onSaveStudent={onSaveStudent}
            onDeleteStudent={onDeleteStudent}
            onViewStudentDetail={onViewStudentDetail}
          />
        )}

        {activeSubTab === 'syarikat' && (
          <MaklumatSyarikat
            companies={companies}
            onSaveCompany={onSaveCompany}
            onDeleteCompany={onDeleteCompany}
          />
        )}
      </div>
    </div>
  );
};
