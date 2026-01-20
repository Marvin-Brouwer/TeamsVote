import { defineConfig } from "vite";
import { builtinModules } from 'module';
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [ 
    dts({
      outDir: "dist",
      tsconfigPath: "./tsconfig.json",
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  build: {
    target: 'node18',
    outDir: 'dist',
    minify: false,
    ssr: 'src/_module.ts',
    rollupOptions: {
      external: [
        ...builtinModules,         // exclude Node built-ins
      ],
      output: {
        format: 'es',
      },
    },
    lib: {
      formats: ['es'],
      entry: './src/_module.ts'
    }
  },
});