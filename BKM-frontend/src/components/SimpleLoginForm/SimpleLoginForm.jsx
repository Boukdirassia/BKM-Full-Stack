import React, { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Typography } from '@mui/material';
import authService from '../../services/authService';

const SimpleLoginForm = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulaire soumis');
    
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Appeler directement l'API d'authentification
      const response = await fetch('http://localhost:4000/utilisateurs/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Email: email,
          Password: password,
          isReservationProcess: true
        }),
      });
      
      const data = await response.json();
      console.log('Réponse de connexion:', data);
      
      if (response.ok && data.user) {
        // Stocker les informations utilisateur et le token
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        
        // Authentification réussie
        console.log('Authentification réussie, redirection vers le profil...');
        
        // Redirection vers le profil
        alert('Connexion réussie! Vous allez être redirigé vers votre profil.');
        
        // Utiliser setTimeout pour s'assurer que l'alerte est affichée avant la redirection
        setTimeout(() => {
          window.location.href = '/profile';
        }, 1000);
        
        return;
      } else {
        setError(data.message || 'Erreur lors de la connexion. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
          {error}
        </Typography>
      )}
      
      <TextField
        fullWidth
        label="Adresse e-mail"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      
      <TextField
        fullWidth
        label="Mot de passe"
        variant="outlined"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
        required
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
        >
          Annuler
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Se connecter'}
        </Button>
      </Box>
    </Box>
  );
};

export default SimpleLoginForm;
