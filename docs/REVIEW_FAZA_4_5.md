# Review Fazy 4.5 — Operational UI Split

**Reviewer:** Claude Code (osobna sesja, świeże oczy, nie pisałem tego kodu)
**Data:** 2026-04-30
**Branch:** `design/g10-polish`
**Zakres commitów:** `a0aa507..HEAD` (14 commitów: M1–M10 + handoff doc + fix(phase-7.0))

---

## 0. Mapowanie git (sanity check)

| Commit | Konwencja | Sanity |
|---|---|---|
| `979467a` docs: add faza 4.5 handoff document | ✅ | spec doc, OK |
| `3f05b40` feat(phase-4.5): M1 add reason column to OrderStatusHistory | ✅ | migracja V11 + encja |
| `19527a0` feat(phase-4.5): M2 reason on status DTO + dashboard/stats endpoint | ✅ | DTO + service |
| `7e6a67a` fix(phase-7.0): align DeliveryZonesPage badge variants | ✅ | **chirurgiczny: 4+4 linie w 1 pliku** (mapowanie `secondary→muted`, `destructive→danger`, `outline→muted`) — bez zmian w `BadgeVariant` unii. Zgodne z briefem. |
| `caa705a` feat(phase-4.5): M3 install recharts, add per-view sound utilities | ✅ | recharts 3.8.1 + lib/sounds.ts |
| `7134d69` feat(phase-4.5): M3.5 enrich AdminOrderListItemDto for operational views | ✅ | AD-022, dodany w trakcie |
| `2879629` feat(phase-4.5): M4 kitchen view | ✅ | |
| `6cccb62` feat(phase-4.5): M5 pickup view | ✅ | |
| `e4119e2` feat(phase-4.5): M6 delivery view | ✅ | |
| `3b3926c` feat(phase-4.5): M7 manager dashboard | ✅ | |
| `14edd7f` feat(phase-4.5): M8 cancellation reason input + history display | ⚠️ | handoff plan zakładał M8=SoundService, M9=reason — zostało zamienione. Konwencja OK, kolejność inna |
| `dfbbab3` feat(phase-4.5): M9 sidebar navigation | ⚠️ | jw. — sidebar przyszedł po reason zamiast przed |
| `72fd71f` docs(phase-4.5): M10 align spec | ✅ | drobne dopinanie spec'u |

**Uwagi:**
- Zamiana M8/M9 nie ma wpływu produktowego — tylko porządek prac. Bez zastrzeżeń.
- Brak commitu który by zmienił `OrderStatus.canTransitionTo` ani `transitions.ts` — zgodnie ze spec'em ("state machine NIE rusza"). **To jest istotne dla bug'a opisanego niżej.**

---

## 1. Scope — Definition of Done punkt po punkcie

