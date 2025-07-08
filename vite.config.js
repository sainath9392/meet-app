// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: "stream-browserify",
      buffer: "buffer",
      process: path.resolve(__dirname, "node_modules/process/browser.js"),
    },
  },
  define: {
    global: "window",
  },
  optimizeDeps: {
    include: ["buffer", "process", "stream-browserify"],
  },
  build: {
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
});
