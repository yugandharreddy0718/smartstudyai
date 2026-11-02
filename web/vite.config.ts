import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const port = Number(process.env.PORT || process.env.VITE_PORT) || 5173;
  const isDev = mode === 'development';
  // Use absolute '/' base in development or local test mode for robust SPA routing
  const base = process.env.BASE_PATH || (isDev || process.env.LOCAL_TEST === 'true' ? '/' : './');

  return {
    base,
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: process.env.HOST || '0.0.0.0',
      port,
      strictPort: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: process.env.HOST || '0.0.0.0',
      port,
      strictPort: true,
    },
  };
});
