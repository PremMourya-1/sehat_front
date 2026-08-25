import { FiMapPin, FiShield } from "react-icons/fi";
import { FSSAI_LICENSE_NUMBER } from "@/Constant/Constant";

const FALLBACK_CERTIFICATIONS = ["FSSAI"];

// Origin/sourcing tag + certification badges. Falls back to a baseline
// FSSAI badge when the backend product doesn't carry `certifications` yet.
export default function OriginAndCertifications({ product }) {
  const origin = product?.origin;
  const certifications = Array.isArray(product?.certifications) && product.certifications.length > 0
    ? product.certifications
    : FALLBACK_CERTIFICATIONS;

  if (!origin && certifications.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-(--border-color) bg-(--surface-alt) px-4 py-3">
      {origin && (
        <span className="flex items-center gap-1.5 text-sm text-(--foreground)">
          <FiMapPin size={15} className="text-(--primary)" />
          Sourced from {origin}
        </span>
      )}
      {certifications.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {certifications.map((cert) => (
            <span
              key={cert}
              className="flex items-center gap-1 rounded-full border border-(--border-color) bg-(--surface) px-2.5 py-1 text-xs font-medium text-(--secondary-text)"
            >
              <FiShield size={11} className="text-(--success)" /> {cert} Certified
              {cert === "FSSAI" && (
                <span className="text-(--secondary-text)/70">· Lic. No. {FSSAI_LICENSE_NUMBER}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
