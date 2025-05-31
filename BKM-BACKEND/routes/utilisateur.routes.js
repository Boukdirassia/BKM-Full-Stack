const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');

// Authentification - Placer cette route en premier pour éviter les conflits
router.post('/login', utilisateurController.login);

// Récupérer tous les utilisateurs
router.get('/', utilisateurController.getAllUtilisateurs);

// Créer un nouvel utilisateur
router.post('/', utilisateurController.createUtilisateur);

// Récupérer un utilisateur par son ID
router.get('/:id', utilisateurController.getUtilisateurById);

// Mettre à jour un utilisateur
router.put('/:id', utilisateurController.updateUtilisateur);

// Supprimer un utilisateur
router.delete('/:id', utilisateurController.deleteUtilisateur);

module.exports = router;
