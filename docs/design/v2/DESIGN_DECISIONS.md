# DESIGN_DECISIONS.md — v2 Confident Local

> **Decision log Stage 1-4.** Każda decyzja: co wybrano, alternatywy
> odrzucone, uzasadnienie, implikacje dla implementacji. Format
> ADR-style (jak `AD-XXX` w `docs/ARCHITECTURE.md`), numeracja
> `D-001..D-015`.
>
> **Phase 5 czyta to gdy ma pokusę zrobić inaczej.** Każda decyzja
> jest twardym zapisem — *„rozważyłem A i B, wybrałem A bo X. Nie
> zmieniaj tego bez powodu."*
>
> **Co tu NIE jest:** decyzje o tokenach (padding / radius / font-size)
> — te są w `../tokens.md` i bundle Stage 1. Filozofia projektu —
> linkuj do `../VISUAL_DIRECTION.md`, nie cytuj.

---

### D-001: Confident Local mood

**Decyzja:** off-white `#FAFAF8`, Inter 400-900, primary pomidorowy
`#E63946`, czarny info-bar `#1A1A1A`, kropka jako gest na headlines.

**Alternatywy odrzucone:**
- Włoska trattoria (Inter + Fraunces, kremowy `#F5F1EB`) — pretensjonalne dla osiedlowej pizzerii w Łomiankach.
- Pomarańcz Pyszne (`#FF6B35`) — opatrzony, kojarzy z agregatorem.
- Sterylna biel SaaS (pure white + slate-50) — pizzeria nie jest dashboardem.
- Burgundowy fine-dining (`#B91C1C`) — niezgodny z osiedlem.

**Uzasadnienie:** kierunek z `../VISUAL_DIRECTION.md` §1-§4. Charakter
buduje kontrast wagi i proporcji, nie second font / shadow / gradient.
Off-white z chroma > 0 daje „papierową" jakość bez ciepła trattorii.

**Implikacje dla implementacji:** tokeny `--color-bg-page`,
`--color-primary`, `--color-text-primary` w `tokens.css` zamknięte
Stage 1; Phase 5 nie podmienia. Inter ładowany jako jedyny font w
`<head>`. Hero / sekcje używają `letter-spacing: -0.035em`.

---

### D-002: Split architektura `/` (landing) + `/menu` (zamówienia)

**Decyzja:** dwie osobne route'y. Landing to homepage z hero / o-nas
/ godziny / kontakt. `/menu` ma sticky cart sidebar, scroll-spy
kategorii i pełen flow zamówienia.

**Alternatywy odrzucone:** single-page scroll z menu wbitym pod hero
landingu. Powód odrzucenia: sticky cart sidebar 360 px na
desktop nie ma sensu na landing page bez produktów; scroll-spy chips
kolidują z about/godziny; CTA „Zobacz menu" przestaje być CTA.

**Uzasadnienie:** Pyszne pattern (`../DESIGN_BRIEF.md` §6) — landing
sprzedaje markę, menu sprzedaje produkty. Dwa różne mental modele,
dwa layouty.

**Implikacje:** osobne route'y w React Router. PublicNav używa
linka `/menu` (pełnego URL, nie hash). Banner zamknięcia globalny
musi być warstwą `Outlet` poza obu stronami.

---

### D-003: Sticky cart sidebar 360 px desktop, bottom sheet mobile

**Decyzja:** desktop ≥1024px → sticky sidebar prawej kolumny 360 px,
zawsze widoczny. Mobile → floating bottom bar + bottom sheet 90vh
po tap.

**Alternatywy odrzucone:** drawer slide-in z prawej także na desktop.
Powód: 30% klientów dodaje produkt nie wracając do koszyka — drawer
schowany dodaje friction (kliknięcie żeby zobaczyć stan).

