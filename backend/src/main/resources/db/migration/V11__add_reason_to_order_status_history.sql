-- Faza 4.5: cancellation reason on OrderStatusHistory (AD-021).
-- Pole opcjonalne, używane głównie dla CANCELED. Backend liberalny,
-- walidacja "wymagane dla CANCELED" jest po stronie frontendu.
ALTER TABLE order_status_history ADD COLUMN reason TEXT;
