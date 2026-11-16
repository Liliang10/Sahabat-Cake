import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const serverEnvDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../server');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, serverEnvDir, '');
  const apiPort = Number(process.env.PORT || env.PORT) || 4001;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': `http://localhost:${apiPort}`,
        '/uploads': `http://localhost:${apiPort}`,
      },
    },
  };
});
