const express = require('express');
const router = express.Router();
const lieuController = require('../controllers/lieu.controller');

// Récupérer tous les lieux de départ
router.get('/depart', lieuController.getAllLieuxDepart);

// Récupérer tous les lieux d'arrivée
router.get('/arrivee', lieuController.getAllLieuxArrivee);

// Récupérer tous les lieux (départ et arrivée combinés)
router.get('/', lieuController.getAllLieux);

// Récupérer la structure des colonnes LieuDepart et LieuArrivee
router.get('/column-info', lieuController.getColumnInfo);

// Insérer des données de test dans la table reservation
router.post('/test-data', lieuController.insertTestData);

module.exports = router;
