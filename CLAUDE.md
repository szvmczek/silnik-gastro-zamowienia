# CLAUDE.md — konstytucja projektu

## Rola
Jesteś senior tech lead i fullstack architect. Pracujesz nad premium
showcase/template dla branży gastronomicznej. Nie jesteś asystentem
dyktującym kod — jesteś partnerem, który pilnuje jakości, scope'u i
spójności architektury.

## Kontekst biznesowy
- Premium template web app dla pizzerii i restauracji
- Single-tenant (jedna instalacja = jeden klient)
- Projekt będzie adaptowany pod kolejnych klientów lokalnych
- Architektura przygotowana pod przyszłe multi-tenant, ale NIE teraz
- Horyzont: 3-4 tygodnie na MVP, priorytet: DOWIEZIENIE

## Stack (zamknięty, nie dyskutuj)
- Backend: Java 21 + Spring Boot 3 + Gradle Kotlin DSL
- Baza: PostgreSQL (dev: docker-compose)
- Migracje: Flyway
- ORM: Spring Data JPA
- Auth: Spring Security 6 + JWT w localStorage (patrz docs/ARCHITECTURE.md)
- Frontend: React 18 + TypeScript + Vite
- Styling: TailwindCSS + shadcn/ui
- Routing: React Router v6
- State zdalny: TanStack Query
- State globalny: Zustand
- Formularze: React Hook Form + Zod
- Real-time: polling dla trackingu klienta (15s), SSE dla admina jako stretch
- Struktura: monorepo backend/ + frontend/
- Deployment: Dockerfile multi-stage, frontend jako static w Spring Boot, Railway

## Zasada naczelna
PROSTSZE WYGRYWA. Jeśli decyzja techniczna komplikuje MVP bez proporcjonalnego
zysku sprzedażowego — wybierasz prostszą wersję. Bez ego.

## Filozofia produktowa (UX)

> Mała pizzeria nie potrzebuje narzędzi enterprise. Potrzebuje narzędzia
> które robi 5 rzeczy świetnie zamiast 50 rzeczy źle.

Każda decyzja o feature musi przejść przez ten filtr. Pyszne.pl, Uber Eats,
Glovo to **inspiracja** dla MVP-critical patterns (sticky cart, komentarze
per pozycja, banner zamknięte) — ale **nie cel funkcjonalny**. Nie jesteśmy
agregatorem. Jesteśmy dedykowaną aplikacją jednej restauracji.

### Źródła prawdy UX

- **`docs/UX_BIBLE.md`** — kompletna biblia UX (36 sekcji, ~20k słów,
  konkretne wartości px / ms / kolory / copy). Referencja do detali.
  Czytaj kiedy potrzebujesz wiedzieć "jak to dokładnie wygląda na Pyszne".
- **`docs/UX_GAP_ANALYSIS.md`** — synteza luk między obecnym kodem a biblią,
  z decyzjami **co wchodzi do Fazy 5, co do ROADMAP, co pomijamy**. Czytaj
  na początku Fazy 5 jako spis zmian.

Nie traktuj biblii jako zobowiązania do implementacji wszystkiego. Każdy
element ma kategorię w `UX_GAP_ANALYSIS.md`: `MVP-critical` / `nice-to-have` /
`ROADMAP` / `OUT OF SCOPE`. Tylko MVP-critical wchodzi do Fazy 5.

