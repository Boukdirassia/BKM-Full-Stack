import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AssistantRoute = () => {
  const { isAuthenticated, isAssistant, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Si l'authentification est en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur est authentifié et est un assistant ou un admin, afficher les routes enfants
  if (isAuthenticated && (isAssistant || isAdmin)) {
    // Autoriser l'accès aux routes assistant
    return <Outlet />;
  }

  // Sinon, rediriger vers la page de connexion
  return <Navigate to="/login" replace state={{ from: location }} />;
};

export default AssistantRoute;
