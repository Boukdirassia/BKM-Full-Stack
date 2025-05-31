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
  IconButton,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import CakeIcon from '@mui/icons-material/Cake';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import AdminTabs from '../../../components/Admin/Navigation/AdminTabs';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
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
        Password: 'password123', // Pour simplifier, à remplacer par un système plus sécurisé
        Roles: 'Client'
      };
      
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
      setLoading(false);
      throw error;
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    // Préremplir le formulaire avec les données du client
    const clientData = { ...client };
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

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      setClients(prev => prev.filter(item => item.id !== confirmDeleteId));
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
        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table sx={{
            minWidth: 650,
            '& .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: 'action.hover' },
            '& .MuiTableRow-root:hover': { backgroundColor: 'grey.200' },
          }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Civilité</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Nom Complet</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>CIN/Passport</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Date Naissance</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Num Permis</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Date Délivrance Permis</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Adresse</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'primary.main', color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.civilite}</TableCell>
                    <TableCell>{client.nom_complet}</TableCell>
                    <TableCell>{client.telephone}</TableCell>
                    <TableCell>{client.cin_passport}</TableCell>
                    <TableCell>{client.dateNaissance}</TableCell>
                    <TableCell>{client.numPermis}</TableCell>
                    <TableCell>{client.dateDelivrancePermis}</TableCell>
                    <TableCell>{client.adresse}</TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" size="small" onClick={() => handleEdit(client)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton color="error" size="small" onClick={() => handleDeleteClick(client.id)}><DeleteIcon fontSize="small" /></IconButton>
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
    </ReservationClientLayout>
  );
};

export default Clients;
