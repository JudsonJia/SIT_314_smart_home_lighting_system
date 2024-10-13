import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Snackbar,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';

// DeviceManagement component for managing IoT devices
function DeviceManagement() {
  // State hooks for managing devices, new device input, loading state, error messages, and snackbar notifications
  const [devices, setDevices] = useState([]);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Effect hook to fetch devices when component mounts
  useEffect(() => {
    fetchDevices();
  }, []);

  // Function to fetch devices from the API
  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/devices/devices');
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('Failed to fetch devices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new device
  const addDevice = async () => {
    if (!newDeviceName.trim()) return;
    try {
      const response = await apiClient.post('/devices/devices', { name: newDeviceName });
      setDevices([...devices, response.data]);
      setNewDeviceName('');
      setSnackbar({ open: true, message: 'Device added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding device:', error);
      setSnackbar({ open: true, message: 'Failed to add device', severity: 'error' });
    }
  };

  // Function to remove a device
  const removeDevice = async (deviceId) => {
    try {
      await apiClient.delete(`/devices/devices/${deviceId}`);
      setDevices(devices.filter(device => device.id !== deviceId));
      setSnackbar({ open: true, message: 'Device removed successfully', severity: 'success' });
    } catch (error) {
      console.error('Error removing device:', error);
      setSnackbar({ open: true, message: 'Failed to remove device', severity: 'error' });
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

  // Render the device management interface
  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Device Management</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField 
            fullWidth
            variant="outlined"
            value={newDeviceName} 
            onChange={(e) => setNewDeviceName(e.target.value)}
            placeholder="Enter new device name"
            sx={{ mr: 2 }}
          />
          <Button variant="contained" color="primary" onClick={addDevice}>
            Add Device
          </Button>
        </Box>
      </Paper>
      <Paper elevation={3}>
        <List>
          {/* Map through devices and create a list item for each */}
          {devices.map(device => (
            <ListItem key={device.id}>
              <ListItemText primary={device.name} />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => removeDevice(device.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      {/* Snackbar for displaying notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DeviceManagement;