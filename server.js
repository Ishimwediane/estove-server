import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: './env.config' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://estove-web.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization,Origin",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/estove', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

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

// Command Schema for ESP32 commands
const commandSchema = new mongoose.Schema({
  command: { type: String, required: true }, // 'start', 'stop', 'manual_on', 'manual_off'
  seconds: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false }
});

const Command = mongoose.model('Command', commandSchema);

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

    // Create a command for ESP32
    const newCommand = new Command({
      command: 'start',
      seconds: seconds
    });
    await newCommand.save();

    // Create a new stove data entry to indicate cooking started
    const newData = new StoveData({
      temperature: 0,
      relay: true,
      manualMode: false,
      cooking: true,
      timeLeft: seconds
    });
    await newData.save();

    console.log('🍳 Cooking started:', { seconds, foodType, weight });

    res.status(200).json({ 
      message: 'Cooking started successfully', 
      data: newData,
      command: newCommand
    });
  } catch (error) {
    console.error('❌ Error starting cooking:', error);
    res.status(500).json({ error: 'Failed to start cooking' });
  }
});

// POST - Stop cooking (send command to ESP32)
app.post('/api/stop-cooking', async (req, res) => {
  try {
    // Create a command for ESP32
    const newCommand = new Command({
      command: 'stop',
      seconds: 0
    });
    await newCommand.save();

    // Create a new stove data entry to indicate cooking stopped
    const newData = new StoveData({
      temperature: 0,
      relay: false,
      manualMode: false,
      cooking: false,
      timeLeft: 0
    });
    await newData.save();

    console.log('⏹️ Cooking stopped - Relay OFF, Cooking OFF');

    res.status(200).json({ 
      message: 'Cooking stopped successfully', 
      data: newData,
      command: newCommand
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
    
    // Create a command for ESP32
    const newCommand = new Command({
      command: manualMode ? 'manual_on' : 'manual_off',
      seconds: 0
    });
    await newCommand.save();

    // Create a new stove data entry
    const newData = new StoveData({
      temperature: 0,
      relay: manualMode,
      manualMode: manualMode,
      cooking: manualMode,
      timeLeft: 0
    });
    await newData.save();

    console.log('🔌 Manual mode toggled:', manualMode);

    res.status(200).json({ 
      message: 'Manual mode toggled successfully', 
      data: newData,
      command: newCommand
    });
  } catch (error) {
    console.error('❌ Error toggling manual mode:', error);
    res.status(500).json({ error: 'Failed to toggle manual mode' });
  }
});

// GET - Get pending commands for ESP32
app.get('/api/commands/pending', async (req, res) => {
  try {
    const pendingCommands = await Command.find({ processed: false })
      .sort({ timestamp: -1 })
      .limit(1);
    
    res.json(pendingCommands[0] || { message: 'No pending commands' });
  } catch (error) {
    console.error('❌ Error fetching pending commands:', error);
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

// POST - Mark command as processed
app.post('/api/commands/processed', async (req, res) => {
  try {
    const { commandId } = req.body;
    
    await Command.findByIdAndUpdate(commandId, { processed: true });
    
    res.json({ message: 'Command marked as processed' });
  } catch (error) {
    console.error('❌ Error marking command as processed:', error);
    res.status(500).json({ error: 'Failed to mark command as processed' });
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