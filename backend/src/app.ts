import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Route imports
import authRoutes from './routes/auth.routes';
import familyRoutes from './routes/family.routes';
import externalRoutes from './routes/external.routes';

// Middleware imports
import { errorHandler, notFound } from './middleware/error.middleware';

// ─── App Setup ────────────────────────────────────────────────────────────────

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? FRONTEND_URL)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// ─── Security & Parsing Middleware ────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests with no Origin header (curl, health checks) are allowed
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'family-fridge-board-api',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api', externalRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🏠 Family Fridge Board API`);
  console.log(`   → Local:    http://localhost:${PORT}`);
  console.log(`   → Health:   http://localhost:${PORT}/health`);
  console.log(`   → CORS:     ${FRONTEND_URL}`);
  console.log(`   → Env:      ${process.env.NODE_ENV ?? 'development'}\n`);
});

export default app;
