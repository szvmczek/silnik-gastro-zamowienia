import type { PageContentDto } from "@/shared/api/pageContentApi";

interface Props {
  about: PageContentDto | undefined;
}

/* AboutSection — F-007 retrofit pod bundle Stage 2 landing-shared.jsx
   AboutSection. Stats trio (8 lat / 40+ pozycji / 35 min) pominięte
   świadomie — AD-Δ5 (backend gap: PageContentDto bez stats fields).
   Mobile image hidden (bundle pattern, oszczędność miejsca). */

export function AboutSection({ about }: Props) {
  if (!about) return null;

  return (
    <section
      id="about"
      className="border-t border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] py-12 md:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
          {about.imageUrl ? (
            <div className="hidden md:col-span-5 md:block">
              <img
                src={about.imageUrl}
                alt={about.title}
                className="aspect-[4/3] w-full rounded-[12px] border border-[rgb(var(--color-border-card))] object-cover"
                loading="lazy"
              />
            </div>
          ) : null}
          <div className={about.imageUrl ? "md:col-span-7" : "md:col-span-12"}>
            <div className="t-kicker t-kicker--accent mb-3">O NAS</div>
            <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[rgb(var(--color-text-primary))] md:text-[44px]">
              {about.title}
              <span className="text-[rgb(var(--color-primary))]">.</span>
            </h2>
            <div className="mt-5 max-w-[480px] space-y-4 text-[15px] leading-[1.6] text-[rgb(var(--color-text-body))] md:mt-6 md:text-[17px]">
              <p className="whitespace-pre-line">{about.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
