import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TimeLog from './pages/TimeLog';
import UserManagement from './components/UserManagement';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import theme from './theme';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

// Public Route wrapper component (redirects to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  return token && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') ? 
    <>{children}</> : 
    <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/time-log"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <TimeLog />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminRoute>
                    <MainLayout>
                      <UserManagement />
                    </MainLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <MainLayout>
                      <AdminDashboard />
                    </MainLayout>
                  </AdminRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Tasks />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Reports />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
