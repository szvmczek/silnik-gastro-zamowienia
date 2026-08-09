import { useEffect, useRef, useState } from "react";

/**
 * Zwraca klasę animacji na ~220 ms po każdym WZROŚCIE liczby — licznik
 * koszyka, licznik wybranych dodatków. Spadek (usunięcie pozycji) nie
 * bumpuje: podbicie przy odejmowaniu czyta się jak potwierdzenie dodania.
 *
 * Klasa `animate-piec-bump` jest CSS-owa, więc guard prefers-reduced-motion
 * z tokens.css działa bez dodatkowego kodu.
 */
export function useCountBump(count: number): string {
  const previous = useRef(count);
  const [bumping, setBumping] = useState(false);

  useEffect(() => {
    if (count > previous.current) {
      setBumping(true);
      const id = window.setTimeout(() => setBumping(false), 220);
      previous.current = count;
      return () => window.clearTimeout(id);
    }
    previous.current = count;
  }, [count]);

  return bumping ? "animate-piec-bump" : "";
}
