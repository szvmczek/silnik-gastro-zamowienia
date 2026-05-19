-- AD-Δ25 — RestaurantSettings operations fields (Faza 5 M1 backend activation).
-- defaultPreparationMinutes + minOrderAmount + manualClosed* — aktywuje 5
-- frontend konsumentów (InfoBar / Cart / KitchenPage / ClosedBanner / OperationsSection).

ALTER TABLE restaurant_settings
    ADD COLUMN default_preparation_minutes INT            NOT NULL DEFAULT 30,
    ADD COLUMN min_order_amount            NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN manual_closed_reason        VARCHAR(200)   NULL,
    ADD COLUMN manual_closed_until         TIMESTAMPTZ    NULL;
