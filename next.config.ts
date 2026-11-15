import type { NextConfig } from "next";
import { config } from "dotenv";

config();

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Mastra packages from being bundled during build
  // This prevents PostgresStore from trying to connect to database at build time
  serverExternalPackages: ["@mastra/*"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "http",
        hostname: "host.docker.internal",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "bundui-images.netlify.app",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "**.supabase.com",
        pathname: "/**"
      }
    ],
    unoptimized: !isProduction
  }
};

export default nextConfig;
