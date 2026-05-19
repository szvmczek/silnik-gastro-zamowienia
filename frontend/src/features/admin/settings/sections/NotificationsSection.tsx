import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SettingsStub } from "../components/SettingsStub";

function BellIcon() {
  return (
    <svg
      width={64}
      height={64}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function NotificationsSection() {
  return (
    <>
      <AdminTopbar title="Powiadomienia" />
      <SettingsStub
        icon={<BellIcon />}
        leadText="Konfiguracja alertów dla zespołu kuchni, dostawy i właściciela."
        bodyText="Konfiguracja alertów email, browser push i dziennego podsumowania trafi tutaj. Dostępne w przyszłej aktualizacji. W MVP używamy dźwięków w panelu (toggle w prawym górnym rogu) i toastów w przeglądarce."
      />
    </>
  );
}
