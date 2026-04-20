# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak. Faza 3 **DONE**, oczekiwanie na prompt Fazy 4 (Admin Orders + polling).

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

## Fazy zaplanowane
- [ ] Faza 4: Admin Orders + polling (SSE stretch)
- [ ] Faza 5: Polish + Deploy

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

## Następne kroki
Użytkownik wkleja prompt Fazy 4 (Admin Orders + polling, SSE stretch).
