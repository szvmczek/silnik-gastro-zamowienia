# ARCHITECTURE.md

Dokument żyjący. Aktualizuj tylko wtedy, gdy podejmowana jest świadoma decyzja
architektoniczna, która wymaga zapisu. Dopisuj pod sekcje, nie nadpisuj.

## Decyzje architektoniczne (decision log)

### AD-001: Modular Monolith
Zamiast mikroserwisów — jedna aplikacja Spring Boot z modułami (identity,
restaurant, menu, order, realtime). Powód: koszt operacyjny mikroserwisów
nieuzasadniony dla single-tenant MVP.

### AD-002: Frontend serwowany przez Spring Boot
Frontend buduje się do `dist/`, kopiowany do `backend/src/main/resources/static/`.
Jeden artefakt, jeden serwis na Railway, zero CORS. Separacja na osobny
deployment to 1-dniowa operacja gdy będzie potrzebna.

### AD-003: JWT w localStorage dla MVP
Akceptowane jako tech debt. Ryzyko XSS istnieje, ale panel admina nie
wyświetla user-generated content. Migracja do httpOnly cookie + SameSite=Strict
planowana dla wdrożenia produkcyjnego u realnego klienta.

### AD-004: RestaurantSettings jako singleton
Jeden rekord w tabeli z constraint, dostęp przez RestaurantSettingsService.
Przygotowanie pod przyszłe multi-tenant bez implementacji teraz.

### AD-005: Real-time — polling dla klienta, SSE dla admina (stretch)
Tracking klienta przez polling TanStack Query co 15s. SSE dla admin order
feed jako stretch goal w Fazie 4 (fallback: polling 5-10s).
Powód: klient 2-3 zmiany statusu na sesję — różnica niezauważalna. Admin
siedzi godzinami — SSE daje efekt demo i oszczędza polling traffic.

### AD-006: Snapshoty w OrderItem
OrderItem zapisuje productNameSnapshot, variantNameSnapshot, unitPriceSnapshot.
Zmiana ceny w menu nie może zmienić kwoty zamówień historycznych.

### AD-007: publicTrackingToken jako UUID v4
Bezpieczny identyfikator dla publicznego URL trackingu. Nie sekwencyjny,
niepredyktowalny.

### AD-008: State machine dla OrderStatus
Dozwolone transitions zdefiniowane w enumie. Nielegalna zmiana — 422.
OrderStatusHistory zapisywana automatycznie.

### AD-009: Optimistic locking (@Version) na Order
Dwóch adminów nie nadpisze sobie statusu po cichu. Konflikt — 409.

### AD-010: URL input dla zdjęć produktów w MVP
File upload odłożony do post-MVP. W MVP admin wkleja URL (seed używa
Unsplash). Zmiana lokalna w module menu gdy będzie potrzebna.

### AD-011: MenuAssembler split-query (2 zapytania) dla `GET /api/public/menu`
Jedno zapytanie z pełnym `@EntityGraph` (Category→Product→Variant
+ Product→ProductAddonGroup→AddonGroup→Addon) wyrzuca
`MultipleBagFetchException` (dwie kolekcje-bag na Product) i generuje
iloczyn kartezjański. Rozwiązanie: **dwa zapytania split + stitch w serwisie**:
- q1: `Category LEFT JOIN FETCH products LEFT JOIN FETCH variants`
  (jedna kolekcja-bag, `Set<>` na obu stronach, `ORDER BY displayOrder`)
- q2: `ProductAddonGroup JOIN FETCH addonGroup LEFT JOIN FETCH addons
  WHERE product.id IN :ids` (batch po znanych productIds z q1)

`MenuAssembler` łączy wyniki po `productId`. Łącznie ≤2 zapytania
dla całego menu, niezależnie od liczby produktów/wariantów/dodatków.
Ten sam assembler obsługuje `GET /api/public/products/{slug}` z filtrem
na slug + limit 1.

### AD-012: Slug generowany server-side z Polish-aware diacritic stripping
Pole `slug` (Category, Product) nie jest edytowalne w formularzu admina —
auto-derive z `name` przy create przez `shared.util.SlugGenerator`:
Polish stripAccents (ą→a, ę→e, ć→c, ł→l, ń→n, ó→o, ś→s, ź/ż→z + wariant
wielkich liter) → lowercase → `[^a-z0-9]+` zastępowane `-` → trim `-`.
Kolizje w DB (UNIQUE constraint) rozwiązywane suffixem `-2`, `-3`, …
Rename slugu odłożony na post-MVP (łamanie zewnętrznych linków / SEO).

