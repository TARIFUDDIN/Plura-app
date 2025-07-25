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
};

module.exports = nextConfig;
