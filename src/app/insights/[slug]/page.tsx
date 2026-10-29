import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getPost, getPosts, type Post } from "@/lib/blog";
import { absoluteUrl, organizationId } from "@/lib/seo";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { SmartImage } from "@/components/ui/smart-image";
import { Cta } from "@/components/sections/cta";
import { JsonLd } from "@/components/seo/json-ld";

// Posts are read from content/blog at build time; any other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const url = absoluteUrl(`/insights/${post.slug}`);
  const { title, description, image } = post;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      locale: "en_IN",
      title,
      description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function postSchema(post: Post) {
  const url = absoluteUrl(`/insights/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        image: post.image.startsWith("/") ? absoluteUrl(post.image) : post.image,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        url,
        mainEntityOfPage: url,
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        inLanguage: "en-IN",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl() },
          { "@type": "ListItem", position: 2, name: "Insights", item: absoluteUrl("/insights") },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
      ...(post.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: post.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ],
  };
}

export default async function PostPage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={postSchema(post)} />
      <article>
        <header className="relative overflow-hidden pt-[120px] pb-14 md:pt-[150px]">
          <div aria-hidden className="absolute -top-40 -left-40 -z-10 size-[480px] rounded-full bg-accent/15 blur-[120px]" />
          <Container>
            <nav aria-label="Breadcrumb" className="text-xs text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                <li><Link href="/" className="hover:text-foreground">Home</Link></li>
                <li aria-hidden>/</li>
                <li><Link href="/insights" className="hover:text-foreground">Insights</Link></li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="max-w-[24ch] truncate text-foreground sm:max-w-[48ch]">{post.title}</li>
              </ol>
            </nav>

            <div className="mt-10 max-w-4xl">
              <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
                <span className="font-semibold text-accent-ink">{post.tag}</span>
                <span aria-hidden>·</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden>·</span>
                <span>{post.readingMinutes} min read</span>
              </p>
              <h1 className="mt-5 text-[clamp(2.1rem,4.6vw,3.8rem)] font-medium leading-[1.05] tracking-[-0.04em]">
                {post.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{post.description}</p>
            </div>

            <div className="relative mt-12 aspect-[4/3] overflow-hidden rounded-2xl bg-surface md:aspect-[2/1]">
              <SmartImage src={post.image} alt={post.imageAlt} sizes="(min-width: 1280px) 1200px, 100vw" preload />
            </div>
          </Container>
        </header>

        <div className="border-t border-line py-16 md:py-20">
          <Container>
            <div className="grid gap-12 lg:grid-cols-12">
              {post.headings.length > 0 && (
                <aside className="hidden lg:col-span-3 lg:block">
                  <nav aria-label="In this guide" className="sticky top-28">
                    <p className="text-sm font-semibold">In this guide</p>
                    <ol className="mt-4 space-y-3 border-l border-line text-sm">
                      {post.headings.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className="-ml-px block border-l border-transparent pl-4 leading-snug text-muted transition-colors duration-300 hover:border-accent hover:text-foreground"
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                </aside>
              )}
              {/* min-w-0 lets wide tables scroll inside the column instead of widening the grid */}
              <div className="article min-w-0 lg:col-span-8 lg:col-start-5" dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
          </Container>
        </div>
      </article>

      {post.faqs.length > 0 && (
        <section aria-labelledby="faq-title" className="border-t border-line py-16 md:py-24">
          <Container>
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 id="faq-title" className="text-[clamp(1.8rem,3vw,2.5rem)] font-medium leading-tight tracking-[-0.035em]">
                  Frequently asked <span className="text-accent">questions.</span>
                </h2>
              </div>
              <div className="divide-y divide-line border-y border-line lg:col-span-8">
                {post.faqs.map((f) => (
                  <div key={f.question} className="py-7">
                    <h3 className="text-lg font-medium tracking-[-0.015em]">{f.question}</h3>
                    <p className="mt-3 max-w-2xl leading-relaxed text-muted">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      <Cta />
    </>
  );
}