### AD-013: Generator orderNumber `YYYY-NNNNN`
Dedykowana tabela `order_number_sequence(year INT PK, last_number INT)`.
Atomowy inkrement przez `SELECT ... FOR UPDATE` w tej samej transakcji co
INSERT do `orders`. Brak ryzyka kolizji przy concurrent checkout.
Format: `2026-00001` (NNNNN zerowane do 5 cyfr).

### AD-014: Cart line key
Pozycja koszyka identyfikowana po krotce `(productId, variantId|null,
sortedAddonIds)`. Identyczna konfiguracja → `qty++`; inna → nowa linia.

### AD-015: Snapshoty również dla `addonGroupName`
`OrderItemAddon` snapshotuje nie tylko nazwę i cenę dodatku, ale też nazwę
grupy w momencie zamówienia (do czytelnej historii w Fazie 4).

### AD-016: Klient nie wysyła cen
Request payload `POST /api/public/orders` zawiera tylko ID (`productId`,
`variantId`, `addonIds`) + `quantity` + dane klienta. Backend pobiera świeże
ceny z DB i liczy totals.

**From Phase 7.0 onwards** (delivery zones):

- Reguła obliczeniowa totalu:
  - `fulfillmentType=DELIVERY` → `Order.total = subtotal + deliveryFee`
  - `fulfillmentType=PICKUP`   → `Order.total = subtotal`,
    `deliveryFee=0`, `deliveryZoneName=NULL`
- Pola `Order.deliveryFee` (NUMERIC(10,2)) i `Order.deliveryZoneName`
  (VARCHAR(80) nullable) zapisywane przez `CheckoutService` jako **snapshot**
  w momencie tworzenia zamówienia. Ich wartości są niezmienne po późniejszej
  rekonfiguracji stref przez admina — historyczne totalsy nie zmieniają się.
- Kontekst i mechanika lookup'u strefy (exact + fallback), normalizacja
  adresu, alternatywy odrzucone — patrz **AD-019**. Tu pozostaje tylko
  reguła totalu i kontrakt snapshotu na encji Order.

### AD-017: State machine location — backend source of truth, FE mirror
Logika dozwolonych przejść statusu zamówienia (z uwzględnieniem
`FulfillmentType` dla gałęzi `READY → OUT_FOR_DELIVERY | DELIVERED`) żyje
w metodzie `canTransitionTo(OrderStatus next, FulfillmentType ft)` na enumie
`order.domain.OrderStatus` — **jedna prawda**. `OrderStatusService` wywołuje
tę metodę przed zapisem; naruszenie → `ApiException.unprocessable` → 422.
Frontend ma **mirror** w [features/admin/orders/lib/transitions.ts](../frontend/src/features/admin/orders/lib/transitions.ts)
(`allowedTransitions(status, fulfillmentType)`), używany **wyłącznie do UI**
(ukrywa niedostępne przyciski akcji w `OrderDetailPage`). Backend pozostaje
ostateczną bramką — FE dryft z enumem nie narazi spójności danych, co
najwyżej pozwoli pokazać przycisk który dostanie 422. Rozbieżność FE↔BE do
audytu przy każdej zmianie state machine.

### AD-018: SSE auth via query param `?token=`
`EventSource` (Web API) nie wspiera niestandardowych nagłówków, więc
JWT nie może lecieć w `Authorization`. Akceptowane rozwiązanie dla
showcase/demo: `GET /api/admin/orders/stream?token=...`. Filter
`identity.infrastructure.JwtAuthenticationFilter` akceptuje `?token=`
**wyłącznie dla tej jednej ścieżki** (`SSE_PATH = "/api/admin/orders/stream"`) —
każdy inny endpoint nadal wymaga `Authorization: Bearer`. Ryzyka: token
w Referer, w logach proxy, w URL historii. Do migracji przy wdrożeniu
produkcyjnym — preferowany wariant: httpOnly cookie + SameSite=Strict
(spina się z AD-003) albo fetch-stream polyfill zamiast `EventSource`.

### AD-019: Delivery zones lookup with (city, postal_code) fallback

