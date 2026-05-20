import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";

const STORAGE_KEY = "cookie_consent_dismissed";

export function CookieConsentBanner() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }

    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== "true");
    } catch {
      setVisible(true);
    }
  }, [isAdmin]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Brak localStorage nie powinien blokować zamknięcia bannera w sesji.
    }
    setVisible(false);
  };

  if (!visible || isAdmin) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[70] rounded-2xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-4 shadow-[var(--shadow-lg)] md:left-auto md:right-5 md:max-w-[430px]"
      style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] leading-relaxed text-[rgb(var(--color-text-body))]">
          Używamy tylko niezbędnych danych lokalnych do działania koszyka i panelu.
          Szczegóły znajdziesz w{" "}
          <Link
            to="/privacy"
            className="font-semibold text-[rgb(var(--color-primary))] underline underline-offset-2"
          >
            polityce prywatności
          </Link>
          .
        </p>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={dismiss}
          className="min-h-11 shrink-0"
        >
          Rozumiem
        </Button>
      </div>
    </aside>
  );
}
