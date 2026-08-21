"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  FiMenu,
  FiShoppingBag,
  FiUser,
  FiX,
  FiLogOut,
  FiPackage,
} from "react-icons/fi";
import headerNavData from "@/Data/headerNavData";
import { selectCartCount } from "@/Store/Slices/cartSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import { BRAND_NAME } from "@/Constant/Constant";
import logo from "@/assets/logo.png";

export default function Header() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const cartCount = useSelector(selectCartCount);
  const { data: session, status } = useSession();
  const authUser = session?.user;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await signOut({ redirect: false });
    toast.success("Logged out successfully");
  };

  const handleAuthOpen = () => {
    dispatch(openAuthModal({ view: "login" }));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-(--border-color) bg-(--surface)/90 backdrop-blur">
      <div className="hidden bg-(--btn-primary) py-1.5 text-center text-xs tracking-wide text-(--surface)/90 sm:block">
        100% Natural &amp; FSSAI Certified &middot; Free Shipping on Prepaid Orders
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-8 py-3 max-md:px-4">
        <Link href="/" className="flex items-center leading-none">
          <Image
            src={logo}
            alt={BRAND_NAME}
            className="w-[100px] h-auto object-contain  max-md:w-[80px]"
            priority
          />
        </Link>

        <nav className="flex items-center gap-8 max-md:hidden">
          {headerNavData.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative font-sans text-sm font-medium text-(--foreground) transition-colors hover:text-(--primary) after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-(--accent) after:transition-all ${
                  isActive
                    ? "after:w-full text-(--primary)"
                    : "after:w-0 hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative text-(--foreground) hover:text-(--primary)"
            aria-label="Cart"
          >
            <FiShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-(--accent-secondary) text-[10px] font-semibold text-(--surface)">
                {cartCount}
              </span>
            )}
          </Link>

          {status === "authenticated" && authUser ? (
            <div className="relative block max-md:hidden" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-1 text-(--foreground) hover:text-(--primary)"
                aria-label="Account"
              >
                <FiUser size={20} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl border border-(--border-color) bg-(--surface) p-2 shadow-lg">
                  <p className="truncate px-3 py-1 text-sm font-medium text-(--foreground)">
                    {authUser.name || authUser.email}
                  </p>
                  <Link
                    href="/account"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--secondary-text) hover:bg-(--surface-alt)"
                  >
                    <FiUser size={16} /> My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-(--secondary-text) hover:bg-(--surface-alt)"
                  >
                    <FiPackage size={16} /> My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-(--danger) hover:bg-(--surface-alt)"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAuthOpen}
              className="block rounded-full bg-(--btn-primary) px-5 py-2 text-sm font-medium text-(--surface) transition-colors hover:bg-(--btn-primary-hover) max-md:hidden"
            >
              Login
            </button>
          )}

          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center text-(--foreground) max-md:flex"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in-up absolute inset-x-0 top-full z-50 hidden border-t border-(--border-color) bg-(--surface) px-4 py-4 shadow-lg max-md:block">
          <nav className="flex flex-col divide-y divide-(--border-color)">
            {headerNavData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-sm font-medium text-(--foreground)"
              >
                {link.label}
              </Link>
            ))}
            {status === "authenticated" && authUser ? (
              <>
                <Link
                  href="/account"
                  className="py-3 text-sm font-medium text-(--foreground)"
                >
                  My Account
                </Link>
                <Link
                  href="/account/orders"
                  className="py-3 text-sm font-medium text-(--foreground)"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-3 text-left text-sm font-medium text-(--danger)"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleAuthOpen}
                className="py-3 text-left text-sm font-medium text-(--primary)"
              >
                Login
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
