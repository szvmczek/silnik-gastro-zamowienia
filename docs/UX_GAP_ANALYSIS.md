# UX_GAP_ANALYSIS.md

> Co projekt ma DZIŚ vs co `docs/UX_BIBLE.md` mówi że powinien mieć.
> Każda pozycja ma status, źródło w biblii (numer sekcji), i decyzję
> co z tym robimy w **Fazie 5 (Polish + Redesign)** vs co odkładamy
> na ROADMAP.md.

## Legenda statusów

- ✅ **DONE** — zaimplementowane i zgodne z biblią
- 🟡 **PARTIAL** — jest, ale wymaga doszlifowania w Fazie 5
- 🔴 **MISSING** — brak, do dodania w Fazie 5 (MVP-critical)
- 📋 **ROADMAP** — brak, świadomie odkładamy na post-MVP
- ❌ **OUT OF SCOPE** — biblia opisuje, my pomijamy całkowicie

## Filozofia

> **Mała pizzeria nie potrzebuje narzędzi enterprise. Potrzebuje narzędzia
> które robi 5 rzeczy świetnie zamiast 50 rzeczy źle.**
> *(UX_BIBLE.md, Podsumowanie priorytetów MVP)*

Faza 5 to nie "dodaj wszystko z biblii". To: **przybliż obecne ekrany do
wzorca z biblii dokładnie tam, gdzie obecna implementacja odbiega od
MVP-critical**. Cała reszta idzie do ROADMAP.md albo zostaje pominięta.

---

## CZĘŚĆ I — STRONA KLIENTA

### Sekcja 1 (biblia) — Landing page

| Element | Status | Komentarz |
|---|---|---|
| Hero z nazwą, opisem, CTA | 🟡 PARTIAL | Faza 1 dowiozła `LandingPage` z PageContent (HERO/ABOUT). Brak strukturalnego hero z dużym tłem, badge'm "otwarte/zamknięte", paskiem informacji (czas dostawy, min. zamówienie). |
| Pasek informacyjny (czas, min, koszt dostawy) | 🔴 MISSING | Biblia §1 — to jest jeden z najsilniejszych conversion-driverów. Dodać w Fazie 5. |
| Banner "restauracja zamknięta" z czytelnym CTA | 🔴 MISSING | Backend ma `OpeningHours` (Faza 1) i `isOpenNow()` istnieje. Frontend nie ma globalnego bannera ani guardu. **Faza 5: must-have.** |
| Sekcja godzin otwarcia z wyróżnionym dziś | 🟡 PARTIAL | Dane są, prezentacja podstawowa. Polish w Fazie 5. |
| Mapa kontaktu | 🔴 MISSING | Faza 5 ma to wpisane w PHASES.md (iframe OSM). Zostaje. |
| SEO (OG, structured data Schema.org Restaurant) | 🔴 MISSING | Faza 5 ma SEO basics. **Dodajemy schema.org Restaurant w Fazie 5.** |
| Footer z linkami prawnymi | 🟡 PARTIAL | Footer jest, treści (regulamin, polityka prywatności) — brak. Roadmap. |

**Decyzja Faza 5:**
- Dodać pasek informacyjny pod hero (czas dostawy, min. zamówienie, koszt dostawy z `RestaurantSettings`)
- Dodać banner "restauracja zamknięta" widoczny na całej stronie public gdy `isOpenNow() === false`, z czytelnym CTA "Otwieramy o {godzina}"
- Dodać schema.org Restaurant + OG tags dynamicznie z `RestaurantSettings`
- Polish hero (tło, typografia, CTA) zgodny z biblią §1

---

### Sekcja 2 (biblia) — Strona menu

| Element | Status | Komentarz |
|---|---|---|
| Sticky tabs kategorii | ✅ DONE | Faza 2 dowiozła sticky tabs. |
| Scroll-spy (auto-podświetlanie aktywnej kategorii) | 🔴 MISSING | Biblia §2 — to robi UX premium. Dodać w Fazie 5. |
| Search w menu | 🔴 MISSING | Biblia §2 mówi że to MVP-critical. Realnie dla 8-30 produktów to **nice-to-have**. **Decyzja: ROADMAP.** |
| Filtry tagów (wegetariańskie, ostre, bestseller) | 📋 ROADMAP | Wymagałoby zmiany schematu (tagi w Product). Po MVP. |
| Bannery promocji wewnątrz listy | ❌ OUT OF SCOPE | Brak systemu promocji w MVP. |

**Decyzja Faza 5:**
- Dodać scroll-spy dla aktywnej kategorii (IntersectionObserver + auto-scroll w nawigacji)
- Search i filtry → ROADMAP

---

### Sekcja 3 (biblia) — Karta produktu na liście

