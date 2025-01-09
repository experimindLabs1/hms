/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        serverActions: true,
    },
    env: {
        PORT: process.env.PORT || 3000
    }
}

module.exports = nextConfig 