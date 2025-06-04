import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Card,
  CardMedia,
  Avatar
} from '@mui/material';
import {
  History as HistoryIcon,
  DirectionsCar as DirectionsCarIcon,
  CalendarToday as CalendarTodayIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import reservationService from '../../services/reservationService';
import { voitureService } from '../../services';

// Fonction pour obtenir l'URL de l'image d'un véhicule
const getCarImageUrl = (vehicleId) => {
  // Utiliser le format qui fonctionne dans l'admin
  return `http://localhost:4000/uploads/vehicules/voiture-${vehicleId}`;
};

// Fonction pour gérer les erreurs de chargement d'image avec plusieurs tentatives
const handleImageError = (e, vehicleId, marque, modele) => {
  console.log(`Erreur de chargement pour ${marque} ${modele}. Essai de fallbacks.`);
  e.target.onerror = null; // Éviter les boucles infinies
  
  // Essayer avec une extension .png
  if (!e.target.src.includes('.png')) {
    console.log('Essai avec extension .png');
    e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${vehicleId}.png`;
    return;
  }
  
  // Essayer avec une extension .jpg
  if (e.target.src.includes('.png')) {
    console.log('Essai avec extension .jpg');
    e.target.src = e.target.src.replace('.png', '.jpg');
    return;
  }
  
  // Essayer avec une extension .jpeg
  if (e.target.src.includes('.jpg')) {
    console.log('Essai avec extension .jpeg');
    e.target.src = e.target.src.replace('.jpg', '.jpeg');
    return;
  }
  
  // Si toutes les tentatives échouent, utiliser une image par défaut
  console.log('Toutes les tentatives ont échoué. Utilisation de l\'image par défaut.');
  e.target.src = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60" viewBox="0 0 80 60"><rect width="80" height="60" fill="#f0f0f0"/><text x="50%" y="50%" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#999">Voiture</text></svg>')}`;  
};

const Reservations = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reservationHistory, setReservationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [vehiclesData, setVehiclesData] = useState({});

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Charger l'historique des réservations et les données des véhicules
    const fetchData = async () => {
      try {
        setLoadingHistory(true);
        
        // Récupérer l'ID du client depuis l'utilisateur connecté
        const clientId = user?.id;
        console.log('ID du client connecté:', clientId);
        
        if (clientId) {
          // Récupérer l'historique des réservations
          const history = await reservationService.getReservationsByClientId(clientId);
          console.log('Historique des réservations récupéré (brut):', history);
          
          // Vérifier et traiter les données
          const processedHistory = Array.isArray(history) ? history : [];
          
          // Récupérer toutes les voitures pour avoir les détails complets
          const allVehicles = await voitureService.getAllVoitures();
          console.log('Toutes les voitures récupérées:', allVehicles);
          
          // Créer un dictionnaire des véhicules par ID pour un accès facile
          const vehiclesDict = {};
          if (Array.isArray(allVehicles)) {
            allVehicles.forEach(vehicle => {
              vehiclesDict[vehicle.VoitureID] = vehicle;
            });
          }
          
          setVehiclesData(vehiclesDict);
          console.log('Dictionnaire des véhicules:', vehiclesDict);
          
          // Log détaillé de chaque réservation pour le débogage
          processedHistory.forEach((reservation, index) => {
            const vehicleDetails = vehiclesDict[reservation.VoitureID];
            console.log(`Détails complets du véhicule pour réservation #${index + 1}:`, vehicleDetails);
            
            console.log(`Détails de la réservation #${index + 1}:`, {
              id: reservation.id || reservation.ResID || reservation._id,
              statut: reservation.Statut,
              dateDebut: reservation.DateDébut || reservation.DateDebut,
              dateFin: reservation.DateFin,
              vehicule: vehicleDetails || reservation.vehiculeDetails || {
                id: reservation.VoitureID,
                marque: reservation.Marque,
                modele: reservation.Modèle || reservation.Modele,
                categorie: reservation.Categorie,
                type: reservation.Type
              },
              prix: reservation.PrixTotal || reservation.prixTotal || 0
            });
          });
          
          setReservationHistory(processedHistory);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setReservationHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate, user]);

  // Fonction pour formater les dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };
  
  // Fonction pour calculer le prix total de la réservation
  const calculateTotalPrice = (reservation) => {
    try {
      // Si un prix total est déjà défini, l'utiliser
      if (reservation.prixTotal || reservation.PrixTotal || reservation.Prix) {
        return (reservation.prixTotal || reservation.PrixTotal || reservation.Prix);
      }
      
      // Sinon, calculer le prix en fonction du prix journalier et de la durée
      const prixJour = reservation.PrixJour || 0;
      
      // Calculer la durée en jours
      const dateDebut = new Date(reservation.DateDébut || reservation.DateDebut);
      const dateFin = new Date(reservation.DateFin);
      
      if (isNaN(dateDebut.getTime()) || isNaN(dateFin.getTime())) {
        console.error('Dates invalides pour le calcul du prix');
        return 0;
      }
      
      const dureeMs = dateFin.getTime() - dateDebut.getTime();
      const dureeJours = Math.ceil(dureeMs / (1000 * 60 * 60 * 24)) || 1;
      
      // Calculer le prix total
      return prixJour * dureeJours;
    } catch (error) {
      console.error('Erreur lors du calcul du prix total:', error);
      return 0;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <HistoryIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Historique des réservations
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 'bold', 
          mb: 3,
          display: 'flex',
          alignItems: 'center',
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
          <CalendarTodayIcon sx={{ mr: 1 }} />
          MES RÉSERVATIONS PRÉCÉDENTES
        </Typography>
        
        {loadingHistory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : reservationHistory.length > 0 ? (
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Véhicule</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Catégorie</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Année</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de début</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date de fin</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservationHistory.map((reservation, index) => (
                  <TableRow key={index} sx={{ 
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                  transition: 'background-color 0.3s ease'
                }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 60,
                            overflow: 'hidden',
                            borderRadius: '8px',
                            border: '1px solid #eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <img
                            src={getCarImageUrl(reservation.VoitureID)}
                            alt={`${reservation.vehiculeDetails?.Marque || reservation.Marque || '-'} ${reservation.vehiculeDetails?.Modele || reservation.Modèle || reservation.Modele || ''}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            onError={(e) => handleImageError(e, reservation.VoitureID, reservation.vehiculeDetails?.Marque || reservation.Marque || '-', reservation.vehiculeDetails?.Modele || reservation.Modèle || reservation.Modele || '')}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {reservation.vehiculeDetails?.Marque || reservation.Marque || '-'} {reservation.vehiculeDetails?.Modele || reservation.Modèle || reservation.Modele || ''}
                          </Typography>
                          {/* Informations de catégorie et année déplacées vers des colonnes séparées */}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {vehiclesData[reservation.VoitureID]?.Categorie || reservation.vehiculeDetails?.Categorie || reservation.Categorie || reservation.categorie || 'Standard'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {vehiclesData[reservation.VoitureID]?.Annee || reservation.vehiculeDetails?.Annee || reservation.Annee || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {formatDate(reservation.DateDébut || reservation.DateDebut)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="body1">
                          {formatDate(reservation.DateFin)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={reservation.Statut || 'En attente'} 
                        color={
                          (reservation.Statut === 'Confirmée' || reservation.Statut === 'Confirmé') ? 'success' :
                          (reservation.Statut === 'En cours') ? 'primary' :
                          (reservation.Statut === 'Terminée' || reservation.Statut === 'Terminé') ? 'default' : 'warning'
                        }
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      {/* Numéro de réservation supprimé */}
                    </TableCell>
                    {/* Colonnes Prix et Actions supprimées */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Aucune réservation précédente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vous n'avez pas encore effectué de réservation avec nous.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/reserver')}
            >
              Réserver un véhicule
            </Button>
          </Box>
        )}
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Besoin d'aide ?
            </Typography>
            <Typography variant="body2" paragraph>
              Si vous avez des questions concernant vos réservations ou si vous souhaitez modifier une réservation existante, n'hésitez pas à contacter notre service client.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/contact')}
              sx={{ mt: 2 }}
            >
              Nous contacter
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Nouvelle réservation
            </Typography>
            <Typography variant="body2" paragraph>
              Envie de louer un nouveau véhicule ? Consultez notre catalogue et trouvez le véhicule parfait pour votre prochain voyage.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/reserver')}
              sx={{ mt: 2 }}
            >
              Réserver maintenant
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reservations;
