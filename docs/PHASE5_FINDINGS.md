## Logic delta — itemNote + manual close + ETA prep

Phase 5 retrofit świadomie pomija 3 logic features wymagane przez 
PHASES.md (F2, F4, F11 lub odpowiedniki). Po Warstwie 3a/3b operator 
robi osobny task który dotyka frontendu + backendu spójnie:

1. itemNote (PHASES.md F2):
   - Backend: OrderItem.itemNote pole + migracja Flyway + DTO + endpoint
   - Frontend: CartItem.customerNote w store + addItem signature + 
     updateNote akcja + ProductModal textarea (max 200 zn) + 
     CartSidebar/Sheet inline display/edit + checkout snapshot
   - Świadomie pomijane: M-017 textarea customer notes

2. manual close (Faza 5 M1):
   - Backend: RestaurantSettings.manualClosedReason + manualClosedUntil
   - Frontend: ClosedBanner branch 'manual' (typeunion już zachowany)
   - Świadomie pomijane: M-013 ClosedBanner manual variant (TODO)

3. ETA prep (Faza 5 M1):
   - Backend: defaultPreparationMinutes + minOrderAmount + 
     freeDeliveryFrom + globalny deliveryFee w SettingsDto
   - Frontend: graceful fallback w komponentach Warstwy 3a (M-014, 
     M-015, M-021, M-022) — TS interface ma opcjonalne pola, 
     komponenty rendering null/skip gdy undefined
   - Świadomie pomijane: aktywacja modułów po M1 backend

4. Menu page headline edytowalny (Warstwa 3a fix-up F-002):
   - Aktualnie `frontend/src/features/public/menu/MenuPage.tsx` ma
     hardcoded headline "Wybierz, co zjesz." (bundle Stage 2 copy)
   - Post-MVP: pole `menuHeadline?: string | null` w PageContentDto
     ("MENU" entry obok HERO/ABOUT) lub osobny entry "MENU_HEADING"
     w PageContent admin sekcji
   - Frontend: zastąpić hardcoded copy `pageContent?.MENU?.title`
     z fallback do bundle copy gdy null
   - Admin UI: SettingsLayout → Treści strony → tab Menu (lub
     extension istniejącego PageContent admin formularza)
   - Świadomie poza scope Warstwy 3a fix-up

5. Walidacja formatu telefonu w admin Settings (Warstwa 3a fix-up F-006):
   - PublicNav (desktop label, mobile icon button) renderuje raw
     `settings.phone` z formatem zachowanym z admin form
   - Post-MVP: walidacja w admin Settings → Ogólne (input phone):
     sugestia maski `+48 XXX XXX XXX` lub similar PL standard
     (np. react-input-mask lub native pattern attribute)
   - Backend: regex `^\+?\d[\d\s-]{8,15}$` na endpoint update
     (Bean Validation @Pattern), zwrócić błąd 422 gdy malformed
   - Frontend: Zod schema walidacja przed PUT /admin/settings,
     toast error gdy format niepoprawny
   - Świadomie poza scope Warstwy 3a fix-up (UI walidacja gap)

6. About section stats trio (Warstwa 3a fix-up F-007 / AD-Δ5):
   - Bundle Stage 2 AboutSection ma 3 stats hardcoded:
     "8 lat / 40+ pozycji / 35 min"
   - My pomijamy w F-007 — `PageContentDto.ABOUT` (title/body/imageUrl/
     ctaLabel/ctaHref) nie ma pól stats; hardcoded narusza CLAUDE.md
   - Post-MVP opcje:
     A) Pola `foundedYear?: number | null` + `quickStats?: string[]`
        w PageContentDto.ABOUT entry + admin UI w PageContentPage
     B) Derive z dostępnych źródeł:
        - "{N}+ pozycji" z `usePublicMenu().categories.flatMap(...).length`
        - "{N} lat" z `RestaurantSettings.foundedYear` (gdy doda się)
        - "{N} min" z `settings.defaultPreparationMinutes` (Faza 5 M1)
     C) Dedicated 4-th PageContent entry "STATS" z body jako triple
   - Świadomie poza scope Warstwy 3a fix-up

