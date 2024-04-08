import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/scripts')
    }
  },
  // server: {
  //   hmr: {
  //     overlay: true // Enables an overlay for capturing build errors and warnings
  //   }
  // },
  build: {
    outDir: 'dist', // Output directory for the production build
    emptyOutDir: true // Clears the output directory before building
  },
  root: 'client',
  plugins: [react()]
});
