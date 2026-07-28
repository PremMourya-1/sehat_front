"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function FaqAccordion({ faqs = [] }) {
  const [openId, setOpenId] = useState(faqs[0]?.id ?? null);

  if (!Array.isArray(faqs) || faqs.length === 0) return null;

  return (
    <section className="bg-(--surface-alt) py-14">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <h2 className="text-center font-heading text-3xl text-(--primary) max-md:text-2xl">
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center font-accent text-(--accent-secondary)">
          Shipping, returns, freshness & more
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-xl border border-(--border-color) bg-(--surface)"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-medium text-(--foreground)">{faq.question}</span>
                  <FiChevronDown
                    size={18}
                    className={`flex-shrink-0 text-(--secondary-text) transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm text-(--secondary-text)">{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
