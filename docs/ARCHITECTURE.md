# ARCHITECTURE.md

Dokument żyjący. Aktualizuj tylko wtedy, gdy podejmowana jest świadoma decyzja
architektoniczna, która wymaga zapisu. Dopisuj pod sekcje, nie nadpisuj.

## Decyzje architektoniczne (decision log)

### AD-001: Modular Monolith
Zamiast mikroserwisów — jedna aplikacja Spring Boot z modułami (identity,
restaurant, menu, order, realtime). Powód: koszt operacyjny mikroserwisów
nieuzasadniony dla single-tenant MVP.

### AD-002: Frontend serwowany przez Spring Boot
Frontend buduje się do `dist/`, kopiowany do `backend/src/main/resources/static/`.
Jeden artefakt, jeden serwis na Railway, zero CORS. Separacja na osobny
deployment to 1-dniowa operacja gdy będzie potrzebna.

### AD-003: JWT w localStorage dla MVP
Akceptowane jako tech debt. Ryzyko XSS istnieje, ale panel admina nie
wyświetla user-generated content. Migracja do httpOnly cookie + SameSite=Strict
planowana dla wdrożenia produkcyjnego u realnego klienta.

### AD-004: RestaurantSettings jako singleton
Jeden rekord w tabeli z constraint, dostęp przez RestaurantSettingsService.
Przygotowanie pod przyszłe multi-tenant bez implementacji teraz.

### AD-005: Real-time — polling dla klienta, SSE dla admina (stretch)
Tracking klienta przez polling TanStack Query co 15s. SSE dla admin order
feed jako stretch goal w Fazie 4 (fallback: polling 5-10s).
Powód: klient 2-3 zmiany statusu na sesję — różnica niezauważalna. Admin
siedzi godzinami — SSE daje efekt demo i oszczędza polling traffic.

### AD-006: Snapshoty w OrderItem
OrderItem zapisuje productNameSnapshot, variantNameSnapshot, unitPriceSnapshot.
Zmiana ceny w menu nie może zmienić kwoty zamówień historycznych.

### AD-007: publicTrackingToken jako UUID v4
Bezpieczny identyfikator dla publicznego URL trackingu. Nie sekwencyjny,
niepredyktowalny.

### AD-008: State machine dla OrderStatus
Dozwolone transitions zdefiniowane w enumie. Nielegalna zmiana — 422.
OrderStatusHistory zapisywana automatycznie.

### AD-009: Optimistic locking (@Version) na Order
Dwóch adminów nie nadpisze sobie statusu po cichu. Konflikt — 409.

### AD-010: URL input dla zdjęć produktów w MVP
File upload odłożony do post-MVP. W MVP admin wkleja URL (seed używa
Unsplash). Zmiana lokalna w module menu gdy będzie potrzebna.

### AD-011: MenuAssembler split-query (2 zapytania) dla `GET /api/public/menu`
Jedno zapytanie z pełnym `@EntityGraph` (Category→Product→Variant
+ Product→ProductAddonGroup→AddonGroup→Addon) wyrzuca
`MultipleBagFetchException` (dwie kolekcje-bag na Product) i generuje
iloczyn kartezjański. Rozwiązanie: **dwa zapytania split + stitch w serwisie**:
- q1: `Category LEFT JOIN FETCH products LEFT JOIN FETCH variants`
  (jedna kolekcja-bag, `Set<>` na obu stronach, `ORDER BY displayOrder`)
- q2: `ProductAddonGroup JOIN FETCH addonGroup LEFT JOIN FETCH addons
  WHERE product.id IN :ids` (batch po znanych productIds z q1)

`MenuAssembler` łączy wyniki po `productId`. Łącznie ≤2 zapytania
dla całego menu, niezależnie od liczby produktów/wariantów/dodatków.
Ten sam assembler obsługuje `GET /api/public/products/{slug}` z filtrem
na slug + limit 1.

### AD-012: Slug generowany server-side z Polish-aware diacritic stripping
Pole `slug` (Category, Product) nie jest edytowalne w formularzu admina —
auto-derive z `name` przy create przez `shared.util.SlugGenerator`:
Polish stripAccents (ą→a, ę→e, ć→c, ł→l, ń→n, ó→o, ś→s, ź/ż→z + wariant
wielkich liter) → lowercase → `[^a-z0-9]+` zastępowane `-` → trim `-`.
Kolizje w DB (UNIQUE constraint) rozwiązywane suffixem `-2`, `-3`, …
Rename slugu odłożony na post-MVP (łamanie zewnętrznych linków / SEO).

### AD-013: Generator orderNumber `YYYY-NNNNN`
Dedykowana tabela `order_number_sequence(year INT PK, last_number INT)`.
Atomowy inkrement przez `SELECT ... FOR UPDATE` w tej samej transakcji co
INSERT do `orders`. Brak ryzyka kolizji przy concurrent checkout.
Format: `2026-00001` (NNNNN zerowane do 5 cyfr).

