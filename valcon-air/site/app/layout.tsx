import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import ActionBar from "@/components/ActionBar";
import Footer from "@/components/Footer";
import FlybyLayer from "@/components/flyby/FlybyLayer";
import GeometryLayer from "@/components/geometry/GeometryLayer";
import Header from "@/components/Header";
import { getSite } from "@/lib/content";
import { readCssToken } from "@/lib/tokens";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display",
  display: "swap",
});

const textFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-text",
  display: "swap",
});

const site = getSite();

export const metadata: Metadata = {
  title: {
    default: "Valcon Air | Concept B · Nightfall",
    template: `%s | Concept B · Nightfall`,
  },
  description:
    "Valcon Air, based at Wilson Airport, Nairobi. Concept B Nightfall design direction.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/svg/logo-placeholder.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: readCssToken("--color-bg"),
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${displayFont.variable} ${textFont.variable}`}
      lang="en"
    >
      <body>
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ".reveal{opacity:1!important;transform:none!important}.hero-flight-path{opacity:.35!important}",
            }}
          />
        </noscript>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header site={site} tone="dark" />
        <FlybyLayer />
        <GeometryLayer />
        <main className="site-main" id="main">
          {children}
        </main>
        <Footer site={site} />
        <ActionBar site={site} />
      </body>
    </html>
  );
}