import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { BackgroundGeometry } from "@/components/BackgroundGeometry";
import { ConceptPill } from "@/components/ConceptPill";
import { Header } from "@/components/Header";
import { ScrollChoreography } from "@/components/ScrollChoreography";
import { getSite } from "@/lib/content";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
});

const textFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-text",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Valcon Air (demo)",
    template: "%s | Valcon Air",
  },
  description:
    "A concept preview for Valcon Air Solutions Limited, an aviation operator based at Wilson Airport, Nairobi.",
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
  themeColor: "#45206A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getSite();

  return (
    <html lang="en" className={`${displayFont.variable} ${textFont.variable}`} suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <BackgroundGeometry />
        <Header site={site} />
        <main id="main" className="site-main" tabIndex={-1}>
          {children}
        </main>
        <ConceptPill />
        <ScrollChoreography />
      </body>
    </html>
  );
}
