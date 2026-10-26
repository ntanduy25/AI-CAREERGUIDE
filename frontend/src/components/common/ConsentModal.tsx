import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ isOpen, onClose }) => {
  const { grantConsent } = useAuth();
  const [agreedGeneral, setAgreedGeneral] = useState(true);
  const [agreedAI, setAgreedAI] = useState(true);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (agreedGeneral && agreedAI) {
      await grantConsent();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-modal border border-slate-200 space-y-5 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Chính sách Bảo vệ Dữ liệu Cá nhân
              </h3>
              <p className="text-xs text-blue-600 font-medium">
                Tuân thủ Luật số 91/2025/QH15 & Nghị định 13/2023/NĐ-CP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="bg-slate-50 rounded-md p-4 border border-slate-200 space-y-3 text-xs text-slate-600 leading-relaxed max-h-56 overflow-y-auto">
          <div className="flex items-start space-x-2">
            <Lock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <p>
              <strong className="text-slate-900">Mục đích xử lý dữ liệu:</strong> Thông tin khảo sát sở thích nghề nghiệp Holland (RIASEC), phong cách nhận thức và điểm học tập THPT chỉ được sử dụng duy nhất nhằm tính toán độ tương thích ngành đào tạo và hỗ trợ học sinh xây dựng lộ trình học tập.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Eye className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <p>
              <strong className="text-slate-900">Khử khuẩn thông tin định danh (PII Sanitization):</strong> Hệ thống thực hiện bóc tách và mã hóa các trường định danh cá nhân (Email, Họ tên, Mã định danh) trước khi lưu trữ hoặc chuyển tiếp xử lý qua mô hình tính toán.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <p>
              <strong className="text-slate-900">Tính độc lập & Công bằng:</strong> Không thu thập dữ liệu thu nhập tài chính của gia đình hoặc vị trí địa phương nhằm bảo đảm tính khách quan tuyệt đối trong các đề xuất ngành học.
            </p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 text-xs">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedGeneral}
              onChange={(e) => setAgreedGeneral(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700 font-medium">
              Tôi đồng ý cho phép hệ thống thu thập điểm học bạ và kết quả trắc nghiệm để xử lý gợi ý ngành học (Bắt buộc).
            </span>
          </label>

          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedAI}
              onChange={(e) => setAgreedAI(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-700 font-medium">
              Tôi xác nhận đã đọc và hiểu cơ chế bảo mật ẩn danh PII khi sử dụng dịch vụ Guidance RAG (Bắt buộc).
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!agreedGeneral || !agreedAI}
            onClick={handleConfirm}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Xác nhận đồng ý</span>
          </button>
        </div>
      </div>
    </div>
  );
};
