import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/Components/Common/SectionHeading";
import { resolveImageUrl } from "@/Utils/utils";

// Level-1 taxonomy, shown as portrait image tiles with a floating label tag
// — no carousel, every category fetched from the DB renders directly.
//
// `repeat(auto-fit, minmax(140px, 1fr))` does the responsive work on its
// own: with the current 4 categories it settles at 4 even columns on a wide
// desktop container, and on a narrow phone (~350-400px content width) the
// same 140px minimum only leaves room for 2 columns — no separate mobile
// breakpoint needed, and it keeps behaving sensibly if the category count
// ever changes.
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

        <div className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-4 gap-y-9 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group block active:scale-[0.98]"
            >
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-(--surface-alt) shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                <Image
                  src={resolveImageUrl(category.image)}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Negative top margin pulls this chip up onto the image
                  above it, so it reads as a floating tag rather than a
                  caption sitting flush below. */}
              <div className="relative z-10 mx-auto -mt-5.5 w-fit max-w-[85%] rounded-[10px] border border-(--border-color) bg-(--surface) px-4 py-2 shadow-sm transition-colors duration-300 group-hover:border-(--accent)/60">
                <span className="font-heading line-clamp-2 block text-center text-sm leading-tight text-(--foreground) md:text-base">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
