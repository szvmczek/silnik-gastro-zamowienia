-- Design v3 „PIEC" — seed demo, milestone M2.
--
-- Przeładowuje treść demo na pizzerię z paczki designu: marka, godziny,
-- treści stron, pełne menu (18 pizz + dodatki + sosy + napoje + desery)
-- i strefy dostawy.
--
-- Uwaga 1 — destrukcyjne dla menu: kasuje dane z V101. Historyczne
-- zamówienia są bezpieczne: order_items ma FK tylko do orders, a nazwy
-- i ceny trzyma w snapshotach (CLAUDE.md §6).
--
-- Uwaga 2 — zdjęcia: paczka dostarcza własne JPG, ale eksport przez MCP
-- ucina pliki na 256 KiB (żaden nie ma markera EOI), więc trzymamy się
-- konwencji repo i AD-010: obraz jako URL. Cztery zweryfikowane kadry
-- rotują po produktach — dokładnie to samo robi imgFor() w paczce.
--
-- Uwaga 3 — ceny dodatków: paczka różnicuje je per rozmiar (ser 6/8 zł).
-- Addon.price to jedna wartość i modelu tu nie zmieniamy; bierzemy cenę
-- dla 30 cm. Odłożone w ROADMAP.md.

-- ---------------------------------------------------------------------
-- 1. Ustawienia restauracji
-- ---------------------------------------------------------------------

UPDATE restaurant_settings
SET name                       = 'PIEC',
    tagline                    = 'Pizzeria · Pułtusk, Kościuszki 14 · od 2011',
    primary_color              = '#E9A13B',
    phone                      = '+48236924187',
    email                      = 'kontakt@piec-pultusk.pl',
    address_line               = 'Kościuszki 14',
    city                       = 'Pułtusk',
    postal_code                = '06-100',
    currency                   = 'PLN',
    seo_description            = 'Pizza z pieca w Pułtusku. Ciasto robimy rano na bieżący dzień. Dowozimy po mieście i do 6 km za miasto.',
    default_preparation_minutes = 25,
    min_order_amount           = 40.00,
    free_delivery_from         = 70.00,
    updated_at                 = now()
WHERE id = 1;

-- ---------------------------------------------------------------------
-- 2. Godziny otwarcia — poniedziałek zamknięte
-- ---------------------------------------------------------------------

UPDATE opening_hours SET closed = true,  open_time = NULL,     close_time = NULL,     updated_at = now() WHERE day_of_week = 'MONDAY';
UPDATE opening_hours SET closed = false, open_time = '12:00',  close_time = '21:00',  updated_at = now() WHERE day_of_week = 'TUESDAY';
UPDATE opening_hours SET closed = false, open_time = '12:00',  close_time = '21:00',  updated_at = now() WHERE day_of_week = 'WEDNESDAY';
UPDATE opening_hours SET closed = false, open_time = '12:00',  close_time = '21:00',  updated_at = now() WHERE day_of_week = 'THURSDAY';
UPDATE opening_hours SET closed = false, open_time = '12:00',  close_time = '22:00',  updated_at = now() WHERE day_of_week = 'FRIDAY';
UPDATE opening_hours SET closed = false, open_time = '12:00',  close_time = '22:00',  updated_at = now() WHERE day_of_week = 'SATURDAY';
UPDATE opening_hours SET closed = false, open_time = '13:00',  close_time = '21:00',  updated_at = now() WHERE day_of_week = 'SUNDAY';

-- ---------------------------------------------------------------------
-- 3. Treści stron
-- ---------------------------------------------------------------------

UPDATE page_content
SET title      = 'Pizza z pieca, od 2011',
    body       = 'Ciasto robimy rano na bieżący dzień. Jak się skończy, kończymy przyjmować zamówienia.',
    image_url  = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
    cta_label  = 'Przejdź do menu',
    cta_href   = '/menu',
    active     = true,
    updated_at = now()
WHERE section_key = 'HERO';

UPDATE page_content
SET title      = 'Na Kościuszki od 2011',
    body       = 'Pizzeria na Kościuszki 14, między pocztą a apteką. Zaczynaliśmy we dwóch, dziś pracuje nas sześcioro. Ciasto robimy rano na bieżący dzień — jak się skończy, kończymy przyjmować zamówienia. Dowozimy własnym autem po Pułtusku i do 6 km za miasto. W poniedziałki nie pracujemy.',
    image_url  = 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=1600&q=80',
    cta_label  = NULL,
    cta_href   = NULL,
    active     = true,
    updated_at = now()
