# PHASE5_KICKOFF.md — prompt do Claude Code

> **Wklej całą tę wiadomość do Claude Code** w nowej sesji w terminalu
> w katalogu repo `silnik-gastro/`. Zachowaj formatowanie markdown.
> Po wysłaniu Claude Code dostaje pełny kontekst design phase + zaczyna
> Warstwę 1 implementacji.

---

## Kontekst dla Ciebie (Claude Code)

Pracujesz w repozytorium `silnik-gastro/` (Pizza Showcase, single-tenant
SaaS dla małych pizzerii). Stack: Java 21 + Spring Boot 3 backend, React 18
+ TypeScript + Vite + TailwindCSS + shadcn/ui + Zustand + TanStack Query +
RHF + Zod frontend. Pierwszy klient: Pani Kasia, Łomianki.

Właśnie zamknęliśmy **design phase v2** (kierunek wizualny: Confident
Local). Bundle żywy w `docs/design/v2/` + `v2-stage1..4/`. Twoje zadanie:
**zaimplementować Phase 5 — retrofit warstwy wizualnej istniejącego frontu
pod nowy design system v2.**

## Zanim zaczniesz — przeczytaj w tej kolejności

1. **`CLAUDE.md`** (root repo) — konstytucja projektu, hierarchia źródeł,
   filozofia "Zerowe zewnętrzne zależności / zerowe dodatkowe koszty".
2. **`docs/PHASES.md`** — mapa faz, jesteś w **Phase 5**.
3. **`docs/CURRENT_STATE.md`** — co aktualnie żyje we frontendzie. **G6-G9
   są krytyczne** (hooki, query keys, mutation keys, DTO które MUSISZ
   zachować bez zmian).
4. **`docs/ARCHITECTURE.md`** — Architecture Decision Records.
   Szczególnie AD-019 / AD-020 (split admin) i AD-021 (state machine
   3-step kuchnia).
5. **`docs/design/v2/README.md`** — indeks design phase, hierarchia
   źródeł.
6. **`docs/design/v2/DESIGN_DECISIONS.md`** — 15 decyzji projektowych z
   alternatywami. **To jest twoja tarcza przed dryfem.** Gdy masz pokusę
   zrobić inaczej, sprawdź D-XXX odpowiadający temu obszarowi.
7. **`docs/design/v2/screens-index.md`** — mapping ekran → bundle → plik
   kodu. Lokalizuj swój ekran przed implementacją.
8. **`docs/design/v2/MIGRATION_PLAN.md`** — **to jest Twoja tasklista.**
   48 tasków `M-001..M-048` w 6 warstwach. Implementuj w tej kolejności.
9. **`docs/VISUAL_DIRECTION.md`** — kierunek wizualny Confident Local.
   Mood: lokalna pizzeria osiedlowa, nie włoska trattoria. Odwołuj się
   do paragrafów (§1, §2, §13...) gdy decydujesz o szczegółach.
10. **`docs/UX_BIBLE.md`** — referencja UX detali (ETA, free-delivery
    progress, banner zamknięcia, kicker pattern).

Bundle żywy do otwierania w preview:

- `docs/design/v2/index.html` — Stage 1 design system.
- `docs/design/v2-stage2/index.html` — Public flow.
- `docs/design/v2-stage3/index.html` — Admin operacje.
- `docs/design/v2-stage4/index.html` — Settings.

