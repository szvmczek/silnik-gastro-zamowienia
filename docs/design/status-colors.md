# Status → kolor (mapping)

Jeden spójny mapping dla całego produktu — zarówno badge na liście
admina, jak i etykieta na trackingu klienta.

Źródło: `bundle/project/Design System.html` (Section "Status → kolor").

## Intent → paleta

| Intent | Bg | Fg | HEX bg / fg | Użycie |
|---|---|---|---|---|
| primary | `bg-primary/10` | `text-primary` | `rgb(255 107 53 / 0.10)` / `#FF6B35` | Świeże, wymaga akcji (NEW) |
| info — sky | `bg-sky-100` | `text-sky-700` | `#e0f2fe` / `#0369a1` | Przyjęte, potwierdzone |
| warning — amber | `bg-amber-100` | `text-amber-700` | `#fef3c7` / `#b45309` | W toku (przygotowanie, dostawa) |
| success — emerald | `bg-emerald-100` | `text-emerald-700` | `#d1fae5` / `#047857` | Gotowe, dostarczone, zapisy toastów |
| muted — slate | `bg-slate-100` | `text-slate-500` | `#f1f5f9` / `#475569` | Cykl zamknięty, neutralne |
| danger — rose | `bg-rose-100` | `text-rose-700` | `#ffe4e6` / `#be123c` | Anulowane, błędy, destruktywne akcje |

## Mapowanie stanów `OrderStatus` (backend enum)

Zgodne z `order.domain.OrderStatus` (patrz `ARCHITECTURE.md` §AD-008)
oraz `frontend/src/features/admin/orders/lib/transitions.ts`
(patrz `AD-017` — FE mirror).

| Status (enum) | Etykieta PL | Intent | Klasa badge'a (Tailwind) |
|---|---|---|---|
| `NEW` | Nowe | **primary** | `bg-primary/10 text-primary` |
| `CONFIRMED` | Potwierdzone | info | `bg-sky-100 text-sky-700` |
| `IN_PREPARATION` | W przygotowaniu | warning | `bg-amber-100 text-amber-700` |
| `READY` | Gotowe | success | `bg-emerald-100 text-emerald-700` |
| `OUT_FOR_DELIVERY` | W drodze | warning | `bg-amber-100 text-amber-700` |
| `DELIVERED` | Dostarczone | muted | `bg-slate-100 text-slate-500` |
| `CANCELED` | Anulowane | danger | `bg-rose-100 text-rose-700` |

## Uwagi praktyczne

1. **Dwa statusy w tym samym intent (warning):** `IN_PREPARATION` i
   `OUT_FOR_DELIVERY` — oba są "w toku". W liście admin
   odróżnialne przez etykietę, nie kolor; na szczegółach zamówienia
   kontekst (pozycja w timeline) rozróżnia.
2. **`NEW` = primary,** nie "info", bo wymaga akcji od obsługi.
   To jedyne użycie koloru marki w kontekście statusu — pozostałe
   stany idą paletą semantic (sky/amber/emerald/rose/slate).
3. **Komponent badge** (`inline-flex items-center rounded-full
   px-2.5 py-0.5 text-xs font-medium`) — patrz
   [components.md §Badge](components.md).
4. **Timeline trackingu:**
   - kroki zamknięte (`done: true`) → zielony dot
     (`bg-emerald-500 text-white`) z "✓"
   - krok aktywny (`active: true`) → primary dot
     (`bg-primary text-white`) z "•" + animacja `dot-pulse` (patrz
     [tokens.md §Motion](tokens.md))
   - kroki przyszłe → biała kropka z obramowaniem
     (`bg-white border border-slate-200 text-slate-400`) z numerem
5. **Toast** (sonner) success → emerald-400 bg, slate-900 panel.
   Inne toasty: error → rose, info → sky. Kolory fg/bg jak w tabeli
   powyżej.
