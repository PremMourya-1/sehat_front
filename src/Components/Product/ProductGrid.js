// Shared product grid wrapper — used everywhere a set of ProductCards is
// shown (FeaturedCollection, TrendingProducts, RelatedProducts, the
// products listing page). Uses CSS Grid's auto-fit + capped minmax instead
// of a fixed column count: with few items (sparse category, a filtered
// result, the last "load more" page), the grid only creates as many tracks
// as there are cards instead of reserving empty grid cells for missing
// ones — no more single cards stranded in a sea of blank space on desktop.
// Column *count* still lands on ~2/3/4 at the same breakpoints as before;
// only the "too few items" behavior changes.
export default function ProductGrid({ children, className = "" }) {
  return (
    <div
      className={`grid grid-cols-[repeat(auto-fit,minmax(140px,220px))] gap-3 max-[400px]:gap-2 sm:grid-cols-[repeat(auto-fit,minmax(170px,260px))] sm:gap-4 md:grid-cols-[repeat(auto-fit,minmax(200px,300px))] md:gap-6 ${className}`}
    >
      {children}
    </div>
  );
}
