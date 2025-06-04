import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import reservationDataService from '../../services/reservationDataService';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  Alert,
  TextField,
  MenuItem,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Divider,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PersonIcon from '@mui/icons-material/Person';
import LuggageIcon from '@mui/icons-material/Luggage';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SpeedIcon from '@mui/icons-material/Speed';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import WifiIcon from '@mui/icons-material/Wifi';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SportsKabaddiIcon from '@mui/icons-material/SportsKabaddi';
import voitureService from '../../services/voitureService';
import reservationService from '../../services/reservationService';
import extraService from '../../services/extraService';
import { useAuth } from '../../context/AuthContext';

// Extras statiques à utiliser comme fallback si l'API échoue
const staticExtras = [
  {
    id: 'professional-driver',
    name: 'Conducteur professionnel',
    description: 'Un chauffeur expérimenté à votre service',
    price: 500,
    icon: DirectionsCarIcon,
    priceUnit: 'jour'
  },
  {
    id: 'limited-mileage',
    name: 'Kilométrage illimité',
    description: '200 km par jour inclus',
    price: 0,
    icon: SpeedIcon,
    priceUnit: 'jour'
  },
  {
    id: 'second-driver',
    name: '2ème conducteur',
    description: 'Ajoutez un conducteur supplémentaire',
    price: 100,
    icon: SupervisorAccountIcon,
    priceUnit: 'jour'
  },
  {
    id: 'baby-chair',
    name: 'Chaise de bébé',
    description: 'Siège auto homologué et adapté',
    price: 30,
    icon: ChildCareIcon,
    priceUnit: 'jour'
  }
];

const steps = ['DÉPART & RETOUR', 'VÉHICULE', 'EXTRAS', 'CONFIRMATION'];

const locations = [
  'Aéroport de Casa',
  'Aéroport de Fès',
  'Aéroport de Rabat',
  'Casablanca Ville',
  'Agence',
  'Aéroport de Marrakech',
  'Aéroport de Tanger'
];

