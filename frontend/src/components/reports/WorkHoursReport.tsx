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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateValidationError } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { WorkHourReport } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function WorkHoursReport() {
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [reports, setReports] = useState<WorkHourReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      if (!startDate || !endDate || !user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/reports/work-hours', {
          params: {
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            employeeId: user.role === 'EMPLOYEE' ? user.id : undefined,
          },
        });
        setReports(response.data);
      } catch (err) {
        setError('Failed to fetch work hours report');
        console.error('Error fetching work hours report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [startDate, endDate, user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" gap={2} mb={3}>
        <DatePicker<Dayjs>
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          format="DD/MM/YYYY"
        />
        <DatePicker<Dayjs>
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          format="DD/MM/YYYY"
        />
      </Box>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell align="right">Work Hours</TableCell>
              <TableCell align="right">Break Hours</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={`${report.employeeId}-${report.date}`}>
                <TableCell>{dayjs(report.date).format('DD/MM/YYYY')}</TableCell>
                <TableCell>{report.employeeName}</TableCell>
                <TableCell align="right">{report.totalHours.toFixed(2)}</TableCell>
                <TableCell align="right">{report.breakTime.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No data available for the selected date range
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 