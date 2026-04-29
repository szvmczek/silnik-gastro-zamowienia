# Faza 4.5: Operational UI Split — Hand-off Document

## Po co ten dokument

Ten plik zawiera kompletny zapis dyskusji projektowej dla **Fazy 4.5**
(Operational UI Split) plus ready-to-paste prompty dla Claude Code.

Wklejam go jako pierwszą wiadomość w nowym wątku tego samego projektu na
Claude.ai. Chcę, żebyś (Claude w tej nowej sesji) przeczytał wszystko i
poprowadził mnie krok po kroku przez implementację — generując konkretne
prompty, które ja będę wklejał do Claude Code, i odpowiadając na pytania
gdy coś pójdzie nie tak.

Wszystkie decyzje produktowe i architektoniczne **są już podjęte** w tym
dokumencie. Nie potrzebuję cię żebyś je rewidował — potrzebuję cię żebyś
pomógł mi je wykonać.

## Twoja rola jako "Claude prowadzący"

Po przeczytaniu tego dokumentu zacznij od krótkiego potwierdzenia że
wszystko rozumiesz, a potem wygeneruj **Krok 1** (zaktualizuj ROADMAP.md
i PHASES.md przez Claude Code). Resztę kroków generuj na żądanie. Nie
hurtem.

Jeśli widzisz coś, co w dokumencie wygląda niespójnie albo nie zgadza
się z aktualnym stanem repo — powiedz mi przed wygenerowaniem promptów,
nie po.

---

## 1. Stan projektu (kontekst)

### Co jest gotowe

| Faza | Zakres | Status |
|---|---|---|
| Faza 0 | Bootstrap (struktura, docker, skeleton) | DONE |
| Faza 1 | Auth + Settings + Theme + OpeningHours + PageContent | DONE |
| Faza 2 | Menu (Category, Product, Variant, Addon) + admin CRUD | DONE |
| Faza 3 | Cart + Checkout + Order + Public Tracking | DONE |
| Faza 4 | Admin Orders + State machine + SSE real-time | DONE (CORE + STRETCH) |
| Faza 7.0 | Strefy dostawy (postal code lookup) | DONE |

### Co nie jest gotowe

- **Faza 5** (Deploy + HTTPS + Dockerfile) — PLANNED, świadomie odłożona.
  Projekt rozwijany lokalnie do osiągnięcia stanu "tip top" przed pierwszą
  rozmową z klientem realnym.
- Kolejne fazy z ROADMAP.md (Płatności, Email notyfikacje, etc.)

### Kluczowe decyzje architektoniczne (już zapisane)

- **AD-017** — State machine dla `OrderStatus` w `order.domain.OrderStatus.canTransitionTo()`
- **AD-018** — SSE auth przez query param `?token=` (kompromis dla EventSource API)
- **AD-007** — Public tracking nie zwraca PII (telefon, email, notes)
- **AD-015** — Snapshot pattern dla `OrderItem` (cena, nazwy)

### Faza 4 — co konkretnie istnieje

**Backend:**
- `GET /api/admin/orders` (paginacja, filtry: status, dateFrom, dateTo, fulfillmentType)
- `GET /api/admin/orders/{id}`
- `PATCH /api/admin/orders/{id}/status` (z optimistic locking, 409 na konflikt)
- `PATCH /api/admin/orders/{id}/eta`
- `GET /api/admin/dashboard/summary` (3 liczniki: nowe dziś, w przygotowaniu, do dostawy)
- `GET /api/admin/orders/stream` (SSE, eventy `ORDER_CREATED`, `ORDER_STATUS_CHANGED`)

**Frontend:**
- `/admin` — dashboard z 3 kafelkami (placeholder z Fazy 1 zastąpiony realnym `DashboardPage` w Fazie 4)
- `/admin/orders` — tabela z filtrami, paginacją, badge statusu
- `/admin/orders/:id` — szczegóły, historia, akcje, modal ETA
- `useAdminOrderFeed()` hook — subskrybuje SSE, gra dźwięk, pokazuje toast
- `SoundToggle` — w AdminLayout, persisted w localStorage

**State machine** (z `OrderStatus.java` i mirror w `lib/transitions.ts`):
```
NEW → CONFIRMED → IN_PREPARATION → READY → OUT_FOR_DELIVERY → DELIVERED
                                       ↘ DELIVERED (PICKUP)
CANCELED — z każdego nieterminalnego
```

### Co JEST a wyglądało jakby NIE BYŁO (i odwrotnie)

- ✅ **Anulowanie zamówienia** — istnieje w `OrderStatusActions.tsx`,
  z confirm dialogiem
- ❌ **Powód anulowania** — **NIE istnieje**. Nie ma pola tekstowego w UI,
  nie ma kolumny w `order_status_history` ani w `order`. Mimo wrażenia
  że jest — nie ma. Trzeba dorobić w tej fazie (decyzja niżej).
