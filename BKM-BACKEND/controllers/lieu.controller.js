const Lieu = require('../models/lieu.model');

// Insérer des données de test dans la table reservation
exports.insertTestData = (req, res) => {
  console.log('Requête reçue pour insertTestData');
  Lieu.insertTestData((err, data) => {
    if (err) {
      console.error('Erreur lors de l\'insertion des données de test:', err);
      res.status(500).json({ 
        message: "Erreur lors de l'insertion des données de test", 
        error: err.message 
      });
    } else {
      console.log('Données de test insérées avec succès:', data);
      res.json(data);
    }
  });
};

// Récupérer la structure des colonnes LieuDepart et LieuArrivee
exports.getColumnInfo = (req, res) => {
  console.log('Requête reçue pour getColumnInfo');
  Lieu.getColumnInfo((err, data) => {
    if (err) {
      console.error('Erreur lors de la récupération des informations sur les colonnes:', err);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des informations sur les colonnes", 
        error: err.message 
      });
    } else {
      console.log('Informations sur les colonnes récupérées:', data);
      res.json(data);
    }
  });
};

// Récupérer tous les lieux de départ
exports.getAllLieuxDepart = (req, res) => {
  console.log('Requête reçue pour getAllLieuxDepart');
  Lieu.getAllLieuxDepart((err, data) => {
    if (err) {
      console.error('Erreur lors de la récupération des lieux de départ:', err);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des lieux de départ", 
        error: err.message 
      });
    } else {
      console.log(`Lieux de départ récupérés: ${data.length}`, data);
      console.log('Réponse envoyée pour getAllLieuxDepart:', data);
      res.json(data);
    }
  });
};

// Récupérer tous les lieux d'arrivée
exports.getAllLieuxArrivee = (req, res) => {
  console.log('Requête reçue pour getAllLieuxArrivee');
  Lieu.getAllLieuxArrivee((err, data) => {
    if (err) {
      console.error('Erreur lors de la récupération des lieux d\'arrivée:', err);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des lieux d'arrivée", 
        error: err.message 
      });
    } else {
      console.log(`Lieux d'arrivée récupérés: ${data.length}`, data);
      console.log('Réponse envoyée pour getAllLieuxArrivee:', data);
      res.json(data);
    }
  });
};

// Récupérer tous les lieux (départ et arrivée combinés)
exports.getAllLieux = (req, res) => {
  console.log('Requête reçue pour getAllLieux');
  Lieu.getAllLieux((err, data) => {
    if (err) {
      console.error('Erreur lors de la récupération des lieux combinés:', err);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des lieux", 
        error: err.message 
      });
    } else {
      console.log(`Tous les lieux récupérés: ${data.length}`, data);
      console.log('Réponse envoyée pour getAllLieux:', data);
      res.json(data);
    }
  });
};
