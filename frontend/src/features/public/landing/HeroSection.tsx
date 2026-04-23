import { Clock, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import type { PageContentDto } from "@/shared/api/pageContentApi";
import type { SettingsDto } from "@/shared/api/settingsApi";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";
import { cn } from "@/shared/lib/cn";

interface Props {
  hero: PageContentDto | undefined;
  settings: SettingsDto | undefined;
}

function resolveKicker(settings: SettingsDto | undefined): string | null {
  if (settings?.tagline && settings.tagline.trim().length > 0) {
    return settings.tagline.trim();
  }
  if (settings?.city && settings.city.trim().length > 0) {
    return settings.city.trim();
  }
  return null;
}

function resolveTodayLabel(
  openState: ReturnType<typeof useIsRestaurantOpen>
): string | null {
  if (openState.isLoading) return null;
  if (!openState.todayHours || openState.todayHours.closed) {
    return "Dziś zamknięte";
  }
  if (openState.isOpen && openState.todayHours.closeTime) {
    return `Dziś otwarte do ${openState.todayHours.closeTime}`;
  }
  if (openState.todayHours.openTime && openState.todayHours.closeTime) {
    return `Dziś ${openState.todayHours.openTime} – ${openState.todayHours.closeTime}`;
  }
  return null;
}

const PRIMARY_LINK_CLASSES =
  "inline-flex h-16 items-center justify-center gap-2 rounded-md bg-primary px-7 text-[17px] font-semibold text-white transition-colors hover:brightness-95 active:brightness-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

const GHOST_LINK_CLASSES =
  "inline-flex h-16 items-center justify-center gap-2 rounded-md bg-transparent px-7 text-[17px] font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

export function HeroSection({ hero, settings }: Props) {
  const title = hero?.title ?? settings?.name ?? "Zapraszamy";
  const body = hero?.body ?? settings?.tagline ?? "";
  const imageUrl = hero?.imageUrl;
  const ctaLabel = hero?.ctaLabel ?? "Zamów online";
  const ctaHref = hero?.ctaHref ?? "/menu";
  const kicker = resolveKicker(settings);
  const openState = useIsRestaurantOpen();
  const todayLabel = resolveTodayLabel(openState);
  const isInternalCta = ctaHref.startsWith("/");

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-8 pb-12 pt-8 md:grid-cols-12 md:items-end md:gap-10 md:pb-20 md:pt-16">
          {imageUrl ? (
            <div className="order-1 md:order-2 md:col-span-7">
              <img
                src={imageUrl}
                alt={title}
                className="aspect-[16/10] w-full rounded-2xl object-cover shadow-sm md:aspect-[4/5]"
                loading="eager"
              />
            </div>
          ) : null}
          <div
            className={cn(
              "order-2 space-y-6 md:order-1 md:col-span-5 md:space-y-7",
              !imageUrl && "md:col-span-12"
            )}
          >
            {kicker ? (
              <div className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
                {kicker}
              </div>
            ) : null}
            <h1 className="text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-slate-900 md:text-[56px] md:leading-[1.02] lg:text-[72px] lg:leading-[1.0]">
              {title}
            </h1>
            {body ? (
              <p className="max-w-[440px] whitespace-pre-line text-[16px] leading-relaxed text-slate-600 md:text-[17px]">
                {body}
              </p>
            ) : null}
            <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
              {isInternalCta ? (
                <Link to={ctaHref} className={PRIMARY_LINK_CLASSES}>
                  {ctaLabel} →
                </Link>
              ) : (
                <a href={ctaHref} className={PRIMARY_LINK_CLASSES}>
                  {ctaLabel} →
                </a>
              )}
              <Link to="/menu" className={GHOST_LINK_CLASSES}>
                Zobacz menu
              </Link>
            </div>
            {todayLabel ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-[13px] text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" strokeWidth={1.75} />
                  <span>{todayLabel}</span>
                </div>
                <div className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                <div className="inline-flex items-center gap-2">
                  <Truck className="h-4 w-4" strokeWidth={1.75} />
                  <span>Dostawa w ~35 min</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
