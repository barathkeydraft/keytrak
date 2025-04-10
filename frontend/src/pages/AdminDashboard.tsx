import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import RefreshIcon from '@mui/icons-material/Refresh';
import WorkIcon from '@mui/icons-material/Work';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import dayjs, { Dayjs } from 'dayjs';

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastAttendance: {
    type: 'LOGIN' | 'LOGOUT';
    timestamp: string;
    locationName: string;
  };
}

interface ProductivityMetric {
  id: string;
  name: string;
  hoursWorked: number;
  tasksCompleted: number;
}

interface TimeLog {
  id: string;
  startTime: string;
  endTime: string | null;
  type: 'WORK' | 'BREAK';
  notes: string | null;
  task: {
    name: string;
    status: string;
  } | null;
}

const AdminDashboard: React.FC = () => {
  const [employeeStatus, setEmployeeStatus] = useState<EmployeeStatus[]>([]);
  const [metrics, setMetrics] = useState<ProductivityMetric[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Dayjs>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState({
    status: false,
    metrics: false,
    logs: false
  });

  const { token } = useAuth();

  const fetchEmployeeStatus = async () => {
    try {
      setLoading(prev => ({ ...prev, status: true }));
      const response = await api.get('/admin/employee-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployeeStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch employee status:', error);
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const fetchProductivityMetrics = async () => {
    try {
      setLoading(prev => ({ ...prev, metrics: true }));
      const response = await api.get('/admin/productivity-metrics', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to fetch productivity metrics:', error);
    } finally {
      setLoading(prev => ({ ...prev, metrics: false }));
    }
  };

  const fetchTimeLogs = async () => {
    if (!selectedEmployee) return;
    try {
      setLoading(prev => ({ ...prev, logs: true }));
      const response = await api.get('/admin/employee-time-logs', {
        params: {
          employeeId: selectedEmployee,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch time logs:', error);
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  };

  useEffect(() => {
    fetchEmployeeStatus();
    fetchProductivityMetrics();
  }, [startDate, endDate]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchTimeLogs();
    }
  }, [selectedEmployee, startDate, endDate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Date Range Selector */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center">
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(date) => date && setStartDate(date)}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(date) => date && setEndDate(date)}
                />
                <IconButton onClick={() => {
                  fetchEmployeeStatus();
                  fetchProductivityMetrics();
                  fetchTimeLogs();
                }}>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Work Status
                {loading.status && <CircularProgress size={20} sx={{ ml: 2 }} />}
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employeeStatus.map((employee) => (
                      <TableRow 
                        key={employee.id}
                        onClick={() => setSelectedEmployee(employee.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PersonIcon />
                            {employee.name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={employee.isActive ? 'Active' : 'Inactive'}
                            color={employee.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {employee.lastAttendance ? (
                            `${employee.lastAttendance.type} at ${format(new Date(employee.lastAttendance.timestamp), 'hh:mm a')}`
                          ) : 'No activity'}
                        </TableCell>
                        <TableCell>
                          {employee.lastAttendance?.locationName || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Productivity Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productivity Metrics
                {loading.metrics && <CircularProgress size={20} sx={{ ml: 2 }} />}
              </Typography>
              <Grid container spacing={2}>
                {metrics.map((metric) => (
                  <Grid item xs={12} sm={6} md={4} key={metric.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{metric.name}</Typography>
                        <Box display="flex" alignItems="center" gap={2} mt={2}>
                          <Tooltip title="Hours Worked">
                            <Box display="flex" alignItems="center" gap={1}>
                              <AccessTimeIcon />
                              <Typography>{metric.hoursWorked.toFixed(1)}h</Typography>
                            </Box>
                          </Tooltip>
                          <Tooltip title="Tasks Completed">
                            <Box display="flex" alignItems="center" gap={1}>
                              <WorkIcon />
                              <Typography>{metric.tasksCompleted}</Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Logs */}
        {selectedEmployee && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Time Logs
                  {loading.logs && <CircularProgress size={20} sx={{ ml: 2 }} />}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Task</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timeLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.startTime), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(log.startTime), 'hh:mm a')}
                          </TableCell>
                          <TableCell>
                            {log.endTime ? format(new Date(log.endTime), 'hh:mm a') : 'In Progress'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={log.type}
                              color={log.type === 'WORK' ? 'primary' : 'secondary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {log.task?.name || 'No task'}
                          </TableCell>
                          <TableCell>
                            {log.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 