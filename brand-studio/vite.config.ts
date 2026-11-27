/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Gesicherte Fassung: relative Pfade ("./"), Worker als ES-Module, Schriften aus public/fonts.
export default defineConfig({
  base: "./",
  plugins: [react()],
  worker: { format: "es" },
  build: { target: "es2022", sourcemap: true },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
