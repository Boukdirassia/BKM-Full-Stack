import { useEffect, useState } from 'react';
import {
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
  Container,
  TextField,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
  TablePagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { utilisateurService } from '../../../services';

const Assistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [open, setOpen] = useState(false);
  const [newAssistant, setNewAssistant] = useState({ Nom: '', Prenom: '', Email: '', Password: '', Telephone: '', Roles: 'Assistant' });
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setErrors({});
    if (editingAssistant) {
      setEditingAssistant(null);
      setNewAssistant({ Nom: '', Prenom: '', Email: '', Password: '', Telephone: '', Roles: 'Assistant' });
    }
  };
  
  const handleChange = (e) => setNewAssistant({ ...newAssistant, [e.target.name]: e.target.value });
  
  const handleSave = async () => {
    // Validation des champs
    const newErrors = {};
    if (!newAssistant.Nom.trim()) newErrors.Nom = "Le nom est obligatoire";
    if (!newAssistant.Prenom.trim()) newErrors.Prenom = "Le prénom est obligatoire";
    if (!newAssistant.Email.trim()) newErrors.Email = "L'email est obligatoire";
    if (!newAssistant.Password.trim() && !editingAssistant) newErrors.Password = "Le mot de passe est obligatoire";
    if (!newAssistant.Telephone.trim()) newErrors.Telephone = "Le téléphone est obligatoire";
    
    // Vérifier si des erreurs existent
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Si pas d'erreurs, procéder à l'enregistrement
      if (editingAssistant) {
        // Mise à jour d'un assistant existant
        const assistantData = {};
        
        // N'ajouter que les champs non vides
        assistantData.Nom = newAssistant.Nom.trim();
        assistantData.Prenom = newAssistant.Prenom.trim();
        assistantData.Email = newAssistant.Email.trim();
        assistantData.Telephone = newAssistant.Telephone.trim();
        assistantData.Roles = newAssistant.Roles;
        
        // Ne pas envoyer le mot de passe s'il est vide (conserver le mot de passe actuel)
        if (newAssistant.Password && newAssistant.Password.trim() !== '') {
          assistantData.Password = newAssistant.Password.trim();
        }
        
        await utilisateurService.updateUtilisateur(editingAssistant.UserID, assistantData);
        setSnackbar({ open: true, message: 'Assistant mis à jour avec succès', severity: 'success' });
        
        // Mettre à jour l'état local
        fetchAssistants();
      } else {
        // Ajout d'un nouvel assistant
        await utilisateurService.createUtilisateur(newAssistant);
        setSnackbar({ open: true, message: 'Assistant ajouté avec succès', severity: 'success' });
        
        // Mettre à jour l'état local
        fetchAssistants();
      }
      
      // Réinitialiser le formulaire après enregistrement
      setNewAssistant({ Nom: '', Prenom: '', Email: '', Password: '', Telephone: '', Roles: 'Assistant' });
      setErrors({});
      handleClose();
    } catch (error) {
      // Erreur gérée par les notifications UI
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assistant) => {
    setEditingAssistant(assistant);
    setNewAssistant({
      Nom: assistant.Nom,
      Prenom: assistant.Prenom,
      Email: assistant.Email,
      Password: '', // Ne pas afficher le mot de passe actuel pour des raisons de sécurité
      Telephone: assistant.Telephone,
      Roles: assistant.Roles
    });
    setOpen(true);
  };
  
  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setOpenDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      setLoading(true);
      try {
        await utilisateurService.deleteUtilisateur(confirmDeleteId);
        setSnackbar({ open: true, message: 'Assistant supprimé avec succès', severity: 'success' });
        
        // Mettre à jour l'état local
        fetchAssistants();
      } catch (error) {
        // Erreur gérée par les notifications UI
        setSnackbar({ 
          open: true, 
          message: error.response?.data?.message || 'Une erreur est survenue lors de la suppression', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
        setOpenDeleteDialog(false);
        setConfirmDeleteId(null);
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
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Gestionnaires d'événements pour la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filtrer les assistants en fonction du terme de recherche
  const filteredAssistants = assistants.filter(assistant => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      assistant.Nom.toLowerCase().includes(searchTermLower) ||
      assistant.Prenom.toLowerCase().includes(searchTermLower) ||
      assistant.Email.toLowerCase().includes(searchTermLower) ||
      assistant.Telephone.toLowerCase().includes(searchTermLower)
    );
  });
  
  // Appliquer la pagination aux assistants filtrés
  const paginatedAssistants = filteredAssistants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Fonction pour récupérer les assistants depuis l'API
  const fetchAssistants = async () => {
    setLoading(true);
    try {
      const response = await utilisateurService.getAllUtilisateurs();
      // Filtrer pour ne garder que les utilisateurs avec le rôle "Assistant"
      const assistantsData = response.filter(user => user.Roles === 'Assistant');
      
      // Trier les assistants par ordre décroissant d'ID (les derniers ajoutés en premier)
      const sortedAssistants = [...assistantsData].sort((a, b) => b.UserID - a.UserID);
      
      setAssistants(sortedAssistants);
    } catch (error) {
      // Erreur gérée par les notifications UI
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors de la récupération des assistants', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Récupérer les données depuis l'API
    fetchAssistants();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Gestion des assistants
          </Typography>
          <Button onClick={handleOpen} variant="contained" color="primary" startIcon={<AddIcon />}>
            Ajouter un assistant
          </Button>
        </Box>

        <TextField
          variant="outlined"
          placeholder="Rechercher un assistant"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, width: 300 }}
        />

        {loading && !open && !openDeleteDialog && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {(!loading || open || openDeleteDialog) && (
          <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
            <TableContainer sx={{ borderRadius: 2, overflow: 'auto', maxWidth: '100%' }}>
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
                    <TableCell width="40px" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>N°</TableCell>
                    <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Nom</TableCell>
                    <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Prénom</TableCell>
                    <TableCell width="180px" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Email</TableCell>
                    <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Telephone</TableCell>
                    <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Role</TableCell>
                    <TableCell width="120px" align="center" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: '#FFFFFF', position: 'sticky', right: 0, zIndex: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAssistants.length > 0 ? (
                    paginatedAssistants.map((assistant, index) => (
                      <TableRow key={assistant.UserID}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{assistant.Nom}</TableCell>
                        <TableCell>{assistant.Prenom}</TableCell>
                        <TableCell>{assistant.Email}</TableCell>
                        <TableCell>{assistant.Telephone}</TableCell>
                        <TableCell>{assistant.Roles}</TableCell>
                        <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <IconButton 
                              onClick={() => handleEdit(assistant)}
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
                              onClick={() => handleDeleteClick(assistant.UserID)}
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
                      <TableCell colSpan={7} align="center">
                        {searchTerm ? "Aucun assistant ne correspond à votre recherche" : "Aucun assistant trouvé"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredAssistants.length}
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
        )}

        {/* Dialogue d'ajout/modification d'assistant */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          fullWidth 
          maxWidth="xs" 
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)'
            }
          }}
          PaperProps={{ 
            sx: { 
              borderRadius: 3,
              width: '500px',
              maxWidth: '95vw',
              margin: 'auto',
              backgroundColor: '#000000',
              overflow: 'hidden'
            } 
          }}
        >
          <DialogTitle 
            sx={{ 
              backgroundColor: '#FFD700', 
              color: '#000000', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 3,
              fontSize: '1.3rem'
            }}
          >
            <PersonIcon /> {editingAssistant ? 'Modifier un assistant' : 'Ajouter un assistant'}
          </DialogTitle>
          
          <DialogContent 
            sx={{ 
              px: 4, 
              py: 4, 
              backgroundColor: '#000000',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#FFD700' }} /> Nom
              </Typography>
              <TextField
                name="Nom"
                fullWidth
                variant="outlined"
                value={newAssistant.Nom}
                onChange={handleChange}
                error={!!errors.Nom}
                helperText={errors.Nom}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#222222',
                    color: 'white',
                    '& fieldset': { borderColor: '#444444' },
                    '&:hover fieldset': { borderColor: '#FFD700' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#f44336',
                    marginLeft: 0
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ color: '#FFD700' }} /> Prénom
              </Typography>
              <TextField
                name="Prenom"
                fullWidth
                variant="outlined"
                value={newAssistant.Prenom}
                onChange={handleChange}
                error={!!errors.Prenom}
                helperText={errors.Prenom}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#222222',
                    color: 'white',
                    '& fieldset': { borderColor: '#444444' },
                    '&:hover fieldset': { borderColor: '#FFD700' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#f44336',
                    marginLeft: 0
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#FFD700' }} /> Email
              </Typography>
              <TextField
                name="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={newAssistant.Email}
                onChange={handleChange}
                error={!!errors.Email}
                helperText={errors.Email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#222222',
                    color: 'white',
                    '& fieldset': { borderColor: '#444444' },
                    '&:hover fieldset': { borderColor: '#FFD700' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#f44336',
                    marginLeft: 0
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ color: '#FFD700' }} /> Mot de passe
                {editingAssistant && <Typography variant="caption" sx={{ color: 'gray' }}>(Laisser vide pour conserver l'actuel)</Typography>}
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  name="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  variant="outlined"
                  value={newAssistant.Password}
                  onChange={handleChange}
                  error={!!errors.Password}
                  helperText={errors.Password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? 
                            <VisibilityOffIcon sx={{ color: '#FFD700' }} /> : 
                            <VisibilityIcon sx={{ color: '#FFD700' }} />
                          }
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#222222',
                      color: 'white',
                      '& fieldset': { borderColor: '#444444' },
                      '&:hover fieldset': { borderColor: '#FFD700' },
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                      '& .MuiInputAdornment-root:not(:last-child)': { display: 'none' }
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#f44336',
                      marginLeft: 0
                    }
                  }}
                />
              </Box>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: '#FFD700' }} /> Telephone
              </Typography>
              <TextField
                name="Telephone"
                fullWidth
                variant="outlined"
                value={newAssistant.Telephone}
                onChange={handleChange}
                error={!!errors.Telephone}
                helperText={errors.Telephone}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#222222',
                    color: 'white',
                    '& fieldset': { borderColor: '#444444' },
                    '&:hover fieldset': { borderColor: '#FFD700' },
                    '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#f44336',
                    marginLeft: 0
                  }
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon sx={{ color: '#FFD700' }} /> Role
              </Typography>
              <FormControl fullWidth variant="outlined">
                <Select
                  name="Roles"
                  value={newAssistant.Roles}
                  onChange={handleChange}
                  sx={{ 
                    backgroundColor: '#222222', 
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#444444' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FFD700' },
                    '& .MuiSvgIcon-root': { color: '#FFD700' },
                    '& .MuiSelect-select': { backgroundColor: '#222222' }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: { 
                        backgroundColor: '#000000',
                        color: 'white',
                        '& .MuiMenuItem-root': { 
                          '&:hover': { backgroundColor: '#333333' },
                          '&.Mui-selected': { backgroundColor: '#444444' },
                          '&.Mui-selected:hover': { backgroundColor: '#555555' }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="Assistant" sx={{ color: '#FFD700' }}>Assistant</MenuItem>
                  <MenuItem value="admin" sx={{ color: '#FFD700' }}>Administrateur</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            backgroundColor: '#000000', 
            borderTop: '1px solid #333333',
            px: 4, 
            py: 3 
          }}>
            <Button 
              onClick={handleClose} 
              sx={{ 
                color: '#FFD700',
                '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.08)' }
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={loading}
              sx={{ 
                backgroundColor: '#FFD700', 
                color: '#000000',
                padding: '8px 20px',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#E6C200' }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#000000' }} /> : (editingAssistant ? 'Mettre à jour' : 'Enregistrer')}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Dialogue de confirmation de suppression */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleDeleteCancel}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{ 
            sx: { 
              borderRadius: 2,
              backgroundColor: '#000000',
              overflow: 'hidden'
            } 
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: '#000', color: '#FFD700' }}>
            {"Confirmer la suppression"}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: '#000', color: 'white', pt: 2 }}>
            <Typography>
              Êtes-vous sûr de vouloir supprimer cet assistant ? Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: '#000', p: 2 }}>
            <Button onClick={handleDeleteCancel} sx={{ color: '#FFD700' }}>Annuler</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              variant="contained" 
              color="error" 
              disabled={loading}
              autoFocus
            >
              {loading ? <CircularProgress size={24} /> : 'Supprimer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar pour les notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              backgroundColor: snackbar.severity === 'success' ? '#1E4620' : '#450A0A',
              color: 'white',
              '& .MuiAlert-icon': {
                color: snackbar.severity === 'success' ? '#4CAF50' : '#F44336'
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Assistants;
