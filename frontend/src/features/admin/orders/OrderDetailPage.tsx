import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink, Phone, Printer } from "lucide-react";
import {
  fetchAdminOrderById,
  updateOrderEta,
  undoLastOrderEdit,
  updateOrderItems,
  updateOrderStatus,
  type AdminOrderDto,
  type EditOrderPayload,
  type AdminOrderStatusHistoryDto,
  type FulfillmentType,
  type OrderStatus,
  type OrderTrackingAddressDto,
  type OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { formatDateTime } from "@/shared/lib/formatDate";
import { cashChangeText } from "@/shared/lib/cashChange";
import { statusLabel } from "@/shared/components/ui/OrderStatusBadge";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { EtaDialog } from "./components/EtaDialog";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { useElapsedTick } from "../operations/shared/useElapsedTick";
import { ItemNoteLine } from "../operations/shared/ItemNoteLine";
import { contentEditBlockedReason } from "./lib/transitions";
import { OrderItemsEditor } from "./edit/OrderItemsEditor";
import { OrderEditHistory } from "./edit/OrderEditHistory";

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function fulfillmentLabel(t: FulfillmentType): string {
  return t === "DELIVERY" ? "Dostawa" : "Odbiór";
}

function paymentLabel(t: AdminOrderDto["paymentMethod"]): string {
  return t === "CASH_ON_DELIVERY" ? "Gotówka przy dostawie" : "Gotówka przy odbiorze";
}

function formatHHmm(iso: string): string {
  return new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function elapsedMin(iso: string, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 60_000));
}

