const db = require('../config/db');

const Voiture = {
  getAll: (callback) => {

    
    // Renommer explicitement les champs avec accents en champs sans accents
    const query = `
      SELECT 
        VoitureID,
        Marque,
        \`Modèle\` as Modele, -- Renommé sans accent
        Annee,
        Immatriculation,
        Categorie,
        Type,
        Prix,
        \`Disponibilité\` as Disponibilite, -- Renommé sans accent
        Photo,
        Places,
        Portes,
        Transmission
      FROM voiture
      ORDER BY VoitureID DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des voitures:", err.message);
        callback(err, null);
        return;
      }
      

      
      callback(null, results);
    });
  },
  
  getById: (id, callback) => {

    
    // Renommer explicitement les champs avec accents en champs sans accents
    const query = `
      SELECT 
        VoitureID,
        Marque,
        \`Modèle\` as Modele, -- Renommé sans accent
        Annee,
        Immatriculation,
        Categorie,
        Type,
        Prix,
        \`Disponibilité\` as Disponibilite, -- Renommé sans accent
        Photo,
        Places,
        Portes,
        Transmission
      FROM voiture
      WHERE VoitureID = ?
    `;
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error(`Erreur lors de la récupération de la voiture ${id}:`, err.message);
        callback(err, null);
        return;
      }
      
      if (results.length === 0) {
        const notFoundError = new Error(`Voiture avec l'ID ${id} non trouvée`);
        notFoundError.kind = "not_found";
        callback(notFoundError, null);
        return;
      }
      

      callback(null, results[0]);
    });
  },
  
  getNextId: (callback) => {
    db.query('SELECT MAX(VoitureID) + 1 as nextId FROM voiture', (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, results[0]);
    });
  },
  
  create: (voitureData, callback) => {
    // Conversion en JSON et parse pour s'assurer que les données sont exactes
    const cleanData = JSON.parse(JSON.stringify(voitureData));
    
    // Préparation des paramètres pour la requête SQL
    const params = [
      cleanData.Marque,
      cleanData.Modele, // Correspond à la colonne `Modèle` avec accent
      cleanData.Annee,
      cleanData.Immatriculation,
      cleanData.Categorie,
      cleanData.Type || '',
      parseFloat(cleanData.Prix) || 0,
      // APPROCHE SIMPLIFIÉE: On s'attend à recevoir directement 0 ou 1 du contrôleur
      // Convertir explicitement en nombre 0 ou 1 pour MySQL
      parseInt(cleanData.Disponibilite) === 0 ? 0 : 1,
      cleanData.Photo,
      cleanData.Places || null,
      cleanData.Portes || null,
      cleanData.Transmission || null
    ];
    
    // Utilisation de SET pour éviter les problèmes d'accents dans les noms de colonnes
    const query = `
      INSERT INTO voiture SET 
        Marque = ?,
        \`Modèle\` = ?,
        Annee = ?,
        Immatriculation = ?,
        Categorie = ?,
        Type = ?,
        Prix = ?,
        \`Disponibilité\` = ?,
        Photo = ?,
        Places = ?,
        Portes = ?,
        Transmission = ?
    `;
    

    
    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Erreur SQL lors de la création:", err.message);
        callback(err, null);
        return;
      }

      callback(null, { id: result.insertId, ...cleanData });
    });
    

  },
  
  update: (id, voitureData, callback) => {
    // Vérifier d'abord si c'est une mise à jour partielle
    const isPartialUpdate = Object.keys(voitureData).length < 9; // Moins que tous les champs
    
    if (isPartialUpdate) {
      // Pour une mise à jour partielle, nous allons d'abord récupérer les données existantes
      
      // Utiliser directement la requête SQL pour éviter la référence circulaire
      const getByIdQuery = `
        SELECT 
          VoitureID,
          Marque,
          \`Modèle\` as Modele,
          Annee,
          Immatriculation,
          Categorie,
          Type,
          Prix,
          \`Disponibilité\` as Disponibilite,
          Photo
        FROM voiture
        WHERE VoitureID = ?
      `;
      
      db.query(getByIdQuery, [id], (err, results) => {
        if (err) {
          console.error(`Erreur lors de la récupération des données existantes du véhicule ${id}:`, err.message);
          callback(err, null);
          return;
        }
        
        if (results.length === 0) {
          const notFoundError = new Error(`Voiture avec l'ID ${id} non trouvée`);
          notFoundError.kind = "not_found";
          callback(notFoundError, null);
          return;
        }
        
        const existingVoiture = results[0];
        // Fusion des données existantes avec les nouvelles données
        const updatedData = { ...existingVoiture, ...voitureData };
        
        // Exécuter la mise à jour avec les données fusionnées
        performUpdate(updatedData);
      });
    } else {
      // Pour une mise à jour complète, utiliser directement les données fournies
      performUpdate(voitureData);
    }
    
    // Fonction interne pour exécuter la mise à jour
    function performUpdate(dataToUpdate) {
      // Conversion en JSON et parse pour s'assurer que les données sont exactes
      const cleanData = JSON.parse(JSON.stringify(dataToUpdate));
      
      // Préparation des champs et valeurs pour la requête SQL
      let setClause = [];
      let params = [];
      
      // Définir les correspondances entre les noms de champs JavaScript et les noms de colonnes SQL
      const fieldMappings = {
        Marque: 'Marque',
        Modele: '`Modèle`',
        Annee: 'Annee',
        Immatriculation: 'Immatriculation',
        Categorie: 'Categorie',
        Type: 'Type',
        Prix: 'Prix',
        Disponibilite: '`Disponibilité`',
        Photo: 'Photo',
        Places: 'Places',
        Portes: 'Portes',
        Transmission: 'Transmission'
      };
      
      // Ajouter uniquement les champs qui sont présents dans cleanData
      for (const jsField in fieldMappings) {
        if (cleanData[jsField] !== undefined) {
          const sqlField = fieldMappings[jsField];
          setClause.push(`${sqlField} = ?`);
          
          // Traitement spécial pour certains champs
          if (jsField === 'Prix') {
            params.push(parseFloat(cleanData[jsField]) || 0);
          } else if (jsField === 'Disponibilite') {
            // Traiter la disponibilité comme un nombre explicite 0 ou 1
            
            // Convertir explicitement en 0 ou 1
            const dispo = parseInt(cleanData[jsField]);
            const disponibiliteValue = dispo === 0 ? 0 : 1;

            params.push(disponibiliteValue);
          } else {
            params.push(cleanData[jsField]);
          }
        }
      }
      
      // Ajouter l'ID à la fin des paramètres pour la clause WHERE
      params.push(id);
      
      // Construction de la requête SQL
      const query = `
        UPDATE voiture 
        SET ${setClause.join(', ')}
        WHERE VoitureID = ?
      `;
      

      
      db.query(query, params, (err, result) => {
        if (err) {
          console.error(`Erreur SQL lors de la mise à jour du véhicule ${id}:`, err.message);
          callback(err, null);
          return;
        }

        callback(null, { id: id, ...cleanData });
      });
    }
    

  },
  
  delete: (id, callback) => {
    db.query('DELETE FROM voiture WHERE VoitureID = ?', [id], callback);
  },

  getAvailable: (callback) => {

    
    // Utiliser le même format que getAll pour assurer la cohérence
    const query = `
      SELECT 
        VoitureID,
        Marque,
        \`Modèle\` as Modele,
        Annee,
        Immatriculation,
        Categorie,
        Type,
        Prix,
        \`Disponibilité\` as Disponibilite,
        Photo,
        Places,
        Portes,
        Transmission
      FROM voiture
      WHERE \`Disponibilité\` = 1
      ORDER BY VoitureID DESC
    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des voitures disponibles:", err.message);
        callback(err, null);
        return;
      }
      

      callback(null, results);
    });
  },

  getByCategorie: (categorie, callback) => {

    
    // Utiliser le même format que getAll pour assurer la cohérence
    const query = `
      SELECT 
        VoitureID,
        Marque,
        \`Modèle\` as Modele,
        Annee,
        Immatriculation,
        Categorie,
        Type,
        Prix,
        \`Disponibilité\` as Disponibilite,
        Photo,
        Places,
        Portes,
        Transmission
      FROM voiture
      WHERE Categorie = ?
      ORDER BY VoitureID DESC
    `;
    
    db.query(query, [categorie], (err, results) => {
      if (err) {
        console.error(`Erreur lors de la récupération des voitures de catégorie ${categorie}:`, err.message);
        callback(err, null);
        return;
      }
      

      callback(null, results);
    });
  }
};

module.exports = Voiture;
