# Pizza Showcase

Premium showcase/template web app dla branzy gastronomicznej.
Single-tenant, Spring Boot 3 + React 18.

## Szybki start (lokalnie)

### Wymagania
- Java 21 (np. Temurin 21)
- Node 20+ (Node 22 LTS zalecany)
- Docker + docker-compose (do lokalnej bazy Postgres)

### Uruchomienie
1. Sklonuj repo i przejdz do katalogu projektu.
2. Skopiuj `.env.example` do `.env`:
   - Wygeneruj `JWT_SECRET`: `openssl rand -base64 48` (min 64 znaki).
   - Ustaw `ADMIN_EMAIL` / `ADMIN_PASSWORD` (konto seed-owanego admina).
   - Reszta (DB_*, CORS_ALLOWED_ORIGINS) pasuje do docker-compose out-of-the-box.
3. Uruchom baze: `docker-compose up -d`
4. Uruchom backend: `cd backend && ./gradlew bootRun`
   - Pierwsze uruchomienie pobierze JDK 21 przez foojay toolchain resolver,
     odpali migracje Flyway V1-V7 oraz seedy V100 (Pizza Demo) i V101 (menu).
5. W osobnym terminalu uruchom frontend: `cd frontend && npm install && npm run dev`
6. Otworz http://localhost:5173

### Weryfikacja
- Frontend (landing + menu + checkout): http://localhost:5173
- Backend health: http://localhost:8080/actuator/health → `{"status":"UP"}`
- Public settings: http://localhost:8080/api/public/settings
- Admin panel: http://localhost:5173/admin/login (uzyj ADMIN_EMAIL / ADMIN_PASSWORD z `.env`)
- Adminer (DB): http://localhost:8081 (system: PostgreSQL, server: postgres,
  user/pass/db: pizza)

### Build produkcyjny (Docker)
```
docker build -t pizza-showcase .
docker run --env-file .env -p 8080:8080 pizza-showcase
```
Obraz multi-stage (node → JDK 21 → JRE 21) pakuje frontend jako classpath
resource w fat-jar Spring Boot; SPA fallback obsluguje deep-linki React Routera.

## Dokumentacja
- [CLAUDE.md](./CLAUDE.md) - konstytucja projektu (dla Claude Code)
- [docs/PHASES.md](./docs/PHASES.md) - plan faz MVP (0-5)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - decyzje architektoniczne (AD-001..AD-018)
- [docs/ROADMAP.md](./docs/ROADMAP.md) - post-MVP roadmap
- [docs/QA_CHECKLIST.md](./docs/QA_CHECKLIST.md) - checklista review
- [docs/CURRENT_STATE.md](./docs/CURRENT_STATE.md) - aktualny stan projektu
- [docs/customization.md](./docs/customization.md) - jak podmienic marke pod nowego klienta
- [docs/deployment.md](./docs/deployment.md) - jak zdeployowac na Railway
