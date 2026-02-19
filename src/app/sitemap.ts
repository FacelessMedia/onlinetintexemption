import type { MetadataRoute } from "next";
import { getAllStateSlugs } from "@/data/states";
import { getAllConditionSlugs } from "@/data/conditions";

const BASE = "https://www.onlinetintexemption.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/book`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/conditions`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about/toriano-dewberry`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about/dr-b`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const statePages: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/${slug}-window-tint-medical-exemption`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const bookingPages: MetadataRoute.Sitemap = getAllStateSlugs().map((slug) => ({
    url: `${BASE}/book/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const conditionPages: MetadataRoute.Sitemap = getAllConditionSlugs().map((slug) => ({
    url: `${BASE}/conditions/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...statePages, ...bookingPages, ...conditionPages];
}
