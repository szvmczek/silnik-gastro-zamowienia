import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicOpeningHours } from "@/shared/api/openingHoursApi";
import { fetchPublicPageContent } from "@/shared/api/pageContentApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { usePublicMenu } from "@/features/public/menu/hooks/usePublicMenu";
import { formatPrice, minVariantPrice } from "@/features/public/menu/lib/formatPrice";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { PiecFooter } from "@/features/public/shared/PiecFooter";
import { CartPill } from "@/features/public/shared/CartPill";
import { PiecLinkButton } from "@/features/public/shared/PiecButton";
import { OpenStatusLine } from "./OpenStatusLine";
import { DeliveryZonesSection } from "./DeliveryZonesSection";
import { OpeningHoursSection } from "./OpeningHoursSection";
import { ContactSection } from "./ContactSection";
import { AboutSection } from "./AboutSection";

/** Ile kart trafia do pasa „Najczęściej zamawiane". */
const FEATURED_COUNT = 4;

export function LandingPage() {
  const { data: settings } = usePublicSettings();
  const { data: menu } = usePublicMenu();
  const infoRef = useRef<HTMLDivElement>(null);

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

  const hero = pageContent?.HERO;
  const name = settings?.name ?? "";
  const tagline = settings?.tagline ?? null;

  // Brak pola „popularne" w modelu i nie dokładamy go (YAGNI) — bierzemy
  // pierwsze dostępne pozycje w kolejności menu, czyli to, co restauracja
  // sama wystawiła najwyżej.
  const featured = (menu?.categories ?? [])
    .flatMap((category) => category.products)
    .filter((product) => product.available)
    .slice(0, FEATURED_COUNT);

  return (
    <>
      {/* Hero — zdjęcie na pełny ekran z powolnym driftem, jak w paczce. */}
      <section className="relative h-[clamp(600px,94vh,820px)] overflow-hidden">
        {hero?.imageUrl ? (
          <img
            src={hero.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover [object-position:center_45%] motion-safe:animate-piec-drift"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-piec-bg from-[3%] via-piec-bg/45 to-piec-bg/55" />

        <PiecShell className="relative flex items-center justify-between gap-3 py-4">
          <span className="font-display text-[22px] tracking-[3px]">{name}</span>
          <CartPill emptyVariant="phone" />
        </PiecShell>

        <div className="absolute inset-x-0 bottom-0 pb-8">
          <PiecShell>
            <OpenStatusLine />
            <h1 className="mt-2 font-display text-[clamp(76px,19vw,168px)] leading-[0.95] tracking-[2px]">
              {name}
            </h1>
            {tagline ? (
              <p className="text-[12.5px] font-semibold uppercase tracking-[2.5px] text-piec-ink/75">
                {tagline}
              </p>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-2.5">
              <PiecLinkButton to="/menu" height={52} className="px-6">
                {hero?.ctaLabel?.toUpperCase() ?? "PRZEJDŹ DO MENU"}
              </PiecLinkButton>
              <button
                type="button"
                onClick={() => infoRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex min-h-[52px] items-center rounded-xl border-[1.5px] border-piec-ink/35 px-5 text-[14.5px] font-semibold text-piec-ink/90 transition-colors hover:border-primary hover:text-primary"
              >
                Dostawa i godziny
              </button>
            </div>
          </PiecShell>
        </div>
      </section>

      {/* Najczęściej zamawiane — poziomy pas kart. */}
      {featured.length > 0 ? (
        <section className="pb-2 pt-10">
          <PiecShell className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[clamp(28px,5.5vw,42px)] tracking-[1px]">
              Najczęściej zamawiane
            </h2>
            <Link
              to="/menu"
              className="flex min-h-[44px] shrink-0 items-center text-sm font-semibold text-primary"
            >
              całe menu →
            </Link>
          </PiecShell>
          <PiecShell className="flex gap-3.5 overflow-x-auto pb-2 pt-4 [scrollbar-width:none]">
            {featured.map((product) => {
              const from = minVariantPrice(product.variants) ?? product.basePrice;
              const hasChoice = product.variants.length > 1;
              return (
                <Link
                  key={product.id}
                  to={`/menu/${product.slug}`}
                  className="w-[238px] flex-none"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="block aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_10px_26px_rgba(0,0,0,0.4)]"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full rounded-2xl bg-piec-surface2" />
                  )}
                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <span className="font-display text-[19px] tracking-[0.6px]">
                      {product.name}
                    </span>
                    <span className="whitespace-nowrap text-[14.5px] font-bold text-primary">
                      {/* D-07: „od" tylko gdy jest z czego wybierać. */}
                      {hasChoice ? "od " : ""}
                      {formatPrice(from, settings?.currency)}
                    </span>
                  </div>
                  {product.description ? (
                    <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45] text-piec-ink/60">
                      {product.description}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </PiecShell>
        </section>
      ) : null}

      {pageContent?.ABOUT?.active !== false ? <AboutSection about={pageContent?.ABOUT} /> : null}

      <div ref={infoRef}>
        <OpeningHoursSection hours={hours} />
      </div>
      <DeliveryZonesSection />
      <ContactSection settings={settings} />

      <PiecFooter />
    </>
  );
}
