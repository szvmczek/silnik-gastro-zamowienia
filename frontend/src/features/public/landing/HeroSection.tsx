import { Clock, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import type { PageContentDto } from "@/shared/api/pageContentApi";
import type { SettingsDto } from "@/shared/api/settingsApi";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";

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

  const primaryCta = isInternalCta ? (
    <Link to={ctaHref} className={PRIMARY_LINK_CLASSES}>
      {ctaLabel} →
    </Link>
  ) : (
    <a href={ctaHref} className={PRIMARY_LINK_CLASSES}>
      {ctaLabel} →
    </a>
  );

  const textContent = (
    <>
      {kicker ? (
        <div className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          {kicker}
        </div>
      ) : null}
      <h1 className="text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-slate-900 md:text-[52px] md:leading-[1.02] lg:text-[60px] lg:leading-[1.0]">
        {title}
      </h1>
      {body ? (
        <p className="max-w-[440px] whitespace-pre-line text-[16px] leading-relaxed text-slate-600 md:text-[17px]">
          {body}
        </p>
      ) : null}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
        {primaryCta}
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
    </>
  );

  return (
    <section className="relative isolate overflow-hidden bg-white">
      {/* Mobile: unchanged image-top + text-below layout */}
      <div className="md:hidden">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 pb-12 pt-8">
            {imageUrl ? (
              <div>
                <img
                  src={imageUrl}
                  alt={title}
                  className="aspect-[16/10] w-full rounded-2xl object-cover shadow-sm"
                  loading="eager"
                />
              </div>
            ) : null}
            <div className="space-y-6">{textContent}</div>
          </div>
        </div>
      </div>

      {/* Desktop: split screen 50/50 — cream left, full-bleed image right */}
      <div className="hidden md:grid md:h-[calc(100vh-4rem)] md:min-h-[560px] md:max-h-[820px] md:grid-cols-2">
        <div className="flex items-center bg-[#faf7f2] px-8 py-16 lg:px-12">
          <div className="w-full max-w-[520px] space-y-7 md:ml-auto md:pr-2 lg:pr-6">
            {textContent}
          </div>
        </div>
        <div className="relative bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
