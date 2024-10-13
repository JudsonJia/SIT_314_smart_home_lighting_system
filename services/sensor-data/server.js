const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.SENSOR_DATA_PORT || 3003;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
  })
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

// Sensor Data model definition
const sensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  type: { type: String, required: true, enum: ['motion', 'light', 'temperature', 'humidity'] },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

// Route to post new sensor data
app.post('/sensor-data', async (req, res) => {
  try {
    let data = req.body;
    
    // Ensure deviceId is a string
    if (data.deviceId && typeof data.deviceId !== 'string') {
      data.deviceId = String(data.deviceId);
    }
    
    // Ensure value is a number
    if (data.value && typeof data.value !== 'number') {
      data.value = Number(data.value);
    }
    
    // Set timestamp if not provided
    if (!data.timestamp) {
      data.timestamp = new Date();
    }

    console.log('Processed sensor data:', JSON.stringify(data, null, 2));
    
    const sensorData = new SensorData(data);
    await sensorData.save();
    res.status(201).json(sensorData);
  } catch (error) {
    // Error handling is missing here
  }
});

// Route to get sensor data with optional filters
app.get('/sensor-data', async (req, res) => {
  try {
    const { deviceId, type, startDate, endDate } = req.query;
    let query = {};
    if (deviceId) query.deviceId = deviceId;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    const sensorData = await SensorData.find(query).sort('-timestamp').limit(100);
    res.json(sensorData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get latest sensor data for a specific device
app.get('/sensor-data/latest/:deviceId', async (req, res) => {
  try {
    const latestData = await SensorData.findOne({ deviceId: req.params.deviceId })
      .sort('-timestamp');
    if (!latestData) return res.status(404).json({ error: 'No data found for this device' });
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get the latest sensor data across all devices
app.get('/sensor-data/latest', async (req, res) => {
  try {
    const latestData = await SensorData.findOne().sort({ timestamp: -1 });
    if (!latestData) {
      return res.status(404).json({ error: 'No sensor data available' });
    }
    res.json(latestData);
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get aggregated sensor data
app.get('/sensor-data/aggregate', async (req, res) => {
  try {
    const { deviceId, type, interval } = req.query;
    const aggregation = await SensorData.aggregate([
      { $match: { deviceId: mongoose.Types.ObjectId(deviceId), type } },
      { $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          avgValue: { $avg: "$value" },
          minValue: { $min: "$value" },
          maxValue: { $max: "$value" }
        }
      },
      { $sort: { "_id": -1 } },
      { $limit: 30 }
    ]);
    res.json(aggregation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Sensor data service is running' });
});

// Log environment variables
console.log('Environment variables:');
console.log('PORT:', process.env.SENSOR_DATA_PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Start the server
app.listen(PORT, () => {
  console.log(`Sensor data service running on port ${PORT}`);
});