import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline'",
            "connect-src 'self' https://api.github.com",
            "img-src 'self' data: blob:",
            "font-src 'self'",
          ].join("; "),
        },
      ],
    },
  ],
};

export default nextConfig;