7. Contact section "Strefa dostawy" wire-up (Warstwa 3a fix-up F-007 / AD-Δ6):
   - Bundle Stage 2 ContactMapSection ma 4-tą sekcję pod
     ADRES/TELEFON/E-MAIL: "STREFA DOSTAWY" z listą miast + link
   - My pomijamy w F-007 — backend ma data (DeliveryZoneDto.areas),
     ale brak public endpoint dla landing
   - Post-MVP wire-up:
     - Backend: wystawić `GET /public/delivery-zones-summary` zwracający
       unique areas z `DeliveryZone WHERE active = true`
     - Frontend: ContactSection dodać 4-ty field z `useQuery(["public",
       "delivery-zones-summary"])` z renderowaniem "Dostarczamy do:
       {area1}, {area2}, {area3}+" (limit 3-4 + "i więcej" link do
       delivery zone checker w checkout flow)
     - `features/admin/delivery-zones/` już istnieje (M-040 done lub
       in-progress) — backend ma model, tylko brak public projection
   - Świadomie poza scope Warstwy 3a fix-up

8. Footer social icons (Warstwa 3a fix-up #2 F-013):
   - Bundle Stage 2 footer Brand col ma 2 social icons (Facebook / Instagram)
     z `rgba(255,255,255,0.15)` border, 36×36px, hardcoded href="#"
   - Backend `SettingsDto` NIE ma pola `socialLinks` → świadomie pominięte
     w F-013 (bez backend touch w fix-upie)
   - Tagline (`SettingsDto.tagline: string | null`) JUŻ istnieje w DTO i jest
     używane w PublicFooter Brand col (graceful fallback null → element skip,
     pattern identyczny z Fazą 5 M1 modułami)
   - Post-MVP wire-up social:
     - Backend: dodać `socialLinks: SocialLinkDto[]` (provider + url) lub
       proste pola `facebookUrl?: string`, `instagramUrl?: string` w SettingsDto
     - Frontend: PublicFooter Brand col render conditional gdy links present,
       komponent `<SocialIconLink>` z mapowaniem provider→ikona (lucide-react
       Facebook, Instagram)
     - Admin SettingsPage tab "Social" lub inline w Ogólne

9. CategoryTabs scroll-spy dynamiczny offset (Warstwa 3a fix-up #3 follow-up):
   - `frontend/src/features/public/menu/components/CategoryTabs.tsx:32` ma
     `IntersectionObserver` z `rootMargin: "-200px 0px -60% 0px"` oraz scroll
     target offset `-200` w `getBoundingClientRect().top + window.scrollY - 200`
     (linia 48). Magic `-200` zakłada statyczny sticky stack 200px.
   - Po F-014 sticky stack jest dynamiczny (115-220px zależnie od stanu
     ClosedBanner / FreeDeliveryProgress / CategoryTabs sam siebie). Active
     pill aktywuje się z lekkim opóźnieniem przy scroll przez kategorie,
     bo IntersectionObserver triggeruje gdy section krzyżuje -200px linię
     niezależnie od rzeczywistej pozycji sticky stacka.
   - Akceptowalny kompromis w fix-upie #3 — niezauważalny w typowym
     scroll. NIE dotykane.
   - Post-MVP fix: zastąpić `-200` przez odczyt
     `parseInt(getComputedStyle(document.documentElement)
       .getPropertyValue("--sticky-stack-height")) || 200` w obu miejscach
     (rootMargin musi być string, więc template literal). Wymaga że
     ResizeObserver z F-014 odpalił przed IntersectionObserver setup —
     w praktyce useEffect order zapewnia to (MenuPage ResizeObserver
     useEffect odpala wcześniej niż CategoryTabs IntersectionObserver
     useEffect, bo MenuPage rendering parent → first).
   - Świadomie poza scope Warstwy 3a fix-up #3 — wymaga ostrożnego
     dorobienia z testem (cross-cat scroll smoke) i niewielki impact
     na UX (~50ms delay przy aktywacji pill).

10. TrackingTimeline per-step timestamps (Warstwa 3b · M-025 follow-up):
    - Bundle Stage 2 `confirmation-and-tracking.jsx` TrackingDesktop (L103)
      i TrackingMobile (L190) pokazują per-step `time` font-mono 10-11px
      `text-slate-400` z wartościami `'18:12' / '~18:32'` (rzeczywisty
      timestamp dla done/active stages, szacowany ETA dla pending).
    - `frontend/src/features/public/order/components/TrackingTimeline.tsx`
      pomija per-step timestamps w obu layoutach. Backend
      `OrderTrackingDto` (`shared/api/orderApi.ts`) wystawia tylko
      `placedAt`, `etaSetAt`, `etaMinutes` — brak per-status timestamp
      historii.
    - Aby per-step time działało, backend musiałby wystawić
      `statusHistory: { status: OrderStatus, timestamp: string }[]`
      (plus migracja Flyway dodająca tabelę `order_status_history`
      lub kolumnę JSON snapshot na `orders`).
    - Aktualnie graceful skip — global ETA pokazuje EtaCard w
      TrackingPage (M-026) z `live`/`legacy`/`pending` modes. Per-step
      timestamps nie są krytyczne dla MVP — klient widzi current state
      + overall ETA, czego potrzebuje.
    - Post-MVP backend M3 task: dodać `OrderStatusHistoryDto`,
      endpoint zwraca historię z `OrderTrackingDto`. Frontend renderuje
      `<div className="font-mono text-[10px] text-[rgb(var(--color-text-faint))] mt-0.5">{formatTime(historyEntry.timestamp)}</div>`
      pod label per stage (horizontal + vertical layout).
    - Świadomie poza scope Warstwy 3b — wymaga backend touch (poza
      "Backend bez touch" constraint M-025/M-026).

12. AdminDashboardStatsToday brak `preparationAverageMinutes` + `canceledLast24h` (Warstwa 4 · M-028 / AD-Δ9):
    - Bundle Stage 3 `frame-dashboard.jsx` pokazuje 4 KPI: Zamówienia /
      Sprzedaż / Czas przygotowania / Anulowane (24h). My zachowujemy
      Zamówienia / Sprzedaż / Średnia / Aktywne bo backend
      `AdminDashboardStatsToday` (`AdminDashboardStatsDto.java`) wystawia
      `orderCount`, `totalRevenue`, `averageOrderValue`, `deliveryCount`,
      `pickupCount`, `canceledCount`. Brak preparation avg ani 24h rolling
      canceled.
    - Post-MVP backend M2 delta:
      A) `preparationAverageMinutes: Integer | null` — rolling avg z
         `order_status_history` (transition CONFIRMED→READY lub
         IN_PREPARATION→READY), last 24h window
      B) `canceledLast24h: Long` — count CANCELED orders w sliding 24h
         (vs canceledCount today only)
    - Frontend StatTile + dashboard layout gotowy do dodania 5/6 KPI gdy
      backend doda pole — wystarczy mapowanie w DashboardPage.
    - Świadomie poza scope Warstwy 4 — AD-Δ9 w MIGRATION_ERRATA.

