import api from './api';

const lieuService = {
  // Insérer des données de test dans la table reservation
  insertTestData: async () => {
    try {
      console.log('Appel API: POST /lieux/test-data');
      const response = await api.post('/lieux/test-data');
      console.log('Réponse API insertTestData:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données de test:', error);
      throw error;
    }
  },
  
  // Récupérer la structure des colonnes LieuDepart et LieuArrivee
  getColumnInfo: async () => {
    try {
      console.log('Appel API: GET /lieux/column-info');
      const response = await api.get('/lieux/column-info');
      console.log('Réponse API getColumnInfo:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations sur les colonnes:', error);
      throw error;
    }
  },
  // Récupérer tous les lieux (départ et arrivée combinés)
  getAllLieux: async () => {
    try {
      console.log('Appel API: GET /lieux');
      const response = await api.get('/lieux');
      console.log('Réponse API getAllLieux:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux:', error);
      throw error;
    }
  },

  // Récupérer tous les lieux de départ
  getAllLieuxDepart: async () => {
    try {
      console.log('Appel API: GET /lieux/depart');
      const response = await api.get('/lieux/depart');
      console.log('Réponse API getAllLieuxDepart:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux de départ:', error);
      throw error;
    }
  },

  // Récupérer tous les lieux d'arrivée
  getAllLieuxArrivee: async () => {
    try {
      console.log('Appel API: GET /lieux/arrivee');
      const response = await api.get('/lieux/arrivee');
      console.log('Réponse API getAllLieuxArrivee:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des lieux d\'arrivée:', error);
      throw error;
    }
  }
};

export default lieuService;
