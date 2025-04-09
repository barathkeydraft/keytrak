import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateValidationError } from '@mui/x-date-pickers';
import dayjs, { Dayjs } from 'dayjs';
import { DailySummary as DailySummaryType } from '../../types/reports';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export default function DailySummary() {
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [summary, setSummary] = useState<DailySummaryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      if (!date || !user) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/reports/daily-summary/${user.id}`, {
          params: {
            date: date.format('YYYY-MM-DD'),
          },
        });
        setSummary(response.data);
        setNotes(response.data.notes || '');
        setIsEditing(false);
      } catch (err) {
        setError('Failed to fetch daily summary');
        console.error('Error fetching daily summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [date, user]);

  const handleSaveNotes = async () => {
    if (!date || !user) return;

    try {
      await axios.post(`/api/reports/daily-summary/${user.id}/notes`, {
        date: date.format('YYYY-MM-DD'),
        notes,
      });
      
      setSummary(prev => prev ? { ...prev, notes } : null);
      setIsEditing(false);
      setSaveSuccess(true);
    } catch (err) {
      setError('Failed to save notes');
      console.error('Error saving notes:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <DatePicker<Dayjs>
          label="Select Date"
          value={date}
          onChange={(newValue) => setDate(newValue)}
          format="DD/MM/YYYY"
        />
      </Box>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {summary && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daily Summary for {dayjs(summary.date).format('DD/MM/YYYY')}
          </Typography>

          <List>
            <ListItem>
              <ListItemText
                primary="Total Work Hours"
                secondary={`${summary.totalWorkHours.toFixed(2)} hours`}
              />
            </ListItem>
            <Divider />

            <ListItem>
              <ListItemText
                primary="Tasks Completed"
                secondary={
                  <List>
                    {summary.tasksCompleted.map((task) => (
                      <ListItem key={task.id}>
                        <ListItemText
                          primary={task.name}
                          secondary={`Status: ${task.status} | Updated: ${dayjs(
                            task.updatedAt
                          ).format('HH:mm')}`}
                        />
                      </ListItem>
                    ))}
                    {summary.tasksCompleted.length === 0 && (
                      <ListItem>
                        <ListItemText secondary="No tasks completed today" />
                      </ListItem>
                    )}
                  </List>
                }
              />
            </ListItem>
            <Divider />

            <ListItem>
              <Box width="100%">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1">Notes</Typography>
                  {!isEditing && (
                    <Button 
                      size="small" 
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Notes
                    </Button>
                  )}
                </Box>
                {isEditing ? (
                  <Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your end-of-day notes here..."
                      variant="outlined"
                      size="small"
                    />
                    <Box display="flex" gap={1} mt={1}>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={handleSaveNotes}
                      >
                        Save Notes
                      </Button>
                      <Button 
                        size="small"
                        onClick={() => {
                          setNotes(summary.notes || '');
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="text.secondary">
                    {notes || 'No notes added for today'}
                  </Typography>
                )}
              </Box>
            </ListItem>
          </List>
        </Paper>
      )}

      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setSaveSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Notes saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
} 