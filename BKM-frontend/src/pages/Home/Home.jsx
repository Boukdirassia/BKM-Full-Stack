import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Paper,
  MenuItem,
  Divider,
  Rating,
  Avatar,
  CircularProgress,
  Chip,
  FormControl,
  Select,
  useTheme,
  alpha,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  AttachMoney,
  LocationOn,
  FlightTakeoff,
  LocationCity,
  Cancel,
  Star,
  LocalShipping,
  FamilyRestroom,
  LocationSearching,
  DirectionsCar,
  Person as PersonIcon,
  Luggage as LuggageIcon,
  Settings as SettingsIcon,
  LocalGasStation as LocalGasStationIcon,
  AccessTime,
  Phone,
  Email,
  Send as SendIcon,
  AlternateEmail as EmailIcon,
  Message as MessageIcon,
  Facebook,
  Twitter,
  Instagram
} from '@mui/icons-material';
import voitureService from '../../services/voitureService';
import { LOCATIONS } from '../../constants/locationConstants';

// Images d'arrière-plan
const backgroundImages = [
  'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg', // Voiture noire 1
  'https://images.pexels.com/photos/909907/pexels-photo-909907.jpeg', // Voiture noire 2
  'https://images.pexels.com/photos/831475/pexels-photo-831475.jpeg', // Voiture noire 3
  'https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg' // Voiture noire 4
];

