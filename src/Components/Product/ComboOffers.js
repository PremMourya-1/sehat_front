"use client";

import Image from "next/image";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiShoppingBag } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import SectionHeading from "@/Components/Common/SectionHeading";
import { addComboToCart } from "@/Store/Slices/cartSlice";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

// "Combo & Bundle Offers" — real product bundles, admin-managed (see
// sehat-potli-backend ComboOffer/ComboOfferItem). Adding one to the cart
// doesn't create one opaque line item — see Store/Slices/cartSlice.js
// addComboToCart and Utils/cartExpansion.js for how it later expands back
// into real product/variant lines for stock, shipping and COD handling.
export default function ComboOffers({ offers = [] }) {
  const dispatch = useDispatch();

  // Defense in depth alongside the backend's own filter (homeController.js)
  // — never render a combo with fewer than 2 real items, since it would be
  // an empty/₹0 "Add to Cart" with nothing for cartExpansion to expand into.
  const validOffers = Array.isArray(offers) ? offers.filter((o) => (o.items || []).length >= 2) : [];
  if (validOffers.length === 0) return null;

  const handleAdd = (offer) => {
    const items = (offer.items || []).map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      comboQuantity: item.quantity,
      name: item.Product?.name,
      image: item.Product?.image,
      weight: item.variant?.weight,
    }));

    dispatch(
      addComboToCart({
        comboOfferId: offer.id,
        title: offer.title,
        image: offer.items?.[0]?.Product?.image,
        discountLabel: offer.discountLabel,
        price: Number(offer.comboPrice),
        items,
        quantity: 1,
      }),
    );
    toast.success(`${offer.title} added to cart`);
  };

  return (
    <section className="bg-(--surface-alt) py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          title="Combo & Bundle Offers"
          subtitle="More you buy, more you save"
        />

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {validOffers.map((offer) => {
            const savings = (offer.individualTotal || 0) - Number(offer.comboPrice || 0);

            return (
              <div
                key={offer.id}
                className="flex flex-col rounded-2xl border border-(--border-color) bg-(--surface) p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                {offer.discountLabel && (
                  <span className="mb-2 inline-flex w-fit items-center rounded-full bg-(--accent) px-2.5 py-1 text-xs font-semibold text-(--foreground)">
                    {offer.discountLabel}
                  </span>
                )}
                <h3 className="font-heading text-xl text-(--foreground)">{offer.title}</h3>
                {offer.description && (
                  <p className="mt-1 text-sm text-(--secondary-text) line-clamp-2">{offer.description}</p>
                )}

                {/* Every item at the same fixed size regardless of how many
                    are in the combo (2 or 4) — a stretching grid made a
                    2-item combo's photos look completely different from a
                    4-item one. The quantity sits as an unmissable badge on
                    the photo itself, and the name wraps to 2 lines instead
                    of truncating, so nothing about what's in the box is
                    left to guesswork. */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {(offer.items || []).map((item, index) => (
                    <div key={item.id || index} className="flex w-24 flex-col items-center gap-1.5 text-center">
                      <span className="relative block h-24 w-24 overflow-hidden rounded-xl border border-(--border-color) bg-(--surface-alt)">
                        <Image
                          src={resolveImageUrl(item.Product?.image)}
                          alt={item.Product?.name || ""}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                        {item.quantity > 1 && (
                          <span className="absolute bottom-1 right-1 rounded-full bg-(--foreground)/85 px-1.5 py-0.5 text-[11px] font-semibold text-(--surface)">
                            ×{item.quantity}
                          </span>
                        )}
                      </span>
                      <p className="line-clamp-2 w-full text-xs font-medium leading-tight text-(--foreground)">
                        {item.Product?.name}
                      </p>
                      {item.variant?.weight && (
                        <p className="text-[11px] text-(--secondary-text)">{item.variant.weight}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-(--foreground)">
                    {formatPrice(offer.comboPrice)}
                  </span>
                  {savings > 0 && (
                    <span className="text-sm text-(--muted) line-through">
                      {formatPrice(offer.individualTotal)}
                    </span>
                  )}
                </div>

                <Button
                  size="sm"
                  icon={FiShoppingBag}
                  className="mt-3 w-full justify-center"
                  onClick={() => handleAdd(offer)}
                >
                  Add to Cart
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
