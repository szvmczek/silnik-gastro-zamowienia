import type { StatusTheme } from "./statusColors";

interface SectionHeaderProps {
  title: string;
  count: number | null;
  theme: StatusTheme;
}

export function SectionHeader({ title, count, theme }: SectionHeaderProps) {
  return (
    <header
      className={`mb-3 flex items-center gap-3 rounded-md px-3 py-2 ${theme.sectionBg}`}
    >
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {count !== null && (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold ${theme.badgeBg} ${theme.badgeText}`}
        >
          {count}
        </span>
      )}
    </header>
  );
}
