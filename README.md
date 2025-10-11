# FitFuel AI Guide

## 🚀 AI-Powered Personal Fitness Companion

**FitFuel AI Guide** is a comprehensive fitness application developed by Nikku29 that provides personalized workout routines, nutrition guidance, and wellness tracking powered by artificial intelligence.

## ✨ Features

- **AI-Powered Personalization**: Get customized workout and nutrition plans based on your goals, preferences, and progress
- **Comprehensive Workout Library**: Access a wide variety of exercises with detailed instructions and animations
- **Smart Nutrition Guidance**: Discover healthy recipes tailored to your dietary preferences and fitness goals
- **Progress Tracking**: Monitor your fitness journey with detailed analytics and insights
- **Community Support**: Connect with like-minded fitness enthusiasts
- **Real-time AI Assistant**: Get instant answers to your fitness and nutrition questions

## 🛠️ Technologies Used

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query + Context API
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **AI Integration**: OpenAI/DeepSeek API
- **Animations**: Framer Motion + Lottie React
- **Icons**: Lucide React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Firebase account
- OpenAI or DeepSeek API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Nikku29/FitFuel.git
cd FitFuel

# Install dependencies (choose one)
npm install
# or
bun install

# Copy environment template
cp .env.template .env.local
```

### Environment Setup

Create a `.env.local` file in your project root and add the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# AI API Configuration (choose one)
VITE_OPENAI_API_KEY=your_openai_api_key
# or
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key

# Optional: Sentry for error tracking
VITE_SENTRY_DSN=your_sentry_dsn
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Update Firebase configuration in your `.env.local`
5. Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

### AI API Setup

#### Option 1: OpenAI API
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add `VITE_OPENAI_API_KEY` to your `.env.local`

#### Option 2: DeepSeek API (Recommended for cost-effectiveness)
1. Create account at [DeepSeek Platform](https://platform.deepseek.com/)
2. Generate API key
3. Add `VITE_DEEPSEEK_API_KEY` to your `.env.local`

### Development Server

```bash
# Start development server
npm run dev
# or
bun run dev

# Open http://localhost:8080
```

## 📦 Production Deployment

### Build for Production

```bash
# Create production build
npm run build
# or
bun run build
```

### Deployment Options

#### 1. Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build` or `bun run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

#### 2. Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 3. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and deploy
firebase login
firebase deploy --only hosting
```

#### 4. Docker Deployment

```bash
# Build Docker image
docker build -t fitfuel-ai-guide .

# Run container
docker run -p 3000:3000 fitfuel-ai-guide
```

## 🔧 Configuration

### AI Personalization Setup

The app uses AI to provide personalized recommendations. Make sure to:

1. Set up your AI API key (OpenAI or DeepSeek)
2. Configure the AI service in `src/services/aiService.ts`
3. Customize system prompts in `src/config/aiPrompts.ts`

### Firebase Security Rules

Update your Firestore rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workouts and recipes are publicly readable
    match /workouts/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /recipes/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📱 Features Configuration

### AI System Prompts

Customize AI behavior by editing `src/config/aiPrompts.ts`:

```typescript
export const WORKOUT_PROMPT = `
You are an expert fitness trainer...
// Customize this prompt based on your requirements
`;

export const NUTRITION_PROMPT = `
You are a certified nutritionist...
// Customize this prompt based on your requirements
`;
```

## 🧪 Testing

```bash
# Run tests
npm run test
# or
bun run test

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security

- Environment variables are properly configured
- Firebase security rules are implemented
- API keys are secured on server-side
- CSRF protection enabled
- XSS protection headers configured

## 📊 Performance

- Lazy loading implemented for components
- Image optimization with WebP support
- Code splitting for optimal bundle size
- Service worker for caching
- Progressive Web App (PWA) ready

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help with deployment:

1. Check the [Issues](../../issues) section
2. Create a new issue with detailed information
3. Join our community discussions

## 🔄 Updates

To update the project:

```bash
git pull origin main
npm install  # or bun install
npm run build  # or bun run build
```