| Element | Status | Komentarz |
|---|---|---|
| Zdjęcie z lazy loading | 🟡 PARTIAL | Img tag jest. Brak LQIP / blur-up placeholdera, brak `loading="lazy"`. Polish w Fazie 5. |
| Nazwa, opis, cena | ✅ DONE | |
| "od X zł" przy wariantach | 🟡 PARTIAL | Cena bazowa jest, "od" — sprawdzić w Fazie 5. |
| Badge'e (bestseller/nowy/ostry) | 📋 ROADMAP | Wymaga pola `tags` w Product. Po MVP. |
| Stan "niedostępny" — overlay + disabled CTA | 🟡 PARTIAL | `availability` jest w Faza 2. Sprawdzić wizualizację — overlay grayscale + tekst "Niedostępne dziś". |
| Animacja "+" przy dodaniu do koszyka | 🔴 MISSING | Biblia §3 — bump na ikonie koszyka. Dodać w Fazie 5 (200ms scale). |
| Hover state desktop (shadow + scale) | 🟡 PARTIAL | Sprawdzić, dopolerować w Fazie 5. |

**Decyzja Faza 5:**
- LQIP / blur-up dla zdjęć produktów (placeholder do czasu załadowania)
- Animacja bump ikony koszyka po `cartStore.addItem()` (200ms scale 1→1.15→1)
- Wizualizacja stanu niedostępnego (overlay + disabled "Wybierz"/"Dodaj")
- Hover polish

---

### Sekcja 4 (biblia) — Modal produktu

| Element | Status | Komentarz |
|---|---|---|
| Modal z wariantami i dodatkami | ✅ DONE | Faza 2: `ProductModal` dziaa. |
| Cena dynamiczna na CTA "Dodaj · 32,90 zł" | 🟡 PARTIAL | Sprawdzić — biblia §4 mówi że cena ma być na przycisku. |
| Pole komentarza per pozycja | 🔴 MISSING | **To jest kluczowy feature wymieniony przez Ciebie.** Wymaga: (1) pole `note` w `OrderItem` backend, (2) input w modalu, (3) wyświetlenie w koszyku, edycja, (4) widok w panelu admina. **Faza 5: must-have.** |
| Mobile bottom sheet (zamiast centered modal) | 🟡 PARTIAL | Sprawdzić zachowanie modala na 375px — czy to bottom sheet czy centered. |
| Sticky CTA na dole modala przy długiej liście dodatków | 🟡 PARTIAL | Sprawdzić w Fazie 5. |
| Animacja otwierania (slide up mobile, fade desktop) | 🟡 PARTIAL | shadcn/ui defaultowo ma to OK, polish w Fazie 5. |

**Decyzja Faza 5:**
- **Dodać pole `itemNote` do `OrderItem`** (backend migracja + DTO + frontend)
- **Pole komentarza w modalu produktu** — textarea, placeholder "Np. bez cebuli, dobrze wypieczona", max 200 znaków, licznik znaków
- Cena dynamiczna na CTA z formatem "Dodaj do koszyka · {cena} zł"
- Sticky CTA na dole modala
- Mobile: bottom sheet zamiast centered modal

---

### Sekcja 5 (biblia) — Koszyk: sticky sidebar (desktop)

| Element | Status | Komentarz |
|---|---|---|
| Sticky sidebar po prawej | 🔴 MISSING | **Obecnie koszyk jest tylko `CartDrawer` (Sheet) — wysuwa się po kliknięciu ikony.** To jest **kluczowa zmiana którą wymyślił wujek**. Faza 5: dodać sticky sidebar 360px na desktop ≥1024px, drawer pozostaje fallbackiem na <1024px. |
| Lista pozycji ze zdjęciem + steperem | 🟡 PARTIAL | `CartDrawer` to ma, do przeniesienia do sidebar. |
| Komentarz per pozycja w koszyku (display + edycja) | 🔴 MISSING | Powiązane z dodaniem `itemNote`. |
| Pasek minimum order ("brakuje X zł") | 🔴 MISSING | Backend ma `minOrderAmount` w settings (Faza 1). Frontend musi to pokazać + progress bar. |
| Free-delivery progress bar | 🟡 PARTIAL | Jeśli `freeDeliveryFrom` istnieje w settings — wykorzystać; jeśli nie — odłożyć do ROADMAP. *(do sprawdzenia w kodzie)* |
| Toast "Usunięto X" z "Cofnij" | 🔴 MISSING | Biblia §5 — dodać undo pattern. |
| Pole promo kod | 📋 ROADMAP | Brak systemu promocji. Po MVP. |
| CTA "Przejdź do kasy · {cena}" | 🟡 PARTIAL | CTA jest, sprawdzić cenę na przycisku. |

**Decyzja Faza 5 (najważniejsza zmiana w tej sekcji):**
- **Architektura koszyka po Fazie 5:**
  - **Desktop (≥1024px):** sticky sidebar po prawej stronie `MenuPage` (360px szer., top: 80px, max-height calc(100vh - 96px)). Sidebar pokazuje koszyk **inline na stronie menu**.
  - **Tablet/Mobile (<1024px):** zostaje obecny `MobileCartBar` + `CartDrawer` (Sheet bottom). Bez zmian w architekturze, tylko polish.
  - **Checkout (`/checkout`)** — pozostaje osobną stroną. Nie zmieniamy. (Decyzja użytkownika: "ma być dalej checkout ALE też sticky sidebar".)
