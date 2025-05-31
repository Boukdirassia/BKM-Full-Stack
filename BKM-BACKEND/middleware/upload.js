const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage pour les photos de véhicules
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/vehicules');
    console.log(`Destination directory: ${dir}`);
    
    // S'assurer que le répertoire existe
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Utiliser l'ID du véhicule pour nommer le fichier
    const id = req.params.id;
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    const filename = `voiture-${id}${extension}`;
    console.log(`Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// Vérification des types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Accepter uniquement les images
  if (file.mimetype.startsWith('image/')) {
    console.log(`File accepted: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`File rejected: ${file.originalname}, mimetype: ${file.mimetype}`);
    cb(new Error('Le fichier doit être une image'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

module.exports = upload;
