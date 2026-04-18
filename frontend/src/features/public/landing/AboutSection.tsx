import type { PageContentDto } from "@/shared/api/pageContentApi";

interface Props {
  about: PageContentDto | undefined;
}

export function AboutSection({ about }: Props) {
  if (!about) return null;

  return (
    <section id="about" className="bg-slate-50 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
        {about.imageUrl && (
          <img
            src={about.imageUrl}
            alt={about.title}
            className="h-72 w-full rounded-xl object-cover shadow md:h-[420px]"
            loading="lazy"
          />
        )}
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            {about.title}
          </h2>
          <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">
            {about.body}
          </p>
        </div>
      </div>
    </section>
  );
}
