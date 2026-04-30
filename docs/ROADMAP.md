# ROADMAP.md

Lista świadomego "nie teraz". Zapisujemy moduły post-MVP, żeby wiedzieć,
kiedy i jak je dodamy, bez pokusy budowania pod nie teraz.

## Zasada
Architektura MVP MUSI pozwalać na dodanie tych modułów bez przepisywania,
ale NIE może ich przewidywać w kodzie.

Konkretnie: singleton RestaurantSettings (nie Restaurant-y z id), enum
paymentMethod rozszerzalny, service layer oddzielający API od persystencji.
Nie zostawiamy pustych interfejsów PaymentProvider, DeliveryZoneCalculator
itp. — to YAGNI.

## Faza 4.5: Operational UI Split

**STATUS:** in progress

Trzy nowe widoki operacyjne (Kuchnia, Wydanie, Dostawa) plus przerobiony
pulpit z wykresami (Recharts) i podstawowymi statystykami. Backend
praktycznie nieruszany — frontend filtruje istniejący
`/api/admin/orders` po stronie klienta.

**Pełna spec:** `docs/PHASES.md` rozdział "Faza 4.5: Operational UI Split".
Source of truth dyskusji projektowej: `docs/FAZA_4_5_HANDOFF.md`.

**Nowe AD records:** AD-020 (Single ADMIN role for operational views),
AD-021 (Cancellation reason on `OrderStatusHistory`), AD-022 (Admin
order list returns full detail shape — dodane w trakcie M3.5 jako
prerequisite dla widoków operacyjnych bez per-card detail HTTP storm).

**Co wchodzi w zakres (skrót):**
- Trzy nowe routy: `/admin/kitchen`, `/admin/pickup`, `/admin/delivery`
  (filtry po stronie klienta — bez nowych endpointów listy)
- Przerobiony `/admin` (Pulpit): kafelki dziś + BarChart godzinowy
  + LineChart 7 dni + top 5 produktów 30 dni + kafelki aktywne per status
- **NOWY** endpoint `GET /api/admin/dashboard/stats` (pełny payload
  zastępujący `/dashboard/summary`; alias zachowany jako deprecated —
  patrz "Tech debt świadomie odłożony")
- `reason: String?` (max 500 znaków) na `OrderStatusHistory` + pole
  w UI anulowania (`/admin/orders`) wymagane dla `CANCELED`
- Dźwięki różnicowane per widok przez Web Audio API (synteza, bez plików)
- Recharts dodany do `frontend/package.json`

