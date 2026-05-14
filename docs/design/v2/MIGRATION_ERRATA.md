# MIGRATION_PLAN — errata vs realna struktura repo

> **Wersja 2.0** · 2026-05-10. Discovered podczas Stage 5 setup w branchu
> `design/v2-stage5-handoff` (commit 679a965).
>
> `MIGRATION_PLAN.md` ścieżki to były założenia z briefingu **bez wglądu
> w repo**. Realna struktura wygrywa. Phase 5 implementer mapuje per task
> używając tej tabeli — gdy plan i errata mówią różnie, errata wygrywa.

---

## Mapping założenie → rzeczywistość

| Task | MIGRATION założenie | Realna ścieżka | Notatka |
|---|---|---|---|
| M-001 | `frontend/src/styles/tokens.css` | utwórz folder + plik | nowy folder, OK |
| M-005 | `shared/components/ui/StatusPill.tsx` | move `shared/components/OrderStatusBadge.tsx` → `shared/components/ui/OrderStatusBadge.tsx` | zachowaj nazwę OrderStatusBadge (mniej referencji do update), retrofit visual |
| M-008 | `shared/components/layout/PublicHeader.tsx` | `features/public/layout/PublicHeader.tsx` | nowy folder, lokalność per area |
| M-009 | `shared/components/layout/PublicFooter.tsx` | `features/public/layout/PublicFooter.tsx` | jw. |
| M-010 | `shared/components/layout/AdminSidebar.tsx` | `features/admin/layout/AdminSidebar.tsx` (istnieje) | retrofit istniejącego pliku |
| M-011 | `shared/components/layout/AdminTopbar.tsx` | `features/admin/layout/AdminTopbar.tsx` (istnieje) | jw. |
| M-012 | `shared/components/layout/AdminLayout.tsx` | `features/admin/layout/AdminLayout.tsx` (istnieje) | jw. |
| M-015 | `shared/components/cart/FreeDeliveryProgress.tsx` | `features/public/cart/FreeDeliveryProgress.tsx` | nowy plik w istniejącym `features/public/cart/` |
| M-020 | `shared/components/cart/UpsellSection.tsx` | `features/public/cart/UpsellSection.tsx` | jw. |
| M-021 | `shared/components/cart/CartSidebar.tsx` | `features/public/cart/CartSidebar.tsx` (zastępuje CartDrawer) | **refactor architektury cart** wymóg D-003 |
| M-022 | `shared/components/cart/CartBottomSheet.tsx` + `MobileCartBar.tsx` | `features/public/cart/CartBottomSheet.tsx` (nowy) + `features/public/cart/MobileCartBar.tsx` (istnieje, retrofit) | jw. |
| M-023 | `frontend/src/features/public/checkout/CheckoutPage.tsx` | bez zmian (istnieje) | retrofit, NIE refactor |
| M-024 | `frontend/src/features/public/confirmation/ConfirmationPage.tsx` | sprawdź realną ścieżkę — może być w `features/public/order/` lub similar | retrofit, struktura jak istnieje |
| M-026 | `frontend/src/features/public/tracking/TrackingPage.tsx` | sprawdź realną ścieżkę | retrofit |
| M-027 | `features/admin/login/LoginPage.tsx` | `features/admin/auth/LoginPage.tsx` (istnieje) | retrofit, **NIE rename folderu** |
| M-029 | `features/admin/kitchen/KitchenPage.tsx` | `features/admin/operations/kitchen/KitchenPage.tsx` | zachowaj `operations/` parent z shared/ utilities |
| M-030 | `features/admin/pickup/PickupPage.tsx` | `features/admin/operations/pickup/PickupPage.tsx` | jw. |
| M-031 | `features/admin/delivery/DeliveryPage.tsx` | `features/admin/operations/delivery/DeliveryPage.tsx` | jw. |
| M-036 | `features/admin/settings/SettingsLayout.tsx` | utwórz **nowy** w `features/admin/settings/` | refactor wymagany przez D-005 |
| M-037 | `features/admin/settings/sections/GeneralSection.tsx` | refactor `features/admin/settings/SettingsPage.tsx` → `sections/GeneralSection.tsx` | rename + retrofit |
| M-038 | `features/admin/settings/sections/HoursSection.tsx` | refactor `features/admin/settings/OpeningHoursPage.tsx` → `sections/HoursSection.tsx` | jw. |
| M-039 | `features/admin/settings/sections/ContentSection.tsx` | refactor `features/admin/settings/PageContentPage.tsx` → `sections/ContentSection.tsx` | jw. |
| M-040 | `features/admin/settings/sections/ZonesSection.tsx` | **zachowaj** `features/admin/delivery-zones/DeliveryZonesPage.tsx` jako osobną feature, podepnij jako sub-route SettingsLayout | feature ma własne api/types/lib/ — duży scope, osobny folder uzasadniony |
| M-041 | `features/admin/settings/sections/OperationsSection.tsx` | utwórz nowy w `features/admin/settings/sections/` | nowy plik |
| M-042 | `features/admin/settings/SettingsStub.tsx` + 3 sections | utwórz w `features/admin/settings/` + `sections/` | jw. |

