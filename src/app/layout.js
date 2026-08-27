import { Playfair_Display, Yeseva_One, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/Store/StoreProvider";
import AuthSessionProvider from "@/Providers/AuthSessionProvider";
import Header from "@/Components/Common/Header/Header";
import LaunchCountdownBanner from "@/Components/Common/LaunchCountdownBanner";
import MobileBottomNav from "@/Components/Common/Header/MobileBottomNav";
import CartFillProgress from "@/Components/Cart/CartFillProgress";
import Footer from "@/Components/Common/Footer/Footer";
import AuthModal from "@/Components/Auth/AuthModal";
import ogImageMeta from "@/Data/ogImageMeta.json";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const yeseva = Yeseva_One({
  variable: "--font-yeseva",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Falls back to the production domain if NEXT_PUBLIC_SITE_URL isn't set on
// the host — without metadataBase, Next.js can't resolve any relative
// og:image/url into the absolute URL link-preview crawlers require, and
// would otherwise silently fall back to localhost in a production build.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sehatpotli.in";

const SITE_TITLE = "Sehat Potli — Premium Dry Fruits & Seeds";
const SITE_DESCRIPTION =
  "Sehat Ki Potli, Har Ghar Ki Zaroorat — Sehat Potli brings you premium, hand-picked dry fruits and seeds, sourced with care and delivered fresh to your door.";

// Every route inherits this unless it defines its own metadata/
// generateMetadata (see app/products/[id]/page.js for the per-product
// override) — so the homepage and every static page (About, Contact, ...)
// get a correct, complete link-preview for free, and only product pages
// need their own dynamic version.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Sehat Potli",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Sehat Potli",
    images: [{ url: "/og-image.jpg", width: ogImageMeta.width, height: ogImageMeta.height, alt: SITE_TITLE }],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${yeseva.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthSessionProvider>
          <StoreProvider>
            <Header />
            <LaunchCountdownBanner />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <MobileBottomNav />
            <CartFillProgress />
            <AuthModal />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "var(--surface)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border-color)",
                },
              }}
            />
          </StoreProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
