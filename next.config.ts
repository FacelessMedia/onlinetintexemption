import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Pin Turbopack's root to THIS app. Without it, Next infers the parent
  // "10 tint sites" folder as the workspace root (multiple lockfiles live
  // there), which makes the dev file-watcher try to traverse sibling repos
  // and node_modules and crash with "Access is denied (os error 5)".
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