### AD-014: Cart line key
Pozycja koszyka identyfikowana po krotce `(productId, variantId|null,
sortedAddonIds)`. Identyczna konfiguracja → `qty++`; inna → nowa linia.

### AD-015: Snapshoty również dla `addonGroupName`
`OrderItemAddon` snapshotuje nie tylko nazwę i cenę dodatku, ale też nazwę
grupy w momencie zamówienia (do czytelnej historii w Fazie 4).

### AD-016: Klient nie wysyła cen
Request payload `POST /api/public/orders` zawiera tylko ID (`productId`,
`variantId`, `addonIds`) + `quantity` + dane klienta. Backend pobiera świeże
ceny z DB i liczy totals.

**From Phase 7.0 onwards** (delivery zones):

- Reguła obliczeniowa totalu:
  - `fulfillmentType=DELIVERY` → `Order.total = subtotal + deliveryFee`
  - `fulfillmentType=PICKUP`   → `Order.total = subtotal`,
    `deliveryFee=0`, `deliveryZoneName=NULL`
- Pola `Order.deliveryFee` (NUMERIC(10,2)) i `Order.deliveryZoneName`
  (VARCHAR(80) nullable) zapisywane przez `CheckoutService` jako **snapshot**
  w momencie tworzenia zamówienia. Ich wartości są niezmienne po późniejszej
  rekonfiguracji stref przez admina — historyczne totalsy nie zmieniają się.
- Kontekst i mechanika lookup'u strefy (exact + fallback), normalizacja
  adresu, alternatywy odrzucone — patrz **AD-019**. Tu pozostaje tylko
  reguła totalu i kontrakt snapshotu na encji Order.

### AD-017: State machine location — backend source of truth, FE mirror
Logika dozwolonych przejść statusu zamówienia (z uwzględnieniem
`FulfillmentType` dla gałęzi `READY → OUT_FOR_DELIVERY | DELIVERED`) żyje
w metodzie `canTransitionTo(OrderStatus next, FulfillmentType ft)` na enumie
`order.domain.OrderStatus` — **jedna prawda**. `OrderStatusService` wywołuje
tę metodę przed zapisem; naruszenie → `ApiException.unprocessable` → 422.
Frontend ma **mirror** w [features/admin/orders/lib/transitions.ts](../frontend/src/features/admin/orders/lib/transitions.ts)
(`allowedTransitions(status, fulfillmentType)`), używany **wyłącznie do UI**
(ukrywa niedostępne przyciski akcji w `OrderDetailPage`). Backend pozostaje
ostateczną bramką — FE dryft z enumem nie narazi spójności danych, co
najwyżej pozwoli pokazać przycisk który dostanie 422. Rozbieżność FE↔BE do
audytu przy każdej zmianie state machine.

### AD-018: SSE auth via query param `?token=`
`EventSource` (Web API) nie wspiera niestandardowych nagłówków, więc
JWT nie może lecieć w `Authorization`. Akceptowane rozwiązanie dla
showcase/demo: `GET /api/admin/orders/stream?token=...`. Filter
`identity.infrastructure.JwtAuthenticationFilter` akceptuje `?token=`
**wyłącznie dla tej jednej ścieżki** (`SSE_PATH = "/api/admin/orders/stream"`) —
każdy inny endpoint nadal wymaga `Authorization: Bearer`. Ryzyka: token
w Referer, w logach proxy, w URL historii. Do migracji przy wdrożeniu
produkcyjnym — preferowany wariant: httpOnly cookie + SameSite=Strict
(spina się z AD-003) albo fetch-stream polyfill zamiast `EventSource`.

### AD-019: Delivery zones lookup with (city, postal_code) fallback

#### Kontekst
Faza 7.0 wprowadza strefy dostawy. Pierwotna roadmapa (Wariant A)
zakładała "lista kodów pocztowych per strefa" — okazała się
niewystarczająca dla realnych przypadków:

- **1 kod pocztowy = wiele miejscowości.** Na wsi jeden kod (np. `05-180`)
  obejmuje 5+ wsi. Dopasowanie samym kodem dałoby fałszywe trafienie:
  klient z innej miejscowości pod tym samym kodem dostaje fee jak my.
- **1 miejscowość = wiele kodów pocztowych.** Większe miasta mają
  kilkanaście-kilkadziesiąt kodów. Wymóg, żeby admin wpisywał każdy
  kod osobno dla strefy "całe miasto X" jest błędogenny.
- **Override per-dzielnica.** Realny przypadek: NDM ma centrum (FREE)
  i dzielnicę Modlin-Twierdza (PAID 5 zł, kod `05-160`). Sam kod albo
  sama nazwa nie wystarczają — potrzebny mechanizm "general rule + override".

