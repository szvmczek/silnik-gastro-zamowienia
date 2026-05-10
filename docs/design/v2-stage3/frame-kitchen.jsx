/* frame-kitchen.jsx
   /admin/kitchen — Kuchnia (priorytet #1)
   2 sekcje: Nowe [NEW + CONFIRMED] → W przygotowaniu
   ("Gotowe do wydania" przeniesione do /admin/pickup — tam są wydawane.)
   3-step machine: NEW → CONFIRMED → IN_PREPARATION → READY
   Brak akcji "Anuluj" w kuchni — anulacja idzie z OrderDetail.
   Urgent pulse po 7 min. Note klienta jako żółty alert. */

const KitchenItemRow = ({ item, highlightNote = true }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "auto 1fr auto",
    gap: 10, padding: "6px 0", alignItems: "baseline"
  }}>
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
      color: "var(--admin-text-primary)", minWidth: 22
    }}>
      {item.qty}×
    </span>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--admin-text-primary)", lineHeight: 1.3 }}>
        {item.name}
        {item.size && (
          <span style={{ fontWeight: 400, color: "var(--admin-text-muted)", marginLeft: 6 }}>
            · {item.size}
          </span>
        )}
      </div>
      {item.note && (
        <div style={{
          marginTop: 6, padding: "8px 10px",
          background: highlightNote ? "#FFF8E1" : "transparent",
          border: highlightNote ? "1px solid #FCD34D" : "1px dashed var(--admin-card-border)",
          borderLeft: highlightNote ? "3px solid var(--status-new)" : "1px dashed var(--admin-card-border)",
          borderRadius: 6,
          fontSize: 13, color: highlightNote ? "#78350F" : "var(--admin-text-muted)",
          lineHeight: 1.4,
          display: "flex", gap: 8, alignItems: "flex-start"
        }}>
          {highlightNote && (
            <span style={{ color: "var(--status-new)", flexShrink: 0, marginTop: 1 }}>
              {window.A.Icons.warning}
            </span>
          )}
          <span><strong>Notka:</strong> {item.note}</span>
        </div>
      )}
    </div>
    <span style={{
      fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--admin-text-muted)",
      whiteSpace: "nowrap"
    }}>
      {window.A.zl(item.price)}
    </span>
  </div>
);

const KitchenCard = ({ order, status = "NEW", urgent = false, highlightNote = true, density = "comfortable" }) => {
  const isNew = status === "NEW";
  const isConfirmed = status === "CONFIRMED";
  const isPrep = status === "IN_PREPARATION";
  const isReady = status === "READY";

  const borderColor =
    isNew ? "var(--status-new)" :
    isConfirmed ? "var(--status-confirmed)" :
    isPrep ? "var(--color-primary)" :
    "var(--status-ready)";

  return (
    <window.A.Card
      urgent={urgent && isPrep}
      style={{
        padding: density === "compact" ? 14 : 16,
        marginBottom: density === "compact" ? 10 : 12,
        borderLeft: `4px solid ${borderColor}`,
        position: "relative"
      }}>
      {/* Header: code + customer + type + total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--admin-text-primary)" }}>
              {order.code}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
              background: order.type === "DELIVERY" ? "var(--status-out-tint)" : "var(--admin-row-hover)",
              color: order.type === "DELIVERY" ? "var(--status-out)" : "var(--admin-text-body)",
              letterSpacing: 0.04, textTransform: "uppercase"
            }}>
              {order.type === "DELIVERY" ? "Dostawa" : "Odbiór"}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--admin-text-body)", marginTop: 2, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span>{order.customer}</span>
            <span style={{ color: "var(--admin-text-faint)" }}>·</span>
            {order.eta ? (
              <button
                type="button"
                title="Edytuj ETA"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 13, fontWeight: 600,
                  color: "var(--admin-text-body)",
                  background: "transparent", border: "none", padding: 0,
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                <span style={{ color: "var(--admin-text-muted)", fontWeight: 400 }}>ETA:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{order.eta}</span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>✏️</span>
              </button>
            ) : (
              <button
                type="button"
                title="Ustaw ETA"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 13, fontWeight: 600,
                  color: "var(--color-primary)",
                  background: "transparent",
                  border: "1px dashed var(--color-primary)",
                  borderRadius: 6, padding: "1px 8px",
                  cursor: "pointer", fontFamily: "inherit"
                }}>
                <span style={{ color: "var(--admin-text-muted)", fontWeight: 400 }}>ETA:</span>
                <span>+ Ustaw</span>
              </button>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, color: "var(--admin-text-primary)" }}>
            {window.A.zl(order.total)}
          </div>
          <div style={{
            fontSize: 11, color: urgent ? "var(--status-cancelled)" : "var(--admin-text-muted)",
            marginTop: 2, fontWeight: urgent ? 700 : 400,
            display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end"
          }}>
            <span style={{ display: "inline-flex" }}>{window.A.Icons.clock}</span>
            {isPrep && order.since !== undefined ? `od ${order.since} min` : window.A.minAgo(order.time)}
          </div>
        </div>
      </div>

      {/* Items */}
      <div style={{
        marginTop: 10, paddingTop: 10,
        borderTop: "1px dashed var(--admin-divider)"
      }}>
        {order.items ? order.items.map((it, i) => (
          <KitchenItemRow key={i} item={it} highlightNote={highlightNote} />
        )) : (
          <div style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>3 pozycje · zwiń kartę aby zobaczyć szczegóły</div>
        )}
      </div>

      {/* Actions — 3-step state machine, no Anuluj here (goes via OrderDetail) */}
      {isNew && (
        <button style={{
          width: "100%", height: 40, marginTop: 12,
          borderRadius: 8, border: "none",
          background: "var(--status-new)", color: "#1A1A1A",
          fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>
          Potwierdź zamówienie →
        </button>
      )}
      {isConfirmed && (
        <button style={{
          width: "100%", height: 40, marginTop: 12,
          borderRadius: 8, border: "none",
          background: "var(--status-confirmed)", color: "#fff",
          fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>
          Rozpocznij przygotowanie →
        </button>
      )}
      {isPrep && (
        <button style={{
          width: "100%", height: 40, marginTop: 12,
          borderRadius: 8, border: "none",
          background: "var(--color-primary)", color: "#fff",
          fontSize: 14, fontWeight: 600, cursor: "pointer"
        }}>
          ✓ Gotowe
        </button>
      )}
    </window.A.Card>
  );
};

const KitchenColumn = ({ title, count, density, accentColor, renderItems }) => (
  <div style={{
    display: "flex", flexDirection: "column", minWidth: 0,
    background: "var(--admin-shell)", borderRadius: 12,
    border: "1px solid var(--admin-shell-border)",
    overflow: "hidden"
  }}>
    <div style={{
      padding: "14px 16px",
      borderBottom: "1px solid var(--admin-shell-border)",
      background: "var(--admin-card)",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: 9999, background: accentColor }} />
        <h3 style={{
          fontSize: 14, fontWeight: 700, margin: 0,
          color: "var(--admin-text-primary)", letterSpacing: -0.005
        }}>
          {title}
        </h3>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
          background: "var(--admin-row-hover)",
          color: "var(--admin-text-body)",
          padding: "2px 8px", borderRadius: 9999
        }}>
          {count}
        </span>
      </div>
    </div>
    <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 12 }}>
      {renderItems()}
    </div>
  </div>
);

const KitchenFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false,
                        sseSimulate = false, highlightNote = true, newCount = 6 }) => {
  const f = window.A.fixtures;

  // build prep column with urgent flag for #1038 (>= 7 min mark)
  const prepWithUrgent = [
    { ...f.inPrep[0], since: 4 },
    { ...f.inPrep[1], since: 9 } // urgent
  ];

  // "Nowe" = NEW + CONFIRMED (oczekujące na rozpoczęcie przygotowania)
  // wewnętrznie różnią się statusem ale wizualnie siedzą obok siebie
  // (pokazujemy 2 NEW + 1 CONFIRMED dla czytelności state machine)
  const newCol = [
    ...f.newOrders.slice(0, 2).map(o => ({ ...o, _status: "NEW" })),
    ...f.confirmed.map(o => ({ ...o, _status: "CONFIRMED" }))
  ];

  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden", position: "relative" }}>
      <window.A.Sidebar active="kitchen" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title="Kuchnia"
          subtitle={`W toku: ${newCol.length + prepWithUrgent.length} zamówień · cel: 18 min`}
          breadcrumb="Operacyjne"
          soundOn={soundOn}
          density={density}
          actions={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 12,
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 10px",
                background: sseSimulate ? "var(--status-ready-tint)" : "var(--admin-row-hover)",
                color: sseSimulate ? "#065F46" : "var(--admin-text-muted)",
                borderRadius: 9999, fontWeight: 600
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: 9999,
                  background: sseSimulate ? "var(--status-ready)" : "var(--admin-text-faint)",
                }} className={sseSimulate ? "is-pulsing" : ""} />
                {sseSimulate ? "Live · połączono" : "Polling 30s"}
              </span>
            </div>
          }
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div style={{
          flex: 1, overflow: "hidden",
          padding: density === "compact" ? 16 : 20,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: density === "compact" ? 12 : 16
        }}>
          <KitchenColumn
            title="Nowe"
            count={newCol.length}
            highlightNote={highlightNote}
            density={density}
            accentColor="var(--status-new)"
            renderItems={() => newCol.map(o => (
              <KitchenCard
                key={o.id}
                order={o}
                status={o._status}
                highlightNote={highlightNote}
                density={density}
              />
            ))}
          />
          <KitchenColumn
            title="W przygotowaniu"
            count={prepWithUrgent.length}
            highlightNote={highlightNote}
            density={density}
            accentColor="var(--status-prep)"
            renderItems={() => prepWithUrgent.map(o => (
              <KitchenCard
                key={o.id}
                order={o}
                status="IN_PREPARATION"
                urgent={o.since >= 7}
                highlightNote={highlightNote}
                density={density}
              />
            ))}
          />
        </div>

        {sseSimulate && <window.A.Toast />}
      </main>
    </div>
  );
};

window.KitchenFrame = KitchenFrame;
