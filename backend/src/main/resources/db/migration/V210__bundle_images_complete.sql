-- Design v3 „PIEC" — komplet zdjęć z paczki, przypisania po zawartości.
--
-- Poprzedni upload był niekompletny (brakowało jednego pliku), przez co nazwy
-- pojechały o jeden i V208/V209 przypisywały kadry na podstawie samej nazwy.
-- Teraz mamy wszystkie sześć w oryginalnym nazewnictwie.
--
-- WAŻNE: przypisania robimy po ZAWARTOŚCI zdjęć, nie po polu `img` z kodu
-- paczki — tam nazwy plików są przesunięte względem dostarczonych. Każdy
-- z czterech kadrów pokrywa się jednoznacznie ze składem dokładnie jednego
-- produktu, więc pomyłka jest wykluczona:
--   pizza-01 — pieczarki, cukinia, papryka, pomidorki, oliwki  → Ogrodowa
--   pizza-02 — biała, boczek, parmezan, czarny pieprz          → Carbonara
--   pizza-03 — cukinia, bakłażan, papryka, oliwki, pomidorki   → Wegetariańska
--   pizza-04 — biała, kurczak, gorgonzola, cebula, oliwki      → Kurczak i Gorgonzola
--
-- Pozostałe pizze dostają kadr pasujący do rodzaju sosu, a nie ślepą rotację
-- po wszystkich czterech: pizze na sosie pomidorowym rotują pizza-01/pizza-03,
-- a kategoria „Białe" dostaje zdjęcia białych pizz. Bez tego Margherita
-- lądowała ze zdjęciem carbonary na śmietanie — na demie u właściciela
-- pizzerii to widać od razu.
--
-- Osobna migracja, bo V208 i V209 są już zaaplikowane; zmiana treści
-- zaaplikowanej migracji łamie checksum Flyway.

-- Zdjęcia stron: hero-01 to kadr pełnoekranowy, hero-02 „pizza na desce".
UPDATE page_content SET image_url = '/uploads/hero-01.jpg', updated_at = now() WHERE section_key = 'HERO';
UPDATE page_content SET image_url = '/uploads/hero-02.jpg', updated_at = now() WHERE section_key = 'ABOUT';

-- Zdjęcia produktów — jawnie per slug, żeby dało się to przejrzeć wzrokiem.
UPDATE products p
SET image_url = v.img,
    updated_at = now()
FROM (VALUES
    -- Klasyczne (sos pomidorowy)
    ('margherita',         '/uploads/pizza-01.jpg'),
    ('salami',             '/uploads/pizza-03.jpg'),
    ('capricciosa',        '/uploads/pizza-01.jpg'),
    ('hawajska',           '/uploads/pizza-03.jpg'),
    ('funghi',             '/uploads/pizza-01.jpg'),
    ('pepperoni',          '/uploads/pizza-03.jpg'),
    -- Firmowe (sos pomidorowy)
    ('wiejska',            '/uploads/pizza-01.jpg'),
    ('goralska',           '/uploads/pizza-03.jpg'),
    ('diavola',            '/uploads/pizza-03.jpg'),
    ('meksykanska',        '/uploads/pizza-01.jpg'),
    ('farmerska',          '/uploads/pizza-03.jpg'),
    ('tunczykowa',         '/uploads/pizza-01.jpg'),
    ('wegetarianska',      '/uploads/pizza-03.jpg'),
    ('ogrodowa',           '/uploads/pizza-01.jpg'),
    -- Białe (na śmietanie)
    ('carbonara',          '/uploads/pizza-02.jpg'),
    ('kurczak-gorgonzola', '/uploads/pizza-04.jpg'),
    ('cztery-sery',        '/uploads/pizza-02.jpg'),
    -- Calzone — sos pomidorowy w środku
    ('calzone',            '/uploads/pizza-01.jpg')
) AS v(slug, img)
WHERE p.slug = v.slug;
