import type { PageContentDto } from "@/shared/api/pageContentApi";
import type { SettingsDto } from "@/shared/api/settingsApi";

interface Props {
  hero: PageContentDto | undefined;
  settings: SettingsDto | undefined;
}

export function HeroSection({ hero, settings }: Props) {
  const title = hero?.title ?? settings?.name ?? "Zapraszamy";
  const body = hero?.body ?? settings?.tagline ?? "";
  const imageUrl = hero?.imageUrl;
  const ctaLabel = hero?.ctaLabel;
  const ctaHref = hero?.ctaHref;

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="space-y-6">
          {settings?.tagline && (
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {settings.tagline}
            </span>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {title}
          </h1>
          {body && (
            <p className="whitespace-pre-line text-lg leading-relaxed text-slate-600">
              {body}
            </p>
          )}
          {ctaLabel && ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-white shadow-sm transition-colors hover:brightness-95"
            >
              {ctaLabel}
            </a>
          )}
        </div>
        {imageUrl && (
          <div className="relative">
            <img
              src={imageUrl}
              alt={title}
              className="h-72 w-full rounded-xl object-cover shadow-lg md:h-[420px]"
              loading="eager"
            />
          </div>
        )}
      </div>
    </section>
  );
}
