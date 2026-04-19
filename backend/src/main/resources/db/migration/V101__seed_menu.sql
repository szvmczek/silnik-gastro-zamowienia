-- Phase 2 demo seed. Idempotent via WHERE NOT EXISTS on slug/name keys.
-- Pizza Demo menu: 3 kategorie, 8 produktów, 1 grupa dodatków z 4 dodatkami.

-- Kategorie
INSERT INTO categories (name, slug, description, display_order, active, created_at, updated_at)
SELECT 'Pizze', 'pizze', 'Autentyczne włoskie pizze prosto z pieca', 1, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'pizze');

INSERT INTO categories (name, slug, description, display_order, active, created_at, updated_at)
SELECT 'Napoje', 'napoje', 'Napoje zimne i ciepłe', 2, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'napoje');

INSERT INTO categories (name, slug, description, display_order, active, created_at, updated_at)
SELECT 'Desery', 'desery', 'Domowe desery włoskie', 3, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'desery');

-- Grupa dodatków + dodatki
INSERT INTO addon_groups (name, min_select, max_select, required, created_at, updated_at)
SELECT 'Dodatki pizzy', 0, 4, FALSE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM addon_groups WHERE name = 'Dodatki pizzy');

INSERT INTO addons (addon_group_id, name, price, display_order, created_at, updated_at)
SELECT ag.id, 'Ser extra', 6.00, 1, NOW(), NOW()
FROM addon_groups ag
WHERE ag.name = 'Dodatki pizzy'
  AND NOT EXISTS (SELECT 1 FROM addons a WHERE a.addon_group_id = ag.id AND a.name = 'Ser extra');

INSERT INTO addons (addon_group_id, name, price, display_order, created_at, updated_at)
SELECT ag.id, 'Pieczarki', 4.00, 2, NOW(), NOW()
FROM addon_groups ag
WHERE ag.name = 'Dodatki pizzy'
  AND NOT EXISTS (SELECT 1 FROM addons a WHERE a.addon_group_id = ag.id AND a.name = 'Pieczarki');

INSERT INTO addons (addon_group_id, name, price, display_order, created_at, updated_at)
SELECT ag.id, 'Szynka', 5.00, 3, NOW(), NOW()
FROM addon_groups ag
WHERE ag.name = 'Dodatki pizzy'
  AND NOT EXISTS (SELECT 1 FROM addons a WHERE a.addon_group_id = ag.id AND a.name = 'Szynka');

INSERT INTO addons (addon_group_id, name, price, display_order, created_at, updated_at)
SELECT ag.id, 'Oliwki', 3.50, 4, NOW(), NOW()
FROM addon_groups ag
WHERE ag.name = 'Dodatki pizzy'
  AND NOT EXISTS (SELECT 1 FROM addons a WHERE a.addon_group_id = ag.id AND a.name = 'Oliwki');

-- Produkty: pizze (base_price NULL, mają warianty)
INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Margherita', 'margherita',
       'Sos pomidorowy San Marzano, mozzarella fior di latte, bazylia, oliwa.',
       NULL,
       'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80',
       1, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'pizze'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'margherita');

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Salami', 'salami',
       'Sos pomidorowy, mozzarella, ostre salami picante.',
       NULL,
       'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
       2, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'pizze'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'salami');

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Capricciosa', 'capricciosa',
       'Sos pomidorowy, mozzarella, szynka, pieczarki, karczochy.',
       NULL,
       'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80',
       3, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'pizze'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'capricciosa');

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Quattro Formaggi', 'quattro-formaggi',
       'Cztery sery: mozzarella, gorgonzola, parmezan, ementaler.',
       NULL,
       'https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=800&q=80',
       4, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'pizze'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'quattro-formaggi');

-- Produkty: napoje
INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Coca-Cola 0.5L', 'coca-cola-0-5l',
       'Butelka PET 0.5 litra, schłodzona.',
       8.00,
       'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=800&q=80',
       1, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'napoje'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'coca-cola-0-5l');

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Woda Mineralna 0.5L', 'woda-mineralna-0-5l',
       'Gazowana lub niegazowana do wyboru.',
       5.00,
       'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
       2, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'napoje'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'woda-mineralna-0-5l');

-- Produkty: desery
INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Tiramisu', 'tiramisu',
       'Klasyczne tiramisu z mascarpone i kawą espresso.',
       18.00,
       'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
       1, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'desery'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'tiramisu');

INSERT INTO products (category_id, name, slug, description, base_price, image_url, display_order, available, created_at, updated_at)
SELECT c.id, 'Brownie', 'brownie',
       'Gorące brownie z lodami waniliowymi.',
       16.00,
       'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
       2, TRUE, NOW(), NOW()
FROM categories c
WHERE c.slug = 'desery'
  AND NOT EXISTS (SELECT 1 FROM products WHERE slug = 'brownie');

-- Warianty pizz (30 cm / 40 cm) — ceny dobrane jak w planie
INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '30 cm', 29.00, 1, NOW(), NOW()
FROM products p
WHERE p.slug = 'margherita'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '30 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '40 cm', 42.00, 2, NOW(), NOW()
FROM products p
WHERE p.slug = 'margherita'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '40 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '30 cm', 32.00, 1, NOW(), NOW()
FROM products p
WHERE p.slug = 'salami'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '30 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '40 cm', 46.00, 2, NOW(), NOW()
FROM products p
WHERE p.slug = 'salami'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '40 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '30 cm', 34.00, 1, NOW(), NOW()
FROM products p
WHERE p.slug = 'capricciosa'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '30 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '40 cm', 49.00, 2, NOW(), NOW()
FROM products p
WHERE p.slug = 'capricciosa'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '40 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '30 cm', 36.00, 1, NOW(), NOW()
FROM products p
WHERE p.slug = 'quattro-formaggi'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '30 cm');

INSERT INTO product_variants (product_id, name, price, display_order, created_at, updated_at)
SELECT p.id, '40 cm', 52.00, 2, NOW(), NOW()
FROM products p
WHERE p.slug = 'quattro-formaggi'
  AND NOT EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.name = '40 cm');

-- Powiązanie pizz z grupą dodatków
INSERT INTO product_addon_groups (product_id, addon_group_id, display_order, created_at, updated_at)
SELECT p.id, ag.id, 1, NOW(), NOW()
FROM products p, addon_groups ag
WHERE p.slug IN ('margherita', 'salami', 'capricciosa', 'quattro-formaggi')
  AND ag.name = 'Dodatki pizzy'
  AND NOT EXISTS (
      SELECT 1 FROM product_addon_groups pag
      WHERE pag.product_id = p.id AND pag.addon_group_id = ag.id
  );
