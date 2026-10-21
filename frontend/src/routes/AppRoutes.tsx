import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from '../components/Layout'
import { AdminIngestionPage } from '../pages/AdminIngestionPage'
import { HomePage } from '../pages/HomePage'
import { StudentJourneyPage } from '../pages/StudentJourneyPage'

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const token = localStorage.getItem('ai-careerguide-token')
  if (!token) {
    return <Navigate to="/" replace />
  }
  return children
}

export const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/journey" element={<StudentJourneyPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminIngestionPage />
          </ProtectedRoute>
        }
      />
    </Route>
  </Routes>
)
