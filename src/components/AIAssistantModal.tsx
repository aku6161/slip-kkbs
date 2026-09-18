import React, { useState } from 'react';
import { Student, DocumentType } from '../types';
import { Sparkles, Brain, X, Send, Copy, Check, FileText, Bot, RefreshCw } from 'lucide-react';

interface AIAssistantModalProps {
  student?: Student | null;
  initialTask?: string;
  onClose: () => void;
  onApplyAiResult?: (text: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  student,
  initialTask = 'draft_cover_letter',
  onClose,
  onApplyAiResult,
}) => {
  const [task, setTask] = useState<string>(initialTask);
  const [enableThinking, setEnableThinking] = useState<boolean>(true);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [modelUsed, setModelUsed] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleRunAi = async () => {
    if (!student) return;
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student,
          task,
          customPrompt,
          enableThinking,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Ralat semasa memproses AI');
      }

      setResult(data.result);
      setModelUsed(data.modelUsed);
    } catch (err: any) {
      setResult(`Ralat: ${err.message || 'Gagal menyambung ke pelayan AI'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative animate-fade-in my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded uppercase">
                PEMBANTU AI SLIP
              </span>
              <span className="text-[10px] font-bold font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1">
                <Brain className="w-3 h-3 text-amber-700" /> GEMINI 3.1 PRO (HIGH THINKING)
              </span>
            </div>
            <h2 className="text-lg font-black uppercase text-slate-900 mt-1">
              Jana & Analisis Permohonan Latihan Industri
            </h2>
            {student && (
              <p className="text-xs text-slate-600">
                Pelajar: <strong className="text-slate-900">{student.namaPelajar}</strong> ({student.noMatrik}) | Syarikat: <strong className="text-blue-900">{student.namaSyarikat}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Task Selection */}
        <div className="space-y-4 text-xs text-slate-800">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 uppercase">
              Pilih Tugasan AI:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTask('draft_cover_letter')}
                className={`p-3 rounded-lg border text-left font-bold transition-all cursor-pointer ${
                  task === 'draft_cover_letter'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📝 Surat Permohonan Rasmi
              </button>

              <button
                type="button"
                onClick={() => setTask('enhance_resume')}
                className={`p-3 rounded-lg border text-left font-bold transition-all cursor-pointer ${
                  task === 'enhance_resume'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📄 Ringkasan Resume Impak Tinggi
              </button>

              <button
                type="button"
                onClick={() => setTask('tailor_scope')}
                className={`p-3 rounded-lg border text-left font-bold transition-all cursor-pointer ${
                  task === 'tailor_scope'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📋 Skop Latihan Disesuaikan
              </button>
            </div>
          </div>

          {/* Thinking Mode Toggle */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Brain className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-bold text-amber-950 text-xs">Mod Pemikiran Mendalam (Thinking Mode - HIGH)</p>
                <p className="text-[11px] text-amber-800">
                  Menggunakan model <code className="font-mono font-bold">gemini-3.1-pro-preview</code> dengan <code className="font-mono font-bold">ThinkingLevel.HIGH</code> untuk analisis penaakulan perhotelan yang mendalam.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={enableThinking}
                onChange={e => setEnableThinking(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-700"></div>
            </label>
          </div>

          {/* Custom Instruction Prompt */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 uppercase">
              Arahan Tambahan (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Tekankan penguasaan perkhidmatan Front Office Marriott & Anugerah HPNM..."
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-900 outline-none text-slate-900"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleRunAi}
            disabled={loading || !student}
            className="w-full bg-purple-900 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-300" />
                Menggunakan Gemini AI (Thinking Mode HIGH)...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-300" />
                Jana Kandungan AI Sekarang
              </>
            )}
          </button>

          {/* Result Area */}
          {result && (
            <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-purple-950 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-purple-700" />
                  Hasil Generasi AI ({modelUsed}):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Disalin!' : 'Salin Teks'}
                  </button>
                  {onApplyAiResult && (
                    <button
                      onClick={() => {
                        onApplyAiResult(result);
                        onClose();
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] cursor-pointer"
                    >
                      Gunakan Dalam Resume
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto shadow-inner border border-slate-800">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
