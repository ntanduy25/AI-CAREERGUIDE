import React from 'react';
import { Shield, BookOpen, Award, ExternalLink, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs mt-20 no-print border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Project Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                CG
              </div>
              <span className="text-sm font-bold text-white tracking-tight">AI CareerGuide</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Hệ thống hỗ trợ ra quyết định chọn ngành đại học giải thích được (XAI) và lộ trình phát triển kỹ năng cho học sinh THPT Việt Nam.
            </p>
            <p className="text-[11px] text-slate-500">
              Dự án Capstone Khoa học & Kỹ thuật Phần mềm — Đại học Duy Tân
            </p>
          </div>

          {/* Col 2: Regulatory Sources */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">Cơ sở dữ liệu & Quy phạm</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Thông tư 09/2022/TT-BGDĐT (108 ngành cấp IV)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Mô hình Holland RIASEC & Z-score chuẩn hóa</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Mô hình cây nghề nghiệp Phoenix Ho</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Privacy & Security */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">Quyền riêng tư & Bảo mật</h4>
            <p className="text-slate-400 leading-relaxed">
              Bảo vệ dữ liệu cá nhân theo Luật số 91/2025/QH15. Mã hóa mật khẩu chuẩn OWASP ASVS Level 2 (Argon2id). Khử khuẩn định danh cá nhân (PII sanitization) trước khi xử lý.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800 text-emerald-400 text-[11px] font-medium border border-slate-700">
              <Shield className="w-3.5 h-3.5" />
              <span>Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2025</span>
            </div>
          </div>

          {/* Col 4: Academic Integrity */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-xs tracking-wider uppercase">Nguyên tắc định hướng</h4>
            <p className="text-slate-400 leading-relaxed">
              <strong>Pure Guidance Scope:</strong> Thuật toán tuyệt đối không đưa yếu tố học phí hoặc vùng miền vào công thức tính điểm để đảm bảo tính khách quan và công bằng giáo dục.
            </p>
            <a
              href="https://moet.gov.vn"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-medium"
            >
              <span>Cổng thông tin Bộ Giáo dục & Đào tạo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 AI CareerGuide Project. Mã nguồn mở phục vụ nghiên cứu & định hướng nghề nghiệp giáo dục phổ thông.</p>
          <p className="mt-2 sm:mt-0">Tiêu chuẩn khả năng tiếp cận WCAG 2.1 AA</p>
        </div>
      </div>
    </footer>
  );
};