**Świadomie poza scope:** RBAC / nowe role (zostaje single ADMIN —
trigger'y reewaluacji w AD-020), drukarka bonowa, audit log per-user.

**Estymacja:** ~5-7 dni (backend migracja + endpoint + frontend 3 widoki
+ dashboard rebuild + dźwięki + docs).

## Faza 4.6: Kitchen item checklist (PLANNED)

**Status:** PLANNED

**Cel:** dodać możliwość odznaczania pozycji w karcie Kuchni
w trakcie ich przygotowywania. Stan persistowany w bazie,
przeżywa refresh, widoczny dla wszystkich kucharzy. NIE pokazywany
klientowi w /track/:token.

**Zakres:**
- Backend: pole `isPrepared: Boolean` (default false) na OrderItem
- Migracja Flyway: V12 (lub kolejny dostępny)
- Endpoint: PATCH /api/admin/orders/{id}/items/{itemId}/prepared
- Frontend: checkbox per pozycja w KitchenOrderCard
- Optimistic update + rollback przy 4xx/5xx
- Reset isPrepared na false przy zmianie statusu z IN_PREPARATION
  do innego (sanity)

**Out of scope:**
- Wymuszanie "wszystkie odznaczone przed Gotowe" — sugestia, nie
  blokada (decyzja: kuchnia ma elastyczność)
- Pokazywanie progressu klientowi
- Per-kucharz attribution kto co odznaczył

**Trigger startu:** po Fazie 4.5 zamknięciu (zatwierdzony smoke
test v2) — decyzja "teraz vs po Fazie 5 (deploy)" do podjęcia
przez właściciela.

## Faza 6: Płatności online

### Kiedy najwcześniej sensownie
Po deployu MVP (Fazy 1-5 ukończone, live URL) + 1-2 tygodnie realnego
użytkowania (nawet w trybie demo z gotówką). To waliduje, że order flow
jest stabilny.

### Prowider (decyzja odłożona)
Do wyboru: Stripe (globalny standard, świetne SDK), Przelewy24 (PL, BLIK),
Stripe + BLIK via Stripe. Decyzja po MVP, zależnie od klienta.

### Co się zmienia w modelu
- Nowa encja Payment (id, orderId, provider, externalId, amount, currency,
  status, createdAt, paidAt, metadata JSONB)
- Order.paymentMethod dostaje wartość ONLINE
- Order dostaje pole paymentStatus (PENDING, PAID, FAILED, REFUNDED)
  lub delegujemy do encji Payment
- OrderStatusHistory lub PaymentStatusHistory

### Co trzeba zbudować
- PaymentService + PaymentProviderAdapter (interface z jedną implementacją)
- Endpoint: POST /api/public/orders zwraca też checkoutUrl / clientSecret
- Endpoint webhook: POST /api/public/webhooks/{provider} (public, z weryfikacją
  podpisu)
- Obsługa statusów: PAID → update Order → trigger powiadomień (jeśli są)
- Frontend: redirect do checkout provider, ekran sukcesu po powrocie,
  obsługa cancel/error
- Admin: widok statusu płatności w szczegółach zamówienia

### Pułapki
- **Idempotency webhooków** — ten sam event może przyjść 2+ razy. Używamy
  externalId + unique constraint.
- **Reconciliation** — co jeśli webhook nie doszedł w ogóle. Scheduler
  sprawdzający PENDING po 15 min.
- **Timeouts** — klient zamyka przeglądarkę po zapłacie. Status płatności
  musi dojść przez webhook, nie przez redirect.
- **Zwroty** — refund flow jako osobna operacja admin.
- **Sandbox testing** — wszystkie przepływy w trybie test przed produkcją.

### Szacunek
- Solidna integracja bez testów: 7-10 dni
- Z testami i edge case'ami: 12-15 dni

## Faza 7: Strefy dostawy

Rozbita na cztery podfazy. 7.0 = MVP wystarczający dla pierwszego klienta.
7.1-7.3 = ulepszenia ładowane tylko gdy konkretny klient zgłosi potrzebę.

> Wariant A z poprzedniej wersji roadmapy ("lista kodów pocztowych per strefa")
> został **zastąpiony** przez bogatszy model `(city, postal_code)` z fallbackiem
> i jest teraz Fazą 7.0. Wariant B ("polygony na mapie") trafił do Fazy 7.3.

Pełne ustalenia źródłowe: `docs/phases/PHASE_7_DELIVERY_ZONES_NOTES.md`.
Decyzja architektoniczna lookup: AD-019 w `docs/ARCHITECTURE.md`.
Zmiana w mechanice totalów: rozszerzenie AD-016 ("Klient nie wysyła cen")
o regułę `total = subtotal + deliveryFee` i snapshot pól delivery na Order.

### Faza 7.0 — MVP stref dostawy

**Kiedy najwcześniej sensownie:** gdy pierwszy realny klient potrzebuje
różnicować koszt dostawy między strefami albo blokować zamówienia spoza
zasięgu. Niekoniecznie tuż po Fazie 5 — można odłożyć aż klient zgłosi
potrzebę.

**Co wchodzi w zakres:**
- Encja `DeliveryZone` (name, type ∈ {FREE, PAID, UNAVAILABLE}, deliveryFee,
  active, displayOrder) + `DeliveryZoneArea` (zone, city_normalized,
  city_display, postal_code nullable)
- Lookup hybrydowy `(city, postal_code)`: exact match → fallback `(city, NULL)`
  → UNAVAILABLE
- Endpointy publiczne: `POST /api/public/delivery/check`, `GET /api/public/delivery/cities`
- Endpointy admin: CRUD stref + areas
- CheckoutService: lookup przy `fulfillmentType=DELIVERY`, snapshot
  `deliveryFee` i `deliveryZoneName` na encji Order, `total = subtotal + deliveryFee`
- Pickup nadal ignoruje strefy całkowicie
- Frontend admin: ekran "Strefy dostawy" (CRUD stref + dwa tryby dodawania
  area: "cała miejscowość" i "konkretne kody")
- Frontend public: lokalny autocomplete miast w `CheckoutPage`, format mask
  na kodzie pocztowym, debounced live check, badge ze statusem strefy,
  disabled CTA przy UNAVAILABLE, fee w `OrderSummary`
- Tracking i admin order detail pokazują snapshotowane fee/zone

**Świadomie poza scope (zero zewnętrznych płatnych API, zero map):**
- Brak geocodingu, brak Google Places / Mapbox / Photon / Nominatim
- Brak polygonów, brak Leaflet
- Brak fuzzy matchingu nazw miast (literówki user'a → UNAVAILABLE)
- Brak min order per strefa, brak godzin strefy

**Estymacja:** 3-5 dni (backend + frontend + admin + docs).

### Faza 7.1 — opcjonalne ulepszenia stref

**Kiedy najwcześniej sensownie:** po wdrożeniu 7.0 u realnego klienta,
gdy konkretny use-case z poniższych zacznie boleć (np. admin skarży się
na ręczne wpisywanie 50 kodów po jednym).

**Co wchodzi w zakres:**
- Min order amount per strefa (np. "do strefy B minimum 40 zł")
- Godziny strefy ("do strefy B dowozimy tylko 11-22")
- Levenshtein matching nazw miast (tolerancja literówek przy lookup'ie)
- Bulk CSV import area w panelu admina
- Drag-and-drop sort stref (kolumna `display_order` już jest w 7.0,
  ale w 7.0 sort tylko `ORDER BY name`)

**Tickety z review Fazy 7.0 (do dorobienia w 7.1):**
- Konflikt fee przy concurrent admin PATCH: klient wysyła
  `expectedDeliveryFee` w `POST /orders`, backend re-lookuje
  i porównuje; różnica → 409 „Cena dostawy uległa zmianie."
  Alternatywa: `zoneVersion` z `/check` echo'wany przy place-order.
- 409 cross-zone z nazwą konfliktującej strefy: w
  `DeliveryZoneAdminService` przy konflikcie doczytać konfliktujący
  area + jego zone, włożyć `zone.getName()` w message.
- Zone rename break w soft-delete guard: zamiast string-match
  `existsByDeliveryZoneName`, dodać kolumnę `delivery_zone_id` (FK
  nullable, ON DELETE SET NULL) na `orders` jako drugi snapshot.
  Wymaga nowej migracji + backfill istniejących rekordów po nazwie.
- Custom React Combobox dla CityCombobox: normalized-prefix matching
  po stronie klienta, pełna kontrola UX, lepsze stylowanie iOS Safari.
- Cities listing distinct po `cityNormalized` z `MIN(cityDisplay)`
  zamiast distinct po `cityDisplay` (mała inkonsystencja gdy admin
  wpisze różne capitalizacje tego samego miasta w różnych strefach).
- `DeliveryCheckRequest`: dodać `@Pattern("^\\d{2}-\\d{3}$")` na
  `postalCode`, żeby invalid postal zwracał 400 zamiast 200 UNAVAILABLE.
- `<input list>` autoComplete conflict: ustawić `autoComplete="off"`
  na polu miasta w `CheckoutPage` żeby browser autofill nie konkurował
  z datalist.
- `OrderConfirmationDto`: wyświetlić `deliveryFee` i `deliveryZoneName`
  na confirmation page (obecnie zwisają — backend zwraca, frontend
  deserializuje, ale nie renderuje).
- `RateLimitFilter`: świadome wsparcie `X-Forwarded-For` (z whitelistą
  proxy) dla deploymentów za reverse proxy.

**Estymacja:** 2-4 dni zależnie od wybranego podzbioru (każdy element
można wziąć osobno).

### Faza 7.2 — autocomplete adresu z zewnętrznym API

**Kiedy najwcześniej sensownie:** tylko jeśli realny klient zgłosi, że
sugestie miast z bazy stref są niewystarczające (np. duża pizzeria, dużo
różnych miejscowości w okolicy, użytkownicy mylą się w pisowni). Dla
typowego klienta lokalny autocomplete z 7.0 wystarcza.

**Co wchodzi w zakres:**
- Photon (komoot.io, hosted) jako default — darmowy, OSM-based, bez
  klucza API, bez karty kredytowej
- Bring-your-own Google Places API key jako power-user feature
  (klient sam zarządza limitami i kartą)
- Frontend: rozszerzenie autocomplete w `CheckoutPage` o externalne
  sugestie (z fallbackiem do listy lokalnej)

**Estymacja:** 2-3 dni.

### Faza 7.3 — polygony / drive-time isochrones

**Kiedy najwcześniej sensownie:** tylko jeśli pizzeria ma flotę dostawczą
i potrzebuje precyzyjnego SLA (np. "dowozimy tam, gdzie kierowca dojedzie
w 25 min"). Większości klientów to nie dotyczy.

**Co wchodzi w zakres:**
- Leaflet + leaflet-draw w panelu admina — rysowanie polygonów strefy
  na mapie OSM
- Self-hosted OSRM albo Valhalla dla generowania isochrones (drive-time
  polygons z punktu pizzerii)
- Lookup adresu: geocoding → punkt w polygon → strefa
- Wymaga 7.2 (geocoding adresu) jako prereq

**Estymacja:** 7-10 dni + osobny koszt operacyjny (hosting OSRM/Valhalla).

### Pułapki ogólne (dotyczą całej rodziny 7.x)

- **Zmiana stref wstecz** — historyczne zamówienia mają snapshot
  `deliveryFee` i `deliveryZoneName` (od 7.0). Nigdy się nie zmieniają.
- **Format kodu pocztowego (PL)** — `XX-XXX`, normalizowany do tej formy
  zawsze (frontend, admin, backend, lookup).
- **Diakrytyki** — match po `city_normalized` (lowercase + strip diakrytyków),
  display zawsze z `city_display`.

## Faza 8: Email notyfikacje

### Kiedy
Razem z Fazą 6 lub tuż po. Potwierdzenie zamówienia + zmiana statusu mailem.

### Co
- SMTP przez Resend / SendGrid / Postmark
- Templating (Thymeleaf lub MJML → HTML)
- Kolejka w bazie (Outbox pattern) + scheduler
- Admin: edytor template'ów (opcjonalnie)

### Szacunek
- Z szablonami bazowymi: 2-3 dni
- Z admin edycją: +2 dni

## Dalsze moduły (do roadmapy, bez planu)

- Konta klientów + historia zamówień
- Kupony rabatowe (procent, kwota, minimum order)
- SMS notyfikacje (Twilio / Messagebird)
- Kitchen Display System (KDS) — osobny ekran dla kuchni
- Integracja z drukarką fiskalną / bonową (ESC/POS)
- Analytics dashboard (wykresy sprzedaży, top produkty)
- Wyjątki godzin otwarcia (święta)
- Galeria zdjęć restauracji
- Dark mode
- Multi-language (i18n)
- Integracje z kurierami (Glovo, Wolt, Pyszne, Stuart)
- Multi-tenant (gdy sprzedaż template'u wielu klientom w jednej instancji)
- PWA (offline menu, push notifications)
- File upload zdjęć produktów (zamiast URL)

## QoL improvements (post-MVP)

Drobne usprawnienia panelu admina sygnalizowane przez bundle Claude
Design ale skipnięte podczas redesignu G6-G9 jako poza scope (zwykle
wymagają dodatkowego state managementu lub podejmowania decyzji UX).

- **„Skopiuj godziny do…" w `/admin/opening-hours`** — bundle
  pokazuje per-row hover button kopiujący godziny otwarcia danego dnia
  do innych dni. Skipnięte w G9 (deferred D3=A) — wymaga ~30+ linii
  state managementu (popover/menu z checkbox listą dni docelowych,
  mass `setValue` na openTime/closeTime, focus return), a bundle nie
  precyzuje exact UX. Sensowne dodać razem z G10 polishem albo jako
  osobny mini-task.

## Tech debt świadomie odłożony

Bugi wykryte w review fazy, nie-blockery dla akceptacji, ale do uprzątnięcia
gdy będzie okazja (np. przy okolicznym refaktorze albo razem z fazą polish).

### Z Fazy 2 (Menu)

- **Bug #5 — N+1 w `GET /api/admin/products`**
  Lista produktów w panelu admina dociąga `category`, a dla każdego produktu
  potencjalnie warianty/grupy dodatków po jednej query. Fix: `@EntityGraph`
  na `ProductRepository.findAll(Pageable)` z `category` (i opcjonalnie
  `variants`) albo dedykowana metoda z `JOIN FETCH`. Po dodaniu paginacji
  problem ograniczony do jednej strony, ale dalej brzydki.

- **Bug #6 / #7 — race condition na unikalności `slug`**
  `SlugGenerator` rozwiązuje kolizje suffixami `-2`, `-3` na podstawie
  odczytu z bazy. Dwa równoległe POST-y tej samej nazwy mogą wygenerować
  ten sam slug i drugi padnie z `DataIntegrityViolationException` →
  obecnie 500. Fix: złapać DIV w `AdminCategoryService` /
  `AdminProductService` i zmapować na **409 Conflict** (RFC 7807,
  `slug already exists`). Alternatywnie: retry z kolejnym suffixem
  raz, potem 409. Niski priorytet — pojedynczy admin w MVP.

- **Bug #10 / #11 / #12 — edge case'y publicznego menu**
  - #10: produkt z `available=false` i jednocześnie kategoria
    `active=false` — obecnie wycinany na poziomie kategorii, ale flaga
    `available` w odpowiedzi powinna być spójna.
  - #11: `GET /api/public/products/{slug}` zwraca 404 gdy kategoria
    nieaktywna, ale frontend pokazuje generyczny błąd zamiast "produkt
    chwilowo niedostępny".
  - #12: produkt z grupą dodatków, gdzie wszystkie addony mają
    `available=false` — modal pokazuje pustą sekcję wymaganą
    (jeśli `required=true`) i blokuje "Dodaj do koszyka" bez
    czytelnego komunikatu. Backend powinien odfiltrować addony
    niedostępne lub flagować całą grupę.

  Fix razem z Fazą 5 (polish) — wymaga decyzji UX, nie tylko kodu.

### Z Fazy 4.5 (Operational UI Split)

- **Deprecated: `GET /api/admin/dashboard/summary`**
  Zastąpiony przez `/api/admin/dashboard/stats` w Fazie 4.5. Trzymany
  jako alias dla bezpieczeństwa kompatybilności wstecznej. Usunąć po
  Fazie 4.5 gdy:
  - (a) frontend nie wywołuje już `/summary` (`grep -r "dashboard/summary" frontend/`
    pusty),
  - (b) najwcześniej w fazie sprzątającej post-MVP.

- **MEDIUM-5 (z review 4.5): dwa odrębne `AudioContext`**
  `lib/sounds.ts` (kitchen/pickup/delivery) i `soundPrefs.ts`
  (SoundToggle priming beep) mają osobne instancje `AudioContext`.
  Mitigacja przez `audioCtx.resume()` po user-gesture działa, ale
  niedostępna sumarycznie po długich okresach nieaktywności (browser
  może suspendować ponownie). Trigger fix: konsolidacja do
  `shared/audio/context.ts` przy okazji następnej fazy dotykającej
  audio (notifications, per-event sound customization). Koszt ~30 LoC
  vs poprawa niezawodności w edge case.

- **LOW-7 (z review 4.5): heavy payload `OrdersListPage`**
  `AdminOrderQueryService.findAllFiltered` ma `@EntityGraph(items,
  items.addons)` (AD-022) wymagany przez widoki operacyjne, ale ten
  sam `findAllFiltered` obsługuje też `OrdersListPage` (PAGE_SIZE=20)
  który items nie renderuje. Zmarnowany payload + Hibernate fetch.
  Trigger fix: split na `findAllFilteredSlim` (bez entity graph) dla
  OrdersListPage i `findAllFilteredOperational` (z entity graph) dla
  Kuchni/Pickup/Dostawy. Koszt ~30 LoC w repo + service. Akceptowalna
  regresja w MVP (PAGE_SIZE=20 list, niski wpływ).
