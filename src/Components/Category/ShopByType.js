import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/Components/Common/SectionHeading";
import { resolveImageUrl } from "@/Utils/utils";

// Level-1 taxonomy. Flexbox with flex-wrap + justify-center (not CSS Grid)
// on purpose: a grid's fixed column tracks are shared across every row, so
// an incomplete last row (any category count — 1 through 5+) sits stuck
// against the left edge instead of centering itself; a wrapped flex row
// centers its own contents independently of other rows, so this always
// looks centered regardless of how many categories exist.
//
// Circular icon (not a square/rectangular card) reads as a more premium,
// "app-like" category picker — same visual language as Blinkit/Zepto/most
// grocery apps — and scales down to a tight mobile row far more gracefully
// than a bordered card with a description line ever could.
export default function ShopByType({ categories = [] }) {
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  if (!hasCategories) return null;

  return (
    <section className="bg-(--surface-alt) py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title="Shop by Categories"
          subtitle="Find exactly what you're looking for"
        />

        <div className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-6 sm:gap-x-8 md:gap-x-10">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group flex w-20 flex-none flex-col items-center gap-2 sm:w-24 md:w-28"
            >
              <span className="relative block h-20 w-20 overflow-hidden rounded-full border border-(--border-color) bg-(--surface) shadow-sm transition-all duration-300 group-hover:border-(--primary)/60 group-hover:shadow-md sm:h-24 sm:w-24 md:h-28 md:w-28">
                <Image
                  src={resolveImageUrl(category.image)}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 80px, 112px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </span>
              <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-(--foreground) transition-colors group-hover:text-(--primary) sm:text-sm">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
