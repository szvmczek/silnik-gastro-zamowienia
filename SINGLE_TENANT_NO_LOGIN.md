# SINGLE_TENANT_NO_LOGIN.md — co NIE pasuje z Pyszne/Glovo

> **Dokument-uściślenie dla designera.** Pisany jako reakcja na
> drift w Stage 2 (designer dorzucił "Śledź zamówienie" jako
> globalny link w nav). Pokazuje konkretnie **które patterny z
> Pyszne/Glovo NIE pasują** do naszego produktu, bo nie mamy
> loginu klienta i nie mamy wielu restauracji.
>
> Czytaj razem z `VISUAL_DIRECTION.md` §11 (inspiracje) i
> `DESIGN_BRIEF.md` §6 (Pyszne / Uber Eats / SaaS patterns).

---

## 1. Czym TO jest, czym NIE jest

**Czym jest:** dedykowana aplikacja **JEDNEJ restauracji**. Klient
otwiera `pizzademo.pl`, widzi tę pizzerię, zamawia z tej pizzerii.
Koniec. Nie wybiera "która z 47 pizzerii w Łomiankach". Nie ma
porównania cen. Nie ma rankingu.

**Czym NIE jest:**

- ❌ Agregatorem (Pyszne / Glovo / Uber Eats / Bolt Food) — to są
  marketplace'y wielu restauracji. **My jesteśmy JEDNĄ.**
- ❌ Platformą z kontami klientów (Pyszne wymaga rejestracji /
  logowania) — **klient u nas nie loguje się NIGDY**
- ❌ Wielomarkową siecią (Domino's, KFC z 200 lokalizacjami) —
  **single-tenant, jedna pizzeria**

---

## 2. Co to oznacza dla designu — twarde "NIE"

### 2.1 NIE MA loginu klienta. Nigdy.

**Nie projektujemy:**

- ❌ Linka / przycisku "Zaloguj się" w nav publicznej strony
- ❌ Przycisku "Zarejestruj się" / "Załóż konto"
- ❌ Avataru klienta w prawym górnym rogu
- ❌ Dropdown'u user menu ("Moje zamówienia", "Ulubione",
  "Wyloguj")
- ❌ Stron `/profile`, `/account`, `/orders` (jako historia
  zamówień klienta)
- ❌ "Zaloguj się żeby śledzić zamówienie" — bo nie
- ❌ "Zaloguj się żeby zamówić szybciej" — bo nie
- ❌ Social login ("Zaloguj przez Google/Facebook") — bo nie
- ❌ "Zapisz adres dostawy" jako persistent feature konta
- ❌ "Zapisz metodę płatności" — bo cały MVP jest na gotówkę,
  nie ma metod do zapisania

**Wyjątek — admin login:** `/admin/login` istnieje (Pani Kasia
loguje się do panelu zarządzania). To **JEDYNY login w systemie.**
Dotyczy wyłącznie panelu admin. Klient publicznej strony NIGDY nie
widzi loginu.

### 2.2 NIE MA wielu restauracji. Nigdy.

**Nie projektujemy:**

- ❌ Filtra "wybierz miasto" / "wybierz dzielnicę"
- ❌ Listy restauracji ("44 pizzerie w Twojej okolicy")
- ❌ Kart restauracji z miniaturą hero + rating + "min. zamówienie"
- ❌ Filtrowania "Open now / Pizza / Best rated / Free delivery"
- ❌ "Polecane restauracje", "Nowe restauracje", "Twoje ulubione
  restauracje"
- ❌ Wyszukiwarki "co zjesz?" → lista restauracji
- ❌ Mapy z pinami restauracji
- ❌ Multi-restaurant cart ("dodaj z Pizza Hut + Subway = ostrzeżenie")

Strona startuje **od razu na pizzerii**. Klient widzi `/` i wie:
"to jest Pizza Demo, ta pizzeria, w tym mieście, ok zamawiam".

### 2.3 NIE MA marketplace economics

**Nie projektujemy:**

