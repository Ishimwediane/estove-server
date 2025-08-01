# 🚀 Server Updates - Command System Added

## ✅ **New Features Added**

### **1. Command Schema**
```javascript
const commandSchema = new mongoose.Schema({
  command: { type: String, required: true }, // 'start', 'stop', 'manual_on', 'manual_off'
  seconds: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  processed: { type: Boolean, default: false }
});
```

### **2. Enhanced Control Endpoints**

#### **🍳 Start Cooking (`POST /api/start-cooking`)**
- **Before**: Only saved stove data
- **Now**: Creates command + saves stove data
- **Command**: `{ command: 'start', seconds: 300 }`

#### **⏹️ Stop Cooking (`POST /api/stop-cooking`)**
- **Before**: Only saved stove data  
- **Now**: Creates command + saves stove data
- **Command**: `{ command: 'stop', seconds: 0 }`

#### **🔌 Toggle Manual (`POST /api/toggle-manual`)**
- **Before**: Only saved stove data
- **Now**: Creates command + saves stove data
- **Command**: `{ command: 'manual_on' }` or `{ command: 'manual_off' }`

### **3. New Command Management Endpoints**

#### **📥 Get Pending Commands (`GET /api/commands/pending`)**
- Returns the latest unprocessed command for ESP32
- ESP32 can poll this endpoint to get new commands
- Returns: `{ command: 'start', seconds: 300, _id: '...' }`

#### **✅ Mark Command Processed (`POST /api/commands/processed`)**
- ESP32 calls this after executing a command
- Marks command as processed so it won't be returned again
- Body: `{ commandId: 'command_id_here' }`

## 🔄 **How the New System Works**

### **Web → Server → ESP32 Flow:**
1. **User clicks "Start Cooking"** on web
2. **Server creates command**: `{ command: 'start', seconds: 300, processed: false }`
3. **Server saves stove data**: `{ cooking: true, relay: true, timeLeft: 300 }`
4. **ESP32 polls** `/api/commands/pending` every second
5. **ESP32 gets command** and executes it
6. **ESP32 calls** `/api/commands/processed` to mark as done
7. **ESP32 sends data** to `/api/stove-data` with current status

### **Command Types:**
- `start` - Start cooking with timer
- `stop` - Stop cooking immediately  
- `manual_on` - Enable manual mode
- `manual_off` - Disable manual mode

## 📊 **API Endpoints Summary**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stove-data` | POST | ESP32 sends sensor data |
| `/api/stove-data/latest` | GET | Get latest stove status |
| `/api/stove-data` | GET | Get all data (paginated) |
| `/api/stove-data/range` | GET | Get data for time range |
| `/api/start-cooking` | POST | Start cooking (creates command) |
| `/api/stop-cooking` | POST | Stop cooking (creates command) |
| `/api/toggle-manual` | POST | Toggle manual mode (creates command) |
| `/api/commands/pending` | GET | Get latest unprocessed command |
| `/api/commands/processed` | POST | Mark command as processed |
| `/health` | GET | Server health check |

## 🎯 **Benefits of Command System**

1. **🔄 Better Sync**: Commands are stored and tracked
2. **📱 Reliable Delivery**: ESP32 won't miss commands
3. **🛡️ Error Handling**: Commands can be retried if needed
4. **📊 Command History**: Track all commands sent
5. **⚡ Real-time**: 1-second polling for immediate response

## 🚀 **Next Steps**

1. **Deploy updated server** to Render
2. **Update ESP32 code** to use new command endpoints
3. **Test the full flow**:
   - Web → Server → Command → ESP32 → Response
   - Verify commands are processed correctly
   - Check command history in database

Your server now has a **robust command system** for reliable ESP32 communication! 🎉 