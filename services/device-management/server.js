const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.DEVICE_MANAGEMENT_PORT || 3002;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Device model definition
const deviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['bulb', 'switch', 'sensor'] },
  name: { type: String, required: true },
  location: { type: String, required: true },
  status: {
    isOn: { type: Boolean, default: false },
    brightness: { type: Number, min: 0, max: 100, default: 100 },
    color: { type: String, default: 'white' }
  },
  config: {
    firmwareVersion: String,
    ipAddress: String
  },
  lastUsed: { type: Date, default: Date.now }
});

const Device = mongoose.model('Device', deviceSchema);

// Middleware for error handling
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes

// Create a new device
app.post('/devices', asyncHandler(async (req, res) => {
  const device = new Device(req.body);
  await device.save();
  res.status(201).json(device);
}));

// Get all devices
app.get('/devices', asyncHandler(async (req, res) => {
  const devices = await Device.find();
  res.json(devices);
}));

// Get a specific device
app.get('/devices/:id', asyncHandler(async (req, res) => {
  const device = await Device.findOne({ id: req.params.id });
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
}));

// Update a device
app.put('/devices/:id', asyncHandler(async (req, res) => {
  const device = await Device.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json(device);
}));

// Delete a device
app.delete('/devices/:id', asyncHandler(async (req, res) => {
  const device = await Device.findOneAndDelete({ id: req.params.id });
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json({ message: 'Device deleted successfully' });
}));

// Toggle device status
app.put('/devices/:id/toggle', asyncHandler(async (req, res) => {
  const device = await Device.findOne({ id: req.params.id });
  if (!device) return res.status(404).json({ error: 'Device not found' });
  device.status.isOn = !device.status.isOn;
  device.lastUsed = new Date();
  await device.save();
  res.json(device);
}));

// Change device brightness
app.put('/devices/:id/brightness', asyncHandler(async (req, res) => {
  const { brightness } = req.body;
  const device = await Device.findOne({ id: req.params.id });
  if (!device) return res.status(404).json({ error: 'Device not found' });
  device.status.brightness = brightness;
  device.lastUsed = new Date();
  await device.save();
  res.json(device);
}));

// Get usage data for devices
app.get('/usage', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const devices = await Device.find();
  
  // Generate mock usage data for each device
  const usageData = devices.map(device => {
    const rangeData = [];
    let currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    while (currentDate <= endDateTime) {
      rangeData.push({
        date: currentDate.toISOString().split('T')[0],
        usage: Math.random() * 24  // Mock usage data
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
      deviceId: device.id,
      name: device.name,
      type: device.type,
      usageData: rangeData
    };
  });
  
  res.json(usageData);
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Device management service is healthy' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Device management service running on port ${PORT}`);
});