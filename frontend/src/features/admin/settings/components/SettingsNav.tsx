import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

export interface SettingsSection {
  id: string;
  path: string;
  label: string;
  stub: boolean;
}

// Bundle settings-shared.jsx L11-20 — single source of truth.
// Separator inserted between 5th (operations) and 6th (notifications).
export const SETTINGS_SECTIONS: SettingsSection[] = [
  { id: "general", path: "general", label: "Ogólne", stub: false },
  { id: "hours", path: "hours", label: "Godziny otwarcia", stub: false },
  { id: "content", path: "content", label: "Treści strony", stub: false },
  { id: "zones", path: "zones", label: "Strefy dostawy", stub: false },
  { id: "operations", path: "operations", label: "Operacje", stub: false },
  { id: "notifications", path: "notifications", label: "Powiadomienia", stub: true },
  { id: "capacity", path: "capacity", label: "Limity zamówień", stub: true },
  { id: "legal", path: "legal", label: "RODO i regulaminy", stub: true },
];

interface SettingsNavProps {
  className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col gap-px overflow-y-auto p-3 md:w-60 md:border-r md:border-[rgb(var(--color-border-subtle))] md:p-5",
        className,
      )}
      style={{ background: "rgb(var(--color-bg-page))" }}
      aria-label="Sekcje ustawień"
    >
      <div
        className="px-3 pb-3 text-[11px] font-semibold uppercase"
        style={{
          letterSpacing: "0.08em",
          color: "rgb(var(--color-text-faint))",
        }}
      >
        Ustawienia
      </div>

      {SETTINGS_SECTIONS.map((item, idx) => {
        const prev = idx > 0 ? SETTINGS_SECTIONS[idx - 1] : null;
        const showSeparator = prev !== null && prev.stub === false && item.stub === true;

        return (
          <Fragment key={item.id}>
            {showSeparator && (
              <hr
                aria-hidden
                className="my-2 border-[rgb(var(--color-border-subtle))]"
                style={{ marginLeft: 12, marginRight: 12 }}
              />
            )}
            <NavLink
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-[13.5px] transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                  isActive
                    ? "bg-[rgb(var(--color-primary-tint))] font-semibold text-[rgb(var(--color-primary))]"
                    : "font-medium text-[rgb(var(--color-text-body))] hover:bg-[rgb(var(--color-bg-section))]",
                )
              }
            >
              <span className="flex-1 truncate">{item.label}</span>
              {item.stub && (
                <span
                  className="shrink-0 rounded px-1.5 py-px text-[10px] font-semibold uppercase"
                  style={{
                    letterSpacing: "0.04em",
                    background: "rgba(244, 162, 97, 0.18)",
                    color: "#9A5A1F",
                  }}
                >
                  Wkrótce
                </span>
              )}
            </NavLink>
          </Fragment>
        );
      })}
    </aside>
  );
}
