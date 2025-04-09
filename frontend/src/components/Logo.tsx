import React from 'react';
import { Box, Typography } from '@mui/material';
import { Timer } from '@mui/icons-material';

const Logo: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'dark' }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Timer sx={{ 
        fontSize: '2rem',
        color: variant === 'light' ? 'white' : 'primary.main'
      }} />
      <Typography
        variant="h5"
        component="div"
        sx={{
          fontWeight: 'bold',
          color: variant === 'light' ? 'white' : 'primary.main',
          letterSpacing: '.1rem',
        }}
      >
        KeyTrak
      </Typography>
    </Box>
  );
};

export default Logo; 