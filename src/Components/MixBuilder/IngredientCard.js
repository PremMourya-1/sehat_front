"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck } from "react-icons/fi";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";
import { getPerGramRate, isIngredientAvailable } from "@/Utils/mixPricing";

// One ingredient tile in Step 2 — weight is always picked from the
// admin-configured `increments` (pill buttons), never free-typed. Adding
// briefly flashes a checkmark over the image as feedback, then the pill
// resets so the same ingredient can be added again to stack more of it.
export default function IngredientCard({ ingredient, increments, remainingGrams, onAdd }) {
  const [selectedGrams, setSelectedGrams] = useState(increments[0]);
  const [justAdded, setJustAdded] = useState(false);

  const available = isIngredientAvailable(ingredient);
  const perGramRate = getPerGramRate(ingredient);
  const per100g = perGramRate * 100;
  const canAddSelected = available && selectedGrams <= remainingGrams;

  const handleAdd = () => {
    if (!canAddSelected) return;
    onAdd(ingredient, selectedGrams, perGramRate);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 700);
  };

  return (
    <motion.div
      layout
      className="flex flex-col overflow-hidden rounded-2xl border border-(--border-color) bg-(--surface) shadow-sm"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-(--surface-alt)">
        <Image
          src={resolveImageUrl(ingredient.image)}
          alt={ingredient.name}
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover"
        />
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-(--surface) px-3 py-1 text-xs font-semibold text-(--danger)">
              Out of Stock
            </span>
          </div>
        )}
        <AnimatePresence>
          {justAdded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex items-center justify-center bg-(--primary)/80"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--surface) text-(--primary)">
                <FiCheck size={24} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="font-heading text-sm text-(--foreground) line-clamp-1">{ingredient.name}</h3>
        <p className="text-xs text-(--secondary-text)">{formatPrice(per100g)} / 100g</p>

        <div className="mt-1 flex flex-wrap gap-1.5">
          {increments.map((grams) => {
            const disabled = !available || grams > remainingGrams;
            return (
              <button
                key={grams}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedGrams(grams)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  disabled
                    ? "cursor-not-allowed border-(--border-color) text-(--muted)"
                    : selectedGrams === grams
                      ? "border-(--btn-primary) bg-(--btn-primary) text-(--surface)"
                      : "border-(--border-color) text-(--foreground) hover:border-(--btn-primary)"
                }`}
              >
                {grams}g
              </button>
            );
          })}
        </div>

        <motion.button
          type="button"
          whileTap={canAddSelected ? { scale: 0.95 } : undefined}
          onClick={handleAdd}
          disabled={!canAddSelected}
          className="mt-auto rounded-full bg-(--btn-primary) py-2 text-xs font-semibold text-(--surface) transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {available ? `Add ${selectedGrams}g` : "Unavailable"}
        </motion.button>
      </div>
    </motion.div>
  );
}
