import type { NextConfig } from "next";

// next-pwa uses webpack internally, so we need to opt out of Turbopack
// for production builds. Development still uses Turbopack via `next dev`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/, /\.map$/],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "supabase-cache",
        expiration: { maxEntries: 200, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|ico|woff2?)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  turbopack: {}, // silence the turbopack/webpack conflict warning
};

module.exports = withPWA(nextConfig);
