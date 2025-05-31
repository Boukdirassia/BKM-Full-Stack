import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Nettoyer l'état de l'utilisateur
    setUser(null);
    
    // Supprimer toutes les données d'authentification du localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Supprimer également les données liées aux réservations
    localStorage.removeItem('fromReservation');
    localStorage.removeItem('missingFields');
    localStorage.removeItem('pendingReservation');
    localStorage.removeItem('reservationData');
    
    // Supprimer toutes les autres données potentiellement sensibles
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('user') || key.includes('auth') || key.includes('reservation') || key.includes('client'))) {
        keysToRemove.push(key);
      }
    }
    
    // Supprimer les clés identifiées
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Forcer un rafraîchissement de la page pour s'assurer que tous les composants sont réinitialisés
    // Cela garantit que l'utilisateur est déconnecté sur toutes les pages
    window.location.href = '/';
  };

  const getUserRole = () => {
    // Si l'utilisateur est connecté, utiliser son rôle
    if (user && user.role) {
      return user.role;
    }
    
    // Sinon, vérifier dans le localStorage
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      return storedRole;
    }
    
    // Par défaut, retourner 'client'
    return 'client';
  };

  // Fonction pour mettre à jour les informations de l'utilisateur
  const updateUser = (userData) => {
    // Fusionner les nouvelles données avec les données existantes
    const updatedUser = { ...user, ...userData };
    
    // Mettre à jour l'état et le localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    getUserRole,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: getUserRole() === 'admin',
    isAssistant: getUserRole() === 'assistant',
    isClient: getUserRole() === 'client'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
