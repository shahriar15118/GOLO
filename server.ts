import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { initDb } from './backend/db.js';
import authRoutes from './backend/routes/auth.js';
import productRoutes from './backend/routes/products.js';
import userRoutes from './backend/routes/users.js';
import orderRoutes from './backend/routes/orders.js';
import promotionRoutes from './backend/routes/promotions.js';
import bannerRoutes from './backend/routes/banners.js';
import chatRoutes from './backend/routes/chat.js';
import adminRoutes from './backend/routes/admin.js';
import noticeRoutes from './backend/routes/notices.js';
import supportRoutes from './backend/routes/support.js';
import healthRoutes from './backend/routes/health.js';

async function startServer() {
  // Initialize Database
  initDb();

  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // For development ease with Vite
  }));
  app.use(cors());
  app.use(compression());
  app.use(express.json());

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/promotions', promotionRoutes);
  app.use('/api/v1/banners', bannerRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/notices', noticeRoutes);
  app.use('/api/v1/support', supportRoutes);
  app.use('/api/v1/health', healthRoutes);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GOLO Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
