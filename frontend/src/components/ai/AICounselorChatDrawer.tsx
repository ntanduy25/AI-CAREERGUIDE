import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Send,
  MessageSquare,
  Compass,
  ArrowRight,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Lock,
} from 'lucide-react';
import { AIChatMessage, AIChatResponse } from '../../types';
import { aiGuidanceService, diagnosticService } from '../../services/careerServices';
import { getScopedItem } from '../../utils/userStorage';
import { AIMarkdownRenderer } from './AIMarkdownRenderer';

interface AICounselorChatDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  majorCode?: string | null;
  majorName?: string | null;
  riasecScores?: Record<string, number>;
  grades?: Record<string, number>;
  diagnosticMasteredSkills?: string[];
  userId?: string | null;
  onNavigateToRoadmap?: (majorCode: string) => void;
}

const INITIAL_WELCOME_MESSAGE = (majorName?: string | null): string => {
  if (majorName) {
    return `Chào bạn! Tôi là **Cố vấn Hướng nghiệp AI CareerGuide**.\n\nTôi đang xem xét hồ sơ năng lực của bạn đối với ngành **${majorName}**. Dữ liệu đánh giá gồm có:\n- Điểm bài kiểm tra thiên hướng nghề nghiệp\n- Điểm học bạ THPT các môn trọng điểm\n- Kết quả bài kiểm tra chẩn đoán kỹ năng nền tảng\n\nBạn có thể hỏi tôi về lý do đề xuất, môn cần cải thiện, hoặc nhấn nút **Tạo lộ trình học** bên dưới nhé!`;
  }
  return `Chào bạn! Tôi là **Cố vấn Hướng nghiệp AI CareerGuide**.\n\nTôi sẵn sàng giải đáp thắc mắc về lựa chọn ngành học, giải thích lý do đề xuất, phân tích điểm mạnh - điểm yếu và hỗ trợ bạn xây dựng lộ trình học tập cá nhân hóa.\n\n*Lưu ý: Mọi thông tin định danh cá nhân đều được bảo vệ nghiêm ngặt theo Luật 91/2025/QH15. Hệ thống chỉ xử lý điểm số học tập để đưa ra lời khuyên khách quan.*`;
};

const DEFAULT_PROMPTS_WITH_MAJOR = (majorName: string) => [
  `Vì sao em phù hợp với ngành ${majorName}?`,
  `Em cần cải thiện môn học nào để tăng khả năng trúng tuyển?`,
  `Kết quả test chẩn đoán kỹ năng logic của em giúp ích gì?`,
  `Tạo lộ trình 4 tuần tự học nền tảng cho ngành này`,
];

const DEFAULT_PROMPTS_GENERAL = [
  'Dựa vào điểm sở thích và học bạ của em, ngành nào phù hợp nhất?',
  'Bài kiểm tra chẩn đoán kỹ năng đầu vào có vai trò gì?',
  'Làm thế nào để xây dựng lộ trình tự học hiệu quả?',
  'Ngành STEM và ngành Kinh tế - Xã hội có điểm khác biệt gì?',
];

