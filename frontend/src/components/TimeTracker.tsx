import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Stack, Chip } from '@mui/material';
import axios from '../config/axios';
import TaskSelect from './TaskSelect';

interface TimeSession {
  startTime: Date | null;
  endTime: Date | null;
  type: 'WORK' | 'BREAK';
  taskId?: string;
}

interface TimeLog {
  id: string;
  startTime: string;
  endTime: string | null;
  type: 'WORK' | 'BREAK';
  taskId?: string;
}

const TimeTracker: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<TimeSession>({
    startTime: null,
    endTime: null,
    type: 'WORK'
  });
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [dailyTotal, setDailyTotal] = useState<string>('00:00:00');

  // Check for active session on component mount
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const response = await axios.get('/api/time-logs/current');
        if (response.data) {
          setIsTracking(true);
          setCurrentSession({
            startTime: new Date(response.data.startTime),
            endTime: null,
            type: response.data.type,
            taskId: response.data.taskId
          });
          if (response.data.taskId) {
            setSelectedTaskId(response.data.taskId);
          }
        }
      } catch (error) {
        console.error('Error checking active session:', error);
      }
    };

    checkActiveSession();
    calculateDailyTotal();
  }, []);

  const calculateDailyTotal = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await axios.get('/api/time-logs/daily');
      const logs: TimeLog[] = response.data;
      
      let totalMilliseconds = 0;
      logs.forEach(log => {
        if (log.type === 'WORK' && log.endTime) {
          const start = new Date(log.startTime).getTime();
          const end = new Date(log.endTime).getTime();
          totalMilliseconds += end - start;
        }
      });

      const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((totalMilliseconds % (1000 * 60)) / 1000);

      setDailyTotal(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    } catch (error) {
      console.error('Error calculating daily total:', error);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTracking && currentSession.startTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - currentSession.startTime!.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, currentSession.startTime]);

  const handleStartTimer = async (type: 'WORK' | 'BREAK') => {
    try {
      const payload = {
        type,
        ...(type === 'WORK' && selectedTaskId && { taskId: selectedTaskId })
      };
      
      const response = await axios.post('/api/time-logs/start', payload);
      const startTime = new Date(response.data.startTime);
      setIsTracking(true);
      setCurrentSession({
        startTime,
        endTime: null,
        type,
        taskId: response.data.taskId
      });
    } catch (error) {
      console.error('Failed to start timer:', error);
      alert('Failed to start timer. Please try again.');
    }
  };

  const handleStopTimer = async () => {
    try {
      const response = await axios.post('/api/time-logs/stop');
      const endTime = new Date(response.data.endTime);
      setIsTracking(false);
      setCurrentSession((prev) => ({
        ...prev,
        endTime,
      }));
      setElapsedTime('00:00:00');
      calculateDailyTotal(); // Recalculate daily total after stopping
    } catch (error) {
      console.error('Failed to stop timer:', error);
      alert('Failed to stop timer. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        maxWidth: 400,
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h4" component="div" sx={{ color: '#333' }}>
        Time Tracker
      </Typography>
      
      {isTracking && (
        <Chip 
          label={currentSession.type}
          color={currentSession.type === 'WORK' ? 'primary' : 'secondary'}
          sx={{ mb: 1 }}
        />
      )}
      
      <Typography
        variant="h2"
        component="div"
        sx={{
          fontFamily: 'monospace',
          color: isTracking ? (currentSession.type === 'WORK' ? '#1976d2' : '#9c27b0') : '#666',
          fontWeight: 'bold',
        }}
      >
        {elapsedTime}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        <Typography variant="subtitle1" align="center">
          Today's Total Work Hours: <strong>{dailyTotal}</strong>
        </Typography>

        {!isTracking && (
          <TaskSelect
            value={selectedTaskId}
            onChange={(taskId) => setSelectedTaskId(taskId)}
          />
        )}
        
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStartTimer('WORK')}
            disabled={isTracking}
            sx={{
              minWidth: '120px',
              fontSize: '1.1rem',
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#666',
              },
            }}
          >
            Start Work
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleStartTimer('BREAK')}
            disabled={isTracking}
            sx={{
              minWidth: '120px',
              fontSize: '1.1rem',
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#666',
              },
            }}
          >
            Start Break
          </Button>
          
          {isTracking && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleStopTimer}
              sx={{
                minWidth: '120px',
                fontSize: '1.1rem',
              }}
            >
              Stop
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default TimeTracker; 