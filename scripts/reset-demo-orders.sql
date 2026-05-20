-- Reset demo/dev order data while preserving restaurant, menu, settings,
-- legal content, delivery zones, and admin users.
--
-- DO NOT run on production unless you intentionally want to wipe orders.
-- This file is intentionally NOT a Flyway migration and never runs
-- automatically. Execute it manually only for local/demo database cleanup.

BEGIN;

TRUNCATE TABLE
    order_status_history,
    order_item_addons,
    order_items,
    orders
RESTART IDENTITY CASCADE;

-- Reset order numbering for the current Warsaw calendar year.
WITH current_year AS (
    SELECT EXTRACT(YEAR FROM NOW() AT TIME ZONE 'Europe/Warsaw')::INTEGER AS year
)
INSERT INTO order_number_sequence (year, last_number)
SELECT year, 0
FROM current_year
ON CONFLICT (year) DO UPDATE
SET last_number = 0;

COMMIT;
