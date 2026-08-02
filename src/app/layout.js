import { Playfair_Display, Yeseva_One, Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/Store/StoreProvider";
import AuthSessionProvider from "@/Providers/AuthSessionProvider";
import Header from "@/Components/Common/Header/Header";
import Footer from "@/Components/Common/Footer/Footer";
import AuthModal from "@/Components/Auth/AuthModal";
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

export const metadata = {
  title: "Sehat Potli | Premium Dry Fruits & Nuts",
  description:
    "Sehat Ki Potli, Har Ghar Ki Zaroorat — Sehat Potli brings you premium, hand-picked dry fruits and nuts, sourced with care and delivered fresh to your door.",
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
            <main className="min-h-screen">{children}</main>
            <Footer />
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
