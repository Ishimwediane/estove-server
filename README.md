# eStove Server

A Node.js server to receive and store data from ESP32 smart stove controller.

## Features

- Receives temperature, relay status, and cooking data from ESP32
- Stores data in MongoDB database
- RESTful API endpoints for data retrieval
- Real-time data logging

## API Endpoints

- `POST /api/stove-data` - Receive data from ESP32
- `GET /api/stove-data/latest` - Get latest data
- `GET /api/stove-data` - Get all data with pagination
- `GET /api/stove-data/range` - Get data for specific time range
- `GET /health` - Health check
- `GET /` - Welcome message

## Deployment on Render

### 1. Prepare Your Repository

1. Push your code to GitHub
2. Ensure all files are committed

### 2. Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `estove-server` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid if needed)

### 3. Environment Variables

Add these environment variables in Render dashboard:

```
NODE_ENV=production
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
DB_NAME=estove
DB_HOST=localhost
PORT=10000
```

### 4. Get Your Deployment URL

After deployment, Render will provide a URL like:
`https://your-app-name.onrender.com`

### 5. Update ESP32 Code

Update your ESP32 code with the Render URL:

```cpp
const char* serverUrl = "https://your-app-name.onrender.com";
const char* dataEndpoint = "/api/stove-data";
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   # Create env.config file with your variables
   ```

3. Start server:
   ```bash
   npm run dev
   ```

## Data Format

ESP32 sends JSON data in this format:

```json
{
  "temperature": 25.5,
  "relay": true,
  "manualMode": false,
  "cooking": true,
  "timeLeft": 120
}
```

## Database Schema

```javascript
{
  temperature: Number,
  relay: Boolean,
  manualMode: Boolean,
  cooking: Boolean,
  timeLeft: Number,
  timestamp: Date
}
``` 