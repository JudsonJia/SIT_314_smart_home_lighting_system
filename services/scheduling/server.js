const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.SCHEDULING_PORT || 3005;

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Schedule model
const scheduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cronExpression: { type: String, required: true },
  action: {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    command: { type: String, enum: ['turnOn', 'turnOff', 'setBrightness', 'setColor'], required: true },
    value: { type: mongoose.Schema.Types.Mixed }
  },
  isActive: { type: Boolean, default: true }
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

// Routes
app.post('/schedules', async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    await setupCronJob(schedule);
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    await setupCronJob(schedule);
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/schedules/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    cron.getTasks().get(schedule.id)?.stop();
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Auth service is healthy' });
});

// Function to setup cron job for a schedule
async function setupCronJob(schedule) {
  const existingTask = cron.getTasks().get(schedule.id);
  if (existingTask) {
    existingTask.stop();
  }

  if (schedule.isActive) {
    cron.schedule(schedule.cronExpression, async () => {
      try {
        await axios.put(`${process.env.DEVICE_MANAGEMENT_SERVICE_URL}/devices/${schedule.action.deviceId}`, {
          status: {
            [schedule.action.command === 'turnOn' ? 'isOn' : schedule.action.command.slice(3).toLowerCase()]: 
              schedule.action.command === 'turnOn' ? true : 
              schedule.action.command === 'turnOff' ? false : 
              schedule.action.value
          }
        });
        console.log(`Executed schedule: ${schedule.name}`);
      } catch (error) {
        console.error(`Error executing schedule ${schedule.name}:`, error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust this to your timezone
    }).start();
  }
}

// Initialize all active schedules on startup
async function initializeSchedules() {
  try {
    const schedules = await Schedule.find({ isActive: true });
    for (const schedule of schedules) {
      await setupCronJob(schedule);
    }
    console.log('All active schedules initialized');
  } catch (error) {
    console.error('Error initializing schedules:', error);
  }
}

initializeSchedules();

app.listen(PORT, () => {
  console.log(`Scheduling service running on port ${PORT}`);
});
