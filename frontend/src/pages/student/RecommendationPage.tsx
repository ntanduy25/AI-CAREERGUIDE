import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  TrendingUp,
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  MapPin,
  ArrowRight,
  FileSpreadsheet,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { MajorRecommendation } from '../../types';
import { recommendationService } from '../../services/careerServices';
import { useAssessment } from '../../context/AssessmentContext';

export const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const { calculatedVector, isCompleted, riasecAnswers } = useAssessment();

  const [recommendations, setRecommendations] = useState<MajorRecommendation[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<MajorRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  const hasCompletedAssessment = isCompleted || calculatedVector !== null || Object.keys(riasecAnswers).length >= 30;

  useEffect(() => {
    if (!hasCompletedAssessment) {
      setLoading(false);
      return;
    }

    const fetchRecs = () => {
      setLoading(true);
      recommendationService.getRecommendations(calculatedVector)
        .then(data => {
          setRecommendations(data);
          if (data.length > 0) {
            setSelectedMajor(data[0]);
          }
        })
        .finally(() => setLoading(false));
    };

    fetchRecs();
    window.addEventListener('careerguide_taxonomy_updated', fetchRecs);
    return () => window.removeEventListener('careerguide_taxonomy_updated', fetchRecs);
  }, [hasCompletedAssessment, calculatedVector]);

  // If user hasn't completed assessment, show the Empty State prompt
  if (!hasCompletedAssessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
            <BrainCircuit className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold inline-flex items-center space-x-1">
              <span>⚠️ Chưa có dữ liệu khảo sát cá nhân</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Chưa Có Dữ Liệu Gợi Ý Ngành Học Cho Bạn
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Hệ thống AI CareerGuide hoạt động theo nguyên tắc <strong>100% tất định (Deterministic)</strong> dựa trên dữ liệu thật của chính bạn. Tuyệt đối không đưa ra các gợi ý ngẫu nhiên hay giả lập.
            </p>
          </div>

          {/* 2-Step Requirement Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 text-brand-600 flex items-center justify-center font-bold text-sm shadow-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Khảo sát Sở thích Holland RIASEC</h3>
                <p className="text-xs text-slate-500 mt-0.5">Hoàn thành 12 câu hỏi để tính toán vector 6 chiều (45% trọng số).</p>
              </div>
              <button
                onClick={() => navigate('/assessment')}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <span>Bắt đầu Khảo sát (+200 XP)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-sm shadow-xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Nhập Điểm Học Bạ THPT</h3>
                <p className="text-xs text-slate-500 mt-0.5">Chuẩn hóa điểm tổ hợp môn qua Z-score quốc gia (35% trọng số).</p>
              </div>
              <button
                onClick={() => navigate('/academic-transcript')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Nhập Điểm Học Bạ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format 6 RIASEC dimensions for Radar Chart
  const radarData = [
    { dimension: 'Thực tế (R)', student: (calculatedVector?.R || 0.5) * 100, major: (selectedMajor?.riasec_vector.R || 0.8) * 100 },
    { dimension: 'Nghiên cứu (I)', student: (calculatedVector?.I || 0.5) * 100, major: (selectedMajor?.riasec_vector.I || 0.9) * 100 },
    { dimension: 'Nghệ thuật (A)', student: (calculatedVector?.A || 0.5) * 100, major: (selectedMajor?.riasec_vector.A || 0.4) * 100 },
    { dimension: 'Xã hội (S)', student: (calculatedVector?.S || 0.5) * 100, major: (selectedMajor?.riasec_vector.S || 0.35) * 100 },
    { dimension: 'Quản lý (E)', student: (calculatedVector?.E || 0.5) * 100, major: (selectedMajor?.riasec_vector.E || 0.5) * 100 },
    { dimension: 'Nghiệp vụ (C)', student: (calculatedVector?.C || 0.5) * 100, major: (selectedMajor?.riasec_vector.C || 0.7) * 100 },
  ];

  // 3-pillar breakdown chart data
  const pillarData = selectedMajor ? [
    { pillar: 'Sở thích', score: selectedMajor.riasec_score, weighted: Number((selectedMajor.riasec_score * 0.45).toFixed(1)) },
    { pillar: 'Học thuật (35%)', score: selectedMajor.academic_score, weighted: Number((selectedMajor.academic_score * 0.35).toFixed(1)) },
    { pillar: 'Nhận thức', score: selectedMajor.preference_score, weighted: Number((selectedMajor.preference_score * 0.20).toFixed(1)) },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">
              Bảng Điều Khiển Gợi Ý Ngành Học Giải Thích Được (XAI Dashboard)
            </h1>
            <p className="text-xs text-slate-500">
              Điểm số tương thích 100% tất định được tính toán từ 3 trụ cột khoa học (Sở thích, Học bạ, Nhận thức)
            </p>
          </div>
        </div>

        {/* Pure Guidance Guardrail Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pure Guidance: Không thiên lệch học phí & địa lý</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top Major Recommendations List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Bảng Xếp Hạng Ngành Phù Hợp Nhất</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold">Theo Thông tư 09/2022</span>
          </div>

          <div className="space-y-3">
            {recommendations.map((major, idx) => {
              const isSelected = selectedMajor?.major_code === major.major_code;
              return (
                <div
                  key={major.major_code}
                  onClick={() => setSelectedMajor(major)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-50 to-indigo-50/50 border-brand-500 shadow-md ring-1 ring-brand-400'
                      : 'bg-white hover:bg-slate-50 border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-amber-400 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-black text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                            {major.major_code}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {major.category_name}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                          {major.major_name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-brand-600">
                        {major.overall_score}%
                      </span>
                      <span className="block text-[10px] text-slate-400 font-semibold">Tương thích</span>
                    </div>
                  </div>

                  {/* 3 mini progress pills */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100/80 text-[10px]">
                    <div className="text-center bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-medium">Sở thích</span>
                      <span className="font-bold text-slate-700">{major.riasec_score}%</span>
                    </div>
                    <div className="text-center bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-medium">Học bạ</span>
                      <span className="font-bold text-slate-700">{major.academic_score}%</span>
                    </div>
                    <div className="text-center bg-white p-1 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-medium">Nhận thức</span>
                      <span className="font-bold text-slate-700">{major.preference_score}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth XAI Analysis & Recharts (7 cols) */}
        {selectedMajor && (
          <div className="lg:col-span-7 space-y-6">
            {/* Active Major Header */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-brand-700 font-mono font-bold text-xs border border-indigo-200">
                    Mã ngành: {selectedMajor.major_code}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                    Điểm phù hợp: {selectedMajor.overall_score}%
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedMajor.major_name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lĩnh vực đào tạo: {selectedMajor.category_name}
                </p>
              </div>

              <Link
                to={`/roadmap/${selectedMajor.major_code}`}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 hover:from-brand-700 hover:to-indigo-700 transition-all shrink-0"
              >
                <MapPin className="w-4 h-4" />
                <span>Xem Lộ trình Tự học</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Radar Chart & 3-Pillar Breakdown in 2-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar Chart: Holland RIASEC comparison */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 flex items-center space-x-2">
                  <BrainCircuit className="w-4 h-4 text-brand-600" />
                  <span>Biểu đồ Radar So sánh RIASEC</span>
                </h3>
                <p className="text-[10px] text-slate-400">Đối chiếu vector của học sinh với hồ sơ chuẩn ngành</p>

                <div className="h-60 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748B', fontSize: 9, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                      <Radar name="Học sinh" dataKey="student" stroke="#6366F1" fill="#6366F1" fillOpacity={0.45} />
                      <Radar name="Chuẩn ngành" dataKey="major" stroke="#10B981" fill="#10B981" fillOpacity={0.25} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: 3-Pillar Component Weights */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Phân rã Đóng góp 3 Trụ cột</span>
                </h3>
                <p className="text-[10px] text-slate-400">Điểm thô vs. Điểm trọng số đóng góp</p>

                <div className="h-60 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pillarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="pillar" tick={{ fontSize: 9, fill: '#64748B' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748B' }} />
                      <Tooltip />
                      <Bar dataKey="score" name="Điểm thành phần" fill="#818CF8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="weighted" name="Điểm quy đổi" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* XAI: Top Supporting Factors */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Yếu Tố Hỗ Trợ Hàng Đầu (Top Supporting Factors)</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {selectedMajor.top_supporting_factors.map((factor, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        {factor.factor_title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-brand-700">
                        +{factor.contribution_score} điểm
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                      {factor.factor_description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competency Gap Alerts */}
            {selectedMajor.missing_skills.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-3">
                <h3 className="text-xs font-extrabold text-rose-800 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Cảnh Báo Lỗ Hổng Năng Lực Cần Bổ Trợ (Competency Gaps)</span>
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {selectedMajor.missing_skills.map((gap, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800">{gap.skill_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          gap.severity === 'HIGH' ? 'bg-rose-200 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Mức độ: {gap.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
                        <strong>Đề xuất khắc phục:</strong> {gap.remedy_action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
