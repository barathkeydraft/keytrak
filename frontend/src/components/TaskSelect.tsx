import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface Task {
  id: string;
  name: string;
  description: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE';
}

interface TaskSelectProps {
  value: string;
  onChange: (taskId: string) => void;
}

const TaskSelect: React.FC<TaskSelectProps> = ({ value, onChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/tasks', {
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

    fetchTasks();
  }, [token]);

  return (
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
        {tasks.map((task) => (
          <MenuItem key={task.id} value={task.id}>
            {task.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TaskSelect; 