# VISUAL_DIRECTION.md — Confident Local

> **To jest kierunek wizualny** dla redesignu Fazy 5. Czytasz to razem
> z `DESIGN_BRIEF.md` (funkcjonalny scope, ekrany, settings).
>
> **Brief mówi CO.** Ten dokument mówi **JAK to ma się czuć i JAKIE
> palety, fonty, dyscypliny stosujesz.** Konkretne kompozycje (gdzie
> stoi co, ile px paddingu, jaki layout hero) — Twoja decyzja jako
> designera. Operator nie chce mikrozarządzać.

---

## 1. Mood w jednym zdaniu

> **Pizzeria osiedlowa, ale strona wygląda jakby zrobił ją ktoś, kto
> się zna.**

Nie udajemy włoskiej trattorii. Nie udajemy fine diningu. Nie udajemy
streetwear brandu. **Polska pizzeria osiedlowa robiąca tłustą pizzę na
grubym cieście, kurczaki, zapiekanki, piwo Lech 0,5 l za 8 zł** — i to
jest atut, nie wstydliwy fakt.

Premium nie znaczy "luksusowy". Znaczy **"ktoś tu pomyślał."**
Przeciwieństwem premium nie jest "tanio" — przeciwieństwem premium
jest **"olał i wkleił template."**

## 2. Kim jest klient (real talk)

**Pani Kasia (właścicielka):** 45–55 lat, Łomianki / Nowy Dwór
Mazowiecki / Pruszków / Mińsk Mazowiecki (template skaluje się na
podobne miasteczka 10–50 tys. mieszkańców pod Warszawą). Prowadzi
pizzerię z mężem i jednym kierowcą. 30–60 zamówień dziennie, peak
wieczorem 18–22, w piątki/soboty +50%. Klienci — głównie regularni.

**Klient strony publicznej:** rodzice z dziećmi, młode pary, ludzie po
pracy, osoba zamawiająca piwo z pizzą o 22:30 w środę. **Wiek 25–60,
przewaga 30–45.** Kupują regularnie. Lojalnie. **Nie szukają
"culinary experience".** Szukają **dobrej pizzy szybko i bez
bullshitu.**

**Co widzą codziennie:** Pyszne.pl (agresywne pomarańcz + krzyczące
oferty), Glovo (żółte kafelki, multiplatforma), strona Da Grasso
(generic), strona lokalnej konkurencji w Wixie (pełen tandety zoo —
gradient żółty-pomarańczowy, comic sans w logo, zdjęcia z lampą
błyskową, "Zapraszamy serdecznie!").

**Twój job:** zrobić stronę która **wygląda jak coś z innego świata**
w porównaniu do tej tandety, ale **klient z Łomianek dalej rozumie że
to pizzeria** w 2 sekundy. Ma się poczuć "o kurwa, to jest **inne**, ale
**dobre inne**, nie hipsterskie inne".

## 3. Dyscyplina: czego NIE robimy

To jest jedyna twarda lista zakazów. Wszystko inne — Twoja decyzja.

### Zakazane efekty wizualne

- ❌ **Gradienty** (background, button, text — **żadne**). Płaskie kolory.
  Wyjątek: subtelne shadow ramps na zdjęciach jedzenia (overlay dla
  czytelności tekstu na nim) — to nie gradient, to overlay
- ❌ **Drop shadows na kartach** (poza modal/sheet `lg`). Karty
  produktów, kategorie, KPI tiles — **bez shadow**. Hierarchia przez
  ramki 1–1.5 px i tło, nie przez floating effect
- ❌ **Glow / neon / blur effects** — żadne `box-shadow: 0 0 40px
  primary`. Ramy się dyscyplinujemy
- ❌ **Particle effects, fly-to-cart arc, parallax, scroll-triggered
  motion graphics** — drażni mobile, słabe urządzenia, baby boomers
- ❌ **Animacje powyżej 300 ms** — wszystko 120/180/260, koniec
- ❌ **Hover effects "wow"** — translateY(-2px) + lekka zmiana ramki
  to maks. Bez 3D rotation, bez tilt, bez magnetic cursors