13. AdminDashboardTopProductStats brak `revenue` + `salesShare` (Warstwa 4 · M-028 / AD-Δ10):
    - Bundle Stage 3 Top Products row pokazuje grid 5-col: rank + name +
      qty + revenue mono + share % progress bar. Backend wystawia tylko
      `productName` + `totalSold`.
    - Post-MVP backend M2 delta:
      A) `revenue: BigDecimal` — sum `OrderItem.lineTotal` per product per
         30 days (exclude CANCELED orders)
      B) `salesShare: BigDecimal` — `revenue / totalRevenue30d * 100`
         (server-computed pour ergonomic frontend)
    - Frontend `TopProductsList.tsx` gotowy do dodania kolumn — wystarczy
      rozszerzyć grid template + render revenue + share progress bar.
    - Świadomie poza scope Warstwy 4 — AD-Δ10 w MIGRATION_ERRATA.

14. AdminOrderDto `trackingToken` field — RESOLVED w Warstwie 4 via AD-Δ13:
    - Backend `AdminOrderDto.java` zawiera `String trackingToken` od M-033
      (commit e030b93). `AdminOrderQueryService.toDto()` mapuje
      `order.getPublicTrackingToken().toString()`.
    - Frontend OrderDetailPage używa do linka "Otwórz tracker klienta →"
      do `/track/{token}` (target="_blank").
    - Operator's N3 decyzja: świadomy wyjątek od "Zero Backend Touch"
      bo gap funkcjonalny support workflow, zmiana trywialna.

