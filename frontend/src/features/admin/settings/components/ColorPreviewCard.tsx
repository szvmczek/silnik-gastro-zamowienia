import { Sparkles } from "lucide-react";

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const FALLBACK = "#FF6B35";

function safeColor(value: string): string {
  return HEX_RE.test(value) ? value : FALLBACK;
}

interface ColorPreviewCardProps {
  color: string;
}

export function ColorPreviewCard({ color }: ColorPreviewCardProps) {
  const c = safeColor(color);
  const tint10 = `${c}1A`;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="kicker mb-4 flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        Podgląd live
      </div>
      <div className="space-y-3">
        <button
          type="button"
          className="inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium text-white shadow-sm"
          style={{ backgroundColor: c }}
          tabIndex={-1}
        >
          Zamów online
        </button>

        <div className="flex items-center justify-center">
          <span
            className="text-[13px] font-medium underline underline-offset-4"
            style={{ color: c }}
          >
            Zobacz całe menu →
          </span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: tint10, color: c }}
          >
            Nowe
          </span>
          <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
            Dostawa
          </span>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="text-[13px] font-medium text-slate-900">Margherita</div>
          <div className="text-[12px] text-slate-500">Klasyka neapolitańska</div>
          <div className="mt-2 flex items-center justify-between">
            <div
              className="font-mono text-[13px] font-semibold"
              style={{ color: c }}
            >
              od 39 zł
            </div>
            <button
              type="button"
              className="h-8 rounded-md px-3 text-[12px] font-medium text-white"
              style={{ backgroundColor: c }}
              tabIndex={-1}
            >
              Dodaj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
