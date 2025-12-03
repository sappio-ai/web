import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf.js-extract', 'canvas'],
};

export default nextConfig;
