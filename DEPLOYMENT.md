# 🚀 Deploy eStove Server to the Web

This guide will help you deploy your eStove server to the internet so it can be accessed from anywhere.

## 🌐 Deployment Options

### Option 1: Render (Recommended - Free)
Render is a modern cloud platform that offers free hosting for Node.js applications.

#### Steps:
1. **Sign up for Render**
   - Go to [render.com](https://render.com)
   - Create a free account

2. **Connect your GitHub repository**
   - Push your code to GitHub if you haven't already
   - In Render dashboard, click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure the service**
   - **Name**: `estove-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Set Environment Variables**
   In the Render dashboard, go to Environment → Environment Variables and add:
   ```
   NODE_ENV=production
   PORT=10000
   DB_USER=your_mongodb_atlas_username
   DB_NAME=estove
   DB_PASS=your_mongodb_atlas_password
   DB_HOST=your_mongodb_atlas_cluster.mongodb.net
       FRONTEND_URL=https://estove-web.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app
   - Your server will be available at: `https://your-app-name.onrender.com`

### Option 2: Railway
Railway is another excellent free option for Node.js deployment.

### Option 3: Heroku
Heroku offers a free tier (with some limitations).

## 🗄️ Database Setup for Production

### MongoDB Atlas (Recommended)
1. **Create MongoDB Atlas account**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free account

2. **Create a cluster**
   - Choose the free tier (M0)
   - Select your preferred region

3. **Set up database access**
   - Create a database user with read/write permissions
   - Note down username and password

4. **Set up network access**
   - Add IP address `0.0.0.0/0` to allow access from anywhere

5. **Get connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

6. **Update environment variables**
   - Replace the database credentials in your deployment platform

## 🔧 Configuration Updates

### Update ESP32 Code
Once deployed, update your ESP32 code to send data to your new server URL:

```cpp
// Replace localhost with your deployed server URL
const char* serverUrl = "https://your-app-name.onrender.com/api/stove-data";
```

### Update Frontend (if applicable)
Your frontend is already deployed at [https://estove-web.vercel.app/](https://estove-web.vercel.app/). Once you deploy your backend server, update your frontend's API base URL to point to your deployed server:

```javascript
const API_BASE_URL = 'https://your-app-name.onrender.com';
```

## 🌍 Testing Your Deployment

1. **Health Check**
   ```
   GET https://your-app-name.onrender.com/health
   ```

2. **Test API Endpoints**
   ```
   GET https://your-app-name.onrender.com/api/stove-data/latest
   POST https://your-app-name.onrender.com/api/stove-data
   ```

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to your repository
   - Use environment variables for all secrets

2. **CORS Configuration**
   - Update the `FRONTEND_URL` environment variable with your actual frontend domain
   - Remove `http://localhost:5173` from production CORS origins

3. **Rate Limiting**
   - Consider adding rate limiting for production use
   - Implement authentication if needed

## 📊 Monitoring

- **Render**: Built-in logs and metrics
- **MongoDB Atlas**: Database monitoring and alerts
- **Custom**: Add logging to track API usage

## 🚨 Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are in `package.json`
2. **Database connection fails**: Verify MongoDB Atlas credentials and network access
3. **CORS errors**: Update CORS origins in your deployment environment variables
4. **Port issues**: Render uses port 10000, ensure your app respects the PORT environment variable

### Debug Commands:
```bash
# Check server logs
npm start

# Test database connection locally
node -e "import('./config/db.js').then(db => db.default())"
```

## 📱 Next Steps

1. **Set up automatic deployments** from your GitHub repository
2. **Configure custom domain** (optional)
3. **Set up SSL certificates** (usually automatic on modern platforms)
4. **Implement monitoring and alerts**
5. **Add authentication** if needed for production use

Your server will now be accessible from anywhere in the world! 🌍 