---

## Zasady ogólne (gdy errata milczy)

- **Layout** → `features/{public,admin}/layout/` (lokalność per area), **NIE** `shared/components/layout/`.
- **Cart components** → `features/public/cart/`, **NIE** `shared/components/cart/`.
- **Settings sections** → `features/admin/settings/sections/` po refaktorze SettingsLayout.
- **Operacje admin** → `features/admin/operations/{kitchen,pickup,delivery}/` z `operations/shared/` dla wspólnych utilities (statusColors, timerColor, useElapsedTick, SectionHeader).
- **Login** → `features/admin/auth/LoginPage.tsx` (folder auth/ zostaje).
- **Delivery zones** → `features/admin/delivery-zones/` jako osobna feature, podpięcie do SettingsLayout przez `<Route>`.
- **Nowe shared primitives** (Kicker, ClosedBanner, InfoBar, ProductCard, Timeline, error pages) → `shared/components/{typography,banners,info-bar,product,timeline,errors}/`.
- **UI primitives** (Button, Input, Badge, OrderStatusBadge, Icon) → `shared/components/ui/`.

---

## Refactor scope — co naprawdę się zmienia poza retrofitem stylów

Te 2 punkty to **realny refactor architektury**, nie tylko podmiana
tokenów:

### Cart (D-003) — warstwa 3, taski M-021, M-022

Obecny `features/public/cart/CartDrawer.tsx` (drawer prawej strony) jest
dzielony na:
- `CartSidebar.tsx` — sticky 360px na desktop ≥1024px, zawsze widoczny na
  `/menu`
- `CartBottomSheet.tsx` — bottom sheet 90vh na mobile <1024px, otwiera się
  z `MobileCartBar.tsx`
- `MobileCartBar.tsx` (istnieje) — retrofit pod nowy design

Plus 2 nowe komponenty:
- `FreeDeliveryProgress.tsx` (M-015)
- `UpsellSection.tsx` (M-020)

`CartButton.tsx` (istnieje) — pewnie zostaje jako trigger; sprawdź użycia
w trakcie M-008 PublicHeader.

### Settings (D-005) — warstwa 5, taski M-036..M-042

Obecne 3 osobne strony stają się sekcjami pod jednym SettingsLayout:

```
features/admin/settings/
├── SettingsLayout.tsx              ← NOWY (M-036) z <Outlet />
├── SettingsStub.tsx                 ← NOWY (M-042) reusable placeholder
└── sections/
    ├── GeneralSection.tsx           ← refactor z SettingsPage.tsx (M-037)
    ├── HoursSection.tsx             ← refactor z OpeningHoursPage.tsx (M-038)
    ├── ContentSection.tsx           ← refactor z PageContentPage.tsx (M-039)
    ├── OperationsSection.tsx        ← NOWY (M-041)
    ├── NotificationsSection.tsx     ← NOWY stub (M-042)
    ├── LimitsSection.tsx            ← NOWY stub (M-042)
    └── LegalSection.tsx             ← NOWY stub (M-042)
```

