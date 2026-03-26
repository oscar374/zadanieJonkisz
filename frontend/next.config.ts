import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  
  experimental: {
    turbo: {
      watchOptions: {
        pollInterval: 800,
      },
    },
  } as any, 
};

export default nextConfig;