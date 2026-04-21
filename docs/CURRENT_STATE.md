# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak — Faza 4 zamknięta. Następna: Faza 5 (Polish + Deploy).

## Fazy ukończone
- [x] Faza 0: Bootstrap
  - Pliki konstytucyjne: /CLAUDE.md, /docs/*.md
  - Backend: Spring Boot 3 + Java 21, skeleton, Gradle Kotlin DSL, migracja
    V1 pusta
  - Frontend: Vite + React + TS, Tailwind, shadcn/ui init, placeholder
    landing i admin login, routing
  - Infra: docker-compose z Postgres 16 + Adminer, .env.example,
    .gitignore, Dockerfile placeholder
  - Git: repo zainicjowane, pierwszy commit
- [x] Faza 1: Auth + Settings + Theme
  - Backend:
    - Gradle upgrade do 9.0 + foojay-resolver-convention 1.0.0 (JDK 21
      toolchain auto-provisioning, wymagane bo host JDK 25)
    - Encje: `identity.User` (+ `Role.ADMIN`), singleton
      `restaurant.RestaurantSettings` (CHECK id=1), `OpeningHours`
      (UNIQUE dayOfWeek + CHECK spójności czasów),
      `PageContent` (UNIQUE sectionKey HERO/ABOUT)
    - `shared.domain.AuditableEntity` dla `createdAt/updatedAt`
    - Migracje Flyway: `V2__identity_and_settings.sql` (schema),
      `V100__seed_demo.sql` (singleton Pizza Demo #E11D48, 7 dni godzin,
      HERO + ABOUT z obrazami Unsplash)
    - `AdminUserSeeder` (ApplicationRunner) tworzy admina z `ADMIN_EMAIL` /
      `ADMIN_PASSWORD`; idempotentny, noop gdy user istnieje
    - `JwtService` (HS256, 12h, secret z `JWT_SECRET` — fail-fast <32B),
      `JwtAuthenticationFilter`, `RateLimitFilter` (Bucket4j, 10/min na
      `POST /api/auth/login`, 429 + Retry-After + ProblemDetail)
    - `SecurityConfig` (STATELESS, CORS z `CORS_ALLOWED_ORIGINS`,
      403/401 ProblemDetail) zastąpił `BootstrapSecurityConfig`
    - `GlobalExceptionHandler` — RFC 7807 `ProblemDetail` dla 400/401/403/
      404/422/429/500 + mapping Bean Validation na `errors:{field:message}`
    - Publiczne endpointy: `GET /api/public/settings`,
      `GET /api/public/opening-hours`, `GET /api/public/page-content`
      (mapa HERO/ABOUT)
    - Admin endpointy (wymaga `ROLE_ADMIN`):
      - `GET|PUT /api/admin/settings`
      - `GET|PUT /api/admin/opening-hours` (batch — dokładnie 7 dni,
        walidacja `open<close` gdy otwarte)
      - `GET|PUT /api/admin/page-content/{hero|about}` (CTA tylko dla HERO)
    - Login: `POST /api/auth/login` → `{token, expiresAt, user}`
  - Frontend:
    - Axios interceptor: Authorization Bearer + auto-clear/redirect na 401
    - Zustand `authStore` (persist `pizza-showcase-auth`), `useAuth`,
      `ProtectedRoute`
    - `LoginPage` (RHF + Zod), toast na success/error z mapowaniem
      ProblemDetail
    - `AdminLayout` (responsive sidebar, header z `Wyloguj`), nested routes:
      `/admin` (dashboard placeholder), `/admin/settings`,
      `/admin/opening-hours`, `/admin/page-content`
    - `SettingsPage`: nazwa, tagline, kolor (color picker + hex input,
      live preview CSS var), logo URL, waluta, kontakt, adres
    - `OpeningHoursPage`: grid 7 dni, toggle "Zamknięte" disabluje pola,
      walidacja HH:MM i `open<close`
    - `PageContentPage`: taby HERO/ABOUT, współdzielony formularz
      (CTA widoczne tylko w HERO)
    - `ThemeBootstrap` + `usePublicSettings` aktualizują
      `--color-primary` w `:root` (HEX → kanały RGB dla Tailwinda)
    - Publiczny `LandingPage`: Hero / About / OpeningHours / Contact
      zasilane z `/api/public/*`; sticky header z nazwą/logo, footer
      z linkiem do panelu
    - Reużywalne UI: `Button`, `Input`, `Label`, `Textarea`, `Card`
  - Commity: po każdym milestone (18 milestonów). Historia w `git log`.
- [x] Faza 2: Menu
  - Backend:
    - Migracja `V6__menu.sql` (nie V3 jak w PHASES.md — V3/V4/V5 zajęte
      przez hotfixy Fazy 1) + seed `V101__seed_menu.sql` (3 kategorie
      Pizze/Napoje/Desery, 8 produktów, pizze z wariantami 30/40 cm,
      grupa "Dodatki pizzy" z 4 dodatkami, obrazki Unsplash)
    - Encje: `menu.Category`, `menu.Product` (basePrice nullable dla
      produktów z wariantami), `menu.ProductVariant` (price zawsze NOT NULL),
      `menu.AddonGroup` (minSelect/maxSelect/required + CHECK spójności),
      `menu.Addon`, `menu.ProductAddonGroup` (explicit m2m z displayOrder)
    - `shared.util.SlugGenerator` — stripAccents PL + lowercase +
      `[^a-z0-9]+ → -`, kolizje rozwiązywane suffixem `-2`, `-3` (AD-012)
    - `MenuAssembler` + `MenuQueryService` — **split 2-query** (q1:
      categories + products + variants, q2: product→addonGroups→addons
      IN :productIds) by uniknąć `MultipleBagFetchException` i iloczynu
      kartezjańskiego. Stitch w pamięci po productId (AD-011)
    - Publiczne endpointy:
      - `GET /api/public/menu` — pełne drzewo (tylko category.active=true,
        produkty niedostępne zwracane z flagą `available=false`)
      - `GET /api/public/products/{slug}` — jeden produkt z pełnym
        zagnieżdżeniem + nazwa kategorii; 404 gdy nie istnieje lub
        kategoria nieaktywna
    - Admin endpointy (`@PreAuthorize("hasRole('ADMIN')")`):
      - `GET|POST /api/admin/categories` + `GET|PUT|DELETE /{id}`
        (409 gdy są produkty)
      - `GET|POST /api/admin/products` (filtry `?categoryId=`, `?available=`)
        + `GET|PUT|DELETE /{id}` + `PATCH /{id}/availability`
      - `GET|POST /api/admin/products/{id}/variants`
        + `PUT|DELETE /api/admin/variants/{id}` (nested pod productem)
      - `GET|POST /api/admin/addon-groups` + `GET|PUT|DELETE /{id}`
        (409 gdy powiązana z produktem)
      - `POST /api/admin/addon-groups/{id}/addons`
        + `PUT|DELETE /api/admin/addons/{id}`
      - `GET|POST /api/admin/products/{id}/addon-groups`
        + `DELETE /api/admin/products/{productId}/addon-groups/{groupId}`
    - Walidacja na serwisie: produkt musi mieć albo basePrice, albo
      ≥1 wariant (XOR enforcowane w create/update)
  - **Hotfixy review (po M16):**
    - **Optimistic locking enforced na wszystkich update endpointach menu**
      (`PUT /api/admin/categories/{id}`, `/products/{id}`, `/variants/{id}`,
      `/addon-groups/{id}`, `/addons/{id}`). Każdy `Update*Request` ma teraz
      `@NotNull Long version`; serwis porównuje z `entity.getVersion()`
      i rzuca `OptimisticLockingFailureException` → **409** (RFC 7807) gdy
      mismatch. `Admin*Dto` echo-ują `version`, frontend round-trip-uje je
      w mutacjach. **BREAKING CHANGE dla klientów API**: każdy PUT na
      menu wymaga teraz pola `version` w body — stare klienty dostaną
      400 (`version: must not be null`). `PATCH /products/{id}/availability`
      celowo pominięte (single-field toggle, konflikt to szum).
    - **XOR basePrice/variants enforced w `AdminProductService`**:
      `create` wymaga `basePrice` (warianty dodaje się dopiero po
      stworzeniu produktu); `update` blokuje ustawienie `basePrice` gdy
      produkt ma już ≥1 wariant — w obu przypadkach **422** z
      czytelnym komunikatem zamiast cichego utworzenia produktu w
      stanie niespójnym.
    - Whitelist schematów `http://` / `https://` przywrócona na
      `Product.imageUrl` (regresja po refaktorze walidatora w M11).
    - `GET /api/admin/products` dostał paginację (`?page=&size=`,
      domyślnie `size=20`, max 100) — zgodnie z QA_CHECKLIST,
      lista admin nie może odpalać unbounded query.
  - Frontend:
    - Shadcn/ui dopełnienie: `Dialog`, `Select`, `Switch`, `Tabs`,
      `Checkbox` (wszystko przez `radix-ui` namespace, bez per-primitive deps)
    - `shared/api/menuApi.ts` — pełny surface publiczny + admin (typed)
    - Public `/menu` (`MenuPage` + `CategoryTabs` + `ProductCard`
      + `ProductModal` + `VariantPicker` + `AddonGroupPicker`
      + `useMenuPrice` hook + `usePublicMenu`):
      - sticky pill-tabs z IntersectionObserver (skip podczas scroll
        programatycznego)
      - karty produktów z fallback obrazka, "od X zł" gdy warianty,
        basePrice gdy bez, badge "Niedostępne" + wyszarzenie
      - modal z heroem, radio wariantów, checkbox dodatków (auto-swap
        gdy maxSelect=1, min-select walidacja), quantity stepper,
        live cena. Przycisk "Dodaj do koszyka" **disabled** z hintem
        "Koszyk będzie aktywny w Fazie 3"
    - Admin `/admin/menu` z tabami Kategorie | Produkty | Grupy dodatków
      (URL state przez `?tab=`):
      - `CategoriesList` + `CategoryFormDialog` (RHF+Zod, z.coerce.number
        na displayOrder, Switch active)
      - `ProductsList` — tabela z miniaturą, filtr kategorii, Switch
        dostępności z `PATCH availability`, ostrzeżenie gdy 0 kategorii
      - `ProductEditPage` (`/new` i `/:id`) — sekcje: dane podstawowe
        + preview obrazka z fallback `onError`, `VariantsSection`
        (inline CRUD), `AddonGroupsAttachSection` (Select wolnych grup
        + displayOrder + detach)
      - `AddonGroupsList` + `AddonGroupFormDialog` (zod refinements:
        `maxSelect >= minSelect`, `required ⇒ minSelect >= 1`)
      - `AddonGroupEditPage` — inline CRUD dodatków, pokazuje
        usedByProducts
    - Invalidacja po każdej mutacji admina: klucze `["admin","menu",...]`
      + `["public","menu"]` (landing/menu odświeża się bez hardrefresha)
    - Pattern błędów: `extractProblem(err)` → RFC 7807 `detail/title`
      → toast (fallback na lokalny PL komunikat)
    - Sidebar admina dostał link **Menu** pod `/admin/menu`
    - Placeholder `/menu` z Fazy 0 zastąpiony rzeczywistą stroną
  - Commity: milestone per krok (M1-M7 backend, M8-M15 frontend, M16 docs).
- [x] Faza 3: Cart + Checkout + Order + Tracking
  - Backend:
    - Migracja `V7__orders.sql` (nie `V4__orders.sql` z oryginalnego planu —
      V3-V6 zajęte przez hotfixy Fazy 1 i migrację menu)
    - Encje: `order.Order` (z `orderNumber`, `publicTrackingToken` UUID v4,
      `@Version`, `Address` embeddable), `order.OrderItem`,
      `order.OrderItemAddon`, `order.OrderStatusHistory`,
      `order.OrderNumberSequence`
    - Enumy: `OrderStatus` (pełne 7 stanów, w Fazie 3 używane tylko `NEW`),
      `FulfillmentType` (DELIVERY / PICKUP), `PaymentMethod`
      (CASH_ON_DELIVERY / CASH_ON_PICKUP)
    - `OrderNumberGenerator` — `SELECT ... FOR UPDATE` na
      `order_number_sequence` w tej samej transakcji co INSERT do `orders`
      (AD-013). Format `YYYY-NNNNN`, lazy insert rekordu roku.
    - `CheckoutService` (`@Transactional`):
      - Walidacja krzyżowa fulfillmentType ↔ paymentMethod ↔ address
        (`DELIVERY` wymaga adresu + `CASH_ON_DELIVERY`; `PICKUP` bez
        adresu + `CASH_ON_PICKUP`)
      - Batch pobiera produkty + warianty + addon-groups + dodatki przez
        reuse [MenuAssembler split-query](../backend/src/main/java/com/pizzashowcase/menu/application/MenuAssembler.java)
        (AD-011), `productRepository.findAllById` po unique IDs z request
      - Per linia: produkt `available=true`, `category.active=true`, wariant
        musi należeć do produktu (XOR: bez wariantów — `variantId` musi być
        null), dodatki w grupach przypiętych do produktu, `minSelect` /
        `maxSelect` / `required` enforced per grupa → 422 z czytelnym
        `detail` przy naruszeniu
      - Totals liczone server-side (AD-016): `lineTotal = (unitPrice +
        sum(addons)) * qty`; `subtotal = sum(lineTotal)`; `total = subtotal`
        (brak delivery fee w MVP)
      - Snapshoty nazwy produktu, wariantu, ceny + **nazwy grupy dodatku**
        (AD-015) zapisywane w `OrderItem` / `OrderItemAddon`
      - Tworzy Order + 1 wpis `OrderStatusHistory(NEW)` atomowo
    - `PublicOrderQueryService.findByToken` — projekcja **bez**
      `customerPhone`, `customerEmail`, `customerNotes` (AD-007). 404 gdy
      brak.
    - Publiczne endpointy (w `SecurityConfig` pod `permitAll`):
      - `POST /api/public/orders` → 201 + `{orderNumber, trackingToken,
        total}`
      - `GET /api/public/orders/track/{token}` → 200 / 404
    - `RateLimitFilter` zrefaktorowany z pojedynczej `TARGET_PATH` na
      `List<RateLimitRule>` (method+path+Bandwidth). Klucz bucketu `IP|path`
      żeby reguły były niezależne. Dodana reguła: `POST /api/public/orders`
      → 10 req/min/IP. Istniejąca reguła login bez zmian.
    - Rate limit multi-rule testowany smoke: 11 POST w ciągu minuty → 11.
      zwraca 429 + `Retry-After` + RFC 7807
    - DTO walidowane Bean Validation (`@NotBlank`, `@Pattern` na telefon PL
      `^\+?\d{9,11}$`, `@Pattern` na kod pocztowy `^\d{2}-\d{3}$`, `@Size`
      na uwagi max 500, `@Valid` cascading)
  - Frontend:
    - Shadcn/ui dopełnienie: `Sheet` (slide-in drawer), `RadioGroup`
    - `shared/api/orderApi.ts` — `placeOrder()`, `fetchOrderByToken()` + typy
      `OrderTrackingDto`, `OrderStatus`, `FulfillmentType`, `PaymentMethod`
      (bez PII w typie odpowiedzi trackingu)
    - `features/public/cart/`:
      - `cartStore.ts` — Zustand + `persist` (key `pizza-showcase-cart`,
        `partialize` tylko `items`). Line key `productId|variantId|
        sortedAddonIds` (AD-014) → dodawanie identycznej konfiguracji
        skleja `qty++`, inna konfiguracja = nowa linia
      - Selectors `useCartCount()`, `useCartTotal()` — derived (backend i tak
        liczy od nowa przy checkout, cart total jest wyłącznie do display)
      - `CartButton` (ikona + badge z liczbą, 99+ cap), `CartDrawer`
        (Sheet prawostronny, lista z miniaturkami, qty stepper
        `h-11 w-11 sm:h-9 sm:w-9` — min 44px touch target mobile, trash,
        total, CTA), `MobileCartBar` (sticky bottom `md:hidden`,
        widoczny tylko gdy `count > 0`)
      - Wpięcie w header `MenuPage` i `LandingPage` (button + drawer +
        mobile bar); padding dolne stron zwiększone (`pb-28 md:pb-16`)
        żeby MobileCartBar nie nakładał się na content
      - `ProductModal` "Dodaj do koszyka" odblokowany (Faza 2 miał disabled
        hint): buduje `CartAddon[]` z `selectedAddons`, zapisuje unitPrice
        wariantu, toast `Dodano do koszyka: {name}`, zamyka modal
    - `features/public/checkout/CheckoutPage.tsx`:
      - Guard: `items.length === 0` → `navigate('/menu', { replace: true })`
      - RHF + Zod z `superRefine` — adres warunkowy dla DELIVERY, cross-
        validacja paymentMethod z fulfillmentType (safety net pod auto-
        derive w UI)
      - `Controller` z Radix RadioGroup — wybór fulfillment auto-setuje
        odpowiedni paymentMethod przez `setValue('paymentMethod', ...,
        { shouldValidate: true })`
      - Layout grid `lg:grid-cols-[1fr_360px]`; na mobile summary na górze
        (order-1), formularz pod (order-2); submit przeniesiony z
        wnętrza aside do **fixed bottom sticky bar** `lg:hidden` przez
        `<button form="checkout-form" type="submit">` (żeby user nie
        musiał scrollować w górę pod podsumowanie na mobile)
      - Payload builder: puste opcjonalne stringi → `null`; `deliveryAddress
        = null` dla PICKUP
      - `useMutation(placeOrder)`:
        - onSuccess: `cartStore.clear()` → `navigate('/order/confirmation/'
          + orderNumber, { state: { trackingToken, total } })`
        - onError: `extractProblem(err)` → toast z `detail/title` (RFC
          7807), nie generic komunikatem
    - `features/public/order/OrderConfirmationPage.tsx`:
      - Czyta `trackingToken` + `total` z `location.state`
      - Token obecny → duży CTA "Śledź zamówienie" → `/track/{token}` +
        ostrzeżenie o zachowaniu linku
      - Token nieobecny (refresh) → amber notice "Link do śledzenia dostępny
        tylko zaraz po złożeniu. Zamówienie {orderNumber} zostało
        zapisane." (nie crashuje, świadomie nie persistujemy tokenu —
        AD-007)
    - `features/public/order/TrackingPage.tsx`:
      - `useQuery({ queryKey: ['order','track',token],
        refetchInterval: (q) => TERMINAL.includes(q.state.data?.status) ?
        false : 15_000, retry: (n, err) => err instanceof AxiosError &&
        err.response?.status === 404 ? false : n < 2 })`
      - `refetchIntervalInBackground: false` (oszczędza traffic gdy karta
        w tle)
      - TERMINAL_STATUSES = `['DELIVERED', 'CANCELED']` → polling staje
      - Loading: 3-segment skeleton; 404: XCircle + CTA do `/menu`
        (brak białego ekranu); inny error: rose alert z `extractProblem`
      - Render: hero z `orderNumber` + status badge + `Intl.DateTimeFormat
        ('pl-PL')` dla `placedAt` + ETA pill (Faza 4 wypełni), vertical
        `StatusTimeline` (flex-col ikon + progress line po lewej,
        NEW→CONFIRMED→IN_PREPARATION→READY→DELIVERY:OUT_FOR_DELIVERY→
        DELIVERED | PICKUP:DELIVERED), fulfillment block (MapPin dla
        dostawy), lista pozycji ze snapshotami + total
      - CANCELED zastępuje timeline rose info card
      - "Aktualizowanie…" indicator gdy `isFetching && !isLoading`
    - Routing: `/checkout`, `/order/confirmation/:orderNumber`,
      `/track/:token` podmienione z placeholderów Fazy 0 na realne
      komponenty
  - Mobile 375px polish (M13): CartDrawer stepper/trash do 44px touch
    target; CheckoutPage sticky bottom submit; MobileCartBar spacing
    (`pb-28 md:pb-16` na MenuPage, `pb-24 md:pb-6` na LandingPage)
  - **Hotfix Fazy 2 (build unblocker):** `PageContentPage.tsx` i
    `SettingsPage.tsx` miały Zod `.transform(v => ... : null)` dający
    schema output type `string | null` niespójny z RHF form input type
    `string | undefined` — `tsc -b` / `npm run build` fail. Fix: zmiana
    na `.transform(v => ... : undefined)` + drop redundantnego `.nullable()`
    na `nullableOptional` helperze. Zachowanie runtime niezmienione
    (mutation callers już mapują `values.x || null`).
  - Commity: milestone per krok (M1-M6 backend, M7-M13 frontend, M14 docs,
    osobny hotfix Fazy 2)
- [x] Faza 4: Admin Orders + polling (SSE stretch)
  - Backend CORE:
    - State machine w `order.domain.OrderStatus.canTransitionTo(next, ft)` —
      jedna prawda, gałąź `READY → OUT_FOR_DELIVERY | DELIVERED` rozstrzyga
      po `FulfillmentType`. Naruszenie → `ApiException.unprocessable` → 422
      (AD-017). **29 testów jednostkowych enuma** (`OrderStatusTransitionTest`)
      pokrywają wszystkie legalne przejścia + wszystkie zabronione (terminale,
      skoki, fulfillment-mismatch)
    - DTOs w `order.api.dto.admin.*`: `AdminOrderListItemDto` (light),
      `AdminOrderDto` (full + items + history + address), `AdminOrderStatus-
      HistoryDto`, `UpdateOrderStatusRequest` (`@NotNull version`), `Update-
      OrderEtaRequest` (`@NotNull version`, `@Min(0) @Max(480) minutesFromNow`),
      `AdminDashboardSummaryDto`
    - `AdminOrderQueryService` — list z filtrami (status, fulfillmentType,
      dateFrom/dateTo półotwarty przedział `Europe/Warsaw`), get-by-id
      z `@EntityGraph`, dashboard summary (3 liczniki)
    - `OrderStatusService` (`@Transactional`) — `changeStatus(id, request)`:
      load → `assertVersion` → `canTransitionTo` → zapis status + wpis
      `OrderStatusHistory(changedBy = admin email z SecurityContext)` →
      `saveAndFlush` (żeby `@Version` bumpnęło przed mapowaniem do DTO —
      inaczej response wraca ze stale version i kolejny PATCH 409). Drugi
      entry-point `updateEta(id, request)` bez state machine, tylko version
      check
    - `OrderRepository.findAllFiltered(status, ft, from, to, Pageable)`
      z NULL-checkami w `@Query` (pattern z `ProductRepository`) +
      3 metody `countBy...` dla dashboard summary
    - Endpointy (`@PreAuthorize("hasRole('ADMIN')")`):
      - `GET /api/admin/orders` — pagination + filtry, size=20 default,
        sort=placedAt DESC
      - `GET /api/admin/orders/{id}` → 404 gdy brak
      - `PATCH /api/admin/orders/{id}/status`, `PATCH /api/admin/orders/{id}/eta`
      - `GET /api/admin/dashboard/summary` (osobny `AdminDashboardController`)
    - Konflikt wersji → `OptimisticLockingFailureException` → 409 przez
      istniejący `GlobalExceptionHandler` (AD-009). Bez nowych hotfixów
      exception handlera
    - **Brak nowej migracji** — `etaMinutes` (Integer) istnieje od `V7__orders.sql`
      Fazy 3. Pole semantycznie = "minuty od teraz" w momencie zapisu;
      tracking DTO ma to interpretować jako stałą etykietę (świadomie,
      wariant A z planu)
  - Frontend CORE:
    - shadcn primitives: `Badge`, `Table` (Radix namespace, bez per-primitive deps)
    - `shared/lib/formatDate.ts` — `formatDateTime(iso)` z `Intl.DateTimeFormat
      ('pl-PL', {dateStyle:'short', timeStyle:'short'})`. `TrackingPage`
      celowo nie ruszany (ma własny inline Intl)
    - `shared/api/orderApi.ts` — typy `AdminOrderListItemDto`, `AdminOrderDto`,
      `AdminOrderStatusHistoryDto`, `PaginatedResponse<T>` + funkcje `fetch-
      AdminOrders`, `fetchAdminOrderById`, `updateOrderStatus`, `updateOrderEta`,
      `fetchDashboardSummary`
    - `features/admin/dashboard/DashboardPage.tsx` + `components/KpiTile.tsx` —
      3 kafelki ("Nowe dziś" → `?status=NEW`, "W przygotowaniu" → filtr
      `CONFIRMED|IN_PREPARATION`, "Do dostawy" → filtr `READY|OUT_FOR_DELIVERY`).
      Każdy klik w kafelek → nawigacja do `/admin/orders` z prefiltrem przez
      URL query params. Dashboard polling 15s
    - `features/admin/orders/OrdersListPage.tsx` — toolbar z filtrami (Select
      status, Select fulfillment, 2 × `<input type="date">`), stan filtrów
      w URL przez `useSearchParams` (refresh + share-link działają), Table
      z kolumnami (numer, data, klient, fulfillment, status Badge, total,
      CTA "Szczegóły"), paginacja prev/next + "Strona X z Y", empty state.
      **Polling 10s** (`refetchInterval: 10_000`, `refetchIntervalInBackground:
      false`)
    - `features/admin/orders/OrderDetailPage.tsx` — header z badge + placedAt +
      fulfillmentType + paymentMethod, karty Klient / Adres dostawy
      (warunkowo) / Pozycje (ze snapshotami i dodatkami) / ETA (dialog
      z presetami 15/30/45/60 min + własna liczba) / Akcje statusu (przyciski
      tylko dozwolonych przejść, mirror state machine z `lib/transitions.ts`)
      / Historia statusów (timeline z `changedAt` + `changedBy`). Akcja
      "Anuluj zamówienie" w osobnym wariancie `destructive` z potwierdzeniem
      w Dialogu. Mutacje invalidują `["admin","orders","detail", id]` +
      `["admin","orders","list"]`. Polling detail 10s. 409 → toast "Ktoś
      inny zmienił zamówienie. Odśwież." + invalidate; 422 → toast
      z `extractProblem(err).detail`
    - `lib/transitions.ts` — FE mirror state machine z `OrderStatus.java`
      (AD-017). Używany **wyłącznie do UI** — backend jest ostateczną bramką
    - `OrderStatusBadge.tsx` — mapping status → kolor + label PL
    - `AdminLayout.navItems` dostał link **Zamówienia** pod `/admin/orders`;
      dashboard placeholder z Fazy 1 podmieniony na realny `DashboardPage`
  - Backend STRETCH (SSE):
    - `com.pizzashowcase.realtime` — nowy pakiet:
      - `SseEmitterRegistry` — `ConcurrentHashMap<UUID, SseEmitter>`, daemon
        `ScheduledExecutorService` heartbeat 25s fixed rate, cleanup na
        `onCompletion/onTimeout/onError`, `broadcast()` usuwa emitery które
        rzuciły IOException przy send
      - `SseEventEnvelope(String type, Object payload)` — JSON shape dla
        klienta (`{type, payload}`)
      - `SseEventBroadcaster` z `@Async` + `@TransactionalEventListener
        (phase = AFTER_COMMIT)` na `OrderCreatedEvent` i `OrderStatusChanged-
        Event`. Broadcast **po commicie** i off-thread — failure SSE nie
        roluje business transakcji
      - `RealtimeConfig` z `@EnableAsync`
      - `SseAdminController` — `GET /api/admin/orders/stream` (produces
        `text/event-stream`, `@PreAuthorize("hasRole('ADMIN')")`, timeout
        30min, wysyła `READY` po zarejestrowaniu emitera)
    - `order.application.event.*` — dwa recordy: `OrderCreatedEvent(id,
      orderNumber, total, placedAt)` publikowany przez `CheckoutService`
      na końcu `placeOrder`, `OrderStatusChangedEvent(id, orderNumber,
      newStatus)` publikowany przez `OrderStatusService.changeStatus`
      (nie przez `updateEta` — ETA nie jest zmianą statusu)
    - `JwtAuthenticationFilter` — refaktor do helpera `extractToken(request)`:
      najpierw `Authorization: Bearer`, potem — **tylko dla `/api/admin/
      orders/stream`** — query param `?token=`. Surface pojedynczej ścieżki,
      zero luzowania auth gdzie indziej (AD-018)
  - Frontend STRETCH (SSE):
    - `features/admin/realtime/useAdminOrderFeed.ts` — hook (`useEffect`):
      otwiera `new EventSource(/api/admin/orders/stream?token=${jwt})`,
      listenery per event type:
        - `READY` → reset backoff
        - `ORDER_CREATED` → invalidate `["admin","orders","list"]` +
          `["admin","dashboard","summary"]`, `toast.success("Nowe zamówienie:
          {orderNumber}")`, `if (getSoundEnabled()) playBeep()`
        - `ORDER_STATUS_CHANGED` → invalidate list + `["admin","orders",
          "detail", orderId]`
      reconnect z exponential backoff (1s → 2s → … cap 30s), cleanup
      w useEffect teardown. Token czytany przez `useAuthStore.getState()` —
      świeży przy każdym `connect()`
    - `features/admin/realtime/soundPrefs.ts` — localStorage key `admin-sounds-
      enabled` (default true), lazy module-level `AudioContext`,
      `playBeep()` = 880 Hz sine + gain envelope (0.0001 → 0.3 → 0.0001,
      0.2s total). Gate na `ctx.state === "suspended"` → `ctx.resume().then
      (start)`. Silent no-op przy blokadzie autoplay
    - `features/admin/realtime/SoundToggle.tsx` — Button ghost z ikonami
      `Volume2`/`VolumeX` (lucide-react), toggle persistuje w localStorage,
      onClick `playBeep()` gdy włączamy (primuje AudioContext pod
      user gesture). PL aria-label/title
    - `AdminLayout` montuje `useAdminOrderFeed()` raz (globalne) i renderuje
      `<SoundToggle />` w headerze przed przyciskiem "Wyloguj". Fallback:
      polling 10s z CORE dalej działa — brak ręcznego downgrade'u
    - **Smoke e2e (M13):** SSE-stream po loginie: `READY` < 100ms, `ORDER_
      CREATED` 193ms po POST zamówienia, `ORDER_STATUS_CHANGED` 181ms po
      PATCH statusu, heartbeat `:hb` co ~25s. Obie latencje znacznie poniżej
      progu <1s z planu
  - **M10 smoke hotfixy:**
    - `OrderStatusService.changeStatus` przeszedł na `saveAndFlush(order)`
      żeby `@Version` bumpnęło przed mapowaniem do DTO. Bez flusha klient
      dostawał stale `version=N` w response i następny PATCH kończył się
      409. Druga linia obrony (spójna z AD-009)
    - `OrderStatusHistory.changedAt` był ustawiany w PrePersist, w response
      DTO wracał `null` bezpośrednio po mutacji. Fix: konstruktor `new
      OrderStatusHistory(status, Instant.now(), changedBy)` ustawia pole
      jawnie, PrePersist tylko no-op fallback
  - Commity: milestone per krok (M1-M5 backend CORE, M6-M10 frontend CORE,
    M11 SSE backend, M12 SSE frontend, M13 smoke + M10 hotfixes, M14 docs)

## Faza 5 — Polish + Deploy (DONE kod; Railway deploy ostatni krok manualny)
- **Cel**: dowiezc showcase do stanu gotowego pod HTTPS, zalatac deploy-blockery
  z review Fazy 4 i carry-over z Faz 1-3, dopisac dokumentacje umozliwiajaca
  rebrandig + deploy przez nowego dev w <30 min.
- **Branch**: `phase-5`. Milestony:
  - **M1** prod profile, SPA fallback (`ErrorViewResolver` +
    `GlobalExceptionHandler.handleNoResource`), JSON logs
    (`logstash-logback-encoder`), graceful shutdown, `server.tomcat.accesslog.enabled=false`
    (BUG-1 mitigation). Commit `98f45c9`.
  - **M2** multi-stage Dockerfile (node:20-alpine → JDK 21 jammy → JRE 21
    jammy), `SecurityConfig` `anyRequest().permitAll()` dla SPA fallback
    (route auth zachowana na `/api/admin/**` + `/api/**`),
    `GlobalExceptionHandler.handleNoResource` → forward `/index.html` dla
    `Accept: text/html`. Commit `e76a9f5`.
  - **M4** Carry-over tech debt z Faz 3-4: `deliveryAddress.notes` Zod
    200→255 (alignment z BE Bean Validation), `Locale.ROOT` w
    `CheckoutService.normalizeEmail`, `setScale(2, HALF_UP)` na
    `lineTotal`/`subtotal`/`total`, ETA terminal guard (422
    gdy DELIVERED/CANCELED), `ThreadPoolTaskExecutor` (core=2, max=4,
    queue=50, `CallerRunsPolicy`) jako `@Bean("taskExecutor")`. Commit `b2f3b79`.
  - **M5 BE** Rate limit `GET /api/admin/orders/stream` → 30 req/min/IP.
    Commit `3c3d7ba`.
  - **M5 FE** BUG-9: skeletony w `OrdersListPage` (5-wierszowa tabela) +
    `OrderDetailPage` (4 karty). Nowy `Skeleton` primitive w
    `shared/components/ui`. Commit `62a18ce`.
  - **M6/1** globalny `ErrorBoundary` (class component, fallback UI z
    `<a href="/">`, dev-only stack trace) wokol `<Routes>` w
    `providers.tsx`. Commit `681cf7d`.
  - **M6/2** `useIsRestaurantOpen` hook (`Intl.DateTimeFormat` strefa
    `Europe/Warsaw`, fail-open gdy brak godzin) + `CheckoutPage` banner +
    disabled CTA gdy zamkniete. Commit `59a0152`.
  - **M6/3** OSM iframe map na `ContactSection` (Nominatim geocoding
    client-side, staleTime Infinity, bez Leaflet, fallback na adres
    tekstowy gdy geokodowanie failuje). Commit `37cb160`.
  - **M7** SEO: `SeoHead` komponent (direct DOM, bez react-helmet)
    aktualizuje `document.title`, `meta description`, OG tags (`og:title`,
    `og:description`, `og:image`, `og:type=website`) z
    `RestaurantSettings`. Favicon inline SVG emoji pizza w `index.html` +
    fallback `public/favicon.svg`. `public/manifest.json` z
    `theme_color=#E11D48`. Commit `aa71c94`.
  - **M8** Dokumentacja: `README.md` refresh (quickstart <30 min,
    weryfikacja URLs, build Docker), `docs/customization.md` NEW (panel
    admin + V100/V101 seeds + favicon/manifest swap + env vars),
    `docs/deployment.md` NEW (Railway 6 krokow + troubleshooting).
- **Akceptowalny tech debt (nie zrobione w Fazie 5, na ROADMAP):**
  - SSE AD-018 query-param auth → httpOnly cookie (mitigacja:
    access log wylaczony; Railway proxy moze nadal logowac URL).
  - BUG-5 SSE reconnect retry cap + `disconnected` state.
  - Code splitting per route (`React.lazy` dla `/admin/*`).
  - Seed V100/V101 gate po profilu / env var — showcase CELOWO deployuje
    z demo contentem, notka w deployment.md dla clean-start.
  - Framer Motion transitions na drawer/modal/public routes — Tier 3,
    wyciete pod presja czasu.
  - Mobile 375px audit per-ekran — Tier 3, zalozenie: istniejacy Tailwind
    responsywny design wystarcza pod demo.
  - Admin orders table card-view dla `<md` — Tier 3.
  - Mapa: zamiast lat/lon migracji → Nominatim runtime geokoding (brak
    dodatkowych kolumn, brak BE zmian).
- **Definition of done (PHASES.md:225-229):**
  - [x] Kod gotowy pod HTTPS (Dockerfile multi-stage, prod profile, SPA
    fallback, JSON logs, graceful shutdown, rate limit SSE, ETA guard).
  - [x] README quickstart <30 min (6 krokow od clone → localhost:5173).
  - [x] Customization + deployment docs (rebranding + Railway w <30 min).
  - [ ] Live URL pod HTTPS — **czeka na manualny deploy Railway** (M3
    planu pominiety na prosbe usera; kod jest gotowy).
  - [ ] End-to-end demo na live URL — do zrobienia po deploy.

## Fazy zaplanowane
Wszystkie fazy MVP (0-5) zamkniete w kodzie. Railway deploy to ostatni
manualny krok — patrz [deployment.md](./deployment.md).

## Aktualne ostrzeżenia / tech debt świadomie zaakceptowany
- Host ma JDK 25 — produkcyjny toolchain to JDK 21 (foojay auto-provision).
  Obraz deploy w Fazie 5 wymusi JDK 21.
- Rate limit w pamięci (ConcurrentHashMap) — wystarcza dla MVP single-instance.
  Multi-instance w post-MVP: Bucket4j + Redis lub distributed bucket.
- `RestaurantSettings` nie ma fallbacku na brak rekordu — `V100` gwarantuje
  rekord, ręczny DELETE zakończy się 404 na publicznym GET. Zgodnie z planem.
- CRLF w całym repo (Windows) — nie ingerujemy, Flyway i JVM OK.
- V100__seed_demo.sql nie jest ogejtowana profilem — na Railway w Fazie 5
  odpali demo content w produkcji. **TODO Faza 5 (deploy):** przenieść do
  profilu dev (np. `flyway.locations: classpath:db/migration, classpath:db/demo`
  tylko w `application-dev.yml`) albo dodać gate po env var
  `SEED_DEMO_DATA=true`.
- AdminUserSeeder ma teoretyczne okno TOCTOU (`existsByEmailIgnoreCase` +
  `save`). UNIQUE index na `LOWER(email)` (V4) wyłapie duplikat w DB —
  seedowanie wykona się raz, drugi start wyloguje błąd z DataIntegrityViolation.
  Bez znaczenia przy single-instance deploy, akceptowany tech debt.
- **`OrderConfirmationPage` nie persistuje `trackingToken`** — refresh strony
  = brak przycisku śledzenia (by design, AD-007: token to publiczny secret-
  link). Fallback message informuje, że zamówienie zostało zapisane.
  Alternatywy (email z linkiem, localStorage) — post-MVP.
- **Brak auto-highlightu niedostępnej pozycji w `CartDrawer` przy 422**
  z checkoutu. Serwis zwraca RFC 7807 `detail` ("Produkt 'X' nie jest już
  dostępny"), frontend pokazuje toast. User musi sam zlokalizować i usunąć
  wadliwą linię. Do dodania w Fazie 5 polish (mapowanie errors → lineKey).
- **Frontend bundle bez code splittingu** — 690 kB / 205 kB gzip dla
  całej aplikacji (public + admin). Vite ostrzega o chunkach >500 kB.
  Akceptowalne dla MVP; code-split per route (`React.lazy` dla `/admin/*`)
  planowany w Fazie 5 (Polish + Deploy).

### Tech debt z review Fazy 3 (świadomie zaakceptowany)
- **BUG-3: Zod/Bean validation desync na `deliveryAddress.notes`** — frontend
  Zod ma `max(200)`, backend Bean `@Size(max=255)` na uwagach do adresu.
  Niezgodność niewidoczna dla usera (FE złapie pierwsze), ale dryf
  walidacji do naprawy przy najbliższym dotknięciu `CheckoutPage.tsx` —
  ujednolicić na 255 (matchować BE) lub 200 po obu stronach.
- **Double-submit bez idempotency key** — `POST /api/public/orders` nie
  ma deduplikacji po stronie serwera. FE disabluje przycisk podczas
  `mutation.isPending`, więc w UI realnie nie da się dwa razy kliknąć.
  Akceptowalne dla MVP; pełen idempotency-key (`Idempotency-Key` header
  + dedup table) post-MVP gdy pojawią się retry'e z mobile/sieci flaky.
- **Adres dostawy widoczny przez secret-link tracking token** —
  `GET /api/public/orders/track/{token}` zwraca `deliveryAddress` (street,
  city, postalCode), żeby user widział co zamówił. Token to UUID v4
  (122 bity entropii, nieprzewidywalny), więc ryzyko enumeration
  zaniedbywalne. PII w pełni: telefon, email, customerNotes — celowo
  **nie** zwracane (AD-007). Akceptowane ryzyko świadomie; w post-MVP
  można rozważyć skrócenie adresu (tylko miasto) po przejściu w
  status terminalny.
- **Brak React `ErrorBoundary` na poziomie aplikacji** — runtime error
  w którymkolwiek komponencie public/admin owocuje białym ekranem
  (Vite domyślnie). Planowane w Fazie 5 (Polish + Deploy) — global
  boundary z fallback UI + opcjonalnie Sentry/console error reporting.
- **Mikro-bugi LOW (Faza 5 polish):**
  - `BigDecimal` arytmetyka w `CheckoutService` bez jawnego
    `setScale(2, HALF_UP)` na `lineTotal`/`subtotal` — Postgres `NUMERIC(10,2)`
    truncate'uje przy persiście, ale liczby wracające w response mogą
    mieć więcej miejsc niż 2.
  - `String.toLowerCase()` bez `Locale.ROOT` w paru miejscach (slug
    generator i email comparison już mają, ale audit pełny do zrobienia).
  - Część kontrolerów używa `consumes/produces` domyślnych Springa zamiast
    jawnie `MediaType.APPLICATION_JSON_VALUE` — content negotiation
    działa, ale eksplicytnie czytelniej.

### Tech debt z Fazy 4 (świadomie odłożony)
- **SSE token w query param `?token=...`** (AD-018) — akceptowalne dla
  showcase/demo, do migracji na httpOnly cookie przy wdrożeniu
  produkcyjnym. Token trafia do Referer / logów proxy / URL historii;
  `EventSource` nie wspiera niestandardowych nagłówków, stąd kompromis.
- **Brak skalowania SSE na wiele instancji** — `SseEmitterRegistry`
  trzyma emitery in-memory (`ConcurrentHashMap`); broadcast dociera tylko
  do klientów podpiętych do tego samego JVM. Railway w MVP = 1 instancja,
  więc realnie bez wpływu. Skalowanie horyzontalne wymaga Redis pub/sub
  (lub podobnego fan-out) — post-MVP.
- **Admin orders table: brak card-view dla `<md`** — na mobile tabela
  scrolluje się poziomo (`overflow-x-auto`). Świadoma decyzja: admin
  realnie pracuje z desktopa / tabletu, mobile-obsługa zamówień nie
  jest user story Fazy 4. Card-view per wiersz dla `<md` — odłożone,
  można dodać w Fazie 5 jeśli okaże się potrzebne w demo.

### Tech debt z review Fazy 4 (dopisane po akceptacji)
- **BUG-1 DEPLOY BLOCKER: JWT w Tomcat access logu przez SSE query param** —
  `GET /api/admin/orders/stream?token=<JWT>` trafia do domyślnego access
  log patternu Tomcata razem z całym query stringiem. Token ma 12h TTL,
  więc log = potencjalny leak długożyjącego secretu. **Przed deploy
  Fazy 5 wymagane jedno z:** (a) maskowanie query w access log pattern
  (custom `AccessLogValve` z regex `token=[^&]*` → `token=***`), lub
  (b) migracja AD-018 na httpOnly cookie (i zdjęcie query-param fallbacku
  z `JwtAuthenticationFilter.extractToken`). Opcja (a) tańsza, (b)
  czystsza architektonicznie.
- **BUG-2/3: SSE threading defaults** — `SseEmitterRegistry` używa
  `Executors.newSingleThreadScheduledExecutor()` dla heartbeatu (jeden
  wątek obsługuje heartbeaty wszystkich emiterów; blokada na write zatrzyma
  kolejne ticki), a `@EnableAsync` bez własnego `TaskExecutor` = Spring
  domyślnie używa `SimpleAsyncTaskExecutor` (wątek per event, bez
  poolingu). Akceptowalne dla MVP (1-2 adminów online, sporadyczne eventy).
  Post-MVP: `ThreadPoolTaskScheduler` dla heartbeatu + `ThreadPoolTask-
  Executor` jako `@Primary` dla `@Async`.
- **BUG-5: SSE reconnect bez limitu prób** — `useAdminOrderFeed` ma
  exponential backoff (1s→2s→…cap 30s) ale nieskończoną liczbę prób.
  Przy trwałym 401/backend down generuje log noise (toast nie, bo
  `onerror` jest silent). Do dodania: licznik prób + stan `disconnected`
  po np. 10 nieudanych + CTA "Odśwież stronę" w UI.
- **BUG-7: ETA ustawialne na DELIVERED/CANCELED** — backend
  `OrderStatusService.updateEta` nie sprawdza statusu, pozwala zapisać
  `etaMinutes` na zamówieniu terminalnym. UX nit: w panelu admin ETA
  na dostarczonym zamówieniu nie ma sensu. Fix: w service guard
  `if (order.getStatus().isTerminal()) throw unprocessable(...)` i
  ukrycie przycisku "Ustaw ETA" w `OrderDetailPage` gdy status terminalny.
- **BUG-9: loading text zamiast skeletona** — `OrdersListPage` i
  `OrderDetailPage` pokazują `"Ładowanie..."` jako plain text podczas
  initial fetch (tracking/menu mają już skeletony). Do wyrównania
  w Fazie 5 polish — skeleton table (5 wierszy) dla listy, skeleton
  cards dla detalu.
- **Rate limit brak na `GET /api/admin/orders/stream`** — `RateLimit-
  Filter` ma reguły na `POST /api/auth/login` i `POST /api/public/orders`,
  ale SSE stream jest auth-gated przez JWT (ROLE_ADMIN) bez dodatkowego
  limitu otwartych połączeń per IP. W praktyce admin otwiera 1 EventSource
  per karta, ale nic nie chroni przed użytkownikiem z ukradzionym tokenem
  otwierającym 1000 połączeń. Dorzucić regułę (np. `GET
  /api/admin/orders/stream` → 10 req/min/IP) w Fazie 5.

## Następne kroki
Faza 5 (Polish + Deploy) zamknięta w kodzie — wszystkie deploy-blockery
(BUG-1 access log, ETA guard, @Async pool, SSE rate limit) oraz carry-over
tech debt (notes align, Locale.ROOT, setScale, ErrorBoundary, skeletony)
rozwiązane. Pozostaje **manualny deploy na Railway** wg
[deployment.md](./deployment.md):
1. Utworzyć projekt Railway + Postgres plugin.
2. Dodać serwis z GitHub repo (branch `main` po mergu `phase-5`).
3. Ustawić env vars (`JWT_SECRET` wygenerowany `openssl rand -base64 48`,
   `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS` na Railway URL,
   `SPRING_PROFILES_ACTIVE=prod`, `DB_*` z refs `${{Postgres.*}}`).
4. Healthcheck `/actuator/health`.
5. Smoke: `/api/public/settings`, złożenie zamówienia public + obsługa
   admin, tracking polling.

Post-MVP (ROADMAP.md): SSE httpOnly cookie (AD-018 migracja), code
splitting per route, Framer Motion transitions, mobile 375px audit,
admin table card-view, seed V100/V101 gate po profilu.
