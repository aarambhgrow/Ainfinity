import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getPosts } from "@/lib/blog";
import { Container } from "@/components/ui/container";
import { SmartImage } from "@/components/ui/smart-image";
import { ArrowSwap } from "@/components/ui/arrow-icon";
import { PageHero } from "@/components/sections/page-hero";
import { Cta } from "@/components/sections/cta";

export const metadata: Metadata = {
  title: "Insights",
  description: "Practical notes on websites, automation, WhatsApp commerce and AI for growing businesses.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const posts = getPosts();

  return (
    <>
      <PageHero eyebrow="Insights" title="Practical notes for" accent="growing businesses.">
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Guides on WhatsApp, automation and the systems that help Indian businesses grow.
        </p>
      </PageHero>
      <section className="border-t border-line py-16 md:py-20">
        <Container>
          <ul className="grid gap-x-6 gap-y-14 md:grid-cols-2">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/insights/${p.slug}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface">
                    <SmartImage
                      src={p.image}
                      alt={p.imageAlt}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="duration-[1100ms] ease-out-expo group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                    <span className="font-semibold text-accent-ink">{p.tag}</span>
                    <span aria-hidden>·</span>
                    <time dateTime={p.date}>{formatDate(p.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{p.readingMinutes} min read</span>
                  </p>
                  <h2 className="mt-3 text-[clamp(1.3rem,2.2vw,1.65rem)] font-medium leading-snug tracking-[-0.025em]">
                    {p.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 leading-relaxed text-muted">{p.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                    Read article
                    <ArrowSwap className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <Cta />
    </>
  );
}