function buildMapsHref(address: OrderTrackingAddressDto): string {
  const parts = [
    `${address.street} ${address.buildingNumber}${address.apartmentNumber ? `/${address.apartmentNumber}` : ""}`,
    `${address.postalCode} ${address.city}`,
  ];
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(", "))}`;
}

const STATUS_PILL: Record<OrderStatus, { dot: string }> = {
  NEW: { dot: "--status-new" },
  CONFIRMED: { dot: "--status-confirmed" },
  IN_PREPARATION: { dot: "--status-prep" },
  READY: { dot: "--status-ready" },
  OUT_FOR_DELIVERY: { dot: "--status-out" },
  DELIVERED: { dot: "--status-delivered" },
  CANCELED: { dot: "--status-cancelled" },
};

interface PrimaryAction {
  label: string;
  next: OrderStatus;
  bgVar: string;
  textColor: string;
}

function primaryAction(status: OrderStatus, fulfillment: FulfillmentType): PrimaryAction | null {
  switch (status) {
    case "NEW":
      return { label: "Potwierdź →", next: "CONFIRMED", bgVar: "--status-new", textColor: "#1A1A1A" };
    case "CONFIRMED":
      return { label: "Rozpocznij przygotowanie →", next: "IN_PREPARATION", bgVar: "--status-confirmed", textColor: "#fff" };
    case "IN_PREPARATION":
      return { label: "✓ Gotowe", next: "READY", bgVar: "--status-ready", textColor: "#fff" };
    case "READY":
      return fulfillment === "DELIVERY"
        ? { label: "Wyjechało →", next: "OUT_FOR_DELIVERY", bgVar: "--color-primary", textColor: "#fff" }
        : { label: "✓ Wydane", next: "DELIVERED", bgVar: "--status-ready", textColor: "#fff" };
    case "OUT_FOR_DELIVERY":
      return { label: "✓ Doręczone", next: "DELIVERED", bgVar: "--status-ready", textColor: "#fff" };
    case "DELIVERED":
    case "CANCELED":
      return null;
  }
}

export function OrderDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam ? Number.parseInt(idParam, 10) : NaN;
  const queryClient = useQueryClient();
  const [etaOpen, setEtaOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const now = useElapsedTick();

  const query = useQuery<AdminOrderDto>({
    queryKey: ["admin", "orders", "detail", id],
    queryFn: () => fetchAdminOrderById(id),
    enabled: Number.isFinite(id),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const order = query.data;

  const handleMutationError = (err: unknown, fallback: string) => {
    const problem = extractProblem(err);
    const httpStatus = err instanceof AxiosError ? err.response?.status : undefined;
    if (httpStatus === 409) {
      toast.error("Ktoś inny zmienił zamówienie. Odśwież widok.");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", id] });
      return;
    }
    toast.error(problem?.detail ?? problem?.title ?? fallback);
  };

  const statusMutation = useMutation({
    mutationFn: ({ next, version, reason }: { next: OrderStatus; version: number; reason?: string }) =>
      updateOrderStatus(id, { status: next, version, reason }),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "orders", "detail", id], data);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
      toast.success(`Status zmieniony na: ${statusLabel(data.status)}`);
    },
    onError: (err) => handleMutationError(err, "Nie udało się zmienić statusu"),
  });

  const etaMutation = useMutation({
    mutationFn: ({ minutesFromNow, version }: { minutesFromNow: number; version: number }) =>
      updateOrderEta(id, { minutesFromNow, version }),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "orders", "detail", id], data);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      toast.success("ETA zaktualizowane");
      setEtaOpen(false);
    },
    onError: (err) => handleMutationError(err, "Nie udało się zapisać ETA"),
  });

  const editMutation = useMutation({
    mutationFn: (payload: EditOrderPayload) => updateOrderItems(id, payload),
    onSuccess: () => {
      // Świadomie invalidate zamiast setQueryData: przy edycji ruszającej
      // tylko wiersze pozycji @Version podbija się dopiero przy commicie,
      // więc odpowiedź niesie jeszcze starą wersję. Zapisanie jej w cache
      // wywaliłoby następny zapis na 409 bez powodu.
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
      setEditing(false);
      toast.success("Zamówienie zaktualizowane");
    },
    onError: (err) => {
      handleMutationError(err, "Nie udało się zapisać zmian");
      // 409 = ktoś inny ruszył zamówienie. Wersja i pozycje w edytorze są
      // już nieaktualne, więc zamykamy go i pokazujemy świeży stan.
      if (err instanceof AxiosError && err.response?.status === 409) {
        setEditing(false);
      }
    },
  });

  const undoMutation = useMutation({
    mutationFn: (version: number) => undoLastOrderEdit(id, version),
    onSuccess: () => {
      // Ten sam powód co przy zapisie edycji — wersja z odpowiedzi bywa
      // sprzed wymuszonego inkrementu.
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
      toast.success("Ostatnia zmiana cofnięta");
    },
    onError: (err) => handleMutationError(err, "Nie udało się cofnąć zmiany"),
  });

  const errorMessage = useMemo(() => {
    if (!query.isError) return null;
    const err = query.error;
    if (err instanceof AxiosError && err.response?.status === 404) {
      return "Nie znaleziono zamówienia.";
    }
    return extractProblem(err)?.detail ?? "Spróbuj odświeżyć stronę.";
  }, [query.isError, query.error]);

  if (!Number.isFinite(id)) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[rgb(var(--color-text-muted))]">
          Nieprawidłowy identyfikator zamówienia.
        </p>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-5">
        <div
          className="h-40 animate-pulse rounded-xl"
          style={{ background: "rgb(var(--color-bg-section))" }}
        />
      </div>
    );
  }

  if (errorMessage || !order) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className="rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          {errorMessage ?? "Nie udało się pobrać zamówienia."}
        </div>
      </div>
    );
  }

  const confirmedAt = order.statusHistory.find((h) => h.status === "CONFIRMED")?.changedAt;
  const placedHHmm = formatHHmm(order.placedAt);
  const confirmedHHmm = confirmedAt ? formatHHmm(confirmedAt) : null;
  const sincePlaced = elapsedMin(order.placedAt, now);
  const dotVar = STATUS_PILL[order.status].dot;
  const action = primaryAction(order.status, order.fulfillmentType);
  const itemsCount = order.items.length;
  const piecesCount = order.items.reduce((acc, it) => acc + it.quantity, 0);
  const editBlockedReason = contentEditBlockedReason(order.status);

  return (
    <div className="flex flex-col gap-5">
      <AdminTopbar
        title={
          <>
            Zamówienie{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>{order.orderNumber}</span>
          </>
        }
        metadata={`${statusLabel(order.status)} · złożone ${placedHHmm}${
          confirmedHHmm ? ` · potwierdzone ${confirmedHHmm}` : ""
        }`}
        liveStatus="polling"
        liveLabel="Polling 10s"
        actions={
          <>
            {order.trackingToken && (
              <Link
                to={`/track/${order.trackingToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold"
                style={{
                  border: "1px solid rgb(var(--color-border-card))",
                  background: "rgb(var(--color-bg-card))",
                  color: "rgb(var(--color-primary))",
                  textDecoration: "none",
                  fontFamily: "inherit",
                }}
              >
                {/* Na wąskim ekranie sam „Tracker" — pełna etykieta zjadałaby
                    miejsce tytułowi obok wyciszenia i wylogowania. */}
                <span className="sm:hidden">Tracker</span>
                <span className="hidden sm:inline">Tracker klienta</span>
                <ExternalLink size={12} strokeWidth={1.7} aria-hidden />
              </Link>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium sm:inline-flex"
              style={{
                border: "1px solid rgb(var(--color-border-card))",
                background: "rgb(var(--color-bg-card))",
                color: "rgb(var(--color-text-body))",
                fontFamily: "inherit",
              }}
            >
              <Printer size={13} strokeWidth={1.7} aria-hidden /> Drukuj
            </button>
          </>
        }
      />

      {/* Mobile: pasek statusu osobno, akcje w siatce 2-kolumnowej (akcja
          główna i anulowanie na całą szerokość). Od sm w górę — jeden rząd
          jak dotąd. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap items-center gap-3">
        <span
          className="inline-flex items-center"
          style={{
            gap: 8,
            padding: "6px 14px",
            borderRadius: 9999,
            background: `rgb(var(${dotVar}) / 0.14)`,
            color: `rgb(var(${dotVar}))`,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "0.01em",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{ width: 8, height: 8, borderRadius: 9999, background: "currentColor" }}
            aria-hidden
          />
          {statusLabel(order.status)}
        </span>
        <span className="text-[13px] text-[rgb(var(--color-text-muted))]">
          · od {sincePlaced} min
        </span>
        </div>
        <div className="hidden sm:block sm:flex-1" />
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        <button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setEditing(true)}
          disabled={editBlockedReason !== null || editing || statusMutation.isPending}
          title={editBlockedReason ?? "Zmień pozycje, dodatki i notatki"}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 8,
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            fontSize: 13,
            color:
              editBlockedReason !== null
                ? "rgb(var(--color-text-faint))"
                : "rgb(var(--color-text-body))",
            cursor: editBlockedReason !== null ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Edytuj pozycje
        </button>
        <button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setEtaOpen(true)}
          disabled={statusMutation.isPending || etaMutation.isPending}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 8,
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            fontSize: 13,
            color: "rgb(var(--color-text-body))",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Zmień ETA
        </button>
        {order.status !== "CANCELED" && order.status !== "DELIVERED" && (
          <button
            type="button"
            className="col-span-2 w-full sm:w-auto"
            onClick={() => setCancelOpen(true)}
            disabled={statusMutation.isPending || etaMutation.isPending}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid #FCA5A5",
              background: "rgb(var(--color-bg-card))",
              fontSize: 13,
              color: "rgb(var(--status-cancelled))",
              cursor: "pointer",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            Anuluj zamówienie
          </button>
        )}
        {action && (
          <button
            type="button"
            className="order-first col-span-2 w-full sm:order-none sm:w-auto"
            onClick={() => statusMutation.mutate({ next: action.next, version: order.version })}
            disabled={statusMutation.isPending || etaMutation.isPending}
            style={{
              height: 38,
              padding: "0 18px",
              borderRadius: 8,
              border: "none",
              background: `rgb(var(${action.bgVar}))`,
              color: action.textColor,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              opacity: statusMutation.isPending ? 0.7 : 1,
            }}
          >
            {statusMutation.isPending ? "Zapisywanie…" : action.label}
          </button>
        )}
        </div>
      </div>

      {order.customerNotes && (
        <div
          style={{
            background: "#FFF8E1",
            border: "1px solid #FCD34D",
            borderLeft: "4px solid rgb(var(--status-new))",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            gap: 12,
            color: "#78350F",
          }}
        >
          <span
            style={{
              color: "rgb(var(--status-new))",
              flexShrink: 0,
              marginTop: 2,
              display: "inline-flex",
            }}
            aria-hidden
          >
            <AlertTriangle size={18} strokeWidth={1.7} />
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
              Notka klienta do zamówienia
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line" }}>
              {order.customerNotes}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[7fr_5fr]">
        <div className="flex flex-col gap-4">
        {editing ? (
          <OrderItemsEditor
            order={order}
            isSaving={editMutation.isPending}
            onCancel={() => setEditing(false)}
            onSave={(payload) => editMutation.mutate(payload)}
          />
        ) : (
        <div
          style={{
            background: "rgb(var(--color-bg-card))",
            border: "1px solid rgb(var(--color-border-card))",
            borderRadius: 10,
            padding: 0,
          }}
        >
          <div
            className="flex items-baseline justify-between"
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgb(var(--color-border-subtle))",
            }}
          >
            <h3 className="m-0 text-[15px] font-bold">Pozycje ({itemsCount})</h3>
            <span className="text-[12px] text-[rgb(var(--color-text-muted))]">
              {piecesCount} {piecesCount === 1 ? "sztuka" : "sztuk"} w sumie
            </span>
          </div>

          {order.items.map((it, i) => (
            <OrderItemRow
              key={i}
              item={it}
              isLast={i === order.items.length - 1}
            />
          ))}

          <div
            style={{
              padding: "16px 20px",
              background: "rgb(var(--color-bg-section))",
            }}
          >
            <TotalsRow label="Suma pozycji" value={zl(order.subtotal)} />
            {order.fulfillmentType === "DELIVERY" && (
              <TotalsRow
                label={
                  order.deliveryZoneName
                    ? `Dostawa — ${order.deliveryZoneName}`
                    : "Dostawa"
                }
                value={zl(order.deliveryFee)}
              />
            )}
            <TotalsRow label="Razem" value={zl(order.total)} bold />
          </div>
        </div>
        )}

        {/* Historia zmian pod pozycjami — dotyczy właśnie ich. */}
        <OrderEditHistory
          edits={order.edits}
          isUndoing={undoMutation.isPending}
          onUndo={() => undoMutation.mutate(order.version)}
        />
        </div>

        <div className="flex flex-col gap-4">
          <AsideCard title="Klient">
            <div className="text-[17px] font-bold text-[rgb(var(--color-text-primary))]">
              {order.customerName}
            </div>
            <a
              href={`tel:${order.customerPhone}`}
              className="mt-1.5 inline-flex items-center gap-1.5 text-[14px] font-medium"
              style={{ color: "rgb(var(--color-primary))", textDecoration: "none" }}
            >
              <Phone size={14} strokeWidth={1.7} aria-hidden /> {order.customerPhone}
            </a>
            {order.customerEmail && (
              <div className="mt-1">
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="text-[13px]"
                  style={{ color: "rgb(var(--color-primary))" }}
                >
                  {order.customerEmail}
                </a>
              </div>
            )}
          </AsideCard>

          {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
            <AsideCard title="Adres dostawy">
              <div className="text-[15px] font-semibold leading-[1.4]">
                {order.deliveryAddress.street} {order.deliveryAddress.buildingNumber}
                {order.deliveryAddress.apartmentNumber && `/${order.deliveryAddress.apartmentNumber}`}
                , {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
              </div>
              {order.deliveryAddress.notes && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    background: "rgb(var(--color-bg-section))",
                    borderRadius: 6,
                    fontSize: 12,
                    color: "rgb(var(--color-text-muted))",
                  }}
                >
                  {order.deliveryAddress.notes}
                </div>
              )}
              <div
                style={{
                  marginTop: order.deliveryAddress.notes ? 8 : 12,
                  padding: 10,
                  background: "rgb(var(--color-bg-section))",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                {order.deliveryZoneName ? `Strefa ${order.deliveryZoneName} · ` : ""}
                {zl(order.deliveryFee)}
                {order.etaMinutes !== null ? ` · ETA ${order.etaMinutes} min` : ""}
              </div>
              <a
                href={buildMapsHref(order.deliveryAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[12px] font-semibold"
                style={{ color: "rgb(var(--color-primary))" }}
              >
                Otwórz w mapie →
              </a>
            </AsideCard>
          )}

          <AsideCard title="Płatność">
            <div className="flex items-baseline justify-between">
              <div className="text-[15px] font-semibold text-[rgb(var(--color-text-primary))]">
                {paymentLabel(order.paymentMethod)}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 9999,
                  background: "#FFF8E1",
                  color: "#78350F",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Nieopłacone
              </span>
            </div>
            <div className="mt-1 text-[13px] text-[rgb(var(--color-text-muted))]">
              {fulfillmentLabel(order.fulfillmentType)}
            </div>
            {/* D-03: wydający ma wiedzieć, ILE wydać — nie z jakiego
                nominału ma sam policzyć. */}
            <CashChangeLine cashChangeFrom={order.cashChangeFrom} total={order.total} />
          </AsideCard>

          <AsideCard title="Historia statusu">
            <StatusTimeline history={order.statusHistory} />
          </AsideCard>
        </div>
      </div>

      <EtaDialog
        open={etaOpen}
        onOpenChange={setEtaOpen}
        currentEtaMinutes={order.etaMinutes}
        currentEtaSetAt={order.etaSetAt}
        onSubmit={(minutesFromNow) =>
          etaMutation.mutate({ minutesFromNow, version: order.version })
        }
        isSubmitting={etaMutation.isPending}
      />

      <CancelOrderDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        orderNumber={order.orderNumber}
        isSubmitting={statusMutation.isPending}
        onConfirm={(reason) => {
          setCancelOpen(false);
          statusMutation.mutate({
            next: "CANCELED",
            version: order.version,
            reason,
          });
        }}
      />
    </div>
  );
}

