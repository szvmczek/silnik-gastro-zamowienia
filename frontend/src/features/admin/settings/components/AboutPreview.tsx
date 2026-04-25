interface AboutPreviewProps {
  title: string;
  body: string;
  imageUrl?: string;
}

export function AboutPreview({ title, body, imageUrl }: AboutPreviewProps) {
  const safeTitle = title.trim() || "Nagłówek sekcji…";
  const safeBody = body.trim() || "Tekst pojawi się po wpisaniu treści.";

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
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
      <div className="p-5">
        <div className="kicker mb-2">O nas</div>
        <div className="mb-2 text-[15px] font-semibold tracking-tight text-slate-900 line-clamp-2">
          {safeTitle}
        </div>
        <p className="whitespace-pre-line text-[12px] leading-relaxed text-slate-600 line-clamp-8">
          {safeBody}
        </p>
      </div>
    </div>
  );
}
