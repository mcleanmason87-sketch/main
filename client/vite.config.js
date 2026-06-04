import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "MotoValue — Know Your Ride's Worth",
        short_name: "MotoValue",
        theme_color: "#1a1a1a",
        background_color: "#141414",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\//,
            handler: "CacheFirst",
            options: { cacheName: "image-cache", expiration: { maxEntries: 30, maxAgeSeconds: 604800 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "CacheFirst",
            options: { cacheName: "font-cache", expiration: { maxAgeSeconds: 2592000 } },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3001" },
  },
});
