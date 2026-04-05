require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const cookieParser = require('cookie-parser');

const leadsRouter    = require('./routes/leads');
const authRouter     = require('./routes/auth');
const paymentsRouter = require('./routes/payments');
const adminRouter    = require('./routes/admin');
const clientsRouter  = require('./routes/clients');

const app  = express();
const PORT = process.env.PORT || 4000;

/* ─── Security headers ─────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'none'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'", "'unsafe-inline'"],   // inline styles on portal/admin pages
      fontSrc:        ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:         ["'self'", 'data:'],
      connectSrc:     ["'self'"],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      baseUri:        ["'none'"],
      formAction:     ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,   // allow Paystack redirect in portal iframes
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

/* ─── CORS ───────────────────────────────────────────
   In development we allow:
   • localhost:5500  (VS Code Live Server)
   • 127.0.0.1:5500  (alternative Live Server binding)
   • localhost:5173  (Vite dev server — React migration)
   • null origin     (HTML file opened directly from disk)
   In production only FRONTEND_URL is allowed.
─────────────────────────────────────────────────────── */
const DEV_ORIGINS = new Set([
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

app.use(cors({
  origin: (origin, cb) => {
    const prod = process.env.FRONTEND_URL;
    const isDev = process.env.NODE_ENV !== 'production';
    // no origin = same-origin or file:// — allow in dev only
    if (!origin) return cb(null, isDev);
    if (origin === prod) return cb(null, true);
    if (isDev && DEV_ORIGINS.has(origin)) return cb(null, true);
    cb(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/* ─── Body parsers ──────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));   // reject huge payloads
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ─── Routes ─────────────────────────────────────────── */
app.use('/api/leads',    leadsRouter);
app.use('/api/auth',     authRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin',    adminRouter);
app.use('/api/clients',  clientsRouter);

/* ─── Health check ───────────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

/* ─── 404 catch-all ──────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

/* ─── Global error handler ───────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`ZTO API running on http://localhost:${PORT}`));
