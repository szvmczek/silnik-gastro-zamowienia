import type { PageContentDto } from "@/shared/api/pageContentApi";

interface Props {
  about: PageContentDto | undefined;
}

export function AboutSection({ about }: Props) {
  if (!about) return null;

  return (
    <section id="about" className="bg-[#faf7f2] py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          {about.imageUrl ? (
            <div className="md:col-span-5">
              <img
                src={about.imageUrl}
                alt={about.title}
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-sm"
                loading="lazy"
              />
            </div>
          ) : null}
          <div className="md:col-span-6 md:col-start-7 md:pt-8">
            <div className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
              O nas
            </div>
            <h2 className="mb-6 text-[28px] font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-[40px] md:leading-[1.05]">
              {about.title}
            </h2>
            <div className="max-w-[540px] space-y-5 text-[16px] leading-[1.75] text-slate-600">
              <p className="whitespace-pre-line">{about.body}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
