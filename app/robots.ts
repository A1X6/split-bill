import type { MetadataRoute } from "next";

const BASE = "https://www.splitza.app";

/**
 * Crawlers may index the public marketing/auth pages but not the signed-in app
 * (those are auth-gated and hold personal data anyway) or the API.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/bills",
        "/profile",
        "/friends",
        "/shared",
        "/welcome",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
