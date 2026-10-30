import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AssessmentProvider } from './context/AssessmentContext';

// Student Layout Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AICounselorChatDrawer } from './components/ai/AICounselorChatDrawer';

// Student & Parent Portal Pages
import { LandingPage } from './pages/student/LandingPage';
import { AuthPage } from './pages/student/AuthPage';
import { GoogleCallbackPage } from './pages/student/GoogleCallbackPage';
import { GuidanceHubPage } from './pages/student/GuidanceHubPage';
import { AssessmentPage } from './pages/student/AssessmentPage';
import { TranscriptPage } from './pages/student/TranscriptPage';
import { RecommendationPage } from './pages/student/RecommendationPage';
import { TaxonomyPage } from './pages/student/TaxonomyPage';
import { RoadmapsHubPage } from './pages/student/RoadmapsHubPage';
import { RoadmapDetailPage } from './pages/student/RoadmapDetailPage';

// Admin Dedicated Layout & Pages
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminIngestionPage } from './pages/admin/AdminIngestionPage';
import { AdminStagingReviewPage } from './pages/admin/AdminStagingReviewPage';
import { AdminMajorsManagementPage } from './pages/admin/AdminMajorsManagementPage';

/**
 * Route Guard ensuring user is authenticated before accessing tests or dashboards.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly,
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login preserving the target route
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/recommendations" replace />;
  }

  return <>{children}</>;
};

/**
 * Student Layout: Navbar with XP/Streak, EdTech Student views, and Footer
 */
const StudentLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {isAuthenticated && <AICounselorChatDrawer userId={user?.id} />}
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* ============================================================== */}
      {/* 1. STUDENT & GENERAL PUBLIC PORTAL (StudentLayout)             */}
      {/* ============================================================== */}
      <Route element={<StudentLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/login/callback" element={<GoogleCallbackPage />} />
        <Route path="/taxonomy" element={<TaxonomyPage />} />

        {/* Unified Career Guidance Hub (Trắc nghiệm + Điểm học bạ + Đề xuất ngành) */}
        <Route
          path="/guidance"
          element={
            <ProtectedRoute>
              <GuidanceHubPage />
            </ProtectedRoute>
          }
        />

        {/* Backward-compatible redirects to Unified Guidance Hub */}
        <Route path="/assessment" element={<Navigate to="/guidance?tab=riasec" replace />} />
        <Route path="/academic-transcript" element={<Navigate to="/guidance?tab=transcript" replace />} />
        <Route path="/recommendations" element={<Navigate to="/guidance?tab=recommendation" replace />} />
        <Route path="/diagnostic" element={<Navigate to="/guidance?tab=diagnostic" replace />} />

        {/* Student Roadmaps Management (Saved history & New selections) */}
        <Route
          path="/roadmaps"
          element={
            <ProtectedRoute>
              <RoadmapsHubPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/roadmap/:major_code"
          element={
            <ProtectedRoute>
              <RoadmapDetailPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ============================================================== */}
      {/* 2. DEDICATED ADMIN PORTAL (AdminLayout - Strictly Isolated)   */}
      {/* ============================================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="ingest" element={<AdminIngestionPage />} />
        <Route path="staging" element={<AdminStagingReviewPage />} />
        <Route path="majors" element={<AdminMajorsManagementPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1 hour
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AssessmentProvider>
            <AppContent />
          </AssessmentProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
