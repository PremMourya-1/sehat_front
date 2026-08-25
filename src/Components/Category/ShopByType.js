import Image from "next/image";
import Link from "next/link";
import SectionHeading from "@/Components/Common/SectionHeading";
import { resolveImageUrl } from "@/Utils/utils";

// Level-1 taxonomy — a responsive card grid. Flexbox with flex-wrap +
// justify-center (not CSS Grid) on purpose: exactly 2 cards/row on mobile,
// 4/row from lg up, and — because grid's fixed column tracks are shared
// across every row — a grid would leave a short last row stuck against the
// left edge with empty cells trailing it. A wrapped flex row centers its
// own contents independently of other rows, so an incomplete last row
// (any category count) centers itself instead.
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

        <div className="mt-10 grid justify-center grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group flex flex-none flex-col overflow-hidden rounded-xl border border-(--border-color) bg-(--surface) shadow-sm transition-all duration-300 hover:border-(--primary)/50 hover:shadow-md "
            >
              <span className="relative block aspect-square w-full overflow-hidden bg-(--surface-alt)">
                <Image
                  src={resolveImageUrl(category.image)}
                  alt={category.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              <div className="flex flex-col gap-1 p-4">
                <h3 className="font-heading text-base font-semibold text-(--foreground) transition-colors group-hover:text-(--primary)">
                  {category.name}
                </h3>
                {category.shortDescription && (
                  <p className="text-sm text-(--secondary-text) line-clamp-1">
                    {category.shortDescription}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
