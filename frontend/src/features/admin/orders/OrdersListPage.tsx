import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Printer, Search } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAdminOrderCounts,
  fetchAdminOrders,
  type AdminOrderListItemDto,
  type AdminOrdersQuery,
  type AdminOrderStatusCounts,
  type FulfillmentType,
  type OrderStatus,
  type SpringPage,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";

const PAGE_SIZE = 20;

const STATUS_VALUES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "IN_PREPARATION",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

const STATUS_DOT: Record<OrderStatus, string> = {
  NEW: "--status-new",
  CONFIRMED: "--status-confirmed",
  IN_PREPARATION: "--status-prep",
  READY: "--status-ready",
  OUT_FOR_DELIVERY: "--status-out",
  DELIVERED: "--status-delivered",
  CANCELED: "--status-cancelled",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "Nowe",
  CONFIRMED: "Potwierdzone",
  IN_PREPARATION: "W przygotowaniu",
  READY: "Gotowe",
  OUT_FOR_DELIVERY: "W drodze",
  DELIVERED: "Dostarczone",
  CANCELED: "Anulowane",
};

const FULFILLMENT_VALUES: FulfillmentType[] = ["DELIVERY", "PICKUP"];

function parseEnum<T extends string>(raw: string | null, allowed: T[]): T | null {
  return raw && (allowed as string[]).includes(raw) ? (raw as T) : null;
}

