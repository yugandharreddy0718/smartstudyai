import express from 'express';
import geminiRoutes from './routes/gemini.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

// Use JSON parser with generous limit for multimodal uploads
app.use(express.json({ limit: '50mb' }));

// CORS headers configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// API Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/admin', adminRoutes);

export default app;
