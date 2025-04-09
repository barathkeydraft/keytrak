import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateValidationError } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { TaskReport } from '../../types/reports';
import axios from 'axios';

export default function TasksReport() {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [report, setReport] = useState<TaskReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed'>('all');

  useEffect(() => {
    const fetchReport = async () => {
      if (!date) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/reports/tasks', {
          params: {
            date: date.format('YYYY-MM-DD'),
            status: filter === 'completed' ? 'COMPLETE' : undefined,
          },
        });
        setReport(response.data);
      } catch (err) {
        setError('Failed to fetch tasks report');
        console.error('Error fetching tasks report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [date, filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'default';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETE':
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const completedTasks = report?.tasks.filter(task => task.status === 'COMPLETE') || [];
  const completionRate = report?.tasks.length 
    ? ((completedTasks.length / report.tasks.length) * 100).toFixed(1)
    : 0;

  return (
    <Box>
      <Box mb={3} display="flex" gap={2} alignItems="center">
        <DatePicker<Dayjs>
          label="Select Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          format="DD/MM/YYYY"
        />
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(e, value) => value && setFilter(value)}
          size="small"
        >
          <ToggleButton value="all">All Tasks</ToggleButton>
          <ToggleButton value="completed">Completed Only</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <Box mb={2}>
        <Typography variant="h6" gutterBottom>
          Daily Task Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Completed Tasks: {completedTasks.length} / {report?.tasks.length || 0} ({completionRate}%)
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Completion Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {report?.tasks.map((task) => (
              <TableRow 
                key={task.id}
                sx={task.status === 'COMPLETE' ? { backgroundColor: 'rgba(76, 175, 80, 0.08)' } : {}}
              >
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {dayjs(task.updatedAt).format('DD/MM/YYYY HH:mm')}
                </TableCell>
                <TableCell>
                  {task.status === 'COMPLETE' && dayjs(task.updatedAt).format('HH:mm')}
                </TableCell>
              </TableRow>
            ))}
            {(!report?.tasks || report.tasks.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No tasks found for the selected date
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 