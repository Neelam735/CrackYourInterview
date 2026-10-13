import type { NextConfig } from "next";
import { codeRedirects } from "./lib/navigation";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return codeRedirects.map((redirect) => ({ ...redirect, permanent: false }));
  },
};

export default nextConfig;
