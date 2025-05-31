const db = require('../config/db');

const Client = {
  getAll: (callback) => {
    // Requête avec jointure pour récupérer les informations client et utilisateur associé
    const query = `
      SELECT c.*, u.Nom, u.Prenom, u.Email, u.Telephone
      FROM client c
      JOIN utilisateurs u ON c.UserID = u.UserID
      WHERE u.Roles = 'Client'
    `;
    db.query(query, callback);
  },
  
  getById: (id, callback) => {
    // Requête avec jointure pour récupérer les informations d'un client spécifique
    const query = `
      SELECT c.*, u.Nom, u.Prenom, u.Email, u.Telephone
      FROM client c
      JOIN utilisateurs u ON c.UserID = u.UserID
      WHERE c.UserID = ? AND u.Roles = 'Client'
    `;
    db.query(query, [id], callback);
  },
  
  create: (clientData, callback) => {
    db.query(
      'INSERT INTO client (UserID, Civilité, CIN_Passport, DateNaissance, NumPermis, DateDelivrancePermis, Adresse) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        clientData.UserID,
        clientData.Civilité,
        clientData.CIN_Passport,
        clientData.DateNaissance,
        clientData.NumPermis,
        clientData.DateDelivrancePermis,
        clientData.Adresse
      ],
      callback
    );
  },
  
  update: (id, clientData, callback) => {
    db.query(
      'UPDATE client SET Civilité = ?, CIN_Passport = ?, DateNaissance = ?, NumPermis = ?, DateDelivrancePermis = ?, Adresse = ? WHERE UserID = ?',
      [
        clientData.Civilité,
        clientData.CIN_Passport,
        clientData.DateNaissance,
        clientData.NumPermis,
        clientData.DateDelivrancePermis,
        clientData.Adresse,
        id
      ],
      callback
    );
  },
  
  delete: (id, callback) => {
    // Commencer une transaction pour supprimer à la fois le client et l'utilisateur
    db.beginTransaction(err => {
      if (err) {
        return callback(err, null);
      }

      // 1. Supprimer d'abord le client
      db.query('DELETE FROM client WHERE UserID = ?', [id], (err, result) => {
        if (err) {
          return db.rollback(() => {
            callback(err, null);
          });
        }

        // Vérifier si un client a été supprimé
        if (result.affectedRows === 0) {
          return db.rollback(() => {
            callback({ kind: "not_found" }, null);
          });
        }

        // 2. Supprimer ensuite l'utilisateur associé
        db.query('DELETE FROM utilisateurs WHERE UserID = ?', [id], (err, result) => {
          if (err) {
            return db.rollback(() => {
              callback(err, null);
            });
          }

          // Valider la transaction
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                callback(err, null);
              });
            }
            callback(null, { id: id, message: "Client et utilisateur supprimés avec succès" });
          });
        });
      });
    });
  },
  
  // Récupérer un client par son ID utilisateur
  findByUtilisateurId: (userId, callback) => {
    // Requête avec jointure pour récupérer les informations complètes d'un client à partir de son ID utilisateur
    const query = `
      SELECT c.*, u.Nom, u.Prenom, u.Email, u.Telephone, u.UserID
      FROM client c
      JOIN utilisateurs u ON c.UserID = u.UserID
      WHERE u.UserID = ? AND u.Roles = 'Client'
    `;
    db.query(query, [userId], (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      
      if (results.length === 0) {
        // Aucun client trouvé avec cet ID utilisateur
        callback({ kind: "not_found" }, null);
        return;
      }
      
      callback(null, results);
    });
  }
};

module.exports = Client;