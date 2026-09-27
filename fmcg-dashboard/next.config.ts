import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: this app is 100% client components fetching data via
  // Axios in the browser, with no server rendering, API routes, or dynamic
  // segments — so it needs plain static hosting, not Amplify's SSR compute.
  output: "export",
};

export default nextConfig;
