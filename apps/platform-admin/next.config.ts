import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@abge/ui', '@abge/auth', '@abge/tenant', '@abge/rbac', '@abge/database'],
};

export default nextConfig;
