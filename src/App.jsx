import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

// Handles ?ref= param — redirect to auth page with the ref preserved
function RootRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate('/profile', { replace: true });
      } else if (ref) {
        navigate(`/auth?ref=${ref}`, { replace: true });
      }
    }
  }, [loading, user, ref, navigate]);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (user) return null;
  return <AuthPage />;
}

function AuthPageWithRef() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  return <AuthPage defaultRef={ref} />;
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
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
