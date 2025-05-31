const Voiture = require('../models/voiture.model');

// Récupérer toutes les voitures
exports.getAllVoitures = (req, res) => {
  Voiture.getAll((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des voitures", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer une voiture par son ID
exports.getVoitureById = (req, res) => {
  Voiture.getById(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Voiture avec l'ID ${req.params.id} non trouvée` });
      } else {
        res.status(500).json({ message: "Erreur lors de la récupération de la voiture", error: err.message });
      }
    } else {
      res.json(data);
    }
  });
};

// Créer une nouvelle voiture
exports.createVoiture = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }

  // Vérifier les champs obligatoires
  const requiredFields = ['Marque', 'Modele', 'Annee', 'Immatriculation', 'Categorie', 'Prix'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {

    res.status(400).json({ 
      message: "Champs obligatoires manquants", 
      missingFields: missingFields 
    });
    return;
  }

  // Générer un nom de photo unique
  Voiture.getNextId((err, result) => {
    if (err) {

      res.status(500).json({ message: "Erreur lors de la génération de l'ID", error: err.message });
      return;
    }

    const nextId = result ? result.nextId : 1;

    const photoName = `voiture-${nextId}`;

    // Créer une voiture avec les mêmes champs que dans updateVoiture
    // Nettoyer les données pour éviter les problèmes d'encodage
    const voiture = {
      Marque: typeof req.body.Marque === 'string' ? req.body.Marque.trim() : null,
      Modele: typeof req.body.Modele === 'string' ? req.body.Modele.trim() : null,
      // Tenter de convertir Année en nombre si c'est une année valide, sinon garder la valeur originale
      Annee: (() => {
        // Si c'est déjà un nombre
        if (typeof req.body.Annee === 'number') return req.body.Annee;
        
        // Si c'est une chaîne, essayer de la convertir en nombre
        if (typeof req.body.Annee === 'string') {
          // Vérifier si c'est un nombre entier (4 chiffres typiquement pour une année)
          const parsedInt = parseInt(req.body.Annee, 10);
          if (!isNaN(parsedInt) && parsedInt.toString().length === req.body.Annee.trim().length) {
            return parsedInt; // C'est bien un nombre entier
          }
          // Si ce n'est pas un nombre valide, retourner la valeur par défaut
          return 0;
        }
        
        return 0; // Valeur par défaut
      })(),
      Immatriculation: typeof req.body.Immatriculation === 'string' ? req.body.Immatriculation.trim() : null,
      Categorie: typeof req.body.Categorie === 'string' ? req.body.Categorie.trim() : null,
      Type: typeof req.body.Type === 'string' ? req.body.Type.trim() : '',
      Prix: parseFloat(req.body.Prix) || 0,
      // Convertir explicitement en nombre 0 ou 1 pour MySQL
      Disponibilite: (() => {
        // Si la valeur est déjà un nombre (0 ou 1), l'utiliser telle quelle
        if (req.body.Disponibilite === 0 || req.body.Disponibilite === 1) {
          return req.body.Disponibilite;
        }
        
        // Convertir explicitement en 0 ou 1 pour la base de données
        const disponibiliteNumber = parseInt(req.body.Disponibilite);
        if (disponibiliteNumber === 0) return 0;
        if (disponibiliteNumber === 1) return 1;
        
        // Si c'est un booléen
        if (req.body.Disponibilite === false) return 0;
        if (req.body.Disponibilite === true) return 1;
        
        // Valeur par défaut
        return 1;
      })(),
      Photo: photoName,
      // Ajouter les nouveaux champs
      Places: (() => {
        // Si c'est déjà un nombre
        if (typeof req.body.Places === 'number') return req.body.Places;
        
        // Si c'est une chaîne, essayer de la convertir en nombre
        if (typeof req.body.Places === 'string' && req.body.Places.trim() !== '') {
          const parsedInt = parseInt(req.body.Places, 10);
          if (!isNaN(parsedInt)) return parsedInt;
        }
        
        return null; // Valeur par défaut si non spécifié
      })(),
      Portes: (() => {
        // Si c'est déjà un nombre
        if (typeof req.body.Portes === 'number') return req.body.Portes;
        
        // Si c'est une chaîne, essayer de la convertir en nombre
        if (typeof req.body.Portes === 'string' && req.body.Portes.trim() !== '') {
          const parsedInt = parseInt(req.body.Portes, 10);
          if (!isNaN(parsedInt)) return parsedInt;
        }
        
        return null; // Valeur par défaut si non spécifié
      })(),
      Transmission: typeof req.body.Transmission === 'string' ? req.body.Transmission.trim() : null
    };



    // Enregistrer la voiture dans la base de données
    Voiture.create(voiture, (err, data) => {
      if (err) {

        res.status(500).json({ message: "Erreur lors de la création de la voiture", error: err.message });
      } else {
        res.json({ ...data, message: "Voiture créée avec succès!" });
      }
    });
  });

};

