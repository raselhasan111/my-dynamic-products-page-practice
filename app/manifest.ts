import type { MetadataRoute } from "next";
import { business } from "@/config/business";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${business.name.bn} — আজকের বাজারদর`,
    short_name: business.name.bn,
    description: `${business.name.bn} (${business.type.bn}) — আজকের পণ্যের দাম`,
    start_url: "/",
    display: "standalone",
    lang: "bn",
    background_color: "#ffffff",
    theme_color: "#15803d",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
