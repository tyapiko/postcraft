/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    PICA_SECRET_KEY: process.env.PICA_SECRET_KEY,
    PICA_NOTION_CONNECTION_KEY: process.env.PICA_NOTION_CONNECTION_KEY,
    SERVICE_ROLE_KEY: process.env.SERVICE_ROLE_KEY,
  },
}

module.exports = nextConfig