15. AdminOrderDto brak `paidAt` flag — payment status snapshot (Warstwa 4 · M-033 follow-up):
    - Bundle Stage 3 `frame-order-detail.jsx` Płatność card pokazuje
      paid status pill ("Opłacone" / "Nieopłacone") + button "Oznacz jako
      opłacone" gdy `!paid`. Backend `AdminOrderDto` brak `paidAt`
      timestamp ani `paid` boolean — wszystkie zamówienia w MVP są
      gotówka pre-fulfillment, więc payment-confirmed-by-operator workflow
      nie był implementowany.
    - Post-MVP backend M2 delta:
      A) `Order` entity dodać kolumnę `paid_at: TIMESTAMPTZ NULL`
      B) Endpoint `PATCH /admin/orders/{id}/mark-paid` z
         `OrderStatusService.markAsPaid()` — set `paid_at = now()`
         + audit entry w `order_status_history` (typ "PAYMENT_CONFIRMED"
         lub osobny event log)
      C) `AdminOrderDto.paidAt: Instant | null` w response
    - Frontend OrderDetailPage Płatność card gotowy do dodania button +
      conditional pill — wystarczy `markAsPaid` mutation hook + `paidAt`
      state machine.
    - Świadomie poza scope Warstwy 4 — operator's N4 decyzja batch.

16. OrderTrackingItemDto brak per-item `note` field (Warstwa 4 · M-033 follow-up):
    - Bundle Stage 3 `frame-order-detail.jsx` items list pokazuje per-item
      yellow note alert "Notka: bez bazylii proszę" jako focal. Backend
      `OrderTrackingItemDto` wystawia `productName`, `variantName`,
      `quantity`, `unitPrice`, `lineTotal`, `addons` — brak per-item note.
    - Customer-level `customerNotes` field istnieje (od Fazy 2 F2) i jest
      already rendered w OrderDetailPage right-col yellow banner — pokrycie
      80% use cases ("notka do całego zamówienia").
    - Post-MVP backend M2 delta — wymaga PHASES.md F2-related work:
      A) `OrderItem` entity kolumna `customer_note: TEXT NULL` (max 200 zn)
      B) `OrderTrackingItemDto.note: String | null` w response
      C) Frontend cart/checkout: per-item textarea w ProductModal lub
         CartSidebar/Sheet (bundle pattern), max 200 zn, persisted w
         CartItem store + serialized w place-order payload
    - Świadomie poza scope Warstwy 4 — szerszy gap niż display-only.

17. AdminOrdersQuery brak per-status count aggregate (Warstwa 4 · M-032 / AD-Δ14):
    - Bundle Stage 3 `frame-orders.jsx` filter chips pokazują per-status
      count ("Nowe 3", "Potwierdzone 4", itd.). Backend `/admin/orders`
      zwraca `SpringPage<AdminOrderListItemDto>` z `totalElements` (one
      number) — brak `Map<OrderStatus, Long>` aggregate.
    - Post-MVP backend M2 delta:
      A) Osobny endpoint `GET /admin/orders/counts?dateFrom=X&dateTo=Y`
         zwraca `Map<OrderStatus, Long>` per filtered range, lub
      B) Embedded `statusCounts` w SpringPage response wrapper
         (`AdminOrdersPageResponse extends SpringPage` z dodatkowym polem)
    - Frontend OrderFilters chips gotowe do dodania count — wystarczy
      hook `useOrdersCountsQuery({dateFrom, dateTo})` + render mono count
      w chip span.
    - Świadomie poza scope Warstwy 4 — AD-Δ14 w MIGRATION_ERRATA.

18. SettingsDto brak `foundedYear` field (Warstwa 4 · M-027 / AD-Δ8):
    - Bundle Stage 3 `frame-login.jsx` brand panel kicker accent-yellow
      pokazuje "ŁOMIANKI · OD 2018". Drugi fragment "OD {rok}" wymaga
      `foundedYear: Integer | null` w SettingsDto.
    - W M-027 renderowane jest tylko `settings.data?.city` (graceful skip
      gdy null); "OD {rok}" pominięte.
    - Post-MVP backend M2 delta (tani):
      A) `RestaurantSettings` entity dodać `founded_year: SMALLINT NULL`
      B) `SettingsDto.foundedYear: Integer | null` w response
      C) Admin UI: numeric input w Settings → Ogólne (rok min 1900,
         max current year)
    - Frontend LoginPage gotowy do dodania — wystarczy template literal
      kicker `{city}{foundedYear ? ` · OD ${foundedYear}` : ''}`.
    - Świadomie poza scope Warstwy 4 — AD-Δ8 w MIGRATION_ERRATA.

