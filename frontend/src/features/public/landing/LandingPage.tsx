import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicOpeningHours } from "@/shared/api/openingHoursApi";
import { fetchPublicPageContent } from "@/shared/api/pageContentApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { ClosedBanner } from "@/shared/components/banners/ClosedBanner";
import { InfoBar } from "@/shared/components/info-bar/InfoBar";
import { CartBottomSheet } from "@/features/public/cart/CartBottomSheet";
import { MobileCartBar } from "@/features/public/cart/MobileCartBar";
import { PublicNav } from "@/features/public/shared/PublicNav";
import { PublicFooter } from "@/features/public/shared/PublicFooter";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { OpeningHoursSection } from "./OpeningHoursSection";

export function LandingPage() {
  const { data: settings } = usePublicSettings();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const { data: pageContent } = useQuery({
    queryKey: ["public", "page-content"],
    queryFn: fetchPublicPageContent,
    staleTime: 60_000,
  });
  const { data: hours } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-page))] text-[rgb(var(--color-text-primary))]">
      <div className="sticky top-0 z-50">
        <ClosedBanner />
        <PublicNav active="home" onOpenCart={() => setCartOpen(true)} />
      </div>

      <main>
        <HeroSection hero={pageContent?.HERO} settings={settings} />
        <InfoBar />
        <AboutSection about={pageContent?.ABOUT} />
        <OpeningHoursSection hours={hours} />
        <ContactSection settings={settings} />
      </main>

      <PublicFooter />

      <CartBottomSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={() => navigate("/checkout")}
        onUpsellAdd={() => {
          setCartOpen(false);
          navigate("/menu");
        }}
      />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
