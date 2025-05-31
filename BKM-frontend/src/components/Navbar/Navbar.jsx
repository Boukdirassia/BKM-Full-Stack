import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Divider,
  useScrollTrigger,
  Slide,
  Fade,
  Badge,
} from '@mui/material';

import { 
  Menu as MenuIcon, 
  AccountCircle, 
  DirectionsCar, 
  Home, 
  EventAvailable, 
  RateReview, 
  ContactSupport,
  Login,
  AdminPanelSettings,
  Notifications
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../Logo/Logo';
import { useAuth } from '../../context/AuthContext';
import { styled } from '@mui/system';

// Pages configuration with icons
const pages = [
  { name: 'Accueil', link: '/', icon: <Home /> },
  { name: 'Véhicules', link: '/vehicules', icon: <DirectionsCar /> },
  { name: 'Réserver', link: '/reserver', icon: <EventAvailable /> },
  { name: 'Avis Clients', link: '/#avis', icon: <RateReview /> }, // Lien vers la section avis de la page d'accueil
  { name: 'Nous Contacter', link: '/#contact', icon: <ContactSupport /> }, // Lien vers la section contact de la page d'accueil
];

// Pages accessibles uniquement pour les utilisateurs connectés
const authenticatedPages = [
  { name: 'Historique des réservations', link: '/reservations', icon: <EventAvailable /> },
];

const settings = ['Profile', 'Réservations', 'Déconnexion'];

// Custom styled components
const StyledAppBar = styled(AppBar)(({ theme, trigger, transparent }) => ({
  background: transparent ? 'transparent' : 'linear-gradient(90deg, #000000 0%, #1A1A1A 100%)',
  boxShadow: trigger ? '0 4px 20px rgba(0, 0, 0, 0.15)' : 'none',
  transition: 'all 0.3s ease-in-out',
  backdropFilter: trigger ? 'blur(10px)' : 'none',
  height: trigger ? '60px' : '80px',
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  position: 'relative',
  margin: '0 5px',
  color: 'white',
  fontWeight: active ? '600' : '400',
  textTransform: 'none',
  fontSize: '0.95rem',
  padding: '6px 16px',
  borderRadius: '30px',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  background: active ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
  '&:hover': {
    background: 'rgba(255, 215, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '0',
    left: '50%',
    width: active ? '80%' : '0%',
    height: '2px',
    backgroundColor: '#FFD700',
    transition: 'all 0.3s ease',
    transform: 'translateX(-50%)',
  },
  '&:hover::after': {
    width: '80%',
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #D4AF37 0%, #FFD700 100%)',
  color: 'black',
  fontWeight: '600',
  padding: '8px 24px',
  borderRadius: '30px',
  textTransform: 'none',
  boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #C4A030 0%, #EFC600 100%)',
    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)',
    transform: 'translateY(-2px)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #D4AF37 0%, #FFD700 100%)',
  color: 'black',
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 15px rgba(212, 175, 55, 0.4)',
  },
}));

