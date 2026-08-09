import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { prefersReducedMotion } from "./prefersReducedMotion";

interface RollingNumberProps {
  /** Gotowy tekst do pokazania, np. „128,50 zł". Cyfry się rolują, reszta stoi. */
  value: string;
  /** Rozmiar fontu w px — potrzebny, bo wysokość rolki to size * 1.18. */
  size: number;
  /** Wariant „plain" używa fontu tekstowego zamiast display (Anton). */
  plain?: boolean;
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Rolka cyfrowa z paczki designu: każda cyfra to kolumna 0-9 przesuwana
 * transformem, znaki niebędące cyframi stoją w miejscu.
 *
 * Dostępność: pełna wartość siedzi w aria-label na kontenerze, a same
 * kolumny są aria-hidden — czytnik ekranu przeczyta „128,50 zł", nie
 * dziesięć cyfr razy trzy.
 *
 * Reduced motion: pierwsza klatka i tak renderuje właściwą cyfrę
 * (transform ustawiony od razu), więc wystarczy wyłączyć transition.
 */
export function RollingNumber({ value, size, plain = false, className }: RollingNumberProps) {
  const height = Math.round(size * 1.18);
  // Pierwszy render bez transition, żeby wartość początkowa nie
  // „przyjeżdżała" z zera przy wejściu na stronę.
  const [armed, setArmed] = useState(false);
  const reduced = useRef(prefersReducedMotion());

  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const animate = armed && !reduced.current;

  return (
    <span
      role="text"
      aria-label={value}
      className={cn("inline-flex items-start overflow-hidden align-bottom", className)}
      style={{
        height,
        fontFamily: plain ? "inherit" : "Anton, Impact, sans-serif",
        fontSize: size,
        lineHeight: `${height}px`,
        letterSpacing: plain ? "0" : "0.5px",
        fontWeight: plain ? 700 : 400,
      }}
    >
      {value.split("").map((char, index) =>
        /[0-9]/.test(char) ? (
          <span
            key={index}
            aria-hidden="true"
            className="inline-block overflow-hidden"
            style={{ height }}
          >
            <span
              className="block"
              style={{
                transform: `translateY(-${Number(char) * height}px)`,
                transition: animate
                  ? "transform .26s cubic-bezier(.2,.75,.25,1)"
                  : undefined,
              }}
            >
              {DIGITS.map((digit) => (
                <span
                  key={digit}
                  className="block"
                  style={{ height, lineHeight: `${height}px` }}
                >
                  {digit}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span
            key={index}
            aria-hidden="true"
            className="inline-block whitespace-pre"
            style={{ height }}
          >
            {char}
          </span>
        ),
      )}
    </span>
  );
}
