import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import DailySummary from '../components/reports/DailySummary';
import WorkHoursReport from '../components/reports/WorkHoursReport';
import TasksReport from '../components/reports/TasksReport';

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
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

export default function Reports() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reports
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="report tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Daily Summary" {...a11yProps(0)} />
          <Tab label="Work Hours" {...a11yProps(1)} />
          <Tab label="Tasks" {...a11yProps(2)} />
        </Tabs>
        <TabPanel value={value} index={0}>
          <DailySummary />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <WorkHoursReport />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <TasksReport />
        </TabPanel>
      </Paper>
    </Box>
  );
} 