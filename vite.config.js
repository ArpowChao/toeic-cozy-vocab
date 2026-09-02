import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // for GitHub Pages relative path support
  test: {
    globals: true,
    environment: 'node',
  },
});
