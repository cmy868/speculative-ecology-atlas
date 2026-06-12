/** @type {import('next').NextConfig} */

// On GitHub Pages the site lives under /<repo-name>/, not at the domain root.
// Set NEXT_PUBLIC_BASE_PATH to that prefix when building for Pages; leave it
// unset for local dev/preview so paths stay rooted at /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',
  basePath,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
