const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');

// Récupérer tous les clients
router.get('/', clientController.getAllClients);

// Récupérer les informations complètes d'un client (données client + utilisateur)
router.get('/info/:id', clientController.getClientInfo);

// Récupérer un client par son ID
router.get('/:id', clientController.getClientById);

// Créer un nouveau client
router.post('/', clientController.createClient);

// Mettre à jour un client
router.put('/:id', clientController.updateClient);

// Supprimer un client
router.delete('/:id', clientController.deleteClient);

module.exports = router;