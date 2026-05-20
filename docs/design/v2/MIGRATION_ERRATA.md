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

---

## Architectural deltas — Warstwa 4 (admin operations)

> 2026-05-15 · Warstwa 4 (M-027..M-033, admin operations retrofit) na
> branchu `design/v2-stage5-handoff`. Commit range `61db175..e030b93`
> (7 commits: 61db175 M-027, 17cfd3d M-028, f68f942 M-029, e02f13b M-030,
> 81f89fe M-031, 5ab7ca4 M-032, e030b93 M-033). 7 delta zaakceptowane
> w plan mode (operator's N1-N4 decisions z plan akceptem).

### AD-Δ8: Login brand-panel uses settings.tagline (świadomy mismatch demo copy)

> 2026-05-15 · Warstwa 4 · M-027 LoginPage retrofit.

Bundle Stage 3 `frame-login.jsx` brand panel ma hardcoded headline
"Smacznie i szybko." + kicker "ŁOMIANKI · OD 2018". Oba demo copy.

**Δ:**
- `LoginPage.tsx` brand panel renderuje `settings.data?.tagline` z fallback
  `"Smacznie i szybko"` (graceful default). `tagline` jest pełnoprawnym polem
  SettingsDto (od Fazy 4), restauracja podmienia z admin Settings → Ogólne.
- City kicker (accent-yellow) renderuje `settings.data?.city` only gdy
  niezerowe. Drop "OD {rok}" sub-fragment bo brak `foundedYear` w SettingsDto
  (post-MVP backend delta — zob. PHASE5_FINDINGS #18 sentencja podana
  w naszym Warstwa 3a fix-up #2 F-013 footer social paragraph).
- "Wersja 5.0 · Faza redesign" footer (bundle) zastąpione "Single-tenant ·
  {restaurantName}" — design tool string zastąpiony pożyteczną informacją.

**Wykonane:** M-027 (`61db175`).

### AD-Δ9: Dashboard 4 KPI per backend fields (mismatch vs bundle 4 KPI)

> 2026-05-15 · Warstwa 4 · M-028 DashboardPage retrofit.

Bundle Stage 3 `frame-dashboard.jsx` pokazuje 4 KPI: Zamówienia dziś /
Sprzedaż dziś / Czas przygotowania / Anulowane (24h). Backend
`AdminDashboardStatsToday` (`order/api/dto/admin/AdminDashboardStatsDto.java`)
wystawia: `orderCount`, `totalRevenue`, `averageOrderValue`, `deliveryCount`,
`pickupCount`, `canceledCount`. **Brak** `preparationAverageMinutes` ani
`canceledLast24h` aggregate.

**Δ:** Zachowuję istniejące 4 KPI dla operator-relevant data:
1. Zamówienia dziś — `today.orderCount` + delta vs wczoraj (computeDelta)
2. Sprzedaż dziś — `today.totalRevenue` + hint "{N} dostawy · {N} odbiory"
3. Średnia wartość — `today.averageOrderValue`
4. Aktywne zamówienia — `activeCounts` sum + hint "{N} anulowanych dziś"
   (gdy `canceledCount > 0`)

Post-MVP: PHASE5_FINDINGS #12 zapisuje backend delta wymagana dla bundle
4 KPI exact match — `preparationAverageMinutes` (rolling avg per status
transition NEW→READY) + `canceledLast24h` (snapshot window).

**Wykonane:** M-028 (`17cfd3d`).

### AD-Δ10: Dashboard Top Products bez revenue/share kolumn (backend gap)

> 2026-05-15 · Warstwa 4 · M-028 DashboardPage retrofit.

Bundle Stage 3 Top Products row pokazuje 5-col grid: rank mono + name + qty
+ revenue mono + share % progress bar. Backend `AdminDashboardTopProductStats`
wystawia tylko `productName` + `totalSold`.

**Δ:** `TopProductsList.tsx` renderuje grid 32px-1fr-90px (rank mono + name +
qty mono). Drop revenue + share % kolumny.

Post-MVP: PHASE5_FINDINGS #13 zapisuje backend delta — wymaga rozszerzenia
`AdminDashboardTopProductStats` o `revenue: BigDecimal` (sum lineTotal per
product per 30 days, exclude CANCELED) + `salesShare: BigDecimal` (per
total revenue 30d).

**Wykonane:** M-028 (`17cfd3d`).

### AD-Δ11: Kitchen AD-023 collapse + visual state differentiation

> 2026-05-15 · Warstwa 4 · M-029 KitchenPage retrofit.

Brief Warstwy 4 M-029 wymaga "3-step CTA: Potwierdź / Rozpocznij / Gotowe".
AD-023 (`docs/ARCHITECTURE.md`) collapsuje NEW + CONFIRMED do jednokliku
"Przyjmij → IN_PREPARATION" dla muscle memory Pani Kasi.

**Konflikt rozwiązany przez visual differentiation:**
- `KitchenOrderCard.primaryAction()` zwraca `{label, next, bgVar, textColor}`
- NEW → "Przyjmij" status-new amber bg / text-primary (dark text na amber
  per WCAG contrast); `next = IN_PREPARATION` (AD-023 skip CONFIRMED)
- CONFIRMED → "Rozpocznij przygotowanie →" status-confirmed blue bg /
  text-white; `next = IN_PREPARATION` (gdy admin postawił CONFIRMED z
  OrderDetail back-office flow per AD-023)
- IN_PREPARATION → "✓ Gotowe" **color-primary RED** bg / text-white;
  `next = READY` (Fix-up #5 F-020 override — bundle `frame-kitchen:184`
  używa `var(--color-primary)`, nie `var(--status-ready)`. AD-Δ11 original
  emerald decision superseded; operator's compositional fidelity intent
  wins. "Brand red TERAZ" semantic sygnalizuje active CTA podczas pracy
  kuchni, status-ready emerald jest reserved dla post-completion state pill.)

Backend transitions zachowane (`transitions.canTransitionTo`): NEW dopuszcza
zarówno CONFIRMED jak i IN_PREPARATION, kuchnia używa skip. Operator widzi
3 distinct visual states (NEW = waiting acceptance, CONFIRMED = admin-
acknowledged, IN_PREPARATION = active cook), single-tap workflow preserved.

**Wykonane:** M-029 (`f68f942`) original; Fix-up #5 F-020 IN_PREP color flip.

### AD-Δ12: PickupPage zachowuje cards layout (cash banner focal UX)

> 2026-05-15 · Warstwa 4 · M-030 PickupPage retrofit.

Bundle Stage 3 `frame-pickup.jsx` pokazuje **tabelę** list-style 6-col (slot
mono 24px focal + klient name 22px + items compact + telefon + kwota + akcja
"Szczegóły →"). Obecna implementacja PickupPage używa **kart 2-col grid**
z cash banner "POBIERZ GOTÓWKĘ {kwota}" focal pattern dla CASH_ON_PICKUP.

**Δ:** Zachowuję karty layout. Rationale:
- Cash banner jest critical UX dla operatora przy ladzie — pełna kwota
  w `status-cancelled-tint` focal bg + mono 24px bold + kicker "Pobierz
  gotówkę". Tabela degradowała by signal do small cell
- Customer name 28px focal też dominuje karta — w tabeli mieści się tylko
  w 22px bez line-clamp
- Single-tenant małej pizzerii nie ma volume order pour tabela vs karty
  workflow (bundle table optimized dla multi-order retail; my single-flow)

PickupOrderCard.tsx token audit zachowane (mono order# 16px small +
customer name 28px focal + phone link primary mono + items compact + cash
banner / payment label fallback + Wydano CTA xl primary).

**Wykonane:** M-030 (`e02f13b`).

### AD-Δ13: Backend touch trackingToken (świadomy wyjątek od "Zero Backend Touch")

> 2026-05-15 · Warstwa 4 · M-033 OrderDetailPage retrofit + backend.

Brief Warstwy 4 zawiera explicit drobnostka #1: link "Otwórz tracker
klienta →" do `/track/{token}` w OrderDetailPage header. Backend
`AdminOrderDto` przed Warstwą 4 NIE wystawiał `trackingToken` field — pole
`UUID publicTrackingToken` istnieje w Order entity (Faza 1, migracja V100)
ale było eksponowane tylko w `OrderConfirmationDto` przy place order.

**Operator's N3 decyzja:** świadomy wyjątek od konstytucji "Zero Backend
Touch" (CLAUDE.md). Argumentacja:
- Gap funkcjonalny support workflow (operator dzwoni klient, link szybki
  do trackera) — nie polish
- Zmiana trywialna: 1 pole record + 1 mapper line, brak migracji DB
- Tests bez touch (AdminOrderDto konstruowane tylko via toDto)
- Alternatywa (manual UUID lookup w bazie) niewygodna na produkcji

**Δ:**
- `AdminOrderDto.java`: dodane pole `String trackingToken`
- `AdminOrderQueryService.toDto()`: mapper rozszerzony o
  `order.getPublicTrackingToken().toString()` w 4-tym argumencie
- Frontend `orderApi.ts`: `trackingToken: string` w `AdminOrderDto` interface
- Frontend `OrderDetailPage.tsx`: link `<Link to="/track/{order.trackingToken}"
  target="_blank">Otwórz tracker klienta ↗</Link>` z ExternalLink Lucide icon

Pozostałe backend gaps z planu Warstwy 4 (#12, #13, #15, #16, #17, #18)
zostają w PHASE5_FINDINGS dla post-Warstwa 6 backend M2 batch task per
N4 operator decision.

**Wykonane:** M-033 (`e030b93`).

### AD-Δ14: OrdersList filter chips bez per-status count (backend aggregate gap)

> 2026-05-15 · Warstwa 4 · M-032 OrdersListPage retrofit.

Bundle Stage 3 `frame-orders.jsx` filter chips row pokazuje per-status count
mono ("Nowe 3", "Potwierdzone 4", itd.). Backend `AdminOrdersQuery` zwraca
filtered `SpringPage<AdminOrderListItemDto>` — brak aggregate `Map<OrderStatus,
Long>` per query.

**Δ:** OrderFilters chips renderują tylko status dot + label bez count.
Active = primary bg + white. Inactive = border-card + text-body + hover
bg-section. D-009 muscle-memory dot mapping zachowany (NEW amber, CONFIRMED
blue, IN_PREPARATION primary, READY emerald, OUT_FOR_DELIVERY indigo,
DELIVERED slate, CANCELED red).

Post-MVP: PHASE5_FINDINGS #17 zapisuje backend delta — wymaga osobnego
endpoint `/admin/orders/counts?dateFrom=X&dateTo=Y` lub embedded
`statusCounts` w `SpringPage` response wrapper.

**Wykonane:** M-032 (`5ab7ca4`).

## Architectural deltas — Warstwa 4 fix-up #5 (bundle replication + AdminTopbar compression)

> 2026-05-15 → 2026-05-19 · F-018..F-025. Closure entries below capture
> wszystkie świadome odstępstwa od bundle frames Stage 3 wprowadzone
> w czasie fix-up #5. F-018..F-024-rev3 same w sobie były pixel-port
> replikacją bundle frames (AD-Δ8..14 nadal obowiązują jako jedyne
> backend gaps). AD-Δ15..18 dotyczą structural cleanup wprowadzonego
> przez F-025 i jego follow-up.

### AD-Δ15: AdminTopbar compressed single-line (drop brand info + page-body header)

> 2026-05-19 · Warstwa 4 fix-up #5 · F-025 AdminTopbar compression.

Bundle Stage 3 `admin-shared.jsx::Topbar` renderuje `68px` shell (compact
56px) z opcjonalnym breadcrumb + h1 (22px / 18px compact) + subtitle inline,
łącznie ~3-line vertical rhythm. Bundle dodatkowo wszystkie 6 operacyjnych
frames (kitchen / pickup / delivery / dashboard / orders / order-detail)
mają dual-layer: shell topbar + page-body header (kicker "Operacyjne" +
h1 + metadata) duplikujący identyfikację strony którą już komunikuje
active sidebar nav item.

**Δ:** AdminTopbar zwinięty do `h-12` (48px) single-line:
`[hamburger?] [Title bold 15px] · [metadata 12px muted, sm:inline] —
[LiveBadge] [page actions] [SoundToggle] [Wyloguj]`. Brand block (logo +
"Pizza Demo" + "PANEL ADMINA" kicker) przeniesiony do
`AdminSidebar` header. Page-body header (kicker + h1 + subtitle)
**usunięty** z każdego z 6 operacyjnych pages — content section
zaczyna bezpośrednio od kanban / table / form.

**Mechanizm:** AdminLayout montuje `<div ref={setTopbarSlot} />`
nad `<Outlet />` i wystawia go via `useAdminOutletContext()`. Każdy
page renderuje `<AdminTopbar ...>` który `createPortal`'uje content
do slot div. Brak state w layout, brak re-render loopów, każdy page
deklaruje swój topbar declaratively.

Operator directive: "Drop topbar brand info — po co po stronie admina,
redundant z sidebar brand. Drop page-body header — duplicates page
identity that sidebar nav active item już komunikuje. Ergonomia >
pixel-port." Świadome odstępstwo od bundle Stage 3 — bundle frames
zostają as ground-truth dla wszystkich pozostałych elementów (cards,
columns, status pills, totals, action buttons).

**Wykonane:** F-025 (`7f23b9d`).

### AD-Δ16: SoundToggle global w admin shell (scope rozszerzony vs bundle)

> 2026-05-19 · Warstwa 4 fix-up #5 · F-025 shell actions.

Bundle Stage 3 ma `SoundToggle` button (bell / bell-off) tylko w 3
operacyjnych frames (kitchen / pickup / delivery — `useOperationalSound`
hook). `frame-dashboard.jsx`, `frame-orders.jsx`, `frame-order-detail.jsx`
nie mają sound icon w topbar.

**Δ:** Po F-025 AdminLayout renderuje `<SoundToggle />` jako shell action
**globally** dla wszystkich admin pages (kitchen, pickup, delivery,
dashboard, orders, orderDetail, settings, menu, opening-hours,
page-content, delivery-zones). Powód: operator może mieć otwarty Dashboard
lub OrderDetail w momencie kiedy przychodzi nowe zamówienie — audio cue
powinien być spójny cross-page, nie znikać po wyjściu z kanbana.

Single source of audio truth: `useOperationalSound` hook + `SoundToggle`
button osadzone w shell, nie per-page.

**Wykonane:** F-025 (`7f23b9d`).

### AD-Δ17: AdminSidebar footer = identity only, logout = topbar primary

> 2026-05-19 · Warstwa 4 fix-up #5 · F-025 logout single-source.

Bundle Stage 3 `admin-shared.jsx::Sidebar` ma footer slot z user identity
(avatar initials + display name + email) **+ logout icon button** (L240-249
w bundle, arrow-out icon). Topbar w bundle frames nie ma osobnego Wyloguj
button — logout siedzi tylko w sidebar footer.

**Δ:** Current sidebar footer pokazuje **tylko identity** (avatar /
initials / displayName / role "admin"). Logout primary CTA przeniesiony
do AdminTopbar shell actions (`<Button variant="ghost" size="sm">
Wyloguj</Button>`) widoczny na każdej stronie. Powód: cross-page convention
— admin jest w topbar (wszędzie widoczny, łatwy do trafienia z każdego
ekranu) zamiast w sidebar footer (poniżej fold na shorter viewports,
ukryty na mobile gdy sidebar w drawer-mode).

**Wykonane:** F-025 (`7f23b9d`) + F-025 follow-up (`<commit-after-this>`).

### AD-Δ18: OrderDetail BackLink dropped (sidebar nav covers)

> 2026-05-19 · Warstwa 4 fix-up #5 · F-025 follow-up · cleanup.

Bundle Stage 3 `frame-order-detail.jsx` ma breadcrumb "Archiwum › Wszystkie
zamówienia" w topbar — sub-12px text muted nad h1. M-033 zmapował to do
`BackLink` component (← Wróć do listy) renderowanego nad header w
OrderDetailPage. Po F-025 (gdzie h1 + breadcrumb znikają z page body
do compressed topbar), BackLink osierocony siedzi w pustej przestrzeni
między topbar a status pill row.

**Δ:** `BackLink` component **usunięty** z OrderDetailPage. Sidebar nav
"Wszystkie zamówienia" item zwraca dokładnie w to samo miejsce
(`/admin/orders`). Browser back button + sidebar nav razem covering
back-navigation use case bez redundancji.

**Wykonane:** F-025 follow-up (`<commit-after-this>`).

---

**Wersja 2.6** · 2026-05-19 · Warstwa 4 fix-up #5 closure
(F-018..F-025 + follow-up cleanup). AD-Δ15..18 dodają structural deltas
od bundle Stage 3 (topbar compression, shell actions scope, identity
single-source, BackLink cleanup). AD-Δ8..14 nadal obowiązują dla M-027..M-033.
Total deltas: 18.

## Architectural deltas — Warstwa 5 (Settings master-detail + Menu CRUD)

> 2026-05-19 → ongoing · M-034..M-042. Master-detail refactor Settings
> (D-005) + Menu CRUD bundle replication. AD-Δ19..ΔN dokumentują świadome
> deviations od bundle Stage 3/4 + backend touches.

### AD-Δ19: Settings extended fields per bundle Stage 4 section-general.jsx

> 2026-05-19 · Warstwa 5 · M-035 General section · Flyway V201.

Bundle Stage 4 `section-general.jsx` wymaga 4 pól które nie istniały
w `RestaurantSettings` entity / `SettingsDto`:
- **seoDescription** (max 200 znaków, w bundle "Krótki opis · Pokazany
  w meta description, do SEO")
- **googleMapsUrl** (max 500, "Link Google Maps · Wklej link Google Maps
  lub współrzędne")
- **socialFacebook** + **socialInstagram** (max 500 each, "Media
  społecznościowe · Linki pojawiają się w stopce strony")

**Δ:** Backend touch zaakceptowany per operator N10 decision (Settings
save jest w spec scope). Migration `V201__restaurant_settings_extended.sql`
dodaje 4 nullable VARCHAR kolumny. `RestaurantSettings` entity +
`SettingsDto` + `UpdateSettingsRequest` + `RestaurantSettingsService.SettingsUpdate`
+ `AdminSettingsController.update` rozszerzone. Public `/api/public/settings`
DTO też zwraca nowe pola (automatic flow through SettingsDto.from).

Frontend `SettingsDto` + `UpdateSettingsPayload` w `settingsApi.ts`
extended. `GeneralSection` RHF schema validuje 4 pola jako optional URL
(socialFacebook/socialInstagram/googleMapsUrl) lub optional string
(seoDescription).

Public landing consumer'y (Footer social links, meta description w
`<head>`, Contact Maps link) **NIE są aktywowane w M-035** — pola
zapisują się, frontend public reads ich post-MVP per Warstwa 6 polish.
PHASE5_FINDINGS pre-existing #21 (image upload) nie zmienia się przez to.

**Wykonane:** M-035 (`<commit>`).

### AD-Δ20: Hero image URL location = PageContent.hero, NOT RestaurantSettings

> 2026-05-19 · Warstwa 5 · M-035 General section · N11 decision.

Bundle Stage 4 `section-general.jsx` Grafiki card pokazuje **Logo URL +
Hero image URL** side-by-side jako pola RestaurantSettings. Current
backend ma `hero.bgImageUrl` w `PageContent` entity (key=HERO), edytowane
przez `AdminPageContentController`. Dwa źródła prawdy = ryzyko desync.

**Decision:** Hero image **pozostaje w PageContent.hero.bgImageUrl** jako
source of truth (M-037 ContentSection edytuje). M-035 General → Grafiki
card pokazuje **tylko Logo URL** + helper text linkujący do
`/admin/settings/content` dla hero edit.

**Alternatywy odrzucone:**
- Duplikat widget (read-only hero z linkiem) — UX confusion ("dlaczego nie mogę
  tu zmienić?"), partial overlap.
- Migrate hero do RestaurantSettings — duża zmiana, rozbija dotychczasowy
  page-content model (sekcje pozwalają na wielokrotny content per typ).
- Frontend reads from both DTOs — komplikuje SettingsDto bez korzyści.

**Uzasadnienie:** PageContent jest content store (Hero, About sekcje
landing page), RestaurantSettings to brand/identity store. Hero image
jest content, nie brand. Bundle Stage 4 wpisał Hero URL do General
**błędnie** — operator N11 decision świadomy mismatch.

**Wykonane:** M-035 (`<commit>`).

### AD-Δ21: PageContent active toggle per bundle Stage 4 section-content.jsx

> 2026-05-19 · Warstwa 5 · M-037 Content section · Flyway V202.

Bundle Stage 4 `section-content.jsx` HERO/ABOUT sekcje mają toggle
"Aktywne · Po wyłączeniu strona pominie sekcję". `PageContent` entity
nie miał pola active.

**Δ:** Backend touch zaakceptowany per operator N19 A decision.
Migration `V202__page_content_active.sql` dodaje `active BOOLEAN NOT NULL
DEFAULT TRUE` do `page_content`. `PageContent` entity + `PageContentDto`
+ `UpdatePageContentRequest` (@NotNull Boolean) + `PageContentService.PageContentUpdate`
+ `AdminPageContentController.update` rozszerzone.

Public consumer: `LandingPage.tsx` renderuje `<HeroSection>` /
`<AboutSection>` tylko gdy `pageContent?.{HERO|ABOUT}?.active !== false`
(fallback: gdy data undefined podczas ładowania → render z placeholderem,
nie ukrywaj).

**Dodatkowo:** `ctaHref` validation regex rozszerzony — `^((https?://|/|tel:|mailto:).+)?$`
(było `^((https?://|/).+)?$`). Powód: M-037 CTA "Kierunek" radio
generuje `tel:{phone}` href dla opcji Telefon (N20 A). `mailto:` dodany
proaktywnie dla spójności.

**Wykonane:** M-037 (`<commit>`).

### AD-Δ22: HERO subtitle max 200 (nie 160) — seed data constraint

> 2026-05-19 · Warstwa 5 · M-037 Content section · N18 deviation.

Operator N18 decision: HERO body (UI "Subtitle") max 160 znaków. Seed
demo content (`V100/V101`) HERO body ma **168 znaków** — hard limit 160
blokowałby zapis istniejącej treści.

**Δ:** Frontend Zod schema `heroSchema.subtitle` = `max(200)`, hint
"1-2 wiersze, max 200 znaków", `<Textarea maxLength={200}>`. Backend
`UpdatePageContentRequest.body` pozostaje `@Size(max=5000)` (wspólny dla
HERO+ABOUT — backend nie rozróżnia sekcji w walidacji długości; różnica
jest frontend-side per N18).

Świadome odstępstwo od N18 (160→200) — uzasadnione seed reality.
Operator może zrewidować w review jeśli 160 jest twardym wymogiem
(wtedy seed HERO body wymaga skrócenia do ≤160).

**Wykonane:** M-037 (`<commit>`).

### AD-Δ23: Seed page_content rebrand na polski (V200 partial completion)

> 2026-05-20 · Warstwa 5 · mini-fix przed M-038 · Flyway V203.

Fix-up #5 `V200__rebrand_default_tagline.sql` zrebrandowało tylko
`restaurant_settings.tagline` (włoski fine-dining demo copy → Confident
Local voice). `page_content` (HERO + ABOUT) pozostało z włoskim V100 seed
("Smak Włoch w Twoim domu", "Robimy pizzę tak, jak kochają ją Włosi…").

**Δ:** `V203__rebrand_page_content_seed.sql` dokańcza rebrand —
2 UPDATE (HERO + ABOUT) na polskie copy:
- HERO title: "Świeże pizze z dostawą do domu"
- HERO body: "Krótki czas oczekiwania, lokalne składniki. Zamów online lub
  odbierz osobiście — bez kompromisów."
- ABOUT title: "Lokalna pizzeria z pasją"
- ABOUT body: "Codziennie wypiekamy pizze ze świeżych składników od
  lokalnych dostawców…"

Idempotent / safe: WHERE matchuje pełny V100 seed (section_key + title +
body). Jeśli admin edytował sekcję przez panel — wiersz nie matchuje,
UPDATE pomija. Wzorzec spójny z V200 conditional rebrand.

**Wykonane:** Fix-up #5 completion (`<commit>`).

### AD-Δ24: Zones section — świadome bundle-deviations (Phase 7 model priority)

> 2026-05-20 · Warstwa 5 · M-038 ZonesSection · merge DeliveryZonesPage.

Bundle Stage 4 `section-zones.jsx` to mockup z konceptualnym expand
editorem. Realna funkcjonalność (Phase 7 / AD-019 delivery zones) ma
inny model danych — merge wymaga 3 świadomych odstępstw (operator N23-N26).

**Δ1 — Expand editor = realny areas-list (N23 A):** bundle expand
pokazuje 2 cards "Tryb 1 — cała miejscowość" / "Tryb 2 — konkretne kody"
jako *wybór trybu per strefa*. Realny backend: `zone.areas[]`, każdy
`area = (city, postalCode|null)`; strefa może mieć **mix** (kilka kodów +
cała-miejscowość naraz). ZonesSection expand renderuje funkcjonalny
areas-list manager (lista areas z delete + add-area form z checkbox
"cała miejscowość" lub kody textarea). Bundle Tryb1/Tryb2 = mockup, NIE
ground truth — Phase 7 model wygrywa.

**Δ2 — SaveBar dropped (N25 A):** bundle `section-zones.jsx` L250 ma
`<S.SaveBar>`. Zones CRUD = immediate-save mutations (każdy create /
update / delete / addArea / deleteArea = osobny request). Brak batch
dirty state — SaveBar nie pasuje do modelu interakcji. Dropped.

**Δ3 — Static edge-case demo cards dropped (N26 A):** bundle L213-247
"Komunikaty edge-case" = 2 statyczne cards (strefa z zamówieniami / kod
zajęty). To showcase demo. Realny feedback = dynamiczne toasty na
odpowiedź backendu (409 conflict → `toast.error(detail)`; soft-delete →
`toast.success("Strefa dezaktywowana…")`). Statyczne cards dropped.

**Phase 7 invariants — strict respect (6 punktów):** ZonesSection nie
łamie żadnego invariantu `DeliveryZoneAdminService`:
1. Soft/hard delete fallback — re-fetch po DELETE, toast rozróżnia
   ("dezaktywowana" gdy strefa wciąż w liście / "usunięta" gdy zniknęła).
2. Area uniqueness (global) — backend 409 → toast.error z detail.
3. Type/fee constraint — delegowane do `ZoneFormDialog` (PAID wymaga
   fee>0).
4. City/postal normalization — `postalCode.ts` auto-format + backend 422.
5. Override warning — `window.confirm` przed legalnym cross-zone override
   `(city, code)` nad `(city, NULL)`.
6. displayOrder — untouched (brak reorder endpoint, poza scope M-038).

**Cleanup:** `DeliveryZonesPage.tsx` + `AddAreaForm.tsx` deleted.
`AddAreaForm` UI przepisany inline w ZonesSection z tokenami v2 (logika
`parsePostalCodes` reused via import). `ZoneFormDialog.tsx` kept (modal,
shared-primitive based) + tokeny zmigrowane slate/rose → `--color-*` /
`--status-*`. `api.ts` / `types.ts` / `lib/postalCode.ts` retained
(reused; `postalCode.ts` też przez CheckoutPage).

Bundle match: ~85% — table shell 1:1, expand internals świadomy mismatch.

**Wykonane:** M-038 (`<commit>`).

### AD-Δ25: RestaurantSettings operations fields — Faza 5 M1 backend activation

> 2026-05-20 · Warstwa 5 · M-039 OperationsSection · Flyway V204.

Bundle Stage 4 `section-operations.jsx` wymaga 4 pól operacyjnych
nieistniejących w backendzie. Frontend był od dawna **pre-wired** z
graceful fallback (PHASE5_FINDINGS #1-3 "Faza 5 M1" świadomie odłożone) —
M-039 to punkt aktywacji.

**Δ:** Backend touch per operator N27. Migration
`V204__restaurant_settings_operations.sql` dodaje:
- `default_preparation_minutes INT NOT NULL DEFAULT 30`
- `min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0`
- `manual_closed_reason VARCHAR(200) NULL`
- `manual_closed_until TIMESTAMPTZ NULL`

`RestaurantSettings` entity + `SettingsDto` + `UpdateSettingsRequest`
(@Min/@Max/@DecimalMin/@DecimalMax) + `RestaurantSettingsService.SettingsUpdate`
+ `AdminSettingsController` rozszerzone. Public `/api/public/settings`
flow-through.

**Manual close semantics (N32):** `manualClosedReason` set → restauracja
zamknięta; `manualClosedUntil` przyszłość → do tego czasu, null →
bezterminowo. Service `update()` enforce: brak/pusty reason → czyści
reason + until (toggle OFF). Frontend OperationsSection: toggle ON →
reason wymagany (Zod superRefine).

**5 frontend konsumentów aktywuje się:**
1. `InfoBar` — sekcje "czas dostawy" + "min. zamówienia" renderują się
   (były skryte gdy null).
2. `CartSidebar` / `CartBottomSheet` — min-order gating aktywny gdy
   `minOrderAmount > 0`.
3. `KitchenPage` — `cel: N min` czyta realny `defaultPreparationMinutes`
   (był `?? 18` fallback).
4. `ClosedBanner` — wariant `manual` podpięty (N29 A): priorytet nad
   `planned`/`outsideHours`, message `{reason}` + ` · do HH:MM` (Warsaw
   TZ) gdy `until` w przyszłości; `until` w przeszłości → manual wygasł,
   fallthrough do logiki godzin.
5. `OperationsSection` — sama sekcja (4 SectionCard + live previews).

**Settings PUT = full-object replace:** `settingsToPayload(dto)` helper
w `settingsApi.ts` — GeneralSection (M-035) + OperationsSection (M-039)
spreadują pełny DTO i nadpisują tylko swoje pola. Zapobiega temu by
zapis jednej sekcji wyzerował pola drugiej.

**Order-creation auto-ETA NIE wired** (N30 B) — `CheckoutService` nadal
nie ustawia `etaMinutes` przy create. Patrz PHASE5_FINDINGS #25.

**Wykonane:** M-039 (`<commit>`).

### AD-Δ26: Menu list — bundle "Dodatki" tab dropped (4 taby → 3)

> 2026-05-20 · Warstwa 5 · M-040 MenuListPage · operator N5 decision.

**Numbering note:** operator N5 (podjęta podczas M-038 pre-announce)
referowała "AD-Δ19 entry" dla drop'u tab Dodatki — ale AD-Δ19 był już
zajęty przez M-035 (Settings extended fields). Entry dostaje **AD-Δ26**
(następny wolny numer). N5 reference do "AD-Δ19" = numbering correction.

Bundle Stage 3 `frame-menu.jsx` ma 4 taby: Kategorie / Produkty / Grupy
dodatków / **Dodatki**. Tab "Dodatki" (L216-221) pokazuje płaską listę
wszystkich pojedynczych addon items ("Mozzarella di bufala · Pieczarki ·
Salami · …") across all groups.

**Δ:** MenuOverviewPage ma **3 taby** (Kategorie / Produkty / Grupy
dodatków). Tab "Dodatki" dropped.

**Uzasadnienie (operator N5 B):** addon items są edytowalne w kontekście
swojej grupy przez `AddonGroupEditPage` (klik wiersza grupy → detail z
listą + CRUD addonów). Osobny płaski tab "Dodatki" agregujący wszystkie
addony cross-group to YAGNI dla single-tenant MVP — addon nie ma sensu
poza swoją grupą (grupa definiuje min/max select, required). Bundle
4-ty tab = mockup completeness, nie realny workflow.

**Wykonane:** M-040 (`<commit>`).

### AD-Δ27: Menu list — row actions Pencil+Trash zamiast bundle "···" overflow

> 2026-05-20 · Warstwa 5 · M-040 MenuListPage · operator N34 decision.

Bundle `frame-menu.jsx` wiersz produktu (L172-176) kończy się pojedynczym
`···` overflow buttonem.

**Δ:** Wiersze produktów / kategorii / grup kończą się **dwoma inline
icon buttonami** — Pencil (edytuj) + Trash (usuń) — `MenuIconButton`
primitive.

**Uzasadnienie (operator N34 A):** spójność z M-038 ZonesSection (ten
sam `IconButton` Pencil+Trash pattern) i resztą Warstwy 5. Bundle `···`
wymagałby Radix DropdownMenu komponentu — dodatkowa złożoność bez zysku
przy 2 akcjach. Świadomy mismatch vs bundle.

**Dodatkowo (M-040 minor deltas, bez osobnego AD-Δ):**
- **Brak badge column** — bundle product row pokazuje badge "Hit"/"Nowość"
  (`frame-menu.jsx` L146-153). `AdminProductDto` nie ma pola `badge` —
  kolumna pominięta. M-041 ProductEditPage może wprowadzić badge field
  jeśli operator zdecyduje (PHASES.md M-035 wspomina HIT/NOWOŚĆ/none).
- **Drag handle static** — `⋮⋮` (`GripVertical`) renderowany `cursor:grab`
  no-op; funkcjonalny dnd reorder = M-042 (N33 A — grid layout ustalony
  raz w M-040).
- Search + category filter + availability filter + paginacja zachowane
  z poprzedniej implementacji (bundle pokazuje tylko search + category
  select — current richer, funkcjonalne, nie regresujemy).

**Wykonane:** M-040 (`<commit>`).

### AD-Δ28: Product edit — Status card simplified + Sprzedaż card dropped + variant kolumny

> 2026-05-20 · Warstwa 5 · M-041 ProductEditPage · operator N38/N39 + N41.

Bundle Stage 3 `frame-product-edit.jsx` RIGHT column ma 3 cards (Zdjęcie /
Status / Sprzedaż 30 dni) gdzie Status ma 3 toggle. Backend model nie
wspiera większości.

**Δ1 — Status card 3 toggle → 1 (N38 A):** bundle Status = „Produkt
aktywny" + „Oznacz jako Hit" + „Tymczasowo niedostępny". Backend `Product`
ma tylko `available`. Current Status card = pojedynczy toggle **„Produkt
dostępny"** → `available`.
- „Oznacz jako Hit" (badge) — brak `badge` field w `Product` / DTO.
  PHASES.md M-035 wspomina badge HIT/NOWOŚĆ/none — nie zaimplementowane
  (operator N38 A: scope tight, badge nice-to-have, jeśli kiedyś →
  osobny backend touch).
- „Tymczasowo niedostępny" — semantycznie identyczne z `!available`.
  Dwa pola dostępności = mylące UX (CLAUDE.md „prostsze wygrywa").
  Dropped.

**Δ2 — „Sprzedaż 30 dni" card dropped (N39 A):** brak per-product sales
endpoint. Pokrewne PHASE5_FINDINGS #13 (Top products revenue/share)
frozen do Warstwa 6 M2. Card całkowicie usunięty. RIGHT column = Zdjęcie
+ Status + Usuń produkt.

**Δ3 — Warianty: kolumny SKU + Aktywny dropped (N41):** bundle
„Warianty rozmiaru" table (L115-169) ma kolumny drag / Nazwa / Cena /
**SKU** / **Aktywny** / ×. `AdminVariantDto` ma tylko `id / version /
productId / name / price / displayOrder` — **brak `sku`, brak `active`**.
Variant table = drag(static) / Nazwa / Cena / Kolejność / Pencil+Trash.
SKU + Aktywny columns dropped (no backend field); „Kolejność"
(`displayOrder`) dodane bo realne pole.

**Δ4 — Image upload:** „Zmień zdjęcie" upload button z bundle → URL text
input + 1:1 preview (image upload deferred, PHASE5_FINDINGS #21).

**Δ5 — Base price field:** bundle „Podstawowe" pokazuje tylko nazwa /
kategoria / opis (Margherita ma warianty, brak base price w mockupie).
Current dodaje **Cena bazowa** field do Podstawowe card — realne pole
`basePrice`, wymagane przy CREATE (backend rule: produkt musi mieć
basePrice przy tworzeniu; warianty nadpisują po fakcie). Bez tego pola
nie da się utworzyć produktu bez wariantów (napoje).

Bundle match: ~88% — layout 8fr/4fr 1:1, RIGHT column simplified.

**Wykonane:** M-041 (`<commit>`).

### AD-Δ29: M-042 Reorder — frontend-only native HTML5 DnD

> 2026-05-20 · Warstwa 5 · M-042 · operator N2 Option C + N43/N44.

**N2 discovery:** `UpdateCategoryRequest` / `UpdateProductRequest` /
`UpdateVariantRequest` — wszystkie 3 mają `int displayOrder`. Reorder
realizowalny przez istniejące PUT endpointy → **N2 Option C: zero
backend touch**, brak nowych endpointów / migracji.

**Implementacja:**
- `lib/dragReorder.ts` — `useDragReorder` hook, **native HTML5 DnD**
  (N43 A, zero-dependency). Cały wiersz `draggable`; `⋮⋮` GripVertical
  to wizualny afford. Visual feedback: dragged row `opacity 0.4`,
  drop-target `border-top 2px primary`.
- 3 listy: `CategoriesList` (M-040), `ProductsList` (M-040, conditional),
  `VariantsSection` (M-041).
- Persistence: optimistic `onMutate` setQueryData → PUT **tylko wierszy
  gdzie `displayOrder !== index`** → `Promise.all` (wiersze niezależne,
  każdy własny `version`) → `onError` rollback `setQueryData(prev)` +
  toast → `onSettled` invalidate. Zweryfikowane E2E (kategorie / warianty
  / produkty real drag + forced-404 rollback).

**N44 — products drag conditional:** drag produktów aktywny **tylko gdy**
`categoryId !== undefined && !searchTerm && page === 0 &&
availabilityFilter === "all"`. 4-ty warunek (`availabilityFilter`)
**dodany ponad operator N44** jako correctness fix — przy filtrze
dostępności `filtered` jest podzbiorem, reorder korumpowałby displayOrder
ukrytych produktów. Handle dimmed (`opacity 0.5` + `not-allowed` +
tooltip „Wybierz kategorię, aby zmienić kolejność") gdy warunki
niespełnione. Kategorie + warianty — drag zawsze aktywny.

**Keyboard-a11y reorder:** native HTML5 DnD nie wspiera klawiatury —
deferred do Warstwa 6 M-046 (PHASE5_FINDINGS #26).

**Wykonane:** M-042 (`<commit>`).

---

**Wersja 2.14** · 2026-05-20 · Warstwa 5 **complete** (M-034..M-042 +
mini-fix V203). AD-Δ19..Δ29 — total deltas: 29.
