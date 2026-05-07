/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Browser calls same-origin `/api/py/*`; Next forwards to FastAPI. Avoids CORS + localhost/IPv6 quirks.
    return [
      {
        source: "/api/py/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
