const db = require('../config/db');

const Reservation = {
  getAll: (callback) => {
    // Requête avec jointures pour récupérer les informations complètes des réservations
    const query = `
      SELECT r.*, 
             v.Marque, v.Modèle, v.Immatriculation,
             c.Civilité, c.CIN_Passport,
             u.Nom, u.Prenom, u.Telephone
      FROM reservation r
      LEFT JOIN voiture v ON r.VoitureID = v.VoitureID
      LEFT JOIN client c ON r.ClientID = c.UserID
      LEFT JOIN utilisateurs u ON c.UserID = u.UserID
    `;
    db.query(query, callback);
  },
  
  getById: (id, callback) => {
    // Requête avec jointures pour récupérer les informations complètes d'une réservation spécifique
    const query = `
      SELECT r.*, 
             v.Marque, v.Modèle, v.Immatriculation,
             c.Civilité, c.CIN_Passport,
             u.Nom, u.Prenom, u.Telephone
      FROM reservation r
      LEFT JOIN voiture v ON r.VoitureID = v.VoitureID
      LEFT JOIN client c ON r.ClientID = c.UserID
      LEFT JOIN utilisateurs u ON c.UserID = u.UserID
      WHERE r.ResID = ?
    `;
    db.query(query, [id], callback);
  },
  
  create: (reservationData, callback) => {
    db.query(
      'INSERT INTO reservation (VoitureID, ClientID, DateDébut, DateFin, Statut, ExtraID, LieuDepart, LieuArrivee) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reservationData.VoitureID,
        reservationData.ClientID,
        reservationData.DateDébut,
        reservationData.DateFin,
        reservationData.Statut,
        reservationData.ExtraID,
        reservationData.LieuDepart,
        reservationData.LieuArrivee
      ],
      callback
    );
  },
  
  update: (id, reservationData, callback) => {
    db.query(
      'UPDATE reservation SET VoitureID = ?, ClientID = ?, DateDébut = ?, DateFin = ?, Statut = ?, ExtraID = ?, LieuDepart = ?, LieuArrivee = ? WHERE ResID = ?',
      [
        reservationData.VoitureID,
        reservationData.ClientID,
        reservationData.DateDébut,
        reservationData.DateFin,
        reservationData.Statut,
        reservationData.ExtraID,
        reservationData.LieuDepart,
        reservationData.LieuArrivee,
        id
      ],
      callback
    );
  },
  
  delete: (id, callback) => {
    db.query('DELETE FROM reservation WHERE ResID = ?', [id], callback);
  },
  
  // Méthode pour obtenir les réservations d'un client spécifique
  getByClientId: (clientId, callback) => {
    // Requête avec jointures pour récupérer les informations complètes des réservations d'un client
    const query = `
      SELECT r.*, 
             v.Marque, v.Modèle, v.Immatriculation,
             c.Civilité, c.CIN_Passport,
             u.Nom, u.Prenom, u.Telephone
      FROM reservation r
      LEFT JOIN voiture v ON r.VoitureID = v.VoitureID
      LEFT JOIN client c ON r.ClientID = c.UserID
      LEFT JOIN utilisateurs u ON c.UserID = u.UserID
      WHERE r.ClientID = ?
    `;
    db.query(query, [clientId], callback);
  },
  
  // Méthode pour obtenir les réservations d'un véhicule spécifique
  getByVoitureId: (voitureId, callback) => {
    // Requête avec jointures pour récupérer les informations complètes des réservations d'un véhicule
    const query = `
      SELECT r.*, 
             v.Marque, v.Modèle, v.Immatriculation,
             c.Civilité, c.CIN_Passport,
             u.Nom, u.Prenom, u.Telephone
      FROM reservation r
      LEFT JOIN voiture v ON r.VoitureID = v.VoitureID
      LEFT JOIN client c ON r.ClientID = c.UserID
      LEFT JOIN utilisateurs u ON c.UserID = u.UserID
      WHERE r.VoitureID = ?
    `;
    db.query(query, [voitureId], callback);
  },
  
  // Méthode pour vérifier la disponibilité d'un véhicule
  checkAvailability: (voitureId, dateDebut, dateFin, callback) => {
    const query = `
      SELECT COUNT(*) as count
      FROM reservation
      WHERE VoitureID = ?
      AND (
        (DateDébut <= ? AND DateFin >= ?) OR
        (DateDébut <= ? AND DateFin >= ?) OR
        (DateDébut >= ? AND DateFin <= ?)
      )
    `;
    db.query(
      query,
      [voitureId, dateDebut, dateDebut, dateFin, dateFin, dateDebut, dateFin],
      callback
    );
  }
};

module.exports = Reservation;