- **Dodać do sidebara/drawera:** wyświetlanie komentarza per pozycja (z edycją), pasek minimum order z progress barem, undo toast po usunięciu.
- **Free-delivery progress bar** — tylko jeśli pole `freeDeliveryFrom` jest w `RestaurantSettings`. Jeśli nie ma — ROADMAP.

---

### Sekcja 6 (biblia) — Koszyk mobile (floating bar + drawer)

| Element | Status | Komentarz |
|---|---|---|
| `MobileCartBar` sticky bottom | ✅ DONE | Faza 3 dowiozła. |
| Badge z liczbą produktów + cena + CTA | ✅ DONE | |
| Animacja pojawienia | 🟡 PARTIAL | Polish w Fazie 5. |
| Bottom sheet (`CartDrawer`) | 🟡 PARTIAL | shadcn Sheet od prawej, biblia §6 mówi że na mobile lepiej od dołu. **Decyzja: na mobile zmienić Sheet side="right" na side="bottom" z snap pointami.** |
| Swipe to dismiss | 🟡 PARTIAL | shadcn Sheet ma swipe defaultowo, sprawdzić. |
| Zachowanie z otwartą klawiaturą | 🟡 PARTIAL | Test ręczny w Fazie 5 na mobile. |

**Decyzja Faza 5:**
- Zmienić `CartDrawer` na mobile na bottom sheet (Sheet side="bottom"), na desktop nieistotne (sticky sidebar zastępuje drawer dla ≥1024px)
- Polish animacji pojawienia `MobileCartBar`

---

### Sekcja 7 (biblia) — Checkout

| Element | Status | Komentarz |
|---|---|---|
| One-page checkout (nie wizard) | ✅ DONE | Faza 3: jedna strona z RHF + Zod. |
| Sekcja typu zamówienia (delivery/pickup) | ✅ DONE | Radio + auto-derive payment method. |
| Adres dostawy z polami (warunkowe dla DELIVERY) | ✅ DONE | superRefine RHF + Zod. |
| Autocomplete adresu (Google Places) | 📋 ROADMAP | Wymaga Google Places API + płatności. Po MVP. |
| Mapa z pinem po wpisaniu adresu | 📋 ROADMAP | Razem z Google Places. |
| "Użyj mojej lokalizacji" GPS | 📋 ROADMAP | |
| Czas dostawy: ASAP vs zaplanuj | 🟡 PARTIAL | Obecnie tylko ASAP. **Pre-order to ROADMAP.** |
| Metody płatności (cash on delivery / pickup) | ✅ DONE | Faza 3 z auto-derive. |
| BLIK / Przelewy24 / karta online | 📋 ROADMAP | Płatności online to Faza Post-MVP. |
| Pole uwag ogólnych do zamówienia | 🟡 PARTIAL | Sprawdzić czy jest osobne od `itemNote`. |
| Walidacja inline (onBlur) | ✅ DONE | RHF default. |
| Sticky CTA mobile na dole | ✅ DONE | Faza 3 zrobiła sticky bottom bar. |
| Sticky podsumowanie zamówienia (sidebar desktop) | ✅ DONE | `lg:grid-cols-[1fr_360px]`. |
| Edge case: restauracja zamknęła się w trakcie checkoutu | 🔴 MISSING | Polling `isOpenNow()` co X sekund + komunikat. **Faza 5: must-have.** |
| Edge case: produkt wyczerpał się | 🟡 PARTIAL | Backend rzuca 422 (Faza 3). UX komunikatu z listą niedostępnych — sprawdzić w Fazie 5. |
| Anti-double-submit (disabled po pierwszym kliknięciu) | 🟡 PARTIAL | Sprawdzić — `useMutation` jest, ale czy disabled? |

**Decyzja Faza 5:**
- Guard dla otwartości restauracji w `/checkout` — gdy zamknie się podczas wypełniania, baner ostrzegający + zablokowanie submit
- Dopolerować komunikat błędu 422 (lista niedostępnych pozycji + przycisk "Usuń niedostępne")
- Sprawdzić disabled na CTA podczas mutation
- BLIK / Przelewy24 / Google Places → ROADMAP

---

### Sekcja 8 (biblia) — Strona potwierdzenia

| Element | Status | Komentarz |
|---|---|---|
| Numer zamówienia, animacja sukcesu | ✅ DONE | Faza 3. |
| Lista zamówionych pozycji | 🔴 MISSING | Obecnie `OrderConfirmationPage` pokazuje tylko numer + CTA tracking. **Faza 5: dodać podsumowanie pozycji + adres + metoda płatności + ETA.** |
| ETA prominentnie | 🟡 PARTIAL | ETA jest na trackingu, nie na confirmation. Dodać. |
| Email potwierdzający | 📋 ROADMAP | Wymaga SMTP/SendGrid. Po MVP. |
| Opcja anulowania (do X minut) | 📋 ROADMAP | |
| Kopiowanie numeru | 🟡 PARTIAL | Drobnostka, polish w Fazie 5. |