- ❌ **Custom cursors** — domyślny pointer, koniec. To jest pizzeria, nie
  portfolio agencji designerskiej z Wrocławia
- ❌ **Skeumorfizm** (tekstury drewna, papieru, kredy, kartonu pizzy) —
  to jest 2026, nie 2012
- ❌ **Stock illustrations** w stylu "płaski człowieczek w Memphis-style
  trzyma pizzę" — żadne ilustracje, **tylko zdjęcia jedzenia +
  typografia**
- ❌ **Comic Sans, Pacifico, Lobster, Brush Script** — i każda inna
  "wesoła" czcionka

### Zakazane decyzje kolorystyczne

- ❌ **Gradient żółty → pomarańczowy** (signature DNA polskich
  pizzerii w Wixie, wzbudza alergię)
- ❌ **Czerwony krzyczący `#FF0000` / `#FF1A1A`** — wygląda jak alarm
- ❌ **Comic-style primary** w stylu Pyszne (`#FF8000`)
- ❌ **Więcej niż 3 kolory marki** — primary, neutral, jeden akcent.
  Koniec
- ❌ **Brand color jako tło dużych obszarów** (pełnoekranowy czerwony
  hero) — punktowo na CTA, badge, akcenty

### Zakazane decyzje tekstowe

- ❌ **"Zapraszamy serdecznie do naszej rodzinnej pizzerii"** — żadnych
  formalnych powitań
- ❌ **"Najlepsza pizza w mieście"** — slogan-trupy. Klient już to czytał
  300 razy
- ❌ **"Tradycja włoskich smaków"** — kłamstwo, robisz pizzę na grubym
  cieście dla osiedla, nie pizzę napoletańską z certyfikatem AVPN
- ❌ **Wykrzykniki w copy** ("Zamów już teraz!", "Smacznego!!!") — co
  najwyżej 1 wykrzyknik na 2 ekrany, oszczędnie
- ❌ **CAPS LOCK w tekście** poza krótkimi labelami (kicker uppercase
  10–12 px to OK, **nigdy** całe nagłówki)

## 4. Paleta kolorów

**Trzymaj się tej palety.** Możesz minimalnie przesuwać hex (±5 % na
hue/saturation jeśli widzisz uzasadnienie), ale nie zmieniaj rodziny.

### Brand

| Token | Hex | Użycie |
|---|---|---|
| `primary` | `#E63946` | CTA, badge'y bestseller, hover state, focus ring, brand accent (kropka po `dowóz.` w hero) |
| `primary-hover` | `#D62937` | hover/active na primary buttonach |
| `primary-tint` | `#FCEEEF` | tinted backgrounds (selected radio cards w modalu produktu, banner bestseller) |

**Czerwony pomidorowy.** Ciepły, dorosły, kojarzy się z sosem
pomidorowym a nie alarmem. Nie krzyczy. **Nie jest pomarańczowy** —
unikamy DNA Pyszne. Nie jest też burgundowy/wino — to nie fine dining.

### Neutrale (warm slate)

| Token | Hex | Użycie |
|---|---|---|
| `bg-page` | `#FAFAF8` | tło strony — off-white, lekko ciepłe (nie sterylna biel) |
| `bg-card` | `#FFFFFF` | tło kart produktów, koszyka, modali |
| `bg-section` | `#F5F2EA` | tło sekcji "O nas", "Godziny" — delikatne wyróżnienie |
| `bg-dark` | `#1A1A1A` | info-bar pod hero, footer, primary CTA tekst, kontrastowe akcenty |
| `border-subtle` | `#EDE9DF` | separatory między sekcjami, obramowanie kategorii |
| `border-card` | `#E5E1D6` | ramki kart produktów (1–1.5 px) |
| `text-primary` | `#1A1A1A` | nagłówki, treść główna |
| `text-body` | `#4A4A45` | body, opisy produktów |
| `text-muted` | `#6B6B66` | labels, captions, kicker text |
| `text-faint` | `#A8A59C` | placeholdery, disabled |

