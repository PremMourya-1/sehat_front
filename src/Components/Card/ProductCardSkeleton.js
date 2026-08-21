// Loading placeholder matching ProductCard's exact layout/spacing, so a
// product grid doesn't jump/reflow once real cards arrive. Pure markup, no
// behavior — render N of these while a product list request is in flight.
export default function ProductCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-(--border-color) bg-(--surface) p-3 shadow-sm max-md:p-2">
      <div className="aspect-square animate-pulse rounded-xl bg-(--surface-alt)" />
      <div className="mt-3 flex flex-1 flex-col gap-2 max-md:mt-2 max-md:gap-1.5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-(--surface-alt) max-md:h-4" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-(--surface-alt)" />
        <div className="mt-1 h-5 w-2/5 animate-pulse rounded bg-(--surface-alt) max-md:h-4" />
        <div className="mt-auto h-9 w-full animate-pulse rounded-full bg-(--surface-alt) pt-2" />
      </div>
    </div>
  );
}
