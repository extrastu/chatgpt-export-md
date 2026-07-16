import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylexPlugin from '@stylexjs/unplugin';
import { resolve } from 'path';
import fs from 'fs';

function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    closeBundle() {
      const outDir = resolve(__dirname, 'dist');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      
      fs.copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(outDir, 'manifest.json')
      );
      
      function copyDir(src, dest) {
        if (!fs.existsSync(src)) return;
        fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = resolve(src, entry.name);
          const destPath = resolve(dest, entry.name);
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDir(resolve(__dirname, 'icons'), resolve(outDir, 'icons'));
      copyDir(resolve(__dirname, 'lib'), resolve(outDir, 'lib'));
      
      console.log('Successfully copied manifest.json, icons, and lib to dist!');
    }
  };
}

export default defineConfig({
  plugins: [
    stylexPlugin.vite({
      useCSSLayers: false,
    }),
    react(),
    copyAssetsPlugin(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
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
