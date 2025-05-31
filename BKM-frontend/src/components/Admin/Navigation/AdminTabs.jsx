import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const AdminTabs = ({ tabs }) => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();

  // Déterminer si nous sommes dans la section admin ou assistant
  const isAdmin = location.pathname.includes('/admin/');
  const baseRoute = isAdmin ? '/admin/' : '/assistant/';

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs 
        value={tabs.findIndex(tab => tab.path === currentPath)}
        aria-label="admin navigation tabs"
        textColor="primary"
        indicatorColor="primary"
      >
        {tabs.map((tab, index) => (
          <Tab 
            key={index}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            component={Link}
            to={`${baseRoute}${tab.path}`}
            sx={{ 
              minHeight: '48px',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              '&.Mui-selected': {
                color: '#000',
              }
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default AdminTabs;