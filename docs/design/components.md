# Komponenty bazowe

Opis kluczowych komponentów z bundla (`bundle/project/Design
System.html`, `bundle/project/public-site/ui.jsx`,
`bundle/project/admin/ui.jsx`) z notatkami, jak je mapować na
istniejące wzorce shadcn/ui + Tailwinda w repo.

**Stan repo:** reużywalne komponenty już istnieją w
`frontend/src/components/ui/` (Button, Input, Label, Textarea,
Card — Faza 1). Ten plik to spec wizualny — nie twórz duplikatów.

## Button

### Warianty

| Wariant | Klasy Tailwind | Użycie |
|---|---|---|
| `primary` | `bg-primary text-white hover:brightness-95 active:brightness-90` | Dominujący CTA (jeden na ekran) |
| `secondary` (dark) | `bg-slate-900 text-white hover:bg-slate-800` | "Zaloguj się", drugi CTA gdy primary nie pasuje |
| `outline` | `bg-white text-slate-800 border border-slate-300 hover:bg-slate-50` | "Zobacz całe menu", "Ustaw ETA", drugorzędne akcje |
| `ghost` | `bg-transparent text-slate-700 hover:bg-slate-100` | "Anuluj" w formularzach, akcje nav |
| `danger` | `bg-red-600 text-white hover:bg-red-700` | Jawne destruktywne (rzadkie) |
| `dangerOutline` | `bg-white text-rose-600 border border-rose-200 hover:bg-rose-50` | **Preferowana wersja destruktywna**: "Anuluj zamówienie", "Usuń produkt" |

### Rozmiary

| Rozmiar | Klasy | Użycie |
|---|---|---|
| `sm` | `h-8 px-3 text-sm` | Filtry, toolbar, chip actions |
| `md` | `h-10 px-4 text-sm` | Default — formularze, modale |
| `lg` | `h-12 px-6 text-base` | CTA landing hero, checkout submit |

### Anatomia primary CTA (zasada "Pani Kasia")

Kluczowy wzorzec z bundla (Design System → "Anatomia primary CTA"):

- **Jeden dominujący primary button per ekran.** Wielokrotne primary
  na tym samym ekranie = błąd. Drugi wybór zawsze jako
  outline/ghost.
- **CTA konkretne, nie generyczne:** "Rozpocznij przygotowanie →"
  zamiast "Zmień status". Mówi co się stanie.
