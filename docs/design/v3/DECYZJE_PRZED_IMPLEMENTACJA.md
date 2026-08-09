# Decyzje przed implementacją designu v3 (Fable / "PIEC")

> **Status: ZREALIZOWANE** (2026-08-09). Dokument zarchiwizowany w tej
> postaci, w jakiej wszedł do sesji implementacyjnej. Korekty, które
> wyszły podczas wdrożenia, są w sekcji **„Korekty po implementacji"**
> na końcu pliku — czytaj ją razem z punktami D-01…D-08, bo w dwóch
> miejscach zmienia to, co jest wyżej.
>
> Umieszczone w `docs/design/v3/`, a nie w `docs/design/v2/DESIGN_DECISIONS.md`
> jak zakładał punkt „Co dalej" — tam żyje numeracja `D-001..D-015`
> ze Stage 1-4 i kolizja `D-01` vs `D-001` byłaby myląca.

Design Fable powstał bez znajomości naszego backendu. Poniższe punkty to miejsca,
w których projekt rozjeżdża się z tym, co faktycznie mamy w bazie i w kodzie.
Każdy wymaga świadomej decyzji **przed** sesją z Claude Code — inaczej Claude Code
dopowie sobie sam i wyjdzie drift.

Format: problem → rekomendacja → konsekwencja.

---

## D-01: Strefy dostawy

**Korekta:** strefy dostawy już istnieją w backendzie. Frontend ma się
dostosować do istniejącej logiki, nie odwrotnie. Design z Fable (tabela
stref, komunikat "Strefa 1 — dostawa gratis od X zł") zostaje wdrożony
tak, żeby realnie pobierał dane z istniejącego API stref, nie hardcoded.

---

## D-02: Sos jako produkt vs sos jako dodatek

**Co jest w designie:** sos występuje w dwóch rolach jednocześnie.
1. Osobna pozycja w menu, kategoria „Sosy", 5 zł, przycisk `+` dodaje do koszyka
2. Dodatek w konfiguratorze pizzy: „SOS DO BRZEGÓW, po 5 zł, maks. 3"

**Co mamy:** to dwie różne encje — `Product` (z własną kategorią) i `AddonGroup`
+ `Addon` (przypięte do produktu przez `ProductAddonGroup`).

**Rekomendacja: zostawić jako dwa osobne byty, tak jak jest w designie.**
- Kategoria „Sosy" → zwykłe `Product`, kupowany osobno
- „Sos do brzegów" → `AddonGroup` z `maxSelect: 3`, przypięta do pizz

**Dlaczego:** to nie jest duplikacja, tylko dwa różne zachowania biznesowe —
sos w kubeczku obok pizzy to inny produkt niż sos wpieczony w brzeg. Klient
rozumie różnicę. Próba zunifikowania tego w jedną encję skomplikuje model
bez zysku.

**Uwaga dla Pani Kasi:** w panelu admina te same nazwy pojawią się w dwóch
miejscach. Trzeba to opisać etykietami, żeby nie było mylące.

---

## D-03: Reszta przy płatności gotówką