#### Decyzja
Adres dopasowywany przez parę `(city_normalized, postal_code)` z
`postal_code` opcjonalnym (NULL = wildcard miasta). Lookup kolejność:

1. **Exact match** `(city, postalCode)` — najbardziej szczegółowy wpis wygrywa
2. **Fallback** `(city, NULL)` — reguła ogólna dla całego miasta
3. **Brak trafienia** → `UNAVAILABLE`

Bardziej szczegółowy wpis (z konkretnym kodem) **nadpisuje** regułę
ogólną. Dwie strefy mogą legalnie współistnieć: "cały NDM darmowo" +
"NDM kod 05-160 za 5 zł" — to feature, nie konflikt.

Konkretnie (przykład NDM):
- `(NDM, NULL)` w strefie FREE
- `(NDM, '05-160')` w strefie PAID 5 zł
- Lookup `NDM + 05-100` → exact miss → fallback → **FREE**
- Lookup `NDM + 05-160` → exact hit → **PAID 5 zł** (override wygrywa)
- Lookup `Warszawa + cokolwiek` → miss + miss → **UNAVAILABLE**

#### Alternatywy odrzucone

- **Sam kod pocztowy.** Odrzucone — 1 kod = wiele wsi (false positive
  dla sąsiednich miejscowości).
- **Sama nazwa miasta.** Odrzucone — duplikaty nazw na PL, brak
  możliwości override per-dzielnica.
- **External geocoding API:**
  - **Google Places Autocomplete + Address Validation** — sesja
    terminowana ~$17-25/1K, free tier 10K/m. Wymaga karty kredytowej
    i monitoringu kosztów. Reżim "zero abonamentów dla klienta pizzerii"
    wyklucza.
  - **Mapbox Geocoding** — 100K req/m za darmo, potem $5/1K (ostry klif).
    Wymaga karty. Wyklucza ten sam reżim.
  - **HERE 250K free/m** — wymaga karty, dodatkowe EU compliance.
  - **Photon (Komoot, hosted)** — darmowy, OSM-based, ale bez SLA
    i jako public dependency. Akceptowalny, ale przeniesiony do
    **Fazy 7.2** jako opcjonalny upgrade dla klientów którzy zgłoszą
    potrzebę.
  - **Self-hosted Nominatim** — $200-500/m za hosting. Absurdalnie
    nieproporcjonalne dla MVP showcase.

Wybór `(city, postal_code)` z lokalnym autocomplete miast i format
mask kodu daje 90% wartości UX-owej za 0 zł — bez kart kredytowych
i bez zewnętrznych zależności.

#### Konsekwencje

- **UNIQUE z NULL.** PostgreSQL domyślnie traktuje `NULL` jako rozłączne
  w UNIQUE, więc samo `UNIQUE (city_normalized, postal_code)` nie blokuje
  zduplikowanego `(NDM, NULL)`. Wymagane jedno z dwóch:
  - `UNIQUE (city_normalized, postal_code) NULLS NOT DISTINCT` — PG 15+
  - `CREATE UNIQUE INDEX ... ON delivery_zone_area (city_normalized, COALESCE(postal_code, ''))` — działa od starszych wersji
  Wybór dokonywany w sesji implementacyjnej Fazy 7.0 po sprawdzeniu wersji
  PG w `docker-compose`.
- **Spójność normalizacji.** Funkcja normalizacji `city → city_normalized`
  musi działać identycznie w trzech miejscach: admin save area
  (`DeliveryZoneAdminService`), admin `/cities` listing
  (`DeliveryZonePublicController` → unique cities), public lookup
  (`DeliveryZoneLookupService`). Rozjazd → cichy miss przy lookup.
  Rekomendacja: jedna `AddressNormalizer` w `shared/`, używana z trzech
  miejsc.
- **Niezmienność historycznych totalów.** Po zmianie konfiguracji stref
  zamówienia historyczne nie zmieniają fee — mechanika snapshotów
  `deliveryFee` i `deliveryZoneName` na encji Order opisana w **AD-016
  (rozszerzenie z Fazy 7.0)**. Tu tylko cross-reference.

### AD-020: Single ADMIN role for operational views (MVP)

**Decyzja:** Nowe widoki operacyjne (Kuchnia, Wydanie, Dostawa) wymagają
roli `ADMIN`, tej samej co istniejące widoki admina. Nie wprowadzamy
osobnych ról `KITCHEN`, `DELIVERY`, `PICKUP`, `MANAGER`.

**Powody:**
- Target market (małe lokale 1-5 osób) operacyjnie funkcjonuje na zaufaniu
- RBAC to znaczna robota dodatkowa (3-5 dni) i blokowałby zamknięcie fazy
- Brak konkretnych use case'ów wymuszających granulację

**Konsekwencje akceptowane:**
- Wszyscy zalogowani widzą wszystkie zakładki
- Audit trail to jedna tożsamość ADMIN, bez per-user attribution
- Egzekwowanie podziału obowiązków = konwencja, nie technicznie