#### Kontekst
Faza 7.0 wprowadza strefy dostawy. Pierwotna roadmapa (Wariant A)
zakładała "lista kodów pocztowych per strefa" — okazała się
niewystarczająca dla realnych przypadków:

- **1 kod pocztowy = wiele miejscowości.** Na wsi jeden kod (np. `05-180`)
  obejmuje 5+ wsi. Dopasowanie samym kodem dałoby fałszywe trafienie:
  klient z innej miejscowości pod tym samym kodem dostaje fee jak my.
- **1 miejscowość = wiele kodów pocztowych.** Większe miasta mają
  kilkanaście-kilkadziesiąt kodów. Wymóg, żeby admin wpisywał każdy
  kod osobno dla strefy "całe miasto X" jest błędogenny.
- **Override per-dzielnica.** Realny przypadek: NDM ma centrum (FREE)
  i dzielnicę Modlin-Twierdza (PAID 5 zł, kod `05-160`). Sam kod albo
  sama nazwa nie wystarczają — potrzebny mechanizm "general rule + override".

#### Decyzja
Adres dopasowywany przez parę `(city_normalized, postal_code)` z
`postal_code` opcjonalnym (NULL = wildcard miasta). Lookup kolejność:

1. **Exact match** `(city, postalCode)` — najbardziej szczegółowy wpis wygrywa
2. **Fallback** `(city, NULL)` — reguła ogólna dla całego miasta
3. **Brak trafienia** → `UNAVAILABLE`

Bardziej szczegółowy wpis (z konkretnym kodem) **nadpisuje** regułę
ogólną. Dwie strefy mogą legalnie współistnieć: "cały NDM darmowo" +
"NDM kod 05-160 za 5 zł" — to feature, nie konflikt.

Konkretnie (przykład NDM):
- `(NDM, NULL)` w strefie FREE
- `(NDM, '05-160')` w strefie PAID 5 zł
- Lookup `NDM + 05-100` → exact miss → fallback → **FREE**
- Lookup `NDM + 05-160` → exact hit → **PAID 5 zł** (override wygrywa)
- Lookup `Warszawa + cokolwiek` → miss + miss → **UNAVAILABLE**

#### Alternatywy odrzucone

- **Sam kod pocztowy.** Odrzucone — 1 kod = wiele wsi (false positive
  dla sąsiednich miejscowości).
- **Sama nazwa miasta.** Odrzucone — duplikaty nazw na PL, brak
  możliwości override per-dzielnica.
- **External geocoding API:**
  - **Google Places Autocomplete + Address Validation** — sesja
    terminowana ~$17-25/1K, free tier 10K/m. Wymaga karty kredytowej
    i monitoringu kosztów. Reżim "zero abonamentów dla klienta pizzerii"
    wyklucza.
  - **Mapbox Geocoding** — 100K req/m za darmo, potem $5/1K (ostry klif).
    Wymaga karty. Wyklucza ten sam reżim.
  - **HERE 250K free/m** — wymaga karty, dodatkowe EU compliance.
  - **Photon (Komoot, hosted)** — darmowy, OSM-based, ale bez SLA
    i jako public dependency. Akceptowalny, ale przeniesiony do
    **Fazy 7.2** jako opcjonalny upgrade dla klientów którzy zgłoszą
    potrzebę.
  - **Self-hosted Nominatim** — $200-500/m za hosting. Absurdalnie
    nieproporcjonalne dla MVP showcase.

Wybór `(city, postal_code)` z lokalnym autocomplete miast i format
mask kodu daje 90% wartości UX-owej za 0 zł — bez kart kredytowych
i bez zewnętrznych zależności.

#### Konsekwencje

- **UNIQUE z NULL.** PostgreSQL domyślnie traktuje `NULL` jako rozłączne
  w UNIQUE, więc samo `UNIQUE (city_normalized, postal_code)` nie blokuje
  zduplikowanego `(NDM, NULL)`. Wymagane jedno z dwóch:
  - `UNIQUE (city_normalized, postal_code) NULLS NOT DISTINCT` — PG 15+
  - `CREATE UNIQUE INDEX ... ON delivery_zone_area (city_normalized, COALESCE(postal_code, ''))` — działa od starszych wersji
  Wybór dokonywany w sesji implementacyjnej Fazy 7.0 po sprawdzeniu wersji
  PG w `docker-compose`.
