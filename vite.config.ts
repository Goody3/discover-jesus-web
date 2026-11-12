import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET || "http://localhost:5187";

  return {
    plugins: [react()],
    test: {
      environment: "jsdom",
      include: ["tests/vitest/**/*.test.{ts,tsx}"],
      setupFiles: ["tests/vitest/setup.ts"],
      restoreMocks: true,
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}"],
        exclude: ["src/vite-env.d.ts"],
        reporter: ["text", "lcov", "cobertura"],
      },
    },
    server: {
      proxy: {
        "/api": proxyTarget,
        "/health": proxyTarget,
      },
    },
  };
});
