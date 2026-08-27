import Link from "next/link";
import Image from "next/image";
import { FiChevronRight } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import ComboOfferAddToCart from "@/Components/Product/ComboOfferAddToCart";
import { comboOfferApi } from "@/Service/api";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

export const dynamic = "force-dynamic";

async function getComboOffer(id) {
  try {
    const res = await comboOfferApi.getById(id);
    return res.data.action ? res.data.data : null;
  } catch {
    return null;
  }
}

// Combo detail page — reached from the homepage's "Combo & Bundle Offers"
// cards (Components/Product/ComboOffers.js), which now show only the
// name/price on the card itself. This is where the photos and full details
// of what's actually in the box live.
export default async function ComboOfferDetailPage({ params }) {
  const { id } = await params;
  const offer = await getComboOffer(id);

  if (!offer) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-heading text-2xl text-(--primary)">Combo Not Found</h1>
        <p className="text-(--secondary-text)">
          We couldn&apos;t find the combo offer you&apos;re looking for. It may have
          been removed or is no longer available.
        </p>
        <Button url="/">Back to Home</Button>
      </div>
    );
  }

  const items = offer.items || [];
  const savings = (offer.individualTotal || 0) - Number(offer.comboPrice || 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-(--secondary-text)">
        <Link href="/" className="hover:text-(--primary)">
          Home
        </Link>
        <FiChevronRight size={12} />
        <span className="text-(--foreground)">{offer.title}</span>
      </nav>

      {offer.discountLabel && (
        <span className="mb-3 inline-flex w-fit items-center rounded-full bg-(--accent) px-3 py-1 text-xs font-semibold text-(--foreground)">
          {offer.discountLabel}
        </span>
      )}

      <h1 className="font-heading text-3xl text-(--foreground) md:text-4xl">{offer.title}</h1>

      {offer.description && (
        <p className="mt-2 max-w-2xl text-(--secondary-text)">{offer.description}</p>
      )}

      <div className="mt-6 flex flex-wrap items-baseline gap-3">
        <span className="text-2xl font-semibold text-(--foreground)">
          {formatPrice(offer.comboPrice)}
        </span>
        {savings > 0 && (
          <>
            <span className="text-lg text-(--muted) line-through">
              {formatPrice(offer.individualTotal)}
            </span>
            <span className="text-sm font-medium text-(--success)">
              You save {formatPrice(savings)}
            </span>
          </>
        )}
      </div>

      <div className="mt-5 max-w-xs sm:max-w-none">
        <ComboOfferAddToCart offer={offer} />
      </div>

      <h2 className="mt-10 font-heading text-xl text-(--primary)">What&apos;s Included</h2>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center gap-2 rounded-2xl border border-(--border-color) bg-(--surface) p-3 text-center shadow-sm"
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-(--surface-alt)">
              <Image
                src={resolveImageUrl(item.Product?.image)}
                alt={item.Product?.name || ""}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 200px"
                className="object-cover"
              />
              {item.quantity > 1 && (
                <span className="absolute bottom-1 right-1 rounded-full bg-(--foreground)/85 px-1.5 py-0.5 text-[11px] font-semibold text-(--surface)">
                  ×{item.quantity}
                </span>
              )}
            </span>
            <p className="font-heading text-sm text-(--foreground)">{item.Product?.name}</p>
            {item.variant?.weight && (
              <p className="text-xs text-(--secondary-text)">{item.variant.weight}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
