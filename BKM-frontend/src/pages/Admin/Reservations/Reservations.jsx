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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Avatar,
  CircularProgress,
  TablePagination,
  Snackbar,
  Alert,
  InputBase,
  Slide
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AdminTabs from '../../../components/Admin/Navigation/AdminTabs';
import PersonIcon from '@mui/icons-material/Person';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ReservationClientLayout from '../Shared/ReservationClientLayout';
import '../../../styles/CalendarStyles.css';
import { reservationService, clientService, voitureService, combinedService, extraService } from '../../../services';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [newReservation, setNewReservation] = useState({ client: '', vehicle: '', startDate: '', endDate: '', statut: 'En attente', extra: '', lieuDepart: '', lieuArrivee: '' });
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [extras, setExtras] = useState([]);
  const [errors, setErrors] = useState({});
  
  // État pour le filtrage par période
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  
  // Fonction pour changer le filtre de période
  const handlePeriodFilterChange = (e) => {
    setPeriodFilter(e.target.value);
    setPage(0); // Réinitialiser la pagination lors du changement de filtre
    // Déclencher le filtrage des réservations
    fetchAndFilterReservations();
  };
  
  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // État pour les notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => setNewReservation({ ...newReservation, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (editingReservation) {
      // Utiliser les données de la réservation en cours d'édition
      handleAddOrEditReservation({
        ...newReservation,
        id: editingReservation.id
      });
    } else {
      // Ajouter une nouvelle réservation
      handleAddOrEditReservation(newReservation);
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    
    // Convertir les dates du format local (DD/MM/YYYY) au format ISO (YYYY-MM-DD) pour l'édition
    const convertLocalDateToISO = (localDate) => {
      if (!localDate) return '';
      
      // Extraire les parties de la date (jour, mois, année)
      const parts = localDate.split('/');
      if (parts.length !== 3) return localDate; // Si le format n'est pas celui attendu, retourner tel quel
      
      // Réorganiser au format YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };
    
    // Préremplir le formulaire avec les données de la réservation
    const reservationData = {
      client: reservation.client,
      vehicle: reservation.vehicle,
      startDate: convertLocalDateToISO(reservation.startDate),
      endDate: convertLocalDateToISO(reservation.endDate),
      statut: reservation.statut,
      extra: reservation.extra || '',
      lieuDepart: reservation.lieuDepart || '',
      lieuArrivee: reservation.lieuArrivee || ''
    };
    

    
    // Ouvrir le dialogue d'ajout/édition avec les données préremplies
    const event = new CustomEvent('edit-reservation', { detail: reservationData });
    document.dispatchEvent(event);
    
    // Ouvrir le dialogue
    document.querySelector('button[data-action="add-reservation-client"]')?.click();
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId) {
      try {
        setLoading(true);
        // Appeler l'API pour supprimer la réservation
        await reservationService.deleteReservation(confirmDeleteId);
        // Mettre à jour l'état local
        setReservations(prev => prev.filter(item => item.id !== confirmDeleteId));
        setOpenDeleteDialog(false);
        setConfirmDeleteId(null);
        
        // Afficher la notification moderne
        setNotification({
          open: true,
          message: 'Réservation supprimée avec succès',
          severity: 'success'
        });
      } catch (error) {
        // Erreur gérée via les notifications UI
        // 'Erreur lors de la suppression de la réservation:', error.message);
        
        // Afficher la notification d'erreur
        setNotification({
          open: true,
          message: 'Erreur lors de la suppression de la réservation',
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

  // Nouvelles fonctions pour récupérer les données des clients et véhicules
  const fetchClients = async () => {
    try {
      // Logs de débogage supprimés
      // 'Récupération des clients...');
      const data = await clientService.getAllClients();
      // Logs de débogage supprimés
      // 'Clients récupérés:', data);
      setClients(data);
    } catch (error) {
      // Erreur gérée silencieusement en production
    }
  };

  const fetchVehicles = async () => {
    try {
      // Logs de débogage supprimés
      // 'Récupération des véhicules...');
      const data = await voitureService.getAllVoitures();
      // Logs de débogage supprimés
      // 'Véhicules récupérés:', data);
      setVehicles(data);
    } catch (error) {
      // Erreur gérée silencieusement en production
    }
  };
  
  const fetchExtras = async () => {
    try {
      // Logs de débogage supprimés
      // 'Récupération des extras...');
      const data = await extraService.getAllExtras();
      // Logs de débogage supprimés
      // 'Extras récupérés:', data);
      setExtras(data);
    } catch (error) {
      // Erreur gérée silencieusement en production
    }
  };

  // Fonction pour récupérer les réservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Logs de débogage supprimés
      // 'Récupération des réservations...');
      const data = await reservationService.getAllReservations();
      // Afficher les données brutes pour débogage
      if (data && data.length > 0) {
        console.log('Exemple de réservation brute:', data[0]);
        console.log('LieuDepart:', data[0].LieuDepart);
        console.log('LieuArrivee:', data[0].LieuArrivee);
      }
      
      // Si aucune donnée n'est retournée, afficher un message
      if (!data || data.length === 0) {
        // Logs de débogage supprimés
      // 'Aucune réservation trouvée dans la base de données');
        setReservations([]);
        setLoading(false);
        return;
      }
      
      // Transformation des données reçues de l'API pour correspondre à l'interface
      const formattedReservations = data.map(reservation => {
        // Vérifier que la réservation est un objet valide
        if (!reservation) return null;
        
        // Créer un objet client à partir des données jointes
        const clientName = `${reservation.Prenom || ''} ${reservation.Nom || ''}`.trim() || 'Client inconnu';
        const vehicleName = `${reservation.Marque || ''} ${reservation.Modele || ''} - ${reservation.Immatriculation || ''}`.trim() || 'Véhicule inconnu';
        
        // Conserver les dates originales pour le filtrage et ajouter des versions formatées pour l'affichage
        const startDate = reservation.DateDébut ? new Date(reservation.DateDébut) : null;
        const endDate = reservation.DateFin ? new Date(reservation.DateFin) : null;
        
        return {
          id: reservation.ResID,
          client: reservation.ClientID,
          client_name: clientName,
          vehicle: reservation.VoitureID,
          vehicle_name: vehicleName,
          // Conserver les dates originales pour le filtrage
          startDateRaw: startDate,
          endDateRaw: endDate,
          // Dates formatées pour l'affichage
          startDate: startDate ? startDate.toLocaleDateString() : '',
          endDate: endDate ? endDate.toLocaleDateString() : '',
          statut: reservation.Statut,
          extra: reservation.ExtraID,
          lieuDepart: reservation.LieuDepart,
          lieuArrivee: reservation.LieuArrivee,
          // Ajouter la date de création pour le tri (si disponible)
          createdAt: reservation.DateCreation || null
        };
      }).filter(reservation => reservation !== null); // Filtrer les réservations null
      
      // Trier les réservations par ordre décroissant d'ID (les dernières ajoutées en premier)
      // Utilisation de parseInt pour s'assurer que la comparaison est numérique
      const sortedReservations = [...formattedReservations].sort((a, b) => {
        // Essayer d'abord de trier par date de création si disponible
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Sinon, trier par ID
        const idA = parseInt(a.id);
        const idB = parseInt(b.id);
        return idB - idA; // Ordre décroissant (les derniers ajoutés en premier)
      });
      
      console.log('Réservations triées par ID décroissant:', sortedReservations.map(r => r.id));
      setReservations(sortedReservations);
    } catch (error) {
      // Erreur gérée via notification UI
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction simplifiée pour filtrer les réservations par période
  const filterReservationsByPeriod = (reservations, periodFilter) => {
    // Si aucun filtre n'est sélectionné ou si le filtre est 'all', retourner toutes les réservations
    if (!periodFilter || periodFilter === 'all') {
      // Logs de débogage supprimés
      // 'Aucun filtre de période, affichage de toutes les réservations');
      return reservations;
    }
    
    console.log('Filtrage par période:', periodFilter);
    console.log('Nombre de réservations avant filtrage:', reservations.length);
    
    // Obtenir la date d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculer les dates de référence pour les filtres
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Dimanche
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Filtrer les réservations
    const filtered = reservations.filter(reservation => {
      // Convertir la date de début en objet Date
      // Utiliser directement la date de la réservation au format ISO
      const rawDateStr = reservation.DateDébut || '';
      
      if (!rawDateStr) {
        // Logs de débogage supprimés
      // 'Réservation sans date:', reservation.id);
        return false;
      }
      
      // Convertir en date
      const reservationDate = new Date(rawDateStr);
      
      // Vérifier si la date est valide
      if (isNaN(reservationDate.getTime())) {
        // Logs de débogage supprimés
      // 'Date invalide pour la réservation:', reservation.id, rawDateStr);
        return false;
      }
      
      // Réinitialiser l'heure pour comparer uniquement les dates
      reservationDate.setHours(0, 0, 0, 0);
      
      // Appliquer le filtre approprié
      switch (periodFilter) {
        case 'today':
          return reservationDate.getTime() === today.getTime();
          
        case 'week':
          return reservationDate >= startOfWeek && 
                 reservationDate < new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
          
        case 'month':
          return reservationDate.getMonth() === today.getMonth() && 
                 reservationDate.getFullYear() === today.getFullYear();
          
        case 'future':
          return reservationDate >= today;
          
        case 'past':
          return reservationDate < today;
          
        default:
          return true;
      }
    });
    
    console.log('Nombre de réservations après filtrage:', filtered.length);
    return filtered;
  };

  // Récupérer les données brutes de l'API pour le filtrage par période
  const fetchAndFilterReservations = async () => {
    try {
      setLoading(true);
      // Logs de débogage supprimés
      // 'Récupération des réservations pour filtrage...');
      const data = await reservationService.getAllReservations();
      
      if (!data || data.length === 0) {
        // Logs de débogage supprimés
      // 'Aucune réservation trouvée');
        setReservations([]);
        setLoading(false);
        return;
      }
      
      // Filtrer les réservations par période
      const filteredData = filterReservationsByPeriod(data, periodFilter);
      // Logs de débogage supprimés
      // 'Réservations filtrées par période:', filteredData.length);
      
      // Formater les réservations filtrées
      const formattedReservations = filteredData.map(reservation => {
        if (!reservation) return null;
        
        const clientName = `${reservation.Prenom || ''} ${reservation.Nom || ''}`.trim() || 'Client inconnu';
        const vehicleName = `${reservation.Marque || ''} ${reservation.Modele || ''} - ${reservation.Immatriculation || ''}`.trim() || 'Véhicule inconnu';
        
        const startDate = reservation.DateDébut ? new Date(reservation.DateDébut) : null;
        const endDate = reservation.DateFin ? new Date(reservation.DateFin) : null;
        
        return {
          id: reservation.ResID,
          client: reservation.ClientID,
          client_name: clientName,
          vehicle: reservation.VoitureID,
          vehicle_name: vehicleName,
          startDateRaw: startDate,
          endDateRaw: endDate,
          startDate: startDate ? startDate.toLocaleDateString() : '',
          endDate: endDate ? endDate.toLocaleDateString() : '',
          statut: reservation.Statut,
          extra: reservation.ExtraID,
          lieuDepart: reservation.LieuDepart,
          lieuArrivee: reservation.LieuArrivee
        };
      }).filter(Boolean);
      
      // Trier les réservations par date
      const sortedReservations = formattedReservations.sort((a, b) => {
        if (!a.startDateRaw || !b.startDateRaw) return 0;
        return b.startDateRaw - a.startDateRaw;
      });
      
      setReservations(sortedReservations);
    } catch (error) {
      // Erreur gérée via notification UI
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Appliquer le filtrage par terme de recherche
  const filteredReservations = reservations.filter(reservation => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (reservation.client_name && reservation.client_name.toLowerCase().includes(searchTermLower)) ||
      (reservation.vehicle_name && reservation.vehicle_name.toLowerCase().includes(searchTermLower)) ||
      (reservation.startDate && reservation.startDate.includes(searchTerm)) ||
      (reservation.endDate && reservation.endDate.includes(searchTerm)) ||
      (reservation.statut && reservation.statut.toLowerCase().includes(searchTermLower))
    );
  });

  
  // Appliquer la pagination aux réservations filtrées
  const paginatedReservations = filteredReservations.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    // Charger les données initiales
    fetchClients();
    fetchVehicles();
    fetchExtras();
    // Utiliser la fonction de filtrage au lieu de fetchReservations
    fetchAndFilterReservations();
  }, []);
  
  // Effet pour réagir aux changements de filtre de période
  useEffect(() => {
    // Déclencher le filtrage des réservations lorsque le filtre change
    fetchAndFilterReservations();
  }, [periodFilter]); 

  useEffect(() => {
    // Écouter l'événement de rafraîchissement après un ajout combiné
    const handleRefreshAfterCombinedSave = () => {
      // Logs de débogage supprimés
      // 'Actualisation des données après un ajout combiné');
      fetchReservations();
      fetchClients();
      fetchExtras();
    };
    
    // Écouter l'événement de rafraîchissement après une modification de réservation
    const handleRefreshAfterSave = () => {
      console.log('Actualisation des données après modification/ajout de réservation');
      fetchReservations();
    };
    
    document.addEventListener('refresh-data-after-combined-save', handleRefreshAfterCombinedSave);
    document.addEventListener('refresh-data-after-save', handleRefreshAfterSave);
    
    return () => {
      document.removeEventListener('refresh-data-after-combined-save', handleRefreshAfterCombinedSave);
      document.removeEventListener('refresh-data-after-save', handleRefreshAfterSave);
    };
  }, []);

  const handleAddOrEditReservation = async (reservationData) => {
    // Validation
    const errors = {};
    
    if (!reservationData.client) errors.client = 'Le client est requis';
    if (!reservationData.vehicle) errors.vehicle = 'Le véhicule est requis';
    if (!reservationData.startDate) errors.startDate = 'La date de début est requise';
    if (!reservationData.endDate) errors.endDate = 'La date de fin est requise';
    
    // Vérifier que la date de fin est après la date de début
    if (reservationData.startDate && reservationData.endDate) {
      const start = new Date(reservationData.startDate);
      const end = new Date(reservationData.endDate);
      if (end <= start) {
        errors.endDate = 'La date de fin doit être après la date de début';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return null;
    }
    
    try {
      setLoading(true);
      
      // Fonction pour s'assurer que les dates sont au format ISO (YYYY-MM-DD)
      const ensureISODateFormat = (dateStr) => {
        if (!dateStr) return null;
        
        // Vérifier si la date est déjà au format ISO (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        
        // Si la date est au format français (DD/MM/YYYY), la convertir
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        
        // Si c'est un objet Date, le convertir en chaîne ISO
        if (dateStr instanceof Date) {
          return dateStr.toISOString().split('T')[0];
        }
        
        // Essayer de créer un objet Date et le convertir
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Erreur lors de la conversion de la date:', e);
        }
        
        // Si tout échoue, retourner la date telle quelle
        return dateStr;
      };
      
      // Préparer les données au format attendu par l'API
      const apiReservationData = {
        ClientID: parseInt(reservationData.client),
        VoitureID: parseInt(reservationData.vehicle),
        DateDébut: ensureISODateFormat(reservationData.startDate),
        DateFin: ensureISODateFormat(reservationData.endDate),
        Statut: reservationData.statut || 'En attente',
        ExtraID: reservationData.extra ? parseInt(reservationData.extra) : null,
        LieuDepart: reservationData.lieuDepart || null,
        LieuArrivee: reservationData.lieuArrivee || null
      };
      
      console.log('Données de réservation formatées pour l\'API:', apiReservationData);
      
      // Logs de débogage supprimés
      // 'Données de réservation à envoyer:', apiReservationData);
      
      let response;
      if (editingReservation) {
        // Mise à jour d'une réservation existante
        response = await reservationService.updateReservation(editingReservation.id, apiReservationData);
        // Logs de débogage supprimés
      // 'Réservation mise à jour:', response);
        
        // Mettre à jour le state local
        setReservations(prev => prev.map(res => 
          res.id === editingReservation.id ? { ...res, ...reservationData } : res
        ));
        
        // Actualiser les données après la modification pour s'assurer que les changements sont reflétés
        console.log('Actualisation des données après modification...');
        fetchReservations();
      } else {
        // Ajout d'une nouvelle réservation
        response = await reservationService.createReservation(apiReservationData);
        // Logs de débogage supprimés
      // 'Nouvelle réservation créée:', response);
        
        // Ajouter la nouvelle réservation au state local avec l'ID retourné par l'API
        const newReservationWithId = { 
          ...reservationData,
          id: response.id || response.ReservationID
        };
        setReservations(prev => [...prev, newReservationWithId]);
      }
      
      // Ne pas réinitialiser le formulaire si c'est en mode combiné
      if (!reservationData.fromCombinedMode) {
        setNewReservation({ 
          client: '', 
          vehicle: '',
          startDate: '',
          endDate: '', 
          statut: 'En attente', 
          extra: '',
          lieuDepart: '',
          lieuArrivee: ''
        });
        
        // Actualiser les données après l'ajout d'une nouvelle réservation
        console.log('Actualisation des données après ajout...');
        fetchReservations();
        setEditingReservation(null);
        setErrors({});
        setOpenDialog(false);
        
        // Actualiser la liste des réservations
        fetchReservations();
      }
      
      setLoading(false);
      return response;
      
    } catch (error) {
      // Erreur gérée via notification UI
      
      // Extraire le message d'erreur spécifique si disponible
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          // Vérifier si l'erreur concerne la disponibilité du véhicule
          if (error.response.data.message.includes('véhicule n\'est pas disponible')) {
            errorMessage = 'Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre.';
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      
      // Afficher le message d'erreur
      setErrors({ submit: errorMessage });
      
      // Afficher également un message de notification
      setNotification({
        open: true,
        message: `Erreur : ${errorMessage}`,
        severity: 'error'
      });
      
      setLoading(false);
      throw error;
    }
  };

  // Fonction pour gérer l'ajout d'un client
  const handleAddClient = async (clientData) => {
    try {
      setLoading(true);
      
      // Préparation des données pour l'API client
      const nameParts = clientData.nom_complet.split(' ');
      const prenom = nameParts[0] || '';
      const nom = nameParts.slice(1).join(' ') || '';
      
      const apiClientData = {
        utilisateur: {
          Nom: nom,
          Prenom: prenom,
          Email: clientData.email || `${prenom.toLowerCase()}.${nom.toLowerCase().replace(/\s+/g, '')}@example.com`,
          Telephone: clientData.telephone,
          Password: 'password123',
          Roles: 'Client'
        },
        Civilité: clientData.civilite,
        CIN_Passport: clientData.cin_passport,
        DateNaissance: clientData.dateNaissance,
        NumPermis: clientData.numPermis,
        DateDelivrancePermis: clientData.dateDelivrancePermis,
        Adresse: clientData.adresse
      };
      
      // Logs de débogage supprimés
      // 'Données client à envoyer:', apiClientData);
      
      const response = await clientService.createClient(apiClientData);
      // Logs de débogage supprimés
      // 'Client créé:', response);
      
      // Actualiser la liste des clients
      await fetchClients();
      
      return response;
      
    } catch (error) {
      // Erreur gérée via notification UI
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le mode combiné
  const handleAddCombined = async (combinedData) => {
    try {
      setLoading(true);
      
      // Logs de débogage supprimés
      // 'Données combinées à envoyer:', combinedData);
      
      const response = await combinedService.createClientAndReservation(combinedData);
      // Logs de débogage supprimés
      // 'Réponse du mode combiné:', response);
      
      // Actualiser les listes
      await fetchReservations();
      await fetchClients();
      
      return response;
      
    } catch (error) {
      // Erreur gérée via notification UI
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  // Gérer la fermeture de la notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <ReservationClientLayout onAddReservation={(data) => {
      // Ajouter directement la réservation sans ouvrir un nouveau dialogue
      return handleAddOrEditReservation(data);
    }} onAddClient={() => window.location.href = '/admin/clients'}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Gestion des réservations</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        {/* Barre de recherche */}
        <Paper 
          component="form" 
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%', 
            maxWidth: 400,
            border: '1px solid #ddd',
            boxShadow: 'none',
            borderRadius: 1
          }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon sx={{ color: '#757575' }} />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Rechercher une réservation"
            inputProps={{ 'aria-label': 'rechercher une réservation' }}
            value={searchTerm}
            onChange={handleSearch}
          />
        </Paper>
        
        {/* Sélecteur de période */}
        <FormControl sx={{ minWidth: 220 }}>
          <Select
            id="period-filter"
            value={periodFilter}
            onChange={handlePeriodFilterChange}
            displayEmpty
            renderValue={(selected) => {
              const options = {
                'all': 'Toutes les réservations',
                'today': 'Aujourd\'hui',
                'week': 'Cette semaine',
                'month': 'Ce mois',
                'future': 'Réservations à venir',
                'past': 'Réservations passées'
              };
              return options[selected] || 'Toutes les réservations';
            }}
            sx={{
              bgcolor: '#000000',
              color: 'white',
              height: '40px',
              borderRadius: '4px',
              border: '1px solid #FFD700',
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              '&:hover': { bgcolor: '#000000', border: '1px solid #FFD700' },
              '&.Mui-focused': { bgcolor: '#000000', border: '1px solid #FFD700' },
              '.MuiSvgIcon-root': { color: '#FFD700' },
              paddingLeft: '10px',
              paddingRight: '10px',
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: '#000000',
                  '& .MuiMenuItem-root': {
                    color: 'white',
                    fontSize: '14px',
                    padding: '8px 16px'
                  },
                  '& .MuiMenuItem-root:hover': {
                    bgcolor: '#333333'
                  },
                  '& .MuiMenuItem-root.Mui-selected': {
                    bgcolor: '#333333',
                    color: '#FFD700',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#444444' }
                  }
                }
              }
            }}
            size="small"
          >
            <MenuItem value="all">Toutes les réservations</MenuItem>
            <MenuItem value="today">Aujourd'hui</MenuItem>
            <MenuItem value="week">Cette semaine</MenuItem>
            <MenuItem value="month">Ce mois</MenuItem>
            <MenuItem value="future">Réservations à venir</MenuItem>
            <MenuItem value="past">Réservations passées</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 2 }}>
        <TableContainer sx={{ borderRadius: 2, overflow: 'auto', maxWidth: '100%' }}>
          <Table sx={{
            minWidth: 650,
            tableLayout: 'fixed',
            '& .MuiTableRow-root:nth-of-type(odd)': { backgroundColor: 'action.hover' },
            '& .MuiTableRow-root:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
            '& .MuiTableCell-root': { padding: '16px 8px', borderSpacing: '2px' },
            borderCollapse: 'separate',
            borderSpacing: '0 8px'
          }}>
            <TableHead>
              <TableRow>
                <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>Voiture</TableCell>
                <TableCell width="120px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Client</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Date Début</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Date Fin</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Lieu Départ</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Lieu Arrivée</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Statut</TableCell>
                <TableCell width="100px" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: 'white' }}>Extra</TableCell>
                <TableCell width="120px" align="center" sx={{ fontWeight: 'bold', backgroundColor: '#000', color: '#FFFFFF', position: 'sticky', right: 0, zIndex: 2, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReservations.length > 0 ? (
                paginatedReservations.map((res, index) => (
                  <TableRow key={res.id} sx={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}>
                    <TableCell sx={{ borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}>{res.vehicle_name}</TableCell>
                    <TableCell>{res.client_name}</TableCell>
                    <TableCell>{res.startDate}</TableCell>
                    <TableCell>{res.endDate}</TableCell>
                    <TableCell>{res.lieuDepart || '-'}</TableCell>
                    <TableCell>{res.lieuArrivee || '-'}</TableCell>
                    <TableCell><ReservationStatus status={res.statut} /></TableCell>
                    <TableCell>
                      {res.extra 
                        ? extras.find(e => e.ExtraID === res.extra)?.Nom || `Extra ID: ${res.extra}` 
                        : '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ position: 'sticky', right: 0, zIndex: 1, borderTopRightRadius: 4, borderBottomRightRadius: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEdit(res)}
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
                          onClick={() => handleDeleteClick(res.id)}
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
                    {searchTerm ? "Aucune réservation ne correspond à votre recherche" : "Aucune réservation trouvée"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredReservations.length}
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
            Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#000', p: 2 }}>
          <Button onClick={handleDeleteCancel} sx={{ color: '#FFD700' }}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#000', color: '#FFD700' }}>
          {editingReservation ? 'Éditer la réservation' : 'Ajouter une nouvelle réservation'}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#000', color: 'white', pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }} error={!!errors.client}>
                <InputLabel id="client-label">Client</InputLabel>
                <Select
                  labelId="client-label"
                  id="client"
                  name="client"
                  value={editingReservation ? editingReservation.client : newReservation.client}
                  onChange={handleChange}
                  label="Client"
                >
                  {clients.map(client => (
                    <MenuItem key={client.UserID} value={client.UserID}>
                      {`${client.Prenom || ''} ${client.Nom || ''}`} ({client.CIN_Passport || 'Sans CIN'})
                    </MenuItem>
                  ))}
                </Select>
                {errors.client && <Typography color="error" variant="caption">{errors.client}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }} error={!!errors.vehicle}>
                <InputLabel id="vehicle-label">Véhicule</InputLabel>
                <Select
                  labelId="vehicle-label"
                  id="vehicle"
                  name="vehicle"
                  value={editingReservation ? editingReservation.vehicle : newReservation.vehicle}
                  onChange={handleChange}
                  label="Véhicule"
                >
                  {vehicles.map(vehicle => (
                    <MenuItem key={vehicle.VoitureID} value={vehicle.VoitureID}>
                      {vehicle.Marque} {vehicle.Modele} - {vehicle.Immatriculation}
                    </MenuItem>
                  ))}
                </Select>
                {errors.vehicle && <Typography color="error" variant="caption">{errors.vehicle}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de début"
                  value={editingReservation ? 
                    (editingReservation.startDate ? new Date(editingReservation.startDate) : null) : 
                    (newReservation.startDate ? new Date(newReservation.startDate) : null)}
                  onChange={(date) => {
                    if (editingReservation) {
                      setEditingReservation({
                        ...editingReservation,
                        startDate: date ? date.toISOString().split('T')[0] : ''
                      });
                    } else {
                      setNewReservation({
                        ...newReservation,
                        startDate: date ? date.toISOString().split('T')[0] : ''
                      });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                      sx: { mb: 3 }
                    },
                    day: {
                      sx: {
                        '&.Mui-selected': {
                          backgroundColor: '#FFD700 !important',
                          color: 'black !important'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.2) !important'
                        }
                      }
                    },
                    calendarHeader: {
                      sx: {
                        '& .MuiPickersCalendarHeader-label': {
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        },
                        '& .MuiButtonBase-root': {
                          color: '#FFD700'
                        }
                      }
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          backgroundColor: '#222',
                          color: 'white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          borderRadius: '8px',
                          border: '1px solid #444',
                          '& .MuiPickersDay-root': {
                            color: 'white',
                            '&.Mui-disabled': {
                              color: 'rgba(255,255,255,0.3)'
                            }
                          },
                          '& .MuiDayCalendar-weekDayLabel': {
                            color: '#FFD700'
                          },
                          '& .MuiPickersDay-today': {
                            border: '1px solid #FFD700'
                          }
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de fin"
                  value={editingReservation ? 
                    (editingReservation.endDate ? new Date(editingReservation.endDate) : null) : 
                    (newReservation.endDate ? new Date(newReservation.endDate) : null)}
                  onChange={(date) => {
                    if (editingReservation) {
                      setEditingReservation({
                        ...editingReservation,
                        endDate: date ? date.toISOString().split('T')[0] : ''
                      });
                    } else {
                      setNewReservation({
                        ...newReservation,
                        endDate: date ? date.toISOString().split('T')[0] : ''
                      });
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                      sx: { mb: 3 }
                    },
                    day: {
                      sx: {
                        '&.Mui-selected': {
                          backgroundColor: '#FFD700 !important',
                          color: 'black !important'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(255, 215, 0, 0.2) !important'
                        }
                      }
                    },
                    calendarHeader: {
                      sx: {
                        '& .MuiPickersCalendarHeader-label': {
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        },
                        '& .MuiButtonBase-root': {
                          color: '#FFD700'
                        }
                      }
                    },
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          backgroundColor: '#222',
                          color: 'white',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                          borderRadius: '8px',
                          border: '1px solid #444',
                          '& .MuiPickersDay-root': {
                            color: 'white',
                            '&.Mui-disabled': {
                              color: 'rgba(255,255,255,0.3)'
                            }
                          },
                          '& .MuiDayCalendar-weekDayLabel': {
                            color: '#FFD700'
                          },
                          '& .MuiPickersDay-today': {
                            border: '1px solid #FFD700'
                          }
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }} error={!!errors.statut}>
                <InputLabel id="statut-label">Statut</InputLabel>
                <Select
                  labelId="statut-label"
                  id="statut"
                  name="statut"
                  value={editingReservation ? editingReservation.statut : newReservation.statut}
                  onChange={handleChange}
                  label="Statut"
                >
                  <MenuItem value="En attente">En attente</MenuItem>
                  <MenuItem value="confirmee">Confirmée</MenuItem>
                  <MenuItem value="annulee">Annulée</MenuItem>
                </Select>
                {errors.statut && <Typography color="error" variant="caption">{errors.statut}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel id="lieu-depart-label">Lieu de départ</InputLabel>
                <Select
                  labelId="lieu-depart-label"
                  id="lieuDepart"
                  name="lieuDepart"
                  value={editingReservation ? editingReservation.lieuDepart || '' : newReservation.lieuDepart || ''}
                  onChange={handleChange}
                  label="Lieu de départ"
                >
                  <MenuItem value="">Aucun</MenuItem>
                  <MenuItem value="Aéroport de Casa">Aéroport de Casa</MenuItem>
                  <MenuItem value="Aéroport de Fès">Aéroport de Fès</MenuItem>
                  <MenuItem value="Aéroport de Rabat">Aéroport de Rabat</MenuItem>
                  <MenuItem value="Casablanca Ville">Casablanca Ville</MenuItem>
                  <MenuItem value="Agence">Agence</MenuItem>
                  <MenuItem value="Aéroport de Marrakech">Aéroport de Marrakech</MenuItem>
                  <MenuItem value="Aéroport de Tanger">Aéroport de Tanger</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel id="lieu-arrivee-label">Lieu d'arrivée</InputLabel>
                <Select
                  labelId="lieu-arrivee-label"
                  id="lieuArrivee"
                  name="lieuArrivee"
                  value={editingReservation ? editingReservation.lieuArrivee || '' : newReservation.lieuArrivee || ''}
                  onChange={handleChange}
                  label="Lieu d'arrivée"
                >
                  <MenuItem value="">Aucun</MenuItem>
                  <MenuItem value="Aéroport de Casa">Aéroport de Casa</MenuItem>
                  <MenuItem value="Aéroport de Fès">Aéroport de Fès</MenuItem>
                  <MenuItem value="Aéroport de Rabat">Aéroport de Rabat</MenuItem>
                  <MenuItem value="Casablanca Ville">Casablanca Ville</MenuItem>
                  <MenuItem value="Agence">Agence</MenuItem>
                  <MenuItem value="Aéroport de Marrakech">Aéroport de Marrakech</MenuItem>
                  <MenuItem value="Aéroport de Tanger">Aéroport de Tanger</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                variant="outlined"
                label="Extra"
                name="extra"
                value={editingReservation ? editingReservation.extra : newReservation.extra}
                onChange={handleChange}
                fullWidth
                sx={{ mb: 3 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#000', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#FFD700' }}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" color="primary" autoFocus>
            {editingReservation ? 'Éditer' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification moderne */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'down' }}
      >
        <Alert 
          severity={notification.severity}
          variant="filled"
          icon={notification.severity === 'success' ? <CheckCircleOutlineIcon /> : undefined}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseNotification}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
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
            ...(notification.severity === 'success' && {
              backgroundColor: '#000',
              color: '#fff'
            })
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ReservationClientLayout>
  );
};

// Composant pour afficher le statut avec un style visuel
const ReservationStatus = ({ status }) => {
  let color = '#FFC107';
  let icon = <AccessTimeIcon key="status-icon" fontSize="small" />;
  let label = 'En attente';

  // Normaliser le statut pour la comparaison (convertir en minuscules sans accents)
  const normalizedStatus = status ? status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';

  if (normalizedStatus === 'confirmee' || normalizedStatus === 'confirmée' || status === 'Confirmée') {
    color = '#4CAF50';
    icon = <CheckCircleIcon key="status-icon-confirmed" fontSize="small" />;
    label = 'Confirmée';
  } else if (normalizedStatus === 'annulee' || normalizedStatus === 'annulée' || status === 'Annulée') {
    color = '#F44336';
    icon = <CancelIcon key="status-icon-cancelled" fontSize="small" />;
    label = 'Annulée';
  } else if (normalizedStatus === 'en attente' || status === 'En attente') {
    // Garder les valeurs par défaut
    label = 'En attente';
  }

  return (
    <Chip 
      icon={icon}
      label={label}
      size="small"
      sx={{ 
        backgroundColor: color + '20', 
        color: color,
        fontWeight: 'bold',
        '& .MuiChip-icon': {
          color: color
        }
      }}
    />
  );
};

export default Reservations;
