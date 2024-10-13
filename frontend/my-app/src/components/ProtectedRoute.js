import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

// ProtectedRoute component to guard routes that require authentication
function ProtectedRoute({ children }) {
  // Use custom auth hook to get user and loading state
  const { user, loading } = useAuth();
  
  // If authentication state is still loading, show a loading indicator
  if (loading) {
    return <CircularProgress />;
  }
  
  // If user is not authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated, render the protected content (children)
  return children;
}

export default ProtectedRoute;