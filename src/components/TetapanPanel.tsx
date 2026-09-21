import React, { useState } from 'react';
import { UserCheck, Settings, Users, Building2 } from 'lucide-react';
import { Student, Lecturer, SystemConfig } from '../types';
import { MaklumatPensyarah } from './MaklumatPensyarah';
import { ConfigPanel } from './ConfigPanel';
import { MaklumatPelajar } from './MaklumatPelajar';
import { MaklumatSyarikat } from './MaklumatSyarikat';

interface TetapanPanelProps {
  students: Student[];
  lecturers: Lecturer[];
  config: SystemConfig;
  appsScriptUrl: string;
  onSaveLecturer: (lecturer: Partial<Lecturer>) => Promise<{ success: boolean; message?: string }>;
  onDeleteLecturer: (id: string) => Promise<void>;
  onSaveStudent: (student: Partial<Student>) => Promise<void>;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onSaveConfig: (updatedConfig: SystemConfig) => void;
  onViewStudentDetail: (student: Student) => void;
  initialSubTab?: 'pensyarah' | 'latihan' | 'pelajar' | 'syarikat';
}

export const TetapanPanel: React.FC<TetapanPanelProps> = ({
  students,
  lecturers,
  config,
  appsScriptUrl,
  onSaveLecturer,
  onDeleteLecturer,
  onSaveStudent,
  onDeleteStudent,
  onSaveConfig,
  onViewStudentDetail,
  initialSubTab = 'pensyarah',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pensyarah' | 'latihan' | 'pelajar' | 'syarikat'>(initialSubTab);

  // Count metrics for badges
  const uniqueCompaniesCount = new Set(students.map(s => s.namaSyarikat?.trim().toUpperCase()).filter(Boolean)).size;

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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'pensyarah' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {lecturers.length}
            </span>
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
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'pelajar' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {students.length}
            </span>
          </button>

          {/* Sub-Tab 4: Maklumat Syarikat */}
          <button
            onClick={() => setActiveSubTab('syarikat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeSubTab === 'syarikat'
                ? 'bg-blue-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>4. Maklumat Syarikat</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'syarikat' ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {uniqueCompaniesCount}
            </span>
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
            onSaveStudent={onSaveStudent}
            onDeleteStudent={onDeleteStudent}
            onViewStudentDetail={onViewStudentDetail}
          />
        )}

        {activeSubTab === 'syarikat' && (
          <MaklumatSyarikat
            students={students}
            onViewStudentDetail={onViewStudentDetail}
          />
        )}
      </div>
    </div>
  );
};
