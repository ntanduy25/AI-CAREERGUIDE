import { getActiveCircular } from '../../constants/regulations';
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  FileSpreadsheet,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Save,
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
  BookOpen,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Check,
  Play,
  Eye,
  SlidersHorizontal,
  History,
  Trash2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';

import { useAssessment } from '../../context/AssessmentContext';
import { useAuth } from '../../context/AuthContext';
import { useAssessmentQuestions } from '../../hooks/useAssessmentQuestions';
import { DiagnosticChecksSection } from '../../components/diagnostic/DiagnosticChecksSection';
import { AIExplanationModal } from '../../components/ai/AIExplanationModal';
import {
  recommendationService,
  taxonomyService,
  recommendationHistoryService,
  roadmapStorageService,
  diagnosticService,
} from '../../services/careerServices';
import {
  MajorRecommendation,
  BroadFieldRecommendation,
  RecommendationHistoryItem,
  QAPersonaPreset,
  RIASECVector,
} from '../../types';
import {
  getScopedItem,
  setScopedItem,
  removeScopedItem,
} from '../../utils/userStorage';

// Map icon names to Lucide icons
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

interface SemesterGrades {
  math: number;
  physics: number;
  chemistry: number;
  biology: number;
  informatics: number;
  literature: number;
  history: number;
  geography: number;
  english: number;
}

const EMPTY_GRADES: SemesterGrades = {
  math: 0,
  physics: 0,
  chemistry: 0,
  biology: 0,
  informatics: 0,
  literature: 0,
  history: 0,
  geography: 0,
  english: 0,
};

