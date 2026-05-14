## Logic delta — itemNote + manual close + ETA prep

Phase 5 retrofit świadomie pomija 3 logic features wymagane przez 
PHASES.md (F2, F4, F11 lub odpowiedniki). Po Warstwie 3a/3b operator 
robi osobny task który dotyka frontendu + backendu spójnie:

1. itemNote (PHASES.md F2):
   - Backend: OrderItem.itemNote pole + migracja Flyway + DTO + endpoint
   - Frontend: CartItem.customerNote w store + addItem signature + 
     updateNote akcja + ProductModal textarea (max 200 zn) + 
     CartSidebar/Sheet inline display/edit + checkout snapshot
   - Świadomie pomijane: M-017 textarea customer notes

2. manual close (Faza 5 M1):
   - Backend: RestaurantSettings.manualClosedReason + manualClosedUntil
   - Frontend: ClosedBanner branch 'manual' (typeunion już zachowany)
   - Świadomie pomijane: M-013 ClosedBanner manual variant (TODO)

3. ETA prep (Faza 5 M1):
   - Backend: defaultPreparationMinutes + minOrderAmount + 
     freeDeliveryFrom + globalny deliveryFee w SettingsDto
   - Frontend: graceful fallback w komponentach Warstwy 3a (M-014, 
     M-015, M-021, M-022) — TS interface ma opcjonalne pola, 
     komponenty rendering null/skip gdy undefined
   - Świadomie pomijane: aktywacja modułów po M1 backend

4. Menu page headline edytowalny (Warstwa 3a fix-up F-002):
   - Aktualnie `frontend/src/features/public/menu/MenuPage.tsx` ma
     hardcoded headline "Wybierz, co zjesz." (bundle Stage 2 copy)
   - Post-MVP: pole `menuHeadline?: string | null` w PageContentDto
     ("MENU" entry obok HERO/ABOUT) lub osobny entry "MENU_HEADING"
     w PageContent admin sekcji
   - Frontend: zastąpić hardcoded copy `pageContent?.MENU?.title`
     z fallback do bundle copy gdy null
   - Admin UI: SettingsLayout → Treści strony → tab Menu (lub
     extension istniejącego PageContent admin formularza)
   - Świadomie poza scope Warstwy 3a fix-up

5. Walidacja formatu telefonu w admin Settings (Warstwa 3a fix-up F-006):
   - PublicNav (desktop label, mobile icon button) renderuje raw
     `settings.phone` z formatem zachowanym z admin form
   - Post-MVP: walidacja w admin Settings → Ogólne (input phone):
     sugestia maski `+48 XXX XXX XXX` lub similar PL standard
     (np. react-input-mask lub native pattern attribute)
   - Backend: regex `^\+?\d[\d\s-]{8,15}$` na endpoint update
     (Bean Validation @Pattern), zwrócić błąd 422 gdy malformed
   - Frontend: Zod schema walidacja przed PUT /admin/settings,
     toast error gdy format niepoprawny
   - Świadomie poza scope Warstwy 3a fix-up (UI walidacja gap)

6. About section stats trio (Warstwa 3a fix-up F-007 / AD-Δ5):
   - Bundle Stage 2 AboutSection ma 3 stats hardcoded:
     "8 lat / 40+ pozycji / 35 min"
   - My pomijamy w F-007 — `PageContentDto.ABOUT` (title/body/imageUrl/
     ctaLabel/ctaHref) nie ma pól stats; hardcoded narusza CLAUDE.md
   - Post-MVP opcje:
     A) Pola `foundedYear?: number | null` + `quickStats?: string[]`
        w PageContentDto.ABOUT entry + admin UI w PageContentPage
     B) Derive z dostępnych źródeł:
        - "{N}+ pozycji" z `usePublicMenu().categories.flatMap(...).length`
        - "{N} lat" z `RestaurantSettings.foundedYear` (gdy doda się)
        - "{N} min" z `settings.defaultPreparationMinutes` (Faza 5 M1)
     C) Dedicated 4-th PageContent entry "STATS" z body jako triple
   - Świadomie poza scope Warstwy 3a fix-up

