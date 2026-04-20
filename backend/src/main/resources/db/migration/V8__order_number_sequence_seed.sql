-- Phase 3 hotfix: seed OrderNumberSequence for the current year so the first
-- order of the year does not race between two concurrent inserts (both would
-- try findByYearForUpdate -> save, violating the PK or producing duplicate
-- order numbers). With the row present, findByYearForUpdate hits it and takes
-- the row-level lock, serializing next() calls.
INSERT INTO order_number_sequence (year, last_number)
VALUES (2026, 0)
ON CONFLICT (year) DO NOTHING;