function parsePage(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function formatTimeHHmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

const GRID_COLS = "82px 1fr 140px 130px 100px 90px 44px 70px 110px";

export function OrdersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = parseEnum(searchParams.get("status"), STATUS_VALUES);
  const fulfillmentType = parseEnum(searchParams.get("fulfillmentType"), FULFILLMENT_VALUES);
  const search = searchParams.get("q") ?? "";
  const page = parsePage(searchParams.get("page"));

  const query: AdminOrdersQuery = useMemo(
    () => ({
      status,
      fulfillmentType,
      page,
      size: PAGE_SIZE,
    }),
    [status, fulfillmentType, page],
  );

  const listQuery = useQuery<SpringPage<AdminOrderListItemDto>>({
    queryKey: ["admin", "orders", "list", query],
    queryFn: () => fetchAdminOrders(query),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
  });

  // One GROUP BY endpoint (M-043) replaces the eight client-side count
  // queries (per-status + total) this page fired on every 10s poll cycle.
  const countsQuery = useQuery<AdminOrderStatusCounts>({
    queryKey: ["admin", "orders", "counts", { fulfillmentType }],
    queryFn: () => fetchAdminOrderCounts({ fulfillmentType }),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
  });

  const statusCounts: Record<OrderStatus, number | null> = useMemo(() => {
    const counts = {} as Record<OrderStatus, number | null>;
    const byStatus = countsQuery.data?.byStatus;
    STATUS_VALUES.forEach((s) => {
      counts[s] = byStatus ? byStatus[s] ?? 0 : null;
    });
    return counts;
  }, [countsQuery.data]);

  const updateFilter = (patch: { status?: OrderStatus | null; fulfillmentType?: FulfillmentType | null; q?: string }) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      const setOrDelete = (key: string, v: string | null | undefined) => {
        if (v === undefined) return;
        if (v) p.set(key, v);
        else p.delete(key);
      };
      setOrDelete("status", patch.status);
      setOrDelete("fulfillmentType", patch.fulfillmentType);
      setOrDelete("q", patch.q);
      p.delete("page");
      return p;
    });
  };

  const goToPage = (target: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (target > 0) p.set("page", String(target));
      else p.delete("page");
      return p;
    });
  };

  const data = listQuery.data;
  const allRows = data?.content ?? [];
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q),
    );
  }, [allRows, search]);

  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.number ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const totalAll = countsQuery.data?.total ?? null;

  const errorMessage = listQuery.isError
    ? extractProblem(listQuery.error)?.detail ?? "Spróbuj odświeżyć stronę."
    : null;

  const onExportCsv = () => {
    toast.message("Eksport CSV — wkrótce", {
      description: "Funkcja nie jest jeszcze dostępna.",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminTopbar
        title="Zamówienia"
        metadata={totalAll !== null ? `${totalAll} łącznie` : undefined}
        liveStatus="polling"
        liveLabel="Polling 10s"
        actions={
          <button
            type="button"
            onClick={onExportCsv}
            className="hidden h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium sm:inline-flex"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              fontFamily: "inherit",
            }}
          >
            <Printer size={13} strokeWidth={1.7} aria-hidden /> Eksport CSV
          </button>
        }
      />


      {errorMessage && (
        <div
          className="rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać zamówień: {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <StatusFilterChip
          label="Wszystkie"
          count={totalAll}
          active={status === null}
          onClick={() => updateFilter({ status: null })}
        />
        {STATUS_VALUES.map((s) => (
          <StatusFilterChip
            key={s}
            status={s}
            label={STATUS_LABEL[s]}
            count={statusCounts[s]}
            active={status === s}
            onClick={() => updateFilter({ status: s })}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_200px_200px]">
        <div
          className="relative flex h-[38px] items-center"
          style={{
            background: "rgb(var(--color-bg-card))",
            border: "1px solid rgb(var(--color-border-card))",
            borderRadius: 8,
          }}
        >
          <span
            className="pointer-events-none absolute left-3 inline-flex"
            style={{ color: "rgb(var(--color-text-faint))" }}
            aria-hidden
          >
            <Search size={18} strokeWidth={1.7} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => updateFilter({ q: e.target.value })}
            placeholder="Szukaj po numerze, kliencie, telefonie…"
            className="h-full w-full bg-transparent pl-10 pr-3 text-[14px] outline-none"
            style={{ color: "rgb(var(--color-text-primary))" }}
          />
        </div>
        <select
          disabled
          title="Zakres dat — wkrótce"
          className="h-[38px] rounded-md px-3 text-[14px]"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-text-body))",
            opacity: 0.6,
            fontFamily: "inherit",
          }}
        >
          <option>Cały okres</option>
        </select>
        <select
          value={fulfillmentType ?? ""}
          onChange={(e) =>
            updateFilter({
              fulfillmentType: (e.target.value || null) as FulfillmentType | null,
            })
          }
          className="h-[38px] rounded-md px-3 text-[14px]"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-text-body))",
            fontFamily: "inherit",
          }}
        >
          <option value="">Wszystkie typy</option>
          <option value="DELIVERY">Dostawa</option>
          <option value="PICKUP">Odbiór osobisty</option>
        </select>
      </div>

      <div
        style={{
          background: "rgb(var(--color-bg-card))",
          border: "1px solid rgb(var(--color-border-card))",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          className="hidden lg:grid"
          style={{
            gridTemplateColumns: GRID_COLS,
            gap: 12,
            padding: "12px 16px",
            background: "rgb(var(--color-bg-section))",
            borderBottom: "1px solid rgb(var(--color-border-subtle))",
            fontSize: 11,
            color: "rgb(var(--color-text-muted))",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span>Numer</span>
          <span>Klient</span>
          <span>Telefon</span>
          <span>Status</span>
          <span>Typ</span>
          <span style={{ textAlign: "right" }}>Kwota</span>
          <span></span>
          <span>Czas</span>
          <span></span>
        </div>

        {listQuery.isPending && rows.length === 0 ? (
          <div className="p-6">
            <div
              className="h-24 animate-pulse rounded-md"
              style={{ background: "rgb(var(--color-bg-section))" }}
            />
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              fontSize: 13,
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {status || fulfillmentType || search
              ? "Brak zamówień dla tych filtrów."
              : "Nie ma jeszcze żadnych zamówień."}
          </div>
        ) : (
          rows.map((row, idx) => (
            <OrderRow key={row.id} row={row} isLast={idx === rows.length - 1} />
          ))
        )}
      </div>

      {(totalPages > 1 || totalElements > PAGE_SIZE) && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-[13px]" style={{ color: "rgb(var(--color-text-muted))" }}>
            Pokazano{" "}
            <strong style={{ color: "rgb(var(--color-text-body))" }}>
              {currentPage * PAGE_SIZE + 1}–{currentPage * PAGE_SIZE + rows.length}
            </strong>{" "}
            z {totalElements}
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onGo={goToPage}
          />
        </div>
      )}
    </div>
  );
}

interface StatusFilterChipProps {
  status?: OrderStatus;
  label: string;
  count: number | null;
  active: boolean;
  onClick: () => void;
}

function StatusFilterChip({ status, label, count, active, onClick }: StatusFilterChipProps) {
  const activeBg = active ? "rgb(var(--color-text-primary))" : "rgb(var(--color-bg-card))";
  const activeColor = active ? "#fff" : "rgb(var(--color-text-body))";
  const borderColor = active ? "rgb(var(--color-text-primary))" : "rgb(var(--color-border-card))";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 9999,
        border: `1px solid ${borderColor}`,
        background: activeBg,
        color: activeColor,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "inherit",
      }}
    >
      {status && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: `rgb(var(${STATUS_DOT[status]}))`,
          }}
          aria-hidden
        />
      )}
      {label}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          opacity: active ? 0.85 : 1,
          color: active ? "#fff" : "rgb(var(--color-text-muted))",
          fontWeight: 600,
        }}
      >
        {count ?? "—"}
      </span>
    </button>
  );
}

