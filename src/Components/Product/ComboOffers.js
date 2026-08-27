"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiShoppingBag } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import SectionHeading from "@/Components/Common/SectionHeading";
import { addComboToCart } from "@/Store/Slices/cartSlice";
import { buildComboCartPayload } from "@/Utils/comboCart";
import { formatPrice } from "@/Utils/utils";

// "Combo & Bundle Offers" — real product bundles, admin-managed (see
// sehat-potli-backend ComboOffer/ComboOfferItem). Adding one to the cart
// doesn't create one opaque line item — see Store/Slices/cartSlice.js
// addComboToCart and Utils/cartExpansion.js for how it later expands back
// into real product/variant lines for stock, shipping and COD handling.
//
// Cards deliberately show no item photos — a combo with 2 items and one
// with 4 wrapped their photo strips to different heights, breaking row
// alignment across this grid on desktop (an "Add to Cart" button ends up
// at a different height per card). Name + price only, every card the same
// size; the full photo grid + details live on the combo's own detail page
// (app/combo-offers/[id]/page.js), one click away via the card.
export default function ComboOffers({ offers = [] }) {
  const dispatch = useDispatch();

  // Defense in depth alongside the backend's own filter (homeController.js)
  // — never render a combo with fewer than 2 real items, since it would be
  // an empty/₹0 "Add to Cart" with nothing for cartExpansion to expand into.
  const validOffers = Array.isArray(offers) ? offers.filter((o) => (o.items || []).length >= 2) : [];
  if (validOffers.length === 0) return null;

  const handleAdd = (offer) => {
    dispatch(addComboToCart(buildComboCartPayload(offer)));
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
                className="flex h-full flex-col rounded-2xl border border-(--border-color) bg-(--surface) p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={`/combo-offers/${offer.id}`} className="flex flex-1 flex-col">
                  {offer.discountLabel && (
                    <span className="mb-2 inline-flex w-fit items-center rounded-full bg-(--accent) px-2.5 py-1 text-xs font-semibold text-(--foreground)">
                      {offer.discountLabel}
                    </span>
                  )}
                  <h3 className="font-heading text-xl text-(--foreground)">{offer.title}</h3>
                  {offer.description && (
                    <p className="mt-1 text-sm text-(--secondary-text) line-clamp-2">{offer.description}</p>
                  )}

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

                  <span className="mt-1 text-xs font-medium text-(--primary) underline">
                    View details
                  </span>
                </Link>

                <Button
                  size="md"
                  icon={FiShoppingBag}
                  className="mt-4 w-full justify-center"
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
