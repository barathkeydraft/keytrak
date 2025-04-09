import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack, Paper, Chip, IconButton, useTheme } from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Coffee as BreakIcon,
  Timer as TimerIcon,
  AccessTime as ClockIcon,
  Pause,
} from '@mui/icons-material';
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
  const [dailyEntries, setDailyEntries] = useState<TimeLog[]>([]);
  const [isBreak, setIsBreak] = useState(false);

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
          setIsBreak(response.data.type === 'BREAK');
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
      setDailyEntries(logs);
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
      setIsBreak(type === 'BREAK');
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
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <TimerIcon color="primary" />
        <Typography variant="h6" component="h2">Time Tracker</Typography>
        {isTracking && (
          <Chip
            size="small"
            icon={isBreak ? <BreakIcon fontSize="small" /> : <ClockIcon fontSize="small" />}
            label={isBreak ? 'Break' : 'Work'}
            color={isBreak ? 'secondary' : 'primary'}
            sx={{ ml: 'auto' }}
          />
        )}
      </Stack>

      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h3" component="div" color="text.primary" sx={{ fontWeight: 'medium', letterSpacing: 1 }}>
          {elapsedTime}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Today's Total: {dailyTotal}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {!isTracking ? (
          <>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayIcon />}
              onClick={() => handleStartTimer('WORK')}
              sx={{ py: 1.5 }}
            >
              Start Work
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BreakIcon />}
              onClick={() => handleStartTimer('BREAK')}
              sx={{ py: 1.5 }}
            >
              Start Break
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<StopIcon />}
            onClick={handleStopTimer}
            sx={{ py: 1.5 }}
          >
            Stop {isBreak ? 'Break' : 'Work'}
          </Button>
        )}
      </Stack>

      {dailyEntries.length > 0 && (
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Today's Sessions
          </Typography>
          <Stack spacing={1}>
            {dailyEntries.slice(-3).map((entry, index) => (
              <Box
                key={index}
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {entry.type === 'BREAK' ? (
                  <BreakIcon fontSize="small" color="secondary" />
                ) : (
                  <ClockIcon fontSize="small" color="primary" />
                )}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.primary">
                    {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.startTime ? new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default TimeTracker; 