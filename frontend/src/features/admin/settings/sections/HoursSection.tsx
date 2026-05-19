import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SettingsStub } from "../components/SettingsStub";

function ClockIcon() {
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
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Placeholder do zastąpienia w M-036 (bundle: v2-stage4/section-hours.jsx).
export function HoursSection() {
  return (
    <>
      <AdminTopbar title="Godziny otwarcia" />
      <SettingsStub
        icon={<ClockIcon />}
        bodyTitle="Sekcja w przygotowaniu"
        bodyText="Harmonogram tygodniowy (7 dni × toggle + time pickers + copy-to-day) pojawi się w M-036. Bundle referencja: docs/design/v2-stage4/section-hours.jsx."
      />
    </>
  );
}
