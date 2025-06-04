const mysql = require('mysql2');

// Configuration de la connexion avec gestion explicite de l'encodage UTF-8
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'locationvoitures',
  charset: 'utf8mb4' // Support complet des caractères Unicode, incluant les emojis
  // Note: L'option 'collation' n'est pas supportée par mysql2, nous utilisons SET NAMES ci-dessous à la place
});

// Pour s'assurer que les caractères accentués sont correctement gérés
connection.query("SET NAMES utf8mb4;", (err) => {
  if (err) {
    console.error('Erreur lors de la configuration de l\'encodage:', err);
  } else {
    console.log('Encodage UTF-8 configuré avec succès');
  }
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connecté à la base de données MySQL ✅');
  
  // Afficher les informations sur la connexion pour le débogage
  connection.query('SELECT @@character_set_database, @@collation_database, @@character_set_connection, @@character_set_results', (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification des paramètres d\'encodage:', err);
    } else {
      console.log('Configuration d\'encodage de la base de données:', results[0]);
    }
  });
});

module.exports = connection;