- ❌ **Recharts / żadna biblioteka wykresów** — `frontend/package.json`
  nie zawiera. Trzeba dodać.

### Stack frontend (relevantne dla Fazy 4.5)

```
react 19, react-dom 19
react-router-dom 7
@tanstack/react-query 5
react-hook-form 7 + zod 4
axios 1
tailwindcss 3
shadcn/ui (przez radix-ui)
zustand 5
sonner (toasty)
date-fns 4
framer-motion 12
lucide-react (ikony)
```

NIE ma: recharts, chart.js, victory, visx, plotly, ani niczego do wykresów.

---

## 2. Wnioski z dyskusji (co user ustalił i czego chce)

### Problem operacyjny

Aktualny pulpit (`/admin` z 3 kafelkami "Nowe / W przygotowaniu / Do dostawy")
to **dobre demo, ale przeciętne narzędzie operacyjne**. Działa świetnie
przy 2-3 zamówieniach jednocześnie, zaczyna boleć przy 10+, traci sens
przy 20+. W realnej pizzerii pracownicy mają różne role:
- **Kuchnia** — przyjmuje zamówienia, robi pizze, klika "Gotowe"
- **Wydanie** (przy ladzie) — wydaje zamówienia PICKUP klientom
- **Dostawa** — bierze gotowe zamówienia DELIVERY i wiezie
- **Manager / właściciel** — ogląda statystyki, archiwum, robi reklamacje

Każdy z nich potrzebuje **innego widoku**. Ale **nie potrzebują różnych
kont** — w małej pizzerii (target market) wszyscy logują się na to samo
konto admina, każdy otwiera swoją zakładkę na swoim urządzeniu.

### Wybrane rozwiązanie

Reorganizacja panelu admina przez **filtrowane widoki tej samej listy
zamówień**. Backend praktycznie nieruszany. Trzy nowe zakładki operacyjne
(Kuchnia, Wydanie, Dostawa), przerobiony pulpit (statystyki zamiast 3
kafelków), `/admin/orders` zostaje bez zmian jako historia/archiwum.

### Kluczowe rozważone alternatywy (i odrzucone)

1. ❌ **Pełny RBAC z osobnymi rolami (KITCHEN, DELIVERY, PICKUP, MANAGER)**
   — odrzucone. 3-5 dni dodatkowej pracy, brak konkretnych use case'ów,
   target market (mały lokal) tego nie wymaga. Można dorobić później jako
   osobną fazę gdy pojawi się konkretny powód.

2. ❌ **Drukarka bonowa ESC/POS** — odrzucone z fazy 4.5. Zostaje na
   roadmapie. Dla MVP cyfrowy widok dostawcy (telefon w kieszeni dostawcy
   zalogowany na `/admin/delivery`) jest wystarczający i ma więcej info
   niż papierowy bon.

3. ❌ **Anulowanie z każdego widoku operacyjnego** — odrzucone.
   Anulowanie zostaje **tylko** w `/admin/orders` z confirm + reason.
   Powody:
   - 1 anulowanie na ~200 zamówień, nie warto przycisku w peak hour UI
   - "Anulowanie" to decyzja biznesowa (kosztuje pieniądze), gating
     jest cechą, nie bugiem
   - Audit trail naturalnie skupia się w jednym miejscu
   - Naturalnie poprawne uprawnienia gdyby kiedyś pojawił się RBAC

---

## 3. Specyfikacja Fazy 4.5

### Cel

Przebudować nawigację panelu admina tak, żeby każda rola (Kuchnia,
Wydanie, Dostawa, Manager) miała swój dedykowany widok operacyjny
zoptymalizowany pod **specyficzny kontekst pracy** (dotyk, glanceability,
information density). Plus dorzucić podstawowe statystyki na pulpicie
manager'a.

### Zakres — Backend

**Migracje:**
- Nowa migracja Flyway (kolejny dostępny numer): `ADD COLUMN reason TEXT
  NULL` na tabeli `order_status_history`. Pole opcjonalne, używane głównie
  dla `CANCELED`.

**Encje:**
- `OrderStatusHistory` — dodaj pole `reason: String?` (Java/Kotlin: `String`,
  nullable, max 500 znaków, kolumna `reason TEXT`)

**Endpointy:**
- `PATCH /api/admin/orders/{id}/status` — DTO request rozszerzone o
  opcjonalne pole `reason: String?` (max 500 znaków). Service zapisuje
  reason na `OrderStatusHistory` przy tworzeniu wpisu, jeśli niepuste.
  Dla statusów innych niż `CANCELED` — pole akceptowane ale konwencja:
  wymagane tylko dla `CANCELED` (walidacja na froncie, backend liberalny).
