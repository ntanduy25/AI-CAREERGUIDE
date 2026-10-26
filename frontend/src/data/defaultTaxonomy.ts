/**
 * Danh mục ngành đào tạo cấp IV theo Thông tư 09/2022/TT-BGDĐT.
 * 
 * LƯU Ý QUAN TRỌNG:
 * Toàn bộ 108 ngành đào tạo đại học chính thức được LƯU TRỮ VÀ QUẢN LÝ TẬP TRUNG
 * TRONG CƠ SỞ DỮ LIỆU POSTGRESQL (bảng majors, subject_blocks, careers).
 * Tệp này cung cấp kiểu dữ liệu MajorItem và 6 ngành nòng cốt làm dữ liệu dự phòng ban đầu
 * (Initial Fallback) khi giao diện chưa kịp tải dữ liệu từ CSDL backend.
 */
import { MajorItem } from '../types';
import moetSeedData from './moet_taxonomy_tt09.json';

export type { MajorItem };

// Toàn bộ 108 ngành đào tạo đại học cấp IV theo Thông tư 09/2022/TT-BGDĐT
export const MOET_108_MAJORS: MajorItem[] = moetSeedData as unknown as MajorItem[];

// 6 ngành nòng cốt ban đầu (Initial Fallback khi CSDL đang khởi tạo)
export const INITIAL_SIX_MAJORS: MajorItem[] = [
  {
    major_code: "7480201",
    name: "Công nghệ thông tin",
    category: "Máy tính & Công nghệ thông tin",
    degree_level: "Đại học",
    blocks: ["A00", "A01", "D01"],
    careers: ["Kỹ sư phần mềm Full-stack", "Chuyên viên phân tích hệ thống", "Kiến trúc sư giải pháp đám mây"],
    riasec: { R: 0.3, I: 0.9, A: 0.3, S: 0.4, E: 0.5, C: 0.7 },
    cognitive: {
      abstract_thinking: "high",
      analytical_reasoning: "high",
      spatial_perception: "medium",
      linguistic_ability: "medium",
      learning_environment: "exploratory",
      teamwork_intensity: "balanced"
    },
    outlook: "Nhu cầu tuyển dụng liên tục tăng trưởng mạnh trong làn sóng AI, Điện toán đám mây và Chuyển đổi số quốc gia."
  },
  {
    major_code: "7480101",
    name: "Khoa học máy tính",
    category: "Máy tính & Công nghệ thông tin",
    degree_level: "Đại học",
    blocks: ["A00", "A01"],
    careers: ["Kỹ sư nghiên cứu Trí tuệ nhân tạo (AI/ML)", "Nhà khoa học dữ liệu", "Kỹ sư thuật toán"],
    riasec: { R: 0.2, I: 1.0, A: 0.3, S: 0.2, E: 0.4, C: 0.7 },
    cognitive: {
      abstract_thinking: "high",
      analytical_reasoning: "high",
      spatial_perception: "high",
      linguistic_ability: "medium",
      learning_environment: "structured",
      teamwork_intensity: "independent"
    },
    outlook: "Đón đầu kỷ nguyên AI Tạo sinh (Generative AI) và siêu máy tính với mức đãi ngộ hàng đầu thị trường công nghệ."
  },
  {
    major_code: "7480103",
    name: "Kỹ thuật phần mềm",
    category: "Máy tính & Công nghệ thông tin",
    degree_level: "Đại học",
    blocks: ["A00", "A01", "D01"],
    careers: ["Kỹ sư phát triển phần mềm doanh nghiệp", "Kỹ sư DevOps / SRE", "Trưởng nhóm kỹ thuật (Tech Lead)"],
    riasec: { R: 0.3, I: 0.8, A: 0.4, S: 0.5, E: 0.6, C: 0.7 },
    cognitive: {
      abstract_thinking: "high",
      analytical_reasoning: "high",
      spatial_perception: "medium",
      linguistic_ability: "high",
      learning_environment: "collaborative",
      teamwork_intensity: "highly_collaborative"
    },
    outlook: "Thị trường xuất khẩu phần mềm Việt Nam đạt kỷ lục tăng trưởng, khát nhân lực chất lượng cao tiêu chuẩn quốc tế."
  },
  {
    major_code: "7340101",
    name: "Quản trị kinh doanh",
    category: "Kinh doanh & Quản lý",
    degree_level: "Đại học",
    blocks: ["A00", "A01", "D01"],
    careers: ["Chuyên viên phát triển kinh doanh", "Quản lý vận hành dự án", "Giám đốc thương hiệu"],
    riasec: { R: 0.1, I: 0.4, A: 0.4, S: 0.8, E: 1.0, C: 0.6 },
    cognitive: {
      abstract_thinking: "medium",
      analytical_reasoning: "medium",
      spatial_perception: "low",
      linguistic_ability: "high",
      learning_environment: "collaborative",
      teamwork_intensity: "highly_collaborative"
    },
    outlook: "Yêu cầu kỹ năng quản trị tích hợp số hóa và tư duy kinh doanh bền vững ESG trong môi trường toàn cầu."
  },
  {
    major_code: "7340201",
    name: "Tài chính - Ngân hàng",
    category: "Kinh doanh & Quản lý",
    degree_level: "Đại học",
    blocks: ["A00", "A01", "D01"],
    careers: ["Chuyên viên phân tích tài chính doanh nghiệp", "Chuyên viên quản trị rủi ro đầu tư", "Chuyên viên Fintech"],
    riasec: { R: 0.1, I: 0.7, A: 0.1, S: 0.5, E: 0.9, C: 0.9 },
    cognitive: {
      abstract_thinking: "medium",
      analytical_reasoning: "high",
      spatial_perception: "low",
      linguistic_ability: "medium",
      learning_environment: "structured",
      teamwork_intensity: "balanced"
    },
    outlook: "Chuyển dịch mạnh mẽ sang Ngân hàng số và Fintech, mở rộng cơ hội cho nhân sự am hiểu công nghệ tài chính."
  },
  {
    major_code: "7520216",
    name: "Kỹ thuật cơ điện tử",
    category: "Kỹ thuật & Công nghiệp",
    degree_level: "Đại học",
    blocks: ["A00", "A01"],
    careers: ["Kỹ sư tích hợp hệ thống tự động hóa & Robotics", "Kỹ sư thiết kế IoT công nghiệp", "Chuyên viên bảo trì dây chuyền thông minh"],
    riasec: { R: 0.9, I: 0.8, A: 0.2, S: 0.3, E: 0.4, C: 0.6 },
    cognitive: {
      abstract_thinking: "medium",
      analytical_reasoning: "high",
      spatial_perception: "high",
      linguistic_ability: "low",
      learning_environment: "structured",
      teamwork_intensity: "balanced"
    },
    outlook: "Làn sóng dịch chuyển chuỗi cung ứng công nghệ cao và bán dẫn vào Việt Nam thúc đẩy nhu cầu tuyển dụng kỹ sư cơ điện tử."
  }
];

export const getStoredPublishedMajors = (): MajorItem[] => {
  try {
    const raw = localStorage.getItem('careerguide_published_majors');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 100) {
        return parsed;
      }
    }
  } catch (err) {
    // ignore
  }
  return MOET_108_MAJORS;
};

// Khởi tạo danh mục MOET chính thức từ Thông tư 09/2022/TT-BGDĐT
export const OFFICIAL_MOET_MAJORS: MajorItem[] = getStoredPublishedMajors();
