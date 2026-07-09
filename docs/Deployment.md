# Deployment Guide

BinWatch is designed to be deployed as a single full-stack monolithic Node.js application.

## Prerequisites
1. A **MongoDB Atlas** database cluster.
2. A **Resend** account for email API keys.
3. A **Google Cloud Console** account with Maps JavaScript API enabled.

## Option A: Render / Heroku / DigitalOcean App Platform (Recommended)
Because BinWatch relies on long-lived WebSocket connections, a traditional containerized host is recommended over serverless environments.

1. Create a new "Web Service" connected to your GitHub repository.
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. Inject your Environment Variables in the host's dashboard:
   - `PORT=3000` (Render will usually assign this automatically)
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=yoursecret`
   - `RESEND_API_KEY=re_...`
   - `ADMIN_EMAIL=admin@yourdomain.com`
   - `FROM_EMAIL=alerts@yourdomain.com`
   - `GOOGLE_MAPS_API_KEY=AIzaSy...`

## Option B: Vercel / Netlify (Not Recommended)
Serverless platforms will terminate long-lived WebSocket connections and are not recommended for the `server.js` architecture as written. You would need to migrate from WebSockets to a Server-Sent Events (SSE) or polling mechanism, or deploy the backend separately.
