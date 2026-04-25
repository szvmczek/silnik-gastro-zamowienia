interface HeroPreviewProps {
  title: string;
  body: string;
  imageUrl?: string;
  ctaLabel?: string;
}

export function HeroPreview({ title, body, imageUrl, ctaLabel }: HeroPreviewProps) {
  const safeTitle = title.trim() || "Tytuł sekcji…";
  const safeBody = body.trim() || "Treść pojawi się po wpisaniu opisu.";
  const safeCta = (ctaLabel ?? "").trim() || "Zamów online";

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="aspect-[4/3] w-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div
            className="aspect-[4/3] w-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)",
            }}
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/45 to-transparent p-5">
          <div className="text-[20px] font-semibold leading-tight tracking-tight text-white line-clamp-3">
            {safeTitle}
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[13px] leading-relaxed text-slate-700 line-clamp-5">
          {safeBody}
        </p>
        <button
          type="button"
          tabIndex={-1}
          className="mt-4 h-10 w-full rounded-md bg-primary text-[13px] font-medium text-white"
        >
          {safeCta}
        </button>
      </div>
    </div>
  );
}
