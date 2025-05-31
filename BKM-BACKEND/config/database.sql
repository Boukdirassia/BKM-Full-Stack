-- Script de création de la base de données pour le projet BKM
-- Base de données: locationvoitures

-- Suppression des tables si elles existent déjà (pour éviter les erreurs)
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS extra;
DROP TABLE IF EXISTS client;
DROP TABLE IF EXISTS voiture;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS utilisateurs;

-- Création de la table utilisateurs
CREATE TABLE utilisateurs (
  UserID INT AUTO_INCREMENT PRIMARY KEY,
  Nom VARCHAR(50) NOT NULL,
  Prenom VARCHAR(50) NOT NULL,
  Email VARCHAR(100) NOT NULL UNIQUE,
  Telephone VARCHAR(20) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Roles VARCHAR(50) NOT NULL DEFAULT 'client'
);

-- Création de la table client
CREATE TABLE client (
  UserID INT PRIMARY KEY,
  Civilité ENUM('M.', 'Mme', 'Mlle') NOT NULL,
  CIN_Passport VARCHAR(50) NOT NULL UNIQUE,
  DateNaissance DATE NOT NULL,
  NumPermis VARCHAR(50) NOT NULL UNIQUE,
  DateDelivrancePermis DATE NOT NULL,
  Adresse TEXT NOT NULL,
  FOREIGN KEY (UserID) REFERENCES utilisateurs(UserID) ON DELETE CASCADE
);

-- Création de la table admin
CREATE TABLE admin (
  AdminID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  Role VARCHAR(50) NOT NULL,
  Permissions TEXT,
  FOREIGN KEY (UserID) REFERENCES utilisateurs(UserID) ON DELETE CASCADE
);

-- Création de la table voiture
CREATE TABLE voiture (
  VoitureID INT AUTO_INCREMENT PRIMARY KEY,
  Marque VARCHAR(50) NOT NULL,
  Modele VARCHAR(50) NOT NULL,
  Annee INT NOT NULL,
  Immatriculation VARCHAR(20) NOT NULL UNIQUE,
  Couleur VARCHAR(30) NOT NULL,
  Categorie VARCHAR(50) NOT NULL,
  PrixJour DECIMAL(10,2) NOT NULL,
  Disponibilite BOOLEAN NOT NULL DEFAULT TRUE,
  Image VARCHAR(255)
);

-- Création de la table extra
CREATE TABLE extra (
  ExtraID INT AUTO_INCREMENT PRIMARY KEY,
  Nom VARCHAR(100) NOT NULL,
  Prix DECIMAL(10,2) NOT NULL,
  Description TEXT
);

-- Création de la table reservation
CREATE TABLE reservation (
  ResID INT AUTO_INCREMENT PRIMARY KEY,
  VoitureID INT NOT NULL,
  ClientID INT NOT NULL,
  DateDébut DATE NOT NULL,
  DateFin DATE NOT NULL,
  Statut ENUM('en attente', 'confirmée', 'annulée', 'terminée') NOT NULL DEFAULT 'en attente',
  ExtraID INT,
  LieuDepart VARCHAR(100) NOT NULL,
  LieuArrivee VARCHAR(100) NOT NULL,
  FOREIGN KEY (VoitureID) REFERENCES voiture(VoitureID) ON DELETE CASCADE,
  FOREIGN KEY (ClientID) REFERENCES client(UserID) ON DELETE CASCADE,
  FOREIGN KEY (ExtraID) REFERENCES extra(ExtraID) ON DELETE SET NULL
);

-- Insertion de quelques données de test
-- Utilisateurs
INSERT INTO utilisateurs (Nom, Prenom, Email, Telephone, Password, Roles) VALUES
('Admin', 'System', 'admin@bkm.com', '0600000000', 'admin123', 'admin'),
('Dupont', 'Jean', 'jean.dupont@email.com', '0601020304', 'password123', 'client'),
('Martin', 'Sophie', 'sophie.martin@email.com', '0607080910', 'password456', 'client');

-- Admin
INSERT INTO admin (UserID, Role, Permissions) VALUES
(1, 'Super Admin', 'all');

-- Clients
INSERT INTO client (UserID, Civilité, CIN_Passport, DateNaissance, NumPermis, DateDelivrancePermis, Adresse) VALUES
(2, 'M.', 'AB123456', '1985-05-15', 'P123456789', '2005-06-20', '123 Rue de Paris, Casablanca'),
(3, 'Mme', 'CD789012', '1990-10-25', 'P987654321', '2010-11-05', '456 Avenue Mohammed V, Rabat');

-- Voitures
INSERT INTO voiture (Marque, Modele, Annee, Immatriculation, Couleur, Categorie, PrixJour, Disponibilite, Image) VALUES
('Renault', 'Clio', 2020, 'AA-123-BB', 'Rouge', 'Economique', 300.00, TRUE, 'clio.jpg'),
('Peugeot', '3008', 2021, 'CC-456-DD', 'Noir', 'SUV', 500.00, TRUE, '3008.jpg'),
('Mercedes', 'Classe C', 2022, 'EE-789-FF', 'Gris', 'Premium', 800.00, TRUE, 'classeC.jpg');

-- Extras
INSERT INTO extra (Nom, Prix, Description) VALUES
('GPS', 50.00, 'Système de navigation GPS intégré'),
('Siège bébé', 30.00, 'Siège adapté pour les enfants de moins de 2 ans'),
('Assurance tous risques', 100.00, 'Couverture complète en cas d'accident');

-- Réservations
INSERT INTO reservation (VoitureID, ClientID, DateDébut, DateFin, Statut, ExtraID, LieuDepart, LieuArrivee) VALUES
(1, 2, '2025-05-01', '2025-05-05', 'confirmée', 1, 'Aéroport de Casa', 'Casablanca Ville'),
(2, 3, '2025-05-10', '2025-05-15', 'en attente', 3, 'Agence', 'Aéroport de Marrakech');
