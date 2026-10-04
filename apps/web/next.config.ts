import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: data: blob: wss: ws:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: blob:; style-src 'self' 'unsafe-inline' https: http:; img-src 'self' https: http: data: blob:; font-src 'self' https: http: data:; connect-src 'self' https: http: wss: ws:; media-src 'self' https: http: blob: data:; frame-src 'self' https: http:; worker-src 'self' blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