// Mettre à jour une voiture
exports.updateVoiture = (req, res) => {
  // Valider la requête
  if (!req.body) {
    res.status(400).json({ message: "Le contenu ne peut pas être vide!" });
    return;
  }



  // Si la photo a été modifiée, générer un nouveau nom au format "voiture-{id}"
  const photoName = req.body.Photo && !req.body.Photo.startsWith('voiture-') 
    ? `voiture-${req.params.id}` 
    : req.body.Photo;

  // Préparer les données pour la mise à jour
  const voiture = {
    Marque: req.body.Marque,
    Modele: req.body.Modele,
    Annee: req.body.Annee,
    Immatriculation: req.body.Immatriculation,
    Categorie: req.body.Categorie,
    Type: req.body.Type || '',
    Prix: parseFloat(req.body.Prix) || 0,
    Disponibilite: req.body.Disponibilite !== undefined ? req.body.Disponibilite : true,
    Photo: photoName,
    // Ajouter les nouveaux champs
    Places: (() => {
      // Si c'est déjà un nombre
      if (typeof req.body.Places === 'number') return req.body.Places;
      
      // Si c'est une chaîne, essayer de la convertir en nombre
      if (typeof req.body.Places === 'string' && req.body.Places.trim() !== '') {
        const parsedInt = parseInt(req.body.Places, 10);
        if (!isNaN(parsedInt)) return parsedInt;
      }
      
      return null; // Valeur par défaut si non spécifié
    })(),
    Portes: (() => {
      // Si c'est déjà un nombre
      if (typeof req.body.Portes === 'number') return req.body.Portes;
      
      // Si c'est une chaîne, essayer de la convertir en nombre
      if (typeof req.body.Portes === 'string' && req.body.Portes.trim() !== '') {
        const parsedInt = parseInt(req.body.Portes, 10);
        if (!isNaN(parsedInt)) return parsedInt;
      }
      
      return null; // Valeur par défaut si non spécifié
    })(),
    Transmission: typeof req.body.Transmission === 'string' ? req.body.Transmission.trim() : null
  };



  Voiture.update(
    req.params.id,
    voiture,
    (err, data) => {
      if (err) {

        if (err.kind === "not_found") {
          res.status(404).json({ message: `Voiture avec l'ID ${req.params.id} non trouvée` });
        } else {
          res.status(500).json({ message: "Erreur lors de la mise à jour de la voiture", error: err.message });
        }
      } else {
        // Logs de débogage supprimés
        res.json({ message: "Voiture mise à jour avec succès!", id: req.params.id });
      }
    }
  );
};

// Supprimer une voiture
exports.deleteVoiture = (req, res) => {
  Voiture.delete(req.params.id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).json({ message: `Voiture avec l'ID ${req.params.id} non trouvée` });
      } else {
        res.status(500).json({ message: "Impossible de supprimer la voiture", error: err.message });
      }
    } else {
      res.json({ message: "Voiture supprimée avec succès!" });
    }
  });
};

