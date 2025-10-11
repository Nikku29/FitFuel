# 🚀 FitFuel Deployment Guide

This guide provides step-by-step instructions for deploying FitFuel to various hosting platforms with automatic CI/CD via GitHub Actions.

## 📋 Prerequisites

Before deploying, ensure you have:
- Firebase project set up
- AI API key (OpenAI or DeepSeek)
- Hosting platform account (Netlify, Vercel, etc.)

## 🔧 Quick Setup

### 1. Fork & Clone Repository
```bash
git clone https://github.com/Nikku29/FitFuel.git
cd FitFuel
npm install  # or bun install
```

### 2. Environment Configuration
Copy the environment template:
```bash
cp .env.template .env.local
```

Fill in your configuration in `.env.local`:
```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI API Configuration (Choose one)
VITE_OPENAI_API_KEY=sk-your_openai_key  # Recommended
# OR
VITE_DEEPSEEK_API_KEY=your_deepseek_key  # Cost-effective
```

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

#### Manual Deployment
1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Drag and drop the `dist` folder
   - Configure environment variables in Netlify dashboard

#### Automated Deployment with GitHub Actions
1. **Set up Netlify:**
   - Create a new site on Netlify
   - Get your Site ID and Auth Token from Netlify dashboard

2. **Configure GitHub Secrets:**
   Go to your GitHub repository → Settings → Secrets and variables → Actions
   
   Add these secrets:
   ```
   NETLIFY_SITE_ID=your_netlify_site_id
   NETLIFY_AUTH_TOKEN=your_netlify_auth_token
   
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # AI Configuration
   VITE_OPENAI_API_KEY=sk-your_openai_key
   # OR
   VITE_DEEPSEEK_API_KEY=your_deepseek_key
   ```

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Configure deployment"
   git push origin main
   ```
   
   GitHub Actions will automatically deploy to Netlify!

### Option 2: Vercel

#### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nikku29/FitFuel)

#### Manual Setup
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   npm run build
   vercel --prod
   ```

3. **Configure Environment Variables:**
   - Go to Vercel dashboard → Project → Settings → Environment Variables
   - Add all the environment variables from your `.env.local`

### Option 3: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Build and Deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Option 4: Docker Deployment

1. **Build Docker Image:**
   ```bash
   docker build -t fitfuel .
   ```

2. **Run Container:**
   ```bash
   docker run -p 3000:80 fitfuel
   ```

3. **Deploy to Cloud Platforms:**
   - **Google Cloud Run:** `gcloud run deploy fitfuel --image=fitfuel --platform=managed`
   - **AWS ECS:** Use the built Docker image
   - **Azure Container Instances:** Deploy using Azure CLI

## 🤖 GitHub Actions Configuration

The repository includes automated deployment workflows in `.github/workflows/deploy.yml`.

### Setting Up GitHub Secrets

For automated deployments, add these secrets to your GitHub repository:

#### Required for All Deployments:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

#### AI Configuration (Choose One):
```
VITE_OPENAI_API_KEY=sk-your_openai_key
# OR
VITE_DEEPSEEK_API_KEY=your_deepseek_key
```

#### For Netlify Deployment:
```
NETLIFY_SITE_ID=your_site_id
NETLIFY_AUTH_TOKEN=your_auth_token
```

#### For Firebase Hosting:
```
FIREBASE_SERVICE_ACCOUNT=your_service_account_json
FIREBASE_PROJECT_ID=your_project_id
```

### Workflow Features
- ✅ Automated building on every push
- ✅ Environment variable validation
- ✅ Multi-platform deployment support
- ✅ Build artifact storage
- ✅ Deployment status notifications

## 🔍 Troubleshooting

### Build Issues
- **Node version:** Ensure you're using Node.js 18+
- **Dependencies:** Run `npm ci` to install exact versions
- **Environment variables:** Check all required variables are set

### Deployment Issues
- **Firebase:** Verify project ID and authentication
- **AI APIs:** Check API key validity and quotas
- **Hosting:** Ensure correct build directory (`dist`)

### Common Fixes
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
npm run build

# Check environment variables
npm run build --verbose
```

## 🔒 Security Best Practices

1. **API Keys:**
   - Use environment variables, never hardcode
   - Rotate keys regularly
   - Monitor usage and set limits

2. **Firebase Security:**
   - Configure proper Firestore rules
   - Enable App Check for production
   - Use Firebase Auth for sensitive operations

3. **Hosting Security:**
   - Enable HTTPS (automatic on most platforms)
   - Set proper CORS headers
   - Configure CSP headers (already included)

## 📊 Monitoring & Analytics

### Built-in Monitoring
- **Sentry:** Error tracking and performance monitoring
- **Firebase Analytics:** User behavior and app performance
- **Console Logs:** Development debugging

### Production Monitoring Setup
1. **Sentry Configuration:**
   ```env
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

2. **Firebase Analytics:**
   - Automatically configured with Firebase setup
   - View analytics in Firebase Console

## 🚀 Performance Optimization

The application includes several performance optimizations:
- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** WebP support and lazy loading
- **Caching:** Service worker and asset caching
- **Compression:** Gzip compression enabled
- **Bundle Analysis:** Use `npm run build -- --analyze`

## 🆘 Support

If you encounter issues:
1. Check the [Issues](https://github.com/Nikku29/FitFuel/issues) page
2. Review deployment logs in your hosting platform
3. Verify environment variables are correctly set
4. Test locally with `npm run build && npm run preview`

## 🎉 Success!

Once deployed, your FitFuel application will be available with:
- ✅ AI-powered personalized workouts
- ✅ Smart nutrition recommendations
- ✅ Real-time dashboard insights
- ✅ Secure user authentication
- ✅ Mobile-responsive design

**Enjoy your AI-powered fitness platform!** 💪