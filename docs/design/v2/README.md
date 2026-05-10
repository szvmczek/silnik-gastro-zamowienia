# `docs/design/v2/` — indeks folderu

> **Stage 5 · Polish & handoff.** Wersja 2.0 · 2026-05-10 · autor: Claude Design.
> Po accept tego folderu design phase się zamyka. Implementacja w Phase 5
> w Claude Code.

---

## Po co ten folder

Cztery dokumenty markdown, które razem zamykają fazę projektową v2 i
przekazują pracę implementatorowi. Folder **nie zawiera** designu —
design siedzi w bundlach `v2-stage1/…/v2-stage4/` jako żywe HTML +
JSX. Tu jest dokumentacja: indeks, log decyzji, mapping ekranów na
kod, plan migracji.

Czytasz to jako Claude w nowej sesji? Skacz do **Kolejność czytania**
niżej. Reszta kontekstu znajduje się stamtąd przez linki.

---

## Spis treści folderu `v2/`

| Plik | Cel |
|---|---|
| `README.md` | Ten plik. Indeks i kolejność czytania. |
| `DESIGN_DECISIONS.md` | Log 15 decyzji projektowych (D-001..D-015) z alternatywami. |
| `screens-index.md` | Mapping ekran → bundle → plik kodu → faza → współdzielone. |
| `MIGRATION_PLAN.md` | 30-50 tasków implementacyjnych pogrupowanych w 6 warstw. |

Pliki obok jako referencja designu (HTML + JSX, do oglądania
w preview):

| Folder | Co tam jest |
|---|---|
| `../v2-stage1/` | Design system v2 — tokeny, foundations, komponenty, patterny, proof. |
| `../v2-stage2/` | Public flow — Landing, Menu, modal produktu, cart (4 stany), bottom sheet, banner zamknięcia. |
| `../v2-stage3/` | Admin operacyjny — Login, Pulpit, Kuchnia, Wydanie, Dostawa, Wszystkie zamówienia, Order detail, Menu CRUD, Product edit. |
| `../v2-stage4/` | Admin konfiguracja — Settings (8 sekcji × desktop/mobile, w tym 3 stuby). |

> Stage 1 fizycznie żyje w katalogu `v2/` (pliki `index.html`,
> `tokens.css`, `components.jsx`, `foundations.jsx`, `patterns.jsx`,
> `proof.jsx`). Otwórz `v2/index.html` w preview, jeśli potrzebujesz
> tokenów na żywo lub przykładów komponentów.

---

## Kolejność czytania dla nowego Claude'a

1. **Ten README** (jesteś tu) — ~2 minuty orientacji.
2. **`./DESIGN_DECISIONS.md`** — co zostało zdecydowane i czego nie
   ruszać bez powodu.
3. **`./screens-index.md`** — zlokalizuj swój ekran w tabeli. Notuj:
   bundle ref, plik kodu, fazę.
4. **`./MIGRATION_PLAN.md`** — wyszukaj tasków `M-XXX` dotyczących
   swojego ekranu. Każdy task ma plik kodu + bundle ref + złożoność.
5. **Bundle Stage X** odpowiadający Twojemu ekranowi — otwórz
   `v2-stageX/index.html` w preview, oglądaj. To jest źródło
   prawdy wizualnej.
6. **Tokeny** — `v2/tokens.css` (lub `v2-stageX/tokens.css`, są
   identyczne — Stage 1 zamknął temat).

Gdy implementujesz konkretny task: **bundle to wzorzec, kod to cel,
DESIGN_DECISIONS broni Cię przed dryfem.**

---

## Linki do źródeł prawdy poza folderem `design/`

Te dokumenty **nie są** duplikowane w `v2/`. Linkuj, nie cytuj.

- `../VISUAL_DIRECTION.md` — kierunek wizualny (Confident Local
  mood, paleta, typografia, kropka jako gest, animacje, kicker).
- `../DESIGN_BRIEF.md` — funkcjonalny scope projektu v2 (co MA być,
  co NIE ma być).
- `../../SINGLE_TENANT_NO_LOGIN.md` — czego nie bierzemy z Pyszne
  /Glovo (single-tenant, brak loginu klienta, tracking przez
  publiczny token).
- `../UX_BIBLE.md` — referencja UX detali (ETA, free-delivery
  progress, banner zamknięcia, kicker pattern).
- `../PHASES.md` — mapa faz Phase 5 (implementacja v2) i dalej.
- `../ARCHITECTURE.md` — Architecture Decision Records, w
  szczególności AD-019 / AD-020 (split admin operations) i
  AD-021 (state machine zamówienia 3-step kuchnia).
- `../ROADMAP.md` — pkt 7.0 / 7.1 (strefy dostawy), post-MVP.
- `../CURRENT_STATE.md` — co aktualnie żyje we frontendzie
  (G6-G9: hooki, query keys, mutation keys, DTO które Phase 5
  zachowuje).

---

## Hierarchia źródeł — w razie konfliktu

Z `CLAUDE.md` w głównym repo, kolejność (najwyższe wygrywa):

1. `CLAUDE.md` (root repo)
2. `docs/PHASES.md`
3. `docs/ARCHITECTURE.md`
4. `docs/DESIGN_BRIEF.md` + `SINGLE_TENANT_NO_LOGIN.md`
5. `docs/VISUAL_DIRECTION.md`
6. `docs/design/v2/DESIGN_DECISIONS.md`
7. `docs/design/v2/MIGRATION_PLAN.md`
8. `docs/design/v2/screens-index.md`
9. Bundle Stage 1-4 (HTML + JSX) — referencja wizualna, nie norma.

Kiedy tokeny / komponenty w bundlu mówią coś innego niż
DESIGN_DECISIONS — wygrywa DESIGN_DECISIONS. Kiedy DESIGN_DECISIONS
mówi coś innego niż VISUAL_DIRECTION — wygrywa VISUAL_DIRECTION.
Itd.

---

## Co JEST w v2/

- 4 dokumenty markdown (ten folder).
- Design system Stage 1 (tokens, foundations, components, patterns,
  proof) — w `v2/` jako żywy preview.
- Bundle Stage 2-4 (public, admin operacje, admin konfiguracja).

## Co NIE JEST w v2/

- ❌ Storybook ani inventory komponentów. Bundle Stage 1 to
  *najbliższe* czemu mamy.
- ❌ Visual regression test plan.
- ❌ Pełny audyt accessibility — krótki zapis w
  `DESIGN_DECISIONS.md` D-014/D-015 wystarczy.
- ❌ Brand guidelines jako oddzielny doc — `VISUAL_DIRECTION.md`
  pełni tę rolę.
- ❌ Asset inventory zdjęć/ikon. Phase 5 sourcuje (Unsplash +
  Lucide).
- ❌ Performance budgets / SEO checklist. To Phase 5
  cross-cutting (`docs/PHASES.md` C2).
- ❌ DESIGN_SYSTEM_v3. Nie ma v3, jest v2 i koniec.

---

## Po accept — co dalej

1. Operator robi accept review (~30 min).
2. Jeśli accept → **design phase zamknięta.** Implementacja
   przechodzi do Phase 5 w Claude Code.
3. Phase 5 Claude otwiera `MIGRATION_PLAN.md` i implementuje warstwy
   1 → 6 w kolejności.
4. Strefy dostawy (Phase 7) i Minimum zamówienia mają osobne
   migracje — patrz `D-012` i `D-013`.

---

**Wersja 2.0** · 2026-05-10 · Stage 5 final.
