-- Faza 7.0: strefy dostawy (AD-019)
-- UNIQUE NULLS NOT DISTINCT wymaga PG 15+ (docker-compose używa postgres:16).
-- Unikalny indeks utworzony przez UNIQUE jest też używany do równościowych
-- lookup'ów po (city_normalized, postal_code) — drugi index byłby duplikatem.

CREATE TABLE delivery_zone (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(80) NOT NULL,
    type          VARCHAR(20) NOT NULL,
    delivery_fee  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    version       BIGINT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT delivery_zone_type_chk
        CHECK (type IN ('FREE', 'PAID', 'UNAVAILABLE')),
    CONSTRAINT delivery_zone_paid_fee_chk
        CHECK (type <> 'PAID' OR delivery_fee > 0),
    CONSTRAINT delivery_zone_nonpaid_fee_chk
        CHECK (type = 'PAID' OR delivery_fee = 0)
);

CREATE TABLE delivery_zone_area (
    id              BIGSERIAL PRIMARY KEY,
    zone_id         BIGINT NOT NULL REFERENCES delivery_zone(id) ON DELETE CASCADE,
    city_normalized VARCHAR(120) NOT NULL,
    city_display    VARCHAR(120) NOT NULL,
    postal_code     VARCHAR(6) NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT delivery_zone_area_postal_chk
        CHECK (postal_code IS NULL OR postal_code ~ '^\d{2}-\d{3}$'),
    CONSTRAINT delivery_zone_area_unique
        UNIQUE NULLS NOT DISTINCT (city_normalized, postal_code)
);

ALTER TABLE orders
    ADD COLUMN delivery_fee       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN delivery_zone_name VARCHAR(80) NULL;
