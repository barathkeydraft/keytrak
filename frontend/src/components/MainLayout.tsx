import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Button,
  Divider,
  Avatar,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccessTime,
  People,
  Assignment,
  ExitToApp,
  Assessment,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

const drawerWidth = 280;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Time Log', icon: <AccessTime />, path: '/time-log' },
    { text: 'Tasks', icon: <Assignment />, path: '/tasks' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
  ];

  const adminMenuItems = [
    { text: 'User Management', icon: <People />, path: '/users' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          px: 2,
          py: 1,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          minHeight: '64px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Logo variant="dark" />
        </Box>
      </Toolbar>
      
      <Divider />
      
      {/* User Profile Section */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Avatar 
          sx={{ 
            width: 48, 
            height: 48, 
            margin: '0 auto',
            bgcolor: theme.palette.primary.main,
            mb: 1
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="subtitle2" fontWeight="medium">
          {user?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.role}
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              px: 2,
              minHeight: 48,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                },
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40,
                color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
        <>
          <Divider sx={{ mx: 2 }} />
          <List sx={{ px: 2, py: 1 }}>
            {adminMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: 2,
                  minHeight: 48,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Logout">
              <IconButton 
                color="error" 
                onClick={handleLogout}
                sx={{ mr: 1 }}
              >
                <ExitToApp />
              </IconButton>
            </Tooltip>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                bgcolor: theme.palette.primary.main,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          pt: '64px',
          px: 3,
          py: 3,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 