function CashChangeLine({
  cashChangeFrom,
  total,
}: {
  cashChangeFrom: string | null;
  total: string;
}) {
  const { text, warn } = cashChangeText(cashChangeFrom, total);
  return (
    <div
      className="mt-1 text-[13px] font-semibold"
      style={{
        color: warn ? "rgb(var(--status-cancelled))" : "rgb(var(--color-text-primary))",
      }}
    >
      {text}
    </div>
  );
}

function AsideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        borderRadius: 10,
        padding: 18,
      }}
    >
      <h4
        className="m-0 mb-3 text-[12px] font-bold uppercase"
        style={{
          letterSpacing: "0.06em",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function OrderItemRow({ item, isLast }: { item: OrderTrackingItemDto; isLast: boolean }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: isLast ? "none" : "1px solid rgb(var(--color-border-subtle))",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            fontWeight: 700,
            color: "rgb(var(--color-text-primary))",
            minWidth: 28,
          }}
        >
          {item.quantity}×
        </span>
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "rgb(var(--color-text-primary))",
            }}
          >
            {item.productName}
            {item.variantName && (
              <span
                style={{
                  fontWeight: 400,
                  color: "rgb(var(--color-text-muted))",
                  marginLeft: 6,
                }}
              >
                · {item.variantName}
              </span>
            )}
          </div>
          {item.addons.length > 0 && (
            <ul
              style={{
                margin: "6px 0 0",
                padding: "0 0 0 12px",
                fontSize: 13,
                color: "rgb(var(--color-text-body))",
              }}
            >
              {item.addons.map((a, j) => (
                <li key={j} style={{ listStyle: "circle" }}>
                  + {a.name}{" "}
                  <span style={{ color: "rgb(var(--color-text-muted))" }}>
                    ({zl(a.unitPrice)})
                  </span>
                </li>
              ))}
            </ul>
          )}
          <ItemNoteLine item={item} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            fontWeight: 600,
            color: "rgb(var(--color-text-primary))",
          }}
        >
          {zl(item.lineTotal)}
        </span>
      </div>
    </div>
  );
}

function TotalsRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: bold ? 16 : 13,
        fontWeight: bold ? 700 : 400,
        color: bold ? "rgb(var(--color-text-primary))" : "rgb(var(--color-text-body))",
        padding: "4px 0",
      }}
    >
      <span>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}

function StatusTimeline({ history }: { history: AdminOrderStatusHistoryDto[] }) {
  if (history.length === 0) {
    return (
      <p className="text-[13px] text-[rgb(var(--color-text-muted))]">
        Brak historii statusów.
      </p>
    );
  }
  const sorted = [...history].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
  );
  const lastIdx = sorted.length - 1;

  return (
    <div>
      {sorted.map((entry, i) => {
        const isCurrent = i === lastIdx;
        return (
          <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
            <div
              style={{
                width: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                className={isCurrent ? "motion-safe:animate-dotpulse" : ""}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 9999,
                  background: isCurrent
                    ? "rgb(var(--color-primary))"
                    : "rgb(var(--status-ready))",
                  marginTop: 4,
                }}
                aria-hidden
              />
              {i < lastIdx && (
                <span
                  style={{
                    flex: 1,
                    width: 2,
                    minHeight: 22,
                    background: "rgb(var(--status-ready))",
                  }}
                  aria-hidden
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: i < lastIdx ? 12 : 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: isCurrent ? 700 : 500,
                  color: "rgb(var(--color-text-primary))",
                }}
              >
                {statusLabel(entry.status)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgb(var(--color-text-muted))",
                  display: "flex",
                  gap: 8,
                  marginTop: 2,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {formatDateTime(entry.changedAt)}
                </span>
                {entry.changedBy && <span>· {entry.changedBy}</span>}
              </div>
              {entry.reason && (
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12,
                    fontStyle: "italic",
                    color: "rgb(var(--color-text-body))",
                  }}
                >
                  {entry.reason}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
