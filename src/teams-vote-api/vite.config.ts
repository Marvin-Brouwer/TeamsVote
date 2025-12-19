import { defineConfig } from "vite";
import { builtinModules } from 'module';

export default defineConfig({
  server: {
    port: 10000
  },
  build: {
    target: 'node18',
    outDir: 'dist',
    minify: false,
    ssr: 'src/server.ts',
    rollupOptions: {
      external: [
        ...builtinModules,         // exclude Node built-ins
      ],
      output: {
        entryFileNames: 'server.js',
        format: 'es',
      },
    },
  },
});