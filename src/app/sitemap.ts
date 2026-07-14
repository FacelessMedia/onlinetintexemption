import type { MetadataRoute } from "next";
import { getOfferedStates } from "@/data/states";
import { getAllConditionSlugs } from "@/data/conditions";
import { publishedBlogPosts } from "@/data/blog";

const BASE = "https://www.onlinetintexemption.com";
const CONTENT_REVIEWED = "2026-07-14";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: CONTENT_REVIEWED, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/conditions`, lastModified: CONTENT_REVIEWED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: CONTENT_REVIEWED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about/toriano-dewberry`, lastModified: CONTENT_REVIEWED, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/about/clinical-providers`, lastModified: CONTENT_REVIEWED, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE}/blog`, lastModified: CONTENT_REVIEWED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: CONTENT_REVIEWED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: CONTENT_REVIEWED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy-policy`, lastModified: CONTENT_REVIEWED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const statePages: MetadataRoute.Sitemap = getOfferedStates().map((state) => ({
    url: `${BASE}/${state.slug}-window-tint-medical-exemption`,
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const conditionPages: MetadataRoute.Sitemap = getAllConditionSlugs().map((slug) => ({
    url: `${BASE}/conditions/${slug}`,
    lastModified: CONTENT_REVIEWED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = publishedBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.dateModified || post.datePublished || post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...statePages, ...conditionPages, ...blogPages];
}
