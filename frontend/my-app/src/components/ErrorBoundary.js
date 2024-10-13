import React from 'react';

// ErrorBoundary component to catch and handle errors in child components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // Initialize state to track whether an error has occurred
    this.state = { hasError: false };
  }

  // Static method to update state when an error is thrown
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  // Lifecycle method to log error information
  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // If an error has been caught, display a fallback UI
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    // If no error, render the child components as normal
    return this.props.children; 
  }
}

export default ErrorBoundary;