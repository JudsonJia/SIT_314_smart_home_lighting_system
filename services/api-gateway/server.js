const express = require('express');
const helmet = require('helmet'); // Import helmet for security headers
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const axiosRetry = require('axios-retry');

dotenv.config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Configure axios retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNRESET';
  }
});

// Middleware
app.use(helmet()); // Add Helmet middleware for security headers

// Optional: Custom Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
  credentials: true
}));

app.use(express.json());

// Detailed logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const DEVICE_SERVICE_URL = process.env.DEVICE_SERVICE_URL || 'http://device-service:3002';
const SENSOR_SERVICE_URL = process.env.SENSOR_SERVICE_URL || 'http://sensor-service:3003';
const LIGHTING_SERVICE_URL = process.env.LIGHTING_SERVICE_URL || 'http://lighting-service:3004';
const SCHEDULING_SERVICE_URL = process.env.SCHEDULING_SERVICE_URL || 'http://scheduling-service:3005';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3006';

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Proxy options
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/',
    '^/devices': '/',
    '^/sensors': '/',
    '^/lighting': '/',
    '^/schedules': '/',
    '^/analytics': '/'
  },
  timeout: 60000,
  proxyTimeout: 61000,
  onProxyReq: (proxyReq, req, res) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response from ${req.url}: Status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  },
};

// Health check function
const checkServiceHealth = async (serviceUrl) => {
  try {
    const response = await axios.get(`${serviceUrl}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error(`Health check failed for ${serviceUrl}:`, error.message);
    return false;
  }
};

// Routes
app.use('/auth', createProxyMiddleware({ ...proxyOptions, target: AUTH_SERVICE_URL }));
app.use('/devices', authenticate, createProxyMiddleware({ ...proxyOptions, target: DEVICE_SERVICE_URL }));
app.use('/sensors', authenticate, createProxyMiddleware({ ...proxyOptions, target: SENSOR_SERVICE_URL }));
app.use('/lighting', authenticate, createProxyMiddleware({ ...proxyOptions, target: LIGHTING_SERVICE_URL }));
app.use('/schedules', authenticate, createProxyMiddleware({ ...proxyOptions, target: SCHEDULING_SERVICE_URL }));
app.use('/analytics', authenticate, createProxyMiddleware({ ...proxyOptions, target: ANALYTICS_SERVICE_URL }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const authHealth = await checkServiceHealth(AUTH_SERVICE_URL);
  const deviceHealth = await checkServiceHealth(DEVICE_SERVICE_URL);
  const sensorHealth = await checkServiceHealth(SENSOR_SERVICE_URL);
  const lightingHealth = await checkServiceHealth(LIGHTING_SERVICE_URL);
  const schedulingHealth = await checkServiceHealth(SCHEDULING_SERVICE_URL);
  const analyticsHealth = await checkServiceHealth(ANALYTICS_SERVICE_URL);

  const allHealthy = authHealth && deviceHealth && sensorHealth && 
                     lightingHealth && schedulingHealth && analyticsHealth;

  res.json({
    status: allHealthy ? 'OK' : 'Some services are unhealthy',
    services: {
      auth: authHealth,
      device: deviceHealth,
      sensor: sensorHealth,
      lighting: lightingHealth,
      scheduling: schedulingHealth,
      analytics: analyticsHealth
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Gateway Error:', err);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});