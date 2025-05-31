import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import AdminTabs from '../../../components/Admin/Navigation/AdminTabs';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import AddReservationClientDialog from '../../../components/Admin/Shared/AddReservationClientDialog';
import { combinedService } from '../../../services';

const ReservationClientLayout = ({ children, onAddReservation, onAddClient }) => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const tabs = [
    { label: 'Réservation', path: 'reservations', icon: <BookOnlineIcon /> },
    { label: 'Clients', path: 'clients', icon: <PersonIcon /> }
  ];

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSaveReservation = async (reservationData) => {
    try {
      // Appeler la fonction onAddReservation et attendre la réponse
      const response = await onAddReservation(reservationData);
      console.log('Réservation enregistrée avec succès:', response);
      
      // Ne pas fermer le dialogue en mode combiné (sera géré par le composant enfant)
      if (!reservationData.fromCombinedMode) {
        handleCloseDialog();
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la réservation:', error);
      throw error;
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      // Appeler la fonction onAddClient et attendre la réponse
      const response = await onAddClient(clientData);
      console.log('Client enregistré avec succès:', response);
      
      // Ne pas fermer le dialogue en mode combiné (sera géré par le composant enfant)
      if (!clientData.fromCombinedMode) {
        handleCloseDialog();
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du client:', error);
      throw error;
    }
  };

  // Fonction pour gérer le mode combiné
  const handleSaveCombined = async (combinedData) => {
    try {
      console.log('Traitement du mode combiné...');
      console.log('Données combinées à envoyer:', combinedData);
      
      // Utiliser le service combiné pour créer client et réservation en une seule opération
      const response = await combinedService.createClientAndReservation(combinedData);
      console.log('Réponse du mode combiné:', response);
      
      handleCloseDialog();
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement combiné client/réservation:', error);
      throw error;
    }
  };

  // Écouter l'événement pour ouvrir le dialogue
  useEffect(() => {
    const handleForceOpenDialog = () => {
      setDialogOpen(true);
    };

    document.addEventListener('force-open-dialog', handleForceOpenDialog);
    document.addEventListener('open-reservation-client-dialog', handleOpenDialog);
    
    return () => {
      document.removeEventListener('force-open-dialog', handleForceOpenDialog);
      document.removeEventListener('open-reservation-client-dialog', handleOpenDialog);
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <AdminTabs tabs={tabs} />
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          data-action="add-reservation-client"
        >
          Ajouter réservation/client
        </Button>
        
        <AddReservationClientDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleOpen={handleOpenDialog}
          handleSaveReservation={handleSaveReservation}
          handleSaveClient={handleSaveClient}
          handleSaveCombined={handleSaveCombined}
        />
      </Box>
      {children}
    </Container>
  );
};

export default ReservationClientLayout;
