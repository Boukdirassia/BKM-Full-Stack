import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Si l'authentification est en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return <div>Chargement...</div>;
  }

  // Si l'utilisateur est authentifié et est un administrateur, afficher les routes enfants
  if (isAuthenticated && isAdmin) {
    return <Outlet />;
  }

  // Sinon, rediriger vers la page de connexion
  return <Navigate to="/login" replace />;
};

export default AdminRoute;
