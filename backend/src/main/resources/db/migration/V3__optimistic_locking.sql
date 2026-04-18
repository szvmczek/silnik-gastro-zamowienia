-- Phase 1 fixup: optimistic locking on admin-edited entities. Default 0 for
-- existing rows; Hibernate takes over increment after this migration.

ALTER TABLE restaurant_settings ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE opening_hours       ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE page_content        ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
