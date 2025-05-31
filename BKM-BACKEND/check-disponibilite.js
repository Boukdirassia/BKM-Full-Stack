const mysql = require('mysql2');
const util = require('util');

// Configuration de la connexion avec les mêmes paramètres que l'application
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,  // Port spécifique utilisé dans votre configuration
  user: 'root',
  password: '',
  database: 'locationvoitures',
  charset: 'utf8mb4' // Support complet des caractères Unicode
});

// Pour s'assurer que les caractères accentués sont correctement gérés
db.query("SET NAMES utf8mb4;", (err) => {
  if (err) {
    console.error('Erreur lors de la configuration de l\'encodage:', err);
  }
});

// Vérification de la connexion
db.connect(err => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connexion à la base de données réussie');
  
  // Requête pour voir le schéma de la table
  db.query("DESCRIBE voiture", (err, describeResults) => {
    if (err) {
      console.error('Erreur lors de la récupération du schéma de la table:', err);
    } else {
      console.log('\n===== STRUCTURE DE LA TABLE VOITURE =====');
      console.table(describeResults);
      
      // Requête pour voir toutes les voitures
      db.query("SELECT VoitureID, Marque, `Modèle`, `Disponibilité` FROM voiture", (err, results) => {
        if (err) {
          console.error('Erreur lors de la récupération des données:', err);
        } else {
          console.log('\n===== DONNÉES DES VOITURES (FOCUS SUR DISPONIBILITÉ) =====');
          results.forEach(row => {
            console.log(`ID: ${row.VoitureID}, Marque: ${row.Marque}, Modèle: ${row['Modèle']}, Disponibilité: ${row['Disponibilité']} (type: ${typeof row['Disponibilité']})`);
          });
          
          // Vérifier comment MySQL interprète différentes représentations de booléens
          console.log('\n===== TEST D\'INTERPRÉTATION DES BOOLÉENS DANS MYSQL =====');
          const testQuery = `
            SELECT 
              1 = 1 as 'un_egal_un',
              1 = 0 as 'un_egal_zero',
              true = 1 as 'vrai_egal_un',
              true = 0 as 'vrai_egal_zero',
              false = 0 as 'faux_egal_zero',
              false = 1 as 'faux_egal_un'
          `;
          
          db.query(testQuery, (err, results) => {
            if (err) {
              console.error('Erreur lors du test des booléens:', err);
            } else {
              console.table(results[0]);
              db.end();
            }
          });
        }
      });
    }
  });
});