19. TrackingTimeline ikony — lucide vs MIGRATION_PLAN emoji (Warstwa 3b · M-025 audit trail):
    - `MIGRATION_PLAN.md` M-025 spec mówi: emoji ikony per stage
      `(⏳ ✓ 👨‍🍳 🛵 🎉)` + 6th cancelled `(✕)`.
    - Bundle Stage 2 `confirmation-and-tracking.jsx` (L92-99, L181-182)
      używa lucide-react: `checkCircle / flame / pkg / truck / home`.
    - W M-025 wybrano **lucide** (per bundle + spójność z resztą
      Warstwy 3a — CartButton, FulfillmentTile, PaymentTile używają
      lucide). Emoji wprowadzałyby visual inconsistency.
    - `STATUS_ICONS` mapping (TrackingTimeline.tsx L24-32):
      `NEW: CircleCheck`, `CONFIRMED: ClipboardCheck`,
      `IN_PREPARATION: Flame`, `READY: PackageCheck`,
      `OUT_FOR_DELIVERY: Truck`, `DELIVERED: Home`,
      `CANCELED: CircleCheck` (placeholder — canceled state
      rendered jako separate alert card w TrackingPage, nie w timeline).
    - Świadomy mismatch vs MIGRATION_PLAN — udokumentowany w
      `MIGRATION_ERRATA.md` jako AD-Δ7 po M-026 (cała Warstwa 3b done).

20. Mobile topbar compression hidden segments <640px (Warstwa 4 fix-up #5 · F-025 + follow-up):
    - Po F-025 AdminTopbar w 48px single-line: `[hamburger] [title] ·
      [metadata] [LiveBadge] [page actions] [SoundToggle] [Wyloguj]`.
      Na 375px viewport intrinsic right-side ~280px + hamburger 36px +
      gaps 24px = >340px, zostawiałoby <40px na title → title
      kolapsował do 0px shrinka (testowany regress, fix follow-up commit).
    - Świadome hide poniżej `sm` (640px) — kolejność priorytetów:
      a) `· metadata` (telemetry "W toku: 3 · cel: 18 min", "3
         zamówienia gotowe", "Piątek · 8 maja 2026") — `hidden sm:inline`
         w `AdminTopbar`
      b) `LiveBadge` ("Polling 15s", "Polling 10s", "Polling 60s",
         "Live · połączono") — `hidden sm:inline-flex`
      c) Page actions: `OrderDetail.Drukuj`, `OrdersList.Eksport CSV`,
         `OrderDetail.Tracker` (już `hidden md:inline-flex`) —
         `hidden sm:inline-flex` w komponentach page
    - Pozostają widoczne na <640px: hamburger ☰, **title bold**,
      SoundToggle (audio cue operacyjny — krytyczny), Wyloguj.
    - Powód: szerokość 375 nie pomieści wszystkiego bez kompromisu.
      Alternatywy odrzucone:
      (a) wrap-on-overflow 2-line — kolapsuje 48px compression benefit
      (b) skrócenie metadata strings — utrata informacji
      (c) hide SoundToggle — utrata operational audio awareness
      (d) hide Wyloguj — primary CTA musi być reachable
    - Operator decision 2026-05-19: hide a/b/c, keep title +
      SoundToggle + Wyloguj. Page identity covered by:
      - active sidebar nav item (w drawer-mode po tap hamburger)
      - page title bold w topbar (zawsze widoczny, truncate-on-overflow)
    - Metadata + LiveBadge = glanceable telemetry dla operator
      workflow na 640+ (kuchnia tablet / 1280 desktop); mobile =
      managerial check-in gdzie identity > telemetry.
    - Title h1: `min-w-0 truncate sm:shrink-0 sm:overflow-visible
      sm:text-clip` — na mobile ellipsis "Zamówienie 2026-…", na sm+
      bez truncate (metadata absorbuje shrinkage).
    - Świadome odstępstwo — udokumentowane w MIGRATION_ERRATA.md
      jako AD-Δ15 (compressed topbar) plus tu jako mobile behavioral
      note.

---

**Wersja 2.6** · 2026-05-19 · Warstwa 4 fix-up #5 closure. Dodane
#20 mobile metadata visibility. AD-Δ15..18 w MIGRATION_ERRATA.md.