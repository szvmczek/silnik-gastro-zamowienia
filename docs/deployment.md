# Deployment - Railway

Target deploy: Railway. Jeden serwis aplikacji z root `Dockerfile` +
jeden plugin PostgreSQL. Frontend jest buildowany do static assets i
serwowany przez Spring Boot.

## Prerekwizyty

- Konto Railway.
- Repo na GitHub z branchem deployowym.
- Wygenerowany `JWT_SECRET`: `openssl rand -base64 48`.
- Haslo admina w `ADMIN_PASSWORD`.

## Krok 1: Projekt i PostgreSQL

1. Railway: `New Project` -> `Empty Project`.
2. Dodaj `Database` -> `PostgreSQL`.
3. Railway wystawi zmienne Postgresa, zwykle jako referencje pluginu:
   `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` i/lub
   `DATABASE_URL`.

Kod aplikacji uzywa aktualnie `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
`DATABASE_URL` z Railway nie jest parsowany automatycznie przez aplikacje,
wiec ustaw `DB_URL` jako JDBC URL.

## Krok 2: Serwis aplikacji

1. Dodaj serwis z GitHub repo.
2. Wybierz branch deployowy. Design v3 "PIEC" zyje na
   `design/v2-stage5-handoff` — albo wskaz ten branch, albo zmerguj go do
   `master` przed podpieciem repo. Deploy z `master` bez merge'a postawi
   wersje sprzed redesignu.
3. Railway powinien uzyc root `Dockerfile`, nie Nixpacks. Sprawdz w
   `Settings` -> `Build`; jesli wykryl Nixpacks, ustaw builder na Dockerfile
   recznie.
4. Health Check Path: `/actuator/health`. Endpoint jest wystawiony
   (`management.endpoints.web.exposure.include: health,info`) i jawnie
   permit-owany w `SecurityConfig`, wiec nie wymaga zadnej dodatkowej
   konfiguracji po stronie kodu.

Aplikacja slucha na `${PORT:8080}`. Railway wstrzykuje `PORT` samo —
nie ustawiaj go recznie.

## Krok 3: Env vars

Ustaw na serwisie aplikacji:

| Zmienna | Wartosc |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `prod` — **wymagane**. Bez tego wstanie profil `dev` (domyslka z `application.yml`) i `application-prod.yml` w ogole sie nie zaladuje |
| `JWT_SECRET` | min 32 bajty po decode; rekomendowane `openssl rand -base64 48` |
| `ADMIN_EMAIL` | email pierwszego admina |
| `ADMIN_PASSWORD` | haslo pierwszego admina; seeder tworzy usera tylko gdy go jeszcze nie ma |
| `ADMIN_DISPLAY_NAME` | opcjonalnie, default `Admin` |
| `CORS_ALLOWED_ORIGINS` | finalny origin HTTPS, np. `https://xxx.up.railway.app` albo custom domain. Front jest serwowany z tego samego originu co API, wiec CORS realnie nie wchodzi w gre — ale ustaw poprawna wartosc, bo domyslka to `http://localhost:5173` |
| `DB_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
| `DB_USERNAME` | `${{Postgres.PGUSER}}` |
| `DB_PASSWORD` | `${{Postgres.PGPASSWORD}}` |

`application-prod.yml` wymaga `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
Brak ktorejs zmiennej zatrzyma start aplikacji.

`PORT` **nie** ustawiaj — Railway wstrzykuje go sam.

## Weryfikacja obrazu lokalnie (opcjonalna, przed pushem)

```powershell
docker build -t pizza-showcase:check .
docker run --rm -p 8082:8080 `
  --network <siec-z-postgresem> `
  -e SPRING_PROFILES_ACTIVE=prod `
  -e DB_URL='jdbc:postgresql://postgres:5432/<baza>' `
  -e DB_USERNAME=pizza -e DB_PASSWORD=pizza `
  -e JWT_SECRET='<48-bajtowy base64>' `
  -e CORS_ALLOWED_ORIGINS='http://localhost:8082' `
  -e ADMIN_EMAIL='admin@local.test' -e ADMIN_PASSWORD='<haslo>' `
  pizza-showcase:check
```

Uzyj **swiezej, pustej bazy**, nie dev-owej — wtedy test pokrywa tez pelny
przebieg migracji Flyway od zera, czyli dokladnie to, co zrobi Railway na
nowym pluginie Postgres.

## Seed data

Flyway uruchamia migracje z `backend/src/main/resources/db/migration` przy
starcie aplikacji. `V100__seed_demo.sql`, `V101__seed_menu.sql` oraz
pozniejsze migracje content/legal odpalaja sie tez w profilu `prod`.

Dla Pizza Showcase to jest celowe: swieza baza Railway startuje z demo
restaurant settings, godzinami, tresciami, menu i legal templates. Przed
publicznym demo zweryfikuj tresc polityki prywatnosci i regulaminu w
panelu admina: `Ustawienia` -> `RODO i regulaminy`.

