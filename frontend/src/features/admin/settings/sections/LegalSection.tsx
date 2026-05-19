import { useState } from "react";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { SettingsStub } from "../components/SettingsStub";

function ScaleIcon() {
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
      <path d="M12 3v18" />
      <path d="M5 21h14" />
      <path d="M16 3l-4 6" />
      <path d="M8 3l4 6" />
      <path d="M3 12l4-7 4 7a4 4 0 0 1-8 0z" />
      <path d="M13 12l4-7 4 7a4 4 0 0 1-8 0z" />
    </svg>
  );
}

const DEFAULT_CONSENT_COPY = `Składając zamówienie potwierdzam, że zapoznałem(am) się z Regulaminem oraz Polityką prywatności. Wyrażam zgodę na przetwarzanie moich danych osobowych (imię, telefon, adres) przez restaurację w celu realizacji zamówienia, na podstawie art. 6 ust. 1 lit. b RODO. Dane są przechowywane przez okres niezbędny do realizacji zamówienia i ewentualnej obsługi reklamacji.

Administrator danych: [nazwa restauracji ustawiana w Ogólne].

Mam prawo do dostępu, sprostowania, usunięcia, ograniczenia przetwarzania, sprzeciwu oraz przenoszenia danych. Skargę mogę złożyć do Prezesa UODO.`;

export function LegalSection() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminTopbar title="RODO i regulaminy" />
      <SettingsStub
        icon={<ScaleIcon />}
        leadText="Dokumenty prawne wyświetlane w stopce i przy checkout."
        bodyText="Linki do regulaminu, polityki prywatności, custom tekst zgody RODO przy zamówieniu. Dostępne w przyszłej aktualizacji. W MVP klient akceptuje regulamin przy checkout — domyślny tekst zgody jest hardcoded i zgodny z polskim prawem."
        ctaLabel="Zobacz domyślny tekst zgody"
        onCtaClick={() => setOpen(true)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Domyślny tekst zgody RODO</DialogTitle>
            <DialogDescription>
              Tekst pokazywany klientowi przy składaniu zamówienia w MVP.
            </DialogDescription>
          </DialogHeader>
          <div
            className="whitespace-pre-line rounded-md p-4 text-[13px] leading-relaxed"
            style={{
              background: "rgb(var(--color-bg-section))",
              color: "rgb(var(--color-text-body))",
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {DEFAULT_CONSENT_COPY}
          </div>
          <DialogFooter>
            <Button type="button" variant="primary" onClick={() => setOpen(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
