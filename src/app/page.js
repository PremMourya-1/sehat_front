import HeroSlider from "@/Components/Hero/HeroSlider";
import ShopByType from "@/Components/Category/ShopByType";
import FeaturedCollection from "@/Components/Product/FeaturedCollection";
import TestimonialsSection from "@/Components/Testimonial/TestimonialsSection";
import BuildYourMixBanner from "@/Components/Product/BuildYourMixBanner";
import TrendingProducts from "@/Components/Product/TrendingProducts";
import ComboOffers from "@/Components/Product/ComboOffers";
import GiftHampersSection from "@/Components/Product/GiftHampersSection";
import SubscribeAndSave from "@/Components/Home/SubscribeAndSave";
import WhyChooseUs from "@/Components/Home/WhyChooseUs";
import { homeApi } from "@/Service/api";

// The backend may not be reachable at build time (no live DB in CI/local
// build), so this route is rendered dynamically at request time.
export const dynamic = "force-dynamic";

// Every section on this page is sourced from ONE aggregated API call
// (GET /api/home) rather than one fetch per section — see homeController.js
// on the backend. "Build Your Own Mix", "Subscribe & Save" and "Why Choose
// Us" are static, permanent content (not admin-managed) so they need no
// data at all. FAQs live on the About page now, not here.
async function getHomeData() {
  try {
    const res = await homeApi.get();
    return res.data?.action ? res.data.data : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const home = (await getHomeData()) || {};
  const {
    banners = [],
    categories = [],
    featuredProducts = [],
    trendingProducts = [],
    giftHamperProducts = [],
    comboOffers = [],
    testimonials = [],
  } = home;

  return (
    <div>
      <HeroSlider banners={banners} />
      <ShopByType categories={categories} />
      <FeaturedCollection products={featuredProducts} />
      <BuildYourMixBanner />
      <TrendingProducts products={trendingProducts} />
      <ComboOffers offers={comboOffers} />
      <GiftHampersSection products={giftHamperProducts} />
      <WhyChooseUs />
      <TestimonialsSection testimonials={testimonials} />
      <SubscribeAndSave />
    </div>
  );
}
