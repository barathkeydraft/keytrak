import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TimeTracker from '../components/TimeTracker';
import TimeLogTable from '../components/TimeLogTable';

const TimeLog: React.FC = () => {
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
        Time Tracking
      </Typography>
      
      <Box sx={{ flex: 1, display: 'flex' }}>
        <Grid 
          container 
          spacing={{ xs: 2, md: 3 }} 
          sx={{ height: '100%', m: 0 }}
        >
          {/* Time Tracker Section */}
          <Grid 
            item 
            xs={12} 
            lg={5}
            sx={{ 
              pl: '0 !important',
              pr: { xs: '0 !important', md: '24px !important' }
            }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
                <TimeTracker />
              </Box>
            </Paper>
          </Grid>

          {/* Time Logs Table Section */}
          <Grid 
            item 
            xs={12} 
            lg={7}
            sx={{ 
              pl: '0 !important',
              pr: { xs: '0 !important', md: '24px !important' },
              height: '100%',
              display: 'flex'
            }}
          >
            <Paper 
              elevation={2} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                p: { xs: 2, md: 3 }, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <TimeLogTable />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TimeLog; 