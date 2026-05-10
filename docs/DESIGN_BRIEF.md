# DESIGN_BRIEF.md — pełny redesign produkcyjny

> **Brief dla Claude Design.** Pojedynczy artefakt na cały projekt
> (public site + admin + settings). Output trafia do
> `docs/design/v2/` jako wizualny spec dla **Fazy 5 (Polish + Redesign +
> Deploy)**, której zakres siedzi w `docs/PHASES.md` i
> `docs/UX_GAP_ANALYSIS.md`.
>
> **Co robisz:** dostarczasz handoff (artboardy desktop + mobile, tokens
> v2, components v2, copy gdzie istotne) zgodny z aktualnym stanem
> projektu, biblią UX i filozofią produktową. Implementacja w kodzie —
> już nie ty; robi to Claude Code w osobnej sesji po zatwierdzeniu
> handoffu.
>
> **Czego nie robisz:** nie projektujesz nic spoza scope'u tego
> dokumentu. Każde "byłoby fajnie X" → notatka na końcu (sekcja 11),
> decyzja należy do operatora projektu.

---

## 0. Spis treści

1. [Kontekst projektu i tło](#1-kontekst-projektu-i-tło)
2. [Filozofia produktowa — non-negotiables](#2-filozofia-produktowa--non-negotiables)
3. [Aktualny stan implementacji](#3-aktualny-stan-implementacji)
4. [Zakres redesignu — co projektujesz](#4-zakres-redesignu--co-projektujesz)
5. [Style guide v2 — kierunek wizualny](#5-style-guide-v2--kierunek-wizualny)
6. [Inspiracje — Pyszne / Uber Eats / premium SaaS](#6-inspiracje--pyszne--uber-eats--premium-saas)
7. [Public site — szczegółowe ekrany](#7-public-site--szczegółowe-ekrany)
8. [Admin panel — szczegółowe ekrany](#8-admin-panel--szczegółowe-ekrany)
9. [Settings — 11 sekcji (5 realne / 6 stuby Poziom A)](#9-settings--11-sekcji-5-realne--6-stuby-poziom-a)
10. [Cross-cutting wymagania](#10-cross-cutting-wymagania)
11. [Deliverables i format handoffu](#11-deliverables-i-format-handoffu)

---

## 1. Kontekst projektu i tło

**Czym jest projekt.** Premium showcase / template web app dla branży
gastronomicznej. Single-tenant — jedna instalacja = jeden klient.
Architektura przygotowana pod multi-tenant w przyszłości (NIE teraz).
Cel: pokazać klientowi (małej pizzerii w okolicach Łomianek / Nowego
Dworu Mazowieckiego, dalej "Pani Kasia") gotową aplikację, którą można
adaptować pod kolejnych klientów lokalnych.

**Stan na dziś (master, 2026-05-04, commit 557dc85).**

- Fazy 1–4 (Auth + Settings, Menu, Order placement, Admin orders + SSE)
  — DONE
- Faza 4.5 (Operational UI Split — Kuchnia / Wydanie / Dostawa +
  Manager dashboard) — DONE
- Faza 7.0 (Strefy dostawy MVP) — DONE
- **Faza 5 (Polish + Redesign + Deploy)** — wcześniej DONE jako
  "Polish + Deploy" na branchu `design/g10-polish`; po wgraniu
  `docs/UX_BIBLE.md` i `docs/UX_GAP_ANALYSIS.md` cofnięta na **PLANNED**
  i przepisana z rozszerzonym scope'm (sticky cart sidebar, komentarze
  per pozycja, manual close, banner zamknięte, micro polish menu,
  redesign tracking/confirmation, schema.org). Część dotychczasowej
  pracy (deploy, error boundaries, część polish) reużywalna.
- Bundle Claude Design v1 (`docs/design/bundle/`, sesja 2026-04-22)
  został w 95% zaimplementowany na branchu `design/*`. Trzymamy go jako
  **referencję**, ale **redesign Fazy 5 idzie poza niego** — biblia UX
  zawiera setki konkretów (px / ms / copy), których v1 nie pokrył.

**Dlaczego nowy redesign.** Bundle v1 dał spójny język wizualny i był
świetnym punktem startowym, ale powstał **przed** biblią UX. Biblia
opisuje dziesiątki MVP-critical patternów (sticky cart sidebar 360px,
pasek informacyjny pod hero, banner "restauracja zamknięta", komentarze
per pozycja koszyka, scroll-spy menu, animacja bump koszyka, tracking
stepper z ikonami i pulsem, manual close ustawień, auto-ETA,
schema.org Restaurant) których v1 nie ma albo ma w niedoskonałej formie.
Faza 5 ma "dosztrychować" obecny kod do biblii — i potrzebuje w tym
wizualnego spec.

**Stack (zamknięty).** Java 21 + Spring Boot 3 (backend), React 18 +
TypeScript + Vite + TailwindCSS + shadcn/ui (frontend). Zustand
(globalny state), TanStack Query (zdalny state), React Hook Form + Zod
(formularze). Lucide ikony. Real-time: polling 15 s dla trackingu
klienta, SSE dla admina. Routing: React Router v6.

**Realny klient — Pani Kasia.** 30–60 zamówień dziennie, Pani Kasia
prowadzi pizzerię z mężem i jedną osobą do dostaw. Telefon w jednej
ręce, ciasto w drugiej. Aplikacja musi być na tyle prosta, że Pani Kasia
ogarnie ją bez szkolenia. Klient strony publicznej — przeciętny mieszkaniec
miasteczka, telefon z pęknietym ekranem, słaby internet, niecierpliwy.
**Każdy element designu projektujesz przez ten filtr.**

---

## 2. Filozofia produktowa — non-negotiables

> **Mała pizzeria nie potrzebuje narzędzi enterprise. Potrzebuje
> narzędzia które robi 5 rzeczy świetnie zamiast 50 rzeczy źle.**
> *(`CLAUDE.md`, `UX_BIBLE.md` Podsumowanie priorytetów MVP)*

Z tej zasady wynika:

**Robimy:**

- Strona publiczna ma jeden cel — klient zamawia w 90 sekund od wejścia
  do "Dziękujemy"
- Admin ma jeden cel — Pani Kasia widzi nowe zamówienie w 1 sekundę i
  klika jeden przycisk żeby ruszyć
- Wszystkie operacje destrukcyjne (anulowanie) wymagają potwierdzenia
- Wszystkie godziny / kwoty / dane restauracji pochodzą z API
  (`RestaurantSettings`, `PageContent`) — **zero hardcoded contentu**
- Mobile-first: 375 px to pierwszy obywatel, desktop dorobiony
- Polski język, polski format ceny ("32,90 zł"), polskie strefy czasowe

**Nie robimy:**

- Płatności online (Stripe / BLIK / P24) — ROADMAP
- Konta klientów (rejestracja, login, historia zamówień) — ROADMAP
- Kupony / rabaty / loyalty — ROADMAP
- Multi-language UI — ROADMAP
- Dark mode — ROADMAP
- PWA install prompt — ROADMAP
- Push notifications — ROADMAP
- Galeria zdjęć produktów (jedno zdjęcie wystarczy) — ROADMAP
- Upload zdjęć z dysku (URL input wystarczy, **AD-010**) — POMIJAMY
- File upload w ogóle — POMIJAMY
- Welcome offer / banner promocyjny — POMIJAMY
- Tooltip tour / onboarding wizard — POMIJAMY
- Pop-upy "JESZCZE 5 PRODUKTÓW W PROMOCJI" — POMIJAMY
- Live chat / AI chatbot — POMIJAMY
- Particle effects / fly-to-cart arc animation — POMIJAMY (drażni na
  słabszych urządzeniach)

**Hierarchia źródeł prawdy** (w razie konfliktu — niższy numer wygrywa):

1. `CLAUDE.md` (konstytucja, zakazy, filozofia)
2. `docs/PHASES.md` (co jest w scope Fazy 5, co poza)
3. `docs/UX_GAP_ANALYSIS.md` (kategoria elementu — MVP-critical /
   ROADMAP / OUT)
4. `docs/UX_BIBLE.md` (szczegóły implementacji — px, ms, copy)
5. `docs/ARCHITECTURE.md` (decyzje techniczne, AD-001…AD-023)
6. Ten brief (uszczegółowienie wizualne dla Claude Design)
7. `docs/design/bundle/` v1 (referencja, można odejść jeśli mamy lepszy
   pomysł zgodny z biblią)

---

## 3. Aktualny stan implementacji

> **Co już istnieje w kodzie i działa** — żebyś wiedział, czego nie
> trzeba projektować od zera, a co trzeba jedynie "doszlifować".

### 3.1 Frontend — strona publiczna

| Ekran | Route | Stan | Co działa |
|---|---|---|---|
| Landing | `/` | DONE v1 | Hero (PageContent HERO), About (PageContent ABOUT), Kontakt (adres, telefon, email, mapa OSM iframe), Godziny otwarcia (z `RestaurantSettings`) |
| Menu | `/menu` | DONE v1 | Sticky tabs kategorii (poziome scroll-snap mobile, sidebar pionowy desktop), grid produktów, modal produktu z wariantami i grupami dodatków, koszyk jako bottom sheet (mobile) i drawer (desktop slide-in z prawej) |
| Checkout | `/checkout` | DONE v1 | 2 kolumny desktop (form + sticky summary), single-col mobile + sticky bottom CTA, walidacja Zod, RHF, datalist autocomplete miast, postal mask, `DeliveryZoneBadge` w 3 stanach (FREE/PAID/UNAVAILABLE), CTA disabled gdy DELIVERY+UNAVAILABLE |
| Confirmation | `/order/:token` | DONE v1 | Numer zamówienia w mono XL, CTA "Śledź zamówienie", podstawowe info |
| Tracking | `/track/:token` | DONE v1 | Timeline statusów (horyzontalny desktop / wertykalny mobile), ETA card (slate-900), polling 15 s |

**Gdzie odbiega od biblii (do poprawy w Fazie 5 → Twój redesign):**

- **Sticky cart sidebar 360 px na desktop ≥ 1024 px** — obecnie koszyk
  jest tylko jako drawer slide-in. Biblia §2: koszyk powinien być
  **sticky sidebar** widoczny stale na liście produktów (desktop).
  Drawer/bottom sheet zostaje fallback dla < 1024 px.
- **Komentarze klienta per pozycja** (`OrderItem.itemNote`, max 200
  znaków) — pole textarea w `ProductModal` + edycja inline w sidebarze
  koszyka. Backend dorobi w Fazie 5.
- **Pasek informacyjny pod hero** (czas dostawy / min. zamówienie /
  koszt dostawy) — biblia §1 mówi że to jeden z najsilniejszych
  conversion driverów. Brak.
- **Banner "restauracja zamknięta"** — globalny, na całej stronie
  publicznej. Polling `isOpenNow()` co 60 s. Backend dorobi
  `manualClosedReason` / `manualClosedUntil`.
- **Scroll-spy menu** — auto-podświetlanie aktywnej kategorii w
  nawigacji w trakcie scrolla (IntersectionObserver, próg 25 % od
  góry sticky headera). Brak.
- **Animacja bump ikony koszyka** po `addItem` (200 ms scale 1 → 1.15
  → 1). Brak.
- **LQIP / blur-up** placeholder dla zdjęć produktów. Brak.
- **Dynamiczna cena na CTA modala** ("Dodaj do koszyka · 32,90 zł"
  zamiast samego "Dodaj"). Częściowe.
- **Tracking stepper z ikonami per status** (⏳ ✓ 👨‍🍳 🍕 🛵 🎉 ✕) +
  pulsowanie aktywnego dot 1.5 s loop. Stan obecny — uproszczony
  timeline.
- **Mapa kontaktu** — istnieje jako iframe OSM, zostaje. Polish
  ramki / kolorystyki w Twojej gestii.
- **Schema.org Restaurant** + OG tags dynamiczne — brak (w scope C2
  Fazy 5, ale nie wpływa na design).

### 3.2 Frontend — admin panel

| Ekran | Route | Stan | Notatki |
|---|---|---|---|
| Login | `/admin/login` | DONE v1 | Email + hasło, JWT w localStorage |
| Dashboard manager | `/admin` | DONE Faza 4.5 | 4 kafelki dziś (orders / revenue / AOV / aktywne) + Recharts BarChart godzinowy + LineChart 7 dni + top 5 produktów + 5 status tiles |
| Kuchnia | `/admin/kitchen` | DONE Faza 4.5 | 2 sekcje (NOWE / W PRZYGOTOWANIU), karty z border-l-4 statusu, animacja `urgentPulse` po 10 min, single-tap "Przyjmij" / "Gotowe" |
| Wydanie | `/admin/pickup` | DONE Faza 4.5 | 1 sekcja (DO WYDANIA), imię klienta jako bardzo duże, telefon klikalny `tel:`, kwota cash on pickup, confirm dialog na "Wydano" |
| Dostawa | `/admin/delivery` | DONE Faza 4.5 | 2 sekcje (DO ZABRANIA / W DOSTAWIE), adres jako bardzo duży, "🧭 Nawiguj" → Google Maps, telefon klikalny, kwota cash on delivery, confirm dialog na "Dostarczone" |
| Wszystkie zamówienia | `/admin/orders` | DONE v1 | Tabela z filtrami, paginacja, **jedyne miejsce gdzie można anulować** (z reason wymaganym) |
| Szczegóły zamówienia | `/admin/orders/:id` | DONE v1 | Pełne info, historia statusów (z reason), ETA dialog, cancel dialog |
| Menu — kategorie | `/admin/menu` | DONE v1 | Drag-and-drop sortowania (`displayOrder`), toggle aktywności inline |
| Menu — produkty | `/admin/menu` (tab) | DONE v1 | Grid 3 kol., toggle dostępności bez wchodzenia w edycję |
| Formularz produktu | `/admin/menu/products/:id/edit` | DONE v1 | Warianty inline, URL zdjęcia + live preview, grupy dodatków |
| Settings — Ogólne | `/admin/settings` | DONE v1 | Nazwa, slogan, kontakt, adres, link Google Maps, color picker (HEX + 6 swatches), live preview komponentów |
| Settings — Godziny otwarcia | `/admin/settings/opening-hours` | DONE v1 | 7 dni, switch otwarte/zamknięte, godziny od-do |
| Settings — Treści strony | `/admin/settings/page-content` | DONE v1 | Edytor Hero + About z live preview |
| Settings — Strefy dostawy | `/admin/delivery-zones` | DONE Faza 7.0 | CRUD stref (FREE/PAID/UNAVAILABLE), areas (city + opcjonalny postal), 2 tryby dodawania |

**Gdzie odbiega od biblii / co dochodzi w Fazie 5:**

- Sidebar admina jest "OK" ale potrzebuje refresh — biblia §22:
  active state bardziej kontrastowy, sekcje wyraźniej rozdzielone,
  badge z liczbą NEW na pozycji "Wszystkie zamówienia", subtle hierarchy
- `itemNote` wyświetlany w `OrderDetailPage` (żółta ramka, ikona 📝)
  + badge "📝 {N}" na liście zamówień — backend dorobi pole
- Animacja highlight nowego zamówienia na liście — zielony flash 600 ms
- Favicon dot / title badge `(N)` gdy są nieprzeczytane NEW
- Nowe pola w Settings:
  - **Czas przygotowania** (`defaultPreparationMinutes`, 5–120, step 5)
  - **Tymczasowe zamknięcie** (toggle "Zamknij teraz" + powód +
    opcjonalny datetime "Otwarcie planowane na")
- Sidebar admina dostaje 11 sekcji settings (5 realnych + 6 stubów —
  patrz §9)

### 3.3 Backend — co jest na produkcji

Wszystko co istotne dla designu już działa: `RestaurantSettings`,
`PageContent`, `OpeningHours`, menu (`Category`, `Product`,
`ProductVariant`, `AddonGroup`, `Addon`), `Order` z pełnym lifecycle'm,
`DeliveryZone` + `DeliveryZoneArea`, JWT auth, SSE dla admina.

Co **dochodzi w Fazie 5** (i wpływa na design):

- `OrderItem.itemNote` (VARCHAR 200, nullable) — komentarz klienta per
  pozycja
- `RestaurantSettings.defaultPreparationMinutes` (INTEGER NOT NULL DEFAULT
  30)
- `RestaurantSettings.manualClosedReason` (VARCHAR 200, nullable)
- `RestaurantSettings.manualClosedUntil` (TIMESTAMP WITH TIME ZONE,
  nullable)
- `Order.cancellationReason` lub `OrderStatusHistory.reason` (już ma —
  Faza 4.5) — decyzja architektoniczna w plan mode
- Endpointy: `PATCH /api/admin/settings/manual-close`, `DELETE /api/admin/settings/manual-close`

### 3.4 Tokeny v1 (do iteracji w v2)

```
--color-primary: 255 107 53   (RGB triplet, zacny pomarańcz / pomidorowy)
font-family: Inter (sans), ui-monospace (mono dla numerów zamówień)
radii: sm=4, md=6, lg=8, xl=12, full=9999
shadows: xs/sm/md/lg/focus (oranż 35% alpha)
motion: fast=120ms, base=180ms, slow=260ms, easing cubic-bezier(0.2,0.7,0.3,1)
spacing: 4px base (Tailwind defaults)
breakpoints: 375 / 768 / 1024 / 1280 / 1536
```

Bardzo prawdopodobnie chcesz to iterować w v2 — mamy 0 problem z
podmianą primary, dodaniem secondary, zmianą fontu na display, etc.
Ważne: **świadoma decyzja**, nie przypadkowy drift.

---

## 4. Zakres redesignu — co projektujesz

### 4.1 In scope

**Public site — wszystkie 7 ekranów (re)design:**

1. Landing (desktop 1280, mobile 375)
2. Menu — lista produktów + sticky sidebar koszyka 360 px (desktop) +
   bottom sheet (mobile)
3. Modal produktu (desktop) + bottom sheet produktu (mobile) — z
   komentarzem per pozycja
4. Cart sidebar (desktop) + cart drawer (mobile) — z edytowalnymi
   notatkami inline
5. Checkout (desktop 2-kol / mobile single-col + sticky bottom CTA)
6. Confirmation
7. Tracking — z stepperem ikon, pulsem aktywnego, ikoną per status,
   stanami terminalnymi (smacznego / anulowane)

**Public site — wsparcie cross-cutting:**

- **Banner "restauracja zamknięta"** — globalny pasek na każdym ekranie
  publicznym gdy `isOpenNow() === false`. Wariant: planowane otwarcie
  ("Otwieramy o 11:00") vs manual close ("Tymczasowo zamknięte do
  19:00 — Awaria pieca") vs zamknięte na stałe ("Otwieramy w pn o 11:00")
- **Pasek informacyjny pod hero** (landing only) — czas dostawy / min.
  zamówienie / koszt dostawy
- **Floating bottom bar koszyka** (mobile, gdy > 0 pozycji)

**Admin — kluczowe ekrany (re)design:**

8. Login
9. Dashboard manager (refresh wykresów + KPI tiles + status tiles)
10. Kuchnia — karty operacyjne, sekcje, timer escalation kolorów,
    `urgentPulse`
11. Wydanie — karty z imieniem klienta jako focal point, tel-link,
    cash on pickup
12. Dostawa — karty z adresem jako focal point, "Nawiguj", tel-link,
    cash on delivery
13. Wszystkie zamówienia — tabela, filtry, badge'e statusu, klikalne
    wiersze, modal cancel z reason
14. Szczegóły zamówienia (`/admin/orders/:id`) — pełen widok, sekcje,
    primary CTA "następny status →" pełnej szerokości, ETA dialog,
    cancel dialog, `itemNote` highlight
15. Menu — kategorie (drag-and-drop) + produkty (toggle dostępności)
16. Formularz produktu — warianty inline, URL zdjęcia + live preview,
    grupy dodatków
17. Sidebar admina — refresh hierarchii (operacyjne / archiwum /
    konfiguracja), badge NEW, active state
18. **Settings hub** — nawigacja po 11 sekcjach (zob. §9)

**Admin — komponenty operacyjne:**

- `KitchenOrderCard`, `PickupOrderCard`, `DeliveryOrderCard` (3 warianty
  karty operacyjnej z jasnym focal pointem)
- `CancelOrderDialog` (textarea + checkbox potwierdzenia
  nieodwracalności)
- `EtaDialog` (slider lub picker minut, biblia §15: "Ustaw na: 15 / 20
  / 30 / 45 / 60 min" — preset chips)
- Banner manual close w panelu admina (wskazuje że jesteś zamknięty
  manualnie + CTA "Wznów")

### 4.2 Out of scope (NIE projektujesz)

- Płatności online — żadnego widgetu Stripe / BLIK / P24
- Logowanie klienta / rejestracja / "Moje zamówienia" / ulubione
- Galeria zdjęć produktów (jedno zdjęcie wystarczy)
- File upload zdjęć z dysku (URL input wystarczy — AD-010)
- Multi-language switcher
- Dark mode toggle
- Welcome offer / kupony / kody rabatowe
- Wykresów przychodów detalicznych w admin (zostają KPI tiles + 2
  wykresy z Fazy 4.5, bez rozbudowy)
- Edycji godzin otwarcia świątecznych (`Exception`) — ROADMAP
- Drukarki ESC/POS — ROADMAP
- KDS dedykowany ekran — Kuchnia z 4.5 wystarczy
- Capacity manager (max aktywnych) — ROADMAP
- Onboarding wizard — POMIJAMY
- 404 / 500 design — minimum estetyczne (Faza 5 ma error boundaries),
  ale nie potrzebujemy piksel-perfect

### 4.3 Stuby Poziom A — co to znaczy

**Poziom A** = projekt sekcji powstaje jako **placeholder z konkretnym
copy** ale **bez funkcjonalnego mock-up'u**. Wygląda jak realna sekcja,
ma:

- Kicker / nagłówek sekcji
- Krótki opis "co tu będzie" (1–2 zdania)
- Empty state ilustracyjny (ikona + tekst + ewentualne primary CTA
  prowadzące do dokumentacji / kontaktu z deweloperem)
- Notkę "🚧 W przygotowaniu — dostępne w wersji Pro / dostępne wkrótce"

**Cel:** klient (Pani Kasia / kolejni klienci) widzi że produkt jest
**przemyślany kompleksowo**, ale operator dewelopera (my) nie buduje
tego w MVP. Sekcja jest "klikalna" w sidebarze settings, otwiera się,
pokazuje co planowane, daje info gdzie się kierować.

---

## 5. Style guide v2 — kierunek wizualny

> **Generalna intencja:** "Pyszne dla klienta końcowego, premium SaaS
> dla admina." Public site zachowuje ciepło i apetyczność (food jest
> emocjonalny — jedzenie, kolor, zdjęcia, bliskość "lokalu"). Admin jest
> chłodny, gęsty informacyjnie, z proporcjami i typografią z Linear /
> Stripe Dashboard / Vercel — Pani Kasia ma znaleźć zamówienie w 1 s,
> nie podziwiać piksele.

### 5.1 Kolor

**Primary (brand) — do dyskusji.** Obecny `255 107 53` (oranż /
pomarańcz pomidorowy) działa, ale jest już opatrzony. Rozważ propozycję:

- **Wariant A — pozostajemy przy obecnym** (consistency z istniejącymi
  artefaktami, brand recall, ekonomicznie)
- **Wariant B — głębszy czerwony pizzowy** (`#D62828` z biblii §34
  jako sugestia) — bardziej "włoska pizza", bardziej kontrast z neutral
- **Wariant C — twoja propozycja** (np. terracotta `#C2410C`, deep red
  `#B91C1C`, basil green `#16A34A` jako accent) — uzasadnij krótkiem

**Wybierz jeden wariant i obroń decyzję.** Nie kolektor opcji — jedna
rekomendacja jako default + alternatywa do wglądu klienta.

**Status colors** (zachowaj zgodność z `lib/sounds.ts` per status,
`statusColors.ts` — frontend operuje na nich w karatch operacyjnych):

| Status | Hue | Tailwind | Użycie |
|---|---|---|---|
| NEW | amber | `amber-500` / `amber-50` bg | Nowe — wymagają akcji |
| CONFIRMED | blue | `blue-500` / `blue-50` bg | Przyjęte przez admina |
| IN_PREPARATION | orange/primary | `primary` / `primary/10` bg | W kuchni |
| READY | emerald | `emerald-500` / `emerald-50` bg | Gotowe |
| OUT_FOR_DELIVERY | indigo | `indigo-500` / `indigo-50` bg | W drodze |
| DELIVERED | slate | `slate-500` / `slate-50` bg | Terminalny success |
| CANCELED | red | `red-500` / `red-50` bg | Terminalny cancel |

**Neutrals.** Slate (Tailwind) — `slate-50` background, `slate-900`
primary text, `slate-600` secondary text, `slate-400` placeholders,
`slate-200` borders. Zaufany wybór, działa.

**Background.** Public site: `slate-50` jako tło sekcji, `white` jako
karty / produkt / koszyk. Admin: `slate-50` jako tło layoutu, `white`
jako tło treści, `slate-100` jako separator między sekcjami.

### 5.2 Typografia

**Body font.** **Inter** — bez dyskusji (Google Fonts, polskie znaki
działają, czytelność high). Weights: 400, 500, 600, 700, 800.

**Display font (do dyskusji).** Bundle v1 używa Inter na wszystko.
Biblia §34 sugeruje opcjonalnie Poppins. Premium SaaS (Linear, Vercel)
często używa custom display (Inter Display, Söhne, Inter Tight).

**Propozycja:** **Inter wszędzie**, tylko `tracking-tight` na headlines
(H1, H2) + większe rozmiary. Powód: prostota deploy, jeden fetch font,
spójność. Jeśli widzisz silne uzasadnienie dla display (np. landing hero
w Fraunces / Playfair Display jako "włoski elegancki" element) —
zaproponuj jeden konkret z mocnym argumentem, nie zestaw opcji.

**Skala** (mobile / desktop, gdzie różne):

| Token | Mobile | Desktop | Weight | Użycie |
|---|---|---|---|---|
| display | 36 px | 48–56 px | 700 | Hero landing |
| h1 | 28 px | 32 px | 700 | Sekcja landing, page title admin |
| h2 | 22 px | 24 px | 600 | Subsection, sidebar nagłówki |
| h3 | 18 px | 20 px | 600 | Card title |
| body-lg | 16 px | 18 px | 400 | Long-form (about, opisy) |
| body | 14 px | 14–16 px | 400 | Default |
| small | 12 px | 13 px | 500 | Caption, kicker, label |
| mono-xl | — | 32–40 px | 600 | Numer zamówienia w confirmation |
| mono | 14 px | 14 px | 500 | Numer zamówienia w listach, kod pocztowy |

### 5.3 Spacing, radii, shadows, motion

**Trzymamy się tokenów v1** (działają, zostały zwalidowane):

- Spacing: 4 px base, Tailwind `gap-1..16`
- Radii: `sm` 4 / `md` 6 / `lg` 8 / `xl` 12 / `full` — kontrole 6 px,
  karty 8 px, modaly 12 px
- Shadows: `xs` (0 1px 2px slate/4 %), `sm` (karty default), `md` (hover
  lift), `lg` (modal / sheet), `focus` (primary 35 % ring)
- Motion: 120 / 180 / 260 ms, easing `cubic-bezier(0.2, 0.7, 0.3, 1)`
  (smooth, bez bounce'a)

**Co możesz dodać w v2 (jeśli ma uzasadnienie):**

- Glow / ring-offset dla focused interactive (premium SaaS często
  dodaje 2 px ring-offset, dwie warstwy)
- Micro-shadows kart na hover (`md` + `outline-1 slate-200/50`)
- Specific motion dla cart bump (200 ms, scale 1 → 1.15 → 1, easing
  `back.out(1.7)` jak GSAP)

### 5.4 Iconography

**Lucide React** — zostaje (~ 1000 ikon, 1.5–2 px stroke, MIT, świetnie
z React). Nie dyskutujemy.

Dopuszczalne emoji w MVP (drobiazgi): 🚗 (DELIVERY), 🏪 (PICKUP), 📝
(notatka klienta), 🌶 (ostre), 🌱 (wege), 🎉 (terminalny success), ⏳ ✓
👨‍🍳 🍕 🛵 ✕ (tracking stepper). Jeśli chcesz zaproponować Lucide
substytuty dla emoji — proszę. Konsystencja > emoji nostalgia.

### 5.5 Imagery

**Brak galerii zdjęć produktów** — jedno zdjęcie per produkt, URL
input. Aspect ratio **4:3** (preferowane dla pizzy / dań). LQIP / blur
placeholder fade-in 200 ms.

**Hero image** — ustawiane przez admina (Settings → Treści strony).
Bez parallax, bez video hero. Statyczne, ciężkie zdjęcie pizzy /
wnętrza lokalu, treated overlay dla czytelności hero copy.

**Placeholder graphic** dla braku zdjęcia (admin produkt bez URL,
landing przed wgraniem hero):

```css
background-image: repeating-linear-gradient(
  135deg,
  rgba(15,23,42,0.04) 0,
  rgba(15,23,42,0.04) 8px,
  rgba(15,23,42,0.08) 8px,
  rgba(15,23,42,0.08) 16px
);
```

### 5.6 Voice & tone (Polski)

**Klient publiczny** — przyjacielski, **per ty**, krótko, ciepło. Nie
nadgorliwy.

- ❌ "Witamy w naszej restauracji! Cieszymy się, że nas odwiedzasz!"
- ✅ "Cześć. Co dziś zamawiasz?"

**Admin (Pani Kasia)** — krótko, po imieniu / per ty, zero korpomowy,
zero "drogi użytkowniku".

- ❌ "Czy chciał/a Pan/i potwierdzić anulowanie zamówienia?"
- ✅ "Anulować zamówienie? Powód jest wymagany."

**Mikrocopy z biblii §15 — szczegóły** (przyjmij za default, możesz
zoptymalizować pojedyncze frazy z uzasadnieniem):

| Sytuacja | Copy |
|---|---|
| Empty cart | "Twój koszyk jest pusty. Zacznij od pizzy." |
| Empty list zamówień admin | "Brak zamówień. Czekamy na pierwsze." |
| Empty Kuchnia | "Brak zamówień do przygotowania." |
| Empty Wydanie | "Brak zamówień do wydania." |
| Empty Dostawa | "Brak zamówień do dostarczenia." |
| Toast success addItem | "✓ Dodano do koszyka" (auto-dismiss 2 s) |
| Toast success status change | "Zamówienie #2026-00184 → Gotowe" |
| Toast error generic | "Coś poszło nie tak. Spróbuj ponownie." |
| Banner restaurant closed (planned) | "Otwieramy o {godzina}." |
| Banner restaurant closed (manual) | "Tymczasowo zamknięte. {reason}" |
| Banner restaurant closed (manual + until) | "Tymczasowo zamknięte do {godzina}. {reason}" |
| Cancel order confirm | "Anulować zamówienie? Powód jest wymagany. Operacja jest nieodwracalna." |
| Min order warning | "Brakuje **{X} zł** do minimum zamówienia ({min} zł)." |
| Free delivery progress | "🎉 Brakuje **{X} zł** do darmowej dostawy." |
| Delivery zone unavailable | "Nie dostarczamy pod ten adres. Sprawdź miasto i kod pocztowy." |

---

## 6. Inspiracje — Pyszne / Uber Eats / premium SaaS

> **Trzy źródła, trzy role.**

### 6.1 Pyszne.pl — public-side patterns

**Co bierzemy:**

- Sticky cart sidebar 360 px na desktop (główna inspiracja dla §7.2
  Menu)
- Pasek informacyjny pod hero (czas / min / koszt dostawy)
- Karty produktów: zdjęcie 4:3 + nazwa + opis 2 linie + cena dolna
  lewa + przycisk "+" w okrągłym FAB-ie 44 px
- Bottom sheet produktu na mobile z handle do zamknięcia swipe-down
- Floating bottom bar koszyka na mobile gdy > 0 pozycji
- Progres do darmowej dostawy ("🎉 Brakuje 8 zł")
- Modal anulowania zamówienia z polem powodu

**Czego NIE bierzemy:**

- Wielomarkowy header (logo Pyszne + restauracja + linki
  agregatorowe) — my jesteśmy single-tenant, jedna marka, jeden cel
- Filtry restauracji, lista restauracji, mapa restauracji, ratingi
- Konto klienta, historia, ulubione
- Kupony "ZAJAA10", banery promocyjne agresywne

### 6.2 Uber Eats — interactions

**Co bierzemy:**

- Hide-on-scroll-down / show-on-scroll-up sticky header (threshold
  100 px — daje więcej miejsca na content)
- Scroll-spy menu z auto-podświetlaniem aktywnej kategorii
- Spring easing iOS-like dla bottom sheets (`cubic-bezier(0.32, 0.72,
  0, 1)`, 300 ms)
- Pizza tracker / stepper z ikonami i pulsem aktywnego (Domino's
  inspirowany — Uber też tak robi w cleaner formie)
- "Ok. 18:45" konkretny czas dostawy zamiast "ok. 30 min" (biblia §11)

**Czego NIE bierzemy:**

- Multi-handoff (delivery / pickup / curbside / dine-in / group order)
  — my mamy delivery + pickup, MVP wystarczy
- Tip flow przy checkout
- Social proof "Order from this restaurant 1.2 K times this week"

### 6.3 Premium SaaS (Linear, Stripe Dashboard, Vercel) — admin patterns

**Co bierzemy:**

- **Linear:** gęstość informacyjna, klawiaturowe shortcuts hint po
  hover (admin power user), cards z subtle border zamiast heavy
  shadows, typography scale tight (mniejsze rozmiary, więcej air),
  command palette (post-MVP, ale wzorzec)
- **Stripe Dashboard:** tabele danych z filter chips na górze, status
  badge'e jako filled pills z proporcjonalnym kontrastem, sidebar
  z 3 sekcjami operacyjnymi (Today / All / Settings), KPI tiles
  z proporcją liczba ↑↑ / kontekst ↓
- **Vercel:** "less is more" — biały space, minimum chrome,
  mono-typed numerical data (numery zamówień!), focus states super
  klarowne, dark borders `slate-200` zamiast `gray-300`

**Konkretne patterny do zaadoptowania:**

- Sidebar admina z 3 sekcjami (operacyjne / archiwum / konfiguracja),
  separatory subtelne, active state z `bg-primary/10 text-primary
  font-medium` + lewy 3 px primary border (już mamy v1 — refresh
  proporcji)
- Karty operacyjne z `border-l-4` w kolorze statusu (Faza 4.5 — zostaje)
- Numer zamówienia zawsze w mono, w karcie operacyjnej duży (20–24 px),
  w confirmation gigantic (32–40 px)
- Tabela zamówień z sticky header, filter chips, paginacja na dole,
  klikalne wiersze (cursor-pointer + hover row)
- Empty states z ikoną w `slate-300` + tytuł + opis + (opcjonalne) CTA
  prowadzące do akcji

**Czego NIE bierzemy:**

- Command palette (Cmd+K) — ROADMAP, fajne, nie MVP
- Live cursors / multi-user awareness — nie ma więcej niż 1 admin
  online (właściciel + ew. mąż)
- Wykresy realtime z websocket-streaming animacji — Recharts
  + invalidate co 60 s wystarczy

---

## 7. Public site — szczegółowe ekrany

> **Per ekran:** route, cel, layout desktop / mobile, kluczowe elementy,
> stany (default / empty / error / loading), animacje, copy. Korzystaj
> z biblii §1–17 dla detali (px, ms, copy) — tu mam intencję.

### 7.1 Landing (`/`)

**Cel:** w 5 sekund klient wie co tu jest, klika "Menu" lub scrolluje.

**Layout desktop (1280 px):**

1. **Sticky header** (64 px) — logo (z `RestaurantSettings.logoUrl` +
   nazwa) + linki nav (Menu, O nas, Kontakt) + ikona koszyka z badge'm
   (jeśli > 0 pozycji). Hide-on-scroll-down.
2. **Hero** (asymetryczny 5/7 split lub full-bleed background image):
   - Lewa (5 kol.): "Cześć." kicker + nazwa restauracji w `display`
     + slogan `body-lg` + 2 CTA ("Zamów teraz" primary / "Zobacz menu"
     ghost)
   - Prawa (7 kol.): hero image z subtle overlay dla kontrastu
   - Min height: 70 vh (dvh), max 720 px
3. **Pasek informacyjny** — pod hero, 3 ikony + tekst inline
   (`Clock` + "Dostawa 35 min", `Wallet` + "Min. 30 zł", `Truck`
   + "Dostawa od 8 zł"). Tło `slate-100`, padding 16/24 px.
4. **Sekcja "Menu"** (teaser) — 3 najbardziej popularne kategorie jako
   karty z zdjęciem + nazwa + "X produktów" + CTA "Zobacz menu →"
5. **Sekcja "O nas"** (z `PageContent` ABOUT) — 2-kol layout: lewa
   krótki tekst + 3 liczby (np. "12 lat / 400°C / 90 sek."), prawa
   zdjęcie wnętrza
6. **Sekcja "Godziny otwarcia"** — 2-kol: lewa lista 7 dni z
   wyróżnioną dziś (primary background tint), prawa info: "Dziś
   otwarte: 11:00 – 22:00" + przyciski "Zamów" / "Zadzwoń"
7. **Sekcja "Kontakt"** — 2-kol: lewa adres + telefon + email +
   social links, prawa mapa OSM iframe (border-radius 12, cienka
   ramka slate-200)
8. **Footer** — logo + sloagn + linki prawne (regulamin / polityka
   prywatności / RODO) + © {rok} {nazwa}

**Layout mobile (375 px):** wszystko jednokolumnowo, kolejność 1–8,
hero ma full-bleed image z overlay, CTA stack, pasek informacyjny w 3
wierszach (każda info w osobnej linii z ikoną).

**Stany specjalne:**

- **Restauracja zamknięta** (planowane otwarcie później dziś / jutro):
  globalny banner pod headerem (czerwone tło `red-50` + `red-700` text
  + ikona `AlertCircle`): "Tymczasowo zamknięte. Otwieramy o **11:00**."
- **Restauracja zamknięta manualnie**: "Tymczasowo zamknięte. {reason}"
  (z opcjonalnym "do {godzina}")
- **Brak `PageContent` ABOUT**: sekcja ukryta (admin nie wpisał, nie
  wymyślaj zastępczego copy)
- **Brak hero image**: fallback solid color z primary 10 % + nazwa
  restauracji w display jako "logo placeholder"

**Animacje:**

- Hero parallax — **NIE**, pomijamy (drażni mobile, słabe urządzenia)
- CTA hover: scale 1.02 + shadow `md` (200 ms)
- Karty kategorii hover: translateY(-2px) + shadow `md` (200 ms)
- Sticky header shadow przy scroll > 50 px (200 ms fade)

### 7.2 Menu (`/menu`) — TWOJE FOCUS

**Cel:** klient w 60 sekund znajduje co chce, dodaje do koszyka,
przechodzi do checkoutu.

**Layout desktop (≥ 1024 px) — 3 kolumny:**

```
┌──────────────────┬──────────────────────────┬───────────────────┐
│ Kategorie 200 px │ Lista produktów płynna   │ Koszyk 360 px    │
│ sticky top:80px  │                          │ sticky top:80px  │
│ pionowa nav      │ grid 1-2-3 kol           │                  │
│                  │ scroll-spy aktywuje      │                  │
│                  │ kategorie po lewej       │                  │
└──────────────────┴──────────────────────────┴───────────────────┘
```

**Sticky header** (64 px) z hide-on-scroll-down.

**Lewa kolumna — kategorie** (200–240 px):

- Lista pionowa, każda pozycja: nazwa kategorii + (opcjonalnie) liczba
  produktów w nawiasach `(N)`
- Aktywna kategoria: `bg-primary/10 text-primary font-medium border-l-3
  border-primary`
- Nieaktywna: `text-slate-600 hover:bg-slate-100`
- Scroll-spy threshold: kategoria aktywuje się gdy heading przekroczy
  `top: 120 px` od góry viewportu (pod sticky headerem + tabs).
  Throttle 100 ms.

**Środkowa kolumna — lista produktów** (płynna, ~640–720 px):

Per kategoria — heading sekcji (`h2` 24 px, sticky pod tabs offset?
nie — niech scrolluje normalnie) + grid kart produktów.

Grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`.

**Karta produktu:**

- Zdjęcie 4:3 (`aspect-[4/3]`), `object-cover`, LQIP placeholder
- Badge w lewym górnym rogu (jeśli applicable): "Bestseller" primary,
  "Nowość" green, "Promocja" amber. Tylko jeden naraz.
- Ikony w prawym górnym (jeśli applicable): 🌶 ostre, 🌱 wege —
  half-transparent white tło 8x8 px lewa rogu
- Padding 16 px treść:
  - Nazwa (`h3` 18 px weight 600), 1 linia ellipsis
  - Opis 14 px slate-600, 2 linie ellipsis (`-webkit-line-clamp: 2`)
  - Składniki / alergeny — w modalu, **nie na karcie**
  - Cena 18–20 px weight 700 (lewa), `+` button 44×44 px
    `rounded-full bg-primary` (prawa dolna)
- Wariant z wariantami: zamiast "+" pokazuje text "Wybierz rozmiar →"
  w primary 12–14 px (klik otwiera modal)
- Hover (desktop): translateY(-2 px) + shadow `md` 200 ms
- Stan **niedostępny dziś**:
  - Zdjęcie opacity 0.5 + filter grayscale(0.7)
  - Overlay napis "Niedostępne dziś" centred (white tło rgba(0,0,0,0.6),
    bold 14 px)
  - Cena przekreślona (line-through)
  - Przycisk "+" disabled (opacity 0.4, cursor not-allowed)
- Stan **w koszyku**:
  - 1 px primary border na karcie
  - Badge "1× w koszyku" w prawym górnym (subtelny, primary tint)

**Prawa kolumna — koszyk sticky sidebar** (360 px):

> **TO JEST NAJWAŻNIEJSZA ZMIANA DESIGNOWA W TYM REDESIGNIE.**
> Obecnie koszyka NIE MA jako sidebar — jest tylko jako drawer
> slide-in. Bibilia §2 mówi: koszyk widoczny stale = wzrost konwersji.

Layout sidebara koszyka:

```
┌─────────────────────────────────┐
│ Header: "Koszyk · 3"      [X]   │  ← liczba pozycji
├─────────────────────────────────┤
│ Lista pozycji (scrollable)      │
│   Pozycja 1                     │
│   ├ Nazwa + warianty            │
│   ├ Notatka inline (edit)       │
│   ├ Stepper qty + cena          │
│   └ × usuń                       │
│   Pozycja 2 ...                 │
├─────────────────────────────────┤
│ Pasek progres min order /       │
│  free delivery (jeśli mają)     │
├─────────────────────────────────┤
│ Subtotal:           120,00 zł   │
│ Dostawa:              0,00 zł   │ ← lub "wybierz adres"
│ ─────────                       │
│ Razem:              120,00 zł   │
├─────────────────────────────────┤
│ [ Zamów · 120,00 zł ]    44 px  │ ← primary CTA full-width
└─────────────────────────────────┘
```

**Pozycja w koszyku — anatomia:**

- Top row: nazwa produktu (14 px weight 600) + cena pozycji (po prawej,
  14 px weight 600 mono)
- Pod nazwą: warianty + dodatki w jednej linii, 12 px slate-500
  ("30 cm · ekstra ser, oregano")
- Pod tym: **notatka klienta** (jeśli istnieje) — kursywa 12 px
  primary `text-primary italic`, ikona 📝 (lub Pencil) — klik →
  inline edit (textarea max 200 znaków, licznik na dole)
- Bottom row: stepper qty (− N +) — 32 px wysokości — po lewej, ×
  ikona `Trash2` po prawej
- Border bottom slate-200 między pozycjami, ostatnia bez

**Stepper:**

- 3 segmenty: − / liczba / + każdy 32×32 px (mobile 36×36)
- Border `slate-300`, primary text na hover
- Zero kombinatoryki — biblia §2: "klik − przy 1 → potwierdzenie usunąć"
  (małe confirm dialogowe lub direct usuń)

**Pasek progres:**

- Jeśli aktywne minimum order: czerwony pasek "Brakuje **5 zł** do
  minimum (35 zł)" + progress bar (width % wypełnienia)
- Jeśli aktywne free delivery threshold: zielony "🎉 Brakuje **8 zł**
  do darmowej dostawy"
- Oba mogą być widoczne równocześnie (najpierw minimum, potem free)

**Empty state:**

- Ikona koszyka 48 px slate-300
- Tytuł 16 px weight 500: "Twój koszyk jest pusty"
- Opis 13 px slate-500: "Zacznij od pizzy."
- Bez CTA (klient już jest na menu)

**Stany checkout-related:**

- Brak adresu (klient nie wprowadził): "Dostawa: wybierz adres przy
  zamówieniu"
- Strefa unavailable: czerwony border + "Nie dostarczamy pod ten adres"
  + CTA "Zmień adres"
- Mobile: sidebar znika, koszyk staje się **drawer slide-in z prawej**
  + **floating bottom bar** ("Koszyk · 3 · 120,00 zł" + ikona koszyka)
  na dole gdy > 0 pozycji

**Animacje:**

- `addItem`: bump ikony koszyka w headerze (200 ms scale 1 → 1.15 → 1)
  + bump na karcie produktu (150 ms scale 1 → 0.97 → 1) + toast "✓
  Dodano do koszyka" (auto-dismiss 2 s)
- Pozycja w sidebar koszyka: fade-in 200 ms slide-from-bottom 8 px

**Layout tablet (768–1023 px):**

- Lewa nav kategorii pionowo lub poziomo jako sticky tabs (decyzja:
  poziomo — bardziej współczesne, jak Uber Eats)
- **Koszyk znika z sidebara** — drawer slide-in z prawej (klik ikona
  koszyka w headerze) + floating bottom bar mobile-style
- Grid produktów: `grid-cols-2`

**Layout mobile (< 768 px):**

- 1 kolumna, kolejność:
  1. Sticky header (56 px) + sticky tabs kategorii (poziome
     scroll-snap, 48 px wysokości) — w sumie 104 px sticky
  2. Lista kategorii + produktów (1 kolumna, gap 12 px)
  3. **Floating bottom bar koszyka** gdy > 0 pozycji: pełna szerokość
     56 px, primary tło, white text, "Koszyk · 3 · 120,00 zł" + chevron
     prawy, klik → drawer/sheet bottom-up
- Drawer/sheet pełnoekranowy (bottom sheet 90 vh, handle 36×4 px na
  górze, swipe-down zamyka)

### 7.3 Modal produktu (desktop) / Bottom sheet produktu (mobile)

**Otwarcie:** klik gdziekolwiek na karcie produktu (poza "+") → modal
otwiera się **dla każdego produktu** (nawet bez wariantów — chcemy
spójność flow + miejsce na pełny opis + komentarz).

**Wyjątek:** jeśli produkt **NIE ma wariantów ani dodatków** — klik
"+" dodaje od razu bez modala (jak Pyszne).

**Desktop modal:**

- `max-width: 540–600 px`, `max-height: 90 vh`, centered, `border-radius:
  16 px`, backdrop `rgba(0,0,0,0.5)`, fade-in 200 ms + scale 0.95→1.0 250 ms
- Layout pionowy:
  1. Zdjęcie pełna szerokość, aspect 4:3
  2. X w prawym górnym (40×40 px touch target, ikona X 20 px,
     `rounded-full bg-white/90 shadow-sm`)
  3. Padding 24 px treść:
     - Nazwa (h2 24–28 px weight 700)
     - Opis pełny (14 px slate-700)
     - Skład (1 linia 14 px slate-600 — "Składniki: sos pomidorowy...")
     - Alergeny (ikony + nazwy 14 px, opcjonalne "Pokaż wszystkie")
     - **Sekcja wariantów** (jeśli ma): nagłówek "Wybierz rozmiar"
       + chip "Wymagane" (czerwony / gray), radio cards single-select
       (każda karta border 1 px slate-200, aktywna 2 px primary +
       primary tint background, lewa nazwa wariantu bold + prawa cena
       bold). Np. "30 cm — 32,90 zł" / "40 cm — 42,90 zł"
     - **Sekcje grup dodatków** (każda grupa to osobna sekcja):
       - Nagłówek "Dodatki" + chip "Opcjonalne" lub "Wymagane"
       - Tryb single (radio) lub multi (checkbox), z `min`/`max`
         z grupy
       - Każdy dodatek: checkbox/radio + nazwa + cena (+X,XX zł)
     - **Komentarz do zamówienia** (`itemNote`):
       - Label: "Notatka dla kuchni" + chip "Opcjonalne"
       - Textarea 2–3 wiersze, max 200 znaków, licznik dolny
       - Placeholder: "np. Bez cebuli, dzwonić — domofon nie działa"
  4. **Sticky footer** (zawsze widoczny, biały + shadow górny):
     - Stepper qty (− N +)
     - **Primary CTA** "Dodaj do koszyka · {cena × qty} zł" — full
       width, 48 px wysokości, dynamiczna cena live update

**Mobile bottom sheet:**

- Wysuwa się od dołu, max-height 90 vh, border-radius 16 px tylko u
  góry, **handle** (kreska szara 36×4 px wycentrowana, padding 8 px)
- Swipe down zamyka (próg 40 % wysokości lub velocity > 0.5 px/ms)
- Animacja: backdrop fade 200 ms + sheet `translateY(100%) →
  translateY(0)` 300 ms easing iOS spring `cubic-bezier(0.32, 0.72,
  0, 1)`
- Layout identyczny z desktopem ale full-width
- Sticky footer pinned do dołu

**Stany:**

- Loading (jeśli fetch szczegółów): skeleton dla zdjęcia + 3 paski
  tekstu
- Wariant required nie wybrany: CTA disabled, micro-copy "Wybierz
  rozmiar"
- Komentarz > 200 znaków: licznik czerwony, walidacja przy submit

### 7.4 Cart sidebar / drawer — szczegóły

Już opisane w §7.2 (sidebar) i §7.5 (drawer mobile). Jedna uwaga:

- **Inline edit notatki** w sidebar: klik na notatkę → textarea pojawia
  się z aktualną wartością + counter (X/200) + 2 buttony "Zapisz"
  (primary, mały) i "Anuluj" (ghost). Auto-save on blur też OK,
  jeśli prosto.
- **Usuwanie ostatniej pozycji**: klik × → confirm dialog mały "Usunąć
  z koszyka?" — biblia §2 sugeruje, ale realnie undo toast jest mniej
  irytujący ("Usunięto. **Cofnij**" — auto-dismiss 5 s)

### 7.5 Cart drawer (mobile)

- Slide-in z prawej (lub bottom-sheet — zaproponuj jeden, zdecydowanie)
- Pełna wysokość 90 vh
- Handle u góry, swipe-down lub klik X zamyka
- Layout identyczny ze sidebar desktop, plus dolny przycisk "Zamów"
  bezpośrednio (nie potrzebuje sticky bottom bar — sam drawer jest
  sticky bottom)

### 7.6 Checkout (`/checkout`)

**Desktop layout 2-kolumny (główna 720 px / sticky summary 360 px):**

Lewa kolumna — sekcje numerowane (kicker "01", "02", "03", "04"):

1. **Sposób realizacji** (tabs/radio cards): "🚗 Dostawa" / "🏪 Odbiór
   osobisty"
2. **Adres dostawy** (jeśli DELIVERY) — formularz:
   - Imię + Nazwisko (2 kol.)
   - Telefon (z polskim formatem +48)
   - Email (opcjonalnie — do tracking link)
   - Miasto (datalist autocomplete z `/api/public/delivery/cities`)
   - Kod pocztowy (mask 00-000)
   - Ulica + numer domu / lokalu (single line lub 2 kol)
   - Notatka adresowa (textarea opcjonalna — "Domofon nie działa, 3
     piętro bez windy")
   - **`DeliveryZoneBadge`** pod polami adresu live update
     (debounced 300 ms): FREE green, PAID amber, UNAVAILABLE red
3. **Dane do odbioru** (jeśli PICKUP) — Imię + Nazwisko + Telefon +
   Email opcjonalny
4. **Płatność**: hardcoded radio cards "Gotówka przy odbiorze" /
   "Gotówka przy dostawie" (zależy od fulfillment) — w MVP **tylko
   gotówka** (decyzja w `UX_GAP_ANALYSIS.md` Sekcja 27)
5. **Podsumowanie zamówienia** (mini lista pozycji, expand "Pokaż
   szczegóły" jeśli długa)
6. **Notatka dla restauracji** (opcjonalna — `customerNotes` na
   `Order`, max 500 znaków)

Prawa kolumna — sticky summary (top: 80 px):

- Lista pozycji kompaktowo (nazwa × qty + cena, 14 px)
- Subtotal
- Dostawa (z fee z DeliveryZone)
- **Razem** (24 px weight 700, mono dla kwoty)
- **Primary CTA** "Złóż zamówienie · {total}" full-width 48 px
- Pod CTA: linkitem "Zobacz regulamin" + "Polityka prywatności"
  (12 px slate-500 underline)

**Mobile single-col + sticky bottom CTA:**

- Wszystkie sekcje pionowo
- **Sticky bottom bar** (white + shadow górny + safe-area padding):
  "Razem: 120,00 zł" lewa + "Złóż zamówienie →" primary CTA prawa,
  56 px wysokości

**Stany:**

- Loading submit: CTA disabled + spinner inline + "Wysyłanie..."
- Error 422 niedostępny produkt: banner czerwony nad form z listą
  produktów do usunięcia + CTA "Usuń niedostępne i spróbuj ponownie"
- Error 422 unavailable zone (DELIVERY): badge red + CTA disabled +
  "Zmień adres"
- Restauracja zamknęła się (polling 60 s): banner czerwony + CTA
  disabled + "Restauracja zamknęła się — spróbuj ponownie później"
- 429 rate limit: toast "Zbyt wiele prób. Spróbuj za chwilę."
- Walidacja inline: red border + ikona AlertCircle + komunikat
  pod polem 12 px red-600

### 7.7 Confirmation (`/order/:token`)

**Cel:** klient potwierdza, że zamówienie poszło, dostaje numer i link
do trackingu.

**Layout (centered card max-width 580 px):**

1. Ikona success (CheckCircle 32 px primary w okrągłym tle 64 px
   primary/10)
2. **Headline 36 px weight 600 slate-900**: "Dziękujemy za zamówienie!"
3. Subline 15 px slate-500: "Link do śledzenia został wysłany na
   {email}." (jeśli email podany) lub "Zachowaj numer zamówienia."
4. **Numer zamówienia** w karcie slate-50:
   - Label "Numer zamówienia" 12 px slate-500 uppercase
   - Numer w mono 32–40 px weight 600 slate-900: "2026-00184"
   - Przycisk "Skopiuj" (ikona Copy + tekst, ghost button)
5. **ETA / czas dostawy** (prominent, primary background tint):
   - Dla DELIVERY: "Dostawa ok. **18:45**" (godzina absolutna z
     `eta = createdAt + defaultPreparationMinutes`)
   - Dla PICKUP: "Odbiór za ~ **30 min**"
6. **Lista pozycji** (compact summary):
   - Każda pozycja: ikona 🍕 + nazwa + qty + cena
   - `itemNote` w italic primary jeśli istnieje
   - Expand/collapse "Pokaż szczegóły" (warianty, dodatki)
7. **Adres dostawy** (jeśli DELIVERY) lub **Info odbioru** (jeśli
   PICKUP — adres restauracji + telefon)
8. **Metoda płatności**: "Gotówka przy odbiorze: 120,00 zł" (red
   accent na kwocie)
9. **Primary CTA** "Śledź zamówienie →" full-width 48 px
10. **Secondary CTA** "Wróć do menu" (ghost button, opcjonalny)

**Stany:**

- Loading (fetch confirmation): skeleton number + skeleton liczb
- Error: "Nie znaleziono zamówienia" + CTA "Wróć do menu"

### 7.8 Tracking (`/track/:token`)

**Cel:** klient czeka, śledzi pizzę, ma poczucie kontroli.

**Layout desktop (centered max-width 720 px):**

1. **Header** kompaktowy (logo + numer zamówienia mono prawy)
2. **Status hero** — duża karta primary background:
   - Ikona statusu 64 px (np. 👨‍🍳 dla IN_PREPARATION)
   - Headline "Pizza w piecu" (zmiana per status)
   - ETA "Dostawa ok. **18:45**" (godzina absolutna jeśli
     `etaSetAt` + `etaMinutes`)
   - Auto-refresh wskaźnik (subtelny dot pulsujący "Aktualizacja co
     15 s")
3. **Stepper statusów** horyzontalny (mobile: wertykalny):
   - 5 kroków dla DELIVERY: ⏳ Złożone / ✓ Przyjęte / 👨‍🍳 W
     przygotowaniu / 🛵 W drodze / 🎉 Dostarczone
   - 4 kroki dla PICKUP: ⏳ Złożone / ✓ Przyjęte / 👨‍🍳 W
     przygotowaniu / 🍕 Gotowe do odbioru
   - Aktywny krok: dot 16 px primary + ring `animate-ping`
     (`@keyframes dotpulse` z tokens.md), label primary bold
   - Zakończone: filled dot primary + check ikona
   - Następne: dot 12 px slate-300 + label slate-500
   - Łączniki między dotami: 2 px line, primary jeśli zakończony,
     slate-200 jeśli pending
4. **Szczegóły zamówienia** (collapse "Pokaż szczegóły"):
   - Lista pozycji (jak w confirmation)
   - Adres dostawy / info odbioru
   - Suma
5. **CTA pomocnicze**:
   - "Zadzwoń do restauracji" (`tel:` link, ghost button)
   - "Wróć do menu" (ghost button)

**Stany terminalne:**

- **DELIVERED**: hero zmienia się na zielony tint, ikona 🎉, headline
  "Smacznego!", micro "Dziękujemy za zamówienie. Wróć do nas niedługo!",
  CTA "Wróć do menu"
- **CANCELED**: hero red tint, ikona ✕, headline "Zamówienie
  anulowane", reason (jeśli ujawniany w publicznym DTO — decyzja
  w plan mode), CTA "Zamów ponownie" (preselects ostatnie pozycje
  w koszyku — opcjonalne, decyzja w plan mode)

**Auto-refresh:**

- Polling co 15 s (`useQuery refetchInterval`)
- Subtle dot indicator że trackuje (1 px primary pulsujący 1.5 s
  `@keyframes dotpulse`)
- Toast jeśli status zmienia się ("Status: Pizza w drodze 🛵")

**Mobile:**

- Stepper wertykalny (każdy krok w osobnym wierszu, line między)
- Status hero pełna szerokość, padding 24 px
- Sticky bottom bar: tylko CTA "Zadzwoń do restauracji"

### 7.9 Globalny banner "restauracja zamknięta"

Pojawia się na **każdym ekranie publicznym** gdy
`RestaurantSettings.isOpenNow() === false`:

- Pasek na górze (pod sticky headerem) wysokości 48 px
- Tło `red-50`, text `red-700`, ikona `AlertCircle` 16 px
- Copy zależnie od stanu:
  - Planowane otwarcie: "Tymczasowo zamknięte. Otwieramy o **11:00**."
  - Manual close + until: "Tymczasowo zamknięte do **19:00**. {reason}."
  - Manual close bez until: "Tymczasowo zamknięte. {reason}."
- Polling co 60 s na public settings
- **Konsekwencje**:
  - Na menu: CTA "+" disabled, modal produktu CTA "Dodaj" disabled
  - Na checkout: submit CTA disabled
- Banner nie ma X — zniknie sam gdy wraca isOpen=true

---

## 8. Admin panel — szczegółowe ekrany

### 8.1 Layout admina

**Sidebar** (240 px, fixed left):

- Logo + nazwa restauracji top
- 3 sekcje z separatorami:
  1. **Operacyjne** (kicker 11 px uppercase slate-500):
     - 📊 Pulpit (`/admin`)
     - 👨‍🍳 Kuchnia (`/admin/kitchen`)
     - 🏪 Wydanie (`/admin/pickup`)
     - 🚗 Dostawa (`/admin/delivery`)
  2. **Archiwum**:
     - 📋 Wszystkie zamówienia (`/admin/orders`) — z badge'm `(N)` na
       prawej dla nieprzeczytanych NEW
  3. **Konfiguracja**:
     - 🍕 Menu (`/admin/menu`)
     - ⚙️ Ustawienia (`/admin/settings`) — drop-down z 11 podsekcjami
       (zob. §9) lub osobne strony tab-style
- Avatar użytkownika dolny + "Wyloguj"

**Top bar** (72 px):

- Page title (h1 20 px weight 600) + subtitle (12 px slate-500)
  prawa-lewa
- **SoundToggle** (ikona Bell on/off) — zostaje
- Akcje per page (np. "Dodaj produkt" w `/admin/menu`)

**Active state sidebar**:

- Pozycja active: `bg-primary/10 text-primary font-medium` + lewy 3 px
  primary border
- Hover: `bg-slate-100`

### 8.2 Login (`/admin/login`)

Centered card max-width 420 px:

- Logo + nazwa
- "Zaloguj się do panelu" h1
- Email input (lg)
- Hasło input z toggle visibility (Eye / EyeOff)
- "Zapamiętaj mnie" checkbox (opcjonalne — nie MVP, ale design ma
  miejsce)
- "Zaloguj się" primary CTA full-width 48 px
- Error inline (np. "Nieprawidłowy email lub hasło")
- Stan rate limit (po 11 wrong → 429): banner amber "Zbyt wiele prób.
  Spróbuj za 5 min."
- Brak: "Zapomniałeś hasła?", "Zarejestruj się", social login (POMIJAMY
  w MVP)

### 8.3 Dashboard manager (`/admin`)

5 sekcji w kolejności (per Faza 4.5, refresh wizualny):

1. **4 KPI tiles** (grid 2x2 mobile, 4x1 desktop):
   - Zamówienia dziś (liczba) + delta vs wczoraj (zielony / czerwony
     mały arrow)
   - Sprzedaż dziś (kwota PLN, mono)
   - Średnia wartość zamówienia
   - Aktywne zamówienia (suma w nieterminalnych statusach)
   - Każdy tile: ikona 24 px lewy górny, label 12 px slate-500
     uppercase, liczba 28–32 px weight 700, delta/kontekst 13 px
2. **Wykres słupkowy "Zamówienia dziś według godziny"** (Recharts
   BarChart):
   - X axis: 0-23 godzin (cała doba — fix MEDIUM-2 z review)
   - Y axis: liczba zamówień
   - Aktualna godzina podświetlona primary (inne `slate-300`)
   - Tooltip on hover
3. **Wykres liniowy "Zamówienia ostatnie 7 dni"** (Recharts LineChart):
   - X axis: dni ("Pon", "Wt"...)
   - Y axis: liczba zamówień
   - Druga linia (opcjonalnie): revenue (drugorzędna oś Y) —
     decyzja: pokazujemy w jednym wykresie
4. **Top 5 produktów (30 dni)** (lista):
   - Każdy item: ikona 🍕 + nazwa + liczba sprzedanych sztuk po prawej
     (mono)
5. **5 status tiles** (klikalne, prowadzą do widoków operacyjnych):
   - Nowe → `/admin/kitchen`
   - W przygotowaniu → `/admin/kitchen`
   - Gotowe do wydania → `/admin/pickup`
   - Gotowe do wysyłki → `/admin/delivery`
   - W dostawie → `/admin/delivery`
   - Każdy tile: liczba 24 px weight 700 + label 12 px slate-500
     + ikona statusu 16 px

**Bez dźwięków na dashboardzie** (manager, nie pracuje na dźwięk).

### 8.4 Kuchnia (`/admin/kitchen`)

**Layout**: 2 sekcje pionowo:

1. **NOWE — N** (status NEW + CONFIRMED, sortowane `placedAt ASC`)
2. **W PRZYGOTOWANIU — N** (status IN_PREPARATION, `placedAt ASC`)

**Każda sekcja**:

- `SectionHeader` — subtelne tło `slate-50` + nagłówek 14 px weight 600
  uppercase + badge z liczbą `(N)`
- Grid responsywny: 1 kol mobile, 2 kol `lg:` (≥ 1024 px). Spec Faza
  4.5 wycofał `xl:grid-cols-3` — 2 kolumny lepiej dla iPada poziomo

**Karta zamówienia (KitchenOrderCard)**:

- `border-l-4` w kolorze statusu
- Top row: numer zamówienia mono 20 px weight 600 lewy + czas "12 min
  temu" (`formatDistanceToNow` pl) + badge typu 🚗 / 🏪
- Pełna lista pozycji z dodatkami (compact list):
  ```
  2× Margherita 40 cm
     + ekstra ser, oregano
  1× Pepperoni 30 cm
  1× Cola 0.5 l
  ```
- **Banner uwag klienta** (jeśli `customerNotes` niepuste): żółty box
  amber-50 + amber-700, ikona 📝, padding 12 px, italic
- **`itemNote` per pozycja** (NOWE w Fazie 5): pod pozycją inset, tło
  amber-50, ikona 📝, italic 13 px amber-700: "📝 Bez cebuli"
- ETA: "ETA: 19:45" (godzina absolutna z `etaSetAt + etaMinutes`)
  lub przycisk "Ustaw ETA" otwierający modal
- **Główna akcja** primary 56 px wysokości full-width:
  - dla NEW/CONFIRMED: "Przyjmij" → `IN_PREPARATION` (single tap, BEZ
    confirm)
  - dla IN_PREPARATION: "Gotowe" → `READY` (BEZ confirm)
- **Timer escalation**:
  - < 5 min od `placedAt`: slate timer
  - 5–10 min: amber timer
  - 10+ min: red timer + `motion-safe:animate-urgent-pulse` (custom
    keyframe `urgentPulse` 2.5 s red box-shadow), `motion-reduce:`
    fallback (border-red-500 + ring)
- **Co NIE pokazujemy**: adres dostawy, telefon klienta, kwota,
  przycisk "Anuluj" (anulowanie tylko z `/admin/orders`)

**Empty state**: ikona ChefHat 48 px slate-300 + "Brak zamówień do
przygotowania."

**Dźwięk**: pika tylko gdy SSE event `ORDER_CREATED` (nowe zamówienie).
Inne eventy bez dźwięku.

### 8.5 Wydanie (`/admin/pickup`)

**Filtr**: status READY + fulfillment PICKUP.

**Karta**:

- `border-l-4` emerald (READY)
- Numer zamówienia mono 20 px lewy
- **Imię klienta — bardzo duże** (24–28 px weight 700) — to focal
  point dla tego widoku, klient mówi "Jan Kowalski", pracownik szuka
- Telefon z **przyciskiem "Zadzwoń"** (`tel:` link, primary border
  button)
- Czas placedAt
- Lista pozycji compact
- **Kwota cash on pickup** (jeśli `paymentMethod = CASH_ON_PICKUP`):
  "Pobierz: **89,50 zł**" duża, czerwona (red-600 weight 700, 24 px
  mono) — niemożliwa do przegapienia
- Metoda płatności tekstowo
- **Główna akcja**: "Wydano" → DELIVERED (Z confirm dialogiem
  "Potwierdzić wydanie?")

**Empty state**: ikona Package 48 px slate-300 + "Brak zamówień do
wydania."

**Dźwięk**: SSE `ORDER_STATUS_CHANGED` z status=READY ORAZ
fulfillmentType=PICKUP.

### 8.6 Dostawa (`/admin/delivery`)

**Filtr**: status READY+DELIVERY (sekcja "DO ZABRANIA") + status
OUT_FOR_DELIVERY (sekcja "W DOSTAWIE").

**Karta**:

- `border-l-4` w kolorze statusu (emerald lub indigo)
- Numer zamówienia mono 20 px lewy
- **Adres dostawy — bardzo duży** (focal point):
  ```
  ul. Słowackiego 14/3
  05-092 Łomianki
  ```
  Format: street + buildingNumber/apartmentNumber w jednej linii bold
  18 px, postalCode + city w drugiej 16 px slate-700
- **Notatki adresowe** (jeśli `addressNotes` niepuste): banner amber
  "📝 Dzwonić, domofon nie działa, 3 piętro bez windy"
- Imię + telefon klienta z **przyciskiem "Zadzwoń"**
- **Kwota cash on delivery** (jeśli `paymentMethod =
  CASH_ON_DELIVERY`): "Pobierz: 89,50 zł" duża czerwona
- **`customerNotes`** (jeśli niepuste): banner "📝 Bez cebuli"
- Lista pozycji compact (dostawca chce mieć overview, nie szczegóły
  dodatków)
- **Akcje główne**:
  - dla READY: "Wyjechało" → OUT_FOR_DELIVERY (BEZ confirm)
  - dla OUT_FOR_DELIVERY: "Dostarczone" → DELIVERED (Z confirm
    "Potwierdzić dostawę?")
- **Akcje pomocnicze** (zawsze widoczne, mniejsze):
  - "🧭 Nawiguj" → `https://www.google.com/maps/search/?api=1&query=
    {URL_encoded_full_address}` (target _blank)
  - "📞 Zadzwoń" — duplikat z dymka telefonu

**Empty state**: ikona Bike 48 px slate-300 + "Brak zamówień do
dostarczenia."

**Dźwięk**: SSE `ORDER_STATUS_CHANGED` z status=READY ORAZ
fulfillmentType=DELIVERY.

### 8.7 Wszystkie zamówienia (`/admin/orders`)

**Tabela** z górnym paskiem filtrów:

- Filter chips: All / NEW / CONFIRMED / IN_PREPARATION / READY /
  OUT_FOR_DELIVERY / DELIVERED / CANCELED — przy każdym chip-ie
  liczba `(N)`
- Date range picker (ostatnie 7 dni / 30 dni / custom)
- Filter fulfillment type (All / DELIVERY / PICKUP)
- Search box (po numerze zamówienia, telefonie, imieniu — opcjonalne
  — to jest `nice-to-have`, w Fazie 5 z biblii MVP-critical: tylko
  filter chips i date range)

**Tabela**:

- Sticky header
- Kolumny: Numer (mono) | Status (badge) | Czas | Klient (imię + tel) |
  Pozycje (count + tooltip preview) | Suma (mono prawa) | Akcje
- Klikalne wiersze (cursor pointer, hover bg slate-50)
- Animacja highlight nowego zamówienia (zielony flash 600 ms na
  wierszu po SSE / polling refresh)
- Badge "📝 {N}" w kolumnie Pozycje jeśli któraś ma `itemNote`
- Paginacja na dole

**Modal anulowania** (CancelOrderDialog):

- Headline "Anulować zamówienie #2026-00184?"
- Sub: "Operacja jest nieodwracalna. Klient zobaczy status anulowane."
- Textarea **Powód** (max 500 znaków, wymagana, min 1 znak po trim) —
  licznik dolny
- Checkbox **"Rozumiem, że operacja jest nieodwracalna"** (musi być
  zaznaczony żeby CTA aktywny)
- 2 CTA: "Anuluj" (ghost) + "Anuluj zamówienie" (danger / red)

**Empty state**: ikona Inbox 48 px slate-300 + "Brak zamówień. Czekamy
na pierwsze."

### 8.8 Szczegóły zamówienia (`/admin/orders/:id`)

**Layout 2-kol desktop** (główna 720 px / sticky aside 320 px):

Główna kolumna:

1. **Header**: numer zamówienia mono 32–40 px weight 600 + badge
   statusu duży + czas placedAt
2. **Primary CTA pełnej szerokości** 64 px wysokości w kolorze
   primary, **dynamiczny per status**:
   - NEW: "Rozpocznij przygotowanie →"
   - CONFIRMED: "Rozpocznij przygotowanie →"
   - IN_PREPARATION: "Oznacz jako gotowe →"
   - READY DELIVERY: "Oznacz wyjechało →"
   - READY PICKUP: "Wydaj zamówienie ✓" (z confirm)
   - OUT_FOR_DELIVERY: "Oznacz dostarczone ✓" (z confirm)
   - Stany terminalne (DELIVERED/CANCELED): brak primary CTA
3. **Sekcja Klient**:
   - Imię + Nazwisko
   - Telefon (klikalny `tel:`)
   - Email (klikalny `mailto:` jeśli podany)
4. **Sekcja Dostawa lub Odbiór**:
   - Dla DELIVERY: pełen adres + zone snapshot (`Centrum NDM · 0,00
     zł`) + notatka adresowa
   - Dla PICKUP: "Odbiór osobisty"
5. **Sekcja Pozycje**:
   - Każda pozycja: nazwa + warianty + dodatki + qty + cena pozycji
   - **`itemNote` highlight** (żółta ramka, ikona 📝, italic):
     "📝 Bez cebuli, dzwonić — domofon nie działa"
   - Subtotal / Dostawa / Razem na dole
6. **Sekcja Notatka klienta** (jeśli `customerNotes` niepuste): banner
7. **Historia statusów** (timeline pionowy):
   - Każdy wpis: ikona statusu + nazwa + czas + (opcjonalnie) `reason`
     italic mniejsza czcionka jeśli niepuste
   - Subtelny line między wpisami slate-200

Sticky aside:

- **ETA card** (slate-900 dark — kontrast):
  - Label "ETA" 12 px slate-400 uppercase
  - Czas 28 px weight 600 white mono: "19:45"
  - Sub 13 px slate-400: "za ~30 min"
  - CTA "Zmień ETA" ghost white
- **Akcje boczne**:
  - "Anuluj zamówienie" (danger ghost) — otwiera CancelOrderDialog
  - "Cofnij status" (jeśli admin chce backtrack, np. READY → IN_PREP)
    — secondary ghost (decyzja: czy mamy w MVP — biblia §22 mówi że
    yes, mamy. Decyzja w plan mode.)

**Modal "Ustaw ETA"** (EtaDialog):

- Headline "Ustaw ETA"
- Preset chips: "15 / 20 / 30 / 45 / 60 min" (klik → preview godziny)
- Lub slider (0–120 min, step 5)
- Lub picker (datetime-local) — pick godziny absolutnej
- Preview: "ETA: 19:45 (za 30 min)"
- 2 CTA: "Anuluj" + "Zapisz" primary

**Stany**:

- Loading: skeleton dla numeru + sekcji
- Optimistic concurrency conflict (409): toast "Zamówienie zostało
  zaktualizowane gdzie indziej. Odśwież stronę."

### 8.9 Menu — kategorie + produkty

**Tabs**: "Kategorie" / "Produkty" / "Grupy dodatków" / "Dodatki" —
top of page.

**Tab Kategorie**:

- Lista pionowa kart kategorii
- Drag-and-drop sort (`displayOrder`) — handle w lewym lewy (`Grip`)
- Każda kategoria: nazwa + liczba produktów + toggle aktywności + edit
  + delete
- "Dodaj kategorię" button na górze

**Tab Produkty**:

- Toolbar: filter (kategoria) + search + "Dodaj produkt" CTA
- Grid 3 kol kart produktów (mobile 1 kol):
  - Zdjęcie (URL preview) lub placeholder repeating-linear-gradient
  - Nazwa + cena bazowa
  - Kategoria (chip)
  - Toggle dostępności inline (Switch)
  - Edit / Delete (kebab menu)

### 8.10 Formularz produktu (create / edit)

Centered max-width 720 px, kolumny per-section:

1. **Sekcja "Podstawowe"**: Nazwa, Slug (auto, edytowalny), Kategoria
   (select), Krótki opis (textarea), Pełny opis (textarea), Zdjęcie URL
   + live preview, Cena bazowa
2. **Sekcja "Warianty"** (opcjonalna):
   - Toggle "Produkt ma warianty"
   - Lista wariantów inline (każdy wariant: nazwa + cena + przycisk
     usuń + drag handle do reorder)
   - "Dodaj wariant" button dashed full-width
3. **Sekcja "Grupy dodatków"** (opcjonalna):
   - Toggle "Produkt ma dodatki"
   - Lista przypisanych grup (drag-and-drop reorder)
   - Dla każdej grupy: nazwa + tryb (radio/checkbox) + min/max + lista
     dodatków
4. **Sekcja "Dostępność"**: Toggle "Aktywny", Toggle "Wyłącz na dziś"
5. **Sekcja "SEO i tagi"**: Slug (read-only, auto), Tagi multi-select
   (Bestseller, Wege, Ostre, Bezglutenowe, Wegańskie, Nowość, Promocja
   — w MVP może mniej, sprawdź gap analysis)

**Footer**: sticky bottom — "Anuluj" ghost + "Zapisz" primary.

**Preview mode** (decyzja Twoja): split-screen z live preview karty
produktu jak będzie wyglądać dla klienta.

---

## 9. Settings — 11 sekcji (5 realne / 6 stuby Poziom A)

> Lista 11 sekcji wynika z biblii §27. Decyzja operatora: 5 realne
> (pełen design z handoff), 6 stuby Poziom A (placeholder z empty state
> + "🚧 W przygotowaniu / Dostępne wkrótce").

### 9.1 Settings hub — nawigacja

**Layout**: lewa kolumna 240 px (lub tabs top) z 11 pozycjami,
prawa płynna z treścią aktywnej sekcji.

**11 sekcji w kolejności:**

| # | Nazwa | Status | Route (proponowane) |
|---|---|---|---|
| 1 | Ogólne | ✅ REALNA | `/admin/settings` (default) |
| 2 | Godziny otwarcia | ✅ REALNA | `/admin/settings/opening-hours` |
| 3 | Treści strony | ✅ REALNA | `/admin/settings/page-content` |
| 4 | Strefy dostawy | ✅ REALNA | `/admin/delivery-zones` (już istnieje) |
| 5 | Płatności (auto-ETA + manual close) | ✅ REALNA | `/admin/settings/operations` |
| 6 | Branding | 🚧 STUB | `/admin/settings/branding` |
| 7 | Powiadomienia | 🚧 STUB | `/admin/settings/notifications` |
| 8 | Drukarka | 🚧 STUB | `/admin/settings/printer` |
| 9 | Capacity | 🚧 STUB | `/admin/settings/capacity` |
| 10 | Integracje | 🚧 STUB | `/admin/settings/integrations` |
| 11 | RODO i regulaminy | 🚧 STUB | `/admin/settings/legal` |

### 9.2 REALNA: Sekcja 1 — Ogólne

> Już istnieje w v1, refresh wizualny.

**Pola**:

- Nazwa restauracji
- Slogan (1 linia)
- Krótki opis (textarea 2-3 wiersze, używane do SEO)
- Email kontaktowy
- Telefon kontaktowy (mono, format `+48 22 555 12 34`)
- Adres (textarea 2 wiersze)
- Link do Google Maps (URL)
- **Kolor marki** (color picker):
  - Input HEX (mono, uppercase)
  - 11×11 swatch tile preview
  - 6 brand swatches inline klikalne
  - **Live preview komponentów** (`ColorPreviewCard`) — primary
    button, link, 2 badge'e, mini product card — wszystko inline
    `style={{ backgroundColor }}` driven by HEX value
- Logo URL (input + live preview 96×96 px)
- Hero image URL (input + live preview 16:9)
- Social media: Facebook URL, Instagram URL (oba opcjonalne)

**Sticky bottom save bar**: "Anuluj" ghost + "Zapisz zmiany" primary
(disabled gdy `dirty === false`).

### 9.3 REALNA: Sekcja 2 — Godziny otwarcia

> Już istnieje w v1, refresh wizualny.

**Layout**: tabela 7 dni:

| Dzień | Otwarte | Od | Do | Akcje |
|---|---|---|---|---|
| Poniedziałek | Switch | TimePicker | TimePicker | "Skopiuj na inne dni" |

- Switch off: pola disabled, dzień zaznaczony jako "Zamknięte"
- "Skopiuj godziny" hover hint na każdym wierszu (otwiera popover
  "Kopiuj na: pn / wt / śr / cz / pt / sb / nd")

**Wyjątki świąteczne** — POMIJAMY w MVP (`exception` ROADMAP).

**Live preview**: pod tabelą blok "Tak będzie wyglądać na stronie:" —
mini render listy godzin z wyróżnioną dziś.

### 9.4 REALNA: Sekcja 3 — Treści strony

> Już istnieje v1, refresh.

**Tabs HERO / ABOUT** — edytor każdej sekcji `PageContent`:

**HERO**:

- Title (input)
- Subtitle (textarea 1-2 wiersze)
- CTA text (input)
- CTA target (radio: Menu / Telefon / Custom URL)
- Background image URL (live preview 16:9)
- Aktywne (Switch — może wyłączyć całą sekcję)

**ABOUT**:

- Title
- Body (textarea 5-10 wierszy, podstawowy markdown — bold, italic,
  links — może być plain text w MVP)
- Image URL (live preview 4:3)
- Aktywne (Switch)

**Live preview** (prawa kolumna split-screen, sticky):

- Renderuje sekcję dokładnie jak na landingu
- Reaguje live na zmiany w formularzu

### 9.5 REALNA: Sekcja 4 — Strefy dostawy

> Już istnieje (Faza 7.0), refresh wizualny.

**Layout**:

- Header sekcji + "Dodaj strefę" CTA
- Lista stref (sortowane po `displayOrder` lub po nazwie):
  - Każda strefa: nazwa + typ badge (FREE green / PAID amber /
    UNAVAILABLE red) + fee (mono) + Switch aktywności + edit / delete
- Klik na strefę → expandable z listą `areas`:
  - 2 tryby dodania:
    1. **Cała miejscowość** — input city + checkbox "wszystkie kody"
       → zapis `(city, NULL)`
    2. **Konkretne kody** — input city + textarea z listą kodów
       (auto-format `00000` → `00-000`, dedupe, parser dzieli po `\n`
       i `,`)
  - Lista wprowadzonych areas: badge city + (postal jeśli) + delete

**Edge case'y**:

- Soft delete (gdy strefa ma orders ze snapshot `deliveryZoneName`): 
  toast "Strefa nie może być usunięta — istnieją zamówienia. Wyłącz ją
  zamiast tego."
- Konflikt unikalności (DataIntegrityViolation): toast "Konflikt
  unikalności — wpis już istnieje w bazie."

### 9.6 REALNA: Sekcja 5 — Płatności (auto-ETA + manual close)

> NOWA w Fazie 5. Łączymy 3 ustawienia operacyjne w jedną sekcję.

**Pola**:

1. **Domyślny czas przygotowania**:
   - Label: "Czas przygotowania"
   - Input number (5–120, step 5, default 30)
   - Help: "Domyślny czas używany do wyznaczenia ETA dla nowych
     zamówień. Możesz nadpisać per zamówienie w panelu."
   - Live preview: "Nowe zamówienie złożone teraz dostanie ETA: **18:45**"
2. **Tymczasowe zamknięcie**:
   - Toggle "Zamknij teraz" (Switch)
   - Po włączeniu (slide-down):
     - Textarea "Powód" (max 200, wymagany) — placeholder "np. Awaria
       pieca, brak prądu"
     - Datetime-local opcjonalny "Otwarcie planowane na" — help: "Jeśli
       zostawisz puste, restauracja będzie zamknięta dopóki nie
       wyłączysz tego ustawienia ręcznie."
   - Po zapisie banner w panelu admina: "🚨 Restauracja jest tymczasowo
     zamknięta — {reason}" + CTA "Wznów" (jeden klik → toggle off)
3. **Metody płatności** (read-only w MVP, tylko info):
   - "Aktywne metody płatności:"
   - Lista chip-ów: "Gotówka przy odbiorze (PICKUP)" + "Gotówka przy
     dostawie (DELIVERY)"
   - Sub: "Płatności online (BLIK, Przelewy24, PayU) — dostępne w
     wersji Pro"

**Sticky save bar**.

### 9.7 STUBY POZIOM A — sekcje 6–11

**Wzorzec pojedynczego stuba**:

```
┌──────────────────────────────────────────┐
│ [Kicker 11px slate-500] KONFIGURACJA     │
│ [H1 24-28px] Branding                    │
│ [Sub 14-16px slate-600] Personalizacja   │
│   wyglądu strony — kolory, fonty, logo. │
├──────────────────────────────────────────┤
│                                          │
│   [Empty state center]                   │
│   [Ikona 64px slate-300]                 │
│   [Tytuł 18px weight 600 slate-700]      │
│     "🚧 W przygotowaniu"                 │
│   [Opis 14px slate-500 max-440px]        │
│     "Ta sekcja będzie dostępna w         │
│     kolejnych aktualizacjach. Już teraz │
│     możesz zmienić kolor marki w         │
│     [Ogólne →]."                          │
│                                          │
│   [Subtle CTA (opcjonalny)]              │
│   "Skontaktuj się z deweloperem"         │
│                                          │
└──────────────────────────────────────────┘
```

**Specyfikacja per stub**:

#### Sekcja 6 — Branding (STUB)

- Ikona: `Palette` 64 px
- Tytuł: "🚧 Branding zaawansowany w przygotowaniu"
- Opis: "Konfiguracja fontów, secondary color, white-label themes
  trafi tutaj. Już teraz możesz zmienić **kolor marki** w
  [Ogólne →]."
- CTA inline: "Otwórz Ogólne" (link do `/admin/settings`)

#### Sekcja 7 — Powiadomienia (STUB)

- Ikona: `Bell` 64 px
- Tytuł: "🔔 Powiadomienia w przygotowaniu"
- Opis: "Konfiguracja alertów email, SMS, browser push, dziennego
  podsumowania. W MVP używamy dźwięków w panelu (toggle w prawym
  górnym rogu) i toastów w przeglądarce."

#### Sekcja 8 — Drukarka (STUB)

- Ikona: `Printer` 64 px
- Tytuł: "🖨️ Integracja z drukarką w przygotowaniu"
- Opis: "Połączenie z drukarką ESC/POS dla automatycznego druku
  bonów kuchennych i dostawczych. W MVP zamówienia odbierasz
  przez panel."

#### Sekcja 9 — Capacity (STUB)

- Ikona: `Gauge` 64 px
- Tytuł: "⚖️ Limity zamówień w przygotowaniu"
- Opis: "Maksymalna liczba aktywnych zamówień, automatyczne
  rozszerzanie ETA przy peak hour, blokada nowych zamówień. W MVP
  używaj **Tymczasowego zamknięcia** w [Płatności →] gdy potrzebujesz
  pauzy."

#### Sekcja 10 — Integracje (STUB)

- Ikona: `Plug` 64 px
- Tytuł: "🔌 Integracje w przygotowaniu"
- Opis: "Google Analytics, Facebook Pixel, Google Maps API,
  zewnętrzne CRM, narzędzia marketingu. W MVP zbieramy podstawowe
  dane przez backend."

#### Sekcja 11 — RODO i regulaminy (STUB)

- Ikona: `Scale` 64 px
- Tytuł: "⚖️ Dokumenty prawne w przygotowaniu"
- Opis: "Linki do regulaminu, polityki prywatności, custom tekst zgody
  RODO przy zamówieniu. **Ważne:** w MVP klient zostanie poproszony
  o akceptację regulaminu przy checkout — domyślny tekst zgody jest
  hardcoded."
- CTA inline: "Zobacz domyślny tekst zgody" (modal pokazuje aktualny
  copy)

**Wszystkie stuby**:

- Mają identyczny layout (header + empty state)
- Brak save bar (nic do zapisu)
- Brak danych do edycji (read-only sekcja info)
- Pojawiają się w sidebar settings z subtelnym chip "Wkrótce" obok
  nazwy

---

## 10. Cross-cutting wymagania

### 10.1 Responsywność

**Breakpointy**:

- Mobile: < 768 px (default-first)
- Tablet: 768–1023 px
- Desktop: 1024–1279 px
- Wide desktop: ≥ 1280 px (max-container 1280 px centered)

**Mobile-first**:

- 375 px to **pierwszy obywatel**
- Zawsze testuj 375 px przed dodaniem `md:` / `lg:` / `xl:` modyfikatorów
- Touch targets ≥ 44 px (CTA główne 48–56 px)
- iOS safe-area: `env(safe-area-inset-bottom)` na floating bottom bary
- `dvh` zamiast `vh` (iOS Safari quirks)
- `scroll-behavior: smooth` na anchor links

### 10.2 Accessibility

- WCAG AA contrast (kolory mają to spełniać — sprawdź swoje propozycje
  w validator-ze)
- `prefers-reduced-motion`: wyłącz wszystkie animacje (Framer Motion,
  bumps, urgentPulse, transitions modal/sheet) → użyj CSS
  `@media (prefers-reduced-motion: reduce) { ... }` lub Tailwind
  `motion-reduce:` modifier
- ARIA labels na ikonach-only buttonach
- Focus rings widoczne (`ring-2 ring-primary/40 ring-offset-2`)
- Keyboard navigation w modal/sheet (Tab cycles inside, Esc zamyka)
- Form errors associated z polami (`aria-describedby`)

### 10.3 Performance UX

- **Skeleton screens** dla głównych ekranów (menu, checkout, tracking,
  admin orders list, admin order detail) — patterns z `components.md`
- LCP < 2.5 s (hero image preload, CSS critical inline)
- Optimistic updates dla addItem / qty / inline note edit (rollback +
  toast on error)
- Submit zamówienia: **NIE optimistic** (ważna akcja, klient musi
  widzieć loading state)
- Image: `<picture>` z WebP główny + JPEG fallback, `loading="lazy"`
  poza viewportem, LQIP placeholder fade-in 200 ms

### 10.4 Empty / Error / Loading states

**Każdy ekran ma 4 stany:**

1. **Default** (happy path)
2. **Empty** (brak danych — pokaż ikonę + copy + opcjonalny CTA)
3. **Error** (np. 500 / 422 / 429) — pokaż sensowny komunikat + CTA
   "Spróbuj ponownie" jeśli applicable
4. **Loading** (skeleton, nie spinner — tylko bardzo krótkie operacje
   < 200 ms mogą bez skeleton)

### 10.5 Toast notifications

- Pozycja: prawy górny róg desktop, top sheet mobile
- Auto-dismiss: 2 s success, 4 s warning, 6 s error
- Sukces: green left-border + ikona Check
- Warning: amber left-border + ikona AlertCircle
- Error: red left-border + ikona AlertOctagon
- Klikalne (przekierowuje do related view)

### 10.6 Animation discipline

- Domyślna duration: **180 ms**
- Easing: `cubic-bezier(0.2, 0.7, 0.3, 1)` (smooth, bez bounce)
- Cart bump: 200 ms scale 1 → 1.15 → 1
- Modal/sheet open: 250–300 ms (fade backdrop + scale modal lub slide
  sheet)
- Tracking pulse: `@keyframes dotpulse` 1.5–1.8 s ease-out infinite
- `urgentPulse` (admin operations >10 min): 2.5 s red box-shadow,
  motion-safe only
- **Pomijamy**: bouncy easing (`back.out(1.7)`), parallax, fly-to-cart
  arc, particles, skeuomorphic transitions

---

## 11. Deliverables i format handoffu

### 11.1 Co dostarczasz

**Format**: bundle plików Claude Design jak w v1
(`docs/design/bundle/`), ale w nowej lokalizacji:

```
docs/design/v2/
├── README.md                    (jak w v1, opis bundla)
├── tokens.md                    (v2 tokens)
├── components.md                (v2 components)
├── status-colors.md             (jak v1, dla referencji)
├── screens-index.md             (mapping na ekrany)
├── DESIGN_DECISIONS.md          (decyzje typu "primary color
│                                  Wariant A/B/C — wybrałem X bo Y",
│                                  jeden display font, alternatywne
│                                  layouty, etc.)
├── project/
│   ├── Design System v2.html
│   ├── Public Site v2.html      (1 plik z 7+ artboardami: landing
│   │                              desktop, landing mobile, menu
│   │                              desktop, menu mobile, modal
│   │                              produktu desktop, sheet produktu
│   │                              mobile, checkout desktop, checkout
│   │                              mobile, confirmation, tracking
│   │                              desktop, tracking mobile, banner
│   │                              zamknięte stany)
│   ├── Admin Panel v2.html      (1 plik z artboardami: login,
│   │                              dashboard manager, kuchnia, wydanie,
│   │                              dostawa, wszystkie zamówienia,
│   │                              order detail, order detail z eta
│   │                              dialog, order detail z cancel
│   │                              dialog, menu kategorie, menu
│   │                              produkty, formularz produktu,
│   │                              sidebar)
│   ├── Settings v2.html         (1 plik: settings hub + 5 realnych
│   │                              + 6 stubów = 12 artboardów)
│   ├── public-site/*.jsx        (per-screen jsx jak w v1)
│   ├── admin/*.jsx              (per-screen jsx)
│   ├── settings/*.jsx           (per-section jsx)
│   └── design-canvas.jsx        (shared wrapper jak w v1)
└── chats/
    └── chat-redesign.md         (transkrypt sesji — intencja, decyzje,
                                  odrzucone warianty)
```

### 11.2 Co MUSI być w handoffie

- **Każdy ekran w 2 wariantach** gdzie ma to sens (desktop 1280 +
  mobile 375). Tablet 768 — opcjonalnie, jeśli warto.
- **Per ekran**: default state + empty state + error state (jeśli
  applicable, np. wszystkie zamówienia bez zamówień, menu z
  niedostępnymi produktami)
- **Komponenty współdzielone** w osobnym pliku (Sidebar, TopBar,
  Header, EmptyState, Skeleton, Toast, Banner zamknięte) — żeby
  spójność była łatwa do utrzymania
- **Hover / focus states** dla interactive elements (przyciski,
  karty, links) — jako notes lub osobne artboardy
- **DECISIONS.md** — dlaczego primary color, dlaczego font, dlaczego
  4:3 a nie 16:9, etc. (not just "co", ale "dlaczego")

### 11.3 Workflow

1. **Stage 1 — Design system v2**: tokens, components, decisions
   (primary color, fonts, motion). **Operator zatwierdza** zanim
   ruszymy dalej.
2. **Stage 2 — Public site v2**: 7 ekranów + banner. **Operator
   zatwierdza** zanim ruszymy dalej.
3. **Stage 3 — Admin v2**: 13 ekranów + komponenty. **Operator
   zatwierdza**.
4. **Stage 4 — Settings v2**: hub + 5 realnych + 6 stubów. **Operator
   zatwierdza**.
5. **Stage 5 — Polish**: screens-index, mapping, README, finalna
   weryfikacja.

Po Stage 5 — handoff trafia do `docs/design/v2/` na branchu
`design/redesign-v2`, operator robi review, zaczyna Faza 5
implementacji w osobnej sesji Claude Code.

### 11.4 Priorytet sekcji (gdyby brakło czasu)

Jeśli musisz coś przyciąć, kolejność priorytetów:

1. ✅ MUSI być (cut-off red line):
   - Public site — Menu (sticky cart sidebar) + Modal produktu (z
     komentarzem) + Cart sidebar = serce conversion-flow
   - Admin — Order detail (primary CTA pełnej szerokości) = serce
     codziennej pracy Pani Kasi
   - Banner restauracja zamknięta = blocker MVP
   - Auto-ETA + Manual close (Settings sekcja 5) = nowy feature MVP
   - Style guide v2 (tokens, kolor, font) = baza dla wszystkiego
2. ⚠️ Powinno być:
   - Public site — Landing, Checkout, Confirmation, Tracking
   - Admin — Kuchnia, Wydanie, Dostawa (refresh v1)
   - Settings — Ogólne, Godziny, Treści (refresh v1)
3. 💡 Nice-to-have:
   - Stuby Poziom A (sekcje 6–11)
   - Login refresh
   - Menu CRUD refresh

### 11.5 Notatka dla Claude Design

> **Operator (`szvmczek`) jest tutaj jako tech lead, nie tester
> wszystkich opcji.** Jeśli widzisz dwie drogi i obie są rozsądne,
> wybierz jedną i obroń decyzję w `DESIGN_DECISIONS.md`. Operator
> chętnie zmieni jeśli ma argumenty — ale nie chce kolektorować
> opcji "A/B/C/D, wybierz".
>
> **Ten brief jest długi, bo kontekstu jest dużo.** Nie znaczy że
> oczekujemy implementacji wszystkich szczegółów piksel-perfect.
> Znaczy że masz fundament żeby wybrać świadomie i nie pytać o
> drobiazgi.
>
> **Pytania merytoryczne (np. "scoll-spy threshold 25 % od top — czy
> 30 %?") rozwiązuj w stronę biblii UX. Pytania strategiczne (np.
> "dodajemy display font?") — zaproponuj jedną drogę z argumentem,
> operator zatwierdza.**
>
> Powodzenia. To ma być **najlepszy template gastro w PL**, nie
> generic restaurant page #2734. Daj z siebie wszystko.

---

**Koniec briefu.**

**Wersja 1.0** · 2026-05-04 · brand `silnik-gastro-zamowienia` ·
master @ `557dc85`
