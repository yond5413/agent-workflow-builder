import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/fastapi/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/fastapi/:path*"
            : "/api/fastapi/:path*",
      },
    ]
  },
}


export default nextConfig;
