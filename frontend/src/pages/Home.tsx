import React from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import Attendance from '../components/Attendance';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box 
      sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: { xs: 2, md: 3 }
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          px: { xs: 1, md: 2 },
          py: 2,
          fontWeight: 500
        }}
      >
        Welcome, {user?.name}!
      </Typography>
      
      <Box sx={{ flex: 1, display: 'flex' }}>
        {/* Attendance Section */}
        <Paper 
          elevation={2} 
          sx={{ 
            flex: 1,
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
            <Attendance />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Home; 