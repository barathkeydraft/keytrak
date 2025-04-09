import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Typography, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE';
  assigneeId: string;
  assigneeName: string;
}

interface TaskSelectProps {
  value: string;
  onChange: (taskId: string) => void;
}

const TaskSelect: React.FC<TaskSelectProps> = ({ value, onChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { token, user } = useAuth();

  const fetchTasks = async () => {
    try {
      // Only fetch today's tasks that are assigned to the current user
      const response = await fetch(`http://localhost:3001/api/tasks?today=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Filter tasks that are assigned to the current user and not completed
        const userTasks = data.filter((task: Task) => 
          task.assigneeId === user?.id && task.status !== 'COMPLETE'
        );
        setTasks(userTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Set up periodic refresh
    const interval = setInterval(fetchTasks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [token, user?.id]);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Select a task to track time for
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Select Task</InputLabel>
        <Select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          label="Select Task"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {tasks.length === 0 ? (
            <MenuItem disabled>
              <em>No tasks available for today</em>
            </MenuItem>
          ) : (
            tasks.map((task) => (
              <MenuItem 
                key={task.id} 
                value={task.id}
              >
                {task.name} {task.status === 'IN_PROGRESS' && ' (In Progress)'}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TaskSelect; 