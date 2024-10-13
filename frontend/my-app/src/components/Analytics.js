import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Typography, Box, CircularProgress } from '@mui/material';

// Analytics component for displaying device usage data
const Analytics = () => {
  // State hooks for managing usage data, loading state, and error messages
  const [usageData, setUsageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect hook to fetch usage data when component mounts
  useEffect(() => {
    fetchUsageData();
  }, []);

  // Function to fetch usage data from the API
  const fetchUsageData = () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Get data for the last 7 days
    const endDate = new Date();

    // API call to get device usage data
    apiClient.get('/devices/usage', {
      params: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    })
      .then(response => {
        const formattedData = processUsageData(response.data);
        setUsageData(formattedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching usage data:', error);
        setError('Failed to fetch usage data. Please try again later.');
        setLoading(false);
      });
  };

  // Function to process and format the usage data
  const processUsageData = (data) => {
    const dailyUsage = {};
    data.forEach(device => {
      device.usageData.forEach(day => {
        if (!dailyUsage[day.date]) {
          dailyUsage[day.date] = { date: day.date, totalUsage: 0 };
        }
        dailyUsage[day.date].totalUsage += day.usage;
      });
    });
    return Object.values(dailyUsage).sort((a, b) => new Date(a.date) - new Date(b.date));
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

  // Render the analytics chart
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      <Typography variant="h6" gutterBottom>Device Usage Patterns</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={usageData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="totalUsage" name="Total Usage (hours)" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default Analytics;