- **Micro-helper pod CTA** (szczegóły zamówienia admin):
  `text-[12px] text-slate-500` pokazujący 1-2 kroki w przód
  ("Po tym kroku status zmieni się na: W przygotowaniu. Następnie:
  Gotowe do odbioru.").
- **Dla szczegółów zamówienia** primary CTA ma wysokość **64px**
  (`h-14` nie wystarczy — custom `h-16 rounded-md text-[17px]
  font-semibold`). Cel: widoczność z 2m w lokalu.
- **Destruktywne = outline, nie solid.** Wizualnie drugorzędne,
  ale wyraźnie dostępne. Zawsze przez modal z potwierdzeniem +
  powód + checkbox.

```jsx
// Klasa bazowa
'inline-flex items-center justify-center gap-2 rounded-md
 font-medium transition-all'
```

## Badge

Klasa bazowa: `inline-flex items-center rounded-full px-2.5 py-0.5
text-xs font-medium`.

Warianty (intent → bg / fg) — patrz
[status-colors.md](status-colors.md).

Dodatkowo:

| Wariant | Klasy | Użycie |
|---|---|---|
| `default` | `bg-slate-100 text-slate-700` | Neutralny tag (np. kategoria produktu) |

## Input / Textarea / Label

### Klasa bazowa input

```jsx
'flex h-10 w-full rounded-md border border-slate-300 bg-white
 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none
 focus:ring-2 focus:ring-primary'
```

### Stany

| Stan | Modyfikatory | Wskaźnik |
|---|---|---|
| idle | `border-slate-300` | — |
| focused | `border-primary ring-2 ring-primary/40 outline-none` | Glow ring |
| error | `border-rose-300` + komunikat `text-[12px] text-rose-600` z ikoną `!` na `bg-rose-100` | Poniżej inputu |
| disabled | `border-slate-200 bg-slate-50 text-slate-400` + `disabled` attr | Wyszarzony |

### Label

`block text-[13px] font-medium text-slate-700 mb-1.5`. Gwiazdka
`*` dla required w `text-rose-600`.

### Textarea

Ta sama klasa co input, bez `h-10`. `rows={3}` default dla "Uwagi
do zamówienia".

## Card

### KPI tile (admin dashboard)

```
rounded-lg border border-slate-200 bg-white shadow-sm p-6
hover:shadow-md transition-shadow cursor-pointer
```

Zawartość:
- Ikonka `w-4 h-4 rounded bg-primary/10` z wewnątrz `w-2 h-2
  rounded-full bg-primary`
- Label: `text-slate-500 text-[13px]`
- Wartość: `text-[44px] font-semibold leading-none mono tracking-tight`
- Delta: `text-[12px] text-emerald-700 font-medium`

### Product card (public menu)

```
rounded-lg border border-slate-200 bg-white overflow-hidden
shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5
```

Layout: `aspect-[4/3]` hero image → `p-4` body z tytułem
(`font-semibold`), ceną "od 39 zł" (`whitespace-nowrap`), opis
`text-[13px] text-slate-500 mt-1 leading-snug`.

Produkt niedostępny: overlay `bg-white/70` + tekst "Chwilowo
niedostępne" w środku karty.

### Order list row (jako karta)

```
rounded-lg border border-slate-200 bg-white shadow-sm p-5
```

Górny rząd: numer w `mono text-[20px] font-semibold`, badge po
prawej. Meta w drugiej linii, adres + kwota w trzeciej.

**Uwaga:** w admin panelu zrezygnowaliśmy z kart dla list (decyzja
userowa z chatu — listy jako tabele). Karta order zostaje tylko
w dashboardzie ("ostatnie zamówienia") jako kontrast.

## Admin lists — tabela

Decyzja z `chat1.md` ("nie podoba mi się grid, zrób tabelę"):

- `<table className="w-full table-fixed">` z `<colgroup>` dla
  stałych szerokości kolumn.
- `<thead>` z tłem `bg-slate-50`, divider `border-b
  border-slate-200`. Nagłówki: `text-left text-slate-500` +
  `mono text-[11px] tracking-[0.18em] uppercase` dla mono-caps
  labels.
- `<tbody>` rows: `border-b border-slate-100 last:border-0`.
  Numery zamówień i kwoty w `mono text-[13px]`, wyrównane do
  prawej gdy liczbowe.
- Status badge w dedykowanej kolumnie. Toggle dostępności w
  dedykowanej kolumnie.
- Kropka primary `w-2 h-2 rounded-full bg-primary` przed numerem
  świeżego zamówienia + pasek `bg-primary w-0.5` po lewej
  wiersza (zostawione pod M11 Fazy 4, SSE live update).

## Controls

### Radio tile (fulfillment type)

Zaznaczony:
```
rounded-lg border-2 border-primary bg-primary/5 p-4
```
+ kropka primary w prawym górnym rogu:
```
w-4 h-4 rounded-full border-2 border-primary
  + inner w-2 h-2 rounded-full bg-primary
```

Niezaznaczony:
```
rounded-lg border border-slate-200 bg-white p-4
hover:border-slate-300
```
+ puste kółko `w-4 h-4 rounded-full border-2 border-slate-300`.

### Switch (toggle)

ON:
```
w-10 h-6 rounded-full bg-primary relative
  + absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow
```

OFF:
```
w-10 h-6 rounded-full bg-slate-200 relative
  + absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow
```

### Checkbox

Zaznaczony:
```
w-4 h-4 rounded border border-primary bg-primary text-white
flex items-center justify-center text-[10px] font-bold
```
z "✓" wewnątrz.

Niezaznaczony: tylko border `w-4 h-4 rounded border border-slate-300`.

## States

### Empty state

```
rounded-lg border border-dashed border-slate-300 bg-slate-50
p-8 text-center
```

Ikona w kole `w-10 h-10 rounded-full bg-white border
border-slate-200`, tytuł `text-[14px] font-semibold
text-slate-800`, opis jednozdaniowy `text-[12px] text-slate-500
mt-1 leading-snug`. **Nigdy** spinner — zawsze komunikat z
kontekstem ("Gdy klient złoży zamówienie przez stronę, pojawi się
tutaj.").

### Skeleton (loading)

Zastępuje spinnery per CLAUDE.md Fazy 5. Szkielet ma tę samą
strukturę co target content, elementy:
```
h-{n} w-{x} rounded bg-slate-100 animate-pulse
```
Badge placeholder: `h-5 w-20 rounded-full`. Text line: `h-3 w-full
/ w-5/6 / w-2/3` dla naturalnego rytmu.

### Toast (sonner)

```
rounded-lg bg-slate-900 text-white p-4 shadow-lg
```
Z ikoną sukcesu: `w-5 h-5 rounded-full bg-emerald-400/90
text-slate-900`. Tytuł `text-[14px] font-semibold`, opis
`text-[12px] text-slate-300`. Close `text-slate-400 hover:text-white
text-[18px] leading-none`.

## Modal / Sheet / Drawer

W bundlu:
- **Modal** (desktop produkt, ETA, cancel): centered, `rounded-lg`,
  `shadow-lg`, backdrop `bg-slate-900/40`, dur 260ms.
- **Sheet** (mobile produkt): bottom sheet, `rounded-t-xl`, slide
  up.
- **Drawer** (cart): slide-in z prawej desktop, bottom sheet mobile.
  Sticky bottom bar mobile `bg-white border-t border-slate-200
  p-4` z ilością pozycji + kwotą + CTA "Zamów".

Framer Motion (Faza 5):
- drawer: `slide-x` desktop / `slide-y` mobile
- modal: `fade + scale 0.98 → 1`
- easing: `[0.2, 0.7, 0.3, 1]`
- dur: 260ms

## Admin sidebar

Lewa kolumna desktop (`w-60`), top bar + off-canvas drawer mobile.
Linki: ikona + label, aktywny ma `bg-primary/10 text-primary`,
reszta `text-slate-700 hover:bg-slate-100`. Dolny pasek: nazwa
restauracji + Wyloguj.

## Tracking — timeline (wzorzec UX)

Poziomy timeline desktop (`flex items-start justify-between`) z
linią `absolute h-px bg-slate-200` w tle i progressem
`bg-emerald-500` nad nią.

Wertykalny timeline mobile — kolumna z `border-l border-slate-200`,
kroki jako `flex items-start gap-3`.

**Dot aktywny:** `bg-primary text-white` w środku, na zewnątrz
pseudo-element `::after` z animacją `dotpulse 1.8s ease-out
infinite` (patrz [tokens.md §Motion](tokens.md)).

**ETA card:** `rounded-lg bg-slate-900 text-white p-6`. Kontrastuje
z jasną resztą. Numer godziny `mono text-[44px] font-semibold
leading-none tracking-tight`. "za ~17 minut" w `text-[13px]
text-slate-400`.
