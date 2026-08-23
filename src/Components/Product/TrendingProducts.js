import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import ProductCard from "@/Components/Card/ProductCard";
import ProductGrid from "@/Components/Product/ProductGrid";
import SectionHeading from "@/Components/Common/SectionHeading";

// "New Arrivals / Trending Now" — same layout as the Best Sellers row.
// Products are real, admin-flagged via Product.isTrending.
export default function TrendingProducts({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex items-end justify-between">
        <SectionHeading
          title="New Arrivals & Trending Now"
          subtitle="Fresh in, and flying off the shelves"
          align="left"
        />
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-(--primary) underline max-md:hidden"
        >
          View all <FiArrowRight size={14} />
        </Link>
      </div>

      <ProductGrid className="mt-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>

      <div className="mt-6 hidden max-md:flex max-md:justify-center">
        <Button url="/products" variant="outline" size="sm">
          View all
        </Button>
      </div>
    </section>
  );
}
