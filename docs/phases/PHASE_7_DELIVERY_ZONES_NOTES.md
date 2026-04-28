# Faza 7: Strefy dostawy — podsumowanie ustaleń

> Dokument podsumowujący kilka rozmów na temat dodania mini-checkera adresów
> do projektu Pizza Showcase. Wklej to jako pierwszą wiadomość nowego wątku
> w projekcie Claude — daje pełny kontekst do pisania promptów dla Claude Code.

---

## 1. Kontekst i cel

Restauracja musi móc skonfigurować, gdzie dowozi i za ile:
- Strefa A — dostawa za darmo
- Strefa B — dostawa za dopłatą (np. 5 zł)
- Reszta — dostawa niedostępna

To jest **rozwinięcie Fazy 7 z `docs/ROADMAP.md`** (Strefy dostawy, Wariant A).
Zamiast oryginalnej "lista kodów pocztowych per strefa" — finalnie hybrydowy
model `(miasto, kod pocztowy)` z fallbackiem.

**Reżim kosztowy: zero zewnętrznych płatnych API. Zero abonamentów.
Klient pizzerii nie podaje żadnego klucza API. Operator (właściciel SaaS-a)
też nie płaci za nic.**

---

## 2. Decyzje (TL;DR)

| Decyzja | Wybór | Uzasadnienie |
|---|---|---|
| Model dopasowania adresu | Para `(city, postal_code)` z `postal_code` opcjonalnym (NULL = wildcard miasta) | Sam kod nie wystarczy (1 kod = 5 wsi na wsi; 1 miasto = wiele kodów w mieście). Sama miejscowość nie wystarczy (duplikaty nazw, dzielnice z innymi cenami). |
| Priorytet lookup'u | Najpierw exact match (city + code), potem fallback do (city + NULL), potem UNAVAILABLE | Pozwala admin'owi powiedzieć "cały NDM darmowo, ale Modlin-Twierdza kosztuje 5 zł" — override przez bardziej szczegółowy wpis |
| Autocomplete adresu | **Lokalny** — sugestie miast z bazy stref + format mask na kodzie. **Bez** Google/Mapbox/Photon w MVP. | Zero kosztu, zero zewnętrznych zależności. 90% wartości UX-owej za 0 zł. |
| Liczba poziomów strefy | 3 stałe typy: `FREE`, `PAID` (z fee), `UNAVAILABLE` | Wystarcza dla pizzerii. Min order amount per strefa, godziny strefy, polygony — odłożone na 7.1+ |
| Geocoding / mapy / polygony | NIE w 7.0 | YAGNI. Wariant B z roadmapy (Leaflet + draw) na później jeśli klient zgłosi potrzebę. |
| Wpływ na model `Order` | `total = subtotal + deliveryFee` (zmiana wobec obecnego AD-016 gdzie `total = subtotal`). Snapshot `deliveryFee` i `deliveryZoneName` zapisywany na encji `Order`. | Bez snapshotu zmiana strefy psuje historyczne zamówienia. |

---

## 3. Model danych

### Nowe encje (migracja, np. `V8__delivery_zones.sql`)

```sql
CREATE TABLE delivery_zone (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  type VARCHAR(20) NOT NULL,                    -- FREE | PAID | UNAVAILABLE
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0, -- używane gdy type=PAID
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CHECK (type IN ('FREE','PAID','UNAVAILABLE')),
  CHECK (type <> 'PAID' OR delivery_fee > 0)
);

CREATE TABLE delivery_zone_area (
  id BIGSERIAL PRIMARY KEY,
  zone_id BIGINT NOT NULL REFERENCES delivery_zone(id) ON DELETE CASCADE,
  city_normalized VARCHAR(120) NOT NULL,         -- lowercase, trim, bez diakrytyków
  city_display VARCHAR(120) NOT NULL,            -- oryginalna pisownia do wyświetlenia
  postal_code VARCHAR(6),                        -- format XX-XXX, NULL = wildcard
  CONSTRAINT uniq_city_code UNIQUE (city_normalized, postal_code)
  -- UWAGA: w PostgreSQL UNIQUE traktuje NULLe jako rozłączne domyślnie.
  -- Trzeba użyć NULLS NOT DISTINCT (PG 15+) ALBO unikalnego indeksu z COALESCE.
);

-- Wariant z indeksem (działa od dawnych wersji PG):
CREATE UNIQUE INDEX uniq_city_code_idx
  ON delivery_zone_area (city_normalized, COALESCE(postal_code, ''));
```