ZonesSection NIE w `sections/` — `features/admin/delivery-zones/` zostaje
osobną feature, sub-route'em w SettingsLayout.

Routing: `/admin/settings` (default GeneralSection) + 7 sub-route'ów
(`/hours`, `/content`, `/zones` (→ delivery-zones), `/operations`,
`/notifications`, `/capacity`, `/legal`).

---

## Architectural deltas — discovered during Warstwa 3a implementation

> 2026-05-11 · Warstwa 3a (M-014..M-022, public menu + cart flow) na
> branchu `design/v2-stage5-handoff`. Commit range `2fe5b23..5e9d589`
> (9 commitów: 2fe5b23 M-014, 8f633af M-015, 1021931 M-016, 959ea48 M-017,
> dd1f357 M-020, 609957b M-021, 894310d M-022, 19bcf8e M-018, 5e9d589 M-019).
> Trzy delty wykryte i zaakceptowane w plan mode
> (`~/.claude/plans/robust-wiggling-toast.md`), powtórzone tu słowo w słowo
> z planu — następna sesja ma kontekst bez czytania pliku planu (który
> może zostać usunięty/przesunięty przez Claude Code housekeeping).

### AD-Δ1: Wrapper sticky banner + nav (zastępuje sticky-on-each)

`ClosedBanner.tsx` (M-013, commit `a1d72ef`) i `PublicNav.tsx` (M-008,
commit `f9454b7`) obecnie mają każde własne `sticky top-0`
(`z-40` i `z-20`). Współistniejąc sticky-na-tym-samym-top, banner przykryje nav.

**Δ:**
- `ClosedBanner.tsx` (`shared/components/banners/`) — usuń `sticky top-0 z-40` z root div'a.
  Zostaje natural-flow `min-h-[48px] bg-[#B91C1C] ...`. Hook `useQuery(["public","opening-hours"])`
  z polling 60 s — bez zmian.
- `PublicNav.tsx` (`features/public/shared/`) — usuń `sticky top-0 z-20` z `<header>`.
  Zostaje `border-b ... transition-shadow` + `scrolled && "shadow-sm"` (z M-008).
- Mount w **M-018 LandingPage** i **M-019 MenuPage**:
  ```tsx
  <div className="sticky top-0 z-50">
    <ClosedBanner />
    <PublicNav active="..." onOpenCart={...} />
  </div>
  ```
  Cały container sticky `top-0 z-50`. Banner ukrywa się sam (return `null` gdy
  `state === null`) — wtedy container zwija się do wysokości tylko nav.

**Wykonane:** M-018 (commit `19bcf8e`) i M-019 (commit `5e9d589`) usuwają
sticky z obu komponentów i wprowadzają wrapper. W M-019 dodatkowo wrapper
zawiera `<FreeDeliveryProgress />` (M-015) — wrapper rośnie/kurczy się
dynamicznie gdy progress mount/unmount.

### AD-Δ2: CartDrawer rozdzielony na CartSidebar + CartBottomSheet

`features/public/cart/CartDrawer.tsx` (Faza 3) używał shadcn `<Sheet side="right|bottom">` z
breakpointem 767 px. D-003 wymaga sticky 360 px sidebara na lg ≥ 1024 px + bottom sheet 90 vh
poniżej.

**Δ:**
- `features/public/cart/CartSidebar.tsx` — nowy. Inline sticky aside 360 px, render warunkowy
  w `MenuPage` (`hidden lg:flex`). Nie owija w shadcn Sheet — pozostaje natural DOM element
  na siatce `MenuPage`.
- `features/public/cart/CartBottomSheet.tsx` — nowy. Używa shadcn `<Sheet side="bottom">`
  (już mamy w `shared/components/ui/Sheet`), 92 vh, drag handle 36×4 visual only.
  Open trigger z `MobileCartBar` (klik) lub z `CartButton` (klik ikony w PublicNav).
