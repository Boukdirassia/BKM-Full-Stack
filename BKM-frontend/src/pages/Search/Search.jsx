import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Pagination,
  Paper,
  Chip,
} from '@mui/material';
import { DateRange, LocationOn } from '@mui/icons-material';

const Search = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    brand: '',
    type: '',
    priceRange: '',
  });

  const [searchParams, setSearchParams] = useState({
    pickupDate: '',
    returnDate: '',
    location: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchParams({
      pickupDate: params.get('pickupDate') || '',
      returnDate: params.get('returnDate') || '',
      location: params.get('location') || '',
    });
  }, [location]);

  // Mock data - replace with API call
  const cars = [
    {
      id: 1,
      name: 'Toyota Camry',
      brand: 'Toyota',
      model: '2023',
      price: 50,
      type: 'Sedan',
      image: 'https://placeholder.com/350x200',
    },
    // Add more cars here
  ];

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* Search Summary */}
      {(searchParams.pickupDate || searchParams.returnDate || searchParams.location) && (
        <Paper sx={{ p: 2, mb: 4 }} elevation={1}>
          <Typography variant="h6" gutterBottom>
            Your Search
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {searchParams.location && (
              <Chip
                icon={<LocationOn />}
                label={`Location: ${searchParams.location}`}
                variant="outlined"
              />
            )}
            {searchParams.pickupDate && (
              <Chip
                icon={<DateRange />}
                label={`Pick-up: ${formatDate(searchParams.pickupDate)}`}
                variant="outlined"
              />
            )}
            {searchParams.returnDate && (
              <Chip
                icon={<DateRange />}
                label={`Return: ${formatDate(searchParams.returnDate)}`}
                variant="outlined"
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Brand</InputLabel>
              <Select
                name="brand"
                value={filters.brand}
                label="Brand"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Toyota">Toyota</MenuItem>
                <MenuItem value="Honda">Honda</MenuItem>
                <MenuItem value="BMW">BMW</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={filters.type}
                label="Type"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Sedan">Sedan</MenuItem>
                <MenuItem value="SUV">SUV</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Price Range</InputLabel>
              <Select
                name="priceRange"
                value={filters.priceRange}
                label="Price Range"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="0-50">$0 - $50</MenuItem>
                <MenuItem value="51-100">$51 - $100</MenuItem>
                <MenuItem value="101+">$101+</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Results */}
      <Grid container spacing={4}>
        {cars.map((car) => (
          <Grid item key={car.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={car.image}
                alt={car.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {car.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Brand: {car.brand}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Model: {car.model}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${car.price}/day
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={10} color="primary" />
      </Box>
    </Container>
  );
};

export default Search;