interface OrderRowProps {
  row: AdminOrderListItemDto;
  isLast: boolean;
}

function OrderRow({ row, isLast }: OrderRowProps) {
  const dot = STATUS_DOT[row.status];
  const statusLabel = STATUS_LABEL[row.status];
  const fulfillmentLabel = row.fulfillmentType === "DELIVERY" ? "Dostawa" : "Odbiór";

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[82px_1fr_140px_130px_100px_90px_44px_70px_110px]"
      style={{
        gap: 12,
        padding: "14px 16px",
        borderBottom: isLast ? "none" : "1px solid rgb(var(--color-border-subtle))",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 700,
          color: "rgb(var(--color-text-primary))",
        }}
      >
        {row.orderNumber}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "rgb(var(--color-text-primary))",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.customerName}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "rgb(var(--color-text-body))",
          fontWeight: 600,
        }}
      >
        {row.customerPhone}
      </span>
      <span
        className="inline-flex items-center"
        style={{
          gap: 6,
          padding: "4px 10px",
          borderRadius: 9999,
          background: `rgb(var(${dot}) / 0.12)`,
          color: `rgb(var(${dot}))`,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
          width: "fit-content",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 9999,
            background: "currentColor",
          }}
          aria-hidden
        />
        {statusLabel}
      </span>
      <span style={{ fontSize: 13, color: "rgb(var(--color-text-body))" }}>
        {fulfillmentLabel}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 600,
          color: "rgb(var(--color-text-primary))",
          textAlign: "right",
        }}
      >
        {zl(row.total)}
      </span>
      <span style={{ display: "inline-flex", justifyContent: "center" }}>
        {row.customerNotes && (
          <span
            title="Zawiera notkę klienta"
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: "#FEF3C7",
              color: "#B45309",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3 2 21h20z" />
              <path d="M12 10v5" />
              <path d="M12 18h.01" />
            </svg>
          </span>
        )}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "rgb(var(--color-text-muted))",
          fontWeight: 600,
        }}
      >
        {formatTimeHHmm(row.placedAt)}
      </span>
      <Link
        to={`/admin/orders/${row.id}`}
        style={{
          height: 32,
          padding: "0 12px",
          borderRadius: 6,
          border: "1px solid rgb(var(--color-border-card))",
          background: "rgb(var(--color-bg-card))",
          color: "rgb(var(--color-text-primary))",
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
      >
        Szczegóły →
      </Link>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onGo: (target: number) => void;
}

function Pagination({ currentPage, totalPages, onGo }: PaginationProps) {
  const pages = useMemo(() => {
    const out: number[] = [];
    const start = Math.max(0, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }, [currentPage, totalPages]);

  const baseStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: 6,
    border: "1px solid rgb(var(--color-border-card))",
    background: "rgb(var(--color-bg-card))",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
  };

  return (
    <div style={{ display: "flex", gap: 4 }}>
      <button
        type="button"
        onClick={() => onGo(currentPage - 1)}
        disabled={currentPage <= 0}
        style={{
          ...baseStyle,
          color:
            currentPage <= 0
              ? "rgb(var(--color-text-faint))"
              : "rgb(var(--color-text-body))",
          cursor: currentPage <= 0 ? "not-allowed" : "pointer",
        }}
      >
        ‹
      </button>
      {pages.map((p) => {
        const active = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onGo(p)}
            style={
              active
                ? {
                    ...baseStyle,
                    border: "none",
                    background: "rgb(var(--color-text-primary))",
                    color: "#fff",
                    fontWeight: 600,
                  }
                : baseStyle
            }
          >
            {p + 1}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onGo(currentPage + 1)}
        disabled={currentPage + 1 >= totalPages}
        style={{
          ...baseStyle,
          color:
            currentPage + 1 >= totalPages
              ? "rgb(var(--color-text-faint))"
              : "rgb(var(--color-text-body))",
          cursor: currentPage + 1 >= totalPages ? "not-allowed" : "pointer",
        }}
      >
        ›
      </button>
    </div>
  );
}
