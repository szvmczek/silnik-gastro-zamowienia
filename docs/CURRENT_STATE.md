# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak. Faza 2 zakończona, oczekiwanie na prompt Fazy 3 (Cart + Checkout + Order + Tracking).

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

## Fazy zaplanowane
- [ ] Faza 3: Cart + Checkout + Order + Tracking
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

## Następne kroki
Użytkownik wkleja prompt Fazy 2 (Menu).
