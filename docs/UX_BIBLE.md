# BIBLIA UX I FUNKCJONALNOŚCI — FOOD ORDERING ENGINE DLA MAŁEJ PIZZERII

**Wersja:** 1.0
**Data:** maj 2026
**Stack:** React 18 + TypeScript (FE), Java Spring Boot (BE)
**Skala docelowa:** pojedyncza pizzeria, 30–50 zamówień dziennie (max 100), 1 kurier (zwykle łączy rolę z pomocą w kuchni)
**Filozofia:** wzorujemy się na najlepszych (Pyszne, Uber Eats, Bolt, Domino's, Toast), ale skala dyktuje brutalne uproszczenia. **Każda funkcja, której uzasadnienie zaczyna się od "bo Domino's tak ma" — odpada.** Każda funkcja musi mieć sens dla małej, lokalnej knajpki.

---

## CZĘŚĆ I — STRONA KLIENTA

### 1. LANDING PAGE (strona główna restauracji)

**Above the fold (desktop, 1440×900):**
- **Hero (wysokość 60–70vh).** Tło: duże, dobrze oświetlone zdjęcie produktowe (idealnie pizzy w drewnianym piecu, kontekstowe — nie generic stock). Format WebP z fallbackiem JPEG, lazy hint dla LCP — preload pierwszego frame'a. Ciemny gradient od dołu (rgba(0,0,0,0.6) → rgba(0,0,0,0)) żeby tekst nad nim był czytelny. Pyszne i Uber Eats stosują wariant z mocno sczernionym dolnym fragmentem hero — to nie estetyka, to czytelność.
- **Nagłówek H1:** nazwa restauracji + jednozdaniowy claim. Np. "Pizzeria Bella — neapolitańska na drewnie, prosto z Twojej okolicy". Rozmiar 48–64px desktop, 32–40px mobile. Waga 700.
- **Subtagline:** krótka informacja sensoryczna — "Ciasto fermentujemy 48h. Mozzarella fior di latte. Drewno bukowe." Rozmiar 18–20px, waga 400.
- **Primary CTA:** jeden duży przycisk "Zamów online" — kolor primary brand (np. #D62828 dla pizzerii — czerwień apetyczna), wysokość 56px, padding 24/32px, border-radius 8–12px, font-weight 600, hover: brightness 1.1 + lekki translate Y -2px, shadow 0 4px 12px rgba(0,0,0,0.15). Pozycja: lewy dolny róg hero, na mobile centrowany.
- **Secondary action (tekstowy):** "Zobacz menu" (scroll do sekcji menu na tej samej stronie) — underline on hover, kolor white/90, mniejszy.

**Pasek informacyjny pod hero (sticky lub statyczny):**
Pojedynczy rząd ikon + tekstów na desktopie, w 2–3 wiersze na mobile. Format inspirowany Pyszne.pl:
- 🛵 **Czas dostawy:** "Dostawa 30–45 min" (nie pokazuj jednej liczby, daj zakres żeby się wyrobić)
- 💰 **Min. zamówienie:** "Od 35 zł"
- 🚚 **Koszt dostawy:** "5 zł / 0 zł od 60 zł" (jeśli jest próg) lub "5–10 zł zależnie od strefy"
- 🕒 **Otwarte:** "Otwarte do 22:00" (zielona kropka pulsująca przy "otwarte"; szara przy "zamknięte")
- 📍 **Adres:** "ul. Marszałkowska 12, Warszawa" (mały, klikalny → Google Maps w nowej karcie)

Pasek MA być widoczny od razu, nie scrollowany dół. To jest podstawowe info, którego klient potrzebuje przed wejściem w menu (Baymard: ukryte koszty są przyczyną nr 1 porzucania koszyka).

**Stan "restauracja zamknięta":**
- Banner czerwony/pomarańczowy nad hero: **"Aktualnie zamknięte. Otwieramy jutro o 11:00."** Wysokość ~48px, ikona ⏰, biały tekst na #B91C1C (red-700).
- CTA "Zamów online" zmienia tekst na **"Zaplanuj zamówienie na jutro"** (pre-order) lub jest disabled z tooltipem "Otwieramy jutro 11:00".
- Menu **dalej widoczne i przeglądalne** — to ważne dla SEO i dla klientów planujących. Można dodawać do koszyka, ale w koszyku CTA staje się "Zaplanuj na 11:00" zamiast "Zamów teraz".
- Bolt Food i Uber Eats stosują wariant: szare zdjęcia produktów + napis "Niedostępne teraz" zamiast cen — my możemy iść prościej, banner u góry wystarczy.

**Banner welcome offer (jeśli włączony w panelu):**
- Pasek nad hero LUB toast/snackbar w prawym dolnym rogu. "−10% na pierwsze zamówienie z kodem **BELLA10**" + przycisk "Skopiuj kod". Po kliknięciu kod ląduje w schowku + toast "Skopiowano!".
- X do zamknięcia. Persistence: po zamknięciu zapisz w localStorage `welcome_banner_dismissed=true`, nie pokazuj przez 7 dni.

**Nawigacja (top bar, wysokość 64–72px):**
- Logo (lewo), klikalne → /
- Pozycje: **Menu**, **O nas**, **Kontakt**, **Śledź zamówienie** (jeśli klient ma aktywne zamówienie — wyróżnione)
- Po prawej: **mini-koszyk** (ikona + badge z liczbą pozycji jeśli >0)
- Sticky desktop (background semi-transparent przy scrolu, shadow 0 2px 8px rgba(0,0,0,0.08) gdy scroll > 100px)
- Mobile: hamburger po prawej, logo po lewej, koszyk po prawej (przed hamburgerem)
- W hamburgerze: te same pozycje + linki do mediów społecznościowych + telefon

**Sekcja "O nas":**
Krótki paragraf (3–5 zdań), zdjęcie zespołu/kucharza/wnętrza. **Tak — warto mieć**, bo SEO i bo single-site to nie agregator — klient chce wiedzieć kogo wspiera. Dla małej pizzerii to często zadecyduje o pierwszym zamówieniu.

**Sekcja opinii klientów:**
Trzy najlepsze opinie z Google Reviews / własnego systemu. Karta: gwiazdki, fragment, imię. Link "Zobacz wszystkie opinie" → Google. **Nie buduj własnego CMS-a opinii w MVP** — wkleić Google Reviews widget albo ręcznie wpisać 3 cytaty.

**Godziny otwarcia:**
Tabelka pn–nd, dziś **pogrubione** + zielona kropka. Format "Pn–Pt: 11:00–22:00", "Sob: 12:00–23:00", "Nd: 13:00–22:00". Jeśli dzisiaj zamknięte — szara linia i tekst "Dziś zamknięte".

**Mapa z lokalizacją:**
Embed Google Maps lub Mapbox (Mapbox tańszy przy wzroście), wysokość ~300px, marker z logo restauracji. Pod mapą: adres + przyciski "Wskazówki dojazdu" (link do Google Maps) i "Zadzwoń" (`tel:`). Mobile: niższa mapa (~200px), przyciski stacked.

**Footer:**
- Kolumna 1: logo, adres, telefon, email
- Kolumna 2: linki — Menu, O nas, Kontakt, Regulamin, Polityka prywatności, RODO
- Kolumna 3: ikony social (FB, Instagram). Te same kolory co brand.
- Kolumna 4: "Zapisz się na newsletter" (opcjonalne, post-MVP) — input email + przycisk
- Pas dolny: copyright + NIP + "Designed by..." (jeśli chcesz)

**SEO — minimum konieczne:**
- `<title>`: "Pizzeria Bella — pizza neapolitańska Warszawa | Zamów online" (max 60 znaków)
- Meta description: "Autorska pizza neapolitańska z drewnianego pieca. Dostawa Warszawa Śródmieście. Zamów online — odbiór lub dostawa." (155 znaków)
- OG tags: `og:title`, `og:description`, `og:image` (1200×630, hero z restauracji), `og:type=restaurant`
- Twitter Card: `summary_large_image`
- Structured data **Schema.org/Restaurant**: name, address, telephone, openingHoursSpecification, priceRange ("$$"), servesCuisine ("Italian"), menu URL, acceptsReservations:false. To kluczowe dla Google Business — mała pizzeria zyska więcej z dobrze napisanego JSON-LD niż z reklam.
- Canonical URL na każdej stronie
- Sitemap.xml + robots.txt

**Performance — co ładuje się first:**
- Critical CSS inline (above-the-fold)
- Hero image preload (`<link rel="preload" as="image">`)
- Font preload (jeden font-display:swap, max 2 wagi — 400 i 700)
- Lazy load: zdjęcia menu, mapa (na scroll), embed opinii, footer images
- Cel: LCP < 2.5s, FID/INP < 200ms, CLS < 0.1
- Bundle size: hero+nawigacja w pierwszym chunku, menu jako lazy chunk

**PWA manifest:**
- `name`: "Pizzeria Bella"
- `short_name`: "Bella"
- `theme_color`: brand primary
- `background_color`: white
- `display`: "standalone"
- Ikony: 192×192, 512×512, maskable
- Install prompt: nie pokazuj agresywnie. Pokaż dopiero po 2. wizycie LUB po pierwszym złożonym zamówieniu (toast "Dodaj Bella do ekranu — szybciej zamówisz następnym razem").

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** Hero z CTA, pasek informacyjny (czas/min/koszt/godziny), banner zamknięte, nawigacja sticky, footer, SEO basics (title, meta, OG, Schema.org Restaurant), godziny otwarcia, adres + mapa
- **Nice-to-have:** sekcja "O nas", 3 opinie z Google, welcome offer banner z kodem
- **Post-MVP:** PWA install prompt, newsletter signup, A/B testy hero
- **Pomijamy:** video hero (waży i dystrahuje), parallax (ciężki, drażni mobile), live chat, AI chatbot

---

### 2. STRONA MENU — LAYOUT I ARCHITEKTURA

**Layout desktop (1280px+):**
3 kolumny z proporcjami inspirowanymi Pyszne/Uber Eats:
- **Lewa (200–240px, sticky):** nawigacja kategorii pionowa (Pizza, Sałatki, Napoje, Desery). Sticky od top: 80px (pod headerem). Aktywna kategoria — primary color background + bold.
- **Środek (płynna, ~640–720px):** lista produktów. Margines 24–32px po obu stronach.
- **Prawa (340–360px, sticky):** koszyk. Sticky od top: 80px. Border-left 1px #E5E7EB.

Pyszne stosuje 3 kolumny, Uber Eats — 2 (kategorie poziomo + lista + koszyk wysuwany na klik). My idziemy w **3 kolumny** bo to lepiej dla pizzerii single-site (klient nie skacze między restauracjami, koszyk warto trzymać widoczny — zwiększa konwersję).

**Layout tablet (768–1279px):**
- Dwie kolumny: nawigacja kategorii zostaje pionowo lewa (lub poziomo na górze jako tabs scrollowane), środek z listą produktów na pełną szerokość, **koszyk znika z sidebara** — staje się floating button w prawym dolnym rogu lub paskiem na dole jak na mobile. Cutoff: pod 1024px sidebar koszyka znika.

**Layout mobile (<768px):**
1 kolumna, kolejność:
1. Sticky header (nawigacja + logo + ikona koszyka)
2. Pasek informacyjny (czas/min/koszt) — collapsed do jednej linii
3. **Sticky tabs kategorii** (poziomy scroll) — pod headerem
4. Lista produktów (pełna szerokość minus 16px padding)
5. **Floating bottom bar koszyka** (gdy >0 pozycji)
6. Footer (na samym dole)

**Sticky header:**
- Desktop: logo + linki nav + ikona koszyka (badge). Wysokość 64px. Shadow 0 1px 3px rgba(0,0,0,0.1) przy scroll > 50px.
- Mobile: hamburger + logo + ikona koszyka. Wysokość 56px.
- **Hide-on-scroll-down, show-on-scroll-up** (Uber Eats pattern) — przy scrollu w dół header jedzie do góry (translate-Y -100%, transition 200ms), przy scrollu w górę wraca. Daje więcej miejsca na content. **Threshold:** 100px scroll w dół żeby się schować.

**Nawigacja kategorii (scroll-spy):**
- Desktop sidebar pionowy: lista kategorii, klik → smooth scroll do sekcji. Sticky.
- Mobile: tabs poziome, sticky pod headerem (top: 56px), `overflow-x: auto`, `scroll-snap` na kategoriach. Aktywna — primary color underline 2–3px lub pill background.
- **Scroll-spy threshold:** kategoria staje się "aktywna" gdy jej heading przekroczy próg `top: 120px` od góry viewportu (pod stickym headerem + tabs). Throttle 100ms.
- **Auto-scroll nawigacji:** jeśli aktywna kategoria jest poza widokiem nawigacji (sidebar lub tabs mobile), nawigacja przewija się żeby ją pokazać. Smooth scroll (`behavior: 'smooth'`).
- **Klik na kategorię → scroll do sekcji:** offset = wysokość headera + wysokość tabs + 16px (np. 56+48+16 = 120px). Smooth scroll. URL hash zmienia się na `#pizza`, `#salatki` (deep linkable, ale `history.replaceState` żeby nie zaśmiecać back-buttona).

**Search:**
- Desktop: input z lupą u góry sekcji menu, szerokość 320px, placeholder "Szukaj w menu". Live search.
- Mobile: ikona lupy w sticky header, klik otwiera fullscreen search overlay (Pyszne pattern).
- **Debounce 250ms** — nie wyszukuj przy każdym keystroke.
- **Co przeszukuje:** nazwa produktu (waga 3), opis (waga 2), tagi i składniki (waga 1). Fuzzy match (Levenshtein lub `includes` z normalizacją diakrytyków — "papryka" znajduje też "Papryka 🌶").
- **Highlight wyników:** dopasowane fragmenty bold lub żółte tło (`<mark>`).
- **Brak wyników:** ilustracja (ikona lupy + uśmiech) + tekst "Nic nie znaleźliśmy dla **„kawior"**. Spróbuj innego hasła." + CTA "Wyczyść wyszukiwanie".

**Filtry:**
- Tagi powyżej listy (chips): `Wege`, `Wegańskie`, `Ostre`, `Bezglutenowe`, `Bestsellery`, `Promocja`. Multi-select. Aktywny chip — primary color background + ikona check.
- "Wyczyść filtry" — przycisk tekstowy obok, widoczny tylko gdy aktywny ≥1 filtr.
- **Empty state przy aktywnych filtrach:** "Żaden produkt nie pasuje do wybranych filtrów. **Wyczyść filtry** lub spróbuj innych."
- Sortowanie: dropdown "Sortuj: Domyślnie / Cena rosnąco / Cena malejąco / Popularność". Domyślnie nieaktywny (kolejność z panelu admina). **Dla małej pizzerii sortowanie pomijamy w MVP** — admin sam ustawia kolejność produktów drag-and-dropem.

**Bannery promocji w liście:**
Co N produktów (np. co 6) jednorzędowy banner: "🎁 Druga pizza −30%" lub "🍻 Do każdej Family Size — Pepsi 1L gratis". Klik → scroll do produktu lub dodanie automatyczne. **Dla małej pizzerii — pomijamy w MVP** (skomplikowane do zarządzania, mała pizzeria nie ma rotacji promocji żeby to się opłacało).

**Liczba produktów / paginacja:**
- Mała pizzeria ma 30–80 pozycji. **Wszystko ładujemy naraz**, bez paginacji ani infinite scroll.
- Lazy loading dotyczy obrazków, nie struktury — DOM cały od razu, obrazki on-scroll (`loading="lazy"`).
- Dla pizzerii z 200+ pozycji (rzadkość) rozważyć virtualizację listy (`react-window`).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** 3-kolumnowy layout desktop, mobile single-column ze stickym tabs, scroll-spy nawigacja, search z debounce, lazy load zdjęć, koszyk sticky desktop / floating bar mobile
- **Nice-to-have:** filtry tagów (wege/ostre/bestseller — 3–4 nie więcej), hide-on-scroll header, deep link do kategorii (#hash)
- **Post-MVP:** sortowanie, bannery promocji w liście, fuzzy search z normalizacją diakrytyków
- **Pomijamy:** infinite scroll, paginacja, multi-select złożonych filtrów (alergeny szczegółowe, kalorie)

---

### 3. KARTA PRODUKTU NA LIŚCIE

**Wymiary:**
- **Desktop:** szerokość ~50% kolumny środkowej (2 karty w rzędzie, ~310–340px szerokości każda), wysokość ~360–380px, **aspect ratio zdjęcia 4:3** (lub 16:9 dla większego efektu, ale 4:3 lepiej dla pizzy — okrągła w kadrze).
- **Tablet:** 2 w rzędzie, szerokość ~340px.
- **Mobile:** 1 w rzędzie pełna szerokość minus 32px (16px po bokach), zdjęcie 16:9 lub 4:3, wysokość karty ~280–320px. Albo wariant: poziomy layout (zdjęcie po lewej 100×100, treść po prawej) — Pyszne tak robi na mobile, oszczędza scrolla. Polecam wariant **wertykalny ze zdjęciem na górze** dla pizzy — zdjęcia produktowe są kluczowe, przyciągają wzrok, klient jest "głodny okiem".

**Zdjęcie:**
- Format: WebP główny + JPEG fallback (Spring Boot może serwować w zależności od `Accept` headera, lub frontend `<picture>`).
- Lazy load: `loading="lazy"` + `decoding="async"`. Threshold: 100px przed wejściem w viewport (Intersection Observer rootMargin).
- **Placeholder przed załadowaniem:** LQIP (Low Quality Image Placeholder) — base64 16×12px blur, lub czysty kolor brand light (#FEF3C7). Nie skeleton, nie spinner — LQIP najlepszy.
- Animacja po załadowaniu: fade-in 300ms.
- `object-fit: cover` żeby zdjęcie wypełniało kontener bez deformacji.
- Brak zdjęcia (admin nie wgrał): placeholder z ikoną kuchni + napis "Brak zdjęcia" — szare, neutralne.

**Overlay/badge na zdjęciu:**
- Lewy górny róg: badge **"Bestseller"** (primary color, biały tekst, padding 4/8px, border-radius 4px, font 12px bold). Albo "Nowość" (zielony), "Promocja" (pomarańczowy). **Tylko jeden badge** na zdjęciu naraz — multibadge psuje hierarchię.
- Prawy górny róg: ikona ostre 🌶, wege 🌱 (tylko ikona, bez napisu). Półprzezroczyste tło białe (rgba(255,255,255,0.9)).
- **Dla małej pizzerii:** tylko Bestseller i Nowość. Resztę pomijamy.

**Nazwa:**
- Font 18–20px, weight 600, kolor neutral-900.
- Max 1 linia z `text-overflow: ellipsis` LUB pełna 1–2 linie. **Polecam 1 linię** — czytelność, równe karty.
- Padding od góry karty: 12–16px.

**Opis:**
- Font 14px, weight 400, kolor neutral-600.
- **2 linie max z ellipsis** (`-webkit-line-clamp: 2`). Jeśli opis dłuższy — pełny w modalu.
- Pyszne pokazuje 1 linię; Uber Eats — 2. Polecam 2 — pizza ma składniki, klient chce wiedzieć co zamawia.

**Skład / alergeny:**
Na karcie listy **NIE pokazujemy szczegółowo** — tylko ikony (🌱 wege, 🌾 bezglutenowe, 🌶 ostre). Pełna lista alergenów (gluten, laktoza, jajka, orzechy itd.) — w modalu produktu. RODO i regulacje UE wymagają dostępności tej informacji, ale nie musi być na karcie.

**Cena:**
- Format: **"32,90 zł"** (przecinek, spacja przed "zł"). To polski standard. Nie "32.90 PLN", nie "32,90 PLN". Pyszne, Glovo, Bolt — wszyscy używają "zł" po liczbie.
- Pozycja: lewy dolny róg karty, font 18–20px weight 700.
- Przy wariantach: **"od 28,90 zł"** — mniejszy "od" (14px regular), cena bold 18–20px.

**Przycisk dodania:**
Wariant inspirowany Pyszne i Glovo: **"+" w okrągłym przycisku w prawym dolnym rogu karty** (44×44px, primary color, biały plus, shadow 0 2px 8px rgba(0,0,0,0.15)). Touch target 44px (iOS guideline) / 48dp (Android).
- Hover desktop: scale 1.05, brightness 1.05.
- Click: animacja scale 1.0 → 1.15 → 1.0 przez 200ms (cubic-bezier easing).

**Po pierwszym dodaniu (jeśli produkt NIE ma wariantów/dodatków):**
Przycisk "+" zmienia się w licznik ilości **(− N +)** w tym samym miejscu. Wymiary 44×120px (3 segmenty po ~40px), białe tło, primary border, primary tekst. Animacja przejścia: scale + fade 200ms.

**Po pierwszym dodaniu (jeśli produkt MA warianty/dodatki):**
Przycisk "+" otwiera **modal produktu** (sekcja 4). W koszyku pokazuje się jako oddzielna pozycja z wybranymi wariantami. Karta NIE zmienia się w licznik — bo każde "kolejne" wymaga decyzji o wariantach. Zamiast tego: karta pokazuje subtelny indykator "1× w koszyku" pod ceną (mała etykieta, primary color).

**Sygnał wariantów na karcie:**
- Tekst pod ceną: **"Wybierz rozmiar →"** (font 12–14px, primary color, kursor pointer).
- Albo zamiana ikony: zamiast "+" pokaż ikonę strzałki "→" lub trzy kropki, sygnalizując że klik otwiera szczegóły.
- **Polecam tekst "Wybierz rozmiar →"** — najjaśniejsze.

**Karta "niedostępna":**
- Zdjęcie: opacity 0.5, filter grayscale(0.7).
- Overlay: napis **"Niedostępne dziś"** na środku, białe tło rgba(0,0,0,0.6), font 14px bold.
- Przycisk "+": disabled, opacity 0.4, cursor not-allowed.
- Cena: przekreślona (`text-decoration: line-through`).
- **Nie ukrywamy całkowicie** — klient widzi co jest w menu, planuje na następne zamówienie. Toast POS, Uber Eats — wszyscy zostawiają widoczne.

**Hover state (desktop):**
- Cała karta: `transform: translateY(-2px)`, shadow 0 8px 24px rgba(0,0,0,0.1) (z 0 2px 8px na default), transition 200ms.
- Cursor pointer na całej karcie (klik gdziekolwiek otwiera modal).

**Aktywny/zaznaczony stan (produkt w koszyku):**
- Subtelny: 1px primary color border + tła nie zmieniamy.
- Albo badge "X w koszyku" w prawym dolnym rogu (zamiast "+" widać liczbę).
- **Polecam border + badge "1×" w prawym górnym rogu zdjęcia.**

**Animacja po kliknięciu "Dodaj":**
- Karta: lekki "bounce" — scale 1.0 → 0.97 → 1.0 przez 150ms. Subtelne, nie cyrk.
- Ikona koszyka w headerze/sidebar: **bump animation** — scale 1.0 → 1.3 → 1.0 przez 300ms, badge z liczbą się zmienia z fade.
- **Pyszne i Uber Eats pomijają "fly-to-cart" arc animation** — wygląda fajnie, ale na słabszych urządzeniach laguje. **Pomijamy.**
- Toast notification dolnie: "✓ Dodano do koszyka" — auto-dismiss 2s. Mobile: fade na floating bar koszyka.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** układ wertykalny ze zdjęciem 4:3, lazy load + LQIP placeholder, nazwa + opis 2 linie, cena z "zł", przycisk "+" jako 44px FAB, licznik (−N+) po dodaniu, stan niedostępny z greyscale, bump koszyka na ikonie
- **Nice-to-have:** badge Bestseller/Nowość, ikony wege/ostre na zdjęciu, hover lift desktop
- **Post-MVP:** "fly-to-cart" arc animation, multi-badge system, dynamic "X razy zamówiona w tym tygodniu"
- **Pomijamy:** ratingi gwiazdkowe na karcie listy (post-MVP w modalu max), animacje shake, particles na dodaniu

---

### 4. MODAL / DRAWER PRODUKTU

**Kiedy się otwiera:**
- Klient klika **kartę produktu** (gdziekolwiek na karcie poza przyciskiem +) → modal otwiera się **dla każdego produktu** (jednolity flow). Nawet jeśli produkt nie ma wariantów, modal pokazuje pełny opis, alergeny i komentarz.
- Wyjątek (do dyskusji): jeśli produkt **NIE ma wariantów ani dodatków**, klik "+" dodaje od razu bez modala (Pyszne tak robi). My poszliśmy w to: **klik "+" dodaje od razu jeśli prosty produkt; klik karty otwiera modal dla każdego produktu**.
- Jeśli produkt MA warianty — klik "+" też otwiera modal (bo wymaga wyboru).

**Typ na desktop:**
Modal **centered** (overlay rgba(0,0,0,0.5) za nim), max-width 540–600px, max-height 90vh, border-radius 16px, shadow 0 24px 48px rgba(0,0,0,0.2), pozycja środek ekranu.

**Typ na mobile:**
**Bottom sheet** — wysuwa się od dołu, max-height 90vh, border-radius 16px tylko u góry, **handle** (kreska szara 36×4px wycentrowana, padding 8px). Swipe down zamyka. Pyszne i Uber Eats — bottom sheet to standard mobile.

**Animacja otwierania:**
- Desktop: backdrop fade-in 200ms + modal scale 0.95 → 1.0 + fade 250ms ease-out.
- Mobile: backdrop fade-in 200ms + bottom sheet `translateY(100%) → translateY(0)` przez 300ms, easing `cubic-bezier(0.32, 0.72, 0, 1)` (iOS spring).

**Zamknięcie:**
- X w prawym górnym rogu (40×40px touch target, ikona X 20px).
- Klik backdrop (poza modalem).
- Escape (desktop).
- Swipe down na mobile (próg: 40% wysokości albo velocity > 0.5px/ms).

**Scroll wewnątrz:**
- Modal/sheet ma scrollowalną treść.
- **Zdjęcie scrolluje z treścią** (nie fixed) — uproszczenie, działa lepiej.
- **Sticky CTA na dole** — przycisk "Dodaj do koszyka" przyklejony do dołu sheetu/modala niezależnie od scrolla. Tło białe + shadow górny żeby się odznaczał.

**Zdjęcie:**
- Pełna szerokość modala/sheeta. Aspect ratio 4:3 lub 16:9 (preferuję 4:3 dla pizzy).
- Galeria wielu zdjęć: dots wskaźnika (3–5 zdjęć max), swipe na mobile, strzałki na desktopie. **Dla MVP pizzerii — jedno zdjęcie wystarczy.**

**Sekcja nagłówkowa modala:**
- Nazwa: 24–28px weight 700.
- Opis pełny: 16px, weight 400, neutral-700.
- Cena bazowa: 20px weight 700 (przy wariantach: "od 28,90 zł").
- Skład: jedna linia "Składniki: sos pomidorowy, mozzarella, bazylia, oliwa..." — neutral-600, 14px.
- Alergeny: ikony + nazwy (🌾 Gluten, 🥛 Laktoza), 14px. Rozwijane "Pokaż wszystkie alergeny" jeśli długa lista.
- Wartości odżywcze (post-MVP): rozwijane akordeonem.

**Sekcja wariantów ("Wybierz rozmiar"):**
- Nagłówek: **"Wybierz rozmiar"** + chip "Wymagane" (czerwony albo neutralny szary).
- Wizualizacja: **radio cards** (każdy wariant to klikalna karta — border 1px szary, aktywna: 2px primary color border + lekki primary tint background).
- Każda karta: nazwa wariantu (lewa, bold) + cena (prawa, bold). Np. "30 cm — 32,90 zł" / "40 cm — 42,90 zł" / "Family Size 50 cm — 56,90 zł".
- Single-select. Domyślnie zaznaczony pierwszy wariant (najmniejszy/najtańszy) — Bolt Food i Glovo tak robią; klient nie musi szukać domyślnego.

**Sekcja grup dodatków:**
- Każda grupa to osobna sekcja z nagłówkiem.
- Nagłówek: nazwa grupy (16px bold) + zasady ("Wybierz max 3", "Wybierz dokładnie 1", "Opcjonalne") jako szary tekst 13px obok.
- Wymagane: badge "Wymagane" (czerwone tło, biały tekst, padding 2/6px, border-radius 4px).
- **Single-select grupy:** radio buttons. Każdy item: lewa strona — radio + nazwa, prawa — cena ("+0,00 zł" lub "+2,50 zł").
- **Multi-select grupy:** checkboxy. Identycznie.
- Zaznaczony item: primary color border + delikatne primary tint background.
- Cena dodatku po prawej, font 14px regular, neutral-600 ("+2,50 zł"). Jeśli dodatek bez dopłaty — "Bezpłatnie" lub puste.
- **Disabled state przy max:** gdy klient zaznaczył już max liczbę checkboxów, pozostałe szare, opacity 0.5, cursor not-allowed. Tooltip "Możesz wybrać max 3".

**Cena dynamiczna:**
- Wyświetlana na **przycisku "Dodaj do koszyka"** (Uber Eats pattern). Format: "Dodaj do koszyka · 38,40 zł". Aktualizuje się natychmiastowo przy zmianie wariantu/dodatków.
- Animacja zmiany: szybki fade 150ms (poprzednia wartość fadeout, nowa fadein).

**Licznik ilości w modalu:**
- Pozycja: tuż nad przyciskiem "Dodaj", lewa strona (przycisk po prawej zajmuje resztę).
- Wymiary: 120×44px, segmenty: "−" 40px / liczba 40px / "+" 40px.
- Touch targets 44px każdy. Przy ilości 1 — minus disabled (lub szary), nie pozwala zejść do 0 (do tego służy X).

**Pole komentarza per pozycja:**
- W modalu, pod listą dodatków, przed CTA.
- Label: "Uwagi dotyczące tej pozycji (opcjonalnie)".
- Placeholder: "Np. bez cebuli, dobrze wypieczona, podwójny ser".
- Max 200 znaków, licznik "0 / 200" w prawym dolnym rogu pola.
- Textarea 2 linie (auto-grow do 4 linii).

**Przycisk "Dodaj do koszyka":**
- Sticky bottom modala (mobile) / lub na końcu treści (desktop).
- Pełna szerokość modala (minus padding 16/24px po bokach), wysokość 56px, primary color background, biały tekst, font 16px weight 600.
- Tekst: **"Dodaj do koszyka · 38,40 zł"** (kropka jako separator) lub **"Dodaj 2 × Margherita · 64,80 zł"** jeśli ilość > 1.
- Disabled state: gdy nie wybrano wymaganych wariantów/grup. Wtedy: szare tło, opacity 0.5, tekst "Wybierz wymagane opcje" lub "Wybierz rozmiar".
- Loading state po kliknięciu: spinner + "Dodaję..." przez ~300ms (optimistic update i tak doda od razu, ale loader uspokaja).

**Stan gdy produkt już w koszyku:**
- Modal pokazuje aktualną ilość w liczniku.
- Przycisk: **"Zaktualizuj koszyk · 64,80 zł"** zamiast "Dodaj".
- Drugi przycisk (link tekstowy): **"Dodaj jako kolejną pozycję"** — bo klient może chcieć dwie różne wersje tej samej pizzy (jedna z papryką, druga bez).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** modal centered desktop / bottom sheet mobile, sticky CTA z dynamiczną ceną, radio cards dla wariantów, checkbox dla dodatków, licznik ilości, pole komentarza, walidacja required, klik "+" otwiera modal jeśli produkt ma warianty
- **Nice-to-have:** swipe down zamyka mobile, "Dodaj jako kolejną pozycję" jeśli produkt już w koszyku, default selection na pierwszym wariancie
- **Post-MVP:** galeria zdjęć z dots, akordeon "wartości odżywcze", linki do podobnych produktów ("Może spodoba Ci się też...")
- **Pomijamy:** AR podgląd produktu, video w modalu, share button do produktu, oceny gwiazdkowe w modalu (post-MVP)

---

### 5. KOSZYK — STICKY SIDEBAR (DESKTOP)

**Pozycja i wymiary:**
- Right sidebar, **sticky top: 80px** (pod stickym headerem), max-height `calc(100vh - 96px)` (16px margines dolny).
- Szerokość: **360px** (sweet spot — Pyszne ma ~340px, Uber Eats ~380px). Mniej niż 320px ścina nazwy produktów; więcej niż 400px zjada cenne miejsce na listę produktów.
- **Breakpoint przy którym znika:** poniżej 1024px sidebar znika, zastępuje go **floating button + drawer** (sekcja 6).

**Tło i styl:**
- Background: białe (#FFFFFF).
- Border-left 1px solid #E5E7EB (subtelne oddzielenie od listy produktów).
- Border-radius: 0 (przylega do prawej krawędzi). Ewentualnie cała sekcja w kontenerze z border-radius 12px i shadow 0 4px 12px rgba(0,0,0,0.08) — dla nowoczesnego "card" feelingu.
- Padding wewnętrzny: 20–24px.

**Header koszyka:**
- "Twój koszyk" (18–20px bold) + counter "(3 pozycje)" (neutralny 14px).
- Ikona X / przycisk "Wyczyść" — **POMIJAMY** w sidebarze. Wyczyszczenie koszyka to nieodwracalna akcja, lepiej żeby klient usuwał per pozycja. Jeśli już — to z confirmation dialog.

**Stan pusty:**
- Ilustracja: SVG ikona koszyka (większa, ~80–96px), neutral-400.
- Nagłówek: **"Koszyk jest pusty"** (18px bold).
- Sub-tekst: "Dodaj coś z naszego menu, żeby zacząć zamówienie." (14px neutral-600).
- Brak CTA "Przeglądaj menu" — bo klient JEST na stronie menu, nigdzie nie musi iść.

**Pozycja w koszyku (jeden wiersz):**
Layout flex (lewa-prawa) lub grid:
- **Miniaturka zdjęcia** 56×56px po lewej, border-radius 6px, object-fit cover.
- **Środek (treść):**
  - Nazwa produktu + wariant: "Margherita 30 cm" — 14px weight 600, max 1 linia z ellipsis.
  - Lista dodatków: "+ Dodatkowy ser, Oregano" — 12px neutral-600, max 2 linie ellipsis.
  - Komentarz (jeśli jest): kursywa 12px neutral-500, "📝 Bez cebuli, dobrze wypieczona". Klikalny — otwiera inline edit.
- **Prawa:**
  - Cena wiersza (cena × ilość): "32,90 zł" — bold 14px.
  - Stepper ilości pod ceną: (− N +) wymiary 96×28px, segmenty po 32px. Mały, ale touch-target nadal OK na desktopie.
  - Ikona usuń: kosz (🗑) lub X, 16px, neutral-400, hover red. Pozycja: prawy górny róg pozycji.

**Zmiana ilości:**
- "+" zwiększa, "−" zmniejsza.
- Przy ilości 1 i kliknięciu "−" — pojawia się confirmation toast "Usunąć [nazwa]?" z przyciskami "Usuń" / "Anuluj". LUB: "−" przy 1 staje się ikoną kosza (kontekstowa zmiana).
- Animacja zmiany: liczba flip/fade 150ms.

**Usuwanie pozycji:**
- Klik X / kosz → pozycja fade out + collapse 200ms (height → 0).
- **Toast "Usunięto Margherita 30 cm" + przycisk "Cofnij"** (Uber Eats pattern) — auto-dismiss 5s. Cofnij przywraca pozycję na to samo miejsce.
- Dlaczego undo: bo łatwo kliknąć przez pomyłkę, a klient się denerwuje gdy traci 5 wybranych dodatków i musi konfigurować od nowa.

**Komentarz per pozycja w koszyku:**
- Widoczny jako szara kursywa pod listą dodatków (jeśli jest).
- Klik otwiera **inline edit** — textarea zastępuje tekst, focus, max 200 znaków, Save/Cancel poniżej. Na mobile lepiej drawer, na desktopie inline OK.

**Podział sekcji:**
- Lista produktów (scrollowalna jeśli wysoka) — max-height adaptywny.
- Separator: 1px solid #E5E7EB, 16px margines góra-dół.
- Sekcja podsumowania: stała pozycja na dole sidebara (nie scrollowana).

**Sekcja podsumowania:**
- "Subtotal (suma produktów)": 56,80 zł — neutral-700, 14px.
- "Dostawa": 5,00 zł — neutral-700, 14px. Jeśli darmowa: "Dostawa: **GRATIS**" (zielony, bold).
- "Rabat (kod BELLA10)": −5,68 zł — zielony, 14px. + ikona X do usunięcia kodu.
- Separator subtle.
- **"RAZEM"**: 56,12 zł — bold 20px, primary color albo neutral-900.

**Pasek minimum order:**
- Pozycja: nad podsumowaniem, gdy poniżej minimum.
- Format: "Brakuje **8 zł** do złożenia zamówienia. Min. 35 zł." (neutral-700, 13px).
- Progress bar pod tekstem: pasek 4px, primary color tint background, primary color fill (% pełności).
- Animacja przy zmianie kwoty: smooth grow 300ms.
- Jeśli **darmowa dostawa od X zł** i jeszcze nie osiągnięto: "Brakuje **12 zł** do **darmowej dostawy** 🎉" — to silniejszy motywator niż minimum.
- Po przekroczeniu minimum: krótka animacja success (zielony flash + ✓) przez 600ms, potem znika.

**Pole promo kod:**
- Default: collapsed jako link "Mam kod rabatowy" (neutral-600, underline).
- Po kliknięciu: pojawia się input + przycisk "Zastosuj" obok.
- Wpisanie kodu + Apply: walidacja po stronie serwera (debounce 300ms na auto-validate, lub on click).
- Sukces: zielony border, ikona ✓, tekst "Zastosowano! Rabat: −5,68 zł". Pole zwija się, w podsumowaniu pokazuje rabat.
- Błąd: czerwony border, tekst pod inputem "Kod nieprawidłowy" lub "Kod wygasł" lub "Min. zamówienie 50 zł by użyć kodu".
- Usunięcie kodu: X obok "Rabat" w podsumowaniu.

**Przycisk główny CTA:**
- Pełna szerokość sidebara, wysokość 56px, primary color background, biały tekst, font 16–18px weight 600.
- Tekst: **"Przejdź do kasy · 56,12 zł"**.
- Disabled state: gdy koszyk pusty (brak), gdy poniżej minimum (tekst "Min. zamówienie 35 zł", szare tło).
- Click: redirect do `/checkout` (full page navigation) lub otwarcie checkout drawera/modala (zależnie od decyzji w sekcji 7).

**Animacje:**
- Pierwszy produkt dodany: cały sidebar fade in 200ms (jeśli wcześniej był empty state).
- Zmiana kwoty RAZEM: flip animation lub fade 150ms.
- Bump przy zmianie liczby pozycji.
- Flash row przy edycji ilości (subtelny zielony tint 200ms).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** sticky sidebar 360px desktop, lista pozycji ze zdjęciem + nazwą + dodatkami + ceną + stepperem, podsumowanie z subtotal/dostawa/razem, minimum order progress bar, CTA "Przejdź do kasy", undo toast po usunięciu
- **Nice-to-have:** edycja komentarza inline, animacja flash przy zmianie, free-delivery progress
- **Post-MVP:** pole promo kod, sugestie "do koszyka pasuje X" (cross-sell), zapisywanie koszyka między sesjami
- **Pomijamy:** wishlist / save for later, multi-cart (kilka koszyków), rabaty mnożące się automatycznie

---

### 6. KOSZYK — MOBILE (FLOATING BAR + DRAWER)

**Floating bottom bar:**
- Pozycja: `position: fixed; bottom: 0` (lub `bottom: env(safe-area-inset-bottom)` dla iPhone z home indicator).
- Wysokość: **64px** (Glovo/Bolt) — wystarczy na ikonę + 2 linie tekstu.
- Pełna szerokość ekranu, primary color background (mocny visual anchor).
- Padding: 12px po bokach, 8px góra-dół.
- Z-index: 1000 (nad treścią, pod modalami).
- Shadow górny: 0 -4px 12px rgba(0,0,0,0.1).

**Zawartość:**
Layout flex justify-between:
- **Lewa:** ikona koszyka (24px, biała) + badge z liczbą pozycji (14px circle, biały background, primary color tekst, pozycja top-right ikony).
- **Środek:** tekst "Zobacz koszyk" (16px weight 600, biały) lub liczba "3 pozycje".
- **Prawa:** **łączna kwota** "56,12 zł" (16px weight 700, biały).

**Pyszne wariant:** ikona po lewej + "Twój koszyk · 3 pozycje · 56,12 zł" w jednej linii. **Bolt wariant:** kwota i strzałka po prawej. Polecam: ikona + liczba + "·" + kwota + strzałka "→" po prawej. Cały bar klikalny.

**Kiedy się pojawia:**
- Tylko gdy >0 pozycji w koszyku.
- Animacja wjazdu: `translateY(100%) → translateY(0)` przez 300ms ease-out (spring).
- **Padding-bottom body:** 64px gdy bar widoczny — żeby nie nakrywał ostatniej karty produktu na końcu listy.

**Badge z liczbą:**
- Circle 20px, biały background, primary color tekst (lub odwrotnie), font 12px bold.
- Pozycja: top-right ikony koszyka, offset 4px góra/prawo.
- Animacja **bump** przy dodaniu/usunięciu: scale 1.0 → 1.3 → 1.0 przez 300ms cubic-bezier.

**Drawer koszyka po kliknięciu floating bar:**
- **Bottom sheet** — wjeżdża z dołu, max-height 90vh.
- Handle u góry (kreska 36×4px szara wycentrowana, padding 8px, klikalna do zamknięcia).
- Border-radius 16px tylko u góry.
- **Snap points:** opcjonalnie 50% / 90vh — ale dla MVP wystarczy fullscreen sheet. Komplikacja snap points się nie opłaca.
- Backdrop za drawerem: rgba(0,0,0,0.5), klik zamyka.
- Animacja: `translateY(100%) → translateY(0)` + backdrop fade-in, 300ms.

**Zawartość drawera:**
**Identyczna z sidebar desktop**, ale układ pionowy na pełną szerokość ekranu. Header z X po lewej + "Twój koszyk" centered. Lista pozycji + podsumowanie + CTA — jak w sidebarze. CTA sticky bottom drawera.

**Zachowanie gdy klawiatura otwarta (np. wpisywanie promo kodu lub komentarza):**
- iOS: viewport się zmniejsza (`viewport-fit`), drawer **resize** żeby CTA był nad klawiaturą. Lub: input scroll-into-view.
- Android: zwykle obsługuje to automatycznie. Ważne by content nie został za klawiaturą.
- Jeśli używamy `vh` units — wymienić na `dvh` (dynamic viewport height) dla iOS Safari.

**Swipe to dismiss:**
- Drag handle lub w dowolnym miejscu drawera w jego górnej części (bo środek to scroll listy).
- Próg: drag w dół > 120px LUB velocity > 0.5px/ms → close. Inaczej spring back do otwartego.
- Library: `framer-motion` ma `useDragControls` które to ogarnia.

**Scroll w drawerze:**
- Lista pozycji scrollowalna, podsumowanie + CTA sticky bottom.
- Gdy user scrolluje listę pozycji — drawer NIE zamyka się przez gest. Drag handle / region górny otwiera/zamyka.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** floating bottom bar z ikoną + liczbą + kwotą, badge bump animation, bottom sheet drawer z handle, swipe down close, sticky CTA w drawerze
- **Nice-to-have:** safe-area-inset (iPhone notch / home indicator), animacja wjazdu floating bar
- **Post-MVP:** snap points półwysokość/pełen, pull-to-refresh w drawerze
- **Pomijamy:** floating cart preview (peek), gestures wielopalcowe

---

### 7. CHECKOUT — STRONA I FLOW

**Osobna strona vs modal:**
**Polecamy osobną stronę `/checkout`** dla MVP. Argumenty:
- Lepsze SEO (każda strona indeksowalna, lepsze tracking)
- URL można udostępnić / wrócić przez back button
- Pełen viewport — więcej miejsca na formularz, mniej klaustrofobii
- Łatwiej dodać progress indicator
- Pyszne, Uber Eats — wszyscy używają osobnej strony lub fullscreen view

Modal/drawer ma sens TYLKO w SPA z agregatorem wielu restauracji, gdzie nie chcemy klienta wyrwać z eksploracji. My jesteśmy single-site — klient zdecydował, idziemy.

**One-page vs multi-step:**
**ONE-PAGE checkout** dla MVP. Argumenty:
- Mniej kliknięć = wyższa konwersja (Baymard: każdy dodatkowy krok to ~10% drop-off)
- Klient widzi cały zakres w jednym miejscu
- Mniej "jeszcze coś?" frustracji
- Łatwiej zarządzać stanem (jeden form)

Multi-step (krok 1: dostawa, krok 2: płatność, krok 3: podsumowanie) ma sens tylko przy bardzo długich formularzach (B2B, finanse). Pizza zamówienie ma 8–12 pól — one-page.

**Progress indicator:**
W one-page checkout — **niepotrzebny**. Wyciągamy spinner tylko podczas finalnego submita.

**Layout checkout:**
- Desktop (1024px+): **2 kolumny** — lewa (formularz, ~640px) + prawa (sticky podsumowanie zamówienia, ~360px).
- Tablet i mobile: **1 kolumna**, podsumowanie zamówienia jako accordion zwijalna **u góry** (collapsed, klikalna "Pokaż zamówienie ▼") + na dole drugi raz pełne.

**Sekcja wyboru typu zamówienia:**
- **Segmented control** u góry formularza (tabs):
  - 🛵 **Dostawa** | 🛍 **Odbiór osobisty**
  - Wymiary 2 segmentów po 50%, wysokość 48px, aktywny: primary color background + biały tekst, nieaktywny: szary background.
- Klik zmienia formularz: "Dostawa" pokazuje sekcję adresu, "Odbiór" ją chowa i pokazuje godziny otwarcia + adres restauracji.

**Sekcja adresu dostawy:**
Pola (kolejność, wszystkie wymagane oznaczamy *):
- **Ulica i numer domu** * — autocomplete Google Places z biasem na strefę dostawy. Trigger od 3 znaków, sugestie pod inputem (max 5).
- **Numer mieszkania** (opcjonalne) — input krótki (~80px szerokości).
- **Piętro / kod domofonu** (opcjonalne) — placeholder "np. 3 piętro, kod 1234".
- **Miasto** * — auto-uzupełnia się z autocomplete.
- **Kod pocztowy** * — auto-uzupełnia się; maska "00-000".
- **(opcjonalnie) Mapa z pinem** pod adresem — po wpisaniu adresu pokazuje pin. Klient może drag pin żeby doprecyzować lokalizację. Dla MVP małej pizzerii **pomijamy mapę** — wystarczy autocomplete.
- **(opcjonalnie) Przycisk "Użyj mojej lokalizacji"** — Geolocation API. Niskie use-rate na desktopie, wysokie na mobile. Dla MVP pomijamy, wprowadzamy post-MVP.

**Walidacja strefy dostawy:**
- Po wpisaniu adresu: backend sprawdza czy w strefie. Loading spinner przy polu.
- Sukces: zielony ✓, koszt dostawy aktualizuje się w podsumowaniu.
- Poza strefą: czerwony border + komunikat "Niestety, nie dowozimy pod ten adres. Możesz odebrać osobiście — kliknij **Odbiór osobisty** powyżej."

**Sekcja danych kontaktowych:**
- **Imię i nazwisko** * — jedno pole "Jan Kowalski" (mniej friction niż dwa pola).
- **Numer telefonu** * — input z prefiksem "+48", maska "000 000 000". Walidacja: 9 cyfr po prefiksie. Komunikat błędu konkretny: "Numer wygląda na niepoprawny. Powinien mieć 9 cyfr (np. 600 100 200)."
- **Email** — opcjonalne (lub wymagane dla potwierdzenia online — decyzja MVP). Polecam **opcjonalne** dla pizzerii, ale jeśli klient płaci online, trafia do potwierdzenia.
- **Checkbox "Pamiętaj moje dane na następne zamówienie"** — zapisuje w localStorage (nie w bazie po stronie serwera, jeśli nie ma kont użytkowników w MVP).

**Sekcja czasu dostawy:**
- **Radio buttons (segmented):**
  - **"Jak najszybciej"** (default, zaznaczony) + sub-tekst "Dostawa ok. 35 min" — kalkulowany na podstawie default ETA + obciążenie kuchni.
  - **"Na konkretną godzinę"** (pre-order) — po kliknięciu pojawia się time picker. Sloty co 30 minut, od `now + 1h` do końca godzin otwarcia danego dnia. Można wybrać też kolejny dzień.

**Sekcja metody płatności:**
- **Radio cards** (każda metoda jako klikalna karta z ikoną i nazwą):
  - 💵 **Gotówka przy odbiorze** — domyślnie zaznaczona (najprostsza, dla pizzerii często ~50% zamówień).
  - 💳 **Karta przy odbiorze** (kurier z terminalem) — opcjonalne, jeśli pizzeria ma terminal mobilny.
  - 📱 **BLIK** — pole na 6-cyfrowy kod (po złożeniu zamówienia, nie tutaj).
  - 🏦 **Przelewy24 / PayU** (przelew online, karta, pay-by-link).
- Wybór BLIK lub online: pojawia się info "Przekierujemy Cię do bezpiecznej płatności po kliknięciu Złóż zamówienie."
- Wybór "Gotówka": opcjonalne pole "Czy potrzebujesz wydania reszty? Z ilu zł?" (np. wpisuje 100 zł — kurier wie ile zabrać).

**Sekcja uwag do zamówienia:**
- Textarea, label "Uwagi dla restauracji (opcjonalne)".
- Placeholder: "Np. dzwonek nie działa, prosimy zadzwonić; zostawić pod drzwiami; ekstra serwetki".
- Max 300 znaków, licznik.

**Walidacja formularza:**
- **OnBlur** (po wyjściu z pola) — pierwsza walidacja.
- **OnChange** po pierwszym błędzie — natychmiastowa korekta gdy klient poprawia.
- **OnSubmit** — finalna walidacja wszystkich pól + scroll do pierwszego błędnego + focus.
- Styl błędów: **czerwony border 2px** + **czerwony tekst poniżej pola** (font 13px). Ikona ⚠ przed tekstem.
- Komunikaty konkretne — nie "Pole wymagane" tylko **"Wpisz numer telefonu, żebyśmy mogli się skontaktować."**

**Podsumowanie zamówienia w checkoucie:**
- **Desktop sidebar prawy sticky.** Na mobile **accordion u góry** (collapsed) + duplicate na dole pełne (jako sanity check przed finalnym submit).
- Zawartość:
  - Lista pozycji (mini, miniaturka 40×40 + nazwa + ilość + cena).
  - Subtotal.
  - Dostawa.
  - Rabat (jeśli kod).
  - **RAZEM** bold.
- **Edytowalność:** link "Wróć do menu" lub "Edytuj koszyk" — przy kliku redirect do `/menu`. Inline edit nie polecam — komplikuje stan formularza.

**Przycisk złożenia zamówienia:**
- Pozycja: koniec formularza, pełna szerokość. Mobile: dodatkowo sticky bottom bar po scrollu (zwiększa konwersję).
- Tekst: **"Złóż zamówienie · 56,12 zł"**.
- Wymiary: wysokość 56px (mobile) / 56–64px (desktop), font 18px weight 700, biały na primary color.
- **Loading state po kliknięciu:** spinner po lewej + tekst "Składam zamówienie..." Disabled przez 5s minimum + do odpowiedzi serwera (anti-double-submit).
- **Błąd po stronie serwera:** modal lub inline error u góry formularza "Coś poszło nie tak. Spróbuj ponownie." + retry button. **Form data zachowane** — klient nie traci wpisanych danych.

**Po złożeniu:**
- Płatność gotówka/karta przy dostawie: redirect do `/order/UUID/confirmation`.
- Płatność BLIK/online: redirect do bramki Przelewy24/PayU, po sukcesie callback URL → `/order/UUID/confirmation`.
- Przy płatności online — koszyk **NIE jest jeszcze "złożony" w systemie** dopóki płatność nie potwierdzona. Status PENDING_PAYMENT. Po sukcesie → CONFIRMED. Po niepowodzeniu / timeout (15 min) → CANCELED + komunikat klientowi.

**Zapisywanie danych (autocomplete browser):**
- HTML attributes:
  - imię/nazwisko: `autocomplete="name"`
  - telefon: `autocomplete="tel"`
  - email: `autocomplete="email"`
  - ulica: `autocomplete="street-address"`
  - kod: `autocomplete="postal-code"`
  - miasto: `autocomplete="address-level2"`
- Dzięki temu Chrome/Safari auto-uzupełnia z zapisanych danych użytkownika.
- Dodatkowo: **localStorage** zapisuje formularz (poza polami wrażliwymi) z TTL 30 dni — przy następnej wizycie pre-fill.

**Edge cases:**

**A. Restauracja zamknęła się w trakcie wypełniania checkoutu:**
- Sprawdzane przy klik "Złóż zamówienie".
- Komunikat modal: "Restauracja właśnie się zamknęła. Otwiera jutro o 11:00. Czy chcesz złożyć zamówienie z dostawą jutro o 11:00?" + przyciski "Zaplanuj na jutro" / "Anuluj".
- Koszyk zachowany.

**B. Produkt wyczerpał się między dodaniem a złożeniem zamówienia:**
- Sprawdzane przy klik "Złóż zamówienie".
- Komunikat: "Niestety, **Margherita 30 cm** jest dziś wyczerpana. Usunęliśmy ją z koszyka. Reszta zamówienia gotowa do złożenia." + przycisk "Kontynuuj z resztą" / "Anuluj zamówienie".

**C. Błąd serwera przy submit:**
- Komunikat inline u góry formularza: "Coś poszło nie tak po naszej stronie. Spróbuj ponownie za chwilę." + retry.
- Form data zachowane w pamięci komponentu (i localStorage backup).
- Log błędu do Sentry/innego systemu.

**D. Timeout połączenia:**
- Po 30s bez odpowiedzi: pokaż komunikat "Twoje zamówienie może zostało już złożone. Sprawdź email lub zadzwoń: [tel]" + przycisk "Sprawdź status zamówienia" (jeśli można po telefonie odzyskać).
- Backend: **idempotency key** — generowany przy submit (UUID), serwer odrzuca duplikaty.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** osobna strona `/checkout`, one-page form, segmented control dostawa/odbiór, autocomplete adresu (Google Places), maska telefonu, walidacja inline, sticky podsumowanie desktop / accordion mobile, gotówka + BLIK + Przelewy24, loading state na CTA, idempotency key, autocomplete attributes
- **Nice-to-have:** mapa z pinem, "Pamiętaj moje dane" checkbox, pre-order (na konkretną godzinę), pole "z ilu zł reszta", Geolocation
- **Post-MVP:** karta przy dostawie (jeśli klient ma terminal), Apple Pay / Google Pay, konta użytkowników z historią
- **Pomijamy:** multi-step wizard, social login (Facebook/Google) — komplikacja prawna RODO, gift cards, faktury VAT auto-generowane (na request manualne wystarczy), guest vs registered checkout (zawsze guest dla MVP)

---

### 8. STRONA POTWIERDZENIA ZAMÓWIENIA

**Layout:**
- Pełna strona `/order/UUID/confirmation` (lub `/order/{order-number}` — np. `/order/B2025-0142`).
- Centered content max-width 600px.
- Mobile: pełna szerokość minus 16px padding.

**Co wyświetlone (kolejność top-down):**

1. **Animacja sukcesu:** duża zielona ikona ✓ w kółku (96px), animacja: scale 0 → 1.2 → 1.0 + draw ✓ przez 600ms (Lottie lub CSS keyframes). Subtelny confetti (post-MVP).

2. **Nagłówek H1:** **"Dziękujemy! Zamówienie przyjęte."** — 28px bold, primary color.

3. **Numer zamówienia:** "Zamówienie nr **#B2025-0142**" — 18px, neutral-700. Format human-friendly (litera + rok + 4 cyfry). Można dodać małą ikonę "Kopiuj" obok — klik kopiuje numer do schowka + toast.

4. **Szacowany czas:**
   - Dostawa: "🛵 Dostawa **ok. 18:45**" — duży, 24–28px bold, primary color.
   - Lub: "🛵 Dostawa za **ok. 35 minut**".
   - Format z konkretną godziną jest bardziej "real" niż "za 35 min" — ale jeśli klient zamawia z dużym wyprzedzeniem, godzina jest lepsza. Polecam **godzinę**.
   - Pod spodem (mniejszy tekst): "Powiadomimy Cię gdy zamówienie będzie w drodze."

5. **Sekcja "Co zamówiłeś":** lista pozycji (collapsed/zwijana, default expanded). Tytuł "Twoje zamówienie" + przycisk "▼ Zwiń". Dla małej pizzerii zostawić expanded — lista 3–5 pozycji nie zaśmieca.

6. **Adres dostawy:** "🏠 ul. Marszałkowska 12/34, 00-001 Warszawa" + tel kontaktowy.

7. **Metoda płatności:** "💵 Gotówka przy odbiorze" lub "💳 Zapłacono BLIK".

8. **Łączna kwota:** "**Razem: 56,12 zł**".

9. **CTA główny:** **"Śledź zamówienie"** — pełna szerokość, primary color, wysokość 56px. Click → `/track/UUID`.

10. **CTA secondary:** **"Wróć do menu"** — link tekstowy, neutralny.

11. **Anulowanie zamówienia:**
    - Widoczne w pierwszych 2 minutach od złożenia (Pyszne pattern).
    - Link tekstowy "Anuluj zamówienie" pod CTA, neutralny szary z ikoną ❌.
    - Klik → confirm dialog "Na pewno anulujesz?" → API call → status CANCELED.
    - Po 2 min — link znika lub komunikat "Zamówienie jest już w przygotowaniu, anulowanie nie jest możliwe — zadzwoń: [tel]".

**Mobile:**
- Identyczny layout, tylko padding 16px.
- **Sticky CTA "Śledź zamówienie"** na dole — kluczowe, klient zwykle chce track, nie scroll.

**Email potwierdzający:**
- Wysyłany od razu po złożeniu (jeśli klient podał email).
- Zawiera: numer zamówienia, listę pozycji, adres dostawy, ETA, link do trackingu.
- Subject: "✅ Twoje zamówienie #B2025-0142 przyjęte — dostawa ok. 18:45"
- Provider: SendGrid / Mailgun / SES — najprostsze w PL: **SendGrid** (dobry darmowy plan, łatwa integracja Spring Boot).

**Udostępnianie zamówienia:**
- **Pomijamy w MVP** — mała pizzeria, sytuacja "Hej, zamówiłem za nas, śledź" jest niszowa. Post-MVP: share button → kopia linku do trackingu.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** strona `/order/UUID/confirmation`, animacja success, numer zamówienia, ETA z konkretną godziną, lista pozycji, adres + płatność, CTA "Śledź zamówienie", anulowanie w 2 min, email potwierdzający
- **Nice-to-have:** "Kopiuj numer zamówienia", confetti animacja, sticky CTA mobile
- **Post-MVP:** share button, "Dodaj do kalendarza" (estimated delivery time), "Zamów ponownie" w przyszłości
- **Pomijamy:** ankieta NPS od razu, social media share, redirect z reklamą partnera

---

### 9. TRACKING ZAMÓWIENIA

**URL:**
- Format: `/track/UUID` (np. `/track/abc-123-xyz`). UUID nie do zgadnięcia (security przez obscurity dla braku auth).
- Alternatywnie: `/track/B2025-0142?token=XYZ` — numer + token jako parametr. Polecam **UUID w ścieżce** — czystsze.
- Bookmarkowalne. Client może wrócić w każdym momencie.
- Po DELIVERED status zostaje, ale można dodać "Zamówienie zakończone" + link do oceny.

**Odświeżanie statusu:**
- **Polling co 15 sekund** (HTTP GET) — najprostsza implementacja, dobra dla małej pizzerii (max 50 zamówień dziennie, low traffic).
- WebSocket / SSE — overkill dla naszej skali. Trzymanie 50 połączeń WS to mało, ale komplikacja deploymentu, scaling, fallbacks. **Polling wystarczy.**
- **Visual feedback aktualizacji:** subtle "Aktualizuję..." (1px progress bar u góry strony, pulsuje co 15s przez 1s). Nie spinner, nie blocking.
- Tekst "Ostatnia aktualizacja: 18:32" pod statusem — refreshuje się.
- Gdy zmiana statusu wykryta: **subtle animation** + opcjonalny dźwięk powiadomienia (jeśli klient wyraził zgodę na browser notifications).

**Wizualizacja statusów:**
**Stepper poziomy** (Domino's pattern). Każdy status to wycinek "rurki" — szare gdy przyszłe, primary gdy zaliczone, animowany gdy aktualny.
- Etykieta pod każdym wycinkiem: nazwa statusu + ikona.
- Aktualny krok: wypełnia się stopniowo (animacja) i pulsuje.
- Zaliczone: pełen primary color z ✓.

Dla MVP wystarcza **5–6 statusów**:

| Status (kod) | Nazwa PL | Ikona | Kolor | Opis |
|---|---|---|---|---|
| `NEW` | Nowe | 📋 | niebieski | Zamówienie złożone, czeka na potwierdzenie |
| `CONFIRMED` | Przyjęte | ✅ | niebieski | Restauracja przyjęła zamówienie |
| `IN_PREPARATION` | W przygotowaniu | 👨‍🍳 | pomarańczowy | Kucharz robi Twoje jedzenie |
| `READY` | Gotowe | 🍕 | zielony jasny | Czeka na kuriera (lub na odbiór) |
| `OUT_FOR_DELIVERY` | W drodze | 🛵 | zielony | Kurier wyjechał |
| `DELIVERED` | Dostarczone | 🎉 | szary | Smacznego! |
| `CANCELED` | Anulowane | ❌ | czerwony | Zamówienie anulowane (osobny stan) |

Dla **odbioru osobistego** zamiast OUT_FOR_DELIVERY → status **READY_FOR_PICKUP** ("Gotowe do odbioru — możesz przyjechać"), bez DELIVERED → klient sam zaznacza jako odebrane lub admin po wydaniu.

**Aktywny status:**
- Bold, primary color, lekkie pulsowanie (scale 1.0 ↔ 1.05 nieskończenie, 1.5s, ease-in-out).
- Background ikony: tint primary color.
- Opis pod stepperem: "Restauracja przygotowuje Twoje zamówienie. Zaraz to skończą!" (kontekstowo zmieniający się).

**ETA:**
- Format: **"Dostawa ok. 18:45"** — duży 24px bold, neutral-900, primary background tint pasek.
- Pozycja: nad stepperem, jako "hero info".
- **Nie odlicza w dół** w MVP (komplikacja — co gdy minie? Frustrujące "−5 min"). Pokazujemy konkretną godzinę.
- Gdy minie i nadal nie DELIVERED: zmieniamy na **"Dostawa lada chwila — przepraszamy za opóźnienie"** + opcja kontaktu.
- Admin może w panelu **przedłużyć ETA o X min** — klient widzi automatyczną aktualizację z subtelnym komunikatem "Zaktualizowano czas dostawy".

**Mapa z kurierem:**
**POMIJAMY w MVP** — bo bez GPS kuriera (założenie projektu). Zamiast mapy:
- W statusie OUT_FOR_DELIVERY: ikona 🛵 + tekst **"Kurier z Twoim zamówieniem jest w drodze. Powinien dotrzeć ok. 18:45."**
- Imię kuriera (jeśli admin wpisał): "Kierowca: Marek".
- Telefon kuriera klikalny `tel:`.
- **Brak mapy** = brak kosztów Maps API + brak GPS w aplikacji kuriera.

**Dane zamówienia na stronie:**
- Akordeon "Szczegóły zamówienia" (default zwijany na mobile, expanded na desktopie).
- Lista pozycji z miniaturkami, ilościami, cenami.
- Kwota razem.
- Adres dostawy.
- Metoda płatności.

**Kontakt z restauracją:**
- Zawsze widoczny przycisk "📞 Zadzwoń do restauracji: 600 100 200" (klikalny `tel:`).
- Mobile: fixed na dole strony jako secondary action obok statusu.

**Status CANCELED:**
- Czerwony banner "Zamówienie anulowane" + ikona ❌.
- Powód (jeśli admin wpisał): "Powód: Brak kuriera. Przepraszamy."
- CTA: **"Zamów ponownie"** — z preselekcją tych samych pozycji + **"Zadzwoń do nas"**.
- Jeśli płatność online — info o zwrocie: "Środki wrócą na Twoje konto w 3–5 dni roboczych."

**Status DELIVERED:**
- Header zmienia się na "🎉 Smacznego!" (large 28px).
- Stepper pełen primary, ostatni krok bouncing animation 600ms (potem static).
- **Prośba o ocenę** — pojawia się **15 minut po DELIVERED** (klient zdążył zjeść). Format: 5 gwiazdek (large clickable) + "Jak smakowało?" + opcjonalny komentarz. Dla MVP — **wystarczy gwiazdki bez komentarza**.
- CTA "Zamów ponownie" — 1-click reorder z koszykiem prefilled tymi samymi pozycjami.

**Mobile:**
- Stepper poziomy na mobile staje się **pionowy** (timeline) — łatwiej czytelny w wąskim viewporcie.
- Sticky bottom bar z "📞 Zadzwoń" + "🔄 Odśwież" (manual refresh button).

**Push notifications (post-MVP):**
- Web Push API — wymaga zgody klienta przy złożeniu zamówienia ("Chcesz dostawać powiadomienia o statusie? [Tak] [Nie]").
- Powiadomienia per status change: "✅ Twoje zamówienie zostało przyjęte", "🛵 Kurier wyjechał z Twoim zamówieniem", "🎉 Zamówienie dostarczone".
- **Dla MVP — pomijamy.** Polling + email przy DELIVERED wystarczy.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** URL `/track/UUID`, polling 15s, stepper poziomy z 6 statusami, ETA z godziną, akordeon szczegółów, telefon do restauracji klikalny, status CANCELED z powodem, anulowanie w 2 min od złożenia
- **Nice-to-have:** subtle "aktualizuję" pasek, prośba o ocenę 15 min po DELIVERED, "Zamów ponownie" CTA, imię kuriera (Marek)
- **Post-MVP:** Web Push notifications, mapa kuriera (gdy będzie GPS), countdown timer, kalendarz integration
- **Pomijamy:** GPS tracking kuriera w real-time, share button trackingu, AI ETA prediction, voice updates

---

### 10. OCENY I KOMENTARZE DO PRODUKTÓW

**Kiedy prośba o ocenę:**
Najlepszy moment to **15 minut po DELIVERED** — klient zdążył zjeść, ale wrażenia są świeże. Wcześniej (np. od razu) — klient jeszcze nie zjadł. Później (godzina+) — zapomni.
- Email z linkiem do oceny (jeśli klient podał email).
- Bezpośrednio na stronie trackingu — gdy klient otworzy `/track/UUID` po 15 minutach od DELIVERED, widzi prompt o ocenę.
- Push notification (post-MVP).

**Typ oceny:**
**Skala 1–5 gwiazdek** (uniwersalna, intuicyjna). Thumbs up/down — za prosta. Emoji — za infantylna dla pizzerii.
- 5 dużych gwiazdek (40×40px each), klikalne, hover/tap fill.
- Pod gwiazdkami: opis aktualnej oceny ("⭐⭐⭐ — Średnio", "⭐⭐⭐⭐ — Dobrze", "⭐⭐⭐⭐⭐ — Świetnie!").

**Per zamówienie vs per produkt:**
- **Per zamówienie** dla MVP. Prostsze dla klienta, prostsze dla pizzerii.
- Per produkt — komplikacja (5 produktów = 5 ocen, klient odpadnie). **Pomijamy.**

**Komentarz tekstowy:**
- **Opcjonalny**, max 500 znaków, textarea pod gwiazdkami.
- Placeholder "Co Ci się podobało? Co możemy poprawić? (opcjonalnie)".
- **Moderacja:** w MVP — wszystkie zaakceptowane automatycznie + admin może ukryć w panelu (post-publish moderation). Filtr automatyczny na bluzgi (open-source word list PL).

**Zdjęcie:**
**Pomijamy w MVP.** Komplikacja: upload, storage, moderacja, RODO (czy widać twarze, prywatne info na zdjęciu). Post-MVP.

**Oceny widoczne na karcie produktu:**
- **Pomijamy w MVP** — bo MVP ma per-zamówienie, nie per-produkt.
- Post-MVP: pod ceną mała ikona "⭐ 4.7 (52)" — średnia + liczba ocen. Pokazujemy od **min. 5 ocen**. Wcześniej "Brak ocen" lub po prostu nie pokazujemy.

**Filtrowanie produktów po ocenach:**
**Pomijamy całkowicie.** 80 pozycji menu, klient ma znaleźć pizzę nie zrobić ranking — niepotrzebne.

**Odpowiedź restauracji na ocenę:**
Post-MVP. Admin może odpowiedzieć z panelu — odpowiedź widoczna pod oceną na publicznej stronie produktu (jeśli per-product) lub na "Wall opinii" (jeśli pełnimy taką sekcję).

**Sekcja "Opinie klientów" na landingu:**
Wybrane 3–5 najlepszych opinii (5★ + dłuższy komentarz). **Manualny wybór z panelu** w MVP, automatyczny algorytm post-MVP.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** prosty system per-zamówienie 1–5 gwiazdek + opcjonalny komentarz, prompt 15 min po DELIVERED, email z linkiem do oceny, sekcja w panelu admina do przeglądania ocen
- **Nice-to-have:** auto-filtr bluzgów, manualne wybranie 3 opinii do landingu
- **Post-MVP:** oceny per-produkt, zdjęcia w opiniach, odpowiedź restauracji, agregacja na karcie produktu
- **Pomijamy:** filtrowanie po ocenach, ranking produktów, integracja z TripAdvisor/Google jako external source

---

### 11. PSYCHOLOGIA KONWERSJI I DOBRE PRAKTYKI

**Co sprawia że klient finalizuje:**
1. **Brak ukrytych kosztów** — Baymard: 48% klientów porzuca koszyk z powodu nieoczekiwanych opłat. Pokazuj koszt dostawy od razu na landing page.
2. **Wizualne potwierdzenie progresu** — bumpy badge'a, animacje, toasty "Dodano". Klient widzi że to "działa".
3. **Niska bariera wyboru** — domyślne wartości (najmniejszy wariant pizzy, "Jak najszybciej", "Gotówka"). Klient wybiera tylko gdy chce inaczej.
4. **Social proof** — "Bestseller", "Polecamy", "Zamówiona X razy w tym tygodniu" (dla MVP — tylko statyczne badge'y "Bestseller" przypisane przez admina).
5. **Pewność dostawy** — konkretny czas ("ok. 18:45"), nie "~30–60 min".

**"Bestseller", "Polecamy":**
- Badge na karcie produktu (lewy górny róg zdjęcia).
- **Maksymalnie 3–5 bestsellerów** w całym menu — inflacja oznaczeń = utrata znaczenia.
- Konfigurowalne w panelu — admin oznacza ręcznie.

**"Zamówiono X razy w tym tygodniu":**
- Wymaga liczenia w bazie. Niewielki wysiłek dla MVP — można pokazywać tylko TOP 3 produkty.
- Format: "🔥 Zamówiona 23 razy w tym tygodniu" — pod ceną, mały tekst neutralny.
- **Pomijamy w MVP**, post-MVP.

**Upsell i cross-sell:**
- W modalu produktu (na samym dole, przed CTA): sekcja "Pasuje do tego" z 2–3 produktami (napoje, dodatki). Tytuł "Może coś jeszcze?" lub "Polecamy dodatkowo".
- W koszyku: subtelne "Dodaj napój za −20%" jako single banner.
- **NIE: pop-upy które blokują checkout, agresywne "JESZCZE 5 PRODUKTÓW W PROMOCJI"**.
- **Pomijamy w MVP**, post-MVP.

**Progress do darmowej dostawy:**
- Najsilniejszy pojedynczy motywator po dodaniu do koszyka.
- Format paska postępu w koszyku: "🎉 Brakuje **8 zł** do darmowej dostawy" + green progress bar.
- **MVP-critical** jeśli pizzeria oferuje darmową dostawę od kwoty.

**Minimum order warning:**
- Komunikuj **wcześnie** — w pasku informacyjnym na landing, w empty state koszyka. Nie zaskakuj na checkout.
- W koszyku: pasek progresu "Brakuje X zł do min. zamówienia 35 zł" — kontrast czerwony/pomarańczowy.

**Porzucone koszyki:**
- Wymagają emaila klienta. **Email po 1h** "Hej, zostawiłeś koszyk z Margheritą — wróć i zamów" + link.
- **Pomijamy w MVP** (wymaga emaila + permission RODO + integracji email marketing). Post-MVP.

**Onboarding nowego użytkownika:**
- Single-site pizzerii nie wymaga onboarding tutorial — UX powinien być "zrozumiały bez instrukcji".
- Dla pierwszej wizyty: **welcome offer banner** ("−10% z kodem BELLA10") to wszystko czego potrzeba.
- **Pomijamy tooltip tour, "wprowadzenie", animowane przewodniki** — niepotrzebne, frustrujące.

**A/B testy które platformy publikowały:**
- Booking.com: red CTA → primary action +14% conversion (kontrowersyjne, branżowe).
- ASOS: sticky add-to-cart na mobile → +4% conversion.
- Olo (food delivery agreggator): 4+ handoff modes (delivery/pickup/curbside/dine-in) → +12% conversion. Dla nas: **delivery + pickup** wystarczy w MVP.
- Klient idzie tam gdzie krócej i jaśniej.

**Pain points użytkowników (z opinii App Store / Google Play / Reddit):**
- "Aplikacja zawiesza się przy płatności" → solid backend + idempotency.
- "Nie wiem czy moje zamówienie zostało przyjęte" → silna confirmation page + email.
- "Restauracja zignorowała komentarz" → kucharz widzi komentarze w panelu/KDS na drukowanym bonie.
- "ETA jest fałszywe — zamówiłem o 18:00, dostarczyli o 19:30" → solid ETA logic + auto-extend gdy busy.
- "Nie ma jak anulować zamówienie" → daj 2-min cancel window.
- "Nie pamiętam co zamówiłem" → email + tracking page persistuje.

**Czego nie ma na Pyszne, a robi Domino's / McDonald's:**
- Pizza tracker — wizualne śledzenie produkcji (5 etapów). My to mamy (sekcja 9).
- Customizacja składników (dodaj/usuń) — McDonald's "Make it yours". My to obsługujemy w modalu produktu.
- Loyalty program (Domino's Piece of the Pie). **Post-MVP**, dla małej pizzerii — może w panelu prosty system stempli "10. pizza gratis".
- 1-click reorder — Domino's "Easy Order". My — post-MVP, jeśli kont użytkowników.

**Czego nie ma w web a jest w native apps:**
- Push notifications (Web Push działa w PWA, ale gorsze UX niż native).
- Biometric auth (Face ID na płatność).
- Camera integration (skan paragonu na promocje).
- Offline mode (PWA też potrafi, ale rzadko warte).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** brak ukrytych kosztów, default values w formularzu, badge "Bestseller", progress do darmowej dostawy / minimum order, "ok. 18:45" konkretne ETA, anulowanie 2 min, idempotency
- **Nice-to-have:** welcome offer banner z kodem, sekcja "Pasuje do tego" w modalu (2 produkty), porzucony koszyk recovery email
- **Post-MVP:** loyalty program (stemple), 1-click reorder, "Zamówiona X razy", AI predict ETA
- **Pomijamy:** tooltip tour, onboarding wizard dla klienta, agresywne pop-upy promocji, scarcity timer ("Tylko 3 sztuki!")

---

### 12. RESPONSYWNOŚĆ — SZCZEGÓŁY TECHNICZNE

**Breakpointy używane:**
- Pyszne.pl: ~768px (mobile/tablet), ~1024px (tablet/desktop), ~1440px (large desktop).
- Tailwind defaults: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`.
- **Polecam dla nas:**
  - **Mobile:** < 768px
  - **Tablet:** 768–1023px
  - **Desktop:** 1024–1439px (3 kolumny)
  - **Large:** 1440px+ (większe paddingi, szerszy koszyk)

**Co zmienia się na każdym breakpoincie:**
- **<768px:** 1 kolumna, sticky tabs kategorii, floating bottom bar koszyka, hamburger menu, fullscreen modaly.
- **768–1023px:** 1 kolumna lub 2 kolumny menu, koszyk jako floating bar (jeszcze nie sidebar), modal centered (nie bottom sheet).
- **1024–1439px:** 3 kolumny — nawigacja 200px, środek płynny, koszyk 360px sticky.
- **1440px+:** szerszy koszyk 400px, większe paddingi, max-width content 1280px (centrowane).

**Touch targets:**
- iOS HIG: **min 44×44px**.
- Android Material: **min 48×48dp** (~48×48px).
- **Stosujemy 44px wszędzie**, 48px gdzie to "primary action" (CTA główny, "+", "−" w stepperze).
- Spacing między targetami: min 8px.

**Gesty:**
- **Swipe left/right** na karuzelach zdjęć (jeśli galeria w modalu).
- **Swipe down** na bottom sheet → zamknięcie.
- **Pinch-to-zoom na zdjęciach produktów** — w MVP **wyłączamy** (`<meta name="viewport" content="user-scalable=no">`). Post-MVP można rozważyć w fullscreen view zdjęcia.
- **Pull-to-refresh** — naturalny browser gesture, my niczego nie blokujemy. Rozsądnie używać `overscroll-behavior: contain` żeby nie odświeżać niechcący.
- **Long press** — nie używamy, niejasne dla użytkownika.

**Safe area iPhone (notch + home indicator):**
- CSS env() variables:
  ```css
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  ```
- Floating bottom bar koszyka: `padding-bottom: calc(8px + env(safe-area-inset-bottom))`.
- Sticky header: `padding-top: env(safe-area-inset-top)` jeśli `viewport-fit: cover` w meta.

**Keyboard na mobile:**
- iOS Safari: zachowuje się dziwnie — viewport zmniejsza się. Używaj `dvh` zamiast `vh` dla heightów.
- **Input scroll-into-view** — gdy klient kliknie input w środku formularza, scroll automatycznie żeby pole było widoczne nad klawiaturą.
- **Sticky CTA na dole zachowuje się problematycznie** — przy otwarciu klawiatury "skacze" do góry. Workaround: użyj `fixed` zamiast `sticky` + JS który przy `focusin` na input chowa CTA.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** breakpointy mobile/tablet/desktop (<768/<1024/<1440), 44px touch targets, env() safe area iOS, dvh/vh dla heightów, scroll-into-view focused input
- **Nice-to-have:** swipe down na bottom sheet, hide CTA gdy klawiatura otwarta
- **Post-MVP:** pinch-to-zoom na zdjęciach, custom long-press menu
- **Pomijamy:** gestowy nav (swipe between pages), force-touch / 3D Touch

---

### 13. PERFORMANCE UX

**Skeleton screens:**
Stosujemy **subtelne**, nie nadużywamy. Tam gdzie:
- **Lista menu** (gdy ładuje się): 6 placeholderów kart (animowany shimmer 1.5s loop).
- **Modal produktu** (gdy ładuje się szczegóły z API): placeholder na zdjęcie + 3 paski tekstu.
- **Tracking page** (przy pierwszym renderze): placeholder stepper.

**Nie skeleton** dla:
- Krótkich operacji (<200ms) — pokażą się i znikną, irytujące.
- Stałych elementów (nawigacja, footer) — są od początku.

**Optimistic updates:**
- **Dodanie do koszyka:** UI aktualizuje się natychmiastowo, request leci w tle. Jeśli błąd serwera — rollback + toast "Coś poszło nie tak, spróbuj ponownie".
- **Zmiana ilości:** identycznie.
- **Komentarz inline edit:** save optymistycznie.
- **Submit zamówienia:** **NIE optymistyczny** — to ważna akcja, klient musi widzieć loading state.

**Image loading:**
- **WebP główny + JPEG fallback** — `<picture>` element.
- **LQIP placeholder:** base64 16×12px blur, inline w HTML, fade-in po załadowaniu (300ms).
- **Lazy load** wszystkich obrazków poniżej hero: `loading="lazy"` + `decoding="async"`.
- Hero image: **eager** + preload `<link rel="preload" as="image">`.
- **Threshold lazy:** Intersection Observer rootMargin "100px 0px" (load gdy 100px przed viewport).

**Debounce / throttle:**
- **Search:** debounce **250ms** (Pyszne stosuje ~200ms; Uber Eats ~300ms).
- **Scroll-spy:** throttle **100ms** + `requestAnimationFrame`.
- **Promo kod walidacja (auto):** debounce **500ms** (mniej requestów, bo walidacja drogą serwerem).
- **Resize listener (np. layout shift):** throttle **150ms**.

**Offline:**
- Service Worker **cache assets** (HTML, CSS, JS, fonts). Menu data — `network-first` strategy z fallback do cache.
- **Banner offline:** "Brak połączenia z internetem. Sprawdź sieć." (czerwony, 48px, top of viewport).
- **Próby submit offline:** queue request + retry on reconnect (background sync API). **Pomijamy w MVP**, post-MVP.
- **Tracking offline:** ostatni cache'owany status pokazuje się + komunikat "Tryb offline — status może być nieaktualny".

**First Contentful Paint targets:**
- **LCP < 2.5s** (Largest Contentful Paint — hero image).
- **FID/INP < 200ms** (Interaction to Next Paint).
- **CLS < 0.1** (Cumulative Layout Shift).
- **TTFB < 600ms** (Time to First Byte).

**Co ładuje się pierwsze:**
1. HTML + critical CSS inline.
2. Hero image preload.
3. Font (1 plik woff2, swap).
4. Nawigacja kategorii (pierwsza sekcja menu).
5. Reszta menu (lazy chunked).
6. Koszyk (komponent, lazy chunked — pojawia się dopiero po pierwszym dodaniu).

**Bundle size targets:**
- Initial JS bundle (parsed + executed): **<100KB gzip** (cel ambitny ale osiągalny z React + minimal libs).
- Lazy chunks: 20–50KB gzip każdy.
- Total page weight: **<500KB** dla landing (bez hero JPG), **<1MB** dla menu page (z 5 obrazkami).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** WebP + JPEG fallback, lazy load `loading="lazy"`, LQIP placeholder, debounce search 250ms, optimistic UI dla cart actions, skeleton dla listy menu na pierwszy load, hero preload
- **Nice-to-have:** Service Worker dla offline detection + banner, INP < 200ms target, font preload
- **Post-MVP:** background sync API dla offline submit, image CDN (Cloudflare Images / imgix), HTTP/3
- **Pomijamy:** server-side rendering complex SPA (SSG dla landing wystarczy w MVP), edge functions

---

### 14. DOSTĘPNOŚĆ (ACCESSIBILITY)

WCAG 2.1 Level AA jako baseline.

**ARIA roles i labels:**
- Nawigacja: `<nav role="navigation" aria-label="Główna nawigacja">`.
- Menu produktów: `<main>` + `<section aria-labelledby="kategoria-pizza">`.
- Karta produktu: `<article aria-labelledby="produkt-margherita">`.
- Modal: `role="dialog"` + `aria-labelledby="modal-title"` + `aria-modal="true"`.
- Koszyk: `aria-live="polite"` na liczniku pozycji + kwocie (screen reader ogłosi zmianę).
- Toast notifications: `role="status"` + `aria-live="polite"`.
- Stepper ilości: button `aria-label="Zwiększ ilość"` / "Zmniejsz ilość".

**Focus management:**
- **Po otwarciu modalu** — focus na pierwszy interaktywny element (radio button wariantu) lub na X (close button).
- **Po zamknięciu modalu** — focus wraca na element, który modal otworzył (przycisk produktu).
- **Po dodaniu do koszyka** — focus pozostaje na karcie / przycisku, nie skacze do koszyka (zgubi flow klienta).
- **Po error w formularzu** — focus na pierwszy invalid input.

**Focus trap w modalach:**
- Tab cyklicznie po elementach wewnątrz modala, nie wychodzi poza.
- Library: `react-focus-trap` lub `focus-trap-react`.

**Keyboard navigation:**
- Tab/Shift+Tab — kolejność logiczna (DOM order).
- Enter/Space — aktywacja przycisków.
- Escape — zamknięcie modala.
- Arrow keys — w stepperze ilości (lewo/prawo = dec/inc), w karuzeli zdjęć.
- Skip link "Przejdź do treści" — pierwszy element w DOM, ukryty wizualnie ale focusable.

**Screen reader (NVDA, JAWS, VoiceOver):**
- Ceny: zapisuj "32,90 zł" — **screen reader przeczyta "trzydzieści dwa złote dziewięćdziesiąt"** (jeśli locale=pl-PL). Dobrze działa z `<span lang="pl">`.
- Listy produktów: prawidłowa struktura `<ul>` `<li>` lub `<section>` z `<h3>`.
- Statusy w trackingu: `aria-live="polite"` ogłasza zmianę statusu.
- Ikona-only buttons: zawsze `aria-label`. Np. `<button aria-label="Usuń pozycję">🗑</button>`.

**Kontrast:**
- **AA dla normal text: 4.5:1**, dla large (18px+ bold lub 24px+ regular): 3:1.
- **AAA dla normal text: 7:1** (cel post-MVP).
- Primary CTA na białym tle: kolor #B91C1C (red-700) ma kontrast 6.6:1 — OK.
- Tekst neutral-600 (#525252) na białym: 7.2:1 — OK.
- **Tester:** axe DevTools, WAVE, Lighthouse audit.

**prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```
- Wyłączamy: animacje dodawania do koszyka, bump badge'a, slide animations modali, scroll smooth, rotacje.
- Zostawiamy: subtle fade-in dla loading states (instant change wygląda jak bug).

**prefers-color-scheme (dark mode):**
- **Pomijamy w MVP** — koszt vs benefit. Pizzeria klient wieczorem w łóżku może chcieć dark mode, ale to nie kluczowe.
- **Post-MVP:** simple media query, swap kolorów neutral-* + primary, zdjęcia produktów bez zmian.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** ARIA labels na ikona-only buttons, focus trap w modalach, focus return po zamknięciu, kontrast AA, prefers-reduced-motion respect, semantic HTML (h1/h2/h3, ul/li, button vs div)
- **Nice-to-have:** `aria-live` na koszyku i statusach, skip link, keyboard shortcuts dokumentowane
- **Post-MVP:** dark mode, AAA kontrast, full screen reader test, voice input
- **Pomijamy:** RTL languages (PL only), high contrast mode, sign language video tutorials

---

### 15. COPY I TEKSTY UI (MIKROCOPY)

**Przyciski CTA — dokładne brzmienie:**
- Karta produktu: ikona "+" (bez tekstu) lub "Dodaj" — dla MVP polecam **"+"**.
- Modal produktu: **"Dodaj do koszyka · 32,90 zł"** (z dynamiczną ceną).
- Update w modalu (gdy w koszyku): **"Zaktualizuj koszyk · 32,90 zł"** lub **"Dodaj jako kolejną pozycję"**.
- Koszyk → checkout: **"Przejdź do kasy · 56,12 zł"**.
- Checkout → submit: **"Złóż zamówienie · 56,12 zł"**.
- Tracking: **"Śledź zamówienie"**.
- Reorder: **"Zamów ponownie"**.

**Komunikaty błędów formularza (konkretne, empatyczne):**
- Telefon pusty: ❌ "Pole wymagane" → ✅ **"Wpisz numer telefonu, żebyśmy mogli się skontaktować w razie pytań."**
- Telefon nieprawidłowy: **"Numer wygląda na niepoprawny. Powinien mieć 9 cyfr (np. 600 100 200)."**
- Email nieprawidłowy: **"Sprawdź adres email — wygląda na niekompletny."**
- Adres poza strefą: **"Niestety, nie dowozimy pod ten adres. Wybierz **Odbiór osobisty** powyżej."**
- Promo kod nieprawidłowy: **"Kod nieprawidłowy lub wygasł. Sprawdź pisownię i spróbuj ponownie."**
- Min. zamówienie: **"Brakuje 8 zł do złożenia zamówienia (min. 35 zł)."**

**Puste stany:**
- Koszyk pusty: **"Twój koszyk jest pusty"** + sub "Dodaj coś z menu, żeby zacząć zamówienie 🍕".
- Brak wyników search: **"Nic nie znaleźliśmy dla **„kawior"**. Spróbuj innego hasła."**
- Brak produktów w kategorii (admin nie dodał): **"Wkrótce dodamy więcej produktów w tej kategorii."**
- Restauracja zamknięta: **"Aktualnie zamknięte. Otwieramy jutro o 11:00."**
- Brak zamówień (admin panel): **"Jeszcze nie ma żadnych zamówień. Pojawią się tutaj automatycznie."**

**Toast notifications:**
- ✅ Sukces: **"Dodano do koszyka"**, **"Zamówienie zostało złożone"**, **"Skopiowano kod"**.
- ❌ Błąd: **"Coś poszło nie tak. Spróbuj ponownie."** (general), specyficzne dla actions.
- ℹ️ Info: **"Twoje dane zostały zapisane"**, **"Restauracja zaktualizowała czas dostawy: ok. 19:15"**.
- 🔄 Undo: **"Usunięto Margherita 30 cm"** + przycisk **"Cofnij"**.

**Statusy zamówienia (PL + opisy pomocnicze):**
- **Nowe:** "Zamówienie złożone — czeka na potwierdzenie z restauracji."
- **Przyjęte:** "Restauracja przyjęła Twoje zamówienie. Niedługo zaczną je przygotowywać."
- **W przygotowaniu:** "Kucharz przygotowuje Twoje zamówienie 👨‍🍳"
- **Gotowe:** "Zamówienie gotowe. Czeka na kuriera."
- **Gotowe do odbioru:** "🍕 Zamówienie czeka na Ciebie w restauracji!"
- **W drodze:** "🛵 Kurier z Twoim zamówieniem jest w drodze."
- **Dostarczone:** "🎉 Smacznego!"
- **Anulowane:** "Zamówienie zostało anulowane."

**Komunikaty o czasie:**
- Konkretna godzina lepsza: **"Dostawa ok. 18:45"** > "ok. 35 minut".
- Wczesny etap (przed CONFIRMED): **"Szacowany czas: 30–45 min"** — zakres bo jeszcze nie wiemy dokładnie.
- W trakcie przygotowania: **"Dostawa ok. 18:45"** — konkret.
- Opóźnione: **"Aktualizacja: dostawa ok. 19:00"** — info o zmianie.

**Komunikaty o cenie dostawy:**
- Standardowa: **"Dostawa: 5,00 zł"**.
- Darmowa: **"🎉 Dostawa gratis!"** — emoji + bold zielony.
- Próg: **"Brakuje **8 zł** do darmowej dostawy"**.
- Strefa różna: **"Dostawa: 7,00 zł (Twoja strefa)"**.

**Tone of voice:**
- **Ciepły, bezpośredni, polski "Ty"** (nie "Państwo", chyba że pizzeria targetuje seniorów).
- Krótkie zdania, jasne komunikaty.
- Empatia w błędach ("Niestety...", "Przepraszamy...").
- Emoji sparingly — przy statusach OK, przy CTA NIE (rozprasza).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** wszystkie powyższe teksty CTA, statusy, komunikaty błędów, puste stany. Konsystencja w całej aplikacji.
- **Nice-to-have:** A/B testy mikrocopy ("Dodaj" vs "+" vs ikona), tone of voice guideline doc dla zespołu
- **Post-MVP:** wielojęzyczność (i18n), ai-powered personalizowane copy
- **Pomijamy:** chatbot z naturalnym językiem (gdzie polski tekst), neologizmy ("zamówioteka")

---

## CZĘŚĆ II — PANEL ADMINA

### 16. ROLE I UŻYTKOWNICY PANELU

**Role w typowym systemie restauracyjnym:**
- **Owner/Manager** — pełen dostęp: edycja menu, zamówienia, raporty, ustawienia, użytkownicy.
- **Recepcjonista/Kasjer** — przyjmowanie zamówień, podgląd menu, brak edycji menu/ustawień, brak raportów.
- **Kucharz (kuchnia)** — KDS, zmiana statusu zamówień (z CONFIRMED → IN_PREPARATION → READY), brak nic innego.
- **Kurier** — własna lista zamówień przypisanych, zmiana statusu (READY → OUT_FOR_DELIVERY → DELIVERED), kontakt do klienta.

**Dla małej pizzerii (1 kurier-pomocnik, 1 osoba na zmianie):**
**Brutalne uproszczenie:** dwie role wystarczą:
- **Owner/Manager** (właściciel) — pełen dostęp.
- **Pracownik (Staff)** — przyjmowanie zamówień, zmiana statusów, podgląd menu (bez edycji), brak raportów i ustawień.

KDS jako osobny ekran/widok dla **Pracownika** (ten sam login, inny widok dostępny przez `/admin/kds`).

**Tabela uprawnień (uproszczona MVP):**

| Uprawnienie | Owner | Staff |
|---|---|---|
| Podgląd zamówień | ✅ | ✅ |
| Zmiana statusu zamówienia | ✅ | ✅ |
| Anulowanie zamówienia | ✅ | ✅ |
| KDS / kuchenny widok | ✅ | ✅ |
| Edycja menu | ✅ | ❌ |
| Zarządzanie kategoriami | ✅ | ❌ |
| Włączanie/wyłączanie produktów (na dziś) | ✅ | ✅ |
| Ustawienia restauracji | ✅ | ❌ |
| Strefy dostawy | ✅ | ❌ |
| Raporty / dashboard | ✅ | ❌ |
| Zarządzanie użytkownikami | ✅ | ❌ |
| "Zamknij teraz" / "Pauza" | ✅ | ✅ |

**Osobne widoki:**
- `/admin/orders` (Live View — dla obu)
- `/admin/kds` (KDS — dla obu, full-screen dla kuchni)
- `/admin/menu` (Menu mgmt — Owner only)
- `/admin/settings` (Owner only)
- `/admin/dashboard` (Owner only)

**Login:**
- Standard: email + hasło.
- **PIN login dla tabletu w kuchni** — szybki dostęp 4-cyfrowym PIN-em (Toast POS pattern). Ekran logowania PIN-em dla `/admin/kds` na tablet stationary. Sesja długoletnia (nie wygasa codziennie).

**Multi-device:**
- Owner na PC (zarządzanie) + Staff na tablecie kuchennym (KDS) jednocześnie. Bez problemu — różne sesje, real-time sync poprzez polling lub SSE.
- Dla MVP: każdy widok robi własny polling co 5–10s.

**Sesje:**
- Default: 7 dni "Zostań zalogowany" (refresh token).
- Bez "stay logged in": 24h.
- Wygaśnięcie sesji w środku obsługi: redirect do login + automatyczny return po zalogowaniu (zachowane query state).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** 2 role (Owner + Staff), email+hasło login, PIN dla `/admin/kds`, refresh token 7 dni, prosta tabela uprawnień
- **Nice-to-have:** "Stay logged in" checkbox, return URL po wygaśnięciu sesji
- **Post-MVP:** osobna rola Kucharz/Kurier, audit log per user, role custom (drag-and-drop permissions)
- **Pomijamy:** SSO, role-based UI customization, fine-grained permissions per produkt

---

### 17. KITCHEN DISPLAY SYSTEM (KDS) — EKRAN KUCHENNY

**Co to jest KDS:**
Cyfrowy zamiennik papierowych bonów. Zamówienia trafiają na duży ekran w kuchni (tablet/monitor), kucharz widzi co przygotować, oznacza gotowość jednym tapnięciem.

**Dla małej pizzerii (max 50 zamówień / dzień, 1 kucharz, brak podziału na stacje):**
- KDS = **prosty grid kart zamówień**.
- **Zamiast podziału na stacje** — wszystkie zamówienia w jednym widoku.
- **Zamiast multi-monitor setup** — jeden tablet 10–12" zamontowany na ścianie kuchni.

**Layout KDS:**
- **Grid kart** — 2–4 kolumny w zależności od rozmiaru ekranu (na 12" tablet: 2 kolumny; na monitor 24": 4 kolumny).
- Wymiary karty zamówienia: **min 320×280px**, padding 16px wewnętrzny, gap 16px między kartami.
- Kolor tła ekranu: **ciemne** (background #1F2937, neutral-800). Dlaczego ciemne:
  - Mniej zmęczenia oczu w słabo oświetlonej kuchni.
  - Białe karty zamówień kontrastują, są bardziej "actionable".
  - Plamy/tłuszcz na ekranie mniej widoczne na ciemnym tle.
- Karty: białe tło lub bardzo jasne (neutral-100), border 2px primary color gdy aktywna/pilna.

**Typografia KDS:**
- Czytalne z 1.5–2 metrów (kucharz nie zawsze blisko ekranu).
- Numer zamówienia: **24–32px bold**.
- Nazwy pozycji: **18–20px** (nie 14px jak w panelu).
- Ilości: **bold**, np. **"2× Margherita 30 cm"**.
- Komentarze: **18px italic**, pomarańczowe tło żeby się rzucały w oczy.
- Czas oczekiwania: **28px bold**, kontekstowy kolor.

**Co na karcie zamówienia w KDS:**
1. **Header karty:**
   - Numer zamówienia: "#B2025-0142" (32px bold).
   - Typ: ikona 🛵 (Dostawa) lub 🛍 (Odbiór) — duża, 24px.
   - Godzina złożenia: "18:12" (16px neutral-600).
2. **Timer** (centered, dominujący):
   - Format: **"08:34"** (mm:ss) — odlicza od momentu CONFIRMED.
   - Kolor zmienia się: **zielony 0–10 min**, **żółty 10–15 min**, **czerwony 15+ min** (dla pizzerii — pizza wypieka się ~10 min, więc próg krytyczny ~15 min total).
   - Pulsuje subtelnie gdy czerwony.
3. **Lista pozycji:**
   - Każda pozycja w jednej linii lub max 2 linie z ellipsis.
   - Format: **"2× Margherita 30 cm"** (ilość bold + nazwa + wariant).
   - Pod spodem (jeśli są): dodatki "+ Ekstra ser, + Oregano" (mniejsze, 14px neutral-600).
   - Komentarz per pozycja: **pomarańczowe tło**, ikona 📝, tekst pełny **"Bez cebuli, dobrze wypieczona"** — KRYTYCZNE żeby kucharz nie przegapił.
4. **Komentarz ogólny zamówienia** (jeśli jest): inny kolor (czerwony tint), na samej górze karty pod numerem.
5. **Footer karty:**
   - Przycisk **"GOTOWE ✓"** (full width, primary color, wysokość 56–64px) — jednym tapnięciem oznaczam "READY".
   - Lub: **bump pattern** — tap całej karty oznacza gotowość (Toast POS).

**Kolorystyka czasowa (konfigurowalna w panelu):**
- Default: 0–10 min zielony, 10–15 min żółty, 15+ min czerwony.
- Konfiguracja: w `/admin/settings/kds` — "Próg żółty (min)" + "Próg czerwony (min)".

**Dźwięki KDS:**
- Nowe zamówienie (z `NEW` na `CONFIRMED` jak Owner przyjmuje): **dzwonek dingdong** lub krótki beep, głośność ~50% domyślnie, konfigurowalna.
- 15+ min oczekiwania (przekroczenie czerwonego progu): **alarm** (powtarzający się beep co 30s).
- Anulowanie zamówienia przez klienta: **dłuższy dźwięk + flash karty na czerwono**.
- Wszystko **wyłączalne** (mute toggle) z poziomu KDS.

**Jak kucharz oznacza gotowość:**
- **Klik "GOTOWE ✓"** na karcie → status zmienia się na READY → karta znika z KDS (lub przesuwa do sekcji "Gotowe oczekujące na kuriera" — separate column).
- Confirm dialog tylko dla anulowania, nie dla "GOTOWE" (zmniejsza tarcie).

**Podział na stacje kuchenne:**
**POMIJAMY DLA MAŁEJ PIZZERII** — nie ma stacji. Cały kucharz robi wszystko (pizza + sałatki + napoje). Jeden widok KDS wystarczy.

**Drukarka bonów kuchennych:**
- **Opcjonalne dla MVP**, ale BARDZO przydatne dla małej pizzerii:
- Automatyczne drukowanie bona przy `CONFIRMED`. Format 80mm:
  ```
  =====================================
  PIZZERIA BELLA
  ZAMÓWIENIE #B2025-0142
  =====================================
  Godzina: 18:12
  Typ: DOSTAWA
  ETA: 18:45
  -------------------------------------
  2× Margherita 30 cm
     + Ekstra ser
     + Oregano
     📝 Bez cebuli, dobrze wypieczona
  -------------------------------------
  1× Coca-Cola 0.5L
  =====================================
  RAZEM: 56,12 zł
  Płatność: GOTÓWKA
  -------------------------------------
  Adres dostawy:
  ul. Marszałkowska 12/34
  00-001 Warszawa
  Tel: 600 100 200
  =====================================
  Uwagi do zamówienia:
  Dzwonek nie działa, prosimy zadzwonić.
  =====================================
  ```
- Drukarka: **Epson TM-T20III** lub **Star TSP143III** (USB lub Ethernet, ESC/POS protokół, ~600–900 zł).
- Integracja: **Spring Boot → ESC/POS commands** (biblioteka `esc-pos-coffee` Java lub własna). Lub: **PrintNode cloud printing** (działa przez przeglądarkę, ale subscription).
- **Driverless printing przez przeglądarkę:** wymaga Web USB API (eksperymentalne) lub raster image printing. **Polecam:** Spring Boot generuje payload, drukarka przez sieć IP → najprościej.

**KDS offline:**
- Tablet kuchenny straci wifi → fallback do **drukowanego bona** (jeśli drukarka też straci → owner widzi banner "Drukarka offline" i drukuje ręcznie po przywróceniu sieci).
- Browser cache ostatnich zamówień (Service Worker) — przy reconnect pull diff.

**Urządzenia:**
- **Tablet 10–12" Android lub iPad** zamontowany na ścianie z stojakiem/uchwytem (~80–200 zł). **Polecane dla MVP** — tanio, intuicyjnie, dobry rozmiar.
- Monitor 22–24" dotykowy (~1500 zł) — przesada dla małej pizzerii.
- Zwykły monitor + mysz — niewygodne w kuchni (mysz w tłuszczu).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** prosty grid kart zamówień, ciemne tło + jasne karty, duża typografia (18–32px), timer per zamówienie z 3-kolorową logiką, przycisk "GOTOWE ✓", komentarze per pozycja wyróżnione pomarańczowym tłem, mute toggle dla dźwięków
- **Nice-to-have:** drukowanie bona ESC/POS przy CONFIRMED, dźwięk przy nowym zamówieniu, alarm przy 15+ min, sekcja "Gotowe oczekujące na kuriera"
- **Post-MVP:** podział stacji, multi-monitor, integracja z gestures (swipe to bump), rotation lock
- **Pomijamy:** AI food prep prediction, video monitoring kuchni, voice control "Hey KDS", AR overlay

---

### 18. PRZEPŁYW ZAMÓWIENIA PRZEZ KUCHNIĘ

**Pełna ścieżka zamówienia (od złożenia do dostawy):**

1. **Klient klika "Złóż zamówienie"** → status `NEW` → toast/email do owner: "Nowe zamówienie #B2025-0142".
2. **Owner widzi w `/admin/orders` Live View** + dźwięk dzwonka (jeśli włączony) + badge w favicon "🔴 1".
3. **Owner przyjmuje:** klik "Przyjmij" → status `CONFIRMED` → ETA wyświetlone klientowi → drukuje bon kuchenny + pojawia się w KDS (jeśli osobny tablet kuchenny).
4. **Kucharz widzi na KDS** zamówienie z timerem startującym od 0:00.
5. **Kucharz przygotowuje** — opcjonalnie klik "W przygotowaniu" → status `IN_PREPARATION` (klient widzi update). **Lub: skip step** — pizzeria pomija ten krok, zostaje CONFIRMED → READY (uproszczenie dla małych).
6. **Kucharz kończy:** klik "GOTOWE ✓" na KDS → status `READY`.
7. **Owner / Kurier widzi "Gotowe do wydania"** — przypisuje kuriera (jeśli są wielu) lub kurier sam bierze.
8. **Kurier wyjeżdża:** klik "Wyjechałem" w aplikacji kuriera (lub w panelu owner manualnie zmienia status) → `OUT_FOR_DELIVERY`.
9. **Kurier dostarcza:** klik "Dostarczyłem" → `DELIVERED`. Klient widzi "Smacznego!".

**Auto-accept vs manual accept:**
- **Manual accept** w MVP — owner widzi nowe zamówienie i klika "Przyjmij". Daje czas na sprawdzenie obciążenia, ewentualne odrzucenie (np. brak składnika).
- Auto-accept — kuszące dla high-volume, ale dla małej pizzerii **manual** = bezpieczniejsze (uniknie sytuacji "przyjęliśmy 8 pizz na 18:30 a mamy tylko jedną osobę").
- Możliwość włączenia auto-accept w `/admin/settings` jako toggle (opt-in).

**Czas na przyjęcie zamówienia:**
- Soft limit: 5 minut (klient czeka).
- Po 5 min nieprzyjęte: alert ESC w panelu owner ("⚠️ Zamówienie #X czeka 5 min na potwierdzenie") + dźwięk co minutę.
- Po 10 min: opcjonalny **auto-cancel** (konfigurowalne) → klient dostaje powiadomienie "Restauracja nie odpowiada — zamówienie anulowane" + zwrot środków.

**"Pauzowanie" przyjmowania bez zamykania restauracji:**
- W panelu: przycisk **"⏸ Wstrzymaj nowe zamówienia na X minut"** (presety 15/30/60 min lub custom).
- Klient widzi banner "Restauracja chwilowo nie przyjmuje zamówień. Wracamy za 30 min."
- Po wygaśnięciu czasu — auto-resume.

**Podział pozycji między stacje:**
**Pomijamy.** Mała pizzeria = jeden kucharz = brak stacji.

**Priorytetyzacja zamówień:**
- KDS sortuje karty po **najstarszej** (FIFO) — najdłużej czekające u góry.
- Wyjątek: pre-order (zaplanowane na konkretną godzinę) — pojawia się w KDS dopiero `target_time - prep_time` (np. 25 min przed dostawą).

**Tryb rush hour:**
**Pomijamy.** Mała pizzeria nie ma "rush" w sensie systemowym. Owner manualnie przedłuża ETA jeśli widzi, że jest dużo zamówień.

**Capacity limit:**
- **Tak — MVP-critical** dla małej pizzerii.
- Konfiguracja: max **N aktywnych zamówień** (CONFIRMED + IN_PREPARATION) jednocześnie. Default: 5.
- Po osiągnięciu: klient widzi "🔥 Duże obłożenie — czas dostawy ok. 60 min" zamiast standardowego ETA. Lub: blokada nowych zamówień + "Wracamy za 30 min".

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** ścieżka NEW → CONFIRMED → READY → OUT_FOR_DELIVERY → DELIVERED, manual accept, alert po 5 min nieprzyjęte, "Wstrzymaj nowe zamówienia" przycisk, capacity limit (max 5) z auto-extend ETA
- **Nice-to-have:** auto-accept opt-in toggle, auto-cancel po 10 min, status IN_PREPARATION (intermediate), pre-order delayed display
- **Post-MVP:** rush hour mode, podział stacji, ML-based ETA, smart sorting (priorytet według odległości dostawy)
- **Pomijamy:** AI predict capacity, dynamic pricing podczas rush, surge fees

---

### 19. ZARZĄDZANIE KURIERAMI

**Założenie projektu:** **1 kurier (pracownik) który łączy z pomocą w kuchni, BEZ GPS.**

**Lista kurierów (max 1–2):**
- Bardzo prosta sekcja `/admin/staff` lub kurier jako "user" w systemie.
- Pole "imię + telefon" — wystarczy.
- Status: dostępny/offline (toggle ręczny przez owner).

**Przypisywanie zamówienia do kuriera:**
- **Manual / domyślne**: jest 1 kurier — wszystkie zamówienia trafiają do niego automatycznie po `READY`.
- W panelu: lista zamówień READY z przyciskiem "Wydaj kurierowi" (przycisk obok zamówienia).

**Aplikacja kuriera:**
**POMIJAMY w MVP** — założenie projektu mówi że nie chcemy GPS. Zamiast aplikacji:
- **Kurier widzi zamówienia na tym samym tablecie kuchennym** (KDS pokazuje status READY = "do wzięcia").
- Albo: drukowany bon dostawczy (zawiera adres + telefon klienta).
- Po dostarczeniu kurier wraca, mówi "Dostarczyłem", owner klika "DELIVERED" w panelu.

**Co kurier potrzebuje:**
- **Wydruk bona dostawczego** (drukuje się przy `READY` jako duplikat dla kuriera) — adres + numer telefonu klienta + kwota gotówki.
- Kontakt do klienta — telefon klikalny `tel:` jeśli kurier ma smartfon.
- Nawigacja — link "Otwórz w Google Maps" na bonie (QR code) lub kurier zna miasto.

**Potwierdzenie odbioru z restauracji / wydania:**
- Owner klika **"Wyjechał kurier"** → status `OUT_FOR_DELIVERY` → klient widzi update.
- Klient otrzymuje email "Twoje zamówienie jest w drodze".

**Potwierdzenie dostawy:**
- **W MVP — owner klika "Dostarczone"** w panelu po powrocie kuriera (kurier mówi "Wszystko OK").
- **Post-MVP / Nice-to-have:** kurier ma własny prosty widok mobile `/courier/UUID` (link wysłany SMS-em) z listą "Twoje dostawy dziś" + przyciskiem "Dostarczyłem" przy każdym zamówieniu. Nie aplikacja — webview.
- Brak zdjęcia, brak PIN-u, brak podpisu — komplikacja niewarta dla małej pizzerii.

**Tracking kuriera w real-time:**
**POMIJAMY** (założenie: brak GPS).
- Klient nie widzi kuriera na mapie.
- W tracking page: tekst "Kurier z Twoim zamówieniem jest w drodze. Powinien dotrzeć ok. 18:45."

**Spóźniony kurier:**
- Brak auto-detekcji (brak GPS).
- Owner manualnie aktualizuje ETA jeśli wie że kurier się spóźnia.
- Klient widzi update: "Aktualizacja: dostawa ok. 19:00".

**Problem z dostawą:**
- Kurier wraca / dzwoni do owner: "Klient nie odbiera telefonu, nikt nie otwiera".
- Owner ręcznie zmienia status na `FAILED_DELIVERY` (post-MVP) lub po prostu kontaktuje się z klientem i ustala (call back, attempt 2).

**Rozliczenie z kurierami:**
**POMIJAMY w MVP.** Mała pizzeria — kurier to pracownik etatowy/zlecenie, rozliczenie miesięczne offline (Excel, papier).
**Post-MVP:** raport "Zamówienia kuriera X w okresie Y" (count + suma napiwków jeśli śledzimy).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** prosta sekcja kuriera (1 osoba), drukowany bon dostawczy, owner ręcznie zmienia statusy OUT_FOR_DELIVERY i DELIVERED, brak GPS, brak aplikacji kuriera
- **Nice-to-have:** webview kuriera `/courier/UUID` z listą i klikiem "Dostarczyłem", QR code do Google Maps na bonie, status FAILED_DELIVERY
- **Post-MVP:** aplikacja kuriera (mobile), GPS, raport rozliczeń, oceny kurierów, multi-kurier z auto-assignment
- **Pomijamy:** outsourcing (Glovo, Uber Eats integration), zdjęcia "package delivered", PIN od klienta, podpis cyfrowy

---

### 20. ZARZĄDZANIE STREFAMI DOSTAWY

**Definiowanie stref:**
**Dla małej pizzerii — najprostszy model: koło z promienia X km od adresu restauracji** + opcjonalnie **kody pocztowe** dla bardziej precyzyjnych wykluczeń.

Trzy podejścia:
- **Promień kołowy** (najprostszy) — jeden okrąg X km, np. 5 km. Wyklucza tylko skrajności (np. dzielnice za rzeką dalej niż mosty).
- **Lista kodów pocztowych** (kontekst PL) — dokładne. Np. "Dowozimy do: 00-001, 00-002, 00-100, 02-XXX".
- **Polygon na mapie** (zaawansowane) — Mapbox GL z drawing, ale komplikacja dla MVP.

**Polecam dla MVP:** **kody pocztowe + promień jako fallback**. Kod pocztowy 00-001 = w strefie, 02-100 = poza.

**Parametry per strefa:**
- Cena dostawy.
- Minimalna kwota zamówienia (może być różna).
- Szacowany czas dostawy (minuty).
- Aktywna/nieaktywna (toggle).

**Dla małej pizzerii — 1–3 strefy wystarczą:**
- Strefa 1 (centrum): 5 zł dostawa, min 30 zł, 25 min.
- Strefa 2 (rozszerzona): 8 zł dostawa, min 40 zł, 35 min.
- Strefa 3 (peryferia, opcjonalne): 12 zł dostawa, min 60 zł, 45 min.

**Dynamiczne wyłączenia:**
- Toggle "Wstrzymaj dostawę do strefy X" — temporary disable. Klient z tej strefy widzi "Aktualnie nie dowozimy do Twojej okolicy".
- Useful przy: deszcz, śnieg, kurier urlop, awaria auta.

**Weryfikacja adresu klienta:**
- W checkout — autocomplete Google Places przekazuje kod pocztowy.
- Backend mapuje kod → strefa.
- Sukces: pokazuje koszt dostawy + min zamówienia + ETA tej strefy.
- Fail: "Niestety, nie dowozimy pod ten adres. Możesz odebrać osobiście."

**Bezpłatna dostawa od kwoty:**
- Konfiguracja per strefa lub globalnie.
- Format: "Darmowa dostawa od 60 zł w strefie 1, od 80 zł w strefie 2".
- Komunikacja: pasek progresu w koszyku "Brakuje X zł do darmowej dostawy".

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** prosty system 1–3 stref opartych na kodach pocztowych, parametry per strefa (cena/min/czas), darmowa dostawa od X zł, wstrzymanie strefy ad-hoc
- **Nice-to-have:** mapa wizualizacji stref w panelu (markery kodów + okrąg promienia)
- **Post-MVP:** polygon editor, dynamiczna cena (np. +2 zł w deszcz), strefy harmonogramowane (po 22:00 mniejsza strefa)
- **Pomijamy:** integracja z Mapbox Boundaries API, AI-optimized zone shape, surge pricing

---

### 21. ZARZĄDZANIE DOSTĘPNOŚCIĄ I CZASEM

**Przełącznik "otwarte/zamknięte":**
- W top barze panelu: toggle z ikoną lampy / kolorem.
- **Zielona kropka + "Otwarte"** lub **czerwona kropka + "Zamknięte"**.
- Klik → confirm dialog "Czy na pewno zamknąć?" + opcjonalne pole "Powód (widoczny dla klienta)".
- Działa **natychmiastowo na stronie klienta** (klient widzi zmianę przy następnym fetch / WebSocket update).

**Powód zamknięcia (opcjonalne pole):**
- Tekst widoczny w bannerze: "Wrócimy o 18:00", "Dziś zamknięte z powodu remontu", "Otwarte tylko odbiór osobisty".

**Tryb przerwy:**
- Przycisk "⏸ Pauza na X minut" (w sekcji 18 omówiony).
- Presety: 15 / 30 / 60 / 120 min.
- Auto-otwieranie po wygaśnięciu czasu.
- Klient widzi "Restauracja na chwilę zajęta. Wracamy za 30 min."

**Godziny otwarcia:**
- W `/admin/settings/hours`:
- Per dzień tygodnia: checkbox aktywny + przedział godzinowy (od-do).
- Wiele przedziałów tego samego dnia (rzadko dla pizzerii, ale przydatne — np. lunch 11-15 + obiad 17-22).
- Wyjątki per data:
  - "Wprowadź wyjątek" → date picker + opcje: zamknięte / inne godziny / opis.
  - Lista wyjątków z możliwością edycji/usuwania.
  - Useful: święta (Wigilia, Wielkanoc), wakacje właściciela, prywatne eventy.

**Harmonogram sezonowy:**
- **Pomijamy w MVP** — komplikacja vs benefit. Wystarczą wyjątki per data.

**Capacity management:**
- W `/admin/settings/capacity`:
  - **Max aktywnych zamówień jednocześnie:** np. 5 (CONFIRMED + IN_PREPARATION + READY).
  - **Po osiągnięciu:** opcje:
    - "Auto-extend ETA o X min" (np. +20 min) — klienci widzą dłuższy czas, ale mogą dalej zamawiać.
    - "Blokuj nowe zamówienia" (pauza automatyczna).
- Banner dla klienta: "🔥 Duże obłożenie — czas dostawy 50–70 min" (zamiast standardowego ~35 min).

**Pre-order (zamówienia z wyprzedzeniem):**
- W checkout klient wybiera "Na konkretną godzinę" + time picker.
- Sloty co 30 min, od `now + 1h` do końca godzin otwarcia + następne 7 dni.
- W panelu admin pre-order zamówienia widoczne z **ikoną zegara** ⏰ + tekstem "Dostawa: 18:30 jutro".
- Zamówienie pojawia się w KDS dopiero `target_time - prep_time` (np. 25 min przed dostawą).
- **MVP-critical** dla pizzerii — często klienci zamawiają z wyprzedzeniem (np. na imprezę o 19:00).

**Automatyczne ETA:**
- W `/admin/settings/eta`:
  - **Globalny default:** np. 25 min.
  - **Per kategoria** (post-MVP): pizza 25 min, sałatki 10 min, desery 5 min. ETA = max(prep_times). Komplikacja.
  - **Override per zamówienie:** owner może wpisać niestandardowe ETA dla konkretnego zamówienia (np. "to akurat zajmie 45 min, jest skomplikowane").
- ETA = `prep_time + delivery_time` (gdzie delivery_time z konfiguracji strefy).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** toggle otwarte/zamknięte z powodem, godziny otwarcia per dzień + wyjątki per data, capacity limit z auto-extend ETA, pre-order z time picker, prosty globalny ETA (25 min default)
- **Nice-to-have:** "Pauza X minut" presets, banner "duże obłożenie"
- **Post-MVP:** ETA per kategoria, harmonogram sezonowy, smart prediction load
- **Pomijamy:** AI demand prediction, multi-region scheduling, dynamic capacity adjustment

---

### 22. PANEL ADMINA — NAWIGACJA I LAYOUT

**Architektura:**
- **Left sidebar stały (240–280px)** + **top bar (64px)** + content area.
- Sidebar może być collapsible do 64px (tylko ikony) na mniejszych ekranach.

**Pozycje w sidebar nav (z ikonami):**
1. 🏠 **Dashboard** — overview, KPI dziś, godziny szczytu (Owner only).
2. 🧾 **Zamówienia** — Live View, lista wszystkich zamówień. **Badge z liczbą nowych** ("3" — czerwone kółko).
3. 👨‍🍳 **KDS / Kuchnia** — full-screen widok kuchenny.
4. 🍕 **Menu** — kategorie, produkty, dodatki (Owner only).
5. 🛵 **Strefy dostawy** (Owner only).
6. ⚙️ **Ustawienia** (Owner only).
7. ❓ **Pomoc** — FAQ + kontakt do supportu.

**Top bar:**
- Lewa: logo restauracji (klik → Dashboard).
- Środek: **breadcrumb** ("Zamówienia / #B2025-0142") na desktopie.
- Prawa:
  - Toggle **"Otwarte/Zamknięte"** + zielona/czerwona kropka.
  - 🔔 **Notifications** (bell icon + badge) — dropdown z ostatnimi alertami.
  - **User menu** (avatar + imię) — dropdown: Profil / Wyloguj.

**Aktywny stan w nawigacji:**
- Link active: primary color background (subtelny tint) + bold + lewy border 3px primary.
- Hover: background neutral-100.

**Mobile admin:**
- **Responsive panel** w MVP (no native app).
- Sidebar staje się hamburger menu + drawer.
- Top bar w 56px wysokości.
- Większość widoków działa na mobile (zamówienia, KDS, dashboard).
- **Edycja menu na mobile — gorsze UX, ale działa.** Drag-and-drop może lagować.

**Login admina:**
- Strona `/admin/login` (publiczna).
- Logo restauracji + formularz: email + hasło + checkbox "Zostań zalogowany" + button "Zaloguj się".
- Link "Zapomniałem hasła" → email reset flow.
- 2FA — **post-MVP**.

**Powiadomienia w panelu:**
- 🔔 Bell icon w top bar.
- Dropdown z listą (max 10 ostatnich):
  - "🆕 Nowe zamówienie #B2025-0142 — 18:12"
  - "⚠️ Zamówienie #B2025-0141 czeka 6 min na potwierdzenie"
  - "❌ Klient anulował zamówienie #B2025-0140"
  - "💳 Płatność online niepowodzenie #B2025-0139"
- Klik na notification → przeniesienie do zamówienia.
- **Dźwięk** (krótki ding) przy nowym evencie + wibracja na mobile.
- **Browser push notifications** (post-MVP) — gdy panel w tle / przeglądarka zminimalizowana.
- Badge w favicon (np. czerwone kółko z liczbą nowych) — subtle alert.
- Badge w title taba: "(3) Pizzeria Bella - Admin" gdy są nieprzeczytane.

**Dark mode panelu:**
- **Post-MVP** — ale dla KDS w kuchni dark mode jest **MVP-critical** (sekcja 17).
- Reszta panelu: light mode wystarczy.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** sidebar nav z ikonami i badge'em zamówień, top bar z toggle otwarte/zamknięte i notifications bell, breadcrumb desktop, login email+password, dźwięk + favicon badge przy nowym zamówieniu
- **Nice-to-have:** collapsible sidebar, browser push notifications, "stay logged in", responsywność mobile
- **Post-MVP:** 2FA, dark mode całego panelu, native app, customizable dashboard
- **Pomijamy:** wirtualne tła, animowane mascotki, AI assistant w panelu

---

### 23. PANEL ADMINA — ZAMÓWIENIA (LIVE VIEW)

**Layout listy zamówień:**
- **Hybrid: Kanban kolumny po statusie + tabela szczegółowa per kolumna.**
- Domyślny widok: **3 kolumny Kanban** — "Nowe / Przyjęte" | "W przygotowaniu / Gotowe" | "W drodze / Dostarczone".
- Karta zamówienia w kolumnie: kompaktowa, klik otwiera szczegóły.
- Toggle "Widok tabeli" (alternatywa) — tabela z wszystkimi kolumnami.

**Kolumny w tabeli:**
| Kolumna | Szerokość | Zawartość |
|---|---|---|
| # | 100px | Numer zamówienia (#B2025-0142) |
| Godzina | 80px | "18:12" |
| Klient | 200px | "Jan K., 600 100 200" (pełne imię + nazw skrócone) |
| Pozycje | 200px | "2× Margherita, 1× Coca" (skrót, 2 linie ellipsis) |
| Kwota | 80px | "56,12 zł" bold |
| Typ | 80px | Ikona 🛵 / 🛍 |
| Status | 140px | Badge kolorowy |
| Czas oczek. | 100px | Timer (live) "08:34" + kolor |
| Akcje | 120px | Przyciski: Szczegóły / Następny status |

**Kolorystyka statusów:**
| Status | Kolor badge | Hex (light tint + text) |
|---|---|---|
| NEW | żółty | #FEF3C7 / #92400E |
| CONFIRMED | niebieski | #DBEAFE / #1E40AF |
| IN_PREPARATION | pomarańczowy | #FED7AA / #9A3412 |
| READY | zielony jasny | #BBF7D0 / #166534 |
| OUT_FOR_DELIVERY | zielony | #86EFAC / #14532D |
| DELIVERED | szary | #E5E7EB / #374151 |
| CANCELED | czerwony | #FECACA / #991B1B |

**Nowe zamówienie:**
- Dźwięk dzwonka (jak w sekcji 17) — **konfigurowalny**: typ dźwięku (3 opcje: dzwonek/gong/short beep), volume slider, mute toggle.
- Animacja: nowa karta wjeżdża z lewej + flash primary color przez 2s + lekki shake.
- **Browser tab title flash:** "🔴 1 NOWE — Pizzeria Bella" miga co 2s aż do przeczytania.
- **Favicon badge:** czerwone kółko z liczbą nowych.
- **Browser push notification** (jeśli zgoda): "Nowe zamówienie #B2025-0142 — 56,12 zł, dostawa".

**Autoodświeżanie:**
- **Polling co 5 sekund** — niska skala (max 50 zamówień / dzień, panel ma max 1–2 osób). WebSocket overkill.
- Indicator "Ostatnia aktualizacja: 18:32" w prawym górnym rogu listy.
- **Manual refresh button** — ikona 🔄 obok indykatora.

**Filtry listy:**
- Status: multi-select checkboxy w sidebar (NEW, CONFIRMED, IN_PREPARATION...).
- Data: domyślnie "Dzisiaj". Zakres dat (date picker).
- Typ: Dostawa / Odbiór / Wszystkie (segmented).
- **Search:** input "Szukaj po numerze, nazwisku lub telefonie" — debounce 300ms.

**Sortowanie:**
- Default: najnowsze (DESC po `created_at`).
- Toggle: "Najdłużej czekające" (ASC po `created_at` filtrowane po active statuses).

**Widok szczegółów zamówienia:**
- **Split view:** lista po lewej (40%) + szczegóły po prawej (60%) na desktopie.
- Mobile: pełna strona `/admin/orders/UUID`.
- **Pomijamy modal overlay** — split view lepszy, klient (admin) nie traci kontekstu listy.

**Sekcja klienta w szczegółach:**
- Imię + nazwisko: "Jan Kowalski".
- Telefon: klikalny `tel:600100200`.
- Email (jeśli jest): klikalny `mailto:`.
- Adres: pełen + miniaturka mapy (Google Maps embed lub link).
- **Historia zamówień:** "12 wcześniejszych zamówień" (klik → lista) — post-MVP.

**Sekcja pozycji w szczegółach:**
- Lista pełna ze wszystkimi detalami (warianty, dodatki, komentarze per pozycja).
- Cena jednostkowa + ilość + suma.
- Subtotal, dostawa, rabat, RAZEM.

**Sekcja płatności:**
- Metoda: "Gotówka przy odbiorze" / "BLIK (zapłacono)" / "Karta online (zapłacono)" / "Karta przy odbiorze".
- Status płatności: PAID / PENDING / FAILED (jeśli online).
- Reszta do wydania (jeśli gotówka): "Klient płaci 100 zł, reszta: 43,88 zł".

**Sekcja dostawy:**
- Przypisany kurier: "Marek (zaloguj się jako kurier)" lub "Brak".
- Status trackingu klienta (linkowy do strony klienta).

**Historia statusów:**
- Timeline pionowy:
  - "18:12 — Nowe (klient)"
  - "18:13 — Przyjęte (Anna, owner)"
  - "18:35 — Gotowe (Marek, kucharz)"
  - "18:38 — W drodze (Marek)"
- Kto + kiedy.

**Notatki wewnętrzne:**
- Pole textarea "Notatka wewnętrzna (niewidoczna dla klienta)".
- Useful: "Klient prosił o dzwonienie 5 razy", "Stały klient — dać extra napój gratis".

**Zmiana statusu:**
- Buttony **dla allowed transitions** (nie wszystkie naraz):
  - Z NEW: [Przyjmij] [Anuluj]
  - Z CONFIRMED: [W przygotowaniu] [Gotowe] [Anuluj]
  - Z IN_PREPARATION: [Gotowe] [Anuluj]
  - Z READY: [Wyjechał kurier] / [Wydano klientowi (odbiór)]
  - Z OUT_FOR_DELIVERY: [Dostarczono]
- **Przyciski wyróżnione:** "Następny status" — primary color, "Anuluj" — czerwony ghost.
- Anulowanie wymaga **wybranego powodu** (dropdown: brak składnika / problem techniczny / klient nieosiągalny / inne) + opcjonalny tekst.

**Ustawianie ETA:**
- Pole "ETA" w szczegółach.
- Input "+ X minut od teraz" (presety: 15 / 20 / 30 / 45 / 60).
- LUB time picker konkretnej godziny.
- Wyświetla się klientowi natychmiast.

**Drukowanie zamówienia:**
- Przycisk "🖨 Drukuj" w szczegółach.
- Format 80mm (jak w sekcji 17 KDS bon kuchenny).
- **Auto-print przy CONFIRMED** — opcjonalne, konfigurowalne w `/admin/settings/printer`.

**Anulowanie:**
- Przycisk "Anuluj zamówienie" — czerwony.
- Confirm modal: "Anulować zamówienie #B2025-0142?" + dropdown "Powód" + checkbox "Powiadom klienta" (default ✅).
- Jeśli płatność online → automatyczny refund (Przelewy24/PayU API call).
- Klient widzi w tracking status CANCELED + powód.

**Kontakt z klientem:**
- Telefon klikalny `tel:` (mobile zadzwoni, desktop może wymagać dialer aplikacji).
- SMS — w MVP **pomijamy** (wymaga integracji SMSAPI / Twilio).
- Email — `mailto:` link otwiera mail klienta admina.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** Kanban + tabela toggle, badge statusów, dźwięk + favicon flash przy NEW, polling 5s, filtry status/data/typ/search, split view szczegółów, allowed transitions buttons, anulowanie z powodem + auto-refund online, drukowanie bona, klikalny tel:
- **Nice-to-have:** historia zamówień klienta, notatki wewnętrzne, presets ETA, browser push notifications
- **Post-MVP:** WebSocket real-time, multi-select bulk actions, advanced filters (kwota, dzielnica), kolory custom dla statusów
- **Pomijamy:** AI fraud detection, voice commands, automatyczne odpowiedzi do klienta

---

### 24. LIVE VIEW — MAPA ZAMÓWIEŃ

**Czy jest mapa aktywnych zamówień?**
**POMIJAMY w MVP** (założenie: brak GPS). Mała pizzeria nie potrzebuje. Dodatkowo:
- Mapa wymaga API (Google Maps / Mapbox) — koszt.
- Bez GPS kuriera mapa pokazuje tylko adresy klientów (markery statyczne) — wartość niewielka.

**Co zamiast mapy:**
- Lista zamówień z adresem (już mamy).
- Klik adres → otwiera Google Maps w nowej karcie (link).

**Post-MVP:** prosta mapa z markerami klientów dla active orders (bez kuriera). Useful gdy pizzeria rośnie i kurier optymalizuje trasy.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** lista z adresami + klik → external Google Maps
- **Nice-to-have:** —
- **Post-MVP:** mapa z markerami zamówień (statyczne), strefy dostawy jako overlay
- **Pomijamy:** real-time GPS kurierów, clustering, heatmap, traffic overlay

---

### 25. DASHBOARD I ANALITYKA

**Metryki live na dashboardzie (top section):**
- Karty z dużymi liczbami:
  - 🆕 **Nowe (5 min):** 2
  - 👨‍🍳 **W przygotowaniu:** 5
  - ✅ **Gotowe do wydania:** 1
  - 🛵 **W drodze:** 3
  - 💰 **Przychód dziś:** 1842,50 zł
  - 📦 **Zamówień dziś:** 18

**Wykres dziś (godzinowy):**
- Bar chart "Zamówienia per godzina" (oś X: 11-22, oś Y: liczba zamówień).
- Recharts library (lekka, React friendly).
- Pokazuje godziny szczytu i puste przedziały — useful do planowania zmian.

**KPI (porównawczo):**
- "Dziś vs wczoraj vs tydzień temu" — 3 kolumny:
  - Przychód: 1842,50 zł (+12% vs wczoraj, +5% vs zeszły wt).
  - Liczba zamówień: 18 (+3 vs wczoraj).
  - Średnia wartość: 102,36 zł (-2 zł vs wczoraj).
  - Średni czas obsługi: 38 min (cel: <40 min).

**Top produkty (tydzień / miesiąc):**
- Lista TOP 10 produktów po liczbie zamówień.
- Bar chart horizontal lub tabela.

**Godziny szczytu:**
- **Heatmapa tygodniowa** (dzień × godzina) z kolorystyką — ciemniejsze = więcej zamówień.
- Useful dla planowania capacity i godzin otwarcia.

**Źródła zamówień:**
- Pie chart: Dostawa vs Odbiór (np. 70% / 30%).
- **Pomijamy "Na miejscu"** — single-site online ordering, dine-in się nie zarządza tutaj.

**Porzucone koszyki:**
- **Pomijamy w MVP** — wymaga emaila klienta (gość nie podaje przy browse) i conversion funnel tracking.
- **Post-MVP:** Google Analytics events (add_to_cart, begin_checkout, purchase) → conversion rate.

**Raporty:**
- Sekcja `/admin/reports` (Owner only).
- Zakres dat: date picker (od-do) + presety (Dziś / Wczoraj / Ostatnie 7 dni / Ten miesiąc / Poprzedni miesiąc).
- Raporty:
  - **Sales report:** suma przychodu, liczba zamówień, średnia wartość, breakdown per dzień.
  - **Top products:** ranking, ilości sprzedane, przychód per produkt.
  - **Delivery vs Pickup:** breakdown.
- **Eksport CSV** — primary action. PDF — post-MVP.

**Czas obsługi:**
- Średni czas: złożenie → CONFIRMED (responsiveness owner).
- Średni czas: CONFIRMED → READY (czas kuchni).
- Średni czas: READY → DELIVERED (czas dostawy).
- Średni czas: złożenie → DELIVERED (total).
- Useful do diagnostyki bottlenecków.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** dashboard z kartami metryk live, KPI dziś (przychód, liczba, średnia), bar chart godzinowy, sekcja Top produkty (tabela TOP 10)
- **Nice-to-have:** porównanie wczoraj/tydzień temu, heatmapa tygodniowa, eksport CSV, breakdown dostawa/odbiór
- **Post-MVP:** porzucone koszyki tracking, conversion funnel, GA integracja, predictive analytics
- **Pomijamy:** AI insights, custom dashboard builder, real-time sales ticker, PDF reports

---

### 26. ZARZĄDZANIE MENU W PANELU

**Struktura menu:**
- **Kategorie** (np. Pizza, Sałatki, Napoje, Desery)
- **Produkty** w kategorii (np. Margherita, Capricciosa)
- **Warianty** produktu (np. 30 cm / 40 cm / Family Size)
- **Grupy dodatków** (np. "Dodatkowe składniki", "Sosy") z items i regułami (single/multi, max N)
- **Dodatki/składniki** w grupie (np. dodatkowy ser +2,50 zł)

**Lista kategorii:**
- Sortowalna drag-and-drop (kolejność widoczna klientowi).
- Per kategoria: nazwa, ikona/emoji (opcjonalna), opis krótki, aktywna/nieaktywna toggle.
- Inline rename: klik na nazwę → input, Enter zapisuje.
- Akcje: edytuj / usuń / duplikuj.
- Dodanie nowej: przycisk "+ Nowa kategoria" → modal z polami.

**Lista produktów (w kategorii):**
- Tabela lub grid kart.
- Kolumny: zdjęcie 60×60 / nazwa / cena bazowa / status (aktywne/wyłączone) / akcje.
- Drag-and-drop sortowanie.
- Toggle "Aktywne" — szybki on/off bez wchodzenia w edycję (klient nie zobaczy wyłączonych).
- Akcje per produkt: edytuj / duplikuj / usuń / wyłącz na dziś.
- Search po nazwie produktu.
- Filtr per kategoria (jeśli widok wszystkie produkty).

**Edycja produktu (modal lub osobna strona):**
- Polecam **osobna strona `/admin/menu/products/UUID/edit`** — więcej miejsca, łatwiejsza nawigacja.
- Sekcje formularza:
  - **Podstawowe:**
    - Nazwa (max 100 znaków)
    - Opis (max 500 znaków, textarea)
    - Kategoria (dropdown)
    - Cena bazowa (input numeryczny + "zł")
  - **Zdjęcie:**
    - Upload area (drag-and-drop + click).
    - Format: JPG/PNG/WebP, max 5 MB, rekomendowane 1200×900 px (4:3).
    - Po uploadzie: preview + przycisk "Zmień" / "Usuń".
    - Backend: kompresja + WebP conversion + thumbnail generation (300×225 dla listy, 1200×900 dla modala).
    - Storage: S3 / CloudFlare R2 (taniej) lub własny serwer.
  - **Warianty (opcjonalne):**
    - Toggle "Ten produkt ma warianty" → pojawia się sekcja.
    - Lista wariantów drag-and-drop: nazwa + cena.
    - "Dodaj wariant" — przycisk.
    - Walidacja: nazwa unique w produkcie.
  - **Grupy dodatków (opcjonalne):**
    - Toggle "Ten produkt ma dodatki" → sekcja.
    - Lista grup: nazwa grupy + reguła (single/multi) + max liczba + wymagane.
    - Wewnątrz grupy: items (nazwa + cena dopłaty).
    - Drag-and-drop dla grup i items.
  - **Dostępność:**
    - Toggle "Aktywny" (widoczny dla klienta).
    - Toggle "Wyłącz na dziś" (resetuje się o północy).
    - **Dni tygodnia:** checkboxes "Dostępny w: pn/wt/.../nd". Default: wszystkie.
    - **Godziny dostępności:** od-do (np. desery tylko 18:00-22:00). Default: wszystkie godziny.
  - **SEO i tagi:**
    - Tagi: chips multi-select (Bestseller, Wege, Ostre, Bezglutenowe, Wegańskie, Nowość, Promocja).
    - Slug URL (auto-generowany, edytowalny): `margherita-30cm`.
  - **Alergeny:**
    - Multi-select z listy: gluten / laktoza / jajka / orzechy / soja / ryby / skorupiaki / seler / gorczyca / sezam / siarka / łubin / mięczaki.
    - Wyświetlane klientowi w modalu produktu.
  - **Wartości odżywcze (post-MVP):**
    - Pola: kalorie, białko, węglowodany, tłuszcz (per 100g i per porcja).
- Przycisk "Zapisz" (sticky bottom). Walidacja przy submit.

**Walidacja produktu:**
- Nazwa wymagana, max 100 znaków.
- Cena bazowa lub min wariant > 0.
- Jeśli ma warianty — przynajmniej 1 wariant.
- Jeśli grupa dodatków `single-required` — przynajmniej 1 item.

**Duplikowanie produktu:**
- Klik "Duplikuj" → kopia z nazwą "Margherita (kopia)" + status nieaktywny → otwiera edycję. Useful przy wielu wariacjach (Margherita XL, Margherita BBQ).

**Usuwanie produktu:**
- Confirm modal: "Usunąć **Margherita 30 cm**?".
- Soft delete (trzymamy w bazie z `deleted_at` ze względu na historię zamówień). Klient nie widzi.
- **Można przywrócić** w sekcji "Trash" (post-MVP).

**Wyłączanie na dziś (out of stock):**
- Toggle przy produkcie w liście: "Wyłącz na dziś" (np. brak składnika).
- Auto-reset o północy.
- Klient widzi greyscale + "Niedostępne dziś".

**Bulk edit:**
- Multi-select checkbox w tabeli + akcje: aktywuj / dezaktywuj / przenieś do innej kategorii / usuń.
- **Post-MVP** — komplikacja UI dla małej pizzerii niewarta.

**Import / Export menu:**
- Eksport: CSV / JSON z całego menu (do backupu lub migracji).
- Import: CSV → wgrywa kategorie, produkty, ceny.
- **Pomijamy w MVP** — pizzeria ma 30–80 produktów, doda ręcznie. Post-MVP useful przy migracji.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** kategorie z drag-and-drop sortowaniem, edycja produktu w osobnej stronie, upload zdjęcia + auto-WebP + thumbnail, warianty + grupy dodatków, toggle aktywne / wyłącz na dziś, alergeny multi-select, dni tygodnia dostępności, tagi (bestseller/wege/...)
- **Nice-to-have:** duplikowanie produktu, godziny dostępności per produkt, soft delete + trash
- **Post-MVP:** bulk edit, import/export CSV, wartości odżywcze, multi-language menu
- **Pomijamy:** AI generowanie opisów, automatyczne tłumaczenie zdjęć (image-to-text), nutritional auto-calc

---

### 27. USTAWIENIA RESTAURACJI

**`/admin/settings` — sekcje:**

**A. Profil restauracji:**
- Nazwa.
- Opis krótki (1–2 zdania, używane na landing i SEO).
- Logo (upload).
- Hero image (landing page background).
- Telefon, email kontaktowy.
- Adres restauracji.
- NIP / REGON (dla faktur).
- Social media URLs (FB, Instagram).

**B. Godziny otwarcia:**
- Per dzień tygodnia + wyjątki (sekcja 21).

**C. Dostawa:**
- Strefy dostawy (sekcja 20).
- Globalna minimalna kwota.
- Globalny próg darmowej dostawy.
- Default ETA (np. 25 min).
- Toggle "Akceptujemy odbiór osobisty".

**D. Płatności:**
- Toggle per metoda: Gotówka / Karta przy odbiorze / BLIK / Przelewy24 / PayU.
- Konfiguracja Przelewy24/PayU: API keys (input password masked).
- Test mode toggle.

**E. Branding (theme):**
- Primary color (color picker) — używany w CTA, badges, accents.
- Secondary color (opcjonalnie).
- Font family (lista 3–5 web fonts: Inter, Poppins, Roboto, ...).
- Background image landing.

**F. Powiadomienia:**
- Email kontaktowy (gdzie iść powiadomienia).
- Toggle dźwięków w panelu.
- Toggle browser push.
- Konfiguracja SMSAPI (post-MVP).

**G. Drukarka:**
- IP drukarki ESC/POS.
- Test print button.
- Toggle "Auto-print przy CONFIRMED".
- Liczba kopii (1 = tylko bon kuchenny, 2 = bon kuchenny + bon dostawczy).

**H. KDS:**
- Próg żółty (min) — default 10.
- Próg czerwony (min) — default 15.
- Dźwięk powiadomień (3 opcje, volume).

**I. Capacity:**
- Max aktywnych zamówień (default 5).
- Akcja po przekroczeniu: extend ETA / blokada.

**J. Integracje (opcjonalne):**
- Google Analytics ID (input).
- Facebook Pixel ID.
- Google Maps API key (do autocomplete).

**K. RODO i regulaminy:**
- URL polityki prywatności.
- URL regulaminu.
- Tekst zgody przy zamówieniu (custom).

**L. Domena:**
- Subdomena bella.app.com (default) lub custom domain (pizzeria-bella.pl) z instrukcją DNS.

**Save button:**
- Sticky bottom każdej sekcji.
- Walidacja per pole.
- Toast "Zapisano" po sukcesie.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** Profil + godziny + dostawa + płatności + drukarka + KDS + capacity + RODO links + domena
- **Nice-to-have:** branding (theme color), GA/FB Pixel, custom domain
- **Post-MVP:** advanced KDS settings, multi-language UI, A/B testing dashboards
- **Pomijamy:** white-label całkowity (osobna marka), advanced workflow rules

---

### 28. POWIADOMIENIA I ALERTY

**Typy zdarzeń wymagających powiadomień:**
- 🆕 Nowe zamówienie (do owner/staff).
- ⚠️ Zamówienie czeka 5+ min nieprzyjęte.
- ⚠️ Zamówienie 15+ min w przygotowaniu (timer czerwony w KDS).
- ❌ Klient anulował zamówienie.
- 💳 Płatność online niepowodzenie.
- 🌐 Drukarka offline / błąd.
- 📊 Daily summary (raport dzienny end-of-day).

**Kanały powiadomień:**
- **W panelu:** bell icon dropdown + toast notifications + dźwięk + favicon badge + tab title flash.
- **Browser push notifications** (post-MVP) — gdy panel zminimalizowany.
- **Email** — kluczowe alerty (anulowanie, płatność failed, daily summary).
- **SMS** (post-MVP) — gdy nowe zamówienie i nikt nie odpowiada przez 5 min.
- **Slack / Telegram bot** (post-MVP) — dla zaawansowanych użytkowników.

**Konfiguracja per kanał:**
- W `/admin/settings/notifications`:
  - Per typ zdarzenia: checkboxy "Panel / Email / Push / SMS".
  - Email recipient (default: owner email; opcjonalnie dodatkowi).
  - Cisza nocna: "Nie wysyłaj SMS-ów między 22:00 a 7:00" — toggle.

**Powiadomienia dla klienta (cross-reference):**
- Email po złożeniu (sekcja 8).
- Email przy zmianie statusu (opcjonalne, post-MVP).
- Email po DELIVERED z prośbą o ocenę (sekcja 10).
- SMS (post-MVP) — przy OUT_FOR_DELIVERY ("Twój kurier wyjechał, zadzwoni za 15 min").

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** w panelu (bell + toast + dźwięk + favicon + tab title), email do owner przy NEW i CANCEL, email do klienta po zamówieniu i ocena
- **Nice-to-have:** browser push panelu, daily summary email, konfiguracja per typ
- **Post-MVP:** SMS, Slack/Telegram bot, push notifications klienta, advanced rules
- **Pomijamy:** WhatsApp Business integration, voice call alerts

---

### 29. ONBOARDING I SETUP RESTAURACJI

**Pierwsze uruchomienie konta restauracji:**

**Wizard kroków (post-purchase / po założeniu konta):**
1. **Witaj!** Welcome screen z logo + "Zaczynamy konfigurację Twojej pizzerii — to zajmie ~15 min."
2. **Profil restauracji:** nazwa, telefon, email, adres, NIP. Logo upload.
3. **Godziny otwarcia:** szybki kreator pn-nd.
4. **Strefy dostawy:** prosta forma "Wprowadź kody pocztowe + cenę dostawy + min zamówienie + ETA". Można dodać 1–3 strefy.
5. **Pierwsze produkty:** szablon "Importujemy przykładowe menu pizzerii?" (10 popularnych pizz z domyślnymi cenami i opisami) — klient może edytować lub zacząć od zera.
6. **Płatności:** podłącz Przelewy24 / PayU (linki do założenia konta + wpisanie API keys).
7. **Drukarka (opcjonalne):** instrukcja podłączenia + IP test.
8. **Live!** "Twoja restauracja jest gotowa. Oto link do strony klienta: https://bella.app.com — udostępnij i zacznij przyjmować zamówienia!"

**Każdy krok:**
- Progress indicator (1/7, 2/7...).
- "Pomiń teraz" link (można dokonfigurować później w settings).
- "Dalej" przycisk (disabled gdy walidacja fail).
- "Wstecz" link.

**Sample data:**
- Po onboarding — toggle "Włącz tryb demo" — wstrzykuje 10 produktów + 5 zamówień testowych (w statusach), żeby admin mógł poklikać i nauczyć się.
- Tryb demo: banner "🧪 To są dane testowe — usuniesz je w dowolnym momencie".
- Akcja "Wyczyść dane testowe" w settings.

**Pomoc kontekstowa:**
- Tooltipy "?" przy złożonych polach (np. "Promień strefy dostawy: ?" → "Wskazuje obszar w którym kurier dowozi. Mierzy się od adresu Twojej restauracji.").
- Linki "Zobacz przykład" przy template'ach.
- Sekcja **`/admin/help`** — FAQ + tutorial videos (post-MVP).

**Pierwsze zamówienie testowe:**
- Tutorial "Złóż testowe zamówienie" — admin loguje się jako klient, składa zamówienie z koszyka, widzi pełen flow w panelu.
- Po zakończeniu — przycisk "Wyczyść testowe zamówienie + dane".

**Integracja drukarki:**
- Wizard step-by-step:
  1. "Podłącz drukarkę do tej samej sieci wifi co router restauracji."
  2. "Wpisz IP drukarki (zobacz na ekranie drukarki: Settings → Network)."
  3. "Test print" → drukarka drukuje testową stronę.
  4. ✅ "Działa! Drukarka skonfigurowana."

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** 7-krokowy wizard onboarding, profile + hours + zones + products + payments + (printer optional) + go-live, sample products import (10 popularnych pizz), test mode toggle
- **Nice-to-have:** tooltipy, video tutorials embed, "Złóż testowe zamówienie" walkthrough
- **Post-MVP:** onboarding analytics (gdzie użytkownicy odpadają), customer success outreach, AI-suggested settings na podstawie typu lokalu
- **Pomijamy:** live chat z onboardingu, gamification (achievements za skonfigurowanie)

---

### 30. MOBILE ADMIN PANEL

**Czy native app czy responsive web:**
**Responsive web** w MVP — wystarczy.
- Native app (iOS/Android) post-MVP — uzasadnienie: push notifications natywne, offline mode, lepszy KDS na tablecie. Ale komplikacja — 2 aplikacje (FE) do utrzymania.

**Co musi działać dobrze na mobile:**
- **Lista zamówień** — najczęściej używane na telefonie (właściciel poza restauracją sprawdza).
- **Notifications + dźwięk** — nowe zamówienie alert nawet gdy panel w tle.
- **Zmiana statusu** — single tap.
- **Kontakt z klientem** — `tel:` link dzwoni.

**Co działa gorzej na mobile (akceptujemy):**
- **Edycja menu** — drag-and-drop laguje na małym ekranie. Mówimy "edytuj menu na laptopie".
- **Raporty** — wykresy trudne do czytania. Eksport do CSV.
- **Onboarding** — wizard działa, ale lepiej na desktopie.

**KDS na tablecie:**
- 10–12" tablet stationary w kuchni. Browser fullscreen mode. Działa identycznie jak desktop KDS, ale dotyk zamiast klika.
- Touch targets 56–64px (większe niż na desktopie 44px).
- Brak hover states (mobile nie ma hover).

**PWA dla admina:**
- Manifest + Service Worker → admin może "zainstalować" panel jako aplikację (Add to home screen).
- Ikona na home screen, fullscreen mode.
- **Push notifications via PWA** — ograniczone na iOS (od iOS 16.4+ wymaga "Add to Home Screen" first), działa OK na Android.
- **Pomijamy w MVP**, post-MVP.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** responsive web admin, działająca lista zamówień + zmiana statusów + kontakt klienta na mobile, KDS na tablecie 10–12"
- **Nice-to-have:** PWA install dla admina, push notifications via PWA
- **Post-MVP:** native app iOS/Android, biometric auth (Face ID), offline mode pełny
- **Pomijamy:** Apple Watch app, Wear OS, iPad-specific layout (responsive wystarczy)

---

### 31. MULTI-LOCATION / FRANCHISE

**Założenie projektu:** **single-site MVP**. Multi-location pomijamy w pierwszej iteracji.

**Co to znaczy:**
- Jedna pizzeria = jedno konto = jedno menu = jedna domena.
- Brak "wybierz lokalizację" przy zamawianiu.
- Brak hierarchii "headquarter → branches".

**Czy planować architektonicznie?**
**TAK — przynajmniej w schemacie bazy danych.**
- Tabela `restaurants` z `id` zamiast hardcodowanego "default".
- Wszystkie tabele (orders, products, ...) z `restaurant_id` foreign key.
- Frontend: `restaurant_id` z subdomeny lub konfiguracji.
- Migracja na multi-location później bez breaking changes.

**Co zmieni się przy przejściu na multi-location (post-MVP):**
- Wybór lokalizacji na landing page.
- Strefy dostawy per lokalizacja.
- Menu master + per-location overrides.
- Centralized admin (HQ) + per-location admin.
- Multi-tenant authentication.
- Shared customer database lub per-location.
- Reporting cross-location.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** schema DB przygotowane na multi-location (`restaurant_id` w każdej tabeli), nawet gdy używamy tylko 1
- **Nice-to-have:** wybór subdomeny per restauracja jako preparation
- **Post-MVP:** pełen multi-location z HQ panel, master menu, cross-reporting
- **Pomijamy w MVP całkowicie:** location selector, multi-language per location, currency per location

---

### 32. FIZYCZNE ŚRODOWISKO RESTAURACJI

**QR code na stoliku (dine-in):**
**POMIJAMY DLA MAŁEJ PIZZERII** — single-site to typically takeaway/delivery.
- Dla restauracji z dine-in: QR → menu mobile + zamówienie do stolika. Wymaga numeracji stolików, status "płatność po posiłku", integracja z fiskalizacją. Komplikacja vs benefit dla małej pizzerii niewarta.
- **Post-MVP** dla pizzerii z miejscami siedzącymi.

**QR code na opakowaniu / ulotce:**
- Drukowany QR → link do menu / link do trackingu / link do oceny.
- Useful: **pomijamy w MVP**, ale przygotowane URL-e można już mieć.

**Tablet "kasy" przy drzwiach:**
- Jeśli pizzeria przyjmuje **walk-in orders** — tablet z dedicated wjazd `/admin/walk-in` gdzie staff szybko klika menu + adres = creates order.
- **Pomijamy w MVP** — focus na online ordering. Post-MVP.

**Ekran z numerkami (kolejka odbiorów):**
- Monitor w dining area: "Numerki gotowe: 142, 143, 144, 145" + numer w trakcie ("W trakcie: 146-148").
- Klient z odbiorem osobistym widzi swój numer — wie że gotowe.
- **Pomijamy w MVP**. Post-MVP.

**Lampka light na tabletach KDS:**
- Hardware: dioda LED USB sygnalizuje kucharzowi nowe zamówienie nawet gdy jest tyłem do ekranu.
- **Pomijamy** — overcomplication. Dźwięk wystarczy.

**Drukarka sieciowa LAN:**
- Spring Boot wysyła print job po IP do drukarki ESC/POS w kuchni.
- Spec drukarki: Epson TM-T20III LAN lub Star TSP143IIILAN — ~700–1100 zł.
- **MVP-critical** dla pizzerii z kuchnią (KDS może być fallback gdy drukarka offline, ale drukowany bon to wciąż złoty standard).

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** drukarka termiczna LAN ESC/POS dla bonów kuchennych
- **Nice-to-have:** QR code na ulotce → tracking link, numerki kolejki w widoku admina (bez dedykowanego ekranu)
- **Post-MVP:** dine-in QR menu, tablet kasy walk-in, ekran numerków, integracja z fiskalizacją (PL — fiskalizator hardware)
- **Pomijamy:** lampki LED, smart kuchnia (waga zintegrowana, kamery)

---

### 33. BEZPIECZEŃSTWO I COMPLIANCE

**Logi aktywności (audit log):**
- Tabela `audit_logs` z eventami:
  - Zmiana statusu zamówienia (kto, kiedy, z jakiego na jaki).
  - Anulowanie zamówienia + powód.
  - Edycja produktu (kto, co zmieniono — diff).
  - Login / logout.
  - Zmiana ustawień restauracji.
- Dostępne w `/admin/audit` (Owner only).
- Filtry: per user, per date, per event type.
- Retention: 1 rok, potem archiwizacja.

**Sesje:**
- JWT + refresh token.
- Refresh token w httpOnly secure cookie.
- Wygaśnięcie: 7 dni dla "stay logged in", 24h default.
- Multiple sessions (desktop + tablet kuchenny) — OK.
- Force logout from settings (post-MVP).

**Hasła:**
- Min 8 znaków + 1 cyfra + 1 znak specjalny.
- Hash: bcrypt (Spring Security default).
- Reset hasła przez email z one-time link (TTL 1h).
- 2FA — **post-MVP** (Google Authenticator TOTP).

**Brute-force protection:**
- Login: max 5 prób w 15 min, potem captcha lub lockout 30 min.
- Idempotency keys dla submit (anti-replay).

**RODO compliance:**
- Polityka prywatności widoczna na stronie i przy zamówieniu.
- Checkbox "Akceptuję regulamin i politykę prywatności" przy submit zamówienia (wymagany).
- Prawo do bycia zapomnianym: użytkownik może wysłać request → admin manualnie usuwa lub anonimizuje dane (post-MVP automatyzacja).
- Eksport danych klienta na życzenie (post-MVP automatyzacja, MVP — manualnie z bazy).
- Cookie consent banner (jeśli używamy GA/FB Pixel cookies analitycznych) — accept / decline.
- DPA z dostawcami (SendGrid, Przelewy24, Google Maps).

**Backup:**
- DB backup codzienny (automated, 30 dni retention).
- Backup do innej lokalizacji (S3 cross-region, Cloudflare R2).
- Test restore co kwartał.

**SSL/TLS:**
- HTTPS only. HTTP redirect 301 → HTTPS.
- HSTS header.
- Cert: Let's Encrypt (auto-renewal) lub Cloudflare.

**Wrażliwe dane w logach:**
- Numery telefonu, emaile — częściowe maskowanie w logach (np. `j***@gmail.com`, `+48 *** 100 200`).
- Nigdy nie logujemy haseł, tokenów, kart.

**SQL injection:**
- Spring Boot Hibernate / JPA — parametryzowane queries by default. **Nigdy** raw SQL z user input.

**XSS:**
- React domyślnie escapuje. Uwaga na `dangerouslySetInnerHTML` — używać tylko z sanitized HTML (DOMPurify).
- Content Security Policy (CSP) header.

**CSRF:**
- SameSite cookie + CSRF token dla mutating requests.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** JWT + refresh token + bcrypt, login brute-force protection, idempotency keys, RODO checkbox + privacy policy, HTTPS + HSTS, DB backup codzienny + restore test, audit log podstawowy (status changes + login)
- **Nice-to-have:** rate limiting per IP, CSP header, masked logs, "force logout all sessions"
- **Post-MVP:** 2FA TOTP, cookie consent banner pełny, automatyczny eksport danych klienta, audit log retention/archive, penetration testing
- **Pomijamy:** PCI DSS Level 1 (używamy gateway zamiast trzymać karty), SOC 2 Type II (przesada dla małej pizzerii)

---

## CZĘŚĆ III — CROSS-CUTTING

### 34. DESIGN SYSTEM I UI KIT

**Filozofia design system:**
- **Konsystencja** — te same komponenty w całej aplikacji (klient + admin).
- **Modularność** — zmieniam Button raz, propaguje się wszędzie.
- **Theming** — tokens (kolor, typografia, spacing) konfigurowalne per restauracja.

**Kolory (przykład dla pizzerii):**

**Brand:**
- Primary: `#D62828` (czerwony pizzy) — CTA, badges, accents.
- Primary dark: `#A11F1F` — hover.
- Primary light: `#F1A8A8` — backgrounds tint.

**Status:**
- Success: `#16A34A` — DELIVERED, success toasts.
- Warning: `#F59E0B` — IN_PREPARATION, alerts.
- Danger: `#DC2626` — CANCELED, error.
- Info: `#2563EB` — CONFIRMED, info toasts.

**Neutral (Tailwind gray scale):**
- Neutral-50: `#FAFAFA` — backgrounds.
- Neutral-100: `#F5F5F5` — disabled.
- Neutral-200: `#E5E5E5` — borders.
- Neutral-400: `#A3A3A3` — placeholders.
- Neutral-600: `#525252` — secondary text.
- Neutral-700: `#404040` — primary text dim.
- Neutral-900: `#171717` — primary text.

**Typografia:**
- Font family primary: **Inter** (Google Fonts, świetna czytelność, polskie znaki).
- Font family heading (opcjonalnie): **Poppins** lub **Inter Bold**.
- Skalowanie:
  - Display (h1): 48px / 56px line-height / 700 weight.
  - Heading 1 (h2): 32px / 40px / 700.
  - Heading 2 (h3): 24px / 32px / 600.
  - Heading 3 (h4): 20px / 28px / 600.
  - Body large: 18px / 28px / 400.
  - Body: 16px / 24px / 400.
  - Body small: 14px / 20px / 400.
  - Caption: 12px / 16px / 500.

**Spacing scale:**
- 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 px (Tailwind: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24).

**Border radius:**
- None: 0
- Small: 4px (badges, chips).
- Medium: 8px (buttons, cards).
- Large: 12px (modals, large cards).
- XL: 16px (bottom sheets, hero).
- Full: 9999px (avatars, FAB).

**Shadows:**
- xs: `0 1px 2px rgba(0,0,0,0.05)` — borders subtle.
- sm: `0 2px 8px rgba(0,0,0,0.08)` — cards default.
- md: `0 4px 12px rgba(0,0,0,0.1)` — cards hover, dropdowns.
- lg: `0 8px 24px rgba(0,0,0,0.12)` — modals, popovers.
- xl: `0 24px 48px rgba(0,0,0,0.16)` — modals desktop.

**Komponenty (lista core):**
- Button (primary / secondary / ghost / danger / sizes sm/md/lg).
- Input / Textarea / Select / Checkbox / Radio.
- Card.
- Modal / Drawer / Bottom Sheet.
- Toast / Alert / Banner.
- Badge / Chip / Tag.
- Avatar.
- Stepper (qty -N+).
- Progress bar.
- Skeleton.
- Spinner.
- Table.
- Tabs / Segmented control.
- Tooltip / Popover.
- DatePicker / TimePicker.
- Empty state.

**Library polecana:**
- **shadcn/ui** (kopiuj-paste komponenty Tailwind + Radix UI primitives) — flexible, owned, no lock-in. **Polecane.**
- **Material UI / MUI** — duża, ale opinionated. Jeśli zespół zna — OK.
- **Chakra UI** — średnia.
- **Ant Design** — głównie do enterprise dashboards, mniej dla consumer-facing.

**Ikony:**
- **Lucide React** (~1000 ikon, lekkie, MIT, świetnie z React) — **polecane**.
- Heroicons (Tailwind autorzy) — fewer ale jakościowe.

**Animacje:**
- **Framer Motion** dla skomplikowanych (modals, drag, layout shifts).
- CSS transitions dla prostych (hover, focus).

**Storybook (post-MVP):**
- Każdy komponent z wariantami w Storybooku — dokumentacja + visual regression testing.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** Tailwind + shadcn/ui + Lucide ikony + Framer Motion, design tokens (kolor + spacing + typography), core komponenty (button, input, modal, toast, card)
- **Nice-to-have:** custom branding per restauracja (theme color), dark mode dla KDS
- **Post-MVP:** Storybook, visual regression tests, library opublikowana w npm
- **Pomijamy:** custom font autorski, advanced motion choreography, design system website

---

### 35. ARCHITEKTURA INFORMACJI I NAVIGATION

**Sitemap klienta:**
```
/                          (Landing — hero, info, mapa)
/menu                      (Pełne menu — alternatywa do /)
/cart                      (Koszyk fullscreen — opcjonalne, większość ma sidebar)
/checkout                  (Checkout)
/order/{uuid}/confirmation (Po złożeniu)
/track/{uuid}              (Tracking)
/about                     (O nas — opcjonalne)
/contact                   (Kontakt)
/privacy                   (Polityka prywatności)
/terms                     (Regulamin)
/404                       (Nie znaleziono)
/500                       (Błąd serwera)
```

**Sitemap admina:**
```
/admin/login
/admin/                    (Dashboard)
/admin/orders              (Live View)
/admin/orders/{uuid}       (Szczegóły zamówienia)
/admin/kds                 (KDS pełnoekranowy)
/admin/menu                (Lista kategorii)
/admin/menu/categories/{uuid}
/admin/menu/products       (Lista produktów)
/admin/menu/products/{uuid}/edit
/admin/zones               (Strefy dostawy)
/admin/settings            (Settings tabs)
/admin/audit               (Audit log)
/admin/help                (FAQ)
```

**Deep linki:**
- Każda kategoria menu jako anchor (`/menu#pizza`).
- Tracking page bookmarkowalny (`/track/UUID`).
- Filter koszyka via query string (post-MVP).

**Breadcrumbs:**
- W panelu admina: "Zamówienia > #B2025-0142".
- Klient: rzadko potrzebne (płaski IA), pomijamy.

**404 page:**
- Ilustracja + "Nie znaleźliśmy tej strony 🍕".
- CTA "Wróć do menu".

**500 page:**
- "Coś poszło nie tak. Spróbuj odświeżyć za chwilę."
- Link do telefonu kontaktowego restauracji.

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** sitemap klienta + admina, deep linki kategorii (#hash), tracking bookmarkowalny, 404/500 pages
- **Nice-to-have:** breadcrumbs admin, sitemap.xml dla SEO
- **Post-MVP:** filter via query string, paginacja URL-owa
- **Pomijamy:** wielowarstwowa nawigacja, hierarchiczne kategorie (sub-cats)

---

### 36. INTEGRACJE ZEWNĘTRZNE

**Mapa i geocoding:**
- **Google Maps Platform** — najbardziej accurate dla PL. Cena: 200$/miesiąc free credit, potem $5/1000 autocomplete requests, $7/1000 geocoding. Dla małej pizzerii (50 zamówień/dzień × 30 = 1500 req/m) — typically w darmowym tier.
- **Mapbox** — tańsze przy skali, ale gorsze dla PL adresów.
- **Polecam:** **Google Places Autocomplete** + **Geocoding API** dla MVP, monitoring kosztów.

**SMS:**
- **SMSAPI.pl** (PL provider, dobry rate, ~0.10 zł/SMS).
- **Twilio** — globalnie OK, drożej w PL (~0.15-0.20 zł/SMS).
- **MessageBird** — średnio.
- **Polecam:** **SMSAPI.pl** dla PL pizzerii. Pomijamy w MVP, post-MVP.

**Email:**
- **SendGrid** — 100 darmowych emaili dziennie, potem $19.95 / 50k miesięcznie.
- **Mailgun** — 5000 darmowych pierwsze 3 miesiące, potem ~$35 / 50k.
- **AWS SES** — najtańsze ($0.10/1000), ale komplikacja deliverability i template management.
- **Resend** — nowy gracz, świetny developer experience, $20/100k.
- **Polecam:** **SendGrid** lub **Resend** dla MVP. Łatwa integracja Spring Boot.

**Płatności online:**
- **Przelewy24** — 91% recognisability w PL, 165 banków, BLIK + cards + bank transfer. Setup: weryfikacja transferu 1.50 zł, fee per transaction (varies).
- **PayU** — setup 199 zł, ~2.3% + 30-35 gr per transaction.
- **Tpay** — setup 10 zł, 1.59% per transaction.
- **Stripe** — globalnie świetny, w PL obsługuje BLIK i Przelewy24, ~2.9% + 1 zł.
- **Polecam:** **Przelewy24** (recognizability + BLIK native) dla MVP. Dodatkowo można dodać **PayU** jako alternative.
- Integracja: REST API + webhook dla payment status updates. Spring Boot client biblioteki dostępne.

**Drukarki termiczne:**
- **Epson TM-T20III** (~700 zł, USB lub Ethernet) — sprawdzony.
- **Star TSP143III** (~900 zł, LAN/USB/Bluetooth) — premium.
- **Bixolon SRP-Q300** — średnia półka.
- Protokół: **ESC/POS** — uniwersalny, biblioteki Java dostępne (`escpos-coffee`).
- Połączenie: **Ethernet** preferred (stabilniejsze niż USB w restauracji).

**Analityka:**
- **Google Analytics 4** — free, standard.
- **Meta Pixel (Facebook)** — dla Facebook Ads.
- **Hotjar** — heatmapy, recordings (post-MVP).
- **Plausible / Fathom** — privacy-friendly analytics, paid (~$9/m).

**CDN i hosting:**
- **Cloudflare** — free tier solid, CDN + DNS + SSL.
- **Vercel / Netlify** — dla frontend (Next.js / SPA).
- **Backend:** **Railway / Render / Fly.io** — proste deploymenty Spring Boot.
- **DB:** **PostgreSQL** managed (Supabase / Neon / Railway).
- **Storage:** **Cloudflare R2** (taniej niż S3) lub **AWS S3**.

**Płatność na miejscu (POS):**
- Terminal kart przy odbiorze — kurier ma terminal mobilny.
- **eService**, **Polcard**, **mPOS Tap on Phone** — różne opcje. Niezwiązane z naszym systemem; pizzeria sama wybiera.

**Search engine optimization:**
- **Google Search Console** — monitoring indexing.
- **Bing Webmaster** — opcjonalnie.
- **Schema.org Restaurant markup** — krytyczny.

**Logowanie zewnętrzne:**
- Google OAuth — dla admin login (post-MVP).
- Facebook Login — dla klientów (post-MVP, RODO complications).
- **Pomijamy w MVP.**

**Fiskalizacja PL:**
- **Pomijamy w MVP.** PL prawnie wymaga fiskalizacji dla restauracji powyżej pewnego progu. Online ordering bez fiskalizatora — szara strefa, ale fiskalizator hardware (np. Posnet, Elzab) integruje się przez COM port lub TCP.
- **Post-MVP** — biblioteki fiskalne dla Spring Boot (np. Java POS Print).

**Faktury VAT:**
- Generator PDF (iText / Apache PDFBox).
- Numeracja zgodna z PL (np. FA/2025/001/B).
- **Post-MVP.**

**REKOMENDACJA DLA NAS:**
- **MVP-critical:** Google Maps Platform (autocomplete + geocoding), SendGrid/Resend dla emaili, Przelewy24 dla płatności online, drukarka Epson TM-T20III LAN, Cloudflare CDN+DNS, PostgreSQL managed, Spring Boot backend hosting (Railway/Render), Google Analytics 4, Schema.org Restaurant
- **Nice-to-have:** PayU jako alternative payment, Hotjar dla UX research, własna domena
- **Post-MVP:** SMSAPI dla SMS, fiskalizacja, faktury VAT auto-generowane, Google OAuth admin, Plausible (privacy-friendly analytics)
- **Pomijamy:** Stripe (overkill w PL), advanced ML (Algolia search, AI chatbots), Twilio (drożej niż SMSAPI w PL)

---

## PODSUMOWANIE PRIORYTETÓW MVP

### Co MUSI być w pierwszej wersji (MVP-critical):

**Strona klienta:**
- Landing z hero + paskiem informacji + bannerem zamknięte
- Menu 3-kolumnowe desktop / sticky tabs mobile + scroll-spy + search
- Karta produktu z lazy loading + LQIP + przyciskiem +
- Modal produktu z wariantami + dodatkami + komentarzem + dynamiczną ceną na CTA
- Koszyk: sticky sidebar desktop + floating bar mobile + bottom sheet drawer
- Checkout one-page z autocomplete adresu + walidacją + płatnościami (Gotówka + BLIK + Przelewy24)
- Strona potwierdzenia z ETA i CTA "Śledź zamówienie"
- Tracking page z 6 statusami + polling 15s + ETA + telefon do restauracji
- Email potwierdzający i prośba o ocenę 15 min po DELIVERED
- 1–5 gwiazdek per zamówienie

**Panel admina:**
- 2 role (Owner + Staff) + login + PIN dla KDS
- Live View z Kanban/tabelą + dźwięk + favicon flash przy NEW
- Szczegóły zamówienia z allowed transitions + anulowanie z auto-refund
- KDS prosty grid kart + timer 3-kolorowy + przycisk GOTOWE + dźwięk
- Drukarka ESC/POS LAN auto-print przy CONFIRMED
- Manual accept zamówień + "Wstrzymaj X minut" + capacity limit
- Edycja menu: kategorie + produkty + warianty + dodatki + alergeny
- Strefy dostawy oparte na kodach pocztowych
- Godziny otwarcia + wyjątki + toggle otwarte/zamknięte z powodem
- Dashboard z metrykami live + KPI dziś + bar chart godzinowy
- Onboarding wizard 7-krokowy
- Settings: profil + godziny + dostawa + płatności + drukarka + KDS + capacity
- RODO checkbox + privacy policy + audit log podstawowy

**Cross-cutting:**
- Design system: Tailwind + shadcn/ui + Lucide
- Sitemap + 404/500 + deep linki
- Integracje: Google Maps + SendGrid + Przelewy24 + Cloudflare + Postgres
- Security: HTTPS + JWT + bcrypt + idempotency + DB backup

### Co odpada przy małej skali:

**Pomijamy:**
- GPS kuriera + mapa real-time
- Multi-station KDS
- Aplikacja kuriera natywna
- Multi-location
- Native apps (iOS/Android)
- 2FA, SOC 2, PCI Level 1
- AI prediction, ML, voice control
- Advanced loyalty, gamification, social features
- Multi-language, multi-currency
- Dine-in QR menu, walk-in tablet, kitchen lights
- Stripe (Przelewy24 wystarczy w PL)

### Filozofia projektu:

> **Mała pizzeria nie potrzebuje narzędzi enterprise. Potrzebuje narzędzia które robi 5 rzeczy świetnie zamiast 50 rzeczy źle.**

Najczęstszy błąd to budowanie "wszystkiego co Pyszne ma" dla klienta który ma 30 zamówień dziennie. Strona ma być:
- **Szybka** (LCP < 2.5s)
- **Prosta** (klient zamawia w 90 sekund)
- **Niezawodna** (drukarka działa, polling nie zawiesza, płatności idą)
- **Tania w utrzymaniu** (jeden dev OK, brak 5 microservices)

Każda kolejna funkcja to długi techniczny dług. **Mów "nie" agresywnie.**

---

**Koniec dokumentu.**
