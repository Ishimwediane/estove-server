import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config({ path: './env.config' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://estove-web.vercel.app", // Your Vercel frontend
    process.env.FRONTEND_URL // Allow environment variable for frontend URL
  ].filter(Boolean), // Remove undefined values
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization,Origin",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Stove Data Schema
const stoveDataSchema = new mongoose.Schema({
  temperature: { type: Number, required: true },
  relay: { type: Boolean, required: true },
  manualMode: { type: Boolean, required: true },
  cooking: { type: Boolean, required: true },
  timeLeft: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

const StoveData = mongoose.model('StoveData', stoveDataSchema);

// Routes

// POST - Receive data from ESP32
app.post('/api/stove-data', async (req, res) => {
  try {
    const { temperature, relay, manualMode, cooking, timeLeft } = req.body;
    
    const newData = new StoveData({
      temperature: parseFloat(temperature),
      relay: Boolean(relay),
      manualMode: Boolean(manualMode),
      cooking: Boolean(cooking),
      timeLeft: parseInt(timeLeft)
    });

    await newData.save();
    console.log('📊 Data saved:', newData);
    res.status(200).json({ message: 'Data saved successfully', data: newData });
  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// GET - Get latest data
app.get('/api/stove-data/latest', async (req, res) => {
  try {
    const latestData = await StoveData.findOne().sort({ timestamp: -1 });
    res.json(latestData || { message: 'No data available' });
  } catch (error) {
    console.error('❌ Error fetching latest data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// GET - Get all data (with pagination)
app.get('/api/stove-data', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const data = await StoveData.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await StoveData.countDocuments();

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// GET - Get data for specific time range
app.get('/api/stove-data/range', async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const data = await StoveData.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: -1 });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching range data:', error);
    res.status(500).json({ error: 'Failed to fetch range data' });
  }
});

// POST - Start cooking (send command to ESP32)
app.post('/api/start-cooking', async (req, res) => {
  try {
    const { seconds, foodType, weight } = req.body;
    
    if (!seconds || seconds <= 0) {
      return res.status(400).json({ error: 'Invalid cooking time' });
    }

    // Create a new stove data entry to indicate cooking started
    const newData = new StoveData({
      temperature: 0, // Will be updated by ESP32
      relay: true,
      manualMode: false,
      cooking: true,
      timeLeft: seconds
    });

    await newData.save();
    console.log('🍳 Cooking started:', { seconds, foodType, weight });

    // TODO: Send command to ESP32 to start cooking
    // This would typically involve sending a request to your ESP32
    // For now, we'll simulate the ESP32 response
    const esp32Response = `Started cooking for ${Math.floor(seconds / 60)}m ${seconds % 60}s`;

    res.status(200).json({ 
      message: 'Cooking started successfully', 
      data: newData,
      esp32Response: esp32Response
    });
  } catch (error) {
    console.error('❌ Error starting cooking:', error);
    res.status(500).json({ error: 'Failed to start cooking' });
  }
});

// POST - Stop cooking (send command to ESP32)
app.post('/api/stop-cooking', async (req, res) => {
  try {
    // Create a new stove data entry to indicate cooking stopped
    const newData = new StoveData({
      temperature: 0, // Will be updated by ESP32
      relay: false,
      manualMode: false,
      cooking: false,
      timeLeft: 0
    });

    await newData.save();
    console.log('⏹️ Cooking stopped - Relay OFF, Cooking OFF');

    // TODO: Send command to ESP32 to stop cooking
    // This would typically involve sending a request to your ESP32
    // For now, we'll simulate the ESP32 response
    const esp32Response = 'Cooking stopped - Relay turned OFF';

    res.status(200).json({ 
      message: 'Cooking stopped successfully', 
      data: newData,
      esp32Response: esp32Response
    });
  } catch (error) {
    console.error('❌ Error stopping cooking:', error);
    res.status(500).json({ error: 'Failed to stop cooking' });
  }
});

// POST - Toggle manual mode
app.post('/api/toggle-manual', async (req, res) => {
  try {
    const { manualMode } = req.body;
    
    // Create a new stove data entry to indicate manual mode change
    const newData = new StoveData({
      temperature: 0, // Will be updated by ESP32
      relay: manualMode, // Relay on if manual mode, off if not
      manualMode: manualMode,
      cooking: manualMode, // Cooking is true if manual mode is on
      timeLeft: 0 // Manual mode doesn't use timer
    });

    await newData.save();
    console.log('🔌 Manual mode toggled:', manualMode);

    // TODO: Send command to ESP32 to toggle manual mode
    const esp32Response = manualMode ? 'Manual mode activated' : 'Manual mode deactivated';

    res.status(200).json({ 
      message: 'Manual mode toggled successfully', 
      data: newData,
      esp32Response: esp32Response
    });
  } catch (error) {
    console.error('❌ Error toggling manual mode:', error);
    res.status(500).json({ error: 'Failed to toggle manual mode' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to eStove API!');
});

// Start server
app.listen(PORT, () => {
  const serverUrl = process.env.NODE_ENV === 'production'
    ? `https://your-app-name.onrender.com`
    : `http://localhost:${PORT}`;
    
  console.log(`🚀 Server running on ${serverUrl}`);
  console.log(`📡 ESP32 can send data to: ${serverUrl}/api/stove-data`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});