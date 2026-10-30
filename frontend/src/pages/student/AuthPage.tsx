import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConsentModal } from '../../components/common/ConsentModal';

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
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(true);

  // Google Login States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  if (isAuthenticated) {
    navigate(redirectTarget);
  }

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

  // Handle Google Login Execution
  const handleExecuteGoogleLogin = async (gEmail: string, gName?: string) => {
    if (!gEmail) {
      setErrorMsg('Vui lòng nhập tài khoản Google.');
      return;
    }
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      await googleLogin({
        email: gEmail,
        full_name: gName || gEmail.split('@')[0],
      });
      setShowGoogleModal(false);
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

        {/* Google One-Click Login Button */}
        <button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          disabled={loading || googleLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-60"
        >
          {/* Official Google Logo */}
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
          <span>{googleLoading ? 'Đang kết nối Google...' : 'Đăng nhập bằng Google'}</span>
        </button>

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

      {/* Google Account Sign-In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <h3 className="text-base font-bold text-slate-900">Đăng Nhập với Google</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Chọn tài khoản Google của bạn để tự động đồng bộ hóa hồ sơ học sinh và bảo mật theo chuẩn Luật 91/2025/QH15.
            </p>

            {/* Quick-Pick Suggested Accounts */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleExecuteGoogleLogin('hocsinh.genz@gmail.com', 'Nguyễn Văn Tuấn')}
                disabled={googleLoading}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    T
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Nguyễn Văn Tuấn</p>
                    <p className="text-[11px] text-slate-500 font-mono">hocsinh.genz@gmail.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleExecuteGoogleLogin('hocsinh.cmu@gmail.com', 'Nguyễn Minh Quân')}
                disabled={googleLoading}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    Q
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Nguyễn Minh Quân</p>
                    <p className="text-[11px] text-slate-500 font-mono">hocsinh.cmu@gmail.com</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
              </button>
            </div>

            {/* Or custom Google account input */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-600 block">Hoặc sử dụng tài khoản Gmail khác:</span>
              <input
                type="email"
                placeholder="tenhocsinh@gmail.com"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Họ và tên học sinh (tùy chọn)"
                value={customGoogleName}
                onChange={(e) => setCustomGoogleName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                type="button"
                disabled={googleLoading || !customGoogleEmail.trim()}
                onClick={() => handleExecuteGoogleLogin(customGoogleEmail.trim(), customGoogleName.trim())}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {googleLoading ? 'Đang xác thực Google...' : 'Đăng nhập với Gmail này'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
      />
    </div>
  );
};
