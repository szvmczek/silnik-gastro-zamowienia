# Pizza Showcase

Premium showcase/template web app dla branzy gastronomicznej.
Single-tenant, Spring Boot 3 + React 18.

## Szybki start (lokalnie)

### Wymagania
- Java 21 (np. Temurin)
- Node 20+
- Docker + docker-compose

### Uruchomienie
1. Skopiuj `.env.example` do `.env` i ustaw wartosci (szczegolnie JWT_SECRET
   przed Faza 1).
2. Uruchom baze: `docker-compose up -d`
3. Uruchom backend: `cd backend && ./gradlew bootRun`
4. W osobnym terminalu uruchom frontend: `cd frontend && npm run dev`
5. Otworz http://localhost:5173

### Weryfikacja
- Backend: http://localhost:8080/api/ping powinien zwrocic `{"status":"ok"}`
- Adminer (DB): http://localhost:8081 (system: PostgreSQL, server: postgres,
  user/pass/db: pizza)
- Frontend: http://localhost:5173

## Dokumentacja
- [CLAUDE.md](./CLAUDE.md) - konstytucja projektu (dla Claude Code)
- [docs/PHASES.md](./docs/PHASES.md) - plan faz MVP
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - decyzje architektoniczne
- [docs/ROADMAP.md](./docs/ROADMAP.md) - post-MVP roadmap
- [docs/QA_CHECKLIST.md](./docs/QA_CHECKLIST.md) - checklista review
- [docs/CURRENT_STATE.md](./docs/CURRENT_STATE.md) - aktualny stan projektu