- `features/public/cart/CartDrawer.tsx` — usunięcie po M-019 podpięciu (bezpieczne, jedyni
  konsumenci to LandingPage + MenuPage; oba dostają nowe wiring w M-018/M-019).
- `MobileCartBar.tsx` — retrofit pod tokeny v2 (gradient shadow `0 8px 24px rgba(230,57,70,0.32)`,
  font-mono total, layout dwukolumnowy z bundle Stage 2), zmiana breakpointu
  `md:hidden` → `lg:hidden` (≥ 1024 px chowamy bo widać sidebar).
- `useCartStore` API (`addItem`/`updateQuantity`/`removeItem`/`clear`), `useCartCount`,
  `useCartTotal`, `lineTotal`, `buildLineKey`: zero zmian.

Stany sidebar (D-003 + bundle Stage 2):
- **empty** (items.length === 0): icon 64 px + headline „Tu pojawi się Twoje zamówienie" +
  sub-copy + opcjonalny CTA „Przeglądaj menu" → scroll do top kategorii.
- **with items**: lista CartRow (qty stepper + remove + edit-note placeholder) → opcjonalny
  `<UpsellSection />` (gdy są kandydaci) → `<FreeDeliveryProgress />` → totals → CTA „Złóż
  zamówienie · X,XX zł" → secondary „← Wróć do menu".
- **min-order gating**: gdy `settings.minOrderAmount` jest `number` i `subtotal < min` →
  CTA disabled + komunikat „Brakuje X zł do minimum zamówienia". Gdy `minOrderAmount`
  undefined → gating wyłączone (graceful fallback).

**Wykonane:** M-021 (`609957b`) + M-022 (`894310d`). Dodatkowo w M-022 wyciągnięto
`CartRow` do shared `CartRow.tsx` (2 konsumentów: sidebar + sheet), commit `894310d`.

### AD-Δ3: SettingsDto opcjonalne pola + graceful fallback

`SettingsDto` (`shared/api/settingsApi.ts`) nie ma `minOrderAmount`, `freeDeliveryFrom`,
`defaultPreparationMinutes`, `deliveryFee`. PHASES.md M1 doda je w osobnym backend tasku.
**TS-only delta** (sygnatura, zero runtime):

```ts
export interface SettingsDto {
  // ... existing 11 pól bez zmian
  minOrderAmount?: number | null;            // Faza 5 M1 backend delta
  freeDeliveryFrom?: number | null;          // Faza 5 M1 backend delta
  defaultPreparationMinutes?: number | null; // Faza 5 M1 backend delta
  deliveryFee?: number | null;               // Faza 5 M1 backend delta (lub zone-derived)
}
```

Wszyscy konsumenci dostają TS hint że pole może być `undefined`. Komponenty:
- **InfoBar (M-014)** — renderuje 4 moduły, ale każdy `defaultPreparationMinutes ?? null` /
  `minOrderAmount ?? null` / `deliveryFee ?? null` decyduje czy moduł się pokazuje. Status
  (open/closed) — bez fallback, używa `useQuery(["public","opening-hours"])` (jak w
  ClosedBanner). Minimum: zawsze widoczny przynajmniej moduł status.
- **FreeDeliveryProgress (M-015)** — `if (threshold == null) return null;`. Gdy backend
  doda pole — komponent automatycznie zacznie renderować.
- **CartSidebar / CartBottomSheet (M-021/M-022)** — `belowMin` warning + CTA gating tylko
  gdy `minOrderAmount` jest number. Gdy null/undefined: CTA enabled bez gatingu. Wiersz
  „Dostawa" w totals pomijany gdy `deliveryFee` undefined; total = subtotal.

