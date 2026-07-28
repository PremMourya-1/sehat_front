import { cmsApi } from "@/Service/api";

// Shared server component for the three CMS-backed legal pages
// (terms-and-conditions, privacy-policy, refund-policy). Fetches content by
// slug and renders a graceful fallback if the backend is unreachable or the
// page hasn't been seeded yet.
export default async function LegalPage({ slug, fallbackTitle }) {
  let page = null;

  try {
    const res = await cmsApi.getBySlug(slug);
    if (res.data.action) page = res.data.data;
  } catch {
    page = null;
  }

  const title = page?.title || fallbackTitle;
  const content =
    page?.content ||
    "<p>This page is being updated. Please check back soon.</p>";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <h1 className="font-heading text-3xl text-(--primary) md:text-4xl">
        {title}
      </h1>
      <div
        className="prose prose-sm mt-6 max-w-none text-(--secondary-text) [&_a]:text-(--primary) [&_h2]:font-heading [&_h2]:text-(--foreground) [&_li]:mb-1 [&_p]:mb-3"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
