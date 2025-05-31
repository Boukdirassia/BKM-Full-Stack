const Reservation = require('../models/reservation.model');

// Récupérer toutes les réservations
exports.getAllReservations = (req, res) => {
  Reservation.getAll((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des réservations", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer une réservation par son ID
exports.getReservationById = (req, res) => {
  Reservation.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Réservation avec l'ID ${req.params.id} non trouvée` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération de la réservation", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Créer une nouvelle réservation
exports.createReservation = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Vérifier la disponibilité du véhicule
  Reservation.checkAvailability(
    req.body.VoitureID,
    req.body.DateDébut,
    req.body.DateFin,
    (err, data) => {
      if (err) {
        res.status(500).json({
          message: "Erreur lors de la vérification de la disponibilité",
          error: err.message
        });
        return;
      }

      // Si le véhicule n'est pas disponible
      if (data[0].count > 0) {
        res.status(400).json({
          message: "Le véhicule n'est pas disponible pour les dates sélectionnées"
        });
        return;
      }

      // Créer une réservation
      // Afficher le corps complet de la requête pour débogage
      console.log('Requête complète reçue:', JSON.stringify(req.body, null, 2));
      console.log('LieuDepart reçu:', req.body.LieuDepart);
      console.log('Type de LieuDepart:', typeof req.body.LieuDepart);
      
      const reservation = {
        VoitureID: req.body.VoitureID,
        ClientID: req.body.ClientID,
        DateDébut: req.body.DateDébut,
        DateFin: req.body.DateFin,
        Statut: req.body.Statut || 'En attente',
        ExtraID: req.body.ExtraID,
        LieuDepart: req.body.LieuDepart || 'Non spécifié', // Ajouter une valeur par défaut
        LieuArrivee: req.body.LieuArrivee || 'Non spécifié' // Ajouter une valeur par défaut
      };
      
      console.log('Création réservation avec:', reservation);

      // Enregistrer la réservation dans la base de données
      Reservation.create(reservation, (err, data) => {
        if (err) {
          res.status(500).json({
            message: "Une erreur s'est produite lors de la création de la réservation",
            error: err.message
          });
        } else {
          res.status(201).json(data);
        }
      });
    }
  );
};

// Mettre à jour une réservation
exports.updateReservation = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Si les dates sont modifiées, vérifier la disponibilité
  if (req.body.DateDébut && req.body.DateFin) {
    Reservation.checkAvailability(
      req.body.VoitureID,
      req.body.DateDébut,
      req.body.DateFin,
      (err, data) => {
        if (err) {
          res.status(500).json({
            message: "Erreur lors de la vérification de la disponibilité",
            error: err.message
          });
          return;
        }

        // Si le véhicule n'est pas disponible (en excluant la réservation actuelle)
        if (data[0].count > 1) {
          res.status(400).json({
            message: "Le véhicule n'est pas disponible pour les dates sélectionnées"
          });
          return;
        }

        updateReservationInDB();
      }
    );
  } else {
    updateReservationInDB();
  }

  function updateReservationInDB() {
    console.log('Mise à jour réservation avec:', req.body);
    
    Reservation.update(
      req.params.id,
      {
        VoitureID: req.body.VoitureID,
        ClientID: req.body.ClientID,
        DateDébut: req.body.DateDébut,
        DateFin: req.body.DateFin,
        Statut: req.body.Statut,
        ExtraID: req.body.ExtraID,
        LieuDepart: req.body.LieuDepart,
        LieuArrivee: req.body.LieuArrivee
      },
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).json({ message: `Réservation avec l'ID ${req.params.id} non trouvée` });
          } else {
            res.status(500).json({ message: "Erreur lors de la mise à jour de la réservation", error: err.message });
          }
        } else {
          res.json(data);
        }
      }
    );
  }
};

// Supprimer une réservation
exports.deleteReservation = (req, res) => {
  Reservation.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Réservation avec l'ID ${req.params.id} non trouvée` });
      } else {
        res.status(500).json({ message: "Impossible de supprimer la réservation", error: err.message });
      }
    } else {
      res.json({ message: "Réservation supprimée avec succès!" });
    }
  });
};

// Récupérer les réservations d'un client
exports.getReservationsByClientId = (req, res) => {
  Reservation.getByClientId(req.params.clientId, (err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des réservations du client", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer les réservations d'un véhicule
exports.getReservationsByVoitureId = (req, res) => {
  Reservation.getByVoitureId(req.params.voitureId, (err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des réservations du véhicule", error: err.message });
    } else {
      res.json(data);
    }
  });
};