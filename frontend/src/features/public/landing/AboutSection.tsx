import type { PageContentDto } from "@/shared/api/pageContentApi";
import { PiecShell } from "@/features/public/shared/PiecShell";

interface Props {
  about: PageContentDto | undefined;
}

/**
 * Sekcja „o nas" z paczki: dwie kolumny, tekst po lewej, zdjęcie po prawej,
 * bez kickera — nagłówek sam niesie treść.
 *
 * Kafle statystyk z paczki (8 lat / 40+ pozycji) pominięte — nie ma dla
 * nich źródła w bazie, a hardcode łamie CLAUDE.md §8.
 */
export function AboutSection({ about }: Props) {
  if (!about) return null;

  return (
    <section id="about" className="pt-10">
      <PiecShell>
        <div className="grid items-center gap-8 [grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr))]">
          <div>
            <h2 className="font-display text-[clamp(28px,6vw,42px)] leading-[1.1] tracking-[1px]">
              {about.title}
            </h2>
            <p className="mt-3.5 whitespace-pre-line text-[15.5px] leading-[1.7] text-piec-ink/[0.78] [text-wrap:pretty]">
              {about.body}
            </p>
          </div>
          {about.imageUrl ? (
            <img
              src={about.imageUrl}
              alt=""
              loading="lazy"
              className="block aspect-[3/2] w-full rounded-[18px] object-cover"
            />
          ) : null}
        </div>
      </PiecShell>
    </section>
  );
}
