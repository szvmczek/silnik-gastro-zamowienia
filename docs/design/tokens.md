# Design tokens

Wyciąg z `bundle/project/Design System.html` (Etap 1 · Fundamenty).
Źródło prawdy dla implementacji — mapowane na klasy Tailwinda.

## Kolor marki

Zawsze przez CSS variable `--color-primary` (RGB bez przecinków,
kompatybilnie z Tailwind `<alpha-value>`). Klient podmienia ją
z panelu — cała strona aktualizuje akcent.

| Token | RGB | HEX | Użycie |
|---|---|---|---|
| `--color-primary` | `255 107 53` | `#FF6B35` | Jedyny akcent marki. CTA, kropka na nowym zamówieniu, aktywny krok timeline. |

Tailwind config (zgodny z aktualnym projektem):

```js
// frontend/tailwind.config.ts
theme: {
  extend: {
    colors: { primary: 'rgb(var(--color-primary) / <alpha-value>)' },
    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
  },
},
```

### Alpha rampka marki

Dla subtelnych tłów / tintów. Używaj klas Tailwinda z alpha suffixem.

| Klasa | Wartość | Użycie |
|---|---|---|
| `bg-primary/5` | `rgb(255 107 53 / 0.05)` | Tło radio-tile wybranego ("Dostawa" zaznaczone) |
| `bg-primary/10` | `rgb(255 107 53 / 0.10)` | Badge `NEW`, ikonka KPI, tint card header |
| `bg-primary/20` | `rgb(255 107 53 / 0.20)` | Subtelne tła sekcji |
| `bg-primary/40` | `rgb(255 107 53 / 0.40)` | Focus ring outline (łączenie z `ring-primary`) |
| `bg-primary/70` | `rgb(255 107 53 / 0.70)` | Rzadkie — hover na subtelnych elementach |
| `bg-primary` | `rgb(255 107 53)` | CTA, aktywny krok trackingu, toggle switch ON |

**Reguła:** `bg-primary` (solid) **tylko** na CTA i elementach
wyeksponowanych. Tinty `/10`, `/20` na tłach. `ring-primary` +
`ring-primary/40` na focusie inputów.

## Neutrale — slate

Bazowe tła, tekst, obramowania.

| Token | HEX | Użycie |
|---|---|---|
| `slate-50` | `#f8fafc` | Tło admina, tła kafelków hero w kontakcie, thead w tabeli |
| `slate-100` | `#f1f5f9` | Divider delikatny, tło badge `muted`, animate-pulse skeleton |
| `slate-200` | `#e2e8f0` | Obramowania kart, divider główny |
| `slate-300` | `#cbd5e1` | Border input (idle), outline radio niezaznaczony |
| `slate-400` | `#94a3b8` | Kicker text, mono meta, placeholder |
| `slate-500` | `#64748b` | Tekst muted, opisy, body secondary |
| `slate-600` | `#475569` | Ghost button text, body primary (nieco jaśniejsze) |
| `slate-700` | `#334155` | Body tekst, tablet breakpoint color |
| `slate-800` | `#1e293b` | Tekst na hover dark buttonach (`secondary` hover) |
| `slate-900` | `#0f172a` | Tekst główny, `secondary` button, ETA dark card |

**Reguły:**
- Tło strony: `bg-slate-50` (admin) / `bg-white` (public).
- Tekst główny: `text-slate-900`. Muted: `text-slate-500`.
- Obramowania: `border-slate-200`.
- Divider: `bg-slate-100` lub `bg-slate-200`.

## Status (zamówienia i intent)

Patrz osobny plik: [status-colors.md](status-colors.md).

## Typografia

Font: **Inter** (Google Fonts, wagi 400 / 500 / 600 / 700 / 800).
Dodatkowo **mono** (ui-monospace, SFMono-Regular, Menlo) dla numerów
zamówień, kwot, kickerów, meta.

| Skala | Klasa Tailwind | Rozmiar / line-height / tracking / weight | Użycie |
|---|---|---|---|
| Display | `text-[56px] leading-[1.02] font-semibold tracking-[-0.02em]` | 56 / 57 · -2% · 600 | Hero desktop, onboarding pages |
| H1 | `text-[40px] leading-[1.08] font-semibold tracking-[-0.015em]` | 40 / 43 · -1.5% · 600 | Sekcje landing, tytuły stron admina |
| H2 | `text-[28px] leading-[1.15] font-semibold tracking-[-0.01em]` | 28 / 32 · -1% · 600 | Sekcje ("Z naszego menu") |
| H3 | `text-[20px] leading-[1.25] font-semibold tracking-[-0.005em]` | 20 / 25 · -0.5% · 600 | Tytuły kart, podsekcje |
| H4 / card | `text-[17px] leading-[1.35] font-semibold` | 17 / 23 · 600 | Header karty, "Dane klienta" |
| Body L | `text-[16px] leading-[1.6] text-slate-600` | 16 / 26 · 400 | Akapit editorial, "O nas" |
| Body | `text-[14px] leading-[1.55] text-slate-700` | 14 / 22 · 400 | Standard UI, formularze, listy |
| Small | `text-[13px] leading-[1.5] text-slate-500` | 13 / 20 · 400 | Meta, podpisy, opisy pól |
| Caption / kicker | `font-mono text-[11px] tracking-[0.18em] uppercase text-slate-400` | 11 / 16 · +18% | Kicker sekcji, meta, "Etap 1 · fundamenty" |
| Display № (mono) | `font-mono text-[64px] leading-none font-semibold tracking-[-0.02em]` | 64 · 600 | Numer zamówienia XXL (widoczny z 2m) |

