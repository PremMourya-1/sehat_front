import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { blogApi } from "@/Service/api";
import { resolveImageUrl } from "@/Utils/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | Sehat Potli",
};

async function getPosts() {
  try {
    const res = await blogApi.list();
    return res.data?.action ? res.data.data : [];
  } catch {
    return [];
  }
}

export default async function BlogListPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="text-center">
        <h1 className="font-heading text-4xl text-(--primary)">Our Blog</h1>
        <p className="mx-auto mt-2 max-w-xl font-accent text-(--accent-secondary)">
          Recipes, tips & everything healthy snacking
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-(--secondary-text)">
          No blog posts yet — check back soon.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 max-md:gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--surface) p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="relative block aspect-video w-full overflow-hidden rounded-xl bg-(--surface-alt)">
                {post.image && (
                  <Image
                    src={resolveImageUrl(post.image)}
                    alt={post.title}
                    fill
                    sizes="400px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </span>
              {post.readTime && (
                <p className="text-xs font-medium text-(--secondary-text)">{post.readTime}</p>
              )}
              <h2 className="font-heading text-lg text-(--foreground)">{post.title}</h2>
              {post.excerpt && (
                <p className="text-sm text-(--secondary-text) line-clamp-2">{post.excerpt}</p>
              )}
              <span className="mt-auto flex items-center gap-1 text-sm font-medium text-(--primary)">
                Read more <FiArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
