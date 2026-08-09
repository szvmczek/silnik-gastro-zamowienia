# ROADMAP.md

Lista świadomego "nie teraz". Zapisujemy moduły post-MVP, żeby wiedzieć,
kiedy i jak je dodamy, bez pokusy budowania pod nie teraz.

## Zasada
Architektura MVP MUSI pozwalać na dodanie tych modułów bez przepisywania,
ale NIE może ich przewidywać w kodzie.

Konkretnie: singleton RestaurantSettings (nie Restaurant-y z id), enum
paymentMethod rozszerzalny, service layer oddzielający API od persystencji.
Nie zostawiamy pustych interfejsów PaymentProvider, DeliveryZoneCalculator
itp. — to YAGNI.

## Faza 4.5: Operational UI Split

**STATUS:** DONE — 30.04.2026

Trzy nowe widoki operacyjne (Kuchnia, Wydanie, Dostawa) plus przerobiony
pulpit z wykresami (Recharts) i podstawowymi statystykami. Backend
praktycznie nieruszany — frontend filtruje istniejący
`/api/admin/orders` po stronie klienta.

**Pełna spec:** `docs/PHASES.md` rozdział "Faza 4.5: Operational UI Split".
Source of truth dyskusji projektowej: `docs/FAZA_4_5_HANDOFF.md`.

**Nowe AD records:** AD-020 (Single ADMIN role for operational views),
AD-021 (Cancellation reason on `OrderStatusHistory`), AD-022 (Admin
order list returns full detail shape — dodane w trakcie M3.5 jako
prerequisite dla widoków operacyjnych bez per-card detail HTTP storm).
Plus AD-023 (NEW → IN_PREPARATION direct transition) dodane post-review
jako fix CRITICAL-1.

**Co wchodzi w zakres (skrót):**
- Trzy nowe routy: `/admin/kitchen`, `/admin/pickup`, `/admin/delivery`
  (filtry po stronie klienta — bez nowych endpointów listy)
- Przerobiony `/admin` (Pulpit): kafelki dziś + BarChart godzinowy
  + LineChart 7 dni + top 5 produktów 30 dni + kafelki aktywne per status
- **NOWY** endpoint `GET /api/admin/dashboard/stats` (pełny payload
  zastępujący `/dashboard/summary`; alias zachowany jako deprecated —
  patrz "Tech debt świadomie odłożony")
- `reason: String?` (max 500 znaków) na `OrderStatusHistory` + pole
  w UI anulowania (`/admin/orders`) wymagane dla `CANCELED`
- Dźwięki różnicowane per widok przez Web Audio API (synteza, bez plików)
- Recharts dodany do `frontend/package.json`

