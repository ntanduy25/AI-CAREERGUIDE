import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  GraduationCap,
  BrainCircuit,
  MapPin,
  Shield,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfileModal } from '../profile/StudentProfileModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'privacy'>('profile');

  const navLinks = [
    { name: 'Tổng quan', path: '/', icon: BookOpen, public: true },
    { name: 'Định hướng & Đề xuất', path: '/guidance', icon: BrainCircuit, public: false },
    { name: 'Danh mục 108 ngành', path: '/taxonomy', icon: Compass, public: true },
    { name: 'Lộ trình phát triển', path: '/roadmaps', icon: MapPin, public: false },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/guidance') {
      return (
        location.pathname.startsWith('/guidance') ||
        location.pathname === '/assessment' ||
        location.pathname === '/academic-transcript' ||
        location.pathname === '/recommendations'
      );
    }
    if (path === '/roadmaps') {
      return location.pathname.startsWith('/roadmaps') || location.pathname.startsWith('/roadmap/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                AI CareerGuide
              </span>

            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              const targetPath =
                !isAuthenticated && !link.public
                  ? `/login?redirect=${encodeURIComponent(link.path)}`
                  : link.path;

              return (
                <Link
                  key={link.path}
                  to={targetPath}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'text-blue-700 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors ml-2"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Quản trị HITL</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  title={user?.full_name || user?.email}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                    {user?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block pr-0.5">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {user?.full_name || 'Học sinh'}
                    </p>
                    <span className="inline-block text-[10px] text-slate-500 font-medium leading-none">
                      {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Học sinh THPT'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user?.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {user?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileModalTab('profile');
                          setProfileModalOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Thông tin học sinh & Trường học</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileModalTab('privacy');
                          setProfileModalOpen(true);
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors"
                      >
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <span>Bảo vệ dữ liệu cá nhân (Luật 91)</span>
                      </button>
                    </div>

                    {isAdmin && (
                      <div className="border-t border-slate-100 py-1">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>Bảng điều khiển Quản trị</span>
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login?mode=register"
                  className="px-3.5 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            const targetPath =
              !isAuthenticated && !link.public
                ? `/login?redirect=${encodeURIComponent(link.path)}`
                : link.path;

            return (
              <Link
                key={link.path}
                to={targetPath}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-semibold text-slate-800 bg-slate-100"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Quản trị HITL</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200 mt-2">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-3 py-2 bg-slate-50 rounded-md mb-2">
                  <p className="text-xs font-semibold text-slate-800">{user?.full_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setProfileModalTab('profile');
                    setProfileModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Hồ sơ học sinh</span>
                </button>
                <button
                  onClick={() => {
                    setProfileModalTab('privacy');
                    setProfileModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-md text-left"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Bảo vệ dữ liệu cá nhân</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-md text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-md"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login?mode=register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
                >
                  Đăng ký tài khoản
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile & Privacy Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
      />
    </header>
  );
};
