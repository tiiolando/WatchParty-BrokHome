
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: [
      'watch.brokhome.fr',
      'brokrom.zapto.org',
      'localhost',
      '127.0.0.1'
    ],
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        ws: true
      },
      '/video': 'http://127.0.0.1:3001'
    }
  }
});
