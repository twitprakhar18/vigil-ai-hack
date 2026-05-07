/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  /** Avoid PackFileCacheStrategy / ENOENT on vendor-chunks after interrupted builds or rm -rf races */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  async rewrites() {
    // Fallback when Route Handler is not hit; primary proxy is app/api/py/[...path]/route.ts
    return [
      {
        source: "/api/py/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
