import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Shield,
  HelpCircle,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConsentModal } from '../../components/common/ConsentModal';

export const AuthPage: React.FC = () => {
  const { login, register, googleLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(true);

  // Google Modal state for custom Gmail input when OAuth Client ID is not configured
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [customGmail, setCustomGmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleModalError, setGoogleModalError] = useState('');
  const [showOAuthHelp, setShowOAuthHelp] = useState(false);

  // Safely redirect authenticated users inside useEffect to prevent React render-phase navigation
  useEffect(() => {
    if (isAuthenticated) {
      if (explicitRedirect) {
        navigate(explicitRedirect, { replace: true });
      } else if (isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/guidance', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, explicitRedirect, navigate]);

  // Google OAuth 2.0 Client Configuration
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const redirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    `${window.location.origin}/login/callback`;

  /**
   * Google Sign-In Action:
   * - If real VITE_GOOGLE_CLIENT_ID is provided: Redirects to accounts.google.com
   * - If not provided: Opens a clean Google input modal allowing any Gmail account to authenticate
   */
  const handleGoogleSignInClick = () => {
    setErrorMsg('');

    // Check if real Google OAuth 2.0 client ID is provided
    const isRealOAuthClient =
      Boolean(googleClientId) &&
      !googleClientId.includes('your-google-client-id') &&
      !googleClientId.startsWith('mock_');

    if (isRealOAuthClient) {
      setGoogleLoading(true);
      const oauthEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
      const params = new URLSearchParams({
        client_id: googleClientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'select_account',
        access_type: 'offline',
      });
      window.location.href = `${oauthEndpoint}?${params.toString()}`;
      return;
    }

    // Otherwise, open the un-hardcoded Google Sign-In modal
    setGoogleModalOpen(true);
  };

  /**
   * Handle Login via Custom Gmail Modal
   */
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleModalError('');

    const trimmedEmail = customGmail.trim();
    if (!trimmedEmail) {
      setGoogleModalError('Vui lòng nhập địa chỉ Gmail của bạn.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setGoogleModalError('Địa chỉ email không đúng định dạng.');
      return;
    }

    setGoogleLoading(true);
    try {
      await googleLogin({
        email: trimmedEmail,
        full_name: customGoogleName.trim() || trimmedEmail.split('@')[0],
      });
      setGoogleModalOpen(false);
      navigate(explicitRedirect || '/guidance', { replace: true });
    } catch (err: any) {
      setGoogleModalError(err.message || 'Không thể đăng nhập bằng tài khoản Google này.');
    } finally {
      setGoogleLoading(false);
    }
  };

  /**
   * Standard Email & Password Submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ email và mật khẩu.');
      return;
    }

    if (isRegister) {
      if (email.toLowerCase().includes('admin')) {
        setErrorMsg('Không được phép đăng ký tài khoản Quản trị viên qua cổng đăng ký công khai.');
        return;
      }
      if (!agreedPolicy) {
        setErrorMsg('Bạn cần đồng ý với chính sách bảo vệ dữ liệu cá nhân (Luật 91/2025/QH15).');
        return;
      }
    }

    setLoading(true);
    try {
      let authResult;
      if (isRegister) {
        authResult = await register(email, password, fullName);
      } else {
        authResult = await login(email, password);
      }

      const isTargetAdmin =
        authResult?.user?.role === 'ADMIN' ||
        email.toLowerCase().includes('admin');

      if (explicitRedirect) {
        navigate(explicitRedirect, { replace: true });
      } else if (isTargetAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/guidance', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 1-Click Fast Admin Fill & Login
   */
  const handleQuickAdminLogin = async () => {
    setErrorMsg('');
    setEmail('admin@careerguide.vn');
    setPassword('AdminSecret@2026');
    setLoading(true);
    try {
      const res = await login('admin@careerguide.vn', 'AdminSecret@2026');
      if (res?.user?.role === 'ADMIN' || res?.access_token) {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập admin không thành công.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl p-7 sm:p-8 shadow-sm border border-slate-200/90 space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Tạo Tài Khoản Học Sinh' : 'Đăng Nhập Hệ Thống'}
          </h2>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Đăng ký để lưu kết quả định hướng và lộ trình học tập'
              : 'Đăng nhập để xem kết quả định hướng nghề nghiệp của bạn'}
          </p>
        </div>

        {/* Tabs: Đăng Nhập / Đăng Ký */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Google OAuth Action Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {googleLoading
                ? 'Đang kết nối Google...'
                : 'Tiếp tục với Google'}
            </span>
          </button>
        </div>

        {/* Separator Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/90"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium text-[11px]">
              Hoặc với email mật khẩu
            </span>
          </div>
        </div>

        {isRegister && (
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Cổng đăng ký dành riêng cho <strong>Học sinh &amp; Phụ huynh</strong>. Dữ liệu học tập được bảo mật và cô lập riêng biệt.
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Standard Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Họ và tên học sinh
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hocsinh@thpt.edu.vn"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          {isRegister && (
            <div className="pt-1">
              <div className="flex items-start space-x-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="policy"
                  checked={agreedPolicy}
                  onChange={(e) => setAgreedPolicy(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="policy" className="cursor-pointer leading-relaxed">
                  Tôi đồng ý với{' '}
                  <button
                    type="button"
                    onClick={() => setConsentModalOpen(true)}
                    className="text-blue-600 font-semibold underline hover:text-blue-800"
                  >
                    Chính sách bảo vệ dữ liệu cá nhân (Luật 91/2025/QH15)
                  </button>.
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <span>{isRegister ? 'Tạo Tài Khoản Mới' : 'Đăng Nhập'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Admin Quick Credentials & 1-Click Login Card */}
        {!isRegister && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-400">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Tài Khoản Quản Trị Viên (Admin HITL)</span>
              </div>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Quản trị viên
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-300 space-y-0.5 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
              <div>Email: <span className="text-emerald-400 font-semibold">admin@careerguide.vn</span></div>
              <div>Mật khẩu: <span className="text-amber-400 font-semibold">AdminSecret@2026</span></div>
            </div>

            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={loading || googleLoading}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <span>Điền &amp; Đăng Nhập Quản Trị Viên Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-500 border-t border-slate-100 pt-4 leading-relaxed">
          Hệ thống tuân thủ chặt chẽ nguyên tắc bảo vệ quyền riêng tư theo Luật Dữ liệu số 91/2025/QH15.
        </div>
      </div>

      {/* Clean Un-hardcoded Google Sign-In Modal (when VITE_GOOGLE_CLIENT_ID is not configured) */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h3 className="text-base font-bold text-slate-900">
                  Đăng Nhập với Tài Khoản Google
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGoogleModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nhập tài khoản Gmail của bạn để tự động tạo phiên học sinh và đồng bộ hồ sơ kết quả định hướng học tập.
            </p>

            {googleModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{googleModalError}</span>
              </div>
            )}

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Gmail của bạn
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={customGmail}
                    onChange={(e) => setCustomGmail(e.target.value)}
                    placeholder="tenhocsinh@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên học sinh (tùy chọn)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-60 flex items-center justify-center space-x-1.5"
                >
                  <span>{googleLoading ? 'Đang kết nối...' : 'Tiếp tục với Gmail này'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Developer note for official Google Cloud OAuth setup */}
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowOAuthHelp(!showOAuthHelp)}
                className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer text-left"
              >
                <span className="flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cách kích hoạt Google OAuth 2.0 chính thức trên Cloud</span>
                </span>
                <span className="font-mono text-[10px]">{showOAuthHelp ? '▲ Đóng' : '▼ Xem'}</span>
              </button>

              {showOAuthHelp && (
                <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    Để kích hoạt điều hướng trực tiếp sang Google Accounts:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-500">
                    <li>Vào Google Cloud Console &gt; API &amp; Services &gt; Credentials</li>
                    <li>Tạo OAuth 2.0 Client ID loại Web Application</li>
                    <li>Thêm Authorized Redirect URI: <code className="bg-slate-200 px-1 rounded text-slate-800">{redirectUri}</code></li>
                    <li>Thêm biến môi trường <code className="bg-slate-200 px-1 rounded text-slate-800">VITE_GOOGLE_CLIENT_ID</code> vào Vercel</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Law 91/2025/QH15 Privacy Consent Modal */}
      <ConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
      />
    </div>
  );
};
export default AuthPage;
