import { useEffect, useState } from 'react';
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
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  TablePagination,
  Slide
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { extraService } from '../../../services';
import AdminTabs from '../../../components/Admin/Navigation/AdminTabs';

const Extras = () => {
  const [extras, setExtras] = useState([]);
  const [open, setOpen] = useState(false);
  const [newExtra, setNewExtra] = useState({ 
    Nom: '', 
    Description: '', 
    Prix: '' 
  });
  const [editingExtra, setEditingExtra] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // État pour le filtrage par période
  const [periodFilter, setPeriodFilter] = useState('all');
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = () => setOpen(true);
  const handleClose = () => { setOpen(false); setErrors({}); };
  const handleChange = (e) => setNewExtra({ ...newExtra, [e.target.name]: e.target.value });

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const fetchExtras = async () => {
    try {
      setLoading(true);
      const data = await extraService.getAllExtras();
      console.log('Extras récupérés:', data);
      
      // Trier les extras par ordre décroissant d'ID (les derniers ajoutés en premier)
      const sortedExtras = [...data].sort((a, b) => b.ExtraID - a.ExtraID);
      
      setExtras(sortedExtras);
    } catch (error) {
      console.error('Erreur lors de la récupération des extras:', error);
      showSnackbar('Erreur lors de la récupération des extras', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!newExtra.Nom || !newExtra.Nom.trim()) newErrors.Nom = "Le nom est obligatoire";
    if (!newExtra.Description || !newExtra.Description.trim()) newErrors.Description = "La description est obligatoire";
    if (!newExtra.Prix) newErrors.Prix = "Le prix est obligatoire";
    if (newExtra.Prix && isNaN(Number(newExtra.Prix))) newErrors.Prix = "Le prix doit être un nombre";
    
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      return; 
    }
    
    try {
      setLoading(true);
      
      if (editingExtra) {
        // Mise à jour d'un extra existant
        await extraService.updateExtra(editingExtra.ExtraID, newExtra);
        showSnackbar('Extra mis à jour avec succès');
      } else {
        // Ajout d'un nouvel extra
        await extraService.createExtra(newExtra);
        showSnackbar('Extra ajouté avec succès');
      }
      
      // Réinitialiser le formulaire et récupérer les extras mis à jour
      setNewExtra({ 
        Nom: '', 
        Description: '', 
        Prix: '' 
      });
      setErrors({});
      handleClose();
      fetchExtras();
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'extra:', error);
      showSnackbar('Erreur lors de l\'enregistrement de l\'extra', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (extra) => {
    setEditingExtra(extra);
    setNewExtra({
      Nom: extra.Nom,
      Description: extra.Description,
      Prix: extra.Prix
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
        setLoading(true);
        await extraService.deleteExtra(confirmDeleteId);
        setOpenDeleteDialog(false);
        setConfirmDeleteId(null);
        showSnackbar('Extra supprimé avec succès');
        fetchExtras();
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'extra:', error);
        showSnackbar('Erreur lors de la suppression de l\'extra', 'error');
      } finally {
        setLoading(false);
      }
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
  
  // Gestionnaires d'événements pour la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filtrer les extras en fonction du terme de recherche
  // Utiliser la variable d'état filteredExtras au lieu de déclarer une nouvelle constante
  const extrasFiltered = extras.filter(extra => 
    (extra.Nom && extra.Nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (extra.Description && extra.Description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (extra.Prix && extra.Prix.toString().includes(searchTerm))
  );
  
  // Appliquer la pagination aux extras filtrés
  const paginatedExtras = extrasFiltered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    fetchExtras();
  }, []);

  // Définition des tabs pour la navigation
  const tabs = [
    { label: 'Extras', path: 'extras', icon: <AddShoppingCartIcon /> }
  ];

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading && extras.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Tabs de navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <AdminTabs tabs={tabs} />
        <Button onClick={handleOpen} variant="contained" color="primary" startIcon={<AddIcon />}>
          Ajouter un extra
        </Button>
      </Box>

      {/* Titre de la page */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        Gestion des extras
      </Typography>

      <TextField
        variant="outlined"
        placeholder="Rechercher un extra"
        size="small"
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        sx={{ mb: 3, width: 300 }}
      />

      <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <TableContainer sx={{ borderRadius: 2, overflow: 'auto', maxWidth: '100%' }}>
          <Table sx={{
            minWidth: 650,
            tableLayout: 'fixed',
            '& .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: 'action.hover' },
            '& .MuiTableRow-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
            '& .MuiTableCell-root': { padding: '16px 8px', borderSpacing: '2px' },
            borderCollapse: 'separate',
            borderSpacing: '0 8px',
            width: '100%'
          }}>
            <TableHead>
              <TableRow>
                <TableCell width="25%" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>Nom</TableCell>
                <TableCell width="50%" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Description</TableCell>
                <TableCell width="15%" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', textAlign: 'center' }}>Prix (DH/jour)</TableCell>
                <TableCell width="10%" align="center" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: '#FFFFFF', position: 'sticky', right: 0, zIndex: 2, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExtras.length > 0 ? (
                paginatedExtras.map((extra, index) => (
                  <TableRow key={extra.ExtraID} sx={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}>
                    <TableCell sx={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4, fontWeight: 'medium' }}>{extra.Nom}</TableCell>
                    <TableCell>{extra.Description}</TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>{extra.Prix} DH/jour</TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEdit(extra)}
                          size="small"
                          disabled={loading}
                          sx={{ 
                            p: 0,
                            '&:hover': { 
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Avatar sx={{ 
                            width: 30, 
                            height: 30, 
                            bgcolor: loading ? 'rgba(255, 215, 0, 0.5)' : '#FFD700'
                          }}>
                            <EditIcon fontSize="small" sx={{ color: loading ? 'rgba(0, 0, 0, 0.5)' : '#000' }} />
                          </Avatar>
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteClick(extra.ExtraID)}
                          size="small"
                          disabled={loading}
                          sx={{ 
                            p: 0,
                            '&:hover': { 
                              transform: 'scale(1.1)'
                            }
                          }}
                        >
                          <Avatar sx={{ 
                            width: 30, 
                            height: 30, 
                            bgcolor: loading ? 'rgba(255, 68, 68, 0.5)' : '#ff4444'
                          }}>
                            <DeleteIcon fontSize="small" sx={{ color: '#FFF' }} />
                          </Avatar>
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {searchTerm ? "Aucun extra ne correspond à votre recherche" : "Aucun extra trouvé"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={extrasFiltered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      {/* Dialogue d'ajout/modification d'extra */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' } }}
        PaperProps={{ sx: { borderRadius: 3, width: '500px', maxWidth: '95vw', margin: 'auto', backgroundColor: '#000000', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ backgroundColor: '#FFD700', color: '#000000', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 3, fontSize: '1.3rem' }}>
          <AddShoppingCartIcon /> {editingExtra ? 'Modifier un extra' : 'Ajouter un extra'}
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 4, backgroundColor: '#000000', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.Nom}>
                <TextField
                  name="Nom"
                  label="Nom de l'extra"
                  variant="outlined"
                  value={newExtra.Nom}
                  onChange={handleChange}
                  error={!!errors.Nom}
                  helperText={errors.Nom}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddShoppingCartIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    },
                    '& .MuiInputLabel-root': { color: '#FFF' },
                    '& .MuiInputBase-input': { color: '#FFF' },
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.Description}>
                <TextField
                  name="Description"
                  label="Description"
                  variant="outlined"
                  value={newExtra.Description}
                  onChange={handleChange}
                  error={!!errors.Description}
                  helperText={errors.Description}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    },
                    '& .MuiInputLabel-root': { color: '#FFF' },
                    '& .MuiInputBase-input': { color: '#FFF' },
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.Prix}>
                <TextField
                  name="Prix"
                  label="Prix en DH"
                  variant="outlined"
                  value={newExtra.Prix}
                  onChange={handleChange}
                  error={!!errors.Prix}
                  helperText={errors.Prix}
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonetizationOnIcon sx={{ color: '#FFD700' }} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 0 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                    },
                    '& .MuiInputLabel-root': { color: '#FFF' },
                    '& .MuiInputBase-input': { color: '#FFF' },
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, py: 3, backgroundColor: '#000000', borderTop: '1px solid #333' }}>
          <Button 
            onClick={handleClose} 
            sx={{ color: '#FFD700', borderColor: '#FFD700', '&:hover': { borderColor: '#FFF', color: '#FFF' } }}
            variant="outlined"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {editingExtra ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' } }}
        PaperProps={{ sx: { borderRadius: 3, backgroundColor: '#000000' } }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#000', color: '#FFD700', borderBottom: '1px solid #333' }}>
          {"Confirmer la suppression"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#000', color: 'white', pt: 2, mt: 1 }}>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet extra ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#000', p: 2, borderTop: '1px solid #333' }}>
          <Button 
            onClick={handleDeleteCancel} 
            sx={{ color: '#FFD700', borderColor: '#FFD700', '&:hover': { borderColor: '#FFF', color: '#FFF' } }}
            variant="outlined"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error" 
            autoFocus
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          icon={snackbar.severity === 'success' ? <CheckCircleOutlineIcon /> : undefined}
          sx={{
            width: '100%',
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
              alignItems: 'center',
              display: 'flex'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem',
              fontWeight: 500
            },
            ...(snackbar.severity === 'success' && {
              backgroundColor: '#000',
              color: '#fff'
            })
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Extras;
