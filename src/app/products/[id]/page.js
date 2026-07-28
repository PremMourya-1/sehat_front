import Link from "next/link";
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

export const dynamic = "force-dynamic";

async function getProduct(id) {
  try {
    const res = await productApi.getById(id);
    return res.data.action ? res.data.data : null;
  } catch {
    return null;
  }
}

async function getReviews(id) {
  try {
    const res = await reviewApi.list(id);
    return res.data.action ? res.data.data : [];
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const [product, reviews] = await Promise.all([getProduct(id), getReviews(id)]);

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
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-4">
          <ProductTags tags={product.tags} />
          <h1 className="font-heading text-3xl text-(--foreground) md:text-4xl">
            {product.name}
          </h1>
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

          <DeliveryAndSubscribe />
          <OriginAndCertifications product={product} />
        </div>
      </div>

      {product.longDescription && (
        <div className="mt-14 border-t border-(--border-color) pt-10">
          <h2 className="mb-4 font-heading text-2xl text-(--primary)">
            Product Details
          </h2>
          <div
            className="prose prose-sm max-w-none text-(--secondary-text)"
            dangerouslySetInnerHTML={{ __html: product.longDescription }}
          />
        </div>
      )}

      <div className="mt-14 border-t border-(--border-color) pt-10">
        <NutritionAndComposition product={product} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <ShelfLifeAndServing product={product} />
      </div>

      <div className="mt-14 border-t border-(--border-color) pt-10">
        <ProductReviews productId={product.id} productName={product.name} reviews={reviews} />
      </div>

      <RelatedProducts categoryId={product.categoryId} excludeId={product.id} />
    </div>
  );
}
