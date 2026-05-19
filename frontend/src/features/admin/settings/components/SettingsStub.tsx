import type { ReactNode } from "react";

interface SettingsStubProps {
  icon: ReactNode;
  bodyTitle?: string;
  bodyText: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  leadText?: string;
}

// Bundle settings-shared.jsx L277-314 (S.StubSection) — reusable layout for
// the 3 "Wkrótce" sections + temporary placeholders for sections still in
// development (M-035..M-039 will replace those).
export function SettingsStub({
  icon,
  bodyTitle = "🚧 W przygotowaniu",
  bodyText,
  ctaLabel,
  onCtaClick,
  leadText,
}: SettingsStubProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto p-8">
        {leadText && (
          <p
            className="m-0 mb-6 max-w-[640px] text-[14px]"
            style={{
              color: "rgb(var(--color-text-muted))",
              lineHeight: 1.55,
            }}
          >
            {leadText}
          </p>
        )}
        <div
          className="mx-auto max-w-[680px] rounded-xl"
          style={{
            background: "rgb(var(--color-bg-card))",
            border: "1px dashed rgb(var(--color-border-card))",
            padding: "60px 32px",
          }}
        >
          <div className="mx-auto flex max-w-[460px] flex-col items-center text-center">
            <div className="mb-[18px]" style={{ color: "#D4D0C2" }} aria-hidden>
              {icon}
            </div>
            <div
              className="mb-2.5 text-[18px] font-semibold"
              style={{
                color: "rgb(var(--color-text-body))",
                letterSpacing: "-0.01em",
              }}
            >
              {bodyTitle}
            </div>
            <p
              className="m-0 text-[14px]"
              style={{
                color: "rgb(var(--color-text-muted))",
                lineHeight: 1.6,
              }}
            >
              {bodyText}
            </p>
            {ctaLabel && (
              <button
                type="button"
                onClick={onCtaClick}
                className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-[13px] font-semibold"
                style={{
                  border: "1px solid rgb(var(--color-border-card))",
                  background: "rgb(var(--color-bg-card))",
                  color: "rgb(var(--color-text-body))",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {ctaLabel}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
