import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TimeTracker from '../components/TimeTracker';
import TimeLogTable from '../components/TimeLogTable';
import TaskCreate from '../components/TaskCreate';
import TaskList from '../components/TaskList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'grid', gap: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="body1" paragraph>
            Track your work time and manage your tasks efficiently.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Profile Information:
            </Typography>
            <Typography>
              <strong>Email:</strong> {user?.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {user?.role}
            </Typography>
          </Box>
        </Paper>
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
              <Tab label="Time Tracking" />
              <Tab label="Task Management" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TimeTracker />
              <TimeLogTable />
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'grid', gap: 3 }}>
              {user?.role === 'ADMIN' && <TaskCreate />}
              <TaskList />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home; 