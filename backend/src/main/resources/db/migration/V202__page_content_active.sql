-- AD-Δ21 — PageContent active toggle per bundle Stage 4 section-content.jsx.
-- Bool flag pozwalający adminowi ukryć sekcję na landingu bez utraty contentu.

ALTER TABLE page_content
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;
