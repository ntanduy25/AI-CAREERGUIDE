import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Save,
  Flame,
  HelpCircle,
  Wrench,
  Compass,
  Sprout,
  Microscope,
  ShieldCheck,
  Code2,
  Dna,
  Atom,
  BookOpenCheck,
  Palette,
  Layers,
  Clapperboard,
  Music,
  GraduationCap,
  HeartPulse,
  Users,
  Handshake,
  Globe2,
  Briefcase,
  TrendingUp,
  Scale,
  Megaphone,
  Building2,
  Calculator,
  FolderKanban,
  Truck,
  ClipboardCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useAssessment } from '../../context/AssessmentContext';
import { useAssessmentQuestions } from '../../hooks/useAssessmentQuestions';
import { QAPersonaPreset } from '../../types';

// Dynamic icon resolver mapping icon names from DB/JSON to Lucide components
const LUCIDE_ICONS: Record<string, React.ElementType> = {
  Wrench,
  Compass,
  Sprout,
  Microscope,
  ShieldCheck,
  BrainCircuit,
  Code2,
  Dna,
  Atom,
  BookOpenCheck,
  Palette,
  Layers,
  Clapperboard,
  Music,
  Sparkles,
  GraduationCap,
  HeartPulse,
  Users,
  Handshake,
  Globe2,
  Briefcase,
  TrendingUp,
  Scale,
  Megaphone,
  Building2,
  Calculator,
  FolderKanban,
  CheckCircle2,
  Truck,
  ClipboardCheck,
};

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: questionSet, isLoading, error } = useAssessmentQuestions();

  const {
    riasecAnswers,
    setRiasecAnswer,
    cognitiveAnswers,
    setCognitiveAnswer,
    applyQAPreset,
    submitAssessment,
    isSubmitting,
    isCompleted,
    calculatedVector,
    dominantTraits,
    resetAssessment,
    xpPoints,
  } = useAssessment();

  // Active step: 0 to 5 = RIASEC Groups (R, I, A, S, E, C), 6 = Cognitive Preferences, 7 = Result Summary
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [questionDetailCode, setQuestionDetailCode] = useState<string | null>(null);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm animate-spin">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700">
          Đang tải bộ câu hỏi khảo sát hoạt động từ cơ sở dữ liệu...
        </p>
        <p className="text-xs text-slate-400">
          Thông tư 74/2026/TT-BGDĐT &bull; Quản lý phiên bản khảo sát v1.8
        </p>
      </div>
    );
  }

  const riasecGroups = questionSet?.riasec_groups || [];
  const riasecQuestions = questionSet?.riasec_questions || [];
  const cognitiveQuestions = questionSet?.cognitive_questions || [];
  const likertScale = questionSet?.likert_scale || [
    { value: 1, label: 'Rất không thích', emoji: '😣', weight: 0.0 },
    { value: 2, label: 'Không thích', emoji: '🙁', weight: 0.25 },
    { value: 3, label: 'Bình thường', emoji: '😐', weight: 0.5 },
    { value: 4, label: 'Khá thích', emoji: '🙂', weight: 0.75 },
    { value: 5, label: 'Rất yêu thích', emoji: '🤩', weight: 1.0 },
  ];
  const presets = questionSet?.qa_persona_presets || [];

  // Group questions by RIASEC dimension
  const currentGroupMeta = riasecGroups[currentStepIndex];
  const currentGroupQuestions = riasecQuestions.filter(
    (q) => q.dimension === currentGroupMeta?.dimension
  );

  // Overall progress calculation
  const totalQuestions = 30 + 8;
  const answeredRiasecCount = Object.keys(riasecAnswers).length;
  const answeredCogCount = Object.keys(cognitiveAnswers).length;
  const totalAnswered = answeredRiasecCount + answeredCogCount;
  const progressPercent = Math.min(100, Math.round((totalAnswered / totalQuestions) * 100));

  const handleApplyPreset = (preset: QAPersonaPreset) => {
    applyQAPreset(preset);
    setPresetNotice(`Đã nạp 38 câu trả lời theo "${preset.name}" (${preset.badge})!`);
    setTimeout(() => setPresetNotice(null), 4000);
  };

  const handleNextStep = () => {
    if (currentStepIndex < 6) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    await submitAssessment();
    setCurrentStepIndex(7); // Show result page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* QA Persona Presets Quick Fill Bar */}
      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              QA Persona Presets (Kiểm thử nhanh 1-Click)
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-mono">
            {questionSet?.circular_ref} &bull; Version {questionSet?.version}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-semibold text-slate-100 transition-all hover:scale-105 flex items-center space-x-1.5"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {presetNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{presetNotice}</span>
          </div>
          <button
            onClick={() => handleFinalSubmit()}
            className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
          >
            Nộp bài ngay &rarr;
          </button>
        </div>
      )}

      {/* Main Header & Gamification Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold font-mono">
                Chuẩn v{questionSet?.version || '1.8'}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs text-slate-500 font-medium">
                {totalAnswered} / {totalQuestions} câu hỏi ({progressPercent}%)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Khảo Sát Sở Thích Nghề Nghiệp & Thiên Hướng Nhận Thức
            </h1>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-brand-700 text-xs font-black">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>{xpPoints} XP</span>
            </div>
            <button
              onClick={resetAssessment}
              title="Xóa nháp và bắt đầu lại từ đầu"
              className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Xóa nháp</span>
            </button>
          </div>
        </div>

        {/* Multi-step Group Indicator */}
        <div className="grid grid-cols-7 gap-1.5 pt-2">
          {riasecGroups.map((grp, idx) => {
            const isGroupActive = currentStepIndex === idx;
            const isGroupDone = riasecQuestions
              .filter((q) => q.dimension === grp.dimension)
              .every((q) => riasecAnswers[q.code]);

            return (
              <button
                key={grp.dimension}
                onClick={() => setCurrentStepIndex(idx)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  isGroupActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-extrabold'
                    : isGroupDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs'
                }`}
              >
                <div className="text-[11px] font-bold truncate">{grp.name_vi}</div>
              </button>
            );
          })}

          <button
            onClick={() => setCurrentStepIndex(6)}
            className={`py-2 px-1 rounded-xl text-center transition-all ${
              currentStepIndex === 6
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 font-extrabold'
                : answeredCogCount === 8
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs'
            }`}
          >
            <div className="text-[11px] font-bold">Nhận thức</div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEPS 0 to 5: RIASEC Groups (5 questions per group)           */}
      {/* ============================================================== */}
      {currentStepIndex >= 0 && currentStepIndex <= 5 && currentGroupMeta && (
        <div className="space-y-6">
          {/* Dimension Header Banner */}
          <div className="bg-gradient-to-r from-brand-50 to-indigo-50/60 rounded-3xl p-6 border border-brand-100 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-brand-600 text-white font-mono font-black text-sm flex items-center justify-center shadow-sm">
                {currentGroupMeta.dimension}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Nhóm {currentGroupMeta.badge}
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {currentGroupMeta.description}
            </p>
          </div>

          {/* 5 Questions in this group */}
          <div className="space-y-4">
            {currentGroupQuestions.map((q) => {
              const IconComponent = (q.icon_name && LUCIDE_ICONS[q.icon_name]) ? LUCIDE_ICONS[q.icon_name] : BrainCircuit;
              const currentScore = riasecAnswers[q.code];

              return (
                <div
                  key={q.code}
                  className={`bg-white rounded-3xl p-6 border transition-all space-y-4 ${
                    currentScore
                      ? 'border-brand-200 shadow-sm ring-1 ring-brand-100'
                      : 'border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {q.question_text}
                        </h3>
                      </div>
                    </div>


                  </div>



                  {/* 5-point Likert Scale Radio Grid */}
                  <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-50">
                    {likertScale.map((opt) => {
                      const isSelected = currentScore === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRiasecAnswer(q.code, opt.value)}
                          className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.03] font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                          }`}
                        >
                          <span className="text-lg">{opt.emoji}</span>
                          <span className="text-[10px] leading-tight text-center line-clamp-1">
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 ${
                currentStepIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Nhóm Trước</span>
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 flex items-center space-x-2"
            >
              <span>
                {currentStepIndex === 5 ? 'Sang Thiên Hướng Nhận Thức &rarr;' : 'Nhóm Kế Tiếp'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 6: Cognitive Preferences (8 questions, 4 options each)    */}
      {/* ============================================================== */}
      {currentStepIndex === 6 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50/60 rounded-3xl p-6 border border-purple-100 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-xl bg-purple-600 text-white font-mono font-black text-sm flex items-center justify-center shadow-sm">
                COG
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                8 Chiều Thiên Hướng Nhận Thức & Môi Trường Học Tập
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Định vị phong cách tiếp thu, phương pháp giải quyết vấn đề và đối tượng tương tác chính theo Thông tư 74/2026/TT-BGDĐT.
            </p>
          </div>

          <div className="space-y-6">
            {cognitiveQuestions.map((q) => {
              const dimKey = q.dimension || q.dimension_key || q.code;
              const currentChoice = cognitiveAnswers[dimKey] || cognitiveAnswers[q.code];

              return (
                <div
                  key={q.code}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{q.question_text || q.title}</h3>
                    </div>

                  </div>



                  {/* 4 Cards Grid (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options?.map((opt) => {
                      const isSelected = currentChoice === opt.option_key;

                      return (
                        <div
                          key={opt.option_key}
                          onClick={() => {
                            setCognitiveAnswer(dimKey, opt.option_key);
                            setCognitiveAnswer(q.code, opt.option_key);
                          }}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                            isSelected
                              ? 'bg-purple-50/90 border-purple-600 shadow-sm ring-2 ring-purple-300'
                              : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-purple-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {opt.option_key}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{opt.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {opt.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStepIndex(5)}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay Lại Nhóm C</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/30 flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang Xử Lý Toán Học...' : '🚀 Hoàn Tất & Nộp Bài Khảo Sát'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 7: Result Summary View                                    */}
      {/* ============================================================== */}
      {currentStepIndex === 7 && calculatedVector && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold font-mono">
              +1,150 XP HOÀN TẤT
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              Chân Dung Nghề Nghiệp Holland RIASEC & Nhận Thức Chuẩn v1.8
            </h2>
            <p className="text-xs text-slate-500">
              Được tính toán 100% tất định theo công thức chuẩn hóa của Bộ GD&ĐT.
            </p>
          </div>

          {/* Dominant Traits */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {dominantTraits.map((t, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-purple-50 text-purple-800 font-extrabold text-xs border border-purple-200"
              >
                ★ {t}
              </span>
            ))}
          </div>

          {/* 6 RIASEC Dimension Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-4">
            {Object.entries(calculatedVector).map(([dim, val]) => (
              <div key={dim} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-mono text-xs font-bold text-slate-500 uppercase">{dim}</span>
                <div className="text-lg font-black text-slate-900">{((val as number) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/recommendations')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2"
            >
              <span>Xem Gợi Ý Ngành Học XAI 3 Trụ Cột</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/academic-transcript')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Nhập Điểm Học Bạ THPT (Z-Score)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
