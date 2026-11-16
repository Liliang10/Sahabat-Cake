import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { uploadsPath } from './config/multer.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Muat variabel lingkungan dari .env
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Konfigurasi CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti curl, mobile app) atau dari frontend client
      if (!origin || origin === clientUrl || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev fallback
      }
    },
    credentials: true,
  })
);

// Parser payload
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sajikan file statis folder uploads
app.use('/uploads', express.static(uploadsPath, { maxAge: '7d' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend Sahabat Cake berjalan dengan baik',
    timestamp: new Date().toISOString(),
  });
});

// Daftarkan seluruh rute API
app.use('/api', apiRouter);

// Tangani 404 & Global Error
app.use(notFound);
app.use(errorHandler);

// Inisialisasi Database dan Server
export const startServer = async (port = PORT) => {
  let serverInstance;
  let shutdownPromise;

  const shutdown = (exitCode) => {
    if (shutdownPromise) return shutdownPromise;
    shutdownPromise = (async () => {
      if (serverInstance?.listening) {
        await new Promise((resolve, reject) => {
          serverInstance.close((error) => (error ? reject(error) : resolve()));
        });
      }
      await mongoose.disconnect();
      process.exit(exitCode);
    })().catch((error) => {
      console.error('Gagal menutup server atau koneksi MongoDB:', error);
      process.exit(1);
    });
    return shutdownPromise;
  };

  const handleSignal = (signal) => {
    console.log(`\n[Mati] Menerima ${signal}; menutup server dan koneksi MongoDB...`);
    shutdown(0);
  };

  process.once('SIGINT', handleSignal);
  process.once('SIGTERM', handleSignal);

  try {
    await connectDB();

    // Auto-seed data awal jika koleksi masih kosong
    await seedDatabase({ reset: false }).catch((err) => {
      console.warn('[Auto-Seed Warning]:', err.message);
    });

    serverInstance = app.listen(port, () => {
      console.log(`===============================================`);
      console.log(`🍰 SAHABAT CAKE API Server`);
      console.log(`📡 URL: http://localhost:${port}`);
      console.log(`🖼️  Uploads: http://localhost:${port}/uploads`);
      console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===============================================`);
    });

    serverInstance.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(
          `Port ${port} sedang digunakan. Bebaskan port tersebut dengan perintah:\n` +
          `  netstat -ano | findstr :${port}\n` +
          `  taskkill /PID <pid> /F`
        );
      } else {
        console.error('Gagal menjalankan HTTP server:', error);
      }
      shutdown(1);
    });

    return serverInstance;
  } catch (error) {
    console.error('Fatal error saat memulai server:', error);
    await shutdown(1);
  }
};

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectRun || process.env.RUN_STANDALONE === 'true') {
  startServer();
}

export default app;
