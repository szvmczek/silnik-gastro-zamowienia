-- Design v3 „PIEC" — D-03 (reszta przy płatności gotówką) + D-01 (próg darmowej dostawy).
--
-- D-03: cash_change_from — nominał banknotu, z którego klient chce resztę.
--       NULL = klient płaci odliczoną kwotą (brak reszty do wydania).
--       Kurier / osoba wydająca musi to widzieć, stąd pole trafia też do DTO admina.
--
-- D-01: free_delivery_from — próg, powyżej którego dostawa jest gratis.
--       NULL = brak progu. Sam koszt dostawy zostaje per DeliveryZone (V10),
--       na restaurant_settings NIE dokładamy delivery_fee.
--
-- Numeracja: prod ma flyway.out-of-order wyłączone, więc nowa migracja musi mieć
-- numer wyższy niż wszystko istniejące (V205), a nie „następny wolny" w linii V1x.

ALTER TABLE orders
    ADD COLUMN cash_change_from NUMERIC(10, 2);

ALTER TABLE orders
    ADD CONSTRAINT orders_cash_change_from_positive
        CHECK (cash_change_from IS NULL OR cash_change_from > 0);

ALTER TABLE restaurant_settings
    ADD COLUMN free_delivery_from NUMERIC(10, 2);

ALTER TABLE restaurant_settings
    ADD CONSTRAINT restaurant_settings_free_delivery_from_positive
        CHECK (free_delivery_from IS NULL OR free_delivery_from > 0);
