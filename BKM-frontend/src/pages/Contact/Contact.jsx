import React, { useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Paper,
  IconButton,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  Send as SendIcon,
  Person as PersonIcon,
  AlternateEmail as EmailIcon,
  Message as MessageIcon
} from '@mui/icons-material';

const Contact = () => {
  const theme = useTheme();
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Créer un objet FormData à partir du formulaire
      const formData = new FormData(form.current);
      
      // Ajouter l'email de destination
      formData.append('_to', 'bkassia082@gmail.com');
      formData.append('_subject', 'Nouveau message du site BKM Rental');
      
      // Envoyer le formulaire via FormSubmit
      const response = await fetch('https://formsubmit.co/ajax/bkassia082@gmail.com', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success === 'true' || result.success === true) {
        setSubmitStatus('success');
        setSnackbarOpen(true);
        form.current.reset();
      } else {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }
    } catch (error) {
      console.error('Erreur d\'envoi:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Box sx={{ 
      py: 10,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 10%, transparent 10.5%)',
        backgroundSize: '20px 20px',
        opacity: 0.3,
        zIndex: 1
      }
    }}>
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            sx={{
              fontWeight: 'bold',
              position: 'relative',
              display: 'inline-block',
              mb: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '60px',
                height: '4px',
                bottom: '-10px',
                left: 'calc(50% - 30px)',
                backgroundColor: theme.palette.primary.main,
                borderRadius: '2px'
              }
            }}
          >
            Nous Contacter
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: '700px', mx: 'auto', mt: 3 }}
          >
            N'hésitez pas à nous contacter pour toute question
          </Typography>
        </Box>

        <Card 
          elevation={6} 
          sx={{ 
            borderRadius: '16px', 
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          <Grid container>
            {/* Formulaire de contact */}
            <Grid item xs={12} md={7}>
              <CardContent sx={{ p: 4, pt: 5, pb: 5 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    '&::before': {
                      content: '""',
                      width: '4px',
                      height: '24px',
                      backgroundColor: theme.palette.primary.main,
                      marginRight: '12px',
                      borderRadius: '4px'
                    }
                  }}
                >
                  Envoyez-nous un message
                </Typography>
                
                <form ref={form} onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nom"
                        variant="outlined"
                        name="nom"
                        required
                        InputProps={{
                          startAdornment: <PersonIcon color="disabled" sx={{ mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.light,
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Prénom"
                        variant="outlined"
                        name="prenom"
                        required
                        InputProps={{
                          startAdornment: <PersonIcon color="disabled" sx={{ mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.light,
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        variant="outlined"
                        name="email"
                        required
                        InputProps={{
                          startAdornment: <EmailIcon color="disabled" sx={{ mr: 1 }} />
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.light,
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={5}
                        variant="outlined"
                        name="message"
                        required
                        InputProps={{
                          startAdornment: (
                            <Box sx={{ pt: 1.5 }}>
                              <MessageIcon color="disabled" sx={{ mr: 1 }} />
                            </Box>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '10px',
                            '&:hover fieldset': {
                              borderColor: theme.palette.primary.light,
                            },
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: '10px',
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                          }
                        }}
                      >
                        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Grid>
            
            {/* Informations de contact */}
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                p: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 4,
                    color: 'white',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '40px',
                      height: '3px',
                      bottom: '-10px',
                      left: 0,
                      backgroundColor: 'white',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Informations de contact
                </Typography>
                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        p: 1, 
                        borderRadius: '50%',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <LocationOn sx={{ color: 'white' }} />
                      </Box>
                      <Typography sx={{ color: alpha('#fff', 0.9) }}>
                        Oulfa Street, Casablanca City, MA 20230
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        p: 1, 
                        borderRadius: '50%',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Phone sx={{ color: 'white' }} />
                      </Box>
                      <Typography sx={{ color: alpha('#fff', 0.9) }}>
                        +212 61 234 567
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                      <Box sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        p: 1, 
                        borderRadius: '50%',
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Email sx={{ color: 'white' }} />
                      </Box>
                      <Typography sx={{ color: alpha('#fff', 0.9) }}>
                        Contact@bkmrentl.com
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Divider sx={{ borderColor: alpha('#fff', 0.2), my: 3 }} />
                    
                    <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
                      Suivez-nous
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <IconButton sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        color: 'white',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) }
                      }}>
                        <Facebook />
                      </IconButton>
                      <IconButton sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        color: 'white',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) }
                      }}>
                        <Twitter />
                      </IconButton>
                      <IconButton sx={{ 
                        bgcolor: alpha('#fff', 0.2), 
                        color: 'white',
                        '&:hover': { bgcolor: alpha('#fff', 0.3) }
                      }}>
                        <Instagram />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
      
      {/* Notification de succès */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Votre message a été envoyé avec succès!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
