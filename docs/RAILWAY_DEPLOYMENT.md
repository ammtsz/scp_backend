# Railway Deployment Guide for NestJS Backend

This guide will help you deploy your NestJS healthcare management backend to Railway with proper environment configuration and database setup.

## 🚂 Railway Deployment Overview

Railway is a modern deployment platform that provides managed PostgreSQL databases and seamless deployments. This backend is configured to work with both individual database environment variables (for local development) and Railway's `DATABASE_URL` (for production).

## 📋 Pre-Deployment Checklist

### 1. **Prepare Your Railway Project**

- Create a Railway account at [railway.app](https://railway.app)
- **Dashboard Method (Recommended)**: Use Railway's web dashboard for deployment
- **CLI Method (Optional)**: Install Railway CLI: `npm install -g @railway/cli` and login: `railway login`

### 2. **Backend Code Preparation**

- ✅ Database module supports both individual vars and `DATABASE_URL`
- ✅ CORS configured to accept frontend domain
- ✅ Port configuration handles Railway's dynamic PORT assignment
- ✅ Environment variables properly configured

## 🔧 Environment Variables Configuration

### Required Variables in Railway Dashboard

Set these environment variables in your Railway project dashboard:

```bash
# Database Configuration (Railway PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database
# Railway automatically provides this when you add PostgreSQL service

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Application Configuration
PORT=8080
# Railway may override this with their own PORT variable

# Rate Limiting (Optional - these have defaults)
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS Configuration (Critical for frontend integration)
CORS_ORIGIN=https://your-vercel-app-domain.vercel.app
# Replace with your actual Vercel frontend URL
```

### 🚨 **Critical Configuration Notes**

#### Database URL Priority

- Railway provides `DATABASE_URL` automatically when you add PostgreSQL
- Our backend will use `DATABASE_URL` if available, falling back to individual vars
- **Do NOT set individual `POSTGRES_*` variables in Railway** - use `DATABASE_URL` only

#### CORS Origin

- **Must be set to your exact Vercel frontend URL**
- Format: `https://your-app-name.vercel.app` (no trailing slash)
- Without this, your frontend won't be able to connect to the API

#### JWT Secret

- **Generate a secure random string** (at least 32 characters)
- Use: `openssl rand -base64 32` to generate one
- Keep this secret and never share it

## 🗄️ Database Setup

### 1. **Add PostgreSQL Service**

In Railway dashboard:

1. Go to your project
2. Click "New Service"
3. Select "Database" → "PostgreSQL"
4. Railway will automatically create and configure the database

### 2. **Database URL Configuration**

Railway automatically sets `DATABASE_URL` with this format:

```
postgresql://postgres:password@container-host:5432/railway
```

Your backend will automatically use this URL for database connection.

### 3. **Database Schema Initialization**

Your database schema will be created automatically on first deployment through the `init.sql` file. The backend is configured with `synchronize: false` for production safety.

## 🚀 Deployment Steps

### **Method A: Dashboard Deployment (Recommended)** 🌟

#### 1. **Create Project via Dashboard**

1. Go to [railway.app/dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `mvp-center-backend` repository
5. Railway automatically detects Node.js and starts building

#### 2. **Add PostgreSQL Database**

1. In project dashboard, click **"New Service"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway automatically provisions and connects the database

#### 3. **Configure Environment Variables**

1. Click on your backend service (not the database)
2. Go to **"Variables"** tab
3. Add required variables:
   - **`JWT_SECRET`**: Generate with `openssl rand -base64 32`
   - **`CORS_ORIGIN`**: `https://your-vercel-app.vercel.app`
   - Optional: `THROTTLE_TTL=60`, `THROTTLE_LIMIT=100`

#### 4. **Monitor Deployment**

- Watch the **"Deployments"** tab for build progress
- Automatic deployment on GitHub pushes (enabled by default)
- Get your URL from **"Settings"** → **"Domains"**

---

### **Method B: CLI Deployment (Alternative)**

#### 1. **Connect Repository**

```bash
# In your backend directory
railway link
# Or create new project: railway init
```

#### 2. **Add PostgreSQL Database**

```bash
railway add postgresql
```

#### 3. **Configure Environment Variables**

```bash
railway variables set JWT_SECRET=your-secure-secret-here
railway variables set CORS_ORIGIN=https://your-app.vercel.app
railway variables set THROTTLE_TTL=60
railway variables set THROTTLE_LIMIT=100
```

#### 4. **Deploy**

```bash
railway up
```

### 5. **Verify Deployment**

After deployment:

1. Check Railway logs for successful startup
2. Verify database connection in logs
3. Test API endpoints using the provided Railway URL
4. Check Swagger documentation at `https://your-railway-app.railway.app/api`

## 🔍 Troubleshooting

### Common Issues

#### 1. **Database Connection Failed**

**Error:** `connection refused` or `database does not exist`

**Solutions:**

- Verify `DATABASE_URL` is set correctly in Railway
- Check PostgreSQL service is running in Railway dashboard
- Ensure database service and backend service are in same project

#### 2. **CORS Error in Frontend**

**Error:** `Access to fetch blocked by CORS policy`

**Solutions:**

- Set `CORS_ORIGIN` to exact frontend URL (including `https://`)
- Remove any trailing slashes from the URL
- Ensure frontend is using correct API URL

#### 3. **Port Binding Error**

**Error:** `Port already in use` or `EADDRINUSE`

**Solutions:**

- Railway handles PORT automatically
- Remove any hardcoded port numbers
- Let Railway assign the port via environment variables

#### 4. **JWT Secret Missing**

**Error:** `JWT_SECRET is required` or authentication failures

**Solutions:**

- Set `JWT_SECRET` environment variable in Railway
- Generate secure random string: `openssl rand -base64 32`
- Ensure secret is at least 32 characters

### Debugging Commands

```bash
# Check deployment logs
railway logs

# Check current variables
railway variables

# SSH into container for debugging
railway shell

# Check service status
railway status
```

## 📊 Monitoring and Maintenance

### Health Checks

Your backend includes health check endpoints:

- `GET /` - Basic health check
- `GET /api` - Swagger documentation

### Performance Monitoring

Railway provides built-in monitoring:

- CPU and memory usage
- Request metrics
- Error rates
- Response times

Access these in your Railway project dashboard under "Observability."

### Database Management

For database operations:

- Use Railway's database dashboard for basic operations
- Connect via `psql` using the `DATABASE_URL`
- Monitor connection counts and query performance

## 🔗 Integration with Frontend

After successful backend deployment:

1. **Update Frontend API URL**

   ```typescript
   // In mvp-center/src/api/lib/axios.ts
   const api: AxiosInstance = axios.create({
     baseURL: 'https://your-railway-app.railway.app', // Replace with Railway URL
     // ... rest of config
   });
   ```

2. **Environment Variable in Frontend**

   ```bash
   # In Vercel deployment settings
   NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
   ```

3. **Test Integration**
   - Deploy frontend with new API URL
   - Test patient management features
   - Verify attendance management works
   - Check treatment record functionality

## 🛡️ Security Considerations

### Production Security Checklist

- ✅ JWT_SECRET is secure and unique
- ✅ CORS_ORIGIN restricts access to your frontend domain only
- ✅ Database credentials are managed by Railway (secure)
- ✅ Rate limiting is enabled (THROTTLE_TTL/THROTTLE_LIMIT)
- ✅ Input validation is enabled globally
- ✅ Error handling doesn't expose sensitive information

### Environment Variables Security

- Never commit `.env` files to version control
- Use Railway's environment variable management
- Rotate JWT_SECRET periodically
- Monitor access logs for suspicious activity

---

## 📞 Support Resources

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **NestJS Deployment Guide**: [docs.nestjs.com/deployment](https://docs.nestjs.com/deployment)
- **Railway Discord**: Active community support
- **Project Issues**: Check GitHub issues for known problems

---

**Next Steps:** After successful Railway deployment, update your frontend configuration to use the new Railway API URL and test all functionality end-to-end.
