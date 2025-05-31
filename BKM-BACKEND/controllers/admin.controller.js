const Admin = require('../models/admin.model');

// Récupérer tous les admins
exports.getAllAdmins = (req, res) => {
  Admin.getAll((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des administrateurs", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer un admin par son ID
exports.getAdminById = (req, res) => {
  Admin.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Administrateur avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération de l'administrateur", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Récupérer un admin par son UserID
exports.getAdminByUserId = (req, res) => {
  Admin.getByUserId(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Administrateur avec l'UserID ${req.params.userId} non trouvé` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération de l'administrateur", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Créer un nouvel admin
exports.createAdmin = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Créer un admin
  const admin = {
    UserID: req.body.UserID,
    Role: req.body.Role,
    Permissions: req.body.Permissions
  };

  // Enregistrer l'admin dans la base de données
  Admin.create(admin, (err, data) => {
    if (err) {
      res.status(500).json({
        message: "Une erreur s'est produite lors de la création de l'administrateur",
        error: err.message
      });
    } else {
      res.status(201).json(data);
    }
  });
};

// Mettre à jour un admin
exports.updateAdmin = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  Admin.update(
    req.params.id,
    {
      UserID: req.body.UserID,
      Role: req.body.Role,
      Permissions: req.body.Permissions
    },
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).json({ message: `Administrateur avec l'ID ${req.params.id} non trouvé` });
        } else {
          res.status(500).json({ message: "Erreur lors de la mise à jour de l'administrateur", error: err.message });
        }
      } else {
        res.json(data);
      }
    }
  );
};

// Supprimer un admin
exports.deleteAdmin = (req, res) => {
  Admin.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Administrateur avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Impossible de supprimer l'administrateur", error: err.message });
      }
    } else {
      res.json({ message: "Administrateur supprimé avec succès!" });
    }
  });
};