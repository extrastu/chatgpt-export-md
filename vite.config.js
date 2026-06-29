import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylexPlugin from '@stylexjs/unplugin';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    stylexPlugin.vite({
      useCSSLayers: false,
    }),
    react(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // Don't empty because copy script runs, but wait, vite emptyOutDir happens before copy! So it is safe to set true.
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.jsx'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
      },
    },
  },
});
