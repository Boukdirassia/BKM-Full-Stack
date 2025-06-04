import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import clientService from '../../services/clientService';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    civilite: '',
    cinPassport: '',
    dateNaissance: '',
    numeroPermit: '',
    datePermit: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fonction pour formater correctement les dates
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        // Essayer de convertir la date en format YYYY-MM-DD pour les champs de type date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Date invalide
        return date.toISOString().substring(0, 10);
      } catch (e) {
        console.error('Erreur lors du formatage de la date:', e);
        return '';
      }
    };
    
    // Charger les données utilisateur complètes
    setFormData({
      prenom: user.prenom || '',
      nom: user.nom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      adresse: user.adresse || '',
      civilite: user.civilite || '',
      cinPassport: user.cinPassport || '',
      dateNaissance: formatDate(user.dateNaissance),
      numeroPermit: user.numeroPermit || user.numPermis || '',
      datePermit: formatDate(user.datePermit || user.dateDelivrancePermis)
    });
    
    console.log('Données utilisateur chargées dans le formulaire:', user);
  }, [user, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Récupérer les données client existantes pour préserver les valeurs non modifiées
      let existingClientData = null;
      try {
        existingClientData = await clientService.getClientById(user.id);
        console.log('Données client existantes récupérées:', existingClientData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données client existantes:', error);
        // Continuer avec les données utilisateur actuelles si la récupération échoue
        existingClientData = user;
      }
      
      // Préparer les données complètes pour la mise à jour en préservant les valeurs existantes
      const clientData = {
        // Données de base - préserver les valeurs existantes si non modifiées
        nom: formData.nom || existingClientData?.nom || user?.nom,
        prenom: formData.prenom || existingClientData?.prenom || user?.prenom,
        email: formData.email || existingClientData?.email || user?.email,
        telephone: formData.telephone || existingClientData?.telephone || user?.telephone,
        adresse: formData.adresse || existingClientData?.adresse || user?.adresse,
        
        // Données complémentaires - préserver les valeurs existantes si non modifiées
        civilite: formData.civilite || existingClientData?.civilite || user?.civilite,
        cinPassport: formData.cinPassport || existingClientData?.cinPassport || user?.cinPassport,
        dateNaissance: formData.dateNaissance || existingClientData?.dateNaissance || user?.dateNaissance,
        numeroPermit: formData.numeroPermit || existingClientData?.numeroPermit || user?.numeroPermit || user?.numPermis,
        datePermit: formData.datePermit || existingClientData?.datePermit || user?.datePermit || user?.dateDelivrancePermis,
        
        // Format spécifique pour le backend - préserver les valeurs existantes si non modifiées
        Civilité: formData.civilite || existingClientData?.civilite || existingClientData?.Civilité || user?.civilite || user?.Civilité,
        CIN_Passport: formData.cinPassport || existingClientData?.cinPassport || existingClientData?.CIN_Passport || user?.cinPassport || user?.CIN_Passport,
        DateNaissance: formData.dateNaissance || existingClientData?.dateNaissance || existingClientData?.DateNaissance || user?.dateNaissance || user?.DateNaissance,
        NumPermis: formData.numeroPermit || existingClientData?.numeroPermit || existingClientData?.NumPermis || user?.numeroPermit || user?.numPermis || user?.NumPermis,
        DateDelivrancePermis: formData.datePermit || existingClientData?.datePermit || existingClientData?.DateDelivrancePermis || user?.datePermit || user?.dateDelivrancePermis || user?.DateDelivrancePermis,
        Adresse: formData.adresse || existingClientData?.adresse || existingClientData?.Adresse || user?.adresse || user?.Adresse,
        
        // Données utilisateur - préserver les valeurs existantes si non modifiées
        utilisateur: {
          Email: formData.email || existingClientData?.email || existingClientData?.Email || user?.email || user?.Email,
          Telephone: formData.telephone || existingClientData?.telephone || existingClientData?.Telephone || user?.telephone || user?.Telephone,
          Nom: formData.nom || existingClientData?.nom || existingClientData?.Nom || user?.nom || user?.Nom,
          Prenom: formData.prenom || existingClientData?.prenom || existingClientData?.Prenom || user?.prenom || user?.Prenom
        }
      };
      
      console.log('Données envoyées pour mise à jour:', clientData);
      
      // Mise à jour des informations client dans la base de données
      const response = await clientService.updateClient(user.id, clientData);
      console.log('Réponse de mise à jour:', response);
      
      // Créer un objet utilisateur mis à jour pour le contexte local
      const updatedUserData = {
        ...user,                // Conserver toutes les données existantes
        ...existingClientData, // Ajouter les données client existantes
        ...formData,           // Ajouter les données modifiées
        // S'assurer que les champs essentiels sont présents avec le bon format
        id: user.id,
        nom: formData.nom || user?.nom,
        prenom: formData.prenom || user?.prenom,
        email: formData.email || user?.email,
        telephone: formData.telephone || user?.telephone,
        adresse: formData.adresse || user?.adresse,
        civilite: formData.civilite || user?.civilite,
        cinPassport: formData.cinPassport || user?.cinPassport,
        dateNaissance: formData.dateNaissance || user?.dateNaissance,
        numeroPermit: formData.numeroPermit || user?.numeroPermit || user?.numPermis,
        datePermit: formData.datePermit || user?.datePermit || user?.dateDelivrancePermis
      };
      
      // Mettre à jour le contexte d'authentification
      updateUser(updatedUserData);
      
      // Afficher un message de succès
      setSuccess('Profil mis à jour avec succès');
      
      // Réinitialiser le formulaire et l'état
      setLoading(false);
      
      // Rediriger vers la page de profil après un court délai
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      
      // Afficher le message d'erreur détaillé
      if (err.response?.data) {
        // Si l'erreur contient un message et une erreur détaillée
        if (err.response.data.error) {
          setError(`${err.response.data.message}: ${err.response.data.error}`);
        } else {
          // Si l'erreur contient seulement un message
          setError(err.response.data.message || 'Une erreur est survenue lors de la mise à jour de votre profil.');
        }
      } else {
        // Erreur générique
        setError('Une erreur est survenue lors de la mise à jour de votre profil.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Modifier mon profil
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/profile')}
        >
          Retour au profil
        </Button>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                {formData.prenom?.[0] || formData.nom?.[0] || <PersonIcon fontSize="large" />}
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                {formData.prenom} {formData.nom}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.email}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" paragraph>
                Mettez à jour vos informations personnelles pour faciliter vos futures réservations.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vos informations sont sécurisées et ne seront jamais partagées avec des tiers.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: 0,
                width: '50px',
                height: '3px',
                backgroundColor: 'secondary.main'
              }
            }}>
              Informations personnelles
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  '& .MuiAlert-message': { 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontWeight: 500 
                  } 
                }}
                variant="filled"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Erreur détectée :
                </Typography>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Informations de base */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                {/* Civilité */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Civilité"
                    name="civilite"
                    value={formData.civilite}
                    onChange={handleChange}
                    variant="outlined"
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value=""></option>
                    <option value="M.">M.</option>
                    <option value="Mme">Mme</option>
                  </TextField>
                </Grid>
                
                {/* CIN/Passport */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="CIN/Passport"
                    name="cinPassport"
                    value={formData.cinPassport}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                
                {/* Contact */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    required
                    InputProps={{
                      startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
                    }}
                  />
                </Grid>
                
                {/* Dates */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de naissance"
                    name="dateNaissance"
                    type="date"
                    value={formData.dateNaissance || ''}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date de délivrance du permis"
                    name="datePermit"
                    type="date"
                    value={formData.datePermit || ''}
                    onChange={handleChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                {/* Permis */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Numéro de permis"
                    name="numeroPermit"
                    value={formData.numeroPermit}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                
                {/* Adresse */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{
                        py: 1.5,
                        px: 4,
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #000000 30%, #333333 90%)',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      Enregistrer mes infos
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Vos informations ont été mises à jour avec succès!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EditProfile;
