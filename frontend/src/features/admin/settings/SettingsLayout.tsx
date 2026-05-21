import { Outlet } from "react-router-dom";
import { useAdminOutletContext } from "@/features/admin/layout/AdminLayout";
import { SettingsNav } from "./components/SettingsNav";

// Master-detail shell per D-005 + bundle settings-shared.jsx L316-346
// (S.SettingsFrame). Each section renders its own AdminTopbar (per F-025
// portal pattern) — SettingsLayout itself does NOT render the topbar.
//
// Desktop (md+): 240px left rail + section <Outlet />.
// Mobile (<md): nav stacks above content (D-014 accordion+dropdown deferred
// to Warstwa 6 — PHASE5_FINDINGS #22).
//
// Re-passes AdminLayout outlet context down so section topbars work
// via portal (nested Outlet doesn't auto-forward).
export function SettingsLayout() {
  const adminCtx = useAdminOutletContext();
  return (
    <div className="-m-4 flex flex-col md:-m-8 md:h-[calc(100vh-56px)] md:flex-row md:overflow-hidden">
      <SettingsNav className="md:overflow-y-auto" />
      <section className="flex min-w-0 flex-1 flex-col md:overflow-hidden">
        <Outlet context={adminCtx} />
      </section>
    </div>
  );
}
