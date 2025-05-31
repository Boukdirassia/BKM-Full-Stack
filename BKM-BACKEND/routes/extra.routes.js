const express = require('express');
const router = express.Router();
const extraController = require('../controllers/extra.controller');

// Récupérer tous les extras
router.get('/', extraController.getAllExtras);

// Récupérer un extra par son ID
router.get('/:id', extraController.getExtraById);

// Créer un nouvel extra
router.post('/', extraController.createExtra);

// Mettre à jour un extra
router.put('/:id', extraController.updateExtra);

// Supprimer un extra
router.delete('/:id', extraController.deleteExtra);

module.exports = router;