import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import ProductCard from "@/Components/Card/ProductCard";
import SectionHeading from "@/Components/Common/SectionHeading";

export default function FeaturedCollection({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex items-end justify-between">
        <SectionHeading
          title="Featured Picks"
          subtitle="Our most-loved, nutrient-rich favorites"
          align="left"
        />
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-(--primary) underline max-md:hidden"
        >
          View all <FiArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-6 hidden max-md:flex max-md:justify-center">
        <Button url="/products" variant="outline" size="sm">
          View all
        </Button>
      </div>
    </section>
  );
}