### Zmiana w `orders`

```sql
ALTER TABLE orders
  ADD COLUMN delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN delivery_zone_name VARCHAR(80);
```

`Order.total` przeliczane jako `subtotal + delivery_fee`. `delivery_fee` i
`delivery_zone_name` to **snapshoty** — niezmienne nawet gdy admin
przekonfiguruje strefy później.

---

## 4. Lookup logic (kluczowe!)

```
Input: { city, postalCode }

1. normalize(city)         // lowercase, trim, strip diakrytyków, collapse whitespace
2. normalize(postalCode)   // strip whitespace, ensure XX-XXX format

3. SELECT z.type, z.delivery_fee, z.name
   FROM delivery_zone_area a
   JOIN delivery_zone z ON z.id = a.zone_id
   WHERE z.active = true
     AND a.city_normalized = :city
     AND a.postal_code = :postalCode
   LIMIT 1

4. Jeśli pusty → SELECT z.type, z.delivery_fee, z.name
   FROM delivery_zone_area a
   JOIN delivery_zone z ON z.id = a.zone_id
   WHERE z.active = true
     AND a.city_normalized = :city
     AND a.postal_code IS NULL
   LIMIT 1

5. Jeśli nadal pusty → zwróć UNAVAILABLE.
```

### Konkretny przykład — pizzeria w Nowym Dworze Mazowieckim

Realne kody dla NDM:
- `05-100`, `05-101`, `05-102` — centrum NDM
- `05-160` — Modlin-Twierdza (DZIELNICA NDM, nie osobne miasto!)
- `Stary Modlin` — sąsiednia miejscowość, gmina Pomiechówek

Konfiguracja stref:

```
Strefa "Centrum NDM" (FREE):
  area: (city='Nowy Dwór Mazowiecki', postal_code=NULL)

Strefa "Modlin Twierdza" (PAID 5 zł):
  area: (city='Nowy Dwór Mazowiecki', postal_code='05-160')

Strefa "Okolica" (PAID 5 zł):
  area: (city='Stary Modlin', postal_code=NULL)
  area: (city='Pomiechówek', postal_code=NULL)
  area: (city='Kazuń Polski', postal_code=NULL)
```

Lookup'y:
- `NDM + 05-100` → exact miss → fallback `(NDM, NULL)` → **FREE** ✓
- `NDM + 05-160` → **exact match → PAID 5 zł** ✓ (override wygrywa)
- `Stary Modlin + cokolwiek` → fallback `(Stary Modlin, NULL)` → **PAID 5 zł** ✓
- `Warszawa + cokolwiek` → miss + miss → **UNAVAILABLE** ✓

---

## 5. Endpointy

### Publiczne

```
POST /api/public/delivery/check
Body: { city: string, postalCode: string }
Response 200: {
  status: "FREE" | "PAID" | "UNAVAILABLE",
  fee: number,           // 0 dla FREE/UNAVAILABLE
  zoneName: string|null  // np. "Centrum NDM"
}
```

Rate-limit przez istniejący `RateLimitFilter` (np. 60 req/min/IP).

### Admin (JWT + ROLE_ADMIN)

```
GET    /api/admin/delivery-zones
POST   /api/admin/delivery-zones                  // {name, type, fee, active}
PATCH  /api/admin/delivery-zones/{id}
DELETE /api/admin/delivery-zones/{id}             // SOFT delete? -> active=false. Faktyczne DELETE tylko gdy zone nie ma area i nie jest referenced przez orders.

POST   /api/admin/delivery-zones/{id}/areas       // { city, postalCode|null }
DELETE /api/admin/delivery-zones/{id}/areas/{areaId}
```

### Zmiana w `CheckoutService`

