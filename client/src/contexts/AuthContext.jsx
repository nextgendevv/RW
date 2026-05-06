import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Initialize sessions
  useEffect(() => {
    // 1. Regular User Session
    const token = localStorage.getItem('token');
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    // 2. Admin Session
    const adminToken = localStorage.getItem('admin_token');
    const loadAdmin = async () => {
      if (adminToken) {
        try {
          const response = await api.get('/auth/me', {
            headers: { 'X-Auth-Token-Key': 'admin_token' }
          });
          // Verify it is actually an admin
          if (response.data.role === 'admin') {
            setAdminUser(response.data);
          } else {
            localStorage.removeItem('admin_token');
            setAdminUser(null);
          }
        } catch (err) {
          localStorage.removeItem('admin_token');
          setAdminUser(null);
        }
      }
      setAdminLoading(false);
    };

    loadUser();
    loadAdmin();
  }, []);

  // User Login
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    
    let userData = response.data.user;
    if (!userData) {
      const userRes = await api.get('/auth/me');
      userData = userRes.data;
    }
    
    setUser(userData);
    return userData;
  };

  // Admin Login
  const adminLogin = async (email, password) => {
    // Same endpoint, different storage
    const response = await api.post('/auth/login', { email, password });
    
    // Verify role before setting admin session
    let userData = response.data.user;
    if (!userData) {
      const userRes = await api.get('/auth/me', {
        headers: { 'X-Auth-Token-Key': 'override_manual' }, // Temporarily send token in body? No, login returns it
        // Actually, we need to send the NEW token for /auth/me
      });
      // This is tricky because api.js doesn't know about the new token yet.
      // But /login response ALREADY has the user usually.
    }
    
    // Re-fetch with the new token to be sure
    const adminToken = response.data.token;
    const userRes = await api.get('/auth/me', {
      headers: { 
        'Authorization': `Bearer ${adminToken}` // Manually override for this check
      }
    });
    
    userData = userRes.data;

    if (userData.role !== 'admin') {
      throw new Error('Unauthorized: This account does not have admin privileges.');
    }

    localStorage.setItem('admin_token', adminToken);
    setAdminUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    
    let data = response.data.user;
    if (!data) {
      const userRes = await api.get('/auth/me');
      data = userRes.data;
    }
    
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const adminLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminUser(null);
  };

  const updateProfile = async (formData) => {
    const response = await api.put('/auth/me', formData);
    setUser(response.data);
  };

  const value = { 
    user, loading, login, register, logout, updateProfile,
    adminUser, adminLoading, adminLogin, adminLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}