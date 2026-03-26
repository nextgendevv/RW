import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TeamsPage from './pages/TeamsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import './App.css';
import ProtectedLayout from './layouts/ProtectedLayout';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// Handles ?ref= param — redirect to auth page with the ref preserved
function RootRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else if (ref) {
        navigate(`/auth?ref=${ref}`, { replace: true });
      }
    }
  }, [loading, user, ref, navigate]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (user) return null;
  return <HomePage />;
}

function AuthPageWithRef() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const tab = searchParams.get('tab');
  return <AuthPage defaultRef={ref} defaultTab={tab} />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/auth" element={<AuthPageWithRef />} />
          <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="teams" element={<TeamsPage />} />
            <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
