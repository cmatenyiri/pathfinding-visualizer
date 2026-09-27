import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  // GitHub Pages serves the site from https://cmatenyiri.github.io/pathfinding-visualizer/,
  // so the build (and `vite preview` of it) needs that prefix. The dev server serves from `/`.
  base: command === 'build' || isPreview ? '/pathfinding-visualizer/' : '/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Keep third-party code in its own long-lived chunks, separate from the app code.
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 3,
            },
            { name: 'mui', test: /node_modules[\\/](@mui|@emotion)[\\/]/, priority: 2 },
            { name: 'vendor', test: /node_modules[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
}));
