import api from './api';

const authService = {
  // Enregistrer un nouveau client
  register: async (userData) => {
    try {
      // Vérifier et formater les données obligatoires
      if (!userData.nom || !userData.prenom || !userData.email || !userData.password) {
        throw new Error('Informations obligatoires manquantes: nom, prénom, email ou mot de passe');
      }

      // Formater les dates si elles existent
      let dateNaissance = null;
      if (userData.dateNaissance) {
        try {
          dateNaissance = new Date(userData.dateNaissance).toISOString().split('T')[0];
        } catch (e) {
          console.warn('Format de date de naissance invalide:', e);
        }
      }

      let datePermit = null;
      if (userData.datePermit) {
        try {
          datePermit = new Date(userData.datePermit).toISOString().split('T')[0];
        } catch (e) {
          console.warn('Format de date de permis invalide:', e);
        }
      }

      // Préparer les données du client pour l'API
      const clientData = {
        utilisateur: {
          Nom: userData.nom,
          Prenom: userData.prenom,
          Email: userData.email,
          Telephone: userData.telephone || '',
          Password: userData.password,
          Roles: 'Client'
        },
        Civilité: userData.civilite || '',
        CIN_Passport: userData.cinPassport || '',
        DateNaissance: dateNaissance,
        NumPermis: userData.numeroPermit || '',
        DateDelivrancePermis: datePermit,
        Adresse: userData.adresse || ''
      };

      console.log('Données envoyées pour l\'enregistrement:', JSON.stringify(clientData));
      const response = await api.post('/clients', clientData);
      
      // Si l'enregistrement est réussi, stocker le token dans localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Indiquer que l'utilisateur est authentifié
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        console.warn('Aucun token reçu après l\'enregistrement. L\'utilisateur devra se connecter manuellement.');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      throw error;
    }
  },

  // Connecter un utilisateur existant en utilisant la table utilisateurs et la colonne Roles
  login: async (credentials, isReservationProcess = false) => {
    try {
      // Utiliser l'API d'authentification du backend
      const response = await api.post('/utilisateurs/login', {
        Email: credentials.email,
        Password: credentials.password,
        isReservationProcess: isReservationProcess // Indiquer si l'authentification fait partie du processus de réservation
      });
      
      // Si la connexion est réussie, stocker le token et les informations utilisateur dans localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Stocker le rôle de l'utilisateur depuis la colonne Roles de la table utilisateurs
        if (response.data.role) {
          localStorage.setItem('role', response.data.role);
        }
        
        // Récupérer les informations complètes du client si c'est un client
        if (response.data.role === 'client' && response.data.user && response.data.user.UserID) {
          try {
            // Importer le service client (on ne peut pas l'importer directement en haut du fichier à cause des dépendances circulaires)
            const clientService = await import('./clientService').then(module => module.default);
            
            // Récupérer les informations complètes du client
            const clientInfoResponse = await api.get(`/clients/info/${response.data.user.UserID}`);
            
            if (clientInfoResponse.data) {
              // Combiner les informations utilisateur et client
              const completeUserInfo = {
                ...response.data.user,
                ...clientInfoResponse.data,
                id: response.data.user.UserID,
                clientId: clientInfoResponse.data.ClientID,
                nom: clientInfoResponse.data.Nom || response.data.user.Nom,
                prenom: clientInfoResponse.data.Prenom || response.data.user.Prenom,
                email: clientInfoResponse.data.Email || response.data.user.Email,
                telephone: clientInfoResponse.data.Telephone || response.data.user.Telephone
              };
              
              // Stocker les informations complètes dans localStorage
              localStorage.setItem('user', JSON.stringify(completeUserInfo));
              console.log('Informations client complètes stockées:', completeUserInfo);
              
              // Mettre à jour la réponse avec les informations complètes
              response.data.user = completeUserInfo;
              
              // Conserver l'indicateur isReservationProcess s'il est présent
              if (isReservationProcess) {
                response.data.isReservationProcess = true;
              }
            } else {
              // Si les informations complètes ne sont pas disponibles, stocker les informations de base
              localStorage.setItem('user', JSON.stringify(response.data.user));
              
              // Conserver l'indicateur isReservationProcess s'il est présent
              if (isReservationProcess) {
                response.data.isReservationProcess = true;
              }
            }
          } catch (clientError) {
            console.error('Erreur lors de la récupération des informations client complètes:', clientError);
            // En cas d'erreur, stocker les informations de base
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } else {
          // Pour les autres rôles, stocker les informations de base
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
      
      return response.data;
    } catch (error) {
      // Extraire le message d'erreur de la réponse de l'API si disponible
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      // Créer une nouvelle erreur avec le message approprié
      const authError = new Error(errorMessage);
      throw authError;
    }
  },

  // Déconnecter l'utilisateur
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Récupérer l'utilisateur connecté
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
