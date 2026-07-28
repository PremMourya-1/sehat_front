/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
    // Backend runs on localhost in dev — Next 16 blocks image-optimizer
    // fetches that resolve to a private/loopback IP unless explicitly allowed.
    dangerouslyAllowLocalIP: true,
    // Local placeholder images (product-placeholder.svg) are served as SVG.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
