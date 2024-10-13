import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { 
  Typography, 
  Box, 
  TextField, 
  Select, 
  MenuItem, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Snackbar,
  Paper,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';

// Scheduling component for managing device schedules
function Scheduling() {
  // State hooks for managing schedules, devices, form inputs, loading state, error messages, and snackbar notifications
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ time: '', action: '', deviceId: '' });
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Effect hook to fetch schedules and devices data when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch schedules and devices data from the API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesResponse, devicesResponse] = await Promise.all([
        apiClient.get('/schedules/schedules'),
        apiClient.get('/devices/devices')
      ]);
      setSchedules(schedulesResponse.data);
      setDevices(devicesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new schedule
  const addSchedule = async () => {
    if (!newSchedule.time || !newSchedule.action || !newSchedule.deviceId) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'warning' });
      return;
    }
    try {
      const response = await apiClient.post('/schedules/schedules', newSchedule);
      setSchedules([...schedules, response.data]);
      setNewSchedule({ time: '', action: '', deviceId: '' });
      setSnackbar({ open: true, message: 'Schedule added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding schedule:', error);
      setSnackbar({ open: true, message: 'Failed to add schedule', severity: 'error' });
    }
  };

  // Function to remove a schedule
  const removeSchedule = async (scheduleId) => {
    try {
      await apiClient.delete(`/schedules/schedules/${scheduleId}`);
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
      setSnackbar({ open: true, message: 'Schedule removed successfully', severity: 'success' });
    } catch (error) {
      console.error('Error removing schedule:', error);
      setSnackbar({ open: true, message: 'Failed to remove schedule', severity: 'error' });
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

  // Render the scheduling interface
  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Scheduling</Typography>
      {/* Form for adding new schedules */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              type="time"
              fullWidth
              value={newSchedule.time}
              onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Select
              fullWidth
              value={newSchedule.action}
              onChange={(e) => setNewSchedule({...newSchedule, action: e.target.value})}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Action</MenuItem>
              <MenuItem value="turnOn">Turn On</MenuItem>
              <MenuItem value="turnOff">Turn Off</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Select
              fullWidth
              value={newSchedule.deviceId}
              onChange={(e) => setNewSchedule({...newSchedule, deviceId: e.target.value})}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Device</MenuItem>
              {devices.map(device => (
                <MenuItem key={device.id} value={device.id}>{device.name}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" color="primary" onClick={addSchedule} fullWidth>
              Add Schedule
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* List of existing schedules */}
      <Paper elevation={3}>
        <List>
          {schedules.map(schedule => (
            <ListItem key={schedule.id}>
              <ListItemText 
                primary={`${schedule.time} - ${schedule.action}`}
                secondary={devices.find(d => d.id === schedule.deviceId)?.name}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete" onClick={() => removeSchedule(schedule.id)}>
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

export default Scheduling;