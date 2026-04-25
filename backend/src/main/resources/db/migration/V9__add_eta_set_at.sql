-- ETA tracking: record WHEN the admin last set eta_minutes, so the public
-- tracking UI can compute clock time (eta_set_at + eta_minutes) and a residual
-- countdown. Without this, a static "X minutes" cannot animate as time passes.
-- Nullable, no backfill: orders created before this migration keep eta_minutes
-- as-is and surface eta_set_at = NULL. The frontend treats NULL as "unknown
-- set-time" and falls back to displaying the raw minutes.

ALTER TABLE orders ADD COLUMN eta_set_at TIMESTAMP WITH TIME ZONE;