**Off-white tła zamiast sterylnej bieli** to single ważna decyzja
estetyczna. `#FAFAF8` z mikroskopijnym ciepłem (warm slate ramp) —
strona nie wygląda sterylnie jak panel admina SaaS, ale dalej jest
**czysta**.

### Statusy zamówień (admin operations)

Zostają jak w v1 / Faza 4.5 — to jest wytrenowany muscle memory Pani
Kasi:

| Status | Hex (border-l) | Tinted bg | Użycie |
|---|---|---|---|
| NEW | `#F59E0B` (amber) | `#FEF3C7` | nowe zamówienie, wymaga akcji |
| CONFIRMED | `#3B82F6` (blue) | `#DBEAFE` | przyjęte przez admina |
| IN_PREPARATION | `#E63946` (primary) | `#FCEEEF` | w kuchni — tu primary brand |
| READY | `#10B981` (emerald) | `#D1FAE5` | gotowe do wydania/wysyłki |
| OUT_FOR_DELIVERY | `#6366F1` (indigo) | `#E0E7FF` | w drodze |
| DELIVERED | `#6B7280` (slate) | `#F3F4F6` | terminalny success |
| CANCELED | `#DC2626` (red) | `#FEE2E2` | terminalny cancel |

### Akcent (oszczędnie)

| Token | Hex | Użycie |
|---|---|---|
| `accent-yellow` | `#F4A261` | badge "Promocja", "Nowość" — ciepły musztardowy. **Nie żółty bawarski.** Używaj rzadko |

To jedyny dodatkowy kolor. Zielony / niebieski / fioletowy nie
istnieją poza statusami zamówień.

## 5. Typografia

**Tylko Inter.** Bez display'a serifowego. Polska pizzeria osiedlowa
nie potrzebuje Frauncesa — to byłoby pretensjonalne.

```
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Użyj wszystkich wag** od 400 do 900. Charakter buduje się przez
**brutalny kontrast wagi** między hero (800/900) a body (400), nie
przez różne fonty.

### Skala (mobile / desktop)

| Token | Mobile | Desktop | Weight | Letter-spacing | Użycie |
|---|---|---|---|---|---|
| `display` | 44 px | 64–72 px | **900** | -0.035em (tight) | Hero `h1`, **bardzo zaciśnięty** |
| `h1` | 32 px | 40 px | 800 | -0.025em | Page title, sekcja landing |
| `h2` | 24 px | 28 px | 700 | -0.02em | Subsection, modal title |
| `h3` | 18 px | 20 px | 700 | -0.015em | Card title (produkt, kategoria) |
| `body-lg` | 16 px | 17 px | 400 | normal | Lead, długie opisy |
| `body` | 14 px | 14–15 px | 400 | normal | Default |
| `kicker` | 11 px | 12 px | 600 | **0.06em (uppercase)** | "Łomianki · od 2018", "CO DZIŚ JEMY" |
| `mono` | 14 px | 14 px | 500 | normal | Numery zamówień, kody pocztowe |
| `mono-xl` | — | 32–40 px | 600 | normal | Numer zamówienia w confirmation |

**Kicker pattern.** Mały tekst nad nagłówkiem, uppercase, weight 600,
spacing 0.06em, kolor `#6B6B66` lub `#E63946`. Daje natychmiastowy
editorial vibe.

```
"ŁOMIANKI · OD 2018"          ← kicker
"Pizza, piwo, dowóz."         ← display 64px weight 900
"Tłusta pizza na grubym..."   ← body-lg 17px
```

### Mono dla numerów

Numery zamówień, kody pocztowe, kwoty w fakturze (admin):

```
font-family: ui-monospace, 'SF Mono', Menlo, monospace;
```

Numer zamówienia w confirmation: `2026-00184` w mono 32–40 px weight
600. **Mono jest twoim drugim brand asset** po typografii hero.

### Kropka jako gest

`Pizza, piwo, dowóz.` — z **kropką** na końcu. To samo:
`Tłusta pizza. Bez bullshitu.` Editorial zawodnik. Zostawiamy.

