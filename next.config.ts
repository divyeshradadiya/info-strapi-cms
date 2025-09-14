import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config options here */
  env: {
    CONTENT_MANAGER_EMAIL: process.env.CONTENT_MANAGER_EMAIL,
    CONTENT_MANAGER_PASSWORD: process.env.CONTENT_MANAGER_PASSWORD,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**/*",
      },
      {
        protocol: "https",
        hostname: "motivated-health-e41c7505c5.media.strapiapp.com",
      },
      {
        protocol: "https",
        hostname: "strapi-backend-w85m.onrender.com",
      },
      {
        protocol: "https",
        hostname: "*",
      }
    ],
  },
};

export default nextConfig;
