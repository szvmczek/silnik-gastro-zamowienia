import { useEffect } from "react";
import { Outlet } from "react-router-dom";

/**
 * Powłoka publicznej części serwisu (design v3 „PIEC").
 *
 * Jedyne zadanie: włączyć ciemne tokeny na czas życia publicznych route'ów
 * i zdjąć je przy wyjściu, żeby panel admina (D-08 — nietknięty) dalej
 * renderował się na jasnych tokenach z tokens.css.
 *
 * Nagłówek i pasek akcji NIE są tutaj — w paczce każdy ekran ma własny
 * wariant (wordmark vs „← Menu", inna szerokość kolumny, chipsy kategorii
 * w menu), więc montują je strony. Wspólna jest stopka, ale i ona nie
 * pojawia się na trackingu i potwierdzeniu, więc też idzie per strona.
 */
export function PublicLayout() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-public-theme", "piec");
    return () => root.removeAttribute("data-public-theme");
  }, []);

  return (
    <div className="min-h-screen bg-piec-bg text-piec-ink">
      <Outlet />
    </div>
  );
}
