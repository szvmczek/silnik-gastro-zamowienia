-- AD-Δ19 — Settings extended fields per bundle Stage 4 section-general.jsx.
-- 4 nullable text columns dla M-035 General section.

ALTER TABLE restaurant_settings
    ADD COLUMN seo_description    VARCHAR(200) NULL,
    ADD COLUMN google_maps_url    VARCHAR(500) NULL,
    ADD COLUMN social_facebook    VARCHAR(500) NULL,
    ADD COLUMN social_instagram   VARCHAR(500) NULL;