7. Contact section "Strefa dostawy" wire-up (Warstwa 3a fix-up F-007 / AD-Δ6):
   - Bundle Stage 2 ContactMapSection ma 4-tą sekcję pod
     ADRES/TELEFON/E-MAIL: "STREFA DOSTAWY" z listą miast + link
   - My pomijamy w F-007 — backend ma data (DeliveryZoneDto.areas),
     ale brak public endpoint dla landing
   - Post-MVP wire-up:
     - Backend: wystawić `GET /public/delivery-zones-summary` zwracający
       unique areas z `DeliveryZone WHERE active = true`
     - Frontend: ContactSection dodać 4-ty field z `useQuery(["public",
       "delivery-zones-summary"])` z renderowaniem "Dostarczamy do:
       {area1}, {area2}, {area3}+" (limit 3-4 + "i więcej" link do
       delivery zone checker w checkout flow)
     - `features/admin/delivery-zones/` już istnieje (M-040 done lub
       in-progress) — backend ma model, tylko brak public projection
   - Świadomie poza scope Warstwy 3a fix-up

8. Footer social icons (Warstwa 3a fix-up #2 F-013):
   - Bundle Stage 2 footer Brand col ma 2 social icons (Facebook / Instagram)
     z `rgba(255,255,255,0.15)` border, 36×36px, hardcoded href="#"
   - Backend `SettingsDto` NIE ma pola `socialLinks` → świadomie pominięte
     w F-013 (bez backend touch w fix-upie)
   - Tagline (`SettingsDto.tagline: string | null`) JUŻ istnieje w DTO i jest
     używane w PublicFooter Brand col (graceful fallback null → element skip,
     pattern identyczny z Fazą 5 M1 modułami)
   - Post-MVP wire-up social:
     - Backend: dodać `socialLinks: SocialLinkDto[]` (provider + url) lub
       proste pola `facebookUrl?: string`, `instagramUrl?: string` w SettingsDto
     - Frontend: PublicFooter Brand col render conditional gdy links present,
       komponent `<SocialIconLink>` z mapowaniem provider→ikona (lucide-react
       Facebook, Instagram)
     - Admin SettingsPage tab "Social" lub inline w Ogólne

9. CategoryTabs scroll-spy dynamiczny offset (Warstwa 3a fix-up #3 follow-up):
   - `frontend/src/features/public/menu/components/CategoryTabs.tsx:32` ma
     `IntersectionObserver` z `rootMargin: "-200px 0px -60% 0px"` oraz scroll
     target offset `-200` w `getBoundingClientRect().top + window.scrollY - 200`
     (linia 48). Magic `-200` zakłada statyczny sticky stack 200px.
   - Po F-014 sticky stack jest dynamiczny (115-220px zależnie od stanu
     ClosedBanner / FreeDeliveryProgress / CategoryTabs sam siebie). Active
     pill aktywuje się z lekkim opóźnieniem przy scroll przez kategorie,
     bo IntersectionObserver triggeruje gdy section krzyżuje -200px linię
     niezależnie od rzeczywistej pozycji sticky stacka.
   - Akceptowalny kompromis w fix-upie #3 — niezauważalny w typowym
     scroll. NIE dotykane.
   - Post-MVP fix: zastąpić `-200` przez odczyt
     `parseInt(getComputedStyle(document.documentElement)
       .getPropertyValue("--sticky-stack-height")) || 200` w obu miejscach
     (rootMargin musi być string, więc template literal). Wymaga że
     ResizeObserver z F-014 odpalił przed IntersectionObserver setup —
     w praktyce useEffect order zapewnia to (MenuPage ResizeObserver
     useEffect odpala wcześniej niż CategoryTabs IntersectionObserver
     useEffect, bo MenuPage rendering parent → first).
   - Świadomie poza scope Warstwy 3a fix-up #3 — wymaga ostrożnego
     dorobienia z testem (cross-cat scroll smoke) i niewielki impact
     na UX (~50ms delay przy aktywacji pill).