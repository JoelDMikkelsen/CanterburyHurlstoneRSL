/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
    AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
    AZURE_REDIRECT_URI: process.env.AZURE_REDIRECT_URI,
    AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
    CLIENT_EMAIL_DOMAIN: process.env.CLIENT_EMAIL_DOMAIN,
  },
}

module.exports = nextConfig
