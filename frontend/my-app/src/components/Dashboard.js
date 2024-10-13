import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  Typography, 
  Box, 
  CircularProgress, 
  List, 
  ListItem, 
  ListItemText,
  Grid,
  Paper,
  Switch
} from '@mui/material';

function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/devices/devices');
        setDevices(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response && error.response.status === 401) {
          setError('You are not authorized. Please login.');
        } else {
          setError('An error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleDevice = async (deviceId) => {
    try {
      await apiClient.put(`/devices/${deviceId}/toggle`);
      setDevices(prevDevices => prevDevices.map(device => 
        device.id === deviceId ? {...device, status: !device.status} : device
      ));
    } catch (error) {
      console.error('Error toggling device:', error);
      setError('Failed to toggle device. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Controls</Typography>
            {devices.length === 0 ? (
              <Typography>No devices found.</Typography>
            ) : (
              <List>
                {devices.map(device => (
                  <ListItem key={device.id}>
                    <ListItemText primary={device.name} />
                    <Switch
                      checked={device.status}
                      onChange={() => toggleDevice(device.id)}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;