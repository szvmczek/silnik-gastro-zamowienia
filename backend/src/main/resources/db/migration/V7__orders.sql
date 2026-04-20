-- Phase 3: order schema (orders, items, item-addons, status history, number sequence).
-- Soft FKs to menu (product_id, variant_id, addon_id, NO REFERENCES) so deleting a
-- product from menu does not cascade-destroy historical orders. Snapshots in items
-- guarantee historical totals and labels do not drift with menu edits (AD-006).

CREATE TABLE order_number_sequence (
    year         INTEGER PRIMARY KEY,
    last_number  INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT order_number_sequence_year_range CHECK (year BETWEEN 2000 AND 2999),
    CONSTRAINT order_number_sequence_last_number_nonneg CHECK (last_number >= 0)
);

CREATE TABLE orders (
    id                          BIGSERIAL    PRIMARY KEY,
    order_number                VARCHAR(11)  NOT NULL UNIQUE,
    public_tracking_token       UUID         NOT NULL UNIQUE,
    status                      VARCHAR(20)  NOT NULL,
    customer_name               VARCHAR(120) NOT NULL,
    customer_phone              VARCHAR(20)  NOT NULL,
    customer_email              VARCHAR(160),
    fulfillment_type            VARCHAR(20)  NOT NULL,
    payment_method              VARCHAR(30)  NOT NULL,
    delivery_street             VARCHAR(150),
    delivery_building_number    VARCHAR(20),
    delivery_apartment_number   VARCHAR(20),
    delivery_postal_code        VARCHAR(10),
    delivery_city               VARCHAR(80),
    delivery_notes              VARCHAR(255),
    customer_notes              VARCHAR(500),
    subtotal                    NUMERIC(10,2) NOT NULL,
    total                       NUMERIC(10,2) NOT NULL,
    eta_minutes                 INTEGER,
    version                     BIGINT       NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at                  TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT orders_subtotal_nonneg CHECK (subtotal >= 0),
    CONSTRAINT orders_total_nonneg    CHECK (total >= 0),
    CONSTRAINT orders_eta_positive    CHECK (eta_minutes IS NULL OR eta_minutes > 0),
    CONSTRAINT orders_status_allowed  CHECK (status IN (
        'NEW', 'CONFIRMED', 'IN_PREPARATION', 'READY',
        'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED'
    )),
    CONSTRAINT orders_fulfillment_allowed CHECK (fulfillment_type IN ('DELIVERY', 'PICKUP')),
    CONSTRAINT orders_payment_allowed     CHECK (payment_method   IN ('CASH_ON_DELIVERY', 'CASH_ON_PICKUP')),
    CONSTRAINT orders_address_consistency CHECK (
        (fulfillment_type = 'PICKUP'
            AND delivery_street IS NULL
            AND delivery_building_number IS NULL
            AND delivery_apartment_number IS NULL
            AND delivery_postal_code IS NULL
            AND delivery_city IS NULL
            AND delivery_notes IS NULL)
        OR
        (fulfillment_type = 'DELIVERY'
            AND delivery_street IS NOT NULL
            AND delivery_building_number IS NOT NULL
            AND delivery_postal_code IS NOT NULL
            AND delivery_city IS NOT NULL)
    ),
    CONSTRAINT orders_payment_fulfillment_consistency CHECK (
        (fulfillment_type = 'DELIVERY' AND payment_method = 'CASH_ON_DELIVERY')
        OR
        (fulfillment_type = 'PICKUP'   AND payment_method = 'CASH_ON_PICKUP')
    )
);

CREATE INDEX idx_orders_status     ON orders (status);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

CREATE TABLE order_items (
    id                       BIGSERIAL     PRIMARY KEY,
    order_id                 BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id               BIGINT        NOT NULL,
    variant_id               BIGINT,
    product_name_snapshot    VARCHAR(140)  NOT NULL,
    variant_name_snapshot    VARCHAR(60),
    unit_price_snapshot      NUMERIC(10,2) NOT NULL,
    quantity                 INTEGER       NOT NULL,
    line_total               NUMERIC(10,2) NOT NULL,
    created_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at               TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT order_items_unit_price_nonneg CHECK (unit_price_snapshot >= 0),
    CONSTRAINT order_items_line_total_nonneg CHECK (line_total >= 0),
    CONSTRAINT order_items_quantity_positive CHECK (quantity >= 1)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);

CREATE TABLE order_item_addons (
    id                            BIGSERIAL     PRIMARY KEY,
    order_item_id                 BIGINT        NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    addon_id                      BIGINT        NOT NULL,
    addon_group_name_snapshot     VARCHAR(100)  NOT NULL,
    addon_name_snapshot           VARCHAR(80)   NOT NULL,
    unit_price_snapshot           NUMERIC(10,2) NOT NULL,
    created_at                    TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at                    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT order_item_addons_unit_price_nonneg CHECK (unit_price_snapshot >= 0)
);

CREATE INDEX idx_order_item_addons_order_item_id ON order_item_addons (order_item_id);

CREATE TABLE order_status_history (
    id          BIGSERIAL    PRIMARY KEY,
    order_id    BIGINT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status      VARCHAR(20)  NOT NULL,
    changed_at  TIMESTAMP WITH TIME ZONE NOT NULL,
    changed_by  VARCHAR(160),
    CONSTRAINT order_status_history_status_allowed CHECK (status IN (
        'NEW', 'CONFIRMED', 'IN_PREPARATION', 'READY',
        'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELED'
    ))
);

CREATE INDEX idx_order_status_history_order_id ON order_status_history (order_id, changed_at);
