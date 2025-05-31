const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

// Récupérer toutes les réservations
router.get('/', reservationController.getAllReservations);

// Récupérer une réservation par son ID
router.get('/:id', reservationController.getReservationById);

// Récupérer les réservations d'un client
router.get('/client/:clientId', reservationController.getReservationsByClientId);

// Récupérer les réservations d'un véhicule
router.get('/voiture/:voitureId', reservationController.getReservationsByVoitureId);

// Créer une nouvelle réservation
router.post('/', reservationController.createReservation);

// Mettre à jour une réservation
router.put('/:id', reservationController.updateReservation);

// Supprimer une réservation
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;