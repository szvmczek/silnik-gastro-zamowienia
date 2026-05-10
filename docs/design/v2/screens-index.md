# screens-index.md — mapping ekran → bundle → kod

> **Stage 5 · Polish & handoff.** Wersja 2.0 · 2026-05-10.
>
> Phase 5 Claude Code zaczyna implementację konkretnego ekranu? Otwiera ten
> plik, znajduje swój wiersz, dostaje: bundle referencja → plik kodu →
> współdzielone → notatka. Każdy task `M-XXX` w `MIGRATION_PLAN.md`
> referuje ten indeks.

---

## Buckety mapowania

Ekrany są w jednym z trzech bucketów:

- **Bundle 1:1** — pełny mockup w `v2-stage{1..4}/`. Phase 5 implementuje wzorując się na bundle wprost.
- **DONE v1 retrofit** — ekran istnieje w kodzie z Fazy 4.5, brak pełnego mockupu w v2. Phase 5 podmienia tokeny, używa patternów Stage 1, zachowuje logikę.
- **Build new** — brak. Wszystkie ekrany są albo w bundle, albo DONE v1.

Każdy wiersz tabel niżej oznaczony jest bucketem w kolumnie *Notatka*.

---

## Shared chrome & komponenty bazowe

Implementuje się PIERWSZE (warstwy 1-2 w `MIGRATION_PLAN.md`), bo wszystkie ekrany ich używają.

| # | Komponent | Bundle ref | Plik kodu | Notatka |
|---|---|---|---|---|
| 1 | Tokens CSS | `v2/tokens.css` | `frontend/src/styles/tokens.css` | Source of truth — kolory, typo, spacing, radii, shadows, motion. Identyczne we wszystkich Stage'ach. |
| 2 | Button warianty | `v2/components.jsx` | `frontend/src/shared/components/ui/Button.tsx` | Primary / ghost / outline / icon. Używa `--color-primary`. |
| 3 | Input / Textarea | `v2/components.jsx` + `v2-stage4/section-general.jsx` | `frontend/src/shared/components/ui/Input.tsx` | Label + error + helper text. Walidacja inline. |
| 4 | Badge / Pill | `v2/components.jsx` | `frontend/src/shared/components/ui/Badge.tsx` | Warianty neutral / primary / status. |
| 5 | Status pill (orders) | `v2-stage3/admin-shared.jsx` (window.A) | `frontend/src/shared/components/ui/StatusPill.tsx` | 7 statusów z `--status-*` tokens (D-009). |
| 6 | Icon set | `v2-stage3/admin-shared.jsx` (A.Icons) | `frontend/src/shared/components/ui/Icon.tsx` | Lucide-style 24px stroke 1.7. ~30 ikon w bundlu. |
| 7 | Kicker | `v2/patterns.jsx` | `frontend/src/shared/components/typography/Kicker.tsx` | Editorial label uppercase 600 / 0.06em nad headlines. |
| 8 | InfoBar | `v2/patterns.jsx` + `v2-stage2/landing-shared.jsx` | `frontend/src/shared/components/info-bar/InfoBar.tsx` | Czarny pasek pod hero. Open/closed states z `--bg-dark`. |
| 9 | Timeline (5 dotów) | `v2/patterns.jsx` (DSTimelineH / DSTimelineV) | `frontend/src/shared/components/timeline/Timeline.tsx` | Horizontal desktop / vertical mobile. Dot-pulse aktywny krok. Polling 15s. |
| 10 | FreeDeliveryProgress | `v2-stage2/landing-shared.jsx` | `frontend/src/shared/components/cart/FreeDeliveryProgress.tsx` | Pasek progress „brakuje X zł do darmowej dostawy". |
| 11 | ProductCard | `v2-stage2/landing-shared.jsx` | `frontend/src/shared/components/product/ProductCard.tsx` | Karta produktu z menu. Quick-add, badge HIT/NOWOŚĆ. |
| 12 | ClosedBanner (3 warianty) | `v2-stage2/landing-shared.jsx` | `frontend/src/shared/components/banners/ClosedBanner.tsx` | Planned / manual / outside-hours. Globalny przez Outlet. |
| 13 | PublicHeader (desktop + mobile) | `v2-stage2/landing-shared.jsx` | `frontend/src/shared/components/layout/PublicHeader.tsx` | Logo + nav + cart icon. Mobile: hamburger. |
| 14 | PublicFooter | `v2-stage2/landing-shared.jsx` | `frontend/src/shared/components/layout/PublicFooter.tsx` | Adres + telefon + godziny + kontakt. |
| 15 | AdminSidebar | `v2-stage3/admin-shared.jsx` | `frontend/src/shared/components/layout/AdminSidebar.tsx` | 3 sekcje: OPERACYJNE / ARCHIWUM / KONFIGURACJA. Sticky. |
| 16 | AdminTopbar | `v2-stage3/admin-shared.jsx` | `frontend/src/shared/components/layout/AdminTopbar.tsx` | Breadcrumb + bell + user account chip. |
| 17 | AdminLayout | `v2-stage3/admin-shared.jsx` | `frontend/src/shared/components/layout/AdminLayout.tsx` | Orchestrator z `<Outlet />` per route. |
| 18 | SettingsLayout | `v2-stage4/settings-shared.jsx` | `frontend/src/features/admin/settings/SettingsLayout.tsx` | Master-detail 240px nav + content. Mobile: dropdown + accordion (D-014). |
| 19 | SettingsStub | `v2-stage4/section-stubs.jsx` | `frontend/src/features/admin/settings/SettingsStub.tsx` | Reusable placeholder dla 3 stub sections (D-006). |

