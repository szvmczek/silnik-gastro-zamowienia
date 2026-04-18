-- Phase 1: identity + restaurant configuration schema.

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(200) NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    role            VARCHAR(30)  NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT users_role_values CHECK (role IN ('ADMIN'))
);

CREATE INDEX idx_users_email ON users (LOWER(email));

CREATE TABLE restaurant_settings (
    id              BIGINT       PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    tagline         VARCHAR(200),
    primary_color   VARCHAR(7)   NOT NULL,
    phone           VARCHAR(40),
    email           VARCHAR(200),
    address_line    VARCHAR(200),
    city            VARCHAR(100),
    postal_code     VARCHAR(20),
    logo_url        VARCHAR(500),
    currency        VARCHAR(3)   NOT NULL DEFAULT 'PLN',
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT restaurant_settings_singleton CHECK (id = 1),
    CONSTRAINT restaurant_settings_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE TABLE opening_hours (
    id              BIGSERIAL    PRIMARY KEY,
    day_of_week     VARCHAR(10)  NOT NULL UNIQUE,
    closed          BOOLEAN      NOT NULL,
    open_time       TIME,
    close_time      TIME,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT opening_hours_day_values CHECK (
        day_of_week IN ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY')
    ),
    CONSTRAINT opening_hours_times CHECK (
        (closed = TRUE  AND open_time IS NULL     AND close_time IS NULL)
        OR
        (closed = FALSE AND open_time IS NOT NULL AND close_time IS NOT NULL AND open_time < close_time)
    )
);

CREATE TABLE page_content (
    id              BIGSERIAL    PRIMARY KEY,
    section_key     VARCHAR(20)  NOT NULL UNIQUE,
    title           VARCHAR(200) NOT NULL,
    body            TEXT         NOT NULL,
    image_url       VARCHAR(500),
    cta_label       VARCHAR(60),
    cta_href        VARCHAR(300),
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT page_content_section_values CHECK (section_key IN ('HERO', 'ABOUT'))
);