**Świadomie poza scope:** RBAC / nowe role (zostaje single ADMIN —
trigger'y reewaluacji w AD-020), drukarka bonowa, audit log per-user.

**Estymacja:** ~5-7 dni (backend migracja + endpoint + frontend 3 widoki
+ dashboard rebuild + dźwięki + docs).

## Faza 4.6: Kitchen item checklist (PLANNED)

**Status:** PLANNED

**Cel:** dodać możliwość odznaczania pozycji w karcie Kuchni
w trakcie ich przygotowywania. Stan persistowany w bazie,
przeżywa refresh, widoczny dla wszystkich kucharzy. NIE pokazywany
klientowi w /track/:token.

**Zakres:**
- Backend: pole `isPrepared: Boolean` (default false) na OrderItem
- Migracja Flyway: V12 (lub kolejny dostępny)
- Endpoint: PATCH /api/admin/orders/{id}/items/{itemId}/prepared
- Frontend: checkbox per pozycja w KitchenOrderCard
- Optimistic update + rollback przy 4xx/5xx
- Reset isPrepared na false przy zmianie statusu z IN_PREPARATION
  do innego (sanity)

**Out of scope:**
- Wymuszanie "wszystkie odznaczone przed Gotowe" — sugestia, nie
  blokada (decyzja: kuchnia ma elastyczność)
- Pokazywanie progressu klientowi
- Per-kucharz attribution kto co odznaczył

**Trigger startu:** po Fazie 4.5 zamknięciu (zatwierdzony smoke
test v2) — decyzja "teraz vs po Fazie 5 (deploy)" do podjęcia
przez właściciela.

## Faza 6: Płatności online

### Kiedy najwcześniej sensownie
Po deployu MVP (Fazy 1-5 ukończone, live URL) + 1-2 tygodnie realnego
użytkowania (nawet w trybie demo z gotówką). To waliduje, że order flow
jest stabilny.

### Prowider (decyzja odłożona)
Do wyboru: Stripe (globalny standard, świetne SDK), Przelewy24 (PL, BLIK),
Stripe + BLIK via Stripe. Decyzja po MVP, zależnie od klienta.

### Co się zmienia w modelu
- Nowa encja Payment (id, orderId, provider, externalId, amount, currency,
  status, createdAt, paidAt, metadata JSONB)
- Order.paymentMethod dostaje wartość ONLINE
- Order dostaje pole paymentStatus (PENDING, PAID, FAILED, REFUNDED)
  lub delegujemy do encji Payment
- OrderStatusHistory lub PaymentStatusHistory

### Co trzeba zbudować
- PaymentService + PaymentProviderAdapter (interface z jedną implementacją)
- Endpoint: POST /api/public/orders zwraca też checkoutUrl / clientSecret
- Endpoint webhook: POST /api/public/webhooks/{provider} (public, z weryfikacją
  podpisu)
- Obsługa statusów: PAID → update Order → trigger powiadomień (jeśli są)
- Frontend: redirect do checkout provider, ekran sukcesu po powrocie,
  obsługa cancel/error
- Admin: widok statusu płatności w szczegółach zamówienia

### Pułapki
- **Idempotency webhooków** — ten sam event może przyjść 2+ razy. Używamy
  externalId + unique constraint.
- **Reconciliation** — co jeśli webhook nie doszedł w ogóle. Scheduler
  sprawdzający PENDING po 15 min.
- **Timeouts** — klient zamyka przeglądarkę po zapłacie. Status płatności
  musi dojść przez webhook, nie przez redirect.
- **Zwroty** — refund flow jako osobna operacja admin.
- **Sandbox testing** — wszystkie przepływy w trybie test przed produkcją.

### Szacunek
- Solidna integracja bez testów: 7-10 dni
- Z testami i edge case'ami: 12-15 dni

## Faza 7: Strefy dostawy

Rozbita na cztery podfazy. 7.0 = MVP wystarczający dla pierwszego klienta.
7.1-7.3 = ulepszenia ładowane tylko gdy konkretny klient zgłosi potrzebę.

> Wariant A z poprzedniej wersji roadmapy ("lista kodów pocztowych per strefa")
> został **zastąpiony** przez bogatszy model `(city, postal_code)` z fallbackiem
> i jest teraz Fazą 7.0. Wariant B ("polygony na mapie") trafił do Fazy 7.3.

Pełne ustalenia źródłowe: `docs/phases/PHASE_7_DELIVERY_ZONES_NOTES.md`.
Decyzja architektoniczna lookup: AD-019 w `docs/ARCHITECTURE.md`.
Zmiana w mechanice totalów: rozszerzenie AD-016 ("Klient nie wysyła cen")
o regułę `total = subtotal + deliveryFee` i snapshot pól delivery na Order.

### Faza 7.0 — MVP stref dostawy

**Kiedy najwcześniej sensownie:** gdy pierwszy realny klient potrzebuje
różnicować koszt dostawy między strefami albo blokować zamówienia spoza
zasięgu. Niekoniecznie tuż po Fazie 5 — można odłożyć aż klient zgłosi
potrzebę.

**Co wchodzi w zakres:**
- Encja `DeliveryZone` (name, type ∈ {FREE, PAID, UNAVAILABLE}, deliveryFee,
  active, displayOrder) + `DeliveryZoneArea` (zone, city_normalized,
  city_display, postal_code nullable)
- Lookup hybrydowy `(city, postal_code)`: exact match → fallback `(city, NULL)`
  → UNAVAILABLE
- Endpointy publiczne: `POST /api/public/delivery/check`, `GET /api/public/delivery/cities`
- Endpointy admin: CRUD stref + areas
- CheckoutService: lookup przy `fulfillmentType=DELIVERY`, snapshot
  `deliveryFee` i `deliveryZoneName` na encji Order, `total = subtotal + deliveryFee`
- Pickup nadal ignoruje strefy całkowicie
- Frontend admin: ekran "Strefy dostawy" (CRUD stref + dwa tryby dodawania
  area: "cała miejscowość" i "konkretne kody")
- Frontend public: lokalny autocomplete miast w `CheckoutPage`, format mask
  na kodzie pocztowym, debounced live check, badge ze statusem strefy,
  disabled CTA przy UNAVAILABLE, fee w `OrderSummary`
- Tracking i admin order detail pokazują snapshotowane fee/zone

**Świadomie poza scope (zero zewnętrznych płatnych API, zero map):**
- Brak geocodingu, brak Google Places / Mapbox / Photon / Nominatim
- Brak polygonów, brak Leaflet
- Brak fuzzy matchingu nazw miast (literówki user'a → UNAVAILABLE)
- Brak min order per strefa, brak godzin strefy

**Estymacja:** 3-5 dni (backend + frontend + admin + docs).

### Faza 7.1 — opcjonalne ulepszenia stref

**Kiedy najwcześniej sensownie:** po wdrożeniu 7.0 u realnego klienta,
gdy konkretny use-case z poniższych zacznie boleć (np. admin skarży się
na ręczne wpisywanie 50 kodów po jednym).

**Co wchodzi w zakres:**
- Min order amount per strefa (np. "do strefy B minimum 40 zł")
- Godziny strefy ("do strefy B dowozimy tylko 11-22")
- Levenshtein matching nazw miast (tolerancja literówek przy lookup'ie)
- Bulk CSV import area w panelu admina
- Drag-and-drop sort stref (kolumna `display_order` już jest w 7.0,
  ale w 7.0 sort tylko `ORDER BY name`)

**Tickety z review Fazy 7.0 (do dorobienia w 7.1):**
- Konflikt fee przy concurrent admin PATCH: klient wysyła
  `expectedDeliveryFee` w `POST /orders`, backend re-lookuje
  i porównuje; różnica → 409 „Cena dostawy uległa zmianie."
  Alternatywa: `zoneVersion` z `/check` echo'wany przy place-order.
- 409 cross-zone z nazwą konfliktującej strefy: w
  `DeliveryZoneAdminService` przy konflikcie doczytać konfliktujący
  area + jego zone, włożyć `zone.getName()` w message.
- Zone rename break w soft-delete guard: zamiast string-match
  `existsByDeliveryZoneName`, dodać kolumnę `delivery_zone_id` (FK
  nullable, ON DELETE SET NULL) na `orders` jako drugi snapshot.
  Wymaga nowej migracji + backfill istniejących rekordów po nazwie.
- Custom React Combobox dla CityCombobox: normalized-prefix matching
  po stronie klienta, pełna kontrola UX, lepsze stylowanie iOS Safari.
- Cities listing distinct po `cityNormalized` z `MIN(cityDisplay)`
  zamiast distinct po `cityDisplay` (mała inkonsystencja gdy admin
  wpisze różne capitalizacje tego samego miasta w różnych strefach).
- `DeliveryCheckRequest`: dodać `@Pattern("^\\d{2}-\\d{3}$")` na
  `postalCode`, żeby invalid postal zwracał 400 zamiast 200 UNAVAILABLE.
- `<input list>` autoComplete conflict: ustawić `autoComplete="off"`
  na polu miasta w `CheckoutPage` żeby browser autofill nie konkurował
  z datalist.
- `OrderConfirmationDto`: wyświetlić `deliveryFee` i `deliveryZoneName`
  na confirmation page (obecnie zwisają — backend zwraca, frontend
  deserializuje, ale nie renderuje).
- `RateLimitFilter`: świadome wsparcie `X-Forwarded-For` (z whitelistą
  proxy) dla deploymentów za reverse proxy.

**Estymacja:** 2-4 dni zależnie od wybranego podzbioru (każdy element
można wziąć osobno).

### Faza 7.2 — autocomplete adresu z zewnętrznym API

**Kiedy najwcześniej sensownie:** tylko jeśli realny klient zgłosi, że
sugestie miast z bazy stref są niewystarczające (np. duża pizzeria, dużo
różnych miejscowości w okolicy, użytkownicy mylą się w pisowni). Dla
typowego klienta lokalny autocomplete z 7.0 wystarcza.

**Co wchodzi w zakres:**
- Photon (komoot.io, hosted) jako default — darmowy, OSM-based, bez
  klucza API, bez karty kredytowej
- Bring-your-own Google Places API key jako power-user feature
  (klient sam zarządza limitami i kartą)
- Frontend: rozszerzenie autocomplete w `CheckoutPage` o externalne
  sugestie (z fallbackiem do listy lokalnej)

**Estymacja:** 2-3 dni.

### Faza 7.3 — polygony / drive-time isochrones

**Kiedy najwcześniej sensownie:** tylko jeśli pizzeria ma flotę dostawczą
i potrzebuje precyzyjnego SLA (np. "dowozimy tam, gdzie kierowca dojedzie
w 25 min"). Większości klientów to nie dotyczy.

**Co wchodzi w zakres:**
- Leaflet + leaflet-draw w panelu admina — rysowanie polygonów strefy
  na mapie OSM
- Self-hosted OSRM albo Valhalla dla generowania isochrones (drive-time
  polygons z punktu pizzerii)
- Lookup adresu: geocoding → punkt w polygon → strefa
- Wymaga 7.2 (geocoding adresu) jako prereq

**Estymacja:** 7-10 dni + osobny koszt operacyjny (hosting OSRM/Valhalla).

### Pułapki ogólne (dotyczą całej rodziny 7.x)

- **Zmiana stref wstecz** — historyczne zamówienia mają snapshot
  `deliveryFee` i `deliveryZoneName` (od 7.0). Nigdy się nie zmieniają.
- **Format kodu pocztowego (PL)** — `XX-XXX`, normalizowany do tej formy
  zawsze (frontend, admin, backend, lookup).
- **Diakrytyki** — match po `city_normalized` (lowercase + strip diakrytyków),
  display zawsze z `city_display`.

## Faza 8: Email notyfikacje

### Kiedy
Razem z Fazą 6 lub tuż po. Potwierdzenie zamówienia + zmiana statusu mailem.

### Co
- SMTP przez Resend / SendGrid / Postmark
- Templating (Thymeleaf lub MJML → HTML)
- Kolejka w bazie (Outbox pattern) + scheduler
- Admin: edytor template'ów (opcjonalnie)

### Szacunek
- Z szablonami bazowymi: 2-3 dni
- Z admin edycją: +2 dni

## Dalsze moduły (do roadmapy, bez planu)

- Konta klientów + historia zamówień
- Kupony rabatowe (procent, kwota, minimum order)
- SMS notyfikacje (Twilio / Messagebird)
- Kitchen Display System (KDS) — osobny ekran dla kuchni
- Integracja z drukarką fiskalną / bonową (ESC/POS)
- Analytics dashboard (wykresy sprzedaży, top produkty)
- Wyjątki godzin otwarcia (święta)
- Galeria zdjęć restauracji
- Dark mode
- Multi-language (i18n)
- Integracje z kurierami (Glovo, Wolt, Pyszne, Stuart)
- Multi-tenant (gdy sprzedaż template'u wielu klientom w jednej instancji)
- PWA (offline menu, push notifications)
- File upload zdjęć produktów (zamiast URL)

## QoL improvements (post-MVP)

Drobne usprawnienia panelu admina sygnalizowane przez bundle Claude
Design ale skipnięte podczas redesignu G6-G9 jako poza scope (zwykle
wymagają dodatkowego state managementu lub podejmowania decyzji UX).

- **„Skopiuj godziny do…" w `/admin/opening-hours`** — bundle
  pokazuje per-row hover button kopiujący godziny otwarcia danego dnia
  do innych dni. Skipnięte w G9 (deferred D3=A) — wymaga ~30+ linii
  state managementu (popover/menu z checkbox listą dni docelowych,
  mass `setValue` na openTime/closeTime, focus return), a bundle nie
  precyzuje exact UX. Sensowne dodać razem z G10 polishem albo jako
  osobny mini-task.

## Tech debt świadomie odłożony

Bugi wykryte w review fazy, nie-blockery dla akceptacji, ale do uprzątnięcia
gdy będzie okazja (np. przy okolicznym refaktorze albo razem z fazą polish).

### Z designu v3 „PIEC" (2026-08-09)

- **Ceny dodatków per rozmiar**
  Paczka różnicuje cenę dodatku zależnie od wielkości pizzy (ser 6 zł na
  30 cm, 8 zł na 42 cm). `Addon.price` to jedna wartość — seed bierze cenę
  dla 30 cm. Wymagałoby albo cennika per (addon, variant), albo mnożnika
  na wariancie. Do zrobienia, gdy właściciel realnie tak liczy.

- **Tagi produktów (OSTRA / WEGE)**
  Karty pokazują badge OSTRA wywnioskowany ze słów kluczowych w opisie
  (`menu/lib/productTags.ts`). WEGE świadomie nie jest pokazywane — „brak
  mięsa na liście" to wnioskowanie z nieobecności i pomyliłoby się przy
  pierwszym produkcie opisanym mniej dosłownie. Docelowo: kolumna `tags`
  na `Product` + edycja w panelu; wtedy heurystyka znika.

- **`freeDeliveryFrom` bez pola w panelu**
  Kolumna i DTO istnieją (V206), wartość ustawia seed. Formularz ustawień
  nie wystawia pola, bo panel był poza scope (D-08). `UpdateSettingsRequest`
  traktuje `null` jako „nie zmieniaj", żeby zapis z panelu nie zerował
  wartości. Do dołożenia razem z następnym dotknięciem ustawień.

- **Edycja pozycji koszyka**
  Dawny „edit pencil" w sidebarze wypadł razem z sidebarem (AD-025).
  Przy pełnych ekranach oznaczałby nawigację do konfiguratora z pre-fillem
  i usunięcie starej linii. Na razie klient usuwa i dodaje ponownie.

- **Zdjęcie sekcji „o nas" z paczki** — *reszta zamknięta w V208 + V209*
  Operator wrzucił ręcznie pięć zdjęć z bundla do
  `frontend/public/uploads`; weszły migracjami `V208` (pizze) i `V209`
  (hero). Nazewnictwo dostarczonych plików jest przesunięte względem
  paczki: plik `hero-02.jpg` zawiera kadr hero („pizze z pieca na
  drewnianym blacie"), nie zdjęcie do sekcji „o nas".
  Brakuje więc kadru „pizza na desce" — `page_content.ABOUT` zostaje przy
  URL-u Unsplash. Gdy plik się pojawi: jeden UPDATE na sekcji ABOUT.
  Świadomie nie podstawiamy tam żadnego `pizza-0N` — te same zdjęcia lecą
  w pasie „najczęściej zamawiane" kilkaset pikseli wyżej.
  Napoje i desery zostają na URL-ach — paczka nie miała dla nich zdjęć.

### Z Fazy 2 (Menu)

- **Bug #5 — N+1 w `GET /api/admin/products`**
  Lista produktów w panelu admina dociąga `category`, a dla każdego produktu
  potencjalnie warianty/grupy dodatków po jednej query. Fix: `@EntityGraph`
  na `ProductRepository.findAll(Pageable)` z `category` (i opcjonalnie
  `variants`) albo dedykowana metoda z `JOIN FETCH`. Po dodaniu paginacji
  problem ograniczony do jednej strony, ale dalej brzydki.

- **Bug #6 / #7 — race condition na unikalności `slug`**
  `SlugGenerator` rozwiązuje kolizje suffixami `-2`, `-3` na podstawie
  odczytu z bazy. Dwa równoległe POST-y tej samej nazwy mogą wygenerować
  ten sam slug i drugi padnie z `DataIntegrityViolationException` →
  obecnie 500. Fix: złapać DIV w `AdminCategoryService` /
  `AdminProductService` i zmapować na **409 Conflict** (RFC 7807,
  `slug already exists`). Alternatywnie: retry z kolejnym suffixem
  raz, potem 409. Niski priorytet — pojedynczy admin w MVP.

- **Bug #10 / #11 / #12 — edge case'y publicznego menu**
  - #10: produkt z `available=false` i jednocześnie kategoria
    `active=false` — obecnie wycinany na poziomie kategorii, ale flaga
    `available` w odpowiedzi powinna być spójna.
  - #11: `GET /api/public/products/{slug}` zwraca 404 gdy kategoria
    nieaktywna, ale frontend pokazuje generyczny błąd zamiast "produkt
    chwilowo niedostępny".
  - #12: produkt z grupą dodatków, gdzie wszystkie addony mają
    `available=false` — modal pokazuje pustą sekcję wymaganą
    (jeśli `required=true`) i blokuje "Dodaj do koszyka" bez
    czytelnego komunikatu. Backend powinien odfiltrować addony
    niedostępne lub flagować całą grupę.

  Fix razem z Fazą 5 (polish) — wymaga decyzji UX, nie tylko kodu.

### Z Fazy 4.5 (Operational UI Split)

- **Deprecated: `GET /api/admin/dashboard/summary`**
  Zastąpiony przez `/api/admin/dashboard/stats` w Fazie 4.5. Trzymany
  jako alias dla bezpieczeństwa kompatybilności wstecznej. Usunąć po
  Fazie 4.5 gdy:
  - (a) frontend nie wywołuje już `/summary` (`grep -r "dashboard/summary" frontend/`
    pusty),
  - (b) najwcześniej w fazie sprzątającej post-MVP.

- **MEDIUM-5 (z review 4.5): dwa odrębne `AudioContext`**
  `lib/sounds.ts` (kitchen/pickup/delivery) i `soundPrefs.ts`
  (SoundToggle priming beep) mają osobne instancje `AudioContext`.
  Mitigacja przez `audioCtx.resume()` po user-gesture działa, ale
  niedostępna sumarycznie po długich okresach nieaktywności (browser
  może suspendować ponownie). Trigger fix: konsolidacja do
  `shared/audio/context.ts` przy okazji następnej fazy dotykającej
  audio (notifications, per-event sound customization). Koszt ~30 LoC
  vs poprawa niezawodności w edge case.

- **LOW-7 (z review 4.5): heavy payload `OrdersListPage`**
  `AdminOrderQueryService.findAllFiltered` ma `@EntityGraph(items,
  items.addons)` (AD-022) wymagany przez widoki operacyjne, ale ten
  sam `findAllFiltered` obsługuje też `OrdersListPage` (PAGE_SIZE=20)
  który items nie renderuje. Zmarnowany payload + Hibernate fetch.
  Trigger fix: split na `findAllFilteredSlim` (bez entity graph) dla
  OrdersListPage i `findAllFilteredOperational` (z entity graph) dla
  Kuchni/Pickup/Dostawy. Koszt ~30 LoC w repo + service. Akceptowalna
  regresja w MVP (PAGE_SIZE=20 list, niski wpływ).

## POST-MVP — Pochodne z UX_BIBLE.md

> Konsultuj `docs/UX_BIBLE.md` przy implementacji każdego punktu — sekcja
> w bibli zawiera szczegółowe wytyczne (px, ms, copy, edge case'y).

### Wave 1 — Najszybsze wins (małe zmiany, duży efekt)

#### R-1.1 Free-delivery progress bar
- **Źródło:** UX_BIBLE.md §5
- **Opis:** Pasek "Brakuje X zł do darmowej dostawy" w koszyku jako
  motywator do zwiększenia wartości zamówienia
- **Wymaga:** pole `RestaurantSettings.freeDeliveryFrom` (Decimal,
  nullable) + aktualizacja UI koszyka
- **Waga:** S (1-2 dni)

#### R-1.2 Toast undo po usunięciu pozycji z koszyka
- **Źródło:** UX_BIBLE.md §5 (Uber Eats pattern)
- **Opis:** "Usunięto Margherita 30 cm" + przycisk "Cofnij", auto-dismiss 5s
- **Wymaga:** zustand cart store keepalive ostatnio usuniętej pozycji
- **Waga:** S (1 dzień)

#### R-1.3 Animacje add-to-cart (arc animation)
- **Źródło:** UX_BIBLE.md §3 (Uber Eats / Domino's)
- **Opis:** Produkt "leci" do ikony koszyka po kliknięciu "+"
- **Wymaga:** Framer Motion layout animation lub custom transform
- **Waga:** M (2-3 dni)

#### R-1.4 Drag-and-drop kolejności menu
- **Źródło:** UX_BIBLE.md §26
- **Opis:** Admin może przeciągać kategorie i produkty zmieniając `sortOrder`
- **Wymaga:** library (np. `@dnd-kit`), endpoint PATCH bulk reorder
- **Waga:** M (3-4 dni)

### Wave 2 — Płatności online

#### R-2.1 Przelewy24 / BLIK
- **Źródło:** UX_BIBLE.md §7, §36
- **Opis:** Płatność online przy składaniu zamówienia zamiast tylko gotówki
- **Wymaga:** integracja Przelewy24 SDK, webhook handler, pole `Order.paymentStatus`,
  refund flow przy CANCEL, migracje
- **Waga:** L (1-2 tygodnie)

#### R-2.2 Stripe (alternatywa lub karta międzynarodowa)
- **Źródło:** UX_BIBLE.md §36
- **Opis:** Stripe Payment Intent dla kart kredytowych
- **Wymaga:** jak P24 + Stripe SDK
- **Waga:** L (1-2 tygodnie)

### Wave 3 — Inteligencja menu

#### R-3.1 Tagi produktów (bestseller / nowy / ostre / wege / bez glutenu)
- **Źródło:** UX_BIBLE.md §3, §11
- **Opis:** Pole `tags: ProductTag[]` na Product, badge'y na karcie, filtry
- **Wymaga:** migracja, enum `ProductTag`, UI badges + filtry w menu
- **Waga:** M (3-4 dni)

#### R-3.2 Search w menu
- **Źródło:** UX_BIBLE.md §2
- **Opis:** Live search po nazwie, opisie, składnikach (debounce 300ms)
- **Wymaga:** indeks pełnotekstowy w Postgres lub klient-side filter
  (8-30 produktów = klient-side OK)
- **Waga:** S (1-2 dni)

#### R-3.3 Alergeny i wartości odżywcze
- **Źródło:** UX_BIBLE.md §3, §4
- **Opis:** Lista alergenów per produkt (ikony 14 alergenów EU), opcjonalna
  tabela kcal/białko/węgle/tłuszcze
- **Wymaga:** migracje, UI w panelu admina i modalu produktu
- **Waga:** M (3-4 dni)

#### R-3.4 Cross-sell / upsell w koszyku
- **Źródło:** UX_BIBLE.md §11
- **Opis:** "Do tego pasuje X" — produkty powiązane lub algorytm "często
  zamawiane razem"
- **Wymaga:** ProductRelation lub prosty `frequently bought together` query
- **Waga:** M (3-5 dni)

### Wave 4 — System ocen i lojalność

#### R-4.1 System ocen zamówień (1-5 gwiazdek + komentarz)
- **Źródło:** UX_BIBLE.md §10
- **Opis:** Klient ocenia po DELIVERED, ocena widoczna w panelu admina,
  agregacja na karcie produktu
- **Wymaga:** `OrderReview` lub `ProductReview` entity, endpointy public
  + admin moderacja, UI prośby o ocenę po DELIVERED, widok recenzji
- **Waga:** L (1-2 tygodnie)

#### R-4.2 Email transakcyjny
- **Źródło:** UX_BIBLE.md §8, §28
- **Opis:** Email po złożeniu zamówienia (potwierdzenie + tracking link),
  email z prośbą o ocenę 15 min po DELIVERED
- **Wymaga:** SMTP provider (SendGrid / Resend / Mailgun), szablony HTML,
  background job (Spring `@Async` lub queue)
- **Waga:** M (1 tydzień)

#### R-4.3 Konta klientów (opcjonalne)
- **Źródło:** UX_BIBLE.md §7
- **Opis:** Klient zakłada konto, zapisuje adresy, widzi historię zamówień,
  zamawia "ponownie z historii"
- **Wymaga:** Customer entity, auth dla customers (osobno od admin), UI
- **Waga:** L (2 tygodnie). **Ostrożnie — dla małej restauracji często
  niepotrzebne, klienci wolą guest checkout.**

### Wave 5 — Operacje restauracji

#### R-5.1 Kitchen Display System (KDS)
- **Źródło:** UX_BIBLE.md §17, §18
- **Opis:** Osobny widok dla kuchni — duże karty z aktywnymi zamówieniami,
  timer 3-kolorowy, przycisk GOTOWE, dźwięk przy nowym, montowany na tablecie
- **Wymaga:** osobny route `/kds`, PIN auth, big touch UI, polling/SSE
- **Waga:** L (1-2 tygodnie)

#### R-5.2 Drukarka termiczna ESC/POS
- **Źródło:** UX_BIBLE.md §17, §36
- **Opis:** Auto-print bonu kuchennego przy CONFIRMED na drukarce sieciowej
- **Wymaga:** integracja ESC/POS (np. `escpos-printer` dla Node, lub Java
  client), konfiguracja w settings (IP drukarki), template bonu
- **Waga:** M (1 tydzień)

#### R-5.3 Pre-order na konkretną godzinę
- **Źródło:** UX_BIBLE.md §7, §21
- **Opis:** Klient wybiera "Zaplanuj na konkretną godzinę" zamiast ASAP
- **Wymaga:** pole `Order.scheduledFor`, walidacja slotów (godziny otwarcia,
  capacity), UI datetimepicker w checkoucie, harmonogram w panelu admina
- **Waga:** M (1 tydzień)

#### R-5.4 Capacity management + auto-pauza
- **Źródło:** UX_BIBLE.md §18, §21
- **Opis:** Limit X aktywnych zamówień, gdy osiągnięty: auto-extend ETA
  klientowi lub blokada nowych zamówień + komunikat "Duże obłożenie"
- **Wymaga:** pole settings `maxConcurrentOrders`, real-time licznik
  aktywnych, UI komunikatu klienta i admina
- **Waga:** M (1 tydzień)

#### R-5.5 Auto-cancel niezaakceptowanych zamówień
- **Źródło:** UX_BIBLE.md §18
- **Opis:** Jeśli zamówienie NEW nie zostanie zaakceptowane przez admina
  w X minut, auto-CANCEL z powiadomieniem klienta
- **Wymaga:** scheduled job (Spring `@Scheduled`), pole settings
  `autoAcceptTimeoutMinutes`, email/SMS do klienta
- **Waga:** M (4-5 dni, zależne od R-4.2 dla powiadomień)

### Wave 6 — Strefy i dostawa

#### R-6.1 Strefy dostawy z polygon
- **Źródło:** UX_BIBLE.md §20
- **Opis:** Zamiast jednej globalnej dostawy — wiele stref z różnymi
  kosztami, minimum, czasami
- **Wymaga:** entity DeliveryZone (geometry), provider geocodingu
  (Google / Nominatim) do walidacji adresu, polygon editor w panelu
- **Waga:** L (1-2 tygodnie)

#### R-6.2 Google Places autocomplete adresu
- **Źródło:** UX_BIBLE.md §7
- **Opis:** Autocomplete w polu adresu w checkoucie + pin na mapie
- **Wymaga:** Google Places API key, koszty (~$0.017 per autocomplete),
  Maps JavaScript API
- **Waga:** S-M (3-5 dni). **Ostrożnie z kosztami API.**

#### R-6.3 Wyjątki godzin otwarcia (święta, urlopy)
- **Źródło:** UX_BIBLE.md §21
- **Opis:** Per-data override godzin lub zamknięcia
- **Wymaga:** entity OpeningHoursException, UI w settings, integracja
  w `isOpenNow()`
- **Waga:** S (2-3 dni)

### Wave 7 — Kurierzy

#### R-7.1 Zarządzanie kurierami w panelu
- **Źródło:** UX_BIBLE.md §19
- **Opis:** Lista kurierów (CRUD), przypisywanie zamówień ręczne, statusy
- **Wymaga:** Courier entity, endpointy, UI listy + przypisania
- **Waga:** M (1 tydzień)

#### R-7.2 Aplikacja kuriera (PWA)
- **Źródło:** UX_BIBLE.md §19
- **Opis:** Web app dla kuriera — lista przypisanych, nawigacja,
  potwierdzenie odbioru i dostawy
- **Wymaga:** osobne UI route `/courier`, auth (PIN lub link), GPS
- **Waga:** L (2-3 tygodnie)

#### R-7.3 Tracking GPS kuriera na mapie klienta
- **Źródło:** UX_BIBLE.md §9, §19
- **Opis:** Klient widzi pozycję kuriera w realnym czasie na trackingu
- **Wymaga:** WebSocket lub SSE z GPS coords, mapa w `TrackingPage`,
  zgoda kuriera na share location
- **Waga:** L (2 tygodnie). **Razem z R-7.1 i R-7.2.**

### Wave 8 — Wiele ról i bezpieczeństwo

#### R-8.1 RBAC (Owner / Manager / Staff)
- **Źródło:** UX_BIBLE.md §16
- **Opis:** Wiele ról z różnymi uprawnieniami w panelu
- **Wymaga:** zmiana modelu User (multiple roles per user), permission
  matrix, UI dla zarządzania użytkownikami, refactor `@PreAuthorize`
- **Waga:** L (1-2 tygodnie)

#### R-8.2 2FA dla admina
- **Źródło:** UX_BIBLE.md §33
- **Opis:** TOTP (Google Authenticator) jako drugi krok logowania
- **Wymaga:** library (`com.warrenstrange:googleauth`), pole na User,
  UI setup + verify
- **Waga:** S-M (3-5 dni)

#### R-8.3 Audit log
- **Źródło:** UX_BIBLE.md §33
- **Opis:** Log każdej zmiany w systemie (kto, kiedy, co zmienił)
- **Wymaga:** entity AuditLog, aspect / Spring Data JPA listener
- **Waga:** M (1 tydzień)

#### R-8.4 RODO eksport / usunięcie
- **Źródło:** UX_BIBLE.md §33
- **Opis:** Endpoint do eksportu danych klienta na żądanie i anonimizacji
- **Wymaga:** logika anonimizacji (zostawić zamówienia, usunąć PII),
  UI w panelu admina
- **Waga:** M (3-5 dni)

### Wave 9 — Notyfikacje

#### R-9.1 Email/SMS dla klienta przy zmianie statusu
- **Źródło:** UX_BIBLE.md §28
- **Opis:** Klient dostaje SMS/email gdy zamówienie CONFIRMED, OUT_FOR_DELIVERY,
  DELIVERED
- **Wymaga:** SMS provider (Twilio / SMSAPI) + R-4.2 (email), templates,
  toggle w settings
- **Waga:** M (1 tydzień)

#### R-9.2 Browser push notifications dla admina
- **Źródło:** UX_BIBLE.md §28
- **Opis:** Push gdy admin nie ma otwartej zakładki
- **Wymaga:** PWA + service worker + push notification API
- **Waga:** M (1 tydzień)

#### R-9.3 Alerty (zamówienie czeka za długo, kurier spóźniony)
- **Źródło:** UX_BIBLE.md §28
- **Opis:** Background job sprawdzający progi czasowe + alert w UI
- **Wymaga:** scheduled jobs, definicje progów w settings
- **Waga:** M (4-5 dni)

### Wave 10 — Analityka

#### R-10.1 Dashboard z wykresami
- **Źródło:** UX_BIBLE.md §25
- **Opis:** Bar chart godzinowy, KPI dziś vs wczoraj, top produkty
- **Wymaga:** library (Recharts), endpointy `/api/admin/analytics/*`
- **Waga:** M (1 tydzień)

#### R-10.2 Eksport raportów CSV
- **Źródło:** UX_BIBLE.md §25
- **Opis:** Eksport zamówień za zakres dat
- **Wymaga:** endpoint streamingowy, generowanie CSV po stronie backendu
- **Waga:** S (2-3 dni)

#### R-10.3 Heatmapa godzin szczytu
- **Źródło:** UX_BIBLE.md §25
- **Opis:** Wykres dzień×godzina z natężeniem zamówień
- **Wymaga:** agregacja po stronie backendu, library
- **Waga:** S (2-3 dni)

### Wave 11 — Skalowanie

#### R-11.1 Multi-tenant
- **Źródło:** Architektura wpisana jako "przygotowanie pod" (CLAUDE.md)
- **Opis:** Jedna instalacja obsługuje wiele restauracji
- **Wymaga:** tenantId na wszystkich encjach, route based na subdomenie,
  refactor wszystkich query, separacja konfiguracji
- **Waga:** XL (3-4 tygodnie). **Pełny refactor.**

#### R-11.2 Multi-location dla jednej marki
- **Źródło:** UX_BIBLE.md §31
- **Opis:** Sieć restauracji — wybór lokalizacji przez klienta, wspólne
  menu, raporty zbiorcze
- **Wymaga:** Location entity, picker w UI klienta, dispatch zamówień
  do właściwej lokalizacji
- **Waga:** L (2-3 tygodnie)

#### R-11.3 PWA installable
- **Źródło:** UX_BIBLE.md §30
- **Opis:** Klient może "zainstalować" aplikację na home screen
- **Wymaga:** rozszerzenie `manifest.json`, service worker, install prompt
- **Waga:** S-M (3-5 dni)

#### R-11.4 File upload zdjęć produktów (zamiast URL)
- **Źródło:** UX_BIBLE.md §26, AD-010
- **Opis:** Admin uploaduje zdjęcia zamiast wklejać URL
- **Wymaga:** S3 / MinIO, upload endpoint, image processing (resize,
  WebP conversion), CDN
- **Waga:** M (1 tydzień)

### Wave 12 — Onboarding

#### R-12.1 Kreator pierwszego uruchomienia
- **Źródło:** UX_BIBLE.md §29
- **Opis:** 7-krokowy wizard dla nowego operatora restauracji
- **Wymaga:** UI kroków, walidacje completeness, progress tracker
- **Waga:** M (1 tydzień)

#### R-12.2 Import menu z CSV/Excel
- **Źródło:** UX_BIBLE.md §26, §29
- **Opis:** Operator masowo wgrywa menu z arkusza
- **Wymaga:** parser CSV, walidacja, preview przed zapisem
- **Waga:** M (4-5 dni)

#### R-12.3 Tryb testowy
- **Źródło:** UX_BIBLE.md §29
- **Opis:** Zamówienia w trybie testowym nie idą do prawdziwej kuchni
- **Wymaga:** flag `Order.isTest`, filtrowanie w panelu, oznaczenie wizualne
- **Waga:** S (2 dni)

---

## OUT OF SCOPE — celowo pomijamy

Te elementy z biblii **nie wejdą nigdy** w ramach tego projektu, bo wykraczają
poza filozofię "single-site engine dla małej restauracji":

- Dark mode panelu
- Dedykowana aplikacja mobilna admina (native iOS/Android)
- AI/ML predictions ETA / popytu
- Voice control / chat-bot
- Gamification, rozbudowane loyalty programs
- Multi-language UI (jedyne CZY jakaś wartość — angielski przy ekspansji,
  ale to wave 11 nie out of scope)
- Multi-currency (jeden region, jedna waluta)
- Dine-in QR menu
- Walk-in tablet kelnerski
- Kitchen lights / sygnalizacja świetlna powiązana z KDS
- SOC 2 / PCI Level 1 compliance (Stripe / P24 załatwiają większość)
