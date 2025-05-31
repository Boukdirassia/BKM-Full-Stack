import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider,
  Avatar,
  Tooltip,
  Badge
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../../Logo/Logo';

// Menu items pour les assistants (sans l'option de gestion des assistants)
const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/assistant/dashboard' },
  { text: 'Gestion des véhicules', icon: <DirectionsCarIcon />, path: '/assistant/vehicles', badge: 5 },
  { text: 'Gestion des réservations/clients', icon: <BookOnlineIcon />, path: '/assistant/reservations', badge: 12 },
  { text: 'Gestion des extras', icon: <AddCircleOutlineIcon />, path: '/assistant/extras' },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    // Utiliser la fonction logout du contexte d'authentification
    // qui nettoie toutes les données et redirige vers la page d'accueil
    logout();
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        background: 'linear-gradient(180deg, #000000 0%, #1A1A1A 100%)',
        color: 'white',
        position: 'fixed',
        left: 0,
        top: 0,
        boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link to="/assistant/dashboard" style={{ textDecoration: 'none' }}>
          <Logo variant="admin" />
        </Link>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255,215,0,0.2)', mx: 3 }} />

      <Box sx={{ p: 2, mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5, 
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
        }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40,
              backgroundColor: '#000',
              border: '2px solid #FFD700',
              color: '#FFD700',
              fontWeight: 'bold',
            }}
          >
            A
          </Avatar>
          <Box sx={{ ml: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              Partie Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>
              Partie Assistant
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, px: 2, overflowY: 'auto' }}>
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip title={item.text} placement="right" key={item.text}>
                <ListItem
                  component={Link}
                  to={item.path}
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    py: 1.2,
                    backgroundColor: isActive ? 'rgba(255,215,0,0.15)' : 'transparent',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.05)',
                      transform: 'translateY(-2px)',
                      '&::before': {
                        opacity: 1,
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '4px',
                      backgroundColor: '#FFD700',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? '#FFD700' : 'rgba(255,255,255,0.7)',
                      minWidth: 40
                    }}
                  >
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.6rem',
                            height: 16,
                            minWidth: 16,
                            padding: '0 4px'
                          }
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        color: isActive ? '#FFD700' : 'white',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.9rem',
                        transition: 'color 0.3s ease, font-weight 0.3s ease',
                      }
                    }}
                  />
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 2 }}>
        <Divider sx={{ backgroundColor: 'rgba(255,215,0,0.2)', mb: 2 }} />
        <ListItem
          component="button"
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.2,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
              transform: 'translateY(-2px)',
            },
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
          }}
        >
          <ListItemIcon sx={{ color: '#f44336', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Déconnexion" 
            sx={{ 
              '& .MuiListItemText-primary': {
                color: '#f44336',
                fontWeight: 500,
                fontSize: '0.9rem',
              }
            }}
          />
        </ListItem>
      </Box>
    </Box>
  );
};

export default Sidebar;
