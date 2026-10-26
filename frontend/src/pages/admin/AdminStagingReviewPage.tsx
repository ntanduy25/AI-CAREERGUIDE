import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Edit3,
  ExternalLink,
  BookOpen,
  Hash,
  Clock,
  Save,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { StagingRecord, StagingStatus, StagingStreamType } from '../../types';
import { adminService } from '../../services/careerServices';

export const AdminStagingReviewPage: React.FC = () => {
  const [records, setRecords] = useState<StagingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<StagingRecord | null>(null);
  const [editedPayload, setEditedPayload] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, [statusFilter, streamFilter]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const sFilter = statusFilter === 'ALL' ? undefined : (statusFilter as StagingStatus);
      const stFilter = streamFilter === 'ALL' ? undefined : (streamFilter as StagingStreamType);
      const data = await adminService.listStaging(sFilter, stFilter);
      setRecords(data);
      if (data.length > 0 && !selectedRecord) {
        setSelectedRecord(data[0]);
        setEditedPayload(data[0].extracted_payload);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = (rec: StagingRecord) => {
    setSelectedRecord(rec);
    setEditedPayload(rec.extracted_payload);
    setReviewNotes(rec.review_notes || '');
    setActionSuccess(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedRecord) return;
    try {
      const updated = await adminService.updateStagingPayload(selectedRecord.id, editedPayload);
      setSelectedRecord(updated);
      setActionSuccess('Đã lưu các thay đổi vào bản ghi Staging.');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu chỉnh sửa.');
    }
  };

  const handleReviewDecision = async (decision: StagingStatus) => {
    if (!selectedRecord) return;
    try {
      const updated = await adminService.reviewStaging(selectedRecord.id, decision, reviewNotes);
      setSelectedRecord(updated);
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      setActionSuccess(
        decision === 'APPROVED'
          ? 'Đã phê duyệt thành công. Lộ trình đã được xuất bản vào cơ sở tri thức.'
          : 'Đã từ chối bản ghi staging.'
      );
    } catch (err: any) {
      alert(err.message || 'Lỗi trong quá trình kiểm duyệt.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="bg-slate-900 rounded-lg p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Kiểm Duyệt Staging Bán Tự Động (Human-in-the-Loop)
            </h1>
            <p className="text-xs text-slate-400">
              Kiểm tra tính xác thực nguồn gốc và chỉnh sửa dữ liệu trước khi xuất bản vào cơ sở tri thức.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-700 text-xs bg-slate-900 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt (PENDING)</option>
            <option value="APPROVED">Đã duyệt (APPROVED)</option>
            <option value="REJECTED">Từ chối (REJECTED)</option>
          </select>

          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-700 text-xs bg-slate-900 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả luồng</option>
            <option value="STREAM_A_MOET">Stream A (Bộ GD&ĐT)</option>
            <option value="STREAM_B_ROADMAP">Stream B (Lộ trình Web)</option>
          </select>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Split-Pane UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Records List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Hàng đợi kiểm duyệt ({records.length})
          </h2>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {records.map(rec => {
              const isSelected = selectedRecord?.id === rec.id;
              return (
                <div
                  key={rec.id}
                  onClick={() => handleSelectRecord(rec)}
                  className={`p-3.5 rounded-md border transition-colors cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/80 border-blue-500'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      rec.stream_type === 'STREAM_A_MOET'
                        ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                    }`}>
                      {rec.stream_type === 'STREAM_A_MOET' ? 'STREAM A (MOET)' : 'STREAM B (ROADMAP)'}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      rec.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : rec.status === 'REJECTED'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}>
                      {rec.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-white line-clamp-1">
                    {rec.major_code ? `[${rec.major_code}] ` : ''}{rec.source_title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="truncate max-w-[180px]">{rec.source_url}</span>
                    <span>{new Date(rec.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Provenance Box of Selected Record */}
          {selectedRecord && (
            <div className="bg-slate-900 rounded-md p-4 border border-slate-800 text-xs space-y-2">
              <h4 className="font-semibold text-white flex items-center space-x-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                <span>Truy xuất nguồn gốc (Provenance Audit)</span>
              </h4>
              <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                <p><strong>SHA-256:</strong> <span className="text-[10px] text-slate-400 break-all">{selectedRecord.content_hash}</span></p>
                <p><strong>Nguồn:</strong> {selectedRecord.source_title}</p>
                <p><strong>Trang/Vị trí:</strong> {selectedRecord.source_page || 'Toàn văn'}</p>
                <p><strong>URL gốc:</strong> <a href={selectedRecord.source_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block">{selectedRecord.source_url}</a></p>
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Editor (7 cols) */}
        {selectedRecord && editedPayload ? (
          <div className="lg:col-span-7 bg-slate-900 rounded-lg p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ID: {selectedRecord.id.slice(0, 8)}...
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Chỉnh Sửa Dữ Liệu Trước Khi Duyệt
                </h3>
              </div>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu nháp</span>
              </button>
            </div>

            {/* Editable Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Mã ngành Cấp IV</label>
                  <input
                    type="text"
                    value={editedPayload.major_code || selectedRecord.major_code || ''}
                    onChange={(e) => setEditedPayload({ ...editedPayload, major_code: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 font-mono text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Tên ngành đào tạo</label>
                  <input
                    type="text"
                    value={editedPayload.major_title || editedPayload.major_name || ''}
                    onChange={(e) => setEditedPayload({ ...editedPayload, major_title: e.target.value, major_name: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Milestones Preview */}
              {editedPayload.milestones && (
                <div className="space-y-1.5">
                  <label className="block font-medium text-slate-300">Các mốc lộ trình ({editedPayload.milestones.length}):</label>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {editedPayload.milestones.map((m: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">Mốc {m.step}: {m.title}</span>
                          <span className="text-[10px] text-slate-400">{m.duration_weeks} tuần</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Ghi chú kiểm duyệt của Admin:</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Ghi chú xác thực đối chiếu với Thông tư 09 hoặc đề cương..."
                  className="w-full p-2.5 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => handleReviewDecision('REJECTED')}
                className="px-3.5 py-1.5 rounded-md border border-rose-500/40 text-rose-300 hover:bg-rose-950/30 font-medium text-xs transition-colors flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Từ chối</span>
              </button>

              <button
                type="button"
                onClick={() => handleReviewDecision('APPROVED')}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Phê Duyệt & Xuất Bản</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-slate-900 rounded-lg p-10 border border-slate-800 text-center text-slate-400 text-xs">
            Chọn một bản ghi ở danh sách bên trái để tiến hành kiểm duyệt.
          </div>
        )}
      </div>
    </div>
  );
};
