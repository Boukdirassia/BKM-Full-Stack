const express = require('express');
const router = express.Router();
const voitureController = require('../controllers/voiture.controller');
const upload = require('../middleware/upload');

// Récupérer toutes les voitures
router.get('/', voitureController.getAllVoitures);

// Récupérer les voitures disponibles
router.get('/disponibles', voitureController.getAvailableVoitures);

// Vérifier la disponibilité des véhicules pour des dates spécifiques
router.get('/disponibilite', voitureController.checkVoituresAvailability);

// Récupérer les voitures par catégorie
router.get('/categorie/:categorie', voitureController.getVoituresByCategorie);

// La route de diagnostic a été supprimée car la fonction diagnosticData n'est plus nécessaire en production

// Télécharger une photo pour une voiture
router.post('/:id/upload-photo', upload.single('photo'), voitureController.uploadPhoto);

// Récupérer une voiture par son ID
router.get('/:id', voitureController.getVoitureById);

// Créer une nouvelle voiture
router.post('/', voitureController.createVoiture);

// Mettre à jour une voiture
router.put('/:id', voitureController.updateVoiture);

// Supprimer une voiture
router.delete('/:id', voitureController.deleteVoiture);

module.exports = router;
