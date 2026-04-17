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

### Kiedy najwcześniej sensownie
Gdy realny klient zgłosi problem "przyjechało zamówienie spoza strefy" lub
"musimy różnicować koszt dostawy". Nie wcześniej.

### Co się zmienia w modelu
- Nowa encja DeliveryZone (id, name, polygon | postalCodes, deliveryFee,
  minOrderAmount, estimatedMinutes, active)
- Order.deliveryZoneId referencja
- Walidacja adresu przy checkout

### Co trzeba zbudować
- UI admin do definiowania stref:
  - Wariant A (prosty): lista kodów pocztowych per strefa
  - Wariant B (premium): rysowanie polygonów na mapie (Leaflet + plugin draw)
- Matcher adresu → strefa (przez kod pocztowy lub geocoding + punkt w polygon)
- Blokada checkoutu dla adresu poza strefą z czytelnym komunikatem
- Kalkulacja deliveryFee i minOrderAmount per strefa

### Pułapki
- **Geocoding** — Google Maps płatny, Nominatim OSM darmowy ale wolny i
  z rate limit. Decyzja przy implementacji.
- **Polygon + kody pocztowe naraz** — priorytet polygonów, kody jako fallback
- **Zmiana stref wstecz** — historyczne zamówienia nie zmieniają się

### Szacunek
- Wariant A (kody pocztowe): 3-5 dni
- Wariant B (polygony na mapie): 7-10 dni

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
