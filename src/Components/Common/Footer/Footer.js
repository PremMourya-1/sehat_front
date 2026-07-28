import Link from "next/link";
import { FiFacebook, FiInstagram, FiMail, FiPhone, FiTwitter } from "react-icons/fi";
import { BRAND_NAME, BRAND_TAGLINE } from "@/Constant/Constant";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-(--accent)/40 bg-(--btn-primary) text-(--surface)">
      <div className="mx-auto grid max-w-7xl grid-cols-4 gap-10 px-8 py-12 max-md:grid-cols-1 max-md:px-4">
        <div>
          <h2 className="font-heading text-2xl text-(--surface)">{BRAND_NAME}</h2>
          <p className="mt-2 font-accent text-sm text-(--accent)">
            {BRAND_TAGLINE}
          </p>
          <p className="mt-3 text-sm text-(--surface)/70">
            Hand-picked, premium dry fruits and nuts — sourced with care,
            packed fresh, and delivered to your doorstep.
          </p>
          <div className="mt-4 flex gap-3 text-(--surface)/80">
            <a href="#" aria-label="Facebook" className="transition-colors hover:text-(--accent)">
              <FiFacebook size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="transition-colors hover:text-(--accent)">
              <FiInstagram size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="transition-colors hover:text-(--accent)">
              <FiTwitter size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-lg text-(--surface)">Shop</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-(--surface)/70">
            <li><Link href="/products" className="transition-colors hover:text-(--accent)">All Products</Link></li>
            <li><Link href="/" className="transition-colors hover:text-(--accent)">Categories</Link></li>
            <li><Link href="/cart" className="transition-colors hover:text-(--accent)">Cart</Link></li>
            <li><Link href="/account" className="transition-colors hover:text-(--accent)">My Account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-lg text-(--surface)">Company</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-(--surface)/70">
            <li><Link href="/about" className="transition-colors hover:text-(--accent)">About Us</Link></li>
            <li><Link href="/blog" className="transition-colors hover:text-(--accent)">Blog</Link></li>
            <li><Link href="/contact" className="transition-colors hover:text-(--accent)">Contact Us</Link></li>
            <li><Link href="/terms-and-conditions" className="transition-colors hover:text-(--accent)">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy-policy" className="transition-colors hover:text-(--accent)">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="transition-colors hover:text-(--accent)">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-lg text-(--surface)">Get in touch</h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-(--surface)/70">
            <li className="flex items-center gap-2">
              <FiPhone size={14} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <FiMail size={14} /> hello@sehatpotli.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-(--surface)/10 px-8 py-4 text-center text-xs text-(--surface)/60 max-md:px-4">
        &copy; {year} {BRAND_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
