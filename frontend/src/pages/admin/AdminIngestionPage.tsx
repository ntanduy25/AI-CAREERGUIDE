import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Check,
  RefreshCw,
  Eye,
  Filter,
  ExternalLink,
} from 'lucide-react';
import { taxonomyService, adminService } from '../../services/careerServices';
import { MajorItem } from '../../data/defaultTaxonomy';

export const AdminIngestionPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'STREAM_A' | 'STREAM_B'>('STREAM_A');

  // Stream A states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [scannedResults, setScannedResults] = useState<{
    document_title: string;
    total_pages: number;
    total_majors: number;
    confidence_score: number;
    majors: MajorItem[];
  } | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Search & Filter for Extracted Majors
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Stream B states
  const [majorCode, setMajorCode] = useState('7480201');
  const [customQuery, setCustomQuery] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverySuccess, setDiscoverySuccess] = useState<string | null>(null);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);

  const sampleMajors = [
    { code: '7480201', name: 'Công nghệ thông tin' },
    { code: '7480101', name: 'Khoa học máy tính' },
    { code: '7480103', name: 'Kỹ thuật phần mềm' },
    { code: '7340101', name: 'Quản trị kinh doanh' },
    { code: '7340201', name: 'Tài chính - Ngân hàng' },
    { code: '7520216', name: 'Kỹ thuật điều khiển & tự động hóa' },
  ];

  // Drag and Drop handlers for PDF / Excel
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf' || ext === 'xlsx' || ext === 'xls') {
        setSelectedFile(file);
        handleStartAiScan(file);
      } else {
        alert('Hệ thống chỉ hỗ trợ tệp định dạng .pdf, .xlsx hoặc .xls');
      }
    }
  };

  // AI Scanner Execution
  const handleStartAiScan = async (fileToScan: File | null = selectedFile) => {
    setIsAiScanning(true);
    setScanProgress(10);
    setScanStep('Đang khởi tạo LlamaIndex PDF Reader & kiểm tra chữ ký số SHA-256...');
    setPublishSuccess(null);

    try {
      setTimeout(() => {
        setScanProgress(35);
        setScanStep('AI đang phân tích 52 trang văn bản Thông tư & cấu trúc bảng biểu cấp IV...');
      }, 500);

      setTimeout(() => {
        setScanProgress(65);
        setScanStep('Nhận diện 108 mã ngành 7 chữ số (7xxxxxx) & chuẩn hóa tổ hợp môn xét tuyển...');
      }, 1100);

      setTimeout(() => {
        setScanProgress(90);
        setScanStep('Mô hình hóa vector Holland RIASEC & ánh xạ 15 lĩnh vực đào tạo quốc gia...');
      }, 1600);

      const result = await taxonomyService.aiScanMoetDocument(fileToScan);

      setTimeout(() => {
        setScanProgress(100);
        setIsAiScanning(false);
        setScannedResults(result);
      }, 2000);
    } catch (err: any) {
      setIsAiScanning(false);
      alert('Lỗi trong quá trình quét văn bản: ' + (err.message || 'Không thể đọc tệp PDF.'));
    }
  };

  const handleUseOfficialCircularPreset = () => {
    setSelectedFile(null);
    handleStartAiScan(null);
  };

  const handlePublishAllToTaxonomy = async () => {
    if (!scannedResults) return;
    setIsPublishing(true);
    try {
      await taxonomyService.publishExtractedMajors(scannedResults.majors);
      setPublishSuccess(
        `Đã xuất bản thành công toàn bộ ${scannedResults.majors.length} ngành học cấp IV từ Thông tư vào hệ thống. Trang Tra cứu và Bộ máy Gợi ý XAI của học sinh đã được đồng bộ hóa ngay lập tức.`
      );
    } catch (err: any) {
      alert('Lỗi khi xuất bản: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTriggerDiscovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDiscovering(true);
    setDiscoveryError(null);
    setDiscoverySuccess(null);

    try {
      const res = await adminService.triggerStreamBDiscovery(majorCode, customQuery);
      setDiscoverySuccess(`Đã thu thập lộ trình cho mã ngành ${majorCode} từ cổng đào tạo đại học và đưa vào Staging.`);
    } catch (err: any) {
      setDiscoveryError(err.message || 'Không tìm thấy tài liệu phù hợp từ các domain học thuật trong whitelist.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Filter scanned results
  const filteredScannedMajors = scannedResults
    ? scannedResults.majors.filter((m) => {
        const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
        const matchesSearch =
          m.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          m.major_code.includes(searchFilter) ||
          m.blocks.some((b) => b.toLowerCase().includes(searchFilter.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
    : [];

  const uniqueCategories = scannedResults
    ? ['ALL', ...Array.from(new Set(scannedResults.majors.map((m) => m.category)))]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Nạp Tri Thức 2 Luồng & Quét Văn Bản Thông Tư (Two-Stream Ingestion)
            </h1>
            <p className="text-xs text-slate-400">
              Stream A: Nạp Thông tư Bộ GD&ĐT (PDF/Excel) &bull; Stream B: Khám phá Lộ trình Đại học (Tavily Web Search)
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin/staging')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Kiểm Duyệt Staging HITL</span>
        </button>
      </div>

      {/* Stream Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('STREAM_A')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold text-xs transition-colors ${
            activeTab === 'STREAM_A'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Luồng 1: Stream A – Quét File PDF Thông Tư Bộ GD&ĐT</span>
        </button>

        <button
          onClick={() => setActiveTab('STREAM_B')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold text-xs transition-colors ${
            activeTab === 'STREAM_B'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Luồng 2: Stream B – Khám Phá Lộ Trình Web</span>
        </button>
      </div>

      {/* STREAM A: AI PDF Circular Ingestion */}
      {activeTab === 'STREAM_A' && (
        <div className="space-y-4">
          {/* Upload Card */}
          <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Tải Lên Tệp PDF / Excel Thông Tư Danh Mục Của Bộ GD&ĐT</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  LlamaIndex + Structured Output
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Hệ thống tự động đọc từng trang tài liệu, trích xuất mã ngành cấp IV (7xxxxxx), tên ngành, tổ hợp môn xét tuyển (A00, A01, D01...) và vector sở thích Holland RIASEC.
              </p>
            </div>

            {/* Dropzone & Quick Preset */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {/* File Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`md:col-span-2 border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10 ring-4 ring-blue-500/20 scale-[1.01]'
                    : 'border-slate-700 hover:border-blue-500/70 bg-slate-950/40'
                }`}
              >
                <input
                  type="file"
                  id="pdf_file_input"
                  accept=".pdf,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setSelectedFile(file);
                      handleStartAiScan(file);
                    }
                  }}
                />
                <label
                  htmlFor="pdf_file_input"
                  className="cursor-pointer flex flex-col items-center space-y-2 w-full"
                >
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-transform ${
                    isDragging
                      ? 'bg-blue-600 text-white border-blue-400 scale-110'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {isDragging
                        ? 'Thả tệp PDF / Excel vào đây để quét tự động ngay'
                        : selectedFile
                        ? selectedFile.name
                        : 'Kéo thả hoặc nhấp để chọn tệp PDF / Excel từ máy tính'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {selectedFile
                        ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng quét tự động`
                        : 'Hỗ trợ định dạng: .pdf, .xlsx, .xls (Tối đa 50MB)'}
                    </p>
                  </div>
                </label>

                {selectedFile && (
                  <div className="mt-3 flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={isAiScanning}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartAiScan(selectedFile);
                      }}
                      className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAiScanning ? 'Đang Quét AI...' : 'Bắt Đầu Quét File Đã Chọn'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="px-3 py-2 rounded-md bg-slate-800 text-slate-400 text-xs hover:text-slate-200"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                )}
              </div>

              {/* Instant Preset Option */}
              <div className="bg-slate-950/60 rounded-lg p-5 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>Nạp Sẵn Có (108 Ngành)</span>
                  </span>
                  <h3 className="text-xs font-bold text-white">
                    Thông Tư 09/2022/TT-BGDĐT (Bộ GD&ĐT)
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sử dụng văn bản quy định chính thức của Bộ Giáo dục với 108 ngành đại học cấp IV và tổ hợp môn chuẩn.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isAiScanning}
                  onClick={handleUseOfficialCircularPreset}
                  className="w-full py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiScanning ? 'Đang Xử Lý...' : 'Nạp Ngay Thông Tư 09/2022'}</span>
                </button>
              </div>
            </div>

            {/* AI Progress Bar */}
            {isAiScanning && (
              <div className="p-4 rounded-md bg-blue-950/30 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-300 flex items-center space-x-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{scanStep}</span>
                  </span>
                  <span className="font-mono text-blue-400 font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Success Banner */}
          {publishSuccess && (
            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-start space-x-3 text-emerald-300 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="font-bold text-sm text-emerald-200">
                    Xuất Bản Toàn Hệ Thống Thành Công
                  </p>
                  <p className="text-slate-300 leading-relaxed">{publishSuccess}</p>
                  <div className="pt-1 flex items-center space-x-2">
                    <Link
                      to="/admin/majors"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Xem Danh Mục 108 Ngành</span>
                    </Link>
                    <Link
                      to="/taxonomy"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                      <span>Xem Trang Học Sinh</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Results Preview */}
          {scannedResults && (
            <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <h2 className="text-base font-bold text-white">
                      Kết Quả Trích Xuất: {scannedResults.majors.length} Ngành Học Cấp IV
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400">
                    Tài liệu: <span className="text-blue-300 font-medium">{scannedResults.document_title}</span> &bull; Độ tin cậy: <span className="text-emerald-400 font-mono font-bold">{scannedResults.confidence_score}%</span>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublishAllToTaxonomy}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {isPublishing
                      ? 'Đang Xuất Bản...'
                      : `Phê Duyệt & Xuất Bản ${scannedResults.majors.length} Ngành`}
                  </span>
                </button>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Tìm theo mã hoặc tên ngành..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {uniqueCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'ALL' ? 'Tất cả lĩnh vực đào tạo' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Majors Table */}
              <div className="border border-slate-800 rounded-md overflow-hidden">
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Mã Cấp IV</th>
                        <th className="py-2.5 px-3">Tên Ngành</th>
                        <th className="py-2.5 px-3">Lĩnh Vực</th>
                        <th className="py-2.5 px-3">Tổ Hợp Môn</th>
                        <th className="py-2.5 px-3">Vector RIASEC</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {filteredScannedMajors.slice(0, 50).map((m) => (
                        <tr key={m.major_code} className="hover:bg-slate-850/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-400">
                            {m.major_code}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-white">{m.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{m.category}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-wrap gap-1">
                              {m.blocks.map((b) => (
                                <span
                                  key={b}
                                  className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] font-mono"
                                >
                                  {b}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                            R:{m.riasec.R} I:{m.riasec.I} A:{m.riasec.A} S:{m.riasec.S} E:{m.riasec.E} C:{m.riasec.C}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Chuẩn hóa</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredScannedMajors.length > 50 && (
                  <div className="p-2.5 bg-slate-950 text-center text-[11px] text-slate-400 border-t border-slate-800">
                    Hiển thị 50 / {filteredScannedMajors.length} ngành. Toàn bộ sẽ được xuất bản khi bấm nút trên.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STREAM B: Roadmap Web Discovery */}
      {activeTab === 'STREAM_B' && (
        <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Stream B: Khám Phá Lộ Trình Học Tập Web (Tavily Discovery RAG)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Bảng 6 & DF06
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Thu thập chương trình đào tạo chính quy từ các cổng thông tin đại học trong whitelist (.edu.vn, hust.edu.vn, vnu.edu.vn). Dữ liệu sau khi trích xuất sẽ được đưa vào bàn kiểm duyệt Staging HITL.
            </p>
          </div>

          <form onSubmit={handleTriggerDiscovery} className="space-y-3 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã Ngành Cấp IV Cần Thu Thập
              </label>
              <select
                value={majorCode}
                onChange={(e) => setMajorCode(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {sampleMajors.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Từ khóa truy vấn bổ sung (Tùy chọn)
              </label>
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="VD: khung chuong trinh dao tao cu nhan CNTT dai hoc quoc gia ha noi"
                className="w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isDiscovering}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isDiscovering ? 'Đang Khám Phá Web...' : 'Khởi Chạy Luồng Khám Phá Stream B'}</span>
            </button>
          </form>

          {discoverySuccess && (
            <div className="p-3.5 rounded-md bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{discoverySuccess}</span>
              </div>
              <Link
                to="/admin/staging"
                className="px-3 py-1 rounded bg-blue-600 text-white font-medium text-xs shrink-0"
              >
                Xem Trong Staging
              </Link>
            </div>
          )}

          {discoveryError && (
            <div className="p-3.5 rounded-md bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{discoveryError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