W metodzie tworzącej zamówienie (przy `fulfillmentType=DELIVERY`):
1. Wyciągnij city + postalCode z `deliveryAddress`
2. Uruchom lookup (powyższy)
3. Jeśli `UNAVAILABLE` → 422 z czytelnym `detail` ("Nie dostarczamy pod ten adres")
4. Jeśli `PAID/FREE` → ustaw `order.deliveryFee` i `order.deliveryZoneName`
5. `total = subtotal + deliveryFee`

Pickup nadal ignoruje strefy całkowicie.

---

## 6. UX admin (ekran "Strefy dostawy")

Dla każdej strefy formularz:
- Nazwa
- Typ (radio: Darmowa / Płatna / Niedostępna)
- Koszt dostawy (widoczne tylko dla typu Płatna, walidacja > 0)
- Aktywna (checkbox)

Lista wpisów (areas) per strefa, z dwoma trybami dodawania:
1. **"Cała miejscowość"** — pole `Miasto` + checkbox "wszystkie kody" → zapisuje `(city, NULL)`
2. **"Konkretne kody"** — pole `Miasto` + textarea z kodami (po jednym w linii lub po przecinku) → zapisuje N rekordów `(city, code1)`, `(city, code2)`...

Walidacja przy save:
- Format kodu: regex `^\d{2}-\d{3}$` (auto-formatowanie `01234` → `01-234`, strip whitespace)
- City normalizowane jak wyżej
- Detekcja konfliktów: jeśli `(city, code)` już istnieje w innej strefie → ostrzeżenie "Ta para jest już w strefie X, przenieść?"
- Override jest legalny i nie jest błędem: `(NDM, NULL)` w jednej strefie + `(NDM, 05-160)` w innej. UI pokazuje to jasno: "Ten wpis nadpisuje regułę ogólną dla NDM."

Pusty stan (admin nic nie skonfigurował) — defaultowo wszystko UNAVAILABLE z banner'em "Skonfiguruj strefy, żeby zacząć przyjmować zamówienia". Bezpieczniejsze niż "wszystko free" przez pomyłkę.

---

## 7. UX checkout (kluczowa decyzja: NO external autocomplete)

W `CheckoutPage.tsx`:

1. **Pole `Miasto`** — własny lokalny autocomplete:
   - Frontend pobiera listę unikalnych miast ze skonfigurowanych stref przez
     `GET /api/public/delivery/cities` (zwraca `[{display: "Nowy Dwór Mazowiecki"}, ...]`)
   - Komponent typu Combobox: user pisze, my matchujemy normalized prefix
   - Klient może też wpisać miasto spoza listy — wtedy lookup zwróci UNAVAILABLE
2. **Pole `Kod pocztowy`** — input mask `00-000`, walidacja format
3. **Live'owy check** — debounced (300ms) call `/api/public/delivery/check` po wypełnieniu obu pól
4. **Badge pod polami**:
   - ✅ "Darmowa dostawa — strefa: Centrum NDM"
   - ⚠️ "Dostawa: 5 zł — strefa: Modlin Twierdza"
   - ❌ "Niestety nie dostarczamy pod ten adres"
5. **Przycisk "Złóż zamówienie"** disabled gdy status = UNAVAILABLE i fulfillmentType = DELIVERY
6. **Wyświetl `deliveryFee` w sumie** koszyka (`Suma: subtotal + dostawa = total`)

### Dlaczego NIE external autocomplete w MVP

| Opcja | Koszt | Werdykt |
|---|---|---|
| Google Places Autocomplete + Address Validation | Sesja terminowana = ~$17-25/1K. Free tier 10K eventów/m | Wymaga karty kredytowej, monitoring kosztów. Odrzucone. |
| Mapbox Geocoding | 100K req/m za darmo, potem $5/1K (skok) | Wymaga karty, ostry "klif". Odrzucone. |
| HERE 250K free/m | Wymaga karty, EU compliance | Odrzucone dla simplicity. |
| Photon (Komoot, hosted) | Darmowy, OSM-based | Brak SLA, public endpoint, dependency. **Zostawione jako opcja Faza 7.2.** |
| Self-hosted Nominatim | $200-500/m za hosting | Absurdalnie nieproporcjonalne dla MVP. Odrzucone. |
| **Lokalny autocomplete miast + format mask kodu** | 0 zł | **Wybrane.** |

