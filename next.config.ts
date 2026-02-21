import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.cos.*.myqcloud.com", // 腾讯云 COS
      },
    ],
  },
};

export default nextConfig;
