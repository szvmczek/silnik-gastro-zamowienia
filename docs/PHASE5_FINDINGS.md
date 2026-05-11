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