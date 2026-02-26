import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // importante para que no intente bundlear chromium/puppeteer
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],

  // ✅ fuerza a incluir archivos extra dentro de la serverless function
  outputFileTracingIncludes: {
    "/api/png": ["./chromium-brotli/**"],
  },
};

export default nextConfig;