// Récupérer les voitures disponibles
exports.getAvailableVoitures = (req, res) => {
  Voiture.getAvailable((err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des voitures disponibles", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Récupérer les voitures par catégorie
exports.getVoituresByCategorie = (req, res) => {
  Voiture.getByCategorie(req.params.categorie, (err, data) => {
    if (err) {
      res.status(500).json({ message: "Erreur lors de la récupération des voitures par catégorie", error: err.message });
    } else {
      res.json(data);
    }
  });
};

// Télécharger une photo pour une voiture
exports.uploadPhoto = (req, res) => {
  const id = req.params.id;
  
  if (!req.file) {
    // Message d'erreur géré par la réponse API
    return res.status(400).json({ message: "Aucun fichier n'a été téléchargé" });
  }

  // Logs de débogage supprimés

  // Extraire l'extension de fichier
  const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
  const photoName = `voiture-${id}`;
  const fullPhotoName = `${photoName}.${fileExtension}`;
  
  // Logs de débogage supprimés
  // Logs de débogage supprimés
  // Logs de débogage supprimés
  
  // Mise à jour de la base de données avec le nom de la photo
  Voiture.update(
    id,
    { Photo: photoName },
    (err, data) => {
      if (err) {
        // Erreur gérée par la réponse API
        if (err.kind === "not_found") {
          res.status(404).json({ message: `Voiture avec l'ID ${id} non trouvée` });
        } else {
          res.status(500).json({ message: "Erreur lors de la mise à jour de la photo", error: err.message });
        }
      } else {
        // Logs de débogage supprimés
        res.json({
          message: "Photo téléchargée avec succès",
          photoUrl: `/uploads/vehicules/${fullPhotoName}`,
          id: id
        });
      }
    }
  );
};

// Cette fonction de diagnostic a été supprimée car elle n'est pas nécessaire en production

// Vérifier la disponibilité des véhicules pour des dates spécifiques
exports.checkVoituresAvailability = (req, res) => {
  // Vérifier que les dates sont fournies
  if (!req.query.dateDebut || !req.query.dateFin) {
    return res.status(400).json({ 
      message: "Les dates de début et de fin sont requises"
    });
  }

  const dateDebut = req.query.dateDebut;
  const dateFin = req.query.dateFin;

  // Récupérer toutes les voitures disponibles
  Voiture.getAvailable((err, voitures) => {
    if (err) {
      return res.status(500).json({ 
        message: "Erreur lors de la récupération des véhicules", 
        error: err.message 
      });
    }

    // Si aucune voiture n'est disponible, retourner une erreur
    if (voitures.length === 0) {
      return res.status(404).json({ 
        message: "Aucun véhicule disponible pour les dates sélectionnées"
      });
    }

    // Utiliser Promise.all pour vérifier la disponibilité de chaque voiture
    const Reservation = require('../models/reservation.model');
    const checkPromises = voitures.map(voiture => {
      return new Promise((resolve, reject) => {
        Reservation.checkAvailability(voiture.VoitureID, dateDebut, dateFin, (err, result) => {
          if (err) {
            reject(err);
          } else {
            // Si count = 0, la voiture est disponible pour ces dates
            const isAvailable = result[0].count === 0;
            resolve({
              ...voiture,
              isAvailableForDates: isAvailable
            });
          }
        });
      });
    });

    Promise.all(checkPromises)
      .then(voituresWithAvailability => {
        // Filtrer les voitures disponibles pour les dates sélectionnées
        const availableVoitures = voituresWithAvailability.filter(v => v.isAvailableForDates);
        
        if (availableVoitures.length === 0) {
          return res.status(404).json({ 
            message: "Aucun véhicule disponible pour les dates sélectionnées"
          });
        }
        
        res.json(availableVoitures);
      })
      .catch(error => {
        res.status(500).json({ 
          message: "Erreur lors de la vérification de la disponibilité", 
          error: error.message 
        });
      });
  });
};
