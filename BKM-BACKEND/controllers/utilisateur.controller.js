const Utilisateur = require('../models/utilisateur.model');
// Temporairement commenté jusqu'à ce que bcrypt soit correctement installé
const bcrypt = require('bcrypt');
// const saltRounds = 10; // Nombre de tours pour le hachage

// Récupérer tous les utilisateurs
exports.getAllUtilisateurs = (req, res) => {
  Utilisateur.getAll((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer un utilisateur par son ID
exports.getUtilisateurById = (req, res) => {
  Utilisateur.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Utilisateur avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Créer un nouvel utilisateur
exports.createUtilisateur = (req, res) => {
  if (!req.body || !req.body.Password) {
    return res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
  }

  Utilisateur.findByEmail(req.body.Email, (err, data) => {
    if (err && err.kind !== "not_found") {
      return res.status(500).json({
        message: "Erreur lors de la vérification de l'email",
        error: err.message
      });
    }

    if (data && data.length > 0) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé"
      });
    }

    // Hachage du mot de passe
    bcrypt.hash(String(req.body.Password), 10, (err, hash) => {
      if (err) {
        return res.status(500).json({
          message: "Erreur lors du hachage du mot de passe",
          error: err.message
        });
      }

      const utilisateur = {
        Nom: req.body.Nom,
        Prenom: req.body.Prenom,
        Email: req.body.Email,
        Telephone: req.body.Telephone,
        Password: hash,
        Roles: req.body.Roles || 'client'
      };

      console.log("hashpassword :", hash);
      console.log("Utilisateur à enregistrer :", utilisateur);

      Utilisateur.create(utilisateur, (err, data) => {
        if (err) {
          return res.status(500).json({
            message: "Erreur lors de la création de l'utilisateur",
            error: err.message
          });
        } else {
          return res.status(201).json(data);
        }
      });
    });
  });
};

// Mettre à jour un utilisateur
exports.updateUtilisateur = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Si l'email est modifié, vérifier s'il existe déjà
  if (req.body.Email) {
    Utilisateur.findByEmail(req.body.Email, (err, data) => {
      if (err) {
        if (err.kind !== "not_found") {
          res.status(500).json({
            message: "Erreur lors de la vérification de l'email",
            error: err.message
          });
          return;
        }
      }

      // Si l'email existe et qu'il appartient à un autre utilisateur
      if (data && data.length > 0 && data[0].UserID != req.params.id) {
        res.status(400).json({
          message: "Cet email est déjà utilisé par un autre utilisateur"
        });
        return;
      }

      // Version sans hachage (temporaire)
      const userData = {
        Nom: req.body.Nom,
        Prenom: req.body.Prenom,
        Email: req.body.Email,
        Telephone: req.body.Telephone,
        Roles: req.body.Roles
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (req.body.Password && req.body.Password.trim() !== '') {
        userData.Password = req.body.Password;
      }

      updateUtilisateurInDB(userData);
    });
  } else {
    // Version sans hachage (temporaire)
    const userData = {
      Nom: req.body.Nom,
      Prenom: req.body.Prenom,
      Email: req.body.Email,
      Telephone: req.body.Telephone,
      Roles: req.body.Roles
    };

    // Ajouter le mot de passe seulement s'il est fourni
    if (req.body.Password && req.body.Password.trim() !== '') {
      userData.Password = req.body.Password;
    }

    updateUtilisateurInDB(userData);
  }

  function updateUtilisateurInDB(userData) {
    Utilisateur.update(
      req.params.id,
      userData,
      (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).json({ message: `Utilisateur avec l'ID ${req.params.id} non trouvé` });
          } else {
            res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: err.message });
          }
        } else {
          res.json(data);
        }
      }
    );
  }
};

// Supprimer un utilisateur
exports.deleteUtilisateur = (req, res) => {
  Utilisateur.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Utilisateur avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Impossible de supprimer l'utilisateur", error: err.message });
      }
    } else {
      res.json({ message: "Utilisateur supprimé avec succès!" });
    }
  });
};

// Fonction pour l'authentification des utilisateurs avec bcrypt
exports.login = (req, res) => {
  if (!req.body || !req.body.Email || !req.body.Password) {
    return res.status(400).json({
      message: "Veuillez fournir un email et un mot de passe"
    });
  }

  const { Email, Password: inputPassword, isReservationProcess } = req.body;

  Utilisateur.findByEmail(Email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      } else {
        console.error('Erreur lors de la recherche de l\'utilisateur:', err);
        return res.status(500).json({ message: "Une erreur est survenue lors de la connexion. Veuillez réessayer plus tard." });
      }
    }

    if (!data || data.length === 0) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const userData = data[0];
    const hashedPassword = userData.Password;

    bcrypt.compare(inputPassword, hashedPassword, (err, isMatch) => {
      if (err) {
        console.error('Erreur lors de la comparaison des mots de passe:', err);
        return res.status(500).json({ message: "Erreur de vérification du mot de passe" });
      }

      if (!isMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const { Password, ...userWithoutPassword } = userData;

      const token = Buffer.from(JSON.stringify({
        id: userWithoutPassword.UserID,
        email: userWithoutPassword.Email,
        role: userWithoutPassword.Roles
      })).toString('base64');

      let role = 'client';
      if (userWithoutPassword.Roles) {
        const userRole = userWithoutPassword.Roles.toLowerCase();
        if (userRole.includes('admin')) role = 'admin';
        else if (userRole.includes('assistant')) role = 'assistant';
      }

      if (role === 'client') {
        const Client = require('../models/client.model');
        Client.findByUtilisateurId(userWithoutPassword.UserID, (err, clientData) => {
          if (err || !clientData || clientData.length === 0) {
            return res.json({
              message: "Authentification réussie",
              user: userWithoutPassword,
              token,
              role,
              isReservationProcess,
              canProceedToReservation: false,
              missingFields: ['civilite', 'cinPassport', 'dateNaissance', 'numPermis', 'dateDelivrancePermis', 'adresse']
            });
          }

          const clientInfo = clientData[0];
          const completeUserInfo = {
            ...userWithoutPassword,
            id: userWithoutPassword.UserID,
            clientId: clientInfo.ClientID,
            nom: userWithoutPassword.Nom,
            prenom: userWithoutPassword.Prenom,
            email: userWithoutPassword.Email,
            telephone: userWithoutPassword.Telephone,
            civilite: clientInfo.Civilité || '',
            cinPassport: clientInfo.CIN_Passport || '',
            dateNaissance: clientInfo.DateNaissance || null,
            numPermis: clientInfo.NumPermis || '',
            dateDelivrancePermis: clientInfo.DateDelivrancePermis || null,
            adresse: clientInfo.Adresse || ''
          };

          if (isReservationProcess) {
            const requiredFields = ['civilite', 'cinPassport', 'dateNaissance', 'numPermis', 'dateDelivrancePermis', 'adresse'];
            const missingFields = requiredFields.filter(field => !completeUserInfo[field]);

            return res.json({
              message: "Authentification réussie",
              user: completeUserInfo,
              token,
              role,
              isReservationProcess: true,
              missingFields,
              canProceedToReservation: missingFields.length === 0
            });
          }

          return res.json({
            message: "Authentification réussie",
            user: completeUserInfo,
            token,
            role
          });
        });
      } else {
        return res.json({
          message: "Authentification réussie",
          user: userWithoutPassword,
          token,
          role,
          isReservationProcess
        });
      }
    });
  });
};