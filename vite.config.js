import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const config = defineConfig({
  base: './',
  define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV), 'process.env.READ_INDEX': JSON.stringify(process.env.READ_INDEX) },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
  plugins: [react()],
});

export default config;
