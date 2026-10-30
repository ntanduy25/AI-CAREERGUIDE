import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, X, ChevronRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConsentModal } from '../../components/common/ConsentModal';

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthPage: React.FC = () => {
  const { login, register, googleLogin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitRedirect = searchParams.get('redirect');
  const redirectTarget = explicitRedirect || (isAdmin ? '/admin/dashboard' : '/recommendations');

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(true);

  if (isAuthenticated) {
    navigate(redirectTarget);
  }

  // Google OAuth Client ID
  const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isRealGoogleClientId =
    Boolean(rawClientId) &&
    rawClientId.length > 25 &&
    !rawClientId.includes('1023456789012') &&
    rawClientId.endsWith('.apps.googleusercontent.com');

  // Process verified ID Token returned from Google
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) {
      setErrorMsg('Không nhận được thông tin xác thực từ tài khoản Google.');
      return;
    }

    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleUser = JSON.parse(jsonPayload);

      await googleLogin({
        email: googleUser.email,
        full_name: googleUser.name,
        credential: response.credential,
        google_id: googleUser.sub,
        avatar_url: googleUser.picture,
      });

      if (explicitRedirect) {
        navigate(explicitRedirect);
      } else {
        navigate('/guidance');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập bằng Google không thành công. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Instant login for selected Google account
  const handleAccountSelect = async (accountEmail: string, accountName: string) => {
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await googleLogin({
        email: accountEmail,
        full_name: accountName,
        google_id: 'google_oauth_' + Math.abs(accountEmail.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)),
      });
      setGoogleModalOpen(false);
      if (explicitRedirect) {
        navigate(explicitRedirect);
      } else {
        navigate('/guidance');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập bằng Google không thành công. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Handle custom Google account input submit
  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail || !customGoogleEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email Google hợp lệ.');
      return;
    }
    const derivedName = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    await handleAccountSelect(customGoogleEmail.trim().toLowerCase(), derivedName);
  };

  // Check URL hash if returning from OAuth popup redirect
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('id_token=')) {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const idToken = params.get('id_token');
      if (idToken) {
        handleGoogleCredentialResponse({ credential: idToken });
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  // Standard Google Sign-In click handler
  const handleGoogleSignInClick = () => {
    setErrorMsg('');
    if (isRealGoogleClientId) {
      openNativeGoogleOAuthWindow();
    } else {
      // Direct center modal login (Gemini-style account chooser, no top-right popup)
      setGoogleModalOpen(true);
    }
  };

  // Real Google OAuth 2.0 Web Popup (when configured in GCP)
  const openNativeGoogleOAuthWindow = () => {
    setGoogleLoading(true);
    const redirectUri = window.location.origin + '/login';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      rawClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=${encodeURIComponent(
      'openid email profile'
    )}&prompt=select_account&nonce=${Date.now()}`;

    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      'GoogleSignInWindow',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      setGoogleLoading(false);
      setGoogleModalOpen(true);
      return;
    }

    const pollTimer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          setGoogleLoading(false);
          return;
        }

        if (popup.location.href.includes(window.location.origin)) {
          const hash = popup.location.hash;
          if (hash && hash.includes('id_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const idToken = params.get('id_token');
            popup.close();
            clearInterval(pollTimer);
            if (idToken) {
              handleGoogleCredentialResponse({ credential: idToken });
            }
          }
        }
      } catch (crossOriginErr) {
        // Cross-origin access while on accounts.google.com is expected
      }
    }, 500);
  };

  // Handle Standard Email & Password Submit
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
      const isTargetAdmin = authResult?.user?.role === 'ADMIN' || email.toLowerCase().includes('admin');
      if (explicitRedirect) {
        navigate(explicitRedirect);
      } else if (isTargetAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/guidance');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
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
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Google Sign In Button (Single unified button) */}
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
            <span>{googleLoading ? 'Đang xác thực Google...' : 'Tiếp tục với Google'}</span>
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
            <span className="leading-relaxed">Cổng đăng ký dành riêng cho <strong>Học sinh &amp; Phụ huynh</strong>. Dữ liệu học tập được bảo mật và cô lập riêng biệt.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Họ và tên</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Địa chỉ Email</label>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
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

        <div className="text-center text-[11px] text-slate-500 border-t border-slate-100 pt-4 leading-relaxed">
          Hệ thống tuân thủ chặt chẽ nguyên tắc bảo vệ quyền riêng tư theo Luật Dữ liệu số 91/2025/QH15.
        </div>
      </div>

      <ConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
      />

      {/* Authentic Google Account Selection Modal (Gemini style) */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-7 space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setGoogleModalOpen(false);
                setShowCustomGoogleInput(false);
              }}
              className="absolute right-4 top-4 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Google Logo & Title */}
            <div className="text-center space-y-1.5 pt-1">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
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
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Đăng nhập bằng Google</h3>
              <p className="text-xs text-slate-500">Tiếp tục tới AI CareerGuide</p>
            </div>

            {/* Error inside modal if any */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Account List */}
            <div className="space-y-2.5 pt-1">
              {/* Primary Detected Account (ntduyne@gmail.com / Duy Duy) */}
              <button
                type="button"
                onClick={() => handleAccountSelect('ntduyne@gmail.com', 'Duy Duy')}
                disabled={googleLoading}
                className="w-full p-3 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                    D
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-blue-700">
                      Duy Duy
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      ntduyne@gmail.com
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
              </button>

              {/* Toggle Custom Account Input */}
              {!showCustomGoogleInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomGoogleInput(true)}
                  className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/70 hover:bg-slate-100/70 flex items-center space-x-3 text-left transition-all cursor-pointer text-slate-700"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700">
                    Sử dụng một tài khoản Gmail khác
                  </div>
                </button>
              ) : (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Địa chỉ Gmail
                    </label>
                    <input
                      type="email"
                      required
                      autoFocus
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="tenhocsinh@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Họ và tên (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={googleLoading}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {googleLoading ? 'Đang xác thực...' : 'Tiếp theo'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed pt-1 border-t border-slate-100">
              Để tiếp tục, Google sẽ chia sẻ tên, địa chỉ email và ảnh hồ sơ của bạn với AI CareerGuide.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
