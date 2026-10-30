import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageSquare,
  MapPin,
  X,
  Award,
  BookOpen,
  RefreshCw,
  Cpu,
  Layers,
  Target,
  FileText,
} from 'lucide-react';
import { AIExplanationResponse } from '../../types';
import { aiGuidanceService } from '../../services/careerServices';
import { AIMarkdownRenderer } from './AIMarkdownRenderer';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  majorCode: string;
  majorName: string;
  riasecScores?: Record<string, number>;
  grades?: Record<string, number>;
  diagnosticMasteredSkills?: string[];
  userId?: string | null;
  onOpenChatWithMajor?: (majorCode: string, majorName: string) => void;
  onNavigateToRoadmap?: (majorCode: string) => void;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  majorCode,
  majorName,
  riasecScores,
  grades,
  diagnosticMasteredSkills,
  userId,
  onOpenChatWithMajor,
  onNavigateToRoadmap,
}) => {
  const [data, setData] = useState<AIExplanationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dossier' | 'pillars' | 'action_plan'>('dossier');

  useEffect(() => {
    if (!isOpen || !majorCode) return;

    setLoading(true);
    setError(null);

    aiGuidanceService
      .explainRecommendation({
        major_code: majorCode,
        riasec_scores: riasecScores,
        grades_by_subject: grades,
        diagnostic_skills_mastered: diagnosticMasteredSkills,
        userId,
      })
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Error fetching AI explanation:', err);
        setError('Không thể tải bản giải trình AI lúc này.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, majorCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-4">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Giải Trình AI Định Hướng Ngành Học (XAI Report)
                  </h2>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                    {majorCode}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {majorName}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Engine Status & Law 91 Badge */}
        <div className="bg-slate-900 text-slate-200 px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between text-[11px] gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Báo Cáo Phân Tích Chuyên Sâu Do AI Cố Vấn Tự Động Sinh</span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-blue-300">Model: deepseek-4.1-flash-ckey</span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Khử khuẩn PII theo Luật 91/2025/QH15 & Chuẩn TT 09/2022/TT-BGDĐT</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 bg-white border-b border-slate-200 flex space-x-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'dossier'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Bản Báo Cáo Chuyên Sâu (AI Dossier)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pillars')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'pillars'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Bóc Tách 3 Trụ Cột Độc Lập</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('action_plan')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'action_plan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>3. Thế Mạnh & Lộ Trình Hành Động</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                AI Cố vấn đang tổng hợp dữ liệu học bạ, RIASEC và bài test chẩn đoán để lập báo cáo...
              </p>
              <p className="text-xs text-slate-400">
                (Áp dụng chuẩn Thông tư 09/2022/TT-BGDĐT và đối sánh 3 trụ cột độc lập)
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* TAB 1: AI DOSSIER (BÁO CÁO PHÂN TÍCH TOÀN DIỆN) */}
              {activeTab === 'dossier' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-5 rounded-xl border border-blue-200/80 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
                      <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span>Bản Phân Tích Tương Thích & Giải Trình Định Hướng</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        Tự động sinh bởi AI
                      </span>
                    </div>

                    <AIMarkdownRenderer
                      content={data.detailed_explanation}
                      className="text-slate-800"
                    />
                  </div>

                  {/* Highlights Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="text-[11px] font-bold text-blue-700 uppercase">Sở thích nghề nghiệp</div>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {data.riasec_alignment}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase">Học bạ THPT</div>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {data.academic_alignment}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="text-[11px] font-bold text-purple-700 uppercase">Chẩn đoán năng lực</div>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {data.diagnostic_readiness}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 3 PILLARS DEEP DIVE */}
              {activeTab === 'pillars' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Pillar 1: RIASEC */}
                  <div className="bg-white p-5 rounded-xl border border-blue-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
                        <BrainCircuit className="w-5 h-5 text-blue-600" />
                        <span>Trụ cột 1: Độ Tương Thích Sở Thích Nghề Nghiệp</span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Trọng số 45%
                      </span>
                    </div>
                    <AIMarkdownRenderer content={data.riasec_alignment} />
                  </div>

                  {/* Pillar 2: Academic */}
                  <div className="bg-white p-5 rounded-xl border border-emerald-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        <span>Trụ cột 2: Năng Lực Học Thuật</span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Trọng số 35%
                      </span>
                    </div>
                    <AIMarkdownRenderer content={data.academic_alignment} />
                  </div>

                  {/* Pillar 3: Diagnostic */}
                  <div className="bg-white p-5 rounded-xl border border-purple-200/80 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-purple-800 font-bold text-sm">
                        <Award className="w-5 h-5 text-purple-600" />
                        <span>Trụ cột 3: Chẩn Đoán Kỹ Năng Nền Tảng Đầu Vào</span>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        Miễn trừ học phần
                      </span>
                    </div>
                    <AIMarkdownRenderer content={data.diagnostic_readiness} />
                  </div>
                </div>
              )}

              {/* TAB 3: STRENGTHS & ACTION PLAN */}
              {activeTab === 'action_plan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  {/* Strengths */}
                  <div className="bg-gradient-to-br from-emerald-50/60 to-white p-5 rounded-xl border border-emerald-200 space-y-3 shadow-xs">
                    <div className="flex items-center space-x-2 text-sm font-bold text-emerald-900 pb-2 border-b border-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Thế Mạnh Nổi Bật Của Bạn Với Ngành</span>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                      {data.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium">{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Focus Areas */}
                  <div className="bg-gradient-to-br from-blue-50/60 to-white p-5 rounded-xl border border-blue-200 space-y-3 shadow-xs">
                    <div className="flex items-center space-x-2 text-sm font-bold text-blue-900 pb-2 border-b border-blue-100">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                      <span>Kế Hoạch Bứt Phá & Trọng Tâm Cần Ôn Luyện</span>
                    </div>
                    <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                      {data.recommended_focus_areas.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <span className="font-medium text-slate-600">Định hướng khách quan</span>
            <span>•</span>
            <span className="font-semibold text-blue-700">Thông tư 09/2022/TT-BGDĐT</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenChatWithMajor) {
                  onOpenChatWithMajor(majorCode, majorName);
                } else {
                  window.dispatchEvent(
                    new CustomEvent('open_ai_counselor_chat', {
                      detail: { majorCode, majorName },
                    })
                  );
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-colors shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Chat sâu hơn với Cố vấn AI</span>
            </button>

            {onNavigateToRoadmap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToRoadmap(majorCode);
                }}
                className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Tạo lộ trình học tập</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
