/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, "bcrypt", "fs"];
    return config;
  },
};

module.exports = nextConfig;
