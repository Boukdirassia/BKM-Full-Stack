import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Typography, Box, Grid, 
  FormControl, InputLabel, Select, MenuItem, 
  FormControlLabel, Switch, Tabs, Tab, CircularProgress,
  Snackbar, Alert, Divider, Paper, IconButton, Avatar, Tooltip, 
  List, ListItem, ListItemText, ListItemAvatar, 
  Chip, Collapse, Fade, Zoom, Grow, Slide,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fr } from 'date-fns/locale';

import { 
  Person as PersonIcon, 
  Home as HomeIcon, 
  Phone as PhoneIcon, 
  Badge as BadgeIcon, 
  Event as EventIcon, 
  DirectionsCar as DirectionsCarIcon, 
  CalendarToday as CalendarTodayIcon, 
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AddCircle as AddCircleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Assignment as AssignmentIcon,
  AddShoppingCart as AddShoppingCartIcon,
  Cake as CakeIcon,
  DriveEta as DriveEtaIcon,
  CheckCircle as CheckCircleIcon,
  BookOnline as BookOnlineIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { clientService, voitureService, extraService, combinedService, reservationService } from '../../../services';
import { LOCATIONS } from '../../../constants/locationConstants';

const AddReservationClientDialog = ({ open, handleClose, handleSaveReservation, handleSaveClient, handleSaveCombined, handleOpen }) => {
  const [tabValue, setTabValue] = useState(0);
  const [combinedMode, setCombinedMode] = useState(false);
  const [newReservation, setNewReservation] = useState({ 
    client: '', 
    vehicle: '', 
    startDate: '', 
    endDate: '', 
    statut: 'En attente', 
    extra: '',
    lieuDepart: '',
    lieuArrivee: ''
  });
  const [newClient, setNewClient] = useState({ 
    civilite: '', 
    nom_complet: '',
    telephone: '',
    cin_passport: '', 
    dateNaissance: '', 
    numPermis: '', 
    dateDelivrancePermis: '',
    adresse: '',
    email: '',
    password: 'password123' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [originalReservation, setOriginalReservation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reservationErrors, setReservationErrors] = useState({});
  const [clientErrors, setClientErrors] = useState({});
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);
  
  // État pour suivre si une erreur d'âge a été détectée
  const [ageError, setAgeError] = useState(false);
  
  // États pour stocker les données de l'API
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [extras, setExtras] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fonction pour récupérer les extras depuis la base de données
  const fetchExtras = async () => {
    try {
      setLoadingData(true);
      const data = await extraService.getAllExtras();
      // Les logs de débogage ont été supprimés
      setExtras(data);
    } catch (error) {
      // Erreur silencieuse en production
    } finally {
      setLoadingData(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    // Si on passe de l'onglet client à l'onglet réservation, vérifier d'abord l'âge du client
    if (newValue === 0 && tabValue === 1) {
      // Vérifier l'âge du client
      if (!isClientAtLeast19()) {
        // Afficher un message d'erreur
        setToast({
          open: true,
          message: 'Le client doit avoir au moins 19 ans pour créer une réservation',
          severity: 'error'
        });
        
        // Mettre à jour les erreurs du client
        setClientErrors({
          ...clientErrors,
          dateNaissance: '⚠️ Le client doit avoir au moins 19 ans'
        });
        
        // Ne pas changer d'onglet
        return;
      }
    }
    
    setTabValue(newValue);
    // Désactiver le mode combiné lors du changement d'onglet
    setCombinedMode(false);
  };
  
  const toggleCombinedMode = () => {
    setCombinedMode(!combinedMode);
  };

  const handleReservationChange = async (e) => {
    const { name, value } = e.target;
    console.log(`Changement de ${name} à:`, value);
    setNewReservation({ ...newReservation, [name]: value });
    
    // Vérifier la disponibilité du véhicule lorsque les dates ou le véhicule changent
    // En mode édition, vérifier seulement si les dates ou le véhicule ont changé
    const shouldCheckAvailability = !isEditing || 
      (isEditing && originalReservation && (
        (name === 'startDate' && value !== originalReservation.startDate) ||
        (name === 'endDate' && value !== originalReservation.endDate) ||
        (name === 'vehicle' && value !== originalReservation.vehicle)
      ));
    
    if (shouldCheckAvailability && 
        (name === 'startDate' || name === 'endDate' || name === 'vehicle') && 
        newReservation.vehicle && newReservation.startDate && newReservation.endDate) {
      
      // Si nous modifions la date de début, utiliser la nouvelle valeur
      const startDate = name === 'startDate' ? value : newReservation.startDate;
      // Si nous modifions la date de fin, utiliser la nouvelle valeur
      const endDate = name === 'endDate' ? value : newReservation.endDate;
      // Si nous modifions le véhicule, utiliser la nouvelle valeur
      const vehicleId = name === 'vehicle' ? value : newReservation.vehicle;
      
      try {
        // Vérifier la disponibilité du véhicule pour la période sélectionnée
        const { available, conflictingReservation } = await reservationService.checkVehicleAvailability(
          vehicleId,
          startDate,
          endDate,
          editingReservationId // Exclure la réservation en cours d'édition si elle existe
        );
        
        if (!available) {
          // Mettre à jour les erreurs de réservation
          setReservationErrors(prev => ({
            ...prev,
            vehicle: 'Ce véhicule n\'est pas disponible pour cette période',
            availability: `Véhicule déjà réservé du ${new Date(conflictingReservation.DateDébut).toLocaleDateString()} au ${new Date(conflictingReservation.DateFin).toLocaleDateString()}`
          }));
          
          // Afficher un message d'erreur exactement comme dans la photo
          setToast({
            open: true,
            message: `Erreur : Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre. (Réservé du ${new Date(conflictingReservation.DateDébut).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})} au ${new Date(conflictingReservation.DateFin).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})})`,
            severity: 'error'
          });
        } else {
          // Effacer les erreurs de disponibilité si le véhicule est disponible
          setReservationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.vehicle;
            delete newErrors.availability;
            return newErrors;
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de disponibilité:', error);
      }
    }
  };

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
    
    // Vérifier l'âge si la date de naissance a été modifiée
    if (name === 'dateNaissance') {
      // Mettre à jour la date de naissance
      const updatedClient = { ...newClient, dateNaissance: value };
      
      // Effacer l'erreur précédente si elle existe
      if (clientErrors.dateNaissance) {
        setClientErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.dateNaissance;
          return newErrors;
        });
      }
    }
  };

  const validateReservation = async () => {
    const errors = {};
    // En mode combiné, on ne vérifie pas le client car il est créé en même temps
    if (!combinedMode && !newReservation.client) errors.client = "Le client est obligatoire";
    if (!newReservation.vehicle) errors.vehicle = "Le véhicule est obligatoire";
    if (!newReservation.startDate) errors.startDate = "La date de début est obligatoire";
    if (!newReservation.endDate) errors.endDate = "La date de fin est obligatoire";
    
    // Vérifier que la date de fin est postérieure à la date de début
    if (newReservation.startDate && newReservation.endDate) {
      const startDate = new Date(newReservation.startDate);
      const endDate = new Date(newReservation.endDate);
      
      if (endDate <= startDate) {
        errors.endDate = "La date de fin doit être postérieure à la date de début";
      }
    }
    
    // Vérifier la disponibilité du véhicule si toutes les dates sont renseignées
    // En mode édition, vérifier seulement si les dates ou le véhicule ont changé
    const shouldCheckAvailability = !isEditing || 
      (isEditing && originalReservation && (
        newReservation.startDate !== originalReservation.startDate ||
        newReservation.endDate !== originalReservation.endDate ||
        newReservation.vehicle !== originalReservation.vehicle
      ));
    
    if (shouldCheckAvailability && 
        newReservation.vehicle && newReservation.startDate && newReservation.endDate && !errors.startDate && !errors.endDate) {
      try {
        const { available, conflictingReservation } = await reservationService.checkVehicleAvailability(
          newReservation.vehicle,
          newReservation.startDate,
          newReservation.endDate,
          editingReservationId
        );
        
        if (!available) {
          errors.vehicle = `Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre.`;
          errors.availability = `Réservé du ${new Date(conflictingReservation.DateDébut).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})} au ${new Date(conflictingReservation.DateFin).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})}`;
          
          // Afficher un message toast d'erreur
          setToast({
            open: true,
            message: `Erreur : Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre. (Réservé du ${new Date(conflictingReservation.DateDébut).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})} au ${new Date(conflictingReservation.DateFin).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})})`,
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de disponibilité:', error);
      }
    }
    
    setReservationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateClient = () => {
    const newErrors = {};
    if (!newClient.civilite || !newClient.civilite.trim()) newErrors.civilite = "La civilité est obligatoire";
    if (!newClient.nom_complet || !newClient.nom_complet.trim()) newErrors.nom_complet = "Le nom complet est obligatoire";
    if (!newClient.telephone || !newClient.telephone.trim()) newErrors.telephone = "Le numéro de téléphone est obligatoire";
    if (!newClient.cin_passport || !newClient.cin_passport.trim()) newErrors.cin_passport = "CIN/Passport est obligatoire";
    
    // Validation de l'email
    if (!newClient.email || !newClient.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    // Validation du mot de passe
    // Pour une nouvelle création, le mot de passe est obligatoire
    // Pour une modification, si le mot de passe est vide, on ne met pas d'erreur
    // car cela signifie que l'utilisateur souhaite conserver le mot de passe actuel
    if (newClient.id) { // Si le client a un ID, c'est une modification
      // Aucune validation de longueur du mot de passe
    } else {
      // Pour une création, le mot de passe est obligatoire
      if (!newClient.password || !newClient.password.trim()) {
        newErrors.password = "Le mot de passe est obligatoire";
      }
      // Aucune validation de longueur du mot de passe
    }
    
    // Validation optimisée de la date de naissance (minimum 19 ans)
    if (!newClient.dateNaissance || !newClient.dateNaissance.trim()) {
      newErrors.dateNaissance = "La date de naissance est obligatoire";
    } else {
      try {
        const birthDate = new Date(newClient.dateNaissance);
        
        if (isNaN(birthDate.getTime())) {
          newErrors.dateNaissance = "Format de date invalide";
        } else if (!isClientAtLeast19()) {
          newErrors.dateNaissance = "⚠️ Le client doit avoir au moins 19 ans";
          // Marquer qu'une erreur d'âge a été détectée
          setAgeError(true);
        } else {
          // Réinitialiser l'erreur d'âge si la date est valide
          setAgeError(false);
        }
      } catch (error) {
        newErrors.dateNaissance = "Format de date invalide";
      }
    }
    if (newClient.numPermis && !newClient.numPermis.trim()) newErrors.numPermis = "Format de numéro de permis invalide";
    if (newClient.dateDelivrancePermis && !newClient.dateDelivrancePermis.trim()) newErrors.dateDelivrancePermis = "Format de date invalide";
    if (newClient.adresse && !newClient.adresse.trim()) newErrors.adresse = "Format d'adresse invalide";
    
    setClientErrors(newErrors);
    
    // Vérifier seulement les champs obligatoires
    return !newErrors.civilite && !newErrors.nom_complet && !newErrors.telephone && 
           !newErrors.cin_passport && !newErrors.email && !newErrors.password;
  };

  const resetForms = () => {
    setNewReservation({ client: '', vehicle: '', startDate: '', endDate: '', statut: 'En attente', extra: '', lieuDepart: '', lieuArrivee: '' });
    setNewClient({ civilite: '', nom_complet: '', telephone: '', cin_passport: '', dateNaissance: '', numPermis: '', dateDelivrancePermis: '', adresse: '', email: '', password: 'password123' });
    setReservationErrors({});
    setClientErrors({});
    setIsEditing(false);
  };
  
  const handleToastClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };

  // Fonction optimisée pour vérifier si le client a au moins 19 ans
  const isClientAtLeast19 = () => {
    if (!newClient.dateNaissance) return false;
    
    try {
      // Utiliser directement la date au format ISO (YYYY-MM-DD)
      const birthDate = new Date(newClient.dateNaissance);
      
      // Vérifier si la date est valide
      if (isNaN(birthDate.getTime())) {
        return false;
      }
      
      // Calculer l'âge de manière optimisée
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      // Ajuster l'âge si l'anniversaire n'est pas encore passé cette année
      if (
        today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      
      // Retourne true si l'âge est d'au moins 19 ans
      return age >= 19;
    } catch (error) {
      return false;
    }
  };
  
  // Fonction pour vérifier l'âge et afficher un message d'erreur si nécessaire
  const checkAgeAndShowError = () => {
    if (!isClientAtLeast19()) {
      // Afficher un message d'erreur
      setToast({
        open: true,
        message: 'Le client doit avoir au moins 19 ans pour créer une réservation',
        severity: 'error'
      });
      
      // Mettre à jour les erreurs du client
      setClientErrors({
        ...clientErrors,
        dateNaissance: '⚠️ Le client doit avoir au moins 19 ans'
      });
      
      // Si nous sommes en mode combiné, forcer l'affichage de l'onglet client
      if (combinedMode) {
        setTabValue(1); // Onglet client
      }
      
      return false;
    }
    return true;
  };
  
  const handleSave = async () => {
    setLoading(true);
    
    // Vérifier l'âge du client si nous sommes dans l'onglet client ou en mode combiné
    if (tabValue === 1 || combinedMode) {
      if (!checkAgeAndShowError()) {
        setLoading(false);
        return;
      }
    }
    
    // Valider le client ensuite
    const isClientValid = validateClient();
    
    // Valider la réservation (incluant la vérification de disponibilité)
    const isReservationValid = await validateReservation();
    
    if (combinedMode) {
      // Vérifier la disponibilité du véhicule en mode combiné
      // En mode édition, vérifier seulement si les dates ou le véhicule ont changé
      const shouldCheckAvailability = !isEditing || 
        (isEditing && originalReservation && (
          newReservation.startDate !== originalReservation.startDate ||
          newReservation.endDate !== originalReservation.endDate ||
          newReservation.vehicle !== originalReservation.vehicle
        ));
      
      if (shouldCheckAvailability && 
          newReservation.vehicle && newReservation.startDate && newReservation.endDate) {
        try {
          const { available, conflictingReservation } = await reservationService.checkVehicleAvailability(
            newReservation.vehicle,
            newReservation.startDate,
            newReservation.endDate,
            editingReservationId
          );
          
          if (!available) {
            setReservationErrors(prev => ({
              ...prev,
              vehicle: 'Ce véhicule n\'est pas disponible pour cette période',
              availability: `Véhicule déjà réservé du ${new Date(conflictingReservation.DateDébut).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})} au ${new Date(conflictingReservation.DateFin).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})}`
            }));
            
            // Afficher un message toast d'erreur
            setToast({
              open: true,
              message: `Erreur : Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre. (Réservé du ${new Date(conflictingReservation.DateDébut).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})} au ${new Date(conflictingReservation.DateFin).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'})})`,
              severity: 'error'
            });
            
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de disponibilité:', error);
        }
      }
      
      if (isClientValid && isReservationValid) {
        try {
          // Afficher un indicateur de chargement
          setLoading(true);
          
          // Préparer les données combinées pour l'API
          // Créer une copie de newReservation pour éviter de modifier l'original
          const reservationData = { ...newReservation };
          
          // En mode combiné, le client n'est pas encore créé, donc on ne peut pas avoir son ID
          // On le laissera vide pour que le backend puisse l'associer après création du client
          delete reservationData.client;
          
          const combinedData = {
            client: newClient,
            reservation: reservationData
          };
          
          // Préparation des données terminée
          
          // Utiliser la fonction dédiée pour le mode combiné si elle est disponible
          let response;
          if (typeof handleSaveCombined === 'function') {
            // Utiliser le service combiné pour créer client et réservation en une seule opération
            response = await handleSaveCombined(combinedData);

          } else {
            // Fallback: utiliser le service combiné directement si la fonction n'est pas fournie
            response = await combinedService.createClientAndReservation(combinedData);

          }
          
          // Déclencher un événement personnalisé pour informer les composants parents de rafraîchir leurs données
          const refreshEvent = new CustomEvent('refresh-data-after-combined-save', { 
            detail: { clientId: response.clientId, reservationId: response.reservationId } 
          });
          document.dispatchEvent(refreshEvent);
          
          // Afficher un message de succès avec toast
          setToast({
            open: true,
            message: 'Client et réservation créés avec succès!',
            severity: 'success'
          });
          
          // Réinitialiser les formulaires
          resetForms();
          
          // Si une fonction handleOpen est fournie, on l'appelle pour rafraîchir les données
          if (typeof handleOpen === 'function') {
            handleOpen();
          }
          
          // Fermer le dialogue après un court délai pour s'assurer que tout est terminé
          setTimeout(() => {
            handleClose();
          }, 100);
        } catch (error) {
          console.error('Erreur lors de la création combinée client/réservation:', error);
          
          // Extraire le message d'erreur spécifique si disponible
          let errorMessage = 'Erreur lors de la création combinée client/réservation.';
          let errorField = null;
          
          // Gestion détaillée des erreurs
          if (error.response && error.response.data) {
            const errorData = error.response.data;
            
            // Vérifier si c'est une erreur d'email en double
            if (errorData.error && typeof errorData.error === 'string' && errorData.error.includes('Duplicate entry') && errorData.error.includes('Email')) {
              errorMessage = "Cet email est déjà utilisé par un autre client. Veuillez en choisir un autre.";
              errorField = 'email';
              
              // Mettre à jour les erreurs du client
              setClientErrors(prev => ({
                ...prev,
                email: 'Cet email est déjà utilisé par un autre client'
              }));
            } 
            // Vérifier si c'est une erreur de disponibilité de véhicule
            else if (errorData.message && (errorData.message.includes('véhicule est déjà réservé') || errorData.message.includes('véhicule n\'est pas disponible'))) {
              errorMessage = `Erreur : Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre.`;
              errorField = 'dates';
              
              // Mettre à jour les erreurs de réservation
              setReservationErrors(prev => ({
                ...prev,
                startDate: 'Véhicule non disponible à cette date',
                endDate: 'Véhicule non disponible à cette date'
              }));
            }
            // Autres erreurs avec message spécifique
            else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          }
          
          // Afficher un message d'erreur plus convivial avec toast
          setToast({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
          
          // Si l'erreur concerne l'email, forcer l'affichage de l'onglet client
          if (errorField === 'email' && combinedMode) {
            setTabValue(1); // Passer à l'onglet client
          }
        } finally {
          setLoading(false);
        }
      }
    } else if (tabValue === 0) {
      // Onglet réservation
      const isReservationValid = await validateReservation();
      if (isReservationValid) {
        try {
          setLoading(true);

          const response = await handleSaveReservation(newReservation);
          
          // Déclencher un événement pour rafraîchir les données dans la page parent
          const refreshEvent = new CustomEvent('refresh-data-after-save', { 
            detail: { reservationId: isEditing ? editingReservationId : response.id || response.ReservationID } 
          });
          document.dispatchEvent(refreshEvent);
          
          setToast({
            open: true,
            message: isEditing ? 'Réservation modifiée avec succès!' : 'Réservation créée avec succès!',
            severity: 'success'
          });
          
          resetForms();
          
          // Fermer le dialogue après un court délai
          setTimeout(() => {
            handleClose();
            
            // Si une fonction handleOpen est fournie, on l'appelle pour rafraîchir les données
            if (typeof handleOpen === 'function') {
              setTimeout(() => {
                handleOpen();
              }, 50);
            }
          }, 100);
        } catch (error) {
          // Erreur gérée via le toast d'erreur
          
          // Extraire le message d'erreur spécifique si disponible
          let errorMessage = 'Erreur lors de la création de la réservation';
          
          if (error.response && error.response.data) {
            if (error.response.data.message) {
              // Vérifier si l'erreur concerne la disponibilité du véhicule
              if (error.response.data.message.includes('véhicule n\'est pas disponible')) {
                errorMessage = `Erreur : Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre.`;
                
                // Mettre à jour les erreurs de réservation pour mettre en évidence les champs de date
                setReservationErrors(prev => ({
                  ...prev,
                  startDate: 'Véhicule non disponible à cette date',
                  endDate: 'Véhicule non disponible à cette date',
                  vehicle: 'Ce véhicule est déjà réservé à la date sélectionnée. Veuillez en choisir une autre.'
                }));
              } else {
                errorMessage = error.response.data.message;
              }
            } else if (typeof error.response.data === 'string') {
              errorMessage = error.response.data;
            }
          }
          
          setToast({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    } else if (tabValue === 1) {
      
      // Vérifier la disponibilité du véhicule
      if (newReservation.vehicle && newReservation.startDate && newReservation.endDate) {
        const isAvailable = await validateReservation();
        if (!isAvailable) {
          setToast({
            open: true,
            message: 'Ce véhicule n\'est pas disponible pour cette période',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
      }
      // Onglet client
      if (validateClient()) {
        try {
          setLoading(true);

          await handleSaveClient(newClient);
          setToast({
            open: true,
            message: 'Client créé avec succès!',
            severity: 'success'
          });
          resetForms();
          setTimeout(() => handleClose(), 100);
        } catch (error) {
          // Erreur gérée via le toast d'erreur
          setToast({
            open: true,
            message: 'Erreur lors de la création du client',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    }
  };

  // Écouter l'événement d'édition de réservation
  React.useEffect(() => {
    const handleEditReservation = (event) => {
      const reservationData = event.detail;
      // Utiliser exactement les mêmes valeurs que celles de la base de données
      // sans aucune transformation
      console.log('Données de réservation reçues pour édition:', reservationData);
      console.log('LieuDepart reçu:', reservationData.lieuDepart);
      console.log('LieuArrivee reçu:', reservationData.lieuArrivee);
      console.log('Type de LieuDepart:', typeof reservationData.lieuDepart);
      console.log('Type de LieuArrivee:', typeof reservationData.lieuArrivee);
      
      // Vérifier si les valeurs sont dans la liste des lieux valides
      if (reservationData.lieuDepart && !LOCATIONS.includes(reservationData.lieuDepart)) {
        console.warn('LieuDepart n\'est pas dans la liste des lieux valides:', reservationData.lieuDepart);
        console.log('Lieux valides:', LOCATIONS);
      }
      
      if (reservationData.lieuArrivee && !LOCATIONS.includes(reservationData.lieuArrivee)) {
        console.warn('LieuArrivee n\'est pas dans la liste des lieux valides:', reservationData.lieuArrivee);
        console.log('Lieux valides:', LOCATIONS);
      }
      
      setNewReservation(reservationData);
      setTabValue(0); // Passer à l'onglet réservation
      setIsEditing(true);
      setEditingReservationId(reservationData.id); // Stocker l'ID de la réservation en cours d'édition
      setOriginalReservation({ ...reservationData }); // Stocker une copie des valeurs originales
    };

    document.addEventListener('edit-reservation', handleEditReservation);
    return () => {
      document.removeEventListener('edit-reservation', handleEditReservation);
    };
  }, []);

  // Écouter l'événement d'édition de client
  React.useEffect(() => {
    const handleEditClient = (event) => {
      const clientData = event.detail;
      setNewClient(clientData);
      setTabValue(1); // Passer à l'onglet client
      setIsEditing(true);
    };

    document.addEventListener('edit-client', handleEditClient);
    return () => {
      document.removeEventListener('edit-client', handleEditClient);
    };
  }, []);

  // Écouter l'événement d'ouverture du dialogue
  React.useEffect(() => {
    const handleOpenDialog = () => {
      if (!open) {
        handleClose(); // Pour s'assurer que le dialogue est fermé avant de l'ouvrir à nouveau
        setTimeout(() => {
          // Utiliser un délai pour s'assurer que le dialogue se ferme complètement avant de l'ouvrir à nouveau
          if (typeof handleOpen === 'function') {
            handleOpen();
          } else {
            // Si handleOpen n'est pas disponible, simuler l'ouverture en modifiant directement l'état local
            // Ceci est une solution de contournement et devrait être remplacé par un appel à handleOpen si disponible
            const openDialogEvent = new CustomEvent('force-open-dialog');
            document.dispatchEvent(openDialogEvent);
          }
        }, 50);
      }
    };

    document.addEventListener('open-reservation-client-dialog', handleOpenDialog);
    return () => {
      document.removeEventListener('open-reservation-client-dialog', handleOpenDialog);
    };
  }, [open, handleClose, handleOpen]);

  // Charger les données des véhicules, clients et extras au chargement du composant
  useEffect(() => {
    const loadVehicles = async () => {
      setLoadingData(true);
      try {
        const data = await voitureService.getAllVoitures();
        // Les logs de débogage ont été supprimés
        setVehicles(data.map(vehicle => ({
          id: vehicle.VoitureID,
          name: `${vehicle.Marque} ${vehicle.Modele} - ${vehicle.Immatriculation}`
        })));
        // Log du premier véhicule pour déboguer
        if (data.length > 0) {
          // Les logs de débogage ont été supprimés
        }
      } catch (error) {
        // Erreur silencieuse en production
      } finally {
        setLoadingData(false);
      }
    };

    const loadClients = async () => {
      setLoadingData(true);
      try {
        const data = await clientService.getAllClients();
        // Les logs de débogage ont été supprimés
        setClients(data.map(client => ({
          id: client.UserID,
          nom_complet: `${client.Prenom || ''} ${client.Nom || ''}`.trim() || 'Client sans nom'
        })));
      } catch (error) {
        // Erreur silencieuse en production
      } finally {
        setLoadingData(false);
      }
    };

    loadVehicles();
    loadClients();
    fetchExtras(); // Charger les extras depuis la base de données
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        keepMounted={false} // Empêche le rendu du dialogue lorsqu'il est fermé
        disablePortal={false} // Utilise le portail pour éviter les problèmes d'accessibilité
        aria-labelledby="reservation-dialog-title"
        container={document.body} // Utilise le body comme conteneur pour éviter les problèmes d'aria-hidden
        BackdropProps={{ sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' } }}
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            width: '700px', 
            maxWidth: '95vw', 
            margin: 'auto', 
            backgroundColor: '#000000', 
            overflow: 'hidden' 
          } 
        }}
    >
      <DialogTitle 
        id="reservation-dialog-title"
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
        {combinedMode ? (
          <>
            <BookOnlineIcon /> <PersonIcon /> {isEditing ? 'Modifier réservation et client' : 'Ajouter réservation et client'}
          </>
        ) : tabValue === 0 ? (
          <>
            <BookOnlineIcon /> {isEditing ? 'Modifier une réservation' : 'Ajouter une réservation'}
          </>
        ) : (
          <>
            <PersonIcon /> {isEditing ? 'Modifier un client' : 'Ajouter un client'}
          </>
        )}
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#000000' }}>
        {!combinedMode && (
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{ 
              '& .MuiTabs-indicator': { backgroundColor: '#FFD700' },
              '& .MuiTab-root': { color: '#999999' },
              '& .Mui-selected': { color: '#FFD700' }
            }}
          >
            <Tab icon={<BookOnlineIcon />} label="Réservation" sx={{ py: 2 }} />
            <Tab icon={<PersonIcon />} label="Client" sx={{ py: 2 }} />
          </Tabs>
        )}
      </Box>
      
      <DialogContent sx={{ px: 4, py: 4, backgroundColor: '#000000', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {combinedMode ? (
          <>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, borderBottom: '1px solid #333', pb: 1 }}>
              Informations du client
            </Typography>
            <Grid container spacing={2} sx={{ pt: 1, mb: 3 }}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: '#FFD700' }} /> Nom Complet
                  </Typography>
                  <TextField 
                    name="nom_complet" 
                    variant="outlined" 
                    fullWidth 
                    value={newClient.nom_complet} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.nom_complet} 
                    helperText={clientErrors.nom_complet} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HomeIcon sx={{ color: '#FFD700' }} /> Adresse
                  </Typography>
                  <TextField 
                    name="adresse" 
                    variant="outlined" 
                    fullWidth 
                    multiline
                    rows={2}
                    value={newClient.adresse} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.adresse} 
                    helperText={clientErrors.adresse} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CakeIcon sx={{ color: '#FFD700' }} /> Date de naissance
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label=""
                      value={newClient.dateNaissance ? new Date(newClient.dateNaissance) : null}
                      onChange={(date) => {
                        if (date) {
                          const formattedDate = date.toISOString().split('T')[0];
                          handleClientChange({
                            target: { name: 'dateNaissance', value: formattedDate }
                          });
                        }
                      }}
                      maxDate={(() => {
                        const today = new Date();
                        return new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
                      })()}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: !!clientErrors.dateNaissance,
                          helperText: clientErrors.dateNaissance || 'Date de naissance (minimum 19 ans)',
                          FormHelperTextProps: {
                            style: {
                              color: clientErrors.dateNaissance && clientErrors.dateNaissance.includes('19 ans') ? '#ff9800' : '#aaa',
                              fontWeight: clientErrors.dateNaissance ? 'bold' : 'normal'
                            }
                          }
                        },
                        day: {
                          sx: {
                            '&.Mui-selected': {
                              backgroundColor: '#FFD700',
                              color: '#000000',
                              '&:hover': {
                                backgroundColor: '#FFD700'
                              }
                            }
                          }
                        },
                        calendarHeader: {
                          sx: {
                            '& .MuiPickersCalendarHeader-label': {
                              color: '#000000'
                            }
                          }
                        },
                        actionBar: {
                          sx: {
                            '& .MuiButton-root': {
                              color: '#FFD700'
                            }
                          }
                        }
                      }}
                      sx={{ 
                        width: '100%',
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: '#222222', 
                          color: 'white', 
                          '& fieldset': { borderColor: '#444444' }, 
                          '&:hover fieldset': { borderColor: '#FFD700' }, 
                          '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                        },
                        '& .MuiInputLabel-root': {
                          color: 'white'
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#FFD700'
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DriveEtaIcon sx={{ color: '#FFD700' }} /> Numéro de permis
                  </Typography>
                  <TextField 
                    name="numPermis" 
                    variant="outlined" 
                    fullWidth 
                    value={newClient.numPermis} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.numPermis} 
                    helperText={clientErrors.numPermis} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ color: '#FFD700' }} /> Date délivrance permis
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label=""
                      value={newClient.dateDelivrancePermis ? new Date(newClient.dateDelivrancePermis) : null}
                      onChange={(date) => {
                        if (date) {
                          const formattedDate = date.toISOString().split('T')[0];
                          handleClientChange({
                            target: { name: 'dateDelivrancePermis', value: formattedDate }
                          });
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: !!clientErrors.dateDelivrancePermis,
                          helperText: clientErrors.dateDelivrancePermis
                        },
                        day: {
                          sx: {
                            '&.Mui-selected': {
                              backgroundColor: '#FFD700',
                              color: '#000000',
                              '&:hover': {
                                backgroundColor: '#FFD700'
                              }
                            }
                          }
                        },
                        calendarHeader: {
                          sx: {
                            '& .MuiPickersCalendarHeader-label': {
                              color: '#000000'
                            }
                          }
                        },
                        actionBar: {
                          sx: {
                            '& .MuiButton-root': {
                              color: '#FFD700'
                            }
                          }
                        }
                      }}
                      sx={{ 
                        width: '100%',
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: '#222222', 
                          color: 'white', 
                          '& fieldset': { borderColor: '#444444' }, 
                          '&:hover fieldset': { borderColor: '#FFD700' }, 
                          '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                        },
                        '& .MuiInputLabel-root': {
                          color: 'white'
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#FFD700'
                        },
                        '& .MuiFormHelperText-root': { 
                          color: '#f44336', 
                          marginLeft: 0 
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ color: '#FFD700' }} /> Civilité
                  </Typography>
                  <TextField 
                    name="civilite" 
                    variant="outlined" 
                    fullWidth 
                    value={newClient.civilite} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.civilite} 
                    helperText={clientErrors.civilite} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BadgeIcon sx={{ color: '#FFD700' }} /> CIN/Passport
                  </Typography>
                  <TextField 
                    name="cin_passport" 
                    variant="outlined" 
                    fullWidth 
                    value={newClient.cin_passport} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.cin_passport} 
                    helperText={clientErrors.cin_passport} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ color: '#FFD700' }} /> Téléphone
                  </Typography>
                  <TextField 
                    name="telephone" 
                    variant="outlined" 
                    fullWidth 
                    value={newClient.telephone} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.telephone} 
                    helperText={clientErrors.telephone} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ color: '#FFD700' }} /> Email
                  </Typography>
                  <TextField 
                    name="email" 
                    type="email"
                    variant="outlined" 
                    fullWidth 
                    value={newClient.email} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.email} 
                    helperText={clientErrors.email} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      }, 
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon sx={{ color: '#FFD700' }} /> Mot de passe
                  </Typography>
                  <TextField 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    variant="outlined" 
                    fullWidth 
                    value={newClient.password} 
                    onChange={handleClientChange} 
                    error={!!clientErrors.password} 
                    helperText={newClient.id ? (clientErrors.password || "Laisser vide pour conserver l'actuel") : (clientErrors.password || "Le mot de passe est obligatoire")} 
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
                        color: clientErrors.password ? '#f44336' : '#aaaaaa',
                        marginLeft: 0 
                      } 
                    }} 
                  />
                </Box>
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2, borderBottom: '1px solid #333', pb: 1 }}>
              Informations de la réservation
            </Typography>
            <Grid container spacing={2} sx={{ pt: 1 }}>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCarIcon sx={{ color: '#FFD700' }} /> Véhicule
                  </Typography>
                  <FormControl fullWidth variant="outlined" error={!!reservationErrors.vehicle} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                    <Select
                      name="vehicle"
                      value={newReservation.vehicle}
                      onChange={handleReservationChange}
                      displayEmpty
                      sx={{ color: 'white' }}
                    >
                      <MenuItem value=""><em>Sélectionner un véhicule</em></MenuItem>
                      {vehicles.map((vehicle) => (
                        <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {reservationErrors.vehicle && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(211, 47, 47, 0.1)', borderRadius: 1, border: '1px solid #d32f2f' }}>
                      <Typography variant="caption" color="error" sx={{ display: 'block', fontWeight: 'bold' }}>
                        {reservationErrors.vehicle}
                      </Typography>
                      {reservationErrors.availability && (
                        <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                          {reservationErrors.availability}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ color: '#FFD700' }} /> Date début
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label=""
                      value={newReservation.startDate ? (() => {
                        // Créer une date en s'assurant qu'elle est interprétée dans le fuseau horaire local
                        const dateParts = newReservation.startDate.split('-');
                        return new Date(dateParts[0], parseInt(dateParts[1])-1, parseInt(dateParts[2]));
                      })() : null}
                      format="dd/MM/yyyy"
                      disablePast
                      views={['day']}
                      onAccept={(newDate) => {
                        if (newDate) {
                          // Créer une date en utilisant directement les composants de la date sélectionnée
                          // pour éviter tout décalage de fuseau horaire
                          const selectedDay = newDate.getDate();
                          const selectedMonth = newDate.getMonth() + 1;
                          const selectedYear = newDate.getFullYear();
                          
                          // Formater la date au format YYYY-MM-DD en utilisant la date locale (pas UTC)
                          // Ajouter T00:00:00 pour s'assurer que la date est interprétée dans le fuseau horaire local
                          const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                          
                          // Vérifier si la date de fin existe et est antérieure à la nouvelle date de début
                          if (newReservation.endDate) {
                            // Créer des dates en s'assurant qu'elles sont interprétées dans le fuseau horaire local
                            const endDateParts = newReservation.endDate.split('-');
                            const endDate = new Date(endDateParts[0], parseInt(endDateParts[1])-1, parseInt(endDateParts[2]));
                            
                            const startDate = new Date(selectedYear, selectedMonth-1, selectedDay);
                            
                            if (endDate <= startDate) {
                              // Si la date de fin est antérieure ou égale à la nouvelle date de début,
                              // définir la date de fin à un jour après la date de début
                              const newEndDate = new Date(startDate);
                              newEndDate.setDate(newEndDate.getDate() + 1);
                              
                              const endYear = newEndDate.getFullYear();
                              const endMonth = String(newEndDate.getMonth() + 1).padStart(2, '0');
                              const endDay = String(newEndDate.getDate()).padStart(2, '0');
                              const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;
                              
                              // Mettre à jour à la fois la date de début et la date de fin
                              setNewReservation(prev => ({
                                ...prev,
                                startDate: formattedDate,
                                endDate: formattedEndDate
                              }));
                              
                              // Effacer les erreurs liées aux dates
                              setReservationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.startDate;
                                delete newErrors.endDate;
                                return newErrors;
                              });
                              
                              return;
                            }
                          }
                          
                          // Mettre à jour uniquement la date de début
                          handleReservationChange({
                            target: { name: 'startDate', value: formattedDate }
                          });
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: !!reservationErrors.startDate,
                          helperText: reservationErrors.startDate
                        },
                        day: {
                          sx: {
                            '&.Mui-selected': {
                              backgroundColor: '#FFD700',
                              color: '#000000',
                              '&:hover': {
                                backgroundColor: '#FFD700'
                              }
                            }
                          }
                        },
                        calendarHeader: {
                          sx: {
                            '& .MuiPickersCalendarHeader-label': {
                              color: '#000000'
                            }
                          }
                        },
                        actionBar: {
                          sx: {
                            '& .MuiButton-root': {
                              color: '#FFD700'
                            }
                          }
                        }
                      }}
                      sx={{ 
                        width: '100%',
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: '#222222', 
                          color: 'white', 
                          '& fieldset': { borderColor: '#444444' }, 
                          '&:hover fieldset': { borderColor: '#FFD700' }, 
                          '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                        },
                        '& .MuiInputLabel-root': {
                          color: 'white'
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#FFD700'
                        },
                        '& .MuiFormHelperText-root': { 
                          color: '#f44336', 
                          marginLeft: 0 
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarTodayIcon sx={{ color: '#FFD700' }} /> Date fin
                  </Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      label=""
                      value={newReservation.endDate ? (() => {
                        // Créer une date en s'assurant qu'elle est interprétée dans le fuseau horaire local
                        const dateParts = newReservation.endDate.split('-');
                        return new Date(dateParts[0], parseInt(dateParts[1])-1, parseInt(dateParts[2]));
                      })() : null}
                      format="dd/MM/yyyy"
                      disablePast
                      views={['day']}
                      minDate={newReservation.startDate ? (() => {
                        // Créer une date en s'assurant qu'elle est interprétée dans le fuseau horaire local
                        const dateParts = newReservation.startDate.split('-');
                        const startDate = new Date(dateParts[0], parseInt(dateParts[1])-1, parseInt(dateParts[2]));
                        // Ajouter un jour
                        startDate.setDate(startDate.getDate() + 1);
                        return startDate;
                      })() : undefined}
                      onAccept={(newDate) => {
                        if (newDate) {
                          // Créer une date en utilisant directement les composants de la date sélectionnée
                          // pour éviter tout décalage de fuseau horaire
                          const selectedDay = newDate.getDate();
                          const selectedMonth = newDate.getMonth() + 1;
                          const selectedYear = newDate.getFullYear();
                          
                          // Formater la date au format YYYY-MM-DD en utilisant la date locale (pas UTC)
                          const formattedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                          
                          // Vérifier si la date de début existe
                          if (newReservation.startDate) {
                            // Créer des dates en s'assurant qu'elles sont interprétées dans le fuseau horaire local
                            const startDateParts = newReservation.startDate.split('-');
                            const startDate = new Date(startDateParts[0], parseInt(startDateParts[1])-1, parseInt(startDateParts[2]));
                            
                            const endDate = new Date(selectedYear, selectedMonth-1, selectedDay);
                            
                            // S'assurer que la date de fin est postérieure à la date de début
                            if (endDate <= startDate) {
                              // Si la date de fin est antérieure ou égale à la date de début,
                              // définir la date de fin à un jour après la date de début
                              const newEndDate = new Date(startDate);
                              newEndDate.setDate(newEndDate.getDate() + 1);
                              
                              const endYear = newEndDate.getFullYear();
                              const endMonth = String(newEndDate.getMonth() + 1).padStart(2, '0');
                              const endDay = String(newEndDate.getDate()).padStart(2, '0');
                              const adjustedEndDate = `${endYear}-${endMonth}-${endDay}`;
                              
                              // Mettre à jour la date de fin ajustée
                              handleReservationChange({
                                target: { name: 'endDate', value: adjustedEndDate }
                              });
                              
                              return;
                            }
                          }
                          
                          // Mettre à jour la date de fin
                          handleReservationChange({
                            target: { name: 'endDate', value: formattedDate }
                          });
                        }
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          variant: 'outlined',
                          error: !!reservationErrors.endDate,
                          helperText: reservationErrors.endDate
                        },
                        day: {
                          sx: {
                            '&.Mui-selected': {
                              backgroundColor: '#FFD700',
                              color: '#000000',
                              '&:hover': {
                                backgroundColor: '#FFD700'
                              }
                            }
                          }
                        },
                        calendarHeader: {
                          sx: {
                            '& .MuiPickersCalendarHeader-label': {
                              color: '#000000'
                            }
                          }
                        },
                        actionBar: {
                          sx: {
                            '& .MuiButton-root': {
                              color: '#FFD700'
                            }
                          }
                        }
                      }}
                      sx={{ 
                        width: '100%',
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: '#222222', 
                          color: 'white', 
                          '& fieldset': { borderColor: '#444444' }, 
                          '&:hover fieldset': { borderColor: '#FFD700' }, 
                          '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                        },
                        '& .MuiInputLabel-root': {
                          color: 'white'
                        },
                        '& .MuiSvgIcon-root': {
                          color: '#FFD700'
                        },
                        '& .MuiFormHelperText-root': { 
                          color: '#f44336', 
                          marginLeft: 0 
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon sx={{ color: '#FFD700' }} /> Statut
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                    <Select
                      name="statut"
                      value={newReservation.statut}
                      onChange={handleReservationChange}
                      sx={{ color: 'white' }}
                    >
                      <MenuItem value="En attente">En attente</MenuItem>
                      <MenuItem value="Confirmée">Confirmée</MenuItem>
                      <MenuItem value="Annulée">Annulée</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddShoppingCartIcon sx={{ color: '#FFD700' }} /> Extra
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                    <Select
                      name="extra"
                      value={newReservation.extra}
                      onChange={handleReservationChange}
                      displayEmpty
                      sx={{ color: 'white' }}
                    >
                      <MenuItem value=""><em>Aucun extra</em></MenuItem>
                      {extras.map((extra) => (
                        <MenuItem key={extra.ExtraID} value={extra.ExtraID}>{extra.Nom}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCarIcon sx={{ color: '#FFD700' }} /> Lieu de départ
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                    <Select
                      name="lieuDepart"
                      value={newReservation.lieuDepart || ''}
                      onChange={handleReservationChange}
                      displayEmpty
                      sx={{ color: 'white' }}
                    >
                      <MenuItem value=""><em>Sélectionner un lieu</em></MenuItem>
                      {LOCATIONS.map((location) => (
                        <MenuItem key={location} value={location}>{location}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsCarIcon sx={{ color: '#FFD700' }} /> Lieu d'arrivée
                  </Typography>
                  <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                    <Select
                      name="lieuArrivee"
                      value={newReservation.lieuArrivee || ''}
                      onChange={handleReservationChange}
                      displayEmpty
                      sx={{ color: 'white' }}
                    >
                      <MenuItem value=""><em>Sélectionner un lieu</em></MenuItem>
                      {LOCATIONS.map((location) => (
                        <MenuItem key={location} value={location}>{location}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </>
        ) : null}
        
        {/* Formulaire de réservation */}
        {tabValue === 0 && !combinedMode && (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon sx={{ color: '#FFD700' }} /> Client
                </Typography>
                <FormControl fullWidth variant="outlined" error={!!reservationErrors.client} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                  <Select
                    name="client"
                    value={newReservation.client}
                    onChange={handleReservationChange}
                    displayEmpty
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="" disabled><em>Sélectionner un client</em></MenuItem>
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>{client.nom_complet}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {reservationErrors.client && <Typography variant="caption" color="error" sx={{ pl: 1 }}>{reservationErrors.client}</Typography>}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon sx={{ color: '#FFD700' }} /> Véhicule
                </Typography>
                <FormControl fullWidth variant="outlined" error={!!reservationErrors.vehicle} sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                  <Select
                    name="vehicle"
                    value={newReservation.vehicle}
                    onChange={handleReservationChange}
                    displayEmpty
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="" disabled><em>Sélectionner un véhicule</em></MenuItem>
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {reservationErrors.vehicle && <Typography variant="caption" color="error" sx={{ pl: 1 }}>{reservationErrors.vehicle}</Typography>}
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#FFD700' }} /> Date début
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label=""
                    value={newReservation.startDate ? new Date(newReservation.startDate) : null}
                    onChange={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split('T')[0];
                        handleReservationChange({
                          target: { name: 'startDate', value: formattedDate }
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        error: !!reservationErrors.startDate,
                        helperText: reservationErrors.startDate
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#FFD700',
                            color: '#000000',
                            '&:hover': {
                              backgroundColor: '#FFD700'
                            }
                          }
                        }
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-label': {
                            color: '#000000'
                          }
                        }
                      },
                      actionBar: {
                        sx: {
                          '& .MuiButton-root': {
                            color: '#FFD700'
                          }
                        }
                      }
                    }}
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      },
                      '& .MuiInputLabel-root': {
                        color: 'white'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#FFD700'
                      },
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#FFD700' }} /> Date fin
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label=""
                    value={newReservation.endDate ? new Date(newReservation.endDate) : null}
                    onChange={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split('T')[0];
                        handleReservationChange({
                          target: { name: 'endDate', value: formattedDate }
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        error: !!reservationErrors.endDate,
                        helperText: reservationErrors.endDate
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#FFD700',
                            color: '#000000',
                            '&:hover': {
                              backgroundColor: '#FFD700'
                            }
                          }
                        }
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-label': {
                            color: '#000000'
                          }
                        }
                      },
                      actionBar: {
                        sx: {
                          '& .MuiButton-root': {
                            color: '#FFD700'
                          }
                        }
                      }
                    }}
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      },
                      '& .MuiInputLabel-root': {
                        color: 'white'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#FFD700'
                      },
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon sx={{ color: '#FFD700' }} /> Statut
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                  <Select
                    name="statut"
                    value={newReservation.statut}
                    onChange={handleReservationChange}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="En attente">En attente</MenuItem>
                    <MenuItem value="Confirmée">Confirmée</MenuItem>
                    <MenuItem value="Annulée">Annulée</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddShoppingCartIcon sx={{ color: '#FFD700' }} /> Extra
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                  <Select
                    name="extra"
                    value={newReservation.extra}
                    onChange={handleReservationChange}
                    displayEmpty
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value=""><em>Aucun extra</em></MenuItem>
                    {extras.map((extra) => (
                      <MenuItem key={extra.ExtraID} value={extra.ExtraID}>{extra.Nom}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon sx={{ color: '#FFD700' }} /> Lieu de départ
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                  <Select
                    name="lieuDepart"
                    value={newReservation.lieuDepart || ''}
                    onChange={handleReservationChange}
                    displayEmpty
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value=""><em>Sélectionner un lieu</em></MenuItem>
                    {LOCATIONS.map((location) => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon sx={{ color: '#FFD700' }} /> Lieu d'arrivée
                </Typography>
                <FormControl fullWidth variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#222222', color: 'white', '& fieldset': { borderColor: '#444444' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } } }}>
                  <Select
                    name="lieuArrivee"
                    value={newReservation.lieuArrivee || ''}
                    onChange={handleReservationChange}
                    displayEmpty
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value=""><em>Sélectionner un lieu</em></MenuItem>
                    {LOCATIONS.map((location) => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        )}
        
        {/* Formulaire client */}
        {tabValue === 1 && !combinedMode && (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#FFD700' }} /> Nom Complet
                </Typography>
                <TextField 
                  name="nom_complet" 
                  variant="outlined" 
                  fullWidth 
                  value={newClient.nom_complet} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.nom_complet} 
                  helperText={clientErrors.nom_complet} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon sx={{ color: '#FFD700' }} /> Adresse
                </Typography>
                <TextField 
                  name="adresse" 
                  variant="outlined" 
                  fullWidth 
                  multiline
                  rows={2}
                  value={newClient.adresse} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.adresse} 
                  helperText={clientErrors.adresse} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CakeIcon sx={{ color: '#FFD700' }} /> Date de naissance
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label=""
                    value={newClient.dateNaissance ? new Date(newClient.dateNaissance) : null}
                    onChange={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split('T')[0];
                        handleClientChange({
                          target: { name: 'dateNaissance', value: formattedDate }
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        error: !!clientErrors.dateNaissance,
                        helperText: clientErrors.dateNaissance || 'Date de naissance (minimum 19 ans)'
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#FFD700',
                            color: '#000000',
                            '&:hover': {
                              backgroundColor: '#FFD700'
                            }
                          }
                        }
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-label': {
                            color: '#000000'
                          }
                        }
                      },
                      actionBar: {
                        sx: {
                          '& .MuiButton-root': {
                            color: '#FFD700'
                          }
                        }
                      }
                    }}
                    maxDate={(() => {
                      const today = new Date();
                      const minAgeDate = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
                      return minAgeDate;
                    })()}
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      },
                      '& .MuiInputLabel-root': {
                        color: 'white'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#FFD700'
                      },
                      '& .MuiFormHelperText-root': { 
                        color: clientErrors.dateNaissance && clientErrors.dateNaissance.includes('19 ans') ? '#ff9800' : '#aaa',
                        fontWeight: clientErrors.dateNaissance ? 'bold' : 'normal',
                        marginLeft: 0 
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DriveEtaIcon sx={{ color: '#FFD700' }} /> Numéro de permis
                </Typography>
                <TextField 
                  name="numPermis" 
                  variant="outlined" 
                  fullWidth 
                  value={newClient.numPermis} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.numPermis} 
                  helperText={clientErrors.numPermis} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon sx={{ color: '#FFD700' }} /> Date délivrance permis
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <DatePicker
                    label=""
                    value={newClient.dateDelivrancePermis ? new Date(newClient.dateDelivrancePermis) : null}
                    onChange={(date) => {
                      if (date) {
                        const formattedDate = date.toISOString().split('T')[0];
                        handleClientChange({
                          target: { name: 'dateDelivrancePermis', value: formattedDate }
                        });
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        error: !!clientErrors.dateDelivrancePermis,
                        helperText: clientErrors.dateDelivrancePermis
                      },
                      day: {
                        sx: {
                          '&.Mui-selected': {
                            backgroundColor: '#FFD700',
                            color: '#000000',
                            '&:hover': {
                              backgroundColor: '#FFD700'
                            }
                          }
                        }
                      },
                      calendarHeader: {
                        sx: {
                          '& .MuiPickersCalendarHeader-label': {
                            color: '#000000'
                          }
                        }
                      },
                      actionBar: {
                        sx: {
                          '& .MuiButton-root': {
                            color: '#FFD700'
                          }
                        }
                      }
                    }}
                    sx={{ 
                      width: '100%',
                      '& .MuiOutlinedInput-root': { 
                        backgroundColor: '#222222', 
                        color: 'white', 
                        '& fieldset': { borderColor: '#444444' }, 
                        '&:hover fieldset': { borderColor: '#FFD700' }, 
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                      },
                      '& .MuiInputLabel-root': {
                        color: 'white'
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#FFD700'
                      },
                      '& .MuiFormHelperText-root': { 
                        color: '#f44336', 
                        marginLeft: 0 
                      }
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#FFD700' }} /> Civilité
                </Typography>
                <TextField 
                  name="civilite" 
                  variant="outlined" 
                  fullWidth 
                  value={newClient.civilite} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.civilite} 
                  helperText={clientErrors.civilite} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BadgeIcon sx={{ color: '#FFD700' }} /> CIN/Passport
                </Typography>
                <TextField 
                  name="cin_passport" 
                  variant="outlined" 
                  fullWidth 
                  value={newClient.cin_passport} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.cin_passport} 
                  helperText={clientErrors.cin_passport} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: '#FFD700' }} /> Téléphone
                </Typography>
                <TextField 
                  name="telephone" 
                  variant="outlined" 
                  fullWidth 
                  value={newClient.telephone} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.telephone} 
                  helperText={clientErrors.telephone} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ color: '#FFD700' }} /> Email
                </Typography>
                <TextField 
                  name="email" 
                  type="email"
                  variant="outlined" 
                  fullWidth 
                  value={newClient.email} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.email} 
                  helperText={clientErrors.email} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LockIcon sx={{ color: '#FFD700' }} /> Mot de passe
                </Typography>
                <TextField 
                  name="password" 
                  type="password"
                  variant="outlined" 
                  fullWidth 
                  value={newClient.password} 
                  onChange={handleClientChange} 
                  error={!!clientErrors.password} 
                  helperText={clientErrors.password} 
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      backgroundColor: '#222222', 
                      color: 'white', 
                      '& fieldset': { borderColor: '#444444' }, 
                      '&:hover fieldset': { borderColor: '#FFD700' }, 
                      '&.Mui-focused fieldset': { borderColor: '#FFD700' } 
                    }, 
                    '& .MuiFormHelperText-root': { 
                      color: '#f44336', 
                      marginLeft: 0 
                    } 
                  }} 
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions sx={{ backgroundColor: '#000000', px: 4, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            <FormControlLabel
              control={
                <Switch 
                  checked={combinedMode}
                  onChange={toggleCombinedMode}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FFD700',
                      '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.08)' }
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FFD700'
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography sx={{ color: '#FFD700', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    Mode combiné
                  </Typography>
                  <Typography sx={{ color: '#AAA', fontSize: '0.7rem' }}>
                    Ajouter un client et sa réservation en même temps
                  </Typography>
                </Box>
              }
              sx={{ color: '#FFD700' }}
            />
          </Box>
          <Box>
            <Button 
              onClick={handleClose} 
              sx={{ 
                color: '#FFD700',
                mr: 2
              }}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              sx={{ 
                backgroundColor: '#FFD700', 
                color: '#000000', 
                '&:hover': { backgroundColor: '#E6C200' },
                fontWeight: 'bold'
              }}
            >
              {combinedMode 
                ? (isEditing ? 'Mettre à jour les deux' : 'Enregistrer les deux') 
                : (isEditing ? 'Mettre à jour' : 'Enregistrer')}
            </Button>
            {loading && (
              <CircularProgress 
                size={24} 
                sx={{ 
                  color: '#FFD700', 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  marginTop: '-12px', 
                  marginLeft: '-12px' 
                }} 
              />
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
      
      {/* Toast de notification */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            fontWeight: 'bold',
            fontSize: '1rem',
            backgroundColor: toast.severity === 'error' ? '#d32f2f' : undefined
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddReservationClientDialog;
