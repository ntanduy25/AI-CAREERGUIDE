import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  LayoutDashboard,
  UploadCloud,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Tổng Quan Hệ Thống',
      icon: LayoutDashboard,
      badge: 'Real-time',
    },
    {
      to: '/admin/ingest',
      label: 'Quét & Nạp Thông Tư PDF',
      icon: UploadCloud,
      badge: 'Luồng A & B',
    },
    {
      to: '/admin/staging',
      label: 'Kiểm Duyệt Staging (HITL)',
      icon: ShieldCheck,
      badge: 'DF05',
    },
    {
      to: '/admin/majors',
      label: 'Danh Mục Ngành Cấp IV',
      icon: BookOpen,
      badge: 'TT 09/2022',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white">
                  CareerGuide
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Governance & Dual RAG</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Quản Lý & Vận Hành
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-6 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Cổng Học Sinh
          </div>

          <Link
            to="/recommendations"
            className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Giao Diện Học Sinh</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>

        {/* Admin User Profile Bottom */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-semibold text-xs shrink-0">
                AD
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.full_name || 'Quản Trị Viên'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {user?.email || 'admin@careerguide.vn'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Navbar */}
        <header className="h-14 px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium">Bảng Điều Khiển Quản Trị Hệ Thống</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>FastAPI & Vector RAG: ONLINE</span>
            </div>

            <Link
              to="/recommendations"
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Portal Học Sinh</span>
            </Link>
          </div>
        </header>

        {/* Nested Page View */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
