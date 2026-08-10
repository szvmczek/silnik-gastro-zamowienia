import { useEffect, useRef, useState, type ReactNode } from "react";

// Shared bundle-aesthetic table primitives for Menu list (M-040).
// Bundle ref: frame-menu.jsx table card pattern.

/**
 * Tabela panelu Menu (Kategorie / Produkty / Grupy dodatków). Poniżej
 * `minWidth` przewija się w poziomie — świadoma decyzja operatora
 * (narzędzie wewnętrzne, znany wzorzec). Żeby przewijanie nie było
 * niewidoczne, prawa krawędź dostaje gradient znikający po dojechaniu
 * do końca.
 */
export function MenuTableCard({
  gridCols,
  headers,
  minWidth = 680,
  children,
}: {
  gridCols: string;
  headers: string[];
  minWidth?: number;
  children: ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      // 1 px zapasu — subpikselowe szerokości potrafią zostawić resztę,
      // przez którą gradient nigdy by nie znikał.
      setHasMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [minWidth]);

  return (
    <div
      className="relative rounded-xl"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
      }}
    >
      <div ref={scrollRef} className="overflow-x-auto rounded-xl">
        <div style={{ minWidth }}>
          <div
            className="grid items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase"
            style={{
              gridTemplateColumns: gridCols,
              background: "rgb(var(--color-bg-section))",
              borderBottom: "1px solid rgb(var(--color-border-subtle))",
              color: "rgb(var(--color-text-muted))",
              letterSpacing: "0.04em",
            }}
          >
            {headers.map((h, i) => (
              <span key={i} style={{ textAlign: h === "" ? undefined : "left" }}>
                {h}
              </span>
            ))}
          </div>
          {children}
        </div>
      </div>
      {hasMore && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-xl"
          style={{
            background:
              "linear-gradient(to right, rgb(var(--color-bg-card) / 0), rgb(var(--color-bg-card)))",
          }}
        />
      )}
    </div>
  );
}

export function MenuIconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-md"
      style={{
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        color: danger
          ? "rgb(var(--status-cancelled))"
          : "rgb(var(--color-text-muted))",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function MenuTableLoading() {
  return (
    <div
      className="rounded-xl py-10 text-center text-[14px]"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        color: "rgb(var(--color-text-muted))",
      }}
    >
      Ładowanie…
    </div>
  );
}

export function MenuTableError({ what }: { what: string }) {
  return (
    <div
      className="rounded-md p-3 text-sm"
      style={{
        border: "1px solid rgb(var(--status-cancelled) / 0.3)",
        background: "rgb(var(--status-cancelled-tint))",
        color: "rgb(var(--status-cancelled))",
      }}
    >
      Nie udało się pobrać listy {what}.
    </div>
  );
}

export function MenuTableEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-xl px-6 py-12 text-center"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px dashed rgb(var(--color-border-card))",
      }}
    >
      <div
        className="text-[15px] font-semibold"
        style={{ color: "rgb(var(--color-text-body))" }}
      >
        {title}
      </div>
      <p
        className="mx-auto mt-2 max-w-[420px] text-[13px]"
        style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.6 }}
      >
        {description}
      </p>
    </div>
  );
}
