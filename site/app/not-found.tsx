import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="page">
      <section className="interior-hero" aria-labelledby="nf-title">
        <Container>
          <span className="eyebrow">Error 404</span>
          <h1 id="nf-title" className="interior-hero__title">
            This page has left the runway.
          </h1>
          <p className="interior-hero__lede">The page you are looking for does not exist or has moved. Head back to the home page, or tell us what you need.</p>
          <div className="nf-actions">
            <Link className="btn btn--solid" href="/">
              Back to home
            </Link>
            <Link className="btn btn--outline" href="/quote/">
              Request a quote
            </Link>
          </div>
        </Container>
      </section>
      <Footer />
    </div>
  );
}
