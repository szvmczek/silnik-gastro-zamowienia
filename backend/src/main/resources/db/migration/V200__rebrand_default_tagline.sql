-- Rebrand default tagline: drop bundle Italian fine-dining demo copy, align to Confident Local voice.
-- Idempotent — only touches rows still holding the original V100 seed default.
UPDATE restaurant_settings
SET tagline = 'Smacznie i szybko',
    updated_at = NOW()
WHERE tagline = 'Autentyczna włoska pizza prosto z pieca';
