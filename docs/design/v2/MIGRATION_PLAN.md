# MIGRATION_PLAN.md — v2 → Phase 5 implementacja

> **Stage 5 · Polish & handoff.** Wersja 2.0 · 2026-05-10.
>
> Tasklista 48 zadań w 6 warstwach do zaimplementowania w Phase 5
> (Claude Code). Każdy task ma plik kodu, bundle ref, co zmienić,
> backend impact, złożoność, zależności.
>
> **Zasada nadrzędna: Phase 5 to retrofit warstwy wizualnej, nie
> refactor logiki.** Hooki, query keys, mutation keys, DTO, walidacja
> Zod, schema bazy — bez zmian. Patrz `docs/CURRENT_STATE.md` G6-G9
> dla wzorca zachowania logiki.
>
> **Format taska:**
> ```
> #### M-XXX: Tytuł
> **Plik kodu:** ścieżka.tsx
> **Bundle:** ścieżka.jsx (lub patterns dla DONE v1 retrofit)
> **Zmiana:** krótko
> **Backend:** zero / rzadko coś
> **Złożoność:** S (≤30min) / M (1-2h) / L (pół dnia)
> **Zależy od:** M-YYY
> ```

---

## Warstwa 1 — Tokens & komponenty bazowe

Implementuje się **pierwsze**, bo wszystko z niej korzysta. **Po tej
warstwie STOP, czekaj na review** zanim ruszysz Warstwę 2.

#### M-001: Skopiuj tokens.css do frontend
**Plik kodu:** `frontend/src/styles/tokens.css` (nowy lub podmień istniejący)
**Bundle:** `docs/design/v2/tokens.css`
**Zmiana:** skopiuj 1:1 cały plik. Dodaj `@import './tokens.css'` do głównego
`index.css`. Zostaw też istniejący Tailwind config — tokeny mają być pod CSS
custom properties, Tailwind używa ich przez `var(--color-primary)` w utility
classes (`bg-[var(--color-primary)]`) lub przez extend w `tailwind.config.ts`.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** —

#### M-002: Button warianty
**Plik kodu:** `frontend/src/shared/components/ui/Button.tsx`
**Bundle:** `docs/design/v2/components.jsx`
**Zmiana:** warianty `primary` / `ghost` / `outline` / `icon` + `size sm/md/lg`.
Hover używa `--color-primary-hover`. Focus ring `--shadow-focus`.
Zachowaj API z istniejącego Buttona (props, asChild jeśli używane).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

#### M-003: Input / Textarea
**Plik kodu:** `frontend/src/shared/components/ui/Input.tsx`,
`.../ui/Textarea.tsx`
**Bundle:** `docs/design/v2/components.jsx` + `v2-stage4/section-general.jsx`
(form pattern)
**Zmiana:** label + helper text + error state. Border `--color-border-card`,
focus → `--color-primary` border + shadow. Walidacja inline pod inputem.
RHF + Zod compatible (`forwardRef`, `name`, `error`).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

#### M-004: Badge / Pill
**Plik kodu:** `frontend/src/shared/components/ui/Badge.tsx`
**Bundle:** `docs/design/v2/components.jsx`
**Zmiana:** warianty `neutral` / `primary` / `accent-yellow` / `status-*`.
Status używa par `--status-X` + `--status-X-tint`.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

#### M-005: StatusPill (orders)
**Plik kodu:** `frontend/src/shared/components/ui/StatusPill.tsx`
**Bundle:** `docs/design/v2-stage3/admin-shared.jsx` (window.A.StatusPill)
**Zmiana:** mapowanie `OrderStatus` → kolor + label PL. 7 statusów (D-009).
Zachowaj enum z backendu — to constant `STATUS_COLORS`.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-004

