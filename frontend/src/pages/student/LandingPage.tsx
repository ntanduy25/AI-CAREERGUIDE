import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  BrainCircuit,
  FileSpreadsheet,
  ArrowRight,
  Award,
  Check,
  GraduationCap,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const pillars = [
    {
      step: '01',
      title: 'Sở thích Nghề nghiệp',
      weight: '45% Trọng số',
      desc: 'Mô hình 6 chiều Holland (RIASEC) đo lường độ tương thích tính cách qua thuật toán Cosine Similarity chuẩn hóa.',
      icon: BrainCircuit,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      step: '02',
      title: 'Năng lực Học thuật',
      weight: '35% Trọng số',
      desc: 'Chuẩn hóa điểm học bạ THPT qua phân phối Z-score và hàm tích lũy xác suất chuẩn (Normal CDF) theo các khối tuyển sinh (A00, A01, D01...).',
      icon: FileSpreadsheet,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      step: '03',
      title: 'Thiên hướng Nhận thức',
      weight: '20% Trọng số',
      desc: 'Phân tích phương pháp tiếp nhận thông tin (thực hành vs. lý thuyết, độc lập vs. cộng tác) theo lý thuyết đa trí tuệ Gardner.',
      icon: Sparkles,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  const workflowSteps = [
    {
      step: '1',
      title: 'Khảo sát Sở thích & Nhận thức',
      desc: '30 câu hỏi sở thích nghề nghiệp Holland RIASEC (thang Likert 1-5) và 8 câu trắc nghiệm phong cách tiếp thu tri thức.',
      tag: '45% + 20%',
    },
    {
      step: '2',
      title: 'Nhập Điểm Học bạ THPT',
      desc: 'Điền điểm trung bình các môn học văn hóa để hệ thống chuẩn hóa Z-score theo phân phối điểm chuẩn quốc gia.',
      tag: '35%',
    },
    {
      step: '3',
      title: 'Chẩn đoán Năng lực Đầu vào (FR03)',
      desc: 'Kiểm tra nhanh 10 phút kiến thức logic hoặc chuyên ngành để tự động khấu trừ lỗ hổng kỹ năng trong lộ trình học.',
      tag: 'Bổ trợ kỹ năng',
    },
    {
      step: '4',
      title: 'Nhận Đề xuất & Lộ trình XAI',
      desc: 'Xem xếp hạng 108 ngành cấp IV với giải trình minh bạch, biểu đồ Radar đối sánh và lộ trình phát triển kỹ năng từng kỳ.',
      tag: 'XAI Minh bạch',
    },
  ];

  const standards = [
    {
      title: 'Thông tư 09/2022/TT-BGDĐT',
      desc: 'Bám sát 100% danh mục giáo dục đào tạo cấp IV quốc gia với 108 ngành đại học chính quy.',
    },
    {
      title: 'Toán học Tất định 100%',
      desc: 'Thuật toán đối sánh vector Cosine và hàm Normal CDF có thể kiểm toán, không phụ thuộc vào phán đoán ngẫu nhiên.',
    },
    {
      title: 'Bảo mật theo Luật 91/2025/QH15',
      desc: 'Dữ liệu học bạ và bài kiểm tra được cô lập theo tài khoản riêng biệt, khử khuẩn định danh PII trước khi xử lý.',
    },
    {
      title: 'Không thiên lệch thương mại',
      desc: 'Khuyến nghị hoàn toàn dựa trên năng lực và sở thích, tuyệt đối không đưa học phí hay địa phương vào công thức tính điểm.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Hệ thống Định hướng Giáo dục Đại học Chuẩn Quốc gia</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Định hướng ngành học đại học dựa trên cơ sở khoa học và dữ liệu thực tế
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              Giải pháp tư vấn chọn ngành kết hợp 3 trụ cột khoa học: Khảo sát sở thích Holland RIASEC,
              phân tích học bạ THPT chuẩn hóa Z-Score, và đối chiếu với danh mục đào tạo cấp IV Thông tư 09/2022/TT-BGDĐT.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/guidance"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                <span>Bắt đầu khảo sát năng lực</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/taxonomy"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-colors"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Tra cứu 108 ngành cấp IV</span>
              </Link>
            </div>

            {/* Metrics */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
              <div>
                <p className="text-2xl font-bold text-slate-900">108</p>
                <p className="text-xs text-slate-500 mt-0.5">Mã ngành Cấp IV Bộ GD&ĐT</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">3 Trụ cột</p>
                <p className="text-xs text-slate-500 mt-0.5">RIASEC + Z-Score + Nhận thức</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">FR03</p>
                <p className="text-xs text-slate-500 mt-0.5">Chẩn đoán kỹ năng đầu vào</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Luật 91</p>
                <p className="text-xs text-slate-500 mt-0.5">Bảo vệ dữ liệu cá nhân</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-3 mb-10">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <span>Phương pháp luận</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Khung đánh giá tương thích 3 trụ cột khoa học
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Thay vì dựa trên linh cảm hoặc các mô hình tạo sinh không kiểm soát, hệ thống sử dụng thuật toán tính điểm tất định với trọng số rõ ràng cho từng phương diện.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      TRỤ CỘT {p.step}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${p.badgeColor}`}>
                      {p.weight}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {p.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center text-xs font-semibold text-blue-600">
                  <Link to="/guidance" className="inline-flex items-center hover:underline">
                    <span>Thực hiện đánh giá</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="bg-slate-100 border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Quy trình 4 bước tiếp cận minh bạch
            </h2>
            <p className="text-sm text-slate-600 max-w-xl">
              Học sinh và phụ huynh có thể chủ động theo dõi từng giai đoạn đánh giá với tiến trình trực quan và dữ liệu lưu giữ an toàn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {workflowSteps.map((ws) => (
              <div key={ws.step} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      {ws.step}
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {ws.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ws.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ws.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards & Transparency Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-3 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Cam kết chất lượng và tính minh bạch
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            Các tiêu chuẩn kỹ thuật và pháp lý được tích hợp trực tiếp vào kiến trúc hệ thống.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {standards.map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex items-start space-x-4">
              <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-slate-900 text-white rounded-lg p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight">
              Sẵn sàng xây dựng lộ trình hướng nghiệp cho bản thân?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Bắt đầu bài khảo sát ngay hôm nay. Mọi dữ liệu cá nhân của bạn đều được bảo mật an toàn theo tiêu chuẩn Luật số 91/2025/QH15.
            </p>
          </div>
          <Link
            to="/guidance"
            className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors shrink-0"
          >
            Thực hiện bài test ngay
          </Link>
        </div>
      </section>
    </div>
  );
};
