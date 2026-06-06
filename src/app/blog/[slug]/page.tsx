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
  const canonical = `https://www.onlinetintexemption.com/blog/${post.slug}`;
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: canonical,
      type: "article",
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolved = await params;
  const post = getBlogPostBySlug(resolved.slug);
  if (!post) notFound();

  const url = `https://www.onlinetintexemption.com/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    ...(post.datePublished ? { datePublished: post.datePublished } : {}),
    ...(post.dateModified || post.datePublished ? { dateModified: post.dateModified || post.datePublished } : {}),
    author: { "@type": "Organization", name: "Online Tint Exemption", url: "https://www.onlinetintexemption.com" },
    publisher: { "@type": "Organization", name: "Online Tint Exemption", url: "https://www.onlinetintexemption.com" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-US",
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.onlinetintexemption.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.onlinetintexemption.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  } : null;
  const schema = JSON.stringify(faqSchema ? [articleSchema, breadcrumbSchema, faqSchema] : [articleSchema, breadcrumbSchema]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
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

          {/* TL;DR */}
          {post.tldr && (
            <div className="not-prose mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">TL;DR</p>
              <p className="mt-1 text-muted-foreground">{post.tldr}</p>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-strong:text-foreground">
            {post.bodyHtml ? (
              <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
            ) : (
              post.content.map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))
            )}
          </div>

          {/* FAQ */}
          {post.faqs && post.faqs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <div className="divide-y divide-border">
                {post.faqs.map((f) => (
                  <div key={f.question} className="py-4">
                    <h3 className="font-semibold text-foreground">{f.question}</h3>
                    <p className="mt-2 text-muted-foreground">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

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
