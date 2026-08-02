import Image from "next/image";
import { FiAward, FiFeather, FiSlash, FiTruck } from "react-icons/fi";
import whyChooseImage from "@/assets/home/whyChoose2.png";

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

// Permanent, hardcoded trust section — not admin-managed. Sits above FAQs.
export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-(--background) py-14">
      <Image
        src={whyChooseImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover max-md:object-top-left"
      />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-3xl text-(--primary) max-md:text-2xl">
          Why Choose Sehat Potli?
        </h2>
        <div className="mt-3 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-(--border-color)" />
          <FiFeather className="text-(--primary)" size={14} />
          <span className="h-px w-12 bg-(--border-color)" />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:gap-4 md:grid-cols-4 md:gap-6">
          {WHY_CHOOSE_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl border border-(--border-color) bg-(--surface)/60 p-6 text-center backdrop-blur-sm"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-(--primary)/30 text-(--primary)">
                <Icon size={26} />
              </span>
              <h3 className="font-heading text-base text-(--foreground)">{title}</h3>
              <p className="text-xs text-(--secondary-text)">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
