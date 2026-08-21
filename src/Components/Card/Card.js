import { cx } from "@/Utils/utils";

// Generic bordered content card — the
// "rounded-2xl border border-(--border-color) bg-(--surface) p-6 shadow-sm"
// wrapper was retyped at nearly every section call site (product detail,
// cart, checkout, account). One shared component so spacing/radius/shadow
// stay consistent and only need to change in one place.
export default function Card({ children, className = "", as: Tag = "div", ...rest }) {
  return (
    <Tag
      className={cx(
        "rounded-2xl border border-(--border-color) bg-(--surface) p-6 shadow-sm max-md:p-4",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
