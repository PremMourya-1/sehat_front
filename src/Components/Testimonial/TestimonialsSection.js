import { FiStar } from "react-icons/fi";
import Image from "next/image";
import { resolveImageUrl } from "@/Utils/utils";

export default function TestimonialsSection({ testimonials = [] }) {
  if (!Array.isArray(testimonials) || testimonials.length === 0) return null;

  return (
    <section className="bg-(--surface-alt) py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-3xl text-(--primary) max-md:text-2xl">
          What Our Customers Say
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center font-accent text-(--accent-secondary)">
          Real stories from healthier, happier homes
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--surface) p-6"
            >
              <div className="flex gap-1 text-(--accent)">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={16}
                    fill={i < (testimonial.rating || 5) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <p className="text-sm text-(--secondary-text)">
                &ldquo;{testimonial.message}&rdquo;
              </p>
              <div className="mt-auto flex items-center gap-3 pt-2">
                {testimonial.image && (
                  <span className="relative block h-10 w-10 overflow-hidden rounded-full">
                    <Image
                      src={resolveImageUrl(testimonial.image)}
                      alt={testimonial.name}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-(--foreground)">
                    {testimonial.name}
                  </p>
                  {testimonial.designation && (
                    <p className="text-xs text-(--secondary-text)">
                      {testimonial.designation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
