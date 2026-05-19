import { useNavigate } from "react-router-dom";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SettingsStub } from "../components/SettingsStub";

function GaugeIcon() {
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
      <path d="M12 22a10 10 0 1 1 10-10" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M13.4 10.6 17 7" />
    </svg>
  );
}

export function CapacitySection() {
  const navigate = useNavigate();
  return (
    <>
      <AdminTopbar title="Limity zamówień" />
      <SettingsStub
        icon={<GaugeIcon />}
        leadText="Sterowanie obciążeniem kuchni — automatyczne ETA i blokady."
        bodyText="Maksymalna liczba aktywnych zamówień, automatyczne rozszerzanie ETA przy peak hour, blokada nowych zamówień przy przeciążeniu. Dostępne w przyszłej aktualizacji. W MVP używaj Tymczasowego zamknięcia w sekcji Operacje gdy potrzebujesz pauzy."
        ctaLabel="Otwórz Operacje"
        onCtaClick={() => navigate("/admin/settings/operations")}
      />
    </>
  );
}