**Reguła kickerów:** mono, uppercase, tracking `0.18em–0.20em`,
`text-slate-400`. Wprowadzają sekcję przed H2. Jeden na
artboard / view.

## Spacing — 4px base

| Token | Tailwind | px |
|---|---|---|
| 2xs | `p-0.5`, `gap-0.5` | 4 |
| xs | `p-2`, `gap-2` | 8 |
| sm | `p-3`, `gap-3` | 12 |
| md | `p-4`, `gap-4` | 16 |
| lg | `p-6`, `gap-6` | 24 |
| xl | `p-8`, `gap-8` | 32 |
| 2xl | `p-12`, `gap-12` | 48 |
| 3xl | `p-16`, `gap-16` | 64 |

## Radii

| Token | px | Tailwind | Użycie |
|---|---|---|---|
| sm | 4 | `rounded-sm` | Inputy wewnętrzne, checkboxy, chipsy małe |
| md | 6 | `rounded-md` | Przyciski, inputy, chipsy standardowe |
| lg | 8 | `rounded-lg` | Karty, modale, kafelki KPI |
| xl | 12 | `rounded-xl` | Hero tiles, galeria, kolor primary tile |
| full | 9999 | `rounded-full` | Badge'e pill, avatary, kropka pulsująca |

## Shadows

| Token | box-shadow | Użycie |
|---|---|---|
| xs | `0 1px 2px rgba(15,23,42,0.04)` | Karty statyczne, admin panel tiles |
| sm | `0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.05)` | Karty na liście (`shadow-sm` Tailwind) |
| md | `0 4px 12px -2px rgba(15,23,42,0.08)` | Hover lift (`hover:shadow-md`) |
| lg | `0 12px 28px -6px rgba(15,23,42,0.12)` | Modal, sheet, drawer |
| focus | `0 0 0 3px rgb(255 107 53 / 0.35)` | `ring-primary` · focus ring inputów (`ring-2 ring-primary/40`) |

## Motion

Easing: `cubic-bezier(0.2, 0.7, 0.3, 1)` — z wyczuciem, **bez
bounce'a**.

| Token | Duration | Użycie |
|---|---|---|
| fast | 120ms | Hover fill, ring, color swap |
| base | 180ms | Button press, toggle, chip |
| slow | 260ms | Modal, sheet, drawer (Framer Motion) |
| stagger | 40ms | Listy przy wejściu (interval między elementami) |

Dedykowana animacja trackingu — `dot-pulse` na aktywnym kroku:

```css
@keyframes dotpulse {
  0%   { box-shadow: 0 0 0 0 rgba(var(--color-primary), 0.45); }
  100% { box-shadow: 0 0 0 10px rgba(var(--color-primary), 0); }
}
/* animacja: 1.8s ease-out infinite */
```

## Breakpointy

| Token | Min-width | Grid | Gutter |
|---|---|---|---|
| mobile | 375px | 1 kolumna | 16px |
| tablet | ≥ 768px (`md:`) | 8 kolumn | 24px |
| desktop | ≥ 1024px (`lg:`) | 12 kolumn | 24px |
| wide | ≥ 1280px (`xl:`) | 12 kolumn, max-container 1200px | 24px |

**Reguła mobile-first** (CLAUDE.md §7): testuj zawsze w 375px,
progresywnie dodawaj `md:` / `lg:` / `xl:` modyfikatory.

## Placeholder graficzny

Dla miejsc na zdjęcia bez treści (product card na prototypie,
admin menu bez URL):

```css
background-image: repeating-linear-gradient(
  135deg,
  rgba(15,23,42,0.04) 0,
  rgba(15,23,42,0.04) 8px,
  rgba(15,23,42,0.08) 8px,
  rgba(15,23,42,0.08) 16px
);
```

W kodzie: stripe pattern na `aspect-[4/3]` div z `mono text-[11px]
text-slate-400` caption "product shot · 4:3".
