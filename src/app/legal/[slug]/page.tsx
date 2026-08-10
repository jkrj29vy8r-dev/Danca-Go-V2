import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocument } from "@/components/legal/legal-document";
import { getLegalDoc, legalDocs } from "@/lib/legal";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

/** All three documents are static content — pre-render them at build time. */
export function generateStaticParams() {
  return legalDocs.map((doc) => ({ slug: doc.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) return {};

  return pageMetadata({
    path: `/legal/${doc.slug}`,
    title: doc.title,
    description: doc.lead,
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);
  if (!doc) notFound();

  // Flat trail, not "Acasă → Legal → …": there is no /legal index page.
  const breadcrumb = breadcrumbJsonLd([
    { name: "Acasă", path: "/" },
    { name: doc.title, path: `/legal/${doc.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <LegalDocument doc={doc} />
    </>
  );
}
