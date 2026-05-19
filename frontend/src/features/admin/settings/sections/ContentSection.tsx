import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SettingsStub } from "../components/SettingsStub";

function NoteIcon() {
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
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

// Placeholder do zastąpienia w M-037 (bundle: v2-stage4/section-content.jsx).
export function ContentSection() {
  return (
    <>
      <AdminTopbar title="Treści strony" />
      <SettingsStub
        icon={<NoteIcon />}
        bodyTitle="Sekcja w przygotowaniu"
        bodyText="Edycja Hero (toggle + tytuł + subtitle + CTA + tło URL) i sekcji O nas (toggle + body + zdjęcie URL) z live preview pojawi się w M-037. Bundle referencja: docs/design/v2-stage4/section-content.jsx."
      />
    </>
  );
}
