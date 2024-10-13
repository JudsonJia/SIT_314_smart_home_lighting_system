const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.ANALYTICS_PORT || 3006;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Energy Consumption model
const energyConsumptionSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  consumption: { type: Number, required: true }
});

const EnergyConsumption = mongoose.model('EnergyConsumption', energyConsumptionSchema);

// Device Usage model
const deviceUsageSchema = new mongoose.Schema({
  time: { type: Date, required: true },
  deviceUsage: { type: Map, of: Number }
});

const DeviceUsage = mongoose.model('DeviceUsage', deviceUsageSchema);

// Routes
app.get('/energy', async (req, res) => {
  try {
    const energyData = await EnergyConsumption.find().sort('date');
    res.json(energyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/usage', async (req, res) => {
  try {
    const usageData = await DeviceUsage.find().sort('time');
    res.json(usageData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Analytics service is healthy' });
});

// Function to generate daily energy consumption report
async function generateDailyEnergyReport() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const todayStart = new Date(yesterday);
    todayStart.setDate(todayStart.getDate() + 1);

    // Fetch energy consumption data
    const energyDataResponse = await axios.get(`${process.env.SENSOR_DATA_SERVICE_URL}/sensor-data/aggregate`, {
      params: {
        type: 'energy',
        startDate: yesterday.toISOString(),
        endDate: todayStart.toISOString()
      }
    });

    const energyConsumption = energyDataResponse.data.reduce((total, record) => total + record.value, 0);

    // Save energy consumption data
    const energyReport = new EnergyConsumption({
      date: yesterday,
      consumption: energyConsumption
    });

    await energyReport.save();
    console.log('Daily energy report generated successfully');
  } catch (error) {
    console.error('Error generating daily energy report:', error);
  }
}

// Function to generate hourly device usage report
async function generateHourlyDeviceUsageReport() {
  try {
    const now = new Date();
    now.setMinutes(0, 0, 0); // Round to the current hour

    // Fetch device usage data
    const deviceUsageResponse = await axios.get(`${process.env.DEVICE_MANAGEMENT_SERVICE_URL}/usage`, {
      params: {
        startDate: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // Last hour
        endDate: now.toISOString()
      }
    });

    // Process and save device usage data
    const usageReport = new DeviceUsage({
      time: now,
      deviceUsage: new Map(deviceUsageResponse.data.map(device => [device.deviceId, device.usageHours]))
    });

    await usageReport.save();
    console.log('Hourly device usage report generated successfully');
  } catch (error) {
    console.error('Error generating hourly device usage report:', error);
  }
}

// Schedule daily energy report generation
cron.schedule('0 1 * * *', generateDailyEnergyReport); // Run at 1:00 AM every day

// Schedule hourly device usage report generation
cron.schedule('0 * * * *', generateHourlyDeviceUsageReport); // Run every hour

app.listen(PORT, () => {
  console.log(`Analytics service running on port ${PORT}`);
});