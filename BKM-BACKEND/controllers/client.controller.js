const Client = require('../models/client.model');
const db = require('../config/db');

// Récupérer tous les clients
exports.getAllClients = (req, res) => {
  Client.getAll((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des clients", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer les informations complètes d'un client (données client + utilisateur)
exports.getClientInfo = (req, res) => {
  const id = req.params.id;
  
  // Vérifier si l'ID est un ID utilisateur ou un ID client
  if (!id) {
    return res.status(400).json({ message: "ID client ou utilisateur requis" });
  }
  
  // Essayer d'abord de récupérer les informations client en supposant que l'ID est un ID utilisateur
  const query = `
    SELECT c.*, u.UserID, u.Nom, u.Prenom, u.Email, u.Telephone, u.Roles
    FROM client c
    JOIN utilisateurs u ON c.UserID = u.UserID
    WHERE u.UserID = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ 
        message: "Erreur lors de la récupération des informations client", 
        error: err.message 
      });
    }
    
    if (results.length > 0) {
      // Informations client trouvées avec l'ID utilisateur
      return res.json(results[0]);
    } else {
      // Essayer de récupérer les informations en supposant que l'ID est un ID client
      const clientQuery = `
        SELECT c.*, u.UserID, u.Nom, u.Prenom, u.Email, u.Telephone, u.Roles
        FROM client c
        JOIN utilisateurs u ON c.UserID = u.UserID
        WHERE c.ClientID = ?
      `;
      
      db.query(clientQuery, [id], (clientErr, clientResults) => {
        if (clientErr) {
          return res.status(500).json({ 
            message: "Erreur lors de la récupération des informations client", 
            error: clientErr.message 
          });
        }
        
        if (clientResults.length > 0) {
          // Informations client trouvées avec l'ID client
          return res.json(clientResults[0]);
        } else {
          // Essayer de récupérer uniquement les informations utilisateur
          const userQuery = `
            SELECT * FROM utilisateurs WHERE UserID = ?
          `;
          
          db.query(userQuery, [id], (userErr, userResults) => {
            if (userErr) {
              return res.status(500).json({ 
                message: "Erreur lors de la récupération des informations utilisateur", 
                error: userErr.message 
              });
            }
            
            if (userResults.length > 0) {
              // Informations utilisateur trouvées
              return res.json(userResults[0]);
            } else {
              // Aucune information trouvée
              return res.status(404).json({ 
                message: `Aucune information trouvée pour l'ID ${id}` 
              });
            }
          });
        }
      });
    }
  });
};

// Récupérer un client par son ID
exports.getClientById = (req, res) => {
  Client.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Client avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération du client", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Créer un nouveau client
exports.createClient = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Vérifier si les données utilisateur sont fournies
  if (!req.body.utilisateur) {
    res.status(400).json({ message: "Les informations utilisateur sont requises" });
    return;
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
        const client = {
          UserID: userId,
          Civilité: req.body.Civilité,
          CIN_Passport: req.body.CIN_Passport,
          DateNaissance: req.body.DateNaissance,
          NumPermis: req.body.NumPermis,
          DateDelivrancePermis: req.body.DateDelivrancePermis,
          Adresse: req.body.Adresse
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

            // Renvoyer les données du client créé avec l'ID utilisateur
            res.status(201).json({
              ...clientResult,
              UserID: userId,
              ...userData
            });
          });
        });
      }
    );
  });
};

// Mettre à jour un client
exports.updateClient = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Commencer une transaction pour mettre à jour à la fois le client et l'utilisateur
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({
        message: "Une erreur s'est produite lors de l'initialisation de la transaction",
        error: err.message
      });
    }

    // 1. Mettre à jour les informations client
    Client.update(
      req.params.id,
      {
        Civilité: req.body.Civilité,
        CIN_Passport: req.body.CIN_Passport,
        DateNaissance: req.body.DateNaissance,
        NumPermis: req.body.NumPermis,
        DateDelivrancePermis: req.body.DateDelivrancePermis,
        Adresse: req.body.Adresse
      },
      (err, clientData) => {
        if (err) {
          return db.rollback(() => {
            if (err.kind === "not_found") {
              res.status(404).json({ message: `Client avec l'ID ${req.params.id} non trouvé` });
            } else {
              res.status(500).json({ message: "Erreur lors de la mise à jour du client", error: err.message });
            }
          });
        }

        // 2. Mettre à jour les informations utilisateur si elles sont fournies
        if (req.body.utilisateur) {
          const userData = req.body.utilisateur;
          const updateFields = [];
          const updateValues = [];

          // Ajouter les champs à mettre à jour
          if (userData.Nom) {
            updateFields.push('Nom = ?');
            updateValues.push(userData.Nom);
          }

          if (userData.Prenom) {
            updateFields.push('Prenom = ?');
            updateValues.push(userData.Prenom);
          }

          if (userData.Email) {
            updateFields.push('Email = ?');
            updateValues.push(userData.Email);
          }

          if (userData.Telephone) {
            updateFields.push('Telephone = ?');
            updateValues.push(userData.Telephone);
          }

          // N'inclure le mot de passe que s'il est explicitement fourni et non vide
          if (userData.Password && userData.Password.trim() !== '') {
            updateFields.push('Password = ?');
            updateValues.push(userData.Password);
          }

          // Si des champs utilisateur sont à mettre à jour
          if (updateFields.length > 0) {
            // Construire la requête SQL
            const sql = `UPDATE utilisateurs SET ${updateFields.join(', ')} WHERE UserID = ?`;
            
            // Ajouter l'ID à la fin des valeurs
            updateValues.push(req.params.id);
            
            // Exécuter la requête
            db.query(sql, updateValues, (err, userResult) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({
                    message: "Erreur lors de la mise à jour de l'utilisateur",
                    error: err.message
                  });
                });
              }
              
              // Valider la transaction
              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({
                      message: "Erreur lors de la validation de la transaction",
                      error: err.message
                    });
                  });
                }
                
                // Renvoyer les données mises à jour
                res.json({
                  message: "Client et utilisateur mis à jour avec succès",
                  clientData,
                  userResult
                });
              });
            });
          } else {
            // Si aucun champ utilisateur n'est à mettre à jour, valider la transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({
                    message: "Erreur lors de la validation de la transaction",
                    error: err.message
                  });
                });
              }
              
              // Renvoyer les données mises à jour
              res.json({
                message: "Client mis à jour avec succès",
                data: clientData
              });
            });
          }
        } else {
          // Si aucune information utilisateur n'est fournie, valider la transaction
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({
                  message: "Erreur lors de la validation de la transaction",
                  error: err.message
                });
              });
            }
            
            // Renvoyer les données mises à jour
            res.json({
              message: "Client mis à jour avec succès",
              data: clientData
            });
          });
        }
      }
    );
  });
};

// Supprimer un client
exports.deleteClient = (req, res) => {
  Client.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Client avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Erreur lors de la suppression du client", error: err.message });
      }
    } else {
      res.json({ message: "Client supprimé avec succès" });
    }
  });
};