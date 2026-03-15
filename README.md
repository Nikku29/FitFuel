# FitFuel 🔥

**FitFuel** is a next-generation AI-powered personal fitness and nutrition companion. It utilizes an advanced **Mixture of Experts (MoE)** architecture via OpenRouter to provide intelligent, hyper-personalized workout routines, dietary tracking, and real-time form guidance.

---

## ✨ Core Features & The MoE Architecture

Unlike traditional AI wrappers that rely on a single model (like GPT-4), FitFuel intelligently routes different tasks to the best open-source or proprietary models suited for that specific job. **All models are accessed securely through a single OpenRouter API key**, meaning you don't need multiple subscriptions to run the app.

### 1. The Expert Models
- **Logic & Planning 🧠 (`deepseek-r1t2-chimera`)**
  Handles complex workout math, progression tracking, and multi-week routine generation.
- **Creative & UX 🎨 (`mistralai/devstral-2512`)**
  Manages conversational user experiences, UI writing, and creative recipe generation.
- **Visual Synthesis 👁️ (`bytedance-seed/seedream-4.5`)**
  Automatically generates clean, procedural line-art diagrams of workout postures when you rest between sets. 

### 2. The Nutrition Scanner (3-Step Pipeline)
Rather than relying on a single vision model for everything, our Cal.AI-style scanner uses a strict 3-step reasoning chain for fresh food analysis:
1. **Portion Estimation (`allenai/molmo-2-8b-1024`)**: Analyzes the image pixel-by-pixel to estimate volumetric portion size (e.g., "Approximately 1.5 cups of rice").
2. **Nutritional Reasoning (`google/gemini-2.0-flash-exp:free`)**: Takes the image + portion context to expertly identify the food and calculate exact macros.
3. **JSON Structuring (`qwen/qwen-2.5-vl-7b-instruct`)**: Extracts the detailed reasoning into strict, machine-readable JSON for the dashboard.

### 3. Smart Dashboard & Features
- **Day-of-Week Awareness**: The AI engine knows when it's the weekend and automatically tailors its suggestions (e.g., active recovery/stretching on Sundays instead of heavy lifting).
- **Manual Control**: Build custom sessions manually by picking from a vast database of exercises, setting your own reps, sets, and rest times.
- **Progress Export**: Download detailed `.txt` reports of your weekly calorie burn, active minutes, and workout streaks.

---

## 🛠️ Technologies Used

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components (Custom `fitfuel` color palette)
- **Authentication & Database**: Firebase Auth + Firestore
- **AI Gateway**: OpenRouter
- **Animations**: Framer Motion + Lottie React
- **Icons**: Lucide React

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or Bun
- A Firebase Project (Web App + Firestore + Authentication enabled)
- An [OpenRouter API Key](https://openrouter.ai/) for accessing the multi-model pipeline.

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Nikku29/FitFuel.git
cd FitFuel

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory. Copy the contents from `.env.template` (or use the structure below) and fill in your credentials. **Never commit your `.env` file!**

```bash
# OpenRouter (Primary AI Gateway)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_TITLE=FitFuel

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
```

### 3. Start the Development Server

```bash
npm run dev
# The app will be available at http://localhost:8080
```

---

## 🔐 Security & Database Rules

For production, ensure your Firestore rules protect user data. Users should only be able to read and write to their own specific `users/{userId}` documents.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🤝 Contributing

We welcome contributions! FitFuel is designed to be modular. If you want to drop in a new OpenRouter model into the MoE pipeline, or add new workout data, feel free to open a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add some NewFeature'`)
4. Push to the branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License.