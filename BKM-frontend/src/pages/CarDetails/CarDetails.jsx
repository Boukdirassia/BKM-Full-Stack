import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock data - replace with API call
  const carDetails = {
    id: '1',
    name: 'Toyota Camry',
    brand: 'Toyota',
    model: 'Camry',
    year: '2023',
    price: 50,
    type: 'Sedan',
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Gasoline',
    features: [
      'Air Conditioning',
      'Bluetooth',
      'Backup Camera',
      'Navigation System',
      'Leather Seats',
    ],
    images: [
      'https://placeholder.com/800x400',
      'https://placeholder.com/800x400',
      'https://placeholder.com/800x400',
    ],
    description: 'A comfortable and reliable sedan perfect for both city driving and long trips.',
  };

  const handleBooking = () => {
    if (!user) {
      navigate('/login', { state: { from: `/car/${id}` } });
    } else {
      navigate(`/reservation/${id}`);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Column - Images and Description */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <img
              src={carDetails.images[0]}
              alt={carDetails.name}
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </Box>
          
          <Typography variant="h4" gutterBottom>
            {carDetails.name}
          </Typography>
          
          <Typography variant="body1" paragraph>
            {carDetails.description}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={2}>
            {carDetails.features.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Typography variant="body1">• {feature}</Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Column - Booking and Details */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              ${carDetails.price}/day
            </Typography>

            <List>
              <ListItem>
                <ListItemText primary="Brand" secondary={carDetails.brand} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Model" secondary={carDetails.model} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Year" secondary={carDetails.year} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Type" secondary={carDetails.type} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Seats" secondary={carDetails.seats} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Transmission" secondary={carDetails.transmission} />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText primary="Fuel Type" secondary={carDetails.fuelType} />
              </ListItem>
            </List>

            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ 
                mt: 2,
                bgcolor: '#000',
                '&:hover': {
                  bgcolor: '#333',
                },
              }}
              onClick={handleBooking}
            >
              Réserver maintenant
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CarDetails;