export const AICounselorChatDrawer: React.FC<AICounselorChatDrawerProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  majorCode: propMajorCode,
  majorName: propMajorName,
  riasecScores: propRiasecScores,
  grades: propGrades,
  diagnosticMasteredSkills: propDiagnosticMasteredSkills,
  userId: propUserId,
  onNavigateToRoadmap,
}) => {
  const navigate = useNavigate();

  // Internal state for standalone / event-triggered mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentMajorCode, setCurrentMajorCode] = useState<string | null>(propMajorCode || null);
  const [currentMajorName, setCurrentMajorName] = useState<string | null>(propMajorName || null);

  const isDrawerOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: INITIAL_WELCOME_MESSAGE(propMajorName),
      created_at: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>(
    propMajorName ? DEFAULT_PROMPTS_WITH_MAJOR(propMajorName) : DEFAULT_PROMPTS_GENERAL
  );
  const [showCounselorInfo, setShowCounselorInfo] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState<number>(480);
  const isResizingRef = useRef(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - moveEvent.clientX;
      const minW = 380;
      const maxW = Math.min(920, window.innerWidth - 40);
      if (newWidth >= minW && newWidth <= maxW) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync props when changed
  useEffect(() => {
    if (propMajorCode) setCurrentMajorCode(propMajorCode);
    if (propMajorName) {
      setCurrentMajorName(propMajorName);
      setSuggestedFollowups(DEFAULT_PROMPTS_WITH_MAJOR(propMajorName));
    }
  }, [propMajorCode, propMajorName]);

  // Listen for global custom events to open chat from anywhere
  useEffect(() => {
    const handleOpenChatEvent = (e: CustomEvent<{ majorCode?: string; majorName?: string }>) => {
      if (e.detail?.majorCode) {
        setCurrentMajorCode(e.detail.majorCode);
      }
      if (e.detail?.majorName) {
        setCurrentMajorName(e.detail.majorName);
        setSuggestedFollowups(DEFAULT_PROMPTS_WITH_MAJOR(e.detail.majorName));
        // Add a prompt note if switching major
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Bạn vừa chuyển sang xem xét ngành **${e.detail.majorName}** [${e.detail.majorCode}]. Bạn muốn tôi giải thích khía cạnh nào về ngành này?`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
      setInternalIsOpen(true);
    };

    window.addEventListener('open_ai_counselor_chat', handleOpenChatEvent as EventListener);
    return () => {
      window.removeEventListener('open_ai_counselor_chat', handleOpenChatEvent as EventListener);
    };
  }, []);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isDrawerOpen) {
      scrollToBottom();
    }
  }, [messages, isDrawerOpen]);

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: INITIAL_WELCOME_MESSAGE(currentMajorName),
        created_at: new Date().toISOString(),
      },
    ]);
    setSuggestedFollowups(
      currentMajorName ? DEFAULT_PROMPTS_WITH_MAJOR(currentMajorName) : DEFAULT_PROMPTS_GENERAL
    );
  };

  // Helper to extract student test inputs if not passed directly via props
  const getResolvedInputs = () => {
    let resolvedGrades: Record<string, number> | undefined = propGrades;
    if (!resolvedGrades) {
      try {
        const raw = getScopedItem('student_grades', propUserId);
        if (raw) {
          const parsed = JSON.parse(raw);
          resolvedGrades = {
            'Toán': parsed.math || 0,
            'Vật lý': parsed.physics || 0,
            'Hóa học': parsed.chemistry || 0,
            'Sinh học': parsed.biology || 0,
            'Tin học': parsed.informatics || 0,
            'Ngữ văn': parsed.literature || 0,
            'Lịch sử': parsed.history || 0,
            'Địa lý': parsed.geography || 0,
            'Tiếng Anh': parsed.english || 0,
          };
        }
      } catch (e) {
        console.warn('Could not read student_grades from storage', e);
      }
    }

    let resolvedDiagnostics: string[] | undefined = propDiagnosticMasteredSkills;
    if (!resolvedDiagnostics) {
      resolvedDiagnostics = diagnosticService.getMasteredSkillCodes(propUserId);
    }

    let resolvedRiasec: Record<string, number> | undefined = propRiasecScores;
    if (!resolvedRiasec) {
      try {
        const raw = getScopedItem('calculated_vector', propUserId);
        if (raw) {
          resolvedRiasec = JSON.parse(raw);
        }
      } catch (e) {
        console.warn('Could not read calculated_vector from storage', e);
      }
    }

    return {
      grades: resolvedGrades,
      diagnostics: resolvedDiagnostics,
      riasec: resolvedRiasec,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    const userMsg: AIChatMessage = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    const { grades, diagnostics, riasec } = getResolvedInputs();

    // Sanitize conversation history: filter out leading greeting assistant messages
    const rawSlice = messages.slice(-6);
    const cleanHistory: AIChatMessage[] = [];
    let foundFirstUser = false;
    for (const m of rawSlice) {
      if (!foundFirstUser) {
        if (m.role === 'user') {
          foundFirstUser = true;
          cleanHistory.push(m);
        }
      } else {
        cleanHistory.push(m);
      }
    }

    try {
      const response: AIChatResponse = await aiGuidanceService.chatWithCounselor({
        message: text,
        major_code: currentMajorCode || undefined,
        history: cleanHistory,
        riasec_scores: riasec,
        grades_by_subject: grades,
        diagnostic_skills_mastered: diagnostics,
        userId: propUserId,
      });

      const assistantMsg: AIChatMessage = {
        role: 'assistant',
        content: response.reply,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.suggested_followups && response.suggested_followups.length > 0) {
        setSuggestedFollowups(response.suggested_followups);
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
      const fallbackMsg: AIChatMessage = {
        role: 'assistant',
        content:
          'Xin lỗi bạn, kết nối tới dịch vụ AI đang bận. Bạn có thể thử lại sau giây lát hoặc sử dụng các câu hỏi gợi ý bên dưới.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoToRoadmap = () => {
    if (currentMajorCode) {
      if (onNavigateToRoadmap) {
        onNavigateToRoadmap(currentMajorCode);
      } else {
        navigate(`/roadmap/${currentMajorCode}`);
      }
      handleClose();
    }
  };

  return (
    <>
      {/* Floating Action Button (Only visible when drawer is closed) */}
      {!isDrawerOpen && (
        <button
          type="button"
          onClick={() => {
            if (controlledIsOpen !== undefined && controlledOnClose) {
              // Parent manages open state
            } else {
              setInternalIsOpen(true);
            }
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
          title="Trò chuyện với Cố vấn Hướng nghiệp AI"
          aria-label="Mở Cố vấn AI"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <BrainCircuit className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
          <span className="tracking-wide">Hỏi Cố vấn AI</span>
        </button>
      )}

      {/* Slide-over Chat Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            style={{ width: `${drawerWidth}px` }}
            className="w-full max-w-full relative bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
          >
            {/* Left Edge Resize Drag Handle (Visible on PC) */}
            <div
              onMouseDown={startResizing}
              className="hidden md:flex absolute top-0 bottom-0 -left-1.5 w-3 cursor-ew-resize items-center justify-center group z-30 select-none hover:bg-blue-500/20 transition-colors"
              title="Kéo sang trái/phải để thay đổi chiều rộng khung chat"
            >
              <div className="w-1 h-12 rounded-full bg-slate-300 group-hover:bg-blue-600 transition-colors" />
            </div>

            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Cố Vấn Hướng Nghiệp AI
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCounselorInfo(!showCounselorInfo)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                        showCounselorInfo
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                      title="Bấm để xem nguyên tắc cố vấn & bảo vệ dữ liệu cá nhân"
                    >
                      !
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Xóa đoạn chat làm lại"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Đóng cửa sổ chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Merged Info Box (Triggered by the ! button) */}
            {showCounselorInfo && (
              <div className="px-5 py-3.5 bg-blue-50/80 border-b border-blue-200 text-xs text-slate-700 space-y-2 animate-in fade-in duration-150 shrink-0">
                <div className="flex items-start space-x-2">
                  <BrainCircuit className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] leading-relaxed">
                    <strong>Giải thích khoa học:</strong> Tư vấn khách quan dựa trên đối sánh 3 trụ cột (Holland RIASEC, Điểm học bạ THPT &amp; Bài test chẩn đoán logic).
                  </p>
                </div>
                <div className="flex items-start space-x-2 pt-1 border-t border-blue-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11.5px] leading-relaxed space-y-1">
                    <p>
                      <strong>Bảo vệ riêng tư (Luật 91/2025/QH15):</strong> Chỉ gửi điểm số ẩn danh, không gửi họ tên, SĐT hay trường THPT.
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Toàn bộ prompt gửi đến AI được lọc sạch hoàn toàn PII. Hệ thống chỉ phân tích các chỉ số học thuật phục vụ định hướng nghề nghiệp.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Context Banner: Active Major Context & Roadmap CTA */}
            {currentMajorName && (
              <div className="px-5 py-2.5 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2 min-w-0 pr-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shrink-0">
                    {currentMajorCode || 'NGÀNH'}
                  </span>
                  <span className="text-xs font-semibold text-blue-900 truncate">
                    {currentMajorName}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleGoToRoadmap}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-100/70 border border-blue-200 px-2 py-1 rounded-md flex items-center space-x-1 transition-colors shadow-2xs"
                    title="Tạo lộ trình tự học"
                  >
                    <Compass className="w-3 h-3 text-blue-600" />
                    <span>Lộ trình học</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentMajorCode(null);
                      setCurrentMajorName(null);
                      setSuggestedFollowups(DEFAULT_PROMPTS_GENERAL);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    title="Bỏ ngữ cảnh ngành này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}



            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start space-x-2.5'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-xs text-[13px] sm:text-sm'
                        : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div>
                        <div className="flex items-center space-x-1.5 mb-1.5 pb-1 border-b border-slate-100">
                          <span className="font-bold text-[11px] text-slate-800">Cố vấn AI CareerGuide</span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full">
                            AI Engine
                          </span>
                        </div>
                        <AIMarkdownRenderer content={msg.content} />
                      </div>
                    ) : (
                      <div className="whitespace-pre-line text-[13px] sm:text-sm">
                        {msg.content}
                      </div>
                    )}

                    {msg.created_at && (
                      <div
                        className={`text-[9px] mt-2 flex items-center justify-end space-x-1 ${
                          msg.role === 'user' ? 'text-blue-100/75' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.role === 'assistant' && (
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start items-start space-x-2.5 animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-white text-slate-700 rounded-2xl rounded-tl-xs px-4 py-3 border border-blue-200/80 shadow-2xs flex items-center space-x-2 text-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span className="font-medium text-slate-700">Cố vấn AI đang phân tích dữ liệu và suy luận...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Followup Questions (Prompt Pills) */}
            {suggestedFollowups.length > 0 && !isSending && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 shrink-0">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <span>Gợi ý câu hỏi nhanh:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedFollowups.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] text-left px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-end space-x-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    rows={2}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi Cố vấn AI về ngành học, môn cần cải thiện..."
                    className="w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow"
                    disabled={isSending}
                  />
                  <span className="absolute bottom-1.5 right-2 text-[9px] text-slate-400 pointer-events-none hidden sm:inline">
                    Enter để gửi
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
                  title="Gửi câu hỏi"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
