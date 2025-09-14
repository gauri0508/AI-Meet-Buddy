# Deployment Guide

## Quick Start

### 1. Backend Deployment (Render/Heroku)

1. **Create a new web service** on Render or Heroku
2. **Connect your GitHub repository**
3. **Set environment variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-meeting-summarizer
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   PORT=5000
   ```
4. **Deploy**

### 2. Frontend Deployment (Vercel/Netlify)

1. **Connect your GitHub repository**
2. **Set build command**: `npm run build`
3. **Set output directory**: `dist`
4. **Set environment variables** (if needed):
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
5. **Deploy**

### 3. Database Setup (MongoDB Atlas)

1. **Create a free MongoDB Atlas account**
2. **Create a new cluster**
3. **Create a database user**
4. **Whitelist your IP address**
5. **Get your connection string**
6. **Update MONGODB_URI in your backend environment variables**

## Local Development

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/ai-meeting-summarizer
HUGGINGFACE_API_KEY=your_huggingface_api_key
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Getting Hugging Face API Key

1. Go to https://huggingface.co/
2. Sign up/Login
3. Go to Settings > Access Tokens
4. Create a new token with "Read" permissions
5. Copy the token to your environment variables