**Wykonane:** M-014 (`2fe5b23`) dodaje 4 opcjonalne pola do `SettingsDto`.
Wszyscy konsumenci (InfoBar, FreeDeliveryProgress, CartSidebar, CartBottomSheet)
implementują graceful fallback. Smoke Playwright potwierdza: na produkcyjnym backendzie
(który nie wystawia tych pól) InfoBar pokazuje tylko status moduł, FreeDeliveryProgress
return null, sidebar/sheet bez belowMin gating i bez wiersza „Dostawa".

### AD-Δ4: Mobile hamburger w PublicNav zachowany (świadomy mismatch vs bundle)

> 2026-05-11 · Warstwa 3a fix-up · F-006 PublicNav telefon CTA + CartButton state-based.

Bundle Stage 2 `landing-shared.jsx` HeaderMobile nie ma hamburgera — single-page
landing scrolling do sekcji `#about` / `#contact`. Nasza architektura (D-002) ma
split `/` (landing) + `/menu` (osobny route z sticky cart). Na `/menu` mobile bez
hamburgera użytkownik nie ma jak wrócić do landing sections / kontaktu.

**Δ:**
- `PublicNav.tsx` mobile zachowuje hamburger Sheet z navigation links
  (Menu / O nas / Kontakt + "Zamów online" fallback inside sheet).
- Right actions section pod F-006: phone CTA (desktop label-full
  `📞 +48 …` `md:inline-flex`; mobile icon-only square `md:hidden`)
  + `CartButton` state-based.
- 0-state cart button visible (zamiast bundle hidden-when-empty) —
  świadoma decyzja UX consistency cross-state. Bundle pokazuje 0-state
  outlined wariant gdy renderuje — to nie mismatch.
- `CartButton.tsx` retrofit: slate kolory → tokens v2; state-based:
  count=0 → 40×40 outlined kwadrat (border-card, text-primary),
  count>0 → h-10 px-3 primary bg + white text + icon + mono count.
- Drop "Zamów online" CTA z desktop right actions (bundle nie ma); CTA
  zostaje wewnątrz mobile Sheet jako secondary fallback gdy klient
  otworzy hamburger menu.

Out of scope: bundle drag-to-close gesture, swipe-down nav close,
PublicNav-level scroll-spy. Phone format display: raw `settings.phone`
bez parsowania/maskowania (admin wpisuje w preferowanym formacie).

**Wykonane:** F-006 (`<commit>`) — zmiany w PublicNav.tsx + CartButton.tsx +
ten plik. Phone CTA `settings?.phone` graceful null (gdy backend nie wystawia
— phone CTA się nie renderuje, CartButton sam wypełnia right actions).

### AD-Δ5: AboutSection bez stats trio (świadomy mismatch vs bundle)

> 2026-05-11 · Warstwa 3a fix-up · F-007 Landing sections retrofit.

Bundle Stage 2 `landing-shared.jsx` AboutSection ma 3 stats hardcoded:
"8 lat na rynku · 40+ pozycji w menu · 35 min średni czas dostawy".
My pomijamy — backend `PageContentDto` (HERO / ABOUT entries z title /
body / imageUrl / ctaLabel / ctaHref) nie ma pól stats, a hardcoded
copy naruszyłby zasadę "Zero hardcoded contentu" z CLAUDE.md.

**Δ:** AboutSection renderuje kicker "O NAS" + h2 z accent dot + body
z `about.body`. Mobile image hidden (bundle pattern). Stats sekcja
nie wchodzi do F-007.

Post-MVP opcje:
- A) Dodać pola `foundedYear?: number | null` i `quickStats?: string[]`
  do `PageContentDto.ABOUT` entry + admin UI w PageContentPage edit form.
- B) Derive z dostępnych źródeł — np. `menu.categories.flatMap(c => c.products).length`
  dla "{N}+ pozycji w menu" + `RestaurantSettings.foundedYear` (gdy doda się
  pole). 35 min — pewno z `defaultPreparationMinutes` (Faza 5 M1 backend delta).
- C) Stats jako 4-ty PageContent entry "STATS" z body jako JSON lub
  whitespace-separated triple.

**Wykonane:** F-007 (`<commit>`) — AboutSection.tsx bez stats trio.

