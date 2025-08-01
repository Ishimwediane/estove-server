# 🚀 eStove Server API Endpoints

## 📊 Data Endpoints

### **GET** `/api/stove-data/latest`
- **Purpose**: Get the most recent stove data
- **Response**: Latest stove data object or `{ message: 'No data available' }`

### **GET** `/api/stove-data`
- **Purpose**: Get all stove data with pagination
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)
- **Response**:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "pages": number
    }
  }
  ```

### **GET** `/api/stove-data/range`
- **Purpose**: Get stove data for a specific time range
- **Query Parameters**:
  - `start`: Start date (ISO string)
  - `end`: End date (ISO string)
- **Response**: Array of stove data within the specified range

### **POST** `/api/stove-data`
- **Purpose**: Receive data from ESP32
- **Body Parameters**:
  ```json
  {
    "temperature": number,
    "relay": boolean,
    "manualMode": boolean,
    "cooking": boolean,
    "timeLeft": number
  }
  ```
- **Response**: `{ message: 'Data saved successfully', data: savedData }`

## 🎮 Control Endpoints

### **POST** `/api/start-cooking`
- **Purpose**: Start cooking with timer (send command to ESP32)
- **Body Parameters**:
  ```json
  {
    "seconds": number,        // Cooking time in seconds
    "foodType": string,       // Optional: food type
    "weight": number          // Optional: food weight
  }
  ```
- **Response**:
  ```json
  {
    "message": "Cooking started successfully",
    "data": stoveDataObject,
    "esp32Response": "Started cooking for Xm Ys"
  }
  ```

### **POST** `/api/stop-cooking`
- **Purpose**: Stop cooking (send command to ESP32)
- **Body Parameters**: None
- **Response**:
  ```json
  {
    "message": "Cooking stopped successfully",
    "data": stoveDataObject,
    "esp32Response": "Cooking stopped successfully"
  }
  ```

### **POST** `/api/toggle-manual`
- **Purpose**: Toggle manual mode on/off
- **Body Parameters**:
  ```json
  {
    "manualMode": boolean
  }
  ```
- **Response**:
  ```json
  {
    "message": "Manual mode toggled successfully",
    "data": stoveDataObject,
    "esp32Response": "Manual mode activated/deactivated"
  }
  ```

## 🔍 System Endpoints

### **GET** `/health`
- **Purpose**: Health check endpoint
- **Response**: `{ status: 'OK', timestamp: Date }`

### **GET** `/`
- **Purpose**: Welcome message
- **Response**: `"Welcome to eStove API!"`

## 📊 Data Schema

Each stove data record contains:
```json
{
  "temperature": number,      // Temperature reading (°C)
  "relay": boolean,          // Relay status (on/off)
  "manualMode": boolean,     // Manual mode status
  "cooking": boolean,        // Cooking status
  "timeLeft": number,        // Time remaining (seconds)
  "timestamp": Date          // When data was recorded
}
```

## 🌐 Example Usage

### Testing with curl:

```bash
# Health check
curl https://your-server-url/health

# Get latest data
curl https://your-server-url/api/stove-data/latest

# Start cooking for 10 minutes
curl -X POST https://your-server-url/api/start-cooking \
  -H "Content-Type: application/json" \
  -d '{
    "seconds": 600,
    "foodType": "chicken",
    "weight": 500
  }'

# Stop cooking
curl -X POST https://your-server-url/api/stop-cooking \
  -H "Content-Type: application/json"

# Toggle manual mode on
curl -X POST https://your-server-url/api/toggle-manual \
  -H "Content-Type: application/json" \
  -d '{"manualMode": true}'

# Send data from ESP32
curl -X POST https://your-server-url/api/stove-data \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 180.5,
    "relay": true,
    "manualMode": false,
    "cooking": true,
    "timeLeft": 1200
  }'
```

## 🔧 CORS Configuration

Your server accepts requests from:
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://estove-web.vercel.app` (your frontend)
- Environment variable `FRONTEND_URL`

All endpoints support these HTTP methods: `GET`, `POST`, `PUT`, `DELETE`

## 🚨 Error Responses

All endpoints return error responses in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error 