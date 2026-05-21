import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import type { PageContentDto } from "@/shared/api/pageContentApi";
import type { SettingsDto } from "@/shared/api/settingsApi";

interface Props {
  hero: PageContentDto | undefined;
  settings: SettingsDto | undefined;
}

function resolveKicker(settings: SettingsDto | undefined): string | null {
  const name = settings?.name?.trim();
  const city = settings?.city?.trim();
  if (name && city) return `${name.toUpperCase()} · ${city.toUpperCase()}`;
  if (city) return city.toUpperCase();
  if (settings?.tagline?.trim()) return settings.tagline.trim().toUpperCase();
  return null;
}

const PRIMARY_LINK_CLASSES =
  "inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[rgb(var(--color-primary))] px-7 text-[15px] font-semibold leading-none text-white transition-colors hover:bg-[rgb(var(--color-primary-hover))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] md:text-[16px]";

const GHOST_LINK_CLASSES =
  "inline-flex h-14 items-center justify-center gap-2 rounded-md border border-[rgb(var(--color-border-card))] bg-transparent px-7 text-[15px] font-semibold leading-none text-[rgb(var(--color-text-primary))] transition-colors hover:border-[rgb(var(--color-border-strong))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] md:text-[16px]";

export function HeroSection({ hero, settings }: Props) {
  const title = hero?.title ?? settings?.name ?? "Zapraszamy";
  const body = hero?.body ?? settings?.tagline ?? "";
  const imageUrl = hero?.imageUrl;
  const ctaLabel = hero?.ctaLabel ?? "Zamów online";
  const ctaHref = hero?.ctaHref ?? "/menu";
  const kicker = resolveKicker(settings);
  const isInternalCta = ctaHref.startsWith("/");
  const hasPhone = !!settings?.phone;

  const primaryCta = isInternalCta ? (
    <Link to={ctaHref} className={PRIMARY_LINK_CLASSES}>
      {ctaLabel} →
    </Link>
  ) : (
    <a href={ctaHref} className={PRIMARY_LINK_CLASSES}>
      {ctaLabel} →
    </a>
  );

  const secondaryCta = hasPhone ? (
    <a href={`tel:${settings!.phone}`} className={GHOST_LINK_CLASSES}>
      <span aria-hidden="true">📞</span>
      <span>Zadzwoń</span>
    </a>
  ) : (
    <Link to="/menu" className={GHOST_LINK_CLASSES}>
      Zobacz menu →
    </Link>
  );

  const titleNode = (
    <>
      {title}
      <span className="text-[rgb(var(--color-primary))]">.</span>
    </>
  );

  const textContent = (
    <>
      {kicker ? (
        <div className="t-kicker t-kicker--accent">{kicker}</div>
      ) : null}
      <h1
        className={cn(
          "text-[36px] font-black leading-[1.05] tracking-[-0.025em] text-[rgb(var(--color-text-primary))]",
          "md:text-[60px] md:leading-[1.0] md:tracking-[-0.03em]",
          "lg:text-[72px]"
        )}
      >
        {titleNode}
      </h1>
      {body ? (
        <p className="max-w-[440px] whitespace-pre-line text-[15px] leading-[1.55] text-[rgb(var(--color-text-body))] md:text-[18px] md:leading-[1.6]">
          {body}
        </p>
      ) : null}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
        {primaryCta}
        {secondaryCta}
      </div>
    </>
  );

  return (
    <section className="relative isolate overflow-hidden bg-[rgb(var(--color-bg-page))]">
      {/* Mobile: image-top + text-below stacked */}
      <div className="md:hidden">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-7 pb-10 pt-8">
            {imageUrl ? (
              <div className="overflow-hidden rounded-[10px] border border-[rgb(var(--color-border-card))]">
                <img
                  src={imageUrl}
                  alt={title}
                  className="aspect-[4/3] w-full object-cover"
                  loading="eager"
                />
              </div>
            ) : null}
            <div className="space-y-5">{textContent}</div>
          </div>
        </div>
      </div>

      {/* Desktop: split 50/50 — cream left, full-bleed image right */}
      <div className="hidden md:grid md:h-[calc(100vh-4rem)] md:min-h-[560px] md:max-h-[820px] md:grid-cols-2">
        <div className="public-hero-copy-shell flex items-center bg-[rgb(var(--color-bg-card))] py-16">
          <div className="w-full max-w-[560px] space-y-6">
            {textContent}
          </div>
        </div>
        <div className="relative bg-[rgb(var(--color-bg-card))]">
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
