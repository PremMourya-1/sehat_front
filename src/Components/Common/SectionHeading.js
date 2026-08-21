// Shared section heading — every home/listing section was hand-retyping the
// same "accent subtitle + heading" pair with slightly different classes.
// Purely presentational, no behavior.
export default function SectionHeading({
  title,
  subtitle,
  align = "center",
  // "light" = for use on a dark/photo background (e.g. WhyChooseUs' green
  // band) — swaps title/subtitle to light-on-dark colors.
  tone = "default",
  className = "",
}) {
  const alignClasses =
    align === "center" ? "items-center text-center" : "items-start text-left";
  const titleColor = tone === "light" ? "text-(--surface)" : "text-(--primary)";
  const subtitleColor = tone === "light" ? "text-(--accent)" : "text-(--accent-secondary)";

  return (
    <div className={`flex flex-col gap-1.5 ${alignClasses} ${className}`}>
      {subtitle && (
        <span className={`font-accent text-sm sm:text-base ${subtitleColor}`}>
          {subtitle}
        </span>
      )}
      <h2 className={`font-heading text-3xl max-md:text-2xl ${titleColor}`}>
        {title}
      </h2>
    </div>
  );
}
