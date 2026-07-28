import Image from "next/image";
import Link from "next/link";
import whyChooseImage from "@/assets/home/whyChoose2.png";
import { resolveImageUrl } from "@/Utils/utils";

// Level-1 taxonomy cards — replaces the old generic "Shop by Category"
// section. Categories (image, name, short description) are fully
// admin-managed; clicking a card goes to that category's product listing.
export default function ShopByType({ categories = [] }) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-(--background) py-14">
      <Image src={whyChooseImage} alt="" fill sizes="100vw" className="object-cover" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-3xl text-(--primary) max-md:text-2xl">
          Shop by Categories
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center font-accent text-(--accent-secondary)">
          Find exactly what you're looking for
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-x-3 gap-y-5 md:gap-x-8 md:gap-y-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="group relative flex w-36 flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface)/90 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:border-(--primary)/40 hover:shadow-xl sm:w-40 md:w-48 md:rounded-3xl"
            >
              <span className="relative block aspect-square w-full overflow-hidden">
                <Image
                  src={resolveImageUrl(category.image)}
                  alt={category.name}
                  fill
                  sizes="192px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent" />
              </span>
              <span className="flex flex-1 flex-col gap-1 p-3 text-center md:p-4">
                <span className="font-heading text-sm font-semibold text-(--foreground) transition-colors group-hover:text-(--primary) md:text-base">
                  {category.name}
                </span>
                {category.shortDescription && (
                  <span className="text-xs text-(--secondary-text) line-clamp-2 max-md:hidden">
                    {category.shortDescription}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
