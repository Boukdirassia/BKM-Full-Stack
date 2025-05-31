const db = require('../config/db');

const Lieu = {
  // Insérer des données de test dans la table reservation
  insertTestData: (callback) => {
    // D'abord, vérifions si les colonnes sont des ENUMs et récupérons les valeurs possibles
    const queryEnum = `
      SHOW COLUMNS FROM reservation WHERE Field IN ('LieuDepart', 'LieuArrivee')
    `;
    
    db.query(queryEnum, (err, columns) => {
      if (err) {
        callback(err, null);
        return;
      }
      
      console.log('Colonnes LieuDepart et LieuArrivee:', columns);
      
      // Si les colonnes sont des ENUMs, extrayons les valeurs possibles
      let lieuxDepart = [];
      let lieuxArrivee = [];
      
      columns.forEach(column => {
        if (column.Field === 'LieuDepart' && column.Type.startsWith('enum')) {
          // Extraire les valeurs de l'ENUM (format: enum('val1','val2',...)))
          const enumValues = column.Type.match(/enum\((.*)\)/)[1].split(',').map(val => 
            val.replace(/^'|'$/g, '') // Supprimer les guillemets simples
          );
          lieuxDepart = enumValues;
          console.log('Valeurs possibles pour LieuDepart:', lieuxDepart);
        }
        else if (column.Field === 'LieuArrivee' && column.Type.startsWith('enum')) {
          // Extraire les valeurs de l'ENUM
          const enumValues = column.Type.match(/enum\((.*)\)/)[1].split(',').map(val => 
            val.replace(/^'|'$/g, '') // Supprimer les guillemets simples
          );
          lieuxArrivee = enumValues;
          console.log('Valeurs possibles pour LieuArrivee:', lieuxArrivee);
        }
      });
      
      // Si les colonnes ne sont pas des ENUMs ou si nous n'avons pas pu extraire les valeurs,
      // utilisons des valeurs par défaut
      if (lieuxDepart.length === 0) {
        lieuxDepart = [
          'Casablanca Aéroport',
          'Casablanca Centre',
          'Rabat',
          'Marrakech',
          'Agadir',
          'Tanger',
          'Fès',
          'Meknès',
          'Oujda',
          'Essaouira'
        ];
      }
      
      if (lieuxArrivee.length === 0) {
        lieuxArrivee = lieuxDepart; // Mêmes valeurs que pour LieuDepart
      }
      
      // Maintenant, insérons des données de test dans la table reservation
      // Nous allons insérer une réservation pour chaque combinaison de lieux
      const insertPromises = [];
      
      lieuxDepart.forEach((lieuDepart, i) => {
        lieuxArrivee.forEach((lieuArrivee, j) => {
          // Ne pas insérer si le lieu de départ est le même que le lieu d'arrivée
          if (lieuDepart !== lieuArrivee) {
            const query = `
              INSERT INTO reservation (VoitureID, ClientID, DateDébut, DateFin, Statut, LieuDepart, LieuArrivee)
              VALUES (1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'Confirmée', ?, ?)
            `;
            
            insertPromises.push(
              new Promise((resolve, reject) => {
                db.query(query, [lieuDepart, lieuArrivee], (err, result) => {
                  if (err) {
                    console.error(`Erreur lors de l'insertion de la réservation ${lieuDepart} -> ${lieuArrivee}:`, err);
                    reject(err);
                  } else {
                    console.log(`Réservation insérée: ${lieuDepart} -> ${lieuArrivee}`);
                    resolve(result);
                  }
                });
              })
            );
          }
        });
      });
      
      // Exécuter toutes les insertions en parallèle
      Promise.all(insertPromises.map(p => p.catch(e => e)))
        .then(results => {
          const successCount = results.filter(r => !(r instanceof Error)).length;
          console.log(`${successCount} réservations insérées avec succès`);
          callback(null, { success: true, count: successCount });
        })
        .catch(err => {
          console.error('Erreur lors de l\'insertion des réservations:', err);
          callback(err, null);
        });
    });
  },
  
  // Récupérer la structure des colonnes LieuDepart et LieuArrivee
  getColumnInfo: (callback) => {
    const query = `
      SHOW COLUMNS FROM reservation WHERE Field IN ('LieuDepart', 'LieuArrivee')
    `;
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      console.log('Structure des colonnes LieuDepart et LieuArrivee:', results);
      callback(null, results);
    });
  },
  
  // Récupérer tous les lieux de départ uniques
  getAllLieuxDepart: (callback) => {
    const query = `
      SELECT DISTINCT LieuDepart 
      FROM reservation 
      WHERE LieuDepart IS NOT NULL AND LieuDepart != ''
      ORDER BY LieuDepart
    `;
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      // Transformer les résultats en tableau de valeurs
      const lieux = results.map(item => item.LieuDepart);
      console.log(`Lieux de départ trouvés dans la base de données: ${lieux.length}`, lieux);
      callback(null, lieux);
    });
  },

  // Récupérer tous les lieux d'arrivée uniques
  getAllLieuxArrivee: (callback) => {
    const query = `
      SELECT DISTINCT LieuArrivee 
      FROM reservation 
      WHERE LieuArrivee IS NOT NULL AND LieuArrivee != ''
      ORDER BY LieuArrivee
    `;
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      // Transformer les résultats en tableau de valeurs
      const lieux = results.map(item => item.LieuArrivee);
      console.log(`Lieux d'arrivée trouvés dans la base de données: ${lieux.length}`, lieux);
      callback(null, lieux);
    });
  },

  // Récupérer tous les lieux uniques (départ et arrivée combinés)
  getAllLieux: (callback) => {
    const query = `
      SELECT DISTINCT LieuDepart as lieu FROM reservation WHERE LieuDepart IS NOT NULL AND LieuDepart != ''
      UNION
      SELECT DISTINCT LieuArrivee as lieu FROM reservation WHERE LieuArrivee IS NOT NULL AND LieuArrivee != ''
      ORDER BY lieu
    `;
    db.query(query, (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      // Transformer les résultats en tableau de valeurs
      const lieux = results.map(item => item.lieu);
      console.log(`Tous les lieux trouvés dans la base de données: ${lieux.length}`, lieux);
      callback(null, lieux);
    });
  }
};

module.exports = Lieu;
