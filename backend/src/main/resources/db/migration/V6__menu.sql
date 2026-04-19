-- Phase 2: menu schema (categories, products, variants, addon groups, addons,
-- product-addon-group join). FK rules: RESTRICT where parent has meaningful
-- children we don't want cascade-deleted (category->products, group->products
-- link); CASCADE on pure ownership (product->variants, group->addons).

CREATE TABLE categories (
    id              BIGSERIAL    PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    slug            VARCHAR(140) NOT NULL UNIQUE,
    description     TEXT,
    display_order   INTEGER      NOT NULL DEFAULT 0,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    version         BIGINT       NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE addon_groups (
    id              BIGSERIAL    PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    min_select      INTEGER      NOT NULL DEFAULT 0,
    max_select      INTEGER      NOT NULL DEFAULT 1,
    required        BOOLEAN      NOT NULL DEFAULT FALSE,
    version         BIGINT       NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT addon_groups_min_max CHECK (min_select >= 0 AND max_select >= min_select)
);

CREATE TABLE addons (
    id              BIGSERIAL     PRIMARY KEY,
    addon_group_id  BIGINT        NOT NULL REFERENCES addon_groups(id) ON DELETE CASCADE,
    name            VARCHAR(80)   NOT NULL,
    price           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    display_order   INTEGER       NOT NULL DEFAULT 0,
    version         BIGINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_addons_group_name UNIQUE (addon_group_id, name),
    CONSTRAINT addons_price_nonneg CHECK (price >= 0)
);

CREATE INDEX idx_addons_group_id ON addons (addon_group_id);

CREATE TABLE products (
    id              BIGSERIAL     PRIMARY KEY,
    category_id     BIGINT        NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name            VARCHAR(140)  NOT NULL,
    slug            VARCHAR(160)  NOT NULL UNIQUE,
    description     TEXT,
    base_price      NUMERIC(10,2),
    image_url       VARCHAR(500),
    display_order   INTEGER       NOT NULL DEFAULT 0,
    available       BOOLEAN       NOT NULL DEFAULT TRUE,
    version         BIGINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT products_base_price_nonneg CHECK (base_price IS NULL OR base_price >= 0)
);

CREATE INDEX idx_products_category_id ON products (category_id);

CREATE TABLE product_variants (
    id              BIGSERIAL     PRIMARY KEY,
    product_id      BIGINT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name            VARCHAR(60)   NOT NULL,
    price           NUMERIC(10,2) NOT NULL,
    display_order   INTEGER       NOT NULL DEFAULT 0,
    version         BIGINT        NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_product_variants_product_name UNIQUE (product_id, name),
    CONSTRAINT product_variants_price_nonneg CHECK (price >= 0)
);

CREATE INDEX idx_product_variants_product_id ON product_variants (product_id);

CREATE TABLE product_addon_groups (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    addon_group_id  BIGINT    NOT NULL REFERENCES addon_groups(id) ON DELETE RESTRICT,
    display_order   INTEGER   NOT NULL DEFAULT 0,
    version         BIGINT    NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uq_product_addon_groups_product_group UNIQUE (product_id, addon_group_id)
);

CREATE INDEX idx_product_addon_groups_product_id ON product_addon_groups (product_id);
CREATE INDEX idx_product_addon_groups_group_id   ON product_addon_groups (addon_group_id);
