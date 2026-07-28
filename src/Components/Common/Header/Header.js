"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import {
  loginAction,
  logoutAction,
  selectAuthUser,
} from "@/Store/Slices/authSlice";
import { openAuthModal } from "@/Store/Slices/uiSlice";
import { USER_DETAILS, BRAND_NAME } from "@/Constant/Constant";
import {
  getLocalStorageItem,
  removeLocalStorageItem,
} from "@/Utils/localStorage";
import { authApi } from "@/Service/api";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useSelector(selectCartCount);
  const authUser = useSelector(selectAuthUser);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Session rehydration — on first mount, if the user was previously logged
  // in (localStorage has details) but Redux state is empty (fresh page
  // load), restore it into the store.
  useEffect(() => {
    if (authUser) return;
    const stored = getLocalStorageItem(USER_DETAILS);
    if (stored) dispatch(loginAction(stored));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout — clear client state regardless
    } finally {
      removeLocalStorageItem(USER_DETAILS);
      dispatch(logoutAction());
      setProfileOpen(false);
      toast.success("Logged out successfully");
      router.push("/");
    }
  };

  const handleAuthOpen = () => {
    dispatch(openAuthModal({ view: "login" }));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-(--border-color) bg-(--surface)/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-3 max-md:px-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-heading text-3xl font-semibold text-(--primary) max-md:text-2xl">
            {BRAND_NAME}
          </span>
          <span className="font-accent text-xs tracking-wide text-(--accent-secondary) max-md:text-[11px]">
            Pure. Natural. Wholesome.
          </span>
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

          {authUser ? (
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
            className="hidden text-(--foreground) max-md:block"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="hidden border-t border-(--border-color) bg-(--surface) px-4 py-4 max-md:block">
          <nav className="flex flex-col gap-3">
            {headerNavData.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-(--foreground)"
              >
                {link.label}
              </Link>
            ))}
            {authUser ? (
              <>
                <Link
                  href="/account"
                  className="text-sm font-medium text-(--foreground)"
                >
                  My Account
                </Link>
                <Link
                  href="/account/orders"
                  className="text-sm font-medium text-(--foreground)"
                >
                  My Orders
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left text-sm font-medium text-(--danger)"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleAuthOpen}
                className="text-left text-sm font-medium text-(--primary)"
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
