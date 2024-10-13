import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  Typography, 
  Box, 
  Switch, 
  Slider, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Snackbar
} from '@mui/material';
import Alert from '@mui/material/Alert';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

// LightingControl component for managing smart lights
function LightingControl() {
  // State hooks for managing lights data, loading state, error messages, and snackbar notifications
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Effect hook to fetch lights data when component mounts
  useEffect(() => {
    fetchLights();
  }, []);

  // Function to fetch lights data from the API
  const fetchLights = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/lighting/lights');
      setLights(response.data);
    } catch (error) {
      console.error('Error fetching lights:', error);
      setError('Failed to fetch lights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle a light on/off
  const toggleLight = async (lightId) => {
    try {
      await apiClient.put(`/lighting/lights/${lightId}/toggle`);
      setLights(lights.map(light => 
        light.id === lightId ? {...light, status: !light.status} : light
      ));
      setSnackbar({ open: true, message: 'Light toggled successfully', severity: 'success' });
    } catch (error) {
      console.error('Error toggling light:', error);
      setSnackbar({ open: true, message: 'Failed to toggle light', severity: 'error' });
    }
  };

  // Function to change the brightness of a light
  const changeBrightness = async (lightId, brightness) => {
    try {
      await apiClient.put(`/lighting/lights/${lightId}/brightness`, { brightness });
      setLights(lights.map(light => 
        light.id === lightId ? {...light, brightness} : light
      ));
      setSnackbar({ open: true, message: 'Brightness changed successfully', severity: 'success' });
    } catch (error) {
      console.error('Error changing brightness:', error);
      setSnackbar({ open: true, message: 'Failed to change brightness', severity: 'error' });
    }
  };

  // Function to handle closing of snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  // Display error message if data fetching fails
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Render the lighting control interface
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>Lighting Control</Typography>
      <Grid container spacing={3}>
        {/* Map through lights and create a card for each */}
        {lights.map(light => (
          <Grid item xs={12} sm={6} md={4} key={light.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">{light.name}</Typography>
                  <Switch
                    checked={light.status}
                    onChange={() => toggleLight(light.id)}
                    color="primary"
                  />
                </Box>
                <Box display="flex" alignItems="center">
                  <LightbulbIcon sx={{ mr: 1, color: light.status ? 'yellow' : 'grey' }} />
                  <Slider
                    value={light.brightness}
                    onChange={(_, newValue) => changeBrightness(light.id, newValue)}
                    aria-labelledby="continuous-slider"
                    valueLabelDisplay="auto"
                    min={0}
                    max={100}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Snackbar for displaying notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LightingControl;