WHERE section_key = 'ABOUT';

-- ---------------------------------------------------------------------
-- 4. Czyszczenie menu z V101 (kolejność wg zależności FK)
-- ---------------------------------------------------------------------

DELETE FROM product_addon_groups;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM addons;
DELETE FROM addon_groups;
DELETE FROM categories;

-- ---------------------------------------------------------------------
-- 5. Kategorie
-- ---------------------------------------------------------------------

INSERT INTO categories (name, slug, description, display_order, active, created_at, updated_at)
VALUES
    ('Klasyczne', 'klasyczne', NULL,                                              1, true, now(), now()),
    ('Firmowe',   'firmowe',   NULL,                                              2, true, now(), now()),
    ('Białe',     'biale',     'na śmietanie, bez sosu pomidorowego',             3, true, now(), now()),
    ('Calzone',   'calzone',   'pizza zamykana, jeden rozmiar',                   4, true, now(), now()),
    ('Sosy',      'sosy',      'w kubeczku, do maczania',                         5, true, now(), now()),
    ('Napoje',    'napoje',    NULL,                                              6, true, now(), now()),
    ('Desery',    'desery',    NULL,                                              7, true, now(), now());

-- ---------------------------------------------------------------------
-- 6. Pizze — base_price NULL, cena żyje na wariantach
-- ---------------------------------------------------------------------

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, v.name, v.slug, v.descr, NULL, v.img, v.ord, v.avail, now(), now()
FROM (VALUES
    ('klasyczne', 'Margherita',           'margherita',           'sos pomidorowy, mozzarella, oregano',                                                'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80', 1, true),
    ('klasyczne', 'Salami',               'salami',               'sos pomidorowy, mozzarella, salami',                                                 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 2, true),
    ('klasyczne', 'Capricciosa',          'capricciosa',          'sos pomidorowy, mozzarella, szynka, pieczarki',                                      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80', 3, true),
    ('klasyczne', 'Hawajska',             'hawajska',             'sos pomidorowy, mozzarella, szynka, ananas',                                         'https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80', 4, true),
    ('klasyczne', 'Funghi',               'funghi',               'sos pomidorowy, mozzarella, pieczarki, świeży czosnek',                              'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80', 5, true),
    ('klasyczne', 'Pepperoni',            'pepperoni',            'sos pomidorowy, mozzarella, podwójne pepperoni, ostra papryczka',                    'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 6, true),
    ('firmowe',   'Wiejska',              'wiejska',              'sos pomidorowy, mozzarella, kiełbasa wiejska, boczek, cebula, ogórek kiszony',       'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80', 1, true),
    ('firmowe',   'Góralska',             'goralska',             'sos pomidorowy, mozzarella, oscypek, boczek, czerwona cebula, żurawina',             'https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80', 2, false),
    ('firmowe',   'Diavola',              'diavola',              'sos pomidorowy, mozzarella, ostre salami, papryczki chili, czerwona cebula',         'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80', 3, true),
    ('firmowe',   'Meksykańska',          'meksykanska',          'sos pomidorowy, mozzarella, wołowina, jalapeño, kukurydza, czerwona cebula',         'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 4, true),
    ('firmowe',   'Farmerska',            'farmerska',            'sos pomidorowy, mozzarella, kurczak, kukurydza, papryka',                            'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80', 5, true),
    ('firmowe',   'Tuńczykowa',           'tunczykowa',           'sos pomidorowy, mozzarella, tuńczyk, czerwona cebula, oliwki',                       'https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80', 6, true),
    ('firmowe',   'Wegetariańska',        'wegetarianska',        'sos pomidorowy, mozzarella, cukinia, bakłażan, papryka, oliwki, pomidorki',          'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80', 7, true),
    ('firmowe',   'Ogrodowa',             'ogrodowa',             'sos pomidorowy, mozzarella, pieczarki, cukinia, papryka, pomidorki, oliwki',         'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 8, true),
    ('biale',     'Carbonara',            'carbonara',            'śmietana, mozzarella, boczek, parmezan, czarny pieprz',                              'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80', 1, true),
    ('biale',     'Kurczak i Gorgonzola', 'kurczak-gorgonzola',   'śmietana, mozzarella, kurczak, gorgonzola, czerwona cebula, oliwki',                 'https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80', 2, true),
    ('biale',     'Cztery Sery',          'cztery-sery',          'śmietana, mozzarella, gorgonzola, ser wędzony, parmezan',                            'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80', 3, true),
    ('calzone',   'Calzone',              'calzone',              'pieróg z pieca: szynka, pieczarki, mozzarella i sos pomidorowy w środku',            'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80', 1, true)
) AS v(cat_slug, name, slug, descr, img, ord, avail)
JOIN categories c ON c.slug = v.cat_slug;

-- Warianty pizz: 30 cm / 42 cm.
WITH pizza_prices(slug, p30, p42) AS (VALUES
    ('margherita',         32.00, 45.00),
    ('salami',             38.00, 53.00),
    ('capricciosa',        39.00, 54.00),
    ('hawajska',           39.00, 54.00),
    ('funghi',             36.00, 50.00),
    ('pepperoni',          41.00, 56.00),
    ('wiejska',            43.00, 59.00),
    ('goralska',           45.00, 62.00),
    ('diavola',            42.00, 58.00),
    ('meksykanska',        43.00, 59.00),
    ('farmerska',          41.00, 56.00),
    ('tunczykowa',         42.00, 58.00),
    ('wegetarianska',      41.00, 56.00),
    ('ogrodowa',           40.00, 55.00),
    ('carbonara',          43.00, 59.00),
    ('kurczak-gorgonzola', 44.00, 60.00),
    ('cztery-sery',        44.00, 61.00)
)
INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, s.vname, s.price, s.ord, now(), now()
FROM pizza_prices pp
JOIN products p ON p.slug = pp.slug
CROSS JOIN LATERAL (VALUES ('30 cm', pp.p30, 1), ('42 cm', pp.p42, 2)) AS s(vname, price, ord);

-- Calzone ma jeden rozmiar — front pokaże cenę bez prefiksu „od" (D-07).
INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, 'ok. 30 cm', 42.00, 1, now(), now()
FROM products p WHERE p.slug = 'calzone';

-- ---------------------------------------------------------------------
-- 7. Produkty dobierane osobno (sosy w kubeczku, napoje, desery)
--    D-02: „Sos czosnkowy" istnieje tu jako Product ORAZ niżej jako Addon
--    w grupie „Sos do brzegów". To dwa różne zachowania biznesowe,
--    nie duplikacja.
-- ---------------------------------------------------------------------

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, v.name, v.slug, v.descr, v.price, v.img, v.ord, true, now(), now()
FROM (VALUES
    ('sosy',   'Sos czosnkowy',          'sos-czosnkowy',          '100 ml, w kubeczku',  5.00, CAST(NULL AS varchar), 1),
    ('sosy',   'Sos pomidorowy łagodny', 'sos-pomidorowy-lagodny', '100 ml, w kubeczku',  5.00, NULL,                  2),
    ('sosy',   'Sos ostry',              'sos-ostry',              '100 ml, w kubeczku',  5.00, NULL,                  3),
    ('napoje', 'Coca-Cola',              'coca-cola',              '0,5 l',              10.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80', 1),
    ('napoje', 'Coca-Cola Zero',         'coca-cola-zero',         '0,5 l',              10.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80', 2),
    ('napoje', 'Fanta',                  'fanta',                  '0,5 l',              10.00, NULL,                  3),
    ('napoje', 'Sprite',                 'sprite',                 '0,5 l',              10.00, NULL,                  4),
    ('napoje', 'Cisowianka gazowana',    'cisowianka-gazowana',    '0,5 l',               6.00, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80', 5),
    ('napoje', 'Cisowianka niegazowana', 'cisowianka-niegazowana', '0,5 l',               6.00, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80', 6),
    ('napoje', 'Kompot dnia',            'kompot-dnia',            '0,4 l',               8.00, NULL,                  7),
    ('desery', 'Sernik domowy',          'sernik-domowy',          'kawałek',            15.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80', 1),
    ('desery', 'Brownie z orzechami',    'brownie-z-orzechami',    'kawałek',            14.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 2)
) AS v(cat_slug, name, slug, descr, price, img, ord)
JOIN categories c ON c.slug = v.cat_slug;

-- ---------------------------------------------------------------------
-- 8. Grupy dodatków
-- ---------------------------------------------------------------------

INSERT INTO addon_groups (name, min_select, max_select, required, created_at, updated_at)
VALUES
    ('Dodatki',         0, 8, false, now(), now()),
    ('Sos do brzegów',  0, 3, false, now(), now()),
    ('Sos na wierzch',  1, 1, true,  now(), now());

INSERT INTO addons (addon_group_id, name, price, display_order, created_at, updated_at)
SELECT g.id, v.name, v.price, v.ord, now(), now()
FROM (VALUES
    ('Dodatki',        'Dodatkowy ser',           6.00,  1),
    ('Dodatki',        'Pieczarki',               5.00,  2),
    ('Dodatki',        'Szynka',                  7.00,  3),
    ('Dodatki',        'Salami',                  7.00,  4),
    ('Dodatki',        'Boczek',                  7.00,  5),
    ('Dodatki',        'Kurczak',                 7.00,  6),
    ('Dodatki',        'Czerwona cebula',         4.00,  7),
    ('Dodatki',        'Papryka',                 5.00,  8),
    ('Dodatki',        'Oliwki',                  5.00,  9),
    ('Dodatki',        'Kukurydza',               4.00, 10),
    ('Dodatki',        'Ananas',                  5.00, 11),
    ('Dodatki',        'Jalapeño',                5.00, 12),
    ('Dodatki',        'Rukola',                  5.00, 13),
    ('Dodatki',        'Świeży czosnek',          3.00, 14),
    ('Sos do brzegów', 'Czosnkowy',               5.00,  1),
    ('Sos do brzegów', 'Pomidorowy łagodny',      5.00,  2),
    ('Sos do brzegów', 'Ostry',                   5.00,  3),
    ('Sos na wierzch', 'Pomidorowy',              0.00,  1),
    ('Sos na wierzch', 'Czosnkowy',               0.00,  2),
    ('Sos na wierzch', 'Bez sosu',                0.00,  3)
) AS v(group_name, name, price, ord)
JOIN addon_groups g ON g.name = v.group_name;

-- Dodatki i sosy do brzegów — do wszystkich pizz (kategorie 1-4).
INSERT INTO product_addon_groups (product_id, addon_group_id, display_order, created_at, updated_at)
SELECT p.id, g.id, gv.ord, now(), now()
FROM products p
JOIN categories c ON c.id = p.category_id
CROSS JOIN (VALUES ('Dodatki', 1), ('Sos do brzegów', 2)) AS gv(name, ord)
JOIN addon_groups g ON g.name = gv.name
WHERE c.slug IN ('klasyczne', 'firmowe', 'biale', 'calzone');

-- Sos na wierzch — obowiązkowy wybór, tylko dla Calzone.
INSERT INTO product_addon_groups (product_id, addon_group_id, display_order, created_at, updated_at)
SELECT p.id, g.id, 3, now(), now()
FROM products p
JOIN addon_groups g ON g.name = 'Sos na wierzch'
WHERE p.slug = 'calzone';

-- ---------------------------------------------------------------------
-- 9. Strefy dostawy (D-01) — bez nich każdy checkout z DOSTAWĄ leci 422
-- ---------------------------------------------------------------------

INSERT INTO delivery_zone (name, type, delivery_fee, active, display_order, created_at, updated_at)
VALUES
    ('Pułtusk',          'PAID',  6.00, true, 1, now(), now()),
    ('Okolice do 6 km',  'PAID', 12.00, true, 2, now(), now());

INSERT INTO delivery_zone_area (zone_id, city_normalized, city_display, postal_code, created_at)
SELECT z.id, v.city_norm, v.city_disp, NULL, now()
FROM (VALUES
    ('Pułtusk',         'pultusk',   'Pułtusk'),
    ('Okolice do 6 km', 'poplawy',   'Popławy'),
    ('Okolice do 6 km', 'grabowiec', 'Grabówiec'),
    ('Okolice do 6 km', 'kleszewo',  'Kleszewo'),
    ('Okolice do 6 km', 'ponikiew',  'Ponikiew')
) AS v(zone_name, city_norm, city_disp)
JOIN delivery_zone z ON z.name = v.zone_name;
