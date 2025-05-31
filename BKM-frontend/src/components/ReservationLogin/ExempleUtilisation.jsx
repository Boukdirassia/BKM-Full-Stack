import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Switch, FormControlLabel } from '@mui/material';
import ReservationLogin from './ReservationLogin';

/**
 * Exemple d'utilisation du composant ReservationLogin dans le processus de réservation
 * Ce composant montre comment intégrer l'authentification dans le flux de réservation
 */
const ExempleUtilisation = () => {
  const [hasAccount, setHasAccount] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Données de réservation fictives (à remplacer par vos vraies données)
  const reservationData = {
    vehicule: '1',
    vehiculeDetails: {
      id: '1',
      name: 'Dodge Challenger',
      price: 1200
    },
    dateDepart: '2025-05-15',
    dateRetour: '2025-05-20',
    lieuDepart: 'Agence',
    lieuRetour: 'Agence',
    extras: ['professional-driver', 'baby-chair'],
    prixTotal: 6000
  };
  
  // Fonction appelée lorsque l'authentification réussit
  const handleLoginSuccess = (user) => {
    console.log('Utilisateur connecté:', user);
    setUserData(user);
    setIsLoggedIn(true);
    
    // Vérifier si l'utilisateur peut procéder à la réservation
    if (user.canProceedToReservation === false) {
      console.log('L\'utilisateur doit compléter son profil avant de continuer');
      // Vous pouvez rediriger vers la page de profil ou afficher un message
    } else {
      console.log('L\'utilisateur peut procéder à la réservation');
      // Continuer le processus de réservation
    }
  };
  
  // Fonction appelée lorsque l'utilisateur annule la connexion
  const handleLoginCancel = () => {
    setHasAccount(false);
  };
  
  // Simuler la soumission de la réservation
  const handleSubmitReservation = () => {
    console.log('Réservation soumise avec les données utilisateur:', userData);
    alert('Réservation confirmée!');
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, m: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Confirmation de réservation
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Détails de la réservation
        </Typography>
        <Typography>Véhicule: {reservationData.vehiculeDetails.name}</Typography>
        <Typography>Date de départ: {reservationData.dateDepart}</Typography>
        <Typography>Date de retour: {reservationData.dateRetour}</Typography>
        <Typography>Prix total: {reservationData.prixTotal} DH</Typography>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Informations client
        </Typography>
        
        {isLoggedIn ? (
          // Afficher les informations de l'utilisateur connecté
          <Box>
            <Typography>Nom: {userData.nom} {userData.prenom}</Typography>
            <Typography>Email: {userData.email}</Typography>
            <Typography>Téléphone: {userData.telephone}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setIsLoggedIn(false)}
              sx={{ mt: 2 }}
            >
              Se déconnecter
            </Button>
          </Box>
        ) : (
          // Afficher l'option pour se connecter ou créer un compte
          <Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={hasAccount} 
                  onChange={() => setHasAccount(!hasAccount)}
                  color="primary"
                />
              }
              label="J'ai déjà un compte"
            />
            
            {hasAccount ? (
              // Afficher le composant de connexion
              <ReservationLogin
                onLoginSuccess={handleLoginSuccess}
                onCancel={handleLoginCancel}
                reservationData={reservationData}
              />
            ) : (
              // Afficher le formulaire d'inscription (à implémenter)
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Veuillez créer un compte pour continuer votre réservation.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => alert('Redirection vers la page d\'inscription')}
                >
                  Créer un compte
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      {isLoggedIn && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSubmitReservation}
          >
            Confirmer la réservation
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ExempleUtilisation;
