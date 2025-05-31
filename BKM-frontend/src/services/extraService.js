import api from './api';

const extraService = {
  // Récupérer tous les extras
  getAllExtras: async () => {
    try {
      const response = await api.get('/extras');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des extras:', error);
      throw error;
    }
  },

  // Récupérer un extra par son ID
  getExtraById: async (id) => {
    try {
      const response = await api.get(`/extras/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'extra ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel extra
  createExtra: async (extraData) => {
    try {
      const response = await api.post('/extras', extraData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'extra:', error);
      throw error;
    }
  },

  // Mettre à jour un extra
  updateExtra: async (id, extraData) => {
    try {
      const response = await api.put(`/extras/${id}`, extraData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'extra ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un extra
  deleteExtra: async (id) => {
    try {
      const response = await api.delete(`/extras/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'extra ${id}:`, error);
      throw error;
    }
  }
};

export default extraService;
