import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/toeic-cozy-vocab/', // GitHub Pages base path
  test: {
    globals: true,
    environment: 'node',
  },
});
