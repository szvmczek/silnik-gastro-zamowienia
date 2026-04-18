-- Phase 1 fixup: make email uniqueness case-insensitive at the DB level.
-- A direct SQL insert with mixed case would slip past the Java .toLowerCase()
-- sanitation otherwise.

ALTER TABLE users DROP CONSTRAINT users_email_key;
DROP INDEX idx_users_email;
CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
