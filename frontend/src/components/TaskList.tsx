import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Stack,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { TaskStatus } from '../types/task';
import EmployeeTaskCreate from './EmployeeTaskCreate';
import AdminTaskCreate from './AdminTaskCreate';

interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { token, user } = useAuth();

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tasks?today=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the task status locally
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          Today's Tasks
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Task
          </Button>
          <Tooltip title="Refresh tasks">
            <IconButton onClick={fetchTasks} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No tasks assigned for today
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.assigneeName}</TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={task.status}
                        onChange={(e: SelectChangeEvent) => 
                          handleStatusChange(task.id, e.target.value as TaskStatus)
                        }
                      >
                        <MenuItem value="PLANNED">Planned</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="COMPLETE">Complete</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {isAdmin ? (
        <AdminTaskCreate
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={fetchTasks}
        />
      ) : (
        <EmployeeTaskCreate
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onTaskCreated={fetchTasks}
        />
      )}
    </Box>
  );
};

export default TaskList; 