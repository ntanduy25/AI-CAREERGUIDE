import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConsentModal } from '../../components/common/ConsentModal';

export const AuthPage: React.FC = () => {
  const { login, register, isAuthenticated, isAdmin } = useAuth();
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

  if (isAuthenticated) {
    navigate(redirectTarget);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ địa chỉ email và mật khẩu.');
      return;
    }

    if (isRegister) {
      if (email.toLowerCase().includes('admin')) {
        setErrorMsg('Không được phép đăng ký tài khoản Quản trị viên (ADMIN) qua cổng đăng ký công khai.');
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

  // Quick Demo credentials helper for Login mode
  const fillDemoAccount = (selectedRole: 'STUDENT' | 'ADMIN') => {
    setIsRegister(false);
    setErrorMsg('');
    if (selectedRole === 'ADMIN') {
      setEmail('admin@careerguide.vn');
      setPassword('AdminSecret@2026');
      setFullName('Quản Trị Viên Kiểm Duyệt');
    } else {
      setEmail('hocsinh.genz@gmail.com');
      setPassword('StudentSecret@2026');
      setFullName('Nguyễn Văn Tuấn');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-lg p-8 shadow-sm border border-slate-200 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isRegister ? 'Tạo Tài Khoản Học Sinh' : 'Đăng Nhập Hệ Thống'}
          </h2>
          <p className="text-xs text-slate-500">
            Bảo mật Argon2id chuẩn OWASP ASVS Level 2
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-md bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${
              !isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${
              isRegister ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {/* Demo Account Buttons (Only in Login mode) */}
        {!isRegister ? (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 block">Tài khoản thử nghiệm nhanh:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('STUDENT')}
                className="py-2 px-3 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium text-center transition-colors"
              >
                Học sinh mẫu
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('ADMIN')}
                className="py-2 px-3 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium text-center transition-colors"
              >
                Quản trị viên mẫu
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>Cổng đăng ký dành riêng cho <strong>Học sinh & Phụ huynh</strong>. Dữ liệu mỗi tài khoản được cô lập và bảo mật riêng biệt.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Họ và tên</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hocsinh@thpt.edu.vn"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
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
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="policy">
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
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
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

        <div className="text-center text-[11px] text-slate-500 border-t border-slate-100 pt-4">
          Hệ thống tuân thủ chặt chẽ nguyên tắc bảo vệ quyền riêng tư theo Luật Dữ liệu số 91/2025/QH15.
        </div>
      </div>

      <ConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
      />
    </div>
  );
};
