import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  fetchAdminOrders,
  type AdminOrderListItemDto,
  type AdminOrdersQuery,
  type SpringPage,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { useOperationalSound } from "@/features/admin/realtime/useOperationalSound";
import { PickupRow } from "./PickupOrderCard";

const PAGE_SIZE = 100;

const PICKUP_QUERY: AdminOrdersQuery = {
  status: "READY",
  fulfillmentType: "PICKUP",
  size: PAGE_SIZE,
};

const IN_PREP_QUERY: AdminOrdersQuery = {
  status: "IN_PREPARATION",
  fulfillmentType: "PICKUP",
  size: PAGE_SIZE,
};

export function PickupPage() {
  useOperationalSound("pickup");
  const [search, setSearch] = useState("");

  const readyQuery = useQuery<SpringPage<AdminOrderListItemDto>>({
    queryKey: ["admin", "orders", "list", PICKUP_QUERY] as const,
    queryFn: () => fetchAdminOrders(PICKUP_QUERY),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const inPrepQuery = useQuery<SpringPage<AdminOrderListItemDto>>({
    queryKey: ["admin", "orders", "list", IN_PREP_QUERY] as const,
    queryFn: () => fetchAdminOrders(IN_PREP_QUERY),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const allRows = useMemo(() => {
    if (!readyQuery.data) return [];
    return [...readyQuery.data.content].sort(
      (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
    );
  }, [readyQuery.data]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q),
    );
  }, [allRows, search]);

  const errorMessage = readyQuery.isError
    ? extractProblem(readyQuery.error)?.detail ?? "Spróbuj odświeżyć stronę."
    : null;

  const inPrepCount = inPrepQuery.data?.content.length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-0.5 text-[12px] text-[rgb(var(--color-text-muted))]">
            Operacyjne
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="m-0 text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-[rgb(var(--color-text-primary))]">
              Wydanie
            </h1>
            <span className="text-[13px] text-[rgb(var(--color-text-muted))]">
              {allRows.length}{" "}
              {allRows.length === 1 ? "zamówienie gotowe" : "zamówień gotowych"} do odbioru
            </span>
          </div>
        </div>
      </header>

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

      <div className="flex items-center gap-3">
        <div
          className="relative flex h-[42px] flex-1 items-center"
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj po imieniu klienta lub numerze zamówienia…"
            className="h-full w-full bg-transparent pl-10 pr-3 text-[14px] outline-none"
            style={{ color: "rgb(var(--color-text-primary))" }}
          />
        </div>
        <span
          className="px-2 text-[13px]"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          {rows.length} czeka
        </span>
      </div>

      <h2
        className="m-0 mt-2 text-[13px] font-bold uppercase"
        style={{
          letterSpacing: "0.04em",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        Gotowe do wydania
      </h2>

      <div
        style={{
          background: "rgb(var(--color-bg-card))",
          border: "1px solid rgb(var(--color-border-card))",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          className="hidden grid-cols-[84px_1.1fr_1.6fr_150px_110px_140px] items-center gap-4 lg:grid"
          style={{
            padding: "12px 20px",
            background: "rgb(var(--color-bg-section))",
            borderBottom: "1px solid rgb(var(--color-border-subtle))",
            fontSize: 11,
            color: "rgb(var(--color-text-muted))",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          <span>Slot</span>
          <span>Klient</span>
          <span>Pozycje</span>
          <span>Telefon</span>
          <span style={{ textAlign: "right" }}>Kwota</span>
          <span></span>
        </div>

        {readyQuery.isPending && rows.length === 0 ? (
          <div className="p-6">
            <div
              className="h-20 animate-pulse rounded-md"
              style={{ background: "rgb(var(--color-bg-section))" }}
            />
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              fontSize: 13,
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {search ? "Brak zamówień pasujących do filtra." : "Brak zamówień gotowych."}
          </div>
        ) : (
          rows.map((order) => <PickupRow key={order.id} order={order} />)
        )}
      </div>

      <div
        className="flex items-center gap-3"
        style={{
          marginTop: 8,
          padding: "16px 20px",
          background: "rgb(var(--color-bg-section))",
          border: "1px dashed rgb(var(--color-border-card))",
          borderRadius: 10,
          fontSize: 13,
          color: "rgb(var(--color-text-muted))",
        }}
      >
        <span
          aria-hidden
          className="inline-flex"
          style={{ color: "rgb(var(--color-text-faint))" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 3v4M10 3v4M14 3v4M18 3v4" />
            <path d="M4 7h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
            <path d="M9 15v6" />
            <path d="M15 15v6" />
          </svg>
        </span>
        <span>
          <strong style={{ color: "rgb(var(--color-text-body))" }}>
            {inPrepCount} {inPrepCount === 1 ? "zamówienie" : "zamówień"}
          </strong>{" "}
          jest jeszcze w&nbsp;przygotowaniu — pojawią się tutaj automatycznie.
        </span>
      </div>
    </div>
  );
}
