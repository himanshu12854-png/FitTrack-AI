# FitTrack AI — AI-Powered Calorie, Diet & Gym Progress Tracker

FitTrack AI is a full-stack, production-ready fitness SaaS application built with **Next.js App Router**, **MongoDB & Mongoose**, **NextAuth v5**, and **Google Gemini AI**.

It seamlessly integrates daily precision nutrition tracking, custom gym split design, live workout set logging with rest timers, progressive overload analytics, and an intelligent AI coach with real-time biometric and routine context.

---

## 🚀 Key Highlights & Architecture

- **Next.js App Router & Server Components**: Server-rendered public landing and marketing pages for optimal SEO, speed, and Core Web Vitals.
- **Deep Technical SEO**: Canonical URLs, title templates, OpenGraph & Twitter cards, dynamic `sitemap.xml`, `robots.txt`, and JSON-LD structured schemas (`SoftwareApplication`, `Organization`, `BreadcrumbList`).
- **Private Data Scoping**: All queries are securely scoped to the authenticated user ID. Private dashboard pages are strictly guarded by middleware and tagged with `noindex`.
- **Dynamic Calorie Diary**: Track Breakfast, Lunch, Dinner, and Snacks. Compares consumption against scientific TDEE macro targets with timezone-aware midnight resets.
- **Gym Workout Split Builder**: Create custom 3 to 6-day workout splits (e.g. Push/Pull/Legs, Upper/Lower) with custom exercise selections, set/rep ranges, and rest intervals.
- **In-Gym Live Session Logger**: Interactive checkboxes per set, input actual weight and reps, automatic 60-second rest countdown timer, and personal record (PR) tracking.
- **Recharts Analytics**: Interactive strength progression curves per exercise and weekly calorie consumption bar charts.
- **Gemini AI Coach & Plan Builder**:
  - Contextual chat that reads saved fitness goals, current split, and today's diet without repetitive prompting.
  - Plan Builder: Generates structured 7-day splits and nutrition plans in JSON with a visual preview and explicit approval workflow (*Apply Workout / Apply Diet / Apply Both*).
  - Safe, non-extreme guidance adhering to sports nutrition principles.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Next.js Route Handlers, Node.js runtime, MongoDB, Mongoose 9 |
| **Authentication** | NextAuth.js (v5 beta) Credentials Provider, bcryptjs password hashing |
| **Validation** | Zod v4 schemas for all requests and plan validation |
| **AI Integration** | Google Gemini 1.5 Flash (`@google/generative-ai`) server-side SDK |

---

## 📂 Project Directory Structure

```
fittrack-ai/
├── public/                 # Static assets & icons
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # Authentication route group (/login, /register)
│   │   ├── (dashboard)/    # Authenticated dashboard route group
│   │   │   ├── dashboard/  # /dashboard, /calories, /workouts, /workout-session, /progress, /ai-assistant, /profile, /settings
│   │   ├── api/            # Route handlers (/api/auth, /api/diet, /api/workouts, /api/ai, /api/user, /api/dashboard)
│   │   ├── calorie-tracker/# Public SEO landing page
│   │   ├── workout-planner/# Public SEO landing page
│   │   ├── ai-fitness-assistant/# Public SEO landing page
│   │   ├── features/       # Public SEO features page
│   │   ├── about/          # Public About page
│   │   ├── contact/        # Public Contact page
│   │   ├── privacy-policy/ # Public Privacy Policy
│   │   ├── terms/          # Public Terms of Service
│   │   ├── sitemap.ts      # Automated sitemap generation
│   │   ├── robots.ts       # Automated robots.txt generation
│   │   ├── globals.css     # Clean light theme design system
│   │   └── layout.tsx      # Root layout with JSON-LD schemas
│   ├── components/         # Reusable React components (Navbar, Footer, Sidebar, Header)
│   ├── lib/                # Database connection, auth, SEO helpers, Gemini client, utils, validations
│   ├── models/             # Mongoose schemas (User, UserFitnessProfile, DietLog, WorkoutPlan, WorkoutSession, ExerciseHistory, AIConversation)
│   ├── types/              # Comprehensive TypeScript interfaces
│   └── middleware.ts       # NextAuth route protection middleware
├── .env.example            # Environment configuration template
└── README.md
```

---

## ⚙️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js** v18.17+ or v20+
- **MongoDB** instance (Local MongoDB or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- **Google Gemini API Key** (Obtain free from [Google AI Studio](https://aistudio.google.com/))

### 2. Clone & Install Dependencies
```bash
cd fittrack-ai
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate the required keys in `.env.local`:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/fittrack?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-32-char-random-secret"
AUTH_SECRET="your-32-char-random-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Deployment (Vercel + MongoDB Atlas)

1. Push your repository to **GitHub**.
2. Import the project into **[Vercel](https://vercel.com/)**.
3. In Vercel Project Settings > **Environment Variables**, add:
   - `MONGODB_URI`
   - `AUTH_SECRET` (generate via `openssl rand -base64 32`)
   - `NEXTAUTH_SECRET` (same as `AUTH_SECRET`)
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your production domain, e.g., `https://fittrack-ai.vercel.app`)
4. In MongoDB Atlas **Network Access**, ensure IP `0.0.0.0/0` is permitted for Vercel serverless connections.
5. Deploy! Vercel will build the Next.js App Router project and publish production edges.

---

## 🔒 Security Best Practices Implemented

- **Password Hashing**: Bcrypt with 12 salt rounds.
- **Strict User Scoping**: No API endpoint accepts a `userId` parameter from the client. The user ID is retrieved directly from the verified server-side JWT session token.
- **Input Validation**: All inbound payloads validated via strict Zod schemas before touching MongoDB.
- **No Secret Leaks**: Gemini API keys, Mongo credentials, and auth secrets reside strictly on the Node server runtime.
- **Safe AI Prompts**: Strict sports nutrition system prompts prevent excessive calorie restriction or extreme protocols.

---

## 📄 License
MIT License. Created for the FitTrack AI platform.
