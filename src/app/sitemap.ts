import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { services } from "@/lib/services";
import { siteUrl } from "@/lib/seo";

// Work and About are sections of the homepage (/#work, /#about), not pages, so they aren't listed
const routes = ["", "/services", "/insights", "/contact", ...services.map((s) => `/services/${s.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${siteUrl}${route || "/"}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/services" ? 0.9 : 0.8,
  }));

  const posts: MetadataRoute.Sitemap = getPosts().map((p) => ({
    url: `${siteUrl}/insights/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...pages, ...posts];
}
