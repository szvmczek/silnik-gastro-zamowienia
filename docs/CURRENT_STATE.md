# CURRENT_STATE.md

Snapshot stanu projektu. Aktualizowany przez Claude Code na koniec każdej fazy.

## Faza aktualnie w toku
Brak — Faza 4 zamknięta. Następna: Faza 5 (Polish + Deploy).

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

- [ ] Grupa 5: Checkout + Confirmation + Tracking
- [ ] Grupa 7: Admin Orders (flagship, screenshoty before/after)
- [ ] Grupa 8: Admin Menu CRUD
- [ ] Grupa 9: Admin Settings
- [ ] Grupa 10: Polish przekrojowy

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
