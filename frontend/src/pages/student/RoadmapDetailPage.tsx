import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  Download,
  ExternalLink,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Check,
  Compass,
  Search,
  X,
  ChevronRight,
  GraduationCap,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';
import { MajorRoadmap, GuidancePersonalizationResponse, RoadmapMilestone, RIASECVector } from '../../types';
import { recommendationService, roadmapStorageService, taxonomyService, diagnosticService } from '../../services/careerServices';
import { MajorItem } from '../../data/defaultTaxonomy';
import { AIExplanationModal } from '../../components/ai/AIExplanationModal';
import { useAuth } from '../../context/AuthContext';
import { getScopedItem } from '../../utils/userStorage';

export const RoadmapDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || null;
  const { major_code } = useParams<{ major_code: string }>();
  const code = major_code || '7480201';

  const [roadmap, setRoadmap] = useState<MajorRoadmap | null>(null);
  const [schedule, setSchedule] = useState<GuidancePersonalizationResponse | null>(null);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isSavedInRoadmaps, setIsSavedInRoadmaps] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Switch Major Modal state
  const [isSwitchMajorModalOpen, setIsSwitchMajorModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Resolved test results without PII
  const riasecScores = React.useMemo<Record<string, number> | undefined>(() => {
    try {
      const raw = getScopedItem('calculated_vector', userId);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }, [userId]);

  const grades = React.useMemo<Record<string, number> | undefined>(() => {
    try {
      const raw = getScopedItem('student_grades', userId);
      if (raw) {
        const p = JSON.parse(raw);
        return {
          'Toán': p.math || 0,
          'Vật lý': p.physics || 0,
          'Hóa học': p.chemistry || 0,
          'Sinh học': p.biology || 0,
          'Tin học': p.informatics || 0,
          'Ngữ văn': p.literature || 0,
          'Lịch sử': p.history || 0,
          'Địa lý': p.geography || 0,
          'Tiếng Anh': p.english || 0,
        };
      }
    } catch {
      // fallback empty
    }
    return undefined;
  }, [userId]);

  const diagnosticSkills = React.useMemo<string[]>(() => {
    return diagnosticService.getMasteredSkillCodes(userId);
  }, [userId]);

  const allMajors = taxonomyService.getAllOfficialMoetMajors();
  const categories = ['ALL', ...Array.from(new Set(allMajors.map((m) => m.category)))];

  useEffect(() => {
    setLoading(true);
    // Load previously saved progress if any
    const savedList = roadmapStorageService.getSavedRoadmaps();
    const existing = savedList.find(r => r.major_code === code);
    setIsSavedInRoadmaps(!!existing);

    if (existing && existing.completed_action_keys) {
      const keysMap: Record<string, boolean> = {};
      existing.completed_action_keys.forEach(k => {
        keysMap[k] = true;
      });
      setCompletedActions(keysMap);
    } else {
      setCompletedActions({});
    }

    const majorInfo = taxonomyService.getMajorByCode(code);
    const domainSkills = (existing && existing.target_skills && existing.target_skills.length > 0)
      ? existing.target_skills
      : recommendationService.getDomainMissingSkills(code);

    Promise.all([
      recommendationService.getMajorRoadmap(code),
      recommendationService.getPersonalizedSchedule(code, domainSkills),
    ])
      .then(([rm, sch]) => {
        setRoadmap(rm);
        setSchedule(sch);
        // If already in user's saved list, refresh study timestamp
        if (existing) {
          const titleClean = rm.title.replace('Lộ trình học tập chuẩn hóa: ', '');
          roadmapStorageService.saveRoadmap(code, majorInfo?.name || titleClean, majorInfo?.category || 'Đào tạo chuẩn', existing.overall_score, domainSkills);
        }
      })
      .finally(() => setLoading(false));
  }, [code]);

  const handleSaveToMyRoadmaps = () => {
    if (!roadmap) return;
    const majorInfo = taxonomyService.getMajorByCode(code);
    const domainSkills = recommendationService.getDomainMissingSkills(code);
    const titleClean = roadmap.title.replace('Lộ trình học tập chuẩn hóa: ', '');
    roadmapStorageService.saveRoadmap(code, majorInfo?.name || titleClean, majorInfo?.category || 'Đào tạo chuẩn', undefined, domainSkills);
    setIsSavedInRoadmaps(true);
  };

  const toggleAction = (key: string) => {
    const updated = {
      ...completedActions,
      [key]: !completedActions[key],
    };
    setCompletedActions(updated);

    if (roadmap) {
      const milestones = roadmap.roadmap_data.milestones;
      const totalActions = milestones.reduce((acc, m) => acc + m.actions.length, 0);
      const completedKeys = Object.keys(updated).filter(k => updated[k]);
      const progressPct = totalActions > 0 ? Math.round((completedKeys.length / totalActions) * 100) : 0;
      
      // Auto-save roadmap if first action toggled
      if (!isSavedInRoadmaps) {
        handleSaveToMyRoadmaps();
      }
      roadmapStorageService.updateProgress(code, completedKeys, progressPct);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleSwitchToMajor = (m: MajorItem) => {
    roadmapStorageService.saveRoadmap(m.major_code, m.name, m.category);
    setIsSwitchMajorModalOpen(false);
    navigate(`/roadmap/${m.major_code}`);
  };

  const filteredMajors = allMajors.filter((m) => {
    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.major_code.includes(term) ||
      m.blocks.some((b) => b.toLowerCase().includes(term));
    return matchesCat && matchesSearch;
  });

  if (loading || !roadmap) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-600">Đang truy xuất dữ liệu lộ trình ngành {code}...</p>
      </div>
    );
  }

  const milestones = roadmap.roadmap_data.milestones;
  const totalActions = milestones.reduce((acc, m) => acc + m.actions.length, 0);
  const completedCount = Object.values(completedActions).filter(Boolean).length;
  const progressPct = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar with Navigation & Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500 no-print mb-1">
            <Link to="/roadmaps" className="inline-flex items-center space-x-1 hover:text-blue-600">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Danh sách lộ trình</span>
            </Link>
            <span>/</span>
            <Link to="/guidance?tab=recommendation" className="hover:text-blue-600">
              Định hướng nghề nghiệp
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {roadmap.major_code}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
              {roadmap.is_fallback ? 'Bản chuẩn hóa dự phòng' : 'Đã thẩm định chính thức'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {roadmap.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 no-print">
          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Giải thích AI (XAI)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open_ai_counselor_chat', {
                  detail: { majorCode: code, majorName: roadmap.title },
                })
              );
            }}
            className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 shadow-xs transition-colors cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
            <span>Hỏi Cố vấn AI</span>
          </button>

          {isSavedInRoadmaps ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đang theo dõi</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSaveToMyRoadmaps}
              className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu vào lộ trình</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsSwitchMajorModalOpen(true)}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 transition-colors shadow-xs cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>Đổi ngành khác</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      {/* Provenance Metadata Badge */}
      <div className="bg-slate-50 rounded-md p-3.5 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Nguồn gốc tài liệu:</strong> {roadmap.roadmap_data.source_title} ({roadmap.roadmap_data.source_page || 'Chương trình khung'})
          </span>
        </div>
        <a
          href={roadmap.roadmap_data.source_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1 text-blue-600 font-semibold hover:underline"
        >
          <span>Xem tài liệu gốc</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Progress Checklist Tracker */}
      <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 uppercase tracking-wider">
            Tiến độ hoàn thành nhiệm vụ
          </span>
          <span className="font-bold text-slate-900">
            {completedCount} / {totalActions} việc ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Guidance RAG 4-Week Schedule */}
      {schedule && (
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Kế hoạch Chuẩn bị 4 Tuần (Guidance RAG)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {schedule.personalization_summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {schedule.schedule.map(task => (
              <div key={task.week_number} className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>Tuần {task.week_number}: {task.focus_skill}</span>
                  <span className="text-[11px] text-slate-500 font-normal">{task.estimated_hours}h / tuần</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {task.tasks.map((t, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-slate-400 font-bold shrink-0">•</span>
                      <span className="leading-snug">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step-by-Step Curriculum Milestones */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Các cột mốc học tập chi tiết
        </h2>

        <div className="space-y-3">
          {milestones.map(m => (
            <div key={m.step} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {m.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{m.title}</h3>
                    <span className="text-[11px] text-slate-500">Thời lượng dự kiến: {m.duration_weeks} tuần</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {m.description}
              </p>

              {/* Objectives */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-700">Mục tiêu cần đạt:</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                  {m.learning_objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-700">Hành động cần làm:</span>
                <div className="space-y-1.5">
                  {m.actions.map((act, idx) => {
                    const actionKey = `m_${m.step}_act_${idx}`;
                    const isDone = !!completedActions[actionKey];

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleAction(actionKey)}
                        className={`p-2.5 rounded-md border transition-colors cursor-pointer flex items-center justify-between text-xs ${
                          isDone ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300'
                          }`}>
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={isDone ? 'line-through text-slate-500' : 'font-medium'}>{act}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Assistant Help Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-purple-950 rounded-lg p-5 text-white border border-indigo-700/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-white/10 text-cyan-300">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-bold">Bạn cần giải đáp thêm về lộ trình này?</h3>
          </div>
          <p className="text-xs text-blue-100/80 max-w-xl">
            Cố vấn AI CareerGuide sẵn sàng giải đáp thắc mắc về các môn học nền tảng, bài tập thực hành hoặc phân tích mức độ tương thích với điểm số của bạn theo Luật 91/2025/QH15.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAIModalOpen(true)}
            className="px-3.5 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Phân tích 4 trụ cột</span>
          </button>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open_ai_counselor_chat', {
                  detail: { majorCode: code, majorName: roadmap.title },
                })
              );
            }}
            className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat với Cố vấn AI</span>
          </button>
        </div>
      </div>

      {/* AI Explanation Modal */}
      <AIExplanationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        majorCode={code}
        majorName={roadmap.title.replace('Lộ trình học tập chuẩn hóa: ', '')}
        riasecScores={riasecScores}
        grades={grades}
        diagnosticMasteredSkills={diagnosticSkills}
        userId={userId}
        onOpenChatWithMajor={(mCode, mName) => {
          setIsAIModalOpen(false);
          window.dispatchEvent(
            new CustomEvent('open_ai_counselor_chat', {
              detail: { majorCode: mCode, majorName: mName },
            })
          );
        }}
      />

      {/* Switch Major Modal */}
      {isSwitchMajorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-modal border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Đổi Sang Lộ Trình Ngành Khác
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chọn ngành trong 108 ngành cấp IV của Bộ GD&ĐT
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSwitchMajorModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter */}
            <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập tên ngành, mã ngành hoặc khối thi..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-600 shrink-0 font-medium">Lĩnh vực:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-md border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'ALL' ? 'Tất cả lĩnh vực đào tạo' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Majors List */}
            <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100">
              {filteredMajors.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Không tìm thấy ngành phù hợp với từ khóa "{searchTerm}".
                </div>
              ) : (
                filteredMajors.map((m) => {
                  const isCurrentMajor = m.major_code === code;

                  return (
                    <div
                      key={m.major_code}
                      onClick={() => handleSwitchToMajor(m)}
                      className={`p-2.5 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                        isCurrentMajor ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {m.major_code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {m.category}
                          </span>
                          {isCurrentMajor && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 text-[10px] font-semibold">
                              Đang xem
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {m.name}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          Khối xét tuyển: {m.blocks.slice(0, 3).join(', ')}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`px-3 py-1 rounded-md text-xs font-semibold shrink-0 shadow-xs flex items-center space-x-1 ${
                          isCurrentMajor
                            ? 'bg-slate-200 text-slate-600 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <span>{isCurrentMajor ? 'Đang học' : 'Chuyển ngành'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Hiển thị {filteredMajors.length} / {allMajors.length} ngành</span>
              <button
                type="button"
                onClick={() => setIsSwitchMajorModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-200 font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
