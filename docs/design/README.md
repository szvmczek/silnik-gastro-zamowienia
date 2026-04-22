# docs/design — Claude Design handoff (reference)

Import designu z sesji Claude Design (claude.ai/design, handoff bundle
`nS6G3khKOrlyceVFKeCZIA`, pobrany 2026-04-22).

**To NIE jest faza implementacyjna.** Pliki w tym katalogu są **reference
material** — służą jako spec wizualny/UX dla kolejnych faz i dla
retroaktywnych korekt już wdrożonych ekranów (Fazy 1–5).

## Struktura

- `bundle/` — oryginalne pliki z Claude Design, niezmienione:
  - `README.md` — oryginalny readme handoffu
  - `chats/chat1.md` — pełny transkrypt konwersacji user ↔ Claude Design
    (**przeczytaj to, gdy planujesz wdrożenie designu** — zawiera intencję
    użytkownika, decyzje, odrzucone warianty, korekty copy)
  - `project/Design System.html` — artboard fundamentów: tokeny kolorów,
    typografia, spacing, radii, shadows, motion, breakpointy, komponenty,
    status → kolor
  - `project/Public Site.html` + `project/public-site/*.jsx` — ekrany 1–7
    (landing, menu, modal produktu, koszyk, checkout, confirmation,
    tracking)
  - `project/Admin Panel.html` + `project/admin/*.jsx` — ekrany 8–18
    (login, dashboard, zamówienia, szczegóły zamówienia, CRUD menu,
    ustawienia)
  - `project/design-canvas.jsx` — shared wrapper dla artboardów
    (komponenty `<DesignCanvas/>`, `<DCSection/>`, `<DCArtboard/>`)
  - `project/scraps/*.napkin` — szkic (pusty)
- `tokens.md` — wyciągnięte design tokens z mapowaniem na klasy Tailwinda
- `status-colors.md` — mapa status zamówienia → kolor badge'a
- `components.md` — opis komponentów bazowych z notatkami implementacyjnymi
- `screens-index.md` — spis ekranów z przypisaniem do faz

## Jak używać tej referencji

1. **Stan obecny:** projekt post-Faza 5 (deploy-ready). Cała implementacja
   już istnieje; bundle służy do:
   - retrofitowania designu na wdrożone ekrany tam, gdzie aktualna
     implementacja odbiega wizualnie
   - spec wizualnego dla ewentualnych faz post-MVP (patrz
     `docs/ROADMAP.md`)
2. **Tokeny kolorów są zgodne** z aktualnym `--color-primary: 255 107 53`
   z Bootstrapu / seeda `Pizza Demo` — nie zmieniaj ich bez powodu
   architektonicznego.
3. **Nie kopiuj struktury plików z bundla 1:1.** Bundle to prototyp HTML/JSX
   bez state managementu, bez API — nasza aplikacja ma już własną
   architekturę (TanStack Query, Zustand, RHF + Zod). Odtwarzaj _visual
   output_, nie strukturę kodu.
4. **Content w bundlu to mock** (nazwa "Nonna Maria", "Przykładowa
   Pizzeria", ceny, adresy). Aplikacja pobiera wszystko z API
   (`RestaurantSettings`, `PageContent`, menu, zamówienia). Zero
   hardcoded contentu.
5. **Kluczowe decyzje designerskie** (z chat1.md):
   - jeden dominujący primary CTA na ekran (zasada "Pani Kasia")
   - listy w panelu admina jako **tabela** (thead/tbody z wyrównanymi
     kolumnami, mono dla numerów i kwot), nie jako grid kart
   - destruktywne akcje zawsze jako `danger-outline`, nigdy solid
   - numer zamówienia w widocznym miejscu, mono, min 32–40px
   - ETA jako dark card (slate-900) — kontrast do jasnej reszty
     trackingu

## Pochodzenie bundla

Instrukcja handoffowa ("Fetch this design file, read its readme, and
implement the relevant aspects of the design") została **zignorowana
celowo** — ta sesja jest importem designu jako reference, nie
implementacją. Wdrożenia designu (retrofit / nowe ekrany) muszą iść
przez oddzielną fazę z planem i milestonami zgodnie z
`docs/PHASES.md`.
