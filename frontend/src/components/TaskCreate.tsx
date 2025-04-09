import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
}

const TaskCreate: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [employees, setEmployees] = useState<User[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    // Fetch employees for assignment
    const fetchEmployees = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/auth/employees', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          assigneeId,
        }),
      });

      if (response.ok) {
        // Clear form
        setName('');
        setDescription('');
        setAssigneeId('');
        // You might want to trigger a refresh of the task list here
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Task
      </Typography>
      <TextField
        fullWidth
        label="Task Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        margin="normal"
      />
      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={4}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Assign To</InputLabel>
        <Select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          label="Assign To"
        >
          {employees.map((employee) => (
            <MenuItem key={employee.id} value={employee.id}>
              {employee.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        Create Task
      </Button>
    </Box>
  );
};

export default TaskCreate; 