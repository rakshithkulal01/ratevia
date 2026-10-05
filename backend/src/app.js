import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

const isProduction = env.NODE_ENV === 'production';

// HTTP security headers via Helmet
app.use(
  helmet({
    // Disable CSP on REST API backend to avoid restricting frontend SPA clients
    contentSecurityPolicy: false,
    // Allow static assets (stickers, uploads) to be loaded cross-origin
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Enable HSTS only in production HTTPS environments
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

// Logging: Combined format in production (no credentials/PII/body), dev in development
app.use(morgan(isProduction ? 'combined' : 'dev'));

// CORS configuration (hosting-agnostic)
// In production: only configured frontend origin(s) are allowed (via FRONTEND_URL)
// In development: localhost and 127.0.0.1 origins are also permitted
const configuredOrigins = (env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const devAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const allowedOrigins = isProduction
  ? configuredOrigins
  : Array.from(new Set([...configuredOrigins, ...devAllowedOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any localhost / 127.0.0.1 port ONLY in non-production environments
      if (
        !isProduction &&
        (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads (stickers, generated print assets)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
