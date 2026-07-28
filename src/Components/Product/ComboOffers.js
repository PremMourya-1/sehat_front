import { FiTag } from "react-icons/fi";
import Button from "@/Components/Button/Button";

// "Combo & Bundle Offers" — pricing-bundle promos, admin-managed.
export default function ComboOffers({ offers = [] }) {
  if (!Array.isArray(offers) || offers.length === 0) return null;

  return (
    <section className="bg-(--surface-alt) py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-3xl text-(--primary) max-md:text-2xl">
          Combo &amp; Bundle Offers
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center font-accent text-(--accent-secondary)">
          More you buy, more you save
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--surface) p-6 shadow-sm"
            >
              {offer.discountLabel && (
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-(--accent) px-3 py-1 text-xs font-semibold text-(--foreground)">
                  <FiTag size={12} /> {offer.discountLabel}
                </span>
              )}
              <h3 className="font-heading text-xl text-(--foreground)">{offer.title}</h3>
              {offer.description && (
                <p className="text-sm text-(--secondary-text)">{offer.description}</p>
              )}
              <Button url={offer.ctaLink || "/products"} size="sm" className="mt-auto w-fit">
                {offer.ctaLabel || "Shop Now"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
