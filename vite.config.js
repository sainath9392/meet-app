import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), nodePolyfills(), tailwindcss()],
  resolve: {
    alias: {
      stream: "stream-browserify",
      buffer: "buffer",
      process: "process/browser",
    },
  },
  define: {
    global: "window",
    "process.env": {}, // ensure process.env is defined
  },
  optimizeDeps: {
    include: ["buffer", "process", "stream-browserify", "simple-peer"],
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
});
