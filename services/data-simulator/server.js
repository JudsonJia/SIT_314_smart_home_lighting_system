const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.SIMULATOR_PORT || 3007;

// Function to generate random device data
function generateDeviceData() {
  const deviceTypes = ['bulb', 'switch', 'sensor'];
  const locations = ['living room', 'bedroom', 'kitchen', 'bathroom'];
  
  return {
    id: `device-${Math.floor(Math.random() * 1000)}`, // Add a unique id
    type: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
    name: `Device ${Math.floor(Math.random() * 1000)}`,
    location: locations[Math.floor(Math.random() * locations.length)],
    status: {
      isOn: Math.random() > 0.5,
      brightness: Math.floor(Math.random() * 100),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
  };
}

// Function to generate random sensor data
function generateSensorData(deviceId) {
  const sensorTypes = ['temperature', 'humidity', 'light', 'motion'];
  const type = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
  let value;

  switch(type) {
    case 'temperature':
      value = 20 + Math.random() * 10; // 20-30 degrees Celsius
      break;
    case 'humidity':
      value = 30 + Math.random() * 40; // 30-70%
      break;
    case 'light':
      value = Math.random() * 1000; // 0-1000 lux
      break;
    case 'motion':
      value = Math.random() > 0.7 ? 1 : 0; // 30% chance of motion detected
      break;
  }

  return { deviceId, type, value };
}

// Function to send device data to device management service
async function sendDeviceData(data) {
  try {
    console.log('Sending device data:', JSON.stringify(data));
    const response = await axios.post(`${process.env.DEVICE_SERVICE_URL}/devices`, data);
    console.log('Device data sent successfully. Response:', response.data);
  } catch (error) {
    console.error('Error sending device data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
  }
}

// Function to send sensor data to sensor data service
async function sendSensorData(data) {
  try {
    console.log('Sending sensor data:', JSON.stringify(data));
    const response = await axios.post(`${process.env.SENSOR_SERVICE_URL}/sensor-data`, data);
    console.log('Sensor data sent successfully. Response:', response.data);
  } catch (error) {
    console.error('Error sending sensor data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error details:', error.message);
    }
  }
}

// Schedule device data generation (every 5 minutes)
cron.schedule('*/5 * * * * ', async () => {
  const deviceData = generateDeviceData();
  await sendDeviceData(deviceData);
});

// Schedule sensor data generation (every 30 seconds)
cron.schedule('*/30 * * * * *', async () => {
  const deviceData = generateDeviceData();
  const sensorData = generateSensorData(deviceData.id);
  await sendSensorData(sensorData);
});

app.listen(PORT, () => {
  console.log(`Data simulator service running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('DEVICE_SERVICE_URL:', process.env.DEVICE_SERVICE_URL);
  console.log('SENSOR_SERVICE_URL:', process.env.SENSOR_SERVICE_URL);
});