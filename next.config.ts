import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    taint: true,
  },
  turbopack: {
    rules: {
      "*.md": { loaders: ["raw-loader"], as: "raw" },
    },
  },
};

export default nextConfig;
