import { DiagnosticQuiz } from '../types';

export const OFFICIAL_DIAGNOSTIC_QUIZZES: DiagnosticQuiz[] = [
  {
    id: 'quiz_logic_prog',
    skill_code: 'SKILL_PRE_LOGIC_DISCRETE',
    title: 'Chẩn đoán Tư duy Logic & Nhập môn Thuật toán',
    domain: 'Máy tính & Công nghệ thông tin',
    badge_name: 'Tư duy Logic & Thuật toán',
    icon: 'Code2',
    duration_minutes: 10,
    description: 'Đánh giá khả năng suy luận mệnh đề, tìm quy luật chuỗi số và giải quyết vấn đề tuần tự.',
    prerequisite_for: ['7480201', '7480101', '7480103', '7480102'],
    questions: [
      {
        id: 'q1_1',
        question: 'Cho mệnh đề: "Nếu trời mưa (P) thì đường trơn (Q)". Mệnh đề nào sau đây luôn có cùng giá trị chân lý với mệnh đề trên (Phản đảo - Contrapositive)?',
        options: [
          'A. Nếu đường trơn thì trời mưa (Q => P)',
          'B. Nếu trời không mưa thì đường không trơn (NOT P => NOT Q)',
          'C. Nếu đường không trơn thì trời không mưa (NOT Q => NOT P)',
          'D. Trời mưa nhưng đường không trơn (P AND NOT Q)'
        ],
        correct_index: 2,
        explanation: 'Theo quy luật suy luận hình thức, mệnh đề phản đảo (NOT Q => NOT P) luôn tương đương logic với mệnh đề ban đầu (P => Q).'
      },
      {
        id: 'q1_2',
        question: 'Cho dãy số: 2, 6, 12, 20, 30, ... Số tiếp theo trong dãy quy luật là số nào?',
        options: [
          'A. 38',
          'B. 40',
          'C. 42',
          'D. 44'
        ],
        correct_index: 2,
        explanation: 'Quy luật tăng dần: +4, +6, +8, +10, do đó số tiếp theo là 30 + 12 = 42 (hoặc công thức n*(n+1) với n=1,2,3,4,5,6 => 6*7 = 42).'
      },
      {
        id: 'q1_3',
        question: 'Thuật toán tìm kiếm nhị phân (Binary Search) trên mảng đã sắp xếp có 1.024 phần tử. Trong trường hợp xấu nhất, số lần so sánh tối đa là bao nhiêu?',
        options: [
          'A. 10 lần',
          'B. 11 lần',
          'C. 512 lần',
          'D. 1.024 lần'
        ],
        correct_index: 1,
        explanation: 'Độ phức tạp là O(log2(N)). Với N = 1024, log2(1024) = 10, số lần so sánh tối đa không vượt quá 10 hoặc 11 bước chia đôi mảng.'
      },
      {
        id: 'q1_4',
        question: 'Xét bài toán: Bạn có 3 chiếc hộp dán nhãn "Táo", "Cam" và "Táo & Cam". Cả 3 hộp đều bị dán sai nhãn. Bạn chỉ được bốc 1 quả từ 1 hộp để xác định chính xác nhãn của cả 3 hộp. Bạn nên bốc từ hộp nào?',
        options: [
          'A. Hộp dán nhãn "Táo"',
          'B. Hộp dán nhãn "Cam"',
          'C. Hộp dán nhãn "Táo & Cam"',
          'D. Không thể xác định nếu chỉ bốc 1 quả'
        ],
        correct_index: 2,
        explanation: 'Vì hộp "Táo & Cam" bị dán sai, nó chắc chắn chỉ chứa toàn Táo hoặc toàn Cam. Bốc quả ở hộp này sẽ biết chính xác loại quả, từ đó suy luận logic nhãn của 2 hộp còn lại.'
      },
      {
        id: 'q1_5',
        question: 'Trong cấu trúc dữ liệu, cấu trúc nào hoạt động theo nguyên lý LIFO (Last In, First Out - Vào sau, ra trước)?',
        options: [
          'A. Hàng đợi (Queue)',
          'B. Ngăn xếp (Stack)',
          'C. Danh sách liên kết (Linked List)',
          'D. Cây nhị phân (Binary Tree)'
        ],
        correct_index: 1,
        explanation: 'Ngăn xếp (Stack) tuân theo nguyên tắc LIFO (ví dụ như ngăn xếp hoàn tác Undo/Redo trong soạn thảo văn bản).'
      }
    ]
  },
  {
    id: 'quiz_calculus_stats',
    skill_code: 'SKILL_PRE_CALCULUS',
    title: 'Chẩn đoán Giải tích Nền tảng & Phân tích Định lượng',
    domain: 'Toán học & Khoa học Định lượng',
    badge_name: 'Giải tích & Phân tích Định lượng',
    icon: 'Calculator',
    duration_minutes: 10,
    description: 'Kiểm tra sự hiểu biết về giới hạn hàm số, ý nghĩa hình học của đạo hàm và đọc hiểu biểu đồ thống kê.',
    prerequisite_for: ['7520216', '7340201', '7340101', '7480201'],
    questions: [
      {
        id: 'q2_1',
        question: 'Về mặt hình học, giá trị đạo hàm f\'(x0) của hàm số y = f(x) tại điểm x0 đại diện cho đại lượng nào sau đây?',
        options: [
          'A. Khoảng cách từ gốc tọa độ đến điểm tiếp xúc',
          'B. Hệ số góc (độ dốc) của tiếp tuyến đồ thị tại điểm (x0, f(x0))',
          'C. Diện tích hình phẳng giới hạn bởi đồ thị',
          'D. Điểm uốn của đồ thị hàm số'
        ],
        correct_index: 1,
        explanation: 'Đạo hàm f\'(x0) chính là hệ số góc (tangent slope) của tiếp tuyến với đồ thị tại điểm x0, biểu thị tốc độ biến thiên tức thời của hàm số.'
      },
      {
        id: 'q2_2',
        question: 'Một bài kiểm tra có điểm số tuân theo phân phối chuẩn với trung bình μ = 20 và độ lệch chuẩn σ = 3. Điểm Z-score của một học sinh đạt 26 điểm là bao nhiêu?',
        options: [
          'A. +1.5',
          'B. +2.0',
          'C. +2.5',
          'D. +3.0'
        ],
        correct_index: 1,
        explanation: 'Công thức chuẩn hóa: Z = (X - μ) / σ = (26 - 20) / 3 = 6 / 3 = +2.0 (nghĩa là điểm học sinh cao hơn 2 độ lệch chuẩn so với trung bình quốc gia).'
      },
      {
        id: 'q2_3',
        question: 'Giới hạn lim (x -> 0) của biểu thức sin(x)/x có giá trị bằng bao nhiêu?',
        options: [
          'A. 0',
          'B. 1',
          'C. Vô cực (Infinity)',
          'D. Không tồn tại'
        ],
        correct_index: 1,
        explanation: 'Đây là giới hạn lượng giác cơ bản kinh điển trong giải tích vi phân: lim (x -> 0) [sin(x) / x] = 1.'
      },
      {
        id: 'q2_4',
        question: 'Trong kinh tế và tối ưu hóa toán học, khi một hàm doanh thu R(q) đạt cực đại tại sản lượng q*, điều kiện cần ở đạo hàm cấp 1 là gì?',
        options: [
          'A. R\'(q*) > 0',
          'B. R\'(q*) < 0',
          'C. R\'(q*) = 0',
          'D. R\'\'(q*) > 0'
        ],
        correct_index: 2,
        explanation: 'Theo định lý Fermat về điểm cực trị hàm khả vi, tiếp tuyến tại đỉnh cực đại nằm ngang nên R\'(q*) = 0 (doanh thu biên bằng 0).'
      },
      {
        id: 'q2_5',
        question: 'Một biến cố A có xác suất P(A) = 0.4. Xác suất để biến cố A KHÔNG xảy ra (biến cố đối) là bao nhiêu?',
        options: [
          'A. 0.4',
          'B. 0.5',
          'C. 0.6',
          'D. 1.0'
        ],
        correct_index: 2,
        explanation: 'Xác suất biến cố đối: P(NOT A) = 1 - P(A) = 1 - 0.4 = 0.6.'
      }
    ]
  },
  {
    id: 'quiz_english_academic',
    skill_code: 'SKILL_PRE_ENG_ACADEMIC',
    title: 'Chẩn đoán Tiếng Anh Học thuật & Đọc hiểu Chuyên ngành',
    domain: 'Ngoại ngữ & Hội nhập Quốc tế',
    badge_name: 'Tiếng Anh Học thuật Quốc tế',
    icon: 'GraduationCap',
    duration_minutes: 10,
    description: 'Đánh giá kỹ năng đọc hiểu tài liệu chuyên ngành bằng tiếng Anh (Academic Reading) và từ vựng ngữ cảnh.',
    prerequisite_for: ['7220201', '7340120', '7480201', '7340201'],
    questions: [
      {
        id: 'q3_1',
        question: 'Read the sentence: "The empirical evidence gathered during the trial corroborated the researchers\' initial hypothesis." What does "corroborated" most closely mean?',
        options: [
          'A. Contradicted or disproved',
          'B. Supported or confirmed',
          'C. Ignored and dismissed',
          'D. Replaced with a new idea'
        ],
        correct_index: 1,
        explanation: '"Corroborate" means to confirm or give support to a statement, theory, or finding (xác thực, củng cố bằng chứng).'
      },
      {
        id: 'q3_2',
        question: 'Which of the following phrases is most suitable for transitioning between contrasting arguments in an academic research paper?',
        options: [
          'A. Furthermore',
          'B. In addition to this',
          'C. Conversely',
          'D. Subsequently'
        ],
        correct_index: 2,
        explanation: '"Conversely" (ngược lại) is used to introduce an idea that is the reverse or contrary of what has just been mentioned.'
      },
      {
        id: 'q3_3',
        question: 'In academic writing, what does "peer review" typically refer to?',
        options: [
          'A. Evaluating classmates\' presentation slides in high school',
          'B. The evaluation of work by experts in the same field before publication',
          'C. Proofreading grammar using online software tools',
          'D. Polling public opinions on social media platforms'
        ],
        correct_index: 1,
        explanation: 'Peer review là quy trình bình duyệt học thuật bởi các chuyên gia độc lập cùng lĩnh vực trước khi bài báo khoa học được xuất bản.'
      },
      {
        id: 'q3_4',
        question: 'Choose the word that best completes the academic sentence: "The study highlights a significant __________ between access to digital infrastructure and student retention rates."',
        options: [
          'A. correlation',
          'B. illusion',
          'C. friction',
          'D. allegation'
        ],
        correct_index: 0,
        explanation: '"Correlation" (mối tương quan) is standard academic nomenclature describing a statistical relationship between two variables.'
      },
      {
        id: 'q3_5',
        question: 'What is the primary objective of an Abstract in a university syllabus or scientific paper?',
        options: [
          'A. To list references and citations in alphabetical order',
          'B. To summarize the main research objectives, methodology, and key findings concisely',
          'C. To provide full mathematical proofs spanning multiple pages',
          'D. To acknowledge financial sponsors and family members'
        ],
        correct_index: 1,
        explanation: 'An Abstract (tóm tắt tổng quan) cung cấp bức tranh cô đọng về mục tiêu nghiên cứu, phương pháp luận và phát hiện chính của bài báo.'
      }
    ]
  },
  {
    id: 'quiz_natural_sciences',
    skill_code: 'SKILL_PRE_PHYSICS_MECH',
    title: 'Chẩn đoán Khoa học Tự nhiên & Nguyên lý Thực nghiệm',
    domain: 'Kỹ thuật, Công nghệ & Khoa học Tự nhiên',
    badge_name: 'Khoa học Tự nhiên & Thực nghiệm',
    icon: 'Atom',
    duration_minutes: 10,
    description: 'Kiểm tra các định luật bảo toàn, nguyên lý động lực học và tư duy mô hình hóa thực nghiệm.',
    prerequisite_for: ['7520216', '7510205', '7720101'],
    questions: [
      {
        id: 'q4_1',
        question: 'Theo Định luật bảo toàn cơ năng, trong một hệ kín không có ma sát hay lực cản, tổng của đại lượng nào sau đây luôn không đổi theo thời gian?',
        options: [
          'A. Động năng và nhiệt lượng tỏa ra',
          'B. Động năng và Thế năng (Cơ năng toàn phần)',
          'C. Động lượng và Gia tốc góc',
          'D. Công cơ học và Công suất'
        ],
        correct_index: 1,
        explanation: 'Cơ năng W = Wd (động năng) + Wt (thế năng) luôn được bảo toàn trong trọng trường khi bỏ qua lực ma sát.'
      },
      {
        id: 'q4_2',
        question: 'Định luật Ôm (Ohm\'s Law) cho đoạn mạch thuần trở biểu diễn mối quan hệ giữa Cường độ dòng điện (I), Hiệu điện thế (U) và Điện trở (R) như thế nào?',
        options: [
          'A. I = U * R',
          'B. I = U / R',
          'C. I = R / U',
          'D. I = U^2 / R'
        ],
        correct_index: 1,
        explanation: 'Định luật Ôm cơ bản: Cường độ dòng điện tỉ lệ thuận với hiệu điện thế và tỉ lệ nghịch với điện trở: I = U / R.'
      },
      {
        id: 'q4_3',
        question: 'Trong các phản ứng hóa học, chất xúc tác (catalyst) có vai trò chính là gì đối với phản ứng?',
        options: [
          'A. Làm tăng nhiệt độ phản ứng lên gấp đôi',
          'B. Làm giảm năng lượng hoạt hóa, giúp phản ứng diễn ra nhanh hơn mà không bị tiêu hao',
          'C. Thay đổi hoàn toàn sản phẩm phản ứng tạo ra',
          'D. Làm chuyển dịch cân bằng sang chất không mong muốn'
        ],
        correct_index: 1,
        explanation: 'Chất xúc tác làm giảm năng lượng hoạt hóa (activation energy), đẩy nhanh tốc độ phản ứng mà không bị tiêu hao hay biến đổi thành chất khác.'
      },
      {
        id: 'q4_4',
        question: 'Theo nguyên lý đòn bẩy Archimedes, để nâng một vật có trọng lượng lớn bằng một lực nhỏ, điểm tựa cần đặt ở vị trí nào?',
        options: [
          'A. Gần vật cần nâng hơn',
          'B. Gần vị trí tác dụng lực hơn',
          'C. Đúng chính giữa đòn bẩy',
          'D. Ở đầu mút ngoài cùng của đòn bẩy'
        ],
        correct_index: 0,
        explanation: 'Cánh tay đòn của lực càng dài so với cánh tay đòn của tải trọng (điểm tựa gần vật hơn), lực cần tác dụng càng nhỏ: F1 * d1 = F2 * d2.'
      },
      {
        id: 'q4_5',
        question: 'Khi quan sát tế bào dưới kính hiển vi quang học, bào quan nào được coi là "nhà máy năng lượng" của tế bào thực hiện hô hấp tế bào?',
        options: [
          'A. Ribosome',
          'B. Nhân tế bào (Nucleus)',
          'C. Ty thể (Mitochondria)',
          'D. Lưới nội chất'
        ],
        correct_index: 2,
        explanation: 'Ty thể (Mitochondria) là nơi diễn ra chu trình Krebs và chuỗi chuyền electron tổng hợp ATP (năng lượng cho tế bào).'
      }
    ]
  },
  {
    id: 'quiz_critical_essay',
    skill_code: 'SKILL_PRE_VIET_ESSAY',
    title: 'Chẩn đoán Lập luận Phản biện & Đọc hiểu Xã hội',
    domain: 'Khoa học Xã hội, Luật & Truyền thông',
    badge_name: 'Lập luận Phản biện Xã hội',
    icon: 'Scale',
    duration_minutes: 10,
    description: 'Đánh giá khả năng phân tích lập luận, phát hiện ngụy biện logic và tổng hợp thông tin văn bản.',
    prerequisite_for: ['7380101', '7320101', '7310101'],
    questions: [
      {
        id: 'q5_1',
        question: 'Lập luận: "Anh ta còn quá trẻ và chưa có gia đình, làm sao anh ta hiểu được chính sách giáo dục trẻ em!" phạm phải loại ngụy biện (Logical Fallacy) nào?',
        options: [
          'A. Ngụy biện người rơm (Straw Man)',
          'B. Ngụy biện tấn công cá nhân (Ad Hominem)',
          'C. Ngụy biện khái quát hóa vội vã (Hasty Generalization)',
          'D. Ngụy biện viện dẫn thẩm quyền không liên quan (Appeal to False Authority)'
        ],
        correct_index: 1,
        explanation: 'Ngụy biện Ad Hominem tấn công vào đặc điểm cá nhân (tuổi tác, gia cảnh) của người lập luận thay vì phản bác logic của luận điểm.'
      },
      {
        id: 'q5_2',
        question: 'Trong phương pháp tư duy phản biện, sự khác biệt căn bản giữa "Sự thật" (Fact) và "Ý kiến" (Opinion) là gì?',
        options: [
          'A. Ý kiến luôn luôn đúng còn sự thật có thể sai',
          'B. Sự thật có thể kiểm chứng được qua dữ liệu khách quan, còn ý kiến thể hiện góc nhìn cá nhân',
          'C. Sự thật chỉ áp dụng trong khoa học tự nhiên, xã hội không có sự thật',
          'D. Hai khái niệm này hoàn toàn đồng nghĩa trong tranh biện'
        ],
        correct_index: 1,
        explanation: 'Sự thật (Fact) là thông tin khách quan có thể kiểm chứng độc lập; ý kiến (Opinion) là phán đoán chủ quan mang giá trị cá nhân.'
      },
      {
        id: 'q5_3',
        question: 'Khi viết một bài luận học thuật hoặc văn bản thuyết phục, cấu trúc mô hình lập luận Toulmin bao gồm các thành phần cốt lõi nào?',
        options: [
          'A. Mở bài, Thân bài, Kết bài',
          'B. Luận điểm (Claim), Bằng chứng (Data/Evidence), Cơ sở liên kết (Warrant)',
          'C. Nhân vật, Cốt truyện, Bài học đạo đức',
          'D. Thơ, Văn xuôi, Kịch bản'
        ],
        correct_index: 1,
        explanation: 'Mô hình lập luận Toulmin chuẩn mực gồm: Claim (Luận điểm) + Evidence/Data (Chứng cứ) + Warrant (Cơ sở liên kết logic giữa chứng cứ và luận điểm).'
      },
      {
        id: 'q5_4',
        question: 'Khi phân tích một bài báo truyền thông, hiện tượng "Thiên kiến xác nhận" (Confirmation Bias) biểu hiện như thế nào?',
        options: [
          'A. Người đọc luôn tìm kiếm và ghi nhớ thông tin ủng hộ định kiến có sẵn của mình, phớt lờ bằng chứng trái chiều',
          'B. Người đọc tin tưởng 100% mọi thông tin xuất hiện trên mạng xã hội',
          'C. Người đọc luôn phản bác mọi ý kiến của tác giả',
          'D. Người đọc chỉ đọc tiêu đề bài viết mà không đọc nội dung'
        ],
        correct_index: 0,
        explanation: 'Confirmation Bias là xu hướng tâm lý tìm kiếm, diễn giải và ghi nhớ thông tin sao cho khớp với niềm tin có sẵn của bản thân.'
      },
      {
        id: 'q5_5',
        question: 'Trong quy trình xây dựng văn bản pháp luật hoặc thỏa thuận hợp đồng, nguyên tắc "Rõ ràng, không đa nghĩa" (Unambiguous) nhằm mục đích gì?',
        options: [
          'A. Để văn bản dài hơn và trị giá cao hơn',
          'B. Ngăn ngừa cách diễn giải sai lệch và giảm thiểu tranh chấp pháp lý phát sinh',
          'C. Để người bình thường không thể đọc hiểu được',
          'D. Để bắt buộc phải thuê luật sư phiên dịch'
        ],
        correct_index: 1,
        explanation: 'Tính chuẩn xác, đơn nghĩa trong soạn thảo văn bản giúp các bên có cùng một cách hiểu thống nhất, triệt tiêu nguy cơ tranh chấp pháp lý.'
      }
    ]
  },
  {
    id: 'quiz_business_thinking',
    skill_code: 'SKILL_TAR_FINANCIAL_ANALYSIS',
    title: 'Chẩn đoán Tư duy Kinh tế & Tình huống Doanh nghiệp',
    domain: 'Kinh doanh & Quản lý',
    badge_name: 'Tư duy Kinh tế & Doanh nghiệp',
    icon: 'TrendingUp',
    duration_minutes: 10,
    description: 'Đánh giá tư duy phân bổ nguồn lực, chi phí cơ hội và nhận diện quy luật cung - cầu thị trường.',
    prerequisite_for: ['7340101', '7340201', '7340115'],
    questions: [
      {
        id: 'q6_1',
        question: 'Khái niệm "Chi phí cơ hội" (Opportunity Cost) trong kinh tế học được định nghĩa là gì?',
        options: [
          'A. Toàn bộ số tiền thực tế bạn đã chi ra bằng tiền mặt',
          'B. Giá trị của cơ hội tốt nhất bị bỏ qua khi đưa ra một quyết định lựa chọn',
          'C. Khoản tiền lãi suất vay ngân hàng phải trả định kỳ',
          'D. Chi phí quảng cáo để tiếp cận khách hàng tiềm năng'
        ],
        correct_index: 1,
        explanation: 'Chi phí cơ hội là lợi ích tối ưu mà bạn từ bỏ khi quyết định chọn một phương án thay vì phương án thay thế tốt nhất tiếp theo.'
      },
      {
        id: 'q6_2',
        question: 'Khi giá của một mặt hàng tiêu dùng thông thường tăng lên trên thị trường (các yếu tố khác không đổi), quy luật cầu (Law of Demand) chỉ ra điều gì?',
        options: [
          'A. Lượng cầu về mặt hàng đó sẽ tăng lên',
          'B. Lượng cầu về mặt hàng đó sẽ giảm xuống',
          'C. Lượng cung về mặt hàng đó chắc chắn giảm xuống 0',
          'D. Lượng cầu hoàn toàn không bị ảnh hưởng'
        ],
        correct_index: 1,
        explanation: 'Quy luật Cầu: Khi giá sản phẩm tăng lên, lượng cầu người tiêu dùng sẵn sàng và có khả năng mua sẽ giảm xuống (mối quan hệ nghịch biến).'
      },
      {
        id: 'q6_3',
        question: 'Một công ty có Doanh thu (Revenue) là 10 tỷ đồng và Tổng chi phí hoạt động (Total Cost) là 7.5 tỷ đồng. Lợi nhuận trước thuế của doanh nghiệp là bao nhiêu?',
        options: [
          'A. 17.5 tỷ đồng',
          'B. 2.5 tỷ đồng',
          'C. 7.5 tỷ đồng',
          'D. 1.33 tỷ đồng'
        ],
        correct_index: 1,
        explanation: 'Lợi nhuận = Doanh thu - Tổng chi phí = 10 tỷ - 7.5 tỷ = 2.5 tỷ đồng.'
      },
      {
        id: 'q6_4',
        question: 'Khái niệm "Lợi thế cạnh tranh" (Competitive Advantage) của một doanh nghiệp nghĩa là gì?',
        options: [
          'A. Doanh nghiệp có quy mô nhân sự lớn nhất ngành',
          'B. Yếu tố cho phép doanh nghiệp tạo ra giá trị vượt trội hoặc chi phí thấp hơn so với đối thủ',
          'C. Doanh nghiệp chi nhiều tiền tài trợ cho các sự kiện truyền thông nhất',
          'D. Doanh nghiệp bán giá rẻ nhất bất chấp lỗ vốn triền miên'
        ],
        correct_index: 1,
        explanation: 'Lợi thế cạnh tranh (theo Michael Porter) là năng lực cốt lõi giúp doanh nghiệp cung cấp giá trị cao hơn cho khách hàng hoặc tối ưu chi phí hơn đối thủ cạnh tranh.'
      },
      {
        id: 'q6_5',
        question: 'Trong quản lý tài chính cá nhân và đầu tư, nguyên tắc "Không bỏ tất cả trứng vào một giỏ" đại diện cho chiến lược gì?',
        options: [
          'A. Đa dạng hóa danh mục đầu tư để giảm thiểu rủi ro',
          'B. Đầu tư toàn bộ vốn vào cổ phiếu công nghệ sinh lời cao nhất',
          'C. Chỉ giữ tiền mặt dưới gối không gửi ngân hàng',
          'D. Mua tài sản theo cảm tính đám đông'
        ],
        correct_index: 0,
        explanation: 'Đa dạng hóa danh mục đầu tư (Diversification) giúp phân tán rủi ro phi hệ thống, bảo vệ nguồn vốn khi một tài sản cụ thể gặp biến động xấu.'
      }
    ]
  }
];
