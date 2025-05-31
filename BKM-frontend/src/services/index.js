// Exporter tous les services depuis un seul fichier pour faciliter l'importation
import utilisateurService from './utilisateurService';
import voitureService from './voitureService';
import clientService from './clientService';
import reservationService from './reservationService';
import extraService from './extraService';
import adminService from './adminService';
import combinedService from './combinedService';
import authService from './authService';

export {
  utilisateurService,
  voitureService,
  clientService,
  reservationService,
  extraService,
  adminService,
  combinedService,
  authService
};
