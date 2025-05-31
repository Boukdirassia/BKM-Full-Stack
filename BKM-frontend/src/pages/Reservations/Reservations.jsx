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
  Divider
} from '@mui/material';
import {
  History as HistoryIcon,
  DirectionsCar as DirectionsCarIcon,
  CalendarToday as CalendarTodayIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import reservationService from '../../services/reservationService';

const Reservations = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reservationHistory, setReservationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Charger l'historique des réservations
    const fetchReservationHistory = async () => {
      try {
        setLoadingHistory(true);
        // Récupérer l'ID du client depuis l'utilisateur connecté
        const clientId = user?.id;
        
        if (clientId) {
          const history = await reservationService.getReservationsByClientId(clientId);
          console.log('Historique des réservations récupéré:', history);
          setReservationHistory(Array.isArray(history) ? history : []);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des réservations:', error);
        setReservationHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchReservationHistory();
  }, [user, isAuthenticated, navigate]);

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
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Période</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Prix</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reservationHistory.map((reservation, index) => (
                  <TableRow key={index} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {reservation.vehiculeDetails?.Marque} {reservation.vehiculeDetails?.Modele}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {reservation.vehiculeDetails?.Categorie} - {reservation.vehiculeDetails?.Type}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Du {formatDate(reservation.DateDébut || reservation.DateDebut)}
                      </Typography>
                      <Typography variant="body2">
                        au {formatDate(reservation.DateFin)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {reservation.LieuPriseEnCharge}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={reservation.Statut} 
                        color={
                          reservation.Statut === 'Confirmée' ? 'success' :
                          reservation.Statut === 'En cours' ? 'primary' :
                          reservation.Statut === 'Terminée' ? 'default' : 'warning'
                        }
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" display="block">
                        Réservation N°{reservation.numeroReservation || reservation.id || index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {(reservation.prixTotal || reservation.PrixTotal || 0).toFixed(2)} DH
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ReceiptIcon />}
                        onClick={() => navigate(`/reservation/${reservation.id || reservation._id}`)}
                        sx={{ textTransform: 'none' }}
                      >
                        Détails
                      </Button>
                    </TableCell>
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
