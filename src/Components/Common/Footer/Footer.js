import Image from "next/image";
import Link from "next/link";
import { FiFacebook, FiInstagram, FiMail } from "react-icons/fi";
import { BRAND_NAME, BRAND_TAGLINE } from "@/Constant/Constant";
import footerImage from "@/assets/home/footer.png";
import footerImageMobile from "@/assets/home/footerVertical.png";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t-2 border-(--accent)/40 bg-(--btn-primary) text-(--surface)">
      <Image
        src={footerImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover max-md:hidden opacity-55"
      />
      <Image
        src={footerImageMobile}
        alt=""
        fill
        sizes="100vw"
        className="hidden object-cover max-md:block opacity-55"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-4 gap-10 px-8 py-12 max-md:grid-cols-1 max-md:px-4">
        <div>
          <h2 className="font-heading text-2xl text-(--surface)">
            {BRAND_NAME}
          </h2>
          <p className="mt-2 font-accent text-sm text-(--accent)">
            {BRAND_TAGLINE}
          </p>
          <p className="mt-3 text-sm text-(--surface)/70">
            Hand-picked, premium dry fruits and seeds — sourced with care, packed
            fresh, and delivered to your doorstep.
          </p>
          <div className="mt-4 flex gap-3 text-(--surface)/80">
            <a
              href="https://www.facebook.com/profile.php?id=61593933804150"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="transition-colors hover:text-(--accent)"
            >
              <FiFacebook size={18} />
            </a>
            <a
              href="https://www.instagram.com/sehatpotli.in/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-(--accent)"
            >
              <FiInstagram size={18} />
            </a>
          </div>
        </div>

        <div className="max-md:grid max-md:grid-cols-2 max-md:gap-6 md:contents">
          <div>
            <h3 className="font-heading text-lg text-(--surface)">Shop</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-(--surface)/70">
              <li>
                <Link
                  href="/products"
                  className="transition-colors hover:text-(--accent)"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-(--accent)"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="transition-colors hover:text-(--accent)"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="transition-colors hover:text-(--accent)"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg text-(--surface)">Company</h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-(--surface)/70">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-(--accent)"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-(--accent)"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-(--accent)"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="transition-colors hover:text-(--accent)"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="transition-colors hover:text-(--accent)"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund-policy"
                  className="transition-colors hover:text-(--accent)"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-lg text-(--surface)">
            Get in touch
          </h3>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-(--surface)/70">
            <li className="flex items-center gap-2">
              <FiMail size={14} /> sehatpotli18@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-(--surface)/10 px-8 py-4 text-center text-xs text-(--surface)/60 max-md:px-4">
        &copy; {year} {BRAND_NAME}. All rights reserved. ·{" "}
        <a
          href="https://softwayx.in"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-(--accent)"
        >
          Designed &amp; Developed by softwayx.in
        </a>
      </div>
    </footer>
  );
}
