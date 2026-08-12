-- Edycja zamówienia w panelu admina + komentarz klienta per pozycja.
--
-- 1) order_items.item_note — pole opisane w CLAUDE.md jako część rdzenia
--    produktu („bez cebuli na TEJ jednej pizzy"), którego nigdy nie
--    dobudowano. Nie wpływa na cenę; jest snapshotem tekstu, tak jak
--    reszta kolumn *_snapshot (AD-006).
--
-- 2) order_edit — historia edycji treści zamówienia. Jeden wiersz = jedna
--    edycja. `summary` trzyma gotowy tekst po polsku (jedna zmiana = jedna
--    linia), bo historia ma być czytelna dla człowieka. `snapshot_before`
--    to stan sprzed edycji i służy WYŁĄCZNIE cofaniu — nigdy nie trafia
--    do DTO. Cofnięcie nie kasuje wiersza, tylko stempluje undone_at/by,
--    żeby ślad po operacji został.
--
-- Numeracja: prod ma flyway.out-of-order wyłączone, więc numer musi być
-- wyższy niż wszystko istniejące (V210), a nie „następny wolny" w linii V1x.

ALTER TABLE order_items
    ADD COLUMN item_note VARCHAR(200);

CREATE TABLE order_edit (
    id              BIGSERIAL PRIMARY KEY,
    order_id        BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    edited_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    edited_by       VARCHAR(160),
    summary         TEXT          NOT NULL,
    total_before    NUMERIC(10,2) NOT NULL,
    total_after     NUMERIC(10,2) NOT NULL,
    snapshot_before JSONB         NOT NULL,
    undone_at       TIMESTAMP WITH TIME ZONE,
    undone_by       VARCHAR(160),
    CONSTRAINT order_edit_total_before_nonneg CHECK (total_before >= 0),
    CONSTRAINT order_edit_total_after_nonneg  CHECK (total_after  >= 0),
    -- undone_by bywa NULL (Authentication.getName() może nie być dostępne),
    -- ale sam nie może istnieć bez znacznika czasu cofnięcia.
    CONSTRAINT order_edit_undo_consistency    CHECK (undone_by IS NULL OR undone_at IS NOT NULL)
);

-- Zapytania idą zawsze po zamówieniu i zawsze od najnowszej edycji:
-- lista historii w detalu oraz „ostatni niecofnięty wpis" przy cofaniu.
CREATE INDEX idx_order_edit_order ON order_edit (order_id, edited_at DESC, id DESC);