W h1 kropka może być w **primary color** (`#E63946`) jako akcent —
patrz mockup w chacie.

## 6. Spacing & layout

### Spacing scale (4 px base, Tailwind defaults)

```
0  4  8  12  16  20  24  32  40  48  64  80  96  128
```

**Domyślny rytm sekcji:**

- Padding wewnątrz karty: 16–20 px (mobile) / 20–24 px (desktop)
- Gap między kartami w grid: 12–16 px
- Padding między sekcjami: 48–80 px (mobile) / 80–120 px (desktop) —
  **pizzeria potrzebuje powietrza**
- Container max-width: 1280 px (centered)
- Page padding: 16 px (mobile) / 40 px (tablet) / 80 px (desktop)

### Border radius

| Token | px | Użycie |
|---|---|---|
| `sm` | 4 | inputy małe, chip'y |
| `md` | 6 | przyciski, inputy default |
| `lg` | 8 | karty, badge'y duże, KPI tiles |
| `xl` | 12 | modal, sheet, hero zdjęcie, info-bar |
| `full` | 9999 | avatary, FAB "+", kropka pulsująca |

**Karty produktów = `lg` (8 px).** Modale = `xl` (12 px). Nic powyżej
12 px na container blokach — pizzeria nie jest dla dzieci.

### Hierarchia bez shadow

