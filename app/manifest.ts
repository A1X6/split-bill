import type { MetadataRoute } from "next";

// PWA manifest — lets Splitza be installed to a home screen with brand colors.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Splitza — Split any bill in seconds",
    short_name: "Splitza",
    description:
      "Scan the receipt, assign items to friends, and everyone knows exactly what they owe — tax included.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f2",
    theme_color: "#11926a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
