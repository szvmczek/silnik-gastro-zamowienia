-- Phase 1 fixup: allow closeTime = 00:00 meaning "midnight end-of-day",
-- so a restaurant can declare it is open until midnight (e.g. 12:00–00:00).
-- The previous CHECK required open_time < close_time strictly, which
-- blocked this real-world use case and was inconsistent with what the
-- admin UI would want to accept.

ALTER TABLE opening_hours DROP CONSTRAINT opening_hours_times;

ALTER TABLE opening_hours ADD CONSTRAINT opening_hours_times CHECK (
    (closed = TRUE  AND open_time IS NULL     AND close_time IS NULL)
    OR
    (closed = FALSE AND open_time IS NOT NULL AND close_time IS NOT NULL
        AND (
            open_time < close_time
            OR (close_time = TIME '00:00:00' AND open_time <> TIME '00:00:00')
        )
    )
);