### AD-Δ6: ContactSection bez sekcji "Strefa dostawy" (świadomy mismatch)

> 2026-05-11 · Warstwa 3a fix-up · F-007 Landing sections retrofit.

Bundle ContactMapSection ma 4-tą sekcję pod TELEFON / E-MAIL:
"STREFA DOSTAWY" z listą miast (Warszawa Centrum / Mokotów / Wola / Ochota)
+ link "Sprawdź swój adres →". My pomijamy — `SettingsDto` nie ma pól
zone copy ani aggregate listy stref.

**Δ:** ContactSection renderuje 3 fields (ADRES / TELEFON / E-MAIL)
plus map. Layout 1fr/1fr desktop, 1-col mobile. Map aspect 1:1 desktop /
4:3 mobile, border tokens, rounded 12px.

Post-MVP wire-up:
- `features/admin/delivery-zones/` (osobna feature, M-040 w MIGRATION_PLAN)
  już istnieje z `DeliveryZoneDto.areas: string[]` per zona.
- Wystawić public endpoint `GET /public/delivery-zones-summary` zwracający
  unikalne `areas` z aktywnych zon (filter `active = true`).
- ContactSection dodać 4-ty field `STREFA DOSTAWY` z `useQuery(["public",
  "delivery-zones-summary"])` + render "Dostarczamy do: {area1}, {area2},
  {area3}+" (limit 3-4, "i więcej" link do delivery zone checker w
  checkout flow).
- Backend ma data, frontend public landing nie pokazuje listy w F-007.

**Wykonane:** F-007 (`<commit>`) — ContactSection.tsx bez "Strefa dostawy".

---

### AD-Δ7: TrackingTimeline ikony — lucide vs MIGRATION_PLAN emoji spec

> 2026-05-14 · Warstwa 3b · M-025 TrackingTimeline retrofit.

`MIGRATION_PLAN.md` M-025 spec mówi: emoji ikony per stage `(⏳ ✓ 👨‍🍳 🛵 🎉)`
+ 6th cancelled `(✕)`. Bundle Stage 2 `confirmation-and-tracking.jsx`
(L92-99 desktop, L181-182 mobile) używa lucide-react: `checkCircle / flame
/ pkg / truck / home`.

**Δ:**
- `frontend/src/features/public/order/components/TrackingTimeline.tsx`
  L24-32 mapuje `STATUS_ICONS: Record<OrderStatus, LucideIcon>`:
  ```ts
  NEW: CircleCheck,
  CONFIRMED: ClipboardCheck,
  IN_PREPARATION: Flame,
  READY: PackageCheck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Home,
  CANCELED: CircleCheck,  // placeholder — canceled state rendered
                          // jako separate alert card w TrackingPage
  ```
- Wybór lucide vs emoji: spójność z resztą Warstwy 3a (CartButton,
  FulfillmentTile, PaymentTile, MenuPage section h2 — wszystko lucide
  poza category emoji per slug). Bundle Stage 2 też lucide. Emoji
  wprowadzałyby visual inconsistency + zależność od OS emoji renderingu
  (Windows vs macOS render różnie, vs Pomidorowy red brand).

**Wykonane:** M-025 (`1d089c2`) zachowuje obecny lucide STATUS_ICONS
mapping bez zmian, retrofit visual tokens (status-ready done, primary
active z pulse, border-card pending) per plan.

Post-MVP rationalizacja: jeśli ikony wymagają unifikacji — wybór lucide
jest zgodny z rest of Warstwa 3a; emoji w bundle Stage 2 to specific
to admin operations panel (gdzie operator widzi emoji dla muscle memory),
NIE public tracking. MIGRATION_PLAN spec mógł odzwierciedlać wcześniejszą
fazę designu pre-bundle Stage 2.

---

**Wersja 2.4** · 2026-05-14 · Warstwa 3b (M-023..M-026) complete +
AD-Δ7 (TrackingTimeline lucide vs emoji audit trail).
