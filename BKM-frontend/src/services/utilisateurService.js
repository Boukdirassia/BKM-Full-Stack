import api from './api';

const utilisateurService = {
  // Récupérer tous les utilisateurs
  getAllUtilisateurs: async () => {
    try {
      const response = await api.get('/utilisateurs');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error.message);
      throw error;
    }
  },

  // Récupérer un utilisateur par son ID
  getUtilisateurById: async (id) => {
    try {
      const response = await api.get(`/utilisateurs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error.message);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  createUtilisateur: async (utilisateurData) => {
    try {
      // Assurez-vous que les champs requis sont présents et correctement formatés
      const formattedData = {
        Nom: utilisateurData.Nom || '',
        Prenom: utilisateurData.Prenom || '',
        Email: utilisateurData.Email || '',
        Password: utilisateurData.Password || '',
        Telephone: utilisateurData.Telephone || '',
        Roles: utilisateurData.Roles || 'Assistant'
      };
      

      const response = await api.post('/utilisateurs', formattedData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error.message);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  updateUtilisateur: async (id, utilisateurData) => {
    try {
      // Créer une copie des données pour éviter de modifier l'original
      const formattedData = {};
      
      // N'ajouter que les champs non vides et définis
      if (utilisateurData.Nom) formattedData.Nom = utilisateurData.Nom;
      if (utilisateurData.Prenom) formattedData.Prenom = utilisateurData.Prenom;
      if (utilisateurData.Email) formattedData.Email = utilisateurData.Email;
      if (utilisateurData.Telephone) formattedData.Telephone = utilisateurData.Telephone;
      if (utilisateurData.Roles) formattedData.Roles = utilisateurData.Roles;
      
      // N'incluez le mot de passe que s'il est fourni ET non vide
      if (utilisateurData.Password && utilisateurData.Password.trim() !== '') {
        formattedData.Password = utilisateurData.Password;
      }
      
      console.log('Données envoyées pour mise à jour:', formattedData);
      
      const response = await api.put(`/utilisateurs/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error.message);
      throw error;
    }
  },

  // Supprimer un utilisateur
  deleteUtilisateur: async (id) => {
    try {
      const response = await api.delete(`/utilisateurs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error.message);
      throw error;
    }
  },

  // Authentification
  login: async (credentials) => {
    try {
      const response = await api.post('/utilisateurs/login', credentials);
      // Stocker le token dans le localStorage si nécessaire
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error.message);
      throw error;
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default utilisateurService;
