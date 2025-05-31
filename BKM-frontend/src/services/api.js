import axios from 'axios';

// Création d'une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: 'http://localhost:4000', // URL de base de votre API backend
  timeout: 10000, // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Vous pouvez ajouter un token d'authentification ici si nécessaire
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gestion globale des erreurs
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      // qui n'est pas dans la plage 2xx
      console.error('Erreur de réponse:', error.response.data);
      console.error('Statut:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      // Informations détaillées pour les erreurs 500
      if (error.response.status === 500) {
        console.error('Détails de l\'erreur 500:', {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data ? JSON.parse(error.config.data) : null,
          message: error.message
        });
      }
      
      // Ajouter des informations spécifiques à l'erreur pour faciliter le débogage
      error.friendlyMessage = error.response.data?.message || 
                             'Une erreur est survenue lors de la communication avec le serveur';
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Erreur de requête - aucune réponse reçue:', error.request);
      error.friendlyMessage = 'Le serveur ne répond pas. Vérifiez votre connexion internet ou réessayez plus tard.';
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
      error.friendlyMessage = 'Une erreur est survenue lors de la préparation de la requête.';
    }
    
    // Ajouter un timestamp pour faciliter le débogage
    error.timestamp = new Date().toISOString();
    
    return Promise.reject(error);
  }
);

export default api;
