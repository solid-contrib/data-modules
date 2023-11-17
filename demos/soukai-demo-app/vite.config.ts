import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@soukai-solid-data-modules': path.resolve(__dirname, './src/soukai-solid-data-modules'),
    },
  },
  plugins: [react()],
})