- **NOWY:** `GET /api/admin/dashboard/stats` — endpoint zastępujący /
  rozszerzający aktualny `/dashboard/summary`. Zwraca:
  ```
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
      { "date": "2026-04-23", "orderCount": 18, "revenue": 1234.50 },
      ...
    ],
    "hourlyToday": [
      { "hour": 11, "orderCount": 0 },
      { "hour": 12, "orderCount": 2 },
      ...
    ],
    "topProducts30Days": [
      { "productName": "Pizza Margherita", "totalSold": 89 },
      ...
    ]
  }
  ```
  Decyzja: zachować `/dashboard/summary` jako alias / deprecated
  (frontend Fazy 4 mógł go używać; w Fazie 4.5 frontend przechodzi na
  `/dashboard/stats`).

**Co NIE wchodzi w backend:**
- ❌ Żadnych nowych ról ani modyfikacji SecurityConfig
- ❌ Żadnych nowych endpointów typu `/api/admin/kitchen/orders` —
  frontend filtruje listę po stronie klienta używając istniejącego
  `/api/admin/orders` z query paramami
- ❌ Żadnych zmian w SSE (działa, używamy jak jest)
- ❌ Żadnych zmian w state machine `OrderStatus`
- ❌ Żadnych zmian w public API (`/api/public/*`)
- ❌ Żadnych zmian w `/track/:token` (klient widzi to samo co dziś)

### Zakres — Frontend

**Nowe routy:**
- `/admin/kitchen` — widok Kuchni
- `/admin/pickup` — widok Wydania
- `/admin/delivery` — widok Dostawy

**Przerobione routy:**
- `/admin` (Pulpit) — z 3 kafelków na pełnoprawny dashboard manager'a
  ze statystykami i wykresami

**Bez zmian:**
- `/admin/orders` — zostaje jako "Wszystkie zamówienia". To jedyne
  miejsce gdzie można **anulować** zamówienie.
- `/admin/orders/:id` — szczegóły zamówienia, bez zmian poza dorzuceniem
  wyświetlania `reason` w historii statusów (jeśli niepuste)
- Pozostałe widoki (Menu, Ustawienia, Godziny, Treści, Strefy) — bez zmian

**Nawigacja w sidebar (AdminLayout.tsx):**
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

### Specyfikacja widoku: Kuchnia (`/admin/kitchen`)

**Filtr danych:** zamówienia w statusach `NEW` lub `IN_PREPARATION`
(niezależnie od `fulfillmentType`).

**Layout:**
- Dwie sekcje z nagłówkami:
  - "NOWE — N" (zamówienia w `NEW`, sortowane po `placedAt ASC` —
    najstarsze na górze)
  - "W PRZYGOTOWANIU — N" (zamówienia w `IN_PREPARATION`, sortowane
    po `placedAt ASC`)
- Każde zamówienie = karta. Grid responsywny (1 kolumna mobile, 2-3
  kolumny tablet/desktop).

**Karta zamówienia (Kuchnia):**
- Numer zamówienia (duży, top-left)
- Czas: "12 min temu" (relatywnie, używa `date-fns` `formatDistanceToNow`
  z lokalem `pl`)
- Badge typu: 🚗 DOSTAWA / 🏪 ODBIÓR (kolorystyka rozróżnialna)
- Lista pozycji w pełnej formie:
  ```
  2× Margherita 40cm
     + ekstra ser, oregano
  1× Pepperoni 30cm
  1× Cola 0.5l
  ```
- **Banner uwag klienta** — żółty kontrastowy box, tylko jeśli
  `customerNotes` niepuste. Tekst dużą czcionką: "📝 Bez cebuli, dzwonić
  domofon nie działa"
- ETA: jeśli ustawione — "ETA: 19:45". Jeśli nie — przycisk "Ustaw ETA"
  (modal jak istniejący w Fazie 4)
- **Główna akcja (duży przycisk pełnej szerokości karty, min 56px wysokości):**
  - dla `NEW`: "Przyjmij" → `PATCH status` → `IN_PREPARATION`
  - dla `IN_PREPARATION`: "Gotowe" → `PATCH status` → `READY`
- **Bez confirm dialogu** dla "Przyjmij" / "Gotowe" — to akcje odwracalne
  w sensie operacyjnym, kucharz musi móc szybko klikać

**Co NIE pokazujemy w karcie Kuchnia:**
- ❌ adres dostawy (nie obchodzi kuchni)
- ❌ telefon klienta (nie obchodzi kuchni)
- ❌ kwota (nie obchodzi kuchni)
- ❌ przycisk "Anuluj" (anulowanie tylko z `/admin/orders`)

**Empty state:** ikona + "Brak zamówień. Czekamy na pierwsze."

**Auto-refresh:** używa istniejącego `useAdminOrderFeed()` (SSE). Lista
inwaliduje się na `ORDER_CREATED` i `ORDER_STATUS_CHANGED`.

