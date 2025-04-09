import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../config/axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to set up axios with the token
  const setupAxiosAuth = (token: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Function to clear axios auth
  const clearAxiosAuth = () => {
    delete axios.defaults.headers.common['Authorization'];
  };

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      const userData = response.data;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        
        if (savedToken) {
          // Set token in state and axios
          setToken(savedToken);
          setupAxiosAuth(savedToken);
          
          // Verify token by fetching user data
          await fetchUserData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // If there's an error (like invalid/expired token), clear the auth state
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        clearAxiosAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { token: newToken, user: userData } = response.data;
      
      // Save to state
      setToken(newToken);
      setUser(userData);
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      
      // Set up axios auth
      setupAxiosAuth(newToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/register', {
        email,
        password,
        name,
      });

      const { token: newToken, user: userData } = response.data;
      
      // Save to state
      setToken(newToken);
      setUser(userData);
      
      // Save token to localStorage
      localStorage.setItem('token', newToken);
      
      // Set up axios auth
      setupAxiosAuth(newToken);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      clearAxiosAuth();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 