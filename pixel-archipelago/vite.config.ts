import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // `ANALYZE=1 npm run build` writes dist/stats.html (treemap of the bundle).
    process.env.ANALYZE
      ? visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true })
      : null,
  ],
  server: {
    // honour PORT when the harness assigns one, else Vite's default
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the rarely-changing framework in its own long-lived chunk so a
        // routine app-code deploy doesn't invalidate ~65 KB of cache for
        // returning visitors. GSAP (interior-only, lazy) caches separately too.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|zustand)[\\/]/.test(id)) {
            return "react-vendor";
          }
          if (id.includes("node_modules/gsap")) return "gsap";
        },
      },
    },
  },
});
