import { FiClock, FiCoffee, FiPackage } from "react-icons/fi";
import { getProductMeta } from "@/Data/dummyProducts";

// Shelf life, storage instructions & serving suggestion. Derived from a
// deterministic dummy profile since the backend doesn't carry these fields yet.
export default function ShelfLifeAndServing({ product }) {
  const { shelfLife, storage, servingSuggestion } = getProductMeta(product);

  const rows = [
    { icon: FiClock, label: "Shelf Life", value: shelfLife },
    { icon: FiPackage, label: "Storage", value: storage },
    { icon: FiCoffee, label: "Serving Suggestion", value: servingSuggestion },
  ];

  return (
    <div className="flex flex-col gap-3">
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-3 text-sm">
          <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-(--surface-alt) text-(--primary)">
            <Icon size={15} />
          </span>
          <div>
            <p className="font-medium text-(--foreground)">{label}</p>
            <p className="text-(--secondary-text)">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