#### M-006: Icon set
**Plik kodu:** `frontend/src/shared/components/ui/Icon.tsx`
**Bundle:** `docs/design/v2-stage3/admin-shared.jsx` (A.Icons)
**Zmiana:** ~30 ikon Lucide-style 24px stroke 1.7. Skopiuj ścieżki SVG z
bundla. Lub — jeśli `lucide-react` już jest dependency — użyj go i mapuj
nazwy (`dashboard` → `LayoutDashboard`, `kitchen` → `ChefHat`, etc.).
Decyzja: bundle wprost > lucide-react, bo bundle ma już testowane proporcje.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

#### M-007: Kicker
**Plik kodu:** `frontend/src/shared/components/typography/Kicker.tsx`
**Bundle:** `docs/design/v2/patterns.jsx` (KickerExample)
**Zmiana:** uppercase 600 / `letter-spacing: 0.06em` / `font-size: 12-13px`.
Optionalna kropka jako gest (jak w „PIZZA DEMO."). Klasa `.t-kicker` z
tokens.css.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

---

## Warstwa 2 — Layout chrome

Po Warstwie 1 zatwierdzonej. **Po tej warstwie STOP, czekaj na review.**

#### M-008: PublicHeader (desktop + mobile)
**Plik kodu:** `frontend/src/shared/components/layout/PublicHeader.tsx`
**Bundle:** `v2-stage2/landing-shared.jsx` (HeaderDesktop + HeaderMobile)
**Zmiana:** logo + nav („Menu" / „Kontakt") + cart icon z badgem count.
Mobile: hamburger menu. Sticky top z subtle shadow gdy scroll > 0.
**Backend:** zero (cartCount z Zustand store).
**Złożoność:** M
**Zależy od:** M-002, M-006

#### M-009: PublicFooter
**Plik kodu:** `frontend/src/shared/components/layout/PublicFooter.tsx`
**Bundle:** `v2-stage2/landing-shared.jsx` (Footer)
**Zmiana:** adres + telefon + godziny + kontakt + linki RODO/regulamin
(z hardcoded copy do Phase 5 stub).
**Backend:** zero (dane z `RestaurantSettings` przez `useRestaurantSettings`).
**Złożoność:** S
**Zależy od:** M-001

#### M-010: AdminSidebar
**Plik kodu:** `frontend/src/shared/components/layout/AdminSidebar.tsx`
**Bundle:** `v2-stage3/admin-shared.jsx`
**Zmiana:** 3 sekcje: OPERACYJNE (Pulpit/Kuchnia/Wydanie/Dostawa) /
ARCHIWUM (Wszystkie zamówienia z badge count) / KONFIGURACJA (Menu /
Restauracja / Strefy dostawy / Ustawienia). Sticky 240px desktop. Aktywny
item w `--color-primary-tint`. User chip na dole.
**Backend:** zero (active route z `react-router-dom` `useLocation`).
**Złożoność:** M
**Zależy od:** M-006

#### M-011: AdminTopbar
**Plik kodu:** `frontend/src/shared/components/layout/AdminTopbar.tsx`
**Bundle:** `v2-stage3/admin-shared.jsx`
**Zmiana:** breadcrumb (np. „Konfiguracja › Ustawienia") + ikona dzwonka
(toggle dźwięków) + lokalizacja restauracji.
**Backend:** zero (sound toggle w localStorage).
**Złożoność:** S
**Zależy od:** M-006

#### M-012: AdminLayout
**Plik kodu:** `frontend/src/shared/components/layout/AdminLayout.tsx`
**Bundle:** `v2-stage3/admin-shared.jsx`
**Zmiana:** orchestrator z `<AdminSidebar />` + `<AdminTopbar />` +
`<Outlet />` + sticky footer save bar (jeśli sekcja ma dirty state).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-010, M-011

#### M-013: ClosedBanner globalny (3 warianty)
**Plik kodu:** `frontend/src/shared/components/banners/ClosedBanner.tsx`
**Bundle:** `v2-stage2/landing-shared.jsx` (ClosedBanner)
**Zmiana:** 3 warianty — `planned` (godziny otwarcia, dziś jeszcze
zamknięte) / `manual` (tymczasowe zamknięcie z `RestaurantSettings`) /
`outsideHours` (po godzinach). Renderowany w `Outlet` na poziomie public
layoutu (`/` i `/menu`). Fetch przez `useRestaurantStatus` polling 60s.
**Backend:** zero (endpoint już istnieje).
**Złożoność:** M
**Zależy od:** M-001

---

## Warstwa 3 — Public flow

Po Warstwie 2 zatwierdzonej. **Po tej warstwie STOP, czekaj na review.**

#### M-014: InfoBar
**Plik kodu:** `frontend/src/shared/components/info-bar/InfoBar.tsx`
**Bundle:** `v2/patterns.jsx` + `v2-stage2/landing-shared.jsx` (InfoBar)
**Zmiana:** czarny pasek `--color-bg-dark` z 4 modułami: status (pulse
dot), czas dostawy, min. zamówienie, koszt dowozu. Dane z
`RestaurantSettings`. Open / closed states (zamknięte = bardziej stonowane).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001, M-013

#### M-015: FreeDeliveryProgress
**Plik kodu:** `frontend/src/shared/components/cart/FreeDeliveryProgress.tsx`
**Bundle:** `v2-stage2/landing-shared.jsx` (FreeDeliveryProgress)
**Zmiana:** progress bar + treść „Brakuje X zł do darmowej dostawy" /
„Masz darmową dostawę 🛵". Threshold z `RestaurantSettings.freeDeliveryFrom`.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

#### M-016: ProductCard
**Plik kodu:** `frontend/src/shared/components/product/ProductCard.tsx`
**Bundle:** `v2-stage2/landing-shared.jsx` (ProductCard)
**Zmiana:** zdjęcie 4:3 (StripedPlaceholder fallback), nazwa, opis,
cena mono, badge HIT/NOWOŚĆ z `--color-accent-yellow`, quick-add button.
**Backend:** zero (DTO `MenuItem` zachowane).
**Złożoność:** S
**Zależy od:** M-002, M-004

#### M-017: ProductModal
**Plik kodu:** `frontend/src/features/public/menu/ProductModal.tsx`
**Bundle:** `v2-stage2/product-modal.jsx`
**Zmiana:** modal z dużym zdjęciem, nazwą, opisem, qty stepper, customer
notes textarea (max 200 zn), CTA „Dodaj do koszyka · X,XX zł". Brak
configów rozmiar/dodatki w MVP — wariant „klasyk".
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-002, M-003

#### M-018: LandingPage retrofit
**Plik kodu:** `frontend/src/features/public/landing/LandingPage.tsx`
**Bundle:** `v2-stage2/landing-desktop.jsx` + `landing-mobile.jsx` +
`landing-shared.jsx`
**Zmiana:** Hero (full-bleed photo z overlay, kicker, headline 56-72px,
subtitle, CTA „Zobacz menu") + InfoBar + AboutSection + HoursSection +
ContactMapSection + Footer. Bez menu, bez cart sidebar (D-002).
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-008, M-009, M-013, M-014

#### M-019: MenuPage retrofit
**Plik kodu:** `frontend/src/features/public/menu/MenuPage.tsx`
**Bundle:** `v2-stage2/menu-desktop.jsx` + `menu-mobile.jsx` +
`landing-shared.jsx` (CategoryChips)
**Zmiana:** Header + InfoBar + sticky CategoryChips (scroll-spy) +
grid produktów (2-3 col desktop / 1 col mobile) + CartSidebar 360px
desktop / MobileCartBar mobile. Breakpoint sticky cart: `min-width: 1024px`.
Animacja bump koszyka na quick-add.
**Backend:** zero (data z `useMenu` query, koszyk z Zustand).
**Złożoność:** L
**Zależy od:** M-008, M-014, M-016, M-021, M-022

#### M-020: Cart Upsell section
**Plik kodu:** `frontend/src/shared/components/cart/UpsellSection.tsx`
**Bundle:** `v2-stage2/cart.jsx` (UpsellSection)
**Zmiana:** 3 kompaktowe karty 64px: emoji + nazwa + hint + cena mono +
FAB +. Klik + → fade+slide-out 200ms. Empty pool → cała sekcja znika.
Pula upsell to top-3 najczęściej kupowane (lub featured) produkty NIE w
koszyku.
**Backend:** zero (logika selekcji upsell w hooku).
**Złożoność:** S
**Zależy od:** M-001

#### M-021: CartSidebar (3 stany)
**Plik kodu:** `frontend/src/shared/components/cart/CartSidebar.tsx`
**Bundle:** `v2-stage2/cart.jsx` (CartSidebar)
**Zmiana:** desktop 360px sticky. Stany: empty (placeholder „Tu pojawi
się Twoje zamówienie") / 3 items (lista + UpsellSection + totals) /
5+ items (scrollable lista, free delivery filled, upsell). Min order
gating (`belowMin` → CTA disabled z komunikatem).
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-002, M-015, M-020

#### M-022: CartBottomSheet + MobileCartBar
**Plik kodu:** `frontend/src/shared/components/cart/CartBottomSheet.tsx` +
`.../MobileCartBar.tsx`
**Bundle:** `v2-stage2/cart.jsx` (CartBottomSheet + MobileCartBar)
**Zmiana:** MobileCartBar — floating bottom bar 56px z sumą + count + tap.
CartBottomSheet — 90vh sheet z handle 36×4, swipe-down close, jednolity
scroll: header → lista → upsell → totals → CTA. `prefers-reduced-motion`
wyłącza spring (motion-base 180ms) na fade.
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-002, M-015, M-020

#### M-023: CheckoutPage retrofit (DONE v1)
**Plik kodu:** `frontend/src/features/public/checkout/CheckoutPage.tsx`
**Bundle:** brak pełnego mockupu. Używa `v2/tokens.css` +
`v2-stage4/section-general.jsx` (form pattern) +
`v2-stage2/landing-shared.jsx` (Header/Footer)
**Zmiana:** **RETROFIT.** Zachowaj: Zod schema, RHF, datalist autocomplete
miast, postal mask, DeliveryZoneBadge logikę. Wymień: kolory na tokens v2,
typografia Inter, spacing 4px scale, focus rings, primary CTA `--color-primary`.
2 kol desktop (form lewo + sticky summary 360px prawo) / single mobile +
sticky bottom CTA. DeliveryZoneBadge stylowany pod paletę v2 (FREE → emerald,
PAID → primary, UNAVAILABLE → red text + disabled CTA).
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-003, M-008, M-009, M-021

#### M-024: ConfirmationPage retrofit (DONE v1)
**Plik kodu:** `frontend/src/features/public/confirmation/ConfirmationPage.tsx`
**Bundle:** brak pełnego mockupu. Używa `v2/tokens.css` +
`v2-stage2/landing-shared.jsx` (Header/Footer)
**Zmiana:** **RETROFIT.** Numer zamówienia mono XL (32-40px,
`--font-mono`). Headline 36px/600 „Dziękujemy za zamówienie!". Subtekst
ETA. CTA primary „Śledź zamówienie" → `/track/:token`. Lista pozycji
(reuse z Checkout summary).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001, M-008, M-009

#### M-025: Timeline component
**Plik kodu:** `frontend/src/shared/components/timeline/Timeline.tsx`
**Bundle:** `v2/patterns.jsx` (TimelineH + TimelineV)
**Zmiana:** prop `orientation: "horizontal" | "vertical"`. 5 kroków z
ikonami emoji (⏳ ✓ 👨‍🍳 🛵 🎉) + 6ty „cancelled" (✕). Dot-pulse 1.5s loop
na aktywnym (`is-pulsing` class). Done → `--color-primary` fill. Pending
→ `--color-border-strong` outline. `prefers-reduced-motion` wyłącza pulse.
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-001

#### M-026: TrackingPage retrofit (DONE v1)
**Plik kodu:** `frontend/src/features/public/tracking/TrackingPage.tsx`
**Bundle:** `v2/patterns.jsx` (Timeline) + `v2/tokens.css` +
`v2-stage2/landing-shared.jsx` (Header/Footer)
**Zmiana:** **RETROFIT.** Wymień stary stepper na `<Timeline />` 1:1.
Polling 15s (`useOrderTracking` hook) NIE RUSZAĆ. ETA card z
`--color-bg-dark` (slate-900). Header z numerem zamówienia + status pill.
Lista pozycji (reuse). Telefon do restauracji. Mobile: vertical timeline.
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-005, M-008, M-009, M-025

---

## Warstwa 4 — Admin operacyjne

Po Warstwie 3 zatwierdzonej. **Po tej warstwie STOP, czekaj na review.**

#### M-027: LoginPage
**Plik kodu:** `frontend/src/features/admin/login/LoginPage.tsx`
**Bundle:** `v2-stage3/frame-login.jsx`
**Zmiana:** standalone (bez AdminLayout). Email + password + CTA. Wariant
`error` dla 401 (czerwony alert nad polami). Logo top-left, copy z
filozofii Confident Local.
**Backend:** zero (auth flow już istnieje).
**Złożoność:** S
**Zależy od:** M-002, M-003

#### M-028: DashboardPage
**Plik kodu:** `frontend/src/features/admin/dashboard/DashboardPage.tsx`
**Bundle:** `v2-stage3/frame-dashboard.jsx`
**Zmiana:** 4 KPI cards (zamówienia dziś / przychód dziś / średnia wartość /
nowi klienci) + 2 Recharts (linia ostatnie 7 dni, słupki top produkty) +
status tiles (counts NEW/CONFIRMED/IN_PREPARATION/READY z linkami do
Kuchni). Recharts już zainstalowane.
**Backend:** zero (endpoint `/api/admin/dashboard` istnieje).
**Złożoność:** L
**Zależy od:** M-012

#### M-029: KitchenPage
**Plik kodu:** `frontend/src/features/admin/kitchen/KitchenPage.tsx`
**Bundle:** `v2-stage3/frame-kitchen.jsx`
**Zmiana:** kolumny per status (NEW / CONFIRMED / IN_PREPARATION /
READY). Karty z 3-step CTA: „Przyjmij" (NEW→CONFIRMED) / „Wstaw do pieca"
(CONFIRMED→IN_PREPARATION) / „Gotowe" (IN_PREPARATION→READY). Sound +
flash dla nowych. SSE live (zamiast `sseSimulate` toggle z bundla — to
był tylko design tool). Tablet 1024px: density compact. State machine
zachowana z AD-021.
**Backend:** zero (endpointy `/api/admin/orders/{id}/transition` istnieją).
**Złożoność:** L
**Zależy od:** M-005, M-012

#### M-030: PickupPage
**Plik kodu:** `frontend/src/features/admin/pickup/PickupPage.tsx`
**Bundle:** `v2-stage3/frame-pickup.jsx`
**Zmiana:** tabela zamówień READY pickup. Kolumny: imię klienta (focal,
duża czcionka) + telefon (link tel:) + lista pozycji + CTA „Wydane"
(READY → DELIVERED). Filter „dziś" default.
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-005, M-012

#### M-031: DeliveryPage (desktop + mobile kuriera)
**Plik kodu:** `frontend/src/features/admin/delivery/DeliveryPage.tsx`
**Bundle:** `v2-stage3/frame-delivery.jsx`
**Zmiana:** lista zamówień READY/OUT_FOR_DELIVERY. Per zamówienie:
adres + telefon + CTA „Nawiguj" (Google Maps deeplink) +
„Zabrałem" (READY → OUT) + „Dostarczone" (OUT → DELIVERED). Mobile
optimized dla kuriera (większe touch targety, sticky header z licznikiem).
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-005, M-012

#### M-032: OrdersPage
**Plik kodu:** `frontend/src/features/admin/orders/OrdersPage.tsx`
**Bundle:** `v2-stage3/frame-orders.jsx`
**Zmiana:** tabela wszystkich zamówień. Filtry: status, data, typ
(pickup/delivery), szukaj po nr/telefon/imię. Paginacja. Wariant „flash"
zielony dla nowych (animacja 1s fade). Klik wiersza → OrderDetail.
**Backend:** zero (endpoint `/api/admin/orders` z query params istnieje).
**Złożoność:** M
**Zależy od:** M-005, M-012

#### M-033: OrderDetailPage
**Plik kodu:** `frontend/src/features/admin/orders/OrderDetailPage.tsx`
**Bundle:** `v2-stage3/frame-order-detail.jsx`
**Zmiana:** header (nr + status pill + czas złożenia) + lista pozycji +
totals + Płatność (gotówka/online — MVP tylko gotówka) + Customer info
(imię/telefon/adres) + History timeline („18:12 NEW · admin@...
· 18:13 CONFIRMED · admin@...") z autorem każdej zmiany.
**Backend:** zero (endpoint już zwraca history).
**Złożoność:** M
**Zależy od:** M-005, M-012

---

## Warstwa 5 — Admin konfiguracja

Po Warstwie 4 zatwierdzonej. **Po tej warstwie STOP, czekaj na review.**

#### M-034: MenuListPage
**Plik kodu:** `frontend/src/features/admin/menu/MenuListPage.tsx`
**Bundle:** `v2-stage3/frame-menu.jsx`
**Zmiana:** lewa kolumna kategorii (drag handle, edit, +Dodaj) + prawa
lista produktów wybranej kategorii (drag handle, edit, toggle aktywny,
delete). CTA „+ Nowy produkt" → ProductEditPage.
**Backend:** zero (endpoint CRUD istnieje).
**Złożoność:** M
**Zależy od:** M-006, M-012

#### M-035: ProductEditPage
**Plik kodu:** `frontend/src/features/admin/menu/ProductEditPage.tsx`
**Bundle:** `v2-stage3/frame-product-edit.jsx`
**Zmiana:** forma RHF + Zod: nazwa, opis, cena, kategoria (select), badge
(HIT/NOWOŚĆ/none), foto URL (preview obok), aktywny toggle, sortOrder
(disabled — z drag w MenuListPage). CTA „Zapisz zmiany".
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-003, M-012, M-034

#### M-036: SettingsLayout
**Plik kodu:** `frontend/src/features/admin/settings/SettingsLayout.tsx`
**Bundle:** `v2-stage4/settings-shared.jsx`
**Zmiana:** master-detail. Lewa 240px nav z 8 sekcji (5 realnych +
separator + 3 stuby z badge „WKRÓTCE"). Prawa `<Outlet />`. Sticky
footer save bar gdy `isDirty` (z hooka useFormDirty na child page).
Mobile <768px: dropdown nav + accordion (D-014).
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-002, M-012

#### M-037: GeneralSection
**Plik kodu:** `frontend/src/features/admin/settings/sections/GeneralSection.tsx`
**Bundle:** `v2-stage4/section-general.jsx`
**Zmiana:** Identyfikacja (nazwa, slogan, krótki opis SEO) + Kontakt
(email, telefon, adres, Google Maps link) + Marka kolor (HEX picker + 6
predefiniowanych palet, D-008) + Live preview prawej kolumnie (mini hero
+ przycisk + product card z aktualnym primary).
**Backend:** zero (DTO `RestaurantSettings` istnieje).
**Złożoność:** M
**Zależy od:** M-003, M-036

#### M-038: HoursSection
**Plik kodu:** `frontend/src/features/admin/settings/sections/HoursSection.tsx`
**Bundle:** `v2-stage4/section-hours.jsx`
**Zmiana:** 7 dni × (toggle aktywny + 2× time picker + „Skopiuj na inne
dni") + preview „Tak będzie wyglądać na stronie" (7 chips). Highlight
DZIŚ. Niedziela default zamknięta. Notatka o Wyjątkach świątecznych
(stub).
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-003, M-036

#### M-039: ContentSection
**Plik kodu:** `frontend/src/features/admin/settings/sections/ContentSection.tsx`
**Bundle:** `v2-stage4/section-content.jsx`
**Zmiana:** Tabs Hero / O nas. Hero: aktywny toggle + title + subtitle +
CTA tekst + 3 radio kierunek (Menu scroll / Telefon / Custom URL) + tło
URL. O nas: aktywny toggle + title + body 5-10 wierszy + zdjęcie URL.
Live preview prawej kolumnie. Zmiany live.
**Backend:** zero.
**Złożoność:** M
**Zależy od:** M-003, M-036

#### M-040: ZonesSection
**Plik kodu:** `frontend/src/features/admin/settings/sections/ZonesSection.tsx`
**Bundle:** `v2-stage4/section-zones.jsx`
**Zmiana:** lista stref (table: nazwa, typ, opłata, obszary count, toggle
aktywna, edit/delete). Edytor strefy: Tryb 1 (cała miejscowość) lub Tryb 2
(konkretne kody — autoformat 00-000). Edge-case messages (strefa z
zamówieniami nie usuwalna, kod już zajęty). **Phase 7** dorzuca
geo-walidację i auto-suggest miast (D-012).
**Backend:** wymaga endpointów `/api/admin/zones` CRUD (Phase 7 task).
**Złożoność:** L
**Zależy od:** M-003, M-036

#### M-041: OperationsSection
**Plik kodu:** `frontend/src/features/admin/settings/sections/OperationsSection.tsx`
**Bundle:** `v2-stage4/section-operations.jsx`
**Zmiana:** 4 karty w kolejności (D-015):
1. Domyślny ETA (input min 5-120 + chipy 15/25/35/45 + preview ETA)
2. Minimum zamówienia (input 0-500 zł + chipy 0/25/35/50 + preview komunikatu, D-013)
3. Tymczasowe zamknięcie (toggle + powód + planowane otwarcie + banner preview)
4. Metody płatności (gotówka pickup + gotówka delivery; subtekst „Płatności online — w przyszłej aktualizacji" — D-007)
Banner zamknięcia top-of-page jeśli aktywny.
**Backend:** zero — wszystkie pola w `RestaurantSettings` (dodaj
`minOrderAmount` jeśli nie istnieje).
**Złożoność:** M
**Zależy od:** M-003, M-036

#### M-042: SettingsStub (3 stuby)
**Plik kodu:** `frontend/src/features/admin/settings/SettingsStub.tsx` +
3 page'e: `NotificationsSection.tsx`, `LimitsSection.tsx`, `LegalSection.tsx`
**Bundle:** `v2-stage4/section-stubs.jsx`
**Zmiana:** reusable `SettingsStub({ icon, title, description, ctaLabel?,
ctaAction? })`. 3 page'e to thin wrappers z props (D-006). Copy
„Dostępne w przyszłej aktualizacji" w constants. Limits ma CTA „Otwórz
Operacje" deflectujący do `/admin/settings/operations`. Legal ma CTA
„Zobacz domyślny tekst zgody" otwierający modal z hardcoded RODO copy.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-002, M-036

---

## Warstwa 6 — Polish & cross-cutting

Po Warstwie 5 zatwierdzonej. **To jest finałowa warstwa.**

#### M-043: Empty states
**Plik kodu:** różne (Cart empty, Orders empty, Menu empty)
**Bundle:** referencje rozproszone w bundle
**Zmiana:** spójny pattern empty state: ikona 48px outlined + headline +
sub copy + opcjonalny CTA. Uniknij „brak danych" — pisz user-friendly
(„Tu pojawi się Twoje zamówienie", „Brak zamówień w tym dniu", etc.).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001, M-006

#### M-044: Error states (network / 404 / 500)
**Plik kodu:** `frontend/src/shared/components/errors/*.tsx`
**Bundle:** brak (build new)
**Zmiana:** 3 page'e: NetworkError (offline / fetch fail) z retry CTA,
NotFound (404) z linkiem do home, ServerError (500) z error code +
„Skontaktuj się z restauracją". Trzymają się Confident Local mood.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-001

#### M-045: prefers-reduced-motion audit
**Plik kodu:** `frontend/src/styles/tokens.css` + per-component
**Bundle:** wzorzec w tokens.css i tweaks-panel
**Zmiana:** media query w tokens.css ustawia `--motion-fast/base/slow:
0.01ms`. Per-component override dla animacji niewystarczająco
zatrzymanych przez tokeny: pulse na statusach, swipe spring na bottom
sheet, bump na cart, scroll-smooth na scroll-spy.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** wszystkie poprzednie

#### M-046: Focus rings audit (WCAG AA)
**Plik kodu:** wszystkie interactive components
**Bundle:** wzorzec w tokens.css (`--shadow-focus`)
**Zmiana:** każdy button/link/input ma `:focus-visible` z
`--shadow-focus` (3px primary 25% alpha) + `outline-offset: 2px`.
Audit klawiaturowy (Tab przez landing, menu, checkout, admin).
**Backend:** zero.
**Złożoność:** S
**Zależy od:** wszystkie poprzednie

#### M-047: Mobile audit (375px touch targets)
**Plik kodu:** różne (responsywność per ekran)
**Bundle:** mobile mockupy w bundle (landing-mobile, menu-mobile,
delivery mobile, settings mobile)
**Zmiana:** każdy interactive element ma min 44×44px touch target
(WCAG 2.5.5). Sticky elements (PublicHeader, MobileCartBar, AdminTopbar)
nie zasłaniają contentu. Modal/sheet z safe-area-inset-bottom.
**Backend:** zero.
**Złożoność:** M
**Zależy od:** wszystkie poprzednie

#### M-048: Schema.org Restaurant + meta tags
**Plik kodu:** `frontend/src/features/public/landing/LandingPage.tsx` +
`MenuPage.tsx`
**Bundle:** brak (specs w `docs/PHASES.md` C2)
**Zmiana:** JSON-LD z `RestaurantSettings` (name, address, telephone,
openingHoursSpecification, priceRange, servesCuisine: „Pizza"). Meta tags:
title template, description z `shortDescription`, OG image (logo lub
hero photo). React Helmet Async.
**Backend:** zero.
**Złożoność:** S
**Zależy od:** M-018, M-019

---

## Razem

- **48 tasków** w 6 warstwach
- **Backend impact dla wszystkich:** zero (oprócz M-040 które wymaga
  endpointów Phase 7 stref dostawy)
- **Złożoność total:** ~7 L + ~25 M + ~16 S
- **Estymacja w godzinach (kalibrowane na Claude Code):** L ≈ 4h /
  M ≈ 1.5h / S ≈ 25min ⇒ ok. **75-90 godzin łącznie**, w tym ~20%
  zapasu na review/fix
- **Realnie:** 2-3 tygodnie roboty z workflow z `OPERATOR_PLAYBOOK`
  (plan → review → fix per warstwa, nie per task)

---

**Wersja 2.0** · 2026-05-10 · Stage 5 final.
