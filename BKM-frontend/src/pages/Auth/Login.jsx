import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack, LockOutlined, EmailOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo/Logo';
import { authService } from '../../services';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Appel à l'API d'authentification avec les identifiants saisis
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      // Si la connexion est réussie, stocker les informations utilisateur
      if (response && response.user) {
        // Utiliser la fonction login du contexte d'authentification
        login(response.user);
        
        // Récupérer le rôle de l'utilisateur depuis la réponse de l'API
        const role = response.role || 'client';
        
        // Rediriger l'utilisateur en fonction de son rôle dans la table utilisateurs
        switch (role.toLowerCase()) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'assistant':
            navigate('/assistant/dashboard', { replace: true });
            break;
          case 'client':
            navigate('/profile', { replace: true });
            break;
          default:
            // Par défaut, rediriger vers la page d'accueil
            navigate('/', { replace: true });
            break;
        }
      } else {
        // Si la réponse ne contient pas les données utilisateur attendues
        setError('Erreur lors de la connexion. Veuillez réessayer.');
      }
    } catch (err) {
      // Afficher le message d'erreur retourné par le service d'authentification
      setError(err.message || 'Email ou mot de passe invalide. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        background: 'linear-gradient(135deg, #111111 0%, #222222 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Cercles décoratifs */}
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
          opacity: 0.15,
          top: '-100px',
          left: '-100px',
          zIndex: 0,
          boxShadow: '0 0 50px 20px rgba(255,215,0,0.1)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
          opacity: 0.08,
          bottom: '-200px',
          right: '-200px',
          zIndex: 0,
          boxShadow: '0 0 70px 30px rgba(255,215,0,0.1)',
        }}
      />

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#FFD700',
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderRadius: '30px',
          padding: '8px 16px',
          border: '1px solid rgba(255,215,0,0.3)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3), 0 0 15px rgba(255,215,0,0.2)',
          zIndex: 10,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.8)',
            boxShadow: '0 2px 15px rgba(0,0,0,0.4), 0 0 20px rgba(255,215,0,0.3)',
            borderColor: 'rgba(255,215,0,0.5)',
          },
        }}
      >
        Retour à l'accueil
      </Button>

      <Container component="main" maxWidth="md" sx={{ zIndex: 1 }}>
        <Grid container sx={{ height: '100vh' }}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 5,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                position: 'relative',
              }}
            >
              <Box sx={{ mb: 4, transform: 'scale(1.5)' }}>
                <Logo darkMode={false} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: '#FFD700',
                  textAlign: 'center',
                  mb: 3,
                  textShadow: '0 2px 10px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.2)',
                  letterSpacing: 1,
                }}
              >
                BKM Rental
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#FFFFFF',
                  textAlign: 'center',
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                Votre partenaire de confiance pour la location de véhicules au Maroc
              </Typography>
              <Box
                component="img"
                src="/assets/images/car-illustration.svg"
                alt="Car Illustration"
                sx={{
                  width: '100%',
                  maxWidth: '300px',
                  mt: 2,
                  display: { xs: 'none', md: 'block' },
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 2, sm: 4 },
            }}
          >
            <Paper
              elevation={8}
              sx={{
                p: { xs: 3, sm: 4 },
                width: '100%',
                maxWidth: '450px',
                borderRadius: '16px',
                bgcolor: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,215,0,0.3)',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.15)'
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                  boxShadow: '0 0 20px 5px rgba(255,215,0,0.4)'
                },
              }}
            >
              <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3, textAlign: 'center' }}>
                <Box sx={{ display: 'inline-block', transform: 'scale(1.2)' }}>
                  <Logo darkMode={false} />
                </Box>
              </Box>

              <Typography
                component="h1"
                variant="h5"
                sx={{
                  mb: 4,
                  fontWeight: 800,
                  color: '#FFD700',
                  textAlign: 'center',
                  position: 'relative',
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                  textShadow: '0 2px 10px rgba(255,215,0,0.3)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                    borderRadius: '3px',
                    boxShadow: '0 2px 8px rgba(255,215,0,0.5)'
                  },
                }}
              >
                Connexion
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  variant="filled"
                  sx={{
                    width: '100%',
                    mb: 3,
                    borderRadius: '8px',
                    fontWeight: 'medium',
                    '& .MuiAlert-icon': {
                      color: '#fff',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  variant="filled"
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,215,0,0.8)',
                      fontWeight: 500,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#FFD700',
                      fontWeight: 600,
                    },
                    '& .MuiFilledInput-root': {
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      color: 'white',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        boxShadow: 'inset 0 0 0 2px #FFD700',
                      },
                      '&::before': {
                        borderBottom: '2px solid rgba(255,215,0,0.3)',
                      },
                      '&:hover:not(.Mui-disabled):before': {
                        borderBottom: '2px solid rgba(255,215,0,0.5)',
                      },
                      '&::after': {
                        borderBottom: '2px solid #FFD700',
                      },
                    },
                    '& .MuiFilledInput-input': {
                      padding: '25px 12px 10px',
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.5)',
                        opacity: 1,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: '#FFD700', ml: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="filled"
                  sx={{
                    mb: 3,
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,215,0,0.8)',
                      fontWeight: 500,
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#FFD700',
                      fontWeight: 600,
                    },
                    '& .MuiFilledInput-root': {
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      color: 'white',
                      overflow: 'hidden',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        boxShadow: 'inset 0 0 0 2px #FFD700',
                      },
                      '&::before': {
                        borderBottom: '2px solid rgba(255,215,0,0.3)',
                      },
                      '&:hover:not(.Mui-disabled):before': {
                        borderBottom: '2px solid rgba(255,215,0,0.5)',
                      },
                      '&::after': {
                        borderBottom: '2px solid #FFD700',
                      },
                    },
                    '& .MuiFilledInput-input': {
                      padding: '25px 12px 10px',
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.5)',
                        opacity: 1,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#FFD700', ml: 1 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 4,
                    mb: 3,
                    py: 2,
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    color: '#000',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.2)',
                    border: '1px solid rgba(255,215,0,0.5)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FFC000, #FF8C00)',
                      boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      transform: 'translateY(1px)',
                      boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
                    },
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                {/* Section d'inscription supprimée */}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
