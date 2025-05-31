import React from 'react';
import { Box, Paper } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: '280px',
          minHeight: '100vh',
          backgroundColor: '#f8f9fa',
          position: 'relative',
        }}
      >
        <Header />
        <Box 
          sx={{ 
            p: 3, 
            mt: 9,
            mx: 'auto',
            maxWidth: '1600px',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            {children}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
