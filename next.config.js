/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 确保环境变量在构建时可用（仅在需要时暴露）
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // 优化输出
  swcMinify: true,
  // 压缩优化
  compress: true,
  // 优化图片
  images: {
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
