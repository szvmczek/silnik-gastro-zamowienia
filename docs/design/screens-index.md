# Screens index — mapping na fazy

Bundle Claude Design zawiera **18 ekranów** w trzech plikach HTML
(prototypy renderujące JSX przez Babel Standalone) + pliki `.jsx`
z pojedynczymi ekranami dla czytelności.

Poniżej spis ekranów z przypisaniem do faz z `docs/PHASES.md`.
**Wszystkie fazy są już DONE** (projekt post-Faza 5) — mapping
służy do identyfikacji, którą część implementacji retrofit
dotyczy.

## Faza 1 — Auth + Settings + Theme (DONE)

Ekrany z bundla:

| # | Ekran | Plik w bundlu | Admin/Public |
|---|---|---|---|
| 8 | Login admina | `project/admin/login-and-dashboard.jsx` (część 1) | admin |
| 9 | Dashboard (3 KPI + ostatnie zamówienia) | `project/admin/login-and-dashboard.jsx` (część 2) | admin |
| 16 | Ustawienia — ogólne (nazwa, kolor, kontakt) | `project/admin/settings.jsx` | admin |
| 17 | Ustawienia — godziny otwarcia | `project/admin/settings.jsx` | admin |
| 18 | Ustawienia — treści Hero + O nas (live preview) | `project/admin/settings.jsx` | admin |
| — | Landing — Hero + About sections (statycznie przez PageContent) | `project/public-site/landing.jsx` (sekcje Hero/About/Contact/Hours) | public |

**Ważne:** ekran dashboardu (9) formalnie należy do Fazy 4
(wymaga liczników zamówień z `/api/admin/dashboard/summary`),
ale placeholder layoutu + KPI bez liczników mieścił się w Fazie 1.
W bundlu jest wersja pełna z liczbami.

## Faza 2 — Menu (DONE)

| # | Ekran | Plik w bundlu | Admin/Public |
|---|---|---|---|
| 2 | Publiczne menu (sticky tabs kategorii + grid produktów) | `project/public-site/menu-and-product.jsx` (część 1) | public |
| 3 | Modal/sheet produktu (wybór wariantu + dodatków, live price) | `project/public-site/menu-and-product.jsx` (część 2) | public |
| 14 | Admin — lista kategorii + produkty (tabela z toggle dostępności) | `project/admin/menu-mgmt.jsx` (część 1) | admin |
| 15 | Admin — formularz produktu (warianty inline, URL zdjęcia, preview) | `project/admin/menu-mgmt.jsx` (część 2) | admin |

## Faza 3 — Cart + Checkout + Order + Tracking (DONE)

| # | Ekran | Plik w bundlu | Admin/Public |
|---|---|---|---|
| 4 | Cart drawer (desktop slide-in / mobile bottom sheet + pusty stan) | `project/public-site/cart-and-checkout.jsx` (część 1) | public |
| 5 | Checkout (2-kol desktop / single-col mobile + sticky bottom CTA) | `project/public-site/cart-and-checkout.jsx` (część 2) | public |
| 6 | Order confirmation (numer mono XL + CTA trackingu) | `project/public-site/confirmation-and-tracking.jsx` (część 1) | public |
| 7 | Tracking (timeline horyzontalny/wertykalny + ETA dark card + auto-refresh) | `project/public-site/confirmation-and-tracking.jsx` (część 2) | public |

## Faza 4 — Admin Orders + polling/SSE (DONE CORE + STRETCH)

| # | Ekran | Plik w bundlu | Admin/Public |
|---|---|---|---|
| 9 | Dashboard — 3 KPI (Nowe / W przygotowaniu / Do dostawy) + ostatnie zamówienia | `project/admin/login-and-dashboard.jsx` (część 2) | admin |
| 11 | Lista zamówień (tabela z filtrami, paginacja, badge status, pusty stan, kropka+pasek primary na nowym) | `project/admin/orders-list.jsx` | admin |
| 12 | **Szczegóły zamówienia** (numer 40px mono, primary CTA 64px "Rozpocznij przygotowanie →", dark ETA, timeline historii) | `project/admin/order-details.jsx` (główny widok) | admin |
| 12a | Modal "Ustaw ETA" (slider minut lub picker czasu) | `project/admin/order-details.jsx` (modal ETA) | admin |
| 12b | Modal "Anuluj zamówienie" (powód + checkbox potwierdzenia) | `project/admin/order-details.jsx` (modal cancel) | admin |

## Faza 5 — Polish + Deploy (DONE)

Bundle nie ma dedykowanych ekranów dla Fazy 5 — to przekrojowe
refinementy (transitions, skeleton loading, 375px polish, mapa
kontaktu, SEO meta, error boundaries).

Relevant artefakty z bundla dla Fazy 5:
- **Skeleton loading** patterns — [components.md §States](components.md)
- **Motion tokens** (120/180/260ms, easing) — [tokens.md §Motion](tokens.md)
- **Empty states** z komunikatami (zamiast spinnerów)
- **Mapa kontaktu** — w landing.jsx sekcja "Kontakt" zakłada
  miejsce na mapę (bundle pokazuje placeholder, my wdrożyliśmy
  iframe OSM w commit `37cb160`)

## Poza scope MVP

**Brak ekranów wykraczających poza scope.** Bundle trzyma się
rdzenia produktu z `CLAUDE.md`:
- **Zero** ekranów płatności online (żadnego Stripe/BLIK/P24
  widgetu)
- **Zero** kont klientów (historia zamówień, ulubione, rejestracja)
- **Zero** kuponów / rabatów / loyalty
- **Zero** dashboardu przychodów / wykresów
- **Zero** edit opening hours exceptions (tylko 7 rekordów dni)
- **Zero** upload zdjęć z dysku (URL input, zgodnie z AD-010)
- **Zero** multi-language (polski only)
- **Zero** dark mode toggle
- **Zero** wykresów / grafów w admin dashboard (tylko KPI tiles)

## Design System jako osobny "meta-ekran"

Nie liczę go do 18 ekranów produktowych, ale to kluczowy artefakt:

| Plik | Zawiera |
|---|---|
| `project/Design System.html` | Trzy artboardy: Foundations (tokens, type, spacing, status mapping, breakpointy), Components (button/badge/input/card/control/state), Patterns (tracking timeline + ETA card) |
