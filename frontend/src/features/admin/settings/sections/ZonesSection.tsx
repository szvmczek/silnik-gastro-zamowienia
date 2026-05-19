import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SettingsStub } from "../components/SettingsStub";

function PinIcon() {
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
      <path d="M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z" />
      <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

// Placeholder do zastąpienia w M-038 (bundle: v2-stage4/section-zones.jsx).
// Istniejąca DeliveryZonesPage (Phase 7) dostępna pod legacy URL
// /admin/delivery-zones (redirect ustawiony w router.tsx).
export function ZonesSection() {
  return (
    <>
      <AdminTopbar title="Strefy dostawy" />
      <SettingsStub
        icon={<PinIcon />}
        bodyTitle="Sekcja w przygotowaniu"
        bodyText="Lista stref dostawy z trybem opłaty (FREE / PAID / UNAVAILABLE), obszarami (cała miejscowość lub kody pocztowe) i edytorem inline pojawi się w M-038. Bundle referencja: docs/design/v2-stage4/section-zones.jsx. Phase 7 backend już istnieje."
      />
    </>
  );
}