**Co jest w designie:** wybór „Odliczoną kwotą / Ze 100 zł / Z 200 zł",
przenoszony na ekran potwierdzenia i do trackingu („132 zł · reszta: ze 100 zł").

**Co mamy:** nic. `Order` ma `paymentMethod`, nie ma pola na resztę.

**Rekomendacja: wdrożyć.** To jeden z najlepszych pomysłów w całym designie —
realny problem kuriera, zero kosztu technicznego.

**Do zrobienia:**
- Nowa kolumna na `Order`: `cashChangeFrom` (nullable, `DECIMAL`)
- Wartości: `null` = odliczona kwota, inaczej kwota banknotu
- Widoczne w panelu admina przy szczegółach zamówienia — kurier musi to wiedzieć
- Nowa migracja Flyway

---

## D-04: Email klienta

**Co jest w designie:** pole opcjonalne z etykietą „wyślemy potwierdzenie",
adres pokazany na ekranie potwierdzenia w wierszu „Potwierdzenie".

**Co mamy:** nic. Wysyłka maili to Faza 8 w `ROADMAP.md`, odrzucona ze względu
na narzut SMTP dla pojedynczej lokalnej pizzerii.

**Rekomendacja: zbierać, nie wysyłać.**
- Pole zostaje jako opcjonalne, walidacja formatu przez Zod + Bean Validation
- Nowa kolumna `customerEmail` na `Order` (nullable)
- **Etykieta zmienia się na neutralną** — bez obietnicy wysyłki
- Wiersz „Potwierdzenie" na ekranie potwierdzenia znika

**Dlaczego:** jak Pani Kasia po miesiącu zgłosi, że klienci gubią linki,
dokładasz wysyłkę i masz już bazę adresów. Odwrotnie się nie da.

---

## D-05: Statusy zamówienia

**Co jest w designie:** cztery kroki na trackingu — Przyjęte → W przygotowaniu
→ W drodze → Dostarczone.

**Co mamy:** sześć statusów w enumie (AD-008):
`NEW → CONFIRMED → IN_PREPARATION → READY → OUT_FOR_DELIVERY → DELIVERED`
plus `CANCELED` z każdego.

**Dwa problemy:**
1. `CONFIRMED` nie ma odpowiednika w designie — u nas to opcjonalna ścieżka
   back-office, nie pokazywana w widokach operacyjnych
2. `READY` (gotowe do odbioru) w ogóle nie występuje — a przy odbiorze osobistym
   to najważniejszy status dla klienta

**Rekomendacja: mapowanie zależne od typu realizacji.**

DOSTAWA (4 kroki widoczne):
| Status w bazie | Etykieta na trackingu |
|---|---|
| `NEW`, `CONFIRMED` | Przyjęte |
| `IN_PREPARATION` | W przygotowaniu |
| `READY`, `OUT_FOR_DELIVERY` | W drodze |
| `DELIVERED` | Dostarczone |

ODBIÓR OSOBISTY (4 kroki widoczne):
| Status w bazie | Etykieta na trackingu |
|---|---|
| `NEW`, `CONFIRMED` | Przyjęte |
| `IN_PREPARATION` | W przygotowaniu |
| `READY` | **Gotowe do odbioru** |
| `DELIVERED` | Odebrane |

`CANCELED` → osobny widok, nie krok na osi.

**Dlaczego:** klient odbierający osobiście musi wiedzieć, kiedy przyjść.
„W drodze" przy odbiorze nie ma sensu.

---

## D-06: Numer zamówienia i link do trackingu

**Co jest w designie:** „Nr 79", link `zamow.piec-pultusk.pl/s/79`.

**Co mamy:** `orderNumber` w formacie `2026-00001` oraz `publicTrackingToken`
jako UUID v4 (AD-007).

**Problem bezpieczeństwa:** link `/s/79` jest sekwencyjny. Wpisując `/s/78`
zobaczysz cudze zamówienie razem z adresem dostawy i numerem telefonu.
To wyciek danych osobowych — poważny, bo RODO.

**Rekomendacja: rozdzielić to, co klient widzi, od tego, co jest w URL.**
- URL trackingu: `/s/{UUID}` — bez zmian względem AD-007
- Numer pokazywany klientowi: **krótki, per rok, jak w designie**
- Format `orderNumber` do ustalenia: zostawiamy `2026-00001` czy skracamy do `79`?

**Rekomendacja co do formatu: zostawić `2026-00001` w bazie, wyświetlać
skróconą część (`00079` → „Nr 79").** Baza ma format jednoznaczny i sortowalny,
klient i telefon operują krótkim numerem. Jedna funkcja formatująca po stronie
frontendu.

---

## D-07: Ceny „od" w menu

**Co jest w designie:** karta pizzy pokazuje „od 32 zł", nagłówek menu wyjaśnia
„Ceny »od« — za 30 cm".

**Co mamy:** `Product.basePrice` + `ProductVariant.price` (cena absolutna).

**Rekomendacja: bez zmian w modelu.** „od X zł" to minimum z wariantów,
liczone przy budowaniu odpowiedzi `/api/public/menu`. Zero migracji.

**Uwaga:** Calzone ma jeden rozmiar i w designie pokazuje „42 zł" bez „od".
Logika: jeśli produkt ma jeden wariant → cena bez prefiksu. Do zaimplementowania
po stronie frontendu.

---

## D-08: Panel administracyjny

**Zakres tej rundy designu:** wyłącznie ekrany publiczne (klient końcowy).
Panel admina świadomie pominięty w brief dla Fable, żeby nie palić kredytów
na coś, co klient nie widzi.

**Decyzja: panel admina zostaje bez zmian — z jednym wyjątkiem.**

**Wyjątek: ekran logowania admina (`/admin/login`).** Obecny wygląda jak
placeholder z Fazy 1 i będzie pierwszym ekranem, jaki zobaczy właściciel
pizzerii przy demo. Ma zostać przestylizowany do spójności wizualnej
z resztą produktu.

**To NIE wymaga nowego przebiegu w Fable.** Cała stylistyka (kolory,
typografia, komponenty przycisków i pól formularza) już istnieje w bundle'u
publicznym. Zadanie dla Claude Code: przenieść istniejące tokeny wizualne
na formularz logowania — bez zmiany logiki, bez zmiany pozostałych ekranów
panelu.

**Reszta panelu (dashboard, CRUD menu, lista zamówień, ustawienia)
pozostaje dosłownie nietknięta w tej rundzie.** Ważne do wpisania wprost
w prompt startowy do Claude Code — inaczej może „przy okazji" zacząć
ujednolicać styl całego panelu, co nie jest w scope.

---

## Podsumowanie zmian w bazie

Nowa migracja Flyway (V206 albo kolejna wolna):
- `orders.cash_change_from` — `DECIMAL(10,2)`, nullable (D-03)
- `orders.customer_email` — `VARCHAR(255)`, nullable (D-04)
- `restaurant_settings.delivery_fee` — jeśli nie istnieje (D-01)
- `restaurant_settings.free_delivery_from` — jeśli nie istnieje (D-01)

Bez zmian w modelu: sosy (D-02), statusy (D-05), tracking token (D-06),
ceny „od" (D-07).

---

## Status decyzji

Wszystkie punkty zatwierdzone:
- **D-01** — zatwierdzone: strefy dostawy NIE wchodzą do MVP, pojedyncza
  stawka jak w starej wersji (Warstwa 6)
- **D-02** — zatwierdzone: sos jako dwa osobne byty (Product + AddonGroup)
- **D-03** — zatwierdzone: `cashChangeFrom` na Order, nowa migracja
- **D-04** — zatwierdzone: email zbierany, nie wysyłany
- **D-05** — zatwierdzone: mapowanie statusów wg typu realizacji
- **D-06** — zatwierdzone: `2026-00001` w bazie, krótki numer dla klienta,
  jak w starej wersji
- **D-07** — zatwierdzone: ceny „od" liczone przy budowaniu odpowiedzi API
- **D-08** — zatwierdzone: panel admina bez zmian, wyjątek: ekran logowania

## Co dalej

1. ~~Przejrzeć punkty D-01 … D-08~~ — zrobione, wszystko zatwierdzone
2. Wkleić ten dokument do `docs/design/v2/DESIGN_DECISIONS.md` w repo
3. Wyciągnąć surowy bundle (JSX/HTML) z Claude Design — Claude Code ma
   czytać kod bezpośrednio, nie brief pośredni
4. Sesja z Claude Code, plan mode:
   - backend: migracja z D-03/D-04 (można osobną sesją, niezależne od frontu)
   - frontend: mapowanie ekranów z bundla na istniejące route'y +
     restylizacja `/admin/login` na tokenach z bundla (D-08)
   - PLAN → akceptacja → dopiero implementacja
   - panel admina (poza loginem) pozostaje nietknięty — do wpisania
     wprost w prompt startowy

---

## Korekty po implementacji (2026-08-09)

Cztery rzeczy rozjechały się między tym dokumentem a stanem faktycznym
kodu. Zapis dla następnej sesji, żeby nie szukać drugi raz.

### D-04 nie wymagał migracji — pole już istniało

Dokument zakładał „nowa kolumna `customerEmail` na `Order`". W praktyce
`orders.customer_email VARCHAR(160)` istnieje od `V7__orders.sql`,
a `CreateOrderRequest.customerEmail` ma `@Email @Size(max=160)` od tego
samego momentu. Brakowało **wyłącznie pola w formularzu checkoutu**.
Zrealizowano jako zmianę czysto frontendową. Etykieta neutralna,
bez obietnicy wysyłki — reszta punktu bez zmian.

### D-01 — treść punktu i „Status decyzji" mówiły co innego

Treść D-01: „strefy dostawy już istnieją w backendzie, frontend ma się
dostosować". Linia w „Status decyzji": „strefy dostawy NIE wchodzą do
MVP, pojedyncza stawka". Sprzeczność rozstrzygnięta przez operatora
w sesji implementacyjnej: **obowiązuje treść punktu — strefy zostają**.

Stan faktyczny to pełna Faza 7.0: `V10`, encje, lookup z fallbackiem
`(miasto, kod)`, `/api/public/delivery/check` + `/cities`, ekran admina
`/admin/settings/zones`, snapshot `deliveryFee` + `deliveryZoneName`
na `Order`, 13 testów lookup.

Konsekwencje dla „Podsumowania zmian w bazie" na górze pliku:
- `restaurant_settings.delivery_fee` — **NIE powstaje**, koszt dostawy
  żyje per `DeliveryZone`
- `restaurant_settings.free_delivery_from` — **powstaje** (V206),
  zasila komunikat „gratis od 70 zł" i istniejący komponent postępu
- checkout pyta o MIASTO + KOD POCZTOWY zamiast szukać strefy po ulicy
  jak paczka, bo tak liczy backend
- landing buduje kafle „Dostawa i odbiór" z nowego, read-only
  `GET /api/public/delivery/zones`

### D-03 dotyka panelu admina mimo D-08

D-03 wprost wymaga, żeby reszta z gotówki była widoczna „w panelu
admina przy szczegółach zamówienia — kurier musi to wiedzieć". D-08
mówi „panel nietknięty". Rozstrzygnięte tak, że D-08 zakazuje
**restylizacji**, nie dołożenia danych operacyjnych. Zakres w panelu
ograniczony do trzech linijek tekstu: `OrderDetailPage` (karta
Płatność), `PickupOrderCard`, `DeliveryOrderCard`. Zero zmian stylu,
zero zmian logiki, reszta panelu bez jednej linii diffa.

Dodatkowo backend odrzuca `cashChangeFrom < total` jako 422 — banknot,
z którego nie da się wydać reszty, jest błędem danych, nie preferencją.
Frontend nie pokazuje takich nominałów w ogóle.

### Numeracja migracji: V206, nie V12

Dokument trafnie proponował „V206 albo kolejna wolna". Warto zapisać
dlaczego: profil prod ma `flyway.out-of-order` wyłączone, więc nowa
migracja musi mieć numer wyższy niż **wszystko** istniejące (V205),
a nie „następny wolny w linii schematu". `V12` wykonałoby się przed
`V100` na świeżej bazie i wywróciło pierwszy deploy.

Ostatecznie: `V206` (cashChangeFrom + freeDeliveryFrom),
`V207` (seed demo PIEC).

### Zdjęcia z paczki — nie weszły

Paczka dostarcza sześć własnych JPG. Eksport przez MCP tnie pliki na
256 KiB i wszystkie sześć wróciło bez markera EOI (uszkodzone).
Zostaliśmy przy konwencji repo i AD-010: obraz jako URL, cztery
zweryfikowane kadry rotowane po produktach — dokładnie to, co robi
`imgFor()` w samej paczce. Podmiana na pliki własne to jedna linia
na produkt w seedzie.
