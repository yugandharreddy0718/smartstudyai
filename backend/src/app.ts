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

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const contentLength = req.headers['content-length'] || 0;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API REQUEST] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Size: ${contentLength} bytes | Time: ${duration}ms`);
  });
  
  next();
});

// API Routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'smartstudy-backend'
  });
});

app.use('/api/gemini', geminiRoutes);
app.use('/api/admin', adminRoutes);

// Global Unhandled Error Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('==================================================');
  console.error(`[UNHANDLED BACKEND ERROR] ${req.method} ${req.originalUrl}`);
  console.error(err?.stack || err);
  console.error('==================================================');
  res.status(500).json({
    error: err?.message || 'Internal Server Error'
  });
});

export default app;