**Decyzja Faza 5:**
- Wzbogacić `OrderConfirmationPage`: pełne podsumowanie zamówienia (pozycje, kwota, adres, metoda płatności, szacowany czas)
- Email potwierdzający → ROADMAP
- Opcja anulowania → ROADMAP

---

### Sekcja 9 (biblia) — Tracking zamówienia

| Element | Status | Komentarz |
|---|---|---|
| URL z UUID tokenem | ✅ DONE | Faza 3. |
| Polling 15s | ✅ DONE | TanStack Query refetchInterval. |
| Wizualizacja statusów (stepper/progress) | 🟡 PARTIAL | Statusy są wyświetlane. Wizualizacja typu **stepper z ikonami i animowanym aktywnym statusem** — do polish w Fazie 5. |
| ETA wyświetlone (godzina vs minutes) | ✅ DONE | Format z biblii §9: "Dostawa ok. 18:45". Sprawdzić. |
| Mapa z kurierem | 📋 ROADMAP | Wymaga GPS kuriera. Pomijamy. |
| Status DELIVERED — ekran "Smacznego" + ocena | 🔴 MISSING | Biblia §9. **Decyzja: prosty komunikat dziękujemy + zachęta do oceny → ale system ocen to ROADMAP. Więc zostaje sam komunikat.** |
| Status CANCELED — wyjaśnienie + CTA | 🟡 PARTIAL | Sprawdzić. |
| Push notification gdy status się zmienia | ❌ OUT OF SCOPE | Wymaga PWA + service worker. |

**Decyzja Faza 5:**
- Polish stepper statusów (ikony per status, animowane podświetlenie aktywnego, odznaczone "✓" dla zakończonych)
- Stan terminalny DELIVERED — komunikat "Smacznego!" (bez systemu ocen)
- Stan CANCELED — wyjaśnienie + CTA "Zamów ponownie" (link do menu)

---

### Sekcja 10 (biblia) — Oceny i komentarze

| Element | Status | Komentarz |
|---|---|---|
| Cały moduł ocen | 📋 ROADMAP | Wymaga: model `OrderReview` lub `ProductReview`, endpointy, moderacja w panelu, ekran oceny po DELIVERED. **Decyzja: ROADMAP, post-MVP. Pozycja w UX_BIBLE.md jako kierunek.** |

---

### Sekcja 11 (biblia) — Psychologia konwersji

| Element | Status | Komentarz |
|---|---|---|
| Social proof ("Bestseller") | 📋 ROADMAP | Wymaga tagów. Po MVP. |
| Free-delivery progress | 🟡 PARTIAL | Patrz §5. |
| Upsell / cross-sell | 📋 ROADMAP | |
| Porzucone koszyki / reminder | ❌ OUT OF SCOPE | Wymaga emaili + tracking sesji. |
| Onboarding tooltips | ❌ OUT OF SCOPE | Niepotrzebne dla małej restauracji — UX powinien być self-explanatory. |

**Decyzja Faza 5:** sekcja w całości → ROADMAP/OUT.

---

### Sekcje 12-15 (biblia) — Responsywność, Performance, A11y, Copy

| Element | Status | Komentarz |
|---|---|---|
| Breakpointy 375 / 768 / 1024 / 1280 | ✅ DONE | Tailwind defaults. |
| Touch targets 44px | 🟡 PARTIAL | `CartDrawer` stepper ma `h-11 w-11 sm:h-9 sm:w-9` — OK. Audyt całości w Fazie 5 przez QA_CHECKLIST. |
| Skeleton screens | 🟡 PARTIAL | Faza 5 ma to wpisane w PHASES.md. |
| Image lazy loading + LQIP | 🔴 MISSING | Faza 5: dodać `loading="lazy"` + LQIP/blur dla menu. |
| Optimistic updates (cart) | ✅ DONE | Zustand + persist, cart total liczone lokalnie. |
| ARIA roles, focus trap w modalach | 🟡 PARTIAL | shadcn defaultowo OK, audyt w Fazie 5. |
| Kontrast WCAG AA | 🟡 PARTIAL | Audyt w Fazie 5. |
| `prefers-reduced-motion` | 🔴 MISSING | Dodać w Fazie 5 (CSS media query disabling animacji). |
| Mikrocopy (CTA, błędy, puste stany) | 🟡 PARTIAL | Audyt w Fazie 5 — biblia §15 ma konkretne sformułowania. |

**Decyzja Faza 5:**
- LQIP/blur-up dla zdjęć menu
- `prefers-reduced-motion` w CSS
- Audyt mikrocopy (puste stany, błędy formularza, statusy zamówienia) zgodnie z biblią §15
- Audyt touch targets, kontrastu — przez QA_CHECKLIST

---

## CZĘŚĆ II — PANEL ADMINA

### Sekcja 16 (biblia) — Role i użytkownicy

