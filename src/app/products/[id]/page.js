import { cache } from "react";
import Link from "next/link";
import { FiAlertCircle, FiChevronRight, FiStar } from "react-icons/fi";
import Card from "@/Components/Card/Card";
import ProductGallery from "@/Components/Product/ProductGallery";
import ProductTags from "@/Components/Product/ProductTags";
import ProductDetailInteractive from "@/Components/Product/ProductDetailInteractive";
import RelatedProducts from "@/Components/Product/RelatedProducts";
import DeliveryAndSubscribe from "@/Components/Product/DeliveryAndSubscribe";
import OriginAndCertifications from "@/Components/Product/OriginAndCertifications";
import NutritionAndComposition from "@/Components/Product/NutritionAndComposition";
import ShelfLifeAndServing from "@/Components/Product/ShelfLifeAndServing";
import ProductReviews from "@/Components/Product/ProductReviews";
import Button from "@/Components/Button/Button";
import { productApi, reviewApi } from "@/Service/api";
import { resolveImageUrl } from "@/Utils/utils";

export const dynamic = "force-dynamic";

// Same fallback as app/layout.js's metadataBase — see that file for why a
// hardcoded production fallback matters (an unset env var must never
// silently produce a localhost link-preview URL).
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sehatpotli.in";

// Wrapped in React's cache() so generateMetadata below and the page
// component share one request instead of hitting the API twice per page
// view — both need the same product, and Next.js only auto-dedupes native
// fetch() calls, not this project's axios-based productApi.
const getProduct = cache(async (id) => {
  try {
    const res = await productApi.getById(id);
    return res.data.action ? res.data.data : null;
  } catch {
    return null;
  }
});

// Per-product Open Graph/Twitter Card metadata — server-rendered via the
// Metadata API (not injected client-side, which link-preview crawlers like
// WhatsApp/Facebook never execute JS for anyway). Falls back to the parent
// layout's site-wide metadata (app/layout.js) if the product can't be
// loaded, rather than a broken/empty preview.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return {};

  const title = product.name;
  const description =
    product.shortDescription ||
    `Shop ${product.name} at Sehat Potli — premium, hand-picked dry fruits and nuts delivered fresh.`;
  const url = `${SITE_URL}/products/${id}`;
  const imageUrl = resolveImageUrl(product.image);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.name} | Sehat Potli`,
      description,
      url,
      type: "website",
      images: [{ url: imageUrl, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Sehat Potli`,
      description,
      images: [imageUrl],
    },
  };
}

async function getReviews(id) {
  try {
    const res = await reviewApi.list(id, { limit: 10 });
    return res.data.action ? res.data.data : null;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const [product, reviewsData] = await Promise.all([
    getProduct(id),
    getReviews(id),
  ]);

  if (!product) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">
          Product Not Found
        </h1>
        <p className="text-(--secondary-text)">
          We couldn&apos;t find the product you&apos;re looking for. It may have
          been removed, or our catalog service is temporarily unavailable.
        </p>
        <Button url="/products">Browse All Products</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-(--secondary-text) max-md:hidden">
        <Link href="/" className="hover:text-(--primary)">
          Home
        </Link>
        <FiChevronRight size={12} />
        <Link href="/products" className="hover:text-(--primary)">
          Products
        </Link>
        {product.category?.name && (
          <>
            <FiChevronRight size={12} />
            <Link
              href={`/category/${product.category.id}`}
              className="hover:text-(--primary)"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <FiChevronRight size={12} />
        <span className="text-(--foreground)">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-4">
          <ProductTags tags={product.tags} />
          <h1 className="font-heading text-3xl text-(--foreground) md:text-4xl">
            {product.name}
          </h1>
          {reviewsData?.totalReviews > 0 && (
            <a href="#reviews" className="flex w-fit items-center gap-1.5 text-sm text-(--secondary-text) hover:text-(--primary)">
              <span className="flex text-(--accent)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={15}
                    fill={i < Math.round(reviewsData.averageRating) ? "currentColor" : "none"}
                  />
                ))}
              </span>
              <span className="font-medium text-(--foreground)">{reviewsData.averageRating}</span>
              <span>
                ({reviewsData.totalReviews} review{reviewsData.totalReviews !== 1 ? "s" : ""})
              </span>
            </a>
          )}
          {product.category?.name && (
            <Link
              href={`/category/${product.category.id}`}
              className="w-fit text-sm font-medium text-(--primary) underline"
            >
              {product.category.name}
            </Link>
          )}
          {product.shortDescription && (
            <p className="text-(--secondary-text)">
              {product.shortDescription}
            </p>
          )}

          <ProductDetailInteractive product={product} />

          {product.codAvailable === false && (
            <p className="flex items-center gap-1.5 text-sm text-(--danger)">
              <FiAlertCircle size={14} /> Cash on Delivery is not available for
              this product
            </p>
          )}

          {/* <DeliveryAndSubscribe /> */}
          <OriginAndCertifications product={product} />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-6 md:mt-14">
        {product.longDescription && (
          <Card as="section">
            <h2 className="mb-4 font-heading text-xl text-(--primary) md:text-2xl">
              Product Details
            </h2>
            <div
              className="prose prose-sm max-w-none text-(--secondary-text)"
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
          </Card>
        )}

        {(product.nutrition || product.composition?.length > 0) && (
          <Card as="section">
            <NutritionAndComposition product={product} />
          </Card>
        )}

        <Card as="section">
          <ShelfLifeAndServing product={product} />
        </Card>

        <Card as="section">
          <ProductReviews productId={product.id} initialData={reviewsData} />
        </Card>
      </div>

      <RelatedProducts categoryId={product.categoryId} excludeId={product.id} />
    </div>
  );
}
