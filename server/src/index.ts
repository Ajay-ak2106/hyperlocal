import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { getDatabase } from './database.js';
import { setupRealtimeServer } from './realtime.js';

import incidentsRouter from './routes/incidents.js';
import floodRouter from './routes/flood.js';
import assistanceRouter from './routes/assistance.js';
import volunteersRouter from './routes/volunteers.js';
import resourcesRouter from './routes/resources.js';
import sheltersRouter from './routes/shelters.js';
import communityRouter from './routes/community.js';
import safetyRouter from './routes/safety.js';
import notificationsRouter from './routes/notifications.js';
import fundsRouter from './routes/funds.js';
import contactsRouter from './routes/contacts.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for local dev and client apps
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure database is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await getDatabase();
    next();
  } catch (err: any) {
    console.error('Database connection error in request:', err);
    res.status(500).json({ success: false, error: 'Database initialization failed: ' + err.message });
  }
});

// Static uploads directory
const UPLOADS_DIR = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(UPLOADS_DIR));

// API routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/flood-reports', floodRouter);
app.use('/api/assistance', assistanceRouter);
app.use('/api/volunteers', volunteersRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/shelters', sheltersRouter);
app.use('/api/community', communityRouter);
app.use('/api/safety', safetyRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/funds', fundsRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'NammaRescue Hyperlocal Disaster Response Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Setup Realtime WebSocket Server
try {
  setupRealtimeServer(server);
} catch (err) {
  console.warn('Realtime server setup note:', err);
}

// Start server
if (process.env.NODE_ENV !== 'test') {
  getDatabase().then(() => {
    server.listen(PORT, () => {
      console.log(`
===========================================================
  🆘 NammaRescue Backend & Realtime Engine Running
===========================================================
  Server URL:    http://localhost:${PORT}
  WebSocket:     ws://localhost:${PORT}/ws
  Health Status: http://localhost:${PORT}/api/health
  Uploads:       http://localhost:${PORT}/uploads/
===========================================================
      `);
    });
  }).catch(err => {
    console.error('Fatal: Failed to initialize database:', err);
    process.exit(1);
  });
}

export default app;
export { app, server };
