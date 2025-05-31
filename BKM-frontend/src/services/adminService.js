import api from './api';

const adminService = {
  // Récupérer tous les admins
  getAllAdmins: async () => {
    try {
      const response = await api.get('/admins');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des administrateurs:', error);
      throw error;
    }
  },

  // Récupérer un admin par son ID
  getAdminById: async (id) => {
    try {
      const response = await api.get(`/admins/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  // Récupérer un admin par son UserID
  getAdminByUserId: async (userId) => {
    try {
      const response = await api.get(`/admins/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'administrateur avec UserID ${userId}:`, error);
      throw error;
    }
  },

  // Créer un nouvel admin
  createAdmin: async (adminData) => {
    try {
      const response = await api.post('/admins', adminData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
      throw error;
    }
  },

  // Mettre à jour un admin
  updateAdmin: async (id, adminData) => {
    try {
      const response = await api.put(`/admins/${id}`, adminData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'administrateur ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un admin
  deleteAdmin: async (id) => {
    try {
      const response = await api.delete(`/admins/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'administrateur ${id}:`, error);
      throw error;
    }
  }
};

export default adminService;
