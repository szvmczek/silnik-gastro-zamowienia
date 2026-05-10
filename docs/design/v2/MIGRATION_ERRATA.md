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

**Wersja 2.0** · 2026-05-10 · Stage 5 setup delta nad commit 679a965.
