import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	productionBrowserSourceMaps: true,
  	output: "standalone",
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'hex.sgp1.digitaloceanspaces.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'hex.sgp1.cdn.digitaloceanspaces.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'cdn.hex.mn',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default nextConfig;
