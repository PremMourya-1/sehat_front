"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FiHome, FiPackage, FiShoppingBag, FiUser } from "react-icons/fi";
import { selectCartCount } from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import useScrollVisibility from "@/Hooks/useScrollVisibility";

// Hides once the page has scrolled past this point AND the scroll direction
// is down; any upward scroll (even 1px) brings it straight back — the
// classic "hide on scroll down, reveal on scroll up" pattern, not a hard
// show/hide toggle at a fixed position.
const HIDE_AFTER_PX = 200;

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/account/orders", label: "Orders", icon: FiPackage, guarded: true },
  { href: "/cart", label: "Cart", icon: FiShoppingBag },
  { href: "/account", label: "Account", icon: FiUser, guarded: true },
];

// Mobile-only floating glass pill nav — replaces the icons the top header
// hides on mobile (see Header.js: cart/account move down here, only search
// + menu stay up top). Orders/Account are auth-gated the same way the cart
// page's own checkout button already is (open the login modal with a
// redirectTo instead of navigating straight through).
// Pages that already have their own fixed/floating mobile bottom bar for a
// page-specific purpose — stacking the global nav on top of those would
// overlap or crowd a small mobile screen, so this one steps aside there.
const SUPPRESSED_ON = ["/build-your-own-mix"];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { status } = useSession();
  const cartCount = useSelector(selectCartCount);
  const visible = useScrollVisibility(HIDE_AFTER_PX);

  const suppressed = SUPPRESSED_ON.some((path) => pathname.startsWith(path));

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    if (href === "/account") return pathname.startsWith("/account") && !pathname.startsWith("/account/orders");
    return pathname.startsWith(href);
  };

  const handleGuardedClick = (href) => (event) => {
    if (status !== "authenticated") {
      event.preventDefault();
      dispatch(openAuthModal({ view: "login", redirectTo: href }));
    }
  };

  if (suppressed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-4 bottom-4 z-50 md:hidden"
        >
          <div className="mx-auto flex max-w-sm items-center justify-around rounded-full border border-(--border-color) bg-(--surface)/75 py-2 shadow-lg backdrop-blur-lg">
            {NAV_ITEMS.map(({ href, label, icon: Icon, guarded }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={guarded ? handleGuardedClick(href) : undefined}
                  className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-colors ${
                    active ? "text-(--primary)" : "text-(--secondary-text)"
                  }`}
                >
                  <span className="relative">
                    <Icon size={20} />
                    {href === "/cart" && cartCount > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-(--accent-secondary) text-[9px] font-semibold text-(--surface)">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  {label}
                  {active && (
                    <motion.span
                      layoutId="mobile-bottom-nav-active"
                      className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-(--primary)"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
