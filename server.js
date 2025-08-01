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
  origin: ["http://localhost:5173", "http://localhost:3000"],
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