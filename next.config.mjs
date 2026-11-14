/** Static export so the site can be served from Cloudflare Pages. */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
