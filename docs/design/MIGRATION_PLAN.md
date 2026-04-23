# MIGRATION_PLAN.md — Redesign UI post-Faza 5

Plan migracji warstwy wizualnej frontendu na design z `docs/design/` bez
zmian w kontraktach API, logice biznesowej, modelu danych i routingu
React Router.

- **Status:** zaakceptowany 2026-04-22
- **Baseline commit:** `9df09a3` (import designu)
- **Branch startowy:** `phase-5` (lub nowy `redesign/g1-fundamenty`
  przy starcie Grupy 1 — do ustalenia w sesji G1)
- **Horyzont:** ~10 sesji Claude Code (jedna grupa = jedna sesja)

## Zasada naczelna

Zmienia się **tylko warstwa prezentacji**: JSX/TSX komponentów, Tailwind
klasy, CSS variables, `tailwind.config.ts`, nowe shared UI komponenty.

**Nie rusza się:**
- endpointów backendu i kontraktów API (request/response shape, status
  codes, error format RFC 7807)
- logiki biznesowej (`CheckoutService`, state machine `OrderStatus`,
  optimistic locking, server-side totals, snapshoty w `OrderItem`)
- modelu danych, encji JPA, migracji Flyway (**wyjątek akceptowany**:
  edycja `V100__seed_demo.sql` pod primary color — patrz Decyzje #1)
- routingu React Router (ścieżki URL, struktura [router.tsx](../../frontend/src/app/router.tsx))
- query keys, mutation keys, Zustand store shape ([cartStore.ts](../../frontend/src/features/public/cart/cartStore.ts)
  persist key, line key AD-014), Zod schemas

## Decyzje ostateczne pre-G1

1. **Primary color: `#FF6B35` (RGB `255 107 53`) — pomarańcz pizzeryjny.**
   Zmiana w całym projekcie, wychodząca świadomie poza "tylko UI":
   - [frontend/src/index.css](../../frontend/src/index.css) — fallback CSS variable
   - [frontend/index.html](../../frontend/index.html) — `<meta name="theme-color">`
   - [frontend/public/manifest.json](../../frontend/public/manifest.json) — `theme_color`
   - `public/favicon.svg` — jeśli kolor jest hardcoded
   - [backend/src/main/resources/db/migration/V100__seed_demo.sql](../../backend/src/main/resources/db/migration/V100__seed_demo.sql)
     — edycja in-place (istniejące DB nie odpalą V100 ponownie, bezpieczne
     dla dev; fresh bootstrap / clean Railway dostanie nowy kolor)
   - [docs/customization.md](../customization.md) — aktualizacja przykładu
   - [docs/design/README.md](README.md) — usunąć niepoprawne twierdzenie, że
     `255 107 53` to "aktualny kolor"
   - Commit tag dla tej zmiany: `chore(design): switch demo primary color
     to pizzeria orange #FF6B35 per design spec`. **Robimy to w Grupie 1.**

2. **`OrderStatusBadge` przeniesiony do `shared/components/`.** Public
   `TrackingPage` i admin (`OrdersListPage`, `OrderDetailPage`) reuse'ują
   jeden primitive. Mapping statusów zgodny z
   [status-colors.md](status-colors.md). Kasujemy lokalną `STATUS_BADGE`
   mapę w [TrackingPage.tsx:29-37](../../frontend/src/features/public/order/TrackingPage.tsx#L29-L37).

3. **Button — nowy `size="xl"`** (dodanie wariantu, addition, nie
   breaking). Wysokość `h-14` lub `h-16` (≈64px target z designu) —
   finalny wybór w sesji G1 przy porównaniu z ekranem 12. Istniejące
   użycia `size="sm|md|lg"` bez zmian.

4. **"Anuluj zamówienie" → `variant="dangerOutline"`** (nie solid
   `danger`). Zmiana user-visible, uzasadnienie: zasada designu
   "destruktywne = outline, nie solid" z
   [components.md §Button](components.md).

5. **Framer Motion — OUT of scope w G1-G9.** Animacje wyłącznie przez:
   - `tw-animate-css` (już w [package.json:30](../../frontend/package.json#L30) i
     importowany w [src/index.css:1](../../frontend/src/index.css#L1))
   - Radix `data-state=open|closed` + Tailwind modyfikatory
     `data-[state=open]:animate-in` itd.
   - CSS `@keyframes` (w `index.css` lub `tailwind.config.ts`) — np.
     `dotpulse` na aktywnym kroku timeline'u
   - W G10 framer-motion **tylko jeśli** coś ewidentnie wymaga, co tw-
     animate-css/radix nie ogarnia. Domyślnie nie dodajemy.

6. **shadcn CLI migration — NIE.** YAGNI. Zostają własne wrappery nad
   `radix-ui` w [shared/components/ui/](../../frontend/src/shared/components/ui/).
   Brak `components.json`, brak `npx shadcn diff` — akceptowany
   trade-off.

7. **Kicker — klasa utility `.kicker` w `@layer components` w `index.css`.**
   Nie komponent. Mniej plików, mniej pośrednictwa.

8. **Nominatim geocode fallback w ContactSection** — zachowujemy (Faza 5
   M6/3, commit `37cb160`). Iframe OSM + fallback na adres tekstowy przy
   geocode fail.

9. **Screenshoty before/after** — tylko w **Grupie 7** (flagship, ekran
   12). Zapis do `docs/design/before-after/g7-*.png`. Pozostałe grupy:
   manualny audit.

10. **Kolejność grup zaakceptowana:**
    `G1 → G6 → G2+G3 → G4 → G5 → G7 → G8 → G9 → G10`.

## 1. Inwentarz ekranów i komponentów

Grupowanie wg [screens-index.md](screens-index.md) (1–18). Diff dla każdego:
`1:1` / `minor refactor` / `major rebuild` / `new` / `remove`.

### Landing (sekcje publiczne, Faza 1)

| Plik | Diff |
|---|---|
| [LandingPage.tsx](../../frontend/src/features/public/landing/LandingPage.tsx) | minor refactor — sticky nav + footer zgodne z designem |
| [HeroSection.tsx](../../frontend/src/features/public/landing/HeroSection.tsx) | minor refactor — Display `text-[56px]`, kicker mono, primary CTA |
| [AboutSection.tsx](../../frontend/src/features/public/landing/AboutSection.tsx) | minor refactor — H2 `text-[28px]`, Body L, editorial layout |
| [ContactSection.tsx](../../frontend/src/features/public/landing/ContactSection.tsx) | minor refactor — kafle slate-50; Nominatim iframe zachowany |
| [OpeningHoursSection.tsx](../../frontend/src/features/public/landing/OpeningHoursSection.tsx) | minor refactor — mono dla godzin |

### Ekran 2 — Publiczne menu (Faza 2)

| Plik | Diff |
|---|---|
| [MenuPage.tsx](../../frontend/src/features/public/menu/MenuPage.tsx) | minor refactor — shell, spacing, kicker "nasze menu" |
| [CategoryTabs.tsx](../../frontend/src/features/public/menu/components/CategoryTabs.tsx) | minor refactor — sticky pill-tabs, active `bg-primary/10 text-primary` |
| [ProductCard.tsx](../../frontend/src/features/public/menu/components/ProductCard.tsx) | major rebuild — `aspect-[4/3]`, hover lift, "od X zł", stripe fallback, overlay `bg-white/70` niedostępny |

### Ekran 3 — Product modal (Faza 2)

| Plik | Diff |
|---|---|
| [ProductModal.tsx](../../frontend/src/features/public/menu/components/ProductModal.tsx) | major rebuild — desktop centered (rounded-lg, shadow-lg), mobile bottom sheet (rounded-t-xl) |
| [VariantPicker.tsx](../../frontend/src/features/public/menu/components/VariantPicker.tsx) | minor refactor — radio-tile (zaznaczony: `border-2 border-primary bg-primary/5`) |
| [AddonGroupPicker.tsx](../../frontend/src/features/public/menu/components/AddonGroupPicker.tsx) | minor refactor — checkbox z designu |

### Ekran 4 — Cart drawer (Faza 3)

| Plik | Diff |
|---|---|
| [CartButton.tsx](../../frontend/src/features/public/cart/CartButton.tsx) | 1:1 (mikro tweak badge) |
| [CartDrawer.tsx](../../frontend/src/features/public/cart/CartDrawer.tsx) | major rebuild — desktop slide-x, mobile bottom sheet, empty state z `EmptyState` primitive |
| [MobileCartBar.tsx](../../frontend/src/features/public/cart/MobileCartBar.tsx) | minor refactor — border-t slate-200 |

### Ekran 5 — Checkout (Faza 3)

| Plik | Diff |
|---|---|
| [CheckoutPage.tsx](../../frontend/src/features/public/checkout/CheckoutPage.tsx) | major rebuild — summary card restyle, radio-tiles fulfillment, sticky bottom submit mobile zachowany |

### Ekran 6 — Order confirmation (Faza 3)

| Plik | Diff |
|---|---|
| [OrderConfirmationPage.tsx](../../frontend/src/features/public/order/OrderConfirmationPage.tsx) | major rebuild — numer `mono text-[64px]` Display №, primary CTA `size="lg"`, amber notice na refreshu zachowany |

### Ekran 7 — Tracking (Faza 3)

| Plik | Diff |
|---|---|
| [TrackingPage.tsx](../../frontend/src/features/public/order/TrackingPage.tsx) | major rebuild — lokalna `STATUS_BADGE` wywalona; timeline przepisany (desktop-horizontal / mobile-vertical); **ETA dark card** (`bg-slate-900 text-white`); dotpulse na aktywnym kroku; CANCELED → rose info |

### Ekran 8 — Admin login (Faza 1)

| Plik | Diff |
|---|---|
| [LoginPage.tsx](../../frontend/src/features/admin/auth/LoginPage.tsx) | major rebuild — centered login card, `variant="secondary"` (dark) CTA |

### Ekran 9 — Admin dashboard (Faza 1+4)

| Plik | Diff |
|---|---|
| [DashboardPage.tsx](../../frontend/src/features/admin/dashboard/DashboardPage.tsx) | minor refactor — spacing, kicker, sekcja "ostatnie zamówienia" jeśli bundle dashboard ma |
| [KpiTile.tsx](../../frontend/src/features/admin/dashboard/components/KpiTile.tsx) | minor refactor — `bg-primary/10` ikonka z inner dot, wartość `text-[44px] font-semibold mono` |

### Admin shell (Fazy 1/4)

| Plik | Diff |
|---|---|
| [AdminLayout.tsx](../../frontend/src/features/admin/layout/AdminLayout.tsx) | major rebuild — sidebar `w-60` desktop, off-canvas drawer mobile; aktywny link `bg-primary/10 text-primary`; topbar z SoundToggle + Wyloguj |

### Ekran 11 — Lista zamówień (Faza 4)

| Plik | Diff |
|---|---|
| [OrdersListPage.tsx](../../frontend/src/features/admin/orders/OrdersListPage.tsx) | major rebuild — `<table table-fixed>` + `<colgroup>`, thead `bg-slate-50` z mono-caps, tbody rows z border-b, numery/kwoty mono, kropka primary + pasek dla NEW |
| [OrderFilters.tsx](../../frontend/src/features/admin/orders/components/OrderFilters.tsx) | minor refactor — toolbar size `sm`, spacing |

### Ekrany 12 + 12a + 12b — Szczegóły zamówienia (Faza 4)

**Priorytet designu — ekran 12 to flagship.**

| Plik | Diff |
|---|---|
| [OrderDetailPage.tsx](../../frontend/src/features/admin/orders/OrderDetailPage.tsx) | major rebuild — numer `mono text-[40px]`, CTA `size="xl"` (64px) dominujący z konkretnym tekstem ("Rozpocznij przygotowanie →"), **micro-helper** pod CTA ("Następnie: Gotowe do odbioru."), karty Klient/Adres/Pozycje/ETA/Akcje/Historia |
| [OrderStatusActions.tsx](../../frontend/src/features/admin/orders/components/OrderStatusActions.tsx) | major rebuild — primary CTA happy-path z microhelperem; **"Anuluj zamówienie" → `variant="dangerOutline"`** |
| [OrderStatusHistory.tsx](../../frontend/src/features/admin/orders/components/OrderStatusHistory.tsx) | minor refactor — timeline zgodny z [components.md](components.md) |
| [EtaDialog.tsx](../../frontend/src/features/admin/orders/components/EtaDialog.tsx) | minor refactor — slider lub presety w radio-tile stylu; logika (422 guard, version bump) zachowana |
| [OrderStatusBadge.tsx](../../frontend/src/features/admin/orders/components/OrderStatusBadge.tsx) | **move do `shared/components/OrderStatusBadge.tsx`** + mapping zgodny ze status-colors.md |

**Nowe:**
- `features/admin/orders/components/CancelOrderDialog.tsx` (ekran 12b)
  — osobny modal z polem "powód" + checkbox potwierdzenia

### Ekran 14 — Admin menu list (Faza 2)

| Plik | Diff |
|---|---|
| [MenuOverviewPage.tsx](../../frontend/src/features/admin/menu/MenuOverviewPage.tsx) | minor refactor |
| [CategoriesList.tsx](../../frontend/src/features/admin/menu/categories/CategoriesList.tsx) | minor refactor — tabela admin-lists |
| [ProductsList.tsx](../../frontend/src/features/admin/menu/products/ProductsList.tsx) | minor refactor — tabela z miniaturą, toggle dostępności |
| [AddonGroupsList.tsx](../../frontend/src/features/admin/menu/addon-groups/AddonGroupsList.tsx) | minor refactor — tabela |

### Ekran 15 — Admin formularz produktu (Faza 2)

| Plik | Diff |
|---|---|
| [ProductEditPage.tsx](../../frontend/src/features/admin/menu/products/ProductEditPage.tsx) | major rebuild — sekcje jako Card, preview zdjęcia `aspect-[4/3]` z stripe fallback |
| [VariantsSection.tsx](../../frontend/src/features/admin/menu/products/VariantsSection.tsx) | minor refactor |
| [AddonGroupsAttachSection.tsx](../../frontend/src/features/admin/menu/products/AddonGroupsAttachSection.tsx) | minor refactor |
| [CategoryFormDialog.tsx](../../frontend/src/features/admin/menu/categories/CategoryFormDialog.tsx) | minor refactor |
| [AddonGroupFormDialog.tsx](../../frontend/src/features/admin/menu/addon-groups/AddonGroupFormDialog.tsx) | minor refactor |
| [AddonGroupEditPage.tsx](../../frontend/src/features/admin/menu/addon-groups/AddonGroupEditPage.tsx) | minor refactor |

### Ekrany 16/17/18 — Admin ustawienia (Faza 1)

| Plik | Diff |
|---|---|
| [SettingsPage.tsx](../../frontend/src/features/admin/settings/SettingsPage.tsx) | minor refactor — layout w Card, live preview primary color po prawej |
| [OpeningHoursPage.tsx](../../frontend/src/features/admin/settings/OpeningHoursPage.tsx) | minor refactor — grid 7 dni, Switch z designu |
| [PageContentPage.tsx](../../frontend/src/features/admin/settings/PageContentPage.tsx) | minor refactor — taby HERO/ABOUT + live preview po prawej |

### Shared components

| Plik | Diff |
|---|---|
| [Button.tsx](../../frontend/src/shared/components/ui/Button.tsx) | major rebuild — **dodaj** `outline`, `dangerOutline` warianty + `size="xl"`. Istniejące zachowane. |
| [Badge.tsx](../../frontend/src/shared/components/ui/Badge.tsx) | 1:1 — warianty już zgodne |
| [Input.tsx](../../frontend/src/shared/components/ui/Input.tsx) | minor refactor — `focus:ring-primary/40`, error state support |
| [Textarea.tsx](../../frontend/src/shared/components/ui/Textarea.tsx) | minor refactor — analogicznie |
| [Label.tsx](../../frontend/src/shared/components/ui/Label.tsx) | minor refactor — `text-[13px] font-medium mb-1.5` |
| [Card.tsx](../../frontend/src/shared/components/ui/Card.tsx) | 1:1 |
| [Dialog.tsx](../../frontend/src/shared/components/ui/Dialog.tsx) | minor refactor — backdrop `bg-slate-900/40`, `shadow-lg`, tw-animate-css transitions |
| [Sheet.tsx](../../frontend/src/shared/components/ui/Sheet.tsx) | minor refactor — `rounded-t-xl` mobile |
| [Select.tsx](../../frontend/src/shared/components/ui/Select.tsx), [Checkbox.tsx](../../frontend/src/shared/components/ui/Checkbox.tsx), [Switch.tsx](../../frontend/src/shared/components/ui/Switch.tsx), [RadioGroup.tsx](../../frontend/src/shared/components/ui/RadioGroup.tsx), [Tabs.tsx](../../frontend/src/shared/components/ui/Tabs.tsx), [Table.tsx](../../frontend/src/shared/components/ui/Table.tsx) | minor refactor — tokens alignment |

### Nowe shared komponenty

| Nowy plik | Po co |
|---|---|
| `shared/components/ui/Skeleton.tsx` | Ekstrakcja inline skeletonów z `OrdersListPage`/`OrderDetailPage`/`TrackingPage` |
| `shared/components/ui/EmptyState.tsx` | Wzorzec `border-dashed slate-300 bg-slate-50 p-8 + ikona w kole + tytuł + opis` |
| `shared/components/OrderStatusBadge.tsx` | Move z `features/admin/orders/components/` — reuse public + admin |
| `features/admin/orders/components/CancelOrderDialog.tsx` | Ekran 12b jako osobny modal |
| `features/public/order/components/TrackingTimeline.tsx` | Ekstrakcja timeline (desktop-horizontal + mobile-vertical + dotpulse) |

### Do usunięcia

- Lokalna `STATUS_BADGE` mapa w [TrackingPage.tsx:29-37](../../frontend/src/features/public/order/TrackingPage.tsx#L29-L37) — zastąpiona przez współdzielony `OrderStatusBadge`.

## 2. Design tokens — audyt

### [tailwind.config.ts](../../frontend/tailwind.config.ts)

| Zmiana | Typ |
|---|---|
| `colors.primary` | już jest, 1:1 |
| `fontFamily.sans` | już jest, 1:1 |
| **Add** `fontFamily.mono: ['ui-monospace','SFMono-Regular','Menlo','monospace']` | addition |
| **Add** `transitionTimingFunction.smooth: 'cubic-bezier(0.2, 0.7, 0.3, 1)'` | addition |
| **Add** `transitionDuration.fast: '120ms'`, `base: '180ms'`, `slow: '260ms'` | addition |
| **Add** `keyframes.dotpulse` + `animation.dotpulse` | addition |
| **Add** `boxShadow.focus` (opcja) | addition |

Spacing, radii, shadows (poza focus), screens — **Tailwind defaults już
zgodne**. Zero ingerencji.

### [src/index.css](../../frontend/src/index.css)

| Zmiana | Typ |
|---|---|
| `--color-primary: 225 29 72` → `255 107 53` | **modification** (Decyzja #1) |
| **Add** `.kicker` w `@layer components` (`font-family:ui-monospace; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:rgb(148 163 184)`) | addition |
| **Add** `@keyframes dotpulse` (jeśli nie w Tailwind config) | addition |
| `.placeholder-stripes` (stripe pattern dla product fallback) | addition (opcja) |
| Inter import w `index.html` — dodać weight `800` | addition |

### shadcn `components.json`

components.json usunięty w G1 verify (commit `ed2ae2d`) — był szczątkiem
Fazy 0 bootstrap z błędnymi aliases, shadcn CLI nie jest w użyciu
(**Decyzja #6** pre-G1).

## 3. shadcn/ui — rekonfiguracja

| Komponent | Customizacja |
|---|---|
| Button | Dodaj warianty `outline`, `dangerOutline`. Dodaj `size="xl"` (h-14 lub h-16 — TBD w G1). Primary/secondary/ghost/danger/sm/md/lg zachowane. |
| Badge | Nic (already OK) |
| Input | Error state support, `focus:ring-primary/40` glow |
| Textarea | Jak Input |
| Label | `text-[13px] font-medium mb-1.5` |
| Card | Nic |
| Dialog | Backdrop + shadow + tw-animate-css transitions |
| Sheet | `rounded-t-xl` mobile |
| Select / Checkbox / Switch / RadioGroup / Tabs / Table | Tokens alignment per [components.md](components.md) |
| Skeleton (NOWY) | `bg-slate-100 animate-pulse rounded` base + composition per-screen |

Żaden komponent nie łamie z defaults shadcn w sposób który utrudniłby
`npx shadcn diff` — bo **shadcn CLI nie jest aktywny** (Decyzja #6).
Trade-off świadomie zaakceptowany.

## 4. Plan migracji w grupach

### Wspólne reguły
- Endpointy / DTO shape / query keys / mutation keys / Zustand shape /
  Zod schema — **nietykalne**
- Propsy publiczne komponentów — addition only (opcjonalne props nowe OK,
  usunięcie / rename nie)
- Smoke test end-to-end per grupa (sekcja 6)
- Before/after screenshoty tylko w **G7** (Decyzja #9)

### Grupa 1 — Fundamenty

**Cel:** tokens + shared UI primitives + Skeleton + EmptyState +
primary color swap #E11D48 → #FF6B35.

**Pliki do zmiany:**
- [frontend/tailwind.config.ts](../../frontend/tailwind.config.ts)
- [frontend/src/index.css](../../frontend/src/index.css)
- [frontend/index.html](../../frontend/index.html) (theme-color + Inter 800)
- [frontend/public/manifest.json](../../frontend/public/manifest.json) (theme_color)
- `frontend/public/favicon.svg` jeśli hardcoded kolor
- [backend/src/main/resources/db/migration/V100__seed_demo.sql](../../backend/src/main/resources/db/migration/V100__seed_demo.sql)
  (edit in-place; commit: `chore(design): switch demo primary color to
  pizzeria orange #FF6B35 per design spec`)
- [docs/customization.md](../customization.md)
- [docs/design/README.md](README.md) (naprawa niepoprawnego tekstu)
- [shared/components/ui/Button.tsx](../../frontend/src/shared/components/ui/Button.tsx)
  (warianty + size xl)
- [shared/components/ui/Input.tsx](../../frontend/src/shared/components/ui/Input.tsx)
- [shared/components/ui/Textarea.tsx](../../frontend/src/shared/components/ui/Textarea.tsx)
- [shared/components/ui/Label.tsx](../../frontend/src/shared/components/ui/Label.tsx)
- [shared/components/ui/Dialog.tsx](../../frontend/src/shared/components/ui/Dialog.tsx)
- [shared/components/ui/Sheet.tsx](../../frontend/src/shared/components/ui/Sheet.tsx)
- [shared/components/ui/Select.tsx](../../frontend/src/shared/components/ui/Select.tsx)
- [shared/components/ui/Checkbox.tsx](../../frontend/src/shared/components/ui/Checkbox.tsx)
- [shared/components/ui/Switch.tsx](../../frontend/src/shared/components/ui/Switch.tsx)
- [shared/components/ui/RadioGroup.tsx](../../frontend/src/shared/components/ui/RadioGroup.tsx)
- [shared/components/ui/Tabs.tsx](../../frontend/src/shared/components/ui/Tabs.tsx)
- [shared/components/ui/Table.tsx](../../frontend/src/shared/components/ui/Table.tsx)

**Pliki do utworzenia:**
- `frontend/src/shared/components/ui/Skeleton.tsx`
- `frontend/src/shared/components/ui/EmptyState.tsx`

**Pliki do usunięcia:** żadne.

**Zostaje 1:1:** propsy shared UI (tylko addition); themeLoader format
CSS var (`R G B`); cartStore persist key; wszystkie hooki.

**Ryzyka regresji wizualnej:**
- Label 13px (obecnie defaultowy 14px `text-sm`) → formularze subtelnie
  zwężone. Test: SettingsPage, CheckoutPage.
- Focus ring zmiana na `/40` alpha → mniej agresywny glow.
- Primary color swap → **każdy** `bg-primary`/`text-primary` w aplikacji
  zmieni hue (róż → pomarańcz). To świadoma zmiana globalna.

**Ryzyka regresji funkcjonalnej:** zero (addition only).

**Done:**
- (a) `npm run build` + `tsc -b` zielone
- (b) Manualny audit 6 ekranów (Login, Landing, Menu, Cart drawer,
  Checkout, OrderDetail): nic wizualnie nie eksploduje
- (c) Smoke DoD Faz 1-5: login, CRUD menu kategoria, złożenie
  zamówienia, tracking poll 15s, admin zmiana statusu, SSE toast

### Grupa 2 — Public shell

**Cel:** sticky nav + footer (LandingPage, MenuPage), ThemeBootstrap
audit.

**Pliki:** [LandingPage.tsx](../../frontend/src/features/public/landing/LandingPage.tsx),
[MenuPage.tsx](../../frontend/src/features/public/menu/MenuPage.tsx) (tylko header/shell),
audit [ThemeBootstrap.tsx](../../frontend/src/app/ThemeBootstrap.tsx)
i [themeLoader.ts](../../frontend/src/shared/theme/themeLoader.ts).

**Zostaje 1:1:** themeLoader format CSS var, [usePublicSettings.ts](../../frontend/src/shared/theme/usePublicSettings.ts).

**Ryzyka funkcjonalne:** ThemeBootstrap wywali się cicho przy zmianie
formatu CSS var. **Must test:** zmiana primary color w adminie →
landing refresh → nowy kolor aplikuje się.

**Done:** sticky nav mobile 375 + desktop; primary color swap end-to-end;
Network tab bez dryfu.

### Grupa 3 — Landing sekcje

**Pliki:** [HeroSection.tsx](../../frontend/src/features/public/landing/HeroSection.tsx),
[AboutSection.tsx](../../frontend/src/features/public/landing/AboutSection.tsx),
[ContactSection.tsx](../../frontend/src/features/public/landing/ContactSection.tsx),
[OpeningHoursSection.tsx](../../frontend/src/features/public/landing/OpeningHoursSection.tsx).

**Zostaje 1:1:** [useAddressGeocode.ts](../../frontend/src/shared/hooks/useAddressGeocode.ts),
[useIsRestaurantOpen.ts](../../frontend/src/shared/hooks/useIsRestaurantOpen.ts).

**Ryzyka funkcjonalne:** zachować OSM iframe + Nominatim fallback (M6/3
Fazy 5, commit `37cb160`).

**Done:** wizualne matching mobile + desktop; Network tab bez dryfu.

### Grupa 4 — Menu + Product modal + Cart drawer

**Pliki:** [MenuPage.tsx](../../frontend/src/features/public/menu/MenuPage.tsx)
(grid layout + spacing), [CategoryTabs.tsx](../../frontend/src/features/public/menu/components/CategoryTabs.tsx),
[ProductCard.tsx](../../frontend/src/features/public/menu/components/ProductCard.tsx),
[ProductModal.tsx](../../frontend/src/features/public/menu/components/ProductModal.tsx),
[VariantPicker.tsx](../../frontend/src/features/public/menu/components/VariantPicker.tsx),
[AddonGroupPicker.tsx](../../frontend/src/features/public/menu/components/AddonGroupPicker.tsx),
[CartDrawer.tsx](../../frontend/src/features/public/cart/CartDrawer.tsx),
[CartButton.tsx](../../frontend/src/features/public/cart/CartButton.tsx),
[MobileCartBar.tsx](../../frontend/src/features/public/cart/MobileCartBar.tsx).

**Zostaje 1:1:** [useMenuPrice.ts](../../frontend/src/features/public/menu/hooks/useMenuPrice.ts),
[usePublicMenu.ts](../../frontend/src/features/public/menu/hooks/usePublicMenu.ts),
[cartStore.ts](../../frontend/src/features/public/cart/cartStore.ts)
(line key AD-014, persist key `pizza-showcase-cart`), propsy
ProductModal/CartDrawer.

**Ryzyka wizualne:** touch target 44px mobile stepperów w CartDrawer
(`h-11 w-11 sm:h-9 sm:w-9` — M13 Fazy 3) **nie może się skurczyć**.

**Ryzyka funkcjonalne:** focus trap Radix w modal/sheet, Escape close,
ProductModal auto-swap maxSelect=1, CartDrawer toast "Dodano" — logika
nietknięta.

**Done:**
- (a) Wizualne matching ekrany 2, 3, 4
- (b) Smoke: wariant 30/40cm, dodatek, dodaj do koszyka, AD-014 kleje
  identyczne linie, usuń, clear
- (c) Network: `/api/public/menu` niezmieniony

### Grupa 5 — Checkout + Confirmation + Tracking

**Pliki:** [CheckoutPage.tsx](../../frontend/src/features/public/checkout/CheckoutPage.tsx),
[OrderConfirmationPage.tsx](../../frontend/src/features/public/order/OrderConfirmationPage.tsx),
[TrackingPage.tsx](../../frontend/src/features/public/order/TrackingPage.tsx)
(duży rebuild).

**Nowe:** `features/public/order/components/TrackingTimeline.tsx`.

**Zostaje 1:1:** `refetchInterval` 15s + TERMINAL guard
([TrackingPage.tsx:62-76](../../frontend/src/features/public/order/TrackingPage.tsx#L62-L76)),
404 handling, `extractProblem`, cart clear + navigate w mutation,
guard pustego koszyka, `useIsRestaurantOpen` banner (M6/2 Fazy 5),
sticky bottom submit mobile, amber notice na refresh confirmation.

**Ryzyka wizualne:** dotpulse keyframe musi trafić do bundled CSS.
**Ryzyka funkcjonalne:** zero (logika pre-checked).

**Done:**
- (a) Wizualne matching ekrany 5, 6, 7
- (b) **Full smoke e2e** (spec sekcja 6)
- (c) Network: `/api/public/orders` POST + `/track/{token}` 15s polling,
  zero extra endpointów

### Grupa 6 — Admin shell + Login + Dashboard

**Pliki:** [LoginPage.tsx](../../frontend/src/features/admin/auth/LoginPage.tsx),
[AdminLayout.tsx](../../frontend/src/features/admin/layout/AdminLayout.tsx)
(major — sidebar + mobile drawer), [DashboardPage.tsx](../../frontend/src/features/admin/dashboard/DashboardPage.tsx),
[KpiTile.tsx](../../frontend/src/features/admin/dashboard/components/KpiTile.tsx),
[SoundToggle.tsx](../../frontend/src/features/admin/realtime/SoundToggle.tsx)
(tylko styling).

**Zostaje 1:1:** [useAdminOrderFeed.ts](../../frontend/src/features/admin/realtime/useAdminOrderFeed.ts)
(SSE hook), [authStore.ts](../../frontend/src/shared/auth/authStore.ts),
KPI click-through logic, polling 15s summary.

**Ryzyka funkcjonalne:** AdminLayout rebuild nie może spowodować
re-mounta `useAdminOrderFeed` (spam EventSource reconnect). **Must
test:** SSE stream w Network tab po rebuild pozostaje stabilny.

**Done:** login → dashboard → 3 KPI → klik "Nowe dziś" → OrdersListPage
z prefiltrem; SSE `READY` event nadal przychodzi.

### Grupa 7 — Admin Orders (flagship, screenshoty before/after)

**Pliki:**
- [OrdersListPage.tsx](../../frontend/src/features/admin/orders/OrdersListPage.tsx)
- [OrderFilters.tsx](../../frontend/src/features/admin/orders/components/OrderFilters.tsx)
- [OrderDetailPage.tsx](../../frontend/src/features/admin/orders/OrderDetailPage.tsx) (priorytet)
- [OrderStatusActions.tsx](../../frontend/src/features/admin/orders/components/OrderStatusActions.tsx) (`dangerOutline` dla Anuluj)
- [OrderStatusHistory.tsx](../../frontend/src/features/admin/orders/components/OrderStatusHistory.tsx)
- [EtaDialog.tsx](../../frontend/src/features/admin/orders/components/EtaDialog.tsx)
- [OrderStatusBadge.tsx](../../frontend/src/features/admin/orders/components/OrderStatusBadge.tsx) → **move do `shared/components/`**

**Nowe:**
- `features/admin/orders/components/CancelOrderDialog.tsx` (ekran 12b)
- Opcjonalnie `features/admin/orders/components/PrimaryActionCta.tsx`
  (CTA 64px + micro-helper). Alternatywnie inline.

**Screenshoty before/after:** `docs/design/before-after/g7-orders-list-desktop.png`,
`g7-orders-list-mobile.png`, `g7-order-detail-desktop.png`,
`g7-order-detail-mobile.png`, `g7-cancel-dialog.png`, `g7-eta-dialog.png`.

**Zostaje 1:1:** [transitions.ts](../../frontend/src/features/admin/orders/lib/transitions.ts)
(AD-017 FE mirror), mutation keys, 409 handling, 422 toast
`extractProblem`, polling 10s, invalidate list + detail.

**Ryzyka wizualne:** CTA 64px wymaga size `xl` z G1; długie etykiety PL
w tym buttonie.
**Ryzyka funkcjonalne:** destructive dialog focus trap; micro-helper
text dynamicznie z `allowedTransitions(status, fulfillmentType)`;
Anuluj dostępny mimo `dangerOutline`.

**Done:**
- (a) Wizualne matching ekrany 11, 12, 12a, 12b + screenshoty zapisane
- (b) **Full smoke:** lista, filtr `status=NEW`, detail, Potwierdź
  (CTA 64px) → CONFIRMED, ETA dialog 30min, Anuluj dialog z powodem +
  checkbox → CANCELED, test 409 (dwa taby)
- (c) Network: `GET /admin/orders`, `PATCH /status`, `PATCH /eta`, SSE
  stream live

### Grupa 8 — Admin Menu CRUD

**Pliki:** [MenuOverviewPage.tsx](../../frontend/src/features/admin/menu/MenuOverviewPage.tsx),
[CategoriesList.tsx](../../frontend/src/features/admin/menu/categories/CategoriesList.tsx),
[CategoryFormDialog.tsx](../../frontend/src/features/admin/menu/categories/CategoryFormDialog.tsx),
[ProductsList.tsx](../../frontend/src/features/admin/menu/products/ProductsList.tsx),
[ProductEditPage.tsx](../../frontend/src/features/admin/menu/products/ProductEditPage.tsx),
[VariantsSection.tsx](../../frontend/src/features/admin/menu/products/VariantsSection.tsx),
[AddonGroupsAttachSection.tsx](../../frontend/src/features/admin/menu/products/AddonGroupsAttachSection.tsx),
[AddonGroupsList.tsx](../../frontend/src/features/admin/menu/addon-groups/AddonGroupsList.tsx),
[AddonGroupFormDialog.tsx](../../frontend/src/features/admin/menu/addon-groups/AddonGroupFormDialog.tsx),
[AddonGroupEditPage.tsx](../../frontend/src/features/admin/menu/addon-groups/AddonGroupEditPage.tsx).

**Zostaje 1:1:** Zod schemas, **version field round-trip** (hotfix Fazy 2
— critical, nie gubić), PATCH availability, invalidate keys (admin +
public menu).

**Done:** wizualne matching ekrany 14, 15; smoke: CRUD kategoria +
produkt + URL preview + toggle + wariant + podpięcie grupy; 409 test.

### Grupa 9 — Admin Settings

**Pliki:** [SettingsPage.tsx](../../frontend/src/features/admin/settings/SettingsPage.tsx),
[OpeningHoursPage.tsx](../../frontend/src/features/admin/settings/OpeningHoursPage.tsx),
[PageContentPage.tsx](../../frontend/src/features/admin/settings/PageContentPage.tsx).

**Zostaje 1:1:** Zod transform fix (hotfix Fazy 3 build-unblocker),
walidacja `open<close`, tabs HERO/ABOUT, mutation invalidate.

**Done:** wizualne matching ekrany 16, 17, 18; primary color swap
end-to-end landing refresh.

### Grupa 10 — Polish przekrojowy

**Cel:**
- tw-animate-css transitions na Dialog/Sheet (dur 260ms, easing
  `cubic-bezier(0.2, 0.7, 0.3, 1)`)
- radix `data-state=open|closed` +  `data-[state=*]:animate-in`
- CSS `@keyframes dotpulse` na aktywnym kroku timeline (już w G1)
- Mobile 375px audit end-to-end
- Empty states spójne z `EmptyState` primitive
- Framer Motion **tylko jeśli** coś krzyczy (Decyzja #5)

**Zostaje 1:1:** radix focus trap, aria, keyboard nav.

**Done:** transitions widoczne (modal fade+scale, sheet slide); mobile
375 audit bez regresji; pełen DoD Faz 1-5.

## 5. Kolejność i zależności

```
G1 (fundamenty)
  ├─► G6 (admin shell + login + dashboard)
  │     ├─► G7 (admin orders — flagship)
  │     ├─► G8 (admin menu CRUD)
  │     └─► G9 (admin settings)
  └─► G2 (public shell)
        ├─► G3 (landing)
        └─► G4 (menu/modal/cart)
              └─► G5 (checkout/confirm/tracking)

G10 (polish) — po wszystkim
```

**Zatwierdzona sekwencja sesji (Decyzja #10):**

1. **G1** — fundamenty
2. **G6** — admin shell
3. **G2 + G3** — public shell + landing
4. **G4** — menu + modal + cart
5. **G5** — checkout + confirm + tracking
6. **G7** — admin orders (flagship, screenshoty)
7. **G8** — admin menu CRUD
8. **G9** — admin settings
9. **G10** — polish

## 6. Strategia weryfikacji regresji

### Spec smoke test end-to-end

1. **Landing:** sticky nav + hero; primary color swap w adminie
   propaguje się po refresh
2. **Menu:** pill-tabs kategorii; modal produktu; wariant 30/40cm
   zmienia cenę live; checkbox dodatku aktualizuje cenę
3. **Cart:** dodaj → badge++; drawer; qty++ klei identyczne konfiguracje
   (AD-014); usuń; empty state
4. **Checkout:** guard pusty → `/menu`; DELIVERY vs PICKUP; submit → 201
5. **Confirmation:** numer mono XL; CTA śledź; refresh → amber notice
6. **Tracking:** status NEW + timeline; 15s polling; admin zmienia
   CONFIRMED → klient widzi w ≤15s; ETA z admina widoczne
7. **Admin login:** 11 wrong → 429 rate limit; correct → dashboard
8. **Dashboard:** 3 KPI; klik "Nowe dziś" → lista `?status=NEW`
9. **OrdersListPage:** tabela, filtry, paginacja, detail, polling 10s
10. **OrderDetailPage:** CTA 64px primary; ETA dialog; cancel dialog
    (powód + checkbox); historia; 409 test (dwa taby); SSE toast
11. **Admin menu:** CRUD kategoria/produkt/wariant/grupa; version 409
12. **Admin settings:** primary color preview live → refresh landing;
    opening hours; HERO/ABOUT save

### Network tab guard

Przed grupą: zapis endpointów dla ekranów w scope (DevTools Network →
Fetch/XHR + EventStream). Po grupie: diff zero. **Jakikolwiek nowy
endpoint = dryf, abort grupy.**

### Checklist per grupa

- DoD odpowiednich faz z [PHASES.md](../PHASES.md) dla ekranów grupy
- `npm run build` + `tsc -b` zielone
- Backend integration tests nie ruszane — frontend nie modyfikuje
  kontraktu
- Manualny audit mobile 375 + desktop 1280
- Commit z tagiem `design(gN): <zakres>`

## 7. Ryzyka globalne

1. **Primary color swap touch-points.** Zmiana dotyka 8+ plików (index.css,
   index.html, manifest.json, favicon.svg?, V100, customization.md,
   README design, ewentualnie testy). Wszystkie muszą być spójne po G1 —
   inaczej fresh bootstrap wyświetli mix róża/pomarańcza.

2. **Tracking DTO nie zawiera history statusów.** Timeline wyliczamy
   tylko z current `status` + `fulfillmentType`. Brak timestampów per
   krok ("Potwierdzono o 14:32"). Akceptowalne dla ekranu 7. Gdyby
   design tego wymagał — **wychodzi poza scope "tylko UI"**, flagujemy
   przed G5.

3. **CTA 64px — size `xl` w Button.** Addition, nie breaking. Finalny
   wybór `h-14` (56px) vs `h-16` (64px) vs custom — w G1 po porównaniu
   z ekranem 12 z bundle.

4. **Zmiana `danger` solid → `dangerOutline` dla Anuluj.** User-visible,
   uzasadnienie w [components.md §Button](components.md). Reviewer może
   zapytać "dlaczego była solid" — odpowiedź w commit message.

5. **tw-animate-css + radix data-state ma wystarczyć** (Decyzja #5).
   Ryzyko: jakiś edge case transition nie da się zrealizować bez framer.
   G10 decyzja eskalacyjna — **domyślnie nie dodajemy**.

6. **Skeleton extraction musi być powierzchowna.** Per-screen skeleton
   composition zachowana; tylko `bg-slate-100 animate-pulse rounded`
   bazowy klocek ekstrahowany.

7. **ThemeBootstrap format CSS var `R G B` (bez rgb(), bez %).** Nie
   zmieniać formatu — `applyPrimaryColor` wymaga `R G B`. Audit w G2.

8. **shadcn CLI nieaktywny (brak `components.json`)** — akceptowany
   trade-off (Decyzja #6). Brak `shadcn diff`, brak ucieczki w updatach
   radix. OK dla template.

9. **Inter weight 800** — dodać do Google Fonts URL w `index.html`.

10. **Touch targets mobile 44px** w CartDrawer stepperach (M13 Fazy 3)
    — zachować `h-11 w-11 sm:h-9 sm:w-9`.

11. **AdminLayout rebuild (G6)** nie może spowodować re-mounta
    `useAdminOrderFeed` — spam EventSource reconnect. Stabilny mount
    point.

12. **Version field w dialogach menu (G8)** — hotfix Fazy 2, nie gubić
    w round-trip przy refactorze.

## 8. Estymacja (S/M/L, skala względna)

| Grupa | Rozmiar | Ryzyko |
|---|---|---|
| G1 — Fundamenty | **M** | **WYSOKIE** (blocker + primary color swap globalny) |
| G2 — Public shell | S | Niskie |
| G3 — Landing | S | Niskie |
| G4 — Menu + Modal + Drawer | **L** | Średnie |
| G5 — Checkout + Confirm + Tracking | **L** | **WYSOKIE** (tracking + dotpulse + dark ETA) |
| G6 — Admin shell + Login + Dashboard | M | Średnie (SSE stability) |
| G7 — Admin Orders (flagship) | **L** | **WYSOKIE** (ekran 12 + CTA 64px + cancel + 409/422) |
| G8 — Admin Menu CRUD | M | Niskie |
| G9 — Admin Settings | S | Niskie |
| G10 — Polish | M | Średnie |

~10 sesji Claude Code, każda: plan → akceptacja → implementacja →
smoke → commit.

## 9. Start-G1 checklist

Przed rozpoczęciem Grupy 1:
- [x] Plan zaakceptowany i zapisany
- [ ] Nowa sesja Claude Code (plan mode)
- [ ] Potwierdzenie branchu (`phase-5` lub nowy `redesign/g1-fundamenty`)
- [ ] Plan G1 pre-announce: dokładna lista plików + zmian (wg sekcji 4)
- [ ] User akceptuje ("ok")
- [ ] Implementacja (w tym primary color swap + V100 edit)
- [ ] Smoke DoD G1 (sekcja 4)
- [ ] Commity (milestone per logiczny krok; osobny commit `chore(design):
      switch demo primary color to pizzeria orange #FF6B35 per design
      spec` dla primary color swap)
