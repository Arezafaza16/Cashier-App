import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Cashier App',
        short_name: 'Cashier',
        description: 'Point of Sale Application',
        theme_color: '#ffffff',
        "icons": [
          {
            "src": "cashier2.png",
            "sizes": "64x64",
            "type": "image/png"
          },
          {
            "src": "cashier144.png",
            "sizes": "144x144",
            "type": "image/png"
          }
        ],
        "screenshots": [
          {
            "src": "screenshot320.jpg",
            "sizes": "320x320",
            "type": "image/png"
          }
        ],
      },
    }),
  ],
});