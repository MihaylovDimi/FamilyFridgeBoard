# 🏠 Family Fridge Board

A shared household information hub — a real-time PWA designed to run as a fullscreen kiosk on an ASUS T100 touchscreen while staying in sync with every family member's phone or tablet.

## ✨ Features

| Module | Description |
|---|---|
| 📝 **Notes** | Colour-categorised sticky notes with real-time sync |
| 🛒 **Shopping list** | Shared list with purchase toggle and bulk-clear |
| ✅ **Task board** | Assignable tasks with priority, due dates, and overdue alerts |
| 📅 **Calendar** | Monthly grid with birthdays, appointments, and upcoming events strip |
| 📢 **Announcements** | Pinnable family messages |
| ⭐ **Rewards** | Point system with leaderboard for household chores |
| 🌤️ **Weather** | Live weather via OpenWeatherMap (server-proxied) |
| 💬 **Daily quote** | Rotating motivational quote in the dashboard header |

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Vite · Zustand · date-fns |
| PWA | vite-plugin-pwa · Workbox (offline + caching) |
| Backend | Node.js · Express 4 · TypeScript |
| Database | Firebase Firestore (real-time, offline-capable) |
| Auth | Firebase Authentication (email/password + Google) |
| Deployment | Vercel (frontend) · Render (backend) |

---

## 🚀 Quick Start — Local Development

### Prerequisites

- Node.js 20+
- A Firebase project (free Spark plan works)
- An OpenWeatherMap API key (free tier)

---

### 1. Clone and install

```bash
git clone https://github.com/your-username/family-fridge-board.git
cd family-fridge-board
npm install   # Installs all workspace dependencies
```

---

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. Enable **Authentication** → Sign-in method → Email/Password ✓ and Google ✓.
3. Enable **Firestore Database** → Start in **production mode**.
4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
   Or paste the contents of `firestore.rules` into the Firestore rules editor in the console.

---

### 3. Configure the backend

Create `backend/.env`:

```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
OPENWEATHERMAP_API_KEY=your-key-here
```

**Getting Firebase Admin credentials:**

1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON
3. Copy `project_id` → `FIREBASE_PROJECT_ID`
4. Copy `client_email` → `FIREBASE_CLIENT_EMAIL`
5. Copy `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` line breaks)

---

### 4. Configure the frontend

Create `frontend/.env.local`:

```
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=http://localhost:3001
```

**Getting Firebase Web credentials:**

1. Firebase Console → Project Settings → Your Apps → Add app → Web
2. Copy the `firebaseConfig` object values into the variables above.

---

### 5. Run the development servers

```bash
# Starts both backend (port 3001) and frontend (port 5173) concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Production Deployment

### Deploy the backend to Render

1. Push the repo to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Connect your GitHub repo, set **Root Directory** to `backend`.
4. Build command: `npm install && npm run build`
5. Start command: `node dist/app.js`
6. Add all environment variables from `backend/.env` in the Render dashboard.
7. Note the public URL (e.g. `https://family-fridge-board-api.onrender.com`).

### Deploy the frontend to Vercel

1. Import your GitHub repo into [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add all `VITE_*` environment variables including:
   ```
   VITE_API_URL=https://family-fridge-board-api.onrender.com
   ```
4. Deploy. Note the production URL (e.g. `https://family-fridge-board.vercel.app`).

### Update CORS on the backend

In the Render dashboard, add:
```
FRONTEND_URL=https://family-fridge-board.vercel.app
```

---

## 📱 Setting up the ASUS T100 Kiosk

1. Open Chrome on the ASUS T100 and navigate to your Vercel URL.
2. Chrome menu → **Install Family Fridge Board** (Add to Home Screen).
3. The PWA will install and launch in fullscreen mode.
4. To prevent the screen from sleeping: Windows Settings → Power → Screen timeout → **Never**.
5. Optional: set Chrome to open the app URL on startup via a scheduled task.

---

## 🗂️ Project Structure

```
family-fridge-board/
├── backend/                 # Express API (deployed to Render)
│   └── src/
│       ├── controllers/     # Request handlers
│       ├── middleware/       # Auth verification, error handling
│       ├── routes/          # Route definitions
│       ├── services/        # Firestore + weather logic
│       └── types/           # TypeScript interfaces
├── frontend/                # React PWA (deployed to Vercel)
│   └── src/
│       ├── components/      # Reusable UI components and panels
│       ├── hooks/           # Custom hooks with Firestore subscriptions
│       ├── pages/           # Route-level page components
│       ├── services/        # Firebase init, Axios client, Firestore CRUD
│       ├── store/           # Zustand auth store
│       └── styles/          # Global CSS with dark/light theme variables
├── firestore.rules          # Firestore security rules
├── .env.example             # Template for all environment variables
└── README.md
```

---

## 🔑 Authentication Flow

```
User opens app
    ↓
Firebase Auth state check (onAuthStateChanged)
    ↓
Fetch users/{uid} Firestore document
    ↓
No familyId?  →  /onboarding  →  Create or join family
    ↓
familyId set  →  /dashboard (fullscreen 2×2 grid)
```

---

## 🔒 Security

- All Express endpoints require a valid Firebase ID token (`Authorization: Bearer <token>`)
- Firestore rules restrict all family data to authenticated members only
- Weather and quotes API keys are server-side only
- CORS is locked to the configured `FRONTEND_URL`
- Helmet provides standard HTTP security headers

---

## 🛣️ Roadmap

- [ ] Web Push notifications for new shopping items and tasks
- [ ] Recurring task scheduler (weekly chores)
- [ ] Meal planner module (7-day grid)
- [ ] Google Calendar sync
- [ ] Family photo wall
- [ ] End-to-end note encryption

---

## 📄 Licence

MIT — build, fork, and adapt freely for your own family.
