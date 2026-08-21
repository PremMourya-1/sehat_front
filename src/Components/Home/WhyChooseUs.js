import { FiAward, FiFeather, FiSlash, FiTruck } from "react-icons/fi";
import SectionHeading from "@/Components/Common/SectionHeading";

const WHY_CHOOSE_ITEMS = [
  {
    icon: FiFeather,
    title: "Farm Fresh",
    description: "Sourced from the best farms across India & the world.",
  },
  {
    icon: FiAward,
    title: "Premium Quality",
    description: "Handpicked, sorted & packed with utmost care.",
  },
  {
    icon: FiSlash,
    title: "No Preservatives",
    description: "100% natural with no artificial additives.",
  },
  {
    icon: FiTruck,
    title: "Fast Delivery",
    description: "Hygienically packed and delivered to your door.",
  },
];

// Permanent, hardcoded trust section — not admin-managed. A solid dark
// forest-green band (rather than a photo background) so it reads as a
// deliberate, brand-forward "trust bar" and breaks up the page's cream
// rhythm, instead of reusing the same background photo as ShopByType/
// BuildYourMixBanner above it.
export default function WhyChooseUs() {
  return (
    <section className="bg-(--btn-primary) py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading title="Why Choose Sehat Potli?" tone="light" />

        <div className="mt-10 grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:gap-4 md:grid-cols-4 md:gap-6">
          {WHY_CHOOSE_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-(--surface)/15 bg-(--surface)/5 p-6 text-center backdrop-blur-sm"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-(--accent)/50 text-(--accent)">
                <Icon size={26} />
              </span>
              <h3 className="font-heading text-base text-(--surface)">{title}</h3>
              <p className="text-xs text-(--surface)/70">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
