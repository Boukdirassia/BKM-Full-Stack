const express = require('express');
const router = express.Router();
const combinedController = require('../controllers/combined.controller');

// Route pour créer un client et une réservation en même temps (mode combiné)
router.post('/client-reservation', combinedController.createClientAndReservation);

module.exports = router;
