# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak — Faza 4 + Faza 5 zamknięte, redesign post-MVP zakończony
(10/10 grup mergowane do `phase-5`, patrz "Redesign progress"
poniżej). Następny krok: deployment Pizza Showcase staging
(Railway) + draft `docs/ONBOARDING.md` dla pierwszego klienta.

## Redesign progress (post-MVP, docs/design/MIGRATION_PLAN.md)

- [x] Grupa 1: Fundamenty (2026-04-22, branch `design/g1-foundations`)
  - **Primary color swap `#E11D48` → `#FF6B35`** (Decyzja #1): V100
    seed, `index.css` fallback, `index.html` theme-color, `manifest.json`
    theme_color, `docs/customization.md` przykład. Flyway checksum
    dla V100 zmienia się — istniejące DB wymagają `flyway repair` lub
    clean recreate.
  - **Tailwind design tokens** (`tailwind.config.ts`): `fontFamily.mono`,
    `transitionTimingFunction.smooth`, `transitionDuration.{fast,base,slow}`,
    `keyframes.dotpulse`, `animation.dotpulse`. Inter weight 800
    dodany do Google Fonts URL (wymagany przez Display `text-[56px]`).
  - **Kicker** jako utility `.kicker` w `@layer components` (Decyzja #7 —
    nie komponent).
  - **Button**: nowe warianty `outline`, `dangerOutline`; nowy size
    `xl` (`h-16 px-7 text-[17px] font-semibold` — 64px pod flagship
    CTA ekran 12). Istniejące warianty/rozmiary bez zmian (addition-only).
  - **Input/Textarea**: focus ring alpha `/40`, `focus:border-primary`,
    opcjonalny prop `error?: boolean` (border-rose-300 + aria-invalid).
  - **Label**: `text-sm` → `text-[13px] font-medium mb-1.5`
    (components.md §Label).
  - **Dialog/Sheet**: overlay `bg-slate-900/60 backdrop-blur` →
    `bg-slate-900/40`, content `shadow-xl` → `shadow-lg`; Sheet
    side=bottom dostał `rounded-t-xl` (mobile bottom sheet).
  - **Select/Checkbox/Switch/RadioGroup/Tabs**: focus ring alpha
    `/40` (spójność); Table audit-passed bez zmian.
  - **Nowe primitives**: `Skeleton` (bazowy klocek `animate-pulse
    rounded bg-slate-100`), `EmptyState` (kontener `border-dashed
    slate-300 bg-slate-50 p-8` z ikona/title/description/action).
    Niezużywane jeszcze — konsumenci w G4/G5/G7 podepną się sami.
  - **Zero zmian** w API, encjach, DTO, serwisach, routingu, query
    keys, mutation keys, Zustand, Zod, hookach TanStack, logice
    biznesowej, interceptorach. `ThemeBootstrap` / `themeLoader` —
    format CSS var `R G B` zachowany.
  - **Smoke automatyczny**: `npm run build` zielone (tsc + vite,
    1.99s, 722 kB bundle — bez regresji bundle size'u vs baseline
    690 kB). Grep audit: `#E11D48`/`225 29 72` zostały tylko w
    historii (CURRENT_STATE linie 28, 478), w tekście planu
    (MIGRATION_PLAN linie 267, 309) i w `SettingsPage.tsx:93` RHF
    default fallback (ms-flicker przed fetch; scope G9, nie G1).
  - **Smoke manualny do zrobienia przez usera**: `./gradlew build`
    (wymaga clean DB pod V100 re-run albo akceptacja że istniejące
    DB używają wartości z rekordu), audit 6 ekranów
    (Login/Landing/Menu/CartDrawer/Checkout/OrderDetail), DoD Faz 1-5
    smoke z PHASES.md.
- [x] Grupa 6: Admin shell + Login + Dashboard (2026-04-23, branch
  `design/g6-admin-shell`)
  - **AdminLayout rebuild** (commit `dbc8a8b`): split shell into
    `AdminLayout` (orchestrator + single `useAdminOrderFeed` mount
    point) + new `AdminSidebar.tsx` + new `AdminTopbar.tsx`. Desktop:
    fixed `w-60` sidebar on `md:+` with brand section (kicker "Panel"
    + admin displayName), NavLink list (active `bg-primary/10
    text-primary font-medium`, idle `text-slate-600 hover:bg-slate-100`,
    `h-10 px-3 rounded-md`), footer with user-initials tile. Mobile
    (`<md`): sidebar moved to radix `Sheet side="left" w-60`, triggered
    by hamburger in topbar; `onNavClick` auto-closes. Topbar
    `h-[72px] px-4 md:px-8`: restaurant name from `usePublicSettings`
    as title + localized PL weekday/date as subtitle,
    `SoundToggle` + `Wyloguj` in right slot. `<main>` wrapper gains
    `p-4 md:p-8` so feature pages render with consistent padding
    (previously depended on AdminLayout's `md:gap-6 md:px-6 md:py-6`
    container). `SoundToggle` restyled to icon-only h-9 w-9 rounded-md
    button spec matching the topbar — logic untouched.
  - **LoginPage rebuild** (commit `62a8238`): 420px centered column,
    mono kicker "Panel administracyjny" + restaurant name above the
    card (from `usePublicSettings`, public endpoint — no auth needed
    pre-login), card `rounded-2xl border bg-white p-8 shadow-sm`,
    H1 `text-[22px]`, inputs with local `className="h-11"` override on
    the G1 `Input` primitive (see **TODO G9** in
    `docs/design/MIGRATION_PLAN.md §Grupa 9` for the threshold at which
    we add a `size` prop to Input instead), primary CTA `variant=
    "primary" size="xl" w-full` (64px G1 button), "← Wróć na stronę"
    back-link to `/`. Stopped using `Card*` subcomponents because the
    spec diverges on radius (`rounded-2xl`) and header semantics. All
    behavior kept: auto-redirect when already authenticated, mutation
    success/error toasts with `extractProblem`, RHF+Zod schema.
  - **DashboardPage + KpiTile** (commit `2affb28`): H1 scaled to
    `text-[28px] font-semibold tracking-tight`, `space-y-8`, new
    "Dziś" kicker (shared `.kicker` utility from G1) introduces the
    KPI grid, grid gap bumped to `gap-5`. KpiTile: `rounded-lg border
    bg-white shadow-sm p-6 hover:shadow-md` with highlight variant
    (`border-primary/30 bg-primary/[0.03]`) applied only for
    `accent="primary"` (Nowe dziś); icon square `w-6 h-6 rounded-md
    bg-{accent}/10` wrapping inner 2×2 dot; value `font-mono
    text-[44px] font-semibold leading-none tracking-tight
    text-slate-900` (was `text-4xl tabular-nums`); ChevronRight click
    affordance top-right; focus ring moved to outer `Link` for full
    rounded-lg focus paint. Bundle "ostatnie zamówienia" table
    intentionally NOT added — G6 stops at 3 KPI tiles; orders table
    styling lives in G7.
  - **Zero zmian**: `useAdminOrderFeed` hook, `authStore`,
    `ProtectedRoute`, `router.tsx`, query keys (`["admin","dashboard",
    "summary"]`, `["admin","orders",*]`, `["public","settings"]`),
    mutation keys, Zustand shape, Zod schemas, Bean Validation, DTO
    shape, endpointy backend (zero linii Java dotknięte),
    SSE stream auth / query param handling, `soundPrefs` logika.
    `Input`/`Button`/`Card`/`Sheet`/`Label` shared primitives **nie
    modyfikowane** (używane, addition-only via className).
  - **SSE mount stability**: `useAdminOrderFeed()` invoked at the
    same top-level position in `AdminLayout` as before (line 47 vs
    previous line 22 — same logical "before return JSX" slot). The
    hook's `useEffect([queryClient])` dep is stable because providers
    were untouched. Sheet portal, sidebar state, and mobile drawer
    state are local to AdminLayout and do not re-mount the hook
    consumer. **Must-verify manualnie (see smoke §SSE stability).**
  - **Smoke automatyczny**: `npm run build` zielone (tsc + vite, 2.05s,
    725.93 kB bundle — +3 kB vs G1 baseline 722 kB: `Menu` +
    `ChevronRight` lucide icons + new layout components, acceptable).
    `./gradlew build` zielone (backend unchanged, sanity ran).
  - **Smoke manualny do zrobienia przez usera** — patrz sekcja raportu
    "G6 acceptance" oraz "Regresja Faz 1-5" poniżej.

- [x] Grupa 2 + 3: Public shell + Landing (2026-04-23, branch
  `design/g2-g3-public-landing`)
  - **PublicNav + PublicFooter extraction** (commit `2cb5c26`): new
    `features/public/shared/PublicNav.tsx` + `PublicFooter.tsx` —
    shared between LandingPage and MenuPage. PublicNav desktop `md:h-16`
    (NOT bundle `h-[72px]`) to match existing `CategoryTabs sticky
    top-16` offset — touching CategoryTabs is G4 scope. Mobile `h-14`
    matches `CategoryTabs sm:top-14`. Sheet side=left `w-72` off-canvas
    drawer for mobile nav (pattern from AdminSidebar mobile, G6).
    PublicFooter: copyright + Regulamin/PP placeholders + discrete
    admin link `text-slate-400 text-[12px]`. Both consume
    `usePublicSettings` internally — no prop drilling. Primary CTAs
    rendered as `<Link>` with inline button classes (not `<Button>`)
    because G1 Button has no `asChild` prop and G1 surface stays closed.
  - **LandingPage orchestrator** (commit `72d0d5f`): inline header/footer
    replaced with `<PublicNav active="home"/>` + `<PublicFooter/>`.
    Section components mount untouched — ThemeBootstrap (providers.tsx),
    CartDrawer, MobileCartBar mount points unchanged. Zero SSE / theme /
    cart re-mount risk.
  - **MenuPage shell alignment** (commit `bad19e1`): same pattern —
    `<PublicNav active="menu"/>` replaces inline header + `<PublicFooter/>`
    dopięty. `CategoryTabs` / `ProductCard` / `ProductModal` / grid
    layout / scroll-mt anchors — **NIE dotknięte** (G4 scope).
    Transitional visual state: new shell + old product cards do G4.
  - **HeroSection rebuild** (commit `5364897`): asymmetric 12-col grid,
    text `col-span-5` left / photo `col-span-7` right (`rounded-2xl
    aspect-[5/6]`). Typography Display scale text-[40px] mobile /
    md:text-[56px] / lg:text-[72px] — mono kicker
    text-primary (only hero kicker is orange per bundle; other sections
    slate-400). Primary `h-16` "Zamów online →" + ghost `h-16` "Zobacz
    menu" CTAs as `<Link>` elements. Meta-bar under CTAs: Clock icon +
    dynamic "Dziś otwarte do HH:MM" / "Dziś zamknięte" (from
    `useIsRestaurantOpen` — M6/2 Faza 5, read-only consumer) + Truck
    icon + **static** "Dostawa w ~35 min" (DB has no delivery ETA
    source; bundle also static; zone calculator = Faza 7 post-MVP).
    CTA **NOT** disabled when closed — that logic lives in CheckoutPage,
    hero meta-bar is informational only.
  - **AboutSection rebuild** (commit `ee43bb6`): cream tint
    `bg-[#faf7f2]` (arbitrary, direct from bundle "warm sand"
    signature — not added to tailwind.config.ts, 1-use). Two-column
    editorial grid: photo col-span-5 `aspect-[4/5]`, text col-span-6
    col-start-7. H2 `text-[28px] md:text-[40px]`, body
    `text-[16px] leading-[1.75] max-w-[540px]` with
    `whitespace-pre-line`. Bundle stat blocks NOT imported (no DB
    source; would violate CLAUDE.md §8 "zero hardcoded content").
  - **ContactSection rebuild** (commit `e49f97b`): two-column grid —
    left col-span-5 = kicker + H2 "Znajdziesz nas" + 3 ContactTile
    rows (MapPin / Phone / Mail) with `w-10 h-10 rounded-full
    bg-slate-100` icon circles; right col-span-7 = OSM iframe in
    `rounded-2xl overflow-hidden` container, `aspect-[4/3]`. **Nominatim
    geocoding pipeline preserved 1:1** — `useAddressGeocode` hook +
    bbox/marker/layer iframe URL structure (M6/3 Faza 5, commit
    `37cb160`) intact. Dashed fallback when geocode.data null or no
    address set. Correction vs MIGRATION_PLAN §G3 text ("kafle
    slate-50"): bundle actually uses bg-slate-100 icon circles, not
    slate-50 tile containers — bundle JSX wins as source of truth.
  - **OpeningHoursSection rebuild** (commit `f0e806f`): 2-col grid
    (day name left, hours right-aligned mono+tabular-nums),
    `md:max-w-[460px]`. Active day = primary bullet
    `w-1.5 h-1.5 rounded-full bg-primary` before label +
    `DZIŚ` mono badge `text-primary` + `font-semibold text-slate-900`
    row styling. Today resolved inline via
    `Intl.DateTimeFormat timeZone "Europe/Warsaw" weekday:"long"` +
    local DAY_MAP — duplicates 5 lines from `useIsRestaurantOpen`,
    but extending that hook's surface is out of G3 scope (plan §8).
  - **ThemeBootstrap audit**: format `--color-primary: R G B`
    zachowany, kompatybilny z G1 tokens, zero modyfikacji (G2 scope).
    Potwierdzone: `themeLoader.ts:12` emituje `${r} ${g} ${b}` plain
    space-separated string, Tailwind `rgb(var(--color-primary) /
    <alpha-value>)` consumer w `tailwind.config.ts` bez zmian od G1.
  - **Zero zmian**: backend (Java/Flyway), router.tsx, providers.tsx,
    ErrorBoundary, SeoHead, `fetchPublicSettings` /
    `fetchPublicPageContent` / `fetchPublicOpeningHours` /
    `useAddressGeocode` / `useIsRestaurantOpen` /
    `usePublicSettings` hook signatures, CartDrawer / CartButton /
    MobileCartBar / ProductCard / ProductModal / CategoryTabs (G4 scope),
    shared UI primitives (Button/Input/Sheet/Card — G1 closed),
    query keys (`["public","settings"|"page-content"|"opening-hours"|
    "menu"]`), cartStore persist key `pizza-showcase-cart`,
    authStore, Zod schemas, Bean Validation, DTO shape.
  - **Smoke automatyczny**: `npm run build` zielone (tsc + vite,
    1.69s ostatni commit, bundle 729.81 kB — +3.88 kB vs G6 baseline
    725.93 kB: PublicNav + PublicFooter + 3 new lucide icons
    (Clock, Truck, Menu) + rebuilt section JSX — akceptowalne).
  - **Smoke manualny do zrobienia przez usera** — patrz sekcja raportu
    "G2+G3 acceptance" oraz "Regresja G1/G6/Faz 1-5" w chat.

- [x] Grupa 4: Menu + Modal + Cart (2026-04-24, branch
  `design/g4-menu-cart-modal`)
  - **MenuPage hero + CategoryTabs** (commit `9ebf1cf`): mono kicker
    "Nasze menu" + Display H1 `text-[40px] md:text-[56px]
    tracking-[-0.02em]` + tagline `max-w-[580px]`; per-section kicker
    mono `"{name} · {n} pozycja|pozycje|pozycji"` (PL declension) nad
    H2 `text-[24px] md:text-[28px]`; grid gap 4 → 6, vertical rhythm
    space-y-10 → space-y-14. CategoryTabs active `bg-primary/10
    text-primary font-medium`, idle plain `text-slate-600
    hover:bg-slate-100`, `h-9 px-4 text-[13px] rounded-full`. **Sticky
    offset `top-14 sm:top-16` NIETKNIĘTY** (flaga z raportu G2+G3 —
    matchuje `PublicNav h-14 mobile / h-16 desktop`). IntersectionObserver
    + programmatic scrollTo bez zmian.
  - **ProductCard** (commit `d7d1654`): major rebuild — `rounded-xl
    overflow-hidden border shadow-sm`, `hover:-translate-y-1
    hover:shadow-lg` (silniejszy lift vs poprzedniego -0.5), image
    `aspect-[4/3]` + `group-hover:scale-[1.03] duration-300`. Title
    `text-[17px] font-semibold tracking-tight` + cena `text-[15px]
    font-semibold whitespace-nowrap` **same baseline**
    (`flex items-baseline justify-between`). Desc `text-[13px]
    text-slate-500 leading-snug line-clamp-2`. Unavailable: `opacity-60`
    na całej karcie + absolute overlay `bg-white/70` z G1 Badge
    "Chwilowo niedostępne" centered over image (bundle pattern).
    Usunięty corner badge "Niedostępne" + dolny hint "Zobacz →" (bundle
    nie ma, hover lift wystarcza jako affordance).
  - **ProductModal** (commit `9b1bbbf`): major rebuild — desktop
    `sm:max-w-[760px] sm:rounded-2xl` override G1 Dialog defaults via
    twMerge. **Mobile bottom sheet via CSS-only responsive**:
    `max-sm:` override pozycji (`bottom-0 translate reset`), width
    (`w-full max-w-none`), border (`rounded-t-xl`) i animacji
    (`data-[state=open]:slide-in-from-bottom` + reset
    `zoom-in-100/zoom-out-100` żeby nadpisać default Dialog
    `zoom-in-95`). Zero nowych hooków, zero dual-render — single Dialog
    z Tailwind breakpointami. Hero `aspect-[16/9]` zachowany (bundle
    21/9 blisko, nie re-kadruję Unsplash). Title `text-[22px] sm:text-
    [28px] font-semibold tracking-tight`, desc `text-[14px]
    leading-relaxed`. Sticky footer przebudowany wokół G1 Button
    `variant="primary" size="xl" className="flex-1"` z inline price
    label `Dodaj do koszyka — {total}` (bundle pattern; zastąpił
    poprzednie 2 wiersze "Cena jednostkowa" + split button). Stepper
    h-12 kontener z h-11 w-11 touch-target +/- (M13 Fazy 3 44px
    preserved). **NEW optional prop `defaults?: { variantId, addonIds,
    quantity } | null`** + `buildSelected` helper — używane przez
    edit-pencil flow (commit 8). Addition-only, backward compat;
    LandingPage konsument bez defaults działa jak wcześniej.
  - **VariantPicker** (commit `532d869`): tile `border-2` always
    (idle + active) → zapobiega 1px height jump przy zmianie selekcji;
    active `border-primary bg-primary/5`, idle `border-slate-200
    hover:border-slate-300`. Custom radio dot `w-4 h-4 rounded-full
    border-2` (idle slate-300 / active primary z inner `w-2 h-2
    bg-primary`). Native `<input type="radio" className="sr-only">`
    zachowany dla keyboard nav / screen reader. Header: legend
    "Rozmiar" + right-aligned hint "Wybierz jeden" text-[11px]
    slate-500. Signature propsów bez zmian.
  - **AddonGroupPicker** (commit `0d24772`): addonsy w `grid-cols-1
    sm:grid-cols-2` (bundle desktop pattern). Tile `border p-3 rounded-md
    text-[13px]`, active `border-primary bg-primary/5`. G1 Checkbox
    primitive konsumowany bez zmian (data-[state=checked] already
    renders bg-primary + Check ikonkę). Range hint `text-[11px]`
    (rose-600 gdy invalid). Price "+X,YY PLN" whitespace-nowrap lub
    "gratis" dla 0-zł.
  - **CartDrawer** (commit `bdb40f5`): major rebuild — responsive
    side picked per viewport via inline `useIsMobileViewport()`
    (window.matchMedia `"(max-width: 767px)"`) — **bez nowego
    shared hooka / dependency**, tylko lokalne window API. Desktop
    slide-in-right `sm:max-w-[440px]`; mobile bottom sheet
    `rounded-t-xl max-h-[92vh]`. Header: title text-[17px] +
    PL-deklinowane "pozycja/pozycje/pozycji" + custom X (showClose
    =false na SheetContent żeby uniknąć duplikacji). Body `px-6
    divide-y`. **CartLineRow**: miniatura `w-20 h-20 rounded-lg`
    (bump z w-16), title + cena mono baseline, **meta zagregowane
    inline** `"{variant} · +addon1, +addon2"` text-[11px] slate-500
    (zastępuje poprzednią `<ul>` listę bullet-per-addon — bundle
    pattern), stepper `h-11 w-11 mobile / h-8 w-8 desktop` (44px
    touch preserved), **edit pencil** (lucide `Edit3`) obok trash —
    renderowany tylko gdy `onEdit` prop podany. Footer `bg-slate-50
    px-6 py-4 border-t` z "Podsuma" label + mono price + G1 Button
    `size="xl" w-full` "Przejdź do kasy →". **Empty state** via G1
    `EmptyState` primitive (`ShoppingBag` ikonka + "Twój koszyk jest
    pusty" + opis + CTA "Przeglądaj menu"). Trash: toast `"Usunięto:
    {name}"` (bez undo — poza G4 scope). **NEW optional props**
    `onEdit?: (item) => void`, `onBrowseMenu?: () => void` —
    addition-only, LandingPage konsument (bez onEdit) po prostu nie
    renderuje edit pencil. cartStore.buildLineKey (AD-014) / persist
    key / action API NIETKNIĘTE.
  - **CartButton + MobileCartBar** (commit `a20992d`): CartButton
    badge `ring-2 ring-white` dla kontrastu na kolorowych tłach (hero,
    photo); -right-1 -top-1 offset pod ring. MobileCartBar custom
    `<button>` → G1 Button `variant="primary" size="xl"
    className="w-full justify-between"` (justify-between override
    defaultowego justify-center via twMerge). Mono total dla
    alignment z cart drawer + modal. `count === 0 → null` + `md:hidden`
    zachowane.
  - **Edit pencil flow w MenuPage** (commit `fb90a15`): new state
    `editDefaults: ProductModalDefaults | null`, handler
    `handleEditCartItem(item)` — find PublicProductDto w usePublicMenu
    cache po productId, gdy missing/unavailable toast error i bail
    (bez mutacji cartStore); w happy path: setEditDefaults z item
    (variantId + addonIds map z CartAddon[] + quantity), setSelected
    (product), **removeItem(item.lineKey)**, setCartOpen(false) —
    modal zastępuje drawer (brak z-index stacking). `handleOpenProduct`
    dla ProductCard kliknięcia resetuje editDefaults (żeby nie leak'ować
    do fresh add flow). `handleModalOpenChange` resetuje selected +
    editDefaults na close. **AD-014 line key zachowany**: edit = remove
    old + modal z pre-fill → user klika "Dodaj" → nowa linia whose
    key zależy od nowego `(productId, variantId, sortedAddonIds)` tuple
    (może scalić się z inną identyczną konfiguracją lub utworzyć fresh).
  - **Zero zmian**: backend (Java, Flyway, DTO, services, Bean
    Validation), router.tsx, providers.tsx, ThemeBootstrap,
    themeLoader, usePublicSettings, authStore, PublicNav /
    PublicFooter (G2+G3), LandingPage sekcje (G3), CheckoutPage /
    OrderConfirmationPage / TrackingPage (G5 scope), admin/* (G6 +
    Faza 4), G1 shared primitives (Button, Input, Sheet, Dialog,
    Checkbox, RadioGroup, Label, Card, EmptyState, Skeleton —
    konsumuję bez modyfikacji), hooki usePublicMenu / useMenuPrice
    (signature + return shape) / cartStore (`buildLineKey` AD-014
    tuple + `addItem`/`updateQuantity`/`removeItem`/`clear` + persist
    key `pizza-showcase-cart` + MAX_QUANTITY_PER_LINE 99), query keys
    `["public","menu"]`, mutation keys, Zod schemas, AD-010 URL
    zdjęć, AD-014 line key, AD-016 server-side totals, PaymentMethod
    enum (G5 scope), CreateOrderItemRequest payload shape
    `addonIds: Long[]` (weryfikowane w CheckoutPage.tsx:205-210 —
    CartItem.addons[].addonId pole nietknięte).
  - **Smoke automatyczny**: `npm run build` zielone (tsc + vite,
    1.66s ostatni commit, bundle 736.46 kB — +6.65 kB vs G2+G3
    baseline 729.81 kB: nowe lucide icony Edit3/ShoppingBag/X,
    rebuilt ProductModal + CartDrawer JSX, matchMedia wrapper,
    akceptowalne).
  - **Smoke manualny do zrobienia przez usera**:
    - **G4 acceptance (375 + 1280)**: MenuPage hero + kicker, grid
      produktów w nowym styl (hover lift + shadow), CategoryTabs
      pill primary/10 sticky (nie chowa się pod PublicNav), klik
      produkt → ProductModal (desktop centered rounded-2xl, mobile
      bottom-sheet rounded-t-xl), wariant 30/40cm → cena w sticky
      footer CTA aktualizuje live, addon toggle → cena update,
      stepper + Button xl "Dodaj do koszyka — X,YY PLN"; klik
      CartButton → CartDrawer (desktop slide-in right, mobile bottom
      sheet), line item miniatura w-20 + meta inline + stepper
      h-11/h-8 + edit pencil + trash, **AD-014 kleje**: dodaj
      Margherita 30cm + addon A → zamknij → ponownie identyczna
      konfiguracja → CartDrawer pokazuje JEDNĄ linię qty=2;
      **edit pencil**: klik edit → drawer zamyka, modal otwiera
      z pre-filled variant/addons/qty, stara linia usunięta;
      modyfikuj → Dodaj → AD-014 merge lub nowa linia;
      empty state: clear → EmptyState z CTA "Przeglądaj menu";
      MobileCartBar: count>0 widoczny, count=0 null, md:hidden;
      CTA "Przejdź do kasy →" → /checkout (G5 stare UI).
    - **Regresja G1 / G6 / G2+G3 / Faz 1-5**: Landing (G2+G3) bez
      zmian wizualnych; Admin (G6 + Faza 4) bez zmian; SSE admin
      1 połączenie, bez reconnect; theme swap primary color
      propaguje do CategoryTabs/ProductCard/CartDrawer po refresh;
      `POST /api/public/orders` pełny payload (warianty + addonIds
      Long[]) → 201 z orderNumber + trackingToken (kontrakt backend
      niezmieniony); Checkout → OrderConfirmation → Tracking 15s
      polling + terminal guard nienaruszone.

- [x] Grupa 5: Checkout + Confirmation + Tracking (2026-04-24, branch
  `design/g5-checkout-tracking`)
  - **CheckoutPage rebuild** (commit `1748a63`): desktop `grid-cols-
    [1fr_420px] gap-8` z sticky summary po prawej, mobile collapsible
    summary bar u góry (`useState` driven, ChevronDown rotation,
    expanded body pokazuje full item list) + sticky bottom CTA
    zachowany. Sekcje jako `rounded-xl border bg-white p-5 md:p-6`
    z numerowanymi mono kickerami `font-mono text-[10px] tracking-
    [0.22em] uppercase text-slate-400` ("1 · Dane kontaktowe",
    "2 · Typ realizacji", "3 · Adres dostawy" gdy DELIVERY,
    "3/4 · Metoda płatności", "4/5 · Uwagi"). Fulfillment tiles jako
    custom `<button role=radio aria-checked>` z lucide `Truck` /
    `ShoppingBag` + static copy "~35 min pod Twoje drzwi" /
    "~25 min od złożenia" (analogia Hero meta-bar — brak DB source).
    Payment rendered jako single tile zależny od fulfillment
    (enum logic nietkniety). Inline validation: dopiąłem G1
    `Input.error` / `Textarea.error` do wszystkich pól + nowy
    `InlineError` helper z `AlertCircle` + rose-600 message pod
    polem. Zachowane 1:1: cartStore, placeOrder mutation, Zod
    schema, `!restaurantIsOpen` banner + disabled CTA,
    `items.length===0 → /menu` guard, location.state
    `{ trackingToken, total }` shape dla confirmation navigate.
    H1 28px mobile / 36px desktop.
  - **OrderConfirmationPage rebuild** (commit `29925da`): centered
    `w-full md:w-[580px]` card `rounded-2xl p-8/p-10 text-center`.
    Success icon przerzucony z emerald-100 ring na primary-10
    circle + `CircleCheck` w primary color (bundle spec: success
    na tej stronie = primary, nie status-success green).
    One-shot mount animacja via tw-animate-css `animate-in fade-in
    zoom-in-50 duration-500` (nie infinite). Order number
    w dedykowanym `inline-block rounded-xl bg-slate-50 border px-6
    py-5` z mono kickerem "Numer zamówienia" + mono responsive
    scale 28→32→40px (świadomie zjechałem z brief'u 64px — bundle
    używa 32px, czytelne z 2m, bez dominowania nad CTA). Primary
    CTA "Śledź zamówienie →" G1 `size="xl"`, full-width mobile /
    auto desktop. Amber state-loss notice zachowany dla refresh
    case. "← Wróć do menu" pojedynczy link (usunąłem redundant
    "Strona główna"). Drugi summary card pominięty świadomie —
    `OrderConfirmationDto` nie ma items, cart cleared on success,
    a tracking page jest jeden klik dalej. PROSTSZE WYGRYWA.
  - **TrackingTimeline extracted** (commit `c85fa1c`): nowy komponent
    `features/public/order/components/TrackingTimeline.tsx`
    renderujący oba layouty — `hidden lg:block` desktop horizontal
    (absolute-positioned slate/emerald progress bar + flex column
    per step) + `lg:hidden` mobile vertical `<ol>` (konektor via
    absolute segment z done=emerald / future=slate). Per-status
    icon mapping (lucide): `NEW → CircleCheck`,
    `CONFIRMED → ClipboardCheck`, `IN_PREPARATION → Flame`,
    `READY → PackageCheck`, `OUT_FOR_DELIVERY → Truck`,
    `DELIVERED → Home`. Done steps override icon z `Check` na
    emerald-500 fill. Active step ma trzy warstwy: G1
    `animate-dotpulse` keyframe + Tailwind `animate-ping` halo
    (`bg-primary/35`) + static `border-primary/40` inset ring.
    Breakpoint `lg:` 1024px — tablet portrait 768-1023 dostaje
    vertical layout (6 horizontal × 130px = 780px + card padding
    clippowałoby na tablecie). `STATUS_LABELS` export dla
    konsumenta TrackingPage. **Bez timestampów per krok** —
    `OrderTrackingDto` ich nie zawiera (risk #1 plan §7,
    akceptowane).
  - **TrackingPage rebuild** (commit `808d583`): konsumuje
    `TrackingTimeline`. Layout: header (mono kicker + mono 28/32/44px
    number + sub "Złożone X temu · Dostawa do {address} |
    Odbiór osobisty w lokalu" + top-right `RefreshCw` indicator
    z `dataUpdatedAt` relatywnym czasem) → timeline (hidden when
    CANCELED, zastąpiony rose-200 info card z `XCircle` +
    klikalnym phone) → grid-md `1.2fr/1fr` z inline **dark ETA
    card** + outline **phone support card** → fulfillment-detail
    card → items card z totalem. **Lokalna STATUS_BADGE mapa
    usunięta**, zastąpiona TrackingTimeline. Physical move
    `OrderStatusBadge` do `shared/` odłożony do G7 (tam ma
    konsumenta public+admin; G5 timeline badge'a nie używa).
  - **ETA card — backend audit (read-only) + degraded implementation:**
    `order.domain.Order.etaMinutes: Integer` nullable.
    `OrderStatusService.updateEta` kopiuje literalnie
    `UpdateOrderEtaRequest.minutesFromNow` do encji (bez transformacji,
    bez `etaSetAt` kolumny). `PublicOrderQueryService` zwraca
    `getEtaMinutes()` as-is. Net: `etaMinutes` = intent-snapshot
    od ostatniego admin-update, bez reference timestamp. Ani
    interpretacja (a) placedAt-offset ani (b) absolute countdown nie
    da się zrekonstruować clientsided reliably. **Implementacja:**
    duża mono `~${etaMinutes}` + "minut do dostawy/odbioru" subtitle
    (bez wall-clock time, bez progress bar). Gdy `etaMinutes===null`:
    "ustalamy…" + copy o 15s auto-refresh. Gdy status w
    `{READY, OUT_FOR_DELIVERY}`: helper text pod liczbą.
    Honest > pretty per plan §7 risk #2.
  - **Phone CTA**: `usePublicSettings().phone` z `tel:` hrefem wokół
    G1 outline Button z `Phone` ikoną, fallback disabled gdy phone
    null.
  - **Zero zmian**: backend (zero linii Java), router, DTO/API shape
    (`CreateOrderRequest`, `OrderConfirmationDto`, `OrderTrackingDto`),
    query/mutation keys (`["order","track",token]`), cartStore,
    PaymentMethod enum, Zod schema, `refetchInterval` 15s + TERMINAL
    guard, 404 handling, `extractProblem`, G1 shared primitives
    (addition-only usage via className, zero modyfikacji
    `Button`/`Input`/`Textarea`/`Label`/`RadioGroup`). OrderStatusBadge
    admin konsumenci (`OrdersListPage`, `OrderDetailPage`,
    `OrderStatusHistory`, `OrderStatusActions`) nietknięci.
    `useIsRestaurantOpen`, `usePublicSettings`, `useAddressGeocode`
    hook signatures bez zmian.
  - **Smoke automatyczny**: `npm run build` zielone (tsc + vite,
    742.69 kB — +12.88 kB vs G4 729.81: lucide icons Truck,
    ShoppingBag, AlertCircle, ChevronDown, CircleCheck,
    ClipboardCheck, Flame, PackageCheck, Home, Phone, RefreshCw,
    XCircle, Check + TrackingTimeline component + rebuild JSX
    trzech ekranów — akceptowalne). Grep audit: `STATUS_BADGE`
    zero hitów, `OrderStatusBadge` tylko 4 admin consumers
    (OrdersListPage, OrderDetailPage, OrderStatusHistory,
    OrderStatusActions) — public zero.
  - **Świadome pominięcia / flagi do G7/post-MVP**:
    - Bundle checkbox "Akceptuję regulamin + PP" NIE dodany — brak
      pola w DTO, brak linków regulamin/PP w produkcie. Post-MVP.
    - Bundle second summary card na Confirmation NIE dodany — brak
      items w `OrderConfirmationDto`, cart cleared; tracking page
      ma pełne dane.
    - Bundle mobile tracking active-step helper text "W toku —
      pizza jest w piecu" NIE dodany — hardcoded content łamie
      CLAUDE.md §8.
    - Bundle timeline timestamps "18:12 / 18:13" per krok NIE
      renderowane — brak `statusHistory[]` w `OrderTrackingDto`
      (tylko admin DTO je ma, plan §8 stop trigger jeśli public
      miałby to dostać — scope G5 nie).
    - Bundle ETA absolute clock time "18:45" + progress bar NIE
      renderowane — backend semantyka nie pozwala rekonstrukcji
      reliably (patrz backend audit powyżej).
    - OrderStatusBadge physical move do `shared/` odłożony do G7
      (konsument public pojawi się tam).
    - EtaCard + SupportCard — inline w TrackingPage, nie osobne
      pliki (jedyni konsumenci; ekstrakcja przy drugim użyciu
      w G7 jeśli admin chce reuse skinu).
    - CancelOrderDialog (ekran 12b) + `dangerOutline` Anuluj na
      OrderStatusActions (G7 scope per MIGRATION_PLAN §Grupa 7).
  - **Smoke manualny do zrobienia przez usera** — 5-min spot-check
    order flow e2e (`/menu` → cart → `/checkout` → submit →
    `/order/confirmation/:n` → klik "Śledź zamówienie" → `/track/
    {token}` → admin zmienia status → klient widzi w ≤15s →
    DELIVERED → polling stops per Network tab).

- [x] Grupa 7: Admin Orders (2026-04-25, branch `design/g7-admin-orders`)
  - **Pre-flight korekta**: poprzednia sesja flag-owała `AdminOrderDto.
    etaSetAt` jako brakujące — weryfikacja `grep -r etaSetAt
    backend/src/main/java` wykazała pole obecne na obu DTO
    (`AdminOrderDto`, `OrderTrackingDto`) od V9. Dzięki temu dark ETA
    card na detail page i panel "Aktualne ETA" w EtaDialog dostały
    feature "ustawione X min temu" bez zmian w backendzie. Frontendowy
    typ uzupełniony ADD-ONLY (commit `aee2a13`).
  - **OrderStatusBadge → shared/components** (commit `7e25670`):
    przeniesione z `features/admin/orders/components/` do
    `shared/components/OrderStatusBadge.tsx` (decyzja #2 z pre-G1).
    `Badge` primitive G1 dostał prop `size?: "sm" | "lg"`
    (`sm` = obecny default `px-2.5 py-0.5 text-xs`,
    `lg` = `px-3 py-1 text-[13px]` z `components.md`).
    `OrderStatusBadge` przyjmuje ten sam prop, mapping status→intent
    bez zmian (NEW=primary, CONFIRMED=info, IN_PREPARATION/
    OUT_FOR_DELIVERY=warning, READY=success, DELIVERED=muted,
    CANCELED=danger). 4 importerów zaktualizowane (OrdersListPage,
    OrderDetailPage, OrderStatusActions, OrderStatusHistory).
  - **OrdersListPage rebuild** (commit `cb75fee`): nowa 8-kolumnowa
    tabela `<colgroup>` (148/108/fluid/84/108/160/72/96): Numer |
    Złożone | Klient | Pozycje | Typ | Status | ETA | Kwota. NEW row
    highlight: `bg-primary/[0.03]` + pulsująca kropka primary `w-2
    h-2 rounded-full animate-pulse` w pierwszej komórce — operatora
    oko trafia najpierw na zamówienia wymagające akcji. Mono na
    numerze/czasie/itemsCount/eta/kwocie, kwota right-aligned, dawna
    kolumna "Akcja" usunięta — sam orderNumber jest linkiem do
    detail. Stagger entrance via `tw-animate-css` (`animate-in
    fade-in slide-in-from-bottom-1 duration-300` z
    `animationDelay: i*30ms`, capped na 12 rzędów żeby SSE
    invalidate nie kaskadował na dużych listach).
  - **OrderFilters chip toolbar** (commit `153dad1`): Select
    dropdownsy zastąpione horyzontalnymi rzędami chipów — operator
    skanuje wszystkie opcje status/typ jednym spojrzeniem zamiast
    klikać i czytać. Aktywny chip inwertuje na `bg-slate-900
    text-white`, nieaktywny `bg-white border-slate-200`. Date range
    inline w trzecim rzędzie, "Wyczyść filtry" floats right gdy
    cokolwiek aktywne. Single-select per oś (radio behavior)
    zachowane bez zmian. Zero nowych npm deps.
  - **OrderDetailPage rebuild** (commit `aee2a13`): mono header
    `text-[40px] font-semibold tracking-tight` z numerem +
    `OrderStatusBadge size="lg"` obok, meta line "Złożone {X temu} ·
    {Dostawa|Odbiór} · {payment}" pod spodem. Layout grid `grid-cols-
    1 lg:grid-cols-[1fr_420px] gap-6`: lewa kolumna = Pozycje +
    Klient (z address inline gdy DELIVERY + "Otwórz w mapie" link
    do `https://www.google.com/maps/search/?api=1&query=...`) +
    Płatność, prawa = amber notes (conditional `customerNotes`) +
    dark ETA card `rounded-lg bg-slate-900 text-white p-6` z mono
    `text-[48px]` minutes + "ustawione X min temu" gdy `etaSetAt` +
    Historia statusów. Nowy util
    `features/admin/orders/lib/etaRelativeTime.ts` z
    `computeEtaRelativeTime` — gałąź `>120 min → "ustawione dawno"`
    sygnalizuje stale ETA (operator ma odświeżyć). Type
    `AdminOrderDto.etaSetAt: string | null` dodany ADD-ONLY.
  - **PrimaryActionCta lookup + dangerOutline cancel slot — flagship
    Pani Kasia** (commit `533ee04`): `OrderStatusActions` przejmuje
    cały actions block. Top: `<NextStepCta>` wrapper `border-2
    border-primary/20 rounded-lg p-5` z kicker "NASTĘPNY KROK"
    mono-caps 11px text-slate-500, primary Button `size="xl"` (h-16,
    64px) z label z lookup table (status×fulfillmentType), info
    ikona `lucide-react/Info` 14px + helper 12px text-slate-500
    "Następnie: ...". Bottom secondary row `pt-9` z "Zmień ETA"
    outline lg + "Anuluj zamówienie" dangerOutline lg. Terminal
    status (DELIVERED/CANCELED) renderuje muted banner zamiast CTA.
    Lookup zweryfikowany 1:1 vs `transitions.ts.canTransitionTo`,
    runtime sanity check w DEV (console.warn na mismatch). Cancel +
    ETA dialogs callbackami w OrderDetailPage.
  - **OrderStatusHistory vertical timeline** (commit `f4d3b35`):
    `<ol>` z `pl-5` + absolutną pionową linią konektora `bg-slate-200
    w-px`. Najnowszy entry = primary dot `ring-2 ring-primary/30`,
    starsze = emerald-500 dot. Reverse-chrono (najnowszy na górze).
    `<time dateTime>` element dla a11y, `changedBy` zachowane.
  - **EtaDialog presety + Aktualne ETA panel** (commit `080cf7c`):
    presety `[10,20,30,45,60]` (z bundla; było `[15,30,45,60]`),
    grid 5-col. Powyżej presets nowy panel `bg-slate-50 rounded p-3`:
    "Aktualne ETA: {minutes} min" w mono + `text-slate-500`
    "ustawione {relative_time(etaSetAt)}" gdy `etaSetAt` set.
    Default selected = `currentEtaMinutes` jeśli match preset,
    inaczej first preset (10). State resetuje się przy każdym
    otwarciu. Re-render co 60s przez lokalny `setInterval` (tylko
    podczas open) — relative time stays fresh w długo otwartym
    dialogu bez wyciekania timerów.
  - **CancelOrderDialog** (commit `16a36a6`): dialog 520px z header
    `lucide-react/AlertTriangle` icon w rose-100/rose-600 + tytuł
    "Anulować zamówienie {orderNumber}?" (mono na numerze). Body:
    info paragraph "Klient zobaczy zmianę statusu na stronie
    śledzenia. Tej akcji nie można cofnąć." + textarea 4 rows
    "Powód anulowania (opcjonalny, tylko do Twoich notatek)" +
    Checkbox required "Rozumiem, że ta akcja jest nieodwracalna"
    (CTA disabled gdy unchecked). Footer: "Zachowaj zamówienie"
    ghost + "Anuluj zamówienie" dangerOutline (rose border, NIE
    solid red — bundle visual contradicted by components.md, plan
    supersedes). **Reason field NIE przekazywany do API** —
    `UpdateOrderStatusRequest` backend DTO ma tylko `{version,
    status}`. Pole istnieje tylko po to, żeby operator zatrzymał
    się i pomyślał. Komentarz w kodzie wyjaśnia wiring point gdy/
    jeśli backend doda `cancellation_reason`. State resetuje się
    przy każdym otwarciu.
  - **Zero zmian**: backend (0 linii Java/SQL dotkniętych),
    `useAdminOrderFeed` mount point i sygnatura,
    `useUpdateOrderStatus`/`useUpdateOrderEta` mutations + 409
    handling pattern (reused w OrderDetailPage),
    `transitions.ts` (read-only consumer), routing, query keys
    (`["admin","orders","list",query]` /
    `["admin","orders","detail",id]` /
    `["admin","dashboard","summary"]`), shared UI G1 prymitywy
    (Button/Card/Sheet/Dialog) — addition only `size` prop na Badge,
    framer-motion (decyzja #5 — używamy `tw-animate-css` only),
    cartStore.
  - **Świadome pominięcia / flagi**:
    - **`reason` field local-only** w CancelOrderDialog — zostaje
      pole, nie zostaje wartość. Per pre-flight korekta #2 backend
      nie ma kolumny ani parametru. Decyzja: zachowujemy pole jako
      friction-by-design + komentarz w kodzie.
    - **Screenshoty before/after manual fallback per user decision**
      — tooling pominięty w sesji, user wykona Snipping Tool
      (Win+Shift+S) 6 zrzutów do `docs/design/before-after/` po
      verify pass. Folder już zsetupowany w commit `948dd29`.
    - **Bundle CancelOrderModal `variant="danger"` (red solid)
      contradicts components.md `dangerOutline`** — plan supersedes
      bundle, użyto `dangerOutline` (zachowuje hierarchię vs orange
      primary).
    - **Bundle size cap +5KB JS przekroczony o 2.44KB**: G7 koniec
      751.62 kB vs G6 baseline 744.18 kB = +7.44 kB. Główni
      kontrybutorzy: lucide-react ikony (`Info`, `AlertTriangle`),
      CancelOrderDialog dialog (+1.81 kB), OrdersListPage rebuild
      (+1.77 kB). Wszystkie justified — zero przypadkowego dead
      code'u, ale przekroczenie odnotowane do uwagi w G8/G9.
    - **`itemsCount` na list DTO** wykorzystany jak był na
      `AdminOrderListItemDto` — nie dodawano nowych pól.
    - **Mobile 375 layout** — OrdersListPage używa
      `overflow-x-auto` z Table primitive (suma kolumn ~776px,
      mobile = horizontal scroll, akceptowalne dla admin which is
      desktop-primary). CancelOrderDialog `max-w-[520px]` z
      auto-shrink na małym viewport.
  - **Smoke automatyczny**: `npm run build` zielony po każdym
    commicie (a-h), TypeScript strict + Vite. Końcowy bundle
    751.62 kB JS / 53.36 kB CSS / 221.87 kB gzip JS, build time
    ~2s. `./gradlew build` nie ruszany (backend zero zmian).
  - **Smoke manualny do zrobienia przez usera** (5-10 min spot-check):
    - DELIVERY full flow przez wszystkie status transitions: NEW →
      CONFIRMED → IN_PREPARATION → READY → OUT_FOR_DELIVERY →
      DELIVERED — weryfikacja CTA label + helper text per krok
    - PICKUP full flow: NEW → CONFIRMED → IN_PREPARATION → READY →
      DELIVERED (skip OUT_FOR_DELIVERY)
    - Cancel flow: z każdego non-terminal status, reason field
      przyjmuje tekst, checkbox blokuje submit, submit zmienia
      status na CANCELED, lista invalidates
    - ETA flow: open dialog, panel "Aktualne ETA" widoczny ze
      względnym czasem, change preset + custom, submit, dark card
      na detail page update
    - 409 test: dwóch operatorów, jeden zmienia status, drugi
      próbuje — toast "Ktoś inny zmienił zamówienie"
    - SSE stability: drugi browser tworzy zamówienie, lista admin
      pokazuje NEW row z dot pulse
    - Mobile 375: OrdersListPage horizontal scroll, OrderDetailPage
      stack, CancelOrderDialog auto-shrink
    - Theme swap: zmiana `--primary` → wszystkie odwołania reagują
      (NEW dot, primary CTA, NextStepCta border, badge intent
      primary)
  - **Pani Kasia checklist (10 punktów z pre-G1 zasady)**:
    1. ✓ Jeden dominujący CTA per ekran — PrimaryActionCta `size=
       "xl"` (h-16, 64px) jako jedyny solid primary na detail page
    2. ✓ Konkretny label CTA — lookup status×fulfillmentType
       ("Wydaj kurierowi →", nie "Zmień status")
    3. ✓ Micro-helper pod CTA — 12px `text-slate-500` z `Info` icon,
       "Następnie: ..."
    4. ✓ Destruktywne jako outline — Anuluj = `dangerOutline` (rose
       border), NIE solid red
    5. ✓ Status badge widoczny w 2 miejscach — header `lg` + lista
       `sm`
    6. ✓ NEW row highlight optycznie wyróżnia świeże zamówienia —
       dot pulse + bg-primary/[0.03]
    7. ✓ Mono na numerach/czasach/kwotach — szybki scan oka
    8. G1-default Theme tokens (primary `#FF6B35`) używane przez
       semantyczny token, zero hardcoded hex
    9. ✓ Mobile 375 audit — overflow-x-auto na liście, dialog
       auto-shrink, CTA `w-full` w wrapperze
    10. ✓ Confirmation friction na cancel — checkbox required +
        reason textarea (lokalny placeholder)

- [x] Grupa 8: Admin Menu CRUD (2026-04-25, branch `design/g8-admin-menu`)
  - **MenuOverviewPage** (commit `51123d5`): page header w G6/G7 admin
    pattern — kicker mono "Panel" (G1 `.kicker` utility) + H1
    `text-[28px] tracking-tight` "Menu" + sub `text-[14px] slate-500`.
    Underline tab nav per bundle `menu-mgmt.jsx`: zamiast G1 default
    pill (`bg-slate-100 p-1`) — `TabsList` className override
    `bg-transparent p-0 h-auto rounded-none border-b border-slate-200`
    + `TabsTrigger` override `data-[state=active]:bg-transparent
    data-[state=active]:shadow-none data-[state=active]:border-b-2
    data-[state=active]:border-primary -mb-px rounded-none px-4 py-3`.
    twMerge przepuszcza defaults. Surface `<Tabs>` primitive
    NIETKNIĘTY (G1 closed). `?tab=` query param + sub-component
    composition zachowane.
  - **CategoriesList** (commit `74915be`): shared `<Table>` primitive
    (G7 OrdersListPage:178-207 wzorzec) z `<colgroup>` (64/auto/120/
    180/120) i mono-caps `text-[11px]` headers. Kolumny: Lp. (mono
    `01`/`02` text-slate-400), Nazwa + slug pod (mono text-[11px]
    slate-400), Produkty (mono, hidden md:), Widoczna (G1 Switch +
    "Tak"/"Nie" inline), Akcje (icon buttons, rose-50/rose-600 hover
    dla trash). **NEW lokalny `visibilityMutation`** reusing
    `updateAdminCategory` z full payload (version round-trip
    preserved per AD-009 + Faza 2 hotfix). Invalidates `["admin",
    "menu","categories"]` + `["public","menu"]` — public `/menu`
    propaguje natychmiast po toggle. EmptyState primitive (G1) z
    UtensilsCrossed ikonką + CTA "+ Dodaj pierwszą kategorię".
  - **ProductsList** (commit `11536c0`): rebuild w admin-list table
    pattern — toolbar (search input z Search ikonką h-10 client-side
    filter na nazwie+slug, category Select server-side, NEW
    availability Select client-side "Wszystkie/Dostępne/Niedostępne"),
    table z `<colgroup>` 64/auto/140/110/100/180/100. Image cell:
    40×40 button rounded-md ze stripe pattern background (inline
    `repeating-linear-gradient` per `tokens.md` §Placeholder), `<img>`
    on top z `onError={hide}` — fail = stripe widoczny przez. Klik
    miniatury = navigate do edit. Cena mono right-align semibold,
    Kategoria jako G1 `<Badge variant="default">`, Warianty z
    PL-pluralized count. Switch availability inline + label
    "Dostępny"/"Niedostępny" — istniejący `availabilityMutation`
    (PATCH endpoint) + invalidate `["public","menu"]` 1:1. Wiersz
    `opacity-70` gdy `!available`. EmptyState primitive z kontekstem
    (filtry vs no-data). Pagination footer z "Pokazano X z Y" gdy
    aktywny client-side filter.
  - **ProductEditPage** (commit `98c2012`): major rebuild — header
    back-link "← Produkty" + H1 `text-[24px] tracking-tight` + slug
    mono `text-[12px]` pod tytułem. 4 G1 Cards (Dane podstawowe /
    Cena bazowa / Zdjęcie / Dostępność) z lucide ikonami w CardTitle
    (UtensilsCrossed/Wallet/ImageIcon/Tag), grid 2-col desktop. "Cena
    bazowa" Input z `font-mono` + "zł" suffix span (relative w-48
    wrapper). "Zdjęcie" Card: grid `1fr_220px`, lewo URL Input z
    helperem rekomendującym Unsplash; prawo kicker "Podgląd" +
    `aspect-[4/3]` kontener z stripe pattern background, `<img
    key={previewUrl}>` on top z `onError={hide}` — `key` na URL
    zapewnia fresh DOM node przy zmianie URL (no stale display:none).
    "Dostępność" Card jako single bordered row z dynamicznym
    explainerem. **NEW footer split**: dangerOutline "Usuń produkt"
    lewo (przeniesiony inline `deleteAdminProduct` mutation —
    poprzednio dostępny tylko z list) + ghost "Anuluj" + primary
    "Zapisz zmiany" prawo. Stack flex-col-reverse na mobile. Container
    `mx-auto max-w-[960px]` per bundle. Version round-trip 1:1.
    AD-010 respected (URL only). VariantsSection +
    AddonGroupsAttachSection renderują się self-contained pod
    formularzem.
  - **VariantsSection** (commit `9a6fb14`): CardTitle + Layers icon,
    description reframed (base-price interaction). Idle row pattern
    `rounded-md border-slate-200 bg-slate-50/50 p-3` z mono price
    right-align. "Dodaj wariant" przeniesiony z CardHeader Button na
    full-width dashed CTA (`h-11 border-dashed border-slate-300
    hover:border-primary hover:text-primary`) pod listą. EmptyState
    primitive zamiast inline border-dashed. Editor row zachowuje
    RHF + Zod + version round-trip 1:1; Cena Input z mono + "zł"
    suffix. Invalidations 1:1 (admin variants/product/products list +
    `["public","menu"]`).
  - **AddonGroupsAttachSection** (commit `7e2f7cb`): CardTitle +
    Layers3 icon. Linked-group rows w VariantsSection idle pattern.
    EmptyState primitive z helper copy. Attach form pod border-t z
    grid `1fr_120px_auto`, NEW link "+ Stwórz nową grupę dodatków →"
    pod selectem (`text-primary hover:underline`) → navigate do
    `?tab=addon-groups`. Mutations + invalidate 1:1.
  - **CategoryFormDialog + AddonGroupFormDialog** (commit `19588e8`):
    DialogTitle bumped do text-[18px], DialogDescription text-[13px].
    Asterisk text-rose-600 dla required name fields. Switch row
    przerobiony z inline label-next-to-Switch na bundle bordered
    pattern (`flex justify-between gap-4 rounded-md border p-3` z
    title + dynamic explainer + Switch po prawej) — match z
    "Dostępność" Card w ProductEditPage. Inputy podpięte do G1
    `error` propa (border-rose-300 + aria-invalid). CategoryFormDialog
    kolejność out-of-grid (single field po lifcie Switcha). Refinements
    Zod (max≥min, required→min≥1) NIETKNIĘTE. Mutations + version
    round-trip + invalidate 1:1.
  - **AddonGroupsList + AddonGroupEditPage** (commit `089b73c`):
    AddonGroupsList = shared Table z `<colgroup>` (auto/100/100/120/
    100/100), kolumny Nazwa (button → navigate) / Zakres (mono `min–
    max`) / Dodatki (mono) / Wymagana (G1 Badge variant warning|muted)
    / Produkty (mono) / Akcje. EmptyState primitive z Layers3 icon +
    "+ Dodaj pierwszą grupę" CTA. AddonGroupEditPage = container
    `mx-auto max-w-[960px]`, back-link "← Grupy dodatków" + H1
    `text-[24px]` + meta line z mono numbers. "Dodatki" Card z
    Sparkles icon, addon rows w VariantsSection idle pattern (price
    "gratis" dla 0 zł). "Dodaj dodatek" full-width dashed CTA.
    EmptyState primitive. Mutations + version round-trip + invalidate
    1:1.
  - **Zero zmian**: backend (zero linii Java/SQL/Flyway), routing
    (`/admin/menu`, `/admin/menu/products/:id|new`, `/admin/menu/
    addon-groups/:id`, `?tab=` query param), query keys (`["admin",
    "menu","categories"|"products"|"product"|"addon-groups"|"addon-
    group"|"variants"|"product-addon-groups"]`) + mutation keys + DTO
    shape + Zod schemas (minSelect/maxSelect refinements,
    `priceStr` regex, `categoryId` coerce), version field round-trip
    we wszystkich update mutations, AD-010 (URL input only),
    `useAdminOrderFeed` mount stability (G6 — żadna G8 strona nie
    konsumuje SSE, AdminLayout nietknięty), shared UI primitives G1
    (Button/Card/Input/Label/Textarea/Switch/Select/Dialog/Badge/
    Table/EmptyState/Skeleton — używane, addition-only via
    className), framer-motion (decyzja #5).
  - **Świadome pominięcia / decyzje pre-implementacyjne**:
    - **Drag-and-drop reorder kategorii skipped** — `@dnd-kit` brak
      w `frontend/package.json`, native HTML5 DnD wymagałby też
      backendowego endpointu reorder (stop trigger). Mono kolejność
      `01`/`02` w 1. kolumnie sygnalizuje porządek; edycja przez
      `displayOrder` field w CategoryFormDialog (existing flow).
      Visual drag handle z bundla pominięty (`cursor-grab` na
      non-functional element = anti-pattern).
    - **Status chip 3-stanowy "Aktywny / Niedostępny chwilowo /
      Wyłączony" pominięty** — DB ma tylko `available: boolean`,
      trzeci stan wymagał backendu (encja + Flyway + DTO + serwis +
      endpoint = stop trigger). Bundle też pokazuje 2 stany.
      2-state Switch + label "Dostępny"/"Niedostępny" wystarcza i
      mapuje 1:1 do PATCH availability flow.
    - **ProductEditPage "Chwilowo niedostępny" drugi Switch pominięty**
      — bundle ma 2 row-y w "Dostępność" Card; DB nie ma drugiego
      pola. Zachowany single row mapujący do `available`.
    - **`<VariantsSection>` i `<AddonGroupsAttachSection>` zostają
      self-contained Cards** — ProductEditPage NIE wrap-uje ich w
      drugi outer Card; sąsiadują z 4 Card sekcjami formularza
      bezpośrednio pod `</form>`.
    - **Slug Input w ProductEditPage pominięty** — bundle ma slug
      Input w "Podstawowe" sekcji, ale per AD-012 slug nie jest
      edytowalny w MVP (auto-derive server-side). Zachowany jako
      read-only `mono text-[12px]` paragraph pod H1.
    - **Search input bez debounce** — client-side filter na <100 row
      tablicy = instant, brak race conditions. Debounce dopiero gdy
      backend dostanie search endpoint.
    - **`+ Nowy produkt` button bez dropdownu kategorii** — bundle
      pokazuje plain primary; jeśli admin nie ma kategorii, button
      `disabled` + amber notice powyżej (zachowany z poprzedniej
      implementacji).
    - **Bundle size: 763.22 kB JS / 54.57 kB CSS / 224.34 kB gzip JS**
      vs G7 baseline 751.62 kB = +11.6 kB JS. Główni kontrybutorzy:
      8 nowych lucide-react ikon (Search, UtensilsCrossed, Wallet,
      ImageIcon, Tag, Layers, Layers3, Sparkles), ProductEditPage
      rebuild (+~3 kB), CategoriesList rebuild (+~2 kB).
      Przekroczenie cap +5kB notatkowane (G7 też miało +7.44 kB) —
      do refaktoringu w G10 jeśli stanie się problemem.
  - **Smoke automatyczny**: `npm run build` zielony po każdym commicie
    (a-h), TypeScript strict + Vite. Końcowy bundle 763.22 kB JS /
    54.57 kB CSS / 224.34 kB gzip JS, build time ~3.3s. `./gradlew
    build` nie ruszany (backend zero zmian).
  - **Smoke manualny do zrobienia przez usera** (5-min spot-check):
    - `/admin/menu` desktop: kicker "Panel" + H1 "Menu" + underline
      taby z aktywnym `border-b-2 border-primary`. URL `?tab=` toggle.
    - **CRUD kategoria**: dodaj kategorię (dialog) → tabela widzi nowy
      wiersz, mono `01`/`02` kolejność, toggle "Widoczna" przełącza
      mutację → invalidate `["public","menu"]`. Edytuj nazwę → zapis
      OK. Usuń (z 0 produktów) → confirm + delete OK.
    - **CRUD produkt z URL zdjęciem**: `/admin/menu?tab=products` →
      "+ Nowy produkt" → wpisz nazwę + wybierz kategorię + wklej
      URL Unsplash → preview `aspect-[4/3]` ładuje, podaj złą URL →
      onError → stripe pattern + caption "product shot · 4:3"
      widoczne. Submit → 201 + navigate do `/admin/menu/products/{id}`,
      VariantsSection + AddonGroupsAttachSection pojawiają się.
    - **Toggle dostępność z listy**: `/admin/menu?tab=products` →
      Switch w kolumnie Dostępność → mutation → label zmienia się na
      "Niedostępny" + wiersz `opacity-70`. Otwórz `/menu` w drugim
      tabie + refresh → produkt wyszarzony / overlay "Chwilowo
      niedostępne".
    - **Variants + 409 test**: w ProductEditPage dodaj wariant "30 cm"
      39.00 zł → row z mono ceną + dashed "+ Dodaj wariant" pod.
      Edit pencil → editor row z border-primary bg-primary/5, zmień
      cenę → 45.00 → Zapisz (network: `version: N` w PUT body).
      Otwórz produkt w 2 tabach, edytuj wariant w A → save; w B
      zmień cenę → save → toast "Nie udało się zapisać wariantu" +
      ProblemDetail 409.
    - **AddonGroups attach**: w ProductEditPage Select grupy + order +
      "Podepnij" → mutation OK. Klik "+ Stwórz nową grupę dodatków →"
      → navigate `?tab=addon-groups`. Detach trash z confirm.
    - **AddonGroupFormDialog refinements**: max=0 + min=1 → error
      "max musi być ≥ min". required=true + min=0 → error "Gdy grupa
      jest wymagana, min musi być ≥ 1".
    - **AddonGroupEditPage**: back-link → `?tab=addon-groups`. Card
      "Dodatki" z inline editor, "Dodaj dodatek" dashed full-width.
      Cena 0 → render "gratis".
    - **Mobile 375**: każda strona scrollowalna, tabele
      `overflow-x-auto`, toolbar Products `flex-col gap-3`,
      ProductEditPage footer `flex-col-reverse` (primary CTA na
      górze).
    - **Theme swap**: w SettingsPage zmień primary color → refresh
      `/admin/menu` → CTA "Zapisz", aktywne taby underline border-
      primary, focus ring inputów, toggle Switch ON, dashed-add hover
      wszystkie reagują.
    - **Regresja G7**: `/admin/orders` lista + detail nietknięte,
      polling 10s, SSE 1 połączenie stabilne (DevTools Network →
      EventStream).

- [x] Grupa 9: Admin Settings (2026-04-25, branch `design/g9-admin-settings`)
  - **Input + Textarea `size` prop** (commit `27a685a`): addition-only
    `size?: "sm" | "md" | "lg"` na obu primitive (default `"md"` =
    h-10, current behavior preserved). Native HTML `size` attribute
    shadowed via `Omit<InputHTMLAttributes, "size">` — verified zero
    existing consumers. **LoginPage migration**: `className="h-11"`
    override z G6 → `size="lg"` (visually pixel-identyczny). Adres
    TODO carry-over z G6: bundle G9 ma 8+ inputów h-11 = drugi
    konsument, refactor at the right moment.
  - **SettingsTabs + SettingsShell** (commit `56d75b4`): wspólny
    sub-nav `Ogólne / Godziny otwarcia / Treści strony` (3 NavLinks
    z `end` matcher, active `border-b-2 border-primary
    font-medium text-slate-900`). `SettingsShell` wrapper z
    kicker "Konfiguracja" + H1 "Ustawienia" + optional description +
    SettingsTabs — używany przez wszystkie 3 strony zamiast
    per-page H1+description. AdminSidebar nav items nietknięte
    (3 osobne pozycje + tabs nav = świadomy duplikat per bundle
    settings.jsx SettingsNav).
  - **SettingsPage rebuild** (commit `b9dc431`): major rebuild
    /admin/settings (ekran 16). Body restructured do 3 SectionCard
    tiles z icon+title header (Utensils/Sparkles/Phone): "Informacje
    o restauracji", "Kolor marki", "Kontakt i adres". Color picker:
    HEX `Input size="lg" font-mono uppercase` + 11×11 swatch
    display tile + 6 brand swatches `#FF6B35, #D4482F, #B8363B,
    #9C5729, #4F6D3B, #2E5A4F` per bundle SettingsGeneral. Click
    swatch → `setValue('primaryColor', ..., shouldDirty +
    shouldValidate)`. Active swatch `border-slate-900 scale-105`.
    **NEW `ColorPreviewCard`** (single consumer, ekstrahowany dla
    czytelności): scoped live preview z Primary button, link, 2 badge,
    mini product card — wszystko inline `style={{ backgroundColor: c
    }}` / `style={{ color: c }}` driven by hex input value (regex
    fallback `#FF6B35` jeśli invalid mid-type). Tinted badge przez
    8-digit hex alpha `${c}1A` (~10%).
  - **FIX BONUS (preview behavior)**: usunięto pre-G9 side-effect
    gdzie typing hex globalnie aplikował primary color przed save
    (`applyPrimaryColor` w useEffect na każdy keystroke). Teraz
    live preview jest scoped do ColorPreviewCard inline-style,
    propagacja globalna **dopiero po save** → invalidate →
    ThemeBootstrap re-applies. Lepszy UX (admin nie widzi panelu
    w nieoczekiwanym kolorze) + fix bug "leave bez save zostawia
    zmieniony CSS var aż do następnego usePublicSettings refresh".
  - **FIX (G6 TODO addressed)**: RHF `defaultValues.primaryColor`
    fallback `#E11D48` → `#FF6B35` — flicker przed initial fetch
    teraz matchuje brand zgodnie z V100 + index.css fallback z G1.
  - **OpeningHoursPage restyle** (commit `db8b8da`): /admin/opening-
    hours (ekran 17). SectionCard z Clock icon, 7 dni jako `<ul
    divide-y -mx-2>` zamiast osobnych bordered rows per bundle.
    Native `<input type="checkbox">` → G1 `Switch` przez RHF
    Controller; `closed` boolean inverted at boundary (Switch
    semantically "open", DTO contract preserved). Status text
    "Otwarte"/"Zamknięte" (slate-900/slate-400) inline. Time inputs
    `w-28 font-mono text-center` (h-10 default = matches bundle dla
    time pickers). "Zamknięte cały dzień" placeholder gdy row
    collapses. Info-banner sky-50 pod kartą "Tylko regularny tydzień.
    Wyjątki świąteczne w kolejnej wersji panelu." (zgodne z ROADMAP).
    Submit CTA → G1 Button `variant="primary"` + Check icon.
  - **DEFERRED w OpeningHoursPage**: "Skopiuj godziny do…" QoL
    button per bundle (D3=A). Bundle pokazuje per-row hover button
    ale nie precyzuje target-day picker UX, scope >30 linii state
    managementu = scope creep dla atomic G9. Dopisane do
    `docs/ROADMAP.md §QoL improvements` jako post-MVP.
  - **PageContentPage rebuild** (commit `a4ba1f7-tbc`): /admin/page-
    content (ekran 18). Layout `lg:grid-cols-[1fr_400px]` z form
    left + sticky preview right (`lg:sticky lg:top-6`); mobile
    collapses do single column. SectionCard z Sparkles (HERO) /
    MessageSquare (ABOUT) icon. HERO/ABOUT segmented control
    rounded-md container z primary active pill zachowany. Form
    fields → `size="lg"` per bundle (title + imageUrl + ctaLabel/
    ctaHref). Live preview pane (NEW `HeroPreview` + `AboutPreview`
    components):
    - `HeroPreview` — image aspect-4/3 (stripe pattern fallback),
      gradient overlay, white title (line-clamp-3), body
      (line-clamp-5), primary CTA
    - `AboutPreview` — image aspect-4/3 (stripe fallback), kicker
      "O NAS", title, whitespace-pre-line body (line-clamp-8)
    - Both fed by `useDebouncedValue(watch(), 300)` — no laggy
      keystrokes; preview updates ~300ms po pause
    - Pane labeled "PODGLĄD LIVE · UPROSZCZONA REPREZENTACJA" —
      admin widzi core elementy, **NIE 1:1 z public HeroSection**
      (Display typography, asymmetric grid). Fork od public landing
      jest świadomy: HeroSection/AboutSection (G3) coupled z
      `usePublicPageContent` hookiem, modyfikacja byłaby poza scope.
  - **NEW shared utility** `useDebouncedValue<T>(value, delayMs)`
    w [shared/hooks/useDebouncedValue.ts] — minimal `setTimeout`-
    based debounce. Sąsiaduje z istniejącymi `useAddressGeocode` /
    `useIsRestaurantOpen`.
  - **Zero zmian**: backend (zero linii Java/SQL/Flyway), API
    (`fetchAdminSettings` / `updateAdminSettings` /
    `fetchAdminOpeningHours` / `updateAdminOpeningHours` /
    `fetchAdminPageContent` / `updateAdminPageContent`) hook
    signatures, query keys (`["admin","settings"]`, `["admin",
    "opening-hours"]`, `["admin","page-content",section]`),
    mutation keys, DTO shape, payload shape, Zod schemas
    (`nullableOptional` helper, `.optional().transform()` Faza 3
    hotfix preserved 1:1 we wszystkich 3 stronach), routing
    (`/admin/settings`, `/admin/opening-hours`, `/admin/page-content`),
    `ThemeBootstrap.tsx` + `themeLoader.ts` core (`applyPrimaryColor`
    nadal wywoływany w `mutation.onSuccess`, tylko keystroke-time
    invocation usunięte z SettingsPage), `usePublicSettings` /
    public konsumenci, `useAdminOrderFeed` mount stability (G6 —
    żadna G9 strona nie konsumuje SSE), public landing
    `HeroSection`/`AboutSection`/`AboutPreview-public` (G3 closed),
    AdminSidebar nav items, framer-motion (decyzja #5).
  - **Bundle delta**: 763.34 → 773.26 kB JS = **+9.92 kB** (G7
    baseline 751.62 → G8 763.22 → G9 773.26). Główni kontrybutorzy:
    7 nowych lucide ikon (Utensils, Phone, Sparkles, Check, Clock,
    Info, MessageSquare), `ColorPreviewCard` (~80 linii inline-
    style preview), `HeroPreview` + `AboutPreview` mini-renderers
    (~50 linii każdy), `SettingsTabs` + `SettingsShell` (~50 linii
    razem), `useDebouncedValue` utility, RHF `Controller` import w
    OpeningHoursPage. Marginalne przekroczenie G9 plan flag
    (+8 kB) — 4 nowe widoki + 1 shared hook + 8 ikon, akceptowalne.
  - **Smoke automatyczny**: `npm run build` zielony po każdym
    commicie (a-e), TypeScript strict + Vite. Końcowy bundle
    773.26 kB JS / ~55 kB CSS / 226 kB gzip JS. `./gradlew build`
    nie ruszany (backend zero zmian).
  - **Świadome decyzje pre-implementacyjne**:
    - **D1=A `Input/Textarea size` prop** — addition-only, default
      `"md"`=h-10 zachowuje obecne zachowanie. LoginPage migration
      atomic w commit (a) przed użyciem w G9 stronach.
    - **D2=A `SettingsTabs` sub-nav** — bundle pattern, lepszy IA
      (jasne że to jedna sekcja). Sidebar 3 osobne pozycje
      zachowane = świadomy duplikat dla nawigacji z poziomu admin
      shell.
    - **D3=A defer "Skopiuj godziny"** — flagged + dopisane do
      `docs/ROADMAP.md §QoL improvements`.
    - **HeroPreview/AboutPreview = uproszczone fork**, NIE
      importujemy `HeroSection`/`AboutSection` z `features/public/
      landing` — coupled z `usePublicPageContent` hookiem; modyfikacja
      public landing byłaby poza G9. Disclaimer w preview header.
    - **300ms debounce** dla page content live preview — comfortable
      feedback bez lag na keystroke; timing matches bundle "po
      paru znakach widać".
    - **Color picker validation + preview safe-fallback**: hex
      validacja regex `^#[0-9A-Fa-f]{6}$`; ColorPreviewCard
      sprawdza regex przed inline-style (fallback `#FF6B35` jeśli
      invalid mid-type, prevents CSS crash z partial hex jak `#FF`).
  - **Smoke manualny do zrobienia przez usera** (5-min spot-check):
    - **Color picker live preview**: `/admin/settings` → wpisz
      `#3B82F6` w HEX input → ColorPreviewCard po prawej (Primary
      button "Zamów online", link "Zobacz całe menu →", "Nowe"
      badge, mini product "Margherita") staje się **niebieski
      natychmiast**. CTA "Zapisz zmiany" + sidebar item "Ustawienia"
      active **POZOSTAJĄ pomarańczowe** (nie save'd). Klik
      "Przywróć" → wraca do oryginalnego koloru. Klik swatch
      `#4F6D3B` (zielony) → input update + preview zielony. Klik
      "Zapisz" → toast OK → cały admin shell przeskakuje na
      zielony, /admin/orders CTA, /menu public CategoryTabs,
      /landing hero CTA — wszystko zielone (regresja G1+
      ThemeBootstrap).
    - **Color picker leave-without-save**: wpisz hex → bez save
      navigate na /admin/orders → CTA "Rozpocznij…" jest **stary
      kolor** (nie pomarańczowy z hex). Wróć na /admin/settings →
      input nadal pokazuje wpisany hex (RHF dirty). Klik "Przywróć"
      → reset.
    - **Fallback initial color**: `localStorage.removeItem` (force
      no cache) → /admin/settings ms-flicker przed fetch =
      `#FF6B35` (pomarańcz, nie róż). Po fetch primary z DB.
    - **Opening hours**: `/admin/opening-hours` desktop → 7 wierszy
      `divide-y` z Switch + status. Toggle Switch poniedziałku →
      "Zamknięte cały dzień" placeholder. Edit time picker
      "12:00" → "13:00" → "Przywróć" przywraca. Save z błędną
      walidacją (otwarcie > zamknięcie poza północą) → 422 +
      error inline. Save valid → toast OK + invalidate → /landing
      hero meta-bar "Dziś otwarte do HH:MM" / "Dziś zamknięte"
      (regresja G3 + Faza 5 M6/2). Info-banner sky-50 widoczny.
      **„Skopiuj godziny" button = brak** (deferred, OK).
    - **Page content HERO live preview**: `/admin/page-content` →
      tab HERO aktywny. Wpisz w "Tytuł" "Test 123" → po ~300ms
      preview po prawej pokazuje "Test 123" w gradient overlay.
      Wpisz w "Podtytuł" → preview body update. Wklej Unsplash URL
      do "URL zdjęcia" → preview image load. Tab ABOUT → preview
      switches (kicker "O NAS" + line-clamp body). Save HERO →
      toast OK + invalidate `["public","page-content"]` →
      /landing Hero `title`/`body`/`imageUrl`/`ctaLabel`
      aktualizowane (regresja Faza 1 + G3).
    - **PageContent debounce verification**: typing fast → preview
      NIE zmienia się przy każdym keystroke; pauza ~300ms →
      preview update raz. Comfortable, no jank.
    - **SettingsTabs**: klik "Godziny otwarcia" w sub-tab → URL
      `/admin/opening-hours`, active border-b-2 border-primary
      moves. Sidebar "Godziny otwarcia" item też active highlight
      (świadomy duplicate).
    - **LoginPage size=lg regression**: wyloguj + `/admin/login` →
      visual identyczny z poprzednim (h-11 inputy email/password,
      xl primary CTA "Zaloguj się"), `tabIndex` keyboard flow OK.
    - **Mobile 375**: SettingsPage Cards stack vertical, swatches
      flex-wrap, ColorPreviewCard pod formem (col-1 reset). Opening
      hours rows `grid-cols-1 sm:grid-cols-[140px_180px_1fr]` —
      mobile single column z dnia stack. PageContent layout single
      column z preview pod formem.
    - **Regresja G1-G8**: /admin/orders polling 10s + SSE 1
      połączenie stable (DevTools Network → EventStream).
      ThemeBootstrap propaguje primary color save end-to-end.

- [x] Grupa 10: Polish przekrojowy (2026-04-26, branch
  `design/g10-polish`)
  - Sesja: plan zaakceptowany, 5 atomowych commitów + 3 NO-OP
    (audyt verified zero blokerów). Bundle optimization (UX-first
    metric), Skeleton/EmptyState consistency closeout, mobile
    audit, Pani Kasia checklist verify, final docs.
  - Commit (a) `feat(design-g10): React.lazy code-split per route
    + RouteFallback`: 17 stron pod `React.lazy()` z named-export
    → default mapping. `Suspense` na poziomie `AppRouter` używa
    nowego `RouteFallback` (shared/components/) który wybiera
    public vs admin shell skeleton po `pathname` (uses G1 Skeleton
    primitive). Vite emituje per-page chunki 3-22 kB JS (1-7 kB
    gzip każdy). Public klient nie pobiera admin chunków, admin
    klient nie pobiera Landing/Menu/Checkout chunków.
  - Commit (b) `vite manualChunks vendor split` — **TESTED &
    REJECTED** empirycznie. Eager preload 5 vendor chunków
    (`react+form+query+radix+ui` = 179 kB gzip combined) na każdej
    nawigacji defeated cel code-split. `form-vendor` z Zod+RHF
    (31 kB gzip) preloadowany na Landing pomimo zero formularzy.
    Naturalny Vite per-dynamic-import-boundary chunking wins —
    każdy lazy route ciągnie tylko swoje deps. Decyzja
    udokumentowana w commit (c) message dla institutional
    knowledge.
  - Commit (c) `chore(design-g10): drop unused framer-motion +
    lucide tree-shake verified`: framer-motion (^12.38.0) miało
    zero importów w `src/` (Decyzja #5 pre-G1 utrzymana). Drop
    czyści 3 packages z node_modules + lockfile. **Lucide-react
    explicit subpath imports refactor (32 plików) considered &
    REJECTED** based on measurement: per-route chunki już
    minimalne (MenuPage 4.76 / OrderDetailPage 5.61 / OrdersList
    2.81 kB gzip), lucide nie pojawia się w initial preload —
    wszystkie ikony lądują w lazy per-route chunkach gdzie
    tree-shaking via `"sideEffects": false` + ESM module entry
    działa naturally. 32 file refactor dałby <2 kB savings przy
    wysokim regression risk.
  - Commit (d) `refactor(design-g10): use Skeleton primitive in
    TrackingPage, OrdersListPage, OrderDetailPage`: G1 created
    Skeleton primitive specifically to replace inline animate-pulse
    divs in these three pages, ale migracja była deferred.
    G10 zamyka gap: TrackingPage TrackingSkeleton 4 inline divs
    → Skeleton, OrdersListPage OrdersListSkeleton 11 inline divs
    → Skeleton, OrderDetailPage OrderDetailSkeleton 7 inline divs
    (incl. dark `bg-slate-900/80` ETA placeholder) → Skeleton.
    Override `bg-slate-200` przez className tw-merge — visual
    layout preserved exactly. Grep `animate-pulse` poza
    `Skeleton.tsx` daje pojedynczy match: OrdersListPage:259
    NEW-row live pulse dot (`bg-primary` z `aria-label="Nowe
    zamówienie"`) — live indicator, nie loading skeleton, kept.
  - Commit (e) `refactor(design-g10): use EmptyState primitive in
    OrdersListPage filtered empty`: rows.length === 0 branch był
    inline plain text bez affordance. Replaced z EmptyState
    (Inbox icon + dynamic title/description + `Wyczyść filtry`
    CTA when filters active) per Pani Kasia rule "empty states
    z affordance 'co kliknąć żeby zacząć'". Two-state copy:
    pristine load ("Nie ma jeszcze żadnych zamówień", no action)
    vs filtered empty ("Brak zamówień dla tych filtrów" + outline
    Wyczyść filtry button). Audit verified 7 other EmptyState
    consumers OK (CartDrawer G4, 6× admin menu lists G8). Jeden
    edge case kept inline: `MenuPage.tsx:136` single-category
    sub-section note "Brak produktów w tej kategorii" — embedded
    sub-section note w public category list, nie standalone empty
    state; EmptyState by overkill (icon + frame inside a category
    section without affordance for public client).
  - Commit (f) `mobile 375 audit` — **NO-OP**. Audit verified zero
    blokerów: z-index uniform (sticky nav z-20 / sticky tabs
    z-10 / mobile bars z-30 / dialogs z-50 — bez kolizji), tabele
    przez `Table` primitive `overflow-x-auto` (admin OrdersListPage
    table-fixed scrolluje horyzontalnie na 375), Display sizes
    responsywne (wszystkie `text-[Npx]` mają sm:/md: scale-up),
    sticky elements separated (top vs bottom nie kolidują), touch
    targets G4 wymusiło `h-11 w-11 sm:h-9 sm:w-9` na cart
    steppers, G7 dialogi z standardowych prymitywów. Design
    responsywność wbudowana w G2-G9, no-corrections needed.
  - Commit (g) `Pani Kasia consistency` — **NO-OP**. Checklist
    9/10 ✓: `#FF6B35` w komponentach (5 wystąpień) wszystkie w
    SettingsPage color picker presets / ColorPreviewCard fallback
    (admin UI pracuje Z hex jako data, nie HARDCODED brand);
    `variant="danger"` (solid) zero w użyciu (tylko
    `dangerOutline` na 3 destruktywnych); `font-mono` spójnie na
    numerach/kwotach/czasach/hex (27 plików); `mono` klasa
    przestrzegana. Jedno design-policy odchylenie vs strict plan:
    `size="xl"` użyte na 8 CTA (Login, ProductModal, CartDrawer,
    MobileCartBar, CheckoutPage×2, OrderConfirmation,
    OrderStatusActions) zamiast tylko OrderDetailPage. To
    konsekwencja decyzji G2-G9 — primary CTA dominujący (Pani
    Kasia "z 2m widoczne") zastosowany na każdy critical primary
    action. **Improvement vs plan, nie regresja.** Flag w raporcie,
    brak refaktoringu. `#faf7f2` cream accent w
    AboutSection/HeroSection — decorative warm accent, NIE primary
    brand, zostaje. TODO/FIXME/HACK zero w kodzie.
  - Commit (h) `docs(design-g10): final CURRENT_STATE redesign
    summary 10/10`: ten wpis + sekcja "Final redesign metrics"
    poniżej.
  - **Bundle optimization decision — UX-first metric (NEW G10
    decision)**: G10 adopted UX-first metric: **initial preload
    on first paint**, not total gzip across all chunks.
    Code-splitting per route reduces initial download (-46%
    public landing: 224 kB single bundle G9 → 122 kB initial
    preload G10) at cost of modest total bytes increase
    (+17%, 224 → 262 kB gzip across all chunks) which users
    never download all-at-once. **Stop trigger #7** ("build
    delta wzrost zamiast redukcji") was triggered on total gzip
    measurement after commits a-c, raised to user, and
    reinterpreted as inapplicable when total growth is inherent
    to code-split design (lazy chunks distribute bytes in time,
    don't concentrate them in initial download). User explicit
    decision documented: total gzip is informational, not KPI;
    initial preload is the metric. **Manual chunks vendor split
    was tested empirically and rejected** — eager preload of all
    vendor chunks across navigations defeated the purpose. Future
    developer should not retry manual chunks unless route-aware
    strategy emerges. Natural Vite per-dynamic-import-boundary
    chunking wins.
  - **Smoke**: `npm run build` zielone (2.36s ostatni commit),
    `tsc -b` zielone, build wymaga `tsc -b` przed `vite build` per
    `package.json` script. **Initial preload public landing:
    121.99 kB gzip JS** (8 modulepreload chunks: index-entry
    62.57 + cn-vendor 48.44 + dist-radix 10.26 + mutation 1.13 +
    4 small hooks/api ~0.9). **Total all chunks gzip:** 262.52 kB
    (informational). **CSS gzip:** 9.73 kB.
  - **Co NIE wykonano vs plan**:
    - Lucide explicit imports refactor — REJECTED na podstawie
      pomiaru (lucide w ogóle nie w initial preload, per-route
      tree-shake już działa).
    - Vite manualChunks — REJECTED empirycznie (pogorszył initial
      preload).
    - Mobile 375 corrections — NO-OP (zero blokerów).
    - Pani Kasia consistency fixes — NO-OP (9/10 ✓, jedno
      design-policy improvement udokumentowane).
    - Cleanup TODO comments — NO-OP (zero TODO/FIXME/HACK w
      kodzie).
  - **Czego się NIE zmieniło**:
    - Backend (zero linii Java/Flyway/SQL).
    - DTO shape, hooki signatures, query/mutation keys, Zod
      schemas, version round-trip, AD-001..018 nietknięte.
    - Routing **structure** (URL paths) — tylko owrap React.lazy.
    - cartStore (persist key, line key AD-014).
    - shared UI primitives core logic (Skeleton, EmptyState
      używane as-is z G1).
    - SSE hook `useAdminOrderFeed`, themeLoader, usePublicSettings.
    - `index.css` `.kicker`, `@keyframes dotpulse`.

## Redesign — DONE (10/10 grup, 2026-04-22 → 2026-04-26)

5-dniowy redesign zamknięty. Wszystkie grupy mergowane do
`phase-5`. Bundle MVP gotowy do staging deploy.

### Final redesign metrics

| Metryka | Wartość |
|---|---|
| **Czas trwania** | 5 dni (2026-04-22 → 2026-04-26) |
| **Liczba grup** | 10 |
| **Liczba commitów `design(*)` total** | 70 |
| **Branche `design/g*` mergowane** | 9 (G2+G3 współdzielony branch, G10 mergowany w tej sesji) |
| **Backend zmieniony** | 1 plik (V100__seed_demo.sql primary color w G1) |
| **DTO/hook signatures changed** | 0 |
| **Decyzje architektoniczne (AD-001..018) zmienione** | 0 |
| **Initial preload public landing (G10 final)** | **121.99 kB gzip JS** |
| **Initial preload G9 baseline (single bundle)** | 224 kB gzip JS |
| **Initial preload reduction G9 → G10** | **−46%** |
| **Total chunks gzip JS (G10 informational)** | 262.52 kB |
| **CSS gzip** | 9.73 kB |
| **Build time (vite + tsc)** | ~2.4s |

### Pliki utworzone w `shared/` przez redesign

- [`shared/components/ui/Skeleton.tsx`](../frontend/src/shared/components/ui/Skeleton.tsx) — G1
- [`shared/components/ui/EmptyState.tsx`](../frontend/src/shared/components/ui/EmptyState.tsx) — G1
- [`shared/components/OrderStatusBadge.tsx`](../frontend/src/shared/components/OrderStatusBadge.tsx) — G7 (move z `features/admin/orders/components/`)
- [`shared/components/RouteFallback.tsx`](../frontend/src/shared/components/RouteFallback.tsx) — G10

### Pliki utworzone w `features/` przez redesign

- [`features/public/order/components/TrackingTimeline.tsx`](../frontend/src/features/public/order/components/TrackingTimeline.tsx) — G5
- [`features/admin/orders/components/CancelOrderDialog.tsx`](../frontend/src/features/admin/orders/components/CancelOrderDialog.tsx) — G7
- [`features/admin/orders/components/PrimaryActionCta.tsx`](../frontend/src/features/admin/orders/components/PrimaryActionCta.tsx) — G7
- [`features/admin/settings/components/SettingsTabs.tsx`](../frontend/src/features/admin/settings/components/SettingsTabs.tsx) — G9
- [`features/admin/settings/components/SettingsShell.tsx`](../frontend/src/features/admin/settings/components/SettingsShell.tsx) — G9
- [`features/admin/settings/components/ColorPreviewCard.tsx`](../frontend/src/features/admin/settings/components/ColorPreviewCard.tsx) — G9
- `useDebouncedValue` hook — G9

### Decyzje architektoniczne preserved

AD-001 (Modular Monolith), AD-002 (Frontend serwowany przez
Spring Boot), AD-003 (JWT localStorage), AD-004 (RestaurantSettings
singleton), AD-005 (polling klient / SSE admin stretch), AD-006
(Snapshoty OrderItem), AD-007 (publicTrackingToken UUID v4),
AD-008 (State machine OrderStatus), AD-009 (Optimistic locking
@Version), AD-010 (URL input zdjęć), AD-011 (MenuAssembler
split-query), AD-012 (Slug Polish-aware), AD-013 (orderNumber
generator), AD-014 (Cart line key), AD-015 (addonGroupName
snapshot), AD-016 (klient nie wysyła cen), AD-017 (state machine
backend SoT + FE mirror), AD-018 (SSE auth via query token) —
**wszystkie nietknięte** przez redesign.

### Branch state

Wszystkie `design/g*` branche mergowane do `phase-5`. Po
mergowaniu G10 do `phase-5` można skasować `design/g10-polish`
(opcjonalne housekeeping). `master` synchronizować z `phase-5`
przy starcie deployment.

### Następny krok

1. Deployment Pizza Showcase staging na Railway (sprawdzić
   `Dockerfile` multi-stage, env vars, Postgres provisioning).
2. Draft `docs/ONBOARDING.md` — checklist dla pierwszego klienta:
   color picker change, opening hours fill, hero/about content,
   menu CRUD walkthrough.
3. Pierwszy klient w demo trybie + zbiór feedbacku przed Fazą 6
   (płatności online, patrz `docs/ROADMAP.md`).

## Fazy ukończone
- [x] Faza 0: Bootstrap
  - Pliki konstytucyjne: /CLAUDE.md, /docs/*.md
  - Backend: Spring Boot 3 + Java 21, skeleton, Gradle Kotlin DSL, migracja
    V1 pusta
  - Frontend: Vite + React + TS, Tailwind, shadcn/ui init, placeholder
    landing i admin login, routing
  - Infra: docker-compose z Postgres 16 + Adminer, .env.example,
    .gitignore, Dockerfile placeholder
  - Git: repo zainicjowane, pierwszy commit
- [x] Faza 1: Auth + Settings + Theme
  - Backend:
    - Gradle upgrade do 9.0 + foojay-resolver-convention 1.0.0 (JDK 21
      toolchain auto-provisioning, wymagane bo host JDK 25)
    - Encje: `identity.User` (+ `Role.ADMIN`), singleton
      `restaurant.RestaurantSettings` (CHECK id=1), `OpeningHours`
      (UNIQUE dayOfWeek + CHECK spójności czasów),
      `PageContent` (UNIQUE sectionKey HERO/ABOUT)
    - `shared.domain.AuditableEntity` dla `createdAt/updatedAt`
    - Migracje Flyway: `V2__identity_and_settings.sql` (schema),
      `V100__seed_demo.sql` (singleton Pizza Demo #E11D48, 7 dni godzin,
      HERO + ABOUT z obrazami Unsplash)
    - `AdminUserSeeder` (ApplicationRunner) tworzy admina z `ADMIN_EMAIL` /
      `ADMIN_PASSWORD`; idempotentny, noop gdy user istnieje
    - `JwtService` (HS256, 12h, secret z `JWT_SECRET` — fail-fast <32B),
      `JwtAuthenticationFilter`, `RateLimitFilter` (Bucket4j, 10/min na
      `POST /api/auth/login`, 429 + Retry-After + ProblemDetail)
    - `SecurityConfig` (STATELESS, CORS z `CORS_ALLOWED_ORIGINS`,
      403/401 ProblemDetail) zastąpił `BootstrapSecurityConfig`
    - `GlobalExceptionHandler` — RFC 7807 `ProblemDetail` dla 400/401/403/
      404/422/429/500 + mapping Bean Validation na `errors:{field:message}`
    - Publiczne endpointy: `GET /api/public/settings`,
      `GET /api/public/opening-hours`, `GET /api/public/page-content`
      (mapa HERO/ABOUT)
    - Admin endpointy (wymaga `ROLE_ADMIN`):
      - `GET|PUT /api/admin/settings`
      - `GET|PUT /api/admin/opening-hours` (batch — dokładnie 7 dni,
        walidacja `open<close` gdy otwarte)
      - `GET|PUT /api/admin/page-content/{hero|about}` (CTA tylko dla HERO)
    - Login: `POST /api/auth/login` → `{token, expiresAt, user}`
  - Frontend:
    - Axios interceptor: Authorization Bearer + auto-clear/redirect na 401
    - Zustand `authStore` (persist `pizza-showcase-auth`), `useAuth`,
      `ProtectedRoute`
    - `LoginPage` (RHF + Zod), toast na success/error z mapowaniem
      ProblemDetail
    - `AdminLayout` (responsive sidebar, header z `Wyloguj`), nested routes:
      `/admin` (dashboard placeholder), `/admin/settings`,
      `/admin/opening-hours`, `/admin/page-content`
    - `SettingsPage`: nazwa, tagline, kolor (color picker + hex input,
      live preview CSS var), logo URL, waluta, kontakt, adres
    - `OpeningHoursPage`: grid 7 dni, toggle "Zamknięte" disabluje pola,
      walidacja HH:MM i `open<close`
    - `PageContentPage`: taby HERO/ABOUT, współdzielony formularz
      (CTA widoczne tylko w HERO)
    - `ThemeBootstrap` + `usePublicSettings` aktualizują
      `--color-primary` w `:root` (HEX → kanały RGB dla Tailwinda)
    - Publiczny `LandingPage`: Hero / About / OpeningHours / Contact
      zasilane z `/api/public/*`; sticky header z nazwą/logo, footer
      z linkiem do panelu
    - Reużywalne UI: `Button`, `Input`, `Label`, `Textarea`, `Card`
  - Commity: po każdym milestone (18 milestonów). Historia w `git log`.
- [x] Faza 2: Menu
  - Backend:
    - Migracja `V6__menu.sql` (nie V3 jak w PHASES.md — V3/V4/V5 zajęte
      przez hotfixy Fazy 1) + seed `V101__seed_menu.sql` (3 kategorie
      Pizze/Napoje/Desery, 8 produktów, pizze z wariantami 30/40 cm,
      grupa "Dodatki pizzy" z 4 dodatkami, obrazki Unsplash)
    - Encje: `menu.Category`, `menu.Product` (basePrice nullable dla
      produktów z wariantami), `menu.ProductVariant` (price zawsze NOT NULL),
      `menu.AddonGroup` (minSelect/maxSelect/required + CHECK spójności),
      `menu.Addon`, `menu.ProductAddonGroup` (explicit m2m z displayOrder)
    - `shared.util.SlugGenerator` — stripAccents PL + lowercase +
      `[^a-z0-9]+ → -`, kolizje rozwiązywane suffixem `-2`, `-3` (AD-012)
    - `MenuAssembler` + `MenuQueryService` — **split 2-query** (q1:
      categories + products + variants, q2: product→addonGroups→addons
      IN :productIds) by uniknąć `MultipleBagFetchException` i iloczynu
      kartezjańskiego. Stitch w pamięci po productId (AD-011)
    - Publiczne endpointy:
      - `GET /api/public/menu` — pełne drzewo (tylko category.active=true,
        produkty niedostępne zwracane z flagą `available=false`)
      - `GET /api/public/products/{slug}` — jeden produkt z pełnym
        zagnieżdżeniem + nazwa kategorii; 404 gdy nie istnieje lub
        kategoria nieaktywna
    - Admin endpointy (`@PreAuthorize("hasRole('ADMIN')")`):
      - `GET|POST /api/admin/categories` + `GET|PUT|DELETE /{id}`
        (409 gdy są produkty)
      - `GET|POST /api/admin/products` (filtry `?categoryId=`, `?available=`)
        + `GET|PUT|DELETE /{id}` + `PATCH /{id}/availability`
      - `GET|POST /api/admin/products/{id}/variants`
        + `PUT|DELETE /api/admin/variants/{id}` (nested pod productem)
      - `GET|POST /api/admin/addon-groups` + `GET|PUT|DELETE /{id}`
        (409 gdy powiązana z produktem)
      - `POST /api/admin/addon-groups/{id}/addons`
        + `PUT|DELETE /api/admin/addons/{id}`
      - `GET|POST /api/admin/products/{id}/addon-groups`
        + `DELETE /api/admin/products/{productId}/addon-groups/{groupId}`
    - Walidacja na serwisie: produkt musi mieć albo basePrice, albo
      ≥1 wariant (XOR enforcowane w create/update)
  - **Hotfixy review (po M16):**
    - **Optimistic locking enforced na wszystkich update endpointach menu**
      (`PUT /api/admin/categories/{id}`, `/products/{id}`, `/variants/{id}`,
      `/addon-groups/{id}`, `/addons/{id}`). Każdy `Update*Request` ma teraz
      `@NotNull Long version`; serwis porównuje z `entity.getVersion()`
      i rzuca `OptimisticLockingFailureException` → **409** (RFC 7807) gdy
      mismatch. `Admin*Dto` echo-ują `version`, frontend round-trip-uje je
      w mutacjach. **BREAKING CHANGE dla klientów API**: każdy PUT na
      menu wymaga teraz pola `version` w body — stare klienty dostaną
      400 (`version: must not be null`). `PATCH /products/{id}/availability`
      celowo pominięte (single-field toggle, konflikt to szum).
    - **XOR basePrice/variants enforced w `AdminProductService`**:
      `create` wymaga `basePrice` (warianty dodaje się dopiero po
      stworzeniu produktu); `update` blokuje ustawienie `basePrice` gdy
      produkt ma już ≥1 wariant — w obu przypadkach **422** z
      czytelnym komunikatem zamiast cichego utworzenia produktu w
      stanie niespójnym.
    - Whitelist schematów `http://` / `https://` przywrócona na
      `Product.imageUrl` (regresja po refaktorze walidatora w M11).
    - `GET /api/admin/products` dostał paginację (`?page=&size=`,
      domyślnie `size=20`, max 100) — zgodnie z QA_CHECKLIST,
      lista admin nie może odpalać unbounded query.
  - Frontend:
    - Shadcn/ui dopełnienie: `Dialog`, `Select`, `Switch`, `Tabs`,
      `Checkbox` (wszystko przez `radix-ui` namespace, bez per-primitive deps)
    - `shared/api/menuApi.ts` — pełny surface publiczny + admin (typed)
    - Public `/menu` (`MenuPage` + `CategoryTabs` + `ProductCard`
      + `ProductModal` + `VariantPicker` + `AddonGroupPicker`
      + `useMenuPrice` hook + `usePublicMenu`):
      - sticky pill-tabs z IntersectionObserver (skip podczas scroll
        programatycznego)
      - karty produktów z fallback obrazka, "od X zł" gdy warianty,
        basePrice gdy bez, badge "Niedostępne" + wyszarzenie
      - modal z heroem, radio wariantów, checkbox dodatków (auto-swap
        gdy maxSelect=1, min-select walidacja), quantity stepper,
        live cena. Przycisk "Dodaj do koszyka" **disabled** z hintem
        "Koszyk będzie aktywny w Fazie 3"
    - Admin `/admin/menu` z tabami Kategorie | Produkty | Grupy dodatków
      (URL state przez `?tab=`):
      - `CategoriesList` + `CategoryFormDialog` (RHF+Zod, z.coerce.number
        na displayOrder, Switch active)
      - `ProductsList` — tabela z miniaturą, filtr kategorii, Switch
        dostępności z `PATCH availability`, ostrzeżenie gdy 0 kategorii
      - `ProductEditPage` (`/new` i `/:id`) — sekcje: dane podstawowe
        + preview obrazka z fallback `onError`, `VariantsSection`
        (inline CRUD), `AddonGroupsAttachSection` (Select wolnych grup
        + displayOrder + detach)
      - `AddonGroupsList` + `AddonGroupFormDialog` (zod refinements:
        `maxSelect >= minSelect`, `required ⇒ minSelect >= 1`)
      - `AddonGroupEditPage` — inline CRUD dodatków, pokazuje
        usedByProducts
    - Invalidacja po każdej mutacji admina: klucze `["admin","menu",...]`
      + `["public","menu"]` (landing/menu odświeża się bez hardrefresha)
    - Pattern błędów: `extractProblem(err)` → RFC 7807 `detail/title`
      → toast (fallback na lokalny PL komunikat)
    - Sidebar admina dostał link **Menu** pod `/admin/menu`
    - Placeholder `/menu` z Fazy 0 zastąpiony rzeczywistą stroną
  - Commity: milestone per krok (M1-M7 backend, M8-M15 frontend, M16 docs).
- [x] Faza 3: Cart + Checkout + Order + Tracking
  - Backend:
    - Migracja `V7__orders.sql` (nie `V4__orders.sql` z oryginalnego planu —
      V3-V6 zajęte przez hotfixy Fazy 1 i migrację menu)
    - Encje: `order.Order` (z `orderNumber`, `publicTrackingToken` UUID v4,
      `@Version`, `Address` embeddable), `order.OrderItem`,
      `order.OrderItemAddon`, `order.OrderStatusHistory`,
      `order.OrderNumberSequence`
    - Enumy: `OrderStatus` (pełne 7 stanów, w Fazie 3 używane tylko `NEW`),
      `FulfillmentType` (DELIVERY / PICKUP), `PaymentMethod`
      (CASH_ON_DELIVERY / CASH_ON_PICKUP)
    - `OrderNumberGenerator` — `SELECT ... FOR UPDATE` na
      `order_number_sequence` w tej samej transakcji co INSERT do `orders`
      (AD-013). Format `YYYY-NNNNN`, lazy insert rekordu roku.
    - `CheckoutService` (`@Transactional`):
      - Walidacja krzyżowa fulfillmentType ↔ paymentMethod ↔ address
        (`DELIVERY` wymaga adresu + `CASH_ON_DELIVERY`; `PICKUP` bez
        adresu + `CASH_ON_PICKUP`)
      - Batch pobiera produkty + warianty + addon-groups + dodatki przez
        reuse [MenuAssembler split-query](../backend/src/main/java/com/pizzashowcase/menu/application/MenuAssembler.java)
        (AD-011), `productRepository.findAllById` po unique IDs z request
      - Per linia: produkt `available=true`, `category.active=true`, wariant
        musi należeć do produktu (XOR: bez wariantów — `variantId` musi być
        null), dodatki w grupach przypiętych do produktu, `minSelect` /
        `maxSelect` / `required` enforced per grupa → 422 z czytelnym
        `detail` przy naruszeniu
      - Totals liczone server-side (AD-016): `lineTotal = (unitPrice +
        sum(addons)) * qty`; `subtotal = sum(lineTotal)`; `total = subtotal`
        (brak delivery fee w MVP)
      - Snapshoty nazwy produktu, wariantu, ceny + **nazwy grupy dodatku**
        (AD-015) zapisywane w `OrderItem` / `OrderItemAddon`
      - Tworzy Order + 1 wpis `OrderStatusHistory(NEW)` atomowo
    - `PublicOrderQueryService.findByToken` — projekcja **bez**
      `customerPhone`, `customerEmail`, `customerNotes` (AD-007). 404 gdy
      brak.
    - Publiczne endpointy (w `SecurityConfig` pod `permitAll`):
      - `POST /api/public/orders` → 201 + `{orderNumber, trackingToken,
        total}`
      - `GET /api/public/orders/track/{token}` → 200 / 404
    - `RateLimitFilter` zrefaktorowany z pojedynczej `TARGET_PATH` na
      `List<RateLimitRule>` (method+path+Bandwidth). Klucz bucketu `IP|path`
      żeby reguły były niezależne. Dodana reguła: `POST /api/public/orders`
      → 10 req/min/IP. Istniejąca reguła login bez zmian.
    - Rate limit multi-rule testowany smoke: 11 POST w ciągu minuty → 11.
      zwraca 429 + `Retry-After` + RFC 7807
    - DTO walidowane Bean Validation (`@NotBlank`, `@Pattern` na telefon PL
      `^\+?\d{9,11}$`, `@Pattern` na kod pocztowy `^\d{2}-\d{3}$`, `@Size`
      na uwagi max 500, `@Valid` cascading)
  - Frontend:
    - Shadcn/ui dopełnienie: `Sheet` (slide-in drawer), `RadioGroup`
    - `shared/api/orderApi.ts` — `placeOrder()`, `fetchOrderByToken()` + typy
      `OrderTrackingDto`, `OrderStatus`, `FulfillmentType`, `PaymentMethod`
      (bez PII w typie odpowiedzi trackingu)
    - `features/public/cart/`:
      - `cartStore.ts` — Zustand + `persist` (key `pizza-showcase-cart`,
        `partialize` tylko `items`). Line key `productId|variantId|
        sortedAddonIds` (AD-014) → dodawanie identycznej konfiguracji
        skleja `qty++`, inna konfiguracja = nowa linia
      - Selectors `useCartCount()`, `useCartTotal()` — derived (backend i tak
        liczy od nowa przy checkout, cart total jest wyłącznie do display)
      - `CartButton` (ikona + badge z liczbą, 99+ cap), `CartDrawer`
        (Sheet prawostronny, lista z miniaturkami, qty stepper
        `h-11 w-11 sm:h-9 sm:w-9` — min 44px touch target mobile, trash,
        total, CTA), `MobileCartBar` (sticky bottom `md:hidden`,
        widoczny tylko gdy `count > 0`)
      - Wpięcie w header `MenuPage` i `LandingPage` (button + drawer +
        mobile bar); padding dolne stron zwiększone (`pb-28 md:pb-16`)
        żeby MobileCartBar nie nakładał się na content
      - `ProductModal` "Dodaj do koszyka" odblokowany (Faza 2 miał disabled
        hint): buduje `CartAddon[]` z `selectedAddons`, zapisuje unitPrice
        wariantu, toast `Dodano do koszyka: {name}`, zamyka modal
    - `features/public/checkout/CheckoutPage.tsx`:
      - Guard: `items.length === 0` → `navigate('/menu', { replace: true })`
      - RHF + Zod z `superRefine` — adres warunkowy dla DELIVERY, cross-
        validacja paymentMethod z fulfillmentType (safety net pod auto-
        derive w UI)
      - `Controller` z Radix RadioGroup — wybór fulfillment auto-setuje
        odpowiedni paymentMethod przez `setValue('paymentMethod', ...,
        { shouldValidate: true })`
      - Layout grid `lg:grid-cols-[1fr_360px]`; na mobile summary na górze
        (order-1), formularz pod (order-2); submit przeniesiony z
        wnętrza aside do **fixed bottom sticky bar** `lg:hidden` przez
        `<button form="checkout-form" type="submit">` (żeby user nie
        musiał scrollować w górę pod podsumowanie na mobile)
      - Payload builder: puste opcjonalne stringi → `null`; `deliveryAddress
        = null` dla PICKUP
      - `useMutation(placeOrder)`:
        - onSuccess: `cartStore.clear()` → `navigate('/order/confirmation/'
          + orderNumber, { state: { trackingToken, total } })`
        - onError: `extractProblem(err)` → toast z `detail/title` (RFC
          7807), nie generic komunikatem
    - `features/public/order/OrderConfirmationPage.tsx`:
      - Czyta `trackingToken` + `total` z `location.state`
      - Token obecny → duży CTA "Śledź zamówienie" → `/track/{token}` +
        ostrzeżenie o zachowaniu linku
      - Token nieobecny (refresh) → amber notice "Link do śledzenia dostępny
        tylko zaraz po złożeniu. Zamówienie {orderNumber} zostało
        zapisane." (nie crashuje, świadomie nie persistujemy tokenu —
        AD-007)
    - `features/public/order/TrackingPage.tsx`:
      - `useQuery({ queryKey: ['order','track',token],
        refetchInterval: (q) => TERMINAL.includes(q.state.data?.status) ?
        false : 15_000, retry: (n, err) => err instanceof AxiosError &&
        err.response?.status === 404 ? false : n < 2 })`
      - `refetchIntervalInBackground: false` (oszczędza traffic gdy karta
        w tle)
      - TERMINAL_STATUSES = `['DELIVERED', 'CANCELED']` → polling staje
      - Loading: 3-segment skeleton; 404: XCircle + CTA do `/menu`
        (brak białego ekranu); inny error: rose alert z `extractProblem`
      - Render: hero z `orderNumber` + status badge + `Intl.DateTimeFormat
        ('pl-PL')` dla `placedAt` + ETA pill (Faza 4 wypełni), vertical
        `StatusTimeline` (flex-col ikon + progress line po lewej,
        NEW→CONFIRMED→IN_PREPARATION→READY→DELIVERY:OUT_FOR_DELIVERY→
        DELIVERED | PICKUP:DELIVERED), fulfillment block (MapPin dla
        dostawy), lista pozycji ze snapshotami + total
      - CANCELED zastępuje timeline rose info card
      - "Aktualizowanie…" indicator gdy `isFetching && !isLoading`
    - Routing: `/checkout`, `/order/confirmation/:orderNumber`,
      `/track/:token` podmienione z placeholderów Fazy 0 na realne
      komponenty
  - Mobile 375px polish (M13): CartDrawer stepper/trash do 44px touch
    target; CheckoutPage sticky bottom submit; MobileCartBar spacing
    (`pb-28 md:pb-16` na MenuPage, `pb-24 md:pb-6` na LandingPage)
  - **Hotfix Fazy 2 (build unblocker):** `PageContentPage.tsx` i
    `SettingsPage.tsx` miały Zod `.transform(v => ... : null)` dający
    schema output type `string | null` niespójny z RHF form input type
    `string | undefined` — `tsc -b` / `npm run build` fail. Fix: zmiana
    na `.transform(v => ... : undefined)` + drop redundantnego `.nullable()`
    na `nullableOptional` helperze. Zachowanie runtime niezmienione
    (mutation callers już mapują `values.x || null`).
  - Commity: milestone per krok (M1-M6 backend, M7-M13 frontend, M14 docs,
    osobny hotfix Fazy 2)
- [x] Faza 4: Admin Orders + polling (SSE stretch)
  - Backend CORE:
    - State machine w `order.domain.OrderStatus.canTransitionTo(next, ft)` —
      jedna prawda, gałąź `READY → OUT_FOR_DELIVERY | DELIVERED` rozstrzyga
      po `FulfillmentType`. Naruszenie → `ApiException.unprocessable` → 422
      (AD-017). **29 testów jednostkowych enuma** (`OrderStatusTransitionTest`)
      pokrywają wszystkie legalne przejścia + wszystkie zabronione (terminale,
      skoki, fulfillment-mismatch)
    - DTOs w `order.api.dto.admin.*`: `AdminOrderListItemDto` (light),
      `AdminOrderDto` (full + items + history + address), `AdminOrderStatus-
      HistoryDto`, `UpdateOrderStatusRequest` (`@NotNull version`), `Update-
      OrderEtaRequest` (`@NotNull version`, `@Min(0) @Max(480) minutesFromNow`),
      `AdminDashboardSummaryDto`
    - `AdminOrderQueryService` — list z filtrami (status, fulfillmentType,
      dateFrom/dateTo półotwarty przedział `Europe/Warsaw`), get-by-id
      z `@EntityGraph`, dashboard summary (3 liczniki)
    - `OrderStatusService` (`@Transactional`) — `changeStatus(id, request)`:
      load → `assertVersion` → `canTransitionTo` → zapis status + wpis
      `OrderStatusHistory(changedBy = admin email z SecurityContext)` →
      `saveAndFlush` (żeby `@Version` bumpnęło przed mapowaniem do DTO —
      inaczej response wraca ze stale version i kolejny PATCH 409). Drugi
      entry-point `updateEta(id, request)` bez state machine, tylko version
      check
    - `OrderRepository.findAllFiltered(status, ft, from, to, Pageable)`
      z NULL-checkami w `@Query` (pattern z `ProductRepository`) +
      3 metody `countBy...` dla dashboard summary
    - Endpointy (`@PreAuthorize("hasRole('ADMIN')")`):
      - `GET /api/admin/orders` — pagination + filtry, size=20 default,
        sort=placedAt DESC
      - `GET /api/admin/orders/{id}` → 404 gdy brak
      - `PATCH /api/admin/orders/{id}/status`, `PATCH /api/admin/orders/{id}/eta`
      - `GET /api/admin/dashboard/summary` (osobny `AdminDashboardController`)
    - Konflikt wersji → `OptimisticLockingFailureException` → 409 przez
      istniejący `GlobalExceptionHandler` (AD-009). Bez nowych hotfixów
      exception handlera
    - **Brak nowej migracji** — `etaMinutes` (Integer) istnieje od `V7__orders.sql`
      Fazy 3. Pole semantycznie = "minuty od teraz" w momencie zapisu;
      tracking DTO ma to interpretować jako stałą etykietę (świadomie,
      wariant A z planu)
  - Frontend CORE:
    - shadcn primitives: `Badge`, `Table` (Radix namespace, bez per-primitive deps)
    - `shared/lib/formatDate.ts` — `formatDateTime(iso)` z `Intl.DateTimeFormat
      ('pl-PL', {dateStyle:'short', timeStyle:'short'})`. `TrackingPage`
      celowo nie ruszany (ma własny inline Intl)
    - `shared/api/orderApi.ts` — typy `AdminOrderListItemDto`, `AdminOrderDto`,
      `AdminOrderStatusHistoryDto`, `PaginatedResponse<T>` + funkcje `fetch-
      AdminOrders`, `fetchAdminOrderById`, `updateOrderStatus`, `updateOrderEta`,
      `fetchDashboardSummary`
    - `features/admin/dashboard/DashboardPage.tsx` + `components/KpiTile.tsx` —
      3 kafelki ("Nowe dziś" → `?status=NEW`, "W przygotowaniu" → filtr
      `CONFIRMED|IN_PREPARATION`, "Do dostawy" → filtr `READY|OUT_FOR_DELIVERY`).
      Każdy klik w kafelek → nawigacja do `/admin/orders` z prefiltrem przez
      URL query params. Dashboard polling 15s
    - `features/admin/orders/OrdersListPage.tsx` — toolbar z filtrami (Select
      status, Select fulfillment, 2 × `<input type="date">`), stan filtrów
      w URL przez `useSearchParams` (refresh + share-link działają), Table
      z kolumnami (numer, data, klient, fulfillment, status Badge, total,
      CTA "Szczegóły"), paginacja prev/next + "Strona X z Y", empty state.
      **Polling 10s** (`refetchInterval: 10_000`, `refetchIntervalInBackground:
      false`)
    - `features/admin/orders/OrderDetailPage.tsx` — header z badge + placedAt +
      fulfillmentType + paymentMethod, karty Klient / Adres dostawy
      (warunkowo) / Pozycje (ze snapshotami i dodatkami) / ETA (dialog
      z presetami 15/30/45/60 min + własna liczba) / Akcje statusu (przyciski
      tylko dozwolonych przejść, mirror state machine z `lib/transitions.ts`)
      / Historia statusów (timeline z `changedAt` + `changedBy`). Akcja
      "Anuluj zamówienie" w osobnym wariancie `destructive` z potwierdzeniem
      w Dialogu. Mutacje invalidują `["admin","orders","detail", id]` +
      `["admin","orders","list"]`. Polling detail 10s. 409 → toast "Ktoś
      inny zmienił zamówienie. Odśwież." + invalidate; 422 → toast
      z `extractProblem(err).detail`
    - `lib/transitions.ts` — FE mirror state machine z `OrderStatus.java`
      (AD-017). Używany **wyłącznie do UI** — backend jest ostateczną bramką
    - `OrderStatusBadge.tsx` — mapping status → kolor + label PL
    - `AdminLayout.navItems` dostał link **Zamówienia** pod `/admin/orders`;
      dashboard placeholder z Fazy 1 podmieniony na realny `DashboardPage`
  - Backend STRETCH (SSE):
    - `com.pizzashowcase.realtime` — nowy pakiet:
      - `SseEmitterRegistry` — `ConcurrentHashMap<UUID, SseEmitter>`, daemon
        `ScheduledExecutorService` heartbeat 25s fixed rate, cleanup na
        `onCompletion/onTimeout/onError`, `broadcast()` usuwa emitery które
        rzuciły IOException przy send
      - `SseEventEnvelope(String type, Object payload)` — JSON shape dla
        klienta (`{type, payload}`)
      - `SseEventBroadcaster` z `@Async` + `@TransactionalEventListener
        (phase = AFTER_COMMIT)` na `OrderCreatedEvent` i `OrderStatusChanged-
        Event`. Broadcast **po commicie** i off-thread — failure SSE nie
        roluje business transakcji
      - `RealtimeConfig` z `@EnableAsync`
      - `SseAdminController` — `GET /api/admin/orders/stream` (produces
        `text/event-stream`, `@PreAuthorize("hasRole('ADMIN')")`, timeout
        30min, wysyła `READY` po zarejestrowaniu emitera)
    - `order.application.event.*` — dwa recordy: `OrderCreatedEvent(id,
      orderNumber, total, placedAt)` publikowany przez `CheckoutService`
      na końcu `placeOrder`, `OrderStatusChangedEvent(id, orderNumber,
      newStatus)` publikowany przez `OrderStatusService.changeStatus`
      (nie przez `updateEta` — ETA nie jest zmianą statusu)
    - `JwtAuthenticationFilter` — refaktor do helpera `extractToken(request)`:
      najpierw `Authorization: Bearer`, potem — **tylko dla `/api/admin/
      orders/stream`** — query param `?token=`. Surface pojedynczej ścieżki,
      zero luzowania auth gdzie indziej (AD-018)
  - Frontend STRETCH (SSE):
    - `features/admin/realtime/useAdminOrderFeed.ts` — hook (`useEffect`):
      otwiera `new EventSource(/api/admin/orders/stream?token=${jwt})`,
      listenery per event type:
        - `READY` → reset backoff
        - `ORDER_CREATED` → invalidate `["admin","orders","list"]` +
          `["admin","dashboard","summary"]`, `toast.success("Nowe zamówienie:
          {orderNumber}")`, `if (getSoundEnabled()) playBeep()`
        - `ORDER_STATUS_CHANGED` → invalidate list + `["admin","orders",
          "detail", orderId]`
      reconnect z exponential backoff (1s → 2s → … cap 30s), cleanup
      w useEffect teardown. Token czytany przez `useAuthStore.getState()` —
      świeży przy każdym `connect()`
    - `features/admin/realtime/soundPrefs.ts` — localStorage key `admin-sounds-
      enabled` (default true), lazy module-level `AudioContext`,
      `playBeep()` = 880 Hz sine + gain envelope (0.0001 → 0.3 → 0.0001,
      0.2s total). Gate na `ctx.state === "suspended"` → `ctx.resume().then
      (start)`. Silent no-op przy blokadzie autoplay
    - `features/admin/realtime/SoundToggle.tsx` — Button ghost z ikonami
      `Volume2`/`VolumeX` (lucide-react), toggle persistuje w localStorage,
      onClick `playBeep()` gdy włączamy (primuje AudioContext pod
      user gesture). PL aria-label/title
    - `AdminLayout` montuje `useAdminOrderFeed()` raz (globalne) i renderuje
      `<SoundToggle />` w headerze przed przyciskiem "Wyloguj". Fallback:
      polling 10s z CORE dalej działa — brak ręcznego downgrade'u
    - **Smoke e2e (M13):** SSE-stream po loginie: `READY` < 100ms, `ORDER_
      CREATED` 193ms po POST zamówienia, `ORDER_STATUS_CHANGED` 181ms po
      PATCH statusu, heartbeat `:hb` co ~25s. Obie latencje znacznie poniżej
      progu <1s z planu
  - **M10 smoke hotfixy:**
    - `OrderStatusService.changeStatus` przeszedł na `saveAndFlush(order)`
      żeby `@Version` bumpnęło przed mapowaniem do DTO. Bez flusha klient
      dostawał stale `version=N` w response i następny PATCH kończył się
      409. Druga linia obrony (spójna z AD-009)
    - `OrderStatusHistory.changedAt` był ustawiany w PrePersist, w response
      DTO wracał `null` bezpośrednio po mutacji. Fix: konstruktor `new
      OrderStatusHistory(status, Instant.now(), changedBy)` ustawia pole
      jawnie, PrePersist tylko no-op fallback
  - Commity: milestone per krok (M1-M5 backend CORE, M6-M10 frontend CORE,
    M11 SSE backend, M12 SSE frontend, M13 smoke + M10 hotfixes, M14 docs)

## Faza 5 — Polish + Deploy (DONE kod; Railway deploy ostatni krok manualny)
- **Cel**: dowiezc showcase do stanu gotowego pod HTTPS, zalatac deploy-blockery
  z review Fazy 4 i carry-over z Faz 1-3, dopisac dokumentacje umozliwiajaca
  rebrandig + deploy przez nowego dev w <30 min.
- **Branch**: `phase-5`. Milestony:
  - **M1** prod profile, SPA fallback (`ErrorViewResolver` +
    `GlobalExceptionHandler.handleNoResource`), JSON logs
    (`logstash-logback-encoder`), graceful shutdown, `server.tomcat.accesslog.enabled=false`
    (BUG-1 mitigation). Commit `98f45c9`.
  - **M2** multi-stage Dockerfile (node:20-alpine → JDK 21 jammy → JRE 21
    jammy), `SecurityConfig` `anyRequest().permitAll()` dla SPA fallback
    (route auth zachowana na `/api/admin/**` + `/api/**`),
    `GlobalExceptionHandler.handleNoResource` → forward `/index.html` dla
    `Accept: text/html`. Commit `e76a9f5`.
  - **M4** Carry-over tech debt z Faz 3-4: `deliveryAddress.notes` Zod
    200→255 (alignment z BE Bean Validation), `Locale.ROOT` w
    `CheckoutService.normalizeEmail`, `setScale(2, HALF_UP)` na
    `lineTotal`/`subtotal`/`total`, ETA terminal guard (422
    gdy DELIVERED/CANCELED), `ThreadPoolTaskExecutor` (core=2, max=4,
    queue=50, `CallerRunsPolicy`) jako `@Bean("taskExecutor")`. Commit `b2f3b79`.
  - **M5 BE** Rate limit `GET /api/admin/orders/stream` → 30 req/min/IP.
    Commit `3c3d7ba`.
  - **M5 FE** BUG-9: skeletony w `OrdersListPage` (5-wierszowa tabela) +
    `OrderDetailPage` (4 karty). Nowy `Skeleton` primitive w
    `shared/components/ui`. Commit `62a18ce`.
  - **M6/1** globalny `ErrorBoundary` (class component, fallback UI z
    `<a href="/">`, dev-only stack trace) wokol `<Routes>` w
    `providers.tsx`. Commit `681cf7d`.
  - **M6/2** `useIsRestaurantOpen` hook (`Intl.DateTimeFormat` strefa
    `Europe/Warsaw`, fail-open gdy brak godzin) + `CheckoutPage` banner +
    disabled CTA gdy zamkniete. Commit `59a0152`.
  - **M6/3** OSM iframe map na `ContactSection` (Nominatim geocoding
    client-side, staleTime Infinity, bez Leaflet, fallback na adres
    tekstowy gdy geokodowanie failuje). Commit `37cb160`.
  - **M7** SEO: `SeoHead` komponent (direct DOM, bez react-helmet)
    aktualizuje `document.title`, `meta description`, OG tags (`og:title`,
    `og:description`, `og:image`, `og:type=website`) z
    `RestaurantSettings`. Favicon inline SVG emoji pizza w `index.html` +
    fallback `public/favicon.svg`. `public/manifest.json` z
    `theme_color=#E11D48`. Commit `aa71c94`.
  - **M8** Dokumentacja: `README.md` refresh (quickstart <30 min,
    weryfikacja URLs, build Docker), `docs/customization.md` NEW (panel
    admin + V100/V101 seeds + favicon/manifest swap + env vars),
    `docs/deployment.md` NEW (Railway 6 krokow + troubleshooting).
- **Akceptowalny tech debt (nie zrobione w Fazie 5, na ROADMAP):**
  - SSE AD-018 query-param auth → httpOnly cookie (mitigacja:
    access log wylaczony; Railway proxy moze nadal logowac URL).
  - BUG-5 SSE reconnect retry cap + `disconnected` state.
  - Code splitting per route (`React.lazy` dla `/admin/*`).
  - Seed V100/V101 gate po profilu / env var — showcase CELOWO deployuje
    z demo contentem, notka w deployment.md dla clean-start.
  - Framer Motion transitions na drawer/modal/public routes — Tier 3,
    wyciete pod presja czasu.
  - Mobile 375px audit per-ekran — Tier 3, zalozenie: istniejacy Tailwind
    responsywny design wystarcza pod demo.
  - Admin orders table card-view dla `<md` — Tier 3.
  - Mapa: zamiast lat/lon migracji → Nominatim runtime geokoding (brak
    dodatkowych kolumn, brak BE zmian).
- **Definition of done (PHASES.md:225-229):**
  - [x] Kod gotowy pod HTTPS (Dockerfile multi-stage, prod profile, SPA
    fallback, JSON logs, graceful shutdown, rate limit SSE, ETA guard).
  - [x] README quickstart <30 min (6 krokow od clone → localhost:5173).
  - [x] Customization + deployment docs (rebranding + Railway w <30 min).
  - [ ] Live URL pod HTTPS — **czeka na manualny deploy Railway** (M3
    planu pominiety na prosbe usera; kod jest gotowy).
  - [ ] End-to-end demo na live URL — do zrobienia po deploy.

## Fazy zaplanowane
Wszystkie fazy MVP (0-5) zamkniete w kodzie. Railway deploy to ostatni
manualny krok — patrz [deployment.md](./deployment.md).

## Aktualne ostrzeżenia / tech debt świadomie zaakceptowany
- Host ma JDK 25 — produkcyjny toolchain to JDK 21 (foojay auto-provision).
  Obraz deploy w Fazie 5 wymusi JDK 21.
- Rate limit w pamięci (ConcurrentHashMap) — wystarcza dla MVP single-instance.
  Multi-instance w post-MVP: Bucket4j + Redis lub distributed bucket.
- `RestaurantSettings` nie ma fallbacku na brak rekordu — `V100` gwarantuje
  rekord, ręczny DELETE zakończy się 404 na publicznym GET. Zgodnie z planem.
- CRLF w całym repo (Windows) — nie ingerujemy, Flyway i JVM OK.
- V100__seed_demo.sql nie jest ogejtowana profilem — na Railway w Fazie 5
  odpali demo content w produkcji. **TODO Faza 5 (deploy):** przenieść do
  profilu dev (np. `flyway.locations: classpath:db/migration, classpath:db/demo`
  tylko w `application-dev.yml`) albo dodać gate po env var
  `SEED_DEMO_DATA=true`.
- AdminUserSeeder ma teoretyczne okno TOCTOU (`existsByEmailIgnoreCase` +
  `save`). UNIQUE index na `LOWER(email)` (V4) wyłapie duplikat w DB —
  seedowanie wykona się raz, drugi start wyloguje błąd z DataIntegrityViolation.
  Bez znaczenia przy single-instance deploy, akceptowany tech debt.
- **`OrderConfirmationPage` nie persistuje `trackingToken`** — refresh strony
  = brak przycisku śledzenia (by design, AD-007: token to publiczny secret-
  link). Fallback message informuje, że zamówienie zostało zapisane.
  Alternatywy (email z linkiem, localStorage) — post-MVP.
- **Brak auto-highlightu niedostępnej pozycji w `CartDrawer` przy 422**
  z checkoutu. Serwis zwraca RFC 7807 `detail` ("Produkt 'X' nie jest już
  dostępny"), frontend pokazuje toast. User musi sam zlokalizować i usunąć
  wadliwą linię. Do dodania w Fazie 5 polish (mapowanie errors → lineKey).
- **Frontend bundle bez code splittingu** — 690 kB / 205 kB gzip dla
  całej aplikacji (public + admin). Vite ostrzega o chunkach >500 kB.
  Akceptowalne dla MVP; code-split per route (`React.lazy` dla `/admin/*`)
  planowany w Fazie 5 (Polish + Deploy).

### Tech debt z review Fazy 3 (świadomie zaakceptowany)
- **BUG-3: Zod/Bean validation desync na `deliveryAddress.notes`** — frontend
  Zod ma `max(200)`, backend Bean `@Size(max=255)` na uwagach do adresu.
  Niezgodność niewidoczna dla usera (FE złapie pierwsze), ale dryf
  walidacji do naprawy przy najbliższym dotknięciu `CheckoutPage.tsx` —
  ujednolicić na 255 (matchować BE) lub 200 po obu stronach.
- **Double-submit bez idempotency key** — `POST /api/public/orders` nie
  ma deduplikacji po stronie serwera. FE disabluje przycisk podczas
  `mutation.isPending`, więc w UI realnie nie da się dwa razy kliknąć.
  Akceptowalne dla MVP; pełen idempotency-key (`Idempotency-Key` header
  + dedup table) post-MVP gdy pojawią się retry'e z mobile/sieci flaky.
- **Adres dostawy widoczny przez secret-link tracking token** —
  `GET /api/public/orders/track/{token}` zwraca `deliveryAddress` (street,
  city, postalCode), żeby user widział co zamówił. Token to UUID v4
  (122 bity entropii, nieprzewidywalny), więc ryzyko enumeration
  zaniedbywalne. PII w pełni: telefon, email, customerNotes — celowo
  **nie** zwracane (AD-007). Akceptowane ryzyko świadomie; w post-MVP
  można rozważyć skrócenie adresu (tylko miasto) po przejściu w
  status terminalny.
- **Brak React `ErrorBoundary` na poziomie aplikacji** — runtime error
  w którymkolwiek komponencie public/admin owocuje białym ekranem
  (Vite domyślnie). Planowane w Fazie 5 (Polish + Deploy) — global
  boundary z fallback UI + opcjonalnie Sentry/console error reporting.
- **Mikro-bugi LOW (Faza 5 polish):**
  - `BigDecimal` arytmetyka w `CheckoutService` bez jawnego
    `setScale(2, HALF_UP)` na `lineTotal`/`subtotal` — Postgres `NUMERIC(10,2)`
    truncate'uje przy persiście, ale liczby wracające w response mogą
    mieć więcej miejsc niż 2.
  - `String.toLowerCase()` bez `Locale.ROOT` w paru miejscach (slug
    generator i email comparison już mają, ale audit pełny do zrobienia).
  - Część kontrolerów używa `consumes/produces` domyślnych Springa zamiast
    jawnie `MediaType.APPLICATION_JSON_VALUE` — content negotiation
    działa, ale eksplicytnie czytelniej.

### Tech debt z Fazy 4 (świadomie odłożony)
- **SSE token w query param `?token=...`** (AD-018) — akceptowalne dla
  showcase/demo, do migracji na httpOnly cookie przy wdrożeniu
  produkcyjnym. Token trafia do Referer / logów proxy / URL historii;
  `EventSource` nie wspiera niestandardowych nagłówków, stąd kompromis.
- **Brak skalowania SSE na wiele instancji** — `SseEmitterRegistry`
  trzyma emitery in-memory (`ConcurrentHashMap`); broadcast dociera tylko
  do klientów podpiętych do tego samego JVM. Railway w MVP = 1 instancja,
  więc realnie bez wpływu. Skalowanie horyzontalne wymaga Redis pub/sub
  (lub podobnego fan-out) — post-MVP.
- **Admin orders table: brak card-view dla `<md`** — na mobile tabela
  scrolluje się poziomo (`overflow-x-auto`). Świadoma decyzja: admin
  realnie pracuje z desktopa / tabletu, mobile-obsługa zamówień nie
  jest user story Fazy 4. Card-view per wiersz dla `<md` — odłożone,
  można dodać w Fazie 5 jeśli okaże się potrzebne w demo.

### Tech debt z review Fazy 4 (dopisane po akceptacji)
- **BUG-1 DEPLOY BLOCKER: JWT w Tomcat access logu przez SSE query param** —
  `GET /api/admin/orders/stream?token=<JWT>` trafia do domyślnego access
  log patternu Tomcata razem z całym query stringiem. Token ma 12h TTL,
  więc log = potencjalny leak długożyjącego secretu. **Przed deploy
  Fazy 5 wymagane jedno z:** (a) maskowanie query w access log pattern
  (custom `AccessLogValve` z regex `token=[^&]*` → `token=***`), lub
  (b) migracja AD-018 na httpOnly cookie (i zdjęcie query-param fallbacku
  z `JwtAuthenticationFilter.extractToken`). Opcja (a) tańsza, (b)
  czystsza architektonicznie.
- **BUG-2/3: SSE threading defaults** — `SseEmitterRegistry` używa
  `Executors.newSingleThreadScheduledExecutor()` dla heartbeatu (jeden
  wątek obsługuje heartbeaty wszystkich emiterów; blokada na write zatrzyma
  kolejne ticki), a `@EnableAsync` bez własnego `TaskExecutor` = Spring
  domyślnie używa `SimpleAsyncTaskExecutor` (wątek per event, bez
  poolingu). Akceptowalne dla MVP (1-2 adminów online, sporadyczne eventy).
  Post-MVP: `ThreadPoolTaskScheduler` dla heartbeatu + `ThreadPoolTask-
  Executor` jako `@Primary` dla `@Async`.
- **BUG-5: SSE reconnect bez limitu prób** — `useAdminOrderFeed` ma
  exponential backoff (1s→2s→…cap 30s) ale nieskończoną liczbę prób.
  Przy trwałym 401/backend down generuje log noise (toast nie, bo
  `onerror` jest silent). Do dodania: licznik prób + stan `disconnected`
  po np. 10 nieudanych + CTA "Odśwież stronę" w UI.
- **BUG-7: ETA ustawialne na DELIVERED/CANCELED** — backend
  `OrderStatusService.updateEta` nie sprawdza statusu, pozwala zapisać
  `etaMinutes` na zamówieniu terminalnym. UX nit: w panelu admin ETA
  na dostarczonym zamówieniu nie ma sensu. Fix: w service guard
  `if (order.getStatus().isTerminal()) throw unprocessable(...)` i
  ukrycie przycisku "Ustaw ETA" w `OrderDetailPage` gdy status terminalny.
- **BUG-9: loading text zamiast skeletona** — `OrdersListPage` i
  `OrderDetailPage` pokazują `"Ładowanie..."` jako plain text podczas
  initial fetch (tracking/menu mają już skeletony). Do wyrównania
  w Fazie 5 polish — skeleton table (5 wierszy) dla listy, skeleton
  cards dla detalu.
- **Rate limit brak na `GET /api/admin/orders/stream`** — `RateLimit-
  Filter` ma reguły na `POST /api/auth/login` i `POST /api/public/orders`,
  ale SSE stream jest auth-gated przez JWT (ROLE_ADMIN) bez dodatkowego
  limitu otwartych połączeń per IP. W praktyce admin otwiera 1 EventSource
  per karta, ale nic nie chroni przed użytkownikiem z ukradzionym tokenem
  otwierającym 1000 połączeń. Dorzucić regułę (np. `GET
  /api/admin/orders/stream` → 10 req/min/IP) w Fazie 5.

## Następne kroki
Faza 5 (Polish + Deploy) zamknięta w kodzie — wszystkie deploy-blockery
(BUG-1 access log, ETA guard, @Async pool, SSE rate limit) oraz carry-over
tech debt (notes align, Locale.ROOT, setScale, ErrorBoundary, skeletony)
rozwiązane. Pozostaje **manualny deploy na Railway** wg
[deployment.md](./deployment.md):
1. Utworzyć projekt Railway + Postgres plugin.
2. Dodać serwis z GitHub repo (branch `main` po mergu `phase-5`).
3. Ustawić env vars (`JWT_SECRET` wygenerowany `openssl rand -base64 48`,
   `ADMIN_EMAIL`/`ADMIN_PASSWORD`, `CORS_ALLOWED_ORIGINS` na Railway URL,
   `SPRING_PROFILES_ACTIVE=prod`, `DB_*` z refs `${{Postgres.*}}`).
4. Healthcheck `/actuator/health`.
5. Smoke: `/api/public/settings`, złożenie zamówienia public + obsługa
   admin, tracking polling.

Post-MVP (ROADMAP.md): SSE httpOnly cookie (AD-018 migracja), code
splitting per route, Framer Motion transitions, mobile 375px audit,
admin table card-view, seed V100/V101 gate po profilu.