**Trigger do reewaluacji:**
- Klient zatrudnia zewnętrznych dostawców → potrzebne ograniczenie widoczności
- Zespół 5+ osób → potrzebny audit per-user
- Incident "kucharz zmienił ceny" → wymusza RBAC

### AD-021: Cancellation reason on OrderStatusHistory

**Decyzja:** Pole `reason: String?` (max 500 znaków, nullable) dodane
na `OrderStatusHistory`, nie na `Order`.

**Powody:**
- Logicznie powód należy do **eventu zmiany statusu**, nie do zamówienia
- Otwiera możliwość przyszłych powodów (np. "powód cofnięcia z READY do
  IN_PREPARATION" — gdyby kiedyś dopuszczone)
- `OrderStatusHistory` już istnieje, dodanie kolumny to addytywna
  migracja zero-risk

**Konsekwencje:**
- DTO `PATCH /status` rozszerzone o `reason?`
- `OrderStatusService` zapisuje `reason` przy zmianie statusu
- UI w `/admin/orders/:id` wyświetla `reason` w historii (jeśli niepuste)
- Walidacja: `reason` wymagane na froncie dla `CANCELED`, opcjonalne
  dla innych

**Out of scope:**
- Słownik predefiniowanych powodów (np. "klient odmówił", "brak
  składników") — na razie wolny tekst. Jeśli okaże się że potrzebne,
  dorobić w osobnej fazie.

### AD-022: Admin order list returns full detail shape

**Decyzja:** `GET /api/admin/orders` zwraca pełen detail shape (`items`
z addonami, `deliveryAddress` z `notes`, `customerNotes`, `etaSetAt`)
zamiast slim ListItem-only.

**Powody:**
- Widoki operacyjne Fazy 4.5 (Kuchnia/Pickup/Delivery) potrzebują tych
  danych do renderowania kart
- Spec Fazy 4.5 mówi „frontend filtruje istniejące `/admin/orders`" —
  żeby to było wykonalne bez nowych endpointów per-widok, lista musi
  mieć dane
- Alternatywa (osobne `fetchAdminOrderById` per karta) generowałaby
  HTTP storm: ~30 queries per widok per SSE invalidation w peak hour

**Konsekwencje akceptowane:**
- Payload listy ~5-10× większy (showcase scale: <100 KB przy 30 aktywnych
  zamówieniach, akceptowalne)
- Lista i detail mają zbieżny shape — przyszłe rozszerzenia detail
  trzeba propagować na list mapping (`AdminOrderQueryService.toItemDtos`
  / `toAddressDto` shared między obu mappings)
- N+1 risk wyeliminowany przez `@EntityGraph(attributePaths = {"items",
  "items.addons"})` na `OrderRepository.findAllFiltered`

**Trigger do reewaluacji:**
- Lokal z 200+ aktywnych zamówień w peak (skala wyłamująca się
  showcase'owi) — wtedy slim list + osobny endpoint
  `/admin/orders/operational` z paginacją i kolumnowo dobranym shape'em
- Memory profiling pokazuje że Hibernate trzyma za dużo entity graphs
  → consider DTO projection z manual JOIN

**Out of scope:**
- GraphQL / partial response — nie pasuje do reszty stacku
- Per-widok dedicated endpoint (`/admin/kitchen/orders` itp.) —
  explicite zakazane w spec Fazy 4.5

### AD-023: State machine extension — NEW → IN_PREPARATION for kitchen workflow

**Decyzja:** Rozszerzenie state machine `OrderStatus` o tranzycję `NEW →
IN_PREPARATION` (obok istniejących `NEW → CONFIRMED` i `NEW → CANCELED`).
Tranzycja addytywna — ścieżka `NEW → CONFIRMED → IN_PREPARATION` dalej
działa bez zmian.

**Powody:**
- Spec Fazy 4.5 wymaga ścieżki `NEW → IN_PREPARATION` dla widoku Kuchnia,
  ale jednocześnie deklaruje "state machine NIE rusza". Sprzeczność
  wewnętrzna spec'u rozwiązana świadomie.
- Małe lokale operacyjnie konflują "akceptuj zamówienie" i "rozpocznij
  przygotowanie" w jeden gest — `CONFIRMED` jako odrębny krok jest
  vestigial dla target marketu Fazy 4.5.
- Tranzycja addytywna — żadna istniejąca ścieżka nie zostaje złamana.
  Stary flow `NEW → CONFIRMED → IN_PREPARATION` dalej działa via
  `/admin/orders`.

**Konsekwencje akceptowane:**
- `CONFIRMED` staje się opcjonalnym pośrednim statusem (back-office
  confirm path).
- Kitchen filter pokrywa `NEW + CONFIRMED + IN_PREPARATION` (`CONFIRMED`
  widoczny w sekcji "NOWE" obok `NEW`); akcja "Przyjmij" działa identycznie
  dla obu i kieruje do `IN_PREPARATION`.

**Stan faktyczny od Fazy 8 (zweryfikowane 2026-08-12):** redesign „PIEC"
zastąpił jednogestową akcję "Przyjmij" dwoma osobnymi przyciskami —
`KitchenOrderCard` i `OrderDetailPage` oferują "Potwierdź zamówienie"
(`NEW → CONFIRMED`) i "Rozpocznij przygotowanie" (`CONFIRMED →
IN_PREPARATION`). **Skrót `NEW → IN_PREPARATION` nie jest wywoływany
z żadnego miejsca w UI** — pozostaje wyłącznie jako dopuszczona tranzycja
w `transitions.ts` i w state machine backendu. Historia statusów
potwierdza: zamówienia sprzed Fazy 8 mają w bazie ścieżkę skróconą,
wszystkie nowsze idą przez `CONFIRMED`. W konsekwencji trigger
reewaluacji "klient potrzebuje rozróżnienia »zaakceptowano ale jeszcze
nie zaczęto gotować«" **zadziałał** — patrz AD-027, rewizja 2026-08-12.

**Trigger do reewaluacji:**
- Pojawi się wymaganie capacity gating / payment verification między
  akceptacją a rozpoczęciem przygotowania.
- Klient potrzebuje rozróżnienia "zaakceptowano ale jeszcze nie zaczęto
  gotować" w UI lub raportach.

**Out of scope:**
- Usunięcie statusu `CONFIRMED` — dalej użyteczny dla back-office flow.
- Zmiana semantyki przycisku "Potwierdź" w `/admin/orders` detail
  (dalej `NEW → CONFIRMED`).

### AD-024: Ciemny motyw publiczny z akcentem z ustawień

**Decyzja:** Publiczna część serwisu (design v3 „PIEC") ma ciemną,
ciepłą paletę wpisaną na stałe w tokeny, ale kolor akcentu dalej pochodzi
z `RestaurantSettings.primaryColor`. Tokeny żyją w `styles/piec.css` pod
selektorem `html[data-public-theme="piec"]`; atrybut ustawia `PublicLayout`
na mount i zdejmuje na unmount.

**Powody:**
- Paczka designu jest ciemna i wygląda w tym konkretnym zestawie kolorów;
  parametryzacja tła i neutralnych rozmyłaby efekt bez zysku.
- Projekt jest jednak template'em adaptowanym pod kolejnych klientów
  (CLAUDE.md), więc obietnica „zmiana koloru w panelu przebarwia stronę"
  musi zostać. Akcent to jedyny kolor, który realnie definiuje markę.
- Zakres przez atrybut na `<html>`, a nie globalne nadpisanie tokenów —
  panel admina (D-08, nietknięty) zostaje na jasnych tokenach z
  `tokens.css` bez żadnego warunkowania po stronie panelu.

**Konsekwencje akceptowane:**
- `themeLoader` liczy dodatkowo `--color-on-primary` — kolor tekstu NA
  akcencie — porównując kontrast dwóch atramentów z paczki. Wybór przez
  porównanie, nie przez próg luminancji: próg wywraca się na kolorach ze
  środka skali (np. `#808080`). Bez tego ciemny akcent zjadałby napis
  na przycisku.
- Każdy nowy komponent publiczny musi używać `text-onPrimary` na tle
  akcentu, nigdy `text-white`.

**Trigger do reewaluacji:** klient chce jasnego wariantu strony publicznej
albo przełącznika motywu — wtedy dochodzi drugi komplet tokenów i pole
w `RestaurantSettings`.

### AD-025: Publiczny flow jako pełne ekrany

**Decyzja:** Ścieżka zamawiania to osobne route'y — `/menu`, `/menu/:slug`,
`/cart`, `/upsell`, `/checkout` — zamiast modala produktu i sticky
sidebara koszyka. Decyzja operatora przy wdrożeniu designu v3.

**Powody:**
- Design v3 projektuje każdy krok jako pełny ekran, z własnym sticky
  paskiem akcji; wciśnięcie tego w modal i sidebar dałoby hybrydę
  niepodobną do żadnej z wersji.
- Jeden flow zamiast dwóch (desktop/mobile) to mniej kodu warunkowego.
- Krok dosprzedaży (`/upsell`) nie ma sensownego odpowiednika w sidebarze —
  a jest jednym z ekranów, które mają zostać pokazane właścicielowi.

**Konsekwencje akceptowane:**
- Usunięte: `ProductModal`, `CartSidebar`, `CartBottomSheet`,
  `MobileCartBar`, `CartRow`, `CartButton`, `UpsellSection`,
  `FreeDeliveryProgress`, `CategoryTabs`, `PublicNav`, `PublicFooter`,
  `ProductCard`, `InfoBar`, `ClosedBanner`.
- `cartStore` NIETKNIĘTY — `buildLineKey` (AD-014), klucz persist
  i API akcji bez zmian. Zmienił się tylko sposób prezentacji.
- Zapis w CLAUDE.md o sidebarze 360px zastąpiony opisem flow.
- Edycja pozycji koszyka (dawny „edit pencil") wypadła: przy pełnych
  ekranach oznaczałaby nawigację do konfiguratora z pre-fillem i usunięcie
  starej linii. Klient usuwa i dodaje ponownie. Do ROADMAP, jeśli wróci.

### AD-026: `cashChangeFrom` walidowane względem kwoty zamówienia

**Decyzja:** `Order.cashChangeFrom` (D-03) jest nullable — `null` znaczy
„klient płaci odliczoną kwotą". Gdy jest ustawione, `CheckoutService`
odrzuca wartość niższą niż `total` jako 422.

**Powody:** „reszta ze 100 zł" przy rachunku na 132 zł to nie preferencja,
tylko błąd danych, którego kurier nie rozwiąże na miejscu. Porównanie
po doliczeniu `deliveryFee`, bo klient płaci kwotę końcową.

**Konsekwencje akceptowane:**
- Frontend nie pokazuje nominałów niższych niż kwota zamówienia — lista
  chipów jest liczona, nie sztywna jak w paczce.
- Pole jest widoczne w DTO admina i na kartach Wydania/Dostawy mimo D-08
  („panel nietknięty") — to dana operacyjna, nie zmiana stylu.

### AD-027: Mapowanie statusów na kroki trackingu zależne od typu realizacji

**Decyzja:** Publiczny tracking pokazuje pięć kroków mapowanych z sześciu
statusów backendu (D-05), z mapowaniem zależnym od `fulfillmentType`.
Mapowanie żyje wyłącznie na froncie (`order/lib/trackingSteps.ts`);
state machine i `OrderStatus` bez zmian.

**Rewizja 2026-08-12:** pierwotnie kroków były cztery, z `NEW` i
`CONFIRMED` scalonymi w „Przyjęte". Rozdzielone na „Otrzymane" (`NEW`)
i „Potwierdzone" (`CONFIRMED`) — uzasadnienie niżej.

**Powody:**
- `NEW` i `CONFIRMED` to dwa osobne kliknięcia w panelu („Potwierdź
  zamówienie" i „Rozpocznij przygotowanie") i nie ma między nimi skrótu
  w UI — mimo że state machine go dopuszcza (AD-023). Zamówienie realnie
  czeka w `CONFIRMED`: na Kuchni oba statusy leżą obok siebie w kolumnie
  „Nowe", więc lokal potwierdza przyjęcie od razu, a gotowanie zaczyna,
  gdy zwolni się piec. Scalony krok mówił klientowi „zajmujemy się tym",
  zanim ktokolwiek zamówienie potwierdził.
- `READY` znaczy co innego przy dostawie („czeka na kuriera", chowane
  pod „W drodze") niż przy odbiorze („przyjdź po odbiór") — i przy
  odbiorze jest najważniejszym momentem całego zamówienia.
- `CANCELED` nie jest krokiem osi, tylko osobnym stanem z telefonem.

**Konsekwencje akceptowane:**
- Dwa opisy tego samego statusu w zależności od kontekstu. Świadome —
  klient odbierający osobiście nigdy nie zobaczy „W drodze".
- Jeśli kiedyś wróci skrót `NEW → IN_PREPARATION` w UI panelu, krok
  „Potwierdzone" przestanie się pokazywać i mapowanie trzeba będzie
  scalić z powrotem. To jest trigger do reewaluacji tej decyzji.

### AD-028: Edycja treści zamówienia — wspólny silnik cenowy, snapshoty nietkniętych pozycji

**Kontekst:** klient dzwoni po złożeniu zamówienia i chce coś zmienić
(„bez cebuli", „dodajcie jalapeño"). Do 2026-08-12 admin nie miał jak —
musiałby anulować i wystawić nowe zamówienie, gubiąc numer, historię
statusów i link trackingowy, który klient ma już otwarty.

**Decyzja:** zamówienie jest edytowalne w miejscu, ale wyłącznie do
statusu `IN_PREPARATION` włącznie (`OrderStatus.isContentEditable()`).
Żądanie (`PATCH /api/admin/orders/{id}/items`) niesie **pełny stan
docelowy**, nie deltę; backend porównuje go z bieżącym i sam ustala, co
się zmieniło.

Reguła wyceny:

- Pozycja o **niezmienionej** krotce `(productId, variantId, posortowane
  addonIds, quantity)` zostaje **tą samą encją** ze swoim snapshotem
  cenowym (AD-006). Podwyżka w menu po złożeniu zamówienia nie ma prawa
  po cichu przepisać kwoty czegoś, czego admin nie tknął.
- Pozycja **nowa albo zmieniona** przechodzi przez `OrderLinePricer`
  z aktualnymi cenami menu.
- `OrderLinePricer` powstał z wyciągnięcia prywatnych metod
  `CheckoutService` — to **jeden silnik dla checkoutu i edycji**
  (CLAUDE.md §5). Tryb `CHECKOUT` egzekwuje dostępność produktu,
  `ADMIN_EDIT` nie: admin rozmawia z klientem przez telefon i wie, co jest
  na stanie, a chwilowo wyłączony produkt nie może blokować dopisania
  sosu (podgląd zwraca za to ostrzeżenie).
- `deliveryFee` i `deliveryZoneName` **nie są przeliczane** — adres się
  nie zmienia, a snapshot strefy z AD-016 ma pozostać niezmienny.
- Reguła AD-026 (`cashChangeFrom >= total`) jest sprawdzana na **nowej**
  sumie — inaczej podbicie zamówienia zostawiłoby nieaktualny nominał
  i kurier przyjechałby bez odpowiedniej reszty. Pole przychodzi zawsze
  jawnie, więc nie da się go „zapomnieć".
- `POST /{id}/edit/preview` liczy to samo bez zapisu, żeby admin widział
  cenę na żywo w trakcie rozmowy. Podgląd nie dotyka encji `Order` —
  nowe pozycje powstają jako obiekty wolne, więc nic nie wycieknie
  flushem na końcu transakcji.

**Konsekwencje akceptowane:**

- Detal zamówienia zwraca własny `AdminOrderItemDto` z identyfikatorami
  (wiersz, produkt, wariant, dodatki); publiczny tracking zostaje przy
  `OrderTrackingItemDto` bez nich.
- Edycja zmieniająca **tylko notatkę pozycji** brudzi `order_items`,
  a nie `orders`, więc `@Version` sam by się nie podbił. Serwis wymusza
  inkrement (`OPTIMISTIC_FORCE_INCREMENT`), inaczej AD-009 przestałoby
  obowiązywać dla takiej edycji i drugi admin nadpisałby ją po cichu.
- Usunięcie wszystkich pozycji jest zabronione — wycofanie całości to
  anulowanie (D-05), nie edycja do zera.
- Nowe zdarzenie `ORDER_EDITED` (nie `ORDER_STATUS_CHANGED`): widoki
  operacyjne odświeżają listę, ale nie grają dźwiękiem — tabela dźwięków
  z Fazy 4.5 zostaje nietknięta.

**Poza zakresem:** zamówienia opłacone online. Nie istnieją (Faza 6),
a ich edycja wymaga rozliczenia różnicy (refund / dopłata) — zapisane
w `ROADMAP.md` przy Fazie 6 jako warunek jej wypuszczenia.

### AD-029: Historia edycji z cofaniem o krok, snapshot w JSONB

**Decyzja:** każda edycja zapisuje wiersz w `order_edit`: kto, kiedy,
czytelny po polsku opis zmian (`summary`, jedna zmiana w jednej linii),
suma przed i po oraz `snapshot_before` (JSONB) ze stanem sprzed edycji.
Cofnięcie odtwarza pozycje **wprost ze snapshotu**, bez odpytywania menu.

**Powody:**

- Odtworzenie ze snapshotu jest wierne nawet wtedy, gdy produkt zdążył
  zniknąć z karty albo zmienić cenę — przeliczanie przy cofaniu mogłoby
  dać inną kwotę niż ta, do której wracamy.
- Opis generuje serwis, który zna mapowanie „linia żądania ↔ poprzednia
  pozycja", więc zmiana ilości opisuje się jako zmiana ilości, a nie jako
  usunięcie i dodanie. Surowy JSON nigdy nie trafia do DTO.
- Encja `OrderEdit` celowo **nie wisi** na `@OneToMany` w `Order` —
  grafy encji w `OrderRepository` i kształt payloadu listy (AD-022)
  zostają bez zmian. Historia dokleja się wyłącznie do detalu, jednym
  dodatkowym zapytaniem.

**Zakres cofania:** przycisk zdejmuje najnowszy jeszcze niecofnięty wpis;
kolejne kliknięcie schodzi o edycję wcześniejszą (cofanie łańcuchowe —
wychodzi za darmo z modelu „wpis trzyma stan sprzed siebie"). To **nie
jest wersjonowanie**: nie ma skoku do dowolnego punktu historii, tylko
krok wstecz. Cofnięcie nie kasuje wpisu, tylko stempluje go
(`undone_at`/`undone_by`) — ślad po operacji jest wart więcej niż czysta
lista. Te same bramki co edycja: status i wersja.

**Trigger do reewaluacji:** gdyby pojawiła się potrzeba przywrócenia
zamówienia do dowolnego punktu historii albo audytu per-użytkownik
szerszego niż jedna tożsamość ADMIN (AD-020).

## Domain conventions

### Address normalization (od Fazy 7.0)

Kontrakt normalizacji adresu wymagany przez AD-019:

- **City** (`city_normalized`):
  1. lowercase
  2. strip diakrytyków (`Łomianki` → `lomianki`, `Nowy Dwór` → `nowy dwor`).
     Polish stripAccents jak w `shared.util.SlugGenerator` (AD-012).
  3. collapse whitespace (multiple spaces → single space, trim)
- **City display** (`city_display`) — oryginalna pisownia z formularza
  admina, jedyne pole pokazywane userowi
- **Postal code** (`postal_code`):
  - Format kanoniczny: `^\d{2}-\d{3}$` (PL standard, **zawsze z myślnikiem**)
  - Auto-formatowanie wejścia: `01234` → `01-234`, strip whitespace
  - NULL = wildcard miasta (cała miejscowość objęta strefą)

Implementacja: jedna `AddressNormalizer` w module `shared/`, wywoływana
przez `DeliveryZoneAdminService` (przy save area), publiczny endpoint
`/api/public/delivery/cities` oraz `DeliveryZoneLookupService`
(przy lookup). Rozjazd między tymi trzema miejscami → cichy miss.

## Znane ograniczenia / tech debt świadomie zaakceptowane

### Phase 7.0 — accepted trade-offs

- **Native HTML `<datalist>` instead of custom Combobox in CityCombobox.**
  Plan zakładał React combobox z normalized-prefix matching. Wybrano
  natywny `<datalist>` (~0 LoC vs ~150). Konsekwencje: matching jest
  substring-based (browser default) zamiast normalized-prefix; iOS
  Safari ma surowe stylowanie panelu sugestii. Funkcjonalnie kontrakt
  zachowany — backend `AddressNormalizer` normalizuje przy lookup,
  więc lookup działa niezależnie od capitalizacji/diakrytyków.
  Akceptowalne dla typowego zbioru 10-30 miast w bazie pizzerii.
  Upgrade do custom Combobox — `ROADMAP.md` 7.1 jeśli klient zgłosi
  UX issue.

- **Race window: admin PATCH fee vs concurrent client checkout.**
  Klient widzi badge `5 zł`, klika „Złóż zamówienie", admin równocześnie
  PATCH fee → 10 zł. Backend re-lookuje przy `placeOrder` i snapshotuje
  aktualną wartość (10 zł) — klient zostaje obciążony inną kwotą niż
  widział. Nie ma `LockModeType` ani echo `expectedDeliveryFee` z payloadu
  klienta. W praktyce dla single-tenant MVP rzadkie; akceptowalne.
  Mitigacja w 7.1 — patrz `ROADMAP.md`.

### Pozostałe

- JWT w localStorage (AD-003) — do migracji przy wdrożeniu produkcyjnym.
- Brak refresh tokenów — klient musi się zalogować ponownie po 12h.
- SSE token w query param (AD-018) — do migracji na httpOnly cookie
  przy wdrożeniu produkcyjnym.
- Brak skalowania SSE na wiele instancji (brak Redis pub/sub) — Railway
  w MVP = 1 instancja. `SseEmitterRegistry` trzyma emitery in-memory;
  broadcast dociera tylko do klientów podpiętych do tego samego JVM.
- Godziny otwarcia bez wyjątków świątecznych — do dodania post-MVP.
- Statyczne obrazki bez CDN — OK dla showcase, dla produkcji rozważyć
  S3 + CloudFront.

## Model domeny (high-level)

### Identity
- User (id, email, passwordHash, displayName, role, active, createdAt)

### Restaurant configuration
- RestaurantSettings (singleton: id=1)
- OpeningHours (per dzień tygodnia)
- PageContent (sekcje: HERO, ABOUT)

### Menu
- Category
- Product (z basePrice, imageUrl jako URL)
- ProductVariant (rozmiar z ceną absolutną)
- AddonGroup (minSelect, maxSelect, required)
- Addon
- ProductAddonGroup (m2m)

### Order
- Order (z orderNumber, publicTrackingToken UUID, status, @Version)
- OrderItem (ze snapshotami)
- OrderItemAddon (ze snapshotami)
- OrderStatusHistory

## Struktura modułów backendu

```
com.pizzashowcase
├── config/        # Spring configs, Security, CORS, Jackson
├── shared/        # ErrorHandler, Money, wspólne DTO, exceptions
├── identity/      # User, auth, JWT
├── restaurant/    # RestaurantSettings, OpeningHours, PageContent
├── menu/          # Category, Product, Variant, Addon
├── order/         # Order, CheckoutService, state machine
├── realtime/      # SSE (Faza 4 stretch), EventPublisher
└── PizzaShowcaseApplication.java
```

Warstwy w module: `api/` (controllers, DTO) → `application/` (services) →
`domain/` (entities, VO, enums) → `infrastructure/` (repositories).