const DepartRetour = ({ formData, setFormData, error }) => (
  <>
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}
    <Grid container spacing={4}>
      {/* Informations de départ */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Informations de départ
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Date et heure de départ"
                type="datetime-local"
                value={formData.dateDepart}
                onChange={(e) => setFormData({ ...formData, dateDepart: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Lieu de prise en charge</InputLabel>
                <Select
                  value={formData.lieuDepart}
                  label="Lieu de prise en charge"
                  onChange={(e) => setFormData({ ...formData, lieuDepart: e.target.value })}
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Informations d'arrivée */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Informations d'arrivée
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Date et heure de retour"
                type="datetime-local"
                value={formData.dateRetour}
                onChange={(e) => setFormData({ ...formData, dateRetour: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Lieu de retour</InputLabel>
                <Select
                  value={formData.lieuRetour}
                  label="Lieu de retour"
                  onChange={(e) => setFormData({ ...formData, lieuRetour: e.target.value })}
                >
                  {locations.map((location) => (
                    <MenuItem key={location} value={location}>
                      {location}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </>
);

const Vehicule = ({ formData, setFormData, error, onVehicleSelect, selectedCarData, setSelectedCarData, handleNext }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');
  const [filters, setFilters] = useState({ type: 'all', price: 'all' });
  const [hoveredCarId, setHoveredCarId] = useState(null);
  
  // Récupérer les véhicules disponibles pour les dates sélectionnées
  useEffect(() => {
    const fetchAvailableVehicles = async () => {
      try {
        setLoading(true);
        setLoadingError(null);
        
        // Récupérer les paramètres de l'URL
        const searchParams = new URLSearchParams(window.location.search);
        const dateDebutURL = searchParams.get('pickupDate') ? `${searchParams.get('pickupDate')}T${searchParams.get('pickupTime') || '00:00'}` : '';
        const dateFinURL = searchParams.get('returnDate') ? `${searchParams.get('returnDate')}T${searchParams.get('returnTime') || '00:00'}` : '';
        
        // Utiliser les dates de l'URL ou du formData
        const dateDebut = dateDebutURL || formData.dateDebut;
        const dateFin = dateFinURL || formData.dateFin;
        
        // Si les dates sont spécifiées, récupérer les véhicules disponibles pour ces dates
        let vehicles = [];
        if (dateDebut && dateFin) {
          vehicles = await voitureService.checkVoituresAvailability(dateDebut, dateFin);
          console.log('Véhicules disponibles récupérés depuis la base de données:', vehicles);
        } else {
          // Sinon, récupérer tous les véhicules disponibles
          vehicles = await voitureService.getAvailableVoitures();
          console.log('Tous les véhicules disponibles récupérés:', vehicles);
        }
        
        if (!vehicles || vehicles.length === 0) {
          console.warn('Aucun véhicule disponible récupéré de la base de données');
          setAvailableVehicles([]);
          return;
        }
        
        console.log(`${vehicles.length} véhicules disponibles récupérés au total`);
        
        // Transformer les données pour correspondre au format attendu par le composant
        const formattedVehicles = vehicles.map(vehicle => {
          // Vérifier si le véhicule a un ID valide
          if (!vehicle || !vehicle.VoitureID) {
            console.warn('Véhicule sans ID détecté:', vehicle);
            return null;
          }
          
          // Gérer les différences de noms de champs (avec ou sans accents)
          const modele = vehicle['Modèle'] || vehicle.Modele || '';
          const marque = vehicle.Marque || '';
          const prix = vehicle.Prix || 0;
          const categorie = vehicle.Categorie || '';
          const type = vehicle.Type || '';
          
          return {
            id: vehicle.VoitureID,
            name: `${marque} ${modele}`,
            type: categorie || type,
            image: `http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}`,
            price: prix,
            specs: {
              portes: vehicle.Portes || vehicle.portes || '4',
              passagers: vehicle.Places || vehicle.places || '5',
              transmission: vehicle.Transmission || vehicle.transmission || '',
              climatisation: vehicle.Climatisation || vehicle.climatisation || 'Oui',
              carburant: vehicle.Carburant || vehicle.carburant || type || 'Essence'
            }
          };
        }).filter(Boolean); // Éliminer les entrées nulles
        
        console.log('Données formatées:', formattedVehicles);
        console.log(`${formattedVehicles.length} véhicules disponibles affichés`);
        
        setAvailableVehicles(formattedVehicles);
      } catch (error) {
        console.error('Erreur lors de la récupération des véhicules disponibles:', error);
        setLoadingError('Impossible de charger les véhicules disponibles. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailableVehicles();
  }, [formData.dateDebut, formData.dateFin]);
  
  // Get unique vehicle types
  const types = ['all', ...new Set(availableVehicles.map(car => car.type).filter(Boolean))];
  
  // Define price ranges
  const priceRanges = [
    { value: 'all', label: 'Tous les prix' },
    { value: '0-300', label: 'Moins de 300 DH' },
    { value: '300-500', label: 'Entre 300 et 500 DH' },
    { value: '500+', label: 'Plus de 500 DH' }
  ];

  const handleCarSelect = (car) => {
    console.log('Véhicule sélectionné:', car);
    setSelectedCar(car);
    
    // Mettre à jour également selectedCarData dans le composant parent
    if (setSelectedCarData) {
      setSelectedCarData(car);
    }
    
    // Stocker l'ID du véhicule dans formData.vehicule
    setFormData(prev => ({
      ...prev,
      vehicule: car.VoitureID || car.id // Utiliser VoitureID s'il existe, sinon utiliser id
    }));
  };

  const filteredCars = availableVehicles.filter(car => {
    if (filters.type !== 'all' && car.type !== filters.type) return false;
    
    if (filters.price !== 'all') {
      const [min, max] = filters.price.split('-').map(Number);
      if (max) {
        if (car.price < min || car.price > max) return false;
      } else {
        if (car.price < min) return false;
      }
    }
    
    return true;
  });

  const calculateDays = (dateDepart, dateRetour) => {
    if (!dateDepart || !dateRetour) return 0;
    const start = new Date(dateDepart);
    const end = new Date(dateRetour);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculatePrice = (days, vehiculeId) => {
    const vehicle = availableVehicles.find(car => car.id === vehiculeId);
    return vehicle ? days * vehicle.price : 0;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Contenu existant des véhicules */}
          <Box sx={{ mb: 4 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress sx={{ color: '#FFD700', mb: 2 }} />
                <Typography variant="body2" sx={{ color: '#aaa' }}>
                  Recherche des véhicules disponibles...
                </Typography>
              </Box>
            ) : loadingError ? (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(211, 47, 47, 0.1)',
                  color: '#ff8a80',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#ff8a80'
                  }
                }}
              >
                {loadingError}
              </Alert>
            ) : filteredCars.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  bgcolor: 'rgba(41, 182, 246, 0.1)',
                  color: '#81d4fa',
                  border: '1px solid rgba(41, 182, 246, 0.3)',
                  '& .MuiAlert-icon': {
                    color: '#81d4fa'
                  }
                }}
              >
                Aucun véhicule disponible pour les dates sélectionnées. Veuillez choisir d'autres dates.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {filteredCars.map((car) => (
                  <Grid item xs={12} sm={6} md={4} key={car.id} sx={{ display: 'flex' }}>
                    <Card 
                      sx={{ 
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                        background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
                        color: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: selectedCar?.id === car.id ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: selectedCar?.id === car.id 
                          ? '0 8px 24px rgba(255, 215, 0, 0.3)' 
                          : '0 6px 16px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
                          borderColor: 'rgba(255, 215, 0, 0.6)',
                          '& .car-specs': {
                            height: '120px',
                            opacity: 1,
                            visibility: 'visible'
                          }
                        },
                        position: 'relative'
                      }}
                      onMouseOver={() => setHoveredCarId(car.id)}
                      onMouseOut={() => setHoveredCarId(null)}
                      onClick={() => handleCarSelect(car)}
                    >
                      {/* Badge de catégorie */}
                      <Chip 
                        label={car.type}
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
                        height: { xs: 150, sm: 170 }, 
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
                        <img
                          src={car.image}
                          alt={car.name}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain',
                            backgroundColor: 'transparent',
                            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            zIndex: 2
                          }}
                          onError={(e) => {
                            console.log(`Erreur de chargement pour ${car.name}. Essai de fallbacks.`);
                            e.target.onerror = null; // Éviter les boucles infinies
                            
                            // Essayer avec une extension .png
                            if (!e.target.src.includes('.png')) {
                              e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${car.id}.png`;
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
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='18' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${car.name}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                        
                        {/* Prix affiché sur l'image */}
                        <Box
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
                            {car.price} DH
                            <Typography component="span" variant="caption" sx={{ fontSize: '0.6em', ml: 0.5, color: '#ccc' }}>
                              /jour
                            </Typography>
                          </Typography>
                        </Box>
                      </Box>

                      {/* Informations du véhicule */}
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        p: { xs: 1, sm: 1.5, md: 2 }, 
                        bgcolor: '#1a1a1a',
                        borderTop: '1px solid #222'
                      }}>
                        <Typography 
                          variant="h5"
                          sx={{ 
                            color: 'white',
                            fontWeight: 700,
                            mb: 0.5,
                            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.3rem' },
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {car.name}
                        </Typography>
                        
                        <Typography 
                          variant="body2"
                          sx={{ 
                            color: '#aaa',
                            mb: 1
                          }}
                        >
                          {car.specs.carburant}
                        </Typography>
                        
                        {/* Caractéristiques du véhicule */}
                        <Box 
                          className={`car-specs-${car.id}`}
                          sx={{ 
                            height: hoveredCarId === car.id ? '120px' : 0,
                            opacity: hoveredCarId === car.id ? 1 : 0,
                            visibility: hoveredCarId === car.id ? 'visible' : 'hidden',
                            overflow: 'visible',
                            transition: 'all 0.4s ease',
                            mb: 1.5,
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <PersonIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                  {car.specs.passagers} places
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <LuggageIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                  {car.specs.portes} portes
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>

                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <DirectionsCarIcon sx={{ color: '#FFD700', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                  {car.specs.carburant}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </CardContent>
                      
                      {/* Bouton de sélection */}
                      <CardActions sx={{ p: { xs: 1, sm: 1.5, md: 2 }, bgcolor: '#1a1a1a', borderTop: '1px solid #222' }}>
                        <Button
                          variant="contained"
                          fullWidth
                          sx={{ 
                            bgcolor: selectedCar?.id === car.id ? '#FFD700' : 'rgba(255,215,0,0.15)', 
                            color: selectedCar?.id === car.id ? '#000' : '#fff',
                            fontWeight: 'bold',
                            py: 1,
                            borderRadius: '30px',
                            textTransform: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            border: selectedCar?.id === car.id ? 'none' : '1px solid rgba(255,215,0,0.5)',
                            boxShadow: selectedCar?.id === car.id 
                              ? '0 4px 15px rgba(255, 215, 0, 0.3)' 
                              : '0 6px 16px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: selectedCar?.id === car.id ? '#e6c200' : 'rgba(255,215,0,0.3)',
                              color: selectedCar?.id === car.id ? '#000' : '#fff',
                              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCarSelect(car);
                            // Passer à l'étape suivante lorsque l'utilisateur clique sur "Continuer avec ce véhicule"
                            if (handleNext && typeof handleNext === 'function') {
                              handleNext();
                            }
                          }}
                        >
                          {selectedCar?.id === car.id ? 'Sélectionné' : 'Sélectionner'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Bouton pour continuer vers l'étape suivante */}
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: '#1a1a1a',
            borderRadius: 2,
            mb: 2
          }}>
            <CardContent>
              {/* En-tête avec titre */}
              <Box sx={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                pb: 2,
                mb: 3
              }}>
                <Typography variant="h6" sx={{ 
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  RÉCAPITULATIF DE RÉSERVATION
                </Typography>
              </Box>

              {/* Véhicule sélectionné */}
              {formData.vehicule && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: 1,
                    p: 2,
                    mb: 3
                  }}>
                    <Box sx={{ 
                      position: 'relative',
                      height: 140,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      {selectedCar ? (
                        <img
                          src={selectedCar.image}
                          alt={selectedCar.name}
                          style={{
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            console.log(`Erreur de chargement pour ${selectedCar.name}. Essai de fallbacks.`);
                            e.target.onerror = null; // Éviter les boucles infinies
                            
                            // Essayer avec une extension .png
                            if (!e.target.src.includes('.png')) {
                              e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${selectedCar.id}.png`;
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
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='80' viewBox='0 0 100 80'%3E%3Crect width='100%' height='80' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='14' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${selectedCar.name}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '90%',
                            height: '90%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f0f0f0',
                            borderRadius: 1
                          }}
                        >
                          <DirectionsCarIcon sx={{ fontSize: 60, color: '#ccc' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="subtitle1" sx={{ 
                      color: 'white',
                      fontWeight: 600,
                      mb: 1
                    }}>
                      {selectedCar ? selectedCar.name : ''}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {selectedCar?.type}
                    </Typography>

                    {/* Caractéristiques du véhicule */}
                    {selectedCar && (
                      <Box sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 2
                      }}>
                        {/* Places */}
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <PersonIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {selectedCar.specs.passagers} places
                          </Typography>
                        </Box>
                        
                        {/* Portes */}
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <LuggageIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {selectedCar.specs.portes} portes
                          </Typography>
                        </Box>
                        
                        {/* Transmission */}
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <SettingsIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {selectedCar.specs.transmission}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Informations de départ */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white',
                  mb: 2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}>
                  Informations de départ
                </Typography>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 1,
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#FFD700', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.lieuDepart}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: '#FFD700', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.dateDepart}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Informations d'arrivée */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white',
                  mb: 2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}>
                  Informations d'arrivée
                </Typography>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 1,
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#666', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.lieuRetour}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: '#666', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.dateRetour}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'white', textAlign: 'left', padding: '8px 0' }}>Libellé</th>
                      <th style={{ color: 'white', textAlign: 'center', padding: '8px 0' }}>Jrs/hrs</th>
                      <th style={{ color: 'white', textAlign: 'right', padding: '8px 0' }}>Prix</th>
                      <th style={{ color: 'white', textAlign: 'right', padding: '8px 0' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.extras.map(extraId => {
                      const extra = extras.find(e => e.id === extraId);
                      if (!extra) return null;
                      
                      return (
                        <tr key={extra.id}>
                          <td style={{ color: '#999', padding: '8px 0' }}>{extra.name}</td>
                          <td style={{ color: '#999', textAlign: 'center', padding: '8px 0' }}>{days}</td>
                          <td style={{ color: '#999', textAlign: 'right', padding: '8px 0' }}>{extra.price}</td>
                          <td style={{ color: '#999', textAlign: 'right', padding: '8px 0' }}>{extra.price * days}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="3" style={{ color: 'white', textAlign: 'right', padding: '16px 0 8px' }}>Total :</td>
                      <td style={{ color: 'white', textAlign: 'right', padding: '16px 0 8px' }}>
                        {formData.extras.reduce((total, extraId) => {
                          const extra = extras.find(e => e.id === extraId);
                          return total + (extra ? extra.price * days : 0);
                        }, 0)} MAD
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const Extras = ({ formData, setFormData, setSelectedCarData }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [extras, setExtras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState('');

  // Fonction pour attribuer une icône en fonction du nom de l'extra
  const getIconForExtra = (name) => {
    if (!name) return DirectionsCarIcon;
    
    const nameLower = name.toLowerCase();
    if (nameLower.includes('conducteur') || nameLower.includes('chauffeur')) {
      return DirectionsCarIcon;
    } else if (nameLower.includes('kilométrage') || nameLower.includes('kilometre')) {
      return SpeedIcon;
    } else if (nameLower.includes('bébé') || nameLower.includes('enfant') || nameLower.includes('siège')) {
      return ChildCareIcon;
    } else if (nameLower.includes('2ème') || nameLower.includes('second') || nameLower.includes('supplémentaire')) {
      return SupervisorAccountIcon;
    } else if (nameLower.includes('wifi') || nameLower.includes('wi-fi') || nameLower.includes('internet')) {
      return WifiIcon;
    } else if (nameLower.includes('chaîne') || nameLower.includes('neige')) {
      return AcUnitIcon;
    } else if (nameLower.includes('casque') || nameLower.includes('sécurité')) {
      return SportsMartialArtsIcon;
    } else if (nameLower.includes('combinaison') || nameLower.includes('néoprène') || nameLower.includes('thermique')) {
      return SportsKabaddiIcon;
    }
    
    // Icône par défaut
    return DirectionsCarIcon;
  };

  // Charger les extras depuis la base de données
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        setLoading(true);
        setLoadingError(null);
        const response = await extraService.getAllExtras();
        console.log('Extras récupérés depuis la base de données:', response);
        
        // Mapper les données de l'API au format attendu par le composant
        if (response && response.length > 0) {
          const formattedExtras = response.map(extra => {
            let iconComponent = getIconForExtra(extra.Nom || extra.name || '');
            
            return {
              id: extra.ExtraID || extra.id,
              name: extra.Nom || extra.name,
              description: extra.Description || extra.description,
              price: extra.Prix || extra.price || 0,
              icon: iconComponent,
              priceUnit: 'jour'
            };
          });
          setExtras(formattedExtras);
        } else {
          // Utiliser les extras statiques comme fallback
          setExtras(staticExtras);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des extras:', error);
        setLoadingError('Impossible de charger les extras. Utilisation des données par défaut.');
        // Utiliser les extras statiques comme fallback en cas d'erreur
        setExtras(staticExtras);
      } finally {
        setLoading(false);
      }
    };
    fetchExtras();
  }, []);

  // Charger les détails du véhicule sélectionné
  useEffect(() => {
    const fetchSelectedVehicle = async () => {
      if (formData.vehicule) {
        try {
          const vehicle = await voitureService.getVoitureById(formData.vehicule);
          if (vehicle) {
            setSelectedCar(vehicle);
            
            // Mettre à jour également selectedCarData dans le composant parent
            if (setSelectedCarData) {
              setSelectedCarData(vehicle);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du véhicule sélectionné:', error);
        }
      }
    };
    
    fetchSelectedVehicle();
  }, [formData.vehicule, setSelectedCarData]);

  const calculateDays = (dateDepart, dateRetour) => {
    if (!dateDepart || !dateRetour) return 0;
    const start = new Date(dateDepart);
    const end = new Date(dateRetour);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const days = calculateDays(formData.dateDepart, formData.dateRetour);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Contenu existant des extras */}
          <Box sx={{ mb: 4 }}>
            {extras.map((extra) => (
              <Card
                key={extra.id}
                sx={{
                  mb: 2,
                  bgcolor: '#1a1a1a',
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      mr: 3,
                      bgcolor: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    <extra.icon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                      {extra.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {extra.description}
                    </Typography>
                  </Box>
                  <Box sx={{ ml: 2, textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ color: extra.price === 0 ? '#4CAF50' : '#2196F3', mb: 1 }}>
                      {extra.price === 0 ? 'Inclus' : `${extra.price} DH/${extra.priceUnit}`}
                    </Typography>
                    <Checkbox
                      checked={formData.extras.includes(extra.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            extras: [...formData.extras, extra.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            extras: formData.extras.filter(id => id !== extra.id)
                          });
                        }
                      }}
                      sx={{
                        color: 'rgba(255,255,255,0.3)',
                        '&.Mui-checked': {
                          color: '#2196F3',
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            bgcolor: '#1a1a1a',
            borderRadius: 2,
            mb: 2
          }}>
            <CardContent>
              {/* En-tête avec titre */}
              <Box sx={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                pb: 2,
                mb: 3
              }}>
                <Typography variant="h6" sx={{ 
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  RÉCAPITULATIF DE RÉSERVATION
                </Typography>
              </Box>

              {/* Véhicule sélectionné */}
              {formData.vehicule && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.03)',
                    borderRadius: 1,
                    p: 2,
                    mb: 3
                  }}>
                    <Box sx={{ 
                      position: 'relative',
                      height: 140,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      {selectedCar ? (
                        <img
                          src={`http://localhost:4000/uploads/vehicules/voiture-${selectedCar.VoitureID}`}
                          alt={`${selectedCar.Marque} ${selectedCar.Modele}`}
                          style={{
                            width: '90%',
                            height: '90%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            console.log(`Erreur de chargement pour ${selectedCar.Marque} ${selectedCar.Modele}. Essai de fallbacks.`);
                            e.target.onerror = null; // Éviter les boucles infinies
                            
                            // Essayer avec une extension .png
                            if (!e.target.src.includes('.png')) {
                              e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${selectedCar.VoitureID}.png`;
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
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='80' viewBox='0 0 100 80'%3E%3Crect width='100%' height='80' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='14' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${selectedCar.Marque}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '90%',
                            height: '90%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f0f0f0',
                            borderRadius: 1
                          }}
                        >
                          <DirectionsCarIcon sx={{ fontSize: 60, color: '#ccc' }} />
                        </Box>
                      )}
                    </Box>
                    <Typography variant="subtitle1" sx={{ 
                      color: 'white',
                      fontWeight: 600,
                      mb: 1
                    }}>
                      {selectedCar ? `${selectedCar.Marque} ${selectedCar.Modele}` : 'Chargement...'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {selectedCar?.type}
                    </Typography>

                    {/* Caractéristiques du véhicule */}
                    {selectedCar && (
                      <Box sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 2
                      }}>
                        {/* Places */}
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <PersonIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {selectedCar.Places || selectedCar.places} places
                          </Typography>
                        </Box>
                        
                        {/* Portes */}
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <LuggageIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {selectedCar.Portes || selectedCar.portes} portes
                          </Typography>
                        </Box>
                        
                        {/* Transmission */}
                        <Box sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          borderRadius: '20px',
                          px: 1.5,
                          py: 0.5,
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <SettingsIcon sx={{ color: '#FFD700', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" sx={{ color: 'white' }}>
                            {selectedCar.Transmission || selectedCar.transmission}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Informations de départ */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white',
                  mb: 2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}>
                  Informations de départ
                </Typography>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 1,
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#FFD700', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.lieuDepart}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: '#FFD700', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.dateDepart}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Informations d'arrivée */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ 
                  color: 'white',
                  mb: 2,
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px'
                }}>
                  Informations d'arrivée
                </Typography>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.03)',
                  borderRadius: 1,
                  p: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon sx={{ color: '#666', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.lieuRetour}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ color: '#666', fontSize: '1.2rem', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      {formData.dateRetour}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'white', textAlign: 'left', padding: '8px 0' }}>Libellé</th>
                      <th style={{ color: 'white', textAlign: 'center', padding: '8px 0' }}>Jrs/hrs</th>
                      <th style={{ color: 'white', textAlign: 'right', padding: '8px 0' }}>Prix</th>
                      <th style={{ color: 'white', textAlign: 'right', padding: '8px 0' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.extras.map(extraId => {
                      const extra = extras.find(e => e.id === extraId);
                      if (!extra) return null;
                      
                      return (
                        <tr key={extra.id}>
                          <td style={{ color: '#999', padding: '8px 0' }}>{extra.name}</td>
                          <td style={{ color: '#999', textAlign: 'center', padding: '8px 0' }}>{days}</td>
                          <td style={{ color: '#999', textAlign: 'right', padding: '8px 0' }}>{extra.price}</td>
                          <td style={{ color: '#999', textAlign: 'right', padding: '8px 0' }}>{extra.price * days}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="3" style={{ color: 'white', textAlign: 'right', padding: '16px 0 8px' }}>Total :</td>
                      <td style={{ color: 'white', textAlign: 'right', padding: '16px 0 8px' }}>
                        {formData.extras.reduce((total, extraId) => {
                          const extra = extras.find(e => e.id === extraId);
                          return total + (extra ? extra.price * days : 0);
                        }, 0)} MAD
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

const Confirmation = ({ formData, setFormData, handleBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [extras, setExtras] = useState([]);
  const [hasAccount, setHasAccount] = useState(false); // État pour le toggle switch
  const [loginData, setLoginData] = useState({ // État pour les données de connexion
    email: '',
    password: ''
  });
  
  // Récupérer les extras depuis la base de données
  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const response = await extraService.getAllExtras();
        console.log('Extras récupérés dans Confirmation:', response);
        
        // Mapper les données de l'API au format attendu par le composant
        if (response && response.length > 0) {
          const formattedExtras = response.map(extra => ({
            id: extra.ExtraID || extra.id,
            name: extra.Nom || extra.name,
            description: extra.Description || extra.description,
            price: extra.Prix || extra.price || 0,
            priceUnit: 'jour'
          }));
          setExtras(formattedExtras);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des extras dans Confirmation:', error);
      }
    };
    fetchExtras();
  }, []);
  
  // Calculer le nombre de jours entre les dates de départ et de retour
  const calculateDays = () => {
    if (!formData.dateDepart || !formData.dateRetour) return 0;
    const start = new Date(formData.dateDepart);
    const end = new Date(formData.dateRetour);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const nombreJours = calculateDays();
  
  // Calculer le prix total
  const calculateTotal = () => {
    if (!selectedCar) return 0;
    let total = selectedCar.Prix * nombreJours;
    
    // Ajouter le prix des extras sélectionnés
    if (formData.extras && formData.extras.length > 0) {
      formData.extras.forEach(extraId => {
        const extra = extras.find(e => e.id === extraId);
        if (extra) {
          total += extra.price * nombreJours;
        }
      });
    }
    
    return total;
  };

  // Charger les détails du véhicule sélectionné
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (formData.vehicule) {
        try {
          const vehicle = await voitureService.getVoitureById(formData.vehicule);
          setSelectedCar(vehicle);
        } catch (err) {
          console.error('Erreur lors du chargement des détails du véhicule:', err);
          setError('Impossible de charger les détails du véhicule.');
        }
      }
    };
    
    fetchVehicleDetails();
  }, [formData.vehicule]);
  
  // Fonction pour soumettre les données du client (sans créer de réservation)
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Vérifier si les informations nécessaires du client sont présentes
      if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs obligatoires: nom, prénom, email et mot de passe.');
        setLoading(false);
        return;
      }

      // Vérifier le format de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Veuillez entrer une adresse email valide.');
        setLoading(false);
        return;
      }

      // Vérifier la longueur du mot de passe
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        setLoading(false);
        return;
      }
      
      // Préparer les données du client avec des valeurs par défaut pour les champs facultatifs
      const clientData = {
        civilite: formData.civilite || '',
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        password: formData.password,
        telephone: formData.telephone || '',
        cinPassport: formData.cinPassport || '',
        dateNaissance: formData.dateNaissance || null,
        numeroPermit: formData.numeroPermit || '',
        datePermit: formData.datePermit || null,
        adresse: formData.adresse || ''
      };
      
      // Trouver les détails complets des extras sélectionnés
      const selectedExtrasDetails = extras.filter(extra => formData.extras.includes(extra.id))
        .map(extra => ({
          id: extra.id,
          Nom: extra.name,
          Prix: extra.price,
          Description: extra.description
        }));
      
      // Appeler le service d'authentification pour enregistrer le client
      const registeredUser = await authService.register(clientData);
      console.log('Client enregistré:', registeredUser);
      
      // S'assurer que les données utilisateur sont stockées dans localStorage
      if (registeredUser && registeredUser.user) {
        localStorage.setItem('token', registeredUser.token);
        localStorage.setItem('user', JSON.stringify(registeredUser.user));
        localStorage.setItem('isAuthenticated', 'true');
      }
      
      // Récupérer l'ID du client après l'enregistrement
      const clientId = registeredUser?.user?.id || 'temp-client-id';
      
      // Sauvegarder les données de réservation pour les afficher dans le profil
      const reservationData = {
        vehicule: formData.vehicule,
        vehiculeDetails: selectedCar,
        dateDepart: formData.dateDepart,
        dateRetour: formData.dateRetour,
        lieuDepart: formData.lieuDepart,
        lieuRetour: formData.lieuRetour,
        extras: selectedExtrasDetails,
        prixTotal: calculateTotal(),
        // Ajouter les informations du client à la réservation
        clientId: clientId,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone
      };
      
      // Sauvegarder les données de réservation temporaires
      reservationDataService.saveReservationData(reservationData);
      
      // Préparer les données de réservation en attente pour l'affichage dans le profil
      const pendingReservationData = {
        vehicule: selectedCar,
        dateDebut: formData.dateDepart,
        dateFin: formData.dateRetour,
        lieuPrise: formData.lieuDepart,
        lieuRetour: formData.lieuRetour,
        extras: selectedExtrasDetails,
        prixTotal: calculateTotal(),
        clientId: clientId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Sauvegarder la réservation en attente associée à ce client spécifique
      // Cette réservation sera disponible même après déconnexion/reconnexion
      reservationDataService.savePendingReservation(clientId, pendingReservationData);
      
      // Sauvegarder également dans le localStorage pour l'affichage immédiat
      localStorage.setItem('pendingReservation', JSON.stringify(pendingReservationData));
      
      // Indiquer que l'utilisateur vient du processus de réservation
      localStorage.setItem('fromReservation', 'true');
      
      // Créer la réservation dans la base de données
      try {
        // Préparer les données de réservation pour la base de données
        const reservationDbData = {
          ClientID: clientId,
          VoitureID: formData.vehicule,
          DateDébut: formData.dateDepart,
          DateFin: formData.dateRetour,
          LieuDepart: formData.lieuDepart, // Nom du champ corrigé pour correspondre au modèle du backend
          LieuArrivee: formData.lieuRetour, // Nom du champ corrigé pour correspondre au modèle du backend
          Statut: 'En attente',
          PrixTotal: calculateTotal(),
          Extras: JSON.stringify(selectedExtrasDetails)
        };
        
        // Afficher les données pour le débogage
        console.log('Lieu de départ envoyé:', reservationDbData.LieuDepart);
        
        console.log('Création de la réservation dans la base de données:', reservationDbData);
        
        // Appeler le service pour créer la réservation
        const createdReservation = await reservationService.createReservation(reservationDbData);
        console.log('Réservation créée avec succès:', createdReservation);
        
        // Mettre à jour la réservation en attente avec l'ID de la réservation créée
        if (createdReservation && createdReservation.ResID) {
          pendingReservationData.reservationId = createdReservation.ResID;
          localStorage.setItem('pendingReservation', JSON.stringify(pendingReservationData));
          reservationDataService.savePendingReservation(clientId, pendingReservationData);
        }
      } catch (error) {
        console.error('Erreur lors de la création de la réservation dans la base de données:', error);
        // Continuer malgré l'erreur, car nous avons déjà les données en local
      }
      
      setSuccess(true);
      setLoading(false);
      
      // Afficher le message de succès
      setSuccess(true);
      
      // FORCER la redirection vers la page de profil sans condition
      console.log('Redirection forcée vers la page de profil après enregistrement');
      
      // Utiliser une redirection directe sans setTimeout pour éviter les problèmes
      window.location.href = '/profile';
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du client:', err);
      
      // Extraire le message d'erreur spécifique
      let errorMessage = '';
      
      // Analyser les différents types d'erreurs et fournir des messages spécifiques
      if (err.response && err.response.data) {
        // Erreur d'email en doublon
        if (err.response.data.error && err.response.data.error.includes('Duplicate entry') && 
            err.response.data.error.includes('Email')) {
          errorMessage = 'Cet email est déjà utilisé par un autre compte. Veuillez utiliser un email différent ou vous connecter.';
        }
        // Erreur de mot de passe trop court
        else if (err.response.data.error && err.response.data.error.includes('Password')) {
          errorMessage = 'Le mot de passe ne respecte pas les critères de sécurité. Il doit contenir au moins 6 caractères.';
        }
        // Erreur de format d'email invalide
        else if (err.response.data.error && err.response.data.error.includes('Email') && 
                 err.response.data.error.includes('format')) {
          errorMessage = 'Le format de l\'email est invalide. Veuillez entrer une adresse email valide.';
        }
        // Erreur de champ obligatoire manquant
        else if (err.response.data.error && err.response.data.error.includes('required')) {
          errorMessage = 'Certains champs obligatoires sont manquants. Veuillez remplir tous les champs marqués d\'un astérisque (*).'; 
        }
        // Erreur de format de date
        else if (err.response.data.error && (err.response.data.error.includes('date') || 
                 err.response.data.error.includes('Date'))) {
          errorMessage = 'Le format d\'une des dates est invalide. Veuillez vérifier les dates saisies.';
        }
        // Utiliser le message d'erreur spécifique du serveur s'il existe
        else if (err.response.data.error) {
          errorMessage = `Erreur: ${err.response.data.error}`;
        }
        // Message générique du serveur
        else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } 
      // Erreurs de réseau
      else if (err.message && err.message.includes('Network Error')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      }
      // Message d'erreur personnalisé si disponible
      else if (err.friendlyMessage) {
        errorMessage = err.friendlyMessage;
      }
      // Message d'erreur générique
      else if (err.message) {
        errorMessage = err.message;
      }
      // Message par défaut si aucun message spécifique n'est disponible
      else {
        errorMessage = 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.';
      }
      
      // Afficher les détails de l'erreur dans la console pour le débogage
      if (err.response && err.response.data && err.response.data.error) {
        console.log('Détail technique de l\'erreur:', err.response.data.error);
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Fonction pour gérer la connexion réussie depuis le composant ReservationLogin
  const handleLoginSuccess = (userData) => {
    // Mettre à jour les données du formulaire avec les informations de l'utilisateur connecté
    setFormData({
      ...formData,
      civilite: userData.civilite || '',
      nom: userData.nom || '',
      prenom: userData.prenom || '',
      email: userData.email || '',
      telephone: userData.telephone || '',
      cinPassport: userData.cinPassport || '',
      dateNaissance: userData.dateNaissance || '',
      numeroPermit: userData.numPermis || '',
      datePermit: userData.dateDelivrancePermis || '',
      adresse: userData.adresse || '',
      clientId: userData.clientId || userData.id
    });
    
    // Indiquer que l'utilisateur est connecté
    setHasAccount(true);
  };
  
  // Fonction pour annuler la connexion
  const handleLoginCancel = () => {
    setHasAccount(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Vos informations ont été enregistrées avec succès! Vous allez être redirigé vers votre profil...
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Formulaire d'informations personnelles à gauche */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Vos informations
                </Typography>
                
                {/* Toggle switch pour basculer entre création de compte et connexion */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 3,
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.03)'
                }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Avez-vous déjà un compte ? Connectez-vous
                  </Typography>
                  <Box sx={{ 
                    width: 60, 
                    height: 34, 
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 34,
                    bgcolor: hasAccount ? 'primary.main' : 'grey.300',
                    transition: 'background-color 0.3s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: hasAccount ? 'flex-end' : 'flex-start',
                    p: 0.5,
                    '&:hover': {
                      opacity: 0.9
                    }
                  }}
                  onClick={() => setHasAccount(!hasAccount)}
                  >
                    <Box sx={{ 
                      width: 26, 
                      height: 26, 
                      borderRadius: '50%', 
                      bgcolor: 'white',
                      boxShadow: 1,
                      transition: 'transform 0.3s'
                    }} />
                  </Box>
                </Box>
                
                {hasAccount ? (
                  // Formulaire de connexion direct
                  <Box component="form" onSubmit={(e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    const password = e.target.password.value;
                    
                    if (!email || !password) {
                      setError('Veuillez remplir tous les champs');
                      return;
                    }
                    
                    // Appel direct à l'API
                    fetch('http://localhost:4000/utilisateurs/login', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        Email: email,
                        Password: password,
                        isReservationProcess: true
                      }),
                    })
                    .then(response => response.json())
                    .then(data => {
                      console.log('Réponse de connexion:', data);
                      
                      if (data.user) {
                        // Stocker les informations utilisateur et le token
                        localStorage.setItem('user', JSON.stringify(data.user));
                        localStorage.setItem('token', data.token);
                        
                        // Redirection directe vers le profil sans alerte
                        console.log('Connexion réussie! Redirection vers le profil...');
                        window.location.href = '/profile';
                      } else {
                        setError(data.message || 'Erreur lors de la connexion');
                      }
                    })
                    .catch(error => {
                      console.error('Erreur de connexion:', error);
                      setError('Erreur de connexion. Veuillez réessayer.');
                    });
                  }} sx={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      label="Adresse e-mail"
                      name="email"
                      variant="outlined"
                      type="email"
                      sx={{ mb: 2 }}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      name="password"
                      variant="outlined"
                      type="password"
                      sx={{ mb: 2 }}
                      required
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleLoginCancel}
                      >
                        Annuler
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                      >
                        Se connecter
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Formulaire d'informations personnelles avec design amélioré
                  <Box sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    bgcolor: 'rgba(0,0,0,0.02)', 
                    border: '1px solid rgba(0,0,0,0.05)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Élément décoratif */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '5px', 
                        background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)' 
                      }} 
                    />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                          Vos informations
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Remplissez ce formulaire pour finaliser votre réservation
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControl fullWidth variant="outlined">
                          <InputLabel id="civilite-label">Civilité</InputLabel>
                          <Select
                            labelId="civilite-label"
                            id="civilite"
                            value={formData.civilite}
                            onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                            label="Civilité"
                          >
                            <MenuItem value="M.">M.</MenuItem>
                            <MenuItem value="Mme">Mme</MenuItem>
                            <MenuItem value="Mlle">Mlle</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Prénom"
                          variant="outlined"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nom"
                          variant="outlined"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="N° CIN/Passport"
                          variant="outlined"
                          value={formData.cinPassport}
                          onChange={(e) => setFormData({ ...formData, cinPassport: e.target.value })}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Date de naissance"
                          variant="outlined"
                          type="date"
                          value={formData.dateNaissance}
                          onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          placeholder="jj/mm/aaaa"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="N° de permis"
                          variant="outlined"
                          value={formData.numeroPermit}
                          onChange={(e) => setFormData({ ...formData, numeroPermit: e.target.value })}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Permis délivré le"
                          variant="outlined"
                          type="date"
                          value={formData.datePermit}
                          onChange={(e) => setFormData({ ...formData, datePermit: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                          placeholder="jj/mm/aaaa"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Téléphone"
                          variant="outlined"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                              </svg>
                            </Box>
                          )
                        }}
                      />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="E-mail"
                          variant="outlined"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                  <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                              </Box>
                            )
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mot de passe"
                          variant="outlined"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                              </Box>
                            )
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Adresse"
                          variant="outlined"
                          multiline
                          rows={3}
                          value={formData.adresse}
                          onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                          InputProps={{
                            startAdornment: (
                              <Box component="span" sx={{ color: 'primary.main', mr: 1, alignSelf: 'flex-start', mt: 1 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                  <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                              </Box>
                            )
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
              
              {/* Récapitulatif de la réservation à droite */}
              <Grid item xs={12} md={6}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  RÉCAPITULATIF DE RÉSERVATION
                </Typography>
                {selectedCar && (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
                      <Box sx={{ 
                        width: '100%',
                        mb: { xs: 2, md: 0 },
                      }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 200,
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            position: 'relative',
                            bgcolor: 'white'
                          }}
                        >
                          {/* Actual image with multiple fallbacks */}
                          <img
                            src={`/assets/images/cars/${selectedCar.Marque.toLowerCase()}-${selectedCar.Modele.toLowerCase().replace(' ', '-')}.jpg`}
                            alt={`${selectedCar.Marque} ${selectedCar.Modele}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              position: 'relative'
                            }}
                            onError={(e) => {
                              // Try alternative URL formats
                              if (!e.target.dataset.fallback) {
                                e.target.dataset.fallback = '1';
                                e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${selectedCar.VoitureID}.jpg`;
                              } else if (e.target.dataset.fallback === '1') {
                                e.target.dataset.fallback = '2';
                                e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${selectedCar.VoitureID}.png`;
                              } else if (e.target.dataset.fallback === '2') {
                                e.target.dataset.fallback = '3';
                                e.target.src = `http://localhost:3000/uploads/vehicules/voiture-${selectedCar.VoitureID}.jpg`;
                              } else if (e.target.dataset.fallback === '3') {
                                e.target.dataset.fallback = '4';
                                // Fallback to a generic car silhouette if all else fails
                                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23ccc' d='M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z'%3E%3C/path%3E%3C/svg%3E`;
                              }
                            }}
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {selectedCar.Marque} {selectedCar.Modele}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedCar.Categorie} • {selectedCar.Type} • {selectedCar.Annee}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Détails de la réservation
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lieu de départ
                            </Typography>
                            <Typography variant="body1">
                              {formData.lieuDepart}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Date de départ
                            </Typography>
                            <Typography variant="body1">
                              {formData.dateDepart ? new Date(formData.dateDepart).toLocaleDateString() : 'Non spécifié'}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lieu de retour
                            </Typography>
                            <Typography variant="body1">
                              {formData.lieuRetour}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Date de retour
                            </Typography>
                            <Typography variant="body1">
                              {formData.dateRetour ? new Date(formData.dateRetour).toLocaleDateString() : 'Non spécifié'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Détails de la location
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'primary.main' }}>
                            <TableCell sx={{ color: 'white' }}>Libellé</TableCell>
                            <TableCell sx={{ color: 'white' }}>Jrs/hrs</TableCell>
                            <TableCell sx={{ color: 'white' }}>Prix</TableCell>
                            <TableCell sx={{ color: 'white' }}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>{selectedCar.Marque} {selectedCar.Modele}</TableCell>
                            <TableCell>{nombreJours}</TableCell>
                            <TableCell>{selectedCar.Prix} MAD/jr</TableCell>
                            <TableCell>{selectedCar.Prix * nombreJours} MAD</TableCell>
                          </TableRow>
                          
                          {formData.extras && formData.extras.length > 0 && extras.length > 0 && 
                            formData.extras.map(extraId => {
                              const extra = extras.find(e => e.id === extraId);
                              if (!extra) return null;
                              
                              return (
                                <TableRow key={extra.id}>
                                  <TableCell>{extra.name}</TableCell>
                                  <TableCell>{nombreJours}</TableCell>
                                  <TableCell>{extra.price} MAD/jr</TableCell>
                                  <TableCell>{extra.price * nombreJours} MAD</TableCell>
                                </TableRow>
                              );
                            })
                          }
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={3} sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total :</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>{calculateTotal()} MAD</TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ 
                  color: '#FFD700',
                  borderColor: '#FFD700',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#e6c200',
                    bgcolor: 'rgba(255, 215, 0, 0.08)',
                    transform: 'translateY(-2px)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  }
                }}
              >
                Retour
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={loading || success}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #C4A030 0%, #EFC600 100%)',
                  },
                  boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)'
                }}
              >
                {loading ? 'Traitement en cours...' : 'Enregistrer mes infos'}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Vous serez redirigé vers votre espace client pour compléter votre profil.
                </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

const Reserver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  
  // Récupérer l'ID du véhicule depuis les paramètres d'URL
  const queryParams = new URLSearchParams(location.search);
  const voitureIdFromUrl = queryParams.get('voiture');
  const [selectedCarData, setSelectedCarData] = useState(null); // État pour stocker les données du véhicule sélectionné
  const [formData, setFormData] = useState({
    step: 0,
    lieuDepart: '',
    dateDepart: '',
    heureDepart: '',
    lieuRetour: '',
    dateRetour: '',
    heureRetour: '',
    vehicule: '',
    extras: [],
    civilite: '',
    nom: '',
    prenom: '',
    email: '',
    password: '', // Ajout du champ password
    telephone: '',
    cinPassport: '',
    dateNaissance: '',
    numeroPermit: '',
    datePermit: '',
    adresse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Ajout de l'état loading
  const [success, setSuccess] = useState(false); // Ajout de l'état success

  // Récupérer les paramètres de l'URL lors du chargement initial
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Récupérer tous les paramètres de l'URL
    const pickupLocation = params.get('pickupLocation');
    const pickupDate = params.get('pickupDate');
    const pickupTime = params.get('pickupTime');
    const returnLocation = params.get('returnLocation');
    const returnDate = params.get('returnDate');
    const returnTime = params.get('returnTime');
    const step = params.get('step');

    // Mettre à jour formData avec les paramètres de l'URL
    setFormData(prevFormData => {
      const newFormData = { ...prevFormData };

      if (pickupLocation) newFormData.lieuDepart = decodeURIComponent(pickupLocation);
      if (pickupDate) newFormData.dateDepart = pickupDate;
      if (pickupTime) newFormData.heureDepart = pickupTime;
      if (returnLocation) newFormData.lieuRetour = decodeURIComponent(returnLocation);
      if (returnDate) newFormData.dateRetour = returnDate;
      if (returnTime) newFormData.heureRetour = returnTime;
      
      // Si l'URL contient un paramètre step, vérifier qu'il est valide (entre 0 et 3)
      if (step) {
        const stepNum = parseInt(step);
        // S'assurer que l'utilisateur ne peut pas sauter directement à l'étape EXTRAS (2) ou CONFIRMATION (3)
        // sans avoir d'abord sélectionné un véhicule
        if (stepNum > 1 && !prevFormData.vehicule) {
          // Si aucun véhicule n'est sélectionné, forcer l'étape VEHICULE (1)
          newFormData.step = 1;
          setActiveStep(1);
        } else if (stepNum >= 0 && stepNum <= 3) {
          // Si le step est valide, l'utiliser
          newFormData.step = stepNum;
          setActiveStep(stepNum);
        }
      }

      return newFormData;
    });
  }, [location.search]); // Suppression de formData des dépendances

  // Mettre à jour l'URL lorsque formData change
  useEffect(() => {
    const updateURL = () => {
      const newParams = new URLSearchParams();
      if (formData.lieuDepart) newParams.set('pickupLocation', formData.lieuDepart);
      if (formData.dateDepart) newParams.set('pickupDate', formData.dateDepart);
      if (formData.heureDepart) newParams.set('pickupTime', formData.heureDepart);
      if (formData.lieuRetour) newParams.set('returnLocation', formData.lieuRetour);
      if (formData.dateRetour) newParams.set('returnDate', formData.dateRetour);
      if (formData.heureRetour) newParams.set('returnTime', formData.heureRetour);
      if (formData.step) newParams.set('step', formData.step.toString());
      // Conserver le paramètre voiture s'il existe
      if (voitureIdFromUrl) newParams.set('voiture', voitureIdFromUrl);

      // Utiliser replace: true pour éviter d'ajouter des entrées inutiles dans l'historique
      navigate({ search: newParams.toString() }, { replace: true });
    };

    // Ne pas mettre à jour l'URL lors du chargement initial
    if (formData.lieuDepart || formData.dateDepart || formData.lieuRetour || formData.dateRetour) {
      updateURL();
    }
  }, [formData, navigate, voitureIdFromUrl]);
  
  // Effet pour présélectionner le véhicule lorsque l'utilisateur arrive avec un paramètre voiture dans l'URL
  useEffect(() => {
    const loadAndSelectVehicle = async () => {
      if (voitureIdFromUrl && !formData.vehicule) {
        try {
          setLoading(true);
          // Récupérer les détails du véhicule depuis l'API
          const vehicleDetails = await voitureService.getVoitureById(voitureIdFromUrl);
          
          if (vehicleDetails) {
            // Mettre à jour formData avec l'ID du véhicule
            setFormData(prev => ({
              ...prev,
              vehicule: voitureIdFromUrl,
              step: Math.max(prev.step, 1) // Aller à l'étape de sélection du véhicule si pas déjà plus loin
            }));
            
            // Mettre à jour l'étape active si nécessaire
            setActiveStep(prev => Math.max(prev, 1));
            
            // Stocker les détails du véhicule
            setSelectedCarData(vehicleDetails);
            
            console.log('Véhicule présélectionné depuis l\'URL:', vehicleDetails);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du véhicule:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadAndSelectVehicle();
  }, [voitureIdFromUrl]);

  const validateStep = (step) => {
    setError('');
    if (step === 0) {
      if (!formData.dateDepart || !formData.dateRetour || !formData.lieuDepart || !formData.lieuRetour) {
        setError('Veuillez remplir tous les champs obligatoires.');
        return false;
      }
      const depart = new Date(formData.dateDepart);
      const retour = new Date(formData.dateRetour);
      if (depart >= retour) {
        setError('La date de retour doit être postérieure à la date de départ');
        return false;
      }
    } else if (step === 1) {
      if (!formData.vehicule) {
        setError('Veuillez sélectionner un véhicule');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      // Si nous sommes à l'étape 0 (DÉPART & RETOUR), passer à l'étape 1 (VÉHICULE)
      // Si nous sommes à l'étape 1 (VÉHICULE), passer à l'étape 2 (EXTRAS)
      // Si nous sommes à l'étape 2 (EXTRAS), passer à l'étape 3 (CONFIRMATION)
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      
      // Mettre à jour le step dans formData pour que l'URL soit mise à jour
      setFormData(prev => ({
        ...prev,
        step: prev.step + 1
      }));
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    
    // Mettre à jour le step dans formData pour que l'URL soit mise à jour
    setFormData(prev => ({
      ...prev,
      step: prev.step - 1
    }));
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <DepartRetour formData={formData} setFormData={setFormData} error={error} />;
      case 1:
        return <Vehicule 
          formData={formData} 
          setFormData={setFormData} 
          error={error} 
          selectedCarData={selectedCarData}
          setSelectedCarData={setSelectedCarData}
          onVehicleSelect={(car) => {
            // Vérifier que le véhicule est bien sélectionné
            if (car && (car.VoitureID || car.id)) {
              // Passer à l'étape suivante
              handleNext();
            }
          }} 
          handleNext={handleNext}
        />;
      case 2:
        return <Extras formData={formData} setFormData={setFormData} setSelectedCarData={setSelectedCarData} />;
      case 3:
        return <Confirmation formData={formData} setFormData={setFormData} handleBack={handleBack} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Réserver un véhicule
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && activeStep !== steps.length - 1 && (
              <Button 
                onClick={handleBack} 
                sx={{ 
                  mr: 1,
                  color: '#FFD700',
                  borderColor: '#FFD700',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#e6c200',
                    bgcolor: 'rgba(255, 215, 0, 0.08)',
                    transform: 'translateY(-2px)'
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  }
                }}
              >
                Retour
              </Button>
            )}
            {activeStep !== steps.length - 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(90deg, #D4AF37 0%, #FFD700 100%)',
                  color: '#000',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #C4A030 0%, #EFC600 100%)',
                  },
                  boxShadow: '0 4px 10px rgba(212, 175, 55, 0.3)'
                }}
              >
                {loading ? 'Traitement en cours...' : 'Suivant'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Reserver;