**Uzasadnienie:** Pyszne, Glovo, Uber Eats — sticky sidebar to
standard branżowy z mierzalnym wpływem na conversion. Bottom sheet
mobile ergonomiczny dla kciuka (Fitts's law); swipe-down close
bezpieczniejszy niż X w prawym górnym rogu.

**Implikacje:** breakpoint 1024px hardcoded w `MenuPage.tsx`.
`CartSidebar` i `CartBottomSheet` to dwa osobne komponenty,
shared logic w hooku `useCart`. Bottom sheet z handle 36×4,
`prefers-reduced-motion` wyłącza spring (300ms) na fade.

---

### D-004: State machine 3-step kuchnia

**Decyzja:** zamówienie ma stany `NEW → CONFIRMED → IN_PREPARATION
→ READY → OUT_FOR_DELIVERY → DELIVERED`. Pani Kasia w Kuchni
operuje 3 krokami (potwierdzenie → wstaw → gotowe), klient w
trackerze widzi 5 dotów + DELIVERED.

**Alternatywy odrzucone:** 2-step (NEW → READY) — klient nie widzi
„Potwierdzone, czekaj na pizzę"; brak trust signal w trackerze.

**Uzasadnienie:** referencja `../ARCHITECTURE.md` AD-021. Pani Kasia
ma mentalny model 3 kroków; klient widzi krok pośredni
„Potwierdzone" jako UX value (Domino's tracker pattern).

**Implikacje:** enum `OrderStatus` w backend i frontend musi
zachować wszystkie 7 wartości (incl. CANCELED). `frame-kitchen.jsx`
pokazuje 3-button flow per karta. Tracker timeline (`/track/:token`)
renderuje 5 dotów + terminal state.

---

### D-005: Settings = master-detail z side-nav 8 sekcji

**Decyzja:** `/admin/settings` to layout master-detail. Lewa kolumna
240 px, lista 8 sekcji z separatorem przed 3 stubami. Prawa kolumna
content sub-page. Mobile: dropdown nawigacji + accordion.

**Alternatywy odrzucone:**
- Hub-grid kafelków bez side-nav — więcej kliknięć żeby między sekcjami przeskakiwać.
- Sidebar admina expand 8 podsekcji — przeładowanie głównej nawigacji.
- Tabs poziome — nie skalują na 8 elementów + stuby.

**Uzasadnienie:** Linear / Stripe Dashboard pattern. Single-tenant
nie potrzebuje kategorii — jeden mental model, „ustawienia są tu w
środku".

**Implikacje:** `SettingsLayout.tsx` z `<Outlet />` per sekcja.
Sub-route'y `/admin/settings/general|hours|content|zones|operations|notifications|limits|rodo`. Stuby (3 ostatnie)
renderują wspólny komponent `SettingsStub`.

---

### D-006: Stuby z copy „Dostępne w przyszłej aktualizacji"

**Decyzja:** 3 sekcje Settings (Powiadomienia / Limity zamówień /
RODO) renderują stub: ikona, krótkie zdanie *„Dostępne w przyszłej
aktualizacji"*, zero CTA, sub-text z 1-2 zdaniami co tu będzie.

**Alternatywy odrzucone:**
- „Wersja Pro" — odrzucone, nie obiecujemy płatnego tieru.
- Ukryć całkowicie z nawigacji — odrzucone, admin musi widzieć że to istnieje (sygnalizacja roadmapy).
- Disabled chipy / przyciski — wprowadzają zamieszanie („dlaczego nie działa?").

**Uzasadnienie:** filozofia produktowa — nie obiecujemy rzeczy
których nie umiemy zrobić. Stub to honest signal: „wiemy że to
ważne, dojdziemy do tego".

**Implikacje:** komponent `SettingsStub({ title, description })`
shared. Treść copy lockowana przez `i18n` / constant —
implementator nie improwizuje copywritingu.

---

### D-007: Brak chipów BLIK/Przelewy24/PayU/Stripe w Operacje

**Decyzja:** sekcja Operacje → Metody płatności pokazuje tylko
„Gotówka przy odbiorze" jako jedyną opcję + sub-text *„Płatności
online dojdą w przyszłej aktualizacji"*. Bez disabled chipów BLIK
/ P24 / PayU.

**Alternatywy odrzucone:** disabled chipy z tooltipem „wkrótce" —
sygnalizują że produkt jest w połowie zrobiony.

**Uzasadnienie:** filozofia produktowa (jak D-006). MVP jest na
gotówkę, nic do zapisania, nic do wybierania.

**Implikacje:** `section-operations.jsx` w bundle pokazuje
finalny layout. `frontend/src/features/admin/settings/operations`
nie importuje listy payment providers; stub tekst w copy.

---

### D-008: 6 predefiniowanych palet brandu

**Decyzja:** Settings → Wygląd ma 6 presetów koloru primary
(Pomidorowy / Bazylia / Dynia / Oliwka / Indygo / Grafit) + free
HEX picker jako advanced fallback.

**Alternatywy odrzucone:** free HEX picker tylko — Pani Kasia nie
wybiera HEX z palca; wybiera „kebab amber" bo restauracja sprzedaje
kebab.

**Uzasadnienie:** UX safety net. Presety to gotowy „brand starter
kit" per branża (`../VISUAL_DIRECTION.md` §14 — skalowalność na
kebab w Pruszkowie / pierogarnia w Markach). Free picker ratuje
edge case'y.

**Implikacje:** stała `BRAND_PRESETS` z 6 wpisami (label, primary,
hover, tint). Picker zapisuje `RestaurantSettings.primaryColor`,
backend rozsyła SSE event do frontend; CSS var
`--color-primary` aktualizuje cały public + admin.

---

### D-009: Status colors zachowane z Fazy 4.5

**Decyzja:** kolory statusów zamówień nie zmieniają się względem
poprzedniej iteracji:

- `NEW` — amber `#F59E0B`
- `CONFIRMED` — blue `#3B82F6`
- `IN_PREPARATION` — primary (pomidorowy `#E63946`)
- `READY` — emerald `#10B981`
- `OUT_FOR_DELIVERY` — indigo `#6366F1`
- `DELIVERED` — slate `#64748B`
- `CANCELED` — red `#DC2626`

**Alternatywy odrzucone:** re-paint statusów pod nową paletę
Confident Local. Powód: muscle memory Pani Kasi z Fazy 4.5 — nie
ruszać.

**Uzasadnienie:** koszt zmiany > zysk wizualny. Statusy są utility,
nie brand.

**Implikacje:** `STATUS_COLORS` constant dzielony między admin i
public (tracker). Tokeny CSS `--status-new`, `--status-confirmed`,
itd. już są w `tokens.css` Stage 1.

---

### D-010: Operations split na 4 widoki (Pulpit / Kuchnia / Wydanie / Dostawa)

**Decyzja:** zamiast jednego `/admin/orders` mamy 4 dedykowane
widoki operacyjne. Linkuj do `../ARCHITECTURE.md` AD-019 i AD-020.

**Alternatywy odrzucone:** unified table z filtrami — gubi flow
operatora („gdzie się zatrzymałem?").

**Uzasadnienie:** patrz AD-019 / AD-020 (decyzja architektoniczna,
nie designerska). Każdy widok = jedna persona w danym momencie
(Pani Kasia: Pulpit; kucharz: Kuchnia; obsługa wydania: Wydanie;
kierowca/dispatcher: Dostawa).

**Implikacje:** route'y `/admin/dashboard`, `/admin/kitchen`,
`/admin/pickup`, `/admin/delivery`. Każda używa własnego query
key, ale wspólnego DTO `OrderListItem` z backendu. Wszystkie
dzielą `AdminLayout` i `AdminSidebar`.

---

### D-011: Demo content = polska pizzeria osiedlowa

**Decyzja:** wszystkie mockupy używają Pizza Demo (Łomianki, od
2018, „pizza z pieca, kurczaki, zapiekanki"). Generic ale lokalna.
Brand mockup name: „Pizza Demo." (z kropką jako gest).

**Alternatywy odrzucone:** neapolitańska italian fine-dining
(„Pizzeria Da Marco — autentyczna pizza neapolitańska"). Powód:
template ma skalować na kebab w Pruszkowie / pierogarnia w Markach
— fine-dining DNA tego nie zniesie.

**Uzasadnienie:** `../VISUAL_DIRECTION.md` §2-§3 i §14. Skalowalność
> charakter konkretnego mockupu.

**Implikacje:** seed data w backendzie (Pizza Demo, 5 kategorii ×
~8 produktów, hero shots z Unsplash). `RestaurantSettings`
domyślnie pokazuje Pizza Demo; Pani Kasia podmienia z admina.

---

### D-012: Strefy dostawy = klucz `(city_normalized, postal_code)`

**Decyzja:** strefa dostawy identyfikowana parą *(miasto
znormalizowane, kod pocztowy)*. `postal_code = NULL` oznacza
wildcard całe miasto. Linkuj do `../ROADMAP.md` pkt 7.0 / 7.1.

**Alternatywy odrzucone:** geoJSON polygon na mapie — overkill dla
Phase 7, wymaga GIS na backendzie.

**Uzasadnienie:** 95% zamówień rozwiązuje się parą miasto + kod
pocztowy. Operator ma osobny markdown z designem strefy
(`../ROADMAP.md` pkt 7.0). Tu dla DESIGN_DECISIONS wystarczy zapis.

**Implikacje:** Settings → Strefy dostawy w bundle Stage 4
(`section-zones.jsx`) pokazuje listę par. Phase 5 implementuje
CRUD; Phase 7 dorzuca geo-walidację.

---

### D-013: Minimum zamówienia = globalne, nie per strefa

**Decyzja:** jedno pole `RestaurantSettings.minOrderAmount` w
sekcji Operacje. Nie per strefa.

**Alternatywy odrzucone:** per-zone min order (niższe minimum w
centrum, wyższe na obrzeżach). Powód: dwa mental modele dla Pani
Kasi (jedno globalnie + override per-zone), nadmiarowa złożoność
UX dla MVP.

**Uzasadnienie:** prostszy UX dla klienta (jedna liczba w info-barze
i w cart progress). Per-zone do rozważenia w post-MVP gdy realny
klient zapyta.

**Implikacje:** pojedynczy input number w `section-operations.jsx`.
`free-delivery progress` i `min-order progress` w cart liczą
względem tej jednej wartości.

---

### D-014: Mobile Settings = accordion z dropdown

**Decyzja:** mobile (<768px) Settings zwija side-nav do dropdown na
górze, sekcje renderują jako accordion (jedna otwarta naraz).

**Alternatywy odrzucone:** full-page tabs (każda sekcja osobna
strona, back/forward navigation). Powód: gubi kontekst, więcej tap;
375 px viewport za wąski na poziome tabs z 8 elementami.

**Uzasadnienie:** accordion utrzymuje kontekst sekcji, redukuje
scroll, działa na 375 px. Wzorzec: iOS Settings mobile.

**Implikacje:** `SettingsLayout.tsx` ma media query 768 px,
renderuje `<details>` lub akordeonowy komponent. Zachowuje sub-route
URL (deep link działa).

---

### D-015: Mobile Operacje — kolejność kart

**Decyzja:** sekcja Operacje na mobile pokazuje 4 karty
jednokolumnowo, w kolejności:

1. **Domyślny ETA** (czas dostawy)
2. **Minimum zamówienia**
3. **Tymczasowe zamknięcie**
4. **Metody płatności** (stub)

**Alternatywy odrzucone:** kolejność alfabetyczna / losowa /
„najczęściej używane na górze". Powód: bez danych analytics nie
wiemy co Pani Kasia zmienia najczęściej; częstotliwość edycji ≠
ważność konfiguracyjna.

**Uzasadnienie:** zapis żeby Phase 5 implementer nie improwizował.
Desktop pokazuje 4 karty w kolumnie w tej samej kolejności;
mobile zachowuje kolejność, kompensuje szerokością.

**Implikacje:** array `OPERATIONS_CARDS` w `section-operations.jsx`
ma stałą kolejność. Mobile media query nie zmienia kolejności,
tylko `flex-direction: column` + `width: 100%`.

---

## Notatki accessibility (krótko)

- **`prefers-reduced-motion`** — wyłącza pulse na statusach, swipe
  spring na bottom sheet, bump animację cart, scroll-smooth na
  scroll-spy. Implementacja: jedna media query w `tokens.css`
  ustawia `--motion-duration: 0.01ms`.
- **Focus rings** — wszystkie interaktywne elementy (button, link,
  input) mają `outline: 2px solid var(--color-primary); outline-offset: 2px`
  w `:focus-visible`. Token `--shadow-focus` w `tokens.css`.
- **Kontrasty** — text-primary/bg-page = 16.4:1 (AAA). Status pills
  są utility, nie passing AAA — utrzymujemy AA (4.5:1) dla
  text-on-status, pills nie służą jako jedyny sygnał (ikona +
  label też).
