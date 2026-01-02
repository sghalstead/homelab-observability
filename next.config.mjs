/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional macOS-only dependencies from systeminformation
      config.externals.push({
        'osx-temperature-sensor': 'commonjs osx-temperature-sensor',
        'macos-temperature-sensor': 'commonjs macos-temperature-sensor',
      });
    }
    return config;
  },
};

export default nextConfig;
