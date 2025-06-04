import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SettingsIcon from '@mui/icons-material/Settings';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AlertTitle } from '@mui/material';
import reservationDataService from '../../services/reservationDataService';
import reservationService from '../../services/reservationService';
import voitureService from '../../services/voitureService';
import authService from '../../services/authService';
import clientService from '../../services/clientService';

const Profile = () => {
  const navigate = useNavigate();
  const [reservationData, setReservationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Fonction pour récupérer l'historique des réservations du client
  const fetchReservationHistory = async () => {
    try {
      setLoadingHistory(true);
      
      if (user && user.id) {
        // Récupérer les réservations depuis l'API
        const history = await reservationService.getReservationsByClientId(user.id);
        
        // Pour chaque réservation, récupérer les détails du véhicule
        const reservationsWithDetails = await Promise.all(history.map(async (reservation) => {
          try {
            if (reservation.VoitureID) {
              const vehiculeDetails = await voitureService.getVoitureById(reservation.VoitureID);
              return { ...reservation, vehiculeDetails };
            }
            return reservation;
          } catch (error) {
            console.error(`Erreur lors de la récupération des détails du véhicule ${reservation.VoitureID}:`, error);
            return reservation;
          }
        }));
        
        setReservationHistory(reservationsWithDetails);
      } else {
        setReservationHistory([]);
      }
      
      setLoadingHistory(false);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des réservations:', error);
      setLoadingHistory(false);
    }
  };

  // État pour gérer les champs manquants et l'alerte
  const [fromReservation, setFromReservation] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [showMissingFieldsAlert, setShowMissingFieldsAlert] = useState(false);
  const [pendingReservation, setPendingReservation] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  
  // Fonction pour retourner à la réservation après avoir complété le profil
  const returnToReservation = () => {
    // Nettoyer les indicateurs de réservation en attente
    localStorage.removeItem('fromReservation');
    localStorage.removeItem('missingFields');
    
    // Rediriger vers la page de réservation
    navigate('/reserver');
  };
  
  // Fonction pour retourner à la page de réservation
  // Cette fonction est utilisée par le bouton "Continuer la réservation"
  
  // Initialiser l'historique des réservations au chargement de la page
  useEffect(() => {
    if (user && user.id) {
      fetchReservationHistory();
    }
  }, [user]);
  
  // Préparer les données de réservation pour l'affichage
  const getReservationData = () => {
    if (!pendingReservation || !user) return null;
    
    // Calculer le prix total
    const dureeJours = pendingReservation.dureeJours || 7;
    const prixVehicule = pendingReservation.vehicule?.price || pendingReservation.vehiculeDetails?.Prix || 450;
    const totalVehicule = prixVehicule * dureeJours;
    
    // Calculer le total des extras
    let totalExtras = 0;
    if (pendingReservation.extras && pendingReservation.extras.length > 0) {
      totalExtras = pendingReservation.extras.reduce((sum, extra) => {
        const prixExtra = extra.Prix || extra.prix || 0;
        return sum + (prixExtra * dureeJours);
      }, 0);
    } else {
      // Utiliser les extras par défaut
      totalExtras = (70 + 20 + 80) * dureeJours; // Siège bébé + Chargeur USB + Coffre de toit
    }
    
    // Afficher les données pour le débogage
    console.log('Données de réservation en attente:', pendingReservation);
    
    // Extraire l'ID du premier extra s'il existe
    let extraID = null;
    if (pendingReservation.extras && pendingReservation.extras.length > 0) {
      extraID = pendingReservation.extras[0].id || pendingReservation.extras[0].ExtraID;
    }
    
    // S'assurer que les lieux de départ et d'arrivée sont correctement formatés
    const lieuDepart = pendingReservation.lieuDepart || 
                      pendingReservation.lieuPriseEnCharge || 
                      'Agence principale';
                      
    const lieuArrivee = pendingReservation.lieuRetour || 
                       pendingReservation.lieuArrivee || 
                       'Agence principale';
    
    // Afficher les lieux pour le débogage
    console.log('Lieu de départ:', lieuDepart);
    console.log('Lieu d\'arrivée:', lieuArrivee);
    
    // Créer l'objet de données de réservation
    const reservationObj = {
      ClientID: user.id,
      VoitureID: pendingReservation.vehicule?.id || pendingReservation.vehicule?.VoitureID || pendingReservation.vehiculeDetails?.id || pendingReservation.vehiculeDetails?.VoitureID,
      DateDébut: pendingReservation.dateDepart || pendingReservation.dateDebut || new Date().toISOString(),
      DateFin: pendingReservation.dateRetour || pendingReservation.dateFin || new Date(new Date().setDate(new Date().getDate() + dureeJours)).toISOString(),
      LieuDepart: lieuDepart,
      LieuArrivee: lieuArrivee,
      Statut: 'En attente',
      DateReservation: new Date().toISOString(),
      PrixTotal: totalVehicule + totalExtras,
      ExtraID: extraID
    };
    
    return reservationObj;
  };
  
  // Fonction pour confirmer la réservation
  const handleConfirmReservation = async () => {
    if (!user || !user.id) {
      setConfirmError('Vous devez être connecté pour confirmer une réservation.');
      return;
    }
    
    if (!pendingReservation) {
      setConfirmError('Aucune réservation en attente à confirmer.');
      return;
    }
    
    try {
      setConfirmLoading(true);
      setConfirmError('');
      
      // Afficher les données de la réservation en attente pour le débogage
      console.log('Données de la réservation en attente:', pendingReservation);
      console.log('Lieu de départ dans pendingReservation:', pendingReservation.lieuDepart);
      
      // Créer directement l'objet de réservation ici pour s'assurer que tous les champs sont correctement définis
      const dureeJours = pendingReservation.dureeJours || 7;
      
      // S'assurer que les lieux de départ et d'arrivée sont correctement récupérés de toutes les sources possibles
      const lieuDepart = pendingReservation.lieuPrise || 
                        pendingReservation.lieuPrise || 
                        pendingReservation.lieuPriseEnCharge || 
                        'Agence principale';
                        
      const lieuArrivee = pendingReservation.lieuRetour || 
                         pendingReservation.LieuArrivee || 
                         pendingReservation.lieuArrivee || 
                         'Agence principale';
      
      console.log('Lieu de départ récupéré après vérification:', lieuDepart);
      console.log('Lieu d\'arrivée récupéré après vérification:', lieuArrivee);
      
      // Préparer les données de réservation
      const reservationData = {
        ClientID: user.id,
        VoitureID: pendingReservation.vehicule?.id || pendingReservation.vehicule?.VoitureID || pendingReservation.vehiculeDetails?.id || pendingReservation.vehiculeDetails?.VoitureID,
        DateDébut: pendingReservation.dateDepart || pendingReservation.dateDebut || new Date().toISOString(),
        DateFin: pendingReservation.dateRetour || pendingReservation.dateFin || new Date(new Date().setDate(new Date().getDate() + dureeJours)).toISOString(),
        LieuDepart: lieuDepart, // Utiliser la variable lieuDepart qui a vérifié toutes les sources possibles
        LieuArrivee: lieuArrivee, // Utiliser la variable lieuArrivee qui a vérifié toutes les sources possibles
        Statut: 'En attente',
        PrixTotal: pendingReservation.prixTotal || 0,
        ExtraID: pendingReservation.extras && pendingReservation.extras.length > 0 ? (pendingReservation.extras[0].id || pendingReservation.extras[0].ExtraID) : null
      };
      
      // S'assurer que les champs sont correctement nommés pour correspondre au modèle du backend
      // Le backend attend 'LieuDepart' et non 'lieuDepart'
      if (reservationData.lieuDepart && !reservationData.LieuDepart) {
        reservationData.LieuDepart = reservationData.lieuDepart;
        delete reservationData.lieuDepart;
      }
    
      // Le backend attend 'LieuArrivee' et non 'lieuArrivee'
      if (reservationData.lieuArrivee && !reservationData.LieuArrivee) {
        reservationData.LieuArrivee = reservationData.lieuArrivee;
        delete reservationData.lieuArrivee;
      }
      
      if (!reservationData) {
        throw new Error('Impossible de préparer les données de réservation.');
      }
      
      // Afficher les données qui seront envoyées à l'API
      console.log('Données qui seront envoyées à l\'API:', reservationData);
      console.log('LieuDepart envoyé:', reservationData.LieuDepart);
      
      // Appeler l'API pour créer la réservation
      const response = await reservationService.createReservation(reservationData);
      
      console.log('Réponse de l\'API après création de la réservation:', response);
      
      // Nettoyer les données de réservation en attente
      reservationDataService.clearPendingReservationByClientId(user.id);
      localStorage.removeItem('pendingReservation');
      
      // Afficher le message de succès
      setConfirmSuccess(true);
      
      // Rediriger vers l'historique des réservations après 3 secondes
      setTimeout(() => {
        setActiveTab('history');
        fetchReservationHistory(); // Rafraîchir l'historique
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      setConfirmError(error.message || 'Une erreur est survenue lors de la confirmation de la réservation.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Définir la fonction fetchCompleteUserData en dehors de useEffect pour pouvoir l'appeler ailleurs
  const fetchCompleteUserData = async () => {
    try {
      // Récupérer l'utilisateur connecté depuis le localStorage pour avoir les données les plus récentes
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        console.error('Aucun utilisateur connecté trouvé ou ID manquant');
        navigate('/login');
        return;
      }
      
      console.log('Récupération des données client complètes pour l\'ID:', currentUser.id);
      setLoading(true); // Indiquer le chargement
      
      try {
        const clientInfo = await clientService.getClientById(currentUser.id);
        console.log('Données client complètes récupérées:', clientInfo);
        
        if (clientInfo) {
          // Combiner les données utilisateur existantes avec les nouvelles données
          const updatedUser = {
            ...currentUser,
            ...clientInfo,
            // S'assurer que les champs essentiels sont présents avec les bonnes clés
            civilite: clientInfo.civilite || clientInfo.Civilité || currentUser.civilite,
            cinPassport: clientInfo.cinPassport || clientInfo.CIN_Passport || currentUser.cinPassport,
            dateNaissance: clientInfo.dateNaissance || clientInfo.DateNaissance || currentUser.dateNaissance,
            numeroPermit: clientInfo.numeroPermit || clientInfo.NumPermis || clientInfo.numPermis || currentUser.numeroPermit || currentUser.numPermis,
            datePermit: clientInfo.datePermit || clientInfo.DateDelivrancePermis || clientInfo.dateDelivrancePermis || currentUser.datePermit || currentUser.dateDelivrancePermis,
            adresse: clientInfo.adresse || clientInfo.Adresse || currentUser.adresse
          };
          
          console.log('Données utilisateur mises à jour avec les informations complètes:', updatedUser);
          
          // Mettre à jour l'état de l'utilisateur avec les données complètes
          setUser(updatedUser);
          
          // Mettre à jour le localStorage avec les données complètes
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données client complètes:', error);
        setUser(currentUser);
      } finally {
        setLoading(false); // Fin du chargement
      }
      
      // Récupérer les champs manquants s'ils existent
      const storedMissingFields = localStorage.getItem('missingFields');
      if (storedMissingFields) {
        const parsedMissingFields = JSON.parse(storedMissingFields);
        setMissingFields(parsedMissingFields);
        setShowMissingFieldsAlert(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir manuellement les données
  const handleRefresh = () => {
    console.log('Rafraîchissement manuel des données...');
    fetchCompleteUserData();
    fetchReservationHistory();
  };
  
  // Charger les données utilisateur au chargement de la page
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
    fetchCompleteUserData();
    fetchReservationHistory();
    
    // Vérifier si l'utilisateur vient du processus de réservation
    const isFromReservation = localStorage.getItem('fromReservation') === 'true';
    setFromReservation(isFromReservation);
    
    // Récupérer les données de réservation en attente pour ce client spécifique
    if (currentUser && currentUser.id) {
      // D'abord essayer de récupérer depuis le localStorage pour l'affichage immédiat
      const storedPendingReservation = localStorage.getItem('pendingReservation');
      if (storedPendingReservation) {
        const parsedPendingReservation = JSON.parse(storedPendingReservation);
        setPendingReservation(parsedPendingReservation);
      } else {
        // Si pas de réservation dans le localStorage, essayer de récupérer depuis le stockage spécifique au client
        const clientPendingReservation = reservationDataService.getPendingReservationByClientId(currentUser.id);
        if (clientPendingReservation) {
          setPendingReservation(clientPendingReservation);
          // Mettre à jour le localStorage pour l'affichage actuel
          localStorage.setItem('pendingReservation', JSON.stringify(clientPendingReservation));
        }
      }
    }
    // Créer un intervalle pour rafraîchir automatiquement les données toutes les 2 secondes
    // Cela permettra de voir les modifications sans avoir à actualiser la page
    const refreshInterval = setInterval(() => {
      console.log('Rafraîchissement automatique des données...');
      fetchCompleteUserData();
    }, 2000);
    
    // Nettoyer l'intervalle lorsque le composant est démonté
    return () => clearInterval(refreshInterval);
  }, [navigate]);
  
  // Ajouter un effet pour détecter quand l'utilisateur revient à la page de profil
  useEffect(() => {
    // Fonction pour rafraîchir les données quand la page devient visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page visible, rafraîchissement des données...');
        fetchCompleteUserData();
        fetchReservationHistory();
      }
    };
    
    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Nettoyer l'écouteur d'événements
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  // Récupérer les données de réservation et l'utilisateur connecté
  useEffect(() => {
    const fetchData = async () => {
      // Déclarer currentUser en dehors du bloc try pour qu'il soit accessible dans tout le scope de fetchData
      let currentUser = null;
      
      try {
        // Récupérer l'utilisateur connecté depuis le localStorage
        currentUser = authService.getCurrentUser();
        
        if (!currentUser) {
          console.error('Aucun utilisateur connecté trouvé');
          navigate('/login'); // Rediriger vers la page de connexion si aucun utilisateur n'est connecté
          return;
        }
        
        // Mettre à jour l'état de l'utilisateur
        setUser(currentUser);
        
        // Si l'utilisateur est un client, récupérer ses informations complètes
        if (currentUser.id || currentUser.UserID) {
          try {
            // Utiliser l'ID utilisateur pour récupérer les informations client
            const userId = currentUser.id || currentUser.UserID;
            console.log('Récupération des données client pour l\'utilisateur ID:', userId);
            
            // Récupérer les informations complètes du client depuis l'API
            const response = await clientService.getClientById(userId);
            const clientInfo = Array.isArray(response) && response.length > 0 ? response[0] : response;
            
            console.log('Données client reçues:', clientInfo);
            
            if (clientInfo) {
              // Mettre à jour les informations de l'utilisateur avec les données fraîches
              if (clientInfo) {
                // Combiner les données utilisateur existantes avec les nouvelles données
                const updatedUser = {
                  ...currentUser,
                  ...clientInfo,
                  // S'assurer que les champs essentiels sont présents
                  nom: clientInfo.Nom || clientInfo.nom || currentUser.Nom || currentUser.nom || 'Client',
                  prenom: clientInfo.Prenom || clientInfo.prenom || currentUser.Prenom || currentUser.prenom || 'BKM',
                  email: clientInfo.Email || clientInfo.email || currentUser.Email || currentUser.email,
                  telephone: clientInfo.Telephone || clientInfo.telephone || currentUser.Telephone || currentUser.telephone
                };
                
                // Mettre à jour le localStorage avec les données fraîches
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Mettre à jour l'état de l'utilisateur
                setUser(updatedUser);
              }
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des informations client:', error);
          }
        }
        
        // Récupérer les données de réservation
        const data = reservationDataService.getReservationData();
        let updatedData = { ...data };
        
        // Si nous avons un ID de client dans les données de réservation, utiliser les informations de l'utilisateur connecté
        if (data && currentUser) {
          updatedData = {
            ...updatedData,
            clientId: currentUser.id || currentUser.UserID,
            nom: currentUser.nom || currentUser.Nom,
            prenom: currentUser.prenom || currentUser.Prenom,
            email: currentUser.email || currentUser.Email,
            telephone: currentUser.telephone || currentUser.Telephone
          };
          
          // Sauvegarder les données mises à jour dans le localStorage
          reservationDataService.saveReservationData(updatedData);
        }
        
        // Si nous avons un ID de véhicule mais pas les détails complets, essayons de les récupérer
        if (data && data.vehicule && (!data.vehiculeDetails || !data.vehiculeDetails.Prix)) {
          try {
            // Récupérer les détails du véhicule depuis l'API
            const vehicleDetails = await voitureService.getVoitureById(data.vehicule);
            
            // Mettre à jour les données de réservation avec les détails du véhicule
            updatedData = {
              ...updatedData,
              vehiculeDetails: vehicleDetails
            };
            
            // Détails du véhicule récupérés avec succès
          } catch (error) {
            console.error('Erreur lors de la récupération des détails du véhicule:', error);
          }
        }
        
        // Si nous avons des extras, normalisons leur format pour un traitement cohérent
        if (data && data.extras && data.extras.length > 0) {
          console.log('Extras avant normalisation:', data.extras);
          
          const normalizedExtras = data.extras.map(extra => {
            // Créer une copie normalisée de l'extra
            const normalizedExtra = { ...extra };
            
            // S'assurer que nous avons un nom normalisé
            if (!normalizedExtra.Nom && normalizedExtra.nom) {
              normalizedExtra.Nom = normalizedExtra.nom;
            } else if (!normalizedExtra.nom && normalizedExtra.Nom) {
              normalizedExtra.nom = normalizedExtra.Nom;
            }
            
            // S'assurer que nous avons un prix normalisé
            if (!normalizedExtra.Prix && normalizedExtra.prix !== undefined) {
              normalizedExtra.Prix = normalizedExtra.prix;
            } else if (!normalizedExtra.prix && normalizedExtra.Prix !== undefined) {
              normalizedExtra.prix = normalizedExtra.Prix;
            }
            
            // Si le prix est toujours manquant, ajouter un prix par défaut selon le type d'extra
            if (normalizedExtra.Prix === undefined) {
              if (normalizedExtra.Nom === 'Wi-Fi mobile' || normalizedExtra.nom === 'Wi-Fi mobile') {
                normalizedExtra.Prix = 150;
              } else if (normalizedExtra.Nom === 'Conducteur additionnel' || normalizedExtra.nom === 'Conducteur additionnel') {
                normalizedExtra.Prix = 200;
              } else {
                normalizedExtra.Prix = 100; // Prix par défaut
              }
            }
            
            return normalizedExtra;
          });
          
          updatedData = {
            ...updatedData,
            extras: normalizedExtras
          };
          
          console.log('Extras après normalisation:', updatedData.extras);
        }
        
        // Sauvegarder les données mises à jour
        reservationDataService.saveReservationData(updatedData);
        setReservationData(updatedData);
        
        // Récupérer l'utilisateur connecté ou créer un utilisateur temporaire
        currentUser = authService.getCurrentUser();
        
        // Si nous avons des données de réservation, les utiliser pour enrichir les infos utilisateur
        if (data && (data.nom || data.prenom || data.email || data.telephone)) {
          // Créer un objet utilisateur avec les données de réservation
          currentUser = {
            ...currentUser, // Garder les infos existantes
            id: currentUser?.id || data.clientId || 'client-id',
            nom: data.nom || currentUser?.nom || 'Client',
            prenom: data.prenom || currentUser?.prenom || 'BKM',
            email: data.email || currentUser?.email || 'client@bkrental.com',
            telephone: data.telephone || currentUser?.telephone || '+212 5XX XXX XXX'
          };
          
          // Mettre à jour le localStorage avec les données enrichies
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          // Mettre à jour l'état de l'utilisateur
          setUser(currentUser);
          
          console.log('Données utilisateur enrichies avec les infos de réservation');
        }
        // Sinon, si l'utilisateur est connecté, utiliser ses données
        else if (currentUser && currentUser.id) {
          try {
            // Récupérer les informations à jour du client depuis l'API
            const clientData = await clientService.getClientById(currentUser.id);
            // Données client connecté récupérées
            
            // Mettre à jour les informations de l'utilisateur avec les données fraîches
            if (clientData) {
              // Combiner les données utilisateur existantes avec les nouvelles données
              const updatedUser = {
                ...currentUser,
                ...clientData,
                // S'assurer que les champs essentiels sont présents
                nom: clientData.Nom || clientData.nom || currentUser.Nom || currentUser.nom || 'Client',
                prenom: clientData.Prenom || clientData.prenom || currentUser.Prenom || currentUser.prenom || 'BKM',
                email: clientData.Email || clientData.email || currentUser.Email || currentUser.email,
                telephone: clientData.Telephone || clientData.telephone || currentUser.Telephone || currentUser.telephone
              };
              
              // Mettre à jour le localStorage avec les données fraîches
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              // Mettre à jour l'état de l'utilisateur
              setUser(updatedUser);
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des données client connecté:', error);
          }
        }
        // Sinon, créer un utilisateur temporaire avec les données de réservation
        else {
          // Création d'un profil temporaire avec les données de réservation
          currentUser = {
            id: 'temp-user-id',
            nom: data?.nom || 'Client',
            prenom: data?.prenom || 'BKM',
            email: data?.email || 'client@bkrental.com',
            telephone: data?.telephone || '+212 5XX XXX XXX'
          };
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        // En cas d'erreur, créer un utilisateur par défaut
        currentUser = {
          id: 'temp-user-id',
          nom: 'Client',
          prenom: 'BKM',
          email: 'client@bkrental.com',
          telephone: '+212 5XX XXX XXX'
        };
        setUser(currentUser);
      }
      
      // Si l'utilisateur est connecté, récupérer son historique de réservations
      if (currentUser && currentUser.id) {
        fetchReservationHistory();
      }
    };

    fetchData();
  }, [navigate]);

  // Fonction pour formater les dates (seulement la date, sans l'heure)
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    
    const date = new Date(dateString);
    
    // Format de la date uniquement (JJ/MM/AAAA)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Fonction pour calculer la durée de la location en jours
  const calculateDuration = () => {
    // Vérifier d'abord si nous avons une réservation en attente
    if (pendingReservation) {
      // Essayer différentes combinaisons de noms de propriétés pour les dates
      const dateDepart = pendingReservation.dateDepart || pendingReservation.dateDebut;
      const dateRetour = pendingReservation.dateRetour || pendingReservation.dateFin;
      
      if (dateDepart && dateRetour) {
        const dateDebut = new Date(dateDepart);
        const dateFin = new Date(dateRetour);
        
        const diffTime = Math.abs(dateFin - dateDebut);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('Durée calculée:', diffDays, 'jours');
        return diffDays || 1; // Minimum 1 jour si le calcul donne 0
      }
    }
    
    // Pour reservationData (si pendingReservation n'est pas disponible)
    if (reservationData?.dateDepart && reservationData?.dateRetour) {
      const dateDepart = new Date(reservationData.dateDepart);
      const dateRetour = new Date(reservationData.dateRetour);
      
      const diffTime = Math.abs(dateRetour - dateDepart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays || 1; // Minimum 1 jour si le calcul donne 0
    }
    
    return 1; // Retourne 1 jour par défaut si aucune date n'est disponible
  };
  
  // Calculer le prix du véhicule par jour
  const getVehiclePricePerDay = () => {
    // Vérifier les données disponibles pour le débogage
    console.log('Données du véhicule pour prix:', reservationData?.vehiculeDetails);
    
    // Essayer différentes sources pour le prix
    if (reservationData?.vehiculeDetails?.Prix) {
      return reservationData.vehiculeDetails.Prix;
    } else if (reservationData?.vehiculeDetails?.PrixJour) {
      return reservationData.vehiculeDetails.PrixJour;
    } else if (reservationData?.prixVehicule) {
      return reservationData.prixVehicule;
    } else if (reservationData?.prixJour) {
      return reservationData.prixJour;
    } else {
      // Prix par défaut si aucune information n'est disponible
      return 450;
    }
  };
  
  // Calculer le prix total du véhicule
  const getVehicleTotalPrice = () => {
    return getVehiclePricePerDay() * calculateDuration();
  };
  
  // Calculer le prix total des extras
  const getExtrasTotalPrice = () => {
    if (!reservationData.extras || reservationData.extras.length === 0) return 0;
    
    return reservationData.extras.reduce((sum, extra) => {
      // Récupérer le prix de l'extra, quelle que soit la propriété utilisée
      const extraPrix = extra.Prix !== undefined ? extra.Prix : (extra.prix !== undefined ? extra.prix : 0);
      
      // Tous les extras sont facturés par jour
      const totalExtraPrice = extraPrix * calculateDuration();
      return sum + totalExtraPrice;
    }, 0);
  };
  
  // Calculer le prix total de la réservation
  const getTotalPrice = () => {
    return getVehicleTotalPrice() + getExtrasTotalPrice();
  };

  // Si les données ne sont pas encore chargées
  if (!reservationData && !error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Votre réservation a été confirmée avec succès! Vous allez être redirigé vers la page d'accueil...
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {showMissingFieldsAlert && fromReservation && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={returnToReservation}
              disabled={missingFields.length > 0}
            >
              Retourner à la réservation
            </Button>
          }
        >
          <Typography variant="subtitle1" gutterBottom>
            Veuillez compléter les informations suivantes pour finaliser votre réservation :
          </Typography>
          <ul>
            {missingFields.map((field) => (
              <li key={field}>
                {field === 'civilite' && 'Civilité'}
                {field === 'cinPassport' && 'CIN/Passport'}
                {field === 'dateNaissance' && 'Date de naissance'}
                {field === 'numPermis' && 'Numéro de permis'}
                {field === 'dateDelivrancePermis' && 'Date de délivrance du permis'}
                {field === 'adresse' && 'Adresse'}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold',
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: '-10px',
          left: 0,
          width: '60px',
          height: '4px',
          backgroundColor: 'secondary.main'
        }
      }}>
        Mon Profil
      </Typography>

      {/* La section "Actions Rapides" a été supprimée */}

      <Grid container spacing={4}>
        {/* Informations personnelles */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ 
            height: '100%', 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}>
            <Box sx={{ 
              p: 2.5, 
              background: 'linear-gradient(to right, #2196f3, #1976d2)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: '0.5px',
              }}>
                <Box component="span" sx={{ 
                  mr: 1.5, 
                  p: 0.75, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon sx={{ fontSize: 20, color: 'white' }} />
                </Box>
                Informations personnelles
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    bgcolor: 'primary.main',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                    mr: 2
                  }}
                >
                  {(user?.prenom?.charAt(0) || user?.Prenom?.charAt(0) || 'C')}
                  {(user?.nom?.charAt(0) || user?.Nom?.charAt(0) || 'B')}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {user?.prenom || user?.Prenom || 'Client'} {user?.nom || user?.Nom || 'BKM'}
                  </Typography>
                  <Chip 
                    label="Client" 
                    size="small" 
                    color="primary" 
                    sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Email
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {user?.email || user?.Email || 'Non spécifié'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Téléphone
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {user?.telephone || user?.Telephone || 'Non spécifié'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <PersonIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Civilité
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {user?.civilite || user?.Civilite || user?.Civilité || 'Non spécifié'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <ReceiptIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  CIN/Passport
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {user?.cinPassport || user?.CinPassport || user?.CIN_Passport || 'Non spécifié'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <DateRangeIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Date de naissance
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {(() => {
                    const dateValue = user?.dateNaissance || user?.DateNaissance;
                    if (!dateValue) return 'Non spécifié';
                    try {
                      return new Date(dateValue).toLocaleDateString();
                    } catch (e) {
                      console.error('Erreur lors du formatage de la date de naissance:', e);
                      return dateValue;
                    }
                  })()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <DirectionsCarIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Numéro de permis
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {user?.numeroPermit || user?.numPermis || user?.NumPermis || 'Non spécifié'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <DateRangeIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Date de délivrance du permis
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {(() => {
                    const dateValue = user?.datePermit || user?.dateDelivrancePermis || user?.DateDelivrancePermis;
                    if (!dateValue) return 'Non spécifié';
                    try {
                      return new Date(dateValue).toLocaleDateString();
                    } catch (e) {
                      console.error('Erreur lors du formatage de la date de délivrance du permis:', e);
                      return dateValue;
                    }
                  })()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 500
                }}>
                  <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  Adresse
                </Typography>
                <Typography variant="body1" sx={{ pl: 3.5 }}>
                  {user?.adresse || user?.Adresse || 'Non spécifié'}
                </Typography>
              </Box>
              
              {/* Les sections conditionnelles ont été supprimées pour éviter les doublons */}

              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  startIcon={<EditIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.2,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.25)'
                    }
                  }}
                  onClick={() => navigate('/edit-profile')}
                >
                  Modifier mon profil
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Détails de la réservation en attente */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Message de bienvenue si l'utilisateur vient de la page de réservation */}
            {localStorage.getItem('fromReservation') === 'true' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Bienvenue dans votre espace personnel</AlertTitle>
                Voici le récapitulatif de votre réservation. Veuillez vérifier les détails et confirmer votre réservation.
              </Alert>
            )}
            
            {/* Afficher la réservation en attente si elle existe */}
            {pendingReservation ? (
              <>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '50px',
                    height: '3px',
                    backgroundColor: 'secondary.main'
                  }
                }}>
                  RÉCAPITULATIF DE RÉSERVATION
                </Typography>
                
                {/* Affichage similaire à la photo */}
                <Box sx={{ mb: 4 }}>
                  {/* En-tête avec image et nom du véhicule */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    {/* Image du véhicule */}
                    <Box sx={{ width: 150, mr: 3 }}>
                      {(() => {
                        // Débogage pour voir les données du véhicule
                        console.log('Données de réservation:', pendingReservation);
                        
                        const vehicule = pendingReservation.vehicule || {};
                        const vehiculeDetails = pendingReservation.vehiculeDetails || {};
                        
                        console.log('Véhicule:', vehicule);
                        console.log('VehiculeDetails:', vehiculeDetails);
                        
                        // Déterminer l'ID du véhicule
                        const vehiculeId = 
                          (vehicule && (vehicule.id || vehicule.VoitureID)) || 
                          (vehiculeDetails && (vehiculeDetails.id || vehiculeDetails.VoitureID)) || 
                          1;
                        
                        console.log('ID du véhicule utilisé pour l\'image:', vehiculeId);
                        
                        // Construire l'URL de l'image - Utiliser l'extension .jpg
                        const imageUrl = 
                          (vehiculeDetails && vehiculeDetails.ImageURL) ? vehiculeDetails.ImageURL :
                          (vehicule && vehicule.ImageURL) ? vehicule.ImageURL :
                          `http://localhost:4000/uploads/vehicules/voiture-${vehiculeId}.jpg`;
                        
                        console.log('URL de l\'image:', imageUrl);
                        
                        // Essayer plusieurs formats d'image si le premier échoue
                        const tryMultipleImageFormats = (e) => {
                          // Si l'image .jpg échoue, essayer .png
                          if (e.target.src.endsWith('.jpg')) {
                            console.log('Tentative avec format PNG...');
                            e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${vehiculeId}.png`;
                          } 
                          // Si l'image .png échoue, essayer sans extension
                          else if (e.target.src.endsWith('.png')) {
                            console.log('Tentative sans extension...');
                            e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${vehiculeId}`;
                          }
                          // Si toutes les tentatives échouent, afficher l'icône de secours
                          else {
                            e.target.onerror = null; // Prévenir les boucles infinies
                            e.target.style.display = 'none';
                            // Afficher l'icône de secours dans le parent
                            const parent = e.target.parentNode;
                            const fallbackIcon = document.createElement('div');
                            fallbackIcon.style.width = '100%';
                            fallbackIcon.style.height = '100px';
                            fallbackIcon.style.borderRadius = '8px';
                            fallbackIcon.style.display = 'flex';
                            fallbackIcon.style.alignItems = 'center';
                            fallbackIcon.style.justifyContent = 'center';
                            fallbackIcon.style.backgroundColor = '#f5f5f5';
                            fallbackIcon.style.border = '1px solid #e0e0e0';
                            fallbackIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>';
                            parent.appendChild(fallbackIcon);
                          }
                        };
                        
                        if (pendingReservation.vehicule || pendingReservation.vehiculeDetails) {
                          return (
                            <img 
                              src={imageUrl}
                              alt={(vehicule && (vehicule.Nom || vehicule.name || vehicule.Marque)) || 
                                (vehiculeDetails && (vehiculeDetails.Nom || vehiculeDetails.name || vehiculeDetails.Marque)) || 'Véhicule'} 
                              style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', height: '100px' }}
                              onError={tryMultipleImageFormats}
                            />
                          );
                        } else {
                          return (
                            <Box 
                              sx={{ 
                                width: '100%', 
                                height: '100px', 
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#f5f5f5',
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              <DirectionsCarIcon sx={{ fontSize: 40, color: '#9e9e9e' }} />
                            </Box>
                          );
                        }
                      })()}
                    </Box>
                    
                    {/* Nom et catégorie du véhicule */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {(() => {
                          // Essayer d'obtenir la marque et le modèle du véhicule
                          const vehicule = pendingReservation.vehicule || pendingReservation.vehiculeDetails || {};
                          const marque = vehicule.Marque || vehicule.marque;
                          const modele = vehicule.Modele || vehicule.modele;
                          const nom = vehicule.Nom || vehicule.name;
                          
                          // Si nous avons la marque et le modèle, les afficher ensemble
                          if (marque && modele) {
                            return `${marque} ${modele}`;
                          }
                          // Sinon, utiliser le nom s'il existe
                          else if (nom) {
                            return nom;
                          }
                          // Valeur par défaut
                          else {
                            return 'Peugeot 3008';
                          }
                        })()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(() => {
                          const vehicule = pendingReservation.vehicule || pendingReservation.vehiculeDetails || {};
                          const categorie = vehicule.Categorie || vehicule.category || vehicule.type;
                          const transmission = vehicule.Transmission || vehicule.transmission;
                          const carburant = vehicule.Carburant || vehicule.carburant;
                          
                          let infoArray = [];
                          
                          if (categorie) infoArray.push(categorie);
                          if (transmission) infoArray.push(transmission);
                          if (carburant) infoArray.push(carburant);
                          
                          return infoArray.length > 0 ? infoArray.join(' • ') : 'Économique • Essence';
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Détails de la réservation */}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Détails de la réservation
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {/* Colonne de gauche */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Lieu de départ</Typography>
                        <Typography variant="body1" sx={{ fontWeight: '600' }}>
                          {pendingReservation.lieuDepart || pendingReservation.lieuPrise || pendingReservation.lieuPriseEnCharge || 'Aéroport de Fès'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Lieu de retour</Typography>
                        <Typography variant="body1" sx={{ fontWeight: '600' }}>
                          {pendingReservation.lieuRetour || pendingReservation.lieuArrivee || 'Agence'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    {/* Colonne de droite */}
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Date de départ</Typography>
                        <Typography variant="body1" sx={{ fontWeight: '600' }}>
                          {pendingReservation.dateDepart ? formatDate(pendingReservation.dateDepart) : 
                           pendingReservation.dateDebut ? formatDate(pendingReservation.dateDebut) : '12/05/2025'}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date de retour</Typography>
                        <Typography variant="body1" sx={{ fontWeight: '600' }}>
                          {pendingReservation.dateRetour ? formatDate(pendingReservation.dateRetour) : 
                           pendingReservation.dateFin ? formatDate(pendingReservation.dateFin) : '15/05/2025'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {/* Détails de la location */}
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
                    Détails de la location
                  </Typography>
                  
                  {/* Tableau des prix */}
                  <TableContainer component={Paper} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'black' }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Libellé</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Jrs</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prix</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Ligne pour le véhicule */}
                        <TableRow>
                          <TableCell>
                            {(() => {
                              // Utiliser les données du véhicule sélectionné pour afficher le nom correct
                              const vehicule = pendingReservation.vehicule || pendingReservation.vehiculeDetails || {};
                              const marque = vehicule.Marque || vehicule.marque;
                              const modele = vehicule.Modele || vehicule.modele;
                              const nom = vehicule.Nom || vehicule.name;
                              
                              if (marque && modele) {
                                return `${marque} ${modele}`;
                              } else if (nom) {
                                return nom;
                              } else {
                                // Utiliser le nom affiché dans l'en-tête
                                return 'Tesla Model 3';
                              }
                            })()}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              // Afficher uniquement les jours, pas les heures
                              const dureeJours = calculateDuration();
                              return `${dureeJours}j`;
                            })()}
                          </TableCell>
                          <TableCell>{pendingReservation.vehicule?.price || '450'} MAD/j</TableCell>
                          <TableCell>
                            {(() => {
                              // Calculer correctement le prix total du véhicule
                              const dureeJours = calculateDuration();
                              const prixJournalier = pendingReservation.vehicule?.price || 450;
                              return `${prixJournalier * dureeJours} MAD`;
                            })()}
                          </TableCell>
                        </TableRow>
                        
                        {/* Ligne pour les extras */}
                        {pendingReservation.extras && pendingReservation.extras.length > 0 ? (
                          pendingReservation.extras.map((extra, index) => (
                            <TableRow key={index}>
                              <TableCell>{extra.Nom || extra.nom || 'Siège bébé'}</TableCell>
                              <TableCell>
                                {(() => {
                                  // Utiliser la fonction calculateDuration pour obtenir la durée réelle
                                  const dureeJours = calculateDuration();
                                  return `${dureeJours}j`;
                                })()}
                              </TableCell>
                              <TableCell>{extra.Prix || extra.prix || '70'} MAD/j</TableCell>
                              <TableCell>
                                {(() => {
                                  // Calculer correctement le prix total de l'extra avec la durée réelle
                                  const dureeJours = calculateDuration();
                                  const prixJournalier = extra.Prix || extra.prix || 70;
                                  return `${prixJournalier * dureeJours} MAD`;
                                })()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          // Extras par défaut si aucun n'est spécifié
                          [{
                            nom: 'Siège bébé',
                            prix: 70
                          }, {
                            nom: 'Chargeur USB / Câble multiport',
                            prix: 20
                          }, {
                            nom: 'Coffre de toit',
                            prix: 80
                          }].map((extra, index) => (
                            <TableRow key={index}>
                              <TableCell>{extra.nom}</TableCell>
                              <TableCell>{calculateDuration()}j</TableCell>
                              <TableCell>{extra.prix} MAD/j</TableCell>
                              <TableCell>{extra.prix * calculateDuration()} MAD</TableCell>
                            </TableRow>
                          ))
                        )}
                        
                        {/* Ligne pour le total */}
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell colSpan={3} sx={{ textAlign: 'right', fontWeight: 'bold' }}>Total:</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.1rem' }}>
                            {(() => {
                              // Calculer correctement le prix total
                              const dureeJours = calculateDuration();
                              const prixVehicule = getVehiclePricePerDay();
                              const totalVehicule = prixVehicule * dureeJours;
                              
                              // Calculer le total des extras
                              let totalExtras = 0;
                              if (pendingReservation.extras && pendingReservation.extras.length > 0) {
                                totalExtras = pendingReservation.extras.reduce((sum, extra) => {
                                  const prixExtra = extra.Prix || extra.prix || 0;
                                  return sum + (prixExtra * dureeJours);
                                }, 0);
                              } else {
                                // Utiliser les extras par défaut
                                // Calculer le total des extras par défaut avec la durée réelle
                                const dureeJours = calculateDuration();
                                totalExtras = (70 + 20 + 80) * dureeJours; // Siège bébé + Chargeur USB + Coffre de toit
                              }
                              
                              // Si le prix total est déjà calculé dans pendingReservation, l'utiliser
                              if (pendingReservation.prixTotal) {
                                return `${pendingReservation.prixTotal} MAD`;
                              }
                              
                              return `${totalVehicule + totalExtras} MAD`;
                            })()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Boutons d'action */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => navigate('/reserver')}
                      startIcon={<ArrowBackIcon />}
                      disabled={confirmLoading || confirmSuccess}
                      sx={{
                        borderColor: '#ddd',
                        color: '#666',
                        '&:hover': {
                          borderColor: '#999',
                          bgcolor: 'rgba(0,0,0,0.03)',
                        },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        padding: '10px 20px',
                      }}
                    >
                      Modifier la réservation
                    </Button>
                    
                    <Button 
                      variant="contained" 
                      color="success"
                      onClick={handleConfirmReservation}
                      startIcon={confirmLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                      disabled={confirmLoading || confirmSuccess}
                      sx={{
                        background: 'linear-gradient(90deg, #2e7d32, #4caf50)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #1b5e20, #388e3c)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(1px)',
                        },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        padding: '10px 24px',
                        boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {confirmLoading ? 'Confirmation en cours...' : 'Confirmer la réservation'}
                    </Button>
                  </Box>
                </Box>
                
                {/* Messages de confirmation ou d'erreur - Affichés dans la section des boutons d'action */}
                {confirmError && (
                  <Alert 
                    severity="error" 
                    sx={{ mb: 2, mt: 2 }}
                    onClose={() => setConfirmError('')}
                  >
                    {confirmError}
                  </Alert>
                )}
                
                {confirmSuccess && (
                  <Alert 
                    severity="success" 
                    sx={{ mb: 2, mt: 2 }}
                  >
                    Votre réservation a été confirmée avec succès !
                  </Alert>
                )}
              </>
            ) : reservationData && reservationData.status && reservationData.status.toLowerCase() === 'confirmed' ? (
              <>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 'bold', 
                  mb: 3,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-8px',
                    left: 0,
                    width: '50px',
                    height: '3px',
                    backgroundColor: 'secondary.main'
                  }
                }}>
                  RÉCAPITULATIF DE RÉSERVATION
                </Typography>
                
                <Grid container spacing={4}>
                  {/* Informations du véhicule */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 3
                    }}>
                      <Box sx={{ 
                        width: '100%', 
                        height: 180, 
                        position: 'relative',
                        mb: 2
                      }}>
                        <img 
                          src={`http://localhost:4000/uploads/vehicules/voiture-${reservationData.vehicule}.jpg`}
                          alt={`${reservationData.vehiculeDetails?.Marque} ${reservationData.vehiculeDetails?.Modele}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            position: 'relative'
                          }}
                          onError={(e) => {
                            // Try alternative URL formats
                            if (!e.target.dataset.fallback) {
                              e.target.dataset.fallback = '1';
                              e.target.src = `http://localhost:4000/uploads/vehicules/voiture-${reservationData.vehicule}.png`;
                            } else if (e.target.dataset.fallback === '1') {
                              e.target.dataset.fallback = '2';
                              e.target.src = `http://localhost:3000/uploads/vehicules/voiture-${reservationData.vehicule}.jpg`;
                            } else if (e.target.dataset.fallback === '2') {
                              e.target.dataset.fallback = '3';
                              // Fallback to a generic car silhouette if all else fails
                              e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23ccc' d='M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z'%3E%3C/path%3E%3C/svg%3E`;
                            }
                          }}
                        />
                      </Box>
                      
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {reservationData.vehiculeDetails?.Marque} {reservationData.vehiculeDetails?.Modele}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        {reservationData.vehiculeDetails?.Categorie} • {reservationData.vehiculeDetails?.Type} • {reservationData.vehiculeDetails?.Annee}
                      </Typography>
                      
                      {/* Caractéristiques techniques du véhicule */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        flexWrap: 'wrap', 
                        gap: 2,
                        mt: 2,
                        width: '100%'
                      }}>
                        {reservationData.vehiculeDetails?.Places && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AirlineSeatReclineNormalIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
                            <Typography variant="body2">
                              {reservationData.vehiculeDetails.Places} places
                            </Typography>
                          </Box>
                        )}
                        
                        {reservationData.vehiculeDetails?.Portes && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MeetingRoomIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
                            <Typography variant="body2">
                              {reservationData.vehiculeDetails.Portes} portes
                            </Typography>
                          </Box>
                        )}
                        
                        {reservationData.vehiculeDetails?.Transmission && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <SettingsIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
                            <Typography variant="body2">
                              {reservationData.vehiculeDetails.Transmission}
                            </Typography>
                          </Box>
                        )}
                        
                        {reservationData.vehiculeDetails?.Carburant && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalGasStationIcon sx={{ fontSize: 16, color: 'secondary.main', mr: 0.5 }} />
                            <Typography variant="body2">
                              {reservationData.vehiculeDetails.Carburant}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                  
                  {/* Détails de la réservation */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DateRangeIcon color="primary" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Période de location
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              Du {formatDate(reservationData.dateDepart)} 
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              au {formatDate(reservationData.dateRetour)}
                            </Typography>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                              {calculateDuration()} jours
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Lieux
                            </Typography>
                            <Typography variant="body1">
                              Départ: {reservationData.lieuDepart}
                            </Typography>
                            <Typography variant="body1">
                              Retour: {reservationData.lieuRetour}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {/* Extras sélectionnés - Aperçu */}
                        {reservationData.extras && reservationData.extras.length > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <ReceiptIcon color="primary" sx={{ mr: 1 }} />
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                Extras sélectionnés
                              </Typography>
                              {reservationData.extras.map((extra, index) => (
                                <Typography key={index} variant="body2">
                                  • {extra.Nom} ({extra.Prix} DH{extra.Nom !== 'Wi-Fi mobile' ? '/jour' : ''})
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                      
                      <Box sx={{ 
                        mt: 2, 
                        p: 2, 
                        bgcolor: 'secondary.light', 
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          Prix total:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {getTotalPrice().toFixed(2)} DH
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Détail complet de la réservation */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                    Détail complet de la réservation
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Libellé</TableCell>
                          <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Jrs/hrs</TableCell>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Prix</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Location du véhicule */}
                        <TableRow>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DirectionsCarIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  Location {reservationData.vehiculeDetails?.Marque || reservationData?.marqueVehicule || 'Véhicule'} {reservationData.vehiculeDetails?.Modele || reservationData?.modeleVehicule || ''}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {reservationData.vehiculeDetails?.Categorie || reservationData?.categorieVehicule || ''} {reservationData.vehiculeDetails?.Type || reservationData?.typeVehicule ? `- ${reservationData.vehiculeDetails?.Type || reservationData?.typeVehicule}` : ''}
                                </Typography>
                                {(reservationData.vehiculeDetails?.Transmission || reservationData?.transmissionVehicule) && (
                                  <Typography variant="body2" color="text.secondary">
                                    {reservationData.vehiculeDetails?.Transmission || reservationData?.transmissionVehicule} 
                                    {(reservationData.vehiculeDetails?.Places || reservationData?.placesVehicule) && ` • ${reservationData.vehiculeDetails?.Places || reservationData?.placesVehicule} places`} 
                                    {(reservationData.vehiculeDetails?.Portes || reservationData?.portesVehicule) && ` • ${reservationData.vehiculeDetails?.Portes || reservationData?.portesVehicule} portes`}
                                  </Typography>
                                )}
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  bgcolor: 'primary.light',
                                  color: 'primary.main',
                                  borderRadius: '20px',
                                  px: 1.5,
                                  py: 0.5,
                                  mt: 1,
                                  width: 'fit-content'
                                }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {getVehiclePricePerDay().toFixed(2)} DH / jour
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
                                {calculateDuration()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                jours
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mt: 1 
                              }}>
                                <DateRangeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(reservationData.DateDébut)} - {formatDate(reservationData.DateFin)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ 
                              bgcolor: 'secondary.light', 
                              color: 'secondary.dark', 
                              p: 1.5, 
                              borderRadius: 2,
                              display: 'inline-block',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                            }}>
                              {getVehicleTotalPrice().toFixed(2)} DH
                            </Box>
                          </TableCell>
                        </TableRow>
                        
                        {/* Extras */}
                        {reservationData.extras && reservationData.extras.length > 0 ? reservationData.extras.map((extra, index) => {
                          // Récupérer le nom et le prix de l'extra, quelle que soit la propriété utilisée
                          const extraNom = extra.Nom || extra.nom || 'Extra';
                          const extraPrix = extra.Prix !== undefined ? extra.Prix : (extra.prix !== undefined ? extra.prix : 0);
                          
                          // Afficher la durée et calculer le prix total
                          const displayDuration = calculateDuration() + ' jours';
                          const extraPrice = extraPrix * calculateDuration();
                            
                          return (
                            <TableRow key={index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 3 }}>
                                  <Typography variant="body2">
                                    {extraNom}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">{displayDuration}</TableCell>
                              <TableCell align="right">{extraPrice.toFixed(2)} DH</TableCell>
                            </TableRow>
                          );
                        }) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                Aucun extra sélectionné
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {/* Total */}
                        <TableRow sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                          <TableCell colSpan={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              TOTAL
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {getTotalPrice().toFixed(2)} DH
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Informations supplémentaires */}
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255, 215, 0, 0.1)', 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'secondary.light',
                    mb: 3
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Informations importantes
                    </Typography>
                    <Typography variant="body2">
                      Le paiement sera effectué lors de la prise en charge du véhicule. Une caution de 5000 DH sera demandée et restituée à la fin de la location si le véhicule est rendu dans son état initial.
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 4 }} />
                
                {/* Bouton de confirmation */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading || success}
                    onClick={handleConfirmReservation}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #000000 30%, #333333 90%)',
                      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Confirmer ma réservation'
                    )}
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                  En confirmant votre réservation, vous acceptez les conditions générales de location.
                </Typography>
              </>
            ) : (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2
              }}>
                <DirectionsCarIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Aucune réservation en attente
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Vous n'avez pas de réservation en attente de confirmation.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/reserver')}
                >
                  Réserver un véhicule
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