| Element | Status | Komentarz |
|---|---|---|
| Single role ADMIN (Faza 1) | ✅ DONE | |
| Wiele ról (Owner / Manager / Staff / Kucharz) | 📋 ROADMAP | Wymaga RBAC. AD-zakazane w MVP zgodnie z `CLAUDE.md`. |
| PIN login dla KDS | 📋 ROADMAP | Razem z KDS. |

**Decyzja:** sekcja → ROADMAP.

---

### Sekcja 17 (biblia) — Kitchen Display System

| Element | Status | Komentarz |
|---|---|---|
| Cały moduł KDS | 📋 ROADMAP | **Realnie dla pizzerii to ogromny added value, ale to osobny moduł post-MVP.** Biblia mówi że to MVP-critical w sekcji podsumowującej, **ale dla single-tenant template to nadmiar**. Zostaje sam panel admina z listą zamówień (Faza 4) jako jedyny widok dla obsługi. |

**Decyzja:** sekcja → ROADMAP. Lista zamówień z Fazy 4 wystarcza dla małej restauracji.

---

### Sekcja 18 (biblia) — Przepływ zamówienia przez kuchnię

| Element | Status | Komentarz |
|---|---|---|
| Manual accept (zmiana statusu na CONFIRMED) | ✅ DONE | Faza 4: state machine z dozwolonymi transitions. |
| Auto-accept | 📋 ROADMAP | |
| Limit czasu na przyjęcie (auto-cancel) | 📋 ROADMAP | |
| Capacity limit | 📋 ROADMAP | |
| Pauzowanie przyjmowania zamówień bez zamykania | 📋 ROADMAP | Powiązane z capacity. |

**Decyzja:** sekcja → ROADMAP w całości.

---

### Sekcja 19 (biblia) — Zarządzanie kurierami

| Element | Status | Komentarz |
|---|---|---|
| Cały moduł kurierów | 📋 ROADMAP | Mała pizzeria może mieć 1-2 kurierów których admin zna z imienia, telefon = aplikacja. **Biblia §19 sama klasyfikuje to jako "Post-MVP" dla małej skali.** |

**Decyzja:** ROADMAP w całości.

---

### Sekcja 20 (biblia) — Strefy dostawy

| Element | Status | Komentarz |
|---|---|---|
| Globalny koszt dostawy + min. zamówienie | ✅ DONE | `RestaurantSettings` (Faza 1). |
| Strefy z różnymi parametrami | 📋 ROADMAP | Wymaga modelu `DeliveryZone`. |
| Walidacja adresu klienta (poza strefą → komunikat) | 📋 ROADMAP | Razem ze strefami. |
| Bezpłatna dostawa od kwoty (`freeDeliveryFrom`) | 🟡 PARTIAL | *(Sprawdzić czy pole jest w `RestaurantSettings`. Jeśli tak — dodać UI; jeśli nie — ROADMAP.)* |

**Decyzja Faza 5:** tylko free-delivery progress jeśli pole istnieje. Reszta → ROADMAP.

---

### Sekcja 21 (biblia) — Zarządzanie dostępnością i czasem

| Element | Status | Komentarz |
|---|---|---|
| Godziny otwarcia per dzień | ✅ DONE | Faza 1. |
| Wyjątki świąteczne (`OpeningHoursException`) | 📋 ROADMAP | `CLAUDE.md` zakazane w MVP. |
| Toggle "otwarte/zamknięte" override | 🔴 MISSING | Biblia §21 — możliwość ręcznego zamknięcia bez czekania na godziny. **Decyzja: dodać `manualClosedReason` do `RestaurantSettings`** (string nullable). Gdy ustawiony — ma priorytet nad godzinami. **Faza 5: must-have, mała zmiana.** |
| Tryb przerwy (zamknięte na X minut z timerem) | 📋 ROADMAP | |
| Capacity management | 📋 ROADMAP | |
| Pre-order na konkretną godzinę | 📋 ROADMAP | |
| Automatyczne ETA (default per kategoria/globalne) | 🔴 MISSING | Biblia §21 — admin konfiguruje "domyślny czas przygotowania = 25 min" raz, zamówienia dostają to ETA automatycznie. **Faza 5: dodać `defaultPreparationMinutes` do `RestaurantSettings`, użyć przy tworzeniu Order.** Mała zmiana, duży zysk UX. |

**Decyzja Faza 5:**
- Dodać `manualClosedReason` (nullable string) i `manualClosedUntil` (nullable LocalDateTime) do `RestaurantSettings` + UI w panelu
- Dodać `defaultPreparationMinutes` (Integer, default 30) do `RestaurantSettings` + użycie w `CheckoutService.createOrder()` jako początkowe ETA
- Capacity, pre-order, auto-cancel → ROADMAP

---

### Sekcja 22 (biblia) — Panel admina: nawigacja i layout

