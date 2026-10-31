import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "@fontsource-variable/manrope";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { site } from "@/lib/site";
import { siteSchema, siteUrl } from "@/lib/seo";
import ChatWidget from "@/components/chat/ChatWidget";
import { JsonLd } from "@/components/seo/json-ld";

const GA_MEASUREMENT_ID = "G-NN6FEBPMMD";

// Share images come from app/opengraph-image.tsx and app/twitter-image.tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Web, AI Automation & Custom Software`,
    template: `%s | ${site.name}`,
  },
  description: "Web development, mobile apps, AI automation, custom software, digital marketing and analytics solutions.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <JsonLd data={siteSchema} />
        <Providers>
          <a
            href="#main"
            className="fixed top-3 left-3 z-[80] -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm text-background focus:translate-y-0"
          >
            Skip to content
          </a>
          <ScrollProgress />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
        <ChatWidget />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