Lokalny autocomplete działa, bo zbiór miast obsługiwanych przez konkretną
pizzerię jest mały (typowo 5-30 miejscowości). User wpisuje kilka liter,
widzi sugestie ze swojej okolicy, klika. Kod pocztowy ma format mask.
Backend i tak waliduje finalnie. **Zero zewnętrznych zależności.**

---

## 8. Pułapki / Edge cases

1. **Format kodu pocztowego** — PL ma `XX-XXX`. Normalizuj wszędzie tak samo (frontend, admin, backend, lookup). Najlepsza decyzja: zapisuj **zawsze z myślnikiem**, walidator regex `^\d{2}-\d{3}$`.

2. **Diakrytyki** — `Łomianki` vs `Lomianki` vs `lomianki`. Match po `city_normalized` (lowercase + strip diakrytyków). Wyświetlaj zawsze `city_display`.

3. **Pickup** — fulfillmentType=PICKUP ignoruje strefy całkowicie. Pole `deliveryAddress` puste, `deliveryFee=0`, `deliveryZoneName=NULL`.

4. **Zmiana strefy po złożeniu zamówienia** — historyczne zamówienia mają snapshot `deliveryFee` i `deliveryZoneName`. Nigdy się nie zmieniają. (Reguła AD-015 z istniejącej architektury rozszerzona.)

5. **Override conflicts** — `(NDM, NULL)` w strefie FREE + `(NDM, 05-160)` w strefie PAID. To feature, nie bug. UI musi to jasno pokazać.

6. **Duplicate (city, code) w jednej strefie** — UNIQUE constraint zapobiega zapisowi. UI pokazuje "ta para już istnieje".

7. **Cross-zone duplicate** — `(NDM, 05-160)` w strefie A i `(NDM, 05-160)` w strefie B → constraint zwróci błąd. UI: "ta para jest w strefie A, najpierw ją usuń."

8. **Pusty `delivery_zone` w bazie** — checkout dla DELIVERY zwraca UNAVAILABLE dla wszystkiego. Admin widzi banner.

9. **Klient wpisał "Modlin"** zamiast "Nowy Dwór Mazowiecki" — match miss → UNAVAILABLE. Lokalny autocomplete pomaga: jeśli admin nie ma w bazie miasta "Modlin", to user nigdy go nie wybierze z dropdown'a. Jeśli wpisze ręcznie i tak dostanie UNAVAILABLE.

10. **Wielkość liter w textarea kodów** — admin może wkleić `01-234, 01-235, 01-236`. Parser dzieli po `\n` i `,`, trimuje, normalizuje, deduplikuje.

11. **Soft vs hard delete strefy** — strefa, która ma jakieś `orders` z `delivery_zone_name` (snapshot) NIE może być fizycznie skasowana — używamy `active=false`. Strefa bez orders i bez area może być DELETE.

12. **Migracja istniejących orders** — w `V8` ustaw `delivery_fee=0` i `delivery_zone_name=NULL` dla wszystkich istniejących orderów. Backward compatible.

---

## 9. Plan implementacji (rozbicie na sub-fazy)

### Faza 7.0 — MVP stref dostawy

Wszystko z tego dokumentu. Estymacja: 3-5 dni.

**Backend:**
- Migracja `V8__delivery_zones.sql` (encje + zmiana `orders`)
- Encje: `DeliveryZone`, `DeliveryZoneArea`
- `DeliveryZoneRepository`, `DeliveryZoneAreaRepository`
- `DeliveryZoneLookupService` z metodą `lookup(city, postalCode)`
- `DeliveryZoneAdminService` (CRUD)
- Zmiany w `CheckoutService` (lookup + ustawienie `deliveryFee` / `deliveryZoneName`)
- Endpointy publiczne: `/api/public/delivery/check`, `/api/public/delivery/cities`
- Endpointy admin: `/api/admin/delivery-zones/...`
- Aktualizacja `RateLimitFilter` dla nowego endpointu publicznego
- Testy jednostkowe lookup logic (tabelka exact / fallback / miss)

