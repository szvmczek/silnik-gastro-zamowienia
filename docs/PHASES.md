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
