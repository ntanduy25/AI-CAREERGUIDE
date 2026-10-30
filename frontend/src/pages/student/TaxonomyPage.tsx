import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Search,
  Layers,
  ArrowRight,
  Briefcase,
  ChevronDown,
  Check,
  FileSpreadsheet,
  GraduationCap,
} from 'lucide-react';
import { taxonomyService } from '../../services/careerServices';
import { MajorItem } from '../../data/defaultTaxonomy';
import { useAuth } from '../../context/AuthContext';

export const TaxonomyPage: React.FC = () => {
  const { user } = useAuth();
  const [majorsList, setMajorsList] = useState<MajorItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [openDetailCode, setOpenDetailCode] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadMajors();
    const handleUpdate = () => loadMajors();
    window.addEventListener('careerguide_taxonomy_updated', handleUpdate);
    return () => window.removeEventListener('careerguide_taxonomy_updated', handleUpdate);
  }, []);

  const loadMajors = async () => {
    const list = await taxonomyService.fetchMajors();
    setMajorsList(list);
  };

  const categories = useMemo(() => ['ALL', ...Array.from(new Set(majorsList.map((m) => m.category)))], [majorsList]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: majorsList.length };
    majorsList.forEach((m) => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return counts;
  }, [majorsList]);

  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return categories;
    const term = categorySearchTerm.toLowerCase();
    return categories.filter((c) => (c === 'ALL' ? 'tất cả lĩnh vực' : c.toLowerCase()).includes(term));
  }, [categories, categorySearchTerm]);

  const filteredMajors = majorsList.filter((m) => {
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(term) ||
      m.major_code.includes(term) ||
      m.blocks.some((b) => b.toLowerCase().includes(term)) ||
      m.careers.some((c) => c.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">
              Danh Mục Giáo Dục Đào Tạo Cấp IV
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-semibold">
              TT 09/2022/TT-BGDĐT
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống 108 ngành đào tạo đại học chính quy bám sát khung phân loại quốc gia và cây nghề nghiệp Phoenix Ho.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
            Hiển thị {filteredMajors.length} / {majorsList.length} ngành
          </span>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/ingest"
              className="px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center space-x-1"
            >
              <span>Quản lý nạp PDF</span>
            </Link>
          )}
        </div>
      </div>

      {/* Fallback Notice */}
      {majorsList.length <= 6 && (
        <div className="p-4 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>
              Hệ thống đang ở chế độ xem mẫu (6 ngành). Để xem toàn bộ 108 ngành theo Thông tư 09/2022/TT-BGDĐT, vui lòng đồng bộ dữ liệu.
            </span>
          </div>
          <button
            onClick={() => {
              taxonomyService.publishExtractedMajors(taxonomyService.getAllOfficialMoetMajors());
              loadMajors();
            }}
            className="px-3 py-1 rounded-md bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-xs shrink-0"
          >
            Đồng bộ 108 ngành đầy đủ
          </button>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên ngành, mã ngành (vd: 7480201), khối thi (A00, D01), nghề nghiệp..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between space-x-2 px-3 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition-colors sm:min-w-[240px]"
          >
            <div className="flex items-center space-x-2 truncate">
              <Layers className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {selectedCategory === 'ALL'
                  ? `Tất cả lĩnh vực (${majorsList.length})`
                  : `${selectedCategory} (${categoryCounts[selectedCategory] || 0})`}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                isCategoryDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isCategoryDropdownOpen && (
            <div className="absolute left-0 sm:right-0 mt-1.5 w-full sm:w-80 bg-white rounded-md shadow-modal border border-slate-200 py-1 z-50 animate-in fade-in duration-100">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <input
                  type="text"
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                  placeholder="Lọc tên lĩnh vực..."
                  className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = categoryCounts[cat] || 0;

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{cat === 'ALL' ? 'Tất cả lĩnh vực đào tạo' : cat}</span>
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {count}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Majors Grid */}
      {filteredMajors.length === 0 ? (
        <div className="bg-white rounded-lg p-10 border border-slate-200 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Không tìm thấy ngành đào tạo nào phù hợp</p>
          <p className="text-xs text-slate-500">Hãy thử nhập từ khóa tìm kiếm khác hoặc xóa bộ lọc để hiển thị toàn bộ 108 ngành.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
            }}
            className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Hiển thị lại tất cả ngành
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMajors.map((m) => (
          <div
            key={m.major_code}
            className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {m.major_code}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {m.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{m.name}</h3>
                </div>

                <Link
                  to={`/roadmap/${m.major_code}`}
                  className="p-1.5 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0"
                  title="Xem lộ trình học tập"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Careers */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Vị trí việc làm tiêu biểu:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {m.careers && m.careers.length > 0 ? (
                    m.careers.map((occ, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700"
                      >
                        {occ}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      Chuyên viên chuyên ngành {m.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Clean Details Disclosure with Exclamation Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setOpenDetailCode(openDetailCode === m.major_code ? null : m.major_code)}
                  className="inline-flex items-center space-x-1.5 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Xem chi tiết thiên hướng ngành"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-black flex items-center justify-center text-[10px]">!</span>
                  <span className="text-[11px] font-medium">Chi tiết thiên hướng nghề nghiệp</span>
                </button>
              </div>

              {openDetailCode === m.major_code && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-150">
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>Chỉ số tương thích Holland:</span>
                    <span className="font-mono text-[10px] text-blue-700">Mã: {m.major_code}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded font-medium text-[11px]">Thực tế (R): {Math.round(m.riasec.R * 100)}%</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 rounded font-medium text-[11px]">Nghiên cứu (I): {Math.round(m.riasec.I * 100)}%</span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded font-medium text-[11px]">Nghệ thuật (A): {Math.round(m.riasec.A * 100)}%</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium text-[11px]">Xã hội (S): {Math.round(m.riasec.S * 100)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-500 line-clamp-1 max-w-[260px]">
                {m.outlook}
              </span>
              <Link
                to={`/roadmap/${m.major_code}`}
                className="font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 shrink-0"
              >
                <span>Chi tiết lộ trình</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
