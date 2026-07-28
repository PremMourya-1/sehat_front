const NUTRITION_ROWS = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "carbs", label: "Carbohydrates", unit: "g" },
  { key: "fiber", label: "Fiber", unit: "g" },
];

// Nutrition table (per 100g) + ingredient composition breakdown. Both are
// admin-entered, real per-product data (see the product's admin form) — no
// fallback/dummy values, so the whole section stays hidden until an admin
// actually fills it in for a product.
export default function NutritionAndComposition({ product }) {
  const nutrition = product?.nutrition;
  const composition = Array.isArray(product?.composition) ? product.composition : [];

  if (!nutrition && composition.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {nutrition && (
        <div>
          <h3 className="mb-3 font-heading text-lg text-(--foreground)">
            Nutrition (per 100g)
          </h3>
          <table className="w-full overflow-hidden rounded-xl border border-(--border-color) text-sm">
            <tbody>
              {NUTRITION_ROWS.map(({ key, label, unit }, index) => (
                <tr
                  key={key}
                  className={index % 2 === 0 ? "bg-(--surface)" : "bg-(--surface-alt)"}
                >
                  <td className="px-4 py-2 text-(--secondary-text)">{label}</td>
                  <td className="px-4 py-2 text-right font-medium text-(--foreground)">
                    {nutrition[key]} {unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {composition.length > 0 && (
        <div>
          <h3 className="mb-3 font-heading text-lg text-(--foreground)">Composition</h3>
          <div className="flex flex-col gap-2">
            {composition.map(({ ingredient, percentage }) => (
              <div key={ingredient}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-(--foreground)">{ingredient}</span>
                  <span className="font-medium text-(--secondary-text)">{percentage}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-(--surface-alt)">
                  <div
                    className="h-full rounded-full bg-(--btn-primary)"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
