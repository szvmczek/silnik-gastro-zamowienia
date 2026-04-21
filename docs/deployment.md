# Deployment — Railway

Target deploy: Railway (https://railway.app). Jeden serwis aplikacji
(Dockerfile multi-stage) + jeden plugin PostgreSQL. HTTPS out-of-the-box.

## Prerekwizyty

- Konto Railway (darmowe tier wystarczy na showcase).
- Repo na GitHub z branchem `main` (lub innym deploy branchem).
- Wygenerowany `JWT_SECRET` — min 64 znaki: `openssl rand -base64 48`.

## Krok 1: Utworz projekt Railway

1. Zaloguj sie na https://railway.app.
2. `New Project` → `Empty Project`.
3. Nazwij projekt (np. `pizza-showcase-klient-X`).

## Krok 2: Dodaj plugin PostgreSQL

1. W projekcie: `+ New` → `Database` → `Add PostgreSQL`.
2. Railway wstrzyknie automatycznie zmienne `DATABASE_URL`, `PGUSER`,
   `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` w namespace plugina
   (dostepne jako `${{Postgres.*}}` w innych serwisach projektu).
3. Flyway odpali migracje V1-V7 + V100 / V101 przy pierwszym starcie
   aplikacji. Sprawdz logi po deploy.

## Krok 3: Dodaj serwis z GitHub repo

1. W projekcie: `+ New` → `GitHub Repo` → autoryzuj dostep i wybierz repo.
2. Ustaw `Branch`: `main` (albo inny branch deployowy).
3. Railway wykryje `Dockerfile` w root i odpali multi-stage build
   (node:20-alpine → eclipse-temurin:21-jdk-jammy → 21-jre-jammy).
4. `Settings` → `Build` → potwierdz, ze builder = `Dockerfile` (nie Nixpacks).

## Krok 4: Env vars na serwisie aplikacji

`Settings` → `Variables` → dodaj:

| Zmienna | Wartosc |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `JWT_SECRET` | wygeneruj `openssl rand -base64 48` (min 64 znaki) |
| `ADMIN_EMAIL` | email dla pierwszego logowania (np. `admin@klient.pl`) |
| `ADMIN_PASSWORD` | haslo dla pierwszego logowania (zmien po pierwszym logu) |
| `CORS_ALLOWED_ORIGINS` | URL frontu (po nadaniu custom domain: `https://twoja-domena.pl`, do czasu: Railway-assigned `https://xxx.up.railway.app`) |
| `DB_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `PORT` | `8080` (Railway ustawia automatycznie, ale warto jawnie) |

**Uwaga o seed data:**
Migracje `V100__seed_demo.sql` i `V101__seed_menu.sql` odpala sie
**rowniez w produkcji** (brak gatingu po profilu). Znaczy to, ze swieza
instancja Railway ruszy z demo menu "Pizza Demo". Jesli klient chce
czysty start:
- Przed pierwszym deploy usun `V100__seed_demo.sql` i `V101__seed_menu.sql`,
  albo
- Po pierwszym deploy zaloguj sie do Adminer / Postgres (`railway run psql`)
  i wyczysc tabele `products`, `product_variants`, `addon_groups`, `addons`,
  `categories` + zaktualizuj `restaurant_settings`.

## Krok 5: Healthcheck

`Settings` → `Deploy` → `Health Check Path`: `/actuator/health`

Railway restartuje kontener gdy endpoint zwroci !=200 przez uzywany
timeout (domyslnie 300s start grace + health checks co 10s). Spring
Boot `/actuator/health` wraca `{"status":"UP"}` gdy DB + liveness OK.

## Krok 6: Custom domain (opcjonalnie)

1. `Settings` → `Networking` → `Custom Domain` → wpisz `twoja-domena.pl`.
2. Railway pokaze rekord CNAME. Ustaw u rejestratora domeny:
   - `CNAME pizza.twoja-domena.pl` → `xxx.up.railway.app`
3. Poczekaj na propagacje DNS (do 10 min), Railway automatycznie
   wystawi certyfikat Let's Encrypt.
4. Po aktywacji custom domain, **zaktualizuj `CORS_ALLOWED_ORIGINS`** na
   nowa domene i zredeployuj.

## Post-deploy smoke

Po pierwszym deploy (lub redeployu po zmianie env vars):

1. `https://<railway-url>/actuator/health` → `{"status":"UP"}`
2. `https://<railway-url>/api/public/settings` → JSON z `RestaurantSettings`
3. `https://<railway-url>/` → landing page z menu
4. `/admin/login` → zaloguj z `ADMIN_EMAIL` / `ADMIN_PASSWORD`
5. End-to-end: zloz zamowienie jako public, obsluz w panelu admina,
   sprawdz tracking.

## Troubleshooting

**Flyway checksum mismatch:** ktos edytowal juz zaaplikowana migracje.
`railway run psql` → `DELETE FROM flyway_schema_history WHERE version = 'X';`
albo `./gradlew flywayRepair` lokalnie ze zmiennymi produkcji.

**CORS error w konsoli przegladarki:** `CORS_ALLOWED_ORIGINS` nie pasuje
do realnej domeny frontu. Zaktualizuj env var, redeploy.

**JWT fail przy logowaniu admina:** `JWT_SECRET` za krotki (wymagane >=64
znaki). Wygeneruj nowy `openssl rand -base64 48` i zaktualizuj.

**Kontener restartuje sie w kolko:** sprawdz `Deployments` → `Logs`.
Typowe: flyway migration fail (checksum, syntax), DB unreachable
(`DB_URL` zly), missing env var (sprawdz sekcje "Krok 4").

**Brak dostepu do admin panelu po deploy:** admin seeder odpala sie raz
przy pierwszym starcie. Jesli `ADMIN_EMAIL` / `ADMIN_PASSWORD` byly
puste przy pierwszym deploy, zaden user nie zostal utworzony. Ustaw
zmienne i zrestartuj serwis, LUB recznie: `railway run psql`, wyczysc
`admin_user`, zrestartuj.

**Tomcat access log masked?:** `server.tomcat.accesslog.enabled: false`
w `application-prod.yml` (BUG-1 z Fazy 4 — JWT w SSE query param nie
trafia do logu). Railway stdout logs pokazuja tylko Spring Boot logs,
nie access log.