**Frontend:**
- Admin: ekran "Strefy dostawy" w panelu (CRUD stref + areas)
- Frontend public: lokalny autocomplete miasta w `CheckoutPage.tsx`
- Live check + badge pod polami adresu
- Wyświetlanie `deliveryFee` w `OrderSummary`
- Wyświetlanie strefy + fee w `TrackingPage` (z snapshotu)
- Wyświetlanie fee w admin panelu zamówień

**Docs:**
- Update `docs/CURRENT_STATE.md`
- Update `docs/ARCHITECTURE.md` (nowy AD: "Delivery zones lookup with fallback")
- Aktualizacja `docs/PHASES.md` lub przeniesienie z `ROADMAP.md`

### Faza 7.1 — opcjonalne ulepszenia (nie teraz)

- Min order amount per strefa
- Godziny strefy ("dowozimy do strefy B tylko 11-22")
- Levenshtein matching nazw miast (literówki)
- Bulk import area z CSV w panelu admina

### Faza 7.2 — autocomplete adresu z zewnętrznym API (opcjonalna)

- Integracja z Photon (komoot.io) — darmowy, OSM-based
- Bring your own API key dla Google jako power-user feature
- Tylko jeśli realny klient zgłosi potrzebę precyzyjniejszego adresu

### Faza 7.3 — polygony / drive-time isochrones (Wariant B z roadmapy)

- Leaflet + leaflet-draw w panelu admina
- Self-hosted OSRM lub Valhalla dla isochrones
- Tylko jeśli pizzeria z dużą flotą i wymaganiem SLA

---

## 10. Co zaktualizować w dokumentach projektu

- `docs/ROADMAP.md` — sekcja "Faza 7" rozbita na 7.0 / 7.1 / 7.2 / 7.3 zgodnie z powyższym
- `docs/PHASES.md` — dopisać Fazę 7.0 jako kolejną aktywną fazę (lub zostawić w roadmapie i wkleić jako prompt startu fazy)
- `docs/ARCHITECTURE.md` — nowy AD record (np. AD-018) "Delivery zones with city+postal_code fallback lookup", uzasadnienie wyboru względem alternatyw
- `docs/CURRENT_STATE.md` — po implementacji aktualizacja stanu

---

## 11. Otwarte pytania do rozstrzygnięcia przed implementacją

1. **Multi-tenant** — w obecnym projekcie jest jedna pizzeria per instalacja. Strefy są globalne dla restauracji. Gdy dojdzie multi-tenant (z roadmapy), strefy będą per-tenant. Na teraz zakładamy single-tenant.

2. **Free shipping threshold** ("darmowa dostawa od 60 zł") — to jest **inna funkcja** (rabat w stosunku do strefy PAID, oparty o subtotal). NIE jest częścią Fazy 7.0. Można dodać w 7.1.

3. **Edycja strefy a in-flight orders** — zamówienie w stanie `NEW` ma już snapshot `deliveryFee`. Admin zmienia konfigurację → in-flight order nie zmienia ceny. To jest pożądane zachowanie (snapshot pattern AD-015), ale warto wymienić w docs.

4. **Display order stref na liście admina** — pole `display_order` w encji. Admin sortuje drag-and-drop. To może być Faza 7.1 jeśli na MVP wystarczy `ORDER BY name`.

---

## 12. Checklist do prompta startu Fazy 7.0

Wklejając ten dokument do nowego wątku, poproś Claude'a (mnie w nowej sesji):

> "Na podstawie powyższego podsumowania napisz mi prompty dla Claude Code do
> implementacji Fazy 7.0. Przestrzegaj wzorca z `OPERATOR_PLAYBOOK.md`:
> - Prompt #2 (start fazy z plan mode)
> - Prompt #3 (review po fazie, osobna sesja)
> - Ewentualnie #4 (fix po review)
> - Plus prompt #5 do pre-uaktualnienia ROADMAP.md przed startem fazy
>
> Każdy prompt ma być copy-pasteable, w tym samym stylu co playbook.
> Zaznacz wyraźnie które prompty idą w której kolejności i w której sesji."