| # | Punkt DoD | Status | Dowód |
|---|---|---|---|
| 1 | Migracja Flyway dodaje `reason TEXT NULL` | ✅ DONE | [V11__add_reason_to_order_status_history.sql](../backend/src/main/resources/db/migration/V11__add_reason_to_order_status_history.sql) — addytywna, `ADD COLUMN reason TEXT` (3f05b40) |
| 2 | Encja `OrderStatusHistory` ma pole `reason` | ✅ DONE | [OrderStatusHistory.java:39-40](../backend/src/main/java/com/pizzashowcase/order/domain/OrderStatusHistory.java#L39-L40) `length=500`, stary konstruktor zachowany przez delegację |
| 3 | DTO `PATCH /status` akceptuje `reason` | ✅ DONE | [UpdateOrderStatusRequest.java:10](../backend/src/main/java/com/pizzashowcase/order/api/dto/admin/UpdateOrderStatusRequest.java#L10) `@Size(max=500) String reason` |
| 4 | `OrderStatusService` zapisuje reason | ✅ DONE | [OrderStatusService.java:50-51](../backend/src/main/java/com/pizzashowcase/order/application/OrderStatusService.java#L50-L51) + `normalizeReason` (trim, empty→null) |
| 5 | NOWY `GET /api/admin/dashboard/stats` z pełnym payloadem | ✅ DONE | [AdminDashboardController.java:33-36](../backend/src/main/java/com/pizzashowcase/order/api/AdminDashboardController.java#L33-L36) + [AdminDashboardStatsDto.java](../backend/src/main/java/com/pizzashowcase/order/api/dto/admin/AdminDashboardStatsDto.java) (5 sekcji zgodnych z handoff sec 3) |
| 6 | Trzy nowe widoki: `/admin/kitchen`, `/admin/pickup`, `/admin/delivery` | ✅ DONE | [router.tsx:97-99](../frontend/src/app/router.tsx#L97-L99) |
| 7 | Każdy widok pokazuje tylko zamówienia z odpowiednimi statusami i fulfillmentType | ⚠️ PARTIAL | Filtr poprawny w 3/3 widokach, **ale nie obejmuje statusu `CONFIRMED`** — patrz HIGH-1 |
| 8 | Sortowanie placedAt ASC | ✅ DONE | Kuchnia [KitchenPage.tsx:198-205](../frontend/src/features/admin/operations/kitchen/KitchenPage.tsx#L198-L205), Pickup [PickupPage.tsx:50-52](../frontend/src/features/admin/operations/pickup/PickupPage.tsx#L50-L52), Delivery [DeliveryPage.tsx:252-259](../frontend/src/features/admin/operations/delivery/DeliveryPage.tsx#L252-L259) |
| 9 | Akcje: Przyjmij/Gotowe/Wyjechało/Dostarczone/Wydano + confirm dla terminalnych | ⚠️ PARTIAL | Confirm dla DELIVERED jest w obu widokach. **"Przyjmij" prawdopodobnie zwraca 422** — patrz CRITICAL-1 |
| 10 | Telefon klikalny `tel:` w Pickup i Delivery | ✅ DONE | [PickupOrderCard.tsx:50-56](../frontend/src/features/admin/operations/pickup/PickupOrderCard.tsx#L50-L56), [DeliveryOrderCard.tsx:87-93](../frontend/src/features/admin/operations/delivery/DeliveryOrderCard.tsx#L87-L93) (+duplikat 148-154) |
| 11 | Nawiguj w Dostawie → Google Maps z `encodeURIComponent` | ✅ DONE | [DeliveryOrderCard.tsx:32-40](../frontend/src/features/admin/operations/delivery/DeliveryOrderCard.tsx#L32-L40) |
| 12 | Pulpit przerobiony — kafelki + 2 wykresy + top produkty + status tiles | ✅ DONE | [DashboardPage.tsx](../frontend/src/features/admin/dashboard/DashboardPage.tsx) (5 sekcji) |
| 13 | Recharts działa, wykresy responsywne | ✅ DONE | `ResponsiveContainer` w obu wykresach. `recharts ^3.8.1` w `package.json` |
| 14 | Sidebar ma nową strukturę (operacyjne / archiwum / konfiguracja) | ✅ DONE | [AdminLayout.tsx:14-28](../frontend/src/features/admin/layout/AdminLayout.tsx#L14-L28) — układ 1:1 ze spec'em, separatory jako `<hr>` w [AdminSidebar.tsx:48-52](../frontend/src/features/admin/layout/AdminSidebar.tsx#L48-L52) |
| 15 | `OrderStatusActions` z reason wymaganym, `/admin/orders/:id` wyświetla reason | ✅ DONE | [CancelOrderDialog.tsx](../frontend/src/features/admin/orders/components/CancelOrderDialog.tsx) (wpięty w OrderDetailPage, nie OrderStatusActions) + [OrderStatusHistory.tsx:55-59](../frontend/src/features/admin/orders/components/OrderStatusHistory.tsx#L55-L59) |
| 16 | SSE działa we wszystkich nowych widokach | ✅ DONE | `useAdminOrderFeed` zamontowany 1× w `AdminLayout`, każdy widok inwaliduje `["admin","orders","list"]` przez prefix-match |
| 17 | 3 dźwięki, każdy widok pika tylko swój event, SoundToggle wycisza | ✅ DONE | [useOperationalSound.ts:14-26](../frontend/src/features/admin/realtime/useOperationalSound.ts#L14-L26) — Kuchnia: created; Pickup: status→READY+PICKUP; Delivery: status→READY+DELIVERY; manager: no-op. Wszystkie `play*Sound` sprawdzają `getSoundEnabled()` |
| 18 | Empty states w 3 widokach | ✅ DONE | wszystkie używają `EmptyState` z ikoną i opisem |
| 19 | Mobile (375px) + tablet (1024px) — czytelne i klikalne | 🟡 NIE WERYFIKOWANE w review | Spec wymaga manualnego smoke testu. Code-review: grid `sm:grid-cols-2 xl:grid-cols-3` (Kuchnia), `lg:grid-cols-2` (Delivery) wygląda rozsądnie. `size="xl"` (h-16 = 64px) na CTA spełnia 56px requirement. Wymaga smoke testu w 375px. |
| 20 | Dokumentacja (PHASES, ROADMAP, ARCHITECTURE) | ✅ DONE (poza CURRENT_STATE) | PHASES.md ma rozdział 4.5, ARCHITECTURE.md ma AD-020/021/022, ROADMAP.md ma wpis 4.5. **CURRENT_STATE.md świadomie nieaktualizowany** — Krok 5 po smoke teście (per handoff sec 4) |

**Brakujące elementy (poza scope smoke testu):**
- ❌ Toast `onClick` przekierowujący do widoku (handoff sec 3 mówi "może być klikalny", DoD nie wymaga eksplicytnie). Drobny niedosyt, **niski priorytet**.
- ❌ ETA wyświetlana jako godzina absolutna (handoff: "ETA: 19:45"). Implementacja pokazuje `etaMinutes` (czas trwania, np. "ETA: 30 min"). Patrz MEDIUM-1.

**Elementy spoza scope'u (dodane mimo to):**
- ✅ Checkbox "Rozumiem, że ta akcja jest nieodwracalna" w `CancelOrderDialog` — drobny scope creep, ale UX-pozytywny. Akceptowalny.

---

## 2. Bugi znalezione

| Severity | Lokalizacja | Opis | Propozycja fix |
|---|---|---|---|
| **CRITICAL-1** | [KitchenOrderCard.tsx:28-32](../frontend/src/features/admin/operations/kitchen/KitchenOrderCard.tsx#L28-L32) vs [OrderStatus.java:27](../backend/src/main/java/com/pizzashowcase/order/domain/OrderStatus.java#L27) | **Przycisk "Przyjmij" wysyła `IN_PREPARATION`, backend dopuszcza tylko `NEW → CONFIRMED`. Każde kliknięcie "Przyjmij" zwróci 422.** Spec PHASES.md wprost mówi `NEW → IN_PREPARATION`, ale jednocześnie zakazuje ruszania state machine. Spec wewnętrznie sprzeczny. Smoke test scenariusz #4 z handoff'u upadnie na pierwszym ticku. Konsekwencja operacyjna: kuchnia nie może zaakceptować NEW orderu z widoku Kuchni — musi iść do `/admin/orders/:id` i klikać dwukrotnie ("Potwierdź" → CONFIRMED → "Rozpocznij przygotowanie" → IN_PREPARATION). | **Decyzja produktowa wymagana.** Trzy chirurgiczne opcje: (a) zmienić Kitchen `primaryAction` na `NEW → CONFIRMED` i dodać sekcję CONFIRMED do filtra Kuchni jako "PRZYJĘTE", (b) rozszerzyć filtr Kuchni o `CONFIRMED` jako bonus + zmienić button na CONFIRMED, (c) zmienić state machine (`OrderStatus.canTransitionTo` + `transitions.ts`) żeby dopuścić `NEW → IN_PREPARATION` (łamie zasadę "state machine NIE rusza" ale zgodne z duchem spec'u). Wariant (c) jest najmniej kodu i zachowuje semantykę spec'u — IMO preferowany jeśli user akceptuje deviation. |
| **HIGH-1** | [KitchenPage.tsx:21-22](../frontend/src/features/admin/operations/kitchen/KitchenPage.tsx#L21-L22) | Filtr Kuchni pomija status `CONFIRMED`. W obecnej state machine `NEW → CONFIRMED` to jedyna ścieżka NEW. Jeśli admin użyje `/admin/orders/:id` żeby kliknąć "Potwierdź" (lub jeśli ktoś naprawi CRITICAL-1 wariantem (a)/(b)), zamówienia w `CONFIRMED` znikną z Kuchni — operacyjna ślepa plama. Bezpośrednio sprzężony z CRITICAL-1. | Część fixu CRITICAL-1. Niezależnie: rozszerzyć IN_PREP_QUERY albo dodać trzecią sekcję "PRZYJĘTE" pokrywającą CONFIRMED. |
| MEDIUM-1 | [KitchenOrderCard.tsx:97-110](../frontend/src/features/admin/operations/kitchen/KitchenOrderCard.tsx#L97-L110), [DeliveryOrderCard.tsx:120-124](../frontend/src/features/admin/operations/delivery/DeliveryOrderCard.tsx#L120-L124) | ETA wyświetlana jako `{etaMinutes} min` (czas trwania). Spec/handoff przewiduje "ETA: 19:45" (godzinę absolutną, kucharz/dostawca chce wiedzieć "do której godziny"). Po 20 minutach od ustawienia "30 min" karta nadal pokaże "ETA: 30 min" — myląca informacja. | Liczyć absolutną godzinę: `formatTime(etaSetAt + etaMinutes minutes)`. Backend już wystawia `etaSetAt`. |
| MEDIUM-2 | [HourlyBarChart.tsx:19-20](../frontend/src/features/admin/dashboard/components/HourlyBarChart.tsx#L19-L20) | Hardcoded zakres godzin `FIRST_HOUR=8, LAST_HOUR=23`. Spec mówi "od openingHours startu do końca". Pizzeria otwarta np. 11–24 albo 12–22 nie zobaczy słupków poza tym oknem — ale godzina obecna `> 23` (nocne otwarcia) nie zostanie podświetlona w ogóle (`entry.hour === currentHour` nie znajdzie matchu w slice 8–23). | (a) sczytywać `openingHours` z `usePublicSettings` jak `AdminLayout`, (b) jeśli zbyt skomplikowane — przesunąć do tech debtu. Najmniejszy fix: zmienić zakres na 0–23 (cała doba), highlight zawsze działa, słupki puste są niewidoczne i tak. |
| MEDIUM-3 | [DashboardPage.tsx:60](../frontend/src/features/admin/dashboard/DashboardPage.tsx#L60) | `currentHour = useMemo(() => new Date().getHours(), [])` z pustą deps tablicą — wartość nigdy się nie aktualizuje. Manager otwierający pulpit o 11:55 i patrzący do 12:30 widzi ciągle podświetloną 11:00. Polling co 60s odświeża dane słupków, ale nie godzinę. | Zamiast `useMemo` z `[]` przeliczać przy każdym renderze (tania operacja) ALBO setInterval 60s ALBO sczepić z timestamp ostatniego refetch. |
| MEDIUM-4 | [PickupOrderCard.tsx:41](../frontend/src/features/admin/operations/pickup/PickupOrderCard.tsx#L41), [DeliveryOrderCard.tsx:54](../frontend/src/features/admin/operations/delivery/DeliveryOrderCard.tsx#L54) | Numer zamówienia w karcie Pickup/Delivery jest 16px slate-500 (subdued). Spec mówi "Numer zamówienia (duży, top-left)". Imię klienta (Pickup) i adres (Delivery) są większe — to sensowna decyzja UX, ale numer jest **mały**, nie "duży". Pracownik szukający "wydaj 2026-00184" może mieć trudność w peak hour. | Zwiększyć numer do `text-[20px]` slate-900 (jak w Kuchni) i utrzymać kontrast nad pozostałymi wartościami. Drobny lift, znaczna różnica w glanceability. |
| MEDIUM-5 | [lib/sounds.ts:3-18](../frontend/src/lib/sounds.ts#L3-L18) i [soundPrefs.ts:14-29](../frontend/src/features/admin/realtime/soundPrefs.ts#L14-L29) | **Dwa odrębne `AudioContext`** — jeden w `lib/sounds.ts` (kitchen/pickup/delivery), drugi w `soundPrefs.ts` (SoundToggle priming beep). SoundToggle priming odpala kontekst soundPrefs.ts; kitchen/pickup/delivery używają osobnego kontekstu który **dalej startuje w `suspended`**. Mitigacja przez `audioCtx.resume()` (lib/sounds.ts:46-49) działa po pierwszej user-gesture, ale nie zawsze niezawodnie po długim okresie nieaktywności (browser może suspendować ponownie). | Wyciągnąć `getContext()` do jednego shared module'u (`shared/audio/context.ts`). Potencjalnie pominąć jeśli nie powtarza się manualnie w testach. Trade-off: 30 LoC vs niezawodność. |
| LOW-1 | [DashboardPage.tsx:88](../frontend/src/features/admin/dashboard/DashboardPage.tsx#L88) | Dashboard inwaliduje query `["admin", "dashboard", "summary"]` mimo że Faza 4.5 nie używa już `/dashboard/summary`. To pre-existing martwy kod. **Świadomie zostawiony** w `useAdminOrderFeed` (komentarz tłumaczy backward compat). Nie bug — flaga "tech debt". | Skreślić w fazie czyszczenia summary endpointu (zgodnie z ROADMAP). |
| LOW-2 | [useAdminOrderFeed.ts:68](../frontend/src/features/admin/realtime/useAdminOrderFeed.ts#L68) | `toast.success("Nowe zamówienie: ...")` bez `onClick`. Handoff sekcja 3 sugeruje toast klikalny → przekierowanie do `/admin/kitchen`. DoD nie wymaga, ale handoff o tym mówi explicite ("Implementacja przez prop `onClick`"). | Dodać `onClick` w toast options. 5 LoC. Można odłożyć. |
| LOW-3 | [DeliveryOrderCard.tsx:71-74](../frontend/src/features/admin/operations/delivery/DeliveryOrderCard.tsx#L71-L74) | Fallback "Brak adresu — zamówienie wygląda na pomyłkę" pojawia się gdy `addr === null` na widoku Dostawy. Filtr na backendzie filtruje DELIVERY i status READY/OUT_FOR_DELIVERY, więc adres MUSI być (CheckoutService walidacja). Defensywny pas i szelki, ale rzeczy które się nie mogą stać. | Akceptowalne — niski koszt, daje feedback w razie nieoczekiwanej regresji. Nie tknąć. |
| LOW-4 | [CancelOrderDialog.tsx:102-115](../frontend/src/features/admin/orders/components/CancelOrderDialog.tsx#L102-L115) | Spec mówi "if (!reason.trim()) toast.error". Implementacja idzie dalej: inline error + checkbox confirm. To **scope creep** (extra checkbox), ale UX-pozytywny i zabezpiecza przed przypadkowym kliknięciem. Niezgodny z literą, zgodny z duchem. | Akceptowalne. Można rozważyć usunięcie checkboxa w polish phase jeśli operatorom przeszkadza, ale z punktu widzenia review nie do fix'u. |
| LOW-5 | [AdminOrderQueryService.java:107-131](../backend/src/main/java/com/pizzashowcase/order/application/AdminOrderQueryService.java#L107-L131) | `aggregateToday`: `orderCount` zlicza **wszystkie** dzisiejsze zamówienia (incl. CANCELED), ale `totalRevenue` i `averageOrderValue` liczą tylko non-canceled. To rozsądne (revenue z anulowanego = 0), ale **nie jest udokumentowane**. Manager widzący "23 zamówień, sprzedaż 1847 zł, AOV 80" przy 1 anulowanym ma niespójność: 23 × 80 ≠ 1847. | Komentarz w kodzie + ewentualnie tooltip w UI ("AOV liczona po wykluczeniu anulowanych"). Niski priorytet — manager test domyśli się. |
| LOW-6 | Brak | `existsByDeliveryZoneName` istnieje w [OrderRepository.java:73](../backend/src/main/java/com/pizzashowcase/order/infrastructure/OrderRepository.java#L73) — pre-existing z Fazy 7.0, niepowiązany z 4.5. | Nie tknąć. |
| LOW-7 | [OrderRepository.java:42-47](../backend/src/main/java/com/pizzashowcase/order/infrastructure/OrderRepository.java#L42-L47) | `findAllFiltered` ma `@EntityGraph(items+items.addons)` żeby służyć widokom operacyjnym (AD-022). Ten sam endpoint **dotyczy też `/admin/orders` (OrdersListPage)** który nie renderuje items — ładuje je niepotrzebnie. Per page (size=20) ~60 wierszy join'a marnuje się. Niski wpływ przy małej liście, ale architectural smell. | Wyciągnąć dwa warianty `findAllFiltered`/`findAllFilteredSlim` lub `Pageable` flag. Można odłożyć do polish phase. |
| LOW-8 | [KitchenOrderCard.tsx:85](../frontend/src/features/admin/operations/kitchen/KitchenOrderCard.tsx#L85) (i analogiczne w Pickup/Delivery cards) | `order.items.map(...)` bez null-guard. Typ mówi non-null, backend serializuje `[]`, ale malformed/stale response (cached old shape, hot reload) zrobi NPE. Defensywny `(order.items ?? []).map(...)` to 1 char na kartę. | Akceptowalne ryzyko, fix trywialny w polish phase. |

---

## 3. Ryzyka i edge case'y nieobsłużone

### Backend — `/api/admin/orders/{id}/status` z reason

1. **Null/empty reason** — `normalizeReason` (OrderStatusService:88-92) trim → empty → null. ✅ OK.
2. **Wartości graniczne (500/501 znaków)** — DTO `@Size(max=500)` → 500 OK, 501 zwraca 400 Bad Request (Bean Validation). ✅ OK. Sprawdzone w testach `OrderStatusServiceTest`.
3. **DB failure mid-transaction** — `@Transactional` na service'ie + `saveAndFlush` → rollback poprawny. ✅ OK.
4. **Race condition (dwóch adminów PATCH ten sam order)** — `@Version` na Order + `assertVersion` w OrderStatusService:77-81 → drugi PATCH dostaje 409 (frontend już to obsługuje przez `handleMutationError`). ✅ OK.
5. **Security** — `@PreAuthorize("hasRole('ADMIN')")` na `AdminDashboardController` (line 13) ✅. PATCH /status jest pod `/api/admin/*` → JwtAuthenticationFilter wymaga Bearer token (poza SSE_PATH wyjątkiem). ✅ OK. Reason **NIE jest sanitizowany dla XSS** — backend tylko trimuje. Frontend renderuje przez React (auto-escape). ✅ OK dla single-tenant MVP.

### Backend — `/api/admin/dashboard/stats`

1. **Null/empty wynik** — `aggregateToday` zwraca `0`/BigDecimal.ZERO przy braku zamówień. AOV: `nonCanceledCount==0 ? ZERO`. ✅ OK. Sprawdzone w `stats_emptyTodayHasZeroAov`.
2. **Wartości graniczne** — `last7Days` zawsze 7 wpisów (zero-fill), `hourlyToday` zawsze 24 wpisy, `topProducts30Days` ≤ 5. ✅ OK. Sprawdzone w testach.
3. **DB failure** — read-only transakcja, brak side-effectu. ✅ OK.
4. **Race condition** — read-only, nieistotne.
5. **Security** — controller `@PreAuthorize("hasRole('ADMIN')")` ✅.

### Inne edge case'y

- **Performance — top products 30 dni**: `findInCreatedAtRangeWithItems` ładuje WSZYSTKIE zamówienia z items eager (`@EntityGraph(attributePaths="items")`). Dla pizzerii 30 dni × 50 orderów/dzień = 1500 rzędów × ~3 itemy = ~4500 wierszy w pamięci na każdy hit `/dashboard/stats`. Polling co 60s = ~72/h. Akceptowalne dla showcase, **może uderzyć** dla lokalu z 200+ orderów/dzień. Tech debt — udokumentować.
- **Performance — admin orders list**: `findAllFiltered` z `@EntityGraph(items+items.addons)` (AD-022). Lista paginowana (PAGE_SIZE=100 w widokach operacyjnych) → 100 orderów × średnio 3 items × 1 addon = ~300-600 wierszy join'a per fetch. SSE invaliduje na każdy event. W peak hour z 30 aktywnymi orderami przy ~10 events/min → ~10 fetchów/min × 600 wierszy = 6000 rzędów odczytu/min. Akceptowalne.
- **DST switch** — `aggregateHourlyToday` używa `LocalDate.now(RESTAURANT_ZONE) → atStartOfDay(ZONE).toInstant()` → ZoneId rozumie DST. **Ale**: w dniu przejścia czasu wiosennego z 02:00 na 03:00 godzina 02:00 nie istnieje — Java skoczy do 03:00. Jesienią 02:00 powtarzają się — `created.atZone(ZONE).getHour()` przypisze obu instancjom ten sam hour=2. To rozsądne zachowanie i raz na pół roku, **akceptowalne**.
- **Midnight crossover** — order o 23:55 sprawdzany o 00:05 dnia X+1: `todayStart` = 00:00 X+1, `created` = 23:55 X. `created.isBefore(todayStart)` = true → `continue`. Order pominięty w hourlyToday i aggregateToday — **poprawne** (należy do dnia poprzedniego). last7Days przypisuje do `day = created.atZone.toLocalDate()` = dzień X — poprawne. ✅ OK.
- **Long-tap na "Wydano" w peak hour** — brak debounce/throttle. Pracownik dwukrotnie klikający → drugi click idzie z tym samym `version`, dostaje 409 (`handleMutationError` pokazuje "Ktoś inny zmienił..."). Nie zepsuje danych, ale UX zagadkowy. **Niski priorytet**.
- **Pierwszy SSE event po długiej nieaktywności** — `useAdminOrderFeed` rekonektuje z exponential backoff do 30s. Po wybudzeniu laptopa może minąć 5-10s zanim widoki się odświeżą. Dźwięki też mogą nie zagrać (AudioContext suspended) — patrz MEDIUM-5.

---

## 4. AD records consistency

| AD | Sprawdzenie | Wynik |
|---|---|---|
| **AD-020** Single ADMIN role | Brak nowych ról w `User`, brak modyfikacji `SecurityConfig`, `/admin/kitchen|pickup|delivery` chronione przez ten sam `ProtectedRoute` co reszta admina, controller `AdminDashboardController` ma `@PreAuthorize("hasRole('ADMIN')")` jak wszystkie pozostałe | ✅ |
| **AD-021** Cancellation reason on OrderStatusHistory | Pole na `OrderStatusHistory` (nie na `Order`) ✅. DTO `PATCH /status` z opcjonalnym `reason` ✅. Backend liberalny (akceptuje null/empty dla każdego statusu) ✅. Walidacja "wymagane dla CANCELED" tylko po stronie frontu ([CancelOrderDialog.tsx:41-44](../frontend/src/features/admin/orders/components/CancelOrderDialog.tsx#L41-L44)) ✅. UI w `/admin/orders/:id` wyświetla reason w historii ([OrderStatusHistory.tsx:55-59](../frontend/src/features/admin/orders/components/OrderStatusHistory.tsx#L55-L59)) ✅ | ✅ |
| **AD-022** List shape = detail shape | `AdminOrderListItemDto` rozszerzony o items+addons+address+notes+etaSetAt ✅. `OrderRepository.findAllFiltered` ma `@EntityGraph(attributePaths={"items","items.addons"})` (line 42) — anti-N+1 ✅. Frontend typ `AdminOrderListItemDto` w [orderApi.ts:119-139](../frontend/src/shared/api/orderApi.ts#L119-L139) ma wszystkie nowe pola ✅. `toListItem` i `toDto` współdzielą pomocnicze `toItemDtos`/`toAddressDto` (line 263-292) — spójność | ✅ |

---

## 5. Regresja

| Obszar | Status | Uwagi |
|---|---|---|
| Faza 4 (admin orders, dashboard/summary) | ✅ Działa | `OrderDetailPage` używa istniejącego `OrderStatusActions` (state machine od NEW przez CONFIRMED). `/dashboard/summary` zachowany jako `@Deprecated` alias w [AdminDashboardController.java:27-31](../backend/src/main/java/com/pizzashowcase/order/api/AdminDashboardController.java#L27-L31). `useAdminOrderFeed` dalej inwaliduje `["admin","dashboard","summary"]` (LOW-1). |
| Faza 3 (customer flow, public tracking) | ✅ Działa | Brak zmian w `/api/public/*`, `CheckoutService`, `OrderTrackingDto`. Snapshot `deliveryFee`/`deliveryZoneName` z 7.0 zachowany, frontend tracking nieruszony. |
| SoundToggle (Faza 4) | ✅ Globalnie wycisza | Wszystkie `play{Kitchen,Pickup,Delivery}Sound` w [lib/sounds.ts:60,66,71](../frontend/src/lib/sounds.ts#L60) zaczynają od `if (!getSoundEnabled()) return;`. |
| Sidebar legacy linki (Menu, Settings, OpeningHours, PageContent, DeliveryZones) | ✅ Nieuszkodzone | Wszystkie 5 linków obecne w [AdminLayout.tsx:23-27](../frontend/src/features/admin/layout/AdminLayout.tsx#L23-L27), routy w [router.tsx:102-109](../frontend/src/app/router.tsx#L102-L109). Separatory wizualne dodane. |
| `useAdminOrderFeed` zamontowany 1× | ✅ | [AdminLayout.tsx:57](../frontend/src/features/admin/layout/AdminLayout.tsx#L57). Pages operacyjne nie wołają hooka — wołają tylko `useOperationalSound` który subskrybuje pub/sub. |
| `OrderStatusActions` flow w detail | ✅ | NEW → CONFIRMED → IN_PREPARATION → READY → ... — ścieżka pre-4.5 zachowana, stan machine niezmieniony. |
| `AdminOrderListItemDto` w 8 plikach (per Grep) | ✅ Type-safe | OrdersListPage używa tylko podzbioru pól (id, version, orderNumber, status, fulfillmentType, paymentMethod, customerName, customerPhone, total, placedAt, etaMinutes, itemsCount). Nowe pola opcjonalne (`customerNotes`, `deliveryAddress`, `items`) nie wyciekają do pre-istniejącego UI — żadnego spread/console.log. |
| Optimistic locking (Faza 4) | ✅ Zachowane | `@Version` na `Order`, `assertVersion` w `OrderStatusService`, frontend interpretuje 409 we wszystkich nowych mutationach. |
| Phase 7.0 BadgeVariant fix (commit 7e6a67a) | ✅ Chirurgiczny | Dotyka 4 wystąpień w 1 pliku (`DeliveryZonesPage.tsx`), bez modyfikacji `BadgeVariant` unii. Mapowanie semantyczne (secondary→muted, destructive→danger, outline→muted). Brief operatora: "tylko 2 linie + ewentualnie BadgeVariant" — faktycznie 4 linie, bez BadgeVariant. Akceptowalne odchylenie (operator napisał "ewentualnie"). |

---

## 6. Sub-agent — wynik

Niezależny audit edge case'ów (równolegle uruchomiony, świeże oczy):

### 6.1 SSE + per-view sound (race / double-mount)
**VERDICT: RISK (StrictMode dev double-fire) + minor gap**

- ✅ Single mount potwierdzony: `useAdminOrderFeed()` tylko w `AdminLayout.tsx:57`. Operacyjne strony wołają wyłącznie `useOperationalSound(...)` który subskrybuje przez pub/sub i NIE otwiera nowego EventSource.
- ✅ Cleanup poprawny: `useOperationalSound.ts:14-28` zwraca `unsubscribe` z `useEffect`. React unmountuje poprzednią stronę przed mountowaniem nowej, więc closure usuwa listener z `Set` zanim nowy event nadejdzie. Brak "stale listener leak".
- ✅ Manager early return bezpieczny (`if (view === "manager") return;` przed subscribe).
- ⚠️ **StrictMode (React 18, `frontend/src/main.tsx:9` używa `<React.StrictMode>`)**: w dev hook biegnie mount→cleanup→mount. `subscribeOrderFeed` na `Set` – self-healing (drugi mount dodaje, cleanup usuwa, zostaje jeden). `useAdminOrderFeed` otwiera 2 EventSource'y w dev; pierwszy cleanup zamyka #1, drugi mount tworzy #2 — też self-healing. **Production bez wpływu.** Tylko sanity note.
- 🔸 **Fragile**: `emitOrderFeed` iteruje po `Set` w trakcie potencjalnej synchronicznej mutacji. Dziś żaden konsument tego nie robi, ale gdyby listener wywołał `subscribeOrderFeed` synchronously, nowy listener mógłby dostać ten sam event w tej samej iteracji. Akceptowalne na teraz.

### 6.2 AdminOrderListItemDto rozszerzenie (AD-022)
**VERDICT: OK, z jednym minor nit**

- ✅ Konsumenci (z grep'a frontend): `OrdersListPage`, `KitchenPage` (+`KitchenOrderCard`), `PickupPage` (+`PickupOrderCard`), `DeliveryPage` (+`DeliveryOrderCard`). Brak wycieków gdzie indziej.
- ✅ `OrdersListPage.tsx:261-309` używa wyłącznie pól pre-AD-022 (id, version, orderNumber, status, fulfillmentType, customerName, customerPhone, etaMinutes, total, placedAt, itemsCount). Bez spread/console.log/debug toast — nowe pola nie wyciekają do UI.
- ✅ Typescript shape spójny z backendem: `customerNotes: string | null`, `deliveryAddress: OrderTrackingAddressDto | null`, `items: OrderTrackingItemDto[]` — wszystkie required. Backend `toListItem` populuje `toItemDtos(order)` (zwraca `.toList()` — nigdy null) i `toAddressDto(...)` zwraca `null` dla non-DELIVERY (zgodne z typem).
- 🔸 **Minor nit**: karty (`KitchenOrderCard.tsx:85`, `PickupOrderCard.tsx:59`, `DeliveryOrderCard.tsx:115`) wołają `order.items.map(...)` bez null-guard. Typ mówi non-null, Jackson serializuje pustą listę jako `[]` — w praktyce OK, ale malformed/cached response (stary serwer, hot reload) zrobiłby NPE. Cheap defensive guard wart rozważenia.

### 6.3 /dashboard/stats — hourlyToday & timezone
**VERDICT: BUG (frontend currentHour) + minor DST gap**

- ✅ `aggregateHourlyToday` (`AdminOrderQueryService.java:164-179`): `todayStart`/`tomorrowStart` przez `LocalDate.now(RESTAURANT_ZONE).atStartOfDay(RESTAURANT_ZONE).toInstant()` — poprawna północ Warszawa. Case 23:55→00:05 next day: order `created` jest po `tomorrowStart`, `!created.isBefore(tomorrowStart)` = true → `continue`. **Poprawnie wykluczony**.
- 🔸 **DST**: 24-element `long[]` indeksowane przez `getHour()`. Spring-forward (02:00→03:00) — index 2 strukturalnie zawsze 0, niewidoczne (frontend filter 8-23). Fall-back (02:00 dwa razy) — oba instanty mapują na hour=2, counts się zlewają. Negligible (wcześnie rano, filtrowane). Architektonicznie array nie reprezentuje 25-godzinnego dnia, ale dla pizzerii nie ma znaczenia.
- 🐛 **BUG (sub-agent #1)**: `HourlyBarChart.tsx:23` filtruje `d.hour >= 8 && d.hour <= 23`. Dla `currentHour = 0..7` żaden bar nie matchuje `entry.hour === currentHour` (line 52) → brak highlighta. **Pokrywa się z MEDIUM-2 z sekcji 2** — sub-agent potwierdza diagnozę.
- 🐛 **BUG (sub-agent #2)**: `DashboardPage.tsx:60` `useMemo(() => new Date().getHours(), [])` liczone raz na mount. Manager otwierający 11:55 nadal widzi 11 podświetloną o 12:30. **Pokrywa się z MEDIUM-3 z sekcji 2.**
- 🆕 **Dodatkowo (sub-agent)**: `currentHour` używa **client local timezone**, nie Warszawy. Manager logujący się z innej TZ widzi mismatch wobec server hourly bins. **Niewielki rzeczywisty risk dla single-tenant lokalnej pizzerii** ale wartałoby brać `currentHour` ze stosu znaczników z serwera (ISO + tz-aware), albo po prostu udokumentować "manager pracuje z lokalu".

### 6.4 Inne zauważone przez sub-agenta
1. **Cards N+1 risk eliminated, ALE list payload heavy dla `OrdersListPage`**: `findAllFiltered` przez `@EntityGraph(items, items.addons)` ładuje items+addons dla **KAŻDEGO** list query — w tym `/admin/orders` (PAGE_SIZE=20) który nie renderuje items. **Zmarnowany bandwidth + hibernate fetch**. → Dodaję jako **LOW-7** w sekcji 2.
2. CSS overflow przy peak (30+ kart): brak virtualization, `PAGE_SIZE=100` w widokach operacyjnych. Może janczyć na słabszych tabletach. Akceptowalne dla MVP volume.
3. Confirm dialogs accessibility: shadcn `Dialog` primitives mają focus trap + ESC z Radix. ✅ OK.
4. **JWT w URL dla SSE** (`useAdminOrderFeed.ts:52`): poza scope 4.5 (AD-018 to akceptuje), ale flag worth.
5. `refetchIntervalInBackground: false` + brak override `refetchOnWindowFocus` — manager backgroundujący tab na godziny przy powrocie zobaczy stale dashboard do następnego minute-ticka. TanStack default `refetchOnWindowFocus: true` powinien to pokryć. Minor.

### 6.5 Konkluzja sub-agenta vs main review
- **Pełna zgodność co do MEDIUM-2 i MEDIUM-3** — niezależnie zdiagnozowane, bug realny.
- **Sub-agent NIE zauważył CRITICAL-1 (Kitchen Przyjmij → 422)** — bo nie analizował state machine pod kątem nowego flow'u Kuchni. Main review wyłapał. Łącznie review jest komplementarny.
- Sub-agent nie znalazł poważniejszych ryzyk w SSE/AD-022/timezone — to mocne potwierdzenie że te 3 obszary są solidnie zaimplementowane.

**Dodaję do sekcji 2 nowy wpis LOW-7 wynikający z auditu (zmarnowany payload `OrdersListPage`).**

---

## 7. Tech debt zaakceptowany

- `/dashboard/summary` deprecated alias — tech debt już zarejestrowany w `ROADMAP.md` Faza 4.5 sekcja "Tech debt świadomie odłożony". Trigger usunięcia: kolejna faza UI która dotknie dashboardu.
- LOW-1 (martwy invalidate `["admin","dashboard","summary"]` w `useAdminOrderFeed`) — usunie się razem z summary.
- Pre-existing 26 ESLint react-refresh errors — **nie weryfikowane w tym review** (operator wspomniał w briefie). Jeśli pre-4.5, poza scope tej sesji.
- Performance fetch `/dashboard/stats` ładuje 30 dni orderów do pamięci dla top-products — akceptowalne dla showcase, do reewaluacji przy realnym lokalu 200+ orderów/dzień.
- Native `<datalist>` zamiast custom Combobox w `CityCombobox` (z Fazy 7.0, w ARCHITECTURE.md sekcja "Phase 7.0 — accepted trade-offs"). Bez związku z 4.5.

---

## 8. Rekomendacja

### CAN MERGE: **NIE — bez fixu CRITICAL-1**

Faza 4.5 jest **w 95% gotowa**, ale operacyjny core widoku Kuchni jest złamany przez konflikt spec ↔ state machine. Kuchnia nie może zaakceptować NEW orderu bez przejścia do `/admin/orders/:id` — co odwraca cel całej fazy ("dotyk, glanceability, każda rola ma swój widok"). Smoke test wykryje to natychmiast.

### Obowiązkowe przed merge

1. **CRITICAL-1** — decyzja produktowa: fix wariantem (a)/(b)/(c). Rekomendacja: (c) — łamie literę spec'u ale to NAPRAWDĘ jest błąd w spec'u (handoff zakłada obie sprzeczne rzeczy: state machine NIE rusza + Przyjmij→IN_PREPARATION). Wymaga zmiany 1 linii w `OrderStatus.java` i 1 linii w `transitions.ts`. Jeśli operator preferuje (a)/(b) — większy lift na widoku Kuchnia.
2. **HIGH-1** — fix razem z CRITICAL-1, niezależnie. Filtr Kuchni musi pokrywać wszystkie statusy "do roboty kucharza".

### Do akceptacji jako tech debt (nie blokujące)

- MEDIUM-1 (ETA jako `min` zamiast godziny absolutnej) — zaproponować user'owi zmianę przed smoke testem; zmiana ~5 LoC.
- MEDIUM-2 (HourlyBarChart hardcoded 8-23) — minimalny fix: zmienić na 0-23. ~2 LoC.
- MEDIUM-3 (currentHour nie aktualizuje się) — usunąć useMemo deps. ~1 LoC.
- MEDIUM-4 (numer zamówienia mały w Pickup/Delivery) — UX polish, ~4 LoC w 2 plikach.
- MEDIUM-5 (dwa AudioContext) — odkładalne, działa "good enough".
- LOW-1..LOW-8 — odkładalne lub akceptowalne jak jest. LOW-7 (zmarnowany payload OrdersListPage) i LOW-8 (brak null-guard na items.map) — minor, można polishować razem z MEDIUMami.

### Sugerowana ścieżka

1. **Decyzja produktowa nt. CRITICAL-1** (operator + Claude w chatcie) — wybierz wariant (a)/(b)/(c). Prompt #4 z playbooka do Claude Code z konkretnym wariantem.
2. **Opcjonalnie**: hurtowa naprawa MEDIUM-1..4 w jednym commit'cie `chore(phase-4.5): polish items per review`. ~30 LoC łącznie.
3. **Smoke test** przez operatora (Krok 4 z handoff'u) — 10 scenariuszy. Sprawdź dźwięki na 3 widokach + dashboard po polishu.
4. **Domknięcie** — Krok 5: aktualizacja `CURRENT_STATE.md`, final commit, `git status` czysty.

Po fixu CRITICAL-1 — projekt jest gotowy do mergowania jako Faza 4.5 DONE.

---

_Raport końcowy: NIE pisałem kodu. NIE updateowałem CURRENT_STATE.md. Czekam na decyzję._
