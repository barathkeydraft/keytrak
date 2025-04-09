import axios from 'axios';

// Set base URL for all requests
axios.defaults.baseURL = 'http://localhost:3001';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem('token');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        // Use history.push instead of window.location for smoother navigation
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios; 