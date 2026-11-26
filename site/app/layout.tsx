import type { Metadata, Viewport } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { CursorGlow } from "@/components/CursorGlow";
import { ConceptPill } from "@/components/ConceptPill";
import { Header } from "@/components/Header";
import { ScrollChoreography } from "@/components/ScrollChoreography";
import { getSite } from "@/lib/content";
import { INTRO_INIT_SCRIPT } from "@/lib/intro";
import { Splash } from "@/components/Splash";

// One family for the whole site: headings and body use the same font.
const textFont = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-text",
  display: "swap",
});

const siteContent = getSite();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://valcon-1.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: siteContent.name,
    title: siteContent.metaTitle,
    description: siteContent.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Valcon Air" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  title: {
    default: siteContent.metaTitle,
    template: `%s | ${siteContent.name}`,
  },
  description: siteContent.description,
  // Keep the demo out of search engines. Flip both to true at launch.
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Keep in sync with --color-brand in styles/tokens.css.
  themeColor: "#3F0082",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSite();

  return (
    <html lang="en" className={textFont.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_INIT_SCRIPT }} />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Splash />
        <Header site={site} />
        <main id="main" className="site-main" tabIndex={-1}>
          {children}
        </main>
        <CursorGlow />
        <ConceptPill message={site.notices.conceptPill} />
        <ScrollChoreography />
      </body>
    </html>
  );
}