| Element | Status | Komentarz |
|---|---|---|
| Layout z sidebar + top bar | ✅ DONE | Faza 1. |
| Pozycje menu (Dashboard, Zamówienia, Menu, Ustawienia) | ✅ DONE | |
| Badge "nowe zamówienia" w nawigacji | 🟡 PARTIAL | Sprawdzić — Faza 4 SSE może to mieć przez `useAdminOrderFeed`. Polish w Fazie 5. |
| Mobile admin (responsive) | 🟡 PARTIAL | Audyt w Fazie 5 (375px). |
| Powiadomienia bell | 📋 ROADMAP | Polega na typach alertów (zamówienie spóźnione itp.). |
| Dark mode | ❌ OUT OF SCOPE | `CLAUDE.md` zakazane. |

**Decyzja Faza 5:** badge "nowe" przy Zamówieniach, audyt mobile — reszta jak jest.

---

### Sekcja 23 (biblia) — Live View zamówień

| Element | Status | Komentarz |
|---|---|---|
| Lista zamówień z filtrami | ✅ DONE | Faza 4. |
| Kolory badge per status | ✅ DONE | |
| Polling co 5-10s | ✅ DONE | |
| SSE dla live update | ✅ DONE | Faza 4 stretch. |
| Dźwięk przy nowym zamówieniu | ✅ DONE | |
| Toggle "dźwięki ON/OFF" | ✅ DONE | localStorage. |
| Animacja highlight nowego zamówienia | 🟡 PARTIAL | Polish w Fazie 5 (np. zielony flash 600ms na wierszu). |
| Favicon flash przy NEW (badge w tytule zakładki) | 🔴 MISSING | Biblia §23. **Faza 5: dodać `document.title = '(N) Pizza Showcase'` gdy są nowe nieprzeczytane zamówienia.** Mała zmiana, duży efekt. |
| Filtry (status, data, typ) | ✅ DONE | |
| Sortowanie po czasie oczekiwania | 📋 ROADMAP | |
| Widok szczegółów zamówienia | ✅ DONE | Faza 4. |
| Wyświetlanie `itemNote` per pozycja w szczegółach | 🔴 MISSING | Powiązane z dodaniem komentarzy per pozycja (Faza 5). |
| Sekcja klienta z klikalnym telefonem | 🟡 PARTIAL | Sprawdzić `tel:` link. |
| Historia statusów timeline | ✅ DONE | Faza 4. |
| Notatki wewnętrzne admina | 📋 ROADMAP | |
| Ustawianie ETA (presety + custom) | ✅ DONE | Faza 4 modal ETA. |
| Drukowanie zamówienia | 📋 ROADMAP | |
| Anulowanie z powodem | 🟡 PARTIAL | Sprawdzić czy Faza 4 wymaga powodu przy CANCEL — jeśli nie, dodać. |

**Decyzja Faza 5:**
- Animacja highlight nowego zamówienia (flash 600ms)
- Favicon/title badge "(N)" gdy są nieprzeczytane NEW
- Wyświetlanie `itemNote` w widoku szczegółów (po dodaniu pola)
- Klikalny `tel:` w sekcji klienta
- Anulowanie z wymaganym polem `cancelReason`
- Drukowanie / notatki wewnętrzne / sortowanie po czasie → ROADMAP

---

### Sekcja 24 (biblia) — Live mapa zamówień

| Element | Status | Komentarz |
|---|---|---|
| Mapa z aktywnymi zamówieniami | 📋 ROADMAP | Wymaga geocodingu adresów + provider mapy. |

**Decyzja:** ROADMAP.

---

### Sekcja 25 (biblia) — Dashboard i analityka

| Element | Status | Komentarz |
|---|---|---|
| Liczniki live (nowe, w przygotowaniu, do dostawy) | ✅ DONE | Faza 4 dashboard summary. |
| Wykresy zamówień / przychodu | 📋 ROADMAP | `CLAUDE.md` zakazane w MVP. |
| Top produkty | 📋 ROADMAP | |
| KPI dziś vs wczoraj | 📋 ROADMAP | |
| Heatmapa godzinowa | 📋 ROADMAP | |
| Eksport CSV | 📋 ROADMAP | |

**Decyzja:** wszystko poza obecnymi 3 licznikami → ROADMAP.

---

### Sekcja 26 (biblia) — Zarządzanie menu

| Element | Status | Komentarz |
|---|---|---|
| CRUD kategorie / produkty / warianty / addony | ✅ DONE | Faza 2. |
| Toggle dostępności | ✅ DONE | Faza 2. |
| Drag and drop kolejności | 📋 ROADMAP | |
| Upload zdjęć (URL only obecnie) | 📋 ROADMAP | AD-010 (URL w MVP). |
| Tagi (bestseller, nowy, ostre) | 📋 ROADMAP | |
| Alergeny | 📋 ROADMAP | |
| Wartości odżywcze | 📋 ROADMAP | |
| Bulk operations | 📋 ROADMAP | |
| Harmonogram dostępności (np. śniadania do 12:00) | 📋 ROADMAP | |
| Historia zmian cen | 📋 ROADMAP | |
| Import CSV | 📋 ROADMAP | |

**Decyzja:** zostaje obecny CRUD. Reszta → ROADMAP.

---