// Fonction pour obtenir l'URL de l'image d'un véhicule
const getCarImageUrl = (vehicle) => {
  // Utiliser le format qui fonctionne dans l'admin
  return `http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}`;
};

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const contactForm = useRef();
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSubmitStatus, setContactSubmitStatus] = useState(null);
  const [contactSnackbarOpen, setContactSnackbarOpen] = useState(false);
  
  // Fonction pour gérer l'envoi du formulaire de contact
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactSubmitStatus(null);
    
    try {
      // Créer un objet FormData à partir du formulaire
      const formData = new FormData(contactForm.current);
      
      // Ajouter l'email de destination
      formData.append('_to', 'bkassia082@gmail.com');
      formData.append('_subject', 'Nouveau message du site BKM Rental');
      
      // Envoyer le formulaire via FormSubmit
      const response = await fetch('https://formsubmit.co/ajax/bkassia082@gmail.com', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success === 'true' || result.success === true) {
        setContactSubmitStatus('success');
        setContactSnackbarOpen(true);
        contactForm.current.reset();
      } else {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }
    } catch (error) {
      console.error('Erreur d\'envoi:', error);
      setContactSubmitStatus('error');
      setContactSnackbarOpen(true);
    } finally {
      setIsSubmittingContact(false);
    }
  };
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    pickupDate: '',
    pickupTime: '',
    returnLocation: '',
    returnDate: '',
    returnTime: ''
  });

  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lieuxDepart, setLieuxDepart] = useState(LOCATIONS.map(lieu => ({ name: lieu })));
  const [lieuxArrivee, setLieuxArrivee] = useState(LOCATIONS.map(lieu => ({ name: lieu })));
  const [loadingLieux, setLoadingLieux] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async () => {
    // Vérifier que tous les champs sont renseignés
    if (!searchData.pickupLocation) {
      setSearchError('Veuillez sélectionner un lieu de prise en charge');
      return;
    }
    
    if (!searchData.pickupDate) {
      setSearchError('Veuillez sélectionner une date de départ');
      return;
    }
    
    if (!searchData.pickupTime) {
      setSearchError('Veuillez sélectionner une heure de départ');
      return;
    }
    
    if (!searchData.returnLocation) {
      setSearchError('Veuillez sélectionner un lieu de retour');
      return;
    }
    
    if (!searchData.returnDate) {
      setSearchError('Veuillez sélectionner une date de retour');
      return;
    }
    
    if (!searchData.returnTime) {
      setSearchError('Veuillez sélectionner une heure de retour');
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      
      // Formater les dates pour l'API
      const dateDebut = `${searchData.pickupDate}T${searchData.pickupTime || '00:00'}`;
      const dateFin = `${searchData.returnDate}T${searchData.returnTime || '00:00'}`;
      
      // Vérifier qu'il y a des véhicules disponibles pour ces dates
      const availableVehicles = await voitureService.checkVoituresAvailability(dateDebut, dateFin);
      
      // Créer l'URL avec les paramètres de recherche
      const searchParams = new URLSearchParams({
        pickupLocation: searchData.pickupLocation,
        pickupDate: searchData.pickupDate,
        pickupTime: searchData.pickupTime || '10:00',
        returnLocation: searchData.returnLocation,
        returnDate: searchData.returnDate,
        returnTime: searchData.returnTime || '10:00',
        step: '2' // Pour afficher directement l'étape des véhicules disponibles
      });

      // Naviguer vers la page de réservation avec les paramètres
      navigate(`/reserver?${searchParams.toString()}`);
      
      // Si aucun véhicule n'est disponible, afficher une alerte
      if (availableVehicles.length === 0) {
        alert('Aucun véhicule disponible pour les dates sélectionnées. Vous serez redirigé vers la page de réservation où vous pourrez choisir d\'autres dates.');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      setSearchError('Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Fonction pour formater les données des véhicules
  const formatVehicleData = (vehicles) => {
    return vehicles.map(vehicle => {
      // S'assurer que les champs Places, Portes et Transmission sont correctement définis
      const places = vehicle.Places !== undefined && vehicle.Places !== null ? vehicle.Places : null;
      const portes = vehicle.Portes !== undefined && vehicle.Portes !== null ? vehicle.Portes : null;
      const transmission = vehicle.Transmission !== undefined && vehicle.Transmission !== null ? vehicle.Transmission : null;
      
      return {
        ...vehicle,
        Places: places,
        Portes: portes,
        Transmission: transmission
      };
    });
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await voitureService.getAvailableVoitures();
        console.log("Véhicules récupérés:", data);
        
        // Formater les données des véhicules pour s'assurer que les champs Places, Portes et Transmission sont correctement définis
        const formattedData = formatVehicleData(data);
        console.log("Véhicules formatés:", formattedData);
        
        setVehicles(formattedData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des véhicules:', err);
        setError('Impossible de charger les véhicules. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);
  
  // Les lieux sont maintenant chargés depuis les constantes LOCATIONS
  // Aucun besoin de fetchLieux ou d'useEffect pour les récupérer
  
  // Log des informations sur les véhicules lors du rendu
  useEffect(() => {
    if (vehicles.length > 0) {
      console.log("Véhicules pour le rendu:", vehicles);
      vehicles.forEach(vehicle => {
        console.log(`Véhicule ${vehicle.VoitureID}:`, {
          Marque: vehicle.Marque,
          Modele: vehicle.Modele,
          Photo: vehicle.Photo,
          URL: `http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}`
        });
      });
    }
  }, [vehicles]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Section with Background Slider */}
      <Box
        sx={{
          position: 'relative',
          height: 'auto',
          minHeight: { xs: '550px', sm: '650px' },
          width: '100%',
          overflow: 'hidden',
          paddingBottom: '30px'
        }}
      >
        {/* Background Image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.6)',
              zIndex: 1
            },
            '& > img': {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'opacity 1s ease-in-out'
            }
          }}
        >
          {backgroundImages.map((bg, index) => (
            <img
              key={index}
              src={bg}
              alt={`background-${index + 1}`}
              style={{
                opacity: currentBgIndex === index ? 1 : 0,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ))}
        </Box>

        {/* Hero Content */}
        <Container
          sx={{
            position: 'relative',
            zIndex: 2,
            height: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            pt: { xs: 4, sm: 8 }
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 500,
              mb: 2,
              fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
              maxWidth: { xs: '95%', sm: '800px' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >

          </Typography>

          {/* Formulaire de Réservation Premium */}
          <Paper
            elevation={24}
            sx={{
              p: 0,
              mt: { xs: 2, sm: 3, md: 4 },
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255,215,0,0.3)',
              width: '100%',
              maxWidth: { xs: '95%', sm: '750px' },
              overflow: 'visible',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.1)',
              position: 'relative',
              zIndex: 5,
              mb: { xs: 3, sm: 4 },
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.15)'
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                background: 'linear-gradient(45deg, transparent, rgba(255,215,0,0.1), transparent)',
                borderRadius: '18px',
                zIndex: -1,
                animation: 'borderGlow 4s linear infinite',
                opacity: 0.7
              },
              '@keyframes borderGlow': {
                '0%': { opacity: 0.3 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 0.3 }
              }
            }}
          >
            {/* En-tête du formulaire */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(15,15,15,0.95) 100%)',
                p: { xs: 2.5, sm: 3 },
                borderBottom: '2px solid rgba(255,215,0,0.3)',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                  boxShadow: '0 0 20px 5px rgba(255,215,0,0.4)'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at top right, rgba(255,215,0,0.15), transparent 70%)',
                  opacity: 0.7,
                  zIndex: 0
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#FFD700',
                    textAlign: 'center',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    mb: 1.5,
                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                    textShadow: '0 2px 10px rgba(255,215,0,0.5), 0 0 30px rgba(255,215,0,0.2)',
                    pt: 0.5,
                    position: 'relative',
                    display: 'inline-block',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                      transform: 'translateX(-50%)',
                      borderRadius: '2px',
                      boxShadow: '0 2px 8px rgba(255,215,0,0.5)'
                    },
                    animation: 'fadeInDown 0.8s ease-out'
                  }}
                >
                  RÉSERVEZ VOTRE VOITURE
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#ffffff',
                    textAlign: 'center',
                    maxWidth: '85%',
                    mx: 'auto',
                    mb: 2,
                    fontWeight: 400,
                    lineHeight: 1.5,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    letterSpacing: '0.5px',
                    opacity: 0.9,
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    animation: 'fadeInUp 0.8s ease-out 0.2s both'
                  }}
                >
                  Trouvez le véhicule parfait pour votre prochain voyage en quelques clics
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    mb: 1.5,
                    animation: 'fadeIn 1s ease-out 0.4s both'
                  }}
                >
                  {['#FFD700', '#FFFFFF', '#FFD700'].map((color, index) => (
                    <Box 
                      key={index}
                      sx={{
                        width: index === 1 ? '8px' : '5px',
                        height: index === 1 ? '8px' : '5px',
                        borderRadius: '50%',
                        bgcolor: color,
                        opacity: index === 1 ? 0.9 : 0.6,
                        boxShadow: index === 1 ? '0 0 10px rgba(255,215,0,0.5)' : 'none'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Corps du formulaire */}
            <Box 
              sx={{ 
                p: { xs: 2, sm: 3 },
                background: 'linear-gradient(to bottom, rgba(20,20,20,0.9), rgba(10,10,10,0.95))'
              }}
            >
              {/* Espace supplémentaire pour la séparation */}
              <Box sx={{ mb: 1 }} />
              <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                {/* Départ */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(25,25,25,0.8)',
                      border: '1px solid rgba(255,215,0,0.2)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        borderColor: 'rgba(255,215,0,0.4)',
                        '& .hover-effect': {
                          opacity: 1,
                          transform: 'scale(1.03)'
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,215,0,0.1), transparent 70%)',
                        opacity: 0.7,
                        zIndex: 0
                      }
                    }}
                  >
                    <Box 
                      className="hover-effect"
                      sx={{ 
                        position: 'relative', 
                        zIndex: 1,
                        transition: 'all 0.3s ease',
                        opacity: 0.95,
                        transform: 'scale(1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,215,0,0.15)',
                            mr: 2,
                            border: '2px solid rgba(255,215,0,0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          <FlightTakeoff sx={{ color: '#FFD700', fontSize: 22 }} />
                        </Box>
                        <Typography
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            letterSpacing: 0.5,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                        >
                          Informations de Départ
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2.5 }}>
                        <Typography
                          sx={{
                            color: '#e0e0e0',
                            mb: 1,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 500
                          }}
                        >
                          <LocationOn sx={{ color: '#FFD700', mr: 1, fontSize: 18 }} />
                          Lieu de prise en charge
                        </Typography>
                        <FormControl fullWidth variant="outlined" size="small">
                          <Select
                            value={searchData.pickupLocation}
                            onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                            displayEmpty
                            sx={{
                              bgcolor: 'rgba(30,30,30,0.9)',
                              color: '#ffffff',
                              borderRadius: '4px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,215,0,0.5)',
                                borderWidth: '1px',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                                borderWidth: '1px',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                                borderWidth: '2px',
                              },
                              '& .MuiSelect-icon': {
                                color: '#FFD700'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: '#222222',
                                  border: '1px solid #FFD700',
                                  borderRadius: '4px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                  '& .MuiMenuItem-root': {
                                    color: '#ffffff',
                                    fontSize: '0.9rem',
                                    padding: '10px 16px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,215,0,0.2)'
                                    },
                                    '&.Mui-selected': {
                                      bgcolor: 'rgba(255,215,0,0.3)',
                                      '&:hover': {
                                        bgcolor: 'rgba(255,215,0,0.4)'
                                      }
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em style={{ color: '#aaaaaa' }}>Sélectionner un lieu</em>
                            </MenuItem>
                            {LOCATIONS.map((lieu) => (
                              <MenuItem key={lieu} value={lieu}>
                                {lieu}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            sx={{
                              color: '#e0e0e0',
                              mb: 1,
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 500
                            }}
                          >
                            <AccessTime sx={{ color: '#FFD700', mr: 1, fontSize: 18 }} />
                            Date
                          </Typography>
                          <TextField
                            type="date"
                            fullWidth
                            placeholder="jj/mm/aaaa"
                            value={searchData.pickupDate}
                            onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                            size="small"
                            InputProps={{
                              sx: {
                                bgcolor: 'rgba(30,30,30,0.9)',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '0.85rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.5)',
                                  borderWidth: '1px',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.8)',
                                  borderWidth: '1px',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#FFD700',
                                  borderWidth: '2px',
                                },
                                transition: 'all 0.2s ease'
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            sx={{
                              color: '#e0e0e0',
                              mb: 1,
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 500
                            }}
                          >
                            <AccessTime sx={{ color: '#FFD700', mr: 1, fontSize: 18 }} />
                            Heure
                          </Typography>
                          <TextField
                            type="time"
                            fullWidth
                            placeholder="--:--"
                            value={searchData.pickupTime}
                            onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                            size="small"
                            InputProps={{
                              sx: {
                                bgcolor: 'rgba(30,30,30,0.9)',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '0.85rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.5)',
                                  borderWidth: '1px',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.8)',
                                  borderWidth: '1px',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#FFD700',
                                  borderWidth: '2px',
                                },
                                transition: 'all 0.2s ease'
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>

                {/* Arrivée */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(25,25,25,0.8)',
                      border: '1px solid rgba(255,215,0,0.2)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                        borderColor: 'rgba(255,215,0,0.4)',
                        '& .hover-effect': {
                          opacity: 1,
                          transform: 'scale(1.03)'
                        }
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle at top right, rgba(255,215,0,0.1), transparent 70%)',
                        opacity: 0.7,
                        zIndex: 0
                      }
                    }}
                  >
                    <Box 
                      className="hover-effect"
                      sx={{ 
                        position: 'relative', 
                        zIndex: 1,
                        transition: 'all 0.3s ease',
                        opacity: 0.95,
                        transform: 'scale(1)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: 'rgba(255,215,0,0.15)',
                            mr: 2,
                            border: '2px solid rgba(255,215,0,0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          <LocationCity sx={{ color: '#FFD700', fontSize: 22 }} />
                        </Box>
                        <Typography
                          sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            letterSpacing: 0.5,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                        >
                          Informations de Retour
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2.5 }}>
                        <Typography
                          sx={{
                            color: '#e0e0e0',
                            mb: 1,
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 500
                          }}
                        >
                          <LocationOn sx={{ color: '#FFD700', mr: 1, fontSize: 18 }} />
                          Lieu de retour
                        </Typography>
                        <FormControl fullWidth variant="outlined" size="small">
                          <Select
                            value={searchData.returnLocation}
                            onChange={(e) => handleInputChange('returnLocation', e.target.value)}
                            displayEmpty
                            sx={{
                              bgcolor: 'rgba(30,30,30,0.9)',
                              color: '#ffffff',
                              borderRadius: '4px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255,215,0,0.5)',
                                borderWidth: '1px',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                                borderWidth: '1px',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#FFD700',
                                borderWidth: '2px',
                              },
                              '& .MuiSelect-icon': {
                                color: '#FFD700'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  bgcolor: '#222222',
                                  border: '1px solid #FFD700',
                                  borderRadius: '4px',
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                  '& .MuiMenuItem-root': {
                                    color: '#ffffff',
                                    fontSize: '0.9rem',
                                    padding: '10px 16px',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      bgcolor: 'rgba(255,215,0,0.2)'
                                    },
                                    '&.Mui-selected': {
                                      bgcolor: 'rgba(255,215,0,0.3)',
                                      '&:hover': {
                                        bgcolor: 'rgba(255,215,0,0.4)'
                                      }
                                    }
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em style={{ color: '#aaaaaa' }}>Sélectionner un lieu</em>
                            </MenuItem>
                            {LOCATIONS.map((lieu) => (
                              <MenuItem key={lieu} value={lieu}>
                                {lieu}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            sx={{
                              color: '#e0e0e0',
                              mb: 1,
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 500
                            }}
                          >
                            <AccessTime sx={{ color: '#FFD700', mr: 1, fontSize: 18 }} />
                            Date
                          </Typography>
                          <TextField
                            type="date"
                            fullWidth
                            placeholder="jj/mm/aaaa"
                            value={searchData.returnDate}
                            onChange={(e) => handleInputChange('returnDate', e.target.value)}
                            size="small"
                            InputProps={{
                              sx: {
                                bgcolor: 'rgba(30,30,30,0.9)',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '0.85rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.5)',
                                  borderWidth: '1px',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.8)',
                                  borderWidth: '1px',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#FFD700',
                                  borderWidth: '2px',
                                },
                                transition: 'all 0.2s ease'
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography
                            sx={{
                              color: '#e0e0e0',
                              mb: 1,
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 500
                            }}
                          >
                            <AccessTime sx={{ color: '#FFD700', mr: 1, fontSize: 18 }} />
                            Heure
                          </Typography>
                          <TextField
                            type="time"
                            fullWidth
                            placeholder="--:--"
                            value={searchData.returnTime}
                            onChange={(e) => handleInputChange('returnTime', e.target.value)}
                            size="small"
                            InputProps={{
                              sx: {
                                bgcolor: 'rgba(30,30,30,0.9)',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '0.85rem',
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.5)',
                                  borderWidth: '1px',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'rgba(255,215,0,0.8)',
                                  borderWidth: '1px',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#FFD700',
                                  borderWidth: '2px',
                                },
                                transition: 'all 0.2s ease'
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>

                {/* Error Message */}
                {searchError && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(255,107,107,0.15)',
                        borderRadius: 2,
                        border: '1px solid rgba(255,107,107,0.4)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.8 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.8 }
                        }
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#ff8080',
                          textAlign: 'center',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }}
                      >
                        <Cancel sx={{ mr: 1, fontSize: 22, color: '#ff4d4d' }} />
                        {searchError}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Pied du formulaire avec bouton de recherche */}
            <Box
              sx={{
                p: { xs: 3.5, sm: 4 },
                background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(10,10,10,0.98))',
                borderTop: '1px solid rgba(255,215,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 10,
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at center, rgba(255,215,0,0.1), transparent 70%)',
                  opacity: 0.7,
                  zIndex: 0
                }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '500px',
                  zIndex: 1,
                  animation: 'fadeInUp 0.8s ease-out 0.6s both'
                }}
              >
                <Button 
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={isSearching}
                  startIcon={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      animation: isSearching ? 'none' : 'pulse 2s infinite'
                    }}>
                      {isSearching ? 
                        <CircularProgress size={20} color="inherit" /> : 
                        <DirectionsCar sx={{ fontSize: '1.2rem' }} />
                      }
                    </Box>
                  }
                  sx={{
                    background: 'linear-gradient(45deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)',
                    color: '#000',
                    fontWeight: 800,
                    py: { xs: 1.5, sm: 1.8 },
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    borderRadius: '50px',
                    textTransform: 'uppercase',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4), 0 0 15px rgba(255,215,0,0.3)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    letterSpacing: '1.5px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' }
                    },
                    '&:hover': {
                      background: 'linear-gradient(45deg, #D4AF37 0%, #FFD700 30%, #D4AF37 100%)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,215,0,0.4)',
                      transform: 'translateY(-3px) scale(1.02)',
                      letterSpacing: '2px',
                    },
                    '&:active': {
                      transform: 'translateY(2px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'all 0.5s ease',
                    },
                    '&:hover::before': {
                      left: '100%'
                    },
                    mb: { xs: 0.5, sm: 0 }
                  }}
                >
                  {isSearching ? 'Recherche en cours...' : 'RECHERCHER UN VÉHICULE'}
                </Button>
              </Box>
              
              {/* Le texte "Prix garantis sans frais cachés" a été supprimé */}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Services Section */}
      <Box 
        id="services"
        sx={{ 
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23000000\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '180px',
            opacity: 0.5,
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                position: 'relative',
                display: 'inline-block',
                mb: 3,
                background: 'linear-gradient(90deg, #000000, #333333)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              Nos Services
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                maxWidth: '700px', 
                mx: 'auto', 
                mb: 2,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6
              }}
            >
              Découvrez nos services premium conçus pour rendre votre expérience de location exceptionnelle
            </Typography>
            <Box 
              sx={{ 
                width: '60px', 
                height: '4px', 
                background: 'linear-gradient(90deg, #FFD700, #FDB931)', 
                mx: 'auto',
                borderRadius: '2px',
                mb: 6
              }} 
            />
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <FamilyRestroom />,
                title: 'Service Familial',
                description: 'Des véhicules adaptés à toute la famille avec sièges enfants disponibles sur demande',
                color: '#FF6B6B',
                delay: 0
              },
              {
                icon: <AttachMoney />,
                title: 'Meilleur Prix Garanti',
                description: 'Prix compétitifs et transparents, sans frais cachés. Garantie du meilleur tarif',
                color: '#4ECDC4',
                delay: 100
              },
              {
                icon: <Cancel />,
                title: 'Annulation Gratuite',
                description: 'Annulation flexible et gratuite jusqu\'à 24h avant la prise du véhicule',
                color: '#FFD700',
                delay: 200
              },
              {
                icon: <LocalShipping />,
                title: 'Livraison & Réception',
                description: 'Service de livraison et récupération du véhicule à l\'adresse de votre choix',
                color: '#6A0572',
                delay: 300
              },
              {
                icon: <Star />,
                title: 'Qualité & Expérience',
                description: 'Plus de 10 ans d\'expérience avec une flotte de véhicules premium régulièrement renouvelée',
                color: '#F9A826',
                delay: 400
              },
              {
                icon: <LocationSearching />,
                title: 'GPS Inclus',
                description: 'Système GPS intégré dans tous nos véhicules pour une navigation facile et sûre',
                color: '#1A535C',
                delay: 500
              }
            ].map((service, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={index}
                sx={{
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(40px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)'
                    }
                  },
                  animation: `fadeInUp 0.6s ease-out ${service.delay}ms both`
                }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    height: '100%',
                    backgroundColor: 'white',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: '90%',
                    mx: 'auto',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: `linear-gradient(90deg, ${service.color}, ${service.color}CC)`,
                      transition: 'height 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.01)',
                      boxShadow: '0 15px 25px rgba(0,0,0,0.1)',
                      '&::before': {
                        height: '8px'
                      },
                      '& .service-icon': {
                        transform: 'rotateY(360deg)',
                        color: service.color,
                        backgroundColor: `${service.color}22`
                      },
                      '& .service-title': {
                        color: service.color
                      },
                      '& .service-description': {
                        color: '#000'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <Box
                      className="service-icon"
                      sx={{
                        fontSize: 32,
                        color: '#333',
                        mb: 2.5,
                        transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        width: '75px',
                        height: '75px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                        '& > svg': {
                          fontSize: 'inherit'
                        }
                      }}
                    >
                      {service.icon}
                    </Box>
                    <Typography
                      className="service-title"
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 700,
                        mb: 1.5,
                        color: '#1a1a1a',
                        fontSize: '1.1rem',
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-6px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '30px',
                          height: '2px',
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          transition: 'width 0.3s ease, background-color 0.3s ease'
                        },
                        '&:hover::after': {
                          width: '60px',
                          backgroundColor: service.color
                        }
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      className="service-description"
                      sx={{
                        lineHeight: 1.5,
                        fontSize: '0.85rem',
                        color: 'text.secondary',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {service.description}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pas de section de résultats de recherche ici - la redirection se fait vers la page de réservation */}

      {/* Featured Cars Section */}
      <Box sx={{ bgcolor: '#1a1a1a', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              mb: 6, 
              textAlign: 'center', 
              color: 'white',
              fontWeight: 600,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 80,
                height: 3,
                bgcolor: '#FFD700'
              }
            }}
          >
            Nos Véhicules
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress sx={{ color: '#FFD700' }} />
            </Box>
          ) : error ? (
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'error.main', my: 4 }}>
              {error}
            </Typography>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
              {vehicles.slice(0, 4).map((vehicle) => (
                <Grid item xs={12} sm={6} md={3} key={vehicle.VoitureID}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#1a1a1a',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid #333',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 15px 35px rgba(255, 215, 0, 0.2), 0 5px 15px rgba(0,0,0,0.5)',
                        border: '1px solid #FFD700',
                        '& .car-image': {
                          transform: 'translate(-50%, -50%) scale(1.08)',
                        },
                        '& .car-badge': {
                          transform: 'translateY(0)',
                          opacity: 1
                        },
                        '& .car-specs': {
                          height: '120px',
                          opacity: 1,
                          visibility: 'visible'
                        },
                        '& .car-price': {
                          transform: 'scale(1.1)',
                        }
                      }
                    }}
                  >
                    {/* Badge de catégorie */}
                    <Chip 
                      label={vehicle.Categorie || vehicle.Type || 'Standard'}
                      className="car-badge"
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 10,
                        bgcolor: '#FFD700',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        transform: 'translateY(-20px)',
                        opacity: 0.9,
                        transition: 'all 0.3s ease',
                      }}
                    />
                    
                    {/* Image du véhicule */}
                    <Box sx={{ 
                      position: 'relative', 
                      height: { xs: 180, sm: 200 }, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #262626 0%, #1a1a1a 100%)',
                      borderBottom: '2px solid #333',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '30%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        zIndex: 1
                      }
                    }}>
                      <CardMedia
                        component="img"
                        className="car-image"
                        image={getCarImageUrl(vehicle)}
                        alt={`${vehicle.Marque} ${vehicle.Modele}`}
                        onError={(e) => {
                          console.log(`Erreur de chargement pour ${vehicle.Marque} ${vehicle.Modele}. Essai de fallbacks.`);
                          e.target.onerror = null; // Éviter les boucles infinies
                          
                          // Essayer avec une extension .png
                          if (!e.target.src.includes('.png')) {
                            e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}.png`;
                            return;
                          }
                          
                          // Essayer avec une extension .jpg
                          if (e.target.src.includes('.png')) {
                            e.target.src = e.target.src.replace('.png', '.jpg');
                            return;
                          }
                          
                          // Essayer sur le port 3000
                          if (e.target.src.includes('4000')) {
                            e.target.src = e.target.src.replace('4000', '3000');
                            return;
                          }
                          
                          // Utiliser directement le SVG inline comme fallback final
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='18' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${vehicle.Marque} ${vehicle.Modele}%3C/text%3E%3C/svg%3E`;
                        }}
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '90%',
                          height: '90%',
                          objectFit: 'contain',
                          bgcolor: 'transparent',
                          transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          zIndex: 2
                        }}
                      />
                      
                      {/* Prix affiché sur l'image */}
                      <Box
                        className="car-price"
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: 16,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: '#FFD700',
                          fontWeight: 'bold',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: '2px solid #FFD700',
                          zIndex: 5,
                          transition: 'transform 0.3s ease',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {vehicle.Prix} DH
                          <Typography component="span" variant="caption" sx={{ fontSize: '0.6em', ml: 0.5, color: '#ccc' }}>
                            /jour
                          </Typography>
                        </Typography>
                      </Box>
                    </Box>
                    
                    {/* Informations du véhicule */}
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      p: { xs: 1.5, sm: 2, md: 2.5 }, 
                      bgcolor: '#1a1a1a',
                      borderTop: '1px solid #222'
                    }}>
                      <Typography 
                        variant="h5"
                        sx={{ 
                          color: 'white',
                          fontWeight: 700,
                          mb: 1.5,
                          fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem' },
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {vehicle.Marque} {vehicle.Modele}
                      </Typography>
                      
                      <Typography 
                        variant="body2"
                        sx={{ 
                          color: '#aaa',
                          mb: 2
                        }}
                      >
                        {vehicle.Annee || 'Récent'} • {vehicle.Type || 'Essence'}
                      </Typography>
                      
                      {/* Caractéristiques détaillées du véhicule avec animation */}
                      <Box 
                        className="car-specs"
                        sx={{ 
                          height: '0px',
                          opacity: 0,
                          visibility: 'hidden',
                          overflow: 'visible', /* Changé de 'hidden' à 'visible' pour éviter la troncature */
                          transition: 'all 0.4s ease',
                          mb: 1.5,
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <PersonIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                {vehicle.Places ? `${vehicle.Places} places` : 'Non spécifié'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <LuggageIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                              <Typography variant="body2" sx={{ color: '#fff' }}>
                                {vehicle.Portes ? `${vehicle.Portes} portes` : 'Non spécifié'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <SettingsIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                              {vehicle.Transmission ? (
                                <Chip 
                                  label={vehicle.Transmission} 
                                  size="small"
                                  sx={{
                                    backgroundColor: 'transparent',
                                    color: '#fff',
                                    fontWeight: 'medium',
                                    marginLeft: '-8px',
                                    '& .MuiChip-label': {
                                      px: 1
                                    }
                                  }}
                                />
                              ) : (
                                <span style={{ color: '#fff', fontSize: '0.875rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                                  Non spécifié
                                </span>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <LocalGasStationIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                              <Typography variant="body2" sx={{ color: '#fff' }}>{vehicle.Type || 'Essence'}</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </CardContent>
                    
                    {/* Bouton de réservation avec effet de brillance */}
                    <CardActions sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, bgcolor: '#1a1a1a', borderTop: '1px solid #222' }}>
                      <Button 
                        component={Link}
                        to={`/reserver`}
                        variant="contained"
                        fullWidth
                        sx={{ 
                          bgcolor: '#FFD700',
                          color: '#000',
                          fontWeight: 700,
                          py: { xs: 1, sm: 1.2 },
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          borderRadius: '30px',
                          textTransform: 'none',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                          '&:hover': {
                            bgcolor: '#e6c300',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-50%',
                            left: '-50%',
                            width: '200%',
                            height: '200%',
                            background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                            transform: 'rotate(30deg)',
                            transition: 'all 0.5s ease',
                            opacity: 0,
                          },
                          '&:hover::after': {
                            opacity: 1,
                            left: '100%',
                            transition: 'all 0.8s ease',
                          }
                        }}
                      >
                        Réserver maintenant
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button 
              component={Link} 
              to="/vehicules"
              variant="outlined"
              sx={{
                color: '#FFD700',
                borderColor: '#FFD700',
                '&:hover': {
                  borderColor: '#e6c200',
                  bgcolor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              Voir tous les véhicules
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box 
        id="avis" 
        sx={{ 
          py: { xs: 6, sm: 8, md: 10 },
          background: 'linear-gradient(180deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.5,
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60px',
                  height: '4px',
                  bottom: '-10px',
                  left: 'calc(50% - 30px)',
                  backgroundColor: '#FFD700',
                  borderRadius: '2px'
                }
              }}
            >
              Ce que disent nos Clients
            </Typography>
          </Box>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {[
              {
                name: 'Mohammed El Amrani',
                location: 'Casablanca',
                comment: 'Service exceptionnel ! La voiture était impeccable et le personnel très professionnel. Je recommande vivement pour la location de voiture à Casablanca.',
                rating: 5,
                date: 'Avril 2025'
              },
              {
                name: 'Fatima Benali',
                location: 'Rabat',
                comment: 'Très satisfaite de mon expérience. Les prix sont raisonnables et le service client est excellent. Je relouerai certainement chez eux.',
                rating: 5,
                date: 'Mars 2025'
              },
              {
                name: 'Karim Tazi',
                location: 'Marrakech',
                comment: 'Une agence sérieuse avec des voitures bien entretenues. La prise en charge était rapide et le personnel très aimable.',
                rating: 5,
                date: 'Février 2025'
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ 
                    p: 3,
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Icône de guillemet */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        fontSize: 40,
                        color: 'rgba(255,215,0,0.2)',
                        transform: 'rotate(180deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      "
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Rating 
                        value={testimonial.rating} 
                        readOnly 
                        sx={{ 
                          '& .MuiRating-iconFilled': {
                            color: '#FFD700'
                          }
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{ 
                        fontStyle: 'italic',
                        flex: 1,
                        color: 'text.primary',
                        fontWeight: 400,
                        lineHeight: 1.7
                      }}
                    >
                      {testimonial.comment}
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: '#FFD700', 
                          mr: 2,
                          width: 50,
                          height: 50,
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                      >
                        {testimonial.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.location} • {testimonial.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Section Contact */}
      <Box 
        id="contact" 
        sx={{ 
          py: 10, 
          bgcolor: '#1a1a1a', 
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10.5%)',
            backgroundSize: '20px 20px',
            opacity: 0.2,
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{
                fontWeight: 'bold',
                position: 'relative',
                display: 'inline-block',
                mb: 2,
                color: 'white', // Texte blanc sur fond noir
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60px',
                  height: '4px',
                  bottom: '-10px',
                  left: 'calc(50% - 30px)',
                  backgroundColor: '#FFD700', // Couleur or du site
                  borderRadius: '2px'
                }
              }}
            >
              Nous Contacter
            </Typography>

          </Box>

          <Card 
            elevation={8} 
            sx={{ 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <Grid container>
              {/* Formulaire de contact */}
              <Grid item xs={12} md={7}>
                <CardContent sx={{ p: 4, pt: 5, pb: 5 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      '&::before': {
                        content: '""',
                        width: '4px',
                        height: '24px',
                        backgroundColor: '#FFD700', // Couleur or du site
                        marginRight: '12px',
                        borderRadius: '4px'
                      }
                    }}
                  >
                    Envoyez-nous un message
                  </Typography>
                  
                  <Box component="form" ref={contactForm} onSubmit={handleContactSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          variant="outlined"
                          name="nom"
                          required
                          InputProps={{
                            startAdornment: <PersonIcon color="disabled" sx={{ mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.light,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          variant="outlined"
                          name="prenom"
                          required
                          InputProps={{
                            startAdornment: <PersonIcon color="disabled" sx={{ mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.light,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          variant="outlined"
                          name="email"
                          required
                          InputProps={{
                            startAdornment: <EmailIcon color="disabled" sx={{ mr: 1 }} />
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.light,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message"
                          multiline
                          rows={5}
                          variant="outlined"
                          name="message"
                          required
                          InputProps={{
                            startAdornment: (
                              <Box sx={{ pt: 1.5 }}>
                                <MessageIcon color="disabled" sx={{ mr: 1 }} />
                              </Box>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              '&:hover fieldset': {
                                borderColor: theme.palette.primary.light,
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          type="submit"
                          disabled={isSubmittingContact}
                          startIcon={isSubmittingContact ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                          sx={{
                            py: 1.5,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                            }
                          }}
                        >
                          {isSubmittingContact ? 'Envoi en cours...' : 'Envoyer le message'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Grid>
              
              {/* Informations de contact */}
              <Grid item xs={12} md={5}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #333333 60%, #FFD700 150%)', // Dégradé noir et jaune
                  color: 'white', // Texte blanc pour meilleure lisibilité
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '150px',
                    height: '150px',
                    background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, rgba(255,215,0,0) 70%)',
                    zIndex: 0
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0) 70%)',
                    zIndex: 0
                  }
                }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      mb: 4,
                      color: '#FFD700', // Texte doré sur fond noir
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '40px',
                        height: '3px',
                        bottom: '-10px',
                        left: 0,
                        backgroundColor: '#FFD700', // Couleur or du site
                        borderRadius: '2px'
                      }
                    }}
                  >
                    Informations de contact
                  </Typography>
                  
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ 
                          bgcolor: alpha('#fff', 0.2), 
                          p: 1, 
                          borderRadius: '50%',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <LocationOn sx={{ color: '#FFD700' }} />
                        </Box>
                        <Typography sx={{ color: 'white' }}>
                          Oulfa Street, Casablanca City, MA 20230
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ 
                          bgcolor: alpha('#fff', 0.2), 
                          p: 1, 
                          borderRadius: '50%',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Phone sx={{ color: '#FFD700' }} />
                        </Box>
                        <Typography sx={{ color: 'white' }}>
                          +212 61 234 567
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ 
                          bgcolor: alpha('#fff', 0.2), 
                          p: 1, 
                          borderRadius: '50%',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Email sx={{ color: '#FFD700' }} />
                        </Box>
                        <Typography sx={{ color: 'white' }}>
                          Contact@bkmrentl.com
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Divider sx={{ borderColor: 'rgba(255,215,0,0.3)', my: 3 }} />
                      
                      <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                        Suivez-nous
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <IconButton sx={{ 
                          bgcolor: 'rgba(255,215,0,0.2)', 
                          color: '#FFD700',
                          '&:hover': { bgcolor: 'rgba(255,215,0,0.3)' }
                        }}>
                          <Facebook />
                        </IconButton>
                        <IconButton sx={{ 
                          bgcolor: 'rgba(255,215,0,0.2)', 
                          color: '#FFD700',
                          '&:hover': { bgcolor: 'rgba(255,215,0,0.3)' }
                        }}>
                          <Twitter />
                        </IconButton>
                        <IconButton sx={{ 
                          bgcolor: 'rgba(255,215,0,0.2)', 
                          color: '#FFD700',
                          '&:hover': { bgcolor: 'rgba(255,215,0,0.3)' }
                        }}>
                          <Instagram />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>
      
      {/* Notification de succès/erreur */}
      <Snackbar 
        open={contactSnackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setContactSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setContactSnackbarOpen(false)} 
          severity={contactSubmitStatus === 'success' ? "success" : "error"} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {contactSubmitStatus === 'success' 
            ? 'Votre message a été envoyé avec succès!' 
            : 'Une erreur s\'est produite. Veuillez réessayer plus tard.'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
