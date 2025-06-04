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
  TextField,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReservationClientLayout from '../Shared/ReservationClientLayout';
import { clientService } from '../../../services';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ 
    civilite: '', 
    nom_complet: '',
    telephone: '',
    cin_passport: '', 
    dateNaissance: '', 
    numPermis: '', 
    dateDelivrancePermis: '',
    adresse: '' 
  });
  const [editingClient, setEditingClient] = useState(null);
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
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChange = (e) => setNewClient({ ...newClient, [e.target.name]: e.target.value });

  const handleSave = (clientData) => {
    const newErrors = {};
    if (!clientData.civilite.trim()) newErrors.civilite = "La civilité est obligatoire";
    if (!clientData.nom_complet.trim()) newErrors.nom_complet = "Le nom complet est obligatoire";
    if (!clientData.telephone.trim()) newErrors.telephone = "Le numéro de téléphone est obligatoire";
    if (!clientData.cin_passport.trim()) newErrors.cin_passport = "CIN/Passport est obligatoire";
    if (!clientData.dateNaissance.trim()) newErrors.dateNaissance = "La date de naissance est obligatoire";
    if (!clientData.numPermis.trim()) newErrors.numPermis = "Le numéro de permis est obligatoire";
    if (!clientData.dateDelivrancePermis.trim()) newErrors.dateDelivrancePermis = "La date de délivrance du permis est obligatoire";
    if (!clientData.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire";
    
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      return; 
    }
    
    if (editingClient) {
      // Mise à jour d'un client existant
      setClients(prev => prev.map(item => 
        item.id === editingClient.id ? { ...clientData, id: item.id } : item
      ));
      setEditingClient(null);
    } else {
      // Ajout d'un nouveau client
      setClients(prev => [...prev, { ...clientData, id: prev.length + 1 }]);
    }
    setNewClient({ 
      civilite: '', 
      nom_complet: '',
      telephone: '',
      cin_passport: '', 
      dateNaissance: '', 
      numPermis: '', 
      dateDelivrancePermis: '',
      adresse: '' 
    });
    setErrors({});
  };

  const handleAddOrEditClient = async (clientData) => {
    // Validation...
    const errors = {};
    
    if (!clientData.civilite) errors.civilite = 'La civilité est requise';
    if (!clientData.nom_complet) errors.nom_complet = 'Le nom complet est requis';
    if (!clientData.telephone) errors.telephone = 'Le téléphone est requis';
    if (!clientData.cin_passport) errors.cin_passport = 'Le CIN/Passport est requis';
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return null;
    }
    
    try {
      // Préparation des données pour l'API
      // Séparer le nom complet en prénom et nom
      const nameParts = clientData.nom_complet.split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';
      
      // Préparer les données utilisateur
      const userData = {
        Prenom: prenom,
        Nom: nom,
        Telephone: clientData.telephone,
        Email: clientData.email || `${prenom.toLowerCase()}.${nom.toLowerCase()}@example.com`,
        Roles: 'Client'
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      // Pour une nouvelle création, utiliser un mot de passe par défaut
      // Pour une modification, n'inclure le mot de passe que s'il est fourni et non vide
      if (editingClient) {
        // Modification : n'inclure le mot de passe que s'il est fourni et non vide
        if (clientData.password && clientData.password.trim() !== '') {
          userData.Password = clientData.password;
        }
      } else {
        // Création : utiliser le mot de passe fourni ou un mot de passe par défaut
        userData.Password = (clientData.password && clientData.password.trim() !== '') ? clientData.password : 'password123';
      }
      
      // Préparer les données client
      const apiClientData = {
        Civilité: clientData.civilite,
        CIN_Passport: clientData.cin_passport,
        DateNaissance: clientData.dateNaissance,
        NumPermis: clientData.numPermis,
        DateDelivrancePermis: clientData.dateDelivrancePermis,
        Adresse: clientData.adresse,
        utilisateur: userData // Envoyer les données utilisateur en même temps
      };
      
      setLoading(true);
      
      let response;
      if (editingClient) {
        // Mise à jour d'un client existant
        response = await clientService.updateClient(editingClient.id, apiClientData);
        console.log('Client mis à jour:', response);
        
        // Mettre à jour le state local
        setClients(prev => prev.map(client => 
          client.id === editingClient.id ? { ...client, ...clientData } : client
        ));
        
        // Afficher un message de succès
        setSnackbar({
          open: true,
          message: 'Client modifié avec succès',
          severity: 'success'
        });
      } else {
        // Ajout d'un nouveau client
        response = await clientService.createClient(apiClientData);
        console.log('Nouveau client créé:', response);
        
        // Ajouter le nouveau client au state local avec l'ID retourné par l'API
        const newClientWithId = { 
          ...clientData,
          id: response.UserID || response.id
        };
        setClients(prev => [...prev, newClientWithId]);
        
        // Afficher un message de succès
        setSnackbar({
          open: true,
          message: 'Client ajouté avec succès',
          severity: 'success'
        });
      }
      
      // Ne pas réinitialiser le formulaire si c'est en mode combiné
      if (!clientData.fromCombinedMode) {
        setNewClient({ 
          civilite: '', 
          nom_complet: '',
          telephone: '',
          cin_passport: '', 
          dateNaissance: '', 
          numPermis: '', 
          dateDelivrancePermis: '',
          adresse: '',
          email: ''
        });
        setEditingClient(null);
        setErrors({});
        
        // Actualiser la liste des clients
        fetchClients();
      }
      
      setLoading(false);
      return response;
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification du client:', error);
      setErrors({ submit: 'Une erreur est survenue. Veuillez réessayer.' });
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'ajout/modification du client',
        severity: 'error'
      });
      setLoading(false);
      throw error;
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    
    // Convertir les dates du format local (DD/MM/YYYY) au format ISO (YYYY-MM-DD) pour l'édition
    const convertLocalDateToISO = (localDate) => {
      if (!localDate) return '';
      
      // Extraire les parties de la date (jour, mois, année)
      const parts = localDate.split('/');
      if (parts.length !== 3) return localDate; // Si le format n'est pas celui attendu, retourner tel quel
      
      // Réorganiser au format YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };
    
    // Préremplir le formulaire avec les données du client
    const clientData = { 
      ...client,
      dateNaissance: convertLocalDateToISO(client.dateNaissance),
      dateDelivrancePermis: convertLocalDateToISO(client.dateDelivrancePermis)
    };
    
    console.log('Données client pour édition:', clientData);
    
    // Ouvrir le dialogue d'ajout/édition avec les données préremplies
    const event = new CustomEvent('edit-client', { detail: clientData });
    document.dispatchEvent(event);
    
    // Déclencher l'ouverture du dialogue de réservation/client
    const dialogOpenEvent = new CustomEvent('open-reservation-client-dialog');
    document.dispatchEvent(dialogOpenEvent);
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      try {
        setLoading(true);
        // Appel à l'API pour supprimer le client
        await clientService.deleteClient(confirmDeleteId);
        
        // Mise à jour de l'état local après la suppression réussie
        setClients(prev => prev.filter(item => item.id !== confirmDeleteId));
        
        // Afficher un message de succès
        setSnackbar({
          open: true,
          message: 'Client supprimé avec succès',
          severity: 'success'
        });
        
        // Fermer la boîte de dialogue de confirmation
        setOpenDeleteDialog(false);
        setConfirmDeleteId(null);
        
        // Actualiser la liste des clients depuis le serveur
        fetchClients();
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors de la suppression du client',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setConfirmDeleteId(null);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  // Filtrer les clients en fonction du terme de recherche
  const filteredClients = clients.filter(client => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      // Convertir en chaîne et vérifier que les propriétés existent
      (client.civilite && String(client.civilite).toLowerCase().includes(searchTermLower)) ||
      (client.nom_complet && String(client.nom_complet).toLowerCase().includes(searchTermLower)) ||
      (client.telephone && String(client.telephone).toLowerCase().includes(searchTermLower)) ||
      (client.cin_passport && String(client.cin_passport).toLowerCase().includes(searchTermLower)) ||
      (client.adresse && String(client.adresse).toLowerCase().includes(searchTermLower))
    );
  });
  
  // Appliquer la pagination aux clients filtrés
  const paginatedClients = filteredClients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const fetchClients = async () => {
    try {
      setLoading(true);
      console.log('Récupération des clients depuis l\'API...');
      const data = await clientService.getAllClients();
      
      console.log('Clients récupérés depuis l\'API:', data);
      
      // Si aucune donnée n'est retournée, afficher un message
      if (!data || data.length === 0) {
        console.log('Aucun client trouvé dans la base de données');
        setClients([]);
        setLoading(false);
        return;
      }
      
      // Transformation des données reçues de l'API pour correspondre à l'interface
      const formattedClients = data.map(client => {
        // Vérifier que client est un objet valide
        if (!client) return null;
        
        return {
          id: client.UserID,
          civilite: client.Civilité || '',
          nom_complet: `${client.Prenom || ''} ${client.Nom || ''}`.trim() || 'Client sans nom',
          telephone: client.Telephone || '',
          cin_passport: client.CIN_Passport || '',
          dateNaissance: client.DateNaissance ? new Date(client.DateNaissance).toLocaleDateString() : '',
          numPermis: client.NumPermis || '',
          dateDelivrancePermis: client.DateDelivrancePermis ? new Date(client.DateDelivrancePermis).toLocaleDateString() : '',
          adresse: client.Adresse || '',
          email: client.Email || ''
        };
      }).filter(client => client !== null); // Filtrer les clients null
      
      console.log('Données clients formatées pour l\'affichage:', formattedClients);
      
      // Trier les clients par ordre décroissant d'ID (les derniers ajoutés en premier)
      const sortedClients = [...formattedClients].sort((a, b) => b.id - a.id);
      
      setClients(sortedClients);
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    
    // Écouter l'événement de rafraîchissement après un ajout combiné
    const handleRefreshAfterCombinedSave = () => {
      console.log('Actualisation des données clients après un ajout combiné');
      fetchClients();
    };
    
    document.addEventListener('refresh-data-after-combined-save', handleRefreshAfterCombinedSave);
    
    return () => {
      document.removeEventListener('refresh-data-after-combined-save', handleRefreshAfterCombinedSave);
    };
  }, []);

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  return (
    <ReservationClientLayout onAddReservation={() => window.location.href = '/admin/reservations'} onAddClient={(clientData) => {
      // Ajouter directement le client sans ouvrir un nouveau dialogue
      return handleAddOrEditClient(clientData);
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gestion des clients</Typography>
      </Box>

      <TextField
        variant="outlined"
        placeholder="Rechercher un client"
        size="small"
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        sx={{ mb: 3, width: 300 }}
      />

      <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <Box sx={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <TableContainer sx={{ borderRadius: 2, maxWidth: '100%', overflowX: 'auto' }}>
            <Table sx={{
              minWidth: 650,
              tableLayout: 'fixed',
              '& .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: 'action.hover' },
              '& .MuiTableRow-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
              '& .MuiTableCell-root': { padding: '16px 8px', borderSpacing: '2px' },
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
            }}>
            <TableHead>
              <TableRow>
                <TableCell width="80px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>Civilité</TableCell>
                <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Nom Complet</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Téléphone</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>CIN/Passport</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Date Naissance</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Num Permis</TableCell>
                <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Date Délivrance</TableCell>
                <TableCell width="150px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Adresse</TableCell>
                <TableCell width="120px" align="center" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: '#FFFFFF', position: 'sticky', right: 0, zIndex: 2, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client, index) => (
                  <TableRow key={client.id} sx={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}>
                    <TableCell sx={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>{client.civilite}</TableCell>
                    <TableCell>{client.nom_complet}</TableCell>
                    <TableCell>{client.telephone}</TableCell>
                    <TableCell>{client.cin_passport}</TableCell>
                    <TableCell>{client.dateNaissance}</TableCell>
                    <TableCell>{client.numPermis}</TableCell>
                    <TableCell>{client.dateDelivrancePermis}</TableCell>
                    <TableCell>{client.adresse}</TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEdit(client)}
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
                          onClick={() => handleDeleteClick(client.id)}
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
                  <TableCell colSpan={10} align="center">
                    {searchTerm ? "Aucun client ne correspond à votre recherche" : "Aucun client trouvé"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </TableContainer>
        </Box>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredClients.length}
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
            Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#000', p: 2 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#FFD700' }}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Notification Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            backgroundColor: snackbar.severity === 'success' ? '#000' : undefined,
            color: snackbar.severity === 'success' ? '#FFD700' : undefined,
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#FFD700' : undefined
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ReservationClientLayout>
  );
};

export default Clients;