---

## Public flow (Bundle 1:1)

Faza implementacji: **warstwa 3** w `MIGRATION_PLAN.md`.

| # | Ekran | Route | Bundle ref | Plik kodu | Notatka |
|---|---|---|---|---|---|
| 20 | Landing desktop | `/` | `v2-stage2/landing-desktop.jsx` + `landing-shared.jsx` | `frontend/src/features/public/landing/LandingPage.tsx` | Hero + InfoBar + About + Hours + Contact + Footer. Bez menu, bez cart. |
| 21 | Landing mobile | `/` (`<768px`) | `v2-stage2/landing-mobile.jsx` | (jw.) responsive | Stack jednokolumnowy. |
| 22 | Menu desktop | `/menu` | `v2-stage2/menu-desktop.jsx` | `frontend/src/features/public/menu/MenuPage.tsx` | Scroll-spy categoryNav + grid produktów + sticky CartSidebar 360px. |
| 23 | Menu mobile | `/menu` (`<1024px`) | `v2-stage2/menu-mobile.jsx` | (jw.) responsive | Sticky chips kategorii + lista produktów + MobileCartBar + bottom sheet. |
| 24 | Product modal | open from `/menu` | `v2-stage2/product-modal.jsx` | `frontend/src/features/public/menu/ProductModal.tsx` | Wariant „klassyk" — bez configów rozmiar/dodatki w MVP, tylko qty + customer notes. |
| 25 | Cart sidebar — empty | `/menu` desktop | `v2-stage2/cart.jsx` (CartSidebar) | `frontend/src/shared/components/cart/CartSidebar.tsx` | Stan: pusty (placeholder „Tu pojawi się Twoje zamówienie"). |
| 26 | Cart sidebar — 3 items | (jw.) | (jw. CartSidebar) | (jw.) | Stan: pełna lista, FreeDeliveryProgress, totals, CTA. |
| 27 | Cart sidebar — 5+ items | (jw.) | (jw. CartSidebar) | (jw.) | Stan: scrollable lista, free delivery filled, upsell section. |
| 28 | Mobile cart bar | `/menu` mobile | `v2-stage2/cart.jsx` (MobileCartBar) | `frontend/src/shared/components/cart/MobileCartBar.tsx` | Floating bottom bar z sumą + count + tap → otwiera bottom sheet. |
| 29 | Mobile cart bottom sheet | tap MobileCartBar | `v2-stage2/cart.jsx` (CartBottomSheet) | `frontend/src/shared/components/cart/CartBottomSheet.tsx` | 90vh sheet, swipe-down close, jednolity scroll. |
| 30 | Upsell section („A może jeszcze?") | cart desktop+mobile | `v2-stage2/cart.jsx` (UpsellSection) | `frontend/src/shared/components/cart/UpsellSection.tsx` | 3 kompaktowe karty 64px, fade+slide-out po add. |

---

## Public DONE v1 retrofit

**Brak pełnych mockupów w bundle.** Phase 5 retrofituje istniejący kod z Fazy 4.5.

| # | Ekran | Route | Bundle ref (patterns) | Plik kodu | Notatka |
|---|---|---|---|---|---|
| 31 | Checkout | `/checkout` | `v2/tokens.css` + `v2-stage4/section-general.jsx` (form pattern) + `v2-stage2/landing-shared.jsx` (Header/Footer) | `frontend/src/features/public/checkout/CheckoutPage.tsx` | **Retrofit.** 2 kol desktop (form lewo + sticky summary prawo). Walidacja Zod/RHF NIE RUSZAĆ. DeliveryZoneBadge stylowany pod paletę v2. |
| 32 | Confirmation | `/order/:token` | `v2/tokens.css` + `v2-stage2/landing-shared.jsx` (Header/Footer) | `frontend/src/features/public/confirmation/ConfirmationPage.tsx` | **Retrofit.** Numer zamówienia mono XL (32-40px). „Dziękujemy za zamówienie!" headline 36px/600. CTA „Śledź zamówienie" → `/track/:token`. |
| 33 | Tracking | `/track/:token` | `v2/patterns.jsx` (TimelineH + TimelineV) + `v2/tokens.css` | `frontend/src/features/public/tracking/TrackingPage.tsx` | **Retrofit.** Wymienić istniejący stepper na TimelineH/V 1:1. ETA card slate-900. Polling 15s NIE RUSZAĆ. Lista pozycji jak w Confirmation. |

---

## Admin operacyjne (Bundle 1:1)

Faza implementacji: **warstwa 4** w `MIGRATION_PLAN.md`.

| # | Ekran | Route | Bundle ref | Plik kodu | Notatka |
|---|---|---|---|---|---|
| 34 | Login | `/admin/login` | `v2-stage3/frame-login.jsx` | `frontend/src/features/admin/login/LoginPage.tsx` | Standalone (bez AdminLayout). Variant `error` dla 401. |
| 35 | Pulpit (Dashboard) | `/admin` | `v2-stage3/frame-dashboard.jsx` | `frontend/src/features/admin/dashboard/DashboardPage.tsx` | 4 KPI + 2 Recharts + top produkty + status tiles. Recharts już zainstalowane. |
| 36 | Kuchnia | `/admin/kitchen` | `v2-stage3/frame-kitchen.jsx` | `frontend/src/features/admin/kitchen/KitchenPage.tsx` | 3-step state machine NEW → CONFIRMED → IN_PREPARATION → READY (D-004, AD-021). 3 CTA per karta. SSE z bundla jako `sseSimulate` toggle — w prod prawdziwy SSE. |
| 37 | Kuchnia tablet | (jw. `<1280px`) | `v2-stage3/frame-kitchen.jsx` (density="compact") | (jw.) responsive | Compact density, te same kroki. |
| 38 | Wydanie (Pickup) | `/admin/pickup` | `v2-stage3/frame-pickup.jsx` | `frontend/src/features/admin/pickup/PickupPage.tsx` | Tabela z imieniem klienta + telefon (focal). Lista pozycji. |
| 39 | Dostawa desktop | `/admin/delivery` | `v2-stage3/frame-delivery.jsx` | `frontend/src/features/admin/delivery/DeliveryPage.tsx` | „Nawiguj" CTA → tel: lub Google Maps. |
| 40 | Dostawa mobile (kurier) | `/admin/delivery` mobile | `v2-stage3/frame-delivery.jsx` (`mobile` prop) | (jw.) responsive | Optymalizacja pod kuriera w terenie. |
| 41 | Wszystkie zamówienia | `/admin/orders` | `v2-stage3/frame-orders.jsx` | `frontend/src/features/admin/orders/OrdersPage.tsx` | Tabela z filtrami + flash zielony dla nowych. |
| 42 | Order detail | `/admin/orders/:id` | `v2-stage3/frame-order-detail.jsx` | `frontend/src/features/admin/orders/OrderDetailPage.tsx` | Pozycje + Płatność + History (kto zmienił status). |

---

## Admin konfiguracja (Bundle 1:1)

Faza implementacji: **warstwa 5** w `MIGRATION_PLAN.md`.

| # | Ekran | Route | Bundle ref | Plik kodu | Notatka |
|---|---|---|---|---|---|
| 43 | Menu CRUD lista | `/admin/menu` | `v2-stage3/frame-menu.jsx` | `frontend/src/features/admin/menu/MenuListPage.tsx` | Lista kategorii + lista produktów + drag handle (`A.Icons.drag`). |
| 44 | Product edit | `/admin/menu/:id` | `v2-stage3/frame-product-edit.jsx` | `frontend/src/features/admin/menu/ProductEditPage.tsx` | Forma produktu (nazwa, opis, cena, badge, kategoria, foto URL). |
| 45 | Settings — Ogólne | `/admin/settings` (default) | `v2-stage4/section-general.jsx` | `frontend/src/features/admin/settings/sections/GeneralSection.tsx` | Identyfikacja + Kontakt + Marka kolor (6 palet + HEX). |
| 46 | Settings — Godziny otwarcia | `/admin/settings/hours` | `v2-stage4/section-hours.jsx` | `.../sections/HoursSection.tsx` | Toggle per dzień + time pickers + „Skopiuj na inne dni" + preview. |
| 47 | Settings — Treści strony | `/admin/settings/content` | `v2-stage4/section-content.jsx` | `.../sections/ContentSection.tsx` | Tabs Hero / O nas. Live preview prawej kolumnie. |
| 48 | Settings — Strefy dostawy | `/admin/settings/zones` | `v2-stage4/section-zones.jsx` | `.../sections/ZonesSection.tsx` | CRUD stref. Tryb 1 (cała miejscowość) / Tryb 2 (konkretne kody). Edge-case messages. **Phase 7** dorzuca geo-walidację (D-012). |
| 49 | Settings — Operacje | `/admin/settings/operations` | `v2-stage4/section-operations.jsx` | `.../sections/OperationsSection.tsx` | 4 karty: Domyślny ETA / **Minimum zamówienia (D-013)** / Tymczasowe zamknięcie / Metody płatności (gotówka only, D-007). Kolejność na mobile (D-015). |
| 50 | Settings — Powiadomienia | `/admin/settings/notifications` | `v2-stage4/section-stubs.jsx` | `.../sections/NotificationsSection.tsx` | Stub. Copy: „Dostępne w przyszłej aktualizacji." (D-006). |
| 51 | Settings — Limity zamówień | `/admin/settings/capacity` | `v2-stage4/section-stubs.jsx` | `.../sections/LimitsSection.tsx` | Stub. CTA „Otwórz Operacje" deflectuje do `/admin/settings/operations`. |
| 52 | Settings — RODO i regulaminy | `/admin/settings/legal` | `v2-stage4/section-stubs.jsx` | `.../sections/LegalSection.tsx` | Stub. CTA „Zobacz domyślny tekst zgody" otwiera modal z hardcoded copy. |

---

## Mobile audit (cross-cutting, warstwa 6)

Bundle pokazuje mobile dla większości ekranów wprost. Phase 5 trzyma się ich:

- **Public:** `v2-stage2/landing-mobile.jsx`, `menu-mobile.jsx`, `cart.jsx` (CartBottomSheet, MobileCartBar)
- **Admin Kuchnia:** tablet 1024 (`density="compact"`)
- **Admin Dostawa mobile:** dla kuriera w terenie
- **Settings mobile:** accordion z dropdown nawigacji (D-014)
- **Operacje mobile:** kolejność kart (D-015)

---

**Wersja 2.0** · 2026-05-10 · Stage 5 final.
