import type { ReactNode } from "react";
import { SettingsTabs } from "./SettingsTabs";

interface SettingsShellProps {
  description?: string;
  children: ReactNode;
}

export function SettingsShell({ description, children }: SettingsShellProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="kicker">Konfiguracja</div>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-slate-900">
          Ustawienia
        </h1>
        {description && (
          <p className="mt-2 max-w-[640px] text-[14px] text-slate-500">{description}</p>
        )}
      </div>
      <SettingsTabs />
      {children}
    </div>
  );
}
