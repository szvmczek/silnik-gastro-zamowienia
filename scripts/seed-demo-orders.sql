-- Seed neutral demo orders after scripts/reset-demo-orders.sql.
--
-- DO NOT run on production unless you intentionally want demo orders.
-- This file is intentionally NOT a Flyway migration and never runs
-- automatically. It expects an empty order domain and preserves restaurant,
-- menu, settings, legal content, delivery zones, and admin users.

BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM orders) THEN
        RAISE EXCEPTION 'seed-demo-orders.sql expects an empty orders table. Run reset-demo-orders.sql first.';
    END IF;

    IF (SELECT COUNT(DISTINCT slug) FROM products WHERE slug IN (
        'margherita',
        'salami',
        'capricciosa',
        'quattro-formaggi',
        'coca-cola-0-5l',
        'woda-mineralna-0-5l',
        'tiramisu',
        'brownie'
    )) <> 8 THEN
        RAISE EXCEPTION 'Missing required demo products from V101__seed_menu.sql.';
    END IF;

    IF (SELECT COUNT(DISTINCT name) FROM addons WHERE name IN ('Ser extra', 'Pieczarki', 'Szynka', 'Oliwki')) <> 4 THEN
        RAISE EXCEPTION 'Missing required demo addons from V101__seed_menu.sql.';
    END IF;
END $$;