export const GuidanceHubPage: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const userId = user?.id || null;
  const location = useLocation();
  const navigate = useNavigate();

  // Query parameter tab support: ?tab=riasec | transcript | recommendation
  const searchParams = new URLSearchParams(location.search);
  const initialTabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'riasec' | 'transcript' | 'diagnostic' | 'recommendation'>(() => {
    if (initialTabParam === 'transcript') return 'transcript';
    if (initialTabParam === 'diagnostic') return 'diagnostic';
    if (initialTabParam === 'recommendation') return 'recommendation';
    return 'riasec';
  });

  // Keep activeTab in sync if query param changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'transcript' || tab === 'recommendation' || tab === 'riasec' || tab === 'diagnostic') {
      setActiveTab(tab as any);
    }
  }, [location.search]);

  const handleTabChange = (newTab: 'riasec' | 'transcript' | 'diagnostic' | 'recommendation') => {
    setActiveTab(newTab);
    navigate(`/guidance?tab=${newTab}`, { replace: true });
  };

  // Diagnostic Skill Checks
  const [diagnosticResults, setDiagnosticResults] = useState(() => diagnosticService.getTestResults(userId));

  useEffect(() => {
    const handleDiagChange = () => {
      setDiagnosticResults(diagnosticService.getTestResults(userId));
    };
    window.addEventListener('careerguide_diagnostic_updated', handleDiagChange);
    return () => window.removeEventListener('careerguide_diagnostic_updated', handleDiagChange);
  }, [userId]);

  const hasDiagnosticResults = Object.keys(diagnosticResults).length > 0;
  const passedDiagnosticCount = Object.values(diagnosticResults).filter(r => r.is_passed).length;

  // AI Explanation (XAI) Modal State
  const [explanationModalMajor, setExplanationModalMajor] = useState<{
    code: string;
    name: string;
  } | null>(null);

  // =========================================================================
  // STATE 1: ASSESSMENT (RIASEC & COGNITIVE)
  // =========================================================================
  const { data: questionSet, isLoading: isQuestionSetLoading } = useAssessmentQuestions();
  const {
    riasecAnswers,
    setRiasecAnswer,
    cognitiveAnswers,
    setCognitiveAnswer,
    applyQAPreset,
    submitAssessment,
    isSubmitting: isAssessmentSubmitting,
    isCompleted: isAssessmentCompleted,
    calculatedVector,
    dominantTraits,
    resetAssessment,
    xpPoints,
  } = useAssessment();

  // Internal assessment step: 0-5 (RIASEC R,I,A,S,E,C), 6 (Cognitive), 7 (Review / Completed Summary)
  const [assessmentStep, setAssessmentStep] = useState<number>(0);
  const [questionDetailCode, setQuestionDetailCode] = useState<string | null>(null);
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  // =========================================================================
  // STATE 2: ACADEMIC TRANSCRIPT & Z-SCORE
  // =========================================================================
  const [grades, setGrades] = useState<SemesterGrades>(() => {
    const saved = getScopedItem('student_grades', userId);
    return saved ? JSON.parse(saved) : EMPTY_GRADES;
  });

  const [isGradesSaved, setIsGradesSaved] = useState<boolean>(() => {
    return getScopedItem('student_grades', userId) !== null;
  });

  // Synchronize student grades and recommendation state when active user changes
  useEffect(() => {
    const saved = getScopedItem('student_grades', userId);
    if (saved) {
      try {
        setGrades(JSON.parse(saved));
        setIsGradesSaved(true);
      } catch {
        setGrades(EMPTY_GRADES);
        setIsGradesSaved(false);
      }
    } else {
      setGrades(EMPTY_GRADES);
      setIsGradesSaved(false);
    }

    setHasCalculatedRecommendations(false);
    setBroadFields([]);
    setSelectedField(null);
    setSelectedMajor(null);
    setLastCalculatedInputsHash('');
  }, [userId]);

  const [gradesNotice, setGradesNotice] = useState<string | null>(null);

  const subjects = [
    { key: 'math', label: 'Toán học', icon: Calculator },
    { key: 'physics', label: 'Vật lý', icon: Atom },
    { key: 'chemistry', label: 'Hóa học', icon: Microscope },
    { key: 'biology', label: 'Sinh học', icon: Dna },
    { key: 'informatics', label: 'Tin học', icon: Code2 },
    { key: 'literature', label: 'Ngữ văn', icon: BookOpen },
    { key: 'history', label: 'Lịch sử', icon: Building2 },
    { key: 'geography', label: 'Địa lý', icon: Globe2 },
    { key: 'english', label: 'Tiếng Anh', icon: GraduationCap },
  ];

  const handleGradeChange = (key: keyof SemesterGrades, val: string) => {
    const num = Math.min(10, Math.max(0, parseFloat(val) || 0));
    setGrades(prev => ({
      ...prev,
      [key]: num,
    }));
  };

  const handleSaveGrades = () => {
    setScopedItem('student_grades', JSON.stringify(grades), userId);
    setIsGradesSaved(true);
    setGradesNotice('Đã lưu thành công điểm học bạ THPT.');
    setTimeout(() => setGradesNotice(null), 3000);
  };

  const handleResetGrades = () => {
    setGrades(EMPTY_GRADES);
    setIsGradesSaved(false);
    removeScopedItem('student_grades', userId);
    setGradesNotice('Đã xóa dữ liệu bảng điểm học bạ.');
    setTimeout(() => setGradesNotice(null), 3000);
  };

  const applyPresetGrades = (type: 'EXCELLENT_STEM' | 'EXCELLENT_HUMANITIES' | 'GOOD_ALL') => {
    let preset: SemesterGrades;
    if (type === 'EXCELLENT_STEM') {
      preset = { math: 9.2, physics: 9.0, chemistry: 8.8, biology: 8.5, informatics: 9.5, literature: 7.8, history: 7.5, geography: 8.0, english: 8.8 };
    } else if (type === 'EXCELLENT_HUMANITIES') {
      preset = { math: 8.0, physics: 7.5, chemistry: 7.2, biology: 7.8, informatics: 8.0, literature: 9.2, history: 9.0, geography: 9.1, english: 9.0 };
    } else {
      preset = { math: 8.0, physics: 8.0, chemistry: 7.8, biology: 7.5, informatics: 8.2, literature: 8.0, history: 7.8, geography: 8.0, english: 8.2 };
    }
    setGrades(preset);
    setScopedItem('student_grades', JSON.stringify(preset), userId);
    setIsGradesSaved(true);
    setGradesNotice(`Đã áp dụng mẫu điểm: ${type === 'EXCELLENT_STEM' ? 'Tự nhiên (STEM)' : type === 'EXCELLENT_HUMANITIES' ? 'Xã hội & Ngoại ngữ' : 'Khá - Giỏi toàn diện'}`);
    setTimeout(() => setGradesNotice(null), 3000);
  };

  const hasAnyGrade = Object.values(grades).some(val => val > 0);

  // Admission blocks calculated
  const blocks = useMemo(() => [
    {
      code: 'A00',
      name: 'Toán, Vật lý, Hóa học',
      score: Number((grades.math + grades.physics + grades.chemistry).toFixed(2)),
      mu: 20.85,
      sigma: 3.25,
    },
    {
      code: 'A01',
      name: 'Toán, Vật lý, Tiếng Anh',
      score: Number((grades.math + grades.physics + grades.english).toFixed(2)),
      mu: 20.40,
      sigma: 3.35,
    },
    {
      code: 'D01',
      name: 'Toán, Ngữ văn, Tiếng Anh',
      score: Number((grades.math + grades.literature + grades.english).toFixed(2)),
      mu: 19.95,
      sigma: 3.10,
    },
    {
      code: 'B00',
      name: 'Toán, Hóa học, Sinh học',
      score: Number((grades.math + grades.chemistry + grades.biology).toFixed(2)),
      mu: 19.80,
      sigma: 3.40,
    },
    {
      code: 'C00',
      name: 'Ngữ văn, Lịch sử, Địa lý',
      score: Number((grades.literature + grades.history + grades.geography).toFixed(2)),
      mu: 19.20,
      sigma: 3.15,
    },
  ], [grades]);

  // Standard Normal CDF for Z-Score Percentile
  const normalCDF = (z: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  };

  // =========================================================================
  // STATE 3: XAI RECOMMENDATIONS (ONLY REVEALED ON DEMAND)
  // =========================================================================
  const [hasCalculatedRecommendations, setHasCalculatedRecommendations] = useState<boolean>(false);
  const [isCalculatingRecs, setIsCalculatingRecs] = useState<boolean>(false);
  const [broadFields, setBroadFields] = useState<BroadFieldRecommendation[]>([]);
  const [selectedField, setSelectedField] = useState<BroadFieldRecommendation | null>(null);
  const [selectedMajor, setSelectedMajor] = useState<MajorRecommendation | null>(null);

  // Recommendation History state
  const [historyList, setHistoryList] = useState<RecommendationHistoryItem[]>(() =>
    recommendationHistoryService.getHistory(userId)
  );
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdateHistory = () => {
      setHistoryList(recommendationHistoryService.getHistory(userId));
    };
    handleUpdateHistory();
    window.addEventListener('careerguide_recommendation_history_updated', handleUpdateHistory);
    return () => window.removeEventListener('careerguide_recommendation_history_updated', handleUpdateHistory);
  }, [userId]);

  const hasTestResults = Boolean(calculatedVector !== null);
  const hasTranscriptResults = hasAnyGrade;

  // Hash current assessment & transcript inputs to detect changes
  const currentInputsHash = useMemo(() => {
    return JSON.stringify({
      v: calculatedVector,
      c: cognitiveAnswers,
      g: grades,
    });
  }, [calculatedVector, cognitiveAnswers, grades]);

  const [lastCalculatedInputsHash, setLastCalculatedInputsHash] = useState<string>('');

  useEffect(() => {
    if (!calculatedVector && hasCalculatedRecommendations) {
      setHasCalculatedRecommendations(false);
      setBroadFields([]);
      setSelectedField(null);
      setSelectedMajor(null);
    }
  }, [calculatedVector, hasCalculatedRecommendations]);

  const handleClearCurrentRecommendations = () => {
    setHasCalculatedRecommendations(false);
    setBroadFields([]);
    setSelectedField(null);
    setSelectedMajor(null);
    setLastCalculatedInputsHash('');
  };

  const handleTriggerRecommendations = () => {
    if (!calculatedVector) {
      alert('Bạn chưa hoàn thành bài khảo sát sở thích nghề nghiệp (Mục 1). Hệ thống tuân thủ nguyên tắc không đề xuất ngẫu nhiên, vui lòng hoàn thành bài test trước.');
      handleTabChange('riasec');
      return;
    }

    setIsCalculatingRecs(true);
    const effectiveVector: RIASECVector = calculatedVector;

    setTimeout(() => {
      recommendationService.getHierarchicalRecommendations(
        effectiveVector,
        grades as unknown as Record<string, number>,
        cognitiveAnswers
      )
        .then(fields => {
          setBroadFields(fields);
          if (fields.length > 0) {
            setSelectedField(fields[0]);
            if (fields[0].majors.length > 0) {
              setSelectedMajor(fields[0].majors[0]);
            }
          }

          setLastCalculatedInputsHash(currentInputsHash);

          const historyItem: RecommendationHistoryItem = {
            id: 'hist_' + Date.now(),
            created_at: new Date().toISOString(),
            dominant_traits: dominantTraits.length > 0 ? dominantTraits : ['Sở thích thực tế'],
            riasec_vector: effectiveVector,
            top_fields: fields.map(f => ({
              field_name: f.field_name,
              field_score: f.field_score,
              matching_traits: f.matching_traits,
              top_major_names: f.majors.map(m => m.major_name),
            })),
            full_broad_fields: fields,
          };
          recommendationHistoryService.addHistory(historyItem, userId);
          setHasCalculatedRecommendations(true);
        })
        .finally(() => {
          setIsCalculatingRecs(false);
        });
    }, 400);
  };

  useEffect(() => {
    if (
      hasCalculatedRecommendations &&
      calculatedVector &&
      lastCalculatedInputsHash &&
      currentInputsHash !== lastCalculatedInputsHash
    ) {
      handleTriggerRecommendations();
    }
  }, [currentInputsHash, hasCalculatedRecommendations, calculatedVector, lastCalculatedInputsHash]);

  const handleRestoreHistoryItem = (item: RecommendationHistoryItem) => {
    setBroadFields(item.full_broad_fields);
    if (item.full_broad_fields.length > 0) {
      setSelectedField(item.full_broad_fields[0]);
      if (item.full_broad_fields[0].majors.length > 0) {
        setSelectedMajor(item.full_broad_fields[0].majors[0]);
      }
    }
    setHasCalculatedRecommendations(true);
    setIsHistoryModalOpen(false);
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    recommendationHistoryService.deleteHistory(id);
    setHistoryList(recommendationHistoryService.getHistory(userId));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đề xuất ngành?')) {
      recommendationHistoryService.clearHistory();
      setHistoryList([]);
    }
  };

  const handleCreateAndOpenRoadmap = (major: MajorRecommendation) => {
    const missingSkillNames = major.missing_skills.map(s => s.skill_name);
    roadmapStorageService.saveRoadmap(
      major.major_code,
      major.major_name,
      major.category_name,
      major.overall_score,
      missingSkillNames
    );
    navigate(`/roadmap/${major.major_code}`);
  };

  const handleFullResetAssessment = () => {
    resetAssessment();
    setAssessmentStep(0);
    handleClearCurrentRecommendations();
  };

  const riasecGroups = questionSet?.riasec_groups || [];
  const riasecQuestions = questionSet?.riasec_questions || [];
  const cognitiveQuestions = questionSet?.cognitive_questions || [];
  const likertScale = questionSet?.likert_scale || [];
  const presets = questionSet?.qa_persona_presets || [];

  const currentGroupMeta = riasecGroups[assessmentStep];
  const currentGroupQuestions = useMemo(() => {
    if (!currentGroupMeta) return [];
    return riasecQuestions.filter(q => q.dimension === currentGroupMeta.dimension);
  }, [riasecQuestions, currentGroupMeta]);

  const totalAnsweredRIASEC = Object.keys(riasecAnswers).length;
  const totalAnsweredCognitive = Object.keys(cognitiveAnswers).length;
  const totalQuestions = riasecQuestions.length + cognitiveQuestions.length;
  const totalAnswered = totalAnsweredRIASEC + totalAnsweredCognitive;
  const progressPercent = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const handleApplyPreset = (p: QAPersonaPreset) => {
    applyQAPreset(p);
    setPresetNotice(`Đã điền tự động mẫu hồ sơ: "${p.name}".`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const handleFinalSubmitAssessment = async () => {
    await submitAssessment();
    setAssessmentStep(7);
    if (hasCalculatedRecommendations) {
      handleTriggerRecommendations();
    }
  };

  // Standard Likert scale labels map
  const getLikertLabel = (val: number, defaultLabel: string) => {
    switch (val) {
      case 1:
        return 'Rất không thích';
      case 2:
        return 'Không thích';
      case 3:
        return 'Bình thường';
      case 4:
        return 'Thích';
      case 5:
        return 'Rất thích';
      default:
        return defaultLabel;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & 3-Step Navigation */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Định Hướng Nghề Nghiệp Khép Kín 3 Trụ Cột</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trung Tâm Khảo Sát & Khuyến Nghị Nghề Nghiệp
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Thực hiện trắc nghiệm sở thích, nhập điểm học bạ THPT và kích hoạt thuật toán XAI tất định để nhận đề xuất ngành đào tạo cấp IV {getActiveCircular()}.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-md border border-slate-200 text-xs">
            <span className="text-slate-500">Tiến độ khảo sát:</span>
            <span className="font-bold text-slate-900">{progressPercent}%</span>
            <span className="text-slate-400">({totalAnswered}/{totalQuestions} câu)</span>
          </div>
        </div>

        {/* 4 Step Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tab 1 */}
          <button
            type="button"
            onClick={() => handleTabChange('riasec')}
            className={`p-4 rounded-lg border text-left transition-colors relative flex flex-col justify-between space-y-2 ${
              activeTab === 'riasec'
                ? 'bg-blue-50/40 border-blue-600'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                    activeTab === 'riasec'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  1
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">1. Khảo Sát Sở Thích & Nhận Thức</div>
                  <div className="text-[11px] text-slate-500">Holland RIASEC & Đa trí tuệ</div>
                </div>
              </div>
              {hasTestResults && (
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>Đã trả lời: {totalAnsweredRIASEC}/30 câu</span>
              <span className="font-semibold text-blue-600">45% trọng số</span>
            </div>
          </button>

          {/* Tab 2 */}
          <button
            type="button"
            onClick={() => handleTabChange('transcript')}
            className={`p-4 rounded-lg border text-left transition-colors relative flex flex-col justify-between space-y-2 ${
              activeTab === 'transcript'
                ? 'bg-blue-50/40 border-blue-600'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                    activeTab === 'transcript'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  2
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">2. Điểm Học Bạ & Z-Score</div>
                  <div className="text-[11px] text-slate-500">9 môn THPT & Khối xét tuyển</div>
                </div>
              </div>
              {hasTranscriptResults && (
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>{isGradesSaved ? 'Đã lưu học bạ' : 'Chưa lưu điểm'}</span>
              <span className="font-semibold text-emerald-600">35% trọng số</span>
            </div>
          </button>

          {/* Tab 3: Diagnostic Skill Checks */}
          <button
            type="button"
            onClick={() => handleTabChange('diagnostic')}
            className={`p-4 rounded-lg border text-left transition-colors relative flex flex-col justify-between space-y-2 ${
              activeTab === 'diagnostic'
                ? 'bg-blue-50/40 border-blue-600'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                    activeTab === 'diagnostic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  3
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">3. Chẩn Đoán Kỹ Năng Đầu Vào</div>
                  <div className="text-[11px] text-slate-500">6 chuyên đề logic & chuyên môn</div>
                </div>
              </div>
              {passedDiagnosticCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>{hasDiagnosticResults ? `Đã làm: ${Object.keys(diagnosticResults).length}/6 đề` : 'Tùy chọn bổ trợ'}</span>
              <span className="font-semibold text-purple-600">Đạt: {passedDiagnosticCount} kỹ năng</span>
            </div>
          </button>

          {/* Tab 4 */}
          <button
            type="button"
            onClick={() => handleTabChange('recommendation')}
            className={`p-4 rounded-lg border text-left transition-colors relative flex flex-col justify-between space-y-2 ${
              activeTab === 'recommendation'
                ? 'bg-blue-50/40 border-blue-600'
                : 'bg-white hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                    activeTab === 'recommendation'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  4
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900">4. Đề Xuất Ngành Học XAI</div>
                  <div className="text-[11px] text-slate-500">Mô hình phễu 2 tầng tất định</div>
                </div>
              </div>
              {hasCalculatedRecommendations && (
                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>{hasCalculatedRecommendations ? 'Đã tạo kết quả' : 'Chờ kích hoạt'}</span>
              <span className="font-semibold text-blue-600">100% tất định</span>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1 CONTENT: VOCATIONAL ASSESSMENT                           */}
      {/* ============================================================== */}
      {activeTab === 'riasec' && (
        <div className="space-y-4">
          {/* QA Presets Bar (Admin preview) */}
          {isAdmin && (
            <div className="bg-white rounded-lg p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Dữ liệu mẫu kiểm thử (QA Presets):</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Dành cho Quản trị viên</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>

              {presetNotice && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{presetNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-200 shadow-xs overflow-x-auto">
            <div className="flex items-center space-x-1 min-w-max">
              {riasecGroups.map((g, idx) => {
                const groupQuestions = riasecQuestions.filter(q => q.dimension === g.dimension);
                const answeredInGroup = groupQuestions.filter(q => riasecAnswers[q.code] !== undefined).length;
                const isGroupDone = groupQuestions.length > 0 && answeredInGroup === groupQuestions.length;
                const isCurrent = assessmentStep === idx;

                return (
                  <button
                    key={g.dimension}
                    type="button"
                    onClick={() => setAssessmentStep(idx)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isGroupDone
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{g.name_vi}</span>
                    {isGroupDone && <Check className="w-3 h-3 text-emerald-600" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setAssessmentStep(6)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                  assessmentStep === 6
                    ? 'bg-blue-600 text-white shadow-xs'
                    : totalAnsweredCognitive === cognitiveQuestions.length && cognitiveQuestions.length > 0
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>Nhận Thức</span>
                {totalAnsweredCognitive === cognitiveQuestions.length && cognitiveQuestions.length > 0 && (
                  <Check className="w-3 h-3 text-emerald-600" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleFullResetAssessment}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center space-x-1"
              title="Làm lại từ đầu"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Làm lại</span>
            </button>
          </div>

          {/* QUESTIONS: Steps 0-5 (RIASEC Group Questions) */}
          {assessmentStep >= 0 && assessmentStep <= 5 && currentGroupMeta && (
            <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3 space-y-0.5">
                <h2 className="text-base font-bold text-slate-900">
                  Nhóm {currentGroupMeta.dimension}: {currentGroupMeta.name_vi} ({currentGroupMeta.name_en})
                </h2>
                <p className="text-xs text-slate-500">{currentGroupMeta.description}</p>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {currentGroupQuestions.map(q => {
                  const IconComp = (q.icon_name && LUCIDE_ICONS[q.icon_name]) ? LUCIDE_ICONS[q.icon_name] : BrainCircuit;
                  const currentScore = riasecAnswers[q.code];

                  return (
                    <div
                      key={q.code}
                      className={`p-4 rounded-md border transition-colors space-y-3 ${
                        currentScore
                          ? 'border-blue-200 bg-blue-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">{q.question_text}</p>
                        </div>


                      </div>



                      {/* Likert Scale 1 - 5 */}
                      <div className="grid grid-cols-5 gap-2 max-w-xl mx-auto">
                        {likertScale.map(opt => {
                          const isSelected = currentScore === opt.value;
                          const labelText = getLikertLabel(opt.value, opt.label);

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setRiasecAnswer(q.code, opt.value)}
                              className={`py-2 px-1 rounded-md text-center border transition-all ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white font-semibold shadow-xs'
                                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className="text-sm font-bold leading-none">{opt.value}</div>
                              <div className={`text-[10px] mt-1 truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                {labelText}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={assessmentStep === 0}
                  onClick={() => setAssessmentStep(prev => prev - 1)}
                  className="px-3.5 py-2 rounded-md border border-slate-300 text-slate-700 font-medium text-xs disabled:opacity-40 flex items-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Nhóm trước</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAssessmentStep(prev => prev + 1)}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <span>{assessmentStep === 5 ? 'Sang Khảo sát Nhận thức' : 'Nhóm tiếp theo'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: COGNITIVE PREFERENCES */}
          {assessmentStep === 6 && (
            <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3 space-y-0.5">
                <h2 className="text-base font-bold text-slate-900">
                  Khảo Sát Thiên Hướng Nhận Thức (Cognitive Preferences)
                </h2>
                <p className="text-xs text-slate-500">
                  Chọn 1 phương án phản ánh đúng phong cách tư duy và học tập của bạn (chiếm 20% trọng số trong mô hình XAI).
                </p>
              </div>

              <div className="space-y-4">
                {cognitiveQuestions.map(q => {
                  const dimKey = q.dimension || q.dimension_key || q.code;
                  const currentChoice = cognitiveAnswers[dimKey] || cognitiveAnswers[q.code];

                  return (
                    <div key={q.code} className="p-4 rounded-md border border-slate-200 bg-slate-50/40 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 flex-1">
                          <h3 className="text-xs font-bold text-slate-900">{q.question_text || q.title}</h3>
                          {q.subtitle && <p className="text-[11px] text-slate-500">{q.subtitle}</p>}
                        </div>

                      </div>



                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options?.map(opt => {
                          const isSelected = currentChoice === opt.option_key;
                          return (
                            <div
                              key={opt.option_key}
                              onClick={() => {
                                setCognitiveAnswer(dimKey, opt.option_key);
                                setCognitiveAnswer(q.code, opt.option_key);
                              }}
                              className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-1.5 ${
                                isSelected
                                  ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-1 ring-blue-400'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-blue-300 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}
                                >
                                  {opt.option_key}
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{opt.title}</h4>
                              <p className="text-[11.5px] text-slate-600 leading-relaxed">
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

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAssessmentStep(5)}
                  className="px-3.5 py-2 rounded-md border border-slate-300 text-slate-700 font-medium text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại nhóm C</span>
                </button>

                <button
                  type="button"
                  disabled={isAssessmentSubmitting}
                  onClick={handleFinalSubmitAssessment}
                  className="px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAssessmentSubmitting ? 'Đang tính toán...' : 'Hoàn tất & Nộp bài khảo sát'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: RESULT SUMMARY VIEW */}
          {assessmentStep === 7 && calculatedVector && (
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6">
              <div className="w-12 h-12 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <Award className="w-6 h-6" />
              </div>

              <div className="space-y-1.5 max-w-lg mx-auto">
                <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  HOÀN THÀNH KHẢO SÁT
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Hồ Sơ Sở Thích Holland RIASEC Đã Hoàn Tất
                </h2>
                <p className="text-xs text-slate-500">
                  Tính toán 100% tất định (Deterministic) theo {getActiveCircular()}.
                </p>
              </div>

              {/* Dominant Traits */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {dominantTraits.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* 6 Dimension Percentages */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 max-w-2xl mx-auto">
                {Object.entries(calculatedVector).map(([dim, val]) => (
                  <div key={dim} className="p-3 rounded-md bg-slate-50 border border-slate-200">
                    <span className="font-mono text-xs font-medium text-slate-500 uppercase">{dim}</span>
                    <div className="text-base font-bold text-slate-900">{((val as number) * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleTabChange('transcript')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Bước 2: Nhập Điểm Học Bạ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('diagnostic')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Bước 3: Chẩn Đoán Kỹ Năng</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('recommendation')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>Bước 4: Xem Đề Xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2 CONTENT: ACADEMIC TRANSCRIPT & Z-SCORE                   */}
      {/* ============================================================== */}
      {activeTab === 'transcript' && (
        <div className="space-y-4">
          {/* Quick Preset Buttons (Admin preview) */}
          {isAdmin && (
            <div className="bg-white rounded-lg p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Điền nhanh điểm mẫu (QA Presets):</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Dành cho Quản trị viên</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetGrades('EXCELLENT_STEM')}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Giỏi Tự Nhiên (Toán 9.2, Lý 9.0, Tin 9.5)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetGrades('EXCELLENT_HUMANITIES')}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Giỏi Xã Hội (Văn 9.2, Sử 9.0, Anh 9.0)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetGrades('GOOD_ALL')}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Khá - Giỏi Toàn Diện (~8.0)
                </button>
                <button
                  type="button"
                  onClick={handleResetGrades}
                  className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-medium text-xs flex items-center space-x-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa điểm</span>
                </button>
              </div>

              {gradesNotice && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{gradesNotice}</span>
                </div>
              )}
            </div>
          )}

          {/* 9 Subjects Input Form */}
          <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="border-b border-slate-200 pb-3 space-y-0.5">
              <h2 className="text-base font-bold text-slate-900">
                Bảng Điểm Trung Bình Các Môn Học THPT (Thang Điểm 10)
              </h2>
              <p className="text-xs text-slate-500">
                Dữ liệu được chuẩn hóa Z-Score so với phân phối điểm chuẩn quốc gia (chiếm 35% trọng số trong mô hình XAI).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {subjects.map(sub => {
                const IconComp = sub.icon;
                const val = grades[sub.key as keyof SemesterGrades];
                return (
                  <div
                    key={sub.key}
                    className="p-3 rounded-md border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800">{sub.label}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={val > 0 ? val : ''}
                        placeholder="0.0"
                        onChange={e => handleGradeChange(sub.key as keyof SemesterGrades, e.target.value)}
                        className="w-14 text-center font-mono font-semibold text-xs bg-white border border-slate-300 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                      />
                      <span className="text-[11px] text-slate-400">/10</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculated Admission Blocks Table */}
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Điểm các khối thi đại học chuẩn hóa Z-Score:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {blocks.map(b => {
                  const z = (b.score - b.mu) / b.sigma;
                  const pct = Math.round(normalCDF(z) * 100);

                  return (
                    <div key={b.code} className="p-3 rounded-md bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {b.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Z: {z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-900">{b.score.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-500">Phân vị: <strong className="text-slate-800">{pct}%</strong></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save & Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleSaveGrades}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu bảng điểm</span>
              </button>

              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleTabChange('riasec')}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-md border border-slate-300 text-slate-700 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Bước 1: Trắc nghiệm</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveGrades();
                    handleTabChange('diagnostic');
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Tiếp tục: Bước 3 - Chẩn đoán kỹ năng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveGrades();
                    handleTabChange('recommendation');
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 font-medium text-xs flex items-center justify-center space-x-1 transition-colors"
                  title="Bỏ qua chẩn đoán để đến trang đề xuất ngay"
                >
                  <span>Xem đề xuất (Bước 4)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3 CONTENT: DIAGNOSTIC SKILL CHECKS (FR03)                 */}
      {/* ============================================================== */}
      {activeTab === 'diagnostic' && (
        <DiagnosticChecksSection onContinueToRecommendations={() => handleTabChange('recommendation')} />
      )}

      {/* ============================================================== */}
      {/* TAB 4 CONTENT: XAI RECOMMENDATIONS                             */}
      {/* ============================================================== */}
      {activeTab === 'recommendation' && (
        <div className="space-y-6">
          {/* Section A: SUMMARY OF COMPLETED TESTS */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Dữ Liệu Khảo Sát Đã Ghi Nhận
                </h2>
                <p className="text-xs text-slate-500">
                  Hệ thống sử dụng các thông số này để đối chiếu với 108 ngành đào tạo đại học cấp IV.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {historyList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lịch sử đề xuất ({historyList.length})</span>
                  </button>
                )}
                <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded font-medium">
                  Thuần toán học tất định 100%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Card 1: RIASEC */}
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">1. Kết quả khảo sát sở thích RIASEC</span>
                  </div>

                  {hasTestResults ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Đã hoàn thành</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      Chưa hoàn thành
                    </span>
                  )}
                </div>

                {hasTestResults ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {dominantTraits.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {calculatedVector && (
                      <div className="grid grid-cols-6 gap-1 pt-1">
                        {Object.entries(calculatedVector).map(([dim, val]) => (
                          <div key={dim} className="p-2 rounded bg-slate-50 text-center border border-slate-200">
                            <div className="font-mono text-[10px] text-slate-500 font-semibold uppercase">{dim}</div>
                            <div className="text-xs font-bold text-slate-900">{((val as number) * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Đã nạp câu trả lời đầy đủ</span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('riasec')}
                        className="text-blue-600 hover:text-blue-800 font-medium underline"
                      >
                        Làm lại bài test
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-center space-y-2">
                    <p className="text-xs text-amber-900 font-medium">
                      Bạn chưa hoàn thành bài khảo sát sở thích nghề nghiệp Holland RIASEC.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTabChange('riasec')}
                      className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs inline-flex items-center space-x-1"
                    >
                      <span>Làm bài khảo sát ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card 2: Academic Transcript */}
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">2. Kết quả điểm học bạ THPT</span>
                  </div>

                  {hasTranscriptResults ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Đã nhập điểm</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                      Chưa nhập điểm
                    </span>
                  )}
                </div>

                {hasTranscriptResults ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-1 pt-1">
                      {blocks.map(b => (
                        <div key={b.code} className="p-2 rounded bg-slate-50 text-center border border-slate-200">
                          <div className="font-mono text-[10px] text-slate-500 font-semibold">{b.code}</div>
                          <div className="text-xs font-bold text-slate-900">{b.score.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Toán: {grades.math} | Lý: {grades.physics} | Hóa: {grades.chemistry} | Văn: {grades.literature} | Anh: {grades.english}</span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('transcript')}
                        className="text-emerald-700 hover:text-emerald-900 font-medium underline"
                      >
                        Chỉnh sửa điểm
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-md bg-amber-50 border border-amber-200 text-center space-y-2">
                    <p className="text-xs text-amber-900 font-medium">
                      Bạn chưa nhập bảng điểm học bạ THPT để tính điểm tổ hợp xét tuyển.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTabChange('transcript')}
                      className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs inline-flex items-center space-x-1"
                    >
                      <span>Nhập điểm học bạ ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card 3: Diagnostic Skill Checks */}
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">3. Chẩn đoán năng lực đầu vào</span>
                  </div>

                  {passedDiagnosticCount > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>{passedDiagnosticCount} kỹ năng đạt</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-medium">
                      Tùy chọn bổ trợ
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {hasDiagnosticResults ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {Object.values(diagnosticResults).map(r => (
                          <span
                            key={r.skill_code}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              r.is_passed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {r.is_passed ? '✓ ' : ''}{r.quiz_id.replace('quiz_', '').replace('_', ' ').toUpperCase()}: {r.score}/10
                          </span>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {passedDiagnosticCount > 0
                          ? `Đã xác thực ${passedDiagnosticCount} kỹ năng đạt chuẩn (≥ 7.0/10), được loại bỏ khỏi khoảng cách kỹ năng trong Lộ trình học.`
                          : 'Đã hoàn thành bài kiểm tra, hãy ôn tập thêm các kỹ năng cần bổ sung.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Chưa thực hiện bài kiểm tra chẩn đoán năng lực. Bạn có thể làm nhanh các bài kiểm tra 10 phút để xác thực năng lực nền tảng.
                    </p>
                  )}

                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">6 chuyên đề có sẵn</span>
                    <button
                      type="button"
                      onClick={() => handleTabChange('diagnostic')}
                      className="text-purple-700 hover:text-purple-900 font-medium underline"
                    >
                      {hasDiagnosticResults ? 'Làm thêm chuyên đề' : 'Làm bài chẩn đoán ngay'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: ACTIVATION HERO */}
          {!hasCalculatedRecommendations && (
            <div>
              {!hasTestResults ? (
                /* GUARD: Student has not completed assessment */
                <div className="bg-slate-900 text-white rounded-lg p-8 sm:p-10 text-center space-y-5 border border-slate-800">
                  <div className="max-w-xl mx-auto space-y-2">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-xs font-medium border border-amber-400/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Yêu cầu hoàn thành bài khảo sát (Mục 1)</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Chưa Đủ Dữ Liệu Để Đề Xuất Ngành Học
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Hệ thống tuân thủ nguyên tắc không suy đoán vô căn cứ. Thuật toán XAI cần dữ liệu trắc nghiệm sở thích RIASEC (45% trọng số) và nhận thức (20% trọng số) để đối chiếu chính xác với 108 ngành đại học cấp IV.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTabChange('riasec')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>Làm bài khảo sát sở thích ngay (Mục 1)</span>
                    </button>
                    {!hasTranscriptResults && (
                      <button
                        type="button"
                        onClick={() => handleTabChange('transcript')}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
                      >
                        <span>Nhập điểm học bạ (Mục 2)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* READY: Student HAS completed assessment */
                <div className="bg-slate-900 text-white rounded-lg p-8 sm:p-10 text-center space-y-5 border border-slate-800">
                  <div className="max-w-xl mx-auto space-y-2">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/30">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Bộ Máy Tính Toán Khuyến Nghị Minh Bạch XAI</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      Hồ Sơ Của Bạn Đã Sẵn Sàng Tính Toán
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Đối chiếu vector sở thích thực tế ({dominantTraits.length > 0 ? dominantTraits.join(', ') : 'RIASEC'}) và điểm học bạ trên toàn bộ 108 ngành đào tạo đại học cấp IV {getActiveCircular()}.
                    </p>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isCalculatingRecs}
                      onClick={handleTriggerRecommendations}
                      className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
                    >
                      {isCalculatingRecs ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang tính toán ma trận tương thích 3 trụ cột...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-4 h-4" />
                          <span>Tính toán & Đề xuất ngành học tương thích</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
                    <span>Cosine Similarity (45%)</span>
                    <span>•</span>
                    <span>Z-Score Quốc Gia (35%)</span>
                    <span>•</span>
                    <span>Đa trí tuệ Nhận Thức (20%)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section C: REVEALED RECOMMENDATIONS */}
          {hasCalculatedRecommendations && (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bản Đồ Định Hướng Ngành Học Của Bạn (Phễu 2 Tầng)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xếp hạng dựa trên tính toán tất định giữa năng lực học thuật và đặc điểm tâm lý cá nhân.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {historyList.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsHistoryModalOpen(true)}
                      className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lịch sử ({historyList.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleTriggerRecommendations}
                    disabled={isCalculatingRecs}
                    className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCalculatingRecs ? 'animate-spin' : ''}`} />
                    <span>Tính lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCurrentRecommendations}
                    className="px-3 py-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-slate-100 font-medium text-xs flex items-center space-x-1 transition-colors"
                    title="Xóa bảng kết quả đề xuất hiện tại"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa kết quả</span>
                  </button>
                </div>
              </div>

              {/* TẦNG 1: TOP 3 LĨNH VỰC ĐÀO TẠO */}
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    TẦNG 1: TOP 3 LĨNH VỰC PHÙ HỢP NHẤT
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Nhấp vào một lĩnh vực để xem các ngành đại học cụ thể ở Tầng 2:
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {broadFields.map((field, idx) => {
                    const isSelected = selectedField?.field_id === field.field_id;
                    const rankLabels = ['Hạng 1', 'Hạng 2', 'Hạng 3'];

                    return (
                      <div
                        key={field.field_id}
                        onClick={() => {
                          setSelectedField(field);
                          if (field.majors.length > 0) {
                            setSelectedMajor(field.majors[0]);
                          }
                        }}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors relative space-y-2.5 ${
                          isSelected
                            ? 'bg-blue-50/50 border-blue-600 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-900 text-white">
                            {rankLabels[idx] || `Hạng ${idx + 1}`}
                          </span>

                          <div className="text-right">
                            <span className="text-xl font-bold text-slate-900 leading-none">
                              {field.field_score}%
                            </span>
                            <div className="text-[10px] text-slate-500 font-medium">Tương thích</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {field.field_name}
                          </h4>
                        </div>

                        <div className="p-2 rounded bg-white border border-slate-200 text-xs text-slate-600 space-y-0.5">
                          <div className="text-blue-700 font-medium text-[11px]">
                            {field.matching_traits}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Gợi ý {field.majors.length} ngành trọng điểm
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className={isSelected ? 'text-blue-700 font-semibold' : 'text-slate-400'}>
                            {isSelected ? 'Đang chọn lĩnh vực này' : 'Bấm để xem ngành cụ thể'}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-slate-300'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TẦNG 2: CÁC NGÀNH CỤ THỂ TRONG LĨNH VỰC ĐÃ CHỌN */}
              {selectedField && (
                <div className="space-y-3 pt-2">
                  <div className="border-t border-slate-200 pt-4 space-y-0.5">
                    <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      TẦNG 2: CÁC NGÀNH CỤ THỂ (LEVEL IV)
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Ngành Học Trong Lĩnh Vực: <span className="text-blue-700">{selectedField.field_name}</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column (5 cols): Specific Majors List */}
                    <div className="lg:col-span-5 space-y-2.5">
                      {selectedField.majors.map((rec, index) => {
                        const isSelected = selectedMajor?.major_code === rec.major_code;

                        return (
                          <div
                            key={rec.major_code}
                            onClick={() => setSelectedMajor(rec)}
                            className={`p-3.5 rounded-lg border cursor-pointer transition-colors space-y-2.5 ${
                              isSelected
                                ? 'bg-blue-50/50 border-blue-600 shadow-xs'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                                    {rec.major_code}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    Ngành #{index + 1}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                  {rec.major_name}
                                </h4>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-lg font-bold text-slate-900 leading-none">
                                  {rec.overall_score}%
                                </div>
                                <span className="text-[10px] text-slate-500">Tương thích</span>
                              </div>
                            </div>

                            {/* 3 Pillar Micro Stats */}
                            <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] border-t border-slate-100 text-slate-600">
                              <div>Sở thích: <strong className="text-slate-900">{rec.riasec_score}%</strong></div>
                              <div>Học bạ: <strong className="text-slate-900">{rec.academic_score}%</strong></div>
                              <div>Nhận thức: <strong className="text-slate-900">{rec.preference_score}%</strong></div>
                            </div>



                            {/* Skill Gap */}
                            {rec.missing_skills.length > 0 && (
                              <div className="space-y-1 pt-0.5">
                                <div className="text-[10px] font-semibold text-rose-700 flex items-center space-x-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                                  <span>Cần bổ trợ:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {rec.missing_skills.map((s, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-800 text-[10px] font-medium border border-rose-200"
                                    >
                                      {s.skill_name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions: AI Explanation & Chat */}
                            <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExplanationModalMajor({
                                    code: rec.major_code,
                                    name: rec.major_name,
                                  });
                                }}
                                className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                title="Xem giải trình AI chi tiết theo 4 trụ cột"
                              >
                                <Sparkles className="w-3 h-3 text-blue-600" />
                                <span>Giải thích AI (XAI)</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.dispatchEvent(
                                    new CustomEvent('open_ai_counselor_chat', {
                                      detail: { majorCode: rec.major_code, majorName: rec.major_name },
                                    })
                                  );
                                }}
                                className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                title="Hỏi Cố vấn AI về ngành này"
                              >
                                <BrainCircuit className="w-3 h-3 text-indigo-500" />
                                <span>Hỏi AI</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column (7 cols): Selected Major XAI Details */}
                    <div className="lg:col-span-7">
                      {selectedMajor ? (
                        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-4 sticky top-20">
                          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {selectedMajor.major_code}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {selectedMajor.category_name}
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 mt-1">
                                {selectedMajor.major_name}
                              </h3>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-slate-900 leading-none">
                                {selectedMajor.overall_score}%
                              </div>
                              <span className="text-[10px] text-slate-500">Điểm tổng hợp</span>
                            </div>
                          </div>

                          {/* Radar Chart: Student Vector vs Major Vector */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                                Đối chiếu Thiên hướng Nghề nghiệp:
                              </h4>
                              <span className="text-[10px] text-slate-500">
                                Xanh: Bạn | Đỏ: Chuẩn Ngành
                              </span>
                            </div>

                            <div className="h-56 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart
                                  data={[
                                    {
                                      dim: 'R (Thực tế)',
                                      student: calculatedVector?.R !== undefined ? Math.round((calculatedVector.R as number) * 100) : 0,
                                      major: Math.round((selectedMajor.riasec_vector.R || 0.5) * 100),
                                    },
                                    {
                                      dim: 'I (Nghiên cứu)',
                                      student: calculatedVector?.I !== undefined ? Math.round((calculatedVector.I as number) * 100) : 0,
                                      major: Math.round((selectedMajor.riasec_vector.I || 0.5) * 100),
                                    },
                                    {
                                      dim: 'A (Nghệ thuật)',
                                      student: calculatedVector?.A !== undefined ? Math.round((calculatedVector.A as number) * 100) : 0,
                                      major: Math.round((selectedMajor.riasec_vector.A || 0.5) * 100),
                                    },
                                    {
                                      dim: 'S (Xã hội)',
                                      student: calculatedVector?.S !== undefined ? Math.round((calculatedVector.S as number) * 100) : 0,
                                      major: Math.round((selectedMajor.riasec_vector.S || 0.5) * 100),
                                    },
                                    {
                                      dim: 'E (Quản lý)',
                                      student: calculatedVector?.E !== undefined ? Math.round((calculatedVector.E as number) * 100) : 0,
                                      major: Math.round((selectedMajor.riasec_vector.E || 0.5) * 100),
                                    },
                                    {
                                      dim: 'C (Nghiệp vụ)',
                                      student: calculatedVector?.C !== undefined ? Math.round((calculatedVector.C as number) * 100) : 0,
                                      major: Math.round((selectedMajor.riasec_vector.C || 0.5) * 100),
                                    },
                                  ]}
                                >
                                  <PolarGrid stroke="#e2e8f0" />
                                  <PolarAngleAxis dataKey="dim" tick={{ fill: '#475569', fontSize: 11 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                                  <Radar
                                    name="Hồ Sơ Của Bạn"
                                    dataKey="student"
                                    stroke="#2563eb"
                                    fill="#2563eb"
                                    fillOpacity={0.35}
                                  />
                                  <Radar
                                    name="Chuẩn Ngành"
                                    dataKey="major"
                                    stroke="#e11d48"
                                    fill="#e11d48"
                                    fillOpacity={0.2}
                                  />
                                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                                  <Tooltip />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Skill Gap Analysis Detail */}
                          {selectedMajor.missing_skills.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <h4 className="text-xs font-semibold text-rose-800 uppercase tracking-wider flex items-center space-x-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Khoảng trống kỹ năng cần bổ trợ:</span>
                              </h4>
                              <div className="space-y-1">
                                {selectedMajor.missing_skills.map((s, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs space-y-0.5"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-rose-900">{s.skill_name}</span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 font-medium">
                                        {s.severity === 'HIGH' ? 'Ưu tiên cao' : 'Bổ trợ'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-rose-800 leading-relaxed">
                                      {s.remedy_action}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Top Supporting Factors */}
                          <div className="space-y-1.5 pt-1">
                            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                              Yếu tố ủng hộ đề xuất (XAI Factors):
                            </h4>
                            <div className="space-y-1">
                              {selectedMajor.top_supporting_factors.map((f, idx) => (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-0.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-800">
                                      {f.factor_title}
                                    </span>
                                    <span className="font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                      +{f.contribution_score} điểm
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">
                                    {f.factor_description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons: AI Explanation, AI Chat & Roadmap */}
                          <div className="pt-2 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExplanationModalMajor({
                                    code: selectedMajor.major_code,
                                    name: selectedMajor.major_name,
                                  })
                                }
                                className="py-2.5 px-3 rounded-md bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-xs shadow-2xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span>Giải trình chi tiết AI (XAI)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  window.dispatchEvent(
                                    new CustomEvent('open_ai_counselor_chat', {
                                      detail: {
                                        majorCode: selectedMajor.major_code,
                                        majorName: selectedMajor.major_name,
                                      },
                                    })
                                  )
                                }
                                className="py-2.5 px-3 rounded-md bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold text-xs shadow-2xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                              >
                                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                                <span>Hỏi Cố vấn AI</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCreateAndOpenRoadmap(selectedMajor)}
                              className="w-full py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                            >
                              <Compass className="w-4 h-4" />
                              <span>Tạo & Xem lộ trình tự học cho ngành này</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg p-10 text-center text-slate-400 border border-slate-200 text-xs">
                          Chọn một ngành trong danh sách để xem biểu đồ đối sánh XAI chi tiết.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-modal border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lịch Sử Kết Quả Đề Xuất Ngành Học
                  </h3>
                  <p className="text-xs text-slate-500">
                    Xem lại và so sánh các phiên tính toán trước đây của tài khoản
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {historyList.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Chưa có lịch sử đề xuất nào được lưu.
                </div>
              ) : (
                historyList.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleRestoreHistoryItem(item)}
                    className="p-3.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Phiên #{historyList.length - idx}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(item.created_at).toLocaleString('vi-VN')}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Xóa phiên này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Dominant Traits */}
                    <div className="flex flex-wrap gap-1">
                      {item.dominant_traits.map((trait, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>

                    {/* Top 3 fields preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1">
                      {item.top_fields.map((field, fIdx) => (
                        <div
                          key={fIdx}
                          className="p-2 rounded bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="truncate text-slate-800">{field.field_name}</span>
                            <span className="text-blue-700 ml-1">{field.field_score}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {field.top_major_names.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs font-semibold text-blue-600">
                      <span>Bấm để khôi phục kết quả phiên này</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleClearAllHistory}
                disabled={historyList.length === 0}
                className="text-rose-600 hover:text-rose-700 font-medium disabled:opacity-40"
              >
                Xóa toàn bộ lịch sử
              </button>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Explanation (XAI) Modal */}
      {explanationModalMajor && (
        <AIExplanationModal
          isOpen={!!explanationModalMajor}
          onClose={() => setExplanationModalMajor(null)}
          majorCode={explanationModalMajor.code}
          majorName={explanationModalMajor.name}
          riasecScores={calculatedVector ? (calculatedVector as unknown as Record<string, number>) : undefined}
          grades={{
            'Toán': grades.math,
            'Vật lý': grades.physics,
            'Hóa học': grades.chemistry,
            'Sinh học': grades.biology,
            'Tin học': grades.informatics,
            'Ngữ văn': grades.literature,
            'Lịch sử': grades.history,
            'Địa lý': grades.geography,
            'Tiếng Anh': grades.english,
          }}
          diagnosticMasteredSkills={diagnosticService.getMasteredSkillCodes(userId)}
          userId={userId}
          onOpenChatWithMajor={(code, name) => {
            window.dispatchEvent(
              new CustomEvent('open_ai_counselor_chat', {
                detail: { majorCode: code, majorName: name },
              })
            );
          }}
          onNavigateToRoadmap={(code) => {
            const major = broadFields
              .flatMap((b) => b.majors)
              .find((m) => m.major_code === code);
            if (major) {
              handleCreateAndOpenRoadmap(major);
            } else {
              navigate(`/roadmap/${code}`);
            }
          }}
        />
      )}
    </div>
  );
};
