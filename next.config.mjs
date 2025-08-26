/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: 'export' output mode disabled to enable API routes for server-side Stripe checkout
  // output: 'export',
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      // Security headers for admin routes - prevent indexing
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
          },
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/api/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, must-revalidate',
          },
        ],
      },
      // General security headers for all routes
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://use.typekit.net; style-src 'self' 'unsafe-inline' https://use.typekit.net https://p.typekit.net; connect-src 'self' https://api.stripe.com https://use.typekit.net https://p.typekit.net; frame-src https://js.stripe.com https://hooks.stripe.com; font-src 'self' https://use.typekit.net https://fonts.gstatic.com; img-src 'self' data: https:",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
