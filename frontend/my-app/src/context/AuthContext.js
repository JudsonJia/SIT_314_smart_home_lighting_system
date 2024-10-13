import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api/client';

// Create a context for authentication
const AuthContext = createContext(null);

// AuthProvider component to wrap the app and provide authentication context
export const AuthProvider = ({ children }) => {
  // State to store the authenticated user
  const [user, setUser] = useState(null);
  // State to track loading status
  const [loading, setLoading] = useState(true);

  // Effect to check for existing token and verify it on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        setUser(response.data.user);
      }).catch(error => {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  // Function to handle user login
  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Function to handle user logout
  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Provide the authentication context to child components
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};