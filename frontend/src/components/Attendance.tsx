import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
} from '@mui/material';
import { History as HistoryIcon, Close as CloseIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import attendanceService, { AttendanceLog } from '../services/attendanceService';

const Attendance: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<AttendanceLog | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceLog[]>([]);
  const [error, setError] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    loadLatestAttendance();
    loadAttendanceHistory();
  }, []);

  const loadLatestAttendance = async () => {
    try {
      const latest = await attendanceService.getLatestAttendance();
      if (latest) {
        setCurrentLog(latest);
        setIsLoggedIn(latest.type === 'LOGIN');
      }
    } catch (error) {
      console.error('Error loading latest attendance:', error);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const history = await attendanceService.getAttendanceHistory();
      setAttendanceHistory(history);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.display_name || 'Unknown Location';
    } catch (error) {
      console.error('Error fetching location name:', error);
      return 'Unknown Location';
    }
  };

  const handleAttendance = async (type: 'LOGIN' | 'LOGOUT') => {
    try {
      if (type === 'LOGIN' && isLoggedIn) {
        setError('You are already logged in. Please logout first.');
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;
      const locationName = await getLocationName(latitude, longitude);

      const attendance = await attendanceService.markAttendance({
        type,
        latitude,
        longitude,
        locationName,
      });

      setCurrentLog(attendance);
      setIsLoggedIn(type === 'LOGIN');
      setError('');
      loadAttendanceHistory(); // Refresh history after new entry
    } catch (error) {
      setError('Failed to mark attendance. Please try again.');
      console.error('Error marking attendance:', error);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={4} alignItems="stretch" sx={{ flex: 1 }}>
        {/* Current Status */}
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Current Status
          </Typography>
          {currentLog && (
            <Typography variant="body1">
              You {currentLog.type === 'LOGIN' ? 'logged in' : 'logged out'} at{' '}
              {format(new Date(currentLog.timestamp), 'h:mm a')} from{' '}
              {currentLog.locationName || `[${currentLog.latitude}, ${currentLog.longitude}]`}
            </Typography>
          )}
        </Box>

        {/* Attendance Actions */}
        <Box>
          <Typography variant="h6" gutterBottom color="primary">
            Mark Attendance
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={() => handleAttendance('LOGIN')}
              disabled={isLoggedIn}
            >
              Log In
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              onClick={() => handleAttendance('LOGOUT')}
              disabled={!isLoggedIn}
            >
              Log Out
            </Button>
          </Stack>
        </Box>

        {/* History Button */}
        <Box sx={{ mt: 'auto' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<HistoryIcon />}
            onClick={() => setIsHistoryOpen(true)}
            fullWidth
          >
            View Attendance History
          </Button>
        </Box>
      </Stack>

      {/* History Modal */}
      <Dialog
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Attendance History</Typography>
            <IconButton onClick={() => setIsHistoryOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceHistory.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.timestamp), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(log.timestamp), 'h:mm a')}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>
                      {log.locationName || `[${log.latitude}, ${log.longitude}]`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Attendance; 