import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/Table";
import {
  fetchAdminOrders,
  type AdminOrderListItemDto,
  type AdminOrdersQuery,
  type FulfillmentType,
  type OrderStatus,
  type SpringPage,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { formatTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/cn";
import { OrderStatusBadge } from "@/shared/components/OrderStatusBadge";
import { OrderFilters, type OrderFiltersValue } from "./components/OrderFilters";

const PAGE_SIZE = 20;
const STAGGER_CAP = 12;
const STAGGER_STEP_MS = 30;
const STATUS_VALUES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "IN_PREPARATION",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];
const FULFILLMENT_VALUES: FulfillmentType[] = ["DELIVERY", "PICKUP"];

function parseEnum<T extends string>(raw: string | null, allowed: T[]): T | null {
  return raw && (allowed as string[]).includes(raw) ? (raw as T) : null;
}

function parseDate(raw: string | null): string | null {
  return raw && /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

function parsePage(raw: string | null): number {
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function fulfillmentLabel(t: FulfillmentType): string {
  return t === "DELIVERY" ? "Dostawa" : "Odbiór";
}

function formatCurrency(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(n);
}

export function OrdersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: OrderFiltersValue = useMemo(
    () => ({
      status: parseEnum(searchParams.get("status"), STATUS_VALUES),
      fulfillmentType: parseEnum(searchParams.get("fulfillmentType"), FULFILLMENT_VALUES),
      dateFrom: parseDate(searchParams.get("dateFrom")),
      dateTo: parseDate(searchParams.get("dateTo")),
    }),
    [searchParams]
  );

  const page = parsePage(searchParams.get("page"));

  const query: AdminOrdersQuery = useMemo(
    () => ({
      status: filters.status,
      fulfillmentType: filters.fulfillmentType,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      page,
      size: PAGE_SIZE,
    }),
    [filters, page]
  );

  const listQuery = useQuery<SpringPage<AdminOrderListItemDto>>({
    queryKey: ["admin", "orders", "list", query],
    queryFn: () => fetchAdminOrders(query),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    placeholderData: (prev) => prev,
  });

  const updateFilters = (next: OrderFiltersValue) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      const setOrDelete = (key: string, v: string | null) => {
        if (v) p.set(key, v);
        else p.delete(key);
      };
      setOrDelete("status", next.status);
      setOrDelete("fulfillmentType", next.fulfillmentType);
      setOrDelete("dateFrom", next.dateFrom);
      setOrDelete("dateTo", next.dateTo);
      p.delete("page");
      return p;
    });
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const goToPage = (target: number) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (target > 0) p.set("page", String(target));
      else p.delete("page");
      return p;
    });
  };

  const hasActiveFilters =
    !!filters.status ||
    !!filters.fulfillmentType ||
    !!filters.dateFrom ||
    !!filters.dateTo;

  const data = listQuery.data;
  const rows = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.number ?? 0;
  const errorMessage = listQuery.isError
    ? extractProblem(listQuery.error)?.detail ?? "Spróbuj odświeżyć stronę."
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Zamówienia</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lista odświeża się automatycznie co 10 sekund.
          </p>
        </div>
      </div>

      <OrderFilters
        value={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać zamówień: {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white">
        {listQuery.isPending ? (
          <OrdersListSkeleton />
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Brak zamówień dla tych filtrów.
          </div>
        ) : (
          <Table>
            <colgroup>
              <col className="w-[148px]" />
              <col className="w-[108px]" />
              <col />
              <col className="w-[84px]" />
              <col className="w-[108px]" />
              <col className="w-[160px]" />
              <col className="w-[72px]" />
              <col className="w-[96px]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Numer</TableHead>
                <TableHead className="text-[11px]">Złożone</TableHead>
                <TableHead className="text-[11px]">Klient</TableHead>
                <TableHead className="text-center text-[11px]">Pozycje</TableHead>
                <TableHead className="text-[11px]">Typ</TableHead>
                <TableHead className="text-[11px]">Status</TableHead>
                <TableHead className="text-[11px]">ETA</TableHead>
                <TableHead className="text-right text-[11px]">Kwota</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, idx) => (
                <OrderRow key={row.id} row={row} index={idx} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Strona {currentPage + 1} z {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage <= 0}
              onClick={() => goToPage(currentPage - 1)}
            >
              ← Poprzednia
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={currentPage + 1 >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Następna →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ row, index }: { row: AdminOrderListItemDto; index: number }) {
  const isNew = row.status === "NEW";
  const delayMs = Math.min(index, STAGGER_CAP - 1) * STAGGER_STEP_MS;
  return (
    <TableRow
      className={cn(
        "animate-in fade-in slide-in-from-bottom-1 duration-300",
        isNew && "bg-primary/[0.03]"
      )}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <TableCell className="font-mono text-sm">
        <Link
          to={`/admin/orders/${row.id}`}
          className="inline-flex items-center gap-2 font-medium text-slate-900 hover:text-primary"
        >
          {isNew && (
            <span
              aria-label="Nowe zamówienie"
              className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary"
            />
          )}
          {row.orderNumber}
        </Link>
      </TableCell>
      <TableCell className="font-mono text-xs text-slate-600">
        {formatTime(row.placedAt)}
      </TableCell>
      <TableCell>
        <div className="text-slate-900">{row.customerName}</div>
        <div className="text-xs text-slate-500">{row.customerPhone}</div>
      </TableCell>
      <TableCell className="text-center font-mono text-slate-700">
        {row.itemsCount}
      </TableCell>
      <TableCell className="text-slate-600">
        {fulfillmentLabel(row.fulfillmentType)}
      </TableCell>
      <TableCell>
        <OrderStatusBadge status={row.status} />
      </TableCell>
      <TableCell className="font-mono text-sm text-slate-700">
        {row.etaMinutes !== null ? `${row.etaMinutes} min` : "—"}
      </TableCell>
      <TableCell className="text-right font-mono font-medium text-slate-900">
        {formatCurrency(row.total)}
      </TableCell>
    </TableRow>
  );
}

function OrdersListSkeleton() {
  return (
    <Table>
      <colgroup>
        <col className="w-[148px]" />
        <col className="w-[108px]" />
        <col />
        <col className="w-[84px]" />
        <col className="w-[108px]" />
        <col className="w-[160px]" />
        <col className="w-[72px]" />
        <col className="w-[96px]" />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead className="text-[11px]">Numer</TableHead>
          <TableHead className="text-[11px]">Złożone</TableHead>
          <TableHead className="text-[11px]">Klient</TableHead>
          <TableHead className="text-center text-[11px]">Pozycje</TableHead>
          <TableHead className="text-[11px]">Typ</TableHead>
          <TableHead className="text-[11px]">Status</TableHead>
          <TableHead className="text-[11px]">ETA</TableHead>
          <TableHead className="text-right text-[11px]">Kwota</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, idx) => (
          <TableRow key={idx}>
            <TableCell><div className="h-4 w-20 animate-pulse rounded bg-slate-200" /></TableCell>
            <TableCell><div className="h-4 w-12 animate-pulse rounded bg-slate-200" /></TableCell>
            <TableCell>
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-1 h-3 w-20 animate-pulse rounded bg-slate-200" />
            </TableCell>
            <TableCell><div className="mx-auto h-4 w-6 animate-pulse rounded bg-slate-200" /></TableCell>
            <TableCell><div className="h-4 w-16 animate-pulse rounded bg-slate-200" /></TableCell>
            <TableCell><div className="h-5 w-20 animate-pulse rounded-full bg-slate-200" /></TableCell>
            <TableCell><div className="h-4 w-10 animate-pulse rounded bg-slate-200" /></TableCell>
            <TableCell className="text-right"><div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
