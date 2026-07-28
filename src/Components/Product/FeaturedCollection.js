import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "@/Components/Card/ProductCard";

export default function FeaturedCollection({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-heading text-3xl text-(--primary) max-md:text-2xl">
            Featured Picks
          </h2>
          <p className="mt-2 font-accent text-(--accent-secondary)">
            Our most-loved, nutrient-rich favorites
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-(--primary) underline"
        >
          View all <FiArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
