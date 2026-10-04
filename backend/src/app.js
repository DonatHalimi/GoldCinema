const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { auditRequestLogger } = require('./middleware/auditLogger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movies');
const showtimeRoutes = require('./routes/showtimes');
const seatHoldRoutes = require('./routes/seatHold');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/adminRoutes');
const slideshowRoutes = require('./routes/slideshow');
const passkeyRoutes = require('./routes/passkey');
const contactRoutes = require('./routes/contact');
const notificationRoutes = require('./routes/notifications');
const favouriteRoutes = require('./routes/favourites');
const reviewRoutes = require('./routes/review');
const giftCardRoutes = require('./routes/giftCards');
const auditLogRoutes = require('./routes/auditLogs');
const clientLogRoutes = require('./routes/clientLogs');
const i18nRoutes = require('./routes/i18n');
const staffRoutes = require('./routes/staff');
const shiftRoutes = require('./routes/shift');
const screenConfigurationRoutes = require('./routes/screenConfigurations');
const equipmentRoutes = require('./routes/equipment');
const maintenanceLogRoutes = require('./routes/maintenanceLogs');
const analyticsRoutes = require('./routes/analytics');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : null,
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/payments/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cookieParser());
app.use(auditRequestLogger);

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', strictLimiter);
app.use('/api/payments', strictLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', passkeyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api', seatHoldRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/slideshows', slideshowRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/giftcards', giftCardRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/client-logs', clientLogRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/screen-configurations', screenConfigurationRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/maintenance-logs', maintenanceLogRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use(errorHandler);

module.exports = app;