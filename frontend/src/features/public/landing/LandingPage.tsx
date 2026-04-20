import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicOpeningHours } from "@/shared/api/openingHoursApi";
import { fetchPublicPageContent } from "@/shared/api/pageContentApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CartButton } from "@/features/public/cart/CartButton";
import { CartDrawer } from "@/features/public/cart/CartDrawer";
import { MobileCartBar } from "@/features/public/cart/MobileCartBar";
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
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.name ?? "Logo"}
                className="h-8 w-8 rounded object-cover"
              />
            ) : null}
            <span className="text-lg font-semibold text-slate-900">
              {settings?.name ?? "Restauracja"}
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600 sm:gap-6">
            <a href="#about" className="hidden hover:text-primary sm:inline">
              O nas
            </a>
            <a href="#hours" className="hidden hover:text-primary sm:inline">
              Godziny
            </a>
            <a href="#contact" className="hidden hover:text-primary sm:inline">
              Kontakt
            </a>
            <Link to="/menu" className="hover:text-primary">
              Menu
            </Link>
            <CartButton onClick={() => setCartOpen(true)} />
          </nav>
        </div>
      </header>

      <main>
        <HeroSection hero={pageContent?.HERO} settings={settings} />
        <AboutSection about={pageContent?.ABOUT} />
        <OpeningHoursSection hours={hours} />
        <ContactSection settings={settings} />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 pb-24 md:pb-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row">
          <span>© {new Date().getFullYear()} {settings?.name ?? "Restauracja"}</span>
          <Link to="/admin/login" className="hover:text-primary">
            Panel administratora
          </Link>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
