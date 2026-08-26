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
            const previewItems = (offer.items || []).slice(0, 4);
            // "Almonds 250g + Cashews 250g" — lets a shopper see exactly
            // which products and what size are in the bundle without
            // having to squint at the collage thumbnails.
            const itemsCaption = (offer.items || [])
              .map((item) => `${item.Product?.name || ""}${item.variant?.weight ? ` ${item.variant.weight}` : ""}`)
              .filter(Boolean)
              .join(" + ");

            return (
              <div
                key={offer.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface) shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative grid h-48 grid-cols-2 gap-1 bg-(--surface-alt) p-1">
                  {previewItems.map((item, index) => (
                    <span
                      key={item.id || index}
                      className="relative block overflow-hidden rounded-lg bg-(--surface-alt)"
                    >
                      <Image
                        src={resolveImageUrl(item.Product?.image)}
                        alt={item.Product?.name || offer.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </span>
                  ))}

                  {offer.discountLabel && (
                    <span className="absolute left-2 top-2 rounded-full bg-(--accent) px-2.5 py-1 text-xs font-semibold text-(--foreground) shadow-sm">
                      {offer.discountLabel}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="font-heading text-xl text-(--foreground)">{offer.title}</h3>
                  {itemsCaption && (
                    <p className="text-xs font-medium text-(--secondary-text) line-clamp-2">{itemsCaption}</p>
                  )}
                  {offer.description && (
                    <p className="text-sm text-(--secondary-text) line-clamp-2">{offer.description}</p>
                  )}

                  <div className="mt-1 flex items-baseline gap-2">
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
                    className="mt-auto w-full justify-center"
                    onClick={() => handleAdd(offer)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
