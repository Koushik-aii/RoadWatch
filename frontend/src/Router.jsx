import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App';
<<<<<<< Updated upstream
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
=======
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthorityLoginPage from './pages/AuthorityLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalyticsDashboard from './pages/AdminAnalyticsDashboard';
import OfficerDashboardNew from './pages/OfficerDashboardNew';
import AuthorityDashboard from './pages/AuthorityDashboard';
>>>>>>> Stashed changes
import { ROLES } from './context/AuthContext';

export default function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
<<<<<<< Updated upstream
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
=======
          {/* Public pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/authority-login" element={<AuthorityLoginPage />} />

          {/* Citizen app shell */}
          <Route
            path="/app"
>>>>>>> Stashed changes
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
<<<<<<< Updated upstream
=======

          {/* Admin dashboards */}
>>>>>>> Stashed changes
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
<<<<<<< Updated upstream
          <Route
            path="/officer"
            element={
              <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
=======
          
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute roles={[ROLES.ADMIN]}>
                <AdminAnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Officer Dashboard (New) */}
          <Route
            path="/officer-dashboard"
            element={
              <ProtectedRoute roles={[ROLES.OFFICER, ROLES.ADMIN]}>
                <OfficerDashboardNew />
              </ProtectedRoute>
            }
          />

          {/* Legacy redirects */}
          <Route path="/authority" element={<Navigate to="/officer-dashboard" replace />} />
          <Route path="/officer" element={<Navigate to="/officer-dashboard" replace />} />

>>>>>>> Stashed changes
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
