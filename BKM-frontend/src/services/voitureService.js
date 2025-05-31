import api from './api';

const voitureService = {
  // Récupérer toutes les voitures
  getAllVoitures: async () => {
    try {
      const response = await api.get('/voitures');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voitures:', error.message);
      throw error;
    }
  },

  // Récupérer une voiture par son ID
  getVoitureById: async (id) => {
    try {
      const response = await api.get(`/voitures/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la voiture ${id}:`, error.message);
      throw error;
    }
  },

  // Récupérer les voitures disponibles
  getAvailableVoitures: async () => {
    try {
      const response = await api.get('/voitures/disponibles');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des voitures disponibles:', error.message);
      throw error;
    }
  },

  // Récupérer les voitures par catégorie
  getVoituresByCategorie: async (categorie) => {
    try {
      const response = await api.get(`/voitures/categorie/${categorie}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des voitures de catégorie ${categorie}:`, error.message);
      throw error;
    }
  },

  // Créer une nouvelle voiture
  createVoiture: async (voitureData) => {
    try {
      const response = await api.post('/voitures', voitureData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la voiture:', error);
      throw error;
    }
  },

  // Mettre à jour une voiture
  updateVoiture: async (id, voitureData) => {
    try {
      const response = await api.put(`/voitures/${id}`, voitureData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la voiture ${id}:`, error.message);
      throw error;
    }
  },

  // Supprimer une voiture
  deleteVoiture: async (id) => {
    try {
      const response = await api.delete(`/voitures/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la voiture ${id}:`, error.message);
      throw error;
    }
  },
  
  // Télécharger la photo d'un véhicule
  uploadVoiturePhoto: async (id, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await api.post(`/voitures/${id}/upload-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du téléchargement de la photo pour la voiture ${id}:`, error.message);
      throw error;
    }
  },

  // Vérifier la disponibilité des véhicules pour des dates spécifiques
  checkVoituresAvailability: async (dateDebut, dateFin) => {
    try {
      const response = await api.get('/voitures/disponibilite', {
        params: {
          dateDebut,
          dateFin
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification de la disponibilité des véhicules:', error.message);
      
      // Si l'erreur est un 404 (aucun véhicule disponible), retourner un tableau vide
      // au lieu de lancer une exception
      if (error.response && error.response.status === 404) {
        return [];
      }
      
      // Pour les autres types d'erreurs, lancer l'exception
      throw error;
    }
  }
};

export default voitureService;