Tokeny: `docs/design/v2/tokens.css` (identyczne we wszystkich Stage'ach).

---

## Twoje zadanie — Warstwa 1 z `MIGRATION_PLAN.md`

Implementujesz **tylko Warstwę 1** w tej sesji. **Po Warstwie 1 STOP,
NIE rusz Warstwy 2.**

Warstwa 1 = 7 tasków:

- **M-001:** Skopiuj `tokens.css` do `frontend/src/styles/tokens.css`,
  zaimportuj w głównym CSS. Zachowaj Tailwind config — tokeny są pod
  CSS custom properties, Tailwind ich używa przez `var(--...)`.
- **M-002:** Button warianty (primary / ghost / outline / icon).
- **M-003:** Input + Textarea z label + helper + error state.
- **M-004:** Badge / Pill (neutral / primary / accent-yellow / status).
- **M-005:** StatusPill (mapping `OrderStatus` → kolor + label PL,
  7 statusów, tokeny `--status-*` z D-009).
- **M-006:** Icon set (~30 ikon Lucide-style — skopiuj ścieżki SVG z
  `v2-stage3/admin-shared.jsx`, eksportowane przez `window.A.Icons`).
- **M-007:** Kicker (uppercase 600 / `letter-spacing: 0.06em`).

Każdy task ma w `MIGRATION_PLAN.md` precyzyjny opis: plik kodu, bundle
ref, co zmienić, backend impact, złożoność. Czytaj task w pliku, potem
implementuj.

---

## Workflow per warstwa

Trzymaj się `OPERATOR_PLAYBOOK.md` (plan → review → fix → następna).
Konkretnie:

1. **Plan mode (przed kodowaniem):** wypisz w response co zamierzasz
   zrobić w każdym z 7 tasków Warstwy 1. Wskaż pliki które utworzysz/
   zmodyfikujesz. Czekaj na akcept operatora **zanim** ruszysz do kodu.
2. **Implementacja:** kod task po tasku w kolejności M-001 → M-007.
   Każdy task = osobny commit z message `feat(design-v2): M-001 ... `.
3. **Self-review przed STOP:** uruchom build (`npm run build`),
   sprawdź czy nie ma TypeScript errorów, czy wszystkie eksporty
   działają, czy żaden test się nie wywalił.
4. **STOP po Warstwie 1.** Napisz operatorowi *„Warstwa 1 ukończona.
   7 tasków, X commitów. Build zielony. Czekam na review zanim ruszę
   Warstwę 2."*

---

## Krytyczne ograniczenia (NIE ŁAMAĆ)

### 1. Phase 5 to retrofit warstwy wizualnej, NIE refactor logiki

- **Hooki, query keys, mutation keys, DTO, walidacja Zod, schema bazy
  — bez zmian.** Patrz `docs/CURRENT_STATE.md` G6-G9.
- Jeśli widzisz pokusę „przy okazji poprawię ten hook" → NIE. To nie
  jest scope Phase 5.
- Jeśli faktycznie znajdziesz bug logiki, zapisz w
  `docs/PHASE5_FINDINGS.md` jako issue do osobnego ticketu, nie
  fixuj w retrofit commicie.

### 2. Hierarchia źródeł — kolejność z `CLAUDE.md`

Gdy bundle mówi co innego niż DESIGN_DECISIONS — **wygrywa
DESIGN_DECISIONS**. Gdy DESIGN_DECISIONS mówi co innego niż
VISUAL_DIRECTION — wygrywa VISUAL_DIRECTION. Reszta hierarchii w
`docs/design/v2/README.md`.

### 3. Filozofia produktowa (zakazane do dorzucania bez zlecenia)

Z `SINGLE_TENANT_NO_LOGIN.md` i `CLAUDE.md`:

- ❌ Konta klientów / login klienta / „moje zamówienia" / multi-restaurant
- ❌ Płatności online (BLIK, P24, karty) — MVP tylko gotówka
- ❌ SMS / email notifications
- ❌ Multi-language / dark mode / PWA
- ❌ GA / Meta Pixel / tracking pixele
- ❌ Drukarki ESC/POS / kupony / loyalty / RBAC

Jeśli widzisz w istniejącym kodzie coś z tej listy (legacy z
poprzednich faz), zostaw — Phase 5 retrofituje style, nie wycina
features.

### 4. Decyzje świeżo dodane w Stage 4-5 (NIE w starym kodzie)

- **D-011** Demo content = polska osiedlówka (Łomianki, „pizza z
  pieca, kurczaki, zapiekanki"). Jeśli widzisz w seed data
  „neapolitańska, Caputo, fior di latte" → podmień przy okazji
  retrofitu seed (nie commit osobny).
- **D-013** Minimum zamówienia = nowe pole `RestaurantSettings.minOrderAmount`.
  Jeśli kolumna nie istnieje w DB, dodaj migrację Flyway w odpowiednim
  tasku (M-041 OperationsSection).
- **D-015** Mobile Operacje kolejność kart: Domyślny ETA → Minimum →
  Tymczasowe zamknięcie → Metody płatności.

### 5. Zerowe zewnętrzne zależności / zerowe dodatkowe koszty

Z `CLAUDE.md`. Phase 5 nie dodaje nowych zależności (zewnętrznych API,
SaaS, paid tiers). Lucide / Recharts / Tailwind / shadcn już są.
**Wyjątek:** jeśli `react-helmet-async` nie jest zainstalowane, można
dodać dla M-048 (meta tags + JSON-LD).

---

## Kontekst Public DONE v1 retrofit (M-023 / M-024 / M-026)

Trzy ekrany — Checkout, Confirmation, Tracking — **nie mają pełnych
mockupów w bundle**. Są oznaczone w `DESIGN_BRIEF.md` linie 154-156
jako `DONE v1`, czyli istnieją w kodzie z Fazy 4.5. Phase 5 robi tylko
retrofit:

- Wymień kolory / typografię / spacing na tokeny v2.
- Wymień stary stepper (Tracking) na `<Timeline />` z `v2/patterns.jsx`.
- Wymień stare formy (Checkout) na nowe Input/Textarea z M-003.
- **Walidacja Zod, RHF, polling 15s, DeliveryZoneBadge logika — bez
  zmian.**
- Layout 2-kol desktop + sticky bottom mobile (Checkout) — zachowany.
- Header / Footer wspólne z M-008 / M-009.

---

## Po Warstwie 1 — co dalej

Operator zrobi review:

- Otworzy każdy nowy plik, sprawdzi spójność z bundle.
- Uruchomi `npm run dev`, kliknie przez storybook lub testową stronę
  pokazującą komponenty.
- Wybierze: **accept** (rusz Warstwę 2) / **fix** (lista konkretnych
  poprawek) / **discuss** (decyzja designerska wymaga rozmowy).

Po accept Warstwy 1 — wyślę Ci kolejny prompt z briefem Warstwy 2 lub
po prostu napiszę „Warstwa 2", a Ty znów wejdziesz w plan mode dla
M-008..M-013.

---

## Zacznij teraz

Krok 1: przeczytaj `CLAUDE.md`, `docs/PHASES.md`, `docs/CURRENT_STATE.md`,
`docs/design/v2/README.md`, `docs/design/v2/DESIGN_DECISIONS.md`,
`docs/design/v2/MIGRATION_PLAN.md` (sekcja Warstwa 1).

Krok 2: otwórz `docs/design/v2/tokens.css` — to jest start point.

Krok 3: wejdź w **plan mode** dla Warstwy 1. Wypisz dla każdego z 7
tasków M-001..M-007:
- jakie pliki utworzysz / zmodyfikujesz
- czego użyjesz z bundle (konkretne linie / komponenty)
- czy widzisz coś niejasnego do potwierdzenia z operatorem

Czekaj na akcept zanim ruszysz do kodu.

---

**Powodzenia. Trzymaj filozofię, trzymaj retrofit-tylko-wizualny, trzymaj
STOP po warstwie.**