**Dźwięk:** pika **tylko** gdy event `ORDER_CREATED` (nowe zamówienie).
Inne eventy bez dźwięku w Kuchni.

### Specyfikacja widoku: Wydanie (`/admin/pickup`)

**Filtr danych:** zamówienia w statusie `READY` z `fulfillmentType = PICKUP`.
(Pickup nigdy nie idzie w `OUT_FOR_DELIVERY`.)

**Layout:**
- Jedna sekcja "DO WYDANIA — N", sortowane po `placedAt ASC` (najstarsze
  na górze — czekają najdłużej, są najpilniejsze).
- Karty pełnej szerokości lub 2 kolumny.

**Karta zamówienia (Wydanie):**
- Numer zamówienia (duży, top-left)
- **Imię klienta — bardzo duże, kontrastowe** (klient mówi "Jan Kowalski",
  pracownik szuka po imieniu. To kluczowa info dla tego widoku.)
- Czas: "20 min temu"
- Telefon klienta z **przyciskiem "Zadzwoń"** (`<a href="tel:+48...">Zadzwoń</a>`)
  — przypadek: klient nie przyszedł 30 minut, dzwonimy
- Lista pozycji (jak w Kuchni)
- Kwota do pobrania (jeśli `paymentMethod = CASH_ON_PICKUP`):
  "Pobierz: 89,50 zł" — duża, czerwona, niemożliwa do przegapienia
