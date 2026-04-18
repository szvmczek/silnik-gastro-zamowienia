# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak. Faza 1 zakończona, oczekiwanie na prompt Fazy 2 (Menu).

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

## Fazy zaplanowane
- [ ] Faza 2: Menu
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

## Następne kroki
Użytkownik wkleja prompt Fazy 2 (Menu).
