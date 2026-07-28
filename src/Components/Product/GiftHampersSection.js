import { FiBriefcase, FiGift } from "react-icons/fi";
import ProductCard from "@/Components/Card/ProductCard";
import Button from "@/Components/Button/Button";

// "Gift Hampers / Corporate Gifting" — pulls real products from the
// admin-managed category whose name starts with "Gift Hamper" (see
// homeController.js). Pairs the hamper preview with a corporate-gifting CTA.
export default function GiftHampersSection({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h2 className="text-center font-heading text-3xl text-(--primary) max-md:text-2xl">
        Gift Hampers &amp; Corporate Gifting
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center font-accent text-(--accent-secondary)">
        Curated boxes for every celebration
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        <div className="flex flex-col justify-center gap-3 rounded-2xl border border-(--border-color) bg-(--accent-secondary) p-6 text-(--surface) md:col-span-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--surface)/15">
            <FiBriefcase size={20} />
          </span>
          <h3 className="font-heading text-xl">Corporate Gifting, Sorted</h3>
          <p className="text-sm text-(--surface)/85">
            Bulk hampers for employees, clients & festive occasions — customizable
            branding and packaging on orders above 50 units.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button url="/contact" variant="accent" size="md">
              Enquire for Bulk Orders
            </Button>
            <Button url="/products" variant="outline-light" size="md" icon={FiGift}>
              Browse All Hampers
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