- **Spójność normalizacji.** Funkcja normalizacji `city → city_normalized`
  musi działać identycznie w trzech miejscach: admin save area
  (`DeliveryZoneAdminService`), admin `/cities` listing
  (`DeliveryZonePublicController` → unique cities), public lookup
  (`DeliveryZoneLookupService`). Rozjazd → cichy miss przy lookup.
  Rekomendacja: jedna `AddressNormalizer` w `shared/`, używana z trzech
  miejsc.
- **Niezmienność historycznych totalów.** Po zmianie konfiguracji stref
  zamówienia historyczne nie zmieniają fee — mechanika snapshotów
  `deliveryFee` i `deliveryZoneName` na encji Order opisana w **AD-016
  (rozszerzenie z Fazy 7.0)**. Tu tylko cross-reference.

## Domain conventions

### Address normalization (od Fazy 7.0)

Kontrakt normalizacji adresu wymagany przez AD-019:

- **City** (`city_normalized`):
  1. lowercase
  2. strip diakrytyków (`Łomianki` → `lomianki`, `Nowy Dwór` → `nowy dwor`).
     Polish stripAccents jak w `shared.util.SlugGenerator` (AD-012).
  3. collapse whitespace (multiple spaces → single space, trim)
- **City display** (`city_display`) — oryginalna pisownia z formularza
  admina, jedyne pole pokazywane userowi
- **Postal code** (`postal_code`):
  - Format kanoniczny: `^\d{2}-\d{3}$` (PL standard, **zawsze z myślnikiem**)
  - Auto-formatowanie wejścia: `01234` → `01-234`, strip whitespace
  - NULL = wildcard miasta (cała miejscowość objęta strefą)

Implementacja: jedna `AddressNormalizer` w module `shared/`, wywoływana
przez `DeliveryZoneAdminService` (przy save area), publiczny endpoint
`/api/public/delivery/cities` oraz `DeliveryZoneLookupService`
(przy lookup). Rozjazd między tymi trzema miejscami → cichy miss.

## Znane ograniczenia / tech debt świadomie zaakceptowane

- JWT w localStorage (AD-003) — do migracji przy wdrożeniu produkcyjnym.
- Brak refresh tokenów — klient musi się zalogować ponownie po 12h.
- SSE token w query param (AD-018) — do migracji na httpOnly cookie
  przy wdrożeniu produkcyjnym.
- Brak skalowania SSE na wiele instancji (brak Redis pub/sub) — Railway
  w MVP = 1 instancja. `SseEmitterRegistry` trzyma emitery in-memory;
  broadcast dociera tylko do klientów podpiętych do tego samego JVM.
- Godziny otwarcia bez wyjątków świątecznych — do dodania post-MVP.
- Statyczne obrazki bez CDN — OK dla showcase, dla produkcji rozważyć
  S3 + CloudFront.

## Model domeny (high-level)

### Identity
- User (id, email, passwordHash, displayName, role, active, createdAt)

### Restaurant configuration
- RestaurantSettings (singleton: id=1)
- OpeningHours (per dzień tygodnia)
- PageContent (sekcje: HERO, ABOUT)

### Menu
- Category
- Product (z basePrice, imageUrl jako URL)
- ProductVariant (rozmiar z ceną absolutną)
- AddonGroup (minSelect, maxSelect, required)
- Addon
- ProductAddonGroup (m2m)

### Order
- Order (z orderNumber, publicTrackingToken UUID, status, @Version)
- OrderItem (ze snapshotami)
- OrderItemAddon (ze snapshotami)
- OrderStatusHistory

## Struktura modułów backendu

```
com.pizzashowcase
├── config/        # Spring configs, Security, CORS, Jackson
├── shared/        # ErrorHandler, Money, wspólne DTO, exceptions
├── identity/      # User, auth, JWT
├── restaurant/    # RestaurantSettings, OpeningHours, PageContent
├── menu/          # Category, Product, Variant, Addon
├── order/         # Order, CheckoutService, state machine
├── realtime/      # SSE (Faza 4 stretch), EventPublisher
└── PizzaShowcaseApplication.java
```

Warstwy w module: `api/` (controllers, DTO) → `application/` (services) →
`domain/` (entities, VO, enums) → `infrastructure/` (repositories).
