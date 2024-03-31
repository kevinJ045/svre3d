import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const lsdirMiddleware = () => {
  return {
    name: 'lsdir',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
		const lsdirRegex = /^\/lsdir\/(.*)$/;
        const match = req.url.match(lsdirRegex);
        if (match) {
          const requestedPath = match[1];
          const directoryPath = resolve(__dirname, 'www', requestedPath); // Adjust the path as per your project structure
          try {
            const files = await fs.promises.readdir(directoryPath);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(files));
          } catch (error) {
            res.statusCode = 500;
            res.end('Internal Server Error');
          }
        } else {
          next();
        }
      });
    },
  };
};


export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'www/scripts')
    }
  },
  server: {
    hmr: {
      overlay: true // Enables an overlay for capturing build errors and warnings
    }
  },
  optimizeDeps: {
    include: []
  },
  build: {
    outDir: 'dist', // Output directory for the production build
    emptyOutDir: true // Clears the output directory before building
  },
  root: 'www',
  plugins: [lsdirMiddleware()]
});
