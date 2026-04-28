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

## Faza 5: Polish + Deploy
STATUS: DONE (kod); deploy Railway — ostatni krok manualny

### Cel
Showcase premium pod HTTPS, gotowy do pokazania klientowi.

### Zakres
- UX polish: transitions (Framer Motion na drawer/modal), skeletony
  (nie spinnery), dopracowanie 375px na każdym ekranie
- Walidacja godzin: jeśli zamknięte teraz → disable CTA "Zamów" z komunikatem
- Mapa kontaktu: iframe OSM z markerem z adresu (opcjonalnie Leaflet)
- SEO basics: meta tagi z RestaurantSettings, OG image, favicon, manifest.json
- Error boundaries w React (globalna strona błędu)
- Backend: Dockerfile multi-stage produkcyjny (frontend → backend → runtime),
  healthcheck, structured logging (logback JSON w prod), graceful shutdown
- SPA fallback controller dla React Router (każdy request SPA → index.html)
- Deploy na Railway: serwis app + postgres, env vars, HTTPS, custom domain
  (opcjonalnie)
- Dokumentacja:
  - README.md z quickstartem (local dev w <30 min)
  - docs/customization.md: jak podmienić markę pod nowego klienta
  - docs/deployment.md: jak zdeployować na Railway

### Definition of done
- Live URL pod HTTPS działa
- Demo end-to-end: klient składa zamówienie → admin obsługuje → klient widzi
- Mobile (375px) i desktop wyglądają premium
- README pozwala sklonować repo i odpalić lokalnie w <30 min

## Faza 7.0: Strefy dostawy (MVP)
STATUS: PLANNED

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
