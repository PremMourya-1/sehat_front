import Link from "next/link";
import { notFound } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";
import ProductCard from "@/Components/Card/ProductCard";
import { categoryApi, productApi } from "@/Service/api";

export const dynamic = "force-dynamic";

async function getCategory(id) {
  try {
    const res = await categoryApi.getById(id);
    return res.data.action ? res.data.data : null;
  } catch {
    return null;
  }
}

async function getCategoryProducts(id) {
  try {
    const res = await productApi.browse({ categoryId: id, limit: 24 });
    return res.data.action ? res.data.data?.items || [] : [];
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  const products = await getCategoryProducts(id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <nav className="mb-6 flex items-center justify-center gap-1.5 text-xs text-(--secondary-text)">
        <Link href="/" className="hover:text-(--primary)">
          Home
        </Link>
        <FiChevronRight size={12} />
        <Link href="/products" className="hover:text-(--primary)">
          Products
        </Link>
        <FiChevronRight size={12} />
        <span className="text-(--foreground)">{category.name}</span>
      </nav>

      <div className="text-center">
        <h1 className="font-heading text-3xl text-(--primary) md:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 font-accent text-(--accent-secondary)">
          Hand-picked {category.name.toLowerCase()}, sourced with care
        </p>
      </div>

      <div className="mt-10">
        {products.length === 0 ? (
          <p className="py-16 text-center text-(--secondary-text)">
            No products available in this category yet.
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-(--secondary-text)">
              {products.length} product{products.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
