/**
 * Next.js configuration (ESM)
 * Allows external image host used in mock data (images.unsplash.com).
 * Add more hosts or patterns here as you add external images.
 */
const nextConfig = {
  images: {
    // Allow images from Unsplash used in mock data
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tinythreads-s3-bucket.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Alternatively you can use `domains: ['images.unsplash.com']` if you prefer
  },
};

export default nextConfig;
