import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import { voitureService } from '../../services';
import { Link } from 'react-router-dom';

// Fonction pour obtenir l'URL de l'image d'un véhicule
const getCarImageUrl = (voiture) => {
  // Utiliser le format qui fonctionne dans l'admin
  return `http://localhost:4000/uploads/vehicules/voiture-${voiture.VoitureID}`;
};

const Vehicules = () => {
  const [voitures, setVoitures] = useState([]);
  const [filteredVoitures, setFilteredVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  
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
    const fetchVoitures = async () => {
      try {
        setLoading(true);
        const data = await voitureService.getAllVoitures();
        
        // Formater les données des véhicules pour s'assurer que les champs Places, Portes et Transmission sont correctement définis
        const formattedData = formatVehicleData(data);
        
        // Afficher les données dans la console pour débogage
        console.log('Données des véhicules formatées:', formattedData);
        
        setVoitures(formattedData);
        
        // Extraire les catégories uniques des voitures
        const uniqueCategories = [...new Set(formattedData.map(voiture => voiture.Categorie))];
        setCategories(uniqueCategories);
        
        setFilteredVoitures(formattedData);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des voitures:', err);
        setError('Impossible de charger les véhicules. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchVoitures();
  }, []);
  
  // Effet pour filtrer les voitures lorsque la catégorie change
  useEffect(() => {
    const filterVoitures = async () => {
      try {
        if (selectedCategory === 'all') {
          setFilteredVoitures(voitures);
        } else {
          const data = await voitureService.getVoituresByCategorie(selectedCategory);
          // Formater les données des véhicules pour s'assurer que les champs Places, Portes et Transmission sont correctement définis
          const formattedData = formatVehicleData(data);
          setFilteredVoitures(formattedData);
        }
      } catch (err) {
        console.error(`Erreur lors du filtrage par catégorie ${selectedCategory}:`, err);
        // En cas d'erreur, on garde les voitures actuelles
      }
    };
    
    if (voitures.length > 0) {
      filterVoitures();
    }
  }, [selectedCategory, voitures]);
  
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" color="error" align="center">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      pt: { xs: 8, md: 10 },
      pb: { xs: 10, md: 12 },
      position: 'relative',
      overflow: 'hidden',
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
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: { xs: 4, md: 5 },
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box 
              sx={{ 
                width: '5px', 
                height: '30px', 
                background: 'linear-gradient(180deg, #FFD700, #FDB931)', 
                borderRadius: '3px',
                mr: 2,
                boxShadow: '0 2px 8px rgba(253, 185, 49, 0.3)'
              }} 
            />
            <Typography 
              variant="h4" 
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                position: 'relative',
                display: 'inline-block',
                background: 'linear-gradient(90deg, #1a1a1a, #333333)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                m: 0
              }}
            >
              Nos Véhicules
            </Typography>
          </Box>
        </Box>
        
        {/* Filtrage par catégories */}
        <Paper 
          elevation={1}
          sx={{ 
            width: 'auto', 
            display: 'inline-flex',
            mb: 4, 
            bgcolor: 'rgba(255,255,255,0.8)', 
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)',
            position: 'relative',
            backdropFilter: 'blur(10px)',
            ml: { xs: 0, md: 2 }
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            indicatorColor="secondary"
            textColor="secondary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Filtrer par catégorie"
            sx={{
              minHeight: '42px',
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700',
                height: 2,
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(253, 185, 49, 0.5)'
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                py: 1,
                px: 2,
                minHeight: '42px',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                textTransform: 'none',
                letterSpacing: '0.3px',
                '&:hover': {
                  color: '#FFD700',
                  opacity: 1,
                  backgroundColor: 'rgba(255, 215, 0, 0.05)'
                },
                '&.Mui-selected': {
                  color: '#1a1a1a',
                  fontWeight: 700
                }
              }
            }}
          >
            <Tab label="Toutes les catégories" value="all" />
            {categories.map((category) => (
              <Tab key={category} label={category} value={category} />
            ))}
          </Tabs>
        </Paper>
        {filteredVoitures.length === 0 ? (
          <Box sx={{ 
            py: 4, 
            px: 3,
            textAlign: 'center', 
            bgcolor: 'rgba(255,255,255,0.8)', 
            borderRadius: '12px', 
            boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.03)',
            maxWidth: '600px',
            mx: 'auto',
            mt: 2
          }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 500, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 1,
                color: '#555'
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  color: '#FFD700', 
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                  boxShadow: '0 2px 8px rgba(253, 185, 49, 0.2)'
                }}
              >
                ⚠
              </Box>
              Aucun véhicule disponible dans cette catégorie pour le moment.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {/* Utilisation d'une méthode différente pour le rendu des cartes de véhicules */}
            {(() => {
              const cards = [];
              for (let i = 0; i < filteredVoitures.length; i++) {
                const voiture = filteredVoitures[i];
                // Ne pas afficher les véhicules indisponibles
                if (!voiture.Disponibilite) continue;
                cards.push(
                  <Grid item key={voiture.VoitureID} xs={12} sm={6} md={4}>
                   <Card sx={{ 
                     height: '100%', 
                     display: 'flex', 
                     flexDirection: 'column',
                     borderRadius: '12px',
                     overflow: 'hidden',
                     boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                     border: '2px solid #FFD700',
                     transition: 'all 0.3s ease',
                     position: 'relative',
                     background: '#1a1a1a',
                     color: '#fff',
                     '&:hover': {
                       transform: 'translateY(-5px)',
                       boxShadow: '0 12px 25px rgba(255, 215, 0, 0.2)',
                       '& .car-image': {
                         transform: 'scale(1.05)'
                       }
                     }
                   }}>

                    <Box sx={{ 
                      position: 'relative', 
                      overflow: 'hidden', 
                      display: 'flex', 
                      flexDirection: 'column',
                      backgroundColor: '#1a1a1a',
                      height: '200px',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Badge de prix */}
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 10, 
                        right: 10, 
                        background: '#FFD700', 
                        color: '#000',
                        px: 2,
                        py: 0.7,
                        borderRadius: '30px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        zIndex: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}>
                        {voiture.Prix} DH <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 'normal' }}>/jour</Box>
                      </Box>
                      <CardMedia
                        component="img"
                        height="200"
                        image={getCarImageUrl(voiture)}
                        alt={`${voiture.Marque} ${voiture.Modele}`}
                        className="car-image"
                        onError={(e) => {
                          console.log(`Erreur de chargement pour ${voiture.Marque} ${voiture.Modele}. Essai de fallbacks.`);
                          e.target.onerror = null; // Éviter les boucles infinies
                          
                          // Essayer avec une extension .png
                          if (!e.target.src.includes('.png')) {
                            e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${voiture.VoitureID}.png`;
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
                          e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f5f5f5'/%3E%3Ctext x='50%' y='50%' font-size='18' fill='%231a1a1a' text-anchor='middle' dominant-baseline='middle'%3E${voiture.Marque} ${voiture.Modele}%3C/text%3E%3C/svg%3E`;
                        }}
                        sx={{
                          objectFit: 'contain',
                          bgcolor: '#1a1a1a',
                          transition: 'transform 0.4s ease',
                          padding: '10px',
                          objectPosition: 'center',
                          width: '100%',
                          height: '100%',
                          maxHeight: '180px'
                        }}
                      />
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: '#FFD700',
                          color: '#000',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          zIndex: 2
                        }}
                      >
                        {voiture.Categorie}
                      </Box>
                    </Box>


                   <CardContent sx={{ flexGrow: 1, p: 2.5, pt: 1.5 }}>
                    <Typography 
                      variant="h5" 
                      component="h2"
                      sx={{ 
                        fontWeight: 700,
                        fontSize: '1.3rem',
                        color: '#fff',
                        mb: 0.5,
                        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        lineHeight: 1.2
                      }}
                    >
                      {voiture.Marque} {voiture.Modele}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#aaa', 
                        fontSize: '0.9rem',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {voiture.Annee} • {voiture.Type}
                    </Typography>
                    
                    {/* Caractéristiques du véhicule */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 1, mb: 1 }}>
                      {/* Places */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#FFD700'
                        }}>
                          <PersonIcon sx={{ fontSize: '1.5rem' }} />
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        >
                          {voiture.Places || '5'} places
                        </Typography>
                      </Box>

                      {/* Portes */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#FFD700'
                        }}>
                          <MeetingRoomIcon sx={{ fontSize: '1.5rem' }} />
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        >
                          {voiture.Portes || '5'} portes
                        </Typography>
                      </Box>

                      {/* Transmission */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#FFD700'
                        }}>
                          <SettingsIcon sx={{ fontSize: '1.5rem' }} />
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#fff',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textAlign: 'center'
                          }}
                        >
                          {voiture.Transmission || 'Automatique'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        component={Link} 
                        to={`/reserver`} 
                        variant="contained" 
                        disabled={!voiture.Disponibilite}
                        fullWidth
                        sx={{
                          borderRadius: '30px',
                          bgcolor: '#FFD700',
                          color: '#000',
                          fontWeight: 700,
                          py: 1.2,
                          textTransform: 'none',
                          fontSize: '1rem',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            bgcolor: '#FFD700',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
                            transform: 'translateY(-2px)'
                          },
                          '&:disabled': {
                            background: '#555',
                            color: '#888'
                          }
                        }}
                      >
                        Réserver maintenant
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
                );
              }
              return cards;
            })()}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Vehicules;