### Sekcja 27 (biblia) — Ustawienia restauracji

| Element | Status | Komentarz |
|---|---|---|
| Profil (nazwa, opis, logo, kontakt, adres) | ✅ DONE | Faza 1. |
| Godziny otwarcia | ✅ DONE | Faza 1. |
| Wyjątki godzin (święta) | 📋 ROADMAP | |
| Min. zamówienie / koszt dostawy | ✅ DONE | Faza 1. |
| Strefy dostawy | 📋 ROADMAP | |
| Konfiguracja płatności (które aktywne) | 🟡 PARTIAL | Obecnie hardcoded CASH_ON_DELIVERY/CASH_ON_PICKUP. **Decyzja: zostaje hardcoded w MVP** (tylko gotówka, bo żadne płatności online nie są zaimplementowane). |
| Branding (color, font) | 🟡 PARTIAL | Faza 1: brandColor jest. Polish w Fazie 5. |
| Automatyczne ETA (`defaultPreparationMinutes`) | 🔴 MISSING | Patrz §21. **Faza 5.** |
| Manual close override | 🔴 MISSING | Patrz §21. **Faza 5.** |
| Integracje | 📋 ROADMAP | |
| 2FA | 📋 ROADMAP | |

**Decyzja Faza 5:** dodać `defaultPreparationMinutes` i `manualClosedReason`/`manualClosedUntil` do `RestaurantSettings` + UI w sekcji ustawień.

---

### Sekcja 28 (biblia) — Powiadomienia i alerty

| Element | Status | Komentarz |
|---|---|---|
| Dźwięk przy nowym zamówieniu | ✅ DONE | Faza 4 stretch. |
| Toggle dźwięków | ✅ DONE | |
| Browser push notifications | 📋 ROADMAP | Wymaga service worker / PWA. |
| Email/SMS alerty admina | 📋 ROADMAP | Wymaga SMTP/SMS provider. |
| Alert "zamówienie czeka za długo" | 📋 ROADMAP | |
| Nocne podsumowanie email | 📋 ROADMAP | |

**Decyzja:** zostaje co jest. Reszta → ROADMAP.

---

### Sekcja 29 (biblia) — Onboarding

| Element | Status | Komentarz |
|---|---|---|
| Kreator pierwszego uruchomienia | 📋 ROADMAP | |
| Import menu z CSV | 📋 ROADMAP | |
| Tryb testowy | 📋 ROADMAP | |

**Decyzja:** ROADMAP. W MVP admin loguje się i wypełnia ustawienia ręcznie zgodnie z `customization.md`.

---

### Sekcje 30-33 (biblia) — Mobile admin / Multi-location / Fizyczne środowisko / Compliance

Wszystko → ROADMAP lub OUT OF SCOPE:

- Mobile admin app — OUT (responsive web wystarczy)
- Multi-location — OUT (single-tenant zgodnie z `CLAUDE.md`)
- QR kody / wyświetlacz numerków / tablet kelnerski — ROADMAP
- 2FA, RODO eksport, audit log — ROADMAP

---

## CZĘŚĆ III — CROSS-CUTTING

### Sekcja 34 (biblia) — Design system

Stack już zgodny z biblią §34:
- Tailwind ✅
- shadcn/ui ✅
- Lucide ikony ✅
- System fonts (lub Inter) — **sprawdzić w Fazie 5**

**Decyzja Faza 5:**
- Audyt design tokens (spacing, typografia, kolory, border-radius, shadows) zgodnie z biblią §34
- Standaryzacja durations animacji (150/200/300ms)
- Standaryzacja button variants (primary/secondary/ghost/danger)

### Sekcja 35 (biblia) — Architektura informacji

✅ Sitemap publiczny i admin zgodny z fazami 1-4.
🔴 **404/500 pages** — Faza 5 ma wpisane (Error boundaries).
✅ Deep linki działają (React Router).

### Sekcja 36 (biblia) — Integracje

W MVP minimum:
- ✅ Brak SMTP (ROADMAP)
- ✅ Brak SMS (ROADMAP)
- ✅ Brak płatności (ROADMAP)
- ✅ Brak Google Maps (ROADMAP — może iframe OSM w Fazie 5 dla kontaktu)
- ✅ Brak drukarek (ROADMAP)

---

## SYNTEZA — ZMIANY DO FAZY 5

### MUST-HAVE (Faza 5 core):

**Backend (migracja Flyway nowa):**
1. Dodać pole `Order.itemNote` (String) — VARCHAR(200), nullable, w `OrderItem`
2. Dodać do `RestaurantSettings`: `defaultPreparationMinutes` (Integer, default 30, NOT NULL)
3. Dodać do `RestaurantSettings`: `manualClosedReason` (String, nullable, max 200) i `manualClosedUntil` (LocalDateTime, nullable)
4. `CheckoutService` ustawia ETA przy tworzeniu Order używając `defaultPreparationMinutes`
5. `isOpenNow()` w `RestaurantSettingsService` uwzględnia `manualClosedUntil`
6. Endpoint `PATCH /api/admin/orders/{id}/cancel` wymaga pola `cancelReason` w body (jeśli już nie ma)

