import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/pages': '/src/pages',
      '@/styles': '/src/styles',
      '@/hooks': '/src/hooks',
      '@/stores': '/src/stores',
      '@/services': '/src/services',
      '@/utils': '/src/utils',
      '@/types': '/src/types',
      '@/data': '/src/data',
      '@/config': '/src/config',
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
