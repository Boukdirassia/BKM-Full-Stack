import React from 'react';
import { Container, Typography, Box, Grid, Card, CardContent, Rating, Avatar, Paper, Divider, useTheme } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

const reviews = [
  {
    id: 1,
    name: 'Sarah M.',
    rating: 5,
    comment: 'Excellent service! La voiture était impeccable et le processus de location très simple.',
    date: '15 Jan 2025'
  },
  {
    id: 2,
    name: 'Mohammed K.',
    rating: 5,
    comment: 'Très satisfait de la qualité des véhicules et du professionnalisme du personnel.',
    date: '10 Jan 2025'
  },
  {
    id: 3,
    name: 'Julie D.',
    rating: 4,
    comment: 'Bon rapport qualité-prix. Je recommande vivement leurs services.',
    date: '5 Jan 2025'
  }
];

const Avis = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      py: 10,
      background: 'linear-gradient(180deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)',
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              position: 'relative',
              display: 'inline-block',
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
            Avis Clients
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: '700px', mx: 'auto', mt: 3 }}
          >
            Découvrez ce que nos clients pensent de nos services
          </Typography>
        </Box>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {reviews.map((review) => (
            <Grid item key={review.id} xs={12} md={4}>
              <Paper 
                elevation={2} 
                sx={{ 
                  height: '100%', 
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box sx={{ 
                  p: 3,
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <FormatQuoteIcon 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10, 
                      fontSize: 40,
                      color: 'rgba(0,0,0,0.05)',
                      transform: 'rotate(180deg)'
                    }} 
                  />
                  
                  <Box sx={{ mb: 2 }}>
                    <Rating 
                      value={review.rating} 
                      readOnly 
                      sx={{ 
                        '& .MuiRating-iconFilled': {
                          color: theme.palette.warning.main
                        }
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      fontStyle: 'italic',
                      flex: 1,
                      color: 'text.primary',
                      fontWeight: 400
                    }}
                  >
                    {review.comment}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        mr: 2,
                        width: 50,
                        height: 50,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {review.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        {review.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.date}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Avis;
