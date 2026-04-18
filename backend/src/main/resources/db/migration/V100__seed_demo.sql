-- Phase 1 demo seed. Admin user NOT seeded here (hash needs env var at runtime).

INSERT INTO restaurant_settings (
    id, name, tagline, primary_color,
    phone, email, address_line, city, postal_code,
    logo_url, currency, created_at, updated_at
) VALUES (
    1,
    'Pizza Demo',
    'Autentyczna włoska pizza prosto z pieca',
    '#E11D48',
    '+48 600 100 200',
    'kontakt@pizza-demo.local',
    'ul. Smakowita 10',
    'Warszawa',
    '00-001',
    NULL,
    'PLN',
    NOW(),
    NOW()
);

INSERT INTO opening_hours (day_of_week, closed, open_time, close_time, created_at, updated_at) VALUES
    ('MONDAY',    FALSE, '11:00', '22:00', NOW(), NOW()),
    ('TUESDAY',   FALSE, '11:00', '22:00', NOW(), NOW()),
    ('WEDNESDAY', FALSE, '11:00', '22:00', NOW(), NOW()),
    ('THURSDAY',  FALSE, '11:00', '22:00', NOW(), NOW()),
    ('FRIDAY',    FALSE, '11:00', '23:00', NOW(), NOW()),
    ('SATURDAY',  FALSE, '11:00', '23:00', NOW(), NOW()),
    ('SUNDAY',    FALSE, '12:00', '22:00', NOW(), NOW());

INSERT INTO page_content (section_key, title, body, image_url, cta_label, cta_href, created_at, updated_at) VALUES
    (
        'HERO',
        'Smak Włoch w Twoim domu',
        'Robimy pizzę tak, jak kochają ją Włosi — na cienkim cieście, z sosem z pomidorów San Marzano i mozzarellą fior di latte. Zamów online i ciesz się smakiem w kilka minut.',
        'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80',
        'Zamów online',
        '/menu',
        NOW(),
        NOW()
    ),
    (
        'ABOUT',
        'O nas',
        'Pizza Demo to rodzinna pizzeria prowadzona z sercem od 2008 roku. Używamy włoskich składników, pieczemy w piecu opalanym drewnem i wierzymy, że dobre jedzenie buduje wspólnotę. Zapraszamy do lokalu albo na zamówienie z dostawą.',
        'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=1600&q=80',
        NULL,
        NULL,
        NOW(),
        NOW()
    );
