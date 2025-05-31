const db = require('./config/db');

// Afficher toutes les tables de la base de données
db.query("SHOW TABLES", (err, tables) => {
  if (err) {
    console.error('Erreur lors de la récupération des tables:', err);
    return;
  }
  
  console.log('Tables disponibles dans la base de données:');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log(tableNames);
  
  // Pour chaque table, afficher sa structure
  tableNames.forEach(tableName => {
    db.query(`DESCRIBE ${tableName}`, (err, columns) => {
      if (err) {
        console.error(`Erreur lors de la description de la table ${tableName}:`, err);
        return;
      }
      
      console.log(`\nStructure de la table ${tableName}:`);
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type}`);
      });
      
      // Afficher quelques échantillons de données
      db.query(`SELECT * FROM ${tableName} LIMIT 2`, (err, data) => {
        if (err) {
          console.error(`Erreur lors de la récupération des données de ${tableName}:`, err);
          return;
        }
        
        if (data && data.length > 0) {
          console.log(`\nExemple de données dans ${tableName}:`);
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.log(`Aucune donnée trouvée dans ${tableName}`);
        }
      });
    });
  });
});
