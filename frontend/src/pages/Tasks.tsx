import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TaskList from '../components/TaskList';

const Tasks: React.FC = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>
      <Box>
        <TaskList />
      </Box>
    </Container>
  );
};

export default Tasks; 