**Frontend (strona klienta):**
7. **Sticky cart sidebar** na `/menu` przy desktop ≥1024px (360px szer., obok listy produktów); drawer/sheet pozostaje fallbackiem dla <1024px
8. Pole komentarza per pozycja w `ProductModal` (textarea, max 200 znaków, licznik) → wpisywane do `cartStore.addItem({...itemNote})`
9. Wyświetlanie + edycja `itemNote` w `CartDrawer`/sidebar (kursywa pod listą dodatków, klik → inline edit)
10. Pasek minimum order w koszyku (progress bar + tekst "Brakuje X zł")
11. Banner "restauracja zamknięta" globalny (sprawdzanie `isOpenNow()` z public settings, polling co 60s)
12. Pasek informacyjny pod hero (czas, min, koszt dostawy)
13. Cena dynamiczna na CTA modala produktu ("Dodaj · 32,90 zł")
14. Animacja bump ikony koszyka po `addItem` (200ms)
15. LQIP/blur-up dla zdjęć produktów w menu
16. Scroll-spy dla aktywnej kategorii w menu
17. Wzbogacenie `OrderConfirmationPage`: lista pozycji + adres + metoda + ETA
18. Polish stepper statusów na `TrackingPage` (ikony, animowane podświetlenie)
19. `prefers-reduced-motion` w globalnym CSS
20. Edge case: restauracja zamknęła się w trakcie checkoutu — banner + zablokowany submit
21. Edge case: produkt wyczerpany — czytelny komunikat z listą i CTA "Usuń niedostępne"
22. Mikrocopy audyt (puste stany, błędy, statusy) zgodnie z biblią §15

**Frontend (panel admina):**
23. Wyświetlanie `itemNote` w widoku szczegółów zamówienia
24. Klikalny `tel:` w sekcji klienta
25. Animacja highlight nowego zamówienia na liście (flash 600ms)
26. Favicon/title badge "(N)" gdy są nieprzeczytane NEW
27. UI dla `defaultPreparationMinutes` w sekcji ustawień
28. UI dla manual close (toggle "Zamknij teraz" + powód + opcjonalny czas do)
29. Wymóg `cancelReason` przy anulowaniu zamówienia

**Wszystko zaplanowane już w Fazie 5 (PHASES.md) zostaje:**
- Dockerfile multi-stage, Railway deploy
- SEO (OG, manifest, favicon, schema.org Restaurant — to wzbogacenie z biblii)
- Error boundaries
- Mapa kontaktu (iframe OSM)
- Walidacja godzin otwarcia (jest powiązana z #11 i #20)
- README, customization.md, deployment.md
- Skeleton screens, transitions, polish

### NICE-TO-HAVE (Faza 5 jeśli czas):

- Free-delivery progress bar (jeśli pole istnieje)
- Edycja komentarza inline w sidebarze (vs tylko w modalu)
- Toast undo po usunięciu pozycji z koszyka
- Hover polish kart produktów

### → ROADMAP.md (post-MVP):

- System ocen (`OrderReview` lub `ProductReview`)
- Search + filtry tagów w menu
- Tagi produktów + alergeny + wartości odżywcze
- Promo kody / kupony
- Cross-sell / upsell
- Płatności online (BLIK / Przelewy24 / Stripe)
- Google Places autocomplete
- Pre-order na konkretną godzinę
- Strefy dostawy z polygon
- Wyjątki godzin otwarcia (święta)
- Capacity management + pauzowanie zamówień
- Auto-cancel niezaakceptowanych zamówień
- KDS (Kitchen Display System)
- Zarządzanie kurierami (przypisywanie, mapa)
- Wiele ról użytkowników (RBAC)
- Email/SMS notyfikacje (klient + admin)
- Dashboard z wykresami i KPI
- Top produkty / heatmapa / eksport CSV
- Drag and drop kolejności menu
- Upload zdjęć produktów (zamiast URL)
- Bulk operations w menu
- Harmonogram dostępności produktów
- Drukarka termiczna ESC/POS
- Onboarding wizard
- 2FA, audit log, RODO eksport
- Multi-location / multi-tenant
- PWA + push notifications
- QR kody / wyświetlacz numerków

### → POMIJAMY CAŁKOWICIE:

- Dark mode panelu
- Dedykowana aplikacja mobilna admina (native iOS/Android)
- Aplikacja kuriera (native)
- AI/ML predictions
- Voice control
- Gamification, loyalty programs zaawansowane
- Multi-language, multi-currency

---

## NEXT STEP

Przeczytaj [docs/UX_BIBLE.md](./UX_BIBLE.md) jeśli pojawi się pytanie o szczegół któregoś z elementów. Konkretne wartości (px, ms, kolory, copy) są w bibli per sekcja.

Dla **Fazy 5** zaktualizuj `docs/PHASES.md` zgodnie z synteza powyżej. Listę "ROADMAP" przenieś do `docs/ROADMAP.md`.
