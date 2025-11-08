# 🚂 Railway Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. **Railway Account & CLI**

- [ ] Create Railway account at [railway.app](https://railway.app)
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login to Railway: `railway login`

### 2. **Code Preparation**

- [ ] Backend code updated with Railway-compatible database configuration
- [ ] Environment variables template created (`.env.railway`)
- [ ] CORS configuration ready for frontend URL

## ✅ Railway Project Setup

### 3. **Initialize Project**

- [ ] Navigate to backend directory: `cd mvp-center-backend`
- [ ] Initialize Railway project: `railway init` or `railway link`
- [ ] Choose project name (e.g., "mvp-center-backend")

### 4. **Add PostgreSQL Database**

- [ ] Add PostgreSQL service: `railway add postgresql`
- [ ] Verify `DATABASE_URL` appears in variables: `railway variables`
- [ ] Database should be automatically configured

### 5. **Configure Environment Variables**

#### Required Variables:

- [ ] `JWT_SECRET` - Generate secure key: `openssl rand -base64 32`
- [ ] `CORS_ORIGIN` - Set to your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

#### Optional Variables (have defaults):

- [ ] `THROTTLE_TTL=60`
- [ ] `THROTTLE_LIMIT=100`

**Set via CLI:**

```bash
railway variables set JWT_SECRET="your-generated-secret-here"
railway variables set CORS_ORIGIN="https://your-vercel-app.vercel.app"
```

**Or via Dashboard:**

1. Go to Railway project dashboard
2. Click on your service → Variables tab
3. Add each variable

## ✅ Deployment

### 6. **Deploy to Railway**

- [ ] Deploy: `railway up`
- [ ] Or connect GitHub repository for auto-deployment
- [ ] Wait for build to complete (check logs: `railway logs`)

### 7. **Verify Deployment**

- [ ] Check Railway logs for successful startup
- [ ] Look for: "✅ Application started successfully!"
- [ ] Verify database connection message
- [ ] Note the Railway-provided URL

### 8. **Test API Endpoints**

- [ ] Visit: `https://your-railway-app.railway.app`
- [ ] Check Swagger docs: `https://your-railway-app.railway.app/api`
- [ ] Test basic endpoints (health check)

## ✅ Frontend Integration

### 9. **Update Frontend Configuration**

- [ ] Update API URL in frontend code:
  ```typescript
  // In mvp-center/src/api/lib/axios.ts
  baseURL: 'https://your-railway-app.railway.app';
  ```
- [ ] Or set environment variable in Vercel:
  ```bash
  NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
  ```

### 10. **Frontend Deployment**

- [ ] Deploy frontend with updated API URL
- [ ] Test CORS by making API calls from frontend
- [ ] Verify all features work end-to-end

## ✅ Post-Deployment Verification

### 11. **End-to-End Testing**

- [ ] Patient management (create, read, update)
- [ ] Attendance management (scheduling, status updates)
- [ ] Treatment records functionality
- [ ] Authentication (if implemented)

### 12. **Monitor & Troubleshoot**

- [ ] Check Railway dashboard for metrics
- [ ] Monitor error rates and response times
- [ ] Set up alerts if needed

## 🚨 Common Issues & Solutions

### Database Connection Issues

- [ ] Verify `DATABASE_URL` is set in Railway variables
- [ ] Check PostgreSQL service is running in Railway dashboard
- [ ] Review logs for connection error details

### CORS Issues

- [ ] Ensure `CORS_ORIGIN` matches frontend URL exactly
- [ ] Include `https://` in the URL
- [ ] Remove any trailing slashes

### Build/Deployment Issues

- [ ] Check `package.json` scripts are correct
- [ ] Verify all dependencies are listed in `dependencies` (not `devDependencies`)
- [ ] Review build logs for specific errors

### Port Issues

- [ ] Railway automatically handles PORT assignment
- [ ] Don't hardcode port numbers
- [ ] Backend listens on `0.0.0.0` (all interfaces)

## 📞 Getting Help

### If deployment fails:

1. Check Railway logs: `railway logs`
2. Review variables: `railway variables`
3. Check service status: `railway status`
4. Join Railway Discord for community support
5. Check Railway documentation: [docs.railway.app](https://docs.railway.app)

### Useful Commands:

```bash
railway logs --tail          # Follow logs in real-time
railway shell               # SSH into container
railway variables           # List all environment variables
railway status              # Check deployment status
railway redeploy           # Trigger new deployment
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Railway Logs:**

   ```
   ✅ Application started successfully!
   Environment: production
   🚂 Railway deployment detected
   Database Config: Using DATABASE_URL (Railway/Production)
   🔒 CORS configured for: https://your-app.vercel.app
   ```

2. **Swagger Documentation:** Available at `/api` endpoint
3. **Health Check:** Root endpoint returns app info
4. **Frontend Integration:** No CORS errors, all API calls work

---

**🎉 Once complete, your NestJS backend will be fully deployed on Railway with managed PostgreSQL and ready for production use!**
