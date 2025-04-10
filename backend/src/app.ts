import express from 'express';
import cors from 'cors';
import employeeRoutes from './routes/employeeRoutes';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 