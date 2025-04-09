import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import axios from '../config/axios';

interface TimeLog {
  id: string;
  startTime: string;
  endTime: string | null;
  type: 'WORK' | 'BREAK';
  notes: string | null;
}

const TimeLogTable: React.FC = () => {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/api/time-logs/daily');
        setLogs(response.data);
        // Initialize notes state with existing notes
        const initialNotes: { [key: string]: string } = {};
        response.data.forEach((log: TimeLog) => {
          initialNotes[log.id] = log.notes || '';
        });
        setNotes(initialNotes);
      } catch (error) {
        console.error('Error fetching time logs:', error);
      }
    };

    fetchLogs();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const calculateDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In Progress';
    
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diff = end - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleNotesChange = (timeLogId: string, value: string) => {
    setNotes(prev => ({
      ...prev,
      [timeLogId]: value
    }));
  };

  const handleSaveNotes = async (timeLogId: string) => {
    try {
      const response = await axios.patch(`/api/time-logs/${timeLogId}/notes`, {
        notes: notes[timeLogId]
      });
      
      // Update the logs state with the new notes
      setLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === timeLogId ? { ...log, notes: response.data.notes } : log
        )
      );
      
      // Exit editing mode
      setEditingId(null);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const handleStartEditing = (timeLogId: string) => {
    setEditingId(timeLogId);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Today's Time Logs
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <TableRow 
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingId === log.id ? (
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Add description..."
                          value={notes[log.id] || ''}
                          onChange={(e) => handleNotesChange(log.id, e.target.value)}
                          autoFocus
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: 'white',
                            },
                          }}
                        />
                      ) : (
                        <Typography
                          sx={{
                            minHeight: '24px',
                            flex: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              color: 'primary.main',
                            },
                          }}
                          onClick={() => handleStartEditing(log.id)}
                        >
                          {log.notes || 'Define Here'}
                        </Typography>
                      )}
                      {editingId === log.id ? (
                        <Tooltip title="Save description">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSaveNotes(log.id)}
                          >
                            <SaveIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Edit description">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleStartEditing(log.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={log.type}
                      color={log.type === 'WORK' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatTime(log.startTime)}</TableCell>
                  <TableCell>
                    {log.endTime ? formatTime(log.endTime) : 'In Progress'}
                  </TableCell>
                  <TableCell>{calculateDuration(log.startTime, log.endTime)}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TimeLogTable; 