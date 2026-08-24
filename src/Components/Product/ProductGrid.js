// Shared product grid wrapper — used everywhere a set of ProductCards is
// shown (FeaturedCollection, TrendingProducts, RelatedProducts, the
// products listing page). Fixed column counts per breakpoint (2 on
// mobile, 3 on tablet, 4 from lg up) so every full row actually uses the
// full row width — auto-fit/minmax was tried here before, but it picks
// however many tracks fit at the *minimum* card width and then just
// stretches those, which can strand a row at 3 columns with a visible gap
// on the right where a 4th card should be instead of adding one.
export default function ProductGrid({ children, className = "" }) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 max-[400px]:gap-2 sm:grid-cols-3 sm:gap-4 md:gap-6 lg:grid-cols-4 ${className}`}
    >
      {children}
    </div>
  );
}
