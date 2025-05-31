const db = require('../config/db');
const Client = require('../models/client.model');
const Reservation = require('../models/reservation.model');

// Fonction pour créer un client et une réservation en même temps
exports.createClientAndReservation = (req, res) => {
  // Valider la requête
  if (!req.body) {
    return res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
  }

  // Vérifier si toutes les données nécessaires sont présentes
  if (!req.body.client || !req.body.reservation || !req.body.utilisateur) {
    return res.status(400).json({ 
      message: "Les informations client, utilisateur et réservation sont requises",
      details: "Assurez-vous que les objets client, utilisateur et reservation sont présents dans la requête"
    });
  }

  // Vérifier la disponibilité du véhicule avant de commencer la transaction
  Reservation.checkAvailability(
    req.body.reservation.VoitureID,
    req.body.reservation.DateDébut,
    req.body.reservation.DateFin,
    (err, data) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors de la vérification de la disponibilité",
          error: err.message
        });
      }

      // Si le véhicule n'est pas disponible
      if (data[0].count > 0) {
        return res.status(400).json({
          message: "Le véhicule n'est pas disponible pour les dates sélectionnées"
        });
      }

      // Commencer une transaction pour garantir l'intégrité des données
      db.beginTransaction(err => {
        if (err) {
          return res.status(500).json({
            message: "Une erreur s'est produite lors de l'initialisation de la transaction",
            error: err.message
          });
        }

        // 1. Créer l'utilisateur d'abord
        const userData = req.body.utilisateur;
        
        const createUserQuery = `
          INSERT INTO utilisateurs (Nom, Prenom, Email, Telephone, Password, Roles)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.query(
          createUserQuery,
          [
            userData.Nom,
            userData.Prenom,
            userData.Email,
            userData.Telephone,
            userData.Password || 'password123', // Valeur par défaut si non fournie
            userData.Roles || 'Client' // Valeur par défaut si non fournie
          ],
          (err, userResult) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  message: "Une erreur s'est produite lors de la création de l'utilisateur",
                  error: err.message
                });
              });
            }

            // Récupérer l'ID de l'utilisateur créé
            const userId = userResult.insertId;

            // 2. Créer le client avec l'ID utilisateur
            const clientData = req.body.client;
            const client = {
              UserID: userId,
              Civilité: clientData.Civilité,
              CIN_Passport: clientData.CIN_Passport,
              DateNaissance: clientData.DateNaissance,
              NumPermis: clientData.NumPermis,
              DateDelivrancePermis: clientData.DateDelivrancePermis,
              Adresse: clientData.Adresse
            };

            // Enregistrer le client dans la base de données
            Client.create(client, (err, clientResult) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({
                    message: "Une erreur s'est produite lors de la création du client",
                    error: err.message
                  });
                });
              }

              // 3. Créer la réservation avec l'ID client (qui est l'ID utilisateur)
              const reservationData = req.body.reservation;
              const reservation = {
                VoitureID: reservationData.VoitureID,
                ClientID: userId, // Utiliser l'ID de l'utilisateur comme ID client
                DateDébut: reservationData.DateDébut,
                DateFin: reservationData.DateFin,
                Statut: reservationData.Statut || 'En attente',
                ExtraID: reservationData.ExtraID,
                LieuDepart: reservationData.LieuDepart,
                LieuArrivee: reservationData.LieuArrivee
              };

              // Enregistrer la réservation dans la base de données
              Reservation.create(reservation, (err, reservationResult) => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({
                      message: "Une erreur s'est produite lors de la création de la réservation",
                      error: err.message
                    });
                  });
                }

                // Valider la transaction
                db.commit(err => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({
                        message: "Une erreur s'est produite lors de la validation de la transaction",
                        error: err.message
                      });
                    });
                  }

                  // Renvoyer les données du client et de la réservation créés
                  res.status(201).json({
                    message: "Client et réservation créés avec succès",
                    client: {
                      ...client,
                      ...userData,
                      UserID: userId
                    },
                    reservation: {
                      ...reservation,
                      ResID: reservationResult.insertId
                    }
                  });
                });
              });
            });
          }
        );
      });
    }
  );
};
