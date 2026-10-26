import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Code2,
  Calculator,
  GraduationCap,
  Atom,
  Scale,
  TrendingUp,
  X,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { OFFICIAL_DIAGNOSTIC_QUIZZES } from '../../data/diagnosticQuizzesData';
import { DiagnosticQuiz, DiagnosticTestRecord } from '../../types';
import { diagnosticService, taxonomyService } from '../../services/careerServices';
import { useAuth } from '../../context/AuthContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  Calculator,
  GraduationCap,
  Atom,
  Scale,
  TrendingUp,
};

interface DiagnosticChecksSectionProps {
  onContinueToRecommendations?: () => void;
}

export const DiagnosticChecksSection: React.FC<DiagnosticChecksSectionProps> = ({
  onContinueToRecommendations,
}) => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [testResults, setTestResults] = useState<Record<string, DiagnosticTestRecord>>({});
  const [activeQuiz, setActiveQuiz] = useState<DiagnosticQuiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [lastSubmittedResult, setLastSubmittedResult] = useState<DiagnosticTestRecord | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds

  // Load results from storage
  const loadResults = () => {
    setTestResults(diagnosticService.getTestResults(userId));
  };

  useEffect(() => {
    loadResults();
    window.addEventListener('careerguide_diagnostic_updated', loadResults);
    return () => window.removeEventListener('careerguide_diagnostic_updated', loadResults);
  }, [userId]);

  // Timer countdown while taking quiz
  useEffect(() => {
    if (!activeQuiz || showResultModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, showResultModal]);

  const handleStartQuiz = (quiz: DiagnosticQuiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setShowResultModal(false);
    setTimeLeft(quiz.duration_minutes * 60);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let correctCount = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_index) {
        correctCount += 1;
      }
    });

    const total = activeQuiz.questions.length;
    const scoreVal = Number(((correctCount / total) * 10).toFixed(1));
    const percentage = Math.round((correctCount / total) * 100);
    const isPassed = percentage >= 70;

    const record: DiagnosticTestRecord = {
      skill_code: activeQuiz.skill_code,
      quiz_id: activeQuiz.id,
      score: scoreVal,
      percentage,
      is_passed: isPassed,
      total_questions: total,
      correct_answers: correctCount,
      tested_at: new Date().toISOString(),
      answers: selectedAnswers,
    };

    diagnosticService.saveTestResult(record, userId);
    setLastSubmittedResult(record);
    setShowResultModal(true);
  };

  const handleRetakeQuiz = () => {
    if (!activeQuiz) return;
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setShowResultModal(false);
    setTimeLeft(activeQuiz.duration_minutes * 60);
  };

  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    setShowResultModal(false);
    setLastSubmittedResult(null);
  };

  // Stats calculation
  const totalQuizzes = OFFICIAL_DIAGNOSTIC_QUIZZES.length;
  const completedCount = Object.keys(testResults).length;
  const passedCount = Object.values(testResults).filter((r) => r.is_passed).length;
  const avgScore =
    completedCount > 0
      ? (
          Object.values(testResults).reduce((sum, r) => sum + r.score, 0) / completedCount
        ).toFixed(1)
      : '0.0';

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
              <span>FR03: Chuẩn Hóa Điểm & Chẩn Đoán Kỹ Năng Đầu Vào</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Bài Kiểm Tra Chẩn Đoán Năng Lực Đầu Vào (Optional Diagnostic Checks)
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Bên cạnh điểm học bạ văn hóa THPT, các bài kiểm tra chẩn đoán ngắn (10 phút) giúp xác thực năng lực tư duy logic, giải tích định lượng, ngoại ngữ học thuật và kiến thức chuyên ngành.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onContinueToRecommendations && (
              <button
                type="button"
                onClick={onContinueToRecommendations}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <span>Xem Đề Xuất Ngành (XAI)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic Key Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Chuyên đề có sẵn</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{totalQuizzes} bộ đề</p>
          </div>
          <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Đã hoàn thành</p>
            <p className="text-lg font-bold text-blue-700 mt-0.5">
              {completedCount} / {totalQuizzes}
            </p>
          </div>
          <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Đạt chuẩn năng lực (≥ 70%)</p>
            <p className="text-lg font-bold text-emerald-700 mt-0.5">
              {passedCount} kỹ năng
            </p>
          </div>
          <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
            <p className="text-[11px] font-medium text-slate-500">Điểm trung bình</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
              {avgScore} / 10
            </p>
          </div>
        </div>

        {/* Explainability Note */}
        <div className="flex items-start space-x-2.5 p-3 rounded-md bg-blue-50/50 border border-blue-100 text-xs text-blue-800">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Nguyên lý tích hợp vào Lộ trình học (Gap Analysis):</strong> Khi bạn đạt kết quả <strong>≥ 7.0/10</strong>, kỹ năng tương ứng sẽ được backend xác nhận là <strong>Đã thành thạo (Mastered)</strong>. Thuật toán phân tích khoảng cách sẽ tự động bỏ qua kỹ năng này trong danh sách thiếu hụt, giúp bạn tiết kiệm 4 - 6 tuần tự học kiến thức nền tảng trong lộ trình đại học.
          </p>
        </div>
      </div>

      {/* Quizzes Grid (6 Domains) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {OFFICIAL_DIAGNOSTIC_QUIZZES.map((quiz, idx) => {
          const Icon = ICON_MAP[quiz.icon] || BrainCircuit;
          const result = testResults[quiz.skill_code];
          const isPassed = result?.is_passed;

          // Target major names
          const targetMajors = quiz.prerequisite_for
            .slice(0, 2)
            .map((code) => taxonomyService.getMajorByCode(code)?.name || code)
            .join(', ');

          return (
            <div
              key={quiz.id}
              className={`rounded-lg p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                result
                  ? isPassed
                    ? 'bg-white border-emerald-300 ring-1 ring-emerald-200 shadow-xs'
                    : 'bg-white border-amber-300 ring-1 ring-amber-200 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Header Icon & Status */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  {result ? (
                    isPassed ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đạt chuẩn ({result.score}/10)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Cần ôn tập ({result.score}/10)</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Chưa làm bài
                    </span>
                  )}
                </div>

                {/* Title & Domain */}
                <div>
                  <span className="text-[10px] font-mono font-semibold uppercase text-slate-600">
                    {quiz.domain}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                {/* Target Majors linkage */}
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="text-slate-600 font-semibold">Tiên quyết cho: </span>
                  <span>{targetMajors}...</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-600 font-medium flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-600" />
                  <span>{quiz.duration_minutes} phút • {quiz.questions.length} câu</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleStartQuiz(quiz)}
                  className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center space-x-1 ${
                    result
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <span>{result ? 'Làm lại đề' : 'Bắt đầu làm'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUIZ TAKING MODAL */}
      {activeQuiz && !showResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-blue-700">
                    {activeQuiz.domain}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Câu {currentQuestionIdx + 1} / {activeQuiz.questions.length}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{activeQuiz.title}</h3>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-200 text-slate-800 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseQuiz}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Question Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIdx + 1) / activeQuiz.questions.length) * 100
                    }%`,
                  }}
                />
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Câu hỏi {currentQuestionIdx + 1}
                </span>
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {activeQuiz.questions[currentQuestionIdx].question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
                  const qId = activeQuiz.questions[currentQuestionIdx].id;
                  const isSelected = selectedAnswers[qId] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(qId, optIdx)}
                      className={`w-full text-left p-3.5 rounded-md border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                className="px-3.5 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                Câu trước
              </button>

              <div className="flex items-center space-x-2">
                {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                    className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Câu kế tiếp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Nộp Bài Chẩn Đoán</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL WITH DETAILED EXPLANATIONS */}
      {showResultModal && lastSubmittedResult && activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Result */}
            <div
              className={`p-6 text-center space-y-2 border-b ${
                lastSubmittedResult.is_passed
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : 'bg-amber-50/80 border-amber-200'
              }`}
            >
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center shadow-xs">
                {lastSubmittedResult.is_passed ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-amber-600" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {lastSubmittedResult.is_passed
                  ? 'Xuất Sắc! Đạt Chuẩn Năng Lực Đầu Vào'
                  : 'Hoàn Thành Bài Kiểm Tra Chẩn Đoán'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {lastSubmittedResult.is_passed
                  ? `Bạn đã đạt ${lastSubmittedResult.correct_answers}/${lastSubmittedResult.total_questions} câu (${lastSubmittedResult.percentage}%). Kỹ năng "${activeQuiz.badge_name}" đã được xác nhận thành thạo và tích hợp vào Lộ trình học.`
                  : `Bạn đạt ${lastSubmittedResult.correct_answers}/${lastSubmittedResult.total_questions} câu (${lastSubmittedResult.percentage}%). Điểm đạt chuẩn là ≥ 70%. Kỹ năng này sẽ được ưu tiên bồi dưỡng trong Lộ trình học của bạn.`}
              </p>
              <div className="pt-1">
                <span className="text-2xl font-black font-mono text-slate-900">
                  {lastSubmittedResult.score} / 10 Điểm
                </span>
              </div>
            </div>

            {/* Question Breakdown with Explanations */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 divide-y divide-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Chi Tiết Đáp Án & Giải Thích Học Thuật
              </h4>

              {activeQuiz.questions.map((q, idx) => {
                const userAns = lastSubmittedResult.answers[q.id];
                const isCorrect = userAns === q.correct_index;

                return (
                  <div key={q.id} className="pt-4 space-y-2 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800">
                        Câu {idx + 1}: {q.question}
                      </span>
                      {isCorrect ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                          Đúng (+2đ)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] shrink-0">
                          Chưa đúng
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-slate-600 pl-2">
                      <p>
                        <span className="font-semibold text-slate-700">Lựa chọn của bạn: </span>
                        {userAns !== undefined ? q.options[userAns] : 'Chưa trả lời'}
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-700 font-semibold">
                          <span>Đáp án chính xác: </span>
                          {q.options[q.correct_index]}
                        </p>
                      )}
                    </div>

                    {/* Academic Explanation */}
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                      <span className="font-semibold text-slate-800">Giải thích khoa học: </span>
                      {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Controls */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleRetakeQuiz}
                className="px-3.5 py-1.5 rounded text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại bài này</span>
              </button>

              <button
                type="button"
                onClick={handleCloseQuiz}
                className="px-5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Đóng & Xem Tất Cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