CREATE TEMP TABLE demo_seed_year (
    year INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_seed_year (year)
SELECT EXTRACT(YEAR FROM NOW() AT TIME ZONE 'Europe/Warsaw')::INTEGER;

CREATE TEMP TABLE demo_order_seed (
    order_key TEXT PRIMARY KEY,
    seq INTEGER NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    public_tracking_token UUID NOT NULL UNIQUE,
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(160),
    fulfillment_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    delivery_street VARCHAR(150),
    delivery_building_number VARCHAR(20),
    delivery_apartment_number VARCHAR(20),
    delivery_postal_code VARCHAR(10),
    delivery_city VARCHAR(80),
    delivery_notes VARCHAR(255),
    customer_notes VARCHAR(500),
    delivery_fee NUMERIC(10, 2) NOT NULL,
    delivery_zone_name VARCHAR(80),
    eta_minutes INTEGER,
    created_at TIMESTAMPTZ NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_order_seed (
    order_key, seq, status, public_tracking_token, customer_name, customer_phone,
    customer_email, fulfillment_type, payment_method, delivery_street,
    delivery_building_number, delivery_apartment_number, delivery_postal_code,
    delivery_city, delivery_notes, customer_notes, delivery_fee,
    delivery_zone_name, eta_minutes, created_at
) VALUES
    ('demo-new-pickup', 1, 'NEW', '00000000-0000-4000-8000-000000000001',
     'Jan Demo', '+48100000000', 'jan.demo@example.test', 'PICKUP', 'CASH_ON_PICKUP',
     NULL, NULL, NULL, NULL, NULL, NULL, 'Demo: odbior osobisty.', 0.00, NULL, 30,
     NOW() - INTERVAL '5 minutes'),
    ('demo-confirmed-delivery', 2, 'CONFIRMED', '00000000-0000-4000-8000-000000000002',
     'Anna Test', '+48200000000', 'anna.test@example.test', 'DELIVERY', 'CASH_ON_DELIVERY',
     'Testowa', '1', NULL, '05-000', 'Demo', 'Domofon testowy.', 'Demo: gotowka przy dostawie.', 5.00, 'Demo zone', 30,
     NOW() - INTERVAL '15 minutes'),
    ('demo-prep-pickup', 3, 'IN_PREPARATION', '00000000-0000-4000-8000-000000000003',
     'Klient Testowy', '+48300000000', NULL, 'PICKUP', 'CASH_ON_PICKUP',
     NULL, NULL, NULL, NULL, NULL, NULL, 'Demo: bez sztuccow.', 0.00, NULL, 25,
     NOW() - INTERVAL '30 minutes'),
    ('demo-ready-pickup', 4, 'READY', '00000000-0000-4000-8000-000000000004',
     'E2E Demo', '+48400000000', 'e2e.demo@example.test', 'PICKUP', 'CASH_ON_PICKUP',
     NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0.00, NULL, 20,
     NOW() - INTERVAL '45 minutes'),
    ('demo-out-delivery', 5, 'OUT_FOR_DELIVERY', '00000000-0000-4000-8000-000000000005',
     'Jan Demo', '+48500000000', NULL, 'DELIVERY', 'CASH_ON_DELIVERY',
     'Testowa', '2', '4', '05-000', 'Demo', 'Klatka A.', 'Demo: prosze dzwonic.', 5.00, 'Demo zone', 35,
     NOW() - INTERVAL '60 minutes'),
    ('demo-delivered-delivery', 6, 'DELIVERED', '00000000-0000-4000-8000-000000000006',
     'Anna Test', '+48600000000', 'anna.delivery@example.test', 'DELIVERY', 'CASH_ON_DELIVERY',
     'Pokazowa', '3', NULL, '05-000', 'Demo', NULL, NULL, 5.00, 'Demo zone', 30,
     NOW() - INTERVAL '1 day 2 hours'),
    ('demo-canceled-pickup', 7, 'CANCELED', '00000000-0000-4000-8000-000000000007',
     'Klient Testowy', '+48700000000', NULL, 'PICKUP', 'CASH_ON_PICKUP',
     NULL, NULL, NULL, NULL, NULL, NULL, 'Demo: anulowane zamowienie.', 0.00, NULL, NULL,
     NOW() - INTERVAL '2 days');

CREATE TEMP TABLE demo_order_line_seed (
    line_key TEXT PRIMARY KEY,
    order_key TEXT NOT NULL REFERENCES demo_order_seed(order_key),
    product_slug TEXT NOT NULL,
    variant_name TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
) ON COMMIT DROP;

INSERT INTO demo_order_line_seed (line_key, order_key, product_slug, variant_name, quantity) VALUES
    ('line-1-pizza', 'demo-new-pickup', 'margherita', '30 cm', 1),
    ('line-1-drink', 'demo-new-pickup', 'coca-cola-0-5l', NULL, 1),
    ('line-2-pizza', 'demo-confirmed-delivery', 'salami', '40 cm', 1),
    ('line-2-dessert', 'demo-confirmed-delivery', 'tiramisu', NULL, 1),
    ('line-3-pizza', 'demo-prep-pickup', 'capricciosa', '30 cm', 2),
    ('line-3-drink', 'demo-prep-pickup', 'woda-mineralna-0-5l', NULL, 1),
    ('line-4-pizza', 'demo-ready-pickup', 'quattro-formaggi', '30 cm', 1),
    ('line-4-dessert', 'demo-ready-pickup', 'brownie', NULL, 1),
    ('line-5-pizza', 'demo-out-delivery', 'capricciosa', '40 cm', 1),
    ('line-5-drink', 'demo-out-delivery', 'coca-cola-0-5l', NULL, 2),
    ('line-6-pizza', 'demo-delivered-delivery', 'margherita', '40 cm', 1),
    ('line-6-dessert', 'demo-delivered-delivery', 'tiramisu', NULL, 1),
    ('line-6-drink', 'demo-delivered-delivery', 'woda-mineralna-0-5l', NULL, 1),
    ('line-7-pizza', 'demo-canceled-pickup', 'salami', '30 cm', 1),
    ('line-7-dessert', 'demo-canceled-pickup', 'brownie', NULL, 1);

CREATE TEMP TABLE demo_line_addon_seed (
    line_key TEXT NOT NULL REFERENCES demo_order_line_seed(line_key),
    addon_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_line_addon_seed (line_key, addon_name) VALUES
    ('line-1-pizza', 'Ser extra'),
    ('line-2-pizza', 'Pieczarki'),
    ('line-3-pizza', 'Szynka'),
    ('line-4-pizza', 'Oliwki'),
    ('line-5-pizza', 'Ser extra'),
    ('line-5-pizza', 'Pieczarki'),
    ('line-6-pizza', 'Ser extra');

CREATE TEMP TABLE demo_status_step_seed (
    order_key TEXT NOT NULL REFERENCES demo_order_seed(order_key),
    step_order INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    changed_after INTERVAL NOT NULL,
    reason TEXT
) ON COMMIT DROP;

INSERT INTO demo_status_step_seed (order_key, step_order, status, changed_after, reason) VALUES
    ('demo-new-pickup', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-confirmed-delivery', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-confirmed-delivery', 2, 'CONFIRMED', INTERVAL '4 minutes', NULL),
    ('demo-prep-pickup', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-prep-pickup', 2, 'CONFIRMED', INTERVAL '3 minutes', NULL),
    ('demo-prep-pickup', 3, 'IN_PREPARATION', INTERVAL '8 minutes', NULL),
    ('demo-ready-pickup', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-ready-pickup', 2, 'CONFIRMED', INTERVAL '4 minutes', NULL),
    ('demo-ready-pickup', 3, 'IN_PREPARATION', INTERVAL '12 minutes', NULL),
    ('demo-ready-pickup', 4, 'READY', INTERVAL '28 minutes', NULL),
    ('demo-out-delivery', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-out-delivery', 2, 'CONFIRMED', INTERVAL '5 minutes', NULL),
    ('demo-out-delivery', 3, 'IN_PREPARATION', INTERVAL '15 minutes', NULL),
    ('demo-out-delivery', 4, 'READY', INTERVAL '38 minutes', NULL),
    ('demo-out-delivery', 5, 'OUT_FOR_DELIVERY', INTERVAL '45 minutes', NULL),
    ('demo-delivered-delivery', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-delivered-delivery', 2, 'CONFIRMED', INTERVAL '4 minutes', NULL),
    ('demo-delivered-delivery', 3, 'IN_PREPARATION', INTERVAL '12 minutes', NULL),
    ('demo-delivered-delivery', 4, 'READY', INTERVAL '30 minutes', NULL),
    ('demo-delivered-delivery', 5, 'OUT_FOR_DELIVERY', INTERVAL '36 minutes', NULL),
    ('demo-delivered-delivery', 6, 'DELIVERED', INTERVAL '52 minutes', NULL),
    ('demo-canceled-pickup', 1, 'NEW', INTERVAL '0 minutes', NULL),
    ('demo-canceled-pickup', 2, 'CANCELED', INTERVAL '6 minutes', 'Demo cancellation');

WITH line_addon_totals AS (
    SELECT las.line_key, SUM(a.price)::NUMERIC(10, 2) AS addon_total
    FROM demo_line_addon_seed las
    JOIN addons a ON a.name = las.addon_name
    GROUP BY las.line_key
),
line_prices AS (
    SELECT
        l.order_key,
        l.line_key,
        l.quantity,
        COALESCE(v.price, p.base_price)::NUMERIC(10, 2) AS unit_price,
        COALESCE(lat.addon_total, 0)::NUMERIC(10, 2) AS addon_total
    FROM demo_order_line_seed l
    JOIN products p ON p.slug = l.product_slug
    LEFT JOIN product_variants v
        ON v.product_id = p.id
       AND v.name = l.variant_name
    LEFT JOIN line_addon_totals lat ON lat.line_key = l.line_key
),
order_totals AS (
    SELECT
        order_key,
        SUM((unit_price + addon_total) * quantity)::NUMERIC(10, 2) AS subtotal
    FROM line_prices
    GROUP BY order_key
)
INSERT INTO orders (
    order_number,
    public_tracking_token,
    status,
    customer_name,
    customer_phone,
    customer_email,
    fulfillment_type,
    payment_method,
    delivery_street,
    delivery_building_number,
    delivery_apartment_number,
    delivery_postal_code,
    delivery_city,
    delivery_notes,
    customer_notes,
    subtotal,
    total,
    delivery_fee,
    delivery_zone_name,
    eta_minutes,
    eta_set_at,
    version,
    created_at,
    updated_at
)
SELECT
    CONCAT(y.year, '-', LPAD(s.seq::TEXT, 5, '0')),
    s.public_tracking_token,
    s.status,
    s.customer_name,
    s.customer_phone,
    s.customer_email,
    s.fulfillment_type,
    s.payment_method,
    s.delivery_street,
    s.delivery_building_number,
    s.delivery_apartment_number,
    s.delivery_postal_code,
    s.delivery_city,
    s.delivery_notes,
    s.customer_notes,
    ot.subtotal,
    (ot.subtotal + s.delivery_fee)::NUMERIC(10, 2),
    s.delivery_fee,
    s.delivery_zone_name,
    s.eta_minutes,
    CASE WHEN s.eta_minutes IS NULL THEN NULL ELSE s.created_at END,
    0,
    s.created_at,
    s.created_at
FROM demo_order_seed s
CROSS JOIN demo_seed_year y
JOIN order_totals ot ON ot.order_key = s.order_key
ORDER BY s.seq;

CREATE TEMP TABLE demo_order_ids (
    order_key TEXT PRIMARY KEY,
    order_id BIGINT NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_order_ids (order_key, order_id)
SELECT s.order_key, o.id
FROM demo_order_seed s
CROSS JOIN demo_seed_year y
JOIN orders o ON o.order_number = CONCAT(y.year, '-', LPAD(s.seq::TEXT, 5, '0'));

WITH line_addon_totals AS (
    SELECT las.line_key, SUM(a.price)::NUMERIC(10, 2) AS addon_total
    FROM demo_line_addon_seed las
    JOIN addons a ON a.name = las.addon_name
    GROUP BY las.line_key
)
INSERT INTO order_items (
    order_id,
    product_id,
    variant_id,
    product_name_snapshot,
    variant_name_snapshot,
    unit_price_snapshot,
    quantity,
    line_total,
    created_at,
    updated_at
)
SELECT
    doi.order_id,
    p.id,
    v.id,
    p.name,
    v.name,
    COALESCE(v.price, p.base_price)::NUMERIC(10, 2),
    l.quantity,
    ((COALESCE(v.price, p.base_price) + COALESCE(lat.addon_total, 0)) * l.quantity)::NUMERIC(10, 2),
    o.created_at,
    o.created_at
FROM demo_order_line_seed l
JOIN demo_order_ids doi ON doi.order_key = l.order_key
JOIN orders o ON o.id = doi.order_id
JOIN products p ON p.slug = l.product_slug
LEFT JOIN product_variants v
    ON v.product_id = p.id
   AND v.name = l.variant_name
LEFT JOIN line_addon_totals lat ON lat.line_key = l.line_key
ORDER BY doi.order_id, l.line_key;

CREATE TEMP TABLE demo_line_ids (
    line_key TEXT PRIMARY KEY,
    order_item_id BIGINT NOT NULL
) ON COMMIT DROP;

INSERT INTO demo_line_ids (line_key, order_item_id)
SELECT l.line_key, oi.id
FROM demo_order_line_seed l
JOIN demo_order_ids doi ON doi.order_key = l.order_key
JOIN products p ON p.slug = l.product_slug
LEFT JOIN product_variants v
    ON v.product_id = p.id
   AND v.name = l.variant_name
JOIN order_items oi
    ON oi.order_id = doi.order_id
   AND oi.product_id = p.id
   AND COALESCE(oi.variant_id, -1) = COALESCE(v.id, -1)
   AND oi.quantity = l.quantity;

INSERT INTO order_item_addons (
    order_item_id,
    addon_id,
    addon_group_name_snapshot,
    addon_name_snapshot,
    unit_price_snapshot,
    created_at,
    updated_at
)
SELECT
    dli.order_item_id,
    a.id,
    ag.name,
    a.name,
    a.price,
    oi.created_at,
    oi.created_at
FROM demo_line_addon_seed las
JOIN demo_line_ids dli ON dli.line_key = las.line_key
JOIN order_items oi ON oi.id = dli.order_item_id
JOIN addons a ON a.name = las.addon_name
JOIN addon_groups ag ON ag.id = a.addon_group_id
ORDER BY dli.order_item_id, a.display_order;

INSERT INTO order_status_history (
    order_id,
    status,
    changed_at,
    changed_by,
    reason
)
SELECT
    doi.order_id,
    sh.status,
    o.created_at + sh.changed_after,
    'demo-seed',
    sh.reason
FROM demo_status_step_seed sh
JOIN demo_order_ids doi ON doi.order_key = sh.order_key
JOIN orders o ON o.id = doi.order_id
ORDER BY doi.order_id, sh.step_order;

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM demo_order_ids) <> 7 THEN
        RAISE EXCEPTION 'Expected 7 demo orders.';
    END IF;

    IF (SELECT COUNT(*) FROM demo_line_ids) <> (SELECT COUNT(*) FROM demo_order_line_seed) THEN
        RAISE EXCEPTION 'Not all demo order lines were inserted.';
    END IF;
END $$;

INSERT INTO order_number_sequence (year, last_number)
SELECT year, (SELECT MAX(seq) FROM demo_order_seed)
FROM demo_seed_year
ON CONFLICT (year) DO UPDATE
SET last_number = EXCLUDED.last_number;

COMMIT;
