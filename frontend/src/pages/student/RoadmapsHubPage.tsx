import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Plus,
  Trash2,
  Compass,
  Search,
  X,
  Layers,
  GraduationCap,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { SavedRoadmapItem } from '../../types';
import { roadmapStorageService, taxonomyService } from '../../services/careerServices';
import { MajorItem } from '../../data/defaultTaxonomy';

export const RoadmapsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmapItem[]>([]);
  const [isSelectMajorModalOpen, setIsSelectMajorModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allMajors = taxonomyService.getAllOfficialMoetMajors();
  const categories = ['ALL', ...Array.from(new Set(allMajors.map((m) => m.category)))];

  const loadSaved = () => {
    setSavedRoadmaps(roadmapStorageService.getSavedRoadmaps());
  };

  useEffect(() => {
    loadSaved();
    window.addEventListener('careerguide_roadmaps_updated', loadSaved);
    window.addEventListener('careerguide_auth_changed', loadSaved);
    return () => {
      window.removeEventListener('careerguide_roadmaps_updated', loadSaved);
      window.removeEventListener('careerguide_auth_changed', loadSaved);
    };
  }, []);

  const handleCreateRoadmapForMajor = (m: MajorItem) => {
    roadmapStorageService.saveRoadmap(m.major_code, m.name, m.category);
    setIsSelectMajorModalOpen(false);
    navigate(`/roadmap/${m.major_code}`);
  };

  const handleDeleteRoadmap = (e: React.MouseEvent, majorCode: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn xóa lộ trình học tập này khỏi danh sách đã lưu?')) {
      roadmapStorageService.removeRoadmap(majorCode);
      loadSaved();
    }
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Kế hoạch Tự học & Chuẩn bị Đại học</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Lộ Trình Học Tập Của Bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Quản lý tiến trình chuẩn bị cho các ngành đã chọn từ đề xuất XAI hoặc chủ động chọn một ngành trong danh mục Bộ GD&ĐT để xây dựng lộ trình.
          </p>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={() => setIsSelectMajorModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lộ trình ngành mới</span>
        </button>
      </div>

      {/* Empty State */}
      {savedRoadmaps.length === 0 ? (
        <div className="bg-white rounded-lg p-10 sm:p-14 border border-slate-200 shadow-sm text-center space-y-5 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7 text-slate-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">
              Chưa có lộ trình nào được lưu
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Bạn có thể làm bài khảo sát để nhận gợi ý ngành tương thích, hoặc chọn một ngành trong danh mục 108 ngành cấp IV để tạo lộ trình chuẩn bị ngay.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              to="/guidance?tab=recommendation"
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Xem kết quả định hướng</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsSelectMajorModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Chọn ngành trong danh mục</span>
            </button>
          </div>
        </div>
      ) : (
        /* List of Saved Roadmaps */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Lộ trình đang theo dõi ({savedRoadmaps.length})
            </h2>
            <span className="text-xs text-slate-500">
              Tiến độ được cập nhật khi bạn đánh dấu hoàn thành mục tiêu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedRoadmaps.map((rm) => (
              <div
                key={rm.id}
                onClick={() => navigate(`/roadmap/${rm.major_code}`)}
                className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors cursor-pointer space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rm.major_code}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {rm.category_name}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {rm.major_name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {rm.overall_score && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200">
                        {rm.overall_score}% hợp
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoadmap(e, rm.major_code)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      title="Xóa lộ trình này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Tiến độ hoàn thành:</span>
                    <span className="font-semibold text-slate-900">
                      {rm.progress_percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${rm.progress_percent}%` }}
                    />
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Lưu ngày: {new Date(rm.created_at).toLocaleDateString('vi-VN')}</span>
                  </span>

                  <span className="font-semibold text-blue-600 flex items-center space-x-1">
                    <span>Xem chi tiết</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Select Major */}
      {isSelectMajorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-modal border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chọn Ngành Học Để Lập Lộ Trình
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tra cứu trong 108 ngành cấp IV Thông tư 09/2022/TT-BGDĐT
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSelectMajorModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter */}
            <div className="p-4 border-b border-slate-200 space-y-2.5 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nhập tên ngành, mã ngành (ví dụ: 7480201) hoặc khối thi..."
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
                <div className="py-10 text-center text-slate-400 text-xs">
                  Không tìm thấy ngành phù hợp với từ khóa "{searchTerm}".
                </div>
              ) : (
                filteredMajors.map((m) => {
                  const isAlreadySaved = savedRoadmaps.some((r) => r.major_code === m.major_code);

                  return (
                    <div
                      key={m.major_code}
                      onClick={() => handleCreateRoadmapForMajor(m)}
                      className="p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {m.major_code}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {m.category}
                          </span>
                          {isAlreadySaved && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              Đã theo dõi
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
                        className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 shadow-xs flex items-center space-x-1 transition-colors"
                      >
                        <span>{isAlreadySaved ? 'Vào học' : 'Tạo lộ trình'}</span>
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
                onClick={() => setIsSelectMajorModalOpen(false)}
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