- Metoda płatności (tekstowo)
- **Główna akcja:** "Wydano" → `PATCH status` → `DELIVERED`
- **Z confirm dialogiem** ("Czy na pewno wydano zamówienie? Operacja
  kończy lifecycle zamówienia.") — bo `DELIVERED` jest terminalne

**Co NIE pokazujemy w Wydaniu:**
- ❌ adres dostawy (PICKUP nie ma adresu)
- ❌ przycisk "Anuluj"
- ❌ przyciski wstecznych statusów

**Empty state:** "Brak zamówień do wydania."

**Dźwięk:** pika **tylko** gdy event = `ORDER_STATUS_CHANGED` z `status =
READY` ORAZ `fulfillmentType = PICKUP` (czyli "pizza właśnie pojawiła się
do wydania"). Inne eventy bez dźwięku w Wydaniu.

### Specyfikacja widoku: Dostawa (`/admin/delivery`)

**Filtr danych:** zamówienia w statusach `READY` z `fulfillmentType =
DELIVERY` ORAZ wszystkie w statusie `OUT_FOR_DELIVERY` (te zawsze są
DELIVERY, więc filtr `fulfillmentType` redundantny ale bezpieczny).

**Layout:**
- Dwie sekcje:
  - "DO ZABRANIA — N" (`READY` + `DELIVERY`, sortowane `placedAt ASC`)
  - "W DOSTAWIE — N" (`OUT_FOR_DELIVERY`, sortowane `placedAt ASC`)
- Karty 1-2 kolumny (mobile/tablet).

**Karta zamówienia (Dostawa):**
- Numer zamówienia (duży)
- Czas: "25 min temu"
- **Adres dostawy — bardzo duży, kontrastowy** (najważniejsza info dla
  dostawcy):
  ```
  ul. Słowackiego 14/3
  05-092 Łomianki
  ```
- **Notatki adresowe** (jeśli niepuste) — banner, np. "Dzwonić, domofon
  nie działa, 3 piętro bez windy"
- Imię + telefon klienta z **przyciskiem "Zadzwoń"**
- Kwota do pobrania (jeśli `CASH_ON_DELIVERY`): "Pobierz: 89,50 zł" —
  duża, czerwona
- **Notatki klienta** (`customerNotes`) — jeśli niepuste, banner: "📝
  Bez cebuli"
- Lista pozycji (kompaktowo — dostawca chce mieć overview, nie czytać
  szczegóły dodatków)
- **Akcje główne:**
  - dla `READY`: "Wyjechało" → `PATCH status` → `OUT_FOR_DELIVERY`.
    Bez confirm.
  - dla `OUT_FOR_DELIVERY`: "Dostarczone" → `PATCH status` → `DELIVERED`.
    **Z confirm dialogiem** ("Potwierdzić dostawę?") — bo terminalne.
- **Akcje pomocnicze (zawsze widoczne, mniejsze przyciski):**
  - "🧭 Nawiguj" — `<a href="https://www.google.com/maps/search/?api=1&query={URL_encoded_full_address}" target="_blank">` — otwiera Google Maps
    z adresem
  - "📞 Zadzwoń" — duplikat z dymka telefonu, dla pewności

**Co NIE pokazujemy w Dostawie:**
- ❌ przycisk "Anuluj" (anulowanie tylko z `/admin/orders`)
- ❌ ETA (jeśli ustawione, można pokazać readonly w karcie, ale **dostawca
  nie może edytować** — tylko Kuchnia ustawia)
- ❌ przyciski cofania statusu

**Empty state:** "Brak zamówień do dostarczenia."

**Dźwięk:** pika **tylko** gdy event = `ORDER_STATUS_CHANGED` z `status =
READY` ORAZ `fulfillmentType = DELIVERY` (czyli "pizza właśnie wyszła
z kuchni i czeka na zabranie"). Inne eventy bez dźwięku.

### Specyfikacja widoku: Pulpit (`/admin`) — przerobiony

**Cel:** widok dla manager'a / właściciela, otwiera raz dziennie z laptopa
żeby zobaczyć "co się dzieje".

**Sekcje (w kolejności od góry):**

1. **Kafelki dziś** (4 karty w rzędzie, responsywnie 2x2 na mobile):
   - "Zamówienia dziś" (liczba, plus delta vs wczoraj jeśli można policzyć)
   - "Sprzedaż dziś" (kwota w PLN)
   - "Średnia wartość zamówienia"
   - "Aktywne zamówienia" (suma w nieterminalnych statusach)
   
2. **Wykres słupkowy: Zamówienia dziś według godziny** (Recharts BarChart)
   - X axis: godziny (od `openingHours` startu do końca, np. 11-23)
   - Y axis: liczba zamówień
   - Aktualna godzina podświetlona innym kolorem
   - Pomaga manager'owi wykryć peak hours

3. **Wykres liniowy: Zamówienia ostatnie 7 dni** (Recharts LineChart)
   - X axis: dni (skrót: "Pon", "Wt", ...)
   - Y axis: liczba zamówień
   - Druga linia: revenue (drugorzędna oś Y) — opcjonalnie, może być
     osobny wykres

4. **Lista: Top 5 produktów ostatnie 30 dni**
   - Prosta tabela / lista: nazwa produktu + liczba sprzedanych sztuk

5. **Aktywne zamówienia per status** (5 kafelków małych):
   - Nowe (linkuje do /admin/kitchen)
   - W przygotowaniu (linkuje do /admin/kitchen)
   - Gotowe do wydania (linkuje do /admin/pickup)
   - Gotowe do wysyłki (linkuje do /admin/delivery)
   - W dostawie (linkuje do /admin/delivery)

**Dane z backendu:** używaj nowego `GET /api/admin/dashboard/stats`.

**Auto-refresh:** SSE updates inwalidują query `["admin", "dashboard",
"stats"]`. Dodatkowo polling co 60s jako safety net.

**Dźwięk:** **brak**. Pulpit jest dla manager'a, manager nie pracuje na
dźwięk.

### Decyzje przekrojowe (cross-cutting)

#### Sortowanie

We wszystkich widokach operacyjnych w obrębie sekcji: **najstarsze na
górze** (`placedAt ASC`). Powód: zamówienie które wisi 12 minut jest
pilniejsze niż to które właśnie wpadło. Dźwięk SSE i tak zwróci uwagę
na nowe.

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
(walidacja w komponencie, prosty `if (!reason.trim()) toast.error("Podaj
powód")`). Wartość `reason` przekazywana w body `PATCH status`.

W `/admin/orders/:id` w sekcji historii statusów: jeśli status ma `reason`
niepuste, wyświetl je pod wpisem (np. mniejszą czcionką, kursywą).

#### Toasty

Wszystkie widoki admina (operacyjne + manager'skie) pokazują toasty na
eventy SSE — to istniejące zachowanie z Fazy 4 (Sonner), zostaje bez zmian.
Toasty są w prawym górnym rogu, znikają po 4-5 sek.

Jedyna zmiana: toast może być klikalny i przekierowywać do odpowiedniej
zakładki (np. toast "Nowe zamówienie #2026-00184" na widoku Dostawy →
klik → przekierowuje do `/admin/kitchen`). Implementacja przez prop
`onClick` w `toast.success`.

#### Dźwięki — implementacja

**Bez plików MP3.** Generowanie syntetyczne przez Web Audio API:

```typescript
// Helper: pojedynczy ton
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

// Trzy różne dźwięki (różne częstotliwości i wzory):
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

Hook `useAdminOrderFeed` rozszerzony: przyjmuje opcjonalny prop `view:
'kitchen' | 'pickup' | 'delivery' | 'manager'`. Filtruje eventy SSE i
woła odpowiedni `play*Sound()` per widok. `manager` nie gra nic.

Globalny `SoundToggle` (z Fazy 4) działa jak działał — wycisza wszystko.

**Web Audio API uwaga:** AudioContext musi być utworzony po user
interaction (autoplay policy). Pierwsze kliknięcie SoundToggle przy
włączaniu dźwięku unlock'uje context. Bez tego pierwszy ping nie zadziała
— ale skoro user musi włączyć dźwięk, to user już kliknął, więc OK.

#### Dźwięki — które gra co

| Event SSE | Kuchnia | Wydanie | Dostawa | Pulpit |
|---|---|---|---|---|
| `ORDER_CREATED` (NEW) | 🔔 ding-ding | — | — | — |
| `ORDER_STATUS_CHANGED` → `READY` (PICKUP) | — | 🔔 bong | — | — |
| `ORDER_STATUS_CHANGED` → `READY` (DELIVERY) | — | — | 🔔 gong | — |
| Inne eventy | — | — | — | — |

#### Recharts — instalacja

`npm install recharts` w `frontend/`. Sprawdź kompatybilność z React 19
(powinna być OK, recharts >= 2.10 wspiera).

#### Mobile / tablet responsywność

Wszystkie 3 widoki operacyjne **muszą wyglądać dobrze na tabletcie
poziomym** (iPad 1024×768 i podobne — to typowy use case w lokalu) ORAZ
na pionowym (telefon dostawcy). Karty: `min-width: 320px`, grid
auto-rows. Touch targets: główny przycisk akcji minimum 56px wysokości.
Font: minimum 16px (ważne dla głównych info — adres, imię, kwota).

Pulpit może być desktop-first (manager pracuje z laptopa), ale wykresy
muszą się przystosowywać przez `ResponsiveContainer` Recharts.

### Out of scope dla Fazy 4.5

❌ **NIE** dotykamy:
- State machine `OrderStatus`
- Public tracking `/track/:token`
- Backend SSE infrastructure
- Auth / SecurityConfig
- RBAC
- Menu, Settings, OpeningHours, PageContent CRUD
- Strefy dostawy
- Endpointy public API
- Encje `Order`, `OrderItem`, `OrderItemAddon` (poza dodaniem `reason`
  na `OrderStatusHistory`)
- File upload (zdjęcia produktów dalej z URL)
- Kupony, klient accounts, drukarka bonowa, kasa fiskalna

❌ **NIE robimy** (choć rozważane):
- Per-widok SoundToggle (jeden globalny zostaje)
- Per-device tokeny / sesje
- Audit log "kto co kliknął"
- Nowe role / RBAC
- Edycja ETA z innych widoków niż Kuchnia
- Anulowanie z innych widoków niż `/admin/orders`

### Definition of Done

- [ ] Migracja Flyway dodaje `reason TEXT NULL` do `order_status_history`
- [ ] Encja `OrderStatusHistory` ma pole `reason`
- [ ] DTO `PATCH /api/admin/orders/{id}/status` akceptuje opcjonalne `reason`
- [ ] `OrderStatusService` zapisuje `reason` na nowym wpisie historii
- [ ] **NOWY** endpoint `GET /api/admin/dashboard/stats` zwraca pełny payload
- [ ] Frontend ma trzy nowe widoki: `/admin/kitchen`, `/admin/pickup`,
      `/admin/delivery`
- [ ] Każdy widok pokazuje tylko zamówienia z odpowiednimi statusami i
      `fulfillmentType`
- [ ] Sortowanie: najstarsze na górze w obrębie sekcji
- [ ] Akcje: Przyjmij / Gotowe / Wyjechało / Dostarczone / Wydano —
      wszystkie działają, terminalne mają confirm
- [ ] Telefon klikalny w Wydaniu i Dostawie (`tel:` link)
- [ ] Nawiguj w Dostawie otwiera Google Maps z adresem
- [ ] Pulpit `/admin` przerobiony — kafelki + 2 wykresy + top produkty +
      aktywne zamówienia z linkami
- [ ] Recharts działa, wykresy są responsywne
- [ ] Sidebar ma nową strukturę z 3 zakładkami operacyjnymi
- [ ] `/admin/orders` z `OrderStatusActions.tsx` ma pole reason wymagane
      przy anulowaniu (i `/admin/orders/:id` pokazuje reason w historii)
- [ ] SSE działa we wszystkich nowych widokach (lista inwaliduje się)
- [ ] Dźwięki: 3 różne, każdy widok pika tylko swój event,
      SoundToggle globalnie wycisza
- [ ] Empty states w 3 widokach operacyjnych
- [ ] Mobile (375px) i tablet (1024px) — wszystkie widoki czytelne i
      klikalne
- [ ] Dokumentacja zaktualizowana:
  - `ROADMAP.md` — wpis Fazy 4.5 jako DONE
  - `PHASES.md` — pełny rozdział Fazy 4.5
  - `ARCHITECTURE.md` — AD-019 (Single ADMIN role) i AD-020
    (cancellation reason on OrderStatusHistory)
  - `CURRENT_STATE.md` — stan po Fazie 4.5

### Decyzje architektoniczne — nowe AD records

#### AD-019: Single ADMIN role for operational views (MVP)

**Decyzja:** Nowe widoki operacyjne (Kuchnia, Wydanie, Dostawa) wymagają
roli `ADMIN`, tej samej co istniejące widoki admina. Nie wprowadzamy
osobnych ról `KITCHEN`, `DELIVERY`, `PICKUP`, `MANAGER`.

**Powody:**
- Target market (małe lokale 1-5 osób) operacyjnie funkcjonuje na zaufaniu
- RBAC to znaczna robota dodatkowa (3-5 dni) i blokowałby zamknięcie fazy
- Brak konkretnych use case'ów wymuszających granulację

**Konsekwencje akceptowane:**
- Wszyscy zalogowani widzą wszystkie zakładki
- Audit trail to jedna tożsamość ADMIN, bez per-user attribution
- Egzekwowanie podziału obowiązków = konwencja, nie technicznie

**Trigger do reewaluacji:**
- Klient zatrudnia zewnętrznych dostawców → potrzebne ograniczenie widoczności
- Zespół 5+ osób → potrzebny audit per-user
- Incident "kucharz zmienił ceny" → wymusza RBAC

#### AD-020: Cancellation reason on OrderStatusHistory

**Decyzja:** Pole `reason: String?` (max 500 znaków, nullable) dodane
na `OrderStatusHistory`, nie na `Order`.

**Powody:**
- Logicznie powód należy do **eventu zmiany statusu**, nie do zamówienia
- Otwiera możliwość przyszłych powodów (np. "powód cofnięcia z READY do
  IN_PREPARATION" — gdyby kiedyś dopuszczone)
- `OrderStatusHistory` już istnieje, dodanie kolumny to addytywna
  migracja zero-risk

**Konsekwencje:**
- DTO `PATCH /status` rozszerzone o `reason?`
- `OrderStatusService` zapisuje `reason` przy zmianie statusu
- UI w `/admin/orders/:id` wyświetla `reason` w historii (jeśli niepuste)
- Walidacja: `reason` wymagane na froncie dla `CANCELED`, opcjonalne
  dla innych

**Out of scope:**
- Słownik predefiniowanych powodów (np. "klient odmówił", "brak
  składników") — na razie wolny tekst. Jeśli okaże się że potrzebne,
  dorobić w osobnej fazie.

---

## 4. Plan implementacji — sekwencja kroków

Zakładam że pracujemy zgodnie z `OPERATOR_PLAYBOOK.md`. Trzymaj się
wzorców promptów z playbooka.

### Krok 1 — Aktualizacja dokumentacji (przez Claude Code, plan mode)

**Cel:** zaktualizować `ROADMAP.md`, `PHASES.md`, `ARCHITECTURE.md` przed
implementacją, żeby Faza 4.5 była zapisana jako "to się robi" zanim
zacznie się robić.

**Akcja:** wygeneruj prompt typu "Prompt #5" (z playbooka) który mówi
Claude Code: zaktualizuj te 3 pliki z dokumentacją Fazy 4.5 na podstawie
specyfikacji z tego dokumentu. Plan mode, akceptacja, implementacja.

Po wykonaniu — commit z message "docs: faza 4.5 spec (operational UI split)".

### Krok 2 — Implementacja Fazy 4.5 (przez Claude Code, plan mode)

**Cel:** wykonać całą Fazę 4.5 zgodnie ze specyfikacją.

**Akcja:** wygeneruj prompt typu "Prompt #2" (z playbooka, start fazy)
który:
1. Każe Claude Code przeczytać `CLAUDE.md`, `docs/PHASES.md` (gdzie już
   jest Faza 4.5), `docs/ARCHITECTURE.md` (z AD-019 i AD-020)
2. Każe wejść w plan mode
3. Każe przedstawić plan implementacji z podziałem na milestone (M1, M2,
   ... — sugerowane: M1 backend migration + reason, M2 stats endpoint,
   M3 frontend Recharts setup + utility, M4 Kitchen view, M5 Pickup view,
   M6 Delivery view, M7 Dashboard rebuild, M8 SoundService + integration,
   M9 OrderStatusActions reason field, M10 docs update)
4. Wymienia explicit czego NIE dotyka (out of scope z dokumentu)
5. STOP, czeka na "ok, leć"

Po planie — akceptujesz, Claude Code implementuje, commituje per
milestone.

### Krok 3 — Review (przez Claude Code, **osobna sesja**, plan mode)

**Cel:** niezależny review co zrobione, czy zgodnie ze spec, czy są
regresje.

**Akcja:** wygeneruj prompt typu "Prompt #3" (z playbooka, review)
który:
1. Mówi że to **osobna sesja** Claude Code, świeża pamięć
2. Każe przeczytać dokumentację (PHASES.md Faza 4.5) + zweryfikować
   stan kodu vs Definition of Done
3. Każe wymienić: ✅ co zrobione zgodnie ze spec, ⚠️ co odbiega,
   ❌ co nie zrobione, 🐛 znalezione bugi, 📝 sugestie polish
4. Output: raport tekstowy do `docs/REVIEW_FAZA_4_5.md`

Po review jeśli są ❌ albo 🐛 → wracamy do Claude Code z fixami
(Prompt #4 z playbooka).

### Krok 4 — Smoke test (manualnie, ja)

**Cel:** ja klikam realny flow w przeglądarce.

Scenariusze:
1. Otwórz 3 karty w przeglądarce: Kuchnia, Wydanie, Dostawa
2. W czwartej karcie: customer flow — złóż zamówienie DELIVERY
3. Obserwuj: na Kuchni pika i pojawia się karta w "NOWE"
4. Klikasz "Przyjmij" → znika z "NOWE", pojawia się w "W PRZYGOTOWANIU"
5. Klikasz "Gotowe" → znika z Kuchni, pojawia się w Dostawie w "DO ZABRANIA",
   pika gong dostawy
6. Na Dostawie klikasz "Wyjechało" → przechodzi do "W DOSTAWIE"
7. Klikasz "Dostarczone" → confirm → znika z Dostawy
8. Powtarzasz dla PICKUP — kończy się na Wydaniu
9. Otwierasz `/admin/orders`, anulujesz losowe zamówienie z reason →
   sprawdzasz że reason jest w `/admin/orders/:id` w historii
10. Otwierasz `/admin` (Pulpit) — sprawdzasz wykresy, kafelki, top produkty

Jeśli coś nie działa → prompt #4 do Claude Code z bugiem.

### Krok 5 — Aktualizacja CURRENT_STATE.md i merge

Po pomyślnym smoke teście:
- Wygeneruj prompt który każe Claude Code zaktualizować `CURRENT_STATE.md`
  o sekcję "Faza 4.5: Operational UI Split — DONE"
- Commit "chore: faza 4.5 done, current state updated"

---

## 5. Twoja checklista (jako user)

```
PRZED IMPLEMENTACJĄ
[ ] 1. Otwórz nowy chat w projekcie Claude.ai
[ ] 2. Wklej ten dokument jako pierwszą wiadomość
[ ] 3. Czekaj aż Claude potwierdzi że wszystko rozumie
[ ] 4. Poproś Claude o wygenerowanie KROK 1 (update dokumentacji)

KROK 1 — Update dokumentacji
[ ] 5. Skopiuj wygenerowany Prompt #5 do Claude Code (nowa sesja)
[ ] 6. Akceptuj plan, czekaj na implementację
[ ] 7. Sprawdź diff w git, commit
[ ] 8. Wróć do tego chatu, powiedz "krok 1 zrobiony, daj krok 2"

KROK 2 — Implementacja
[ ] 9. Skopiuj Prompt #2 do Claude Code (nowa sesja lub /clear)
[ ] 10. Akceptuj plan, czekaj na implementację milestone po milestone
[ ] 11. W trakcie — jak coś niejasne, pytaj w chat'cie ze mną
[ ] 12. Po zakończeniu wszystkich milestone — git status czysty,
       commits zrobione

KROK 3 — Review
[ ] 13. Skopiuj Prompt #3 do Claude Code (BARDZO WAŻNE: nowa sesja!)
[ ] 14. Czytaj raport, zaznacz co wymaga fixów
[ ] 15. Jeśli są fixy — Prompt #4 do Claude Code z konkretną listą

KROK 4 — Smoke test
[ ] 16. Postaw projekt lokalnie (docker-compose + bootRun + npm run dev)
[ ] 17. Wykonaj 10 scenariuszy z Kroku 4 powyżej
[ ] 18. Notuj co nie działa

KROK 5 — Domknięcie
[ ] 19. Update CURRENT_STATE.md przez Claude Code
[ ] 20. Final commit
[ ] 21. Wróć do tego chatu z statusem "Faza 4.5 zamknięta"
```

---

## 6. Notatki końcowe

- **Nie przyspieszaj.** Robisz to dobrze właśnie dlatego że nie ścinasz
  zakrętów. Jeden krok na raz.
- **Plan mode w Claude Code = nie negocjowalne.** Każda faza zaczyna się
  od planu, nie od kodu.
- **Review w osobnej sesji = nie negocjowalne.** Claude Code który pisał
  kod nie może go review'ować, bo lubi siebie.
- **Faza 5 (Deploy) zostaje na potem.** Nie wraca do dyskusji do czasu
  zamknięcia 4.5.
- Po zakończeniu Fazy 4.5 — następna decyzja: Faza 5 (Deploy + polish)
  czy kolejna feature faza? Tę decyzję podejmiesz wtedy.

Powodzenia. Wracaj z pytaniami.
