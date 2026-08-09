-- Design v3 „PIEC" — korekta: plik `hero-02.jpg` to w rzeczywistości kadr
-- hero z paczki.
--
-- V208 przypisała go do sekcji „o nas", zakładając zgodność nazwy z paczką
-- (tam `hero-01` = tło hero, `hero-02` = zdjęcie w sekcji „o nas").
-- Nazewnictwo dostarczonego pliku jest przesunięte: zawartość to
-- „pizze z pieca na drewnianym blacie", czyli dokładnie kadr, który paczka
-- wstawia jako pełnoekranowe tło hero.
--
-- Sekcja „o nas" wraca na zweryfikowany URL Unsplash — zdjęcia „pizza na
-- desce" z paczki nadal nie mamy. To jedyny brakujący kadr; nie wstawiamy
-- tu żadnego z `pizza-0N`, bo te same zdjęcia lecą w pasie „najczęściej
-- zamawiane" kilkaset pikseli wyżej na tej samej stronie.

UPDATE page_content
SET image_url = '/uploads/hero-02.jpg',
    updated_at = now()
WHERE section_key = 'HERO';

UPDATE page_content
SET image_url = 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=1600&q=80',
    updated_at = now()
WHERE section_key = 'ABOUT';
