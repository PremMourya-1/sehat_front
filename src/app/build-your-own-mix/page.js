"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiPackage, FiShoppingBag } from "react-icons/fi";
import { mixApi } from "@/Service/api";
import { addMixToCart } from "@/Store/Slices/cartSlice";
import Loader from "@/Components/Common/Loader/Loader";
import Button from "@/Components/Button/Button";
import StepIndicator from "@/Components/MixBuilder/StepIndicator";
import IngredientCard from "@/Components/MixBuilder/IngredientCard";
import MixSummaryPanel from "@/Components/MixBuilder/MixSummaryPanel";
import MixSummaryMobileBar from "@/Components/MixBuilder/MixSummaryMobileBar";
import { formatPrice, resolveImageUrl } from "@/Utils/utils";

const CATEGORY_LABELS = {
  nuts: "Nuts",
  seeds: "Seeds",
  dried_fruit: "Dried Fruit",
};

const fadeStep = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: "easeOut" },
};

export default function BuildYourOwnMixPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [step, setStep] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mixItems, setMixItems] = useState([]);
  const [mixName, setMixName] = useState("");
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const loadIngredients = () => {
    setIsLoading(true);
    setLoadError(false);
    mixApi
      .getIngredients()
      .then((res) => {
        if (res.data.action) setData(res.data.data);
        else {
          toast.error(res.data.message);
          setLoadError(true);
        }
      })
      .catch(() => {
        toast.error("Failed to load mix ingredients");
        setLoadError(true);
      })
      .finally(() => setIsLoading(false));
  };

  // A failed fetch (backend down, network blip) is not the same situation
  // as "loaded fine, nothing is flagged yet" — the two used to share one
  // "Coming Soon" message, which reads as "this feature doesn't exist"
  // when it's actually just a transient error worth retrying.
  useEffect(loadIngredients, []);

  const totalGrams = useMemo(() => mixItems.reduce((sum, i) => sum + i.grams, 0), [mixItems]);
  const totalPrice = useMemo(() => mixItems.reduce((sum, i) => sum + i.price, 0), [mixItems]);
  const capGrams = data?.capGrams || 1000;
  const remainingGrams = Math.max(0, capGrams - totalGrams);
  const increments = data?.weightIncrementsGrams || [100, 250, 500];

  const filteredIngredients = useMemo(() => {
    if (!data) return [];
    if (categoryFilter === "all") return data.ingredients;
    return data.ingredients.filter((i) => i.mixCategory === categoryFilter);
  }, [data, categoryFilter]);

  // Every "Add" is its own line, even for an ingredient already in the mix
  // at a different (or the same) weight — e.g. adding Almonds at 100g then
  // again at 250g shows as two separate 100g/250g rows, each independently
  // removable, rather than silently merging into one 350g row.
  const addIngredient = (ingredient, grams, perGramRate) => {
    if (grams > remainingGrams) {
      toast.error(`Only ${remainingGrams}g left in your mix`);
      return;
    }
    setMixItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: ingredient.id,
        name: ingredient.name,
        image: ingredient.image,
        grams,
        price: Number((perGramRate * grams).toFixed(2)),
      },
    ]);
  };

  const removeIngredient = (lineId) => {
    setMixItems((prev) => prev.filter((i) => i.id !== lineId));
  };

  const handleAddToCart = () => {
    dispatch(
      addMixToCart({
        mixId: crypto.randomUUID(),
        name: mixName.trim() || null,
        totalWeightGrams: totalGrams,
        price: totalPrice,
        quantity: 1,
        items: mixItems.map((i) => ({
          productId: i.productId,
          grams: i.grams,
          name: i.name,
          image: i.image,
        })),
      }),
    );
    toast.success(`${mixName.trim() || "Your mix"} added to cart`);
    setJustAddedToCart(true);
    setStep(3);
  };

  const startOver = () => {
    setMixItems([]);
    setMixName("");
    setJustAddedToCart(false);
    setCategoryFilter("all");
    setStep(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--danger)/10 text-(--danger)">
          <FiPackage size={26} />
        </span>
        <h1 className="font-heading text-2xl text-(--primary)">Couldn&apos;t load mix ingredients</h1>
        <p className="text-(--secondary-text)">Something went wrong on our end — please try again.</p>
        <Button onClick={loadIngredients}>Retry</Button>
      </div>
    );
  }

  if (!data || data.ingredients.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-alt) text-(--primary)">
          <FiPackage size={26} />
        </span>
        <h1 className="font-heading text-2xl text-(--primary)">Build Your Own Mix — Coming Soon</h1>
        <p className="text-(--secondary-text)">
          We&apos;re getting our mix ingredients ready. Check back soon to build your custom blend.
        </p>
        <Button url="/products">Browse Products</Button>
      </div>
    );
  }

  const categoriesWithCounts = (data.mixCategories || []).map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat] || cat,
    count: data.ingredients.filter((i) => i.mixCategory === cat).length,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="text-center">
        <p className="font-accent text-lg text-(--accent-secondary)">Make it yours</p>
        <h1 className="mt-1 font-heading text-3xl text-(--primary) max-md:text-2xl">Build Your Own Mix</h1>
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <StepIndicator currentStep={step} />
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...fadeStep} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter("all")}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      categoryFilter === "all"
                        ? "bg-(--btn-primary) text-(--surface)"
                        : "border border-(--border-color) text-(--foreground)"
                    }`}
                  >
                    All
                  </button>
                  {categoriesWithCounts.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategoryFilter(cat.value)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                        categoryFilter === cat.value
                          ? "bg-(--btn-primary) text-(--surface)"
                          : "border border-(--border-color) text-(--foreground)"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {filteredIngredients.map((ingredient) => (
                    <IngredientCard
                      key={ingredient.id}
                      ingredient={ingredient}
                      increments={increments}
                      remainingGrams={remainingGrams}
                      onAdd={addIngredient}
                    />
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setStep(2)}
                    disabled={mixItems.length === 0}
                  >
                    Review Your Mix
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-24 rounded-2xl border border-(--border-color) bg-(--surface) p-5 shadow-sm">
                  <h3 className="mb-4 font-heading text-lg text-(--primary)">Your Mix</h3>
                  <MixSummaryPanel
                    items={mixItems}
                    totalGrams={totalGrams}
                    capGrams={capGrams}
                    totalPrice={totalPrice}
                    onRemove={removeIngredient}
                    primaryLabel="Review Your Mix"
                    onPrimaryAction={() => setStep(2)}
                    primaryDisabled={mixItems.length === 0}
                  />
                </div>
              </div>

              <MixSummaryMobileBar
                items={mixItems}
                totalGrams={totalGrams}
                capGrams={capGrams}
                totalPrice={totalPrice}
                onRemove={removeIngredient}
                primaryLabel="Review Your Mix"
                onPrimaryAction={() => setStep(2)}
                primaryDisabled={mixItems.length === 0}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" {...fadeStep} className="mx-auto max-w-xl">
              <h2 className="text-center font-heading text-xl text-(--foreground)">Review your pack</h2>

              <div className="mt-6">
                <label htmlFor="mixName" className="text-sm font-medium text-(--foreground)">
                  Name your mix <span className="text-(--secondary-text)">(optional)</span>
                </label>
                <input
                  id="mixName"
                  value={mixName}
                  onChange={(e) => setMixName(e.target.value)}
                  placeholder="e.g. My Trail Mix"
                  maxLength={100}
                  className="mt-1.5 w-full rounded-xl border border-(--border-color) bg-(--surface) px-4 py-2.5 text-sm outline-none focus:border-(--btn-primary)"
                />
              </div>

              <ul className="mt-6 flex flex-col gap-3">
                {mixItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-(--border-color) p-3"
                  >
                    <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-(--surface-alt)">
                      <Image src={resolveImageUrl(item.image)} alt={item.name} fill sizes="56px" className="object-cover" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-(--foreground)">{item.name}</p>
                      <p className="text-xs text-(--secondary-text)">{item.grams}g</p>
                    </div>
                    <span className="text-sm font-semibold text-(--foreground)">{formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-1.5 rounded-xl bg-(--surface-alt) p-4">
                <div className="flex justify-between text-sm text-(--secondary-text)">
                  <span>Total Weight</span>
                  <span>{totalGrams}g</span>
                </div>
                <div className="flex justify-between font-heading text-lg text-(--primary)">
                  <span>Total Price</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm font-medium text-(--secondary-text) hover:text-(--foreground)"
                >
                  <FiArrowLeft size={15} /> Back
                </button>
                <Button variant="accent" size="md" icon={FiShoppingBag} onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && justAddedToCart && (
            <motion.div key="step3" {...fadeStep} className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-(--primary)/10 text-(--primary)"
              >
                <FiCheckCircle size={32} />
              </motion.span>
              <h2 className="font-heading text-2xl text-(--primary)">Added to your cart!</h2>
              <p className="text-(--secondary-text)">
                {mixName.trim() || "Your custom mix"} ({totalGrams}g) is ready — freshly packed just for you.
              </p>
              <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={startOver}>
                  Build Another Mix
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  icon={FiArrowRight}
                  onClick={() => router.push("/cart")}
                >
                  View Cart
                </Button>
              </div>
              <Link href="/products" className="mt-2 text-sm text-(--secondary-text) underline">
                Continue Shopping
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
