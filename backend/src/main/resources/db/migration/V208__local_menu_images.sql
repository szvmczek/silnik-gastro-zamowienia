-- Design v3 „PIEC" — podmiana zdjęć na pliki z paczki designu.
--
-- V207 seedował URL-e Unsplash, bo eksport obrazów przez MCP ucinał pliki
-- na 256 KiB. Operator wrzucił oryginały ręcznie do frontend/public/uploads,
-- więc przechodzimy na nie.
--
-- Osobna migracja zamiast edycji V207: V207 jest już zaaplikowana, a zmiana
-- treści zaaplikowanej migracji łamie checksum Flyway i wywala start aplikacji
-- na każdej istniejącej bazie. Migracje są append-only.
--
-- Przypisania zdjęć 1:1 z paczki (pole `img` w MENU): Wegetariańska →
-- pizza-02, Ogrodowa → pizza-04, Carbonara → pizza-01, Kurczak i Gorgonzola
-- → pizza-03. Reszta pizz rotuje po czterech kadrach w kolejności menu —
-- dokładnie to, co robi imgFor() w paczce.
--
-- hero-01.jpg (tło hero) NIE zostało dostarczone — page_content.HERO zostaje
-- przy zweryfikowanym URL-u Unsplash. Gdy plik się pojawi, wystarczy jeden
-- UPDATE na '/uploads/hero-01.jpg'.

-- Zdjęcie sekcji „o nas".
UPDATE page_content
SET image_url = '/uploads/hero-02.jpg',
    updated_at = now()
WHERE section_key = 'ABOUT';

-- Pizze z jawnym przypisaniem w paczce.
UPDATE products SET image_url = '/uploads/pizza-02.jpg', updated_at = now() WHERE slug = 'wegetarianska';
UPDATE products SET image_url = '/uploads/pizza-04.jpg', updated_at = now() WHERE slug = 'ogrodowa';
UPDATE products SET image_url = '/uploads/pizza-01.jpg', updated_at = now() WHERE slug = 'carbonara';
UPDATE products SET image_url = '/uploads/pizza-03.jpg', updated_at = now() WHERE slug = 'kurczak-gorgonzola';

-- Pozostałe pizze — rotacja czterech kadrów w kolejności wyświetlania.
WITH rotated AS (
    SELECT p.id,
           '/uploads/pizza-0'
               || (((row_number() OVER (ORDER BY c.display_order, p.display_order) - 1) % 4) + 1)
               || '.jpg' AS img
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE c.slug IN ('klasyczne', 'firmowe', 'biale', 'calzone')
      AND p.slug NOT IN ('wegetarianska', 'ogrodowa', 'carbonara', 'kurczak-gorgonzola')
)
UPDATE products p
SET image_url = rotated.img,
    updated_at = now()
FROM rotated
WHERE p.id = rotated.id;
