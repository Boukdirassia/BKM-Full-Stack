const express = require('express');
const app = express();
const path = require('path');
const utilisateurRoutes = require('./routes/utilisateur.routes');
const voitureRoutes = require('./routes/voiture.routes');
const clientRoutes = require('./routes/client.routes');
const extraRoutes = require('./routes/extra.routes');
const reservationRoutes = require('./routes/reservation.routes');
const adminRoutes = require('./routes/admin.routes');
const combinedRoutes = require('./routes/combined.routes');
const lieuRoutes = require('./routes/lieu.routes');


// Middleware pour parser les requêtes JSON
app.use(express.json());

// Middleware pour parser les données de formulaire
app.use(express.urlencoded({ extended: true }));



// Servir les fichiers statiques du dossier uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pour gérer les CORS (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.use('/utilisateurs', utilisateurRoutes);
app.use('/voitures', voitureRoutes);
app.use('/clients', clientRoutes);
app.use('/extras', extraRoutes);
app.use('/reservations', reservationRoutes);
app.use('/admins', adminRoutes);
app.use('/combined', combinedRoutes);
app.use('/lieux', lieuRoutes);

// Route de base pour vérifier que l'API fonctionne
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de location de voitures BKM' });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(4000, () => {
  console.log('Serveur Express en écoute sur le port 4000 🚀');
});
