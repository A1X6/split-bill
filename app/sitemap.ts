import type { MetadataRoute } from "next";

const BASE = "https://www.splitza.app";

// Public, indexable routes only — the signed-in app is excluded (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/pricing", "/about", "/contact", "/login", "/signup"];
  return routes.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
