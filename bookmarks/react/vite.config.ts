import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import * as path from 'path'

const IS_PROD = process.env.NODE_ENV === 'production'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4300
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  ...(IS_PROD && {
    esbuild: {
      drop: ['console'],
    }
  })
})
