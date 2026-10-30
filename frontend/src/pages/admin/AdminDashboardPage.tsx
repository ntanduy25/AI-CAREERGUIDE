import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  UploadCloud,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Database,
  RefreshCw,
  BrainCircuit,
  KeyRound,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { taxonomyService, adminService, aiGuidanceService } from '../../services/careerServices';
import { MajorItem } from '../../data/defaultTaxonomy';
import { LLMStatusResponse, LLMConnectionTestResponse } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [majorsCount, setMajorsCount] = useState(0);
  const [pendingStagingCount, setPendingStagingCount] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // LLM Connection Diagnostic State
  const [llmStatus, setLlmStatus] = useState<LLMStatusResponse | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<LLMConnectionTestResponse | null>(null);
  const [showCustomConfig, setShowCustomConfig] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [customBaseUrl, setCustomBaseUrl] = useState('https://api.xah.io/v1');
  const [customModel, setCustomModel] = useState('dungcsnd113/deepseek-v4.1-flash-1017-free');
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    updateCounts();
    const handleUpdate = () => updateCounts();
    window.addEventListener('careerguide_taxonomy_updated', handleUpdate);

    aiGuidanceService.getLLMStatus().then(st => {
      setLlmStatus(st);
      if (st.base_url) setCustomBaseUrl(st.base_url);
      if (st.model) setCustomModel(st.model);
    });

    return () => window.removeEventListener('careerguide_taxonomy_updated', handleUpdate);
  }, []);

  const handleTestConnection = async (useCustom: boolean = false) => {
    setIsTestingConnection(true);
    setConnectionResult(null);

    const payload = useCustom
      ? {
          api_key: customKey.trim() || undefined,
          base_url: customBaseUrl.trim() || undefined,
          model: customModel.trim() || undefined,
        }
      : undefined;

    try {
      const res = await aiGuidanceService.testLLMConnection(payload);
      setConnectionResult(res);
      aiGuidanceService.getLLMStatus().then(st => setLlmStatus(st));
    } catch (e: any) {
      setConnectionResult({
        success: false,
        status_code: 500,
        latency_ms: 0,
        model_used: customModel || 'dungcsnd113/deepseek-v4.1-flash-1017-free',
        base_url: customBaseUrl || 'https://api.xah.io/v1',
        is_configured: false,
        message: e?.message || 'Lỗi khi gửi yêu cầu kiểm tra tới máy chủ.',
        preview_reply: null,
        tested_at: new Date().toISOString(),
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const updateCounts = () => {
    const majors = taxonomyService.getMajors();
    setMajorsCount(majors.length);
  };

  const handleResetToSix = () => {
    taxonomyService.resetToInitial();
    setSyncMessage('Đã đưa danh mục về 6 ngành ban đầu để bạn kiểm thử luồng nạp PDF!');
    setTimeout(() => setSyncMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-lg border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Bảng Điều Khiển Quản Trị Hệ Thống
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              v1.8 HITL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Giám sát luồng nạp tri thức 2 luồng (Two-Stream Ingestion) và quy trình kiểm duyệt (Human-in-the-Loop).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {majorsCount > 6 ? (
            <button
              onClick={handleResetToSix}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset 6 ngành mẫu</span>
            </button>
          ) : (
            <Link
              to="/admin/ingest"
              className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Nạp Thông Tư PDF</span>
            </Link>
          )}
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-md bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Majors */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Danh Mục Ngành Hoạt Động
            </span>
            <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">{majorsCount}</span>
              <span className="text-xs text-slate-400">ngành Cấp IV</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {majorsCount > 6 ? (
                <span className="text-emerald-400 font-medium">
                  Đã đồng bộ đầy đủ Thông tư 09/2022
                </span>
              ) : (
                <span className="text-amber-400 font-medium">
                  Hiện có 6 ngành mẫu (chờ nạp PDF)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Staging Pending */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Chờ Phê Duyệt (HITL)
            </span>
            <div className="w-7 h-7 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">{pendingStagingCount}</span>
              <span className="text-xs text-slate-400">bản ghi</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tài liệu Stream B đang chờ quản trị viên xác thực
            </p>
          </div>
        </div>

        {/* Vector Embeddings */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Knowledge Embeddings
            </span>
            <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">1,536</span>
              <span className="text-xs text-slate-400">chiều (pgvector)</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">
              Cosine Similarity tất định ≤ 2.0s
            </p>
          </div>
        </div>

        {/* Guardrail Isolation */}
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pure Guidance Scope
            </span>
            <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-white">100%</span>
              <span className="text-xs text-emerald-400 font-medium">Tuân thủ NFR04</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Không thiên lệch học phí hay địa phương
            </p>
          </div>
        </div>
      </div>

      {/* LLM & API Key Connection Diagnostic Card */}
      <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">
                  Kiểm Tra Kết Nối LLM & API Key
                </h3>
                <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-cyan-300 border border-cyan-500/30">
                  {llmStatus?.model || 'dungcsnd113/deepseek-v4.1-flash-1017-free'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Chẩn đoán trực tiếp tính sẵn sàng của mô hình AI, đo độ trễ mạng và xác thực khóa API.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {llmStatus?.is_key_configured ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Key đã nạp ({llmStatus.masked_key})</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Chưa có Key (Rule-based Fallback)</span>
              </span>
            )}
          </div>
        </div>

        {/* Configuration summary pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Mô hình suy luận (LLM):
            </span>
            <div className="font-mono text-cyan-300 font-bold truncate">
              {llmStatus?.model || 'dungcsnd113/deepseek-v4.1-flash-1017-free'}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Base URL Endpoint:
            </span>
            <div className="font-mono text-slate-300 truncate">
              {llmStatus?.base_url || 'https://api.xah.io/v1'}
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 space-y-0.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Trạng thái dự phòng SLA:
            </span>
            <div className="text-emerald-400 font-semibold truncate flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tự động Fallback &le; 8.0s</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleTestConnection(false)}
              disabled={isTestingConnection}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi Probe Test...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kiểm tra kết nối hệ thống</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCustomConfig(!showCustomConfig)}
              className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showCustomConfig ? 'Ẩn form tuỳ chỉnh' : 'Thử nghiệm với Key / Model khác'}</span>
            </button>
          </div>

          {connectionResult && (
            <span className="text-[11px] text-slate-500">
              Kiểm tra lúc: {new Date(connectionResult.tested_at).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>

        {/* Custom Override Form */}
        {showCustomConfig && (
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                <span>Thử nghiệm kết nối với API Key hoặc Endpoint mới</span>
              </h4>
              <span className="text-[10px] text-slate-400">
                (Dùng để kiểm tra trước khi lưu vào file .env)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* API Key */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">
                  API Key:
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full text-xs font-mono rounded-md bg-slate-900 border border-slate-700 px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                    title={showKeyText ? 'Ẩn key' : 'Hiện key'}
                  >
                    {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Base URL */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Base URL:
                </label>
                <input
                  type="text"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="https://api.deepseek.com"
                  className="w-full text-xs font-mono rounded-md bg-slate-900 border border-slate-700 px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Model */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Model Name:
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="dungcsnd113/deepseek-v4.1-flash-1017-free"
                  className="w-full text-xs font-mono rounded-md bg-slate-900 border border-slate-700 px-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Quick model pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Chọn nhanh mô hình:</span>
              {['dungcsnd113/deepseek-v4.1-flash-1017-free', 'deepseek-chat', 'deepseek-reasoner', 'gpt-4o-mini'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setCustomModel(m)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-colors cursor-pointer ${
                    customModel === m
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleTestConnection(true)}
                disabled={isTestingConnection}
                className="px-4 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isTestingConnection ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>Thực hiện Probe Test với thông số này</span>
              </button>
            </div>
          </div>
        )}

        {/* Diagnostic Result Alert */}
        {connectionResult && (
          <div
            className={`p-4 rounded-lg border text-xs space-y-2 animate-in fade-in duration-200 ${
              connectionResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {connectionResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="font-bold text-sm tracking-wide">
                  {connectionResult.success
                    ? 'KẾT NỐI THÀNH CÔNG (HTTP 200 OK)'
                    : `KẾT NỐI THẤT BẠI (HTTP ${connectionResult.status_code})`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/30 border border-white/10">
                  {connectionResult.model_used}
                </span>
                {connectionResult.success && (
                  <span className="font-mono text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                    {connectionResult.latency_ms} ms
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {connectionResult.message}
            </p>

            {connectionResult.success && connectionResult.preview_reply && (
              <div className="p-2.5 rounded bg-black/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300/90 flex items-center justify-between">
                <span>Phản hồi kiểm tra từ máy chủ AI:</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-600/30">
                  {connectionResult.preview_reply}
                </span>
              </div>
            )}

            {!connectionResult.success && (
              <div className="p-2.5 rounded bg-black/40 border border-rose-500/30 text-[11px] space-y-1 text-slate-300">
                <div className="font-semibold text-rose-300">Gợi ý kiểm tra:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400">
                  <li>Kiểm tra chuỗi API Key đã copy đủ ký tự (thường bắt đầu bằng <code>sk-...</code>).</li>
                  <li>Nếu dùng DeepSeek, hãy đảm bảo Base URL là <code>https://api.deepseek.com</code>.</li>
                  <li>Kiểm tra số dư/hạn mức (Quota) của tài khoản nhà cung cấp AI.</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Two-Stream Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stream A Card */}
        <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Luồng 1: Stream A – Nạp Thông Tư Bộ GD&ĐT (PDF)
                </h3>
                <p className="text-[11px] text-slate-400">Văn bản quy phạm pháp luật Nhà nước (FR07, DF03)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Stream A
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Tải lên tài liệu PDF Thông tư mới của Bộ Giáo dục (ví dụ Thông tư 09/2022/TT-BGDĐT). Hệ thống tự động phân tích cấu trúc bảng biểu, trích xuất mã ngành cấp IV (7xxxxxx), tổ hợp môn xét tuyển và vector RIASEC để cập nhật danh mục.
          </p>

          <div className="pt-2 flex items-center space-x-2">
            <Link
              to="/admin/ingest"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <span>Mở Trình Quét AI PDF</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/majors"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors"
            >
              <span>Xem {majorsCount} Ngành</span>
            </Link>
          </div>
        </div>

        {/* Stream B Card */}
        <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Luồng 2: Kiểm Duyệt Staging HITL
                </h3>
                <p className="text-[11px] text-slate-400">Rà soát xuất bản trước khi đưa vào RAG (Bảng 6, DF05)</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              HITL Audit
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Mọi tài liệu lộ trình đào tạo thu thập từ các trường đại học bắt buộc phải nằm ở vùng đệm Staging (trạng thái PENDING). Quản trị viên rà soát, chỉnh sửa mốc thời gian và tài liệu tham khảo trước khi phê duyệt lưu trữ.
          </p>

          <div className="pt-2 flex items-center space-x-2">
            <Link
              to="/admin/staging"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
            >
              <span>Vào Bàn Kiểm Duyệt Staging</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
