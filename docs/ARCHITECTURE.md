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

## Znane ograniczenia / tech debt świadomie zaakceptowane

- JWT w localStorage (AD-003) — do migracji przy wdrożeniu produkcyjnym.
- Brak refresh tokenów — klient musi się zalogować ponownie po 12h.
- Brak skalowania SSE na wiele instancji (brak Redis pub/sub) — Railway
  w MVP = 1 instancja.
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
