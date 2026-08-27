import Image from "next/image";
import Link from "next/link";
import { FiStar } from "react-icons/fi";
import SectionHeading from "@/Components/Common/SectionHeading";
import { resolveImageUrl } from "@/Utils/utils";

// Accent-badge tint rotates through the brand's three accent colors so the
// row doesn't read as one flat repeated shape. Purely cosmetic and keyed off
// position (index), never off category name/id — stays correct no matter
// how many categories exist or what they're called.
const ACCENT_TONES = ["bg-(--accent)", "bg-(--primary)", "bg-(--accent-secondary)"];

// Level-1 taxonomy, shown as centered boxy tiles — no carousel, every
// category fetched from the DB renders directly. Same bordered-box +
// square-image convention as ProductCard (rounded-2xl border, aspect-square
// image, shadow on hover) rather than a circular medallion, so this reads
// as part of the same card language used everywhere else on the site.
//
// Below `sm` this is a fixed 2-column grid rather than a wrapping flex row:
// a flex row's wrap point depends on exact viewport width, so four ~130px
// boxes wrap as a clean 2x2 at 360-390px but lopsidedly as 3-then-1 at
// ~430px — a plain grid always gives exactly 2 per row regardless of the
// phone. From `sm` up there's enough width for every category in one row,
// so it switches to a centered flex-wrap row there (which does correctly
// self-center regardless of category count, unlike a grid's fixed tracks —
// content is expected to stay at 4, but this still isn't hardcoded to it).
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

        <div className="mt-10 grid grid-cols-2 place-items-center gap-x-6 gap-y-8 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 md:gap-8">
          {categories.map((category, index) => {
            const accentTone = ACCENT_TONES[index % ACCENT_TONES.length];

            return (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group relative w-full max-w-40 flex-none rounded-2xl border border-(--border-color) bg-(--surface) p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--accent)/60 hover:shadow-md active:scale-95 sm:w-32 sm:max-w-none md:w-36"
              >
                <span
                  className={`absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full text-(--surface) shadow-sm ring-2 ring-(--surface-alt) transition-transform duration-300 group-hover:scale-110 ${accentTone}`}
                >
                  <FiStar className="h-3.5 w-3.5" />
                </span>

                <span className="relative block aspect-square overflow-hidden rounded-xl bg-(--surface-alt)">
                  <Image
                    src={resolveImageUrl(category.image)}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 144px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </span>

                <span className="font-heading mt-3 line-clamp-2 block text-center text-sm leading-tight text-(--foreground) transition-colors group-hover:text-(--primary) md:text-base">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
