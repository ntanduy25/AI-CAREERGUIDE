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
} from 'lucide-react';
import { AIExplanationResponse } from '../../types';
import { aiGuidanceService } from '../../services/careerServices';

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
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Giải Trình AI Định Hướng Ngành Học (XAI)
                  </h2>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Shield Notice (Law 91/2025 Compliance) */}
        <div className="bg-emerald-50/80 px-6 py-2.5 border-b border-emerald-100 flex items-center space-x-2 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Bảo vệ dữ liệu cá nhân (Luật 91/2025/QH15):</strong> Phân tích hoàn toàn dựa trên điểm số và kết quả bài test đã ẩn danh; tuyệt đối không gửi tên, trường lớp, số điện thoại hay thông tin định danh của học sinh.
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                AI Cố vấn đang phân tích kết quả bài test và học bạ của bạn...
              </p>
              <p className="text-[11px] text-slate-400">
                (Áp dụng chuẩn Thông tư 09/2022/TT-BGDĐT và đối sánh 3 trụ cột)
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Detailed Synthesis */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Tổng quan lý do đề xuất ngành</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {data.detailed_explanation}
                </p>
              </div>

              {/* 3 Pillars Deep Dive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {/* Pillar 1: RIASEC */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2 text-blue-700 font-bold text-xs">
                    <BrainCircuit className="w-4 h-4" />
                    <span>1. Sở thích Holland RIASEC</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.riasec_alignment}
                  </p>
                </div>

                {/* Pillar 2: Academic */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>2. Năng lực Học bạ THPT</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.academic_alignment}
                  </p>
                </div>

                {/* Pillar 3: Diagnostic FR03 */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2 text-purple-700 font-bold text-xs">
                    <Award className="w-4 h-4" />
                    <span>3. Chẩn đoán Kỹ năng (FR03)</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {data.diagnostic_readiness}
                  </p>
                </div>
              </div>

              {/* Strengths & Focus Areas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Strengths */}
                <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-200 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Thế mạnh cốt lõi của bạn với ngành:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-900">
                    {data.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Focus Areas */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span>Kiến thức / Kỹ năng cần trau dồi thêm:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-blue-900">
                    {data.recommended_focus_areas.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span>Mô hình đề xuất Pure Guidance Scope</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">Thông tư 09/2022/TT-BGDĐT</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
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
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>Chat với Cố vấn AI</span>
            </button>

            {onNavigateToRoadmap && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToRoadmap(majorCode);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Tạo lộ trình học tập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
