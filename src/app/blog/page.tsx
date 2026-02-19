import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Clock } from "lucide-react";
import { blogPosts, blogCategories, getFeaturedPosts } from "@/data/blog";

export const metadata: Metadata = {
  title: "Light Sensitivity Blog | Tips & Resources",
  description:
    "Expert advice, practical tips, and resources for managing photophobia and light-sensitive conditions in your daily life.",
};

export default function BlogHub() {
  const featured = getFeaturedPosts();
  const latest = blogPosts;

  return (
    <>
      {/* Hero */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Tips for Living with Light Sensitivity
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Expert advice, practical tips, and resources for managing
              photophobia and light-sensitive conditions in your daily life.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-card border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {blogCategories.map((cat) => (
              <span
                key={cat.slug}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  cat.slug === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                      {post.category}
                    </span>
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Articles */}
      <section className="bg-card py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-card-foreground mb-8">Latest Articles</h2>
          <div className="space-y-4">
            {latest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-background p-5 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="shrink-0 sm:w-48 h-32 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                    <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium">
                      {post.category}
                    </span>
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Need a Medical Tint Exemption?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            If you have a light-sensitive medical condition, you may qualify for
            a legal window tint exemption.
          </p>
          <div className="mt-8">
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Check If You Qualify
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
