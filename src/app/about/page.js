import FaqAccordion from "@/Components/Home/FaqAccordion";
import { BRAND_NAME, BRAND_TAGLINE } from "@/Constant/Constant";
import { faqApi } from "@/Service/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us | Sehat Potli",
  description: "The story behind Sehat Potli's premium dry fruits and nuts.",
};

async function getFaqs() {
  try {
    const res = await faqApi.list();
    return res.data?.action ? res.data.data : [];
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const faqs = await getFaqs();

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-14 md:px-8">
        <div className="text-center">
          <p className="font-accent text-lg text-(--accent-secondary)">
            {BRAND_TAGLINE}
          </p>
          <h1 className="mt-2 font-heading text-4xl text-(--primary)">
            About {BRAND_NAME}
          </h1>
        </div>

        <div className="prose prose-sm mt-10 max-w-none text-(--secondary-text)">
          <p>
            {BRAND_NAME} was born from a simple belief — that good health
            starts with good food, and good food starts with honest sourcing.
            We travel to the orchards and farms of Kashmir, Afghanistan, and
            California to hand-select almonds, cashews, walnuts, pistachios,
            and raisins at the peak of their quality.
          </p>
          <p>
            Every batch that reaches your home is cleaned, sorted, and packed
            without shortcuts — no added preservatives, no unnecessary
            processing, just nature&apos;s own goodness in a potli (pouch) made
            for modern life.
          </p>
          <h2 className="font-heading text-(--foreground)">Our Promise</h2>
          <ul>
            <li>100% Natural ingredients, sourced responsibly</li>
            <li>Rich in nutrition, free from artificial additives</li>
            <li>Premium quality, hand-graded before packing</li>
            <li>Supporting a healthy lifestyle, one potli at a time</li>
          </ul>
          <p>
            From our family to yours — thank you for making {BRAND_NAME} a part
            of your everyday wellness.
          </p>
        </div>
      </div>

      <FaqAccordion faqs={faqs} />
    </>
  );
}
