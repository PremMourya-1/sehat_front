import Image from "next/image";
import Link from "next/link";
import { resolveImageUrl } from "@/Utils/utils";

export default function CategoryCircles({ categories = [] }) {
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <h2 className="text-center font-heading text-3xl text-(--primary)">
        Shop by Category
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center font-accent text-(--accent-secondary)">
        Every basket, hand-sorted for purity
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-10">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="group flex w-24 flex-col items-center gap-2 md:w-28"
          >
            <span className="relative block h-20 w-20 overflow-hidden rounded-full border border-(--border-color) bg-(--surface-alt) md:h-24 md:w-24">
              <Image
                src={resolveImageUrl(category.image)}
                alt={category.name}
                fill
                sizes="100px"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </span>
            <span className="text-center text-sm font-medium text-(--foreground) group-hover:text-(--primary)">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
