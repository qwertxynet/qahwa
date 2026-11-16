import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — relative paths, so the build works on GitHub Pages under any repo name.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5182 },
});