**Karty produktów: 1–1.5 px ramka `border-card` (#E5E1D6).** Bez
shadow. Hover: ramka ciemnieje do `#1A1A1A` lub primary, opcjonalnie
translateY(-2 px) 200 ms. **Koniec.**

Modale i sheety mogą mieć subtelny shadow `lg` — bo wymagają
oddzielenia od backdropu.

## 7. Voice & tone — copy guidelines

### Per ty, krótko, bez bullshitu

| Sytuacja | ❌ | ✅ |
|---|---|---|
| Hero | "Witamy w pizzerii Pizza u Kasi! Najlepsza pizza w Łomiankach od 2018 roku!" | "Pizza, piwo, dowóz." + "35 minut na próg." |
| Empty cart | "Twój koszyk jest pusty. Zapraszamy do dodania produktów z naszego menu!" | "Koszyk jest pusty. Zacznij od pizzy." |
| Status delivered | "Twoje zamówienie zostało dostarczone! Życzymy smacznego!" | "Dostarczone. Smacznego." |
| Cancel reason placeholder | "Proszę wpisać powód anulowania zamówienia w polu poniżej" | "np. Brak produktu" |
| Info bar zamknięte | "Niestety lokal jest aktualnie zamknięty. Zapraszamy ponownie później." | "Zamknięte. Otwieramy o 11:00." |
| Min order warning | "Brakuje 5 zł do osiągnięcia minimalnej kwoty zamówienia wynoszącej 30 zł." | "Brakuje **5 zł** do minimum 30 zł." |
| Toast po dodaniu | "Produkt został pomyślnie dodany do koszyka!" | "✓ Dodano do koszyka" |

**Zasada:** zawsze napisz pełną wersję, potem wytnij **40 % słów**.
Jeśli można wyrzucić — wyrzucamy.

### Drobiazgi które robią charakter

- **Slogan stat** zamiast korporacyjnego ("Od 2018", nie "Z pasją od
  2018 roku")
- **Konkrety zamiast obietnic** ("35 minut na próg" > "Szybka dostawa")
- **Kropki, nie wykrzykniki**
- **Lekki self-aware humor** OK ale **rzadko** — jedno na ekran:
  "Bez bullshitu, bez aplikacji, bez konta." / "Dużo wszystkiego."
  / "Tłusta jak twoje życie." (na opisie mafii — lekkie, nie cringe).
  Maks 1 takie zdanie per ekran. Nie cały tekst w tym stylu.

### Czego NIE robimy w copy (ważne)

- Bez "kurwa" / "chuj" / wulgarnych żartów — Pani Kasia ma
  klientów rodzinnych. Self-aware humor TAK, agresja językowa NIE.
- Bez angielskich słów ("delicious", "premium", "fresh") — polski
  jest językiem strony
- Bez "tradycyjnej receptury" / "z miłością" / "rzemieślniczo" —
  to fake premium, klient czuje
- Bez "naszej rodziny" / "naszej pasji" — chyba że Pani Kasia
  rzeczywiście pisze bio

## 8. Fotografia

### Zdjęcia pizzy = single ważny brand asset

Strona z dobrym typo + tandetnymi zdjęciami = tandeta. Strona z
przeciętnym typo + brutalnie dobrymi zdjęciami = premium.

**Wymagania od zdjęcia produktu:**

- Aspect ratio **4:3** (pioniowo dla mobile, ale 4:3 zostaje na
  desktop)
- **Naturalne oświetlenie** lub **profesjonalne soft-box** — nie lampa
  błyskowa
- **Top-down (z góry)** lub **45° angle** — nie bok, nie pod kątem
  3/4 z lampą
- **Wycinek** zamiast całej pizzy w kompozycji — **wycięty kawałek z
  ciągnącym się serem**, **zbliżenie na pepperoni z bąbelkami**, **ręka
  trzymająca kawałek** — to są zdjęcia które sprzedają
- **Ciepłe color grading** — saturacja czerwieni + żółci podkręcona
  o 5–10 %, kontrast lekko podniesiony, neutralna biel zostaje
- **Naturalne tło** — drewniana deska, papier do pieczenia, marmur
  ciemny szary. **Nie czerwone tło**. **Nie biały studio backdrop.**

**Hero image landing:**

- **Dramatic, atmospheric** — kapiący ser, gorąca pizza prosto z
  pieca, para
- **NIE statyczna kompozycja** — strona ma "pachnieć" pizzą
- Lekki overlay 10–20 % od dołu dla czytelności caption ("Mafia
  40 cm · 42 zł")

### Placeholder gdy brak zdjęcia

W admin formie produktu, jeśli URL nie podany — placeholder:

```css
background-image: repeating-linear-gradient(
  135deg,
  rgba(15,23,42,0.04) 0,
  rgba(15,23,42,0.04) 8px,
  rgba(15,23,42,0.08) 8px,
  rgba(15,23,42,0.08) 16px
);
```

+ caption mono 11 px slate-400 "product shot · 4:3".

## 9. Iconography

**Lucide React** dla UI ikon (admin, formularze, akcje, nawigacja) —
1.5–2 px stroke, MIT license.

**Emoji dla kategorii i akcentów** — `🍕 🍗 🥪 🍟 🍺 🥤 🍦` — bo:
- Polska pizzeria osiedlowa to nie SaaS
- Emoji są ciepłe i czytelne dla baby boomersa
- Native wsparcie systemowe, brak fetchu fontów
- **Pyszne i Glovo używają emoji w kategoriach** — klient zna ten
  język

**Kompromis:** nazwy kategorii to **nazwa polska + emoji**, ale w UI
chrome (przyciski akcji, statusy, formularze) **tylko Lucide** —
spójność wizualna.

```
✅ "🍕 Pizze" (kategoria)
✅ "🚗 Dostawa · 35 min" (info bar)
❌ "📞 Zadzwoń" w admin button (Lucide Phone)
❌ "🛒 Koszyk" w nawigacji (Lucide ShoppingBag lub własny SVG)
```

## 10. Animation discipline

### Domyślnie: motion = trust signal, nie show-off

| Token | Duration | Easing | Użycie |
|---|---|---|---|
| `fast` | 120 ms | ease-out | Hover fill, ring focus, color swap |
| `base` | 180 ms | smooth | Button press, toggle, chip select |
| `slow` | 260 ms | smooth | Modal/sheet enter, drawer slide |
| `urgent-pulse` | 2.5 s | ease-in-out infinite | Karta admin > 10 min waiting |

`smooth` = `cubic-bezier(0.2, 0.7, 0.3, 1)` — bez bounce'a, bez spring
overshoot.

### Konkretne animacje które MA

- **Cart bump** po addItem: 200 ms `scale: 1 → 1.15 → 1` na ikonie
  koszyka. **Tylko ikona**, nie cała strona
- **Karta produktu hover** (desktop): `transform: translateY(-2px)` +
  ramka ciemnieje, 200 ms
- **Status dot pulse** (tracking active step): `box-shadow`
  rozszerzający się 1.5 s loop, primary color
- **Toast slide-in**: 200 ms slide from top + fade
- **Modal/sheet**: backdrop fade 200 ms + content scale 0.95→1 lub
  slide up 260 ms (mobile sheet)

### Czego NIE animujemy

- ❌ Page transitions (klik link → fade całej strony)
- ❌ Scroll-triggered reveal animations (sekcje pojawiają się gdy
  scrollujesz)
- ❌ Hover lift wszystkiego — tylko karty produktów i kafelki
  klikalne
- ❌ Loading spinners → **skeleton screens**, nie spinner

### `prefers-reduced-motion`

Wszystkie animacje wyłączamy w globalnym CSS:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Pulsy admin (`urgent-pulse`) zastępujemy statycznym red border + ring.

## 11. Inspiracje wizualne — co biorę, czego nie biorę

### ✅ Bierzemy (mood, nie pixel-by-pixel)

| Źródło | Co bierzemy |
|---|---|
| **Linear** (linear.app) | gęstość informacyjna, slate borders zamiast gray, mono numbers, sidebar 3-section pattern, kicker labels uppercase |
| **Stripe Dashboard** | filter chips, KPI tiles z proporcją liczba+kontekst, status pill design, tabela danych |
| **Vercel** (vercel.com) | "less is more" white space, focus states crystal clear, type scale tight, sentence-case wszędzie |
| **Pyszne / Uber Eats** | sticky cart sidebar, bottom sheet produktu mobile, info bar pod hero, kategorie jako sticky tabs, scroll-spy |
| **Cherry Bombe magazine** | kicker pattern, typografia jako hero, kropki na końcach |

### ❌ NIE bierzemy

| Źródło | Czego unikamy |
|---|---|
| **Awwwards Site of the Day** | scroll-triggered cinemagraphs, custom cursors, smooth scroll lib (Locomotive), 3D hero, "immersive experience" — to jest portfolio agencji, nie pizzeria w Łomiankach |
| **Pyszne signature DNA** | gradient żółty→pomarańcz, krzyczące oferty, agresywne CTA, fake scarcity timers |
| **Apple Restaurant** | gigantyczne hero zdjęcia full-bleed full-screen, parallax sceny — pretensjonalne |
| **Squarespace restaurant templates ($29/month look)** | clean ale generic, brakuje charakteru |
| **Włoska trattoria mood** (Fraunces, terakota, kremowe) | pretensjonalne dla pizzy osiedlowej |

## 12. Co to ma robić z pierwszą reakcją klienta

Klient otwiera stronę. Pierwsze 2 sekundy. Co ma się stać?

✅ **Cel:** "O kurwa, normalna strona normalnej pizzerii. Ładna nawet."

❌ **Anti-cel:** "Nie wiem czy to pizzeria czy galeria sztuki współczesnej."
❌ **Anti-cel:** "Hmm, kolejna pizzeria. Kliknę menu."
❌ **Anti-cel:** "Wow, ile efektów! Co tu się dzieje?"

**Trzy słowa moodboard:**

1. **Confident** — pewna siebie, nie chwali się tym
2. **Warm** — ciepła (off-white tła, czerwony pomidorowy, emoji w
   kategoriach), nie korpo-zimna
3. **Local** — z lokalnego osiedla, nie z agencji w Wrocławiu / instytutu
   w Mediolanie

## 13. Przykładowy hero (dla orientacji, nie nakaz)

> Operator wygenerował mockup hero w chacie, który Claude Design zobaczy
> jako screenshot referencji. Mockup pokazuje konkretne rozwiązanie
> tego briefu — typografia, proporcje, info-bar, statystyki, mood
> zdjęcia.
>
> **Mockup nie jest finalnym designem.** To dowód że da się zrobić w
> tym kierunku konkretnie. Twoja propozycja może wyglądać inaczej —
> ważne żeby trzymała mood, paletę, dyscyplinę z tego dokumentu.
>
> Co konkretnie z mockupu jest **świadomą decyzją do zachowania**:
>
> - Display 64–72 px weight 900, kropka po `dowóz.` w primary
> - Kicker uppercase "ŁOMIANKI · OD 2018" nad hero
> - Info-bar w `#1A1A1A` pod headerem z otwarte/zamknięte + dostawa +
>   min + cena dowozu (tu live data z `RestaurantSettings`)
> - 3 statystyki pod CTA: lat / średni czas / ocena Google
> - Asymetryczny 5/7 split desktop, mobile 1-col z hero zdjęciem na
>   górze
> - Kategorie jako 5-kolumnowy grid kart z emoji + nazwa + count

Twoje decyzje (do nas zatwierdzenia):

- Konkretny crop / mood zdjęcia hero
- Czy nazwa "Pizza u Kasi." lub coś bardziej generic dla template'u
- Layout sekcji "O nas" / "Godziny" / "Kontakt"
- Mobile hero — pełnoekranowe zdjęcie z overlay tekstem czy split
  jak desktop

## 14. Skala na innych klientów

Ten template ma działać dla:

- pizzeria w Łomiankach (Pani Kasia)
- kebab w Pruszkowie
- burger w Mińsku Mazowieckim
- chińczyk w Nowym Dworze Mazowieckim
- pierogarnia w Markach

**Co się zmienia per klient:**

- Primary color (HEX w settings)
- Logo, nazwa, slogan, hero image, opisy w `PageContent`
- Menu items, kategorie, ceny
- Godziny otwarcia, strefy dostawy
- Emoji kategorii (kebab → 🌯, pierogi → 🥟, sushi → 🍣)

**Co MUSI zostać identyczne (template DNA):**

- Off-white tła, czarny info-bar, dyscyplina typografii Inter
- Kicker pattern, kropka jako gest, mono numery zamówień
- Layout 3-kol menu z sticky cart, modal produktu z komentarzem,
  tracking stepper, admin operations split
- Voice & tone (per ty, krótko, bez bullshitu, konkrety zamiast
  obietnic)

**Co designer ma trzymać w głowie:** jeśli rozwiązanie wizualne nie
działa dla **kebabu w Pruszkowie**, to nie działa dla template'u.
Pizza-specific patterny (np. zdjęcie kawałka pizzy z ciągnącym serem
jako hero) → **mockup branded jak pizzeria**, ale layout / proporcje
/ typografia → **agnostyczne dla pizzeria/kebab/burger.**

---

## 15. Decyzje które zostawiam designerowi

Wszystko z tego dokumentu = **constraints**. Reszta = Twoja decyzja.
Konkretnie:

- Konkretne layouty per ekran (gdzie stoi co, ile px paddingu, jak
  rozkładasz proporcje grid)
- Konkretne mockupy (kompozycja hero, krop zdjęć, dokładny rytm
  sekcji)
- Decyzje detalu (czy kategorie w sidebar pionowym czy poziomym
  tabs, czy modal produktu ma close X w prawym górnym czy strzałkę
  z lewa, jak wygląda timeline trackingu — pionowy z dotami czy
  horyzontalny stepper)
- Mikrocopy (możesz iterować po liście z briefu §5.6 — moje
  propozycje nie są nakazem)
- Dokładne shadow / border / radius wartości (tokeny są
  rekomendowane, możesz przesuwać ±20 % jeśli widzisz uzasadnienie)
- Mobile vs desktop priorytetyzacja per ekran

**Zasada:** broń decyzji w `DESIGN_DECISIONS.md`. Nie zbieraj opcji
"A/B/C/D wybierz". Wybierz, uzasadnij, zostaw alternatywę jako
notatkę "rozważałem też X bo Y, odrzuciłem bo Z".

---

**Wersja 1.0** · 2026-05-04 · brand `silnik-gastro-zamowienia` ·
master @ `557dc85`
