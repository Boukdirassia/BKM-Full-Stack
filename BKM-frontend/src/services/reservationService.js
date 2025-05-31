import api from './api';

const reservationService = {
  // Récupérer toutes les réservations
  getAllReservations: async () => {
    try {
      const response = await api.get('/reservations');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une réservation par son ID
  getReservationById: async (id) => {
    try {
      const response = await api.get(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les réservations d'un client
  getReservationsByClientId: async (clientId) => {
    try {
      const response = await api.get(`/reservations/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les réservations d'un véhicule
  getReservationsByVoitureId: async (voitureId) => {
    try {
      const response = await api.get(`/reservations/voiture/${voitureId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Créer une nouvelle réservation
  createReservation: async (reservationData) => {
    try {
      const response = await api.post('/reservations', reservationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une réservation
  updateReservation: async (id, reservationData) => {
    try {
      const response = await api.put(`/reservations/${id}`, reservationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une réservation
  deleteReservation: async (id) => {
    try {
      const response = await api.delete(`/reservations/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Vérifier la disponibilité d'un véhicule pour une période donnée
  checkVehicleAvailability: async (vehicleId, startDate, endDate, excludeReservationId = null) => {
    try {
      // Récupérer toutes les réservations pour ce véhicule
      const allReservations = await reservationService.getReservationsByVoitureId(vehicleId);
      
      // Convertir les dates en objets Date pour la comparaison
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Vérifier s'il y a des chevauchements avec d'autres réservations
      const conflictingReservation = allReservations.find(reservation => {
        // Ignorer la réservation en cours d'édition (si applicable)
        if (excludeReservationId && reservation.ResID === excludeReservationId) {
          return false;
        }
        
        // Convertir les dates de la réservation existante
        const resStart = new Date(reservation.DateDébut);
        const resEnd = new Date(reservation.DateFin);
        
        // Vérifier s'il y a chevauchement
        // Un chevauchement existe si la période demandée commence avant la fin d'une réservation existante
        // ET se termine après le début d'une réservation existante
        return (start <= resEnd && end >= resStart);
      });
      
      return {
        available: !conflictingReservation,
        conflictingReservation: conflictingReservation || null
      };
    } catch (error) {
      throw error;
    }
  },
};

export default reservationService;
