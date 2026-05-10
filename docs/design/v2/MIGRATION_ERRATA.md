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

---

**Wersja 2.1** · 2026-05-11 · Warstwa 3a complete + Architectural deltas zsumowane.
