-- Script pour ajouter les colonnes LieuDepart et LieuArrivee à la table reservation existante

-- Vérifier si les colonnes existent déjà
SET @columnExistsLieuDepart = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'locationvoitures'
  AND TABLE_NAME = 'reservation'
  AND COLUMN_NAME = 'LieuDepart'
);

SET @columnExistsLieuArrivee = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'locationvoitures'
  AND TABLE_NAME = 'reservation'
  AND COLUMN_NAME = 'LieuArrivee'
);

-- Ajouter la colonne LieuDepart si elle n'existe pas
SET @query1 = IF(@columnExistsLieuDepart = 0, 
  'ALTER TABLE reservation ADD COLUMN LieuDepart VARCHAR(100) NOT NULL DEFAULT "Agence"', 
  'SELECT "La colonne LieuDepart existe déjà"');
PREPARE stmt1 FROM @query1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- Ajouter la colonne LieuArrivee si elle n'existe pas
SET @query2 = IF(@columnExistsLieuArrivee = 0, 
  'ALTER TABLE reservation ADD COLUMN LieuArrivee VARCHAR(100) NOT NULL DEFAULT "Agence"', 
  'SELECT "La colonne LieuArrivee existe déjà"');
PREPARE stmt2 FROM @query2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Mettre à jour les réservations existantes avec des valeurs par défaut si nécessaire
UPDATE reservation 
SET LieuDepart = 'Agence', LieuArrivee = 'Agence' 
WHERE LieuDepart = '' OR LieuArrivee = '';
