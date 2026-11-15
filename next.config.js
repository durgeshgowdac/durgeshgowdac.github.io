/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Only relevant to `next dev` on a LAN address; ignored (and not even set) for production builds.
  ...(process.env.NODE_ENV === 'development' ? { allowedDevOrigins: ['192.168.*.*'] } : {}),
}
module.exports = nextConfig
