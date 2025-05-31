const Extra = require('../models/extra.model');

// Récupérer tous les extras
exports.getAllExtras = (req, res) => {
  Extra.getAll((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des extras", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer un extra par son ID
exports.getExtraById = (req, res) => {
  Extra.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Extra avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération de l'extra", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Créer un nouvel extra
exports.createExtra = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Créer un extra
  const extra = {
    Nom: req.body.Nom,
    Prix: req.body.Prix,
    Description: req.body.Description
  };

  // Enregistrer l'extra dans la base de données
  Extra.create(extra, (err, data) => {
    if (err) {
      res.status(500).json({
        message: "Une erreur s'est produite lors de la création de l'extra",
        error: err.message
      });
    } else {
      res.status(201).json(data);
    }
  });
};

// Mettre à jour un extra
exports.updateExtra = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  Extra.update(
    req.params.id,
    {
      Nom: req.body.Nom,
      Prix: req.body.Prix,
      Description: req.body.Description
    },
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).json({ message: `Extra avec l'ID ${req.params.id} non trouvé` });
        } else {
          res.status(500).json({ message: "Erreur lors de la mise à jour de l'extra", error: err.message });
        }
      } else {
        res.json(data);
      }
    }
  );
};

// Supprimer un extra
exports.deleteExtra = (req, res) => {
  Extra.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Extra avec l'ID ${req.params.id} non trouvé` });
      } else {
        res.status(500).json({ message: "Impossible de supprimer l'extra", error: err.message });
      }
    } else {
      res.json({ message: "Extra supprimé avec succès!" });
    }
  });
};