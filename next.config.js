/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Forhindrer at systemet vises i en <iframe> på et andet site (clickjacking-beskyttelse,
  // saerligt relevant for login-siden).
  { key: "X-Frame-Options", value: "DENY" },
  // Forhindrer browseren i at "gaette" en anden content-type end den serveren angiver.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Sender kun oprindelses-URL'en (ikke fuld sti/query) til eksterne sites ved link-klik.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Systemet bruger ikke kamera/mikrofon/geolokation - sluk eksplicit for dem.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