Admin user nie jest w Flyway seedzie. Tworzy go runtime seeder z
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_DISPLAY_NAME` i zapisuje w tabeli
`users`.

## Reset demo orders/customer data

Do wyczyszczenia lokalnej lub demo bazy z zamowien i danych klientow uzyj:

```powershell
.\scripts\reset-demo-orders.ps1 -ConfirmReset
```

Wrapper zaklada lokalny `docker-compose.yml` i baze:

- host/container: serwis `postgres`
- database: `pizza_showcase`
- user: `pizza`

Mozesz tez odpalic sam SQL recznie przez `psql`:

```powershell
Get-Content -Raw .\scripts\reset-demo-orders.sql | docker exec -i <postgres-container> psql -U pizza -d pizza_showcase -v ON_ERROR_STOP=1
```

`scripts/reset-demo-orders.sql` nie jest migracja Flyway i nie odpala sie
automatycznie. Skrypt czysci tylko order domain:

- `order_status_history`
- `order_item_addons`
- `order_items`
- `orders`
- numeracje w `order_number_sequence` dla aktualnego roku

Skrypt zostawia:

- `users`
- `restaurant_settings`
- `opening_hours`
- `page_content`
- legal content
- `categories`, `products`, `product_variants`
- `addon_groups`, `addons`, `product_addon_groups`
- `delivery_zone`, `delivery_zone_area`

Nie uruchamiaj tego na produkcji, chyba ze intencjonalnie chcesz usunac
zamowienia.

## Reset + neutral demo orders

Jesli demo ma pokazywac panel admina z przykladowymi zamowieniami, ale bez
prywatnych danych klientow, uzyj:

```powershell
.\scripts\reset-and-seed-demo-orders.ps1 -ConfirmReset
```

Wrapper odpala kolejno:

1. `scripts/reset-demo-orders.sql`
2. `scripts/seed-demo-orders.sql`

`seed-demo-orders.sql` nie jest migracja Flyway i nie odpala sie
automatycznie. Skrypt zaklada, ze order domain jest pusty; jesli w tabeli
`orders` sa jakiekolwiek rekordy, przerwie prace zamiast mieszac dane demo z
realnymi zamowieniami.

Seed tworzy neutralne zamowienia demonstracyjne na aktualny rok w formacie
`YYYY-00001`, `YYYY-00002`, itd. Uzywa tylko fake danych typu `Jan Demo`,
`Anna Test`, `Klient Testowy`, `E2E Demo`, telefonow `+48100000000` itd. oraz
adresow `ul. Testowa`, `05-000 Demo`. Product/variant/addon IDs sa pobierane
dynamicznie z menu seedow, a snapshoty nazw i cen sa zapisywane w
`order_items` i `order_item_addons`.

Nie uruchamiaj resetu + seedu na produkcji, chyba ze intencjonalnie chcesz
usunac realne zamowienia i zastapic je neutralnymi demo danymi.

## Post-deploy smoke

Po deployu sprawdz:

1. `https://<railway-url>/actuator/health` -> `{"status":"UP"}`.
2. `https://<railway-url>/api/public/settings` -> JSON z ustawieniami.
3. `https://<railway-url>/api/public/legal` -> JSON z legal content.
4. `/` -> landing.
5. `/menu` -> menu.
6. `/privacy` i `/terms` -> publiczne strony legal.
7. `/admin/login` -> logowanie admina.
8. E2E demo: zloz zamowienie, obsluz w adminie, sprawdz `/track/{token}`.

## Troubleshooting

**Flyway checksum mismatch:** ktos zmienil juz zaaplikowana migracje.
Nie edytuj historii w ciemno. Dla demo mozna uzyc `flywayRepair`, ale dla
produkcji najpierw ustal stan `flyway_schema_history`.

**CORS error:** `CORS_ALLOWED_ORIGINS` musi pasowac do realnego originu
frontu, lacznie ze schematem `https://`.

**JWT fail przy starcie albo logowaniu:** `JWT_SECRET` jest pusty albo za
krotki. Wygeneruj nowy `openssl rand -base64 48`.

**Brak admina:** seeder tworzy rekord w `users` tylko gdy `ADMIN_PASSWORD`
jest ustawione i dany email nie istnieje. Jesli pierwszy start byl bez
hasla, ustaw env i zrestartuj serwis.

**DB unreachable:** sprawdz, czy `DB_URL` ma format JDBC:
`jdbc:postgresql://host:port/database`, a `DB_USERNAME` i `DB_PASSWORD`
pochodza z tego samego pluginu Postgres.

**Odswiezenie podstrony daje 404:** SPA fallback nie zadzialal. Dwa miejsca
go realizuja — `SpaErrorViewResolver` i `GlobalExceptionHandler.handleNoResource`
— oba forwarduja na `/index.html` tylko dla jawnego `Accept: text/html` i tylko
poza `/api/**` i `/actuator/**`. Jesli 404 wraca jako JSON, sprawdz czy request
faktycznie idzie na apke, a nie na proxy.

**`Unexpected token '<'` w konsoli po redeployu:** przegladarka trzyma stary
`index.html` wskazujacy nieaktualny hash assetu. Od poprawki z 2026-08-10
brakujacy asset dostaje czyste 404 (fallback nie lapie `Accept: */*`), wiec
wystarczy hard refresh. Jesli blad wraca po hard refresh, problem jest w
buildzie frontu, nie w cache.

**SSE token w query param:** Tomcat access log jest wylaczony w profilu
`prod`. Railway stdout logs pokazuja logi aplikacji, nie access log URL.
