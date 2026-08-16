import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan dev-server diakses dari perangkat lain di LAN (HMR + /_next).
  // Tanpa ini, request cross-origin ke resource dev di-403 (blockCrossSiteDEV).
  allowedDevOrigins: ['192.168.100.*'],
};

export default nextConfig;
