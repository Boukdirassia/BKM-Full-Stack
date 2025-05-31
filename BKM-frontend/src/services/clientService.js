import api from './api';

const clientService = {
  // Récupérer tous les clients
  getAllClients: async () => {
    try {
      const response = await api.get('/clients');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      throw error;
    }
  },

  // Récupérer un client par son ID (peut être un ID utilisateur ou un ID client)
  getClientById: async (id) => {
    try {
      if (!id) {
        console.error('ID non valide pour la récupération du client');
        return null;
      }
      
      console.log(`Début de la récupération des données client pour l'ID ${id}`);
      
      let clientData = null;
      
      // Ajouter un timestamp pour éviter la mise en cache par le navigateur
      const timestamp = new Date().getTime();
      
      // Essayer d'abord avec l'endpoint client complet qui combine les données utilisateur et client
      try {
        const response = await api.get(`/clients/info/${id}?_t=${timestamp}`);
        console.log(`Données client complètes récupérées avec succès pour l'ID ${id}:`, response.data);
        clientData = response.data;
      } catch (completeClientError) {
        console.log(`Erreur avec l'endpoint /clients/info/${id}:`, completeClientError.message);
        
        // Si ça échoue, essayer avec l'endpoint client standard
        try {
          const clientResponse = await api.get(`/clients/${id}?_t=${timestamp}`);
          console.log(`Données client récupérées avec succès pour l'ID ${id}:`, clientResponse.data);
          clientData = clientResponse.data;
        } catch (clientError) {
          console.log(`Erreur avec l'endpoint /clients/${id}:`, clientError.message);
          
          // Si ça échoue aussi, essayer avec l'endpoint utilisateur
          try {
            const userResponse = await api.get(`/utilisateurs/${id}?_t=${timestamp}`);
            console.log(`Données utilisateur récupérées pour l'ID ${id}:`, userResponse.data);
            clientData = userResponse.data;
          } catch (userError) {
            console.log(`Erreur avec l'endpoint /utilisateurs/${id}:`, userError.message);
            
            // Si tout échoue, essayer avec l'endpoint utilisateur/client
            try {
              const userClientResponse = await api.get(`/utilisateurs/${id}/client?_t=${timestamp}`);
              console.log(`Données client récupérées via l'ID utilisateur ${id}:`, userClientResponse.data);
              clientData = userClientResponse.data;
            } catch (finalError) {
              console.error(`Toutes les tentatives de récupération ont échoué pour l'ID ${id}`);
              throw finalError;
            }
          }
        }
      }
      
      // Si nous avons récupéré des données, les normaliser pour avoir un format cohérent
      if (clientData) {
        // Normaliser les noms de champs pour avoir un format cohérent
        const normalizedData = {
          id: clientData.id || clientData.ClientID || clientData.UserID || id,
          nom: clientData.nom || clientData.Nom || '',
          prenom: clientData.prenom || clientData.Prenom || '',
          email: clientData.email || clientData.Email || '',
          telephone: clientData.telephone || clientData.Telephone || '',
          civilite: clientData.civilite || clientData.Civilite || clientData.Civilité || '',
          cinPassport: clientData.cinPassport || clientData.CinPassport || clientData.CIN_Passport || '',
          dateNaissance: clientData.dateNaissance || clientData.DateNaissance || '',
          numeroPermit: clientData.numeroPermit || clientData.numPermis || clientData.NumPermis || '',
          datePermit: clientData.datePermit || clientData.dateDelivrancePermis || clientData.DateDelivrancePermis || '',
          adresse: clientData.adresse || clientData.Adresse || ''
        };
        
        console.log(`Données client normalisées pour l'ID ${id}:`, normalizedData);
        return normalizedData;
      }
      
      return null;
    } catch (error) {
      console.error(`Erreur lors de la récupération du client/utilisateur ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau client
  createClient: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      throw error;
    }
  },

  // Mettre à jour les informations d'un client
  updateClient: async (id, clientData) => {
    try {
      if (!id) {
        console.error('ID non valide pour la mise à jour du client');
        return null;
      }

      console.log('Préparation des données pour la mise à jour du client:', clientData);
      
      // Récupérer les données client existantes pour préserver les valeurs non modifiées
      let existingClientData = null;
      try {
        const existingClient = await api.get(`/clients/${id}`);
        existingClientData = existingClient.data;
        console.log('Données client existantes récupérées:', existingClientData);
      } catch (error) {
        console.warn(`Impossible de récupérer les données client existantes pour l'ID ${id}:`, error.message);
        // Continuer sans les données existantes
      }
      
      // Préparer les données à envoyer au backend en préservant les valeurs existantes
      const dataToSend = {
        // Données client - utiliser les valeurs existantes si non fournies
        Civilité: clientData.Civilité || clientData.civilite || existingClientData?.Civilité,
        CIN_Passport: clientData.CIN_Passport || clientData.cinPassport || existingClientData?.CIN_Passport,
        DateNaissance: clientData.DateNaissance || clientData.dateNaissance || existingClientData?.DateNaissance,
        NumPermis: clientData.NumPermis || clientData.numeroPermit || clientData.numPermis || existingClientData?.NumPermis,
        DateDelivrancePermis: clientData.DateDelivrancePermis || clientData.datePermit || clientData.dateDelivrancePermis || existingClientData?.DateDelivrancePermis,
        Adresse: clientData.Adresse || clientData.adresse || existingClientData?.Adresse,
        
        // Données utilisateur - utiliser les valeurs existantes si non fournies
        utilisateur: {
          Nom: clientData.utilisateur?.Nom || clientData.nom || existingClientData?.Nom,
          Prenom: clientData.utilisateur?.Prenom || clientData.prenom || existingClientData?.Prenom,
          Email: clientData.utilisateur?.Email || clientData.email || existingClientData?.Email,
          Telephone: clientData.utilisateur?.Telephone || clientData.telephone || existingClientData?.Telephone
        }
      };
      
      // Filtrer les valeurs null ou undefined pour éviter d'écraser les données existantes
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === null || dataToSend[key] === undefined) {
          if (existingClientData && existingClientData[key] !== undefined) {
            dataToSend[key] = existingClientData[key];
          }
        }
      });
      
      // Faire de même pour les données utilisateur
      if (dataToSend.utilisateur) {
        Object.keys(dataToSend.utilisateur).forEach(key => {
          if (dataToSend.utilisateur[key] === null || dataToSend.utilisateur[key] === undefined) {
            if (existingClientData && existingClientData[key] !== undefined) {
              dataToSend.utilisateur[key] = existingClientData[key];
            }
          }
        });
      }
      
      console.log('Données envoyées au backend pour la mise à jour:', dataToSend);
      
      const response = await api.put(`/clients/${id}`, dataToSend);
      console.log('Réponse du backend après mise à jour:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un client
  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du client ${id}:`, error);
      throw error;
    }
  }
};

export default clientService;