// Hide on scroll function
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [transparent, setTransparent] = useState(location.pathname === '/');
  const trigger = useScrollTrigger({ threshold: 100 });
  
  // Animation states
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Set navbar to transparent only on homepage
    setTransparent(location.pathname === '/');
    
    // Trigger animation when component mounts
    setAnimateIn(true);
    
    // Listen for scroll events to add background blur
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (location.pathname === '/') {
        setTransparent(scrollPosition < 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (setting) => {
    handleCloseUserMenu();
    if (setting === 'Déconnexion') {
      logout();
      navigate('/');
    } else if (setting === 'Profile') {
      navigate('/profile');
    } else if (setting === 'Réservations') {
      navigate('/profile');
    }
  };

  // Check if a page is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Fonction pour gérer le clic sur les liens avec ancre ("Nous Contacter" et "Avis Clients")
  const handleAnchorClick = (e, sectionId) => {
    e.preventDefault();
    handleCloseNavMenu();
    
    // Si nous sommes déjà sur la page d'accueil, faire défiler jusqu'à la section
    if (location.pathname === '/') {
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Sinon, naviguer vers la page d'accueil avec l'ancre
      navigate('/');
      // Attendre que la page soit chargée avant de faire défiler
      setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  };
  
  // Fonction spécifique pour le lien "Nous Contacter"
  const handleContactClick = (e) => {
    handleAnchorClick(e, 'contact');
  };
  
  // Fonction spécifique pour le lien "Avis Clients"
  const handleAvisClick = (e) => {
    handleAnchorClick(e, 'avis');
  };

  return (
    <StyledAppBar position="fixed" trigger={trigger ? 1 : 0} transparent={(transparent && !trigger) ? 1 : 0}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: trigger ? '60px' : '80px', transition: 'height 0.3s ease' }}>
          {/* Logo for larger screens */}
          <Fade in={animateIn} timeout={800} style={{ transitionDelay: '100ms' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
              <Link to="/" style={{ textDecoration: 'none' }}>
                <Logo darkMode={true} />
              </Link>
            </Box>
          </Fade>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                '&:hover': { background: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiPaper-root': {
                  background: 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  borderRadius: '10px',
                },
              }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={
                    page.name === 'Nous Contacter' ? handleContactClick : 
                    page.name === 'Avis Clients' ? handleAvisClick : 
                    handleCloseNavMenu
                  }
                  component={page.name === 'Nous Contacter' || page.name === 'Avis Clients' ? 'button' : Link}
                  to={page.name === 'Nous Contacter' || page.name === 'Avis Clients' ? undefined : page.link}
                  sx={{
                    color: 'white',
                    '&:hover': { background: 'rgba(255, 215, 0, 0.1)' },
                    borderLeft: isActive(page.link) ? '3px solid #FFD700' : 'none',
                    paddingLeft: isActive(page.link) ? '13px' : '16px',
                  }}
                >
                  <Box sx={{ mr: 1.5, color: '#FFD700' }}>
                    {page.icon}
                  </Box>
                  <Typography>{page.name}</Typography>
                </MenuItem>
              ))}
              
              {/* Afficher l'historique des réservations uniquement pour les utilisateurs connectés */}
              {isAuthenticated && authenticatedPages.map((page) => (
                <MenuItem 
                  key={page.name} 
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={page.link}
                  sx={{
                    color: '#FFD700',
                    '&:hover': { background: 'rgba(255, 215, 0, 0.1)' },
                    borderLeft: isActive(page.link) ? '3px solid #FFD700' : 'none',
                    paddingLeft: isActive(page.link) ? '13px' : '16px',
                    mt: 1,
                    borderTop: '1px solid rgba(255, 215, 0, 0.1)',
                    pt: 1
                  }}
                >
                  <Box sx={{ mr: 1.5, color: '#FFD700' }}>
                    {page.icon}
                  </Box>
                  <Typography>{page.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Logo darkMode={true} />
            </Link>
          </Box>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page, index) => (
              <Fade 
                key={page.name}
                in={animateIn} 
                timeout={800} 
                style={{ transitionDelay: `${150 + index * 100}ms` }}
              >
                <NavButton
                  component={page.name === 'Nous Contacter' || page.name === 'Avis Clients' ? 'button' : Link}
                  to={page.name === 'Nous Contacter' || page.name === 'Avis Clients' ? undefined : page.link}
                  onClick={
                    page.name === 'Nous Contacter' ? handleContactClick : 
                    page.name === 'Avis Clients' ? handleAvisClick : 
                    handleCloseNavMenu
                  }
                  active={isActive(page.link) ? 1 : 0}
                  startIcon={page.icon}
                >
                  {page.name}
                </NavButton>
              </Fade>
            ))}
            
            {/* Afficher l'historique des réservations uniquement pour les utilisateurs connectés */}
            {isAuthenticated && authenticatedPages.map((page, index) => (
              <Fade 
                key={page.name}
                in={animateIn} 
                timeout={800} 
                style={{ transitionDelay: `${150 + (pages.length + index) * 100}ms` }}
              >
                <NavButton
                  component={Link}
                  to={page.link}
                  onClick={handleCloseNavMenu}
                  active={isActive(page.link) ? 1 : 0}
                  startIcon={page.icon}
                  sx={{ color: '#FFD700' }}
                >
                  {page.name}
                </NavButton>
              </Fade>
            ))}
          </Box>

          {/* Auth buttons and user menu */}
          <Fade in={animateIn} timeout={800} style={{ transitionDelay: '600ms' }}>
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Tooltip title="Administration">
                      <IconButton
                        onClick={() => navigate('/admin/dashboard')}
                        sx={{
                          color: '#FFD700',
                          background: 'rgba(255, 255, 255, 0.05)',
                          '&:hover': { 
                            background: 'rgba(255, 215, 0, 0.15)',
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <AdminPanelSettings />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <Tooltip title="Notifications">
                    <IconButton
                      sx={{
                        color: 'white',
                        background: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': { 
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Badge badgeContent={3} color="error">
                        <Notifications />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Paramètres du compte">
                    <IconButton 
                      onClick={handleOpenUserMenu} 
                      sx={{ 
                        p: 0,
                        transition: 'all 0.3s ease',
                        '&:hover': { transform: 'scale(1.1)' },
                      }}
                    >
                      <StyledAvatar>
                        {user?.prenom?.[0] || user?.nom?.[0] || user?.email?.[0]?.toUpperCase() || <AccountCircle />}
                      </StyledAvatar>
                    </IconButton>
                  </Tooltip>
                  
                  <Menu
                    sx={{ 
                      mt: '45px',
                      '& .MuiPaper-root': {
                        background: 'linear-gradient(135deg, #000000 0%, #1A1A1A 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255, 215, 0, 0.1)',
                        overflow: 'hidden',
                      },
                    }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography color="white" variant="subtitle1">{user?.prenom} {user?.nom}</Typography>
                      <Typography color="gray" variant="caption">{user?.email}</Typography>
                    </Box>
                    
                    {settings.map((setting) => (
                      <MenuItem 
                        key={setting} 
                        onClick={() => handleMenuClick(setting)}
                        sx={{
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          '&:hover': { background: 'rgba(255, 215, 0, 0.2)' },
                        }}
                      >
                        <Typography textAlign="center" sx={{ textShadow: '0 0 2px rgba(0,0,0,0.5)', color: '#FFFFFF', fontWeight: 'bold' }}>{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              ) : (
                <LoginButton
                  component={Link}
                  to="/login"
                  startIcon={<Login />}
                >
                  Connexion
                </LoginButton>
              )}
            </Box>
          </Fade>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;
