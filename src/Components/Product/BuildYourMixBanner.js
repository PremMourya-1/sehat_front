import Image from "next/image";
import {
  FiCheckSquare,
  FiPackage,
  FiShoppingCart,
  FiSliders,
} from "react-icons/fi";
import Button from "@/Components/Button/Button";
// import buildYourMixImage from "@/assets/home/whyChoose.png";
import buildYourMixImage from "@/assets/home/whyChoose2.png";

const STEPS = [
  { icon: FiSliders, label: "Choose your base", detail: "Nuts or seeds" },
  {
    icon: FiCheckSquare,
    label: "Pick ingredients",
    detail: "Mix & match freely",
  },
  { icon: FiPackage, label: "Choose pack size", detail: "100g to bulk" },
  {
    icon: FiShoppingCart,
    label: "Add to cart",
    detail: "Fresh-packed & shipped",
  },
];

// Permanent, hardcoded homepage banner explaining the custom-mix builder —
// not admin-managed (this content/image never changes), so it's static.
export default function BuildYourMixBanner() {
  return (
    <section className="relative overflow-hidden py-16 text-(--surface) max-md:py-12">
      <Image
        src={buildYourMixImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-r from-(--btn-primary)/95 via-(--btn-primary)/80 to-(--btn-primary)/60 max-md:bg-linear-to-t max-md:from-(--btn-primary)/95 max-md:via-(--btn-primary)/85 max-md:to-(--btn-primary)/70" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 md:flex-row md:justify-between md:px-8">
        <div className="max-w-lg text-center md:text-left">
          <p className="font-accent text-lg text-(--accent) md:text-xl">
            Make it yours
          </p>
          <h2 className="mt-2 font-heading text-3xl max-md:text-2xl md:text-4xl">
            Build Your Own Mix
          </h2>
          <p className="mt-3 text-(--surface)/85">
            Choose a base of nuts or seeds, pick your favorite ingredients,
            select a pack size, and we'll pack it fresh — just for you.
          </p>
          <Button url="/build-your-own-mix" variant="accent" size="lg" className="mt-6">
            Start Building
          </Button>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-(--surface)/15 bg-(--surface)/10 p-6 backdrop-blur-sm md:max-w-none">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {STEPS.map(({ icon: Icon, label, detail }, index) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-(--surface)/25 bg-(--surface)/10 shadow-lg">
                  <Icon size={22} className="text-(--accent)" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-(--accent) text-[10px] font-bold text-(--foreground)">
                    {index + 1}
                  </span>
                </span>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-(--surface)/70">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
