import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(config => {
  let tokenKey = 'token';
  if (config.url.includes('/admin')) {
    tokenKey = 'admin_token';
  } else if (config.headers['X-Auth-Token-Key']) {
    tokenKey = config.headers['X-Auth-Token-Key'];
    delete config.headers['X-Auth-Token-Key'];
  }
  
  const token = localStorage.getItem(tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