- ❌ "Promo code" / "Voucher" / "Kupon rabatowy"
- ❌ "Free delivery weekend" cross-restaurant promotion
- ❌ Loyalty points ("Zbieraj punkty", "Stempelek za 10. zamówienie")
- ❌ Referral program ("Poleć znajomemu, dostaniesz 10 zł")
- ❌ "Zaproś znajomych", "Share on Facebook"
- ❌ Newsletterów marketingowych ("Pyszne Newsletter — 200 zł
  zniżki w tym miesiącu")
- ❌ Push notifications "🍕 20% rabatu na pizzę dziś!"

---

## 3. Tracking zamówienia — jak to działa BEZ loginu

> **Kluczowe zrozumienie.** Klient śledzi zamówienie **bez
> żadnego konta.** Cały mechanizm działa przez **publiczny token
> UUID w URL**.

### 3.1 Flow

```
1. Klient na /menu
   → dodaje do koszyka
   → klika "Złóż zamówienie"
   → ląduje na /checkout

2. Klient na /checkout
   → wpisuje imię, telefon, email (opcjonalnie), adres
   → klika "Złóż zamówienie · 88,60 zł"
   → backend tworzy Order, generuje publicTrackingToken (UUID)
   → backend zwraca orderNumber i token
   → frontend redirect na /order/confirmation/{orderNumber}

3. Klient na /order/confirmation/2026-00184 (potwierdzenie)
   → widzi: "Dziękujemy. Numer zamówienia: 2026-00184"
   → widzi: lista pozycji, adres, ETA, suma
   → primary CTA: "Śledź zamówienie" → /track/{token}
   → secondary CTA: "Wróć do menu" → /menu

4. Klient na /track/{token}
   → polling co 15s na backend
   → widzi: status (NEW → CONFIRMED → IN_PREP → READY → OUT_FOR_DEL → DELIVERED)
   → widzi: ETA "Dostawa ok. 18:45"
   → widzi: pozycje, adres, suma
   → stays here aż do DELIVERED lub CANCELED

5. Klient zamknął tab. Co teraz?
   → Email (jeśli podał) zawiera link /track/{token}
   → Klika link z emaila → wraca do trackingu
   → ALBO: bookmark URL, screenshot, share przez WhatsApp
   → Token w URL JEST kluczem dostępu — nie ma loginu, nie ma
     "lista moich zamówień"
```

### 3.2 Co to oznacza dla designu

**`/track/:token` jest dostępny TYLKO przez bezpośredni URL z
tokenem.** Nie ma do niego linku w nav, w footerze, nigdzie.
Klient dostaje link:

- Z confirmation page (po złożeniu zamówienia)
- Z emaila potwierdzającego (jeśli podał email)
- Ze swojej historii przeglądarki (jeśli wrócił do tabu)

**NIE ROBIMY:**

- ❌ Linka "Śledź zamówienie" w globalnej nav (klient na `/`
  nie ma czego śledzić — nie ma jeszcze zamówienia)
- ❌ Linka "Śledź zamówienie" w nav menu (klient na `/menu`
  jeszcze ZAMAWIA, nie śledzi)
- ❌ Formularza "Wpisz numer zamówienia żeby śledzić" — to
  wymagałoby też tokenu (sam numer to za mało dla bezpieczeństwa),
  a komplikuje UX dla zerowej korzyści. Klient ma link → klika.
  Klient nie ma linka → kontaktuje się telefonicznie z restauracją.
- ❌ "Historia moich zamówień" w nav — bo nie ma loginu, nie ma
  historii
- ❌ Stałego floating bottom badge "Twoje aktywne zamówienie:
  IN_PREP" widocznego globalnie — zbyt dużo state managementu
  bez loginu, klient i tak ma confirmation/tracking page

**JEDYNY moment** kiedy w UI publicznym pojawia się link do
trackingu = na **confirmation page** (`/order/confirmation/...`)
jako primary CTA "Śledź zamówienie →".

### 3.3 Edge case: klient zgubił link

Klient zamówił, dostał emaila z linkiem, ale email zaginął w
spamie. Co robi?

**Odpowiedź:** dzwoni do restauracji (telefon w footerze).
Pani Kasia w `/admin/orders` widzi jego zamówienie po imieniu
/ telefonie / czasie, sprawdza status, mówi mu "Pizza wyszła
przed chwilą, będzie za 10 minut".

**To NIE jest problem do rozwiązania designem.** To jest 1% case'ów,
i komunikacja telefoniczna jest natural fallback dla single-tenant
pizzerii. Pyszne ma "moje zamówienia" w koncie bo obsługuje
miliony użytkowników i nie da się tego rozwiązać telefonem do
agregatora — my jesteśmy lokalną pizzerią, klient ma telefon do
nas i tak.

---

## 4. Co BIERZEMY z Pyszne/Glovo (re-przypomnienie)

Mimo wszystkich "NIE", BIERZEMY:

### Patterns do menu

- ✅ Sticky cart sidebar 360px na desktop
- ✅ Sticky tabs kategorii z scroll-spy
- ✅ Bottom sheet produktu na mobile
- ✅ Floating bottom bar koszyka na mobile
- ✅ Modal produktu z konfiguratorem (warianty + dodatki + cena
  dynamiczna na CTA)
- ✅ Stepper qty inline w karcie po pierwszym dodaniu
- ✅ Bump animacja ikony koszyka po addItem
- ✅ Empty state koszyka z konkretnym CTA

### Patterns do conversion

- ✅ Pasek informacyjny pod hero (czas dostawy / min / koszt
  dostawy)
- ✅ Banner "restauracja zamknięta" globalny gdy `isOpenNow() = false`
- ✅ Progress bar darmowej dostawy w koszyku ("Brakuje 17 zł")
- ✅ Progress bar minimum order ("Brakuje 5 zł do minimum")
- ✅ Konkretny ETA "Dostawa ok. 18:45" zamiast "ok. 30 min"

### Patterns do trackingu

- ✅ Pizza tracker stepper z ikonami per status
- ✅ Pulsujący aktywny krok
- ✅ Auto-refresh (polling 15s)
- ✅ Stany terminalne (DELIVERED → "Smacznego" / CANCELED → reason)
- ✅ Email z linkiem do trackingu

### Czego NIE BIERZEMY

| Z Pyszne/Glovo | Dlaczego my NIE |
|---|---|
| Login / rejestracja klienta | nie mamy kont klientów |
| Historia zamówień klienta | nie mamy kont klientów |
| Lista restauracji / wybór miasta | jedna restauracja |
| Filtry typu kuchni / ratingu | jedna restauracja |
| Kupony / promocje / loyalty | nie w MVP, ROADMAP |
| Push notifications | wymaga PWA + service worker, ROADMAP |
| Multi-cart cross-restaurant | jedna restauracja |
| Ratings i reviews klientów | nie zbieramy, ROADMAP |
| Tip dla kuriera | gotówka tylko, brak online payments |
| Multi-language UI (PL/EN/UA) | tylko polski w MVP |
| Saved addresses w koncie | nie ma kont |
| Saved payment methods | gotówka, nic do zapisania |
| "Zamów ponownie" 1-click | wymaga historii = wymaga konta |
| Live chat support | nie mamy support team, telefon do restauracji |
| Newsletter signup | nie wysyłamy emaili marketingowych |
| Referral program | brak business case'u dla single restauracji |

---

## 5. Konkretna lista zmian dla designera

W kontekście Stage 2 i kolejnych:

1. **Usuń "Śledź zamówienie" z globalnej nav.** Tracking jest
   dostępny tylko przez `/track/:token` z bezpośredniego URL.
   PublicNav po lewej: logo. Po prawej: linki do `/menu`,
   `#about`, `#contact` + telefon klikalny + ikona koszyka z
   badge'm. Koniec.
2. **Nigdzie w UI publicznym nie projektuj loginu klienta.**
   PublicNav, footer, modale, formularze — żadnego "zaloguj się".
3. **Footer minimalny** — kontakt, godziny, regulamin / polityka
   prywatności / strefa dostawy / kontakt, social links (jeśli
   ustawione). Bez "Newsletter signup", bez "Pobierz aplikację",
   bez "Zarejestruj się".
4. **Confirmation page** — primary CTA "Śledź zamówienie →" tu i
   tylko tu. Email z linkiem (poza UI) — to backend logic.
5. **Checkout** — pole email jest **opcjonalne** (klient może nie
   podać). Jeśli nie podał → tylko link na confirmation page,
   brak emaila z trackingiem. Jeśli podał → email + confirmation.
   Nie blokujemy zamówienia bez emaila.
6. **Brak "kontynuuj jako gość"** — bo nie ma alternatywy "konto".
   Każde zamówienie jest "jako gość".

---

**Wersja 1.0** · 2026-05-04 · clarification po Stage 2 drift
