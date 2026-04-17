# QA_CHECKLIST.md

Checklista używana podczas review każdej fazy. Claude Code przechodzi przez
listę punkt po punkcie, oddając PASS / FAIL / N-A dla każdego.

## Backend — warstwa API

- [ ] Każdy endpoint ma walidację wejścia (@Valid + Bean Validation)
- [ ] Każdy endpoint zwraca DTO, nigdy encja JPA w response
- [ ] Paginacja tam, gdzie listy mogą urosnąć (zamówienia, produkty)
- [ ] Error response przez globalny @RestControllerAdvice (format RFC 7807)
- [ ] Rate limiting na endpointach publicznych (/api/public/orders, /login)
- [ ] Endpointy chronione rolą ADMIN (/api/admin/**)
- [ ] CORS skonfigurowany przez env var na konkretny origin
- [ ] OpenAPI w profilu dev działa (/swagger-ui)

## Backend — warstwa domenowa

- [ ] State machine transitions (OrderStatus) pokryte, nielegalne — 422
- [ ] Transakcje (@Transactional) tam, gdzie są multi-step operations
  (checkout, zmiana statusu + historia)
- [ ] Optimistic locking (@Version) na encjach edytowalnych konkurencyjnie
  (Order)
- [ ] Snapshoty cen/nazw tam, gdzie historia nie może się zmienić
  (OrderItem, OrderItemAddon)
- [ ] Brak N+1 queries (JOIN FETCH / @EntityGraph na kluczowych endpointach)
- [ ] publicTrackingToken jako UUID v4 (nie sekwencyjne)
- [ ] Generator orderNumber atomowy (sekwencja w bazie)
- [ ] Ceny liczone PO STRONIE SERWERA (nie z payloadu klienta)

## Backend — bezpieczeństwo

- [ ] Hasła: BCrypt strength 12
- [ ] JWT secret z env var (JWT_SECRET), nigdy w kodzie
- [ ] JWT payload: minimalne info (userId, role) bez PII
- [ ] JWT expiration max 12h
- [ ] CORS na konkretne origin (env var), nie wildcard
- [ ] SQL injection: tylko parameterized queries / Spring Data (brak
  string concatenation)
- [ ] Tracking endpoint zwraca tylko bezpieczne pola (bez telefonu klienta)
- [ ] Endpointy admin wymagają role ADMIN (403 gdy brak)

## Frontend

- [ ] Każdy ekran testowany w 375px (mobile-first)
- [ ] Loading states: skeletony zamiast spinnerów dla list
- [ ] Empty states dla list (pusty koszyk, brak zamówień)
- [ ] Walidacja formularzy Zod schema = walidacja backendu
- [ ] Error boundaries na głównych widokach
- [ ] Touch targets min. 44x44px (buttony, linki)
- [ ] Kontrast WCAG AA
- [ ] Zero hardcoded contentu (nazwa restauracji, kolory, godziny) w JSX
- [ ] Theme loader wczytuje CSS variables z /api/public/settings przy starcie
- [ ] TanStack Query refetch on focus włączone tam gdzie ma sens
- [ ] Sticky bottom bar koszyka na mobile w części public

## Regresja (sprawdzać od Fazy 2 w górę)

- [ ] Flow z Fazy 1: login admina, edycja settings → frontend się aktualizuje
- [ ] Flow z Fazy 2 (od Fazy 3): wyświetlanie menu, CRUD menu w panelu
- [ ] Flow z Fazy 3 (od Fazy 4): składanie zamówienia end-to-end
- [ ] Flow z Fazy 4 (od Fazy 5): lista zamówień admin, zmiana statusu
- [ ] Żaden poprzedni endpoint nie zwraca 500 po zmianach w bieżącej fazie

## Scope

- [ ] Wykonane zgodnie z Definition of Done aktualnej fazy w PHASES.md
- [ ] Brak elementów spoza scope'u (lista "NIE ruszać jeszcze" respektowana)
- [ ] Brak pustych interfejsów / abstrakcji "na przyszłość"
- [ ] Commity mają sensowne wiadomości
