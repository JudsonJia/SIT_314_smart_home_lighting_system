const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Light model definition
const lightSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  status: { type: Boolean, required: true },
  brightness: { type: Number, required: true, min: 0, max: 100 }
});

const Light = mongoose.model('Light', lightSchema);

// Routes

// Get all lights
app.get('/lights', async (req, res) => {
  try {
    const lights = await Light.find();
    res.json(lights);
  } catch (error) {
    console.error('Error fetching lights:', error);
    res.status(500).json({ error: 'Failed to fetch lights' });
  }
});

// Toggle light status
app.put('/lights/:id/toggle', async (req, res) => {
  try {
    const light = await Light.findOne({ id: req.params.id });
    if (!light) {
      return res.status(404).json({ error: 'Light not found' });
    }
    light.status = !light.status;
    await light.save();
    res.json(light);
  } catch (error) {
    console.error('Error toggling light:', error);
    res.status(500).json({ error: 'Failed to toggle light' });
  }
});

// Change light brightness
app.put('/lights/:id/brightness', async (req, res) => {
  try {
    const { brightness } = req.body;
    const light = await Light.findOne({ id: req.params.id });
    if (!light) {
      return res.status(404).json({ error: 'Light not found' });
    }
    light.brightness = brightness;
    await light.save();
    res.json(light);
  } catch (error) {
    console.error('Error changing brightness:', error);
    res.status(500).json({ error: 'Failed to change brightness' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Lighting control service is running' });
});

// Initialize lights if none exist
async function initializeLights() {
  const count = await Light.countDocuments();
  if (count === 0) {
    const defaultLights = [
      { id: 'light1', name: 'Living Room', status: false, brightness: 50 },
      { id: 'light2', name: 'Bedroom', status: false, brightness: 30 },
      { id: 'light3', name: 'Kitchen', status: false, brightness: 70 }
    ];
    await Light.insertMany(defaultLights);
    console.log('Initialized default lights');
  }
}

// Call the initialization function
initializeLights();

// Start the server
app.listen(PORT, () => {
  console.log(`Lighting control service running on port ${PORT}`);
});