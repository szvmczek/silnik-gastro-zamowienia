import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SettingsStub } from "../components/SettingsStub";

function SparkIcon() {
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
      <path d="M12 3v4" />
      <path d="M12 17v4" />
      <path d="M3 12h4" />
      <path d="M17 12h4" />
      <path d="M5.6 5.6l2.8 2.8" />
      <path d="M15.6 15.6l2.8 2.8" />
      <path d="M5.6 18.4l2.8-2.8" />
      <path d="M15.6 8.4l2.8-2.8" />
    </svg>
  );
}

// Placeholder do zastąpienia w M-035 (bundle: v2-stage4/section-general.jsx).
export function GeneralSection() {
  return (
    <>
      <AdminTopbar title="Ogólne" />
      <SettingsStub
        icon={<SparkIcon />}
        bodyTitle="Sekcja w przygotowaniu"
        bodyText="Identyfikacja restauracji, kontakt, kolor brandu i live preview pojawią się w M-035. Bundle referencja: docs/design/v2-stage4/section-general.jsx."
      />
    </>
  );
}
