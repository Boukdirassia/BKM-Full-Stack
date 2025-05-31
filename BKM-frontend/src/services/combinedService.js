import api from './api';

const combinedService = {
  // Créer un client et une réservation en même temps (mode combiné)
  createClientAndReservation: async (data) => {
    try {
      // Extraire les parties du nom complet (supposer que le format est "Prénom Nom")
      const nameParts = data.client.nom_complet.split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';

      // Préparer les données pour l'API
      const payload = {
        client: {
          Civilité: data.client.civilite,
          CIN_Passport: data.client.cin_passport,
          DateNaissance: data.client.dateNaissance,
          NumPermis: data.client.numPermis,
          DateDelivrancePermis: data.client.dateDelivrancePermis,
          Adresse: data.client.adresse
        },
        utilisateur: {
          Nom: nom,
          Prenom: prenom,
          Email: data.client.email || `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/\s+/g, '')}@example.com`,
          Telephone: data.client.telephone,
          Password: 'password123', // Mot de passe par défaut
          Roles: 'Client'
        },
        reservation: {
          VoitureID: parseInt(data.reservation.vehicle, 10),
          DateDébut: data.reservation.startDate,
          DateFin: data.reservation.endDate,
          Statut: data.reservation.statut || 'En attente',
          ExtraID: data.reservation.extra ? parseInt(data.reservation.extra, 10) : null,
          LieuDepart: data.reservation.lieuDepart || null,
          LieuArrivee: data.reservation.lieuArrivee || null
        }
      };

      console.log('Données envoyées au serveur (mode combiné):', payload);
      
      const response = await api.post('/combined/client-reservation', payload);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création combinée client/réservation:', error);
      throw error;
    }
  }
};

export default combinedService;
