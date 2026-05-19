-- AD-Δ23 — Rebrand page_content seed z V100 włoskich demo copy na polskie.
-- V200 (Fix-up #5) zrebrandowało tylko restaurant_settings.tagline — page_content
-- pozostał z włoskim seed. V203 dokańcza rebrand.
-- Idempotent / safe — UPDATE tylko gdy wiersz wciąż trzyma oryginalny V100 seed
-- (match po title + body). User edits przez admin panel NIE są nadpisywane.

UPDATE page_content
SET title = 'Świeże pizze z dostawą do domu',
    body = 'Krótki czas oczekiwania, lokalne składniki. Zamów online lub odbierz osobiście — bez kompromisów.',
    updated_at = NOW()
WHERE section_key = 'HERO'
  AND title = 'Smak Włoch w Twoim domu'
  AND body = 'Robimy pizzę tak, jak kochają ją Włosi — na cienkim cieście, z sosem z pomidorów San Marzano i mozzarellą fior di latte. Zamów online i ciesz się smakiem w kilka minut.';

UPDATE page_content
SET title = 'Lokalna pizzeria z pasją',
    body = 'Codziennie wypiekamy pizze ze świeżych składników od lokalnych dostawców. Stawiamy na krótki czas oczekiwania i jakość. Zamów online, odbierz w lokalu lub poczekaj na dostawę.',
    updated_at = NOW()
WHERE section_key = 'ABOUT'
  AND title = 'O nas'
  AND body = 'Pizza Demo to rodzinna pizzeria prowadzona z sercem od 2008 roku. Używamy włoskich składników, pieczemy w piecu opalanym drewnem i wierzymy, że dobre jedzenie buduje wspólnotę. Zapraszamy do lokalu albo na zamówienie z dostawą.';
