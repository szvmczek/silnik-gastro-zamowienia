# Customization — jak podmienic marke pod nowego klienta

Projekt jest single-tenant: jedna instalacja = jeden klient. Wiekszosc
contentu podmienia sie przez panel admina bez dotykania kodu. Zmiany
wymagajace rebuildu sa oznaczone **[REBUILD]**.

## 1. Content edytowalny przez panel admina (bez kodu)

Zaloguj sie na `/admin/login` (credentials z `.env`: `ADMIN_EMAIL` /
`ADMIN_PASSWORD`) i wejdz w `Ustawienia`.

### `/admin/settings` — Ustawienia restauracji
- **Nazwa** (pojawia sie na landing, w headerze, w SEO title, w OG tags)
- **Tagline** (podtytul na hero, meta description)
- **Kolor primary** (`#hex`) — live preview, wstrzykiwany jako CSS var
  na wszystkich ekranach (buttony, akcenty, theme-color)
- **Logo URL** (obrazek z CDN / publicznego hostingu — nie ma uploadu
  plikow w MVP)
- **Adres** (ulica, miasto, kod pocztowy) — pokazuje sie w kontakcie
  na landing i w mapie OSM
- **Telefon, email** (kontakt na landing + order confirmation)
- **Opcje zamowien**: delivery / pickup on/off, minimum zamowienia,
  domyslne ETA

### `/admin/opening-hours` — Godziny otwarcia
Rekord per dzien tygodnia (`MONDAY` .. `SUNDAY`). Mozna zaznaczyc `closed`
albo ustawic `openTime` / `closeTime`. Godziny pokazuja sie na landing
i kontroluja baner "Restauracja zamknieta" na `/checkout` (fail-open,
strefa `Europe/Warsaw`).

### `/admin/page-content` — Teksty landing page
- Hero: heading, subheading, CTA label
- About: tytul + paragrafy

### `/admin/menu` — Menu
CRUD kategorii, produktow, wariantow (rozmiary, ceny), grup dodatkow
(wolne + platne), powiazan produkt ↔ grupa dodatkow.

Obrazki produktow: URL (CDN / Unsplash / S3), nie upload.

## 2. Seedy — content poczatkowy przy pierwszym deploy

Jesli chcesz, zeby swieza instancja wyszla od razu z gotowym menu,
edytuj pliki migracji Flyway przed pierwszym startem:

### `backend/src/main/resources/db/migration/V100__seed_demo.sql`
Wstawia pojedynczy rekord `RestaurantSettings` (marka "Pizza Demo",
adres warszawski, telefon, email, primary color `#E11D48`). Podmien:
- `name`, `tagline`, `primary_color`, `logo_url`
- `address_street`, `address_city`, `address_postal_code`
- `phone`, `email`
- Domyslne `opening_hours` (7 wierszy)
- Domyslne `page_content` (hero + about)

### `backend/src/main/resources/db/migration/V101__seed_menu.sql`
Wstawia kategorie, produkty, warianty, grupy dodatkow. Podmien lub wywal
wszystkie `INSERT`-y jesli klient ma wlasne menu.

**Uwaga:** migracje Flyway sa niezmienialne po deploy. Jesli instancja
juz ruszyla na produkcji, dalsze zmiany rob przez panel admina — edytowanie
`V100` / `V101` po fakcie zlamie checksumy Flyway i uruchomienie sie
nie powiedzie.

**Alternatywa dla czystego starta:** usun pliki `V100__*.sql` i `V101__*.sql`
przed pierwszym deploy. Admin wejdzie do pustego panelu i wprowadzi dane
recznie.

## 3. Favicon + manifest — [REBUILD]

### `frontend/index.html`
Domyslny favicon to inline SVG z emoji pizzy. Zeby go podmienic, zastap
liniami w `<head>`:
```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>EMOJI</text></svg>" />
```
lub dodaj plik `frontend/public/favicon.ico` / `favicon.png` i zlinkuj.

### `frontend/public/manifest.json`
Zaktualizuj `name`, `short_name`, `theme_color`, `background_color` pod
brand klienta. Manifest.json jest statyczny (nie jest wstrzykiwany
z API) — zmiany wymagaja rebuildu frontu.

### `frontend/public/favicon.svg`
Statyczny fallback SVG dla przegladarek ktore nie obsluguja data URI
w favicon. Podmien na SVG z logiem klienta.

### `frontend/index.html` → `<meta name="theme-color">`
Statyczna wartosc dla przegladarek mobilnych; SEO component w runtime
aktualizuje title / description / OG tags z `RestaurantSettings`, ale
`theme-color` zostaje na wartosci z HTML. Ustaw zgrubnie na primary
color klienta.

## 4. Zmienne srodowiskowe do zmiany per klient

Plik `.env` (lokalnie) lub Railway env vars (prod):

| Zmienna | Opis |
|---|---|
| `ADMIN_EMAIL` | login admina (seed przy pierwszym starcie) |
| `ADMIN_PASSWORD` | haslo admina (bcrypt hash generowany przy seedu) |
| `JWT_SECRET` | min 64 znaki, wygeneruj `openssl rand -base64 48` |
| `CORS_ALLOWED_ORIGINS` | domena frontu (prod: `https://twoja-domena.pl`) |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | Railway podstawia z plugin Postgres |
| `SPRING_PROFILES_ACTIVE` | `dev` lokalnie, `prod` na Railway |

Po zmianie `ADMIN_EMAIL` na juz-odpalonej bazie: seeder ZROBI nowego
usera, nie podmieni starego. Zeby przelogowac na nowy email, usun
rekord `admin_user` recznie (Adminer / psql) albo zmien email przez
SQL UPDATE.

## 5. Checklist rebrandingu (full swap na nowego klienta)

1. Fork repo, utworz nowy branch.
2. Podmien `V100__seed_demo.sql` (nazwa, adres, kolor, godziny).
3. Podmien `V101__seed_menu.sql` (menu klienta) — lub wywal i zostaw puste,
   klient sam uzupelni.
4. Podmien `frontend/public/favicon.svg` + `manifest.json` (name, colors).
5. Podmien `frontend/index.html` → inline favicon emoji + `theme-color`.
6. Wygeneruj nowe `JWT_SECRET` + ustaw `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
7. Deploy wg [deployment.md](./deployment.md).
8. Po pierwszym starcie zaloguj sie na `/admin/login`, zweryfikuj content
   w `/admin/settings`, `/admin/opening-hours`, `/admin/page-content`,
   `/admin/menu`.
9. End-to-end smoke: zloz testowe zamowienie z konta publicznego,
   obsluz w panelu admina.
