import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ClientRoute = () => {
  const { isAuthenticated, isClient, isAssistant, isAdmin, loading } = useAuth();

  // Si l'authentification est en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur est authentifié et est un client, un assistant ou un admin, afficher les routes enfants
  // Cela permet aux assistants et aux admins d'accéder aux fonctionnalités client
  if (isAuthenticated && (isClient || isAssistant || isAdmin)) {
    return <Outlet />;
  }

  // Sinon, rediriger vers la page de connexion
  return <Navigate to="/login" replace />;
};

export default ClientRoute;
