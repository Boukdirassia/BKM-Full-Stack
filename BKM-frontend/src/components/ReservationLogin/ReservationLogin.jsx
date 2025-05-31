import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper, Link, Switch, Grid, Divider, FormControlLabel, InputAdornment, IconButton } from '@mui/material';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';

// Style personnalisé pour le Switch
const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#000',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
    backgroundColor: '#fff',
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: '#E9E9EA',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

// Style personnalisé pour les champs de formulaire
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.2)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 14px',
    fontSize: '1rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'rgba(0, 0, 0, 0.7)',
    '&.Mui-focused': {
      color: '#000',
    },
  },
}));

const ReservationLogin = ({ onLoginSuccess, onCancel, reservationData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [showMissingFieldsWarning, setShowMissingFieldsWarning] = useState(false);
  const [hasAccount, setHasAccount] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  // État pour suivre si l'authentification est réussie et afficher le récapitulatif complet
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Appeler la fonction login avec isReservationProcess=true
      const response = await authService.login({ email, password }, true);
      
      // Stocker les informations d'authentification
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      // Mettre à jour l'état de l'utilisateur authentifié
      setAuthUser(response.user);
      
      // Toujours considérer que nous sommes dans un processus de réservation
      if (response.canProceedToReservation !== false) {
        // L'utilisateur a toutes les informations nécessaires pour la réservation
        // Marquer l'authentification comme réussie pour afficher le récapitulatif complet
        console.log('Authentification réussie, redirection vers le profil avec récapitulatif');
        setAuthSuccess(true);
        
        // Si des données de réservation sont disponibles, les stocker temporairement
        if (reservationData) {
          // Stocker les données de réservation
          localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
          
          // Indiquer que l'utilisateur vient de la page de réservation
          localStorage.setItem('fromReservation', 'true');
          
          // Attendre un court instant pour permettre à l'utilisateur de voir le récapitulatif
          setTimeout(() => {
            // Rediriger vers la page de profil au lieu d'appeler onLoginSuccess
            navigate('/profile');
          }, 1500);
        } else {
          // S'il n'y a pas de données de réservation, continuer normalement
          onLoginSuccess(response.user);
        }
      } else {
        // L'utilisateur doit compléter son profil
        setMissingFields(response.missingFields || []);
        setShowMissingFieldsWarning(true);
        
        // Si des données de réservation sont disponibles, les stocker temporairement
        if (reservationData) {
          localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
          localStorage.setItem('fromReservation', 'true');
          
          // Rediriger vers la page de profil pour compléter les informations manquantes
          setTimeout(() => {
            navigate('/profile');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.response?.data?.message || 'Email ou mot de passe incorrect. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    // Stocker les données de réservation temporairement
    if (reservationData) {
      localStorage.setItem('pendingReservation', JSON.stringify(reservationData));
    }
    
    // Stocker les champs manquants dans le localStorage pour les récupérer sur la page de profil
    localStorage.setItem('missingFields', JSON.stringify(missingFields));
    localStorage.setItem('fromReservation', 'true');
    
    // Afficher un message pour informer l'utilisateur
    alert('Vous allez être redirigé vers votre profil pour compléter les informations manquantes. Une fois terminé, vous pourrez revenir à votre réservation.');
    
    // Rediriger vers la page de profil
    navigate('/profile');
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 0, 
        maxWidth: 900, 
        mx: 'auto', 
        mt: 2, 
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <Grid container>
        {/* Partie gauche - Informations utilisateur */}
        <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="600" color="#333">
            Vos informations
          </Typography>
          
          <Box sx={{ mt: 2, mb: 4 }}>
            <FormControlLabel
              control={
                <IOSSwitch 
                  checked={hasAccount} 
                  onChange={() => setHasAccount(!hasAccount)}
                />
              }
              label={
                <Typography variant="body1" sx={{ color: 'rgba(0,0,0,0.75)', fontWeight: 500 }}>
                  Avez-vous déjà un compte ? <Link sx={{ color: '#000', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Connectez-vous</Link>
                </Typography>
              }
            />
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {showMissingFieldsWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Pour finaliser votre réservation, vous devez compléter les informations suivantes dans votre profil :
              </Typography>
              <ul>
                {missingFields.map((field) => (
                  <li key={field}>
                    {field === 'civilite' && 'Civilité'}
                    {field === 'cinPassport' && 'CIN/Passport'}
                    {field === 'dateNaissance' && 'Date de naissance'}
                    {field === 'numPermis' && 'Numéro de permis'}
                    {field === 'dateDelivrancePermis' && 'Date de délivrance du permis'}
                    {field === 'adresse' && 'Adresse'}
                  </li>
                ))}
              </ul>
              <Button 
                variant="contained" 
                onClick={handleCompleteProfile}
                sx={{ 
                  mt: 1, 
                  bgcolor: '#000', 
                  '&:hover': { bgcolor: '#333' } 
                }}
              >
                Compléter mon profil
              </Button>
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
            <StyledTextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse e-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#000', opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              placeholder="Entrez votre adresse email"
            />
            <StyledTextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#000', opacity: 0.7 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff sx={{ color: '#000', opacity: 0.7 }} /> : <Visibility sx={{ color: '#000', opacity: 0.7 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
            />
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                sx={{
                  borderColor: '#ddd',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#999',
                    bgcolor: 'rgba(0,0,0,0.03)',
                  },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 20px',
                  fontSize: '0.95rem',
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  '&:hover': {
                    bgcolor: '#333',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '10px 24px',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
              </Button>
            </Box>
          </Box>
        </Grid>
        
        {/* Partie droite - Récapitulatif de réservation */}
        <Grid item xs={12} md={6} sx={{ bgcolor: '#f9f9f9', p: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom fontWeight="600" color="#333" sx={{ textTransform: 'uppercase' }}>
            Récapitulatif de réservation
          </Typography>
          
          {/* Afficher un message de succès d'authentification si applicable */}
          {authSuccess && (
            <Alert severity="success" sx={{ mb: 3, fontWeight: 500 }}>
              Authentification réussie ! Préparation de votre réservation...
            </Alert>
          )}
          
          {reservationData && reservationData.vehicule && (
            <Box>
              <Box sx={{ textAlign: 'center', my: 2 }}>
                <img 
                  src={reservationData.vehicule.imageUrl || `/assets/images/cars/${reservationData.vehicule.id}.jpg`} 
                  alt={`${reservationData.vehicule.marque} ${reservationData.vehicule.modele}`}
                  style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = '/assets/images/car-placeholder.png';
                  }}
                />
              </Box>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {reservationData.vehicule.marque} {reservationData.vehicule.modele}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {reservationData.vehicule.categorie} • {reservationData.vehicule.transmission} • {reservationData.vehicule.annee}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Détails de la réservation
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Lieu de départ</Typography>
                  <Typography variant="body1" fontWeight={authSuccess ? 600 : 400}>
                    {reservationData.lieuDepart || 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date de départ</Typography>
                  <Typography variant="body1" fontWeight={authSuccess ? 600 : 400}>
                    {reservationData.dateDepart ? new Date(reservationData.dateDepart).toLocaleDateString() : 'Non spécifiée'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Lieu de retour</Typography>
                  <Typography variant="body1" fontWeight={authSuccess ? 600 : 400}>
                    {reservationData.lieuRetour || 'Non spécifié'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date de retour</Typography>
                  <Typography variant="body1" fontWeight={authSuccess ? 600 : 400}>
                    {reservationData.dateRetour ? new Date(reservationData.dateRetour).toLocaleDateString() : 'Non spécifiée'}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Afficher les informations supplémentaires si l'authentification est réussie */}
              {authSuccess && (
                <>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Détails du prix
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Grid container justifyContent="space-between" sx={{ mb: 1 }}>
                      <Grid item>
                        <Typography variant="body2">Location du véhicule</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="body2" fontWeight={500}>
                          {reservationData.prixBase || reservationData.vehicule.prix || '0'} MAD
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {reservationData.extras && reservationData.extras.length > 0 && (
                      <>
                        {reservationData.extras.map((extra, index) => (
                          <Grid container justifyContent="space-between" key={index} sx={{ mb: 1 }}>
                            <Grid item>
                              <Typography variant="body2">{extra.nom || 'Extra'}</Typography>
                            </Grid>
                            <Grid item>
                              <Typography variant="body2">{extra.prix || '0'} MAD</Typography>
                            </Grid>
                          </Grid>
                        ))}
                      </>
                    )}
                    
                    <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
                      <Grid item>
                        <Typography variant="subtitle2" fontWeight={600}>Total</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant="subtitle2" fontWeight={700} color="primary">
                          {reservationData.prixTotal || '0'} MAD
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Client: {authUser?.nom} {authUser?.prenom}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ReservationLogin;
