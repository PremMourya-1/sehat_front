import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import { blogApi } from "@/Service/api";
import { resolveImageUrl } from "@/Utils/utils";

export const dynamic = "force-dynamic";

async function getPost(id) {
  try {
    const res = await blogApi.getById(id);
    return res.data?.action ? res.data.data : null;
  } catch {
    return null;
  }
}

export default async function BlogDetailPage({ params }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">Post Not Found</h1>
        <p className="text-(--secondary-text)">
          We couldn&apos;t find the article you&apos;re looking for.
        </p>
        <Button url="/blog">Back to Blog</Button>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-8">
      <Link
        href="/blog"
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-(--primary) hover:underline"
      >
        <FiArrowLeft size={14} /> Back to Blog
      </Link>

      {post.readTime && (
        <p className="mt-6 text-xs font-medium text-(--secondary-text)">{post.readTime}</p>
      )}
      <h1 className="mt-2 font-heading text-3xl text-(--foreground) max-md:text-2xl md:text-4xl">
        {post.title}
      </h1>
      {post.excerpt && (
        <p className="mt-3 text-lg text-(--secondary-text) max-md:text-base">{post.excerpt}</p>
      )}

      {post.image && (
        <span className="relative mt-6 block aspect-video w-full overflow-hidden rounded-2xl bg-(--surface-alt)">
          <Image
            src={resolveImageUrl(post.image)}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </span>
      )}

      {post.content ? (
        <div
          className="prose prose-sm mt-8 max-w-none text-(--secondary-text) [&_a]:text-(--primary) [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-lg [&_h3]:text-(--foreground) [&_li]:mb-1 [&_p]:mb-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      ) : (
        <p className="mt-8 text-(--secondary-text)">Full article coming soon.</p>
      )}
    </article>
  );
}
