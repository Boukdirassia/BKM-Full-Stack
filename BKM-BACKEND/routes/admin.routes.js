const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Récupérer tous les admins
router.get('/', adminController.getAllAdmins);

// Récupérer un admin par son ID
router.get('/:id', adminController.getAdminById);

// Récupérer un admin par son UserID
router.get('/user/:userId', adminController.getAdminByUserId);

// Créer un nouvel admin
router.post('/', adminController.createAdmin);

// Mettre à jour un admin
router.put('/:id', adminController.updateAdmin);

// Supprimer un admin
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;