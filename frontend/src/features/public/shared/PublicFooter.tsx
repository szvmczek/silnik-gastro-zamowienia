import { Link } from "react-router-dom";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";

export function PublicFooter() {
  const { data: settings } = usePublicSettings();
  const year = new Date().getFullYear();
  const name = settings?.name ?? "Restauracja";

  return (
    <footer className="border-t border-slate-200 bg-white py-10 pb-24 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-[13px] text-slate-500 md:flex-row md:px-8">
        <div>
          © {year} {name}. Wszystkie prawa zastrzeżone.
        </div>
        <div className="flex items-center gap-5">
          <span className="cursor-default text-slate-500">Regulamin</span>
          <span className="cursor-default text-slate-500">
            Polityka prywatności
          </span>
          <Link
            to="/admin/login"
            className="text-[12px] text-slate-400 transition-colors hover:text-slate-600"
          >
            Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
