import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TimeTracker from '../components/TimeTracker';
import TimeLogTable from '../components/TimeLogTable';
import TaskCreate from '../components/TaskCreate';

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            KeyDraft
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom>
                Welcome, {user?.name}!
              </Typography>
              <Typography variant="body1" paragraph>
                Track your work time and manage your tasks efficiently.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Your Profile Information:
                </Typography>
                <Typography>
                  <strong>Email:</strong> {user?.email}
                </Typography>
                <Typography>
                  <strong>Role:</strong> {user?.role}
                </Typography>
              </Box>
            </Paper>
          </Grid>
          {user?.role === 'ADMIN' && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <TaskCreate />
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={6}>
            <TimeTracker />
          </Grid>
          <Grid item xs={12} md={6}>
            <TimeLogTable />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 