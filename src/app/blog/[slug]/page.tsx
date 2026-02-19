import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Clock, User } from "lucide-react";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/data/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await params;
  const post = getBlogPostBySlug(resolved.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolved = await params;
  const post = getBlogPostBySlug(resolved.slug);
  if (!post) notFound();

  return (
    <>
      <article className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate">{post.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link
                href={`/about/${post.authorSlug}`}
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <User className="h-4 w-4" />
                {post.author}
              </Link>
              <span>{post.date}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime}
              </span>
            </div>
          </div>

          {/* Featured Image Placeholder */}
          <div className="rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 h-64 sm:h-80 mb-10" />

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {post.content.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Author Card */}
          <div className="mt-12 rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                {post.author.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Written by</p>
                <Link
                  href={`/about/${post.authorSlug}`}
                  className="text-lg font-semibold text-card-foreground hover:text-primary transition-colors"
                >
                  {post.author}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">
                  Licensed optician and founder of Online Tint Exemption.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-primary/30 bg-card p-8 text-center">
            <h2 className="text-2xl font-bold text-card-foreground">
              Need a Medical Tint Exemption?
            </h2>
            <p className="mt-2 text-muted-foreground">
              If you have a light-sensitive medical condition, you may qualify
              for a legal window tint exemption.
            </p>
            <Link
              href="/book"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Check If You Qualify
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
