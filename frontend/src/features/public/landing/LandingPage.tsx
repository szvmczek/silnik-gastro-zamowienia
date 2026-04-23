import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicOpeningHours } from "@/shared/api/openingHoursApi";
import { fetchPublicPageContent } from "@/shared/api/pageContentApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CartDrawer } from "@/features/public/cart/CartDrawer";
import { MobileCartBar } from "@/features/public/cart/MobileCartBar";
import { PublicNav } from "@/features/public/shared/PublicNav";
import { PublicFooter } from "@/features/public/shared/PublicFooter";
import { HeroSection } from "./HeroSection";
import { AboutSection } from "./AboutSection";
import { ContactSection } from "./ContactSection";
import { OpeningHoursSection } from "./OpeningHoursSection";

export function LandingPage() {
  const { data: settings } = usePublicSettings();
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
    <div className="min-h-screen bg-white text-slate-900">
      <PublicNav active="home" onOpenCart={() => setCartOpen(true)} />

      <main>
        <HeroSection hero={pageContent?.HERO} settings={settings} />
        <AboutSection about={pageContent?.ABOUT} />
        <OpeningHoursSection hours={hours} />
        <ContactSection settings={settings} />
      </main>

      <PublicFooter />

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
