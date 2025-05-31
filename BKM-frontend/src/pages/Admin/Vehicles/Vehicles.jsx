import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  IconButton,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { voitureService } from '../../../services';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ 
    Marque: '', 
    Modele: '', 
    Annee: '', 
    Immatriculation: '',
    Categorie: 'Citadine',
    Type: 'Essence',
    Photo: '',
    Disponibilite: true,
    Prix: '',
    Places: '',
    Portes: '',
    Transmission: 'Manuelle'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // État pour la boîte de dialogue de détails
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setErrors({}); };
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = name === 'Disponibilite' ? checked : value;
    setNewVehicle({ ...newVehicle, [name]: newValue });
  };

  const handleSave = async () => {

    
    // Vérification des champs obligatoires
    const newErrors = {};
    if (!newVehicle.Marque || !newVehicle.Marque.trim()) newErrors.Marque = "La marque est obligatoire";
    if (!newVehicle.Modele || !newVehicle.Modele.trim()) newErrors.Modele = "Le modèle est obligatoire";
    if (!newVehicle.Annee) newErrors.Annee = "L'année est obligatoire";
    if (!newVehicle.Immatriculation || !newVehicle.Immatriculation.trim()) newErrors.Immatriculation = "L'immatriculation est obligatoire";
    if (!newVehicle.Categorie || !newVehicle.Categorie.trim()) newErrors.Categorie = "La catégorie est obligatoire";
    if (!newVehicle.Prix) newErrors.Prix = "Le prix est obligatoire";
    
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      return; 
    }
    
    try {
      // Préparer les données pour le backend
      // Utiliser les noms exacts des colonnes de la base de données
      const vehicleToSave = {
        Marque: newVehicle.Marque ? newVehicle.Marque.trim() : '',
        // Envoyer à la fois Modèle (avec accent) et Modele (sans accent) pour s'assurer que le backend reçoit le bon format
        'Modèle': newVehicle.Modele ? newVehicle.Modele.trim() : '',
        Modele: newVehicle.Modele ? newVehicle.Modele.trim() : '',  // Ajouter aussi sans accent pour la validation
        Annee: newVehicle.Annee ? String(newVehicle.Annee) : '',
        Immatriculation: newVehicle.Immatriculation ? newVehicle.Immatriculation.trim() : '',
        Categorie: newVehicle.Categorie ? newVehicle.Categorie.trim() : '',
        Type: newVehicle.Type ? newVehicle.Type.trim() : '',
        Prix: parseFloat(newVehicle.Prix) || 0,
        // Envoyer à la fois Disponibilité (avec accent) et Disponibilite (sans accent)
        'Disponibilité': newVehicle.Disponibilite ? 1 : 0,
        Disponibilite: newVehicle.Disponibilite ? 1 : 0,  // Ajouter aussi sans accent pour la validation
        Photo: newVehicle.Photo || '',
        Places: newVehicle.Places ? parseInt(newVehicle.Places) : null,
        Portes: newVehicle.Portes ? parseInt(newVehicle.Portes) : null,
        Transmission: newVehicle.Transmission ? newVehicle.Transmission.trim() : ''
      };
      
      console.log('Données à envoyer au backend:', vehicleToSave);
      
      let response, vehicleId;
      
      // ÉTAPE 1: Créer/Mettre à jour le véhicule sur le serveur
      if (editingVehicle) {
        // Mise à jour d'un véhicule existant
        vehicleId = editingVehicle.VoitureID;
        response = await voitureService.updateVoiture(vehicleId, vehicleToSave);
      } else {
        // Ajout d'un nouveau véhicule
        response = await voitureService.createVoiture(vehicleToSave);
        vehicleId = response.id || response.VoitureID || response.insertId;
      }
      
      // ÉTAPE 2: Gérer le téléchargement de la photo si nécessaire
      let photoURL = newVehicle.Photo;
      if (photoFile) {
        await voitureService.uploadVoiturePhoto(vehicleId, photoFile);
        const timestamp = Date.now();
        // Utiliser l'URL de base de l'API sans dépendre de process.env qui n'est pas disponible dans le navigateur
        photoURL = `http://localhost:3000/uploads/vehicules/${vehicleId}.jpg?t=${timestamp}`;
      }
      
      // ÉTAPE 3: Préparer le nouvel objet véhicule pour l'affichage immédiat
      const updatedVehicle = {
        VoitureID: vehicleId,
        Marque: vehicleToSave.Marque,
        Modele: vehicleToSave['Modèle'] || vehicleToSave.Modele,  // Gérer les deux cas
        Annee: vehicleToSave.Annee,
        Immatriculation: vehicleToSave.Immatriculation,
        Categorie: vehicleToSave.Categorie,
        Type: vehicleToSave.Type,
        Prix: vehicleToSave.Prix,
        Disponibilite: Boolean(vehicleToSave['Disponibilité'] || vehicleToSave.Disponibilite),
        Photo: photoURL,
        Places: vehicleToSave.Places,
        Portes: vehicleToSave.Portes,
        Transmission: vehicleToSave.Transmission,
        _photoTimestamp: Date.now()
      };
      
      // ÉTAPE 4: Mettre à jour l'état local IMMÉDIATEMENT
      if (editingVehicle) {
        // Si c'est une modification, remplacer le véhicule existant
        const updatedVehicles = vehicles.map(v => 
          v.VoitureID === vehicleId ? updatedVehicle : v
        );
        setVehicles(updatedVehicles);
      } else {
        // Si c'est un nouvel ajout, l'ajouter au début (tri par ID décroissant)
        setVehicles([updatedVehicle, ...vehicles]);
      }
      
      // Afficher la notification de succès
      setSnackbar({
        open: true,
        message: editingVehicle ? 'Véhicule mis à jour avec succès' : 'Véhicule ajouté avec succès',
        severity: 'success'
      });
      
      // Réinitialiser le formulaire et fermer la boîte de dialogue
      setNewVehicle({ 
        Marque: '', 
        Modele: '', 
        Annee: '', 
        Immatriculation: '',
        Categorie: 'Citadine',
        Type: 'Essence',
        Photo: '',
        Disponibilite: true,
        Prix: '',
        Places: '',
        Portes: '',
        Transmission: 'Manuelle'
      });
      setPhotoFile(null);
      setPhotoPreview('');
      setErrors({});
      setEditingVehicle(null);
      handleClose();
      
      // Actualiser également depuis le serveur en arrière-plan (après un délai)
      setTimeout(() => {
        fetchVehicles().catch(() => {/* Erreur gérée par les notifications UI */});
      }, 1000);
    } catch (error) {
      // Erreur gérée par les notifications UI
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'enregistrement du véhicule',
        severity: 'error'
      });
    }
  };

  const handleEdit = (vehicle) => {
    // Afficher les données du véhicule pour le débogage
    console.log('Édition du véhicule:', vehicle);
    console.log('Clés disponibles:', Object.keys(vehicle));
    
    // Utiliser directement les noms exacts des colonnes de la base de données
    // D'après la structure de la table, les colonnes s'appellent 'Places', 'Portes' et 'Transmission'
    const places = vehicle.Places !== undefined && vehicle.Places !== null ? vehicle.Places : '';
    const portes = vehicle.Portes !== undefined && vehicle.Portes !== null ? vehicle.Portes : '';
    const transmission = vehicle.Transmission !== undefined && vehicle.Transmission !== null ? vehicle.Transmission : 'Manuelle';
    
    console.log('Valeurs extraites pour l\'édition:', {
      Places: places,
      Portes: portes,
      Transmission: transmission
    });
    
    setEditingVehicle(vehicle);
    setNewVehicle({
      Marque: vehicle.Marque,
      Modele: vehicle.Modele,
      Annee: vehicle.Annee,
      Immatriculation: vehicle.Immatriculation,
      Categorie: vehicle.Categorie,
      Type: vehicle.Type,
      Photo: vehicle.Photo,
      Disponibilite: vehicle.Disponibilite,
      Prix: vehicle.Prix,
      Places: places,
      Portes: portes,
      Transmission: transmission
    });
    setOpen(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      try {
        await voitureService.deleteVoiture(confirmDeleteId);
        setSnackbar({
          open: true,
          message: 'Véhicule supprimé avec succès',
          severity: 'success'
        });
        fetchVehicles();
      } catch (error) {
        // Erreur gérée par les notifications UI
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression du véhicule',
          severity: 'error'
        });
      }
      setOpenDeleteDialog(false);
      setConfirmDeleteId(null);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setConfirmDeleteId(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Réinitialiser la page lors d'une nouvelle recherche
  };

  const handlePhotoClick = (photoUrl) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalOpen(true);
  };

  const handlePhotoModalClose = () => {
    setPhotoModalOpen(false);
  };

  // Fonction pour afficher les détails d'un véhicule
  const handleDetail = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailDialogOpen(true);
  };

  // Fonction pour fermer la boîte de dialogue de détails
  const handleDetailClose = () => {
    setDetailDialogOpen(false);
    setSelectedVehicle(null);
  };

  // Gestionnaires d'événements pour la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrer les véhicules en fonction du terme de recherche
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.Marque.toLowerCase().includes(searchLower) ||
      vehicle.Modele.toLowerCase().includes(searchLower) ||
      vehicle.Immatriculation.toLowerCase().includes(searchLower) ||
      vehicle.Categorie.toLowerCase().includes(searchLower) ||
      vehicle.Type.toLowerCase().includes(searchLower) ||
      vehicle.Annee.toString().includes(searchLower) ||
      vehicle.Prix.toString().includes(searchLower)
    );
  });

  // Appliquer la pagination aux véhicules filtrés
  const paginatedVehicles = filteredVehicles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Récupérer TOUS les véhicules, pas seulement ceux qui sont disponibles
      const data = await voitureService.getAllVoitures();
      console.log('Tous les véhicules récupérés:', data);
      
      if (!data || data.length === 0) {
        console.warn('Aucun véhicule récupéré de la base de données');
      } else {
        console.log(`${data.length} véhicules récupérés au total`);
      }
      
      // Afficher les données brutes pour déboguer
      console.log('Données brutes du premier véhicule:', data && data.length > 0 ? data[0] : 'Aucun véhicule');
      
      // Transformation des données pour s'assurer que tous les champs sont présents
      // et pour gérer les différences de noms entre la base de données et le frontend
      const formattedData = (data || []).map(vehicle => {
        // Vérifier si le véhicule a un ID valide
        if (!vehicle || !vehicle.VoitureID) {
          console.warn('Véhicule sans ID détecté:', vehicle);
          return null;
        }
        
        // Déboguer les données brutes du véhicule
        console.log(`Véhicule ${vehicle.VoitureID} - Données brutes:`, vehicle);
        
        // Afficher toutes les clés du véhicule pour identifier les noms exacts des colonnes
        console.log(`Véhicule ${vehicle.VoitureID} - Clés disponibles:`, Object.keys(vehicle));
        
        // Déboguer les données des nouvelles colonnes avec toutes les variations possibles
        console.log(`Véhicule ${vehicle.VoitureID} - Places:`, 
                    vehicle.Places, 
                    vehicle['Places'], 
                    vehicle['places'], 
                    vehicle['Placés'], 
                    vehicle['placés']);
        console.log(`Véhicule ${vehicle.VoitureID} - Portes:`, 
                    vehicle.Portes, 
                    vehicle['Portes'], 
                    vehicle['portes'], 
                    vehicle['Portés'], 
                    vehicle['portés']);
        console.log(`Véhicule ${vehicle.VoitureID} - Transmission:`, 
                    vehicle.Transmission, 
                    vehicle['Transmission'], 
                    vehicle['transmission']);
        
        // Convertir explicitement la disponibilité en booléen
        let disponibilite = false;
        if (vehicle['Disponibilité'] !== undefined) {
          disponibilite = vehicle['Disponibilité'] === 1 || vehicle['Disponibilité'] === true;
        } else if (vehicle.Disponibilite !== undefined) {
          disponibilite = vehicle.Disponibilite === 1 || vehicle.Disponibilite === true;
        }
        
        // Gérer les noms de colonnes qui pourraient avoir des accents ou des variations
        // Utiliser directement les noms exacts des colonnes de la base de données
        // D'après la structure de la table, les colonnes s'appellent 'Places', 'Portes' et 'Transmission'
        const places = vehicle.Places !== undefined && vehicle.Places !== null ? vehicle.Places : '';
        const portes = vehicle.Portes !== undefined && vehicle.Portes !== null ? vehicle.Portes : '';
        const transmission = vehicle.Transmission !== undefined && vehicle.Transmission !== null ? vehicle.Transmission : '';
        
        console.log(`Véhicule ${vehicle.VoitureID} - Valeurs extraites:`, {
          Places: places,
          Portes: portes,
          Transmission: transmission
        });
        
        return {
          VoitureID: vehicle.VoitureID,
          Marque: vehicle.Marque || '',
          Modele: vehicle['Modèle'] || vehicle.Modele || '',  // Gestion de l'accent dans le nom du champ
          Annee: vehicle.Annee || '',
          Immatriculation: vehicle.Immatriculation || '',
          Categorie: vehicle.Categorie || '',
          Type: vehicle.Type || '',
          Prix: vehicle.Prix || 0,
          Disponibilite: disponibilite,  // Utilisation de la valeur convertie
          Photo: vehicle.Photo || '',
          Places: places,
          Portes: portes,
          Transmission: transmission
        };
      }).filter(Boolean); // Éliminer les entrées nulles
      
      console.log('Données formatées:', formattedData);
      
      // Trier les véhicules par ordre décroissant d'ID (les derniers ajoutés en premier)
      const sortedData = [...formattedData].sort((a, b) => b.VoitureID - a.VoitureID);
      setVehicles(sortedData);
      
      console.log(`${sortedData.length} véhicules affichés dans le tableau`);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      // Erreur gérée par les notifications UI
      setSnackbar({
        open: true,
        message: 'Erreur lors de la récupération des véhicules: ' + (error.message || 'Erreur inconnue'),
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      py: { xs: 2, sm: 3, md: 4 },
      '&::-webkit-scrollbar': {
        display: 'none'
      },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: { xs: 2, sm: 3 }, 
        gap: { xs: 1, sm: 2 } 
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 'bold', 
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          mb: { xs: 1, sm: 0 },
          textAlign: { xs: 'center', sm: 'left' }
        }}>
          Gestion des véhicules
        </Typography>
        <Button 
          onClick={handleOpen} 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          fullWidth={window.innerWidth < 600}
          sx={{ height: { xs: 40, sm: 'auto' } }}
        >
          Ajouter un véhicule
        </Button>
      </Box>

      <Box sx={{ 
        mb: { xs: 2, sm: 3 }, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: { xs: 1, sm: 2 } 
      }}>
        <TextField
          variant="outlined"
          placeholder="Rechercher un véhicule"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Box>

      {/* Vue mobile (affichée uniquement sur les petits écrans) */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map(vehicle => (
            <Paper 
              key={vehicle.VoitureID} 
              elevation={3} 
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2,
                borderLeft: vehicle.Disponibilite ? '5px solid #4caf50' : '5px solid #f44336',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={4} sm={3}>
                  {vehicle.Photo ? (
                    <Box
                      component="img"
                      src={`http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}`}
                      alt={`${vehicle.Marque} ${vehicle.Modele}`}
                      onClick={() => handlePhotoClick(`http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}`)}
                      sx={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                      }}
                      onError={(e) => {
                        console.log(`Erreur de chargement pour ${vehicle.Marque} ${vehicle.Modele}. Essai de fallbacks.`);
                        e.target.onerror = null; // Éviter les boucles infinies
                        
                        // Essayer avec une extension .png
                        if (!e.target.src.includes('.png')) {
                          e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}.png`;
                          return;
                        }
                        
                        // Essayer avec une extension .jpg
                        if (e.target.src.includes('.png')) {
                          e.target.src = e.target.src.replace('.png', '.jpg');
                          return;
                        }
                        
                        // Essayer sur le port 3000
                        if (e.target.src.includes('4000')) {
                          e.target.src = e.target.src.replace('4000', '3000');
                          return;
                        }
                        
                        // Utiliser directement le SVG inline comme fallback final
                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='80' viewBox='0 0 100 80'%3E%3Crect width='100%' height='80' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='14' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${vehicle.Marque}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f0f0f0',
                        borderRadius: 1,
                        border: '1px solid #ddd'
                      }}
                    >
                      <DirectionsCarIcon sx={{ fontSize: 40 }} />
                    </Box>
                  )}
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {vehicle.Marque} {vehicle.Modele}
                    </Typography>
                    <Chip 
                      label={vehicle.Disponibilite ? "Disponible" : "Non disponible"} 
                      color={vehicle.Disponibilite ? "success" : "error"} 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Année: <span style={{ color: 'text.primary', fontWeight: 'medium' }}>{vehicle.Annee}</span></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Prix: <span style={{ color: 'text.primary', fontWeight: 'medium' }}>{vehicle.Prix} DH/jour</span></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Immatriculation: <span style={{ color: 'text.primary', fontWeight: 'medium' }}>{vehicle.Immatriculation}</span></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Catégorie: <span style={{ color: 'text.primary', fontWeight: 'medium' }}>{vehicle.Categorie}</span></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Places: <span style={{ color: 'text.primary', fontWeight: 'medium' }}>{vehicle.Places || 'Non spécifié'}</span></Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Portes: <span style={{ color: 'text.primary', fontWeight: 'medium' }}>{vehicle.Portes || 'Non spécifié'}</span></Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" color="textSecondary" component="span">Transmission:</Typography>
                        {vehicle.Transmission ? (
                          <Chip 
                            label={vehicle.Transmission} 
                            size="small"
                            sx={{
                              ml: 1,
                              backgroundColor: '#333',
                              color: '#FFD700',
                              fontWeight: 'medium',
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        ) : <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.primary', fontWeight: 'medium' }}>Non spécifié</Typography>}
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <IconButton color="success" size="small" onClick={() => handleDetail(vehicle)}>
                      <DirectionsCarIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="primary" size="small" onClick={() => handleEdit(vehicle)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDeleteClick(vehicle.VoitureID)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))
        ) : (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
            {searchTerm ? "Aucun véhicule ne correspond à votre recherche" : "Aucun véhicule trouvé"}
          </Paper>
        )}
      </Box>

      {/* Vue bureau (affichée uniquement sur les grands écrans) */}
      <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2, display: { xs: 'none', md: 'block' } }}>
        <TableContainer sx={{ 
          borderRadius: 2, 
          overflow: 'auto', 
          maxWidth: '100%',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}>
          <Table
            sx={{
              minWidth: 650,
              tableLayout: 'fixed',
              '& .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: 'action.hover' },
              '& .MuiTableRow-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
              '& .MuiTableCell-root': { padding: '16px 8px', borderSpacing: '2px' },
              borderCollapse: 'separate',
              borderSpacing: '0 8px'
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell width="80px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>Photo</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Marque</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Modèle</TableCell>
                <TableCell width="80px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Année</TableCell>
                <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Immatriculation</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Catégorie</TableCell>
                <TableCell width="80px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Type</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', textAlign: 'center' }}>Prix (DH/jour)</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', textAlign: 'center' }}>Disponibilité</TableCell>
                <TableCell width="120px" align="center" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: '#FFFFFF', position: 'sticky', right: 0, zIndex: 2, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.VoitureID} sx={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}>
                    <TableCell sx={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>
                      {vehicle.Photo ? (
                        <Box
                          component="img"
                          src={`http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}${vehicle._photoTimestamp ? `?t=${vehicle._photoTimestamp}` : ''}`}
                          alt={`${vehicle.Marque} ${vehicle.Modele}`}
                          onClick={() => handlePhotoClick(`http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}${vehicle._photoTimestamp ? `?t=${vehicle._photoTimestamp}` : ''}`)}                          sx={{
                            width: 60,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #ddd',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }
                          }}
                          onError={(e) => {
                            console.log(`Erreur de chargement pour ${vehicle.Marque} ${vehicle.Modele}. Essai de fallbacks.`);
                            e.target.onerror = null; // Éviter les boucles infinies
                            
                            // Essayer avec une extension .png
                            if (!e.target.src.includes('.png')) {
                              e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${vehicle.VoitureID}.png${vehicle._photoTimestamp ? `?t=${vehicle._photoTimestamp}` : ''}`;
                              return;
                            }
                            
                            // Essayer avec une extension .jpg
                            if (e.target.src.includes('.png')) {
                              e.target.src = e.target.src.replace('.png', '.jpg');
                              return;
                            }
                            
                            // Essayer sur le port 3000
                            if (e.target.src.includes('4000')) {
                              e.target.src = e.target.src.replace('4000', '3000');
                              return;
                            }
                            
                            // Utiliser directement le SVG inline comme fallback final
                            e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'%3E%3Crect width='60' height='40' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='10' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${vehicle.Marque}%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 60,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: '#f0f0f0',
                            borderRadius: 1,
                            border: '1px solid #ddd'
                          }}
                        >
                          <DirectionsCarIcon color="disabled" />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{vehicle.Marque}</TableCell>
                    <TableCell>{vehicle.Modele}</TableCell>
                    <TableCell>{vehicle.Annee}</TableCell>
                    <TableCell>{vehicle.Immatriculation}</TableCell>
                    <TableCell>{vehicle.Categorie}</TableCell>
                    <TableCell>{vehicle.Type}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{vehicle.Prix} DH/jour</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Chip 
                        label={vehicle.Disponibilite ? "Disponible" : "Non disponible"} 
                        color={vehicle.Disponibilite ? "success" : "error"} 
                        size="small"
                        sx={{
                          backgroundColor: vehicle.Disponibilite ? '#FFD700' : '#ff4444',
                          color: vehicle.Disponibilite ? '#000000' : '#ffffff',
                          fontWeight: 'bold',
                          '& .MuiChip-label': {
                            px: 2
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleDetail(vehicle)}
                          size="small"
                          sx={{ 
                            p: 0,
                            '&:hover': { 
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Avatar sx={{ width: 30, height: 30, bgcolor: '#4caf50' }}>
                            <DirectionsCarIcon fontSize="small" sx={{ color: '#FFF' }} />
                          </Avatar>
                        </IconButton>
                        <IconButton 
                          onClick={() => handleEdit(vehicle)}
                          size="small"
                          sx={{ 
                            p: 0,
                            '&:hover': { 
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Avatar sx={{ width: 30, height: 30, bgcolor: '#FFD700' }}>
                            <EditIcon fontSize="small" sx={{ color: '#000' }} />
                          </Avatar>
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteClick(vehicle.VoitureID)}
                          size="small"
                          sx={{ 
                            p: 0,
                            '&:hover': { 
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Avatar sx={{ width: 30, height: 30, bgcolor: '#ff4444' }}>
                            <DeleteIcon fontSize="small" sx={{ color: '#FFF' }} />
                          </Avatar>
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    {searchTerm ? "Aucun véhicule ne correspond à votre recherche" : "Aucun véhicule trouvé"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredVehicles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          sx={{
            '.MuiTablePagination-selectLabel': { marginBottom: 0 },
            '.MuiTablePagination-displayedRows': { marginBottom: 0 },
            '.MuiTablePagination-select': { paddingTop: 0, paddingBottom: 0 },
            '.MuiTablePagination-selectIcon': { top: 0 },
            color: '#000',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 8px 8px'
          }}
        />
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' } }}
        PaperProps={{ 
          sx: { 
            borderRadius: { xs: 2, md: 3 }, 
            maxWidth: { xs: '95vw', sm: '90vw', md: '800px' }, 
            margin: 'auto', 
            backgroundColor: '#000000', 
            overflow: 'hidden',
            height: { xs: 'auto', sm: 'auto' } // Assurer que la hauteur s'adapte au contenu sur mobile
          } 
        }}
      >
        <DialogTitle sx={{ 
            backgroundColor: '#FFD700', 
            color: '#000000', 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1, 
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 'bold' 
          }}>
          <DirectionsCarIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} /> 
          {editingVehicle ? 'Modifier un véhicule' : 'Ajouter un véhicule'}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            overflowY: 'auto',
            maxHeight: { xs: 'calc(100vh - 170px)', sm: 'calc(100vh - 200px)' }
          }}
        >
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {/* Message responsive pour l'upload de photo */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: '#aaaaaa', textAlign: 'center', mb: 1, display: { xs: 'block', sm: 'none' } }}>
                Remplissez les informations du véhicule et sélectionnez une photo
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Marque</Typography>
                <TextField
                  name="Marque"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Marque}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                  error={!!errors.Marque}
                  helperText={errors.Marque}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Modèle</Typography>
                <TextField
                  name="Modele"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Modele}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                  error={!!errors.Modele}
                  helperText={errors.Modele}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Année</Typography>
                <TextField
                  name="Annee"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Annee}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                  error={!!errors.Annee}
                  helperText={errors.Annee}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Immatriculation</Typography>
                <TextField
                  name="Immatriculation"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Immatriculation}
                  onChange={handleChange}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                  error={!!errors.Immatriculation}
                  helperText={errors.Immatriculation}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Catégorie</Typography>
                <FormControl fullWidth>
                  <Select
                    name="Categorie"
                    value={newVehicle.Categorie}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444444' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                      '& .MuiSelect-icon': { color: '#FFD700' }
                    }}
                  >
                    <MenuItem value="Citadine">Citadine</MenuItem>
                    <MenuItem value="Compacte">Compacte</MenuItem>
                    <MenuItem value="Berline">Berline</MenuItem>
                    <MenuItem value="Économique">Économique</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Crossover">Crossover</MenuItem>
                    <MenuItem value="4x4 / Tout-terrain">4x4 / Tout-terrain</MenuItem>
                    <MenuItem value="Break">Break</MenuItem>
                    <MenuItem value="Coupé">Coupé</MenuItem>
                    <MenuItem value="Cabriolet / Décapotable">Cabriolet / Décapotable</MenuItem>
                    <MenuItem value="Monospace">Monospace</MenuItem>
                    <MenuItem value="Minibus">Minibus</MenuItem>
                    <MenuItem value="Utilitaire">Utilitaire</MenuItem>
                    <MenuItem value="Pick-up">Pick-up</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Type</Typography>
                <FormControl fullWidth>
                  <Select
                    name="Type"
                    value={newVehicle.Type}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444444' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                      '& .MuiSelect-icon': { color: '#FFD700' }
                    }}
                  >
                    <MenuItem value="Essence">Essence</MenuItem>
                    <MenuItem value="Diesel">Diesel</MenuItem>
                    <MenuItem value="Hybride">Hybride</MenuItem>
                    <MenuItem value="Hybride rechargeable (Plug-in)">Hybride rechargeable (Plug-in)</MenuItem>
                    <MenuItem value="Électrique">Électrique</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Prix par jour (DH)</Typography>
                <TextField
                  name="Prix"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Prix}
                  onChange={handleChange}
                  type="number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DH</InputAdornment>,
                  }}
                  error={!!errors.Prix}
                  helperText={errors.Prix}
                />
              </Box>
            </Grid>
            
            {/* Nouvelles colonnes ajoutées */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#FFD700', mt: 2, mb: 2, fontWeight: 'bold' }}>Caractéristiques techniques</Typography>
              <Divider sx={{ backgroundColor: '#FFD700', opacity: 0.7, mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Nombre de places</Typography>
                <TextField
                  name="Places"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Places}
                  onChange={handleChange}
                  type="number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Nombre de portes</Typography>
                <TextField
                  name="Portes"
                  variant="outlined"
                  fullWidth
                  value={newVehicle.Portes}
                  onChange={handleChange}
                  type="number"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Transmission</Typography>
                <FormControl fullWidth>
                  <Select
                    name="Transmission"
                    value={newVehicle.Transmission}
                    onChange={handleChange}
                    displayEmpty
                    sx={{
                      backgroundColor: '#222222',
                      color: '#ffffff',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444444' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                      '& .MuiSelect-icon': { color: '#FFD700' }
                    }}
                  >
                    <MenuItem value="Manuelle">Manuelle</MenuItem>
                    <MenuItem value="Automatique">Automatique</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Photo</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 2,
                    border: '2px dashed #FFD700',
                    borderRadius: 2,
                    backgroundColor: '#222222',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#333333',
                      borderColor: '#FFE44D',
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="vehicle-photo-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPhotoFile(e.target.files[0]);
                        setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                        // Mettre à jour le nom du fichier dans l'état du véhicule
                        setNewVehicle({
                          ...newVehicle,
                          Photo: e.target.files[0].name
                        });
                      }
                    }}
                  />
                  <label htmlFor="vehicle-photo-upload" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
                    {photoPreview ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={photoPreview}
                          alt="Aperçu du véhicule"
                          sx={{
                            width: 120,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 1
                          }}
                        />
                        <Typography variant="body2" sx={{ color: '#FFD700' }}>
                          {photoFile ? photoFile.name : 'Changer la photo'}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <DirectionsCarIcon sx={{ fontSize: 40, color: '#FFD700', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          Cliquez pour ajouter une photo
                        </Typography>
                      </Box>
                    )}
                  </label>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>Disponibilité</Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#222222',
                    borderRadius: 2,
                    p: 2,
                    border: '1px solid #444444'
                  }}
                >
                  <Button
                    variant={newVehicle.Disponibilite ? "contained" : "outlined"}
                    onClick={() => setNewVehicle({ ...newVehicle, Disponibilite: true })}
                    sx={{
                      flex: 1,
                      mr: 1,
                      backgroundColor: newVehicle.Disponibilite ? '#FFD700' : 'transparent',
                      color: newVehicle.Disponibilite ? '#000000' : '#FFD700',
                      borderColor: '#FFD700',
                      '&:hover': {
                        backgroundColor: newVehicle.Disponibilite ? '#e6c200' : 'rgba(255, 215, 0, 0.1)',
                      }
                    }}
                  >
                    Disponible
                  </Button>
                  <Button
                    variant={!newVehicle.Disponibilite ? "contained" : "outlined"}
                    onClick={() => setNewVehicle({ ...newVehicle, Disponibilite: false })}
                    sx={{
                      flex: 1,
                      ml: 1,
                      backgroundColor: !newVehicle.Disponibilite ? '#ff4444' : 'transparent',
                      color: !newVehicle.Disponibilite ? '#ffffff' : '#ff4444',
                      borderColor: '#ff4444',
                      '&:hover': {
                        backgroundColor: !newVehicle.Disponibilite ? '#cc0000' : 'rgba(255, 68, 68, 0.1)',
                      }
                    }}
                  >
                    Non disponible
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
            backgroundColor: '#000000', 
            p: { xs: 2, sm: 3 }, 
            pt: { xs: 1, sm: 1 }, 
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
          <Button 
            onClick={handleClose} 
            color="inherit" 
            variant="outlined" 
            fullWidth={window.innerWidth < 600}
            sx={{ 
              borderColor: '#555555', 
              color: '#ffffff',
              mb: { xs: 1, sm: 0 },
              order: { xs: 2, sm: 1 }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            fullWidth={window.innerWidth < 600}
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#000000', 
              '&:hover': { backgroundColor: '#e6c200' },
              order: { xs: 1, sm: 2 },
              mb: { xs: 1, sm: 0 }
            }}
          >
            {editingVehicle ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
          {window.innerWidth < 600 && (
            <Button 
              onClick={handleDetailOpen} 
              variant="contained" 
              fullWidth
              sx={{ 
                backgroundColor: '#4caf50', 
                color: '#ffffff',
                '&:hover': { backgroundColor: '#3d8b40' },
                mt: 1
              }}
            >
              Détail
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Boîte de dialogue de détails */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleDetailClose}
        fullWidth
        maxWidth="md"
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' } }}
        PaperProps={{ 
          sx: { 
            borderRadius: { xs: 2, md: 3 }, 
            maxWidth: { xs: '95vw', sm: '90vw', md: '800px' }, 
            margin: 'auto', 
            backgroundColor: '#000000', 
            overflow: 'hidden',
            height: { xs: 'auto', sm: 'auto' }
          } 
        }}
      >
        <DialogTitle sx={{ 
            backgroundColor: '#4caf50', 
            color: '#ffffff', 
            textAlign: 'center', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 1, 
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 'bold' 
          }}>
          <DirectionsCarIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} /> 
          Détails du véhicule
        </DialogTitle>
        {selectedVehicle && (
          // Déboguer les données du véhicule sélectionné
          console.log('Détails du véhicule sélectionné:', selectedVehicle) || 
          console.log('Clés disponibles dans selectedVehicle:', Object.keys(selectedVehicle)) || 
          console.log('Valeurs des nouvelles colonnes:', {
            Places: selectedVehicle.Places,
            Portes: selectedVehicle.Portes,
            Transmission: selectedVehicle.Transmission
          }) || 
          <DialogContent
            sx={{
              backgroundColor: '#000000',
              color: '#ffffff',
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 },
              overflowY: 'auto',
              maxHeight: { xs: 'calc(100vh - 170px)', sm: 'calc(100vh - 200px)' }
            }}
          >
            <Grid container spacing={2}>
              {/* Photo du véhicule */}
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                <Box sx={{ 
                  width: '100%',
                  border: '2px solid #4caf50', 
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: { xs: 200, sm: 250, md: 300 },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#111111'
                }}>
                  {selectedVehicle.Photo ? (
                    <Box
                      component="img"
                      src={`http://localhost:4000/uploads/vehicules/voiture-${selectedVehicle.VoitureID}${selectedVehicle._photoTimestamp ? `?t=${selectedVehicle._photoTimestamp}` : ''}`}
                      alt={`${selectedVehicle.Marque} ${selectedVehicle.Modele}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        console.log(`Erreur de chargement pour ${selectedVehicle.Marque} ${selectedVehicle.Modele}. Essai de fallbacks.`);
                        e.target.onerror = null;
                        
                        // Essayer avec une extension .png
                        if (!e.target.src.includes('.png')) {
                          e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${selectedVehicle.VoitureID}.png${selectedVehicle._photoTimestamp ? `?t=${selectedVehicle._photoTimestamp}` : ''}`;
                          return;
                        }
                        
                        // Essayer avec une extension .jpg
                        if (e.target.src.includes('.png')) {
                          e.target.src = e.target.src.replace('.png', '.jpg');
                          return;
                        }
                        
                        // Essayer sur le port 3000
                        if (e.target.src.includes('4000')) {
                          e.target.src = e.target.src.replace('4000', '3000');
                          return;
                        }
                        
                        // Utiliser directement le SVG inline comme fallback final
                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 400 300'%3E%3Crect width='100%' height='300' fill='%23262626'/%3E%3Ctext x='50%' y='50%' font-size='24' fill='%23FFD700' text-anchor='middle' dominant-baseline='middle'%3E${selectedVehicle.Marque} ${selectedVehicle.Modele}%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  ) : (
                    <DirectionsCarIcon sx={{ fontSize: 80, color: '#4caf50' }} />
                  )}
                </Box>
              </Grid>
              
              {/* Informations principales du véhicule */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>ID du véhicule</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.VoitureID}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Marque</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Marque}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Modèle</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Modele}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Année</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Annee}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              {/* Ligne de séparation */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2, backgroundColor: '#4caf50', opacity: 0.7 }} />
              </Grid>
              
              {/* Informations techniques */}
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Immatriculation</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Immatriculation}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Catégorie</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Categorie}</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Type</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Type}</Typography>
                </Box>
              </Grid>
              
              {/* Informations commerciales */}
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Prix par jour</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{selectedVehicle.Prix} DH/jour</Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Disponibilité</Typography>
                  <Chip 
                    label={selectedVehicle.Disponibilite ? "Disponible" : "Non disponible"} 
                    color={selectedVehicle.Disponibilite ? "success" : "error"} 
                    sx={{
                      backgroundColor: selectedVehicle.Disponibilite ? '#4caf50' : '#ff4444',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      '& .MuiChip-label': {
                        px: 2
                      }
                    }}
                  />
                </Box>
              </Grid>
              
              {/* Ligne de séparation */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2, backgroundColor: '#4caf50', opacity: 0.7 }} />
                <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, fontWeight: 'bold' }}>Caractéristiques techniques</Typography>
              </Grid>
              
              {/* Nouvelles colonnes ajoutées */}
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Nombre de places</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>
                    {selectedVehicle.Places && selectedVehicle.Places !== '0' && selectedVehicle.Places !== 0 ? 
                      selectedVehicle.Places : 
                      'Non spécifié'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Nombre de portes</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>
                    {selectedVehicle.Portes && selectedVehicle.Portes !== '0' && selectedVehicle.Portes !== 0 ? 
                      selectedVehicle.Portes : 
                      'Non spécifié'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>Transmission</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>
                    {selectedVehicle.Transmission && selectedVehicle.Transmission.trim && selectedVehicle.Transmission.trim() !== '' ? 
                      selectedVehicle.Transmission : 
                      'Non spécifié'}
                  </Typography>
                </Box>
              </Grid>
              
              {/* Affichage de toutes les autres propriétés disponibles */}
              {Object.entries(selectedVehicle).map(([key, value]) => {
                // Exclure les propriétés déjà affichées et les propriétés internes
                if (['VoitureID', 'Marque', 'Modele', 'Modèle', 'Annee', 'Immatriculation', 'Categorie', 'Type', 'Prix', 'Disponibilite', 'Disponibilité', 'Photo', '_photoTimestamp', 'Places', 'Portes', 'Transmission'].includes(key)) {
                  return null;
                }
                
                // Vérifier si la valeur n'est pas undefined, null, ou une fonction
                if (value !== undefined && value !== null && typeof value !== 'function') {
                  let displayValue = value;
                  
                  // Formater la valeur selon son type
                  if (typeof value === 'boolean') {
                    displayValue = value ? 'Oui' : 'Non';
                  } else if (typeof value === 'object') {
                    try {
                      displayValue = JSON.stringify(value);
                    } catch (e) {
                      displayValue = 'Objet complexe';
                    }
                  }
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#4caf50', mb: 0.5 }}>{key}</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#FFFFFF' }}>{displayValue.toString()}</Typography>
                      </Box>
                    </Grid>
                  );
                }
                return null;
              })}
            </Grid>
          </DialogContent>
        )}
        <DialogActions sx={{ backgroundColor: '#000000', p: 2, justifyContent: 'center' }}>
          <Button 
            onClick={handleDetailClose} 
            variant="contained" 
            color="primary"
            sx={{ 
              backgroundColor: '#4caf50', 
              color: '#ffffff',
              '&:hover': { backgroundColor: '#3d8b40' },
              px: 4
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#000', color: '#FFD700' }}>
          {"Confirmer la suppression"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#000', color: 'white', pt: 2 }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#000', p: 2 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#FFD700' }}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue pour afficher les photos en plein écran */}
      <Dialog
        open={photoModalOpen}
        onClose={handlePhotoModalClose}
        maxWidth="lg"
        PaperProps={{ 
          sx: { 
            borderRadius: 2, 
            bgcolor: 'black',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#000', color: '#FFD700' }}>
          {"Photo du véhicule"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#000', color: 'white', pt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Box
            component="img"
            src={selectedPhoto}
            alt="Photo du véhicule"
            sx={{
              maxWidth: '90%',
              maxHeight: '70vh',
              objectFit: 'contain',
            }}
            onError={(e) => {
              // Essayer avec d'autres extensions si l'image ne se charge pas
              const currentSrc = e.target.src;
              const baseUrl = currentSrc.split('?')[0]; // Enlever les paramètres de requête
              
              // Vérifier si l'URL contient déjà une extension
              if (!baseUrl.match(/\.(jpg|jpeg|png)$/i)) {
                // Essayer d'abord avec .jpg
                e.target.src = `${baseUrl}.jpg${currentSrc.includes('?') ? currentSrc.substring(currentSrc.indexOf('?')) : ''}`;
              } else if (baseUrl.endsWith('.jpg')) {
                e.target.src = baseUrl.replace('.jpg', '.png') + (currentSrc.includes('?') ? currentSrc.substring(currentSrc.indexOf('?')) : '');
              } else if (baseUrl.endsWith('.png')) {
                e.target.src = baseUrl.replace('.png', '.jpeg') + (currentSrc.includes('?') ? currentSrc.substring(currentSrc.indexOf('?')) : '');
              } else if (baseUrl.endsWith('.jpeg')) {
                // Si toutes les extensions échouent, utiliser l'avatar générique
                const vehicleName = currentSrc.split('/').pop().split('.')[0];
                e.target.src = `https://ui-avatars.com/api/?name=${vehicleName}&background=FFD700&color=000&size=250`;
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#000', p: 2 }}>
          <Button onClick={handlePhotoModalClose} sx={{ color: '#FFD700' }}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Vehicles;
