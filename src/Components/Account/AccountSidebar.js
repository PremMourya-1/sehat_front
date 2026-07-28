"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiClock, FiLock, FiPackage, FiUser } from "react-icons/fi";

const links = [
  { label: "My Account", href: "/account", icon: FiUser },
  { label: "My Orders", href: "/account/orders", icon: FiPackage },
  { label: "Recent Orders", href: "/account/recent-orders", icon: FiClock },
  { label: "Change Password", href: "/account/change-password", icon: FiLock },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-fit rounded-2xl border border-(--border-color) bg-(--surface) p-4">
      <h2 className="mb-3 px-2 font-heading text-lg text-(--primary)">
        My Account
      </h2>
      <nav className="flex flex-col gap-1">
        {links.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-(--btn-primary) text-(--surface)"
                  : "text-(--secondary-text) hover:bg-(--surface-alt)"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
