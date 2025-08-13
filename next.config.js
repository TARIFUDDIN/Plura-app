/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'uploadthing.com',
      port: '',
      pathname: '**',
    },
    {
      protocol: 'https',
      hostname: 'utfs.io',
      port: '',
      pathname: '**',
    },
    {
      protocol: 'https',
      hostname: 'img.clerk.com',
      port: '',
      pathname: '**',
    }, {
      protocol: 'https',
      hostname: 'subdomain',
      port: '',
      pathname: '**',
    }, {
      protocol: 'https',
      hostname: 'files.stripe.com',
      port: '',
      pathname: '**',
    },
    ],
  },
  reactStrictMode: false,
  webpack: (config) => {
    // Suppress defaultProps warnings from react-beautiful-dnd
    config.ignoreWarnings = [
      {
        module: /react-beautiful-dnd/,
        message: /defaultProps/,
      },
    ];
    return config;
  },
};

module.exports = nextConfig;