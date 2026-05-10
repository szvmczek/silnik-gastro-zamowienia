/* section-stubs.jsx
   Settings → 3 stub sections (Powiadomienia, Limity zamówień, RODO i regulaminy).
   Each uses the unified S.StubSection layout with a 64px Lucide-style icon,
   "🚧 W przygotowaniu" title, "Dostępne w przyszłej aktualizacji" body. */

const A = window.A;
const S = window.S;

/* 64px stroke=1.4 icons (Lucide-flavored) */
const StubIcon = ({ d, fill = "none" }) => (
  <svg width={64} height={64} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  bell: <StubIcon d={[
    "M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z",
    "M10 21a2 2 0 0 0 4 0"
  ]} />,
  gauge: <StubIcon d={[
    "M12 22a10 10 0 1 1 10-10","M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z","M13.4 10.6 17 7"
  ]} />,
  scale: <StubIcon d={[
    "M12 3v18","M5 21h14","M16 3l-4 6","M8 3l4 6","M3 12l4-7 4 7a4 4 0 0 1-8 0z","M13 12l4-7 4 7a4 4 0 0 1-8 0z"
  ]} />
};

/* Three stub frames — each calls S.StubSection */
const SectionNotifications = () => (
  <S.StubSection
    icon={ICONS.bell}
    title={{
      label: "Powiadomienia",
      sub: "Konfiguracja alertów dla zespołu kuchni, dostawy i właściciela."
    }}
    body={{
      title: "🚧 W przygotowaniu",
      text: "Konfiguracja alertów email, browser push i dziennego podsumowania trafi tutaj. Dostępne w przyszłej aktualizacji. W MVP używamy dźwięków w panelu (toggle w prawym górnym rogu) i toastów w przeglądarce."
    }}
  />
);

const SectionCapacity = () => (
  <S.StubSection
    icon={ICONS.gauge}
    title={{
      label: "Limity zamówień",
      sub: "Sterowanie obciążeniem kuchni — automatyczne ETA i blokady."
    }}
    body={{
      title: "🚧 W przygotowaniu",
      text: "Maksymalna liczba aktywnych zamówień, automatyczne rozszerzanie ETA przy peak hour, blokada nowych zamówień przy przeciążeniu. Dostępne w przyszłej aktualizacji. W MVP używaj Tymczasowego zamknięcia w sekcji Operacje gdy potrzebujesz pauzy."
    }}
    cta="Otwórz Operacje"
  />
);

const SectionLegal = () => (
  <S.StubSection
    icon={ICONS.scale}
    title={{
      label: "RODO i regulaminy",
      sub: "Dokumenty prawne wyświetlane w stopce i przy checkout."
    }}
    body={{
      title: "🚧 W przygotowaniu",
      text: "Linki do regulaminu, polityki prywatności, custom tekst zgody RODO przy zamówieniu. Dostępne w przyszłej aktualizacji. W MVP klient akceptuje regulamin przy checkout — domyślny tekst zgody jest hardcoded i zgodny z polskim prawem."
    }}
    cta="Zobacz domyślny tekst zgody"
  />
);

window.SectionNotifications = SectionNotifications;
window.SectionCapacity = SectionCapacity;
window.SectionLegal = SectionLegal;