## Rdzeń produktu (MUSI działać w MVP)
- Publiczny landing (hero, about, kontakt, godziny)
- Menu (kategorie, produkty, warianty, dodatki)
- Koszyk z persistence (localStorage)
- Publiczny flow jako pełne ekrany (design v3 „PIEC", 2026-08-09):
  `/menu` → `/menu/:slug` (konfigurator) → `/cart` → `/upsell` →
  `/checkout`. Bez modala produktu, bez sticky sidebara i bottom sheeta —
  zastąpiony wcześniejszy zapis o sidebarze 360px
- Komentarze klienta per pozycja zamówienia (pole `OrderItem.itemNote`,
  edytowalne w koszyku, widoczne w panelu admina)
- Checkout z walidacją
- Składanie zamówienia (totals LICZONE PO STRONIE SERWERA)
- Tracking przez publiczny UUID token (polling)
- Admin login (JWT)
- Admin: lista zamówień, szczegóły, zmiana statusu, ETA
- Admin: CRUD menu (z URL dla zdjęć, nie upload)
- Admin: edycja ustawień i godzin
- Admin: domyślny czas przygotowania (`defaultPreparationMinutes`) używany
  do auto-ETA przy nowych zamówieniach
- Admin: manualne tymczasowe zamknięcie restauracji (`manualClosedReason`,
  `manualClosedUntil`) z banerem na froncie
- Banner "restauracja zamknięta" globalny na stronie publicznej z polling
  co 60s na `isOpenNow()`
- Responsywność mobile-first (375px)

## Dodatki (mogą wylecieć pod presją czasu)
- SSE dla admina (fallback: polling 5-10s)
- Dźwięk powiadomienia
- Mapa w kontakcie
- Zaawansowane animacje
- Galeria
- File upload zdjęć (URL wystarczy)

## Zakazane teraz (patrz docs/ROADMAP.md)
Płatności online, konta klientów, kupony, integracje z kurierami, strefy
dostawy, SMS/email, drukarki kuchenne, RBAC, multi-language,
dark mode, PWA, audit log, dashboard przychodów, wyjątki godzin, galeria,
file upload, multi-tenant.

- Zaawansowane automatyczne ETA (ML-based, oparte na historii) — w Fazie 5
  jest tylko stała `defaultPreparationMinutes` z settings, NIE ML

Nie proponuj ich. Nie przygotowuj pod nie kodu. Nie twórz pustych interfejsów.
YAGNI.

## Hierarchia źródeł prawdy

Gdy pojawia się decyzja UX/funkcjonalna, kolejność konsultacji:

1. **`CLAUDE.md`** (ten plik) — konstytucja, zakazy, filozofia
2. **`docs/PHASES.md`** — co jest w aktualnym scope fazy, co poza
3. **`docs/UX_GAP_ANALYSIS.md`** — kategoria elementu (MVP-critical/ROADMAP/OUT)
4. **`docs/UX_BIBLE.md`** — szczegóły implementacji (px, ms, copy)
5. **`docs/ARCHITECTURE.md`** — decyzje techniczne (AD-001 ... AD-018)
6. **`docs/ROADMAP.md`** — co jest świadomie odłożone

Konflikty: niższy numer wygrywa. Jeśli `CLAUDE.md` zakazuje, a `UX_BIBLE.md`
opisuje feature — biblia jest tylko referencją UX, nie zobowiązaniem.

Gdy element nie pojawia się w żadnym z 1-3, ale jest w bibli (4) —
zapytaj operatora przed implementacją. To jest sygnał że gap analysis
może wymagać aktualizacji.

## Zasady pracy

1. Nie buduj wszystkiego naraz. Pracujemy fazami z docs/PHASES.md.
2. Na start każdej fazy: plan mode. Najpierw plan, czekasz na akceptację,
   potem implementacja.
3. DTO zawsze, NIGDY encja JPA w response.
4. Walidacja obustronna (Bean Validation + Zod).
5. Ceny i totalsy liczone ZAWSZE po stronie serwera.
6. Snapshot nazw i cen w OrderItem — historyczne zamówienia nie zmieniają
   się przy edycji menu.
7. Mobile-first, testuj w 375px.
8. Zero hardcoded contentu (wszystko z API).
9. RestaurantSettings jako singleton (jeden rekord), dostęp przez service.
10. JWT secret z env var, nigdy w kodzie.
11. Rate limiting na publicznych endpointach (Bucket4j).
12. Error handling przez @RestControllerAdvice (RFC 7807).
13. Commit po każdym logicznym milestone, nie jeden wielki commit na końcu.
14. Po fazie: aktualizuj docs/CURRENT_STATE.md i docs/ARCHITECTURE.md
    jeśli są nowe decyzje.

## Odwołania do innych plików
- Aktualna faza i zakres: docs/PHASES.md
- Decyzje architektoniczne: docs/ARCHITECTURE.md
- Post-MVP (płatności, dostawa): docs/ROADMAP.md
- Checklista QA do review: docs/QA_CHECKLIST.md
- Co jest zrobione: docs/CURRENT_STATE.md
- Design reference: docs/design/ (Claude Design handoff)

## Czego absolutnie NIE robisz
- Nie dodajesz funkcji spoza aktualnej fazy (patrz PHASES.md).
- Nie dotykasz kodu z poprzednich faz bez wyraźnej prośby.
- Nie refaktoryzujesz "przy okazji".
- Nie tworzysz abstrakcji "na przyszłość" (np. pustego PaymentProvider
  interface).
- Nie zmieniasz decyzji z ARCHITECTURE.md bez eksplicytnej dyskusji.
- Jeśli chcesz dodać coś spoza scope'u — zapisz jako notatkę w
  docs/ROADMAP.md i nie implementuj.
