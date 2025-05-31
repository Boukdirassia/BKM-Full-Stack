import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // Temporairement désactivé pour permettre l'accès au dashboard
  // const { isAuthenticated, isAdmin, loading } = useAuth();
  // const location = useLocation();

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }

  // if (requireAdmin && !isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  // Retourne directement les enfants sans vérification d'authentification
  return children;
};

export default ProtectedRoute;
