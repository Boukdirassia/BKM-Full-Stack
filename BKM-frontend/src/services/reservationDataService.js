// Service pour stocker les données de réservation associées à chaque client
// Ce service utilise localStorage pour les données temporaires et l'API pour les données persistantes
import api from './api';

const RESERVATION_DATA_KEY = 'bkm_reservation_data';
const PENDING_RESERVATION_KEY = 'pendingReservation';
const CLIENT_PENDING_RESERVATIONS_KEY = 'client_pending_reservations';

const reservationDataService = {
  // Sauvegarder les données de réservation temporaires (pendant le processus de réservation)
  saveReservationData: (data) => {
    localStorage.setItem(RESERVATION_DATA_KEY, JSON.stringify(data));
  },

  // Récupérer les données de réservation temporaires
  getReservationData: () => {
    const data = localStorage.getItem(RESERVATION_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Effacer les données de réservation temporaires
  clearReservationData: () => {
    localStorage.removeItem(RESERVATION_DATA_KEY);
  },
  
  // Sauvegarder une réservation en attente associée à un client spécifique
  savePendingReservation: (clientId, reservationData) => {
    // Sauvegarder dans le localStorage pour l'affichage immédiat
    localStorage.setItem(PENDING_RESERVATION_KEY, JSON.stringify(reservationData));
    
    try {
      // Récupérer les réservations en attente existantes
      let clientReservations = JSON.parse(localStorage.getItem(CLIENT_PENDING_RESERVATIONS_KEY)) || {};
      
      // Ajouter ou mettre à jour la réservation pour ce client
      clientReservations[clientId] = reservationData;
      
      // Sauvegarder dans le localStorage
      localStorage.setItem(CLIENT_PENDING_RESERVATIONS_KEY, JSON.stringify(clientReservations));
      
      // Sauvegarder dans la base de données via l'API (si implémentée)
      // Cette partie peut être développée plus tard pour une persistance côté serveur
      // api.post('/reservations/pending', { clientId, reservationData });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la réservation en attente:', error);
    }
  },
  
  // Récupérer la réservation en attente pour un client spécifique
  getPendingReservationByClientId: (clientId) => {
    try {
      // Récupérer les réservations en attente
      const clientReservations = JSON.parse(localStorage.getItem(CLIENT_PENDING_RESERVATIONS_KEY)) || {};
      
      // Retourner la réservation pour ce client si elle existe
      return clientReservations[clientId] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la réservation en attente:', error);
      return null;
    }
  },
  
  // Supprimer la réservation en attente pour un client spécifique
  clearPendingReservationByClientId: (clientId) => {
    try {
      // Récupérer les réservations en attente
      const clientReservations = JSON.parse(localStorage.getItem(CLIENT_PENDING_RESERVATIONS_KEY)) || {};
      
      // Supprimer la réservation pour ce client
      if (clientReservations[clientId]) {
        delete clientReservations[clientId];
        localStorage.setItem(CLIENT_PENDING_RESERVATIONS_KEY, JSON.stringify(clientReservations));
      }
      
      // Si c'est la réservation en cours, la supprimer aussi
      const currentReservation = JSON.parse(localStorage.getItem(PENDING_RESERVATION_KEY)) || {};
      if (currentReservation.clientId === clientId) {
        localStorage.removeItem(PENDING_RESERVATION_KEY);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation en attente:', error);
    }
  }
};

export default reservationDataService;
