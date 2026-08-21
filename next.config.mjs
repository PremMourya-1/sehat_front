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
      // Live production backend — legacy local-path images only (data from
      // before the Cloudinary migration below). Still referenced by some
      // older DB rows when running with `npm run dev:live`.
      {
        protocol: "https",
        hostname: "api.sehatpotli.in",
        pathname: "/uploads/**",
      },
      // Cloudinary — where every image upload (products, categories, hero
      // banners, etc.) is stored now instead of the backend's local disk
      // (see sehat-potli-backend/utils/cloudinary.js for why). The cloud
      // name is a path segment, not part of the hostname, so this one
      // pattern covers every Cloudinary account/cloud.
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
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
