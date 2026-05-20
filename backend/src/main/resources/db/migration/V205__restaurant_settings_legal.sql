-- M-046 — RODO: privacy policy + terms of service.
-- Dedykowane kolumny TEXT na RestaurantSettings. Edytor w Settings → RODO,
-- public przez GET /api/public/legal (celowo poza pollowanym /public/settings).
-- Seed = polski szablon; klient weryfikuje i dostosowuje przed publikacją.

ALTER TABLE restaurant_settings
    ADD COLUMN privacy_policy   TEXT,
    ADD COLUMN terms_of_service TEXT;

UPDATE restaurant_settings
SET privacy_policy = 'POLITYKA PRYWATNOŚCI

1. Administrator danych
Administratorem Twoich danych osobowych jest restauracja prowadząca niniejszy serwis. Dane kontaktowe znajdziesz w sekcji Kontakt na stronie głównej.

2. Jakie dane zbieramy
Przy składaniu zamówienia przetwarzamy: imię i nazwisko, numer telefonu, adres dostawy oraz opcjonalnie adres e-mail. Przetwarzamy także treść zamówienia i uwagi do niego.

3. Cel i podstawa prawna
Dane przetwarzamy wyłącznie w celu przyjęcia, realizacji i rozliczenia zamówienia oraz obsługi ewentualnych reklamacji — na podstawie art. 6 ust. 1 lit. b RODO (wykonanie umowy).

4. Okres przechowywania
Dane przechowujemy przez czas niezbędny do realizacji zamówienia oraz przez okres wymagany przepisami prawa, w szczególności podatkowymi.

5. Odbiorcy danych
Dane mogą zostać udostępnione osobie realizującej dostawę — wyłącznie w zakresie niezbędnym do dostarczenia zamówienia. Nie sprzedajemy ani nie udostępniamy danych w celach marketingowych.

6. Twoje prawa
Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, wniesienia sprzeciwu oraz przenoszenia danych. Skargę możesz wnieść do Prezesa Urzędu Ochrony Danych Osobowych.

7. Pamięć przeglądarki
Serwis korzysta z lokalnej pamięci przeglądarki wyłącznie w zakresie niezbędnym do działania koszyka i panelu logowania. Nie stosujemy plików śledzących ani narzędzi analitycznych.

Ten dokument jest szablonem. Przed publikacją zweryfikuj jego treść i dostosuj ją do swojej działalności.',
    terms_of_service = 'REGULAMIN

1. Postanowienia ogólne
Regulamin określa zasady składania i realizacji zamówień na posiłki za pośrednictwem niniejszego serwisu, prowadzonego przez restaurację.

2. Składanie zamówień
Zamówienie składasz wybierając pozycje z menu i podając dane niezbędne do realizacji: imię, numer telefonu oraz adres dostawy lub wybór odbioru osobistego.

3. Ceny
Wszystkie ceny w menu są cenami brutto i zawierają podatek VAT. Wiążąca jest cena widoczna w podsumowaniu koszyka w chwili złożenia zamówienia.

4. Realizacja i dostawa
Zamówienia realizujemy w godzinach otwarcia restauracji. Podany czas realizacji jest orientacyjny. Dostawa odbywa się na obszarze obsługiwanym przez restaurację.

5. Płatność
Płatność za zamówienie następuje gotówką — przy odbiorze osobistym lub przy dostawie, zgodnie z wybraną metodą.

6. Anulowanie zamówienia
Zamówienie możesz anulować do momentu rozpoczęcia jego przygotowania, kontaktując się telefonicznie z restauracją.

7. Reklamacje
Reklamacje dotyczące zamówienia możesz zgłosić telefonicznie lub e-mailem. Restauracja rozpatruje zgłoszenia bez zbędnej zwłoki.

8. Dane osobowe
Zasady przetwarzania danych osobowych opisuje Polityka prywatności.

Ten dokument jest szablonem. Przed publikacją zweryfikuj jego treść i dostosuj ją do swojej działalności.'
WHERE id = 1;
