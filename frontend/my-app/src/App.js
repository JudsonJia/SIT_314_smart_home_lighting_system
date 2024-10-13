import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Container, Box, Button, CssBaseline, IconButton, useMediaQuery, Drawer, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import components
import Analytics from './components/Analytics';
import Dashboard from './components/Dashboard';
import DeviceManagement from './components/DeviceManagement';
import ErrorBoundary from './components/ErrorBoundary';
import LightingControl from './components/LightingControl';
import LoadingIndicator from './components/LoadingIndicator';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import Scheduling from './components/Scheduling';

// NavBar Component
function NavBar({ toggleTheme }) {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Toggle drawer for mobile view
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define menu items based on authentication status
  const menuItems = user
    ? [
        { text: 'Dashboard', path: '/' },
        { text: 'Devices', path: '/devices' },
        { text: 'Lighting', path: '/lighting' },
        { text: 'Scheduling', path: '/scheduling' },
        { text: 'Analytics', path: '/analytics' },
      ]
    : [
        { text: 'Login', path: '/login' },
        { text: 'Register', path: '/register' },
      ];

  // Drawer content for mobile view
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Smart Home
      </Typography>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} component={Link} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        {user && (
          <ListItem button onClick={logout}>
            <ListItemText primary="Logout" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Smart Home
          </Typography>
          {!isMobile && (
            <>
              {menuItems.map((item) => (
                <Button key={item.text} color="inherit" component={Link} to={item.path}>
                  {item.text}
                </Button>
              ))}
              {user && (
                <Button color="inherit" onClick={logout}>Logout</Button>
              )}
            </>
          )}
          <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

// AppRoutes Component
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/devices" element={
            <ProtectedRoute>
              <DeviceManagement />
            </ProtectedRoute>
          } />
          <Route path="/lighting" element={
            <ProtectedRoute>
              <LightingControl />
            </ProtectedRoute>
          } />
          <Route path="/scheduling" element={
            <ProtectedRoute>
              <Scheduling />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Container>
  );
}

// Main App Component
function App() {
  const [mode, setMode] = useState('light');

  // Create theme based on current mode
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Router>
          <NavBar toggleTheme={toggleTheme} />
          <AppRoutes />
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Wrap the App with AuthProvider
const AppWithAuth = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuth;