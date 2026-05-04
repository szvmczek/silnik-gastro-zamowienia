# PHASES.md

Plan faz MVP. Każda faza ma: cel, zakres, definition of done, listę
"NIE ruszać jeszcze". Aktualizuj pole STATUS po zakończeniu.

## Faza 0: Bootstrap
STATUS: DONE (wykonany przez bootstrap prompt)

Zawartość: struktura folderów, pliki konstytucyjne, Spring Boot skeleton,
Vite + React + TS skeleton, Tailwind, shadcn/ui init, docker-compose,
.env.example, README, .gitignore, placeholder Dockerfile, git init,
migracja V1 pusta, SmokeTestController z /api/ping.

## Faza 1: Auth + Settings + Theme
STATUS: DONE

### Cel
Admin może się zalogować. Admin może edytować nazwę restauracji, kolor
brandingu, kontakt, godziny otwarcia, 2 sekcje strony (Hero, About).
Publiczny landing wyświetla te dane z API.

### Zakres
**Backend:**
- Encje: User, RestaurantSettings (singleton, id=1), OpeningHours
  (per dayOfWeek), PageContent (sectionKey: HERO, ABOUT)
- Migracje Flyway (V2__identity_and_settings.sql)
- Seed V100__seed_demo.sql: admin user (hasło z env ADMIN_PASSWORD),
  "Pizza Demo" z kontaktem, 7 rekordów OpeningHours, 2 rekordy PageContent
- Spring Security + JWT (HS256, 12h expiration, secret z env JWT_SECRET)
- Rate limiting (Bucket4j) na login: 10 req/min per IP
- Endpointy:
  - `POST /api/auth/login` (public)
  - `GET /api/public/settings`
  - `GET /api/public/opening-hours`
  - `GET /api/public/page-content`
  - `GET|PUT /api/admin/settings`
  - `GET|PUT /api/admin/opening-hours`
  - `GET|PUT /api/admin/page-content/{section}`
- Global error handler (@RestControllerAdvice, RFC 7807)

**Frontend:**
- `/admin/login` — formularz z RHF + Zod
- Axios interceptor z JWT
- Layout admina z sidebar (placeholder linki do Fazy 2-4)
- ThemeLoader — fetch `/api/public/settings` i ustaw CSS variables w :root
- Publiczny landing z Hero i About z API

### Definition of done
- Admin loguje się, dostaje JWT, przechodzi do dashboardu admina (placeholder)
- Zmiana nazwy restauracji w panelu → refresh landing pokazuje nową nazwę
- Zmiana primary color w panelu → CSS variable się aktualizuje, landing
  zmienia kolor CTA

### NIE ruszać jeszcze
- Menu, koszyk, zamówienia
- Tracking
- Real-time
- Wyjątki godzin otwarcia (OpeningHoursException — post-MVP)
- Upload zdjęć

## Faza 2: Menu
STATUS: DONE

> Uwaga historyczna: pierwotnie plan zakładał `V3__menu.sql`, ale V3/V4/V5
> zostały zajęte przez hotfixy Fazy 1 (optimistic locking, email-lower unique,
> opening-hours midnight). Ostatecznie użyto `V6__menu.sql` + `V101__seed_menu.sql`.

### Cel
Pełne menu publiczne z kategoriami, produktami, wariantami, dodatkami.
CRUD menu w panelu admina.

### Zakres
**Backend:**
- Encje: Category, Product (z imageUrl jako String URL), ProductVariant
  (price absolutna), AddonGroup, Addon, ProductAddonGroup
- Migracje + seed: 3 kategorie (Pizze, Napoje, Desery), 8 produktów z URL
  Unsplash, pizze z wariantami 30/40 cm, 1 grupa dodatków
- Endpointy:
  - `GET /api/public/menu` (jeden zoptymalizowany call)
  - `GET /api/public/products/{slug}`
  - CRUD `/api/admin/categories`
  - CRUD `/api/admin/products`
  - CRUD `/api/admin/variants`
  - CRUD `/api/admin/addon-groups`
  - CRUD `/api/admin/addons`
  - `PATCH /api/admin/products/{id}/availability`

**Frontend:**
- Public: `/menu` z kategoriami jako sticky tabs, siatka produktów (karty),
  modal szczegółów z wyborem wariantu i dodatków (cena aktualizuje się live)
- Admin: lista kategorii, lista produktów z filtrem, formularze create/edit,
  preview zdjęcia z URL, toggle dostępności

### Definition of done
- Publiczne menu wygląda premium na mobile (375px) i desktop
- Modal produktu: wybór wariantu zmienia cenę
- Admin dodaje nowy produkt z URL Unsplash, toggluje dostępność, zmiany
  widoczne publicznie po refreshu

### NIE ruszać jeszcze
- Koszyk (Faza 3)
- Zamówienia
- File upload zdjęć (post-MVP)

## Faza 3: Cart + Checkout + Order + Tracking
STATUS: DONE

> Uwaga historyczna: pierwotnie plan zakładał `V4__orders.sql`, ale V3-V6
> były już zajęte (V3 optimistic-locking, V4 email-lower-unique, V5 opening-
> hours-midnight, V6 menu). Ostatecznie użyto `V7__orders.sql`.

### Cel
Pełny order flow end-to-end: od dodania do koszyka po widok trackingu.

### Zakres
**Frontend:**
- Zustand cart store z persist (localStorage)
- Cart drawer (slide-in z prawej, sticky bottom bar mobile)
- `/checkout` z RHF + Zod: dane klienta, fulfillmentType (DELIVERY/PICKUP),
  adres (warunkowo), uwagi, paymentMethod (CASH_ON_DELIVERY/CASH_ON_PICKUP)
- `/order/confirmation/:orderNumber` z linkiem do trackingu
- `/track/:token` z polling 15s (TanStack Query refetchInterval)

**Backend:**
- Encje: Order (z orderNumber, publicTrackingToken UUID v4, @Version),
  OrderItem (ze snapshotami), OrderItemAddon (ze snapshotami),
  OrderStatusHistory
- CheckoutService: waliduje dostępność produktów, kalkuluje totals
  PO STRONIE SERWERA, tworzy Order w transakcji
- Generator orderNumber (sequence per rok, format YYYY-NNNNN)
- Endpointy:
  - `POST /api/public/orders` → {orderNumber, trackingToken}
  - `GET /api/public/orders/track/{token}` (zwraca tylko bezpieczne pola,
    bez telefonu klienta)
- Rate limiting: 10 req/min per IP na POST orders

### Definition of done
- Klient: dodaje pizzę z wariantem i dodatkami do koszyka, przechodzi do
  checkoutu, składa zamówienie, dostaje numer, wchodzi w tracking, widzi
  status NEW i listę pozycji

### NIE ruszać jeszcze
- Panel admina dla zamówień (Faza 4)
- SSE / real-time
- Płatności online

## Faza 4: Admin Orders + polling (SSE stretch)
STATUS: DONE (CORE + STRETCH)

> Uwaga historyczna: **STRETCH (SSE) dowieziony** — plan traktował go jako
> opcjonalny, ale CORE zamknął się bez blokerów, więc M11-M13 weszły.
> Szczegóły implementacji i smoke-test: CURRENT_STATE.md → Faza 4.
> Dwie nowe decyzje architektoniczne: AD-017 (state machine location),
> AD-018 (SSE query-param auth) — ARCHITECTURE.md.

### Cel
Admin obsługuje zamówienia. Klient widzi zmiany statusu na trackingu.

### Zakres (CORE)
**Backend:**
- Endpointy:
  - `GET /api/admin/orders` (paginacja, filtry: status, dateFrom, dateTo,
    fulfillmentType)
  - `GET /api/admin/orders/{id}`
  - `PATCH /api/admin/orders/{id}/status` (state machine, nielegalna — 422)
  - `PATCH /api/admin/orders/{id}/eta` (minutesFromNow | targetTime)
  - `GET /api/admin/dashboard/summary` (3 liczniki: nowe dziś, w przygotowaniu,
    do dostawy)
- State machine OrderStatus (NEW → CONFIRMED → IN_PREPARATION → READY →
  OUT_FOR_DELIVERY → DELIVERED; CANCELED z każdego)
- Optimistic locking — konflikt 409
- OrderStatusHistory zapisywana automatycznie

**Frontend:**
- Dashboard z 3 kafelkami
- `/admin/orders` — lista z filtrami, paginacją, badge statusu (kolorystyka)
- `/admin/orders/:id` — pełne szczegóły, historia, przyciski zmiany statusu
  (tylko dozwolone transitions), modal ustawiania ETA
- Lista polling refetchInterval 5-10s

### Zakres (STRETCH — tylko jeśli CORE gotowe przed końcem dnia 21)
- SseEmitterRegistry
- Spring Application Events (OrderCreatedEvent, OrderStatusChangedEvent)
- `GET /api/admin/orders/stream` (SSE, wymaga ADMIN, heartbeat 25s, cleanup
  onCompletion/Timeout/Error)
- Hook useAdminOrderFeed() — update listy + dźwięk + toast
- Toggle "dźwięki ON/OFF" w panelu (localStorage)

### Definition of done (core)
- Admin loguje, widzi nowe zamówienie z Fazy 3 (polling), otwiera szczegóły,
  zmienia status na CONFIRMED, ustawia ETA na 30 min
- Klient po ≤15s widzi nowy status i ETA na trackingu

### Definition of done (stretch)
- Nowe zamówienie pojawia się live z dźwiękiem na liście admina

### NIE ruszać jeszcze
- Dashboard z wykresami / przychodami
- Edycja menu (zrobiona w Fazie 2)
- Notyfikacje email/SMS

## Faza 4.5: Operational UI Split
STATUS: DONE — 30.04.2026

> Krok 5 (2026-04-30): STATUS zmieniony na DONE,
> `docs/CURRENT_STATE.md` zaktualizowany. Pełny handoff (kontekst
> dyskusji, alternatywy odrzucone): `docs/FAZA_4_5_HANDOFF.md`.

### Cel
Przebudować nawigację panelu admina tak, żeby każda rola (Kuchnia,
Wydanie, Dostawa, Manager) miała swój dedykowany widok operacyjny
zoptymalizowany pod specyficzny kontekst pracy (dotyk, glanceability,
information density). Plus dorzucić podstawowe statystyki na pulpicie
manager'a. Backend praktycznie nieruszany — frontend filtruje istniejący
`/api/admin/orders` po stronie klienta. Brak nowych ról
(patrz **AD-020** w `ARCHITECTURE.md`).

### Zakres backend

**Migracja:**
- `V11__add_reason_to_order_status_history.sql`: `ADD COLUMN reason TEXT`
  na tabeli `order_status_history`. Pole opcjonalne, używane głównie
  dla `CANCELED`. Decyzja architektoniczna: **AD-021**.

**Encje:**
- `OrderStatusHistory` — dodaj pole `reason: String?` (nullable, max
  500 znaków, kolumna `reason TEXT`).

**Endpointy:**
- `PATCH /api/admin/orders/{id}/status` — DTO request rozszerzone
  o opcjonalne pole `reason: String?` (max 500 znaków). Service zapisuje
  reason na nowym wpisie `OrderStatusHistory` jeśli niepuste. Konwencja:
  reason wymagany tylko dla `CANCELED` (walidacja na froncie, backend
  liberalny).
- **NOWY** `GET /api/admin/dashboard/stats` — endpoint zastępujący
  `/dashboard/summary` w UI Fazy 4.5. Payload:
  ```json
  {
    "today": {
      "orderCount": 23,
      "totalRevenue": 1847.50,
      "averageOrderValue": 80.32,
      "deliveryCount": 18,
      "pickupCount": 5,
      "canceledCount": 1
    },
    "activeCounts": {
      "new": 2,
      "inPreparation": 4,
      "readyForPickup": 1,
      "readyForDelivery": 0,
      "outForDelivery": 3
    },
    "last7Days": [
      { "date": "2026-04-23", "orderCount": 18, "revenue": 1234.50 }
    ],
    "hourlyToday": [
      { "hour": 11, "orderCount": 0 },
      { "hour": 12, "orderCount": 2 }
    ],
    "topProducts30Days": [
      { "productName": "Pizza Margherita", "totalSold": 89 }
    ]
  }
  ```
- `GET /api/admin/dashboard/summary` zostaje jako **deprecated alias**
  do usunięcia w przyszłej fazie. Tech debt zarejestrowany w
  `docs/ROADMAP.md` sekcja "Tech debt świadomie odłożony" → "Z Fazy 4.5"
  z trigger'em usunięcia. Nie gubić.

**Co NIE wchodzi w backend:**
- ❌ Żadnych nowych ról ani modyfikacji `SecurityConfig` (AD-020)
- ❌ Żadnych nowych endpointów typu `/api/admin/kitchen/orders` —
  frontend filtruje istniejące `/api/admin/orders` query paramami
- ❌ Żadnych zmian w SSE infrastructure (działa, używamy jak jest)
- ⚠️ State machine `OrderStatus` rozszerzona addytywnie o `NEW →
  IN_PREPARATION` (AD-023, post-review CRITICAL-1) — wszystkie istniejące
  ścieżki bez zmian.
- ❌ Żadnych zmian w public API (`/api/public/*`)
- ❌ Żadnych zmian w `/track/:token` (klient widzi to samo co dziś)

### Zakres frontend

**Nowe routy:**
- `/admin/kitchen` — widok Kuchni
- `/admin/pickup` — widok Wydania
- `/admin/delivery` — widok Dostawy

**Przerobione routy:**
- `/admin` (Pulpit) — z 3 kafelków na pełnoprawny dashboard manager'a
  ze statystykami i wykresami

**Bez zmian (poza minor):**
- `/admin/orders` — zostaje jako "Wszystkie zamówienia". To **jedyne**
  miejsce gdzie można anulować zamówienie (z polem reason wymaganym).
- `/admin/orders/:id` — szczegóły zamówienia, bez zmian poza dorzuceniem
  wyświetlania `reason` w historii statusów (jeśli niepuste).
- Pozostałe widoki (Menu, Ustawienia, Godziny, Treści, Strefy) — bez
  zmian.

**Nawigacja w sidebar (`AdminLayout.tsx`):**
```
Pulpit               (/admin)
─────────────────
Kuchnia              (/admin/kitchen)
Wydanie              (/admin/pickup)
Dostawa              (/admin/delivery)
─────────────────
Wszystkie zamówienia (/admin/orders)
─────────────────
Menu                 (/admin/menu)
Ustawienia           (/admin/settings)
Godziny otwarcia     (/admin/opening-hours)
Treści stron         (/admin/page-content)
Strefy dostawy       (/admin/delivery-zones)
```
Separatory wizualne między sekcjami: operacyjne / archiwum / konfiguracja.

### Specyfikacje per widok

#### Kuchnia (`/admin/kitchen`)

**Filtr danych:** zamówienia w statusach `NEW` lub `CONFIRMED` lub
`IN_PREPARATION` (niezależnie od `fulfillmentType`). `CONFIRMED` widoczne
razem z `NEW` jako "NOWE" — pojawia się gdy admin użył back-office flow
przez `/admin/orders`. Patrz **AD-023** (rozszerzenie state machine
o `NEW → IN_PREPARATION` dla single-tap "Przyjmij").

**Layout:**
- Dwie sekcje z nagłówkami:
  - "NOWE — N" (`NEW` + `CONFIRMED`, sortowane `placedAt ASC` —
    najstarsze na górze)
  - "W PRZYGOTOWANIU — N" (`IN_PREPARATION`, sortowane `placedAt ASC`)
- Każde zamówienie = karta. Grid responsywny (1 kolumna mobile, 2-3
  kolumny tablet/desktop).

**Karta zamówienia:**
- Numer zamówienia (duży, top-left)
- Czas: "12 min temu" (`date-fns` `formatDistanceToNow` + locale `pl`)
- Badge typu: 🚗 DOSTAWA / 🏪 ODBIÓR (kolorystyka rozróżnialna)
- Pełna lista pozycji z dodatkami:
  ```
  2× Margherita 40cm
     + ekstra ser, oregano
  1× Pepperoni 30cm
  1× Cola 0.5l
  ```
- **Banner uwag klienta** (żółty kontrastowy box, tylko jeśli
  `customerNotes` niepuste): "📝 Bez cebuli, dzwonić domofon nie działa"
- ETA: jeśli ustawione — "ETA: 19:45". Jeśli nie — przycisk "Ustaw ETA"
  (modal jak istniejący w Fazie 4)
- **Główna akcja** (przycisk pełnej szerokości karty, min 56px wysokości):
  - dla `NEW` lub `CONFIRMED`: "Przyjmij" → `PATCH status` →
    `IN_PREPARATION` (AD-023)
  - dla `IN_PREPARATION`: "Gotowe" → `PATCH status` → `READY`
- **Bez confirm dialogu** — kucharz musi móc szybko klikać

**Co NIE pokazujemy:** adres dostawy, telefon klienta, kwota, przycisk
"Anuluj" (anulowanie tylko z `/admin/orders`).

**Empty state:** ikona + "Brak zamówień. Czekamy na pierwsze."

**Auto-refresh:** istniejący `useAdminOrderFeed()` (SSE). Lista
inwaliduje się na `ORDER_CREATED` i `ORDER_STATUS_CHANGED`.

**Dźwięk:** **tylko** `ORDER_CREATED` (nowe zamówienie).

#### Wydanie (`/admin/pickup`)

**Filtr danych:** zamówienia w statusie `READY` z `fulfillmentType =
PICKUP` (PICKUP nigdy nie idzie w `OUT_FOR_DELIVERY`).

**Layout:** jedna sekcja "DO WYDANIA — N", sortowanie `placedAt ASC`
(najstarsze najpilniejsze). Karty pełnej szerokości lub 2 kolumny.

**Karta zamówienia:**
- Numer zamówienia (duży)
- **Imię klienta — bardzo duże, kontrastowe** (klient mówi "Jan
  Kowalski", pracownik szuka po imieniu — kluczowa info dla tego widoku)
- Czas: "20 min temu"
- Telefon klienta z **przyciskiem "Zadzwoń"** (`<a href="tel:+48...">`)
  — przypadek: klient nie przyszedł 30 min, dzwonimy
- Lista pozycji
- Kwota do pobrania (jeśli `paymentMethod = CASH_ON_PICKUP`):
  "Pobierz: 89,50 zł" — duża, czerwona, niemożliwa do przegapienia
- Metoda płatności (tekstowo)
- **Główna akcja:** "Wydano" → `PATCH status` → `DELIVERED`
- **Z confirm dialogiem** ("Czy na pewno wydano zamówienie? Operacja
  kończy lifecycle zamówienia.") — `DELIVERED` jest terminalne

**Co NIE pokazujemy:** adres dostawy (PICKUP go nie ma), przycisk
"Anuluj", przyciski wstecznych statusów.

**Empty state:** "Brak zamówień do wydania."

**Dźwięk:** **tylko** `ORDER_STATUS_CHANGED` z `status = READY` ORAZ
`fulfillmentType = PICKUP`.

#### Dostawa (`/admin/delivery`)

**Filtr danych:** zamówienia w statusach `READY` z `fulfillmentType =
DELIVERY` ORAZ wszystkie w statusie `OUT_FOR_DELIVERY` (te zawsze są
DELIVERY, więc filtr `fulfillmentType` redundantny ale bezpieczny).

**Layout:**
- Dwie sekcje:
  - "DO ZABRANIA — N" (`READY` + `DELIVERY`, sort `placedAt ASC`)
  - "W DOSTAWIE — N" (`OUT_FOR_DELIVERY`, sort `placedAt ASC`)
- Karty 1-2 kolumny (mobile/tablet).

**Karta zamówienia:**
- Numer zamówienia (duży)
- Czas: "25 min temu"
- **Adres dostawy — bardzo duży, kontrastowy** (najważniejsza info
  dla dostawcy):
  ```
  ul. Słowackiego 14/3
  05-092 Łomianki
  ```
- **Notatki adresowe** (jeśli niepuste) — banner: "Dzwonić, domofon
  nie działa, 3 piętro bez windy"
- Imię + telefon klienta z **przyciskiem "Zadzwoń"**
- Kwota do pobrania (jeśli `CASH_ON_DELIVERY`): "Pobierz: 89,50 zł" —
  duża, czerwona
- Lista pozycji (kompaktowo — dostawca chce overview, nie czytanie
  szczegółów dodatków)

> Skorygowane po smoke teście (2026-04-30): banner `customerNotes`
> usunięty z karty Dostawy — single-responsibility. `customerNotes`
> wpływa na gotowanie (Kuchnia), nie na dowóz; `deliveryAddressNotes`
> zostaje jako jedyny banner z uwagami w widoku Dostawy.
- **Akcje główne:**
  - dla `READY`: "Wyjechało" → `PATCH status` → `OUT_FOR_DELIVERY`.
    Bez confirm.
  - dla `OUT_FOR_DELIVERY`: "Dostarczone" → `PATCH status` →
    `DELIVERED`. **Z confirm dialogiem** ("Potwierdzić dostawę?") —
    terminalne.
- **Akcje pomocnicze (zawsze widoczne, mniejsze przyciski):**
  - "🧭 Nawiguj" — `<a href="https://www.google.com/maps/search/?api=1&query={URL_encoded_full_address}" target="_blank">` — otwiera Google Maps z adresem
  - "📞 Zadzwoń" — duplikat dla pewności

**Co NIE pokazujemy:** przycisk "Anuluj" (anulowanie tylko
`/admin/orders`); ETA może być pokazane readonly, **dostawca nie
edytuje** (tylko Kuchnia ustawia); przyciski cofania statusu.

**Empty state:** "Brak zamówień do dostarczenia."

**Dźwięk:** **tylko** `ORDER_STATUS_CHANGED` z `status = READY` ORAZ
`fulfillmentType = DELIVERY`.

#### Pulpit (`/admin`) — przerobiony

**Cel:** widok dla manager'a / właściciela, otwiera raz dziennie z
laptopa żeby zobaczyć "co się dzieje".

**Sekcje (od góry):**

1. **Kafelki dziś** (4 karty w rzędzie, 2x2 na mobile):
   - "Zamówienia dziś" (liczba + delta vs wczoraj jeśli można policzyć)
   - "Sprzedaż dziś" (PLN)
   - "Średnia wartość zamówienia"
   - "Aktywne zamówienia" (suma w nieterminalnych statusach)

2. **Wykres słupkowy: Zamówienia dziś według godziny** (Recharts BarChart)
   - X axis: godziny od `openingHours` startu do końca (np. 11-23)
   - Y axis: liczba zamówień
   - Aktualna godzina podświetlona innym kolorem
   - Pomaga manager'owi wykryć peak hours

3. **Wykres liniowy: Zamówienia ostatnie 7 dni** (Recharts LineChart)
   - X axis: dni (skrót "Pon", "Wt", ...)
   - Y axis: liczba zamówień
   - Druga linia: revenue (drugorzędna oś Y) — opcjonalnie, może być
     osobny wykres

4. **Lista: Top 5 produktów ostatnie 30 dni**
   - Prosta tabela / lista: nazwa produktu + liczba sprzedanych sztuk

5. **Aktywne zamówienia per status** (5 małych kafelków, każdy linkuje):
   - Nowe → `/admin/kitchen`
   - W przygotowaniu → `/admin/kitchen`
   - Gotowe do wydania → `/admin/pickup`
   - Gotowe do wysyłki → `/admin/delivery`
   - W dostawie → `/admin/delivery`

**Dane z backendu:** nowy `GET /api/admin/dashboard/stats`.

**Auto-refresh:** SSE inwaliduje query `["admin", "dashboard", "stats"]`.
Dodatkowo polling co 60s jako safety net.

**Dźwięk:** **brak**. Manager nie pracuje na dźwięk.

### Decyzje przekrojowe

#### Sortowanie
We wszystkich widokach operacyjnych w obrębie sekcji: **najstarsze na
górze** (`placedAt ASC`). Powód: zamówienie wiszące 12 min jest pilniejsze
niż to które właśnie wpadło. Dźwięk SSE i tak zwróci uwagę na nowe.

#### Confirm dialogi

| Akcja | Confirm? |
|---|---|
| Przyjmij (NEW → IN_PREPARATION) | NIE |
| Gotowe (IN_PREPARATION → READY) | NIE |
| Wyjechało (READY → OUT_FOR_DELIVERY) | NIE |
| Wydano (READY PICKUP → DELIVERED) | TAK |
| Dostarczone (OUT_FOR_DELIVERY → DELIVERED) | TAK |
| Anuluj (z /admin/orders) | TAK + pole reason wymagane |

#### Anulowanie zamówienia (tylko w `/admin/orders`)
W `OrderStatusActions.tsx` rozszerz istniejący Dialog o pole tekstowe
`reason` (Textarea, max 500 znaków). Pole **wymagane** dla `CANCELED`
(walidacja w komponencie: `if (!reason.trim()) toast.error("Podaj
powód")`). Wartość `reason` w body `PATCH status`. Decyzja
architektoniczna: **AD-021**.

W `/admin/orders/:id` w sekcji historii statusów: jeśli `reason`
niepuste, wyświetl pod wpisem (mniejsza czcionka, kursywa).

#### Toasty
Wszystkie widoki admina pokazują toasty na eventy SSE — istniejące
zachowanie z Fazy 4 (Sonner) bez zmian. Toasty w prawym górnym, znikają
po 4-5 s.

Nowość: toast może być **klikalny** i przekierowywać do odpowiedniej
zakładki (toast "Nowe zamówienie #2026-00184" na widoku Dostawy → klik
→ `/admin/kitchen`). Implementacja przez prop `onClick` w `toast.success`.

#### Dźwięki — implementacja
**Bez plików MP3.** Generowanie syntetyczne przez Web Audio API:

```typescript
function playTone(frequency: number, durationMs: number, type: OscillatorType = 'sine') {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export function playKitchenSound() {
  // "ding-ding" wysoki - nowe zamówienie
  playTone(880, 100);
  setTimeout(() => playTone(880, 100), 150);
}

export function playPickupSound() {
  // "bong" średni - gotowe do wydania
  playTone(523, 300, 'triangle');
}

export function playDeliverySound() {
  // "gong" niski - gotowe do dostawy
  playTone(330, 400, 'triangle');
}
```

Hook `useAdminOrderFeed` rozszerzony: przyjmuje opcjonalny prop
`view: 'kitchen' | 'pickup' | 'delivery' | 'manager'`. Filtruje eventy
SSE i woła odpowiedni `play*Sound()` per widok. `manager` nie gra nic.
Globalny `SoundToggle` (z Fazy 4) działa jak działał — wycisza wszystko.

**Web Audio API uwaga:** AudioContext musi być utworzony po user
interaction (autoplay policy). Pierwsze kliknięcie SoundToggle przy
włączaniu dźwięku unlock'uje context. Bez tego pierwszy ping nie
zadziała — ale skoro user musi włączyć dźwięk, to user już kliknął.

#### Dźwięki — który widok pika na który event

| Event SSE | Kuchnia | Wydanie | Dostawa | Pulpit |
|---|---|---|---|---|
| `ORDER_CREATED` (NEW) | 🔔 ding-ding | — | — | — |
| `ORDER_STATUS_CHANGED` → `READY` (PICKUP) | — | 🔔 bong | — | — |
| `ORDER_STATUS_CHANGED` → `READY` (DELIVERY) | — | — | 🔔 gong | — |
| Inne eventy | — | — | — | — |

#### Recharts — instalacja
`npm install recharts` w `frontend/`. Sprawdzić kompatybilność z React
19 (recharts >= 2.10 wspiera).

#### Mobile / tablet responsywność
Wszystkie 3 widoki operacyjne **muszą wyglądać dobrze na tablecie
poziomym** (iPad 1024×768 — typowy use case w lokalu) ORAZ na pionowym
(telefon dostawcy). Karty: `min-width: 320px`, grid auto-rows. Touch
targets: główny przycisk akcji minimum 56px wysokości. Font: minimum
16px na kluczowych info (adres, imię, kwota).

Pulpit może być desktop-first (manager z laptopa), ale wykresy muszą
adaptować się przez `ResponsiveContainer` Recharts.

### Out of scope

**NIE dotykamy:**
- State machine `OrderStatus` — z **jednym wyjątkiem**: addytywna
  tranzycja `NEW → IN_PREPARATION` dodana post-review (AD-023). Pozostała
  semantyka bez zmian.
- Public tracking `/track/:token`
- Backend SSE infrastructure
- Auth / `SecurityConfig`
- RBAC (patrz AD-020 dla trigger'ów reewaluacji)
- Menu, Settings, OpeningHours, PageContent CRUD
- Strefy dostawy
- Endpointy public API
- Encje `Order`, `OrderItem`, `OrderItemAddon` (poza dodaniem `reason`
  na `OrderStatusHistory`)
- File upload (zdjęcia produktów dalej z URL)
- Kupony, klient accounts, drukarka bonowa, kasa fiskalna

**NIE robimy** (choć rozważane):
- Per-widok SoundToggle (jeden globalny zostaje)
- Per-device tokeny / sesje
- Audit log "kto co kliknął"
- Nowe role / RBAC
- Edycja ETA z innych widoków niż Kuchnia
- Anulowanie z innych widoków niż `/admin/orders`

### Definition of Done

- [ ] Migracja Flyway dodaje `reason TEXT NULL` do `order_status_history`
- [ ] Encja `OrderStatusHistory` ma pole `reason`
- [ ] DTO `PATCH /api/admin/orders/{id}/status` akceptuje opcjonalne
  `reason`
- [ ] `OrderStatusService` zapisuje `reason` na nowym wpisie historii
- [ ] **NOWY** endpoint `GET /api/admin/dashboard/stats` zwraca pełny
  payload
- [ ] Frontend ma trzy nowe widoki: `/admin/kitchen`, `/admin/pickup`,
  `/admin/delivery`
- [ ] Każdy widok pokazuje tylko zamówienia z odpowiednimi statusami
  i `fulfillmentType`
- [ ] Sortowanie: najstarsze na górze w obrębie sekcji
- [ ] Akcje: Przyjmij / Gotowe / Wyjechało / Dostarczone / Wydano —
  wszystkie działają, terminalne mają confirm
- [ ] Telefon klikalny w Wydaniu i Dostawie (`tel:` link)
- [ ] Nawiguj w Dostawie otwiera Google Maps z adresem
- [ ] Pulpit `/admin` przerobiony — kafelki + 2 wykresy + top produkty
  + aktywne zamówienia z linkami
- [ ] Recharts działa, wykresy są responsywne
- [ ] Sidebar ma nową strukturę z 3 zakładkami operacyjnymi
- [ ] `/admin/orders` z `OrderStatusActions.tsx` ma pole reason wymagane
  przy anulowaniu (i `/admin/orders/:id` pokazuje reason w historii)
- [ ] SSE działa we wszystkich nowych widokach (lista inwaliduje się)
- [ ] Dźwięki: 3 różne, każdy widok pika tylko swój event,
  SoundToggle globalnie wycisza
- [ ] Empty states w 3 widokach operacyjnych
- [ ] Mobile (375px) i tablet (1024px) — wszystkie widoki czytelne
  i klikalne
- [ ] Dokumentacja zaktualizowana po smoke teście:
  - `ROADMAP.md` — wpis Fazy 4.5 jako DONE
  - `PHASES.md` — STATUS: DONE w tym rozdziale
  - `CURRENT_STATE.md` — sekcja "Faza 4.5: Operational UI Split — DONE"

## Faza 5: Polish + Redesign + Deploy

> **Uwaga historyczna:** poprzednia wersja Fazy 5 ("Polish + Deploy",
> bez redesignu) została w większości dowieziona na branchu
> `design/g10-polish` przed powstaniem `docs/UX_BIBLE.md`. Po stworzeniu
> biblii UX i `docs/UX_GAP_ANALYSIS.md` scope Fazy 5 został rozszerzony
> o redesign zgodnie z biblią — stąd reset statusu na PLANNED.
> Część dotychczasowej pracy (deploy, error boundaries, część polish)
> może być reużyta przy implementacji nowej Fazy 5.

STATUS: PLANNED

### Cel
Zamknięcie MVP zgodnie z `docs/UX_BIBLE.md` (sekcje MVP-critical) oraz
`docs/UX_GAP_ANALYSIS.md` (synteza luk). Showcase premium pod HTTPS, gotowy
do pokazania klientowi. Po tej fazie projekt prezentuje się jak dedykowana
aplikacja restauracyjna na poziomie Pyszne / Uber Eats — dla pojedynczej
restauracji, bez zbędnego enterprise.

### Filozofia
> Mała pizzeria nie potrzebuje narzędzi enterprise. Potrzebuje narzędzia
> które robi 5 rzeczy świetnie zamiast 50 rzeczy źle.
> *(UX_BIBLE.md, Podsumowanie priorytetów MVP)*

Każda zmiana w tej fazie pochodzi z `UX_GAP_ANALYSIS.md`. Nie dodajemy
nic spoza listy. Cokolwiek poza tym scope'm trafia do `ROADMAP.md`.

### Zakres CORE — Backend

**M1. Migracja Flyway V8 (lub kolejna wolna):**
- `OrderItem.itemNote` VARCHAR(200) NULL — komentarz klienta per pozycja
- `RestaurantSettings.defaultPreparationMinutes` INTEGER NOT NULL DEFAULT 30
- `RestaurantSettings.manualClosedReason` VARCHAR(200) NULL
- `RestaurantSettings.manualClosedUntil` TIMESTAMP WITH TIME ZONE NULL

**M2. Backend logika:**
- `CheckoutService.createOrder()` ustawia początkowe `eta` jako
  `now() + defaultPreparationMinutes` (z `RestaurantSettings`)
- `OrderItem` snapshotuje `itemNote` z `CartItem` payloadu (rules dla
  walidacji: max 200 znaków, trimowane, null jeśli puste)
- `RestaurantSettingsService.isOpenNow()` uwzględnia `manualClosedUntil`:
  jeśli `manualClosedUntil > now()` → zwraca `false` niezależnie od godzin
- Endpoint `PATCH /api/admin/orders/{id}/cancel` wymaga `cancelReason`
  w body (min 1 znak, max 200) — zapisywane do `OrderStatusHistory.note`
  lub osobnego pola `cancellationReason` na Order (decyzja w plan mode)
- Endpoint `PATCH /api/admin/settings/manual-close` (body: reason +
  optional until)
- Endpoint `DELETE /api/admin/settings/manual-close` — przywraca
  normalne godziny

**M3. DTO updates:**
- `CartItemDto` zyskuje `itemNote: string | null` (max 200)
- `OrderItemDto` (publiczne tracking + admin) zwraca `itemNote`
- `RestaurantSettingsDto` (public) zwraca `manualClosedReason` (jeśli
  aktywny) i `defaultPreparationMinutes` (do informacji)

### Zakres CORE — Frontend (strona klienta)

**F1. Sticky cart sidebar (najważniejsza zmiana):**
- Na `/menu` przy breakpoincie ≥1024px sidebar 360px po prawej stronie
- Pozycja: `sticky top: 80px`, `max-height: calc(100vh - 96px)`
- Layout `MenuPage`: `lg:grid-cols-[1fr_360px]` (analogicznie do
  obecnego checkout layoutu)
- Sidebar pokazuje **ten sam koszyk** co `CartDrawer`, ale inline
- Poniżej 1024px: sidebar znika, pozostaje obecny `CartDrawer` + `MobileCartBar`
- `CartDrawer` na mobile zmienia side z `right` na `bottom` (Sheet
  bottom sheet) — biblia §6
- Zachować persistence w localStorage (Zustand persist już działa)

**F2. Komentarze per pozycja:**
- `ProductModal`: textarea pole "Notatka" pod listą dodatków
  - Placeholder: "Np. bez cebuli, dobrze wypieczona"
  - Max 200 znaków, licznik znaków pod polem
  - Wartość trafia do `addItem({...itemNote})` w cartStore
- W koszyku (drawer/sidebar) wyświetlanie pod listą dodatków jako
  szara kursywa: "📝 Bez cebuli"
- Klik na komentarz → inline edit (textarea zastępuje tekst, Save/Cancel)
- Cart store: `itemNote` jest częścią key generation (jeśli zmienisz
  notatkę, zostaje to ta sama pozycja, tylko zaktualizuje pole) — ten
  szczegół decyduje plan mode

**F3. Pasek minimum order w koszyku:**
- Pozycja: nad sekcją podsumowania
- Tekst: "Brakuje **{X} zł** do złożenia zamówienia. Min. {Y} zł."
- Progress bar 4px, primary color (% pełności od 0 do `minOrderAmount`)
- Animacja przy zmianie kwoty (300ms smooth grow)
- Po przekroczeniu: krótki zielony flash (600ms) + ✓, potem znika
- CTA "Przejdź do kasy" disabled gdy poniżej minimum (tekst się zmienia
  na "Min. zamówienie {Y} zł")

**F4. Banner "restauracja zamknięta" globalny:**
- Komponent `<RestaurantClosedBanner />` montowany w głównym layoutie
  publicznym
- Dane z `GET /api/public/settings` (już istnieje, sprawdzić czy zwraca
  `isOpenNow` lub czy musimy dodać)
- Polling co 60s (TanStack Query)
- Gdy zamknięte: sticky banner na górze całej strony, sub-text
  z `manualClosedReason` jeśli ustawiony, lub "Otwieramy o {godzina}"
- Banner blokuje submit w `/checkout` (guard) i pokazuje komunikat na
  modalu produktu ("Składanie zamówień jest tymczasowo niedostępne")
- Menu nadal można przeglądać

**F5. Pasek informacyjny pod hero (landing):**
- Trzy ikony + tekst: czas dostawy, minimalna kwota, koszt dostawy
- Dane z `RestaurantSettings`
- Mobile: trzy wiersze, desktop: trzy kolumny
- Pozycja: tuż pod hero, przed sekcją About

**F6. UX micro polish menu:**
- Cena dynamiczna na CTA modala produktu: "Dodaj do koszyka · 32,90 zł"
- Animacja bump ikony koszyka (200ms scale 1→1.15→1) przy `addItem`
- LQIP/blur-up dla zdjęć produktów (placeholder: ciemny szary lub
  blurred preview do czasu załadowania, fade-in 200ms)
- `loading="lazy"` na zdjęciach poza viewportem
- Scroll-spy dla aktywnej kategorii (IntersectionObserver, próg 25% od
  góry sticky headera, auto-scroll w nawigacji kategorii gdy aktywna
  poza widokiem)

**F7. Strona potwierdzenia (`OrderConfirmationPage`):**
- Wzbogacić: pełna lista pozycji (z wariantami, dodatkami, `itemNote`)
- Adres dostawy lub info o odbiorze
- Metoda płatności
- ETA prominentnie ("Dostawa ok. **{godzina}**" lub "Odbiór za ~{X} min")
- Numer zamówienia z przyciskiem "Skopiuj"
- CTA "Śledź zamówienie" (już jest)
- Drugorzędne CTA "Wróć do menu"

**F8. Tracking polish (`TrackingPage`):**
- Stepper statusów z ikonami per status:
  - NEW: ⏳ "Złożone"
  - CONFIRMED: ✓ "Przyjęte"
  - IN_PREPARATION: 👨‍🍳 "W przygotowaniu"
  - READY: 🍕 "Gotowe"
  - OUT_FOR_DELIVERY: 🛵 "W drodze" *(tylko dla DELIVERY)*
  - DELIVERED: 🎉 "Dostarczone" / "Odebrane"
  - CANCELED: ✕ "Anulowane"
- Aktywny status: pulsowanie dot 1.5s loop
- Zakończone: filled checkmark
- Następne: szare, outlined
- Stan terminalny DELIVERED: komunikat "Smacznego!" + CTA "Wróć do menu"
- Stan terminalny CANCELED: komunikat z `cancellationReason` (jeśli
  ujawniany w publicznym DTO — decyzja w plan mode) + CTA "Zamów ponownie"

**F9. Edge case'y w checkoucie:**
- Polling `isOpenNow()` co 60s na `/checkout` — gdy zmieni się na
  `false`, pokazuje banner i blokuje submit (przycisk disabled
  z tooltipem "Restauracja zamknęła się")
- Błąd 422 przy `POST /api/public/orders` (niedostępny produkt) —
  czytelny komunikat z listą produktów do usunięcia + CTA "Usuń
  niedostępne i spróbuj ponownie"
- Disabled CTA podczas `useMutation` (`isPending`) z spinnerem —
  prevent double submit
- Backend już ma rate limit 10/min/IP (Faza 3) — dodać user-friendly
  komunikat przy 429

**F10. Accessibility i performance:**
- `prefers-reduced-motion` w globalnym CSS → wyłącza wszystkie
  Framer Motion animacje, transitions, bumps
- Audyt touch targets ≥44px (przez `QA_CHECKLIST.md`)
- Audyt kontrastu WCAG AA (przez `QA_CHECKLIST.md`)
- Skeleton screens dla `/menu`, `/checkout`, `/track/:token` zamiast
  spinnerów

**F11. Mikrocopy audyt:**
- Puste stany (koszyk, brak wyników, brak zamówień admin) — zgodnie
  z biblią §15
- Komunikaty błędów formularza checkout — konkretne brzmienie z biblii
- Toast notifications (sukces, błąd) — standaryzacja
- Statusy zamówienia — polskie nazwy z biblii §15

### Zakres CORE — Frontend (panel admina)

**A1. Wyświetlanie `itemNote`:**
- W widoku szczegółów zamówienia (`/admin/orders/:id`) pod każdą pozycją
  jeśli `itemNote` istnieje — wyróżnione (żółta ramka/highlight, ikona 📝)
- Na liście zamówień badge "📝 {N}" przy zamówieniach gdzie któraś
  pozycja ma notatkę

**A2. Klikalny telefon klienta:**
- W sekcji klienta `<a href="tel:{phone}">{phone}</a>`
- Polish wyglądu (ikona telefonu obok)

**A3. Live polish:**
- Animacja highlight nowego zamówienia na liście — zielony flash 600ms
  na wierszu po przyjściu SSE event lub polling refresh
- Favicon dot / title badge gdy są nieprzeczytane NEW:
  `document.title = '(N) Pizza Showcase'` gdzie N to liczba NEW
  zamówień nieotwartych przez admina
- Reset N gdy admin otworzy listę zamówień

**A4. Anulowanie z powodem:**
- Modal anulowania: pole textarea "Powód anulowania" (wymagane, min 1)
- Powód zapisywany w `OrderStatusHistory.note` lub osobne pole
  `Order.cancellationReason` (decyzja w plan mode)
- Czy widoczny dla klienta na trackingu — decyzja w plan mode
  (preferowane: tak, sklejony krótko)

**A5. Settings — nowe pola:**
- Sekcja "Czas przygotowania":
  - Input `defaultPreparationMinutes` (number, 5-120, step 5)
  - Tekst pomocniczy: "Domyślny czas używany do wyznaczenia ETA dla
    nowych zamówień. Możesz nadpisać per zamówienie w panelu."
- Sekcja "Tymczasowe zamknięcie":
  - Toggle "Zamknij teraz"
  - Po włączeniu: textarea "Powód" (wymagana, max 200) i opcjonalny
    timepicker "Otwarcie planowane na" (datetime-local, opcjonalne —
    jeśli puste, admin musi ręcznie wyłączyć toggle)
  - Po zapisaniu: aktywny `manualClosedUntil` (lub null = bezterminowo
    do ręcznego wyłączenia)
  - Banner pokazuje admin'owi że restauracja jest zamknięta manualnie

**A6. Badge nawigacji:**
- Pozycja "Zamówienia" w sidebarze admina dostaje badge z liczbą
  nowych (NEW) zamówień
- Reset gdy admin wejdzie w listę

### Zakres CORE — Cross-cutting (wpisane w obecnej Fazie 5)

**C1. Deploy + production:**
- Dockerfile multi-stage (node 20 → gradle/jdk 21 → temurin 21 jre)
- SPA fallback controller (każdy unmapped request → index.html)
- Rate limiting w profilu prod (Bucket4j lub Spring rate limiter)
- Structured logging prod (logback JSON)
- Graceful shutdown
- Railway deploy + custom domain + HTTPS

**C2. SEO i meta:**
- Meta tags z `RestaurantSettings` (title, description, OG)
- OG image z `logoUrl`
- `manifest.json` (PWA podstawowy)
- Favicon (preferowany SVG, fallback emoji)
- **Schema.org Restaurant** structured data (biblia §1) — JSON-LD
  w `<head>` z danymi z `RestaurantSettings`

**C3. UX polish ogólny:**
- Error boundaries wokół `<Routes>` w main
- Skeletony zamiast spinnerów dla list (menu, zamówienia)
- Empty states dla wszystkich list (zgodnie z biblią §15)
- Framer Motion transitions tam gdzie ma sens (modal otwarcie, toast,
  drawer slide) — minimum, nie wszędzie
- Mapa kontaktu (iframe OSM lub Leaflet — wybierz w plan mode)

**C4. Dokumentacja:**
- `README.md` quickstart (zaktualizować po deploy)
- `docs/customization.md` — jak podmienić markę pod nowego klienta
- `docs/deployment.md` — jak zdeployować na Railway

### Zakres NICE-TO-HAVE (jeśli czas)

- Free-delivery progress bar (jeśli `freeDeliveryFrom` istnieje
  w `RestaurantSettings`)
- Toast undo po usunięciu pozycji z koszyka (5s, "Cofnij")
- Edycja `itemNote` inline w sidebarze (nie tylko w modalu)
- Hover polish kart produktów

### Definition of done

**Backend:**
- [ ] Migracja V8 zaaplikowana, kolumny w DB
- [ ] `CheckoutService` ustawia ETA z `defaultPreparationMinutes`
- [ ] `isOpenNow()` reaguje na `manualClosedUntil`
- [ ] Endpoint cancel wymaga `cancelReason`

**Strona klienta:**
- [ ] Sticky sidebar koszyka działa na desktop ≥1024px
- [ ] Mobile cart drawer to teraz bottom sheet
- [ ] Pole notatki w modalu produktu zapisuje do koszyka
- [ ] Notatka widoczna w koszyku, edytowalna inline
- [ ] Pasek minimum order pokazuje kwotę brakującą i % postępu
- [ ] Banner "zamknięte" pojawia się gdy admin ustawi manual close
- [ ] Pasek info pod hero pokazuje dane z settings
- [ ] LQIP działa (testowane przez DevTools throttle)
- [ ] Scroll-spy aktywuje kategorię w nawigacji
- [ ] Strona potwierdzenia ma pełne podsumowanie
- [ ] Tracking ma stepper z ikonami i animacją aktywnego
- [ ] Checkout: gdy w trakcie zamknie się restauracja, banner i submit zablokowany
- [ ] Mikrocopy zgodne z biblią §15

**Panel admina:**
- [ ] `itemNote` widoczny w szczegółach zamówienia
- [ ] Tel: link działa
- [ ] Highlight nowego zamówienia (flash)
- [ ] Title badge "(N) Pizza Showcase"
- [ ] Anulowanie wymaga powodu
- [ ] Settings: pola czasu przygotowania i manual close działają

**Cross-cutting:**
- [ ] Aplikacja działa na Railway pod HTTPS
- [ ] Custom domain skonfigurowany (lub przygotowany)
- [ ] Schema.org Restaurant w `<head>`
- [ ] Lighthouse: Performance ≥85, Accessibility ≥95, SEO ≥95

### NIE ruszać w tej fazie (przeniesione do ROADMAP.md)

Patrz `docs/UX_GAP_ANALYSIS.md` sekcja "→ ROADMAP.md (post-MVP)".
Najważniejsze:

- System ocen
- Search i filtry tagów
- Tagi/alergeny/wartości odżywcze produktów
- Promo kody / kupony
- Płatności online
- Google Places / mapa kuriera
- Pre-order / strefy / wyjątki godzin / capacity
- KDS / kurierzy / wiele ról
- Email/SMS notyfikacje
- Wykresy / KPI / eksport
- Drag-and-drop / upload zdjęć / bulk operations
- Drukarka termiczna
- Onboarding wizard
- 2FA / audit log / RODO eksport
- Multi-location / PWA push / QR menu

## Faza 7.0: Strefy dostawy (MVP)
STATUS: DONE (2026-04-28)

> Uwaga historyczna: pierwotnie plan 7.0 zakładał `V8__delivery_zones.sql`,
> ale V8/V9 były już zajęte (V8 order-number-sequence-seed z Fazy 3 hotfix,
> V9 add-eta-set-at z Fazy 4). Ostatecznie użyto `V10__delivery_zones.sql`.

> Pierwsza post-MVP faza w tym pliku. Pełen kontekst biznesowy i historia
> rozważanych alternatyw: `docs/phases/PHASE_7_DELIVERY_ZONES_NOTES.md`.
> Dla samej implementacji ten rozdział PHASES.md jest samowystarczalny —
> sesja startowa Fazy 7.0 nie wymaga zaglądania do NOTES.

### Cel
Restauracja konfiguruje, gdzie dowozi i za ile (FREE / PAID / UNAVAILABLE).
Klient w checkoucie wpisuje miasto + kod pocztowy, dostaje natychmiastową
informację o dostępności i koszcie dostawy. Niedostępny adres blokuje
złożenie zamówienia.

Reżim kosztowy: **zero zewnętrznych płatnych API, zero map, zero geocodingu**.
Lokalny autocomplete miast z bazy stref + format mask na kodzie pocztowym.

### Zakres

**Backend:**

- Encje:
  - `DeliveryZone` (id, name, type ∈ {FREE, PAID, UNAVAILABLE},
    deliveryFee NUMERIC(10,2), active, displayOrder, createdAt, updatedAt)
  - `DeliveryZoneArea` (id, zone, cityNormalized, cityDisplay,
    postalCode VARCHAR(6) NULL — NULL = wildcard miasta)
- Migracja `V8__delivery_zones.sql`:
  - tabela `delivery_zone` z `CHECK (type IN ('FREE','PAID','UNAVAILABLE'))`
    i `CHECK (type <> 'PAID' OR delivery_fee > 0)`
  - tabela `delivery_zone_area` z UNIQUE `(city_normalized, postal_code)` —
    realizacja zależnie od wersji PG: `NULLS NOT DISTINCT` (PG 15+) albo
    UNIQUE INDEX z `COALESCE(postal_code, '')`. Decyzja w sesji
    implementacyjnej po sprawdzeniu wersji w `docker-compose`.
  - `ALTER TABLE orders ADD COLUMN delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0`
  - `ALTER TABLE orders ADD COLUMN delivery_zone_name VARCHAR(80)` (nullable)
  - Existing orders dostają `delivery_fee=0`, `delivery_zone_name=NULL` —
    backward compatible.
- `DeliveryZoneLookupService.lookup(city, postalCode)`:
  1. normalize(city) → lowercase + strip diakrytyków + collapse whitespace
  2. normalize(postalCode) → format `XX-XXX`, walidacja regex
  3. query exact `(cityNormalized, postalCode)` na aktywnych strefach → trafienie wygrywa
  4. fallback `(cityNormalized, NULL)` na aktywnych strefach
  5. brak trafienia → `UNAVAILABLE`
- `DeliveryZoneAdminService` — CRUD stref + areas, walidacje,
  detekcja konfliktów cross-zone
- `CheckoutService` (rozszerzenie):
  - dla `fulfillmentType=DELIVERY`: lookup city/postalCode z `deliveryAddress`
  - `UNAVAILABLE` → 422 RFC 7807 z `detail` "Nie dostarczamy pod ten adres"
  - `FREE`/`PAID` → ustaw `order.deliveryFee`, `order.deliveryZoneName` jako snapshot
  - `total = subtotal + deliveryFee`
  - `fulfillmentType=PICKUP` → ignoruje strefy, `deliveryFee=0`,
    `deliveryZoneName=NULL`, `total = subtotal`
- Endpointy publiczne (rate-limited przez istniejący `RateLimitFilter`,
  np. 60 req/min/IP):
  - `POST /api/public/delivery/check`
    - body: `{ city: string, postalCode: string }`
    - response 200: `{ status: "FREE"|"PAID"|"UNAVAILABLE", fee: number, zoneName: string|null }`
  - `GET /api/public/delivery/cities`
    - response 200: `[{ display: string }, ...]` — unikalne miasta
      ze skonfigurowanych aktywnych stref, do lokalnego autocomplete
- Endpointy admin (JWT + ROLE_ADMIN):
  - `GET    /api/admin/delivery-zones`
  - `POST   /api/admin/delivery-zones`
  - `PATCH  /api/admin/delivery-zones/{id}`
  - `DELETE /api/admin/delivery-zones/{id}` — soft delete (`active=false`)
    jeśli strefa jest referenced przez orders (po `deliveryZoneName` snapshot)
    lub ma areas; hard delete tylko gdy ani areas ani orders
  - `POST   /api/admin/delivery-zones/{id}/areas`
    - body: `{ city: string, postalCode: string|null }`
  - `DELETE /api/admin/delivery-zones/{id}/areas/{areaId}`

**Frontend:**

- Admin: nowy ekran `/admin/delivery-zones`
  - Lista stref (sort `ORDER BY name` w 7.0 — drag-and-drop dopiero w 7.1)
  - Formularz strefy: nazwa, typ (radio FREE/PAID/UNAVAILABLE), koszt
    dostawy (widoczne tylko dla PAID, walidacja > 0), aktywna (checkbox)
  - Per strefa: lista areas + dwa tryby dodawania:
    1. **"Cała miejscowość"** — input city + checkbox "wszystkie kody"
       → zapis `(city, NULL)`
    2. **"Konkretne kody"** — input city + textarea kodów (po `\n` lub `,`)
       → N rekordów `(city, code1)`, `(city, code2)`...
  - Walidacja kodu: regex `^\d{2}-\d{3}$`, auto-formatowanie `01234` → `01-234`
  - Warning przy override: "Ten wpis nadpisuje regułę ogólną dla {miasto}"
  - Pusty stan stref → banner "Skonfiguruj strefy, żeby zacząć przyjmować
    zamówienia z dostawą" (defaultowo wszystko UNAVAILABLE)
- Public `CheckoutPage`:
  - Pole `Miasto` — combobox z lokalnym autocomplete: pobierz listę
    z `GET /api/public/delivery/cities`, match po normalized prefix.
    User może wpisać miasto spoza listy (wtedy lookup zwróci UNAVAILABLE).
  - Pole `Kod pocztowy` — input mask `00-000`, walidacja format
  - Live check: debounced 300ms call `POST /api/public/delivery/check`
    po wypełnieniu obu pól
  - Badge pod polami:
    - ✅ "Darmowa dostawa — strefa: {zoneName}"
    - ⚠️ "Dostawa: {fee} zł — strefa: {zoneName}"
    - ❌ "Niestety nie dostarczamy pod ten adres"
  - CTA "Złóż zamówienie" disabled gdy `status=UNAVAILABLE`
    i `fulfillmentType=DELIVERY`
  - `OrderSummary` pokazuje breakdown: `Suma produktów: {subtotal}`,
    `Dostawa: {deliveryFee}`, `Razem: {total}`
- Public `TrackingPage` — pokazuje snapshot `deliveryFee` i `deliveryZoneName`
  z odpowiedzi tracking endpoint
- Admin order detail (`/admin/orders/{id}`) — pokazuje fee i zone z snapshotu

### Kluczowe decyzje (cross-ref do ARCHITECTURE.md)

- **AD-019** — lookup hybrydowy `(city, postal_code)` z fallbackiem.
  Mechanika i odrzucone alternatywy (sam kod, sama nazwa, external
  geocoding).
- **AD-016 (rozszerzenie z 7.0)** — `total = subtotal + deliveryFee`
  dla DELIVERY; snapshot `deliveryFee`/`deliveryZoneName` na encji Order
  niezmienny po rekonfiguracji stref.
- **Domain conventions** — kontrakt normalizacji adresu (lowercase + strip
  diakrytyków + collapse whitespace dla city; regex `^\d{2}-\d{3}$` dla
  postal_code zawsze z myślnikiem). Identyczny w trzech miejscach: admin
  save area, admin `/cities`, public lookup.

### Definition of done

- Admin konfiguruje co najmniej trzy strefy (FREE z fallback area,
  PAID z konkretnym kodem jako override, UNAVAILABLE jako placeholder)
- Klient w checkoucie pisze miasto, dostaje sugestie z autocomplete,
  wybiera, podaje kod pocztowy → po 300ms widzi badge ze statusem strefy
- Override działa: wpis `(NDM, 05-160)` w strefie PAID wygrywa nad
  `(NDM, NULL)` w strefie FREE
- Adres spoza zasięgu → CTA disabled, czytelny komunikat
- Zamówienie złożone → `total = subtotal + deliveryFee`, snapshot zone/fee
  zapisany na Order
- Pickup → fee=0, zoneName=NULL, total=subtotal (lookup pominięty)
- Tracking i admin order detail pokazują snapshot fee/zone
- Migracja istniejących orderów → `delivery_fee=0`, `delivery_zone_name=NULL`
- Mobile (375px): combobox autocomplete + badge mieszczą się bez wrapowania
  do drugiej linii w nieczytelny sposób

### NIE ruszać jeszcze (out of scope w 7.0)

- Zewnętrzne API adresowe (Google Places / Mapbox / Photon / Nominatim) → **7.2**
- Polygony stref / mapy / Leaflet / leaflet-draw / OSRM / Valhalla → **7.3**
- Levenshtein / fuzzy matching nazw miast (literówki user'a) → **7.1**
- Min order amount per strefa → **7.1**
- Godziny otwarcia per strefa ("dowozimy do strefy B tylko 11-22") → **7.1**
- Bulk CSV import area w panelu admina → **7.1**
- Drag-and-drop sort stref na liście admina (kolumna `display_order`
  zostaje w schemacie, sort w 7.0 tylko `ORDER BY name`) → **7.1**
- Free shipping threshold ("darmowa dostawa od 60 zł") — to osobna funkcja
  (rabat oparty o subtotal, nie strefa), nie część rodziny 7.x
- Multi-tenant per-zone (strefy per restauracja) — w roadmapie ogólnej
  pod multi-tenant, tu single-tenant
