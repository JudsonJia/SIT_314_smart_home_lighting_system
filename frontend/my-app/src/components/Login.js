import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Login component for user authentication
function Login() {
  // State hooks for form inputs and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // Custom hook for authentication context
  const { login } = useAuth();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Attempt to log in with provided credentials
      const success = await login({ username, password });
      if (success) {
        // If login successful, navigate to home page
        navigate('/');
      } else {
        // If login fails, set error message
        setError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      // If an error occurs during login, set error message and log the error
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    }
  };

  // Render login form
  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {/* Display error message if it exists */}
      {error && <p style={{color: 'red'}}>{error}</p>}
      {/* Username input field */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      {/* Password input field */}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {/* Submit button */}
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;