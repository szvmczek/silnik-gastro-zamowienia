/* frame-pickup.jsx
   /admin/pickup — Wydanie (lada)
   Focal: imię klienta. Compact list — slot, klient, pozycje (count), telefon, kwota, akcja.
   Action zmieniona z "Wydane →" na "Szczegóły →" (idzie do OrderDetail). */

const fmtItemsBrief = (items) => {
  if (!items || !items.length) return "—";
  const fmt = (it) => `${it.qty}× ${it.name}${it.size ? ` ${it.size}` : ""}`;
  if (items.length <= 3) return items.map(fmt).join(", ");
  const head = items.slice(0, 2).map(fmt).join(", ");
  const more = items.length - 2;
  return `${head} · +${more} więcej`;
};

const PickupRow = ({ order, density, slotEmphasis = true }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: density === "compact"
      ? "70px 1.1fr 1.4fr 130px 100px 120px"
      : "84px 1.1fr 1.6fr 150px 110px 140px",
    alignItems: "center", gap: 16,
    padding: density === "compact" ? "12px 16px" : "16px 20px",
    background: "var(--admin-card)",
    borderBottom: "1px solid var(--admin-divider)"
  }}>
    {/* Slot time */}
    <div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: slotEmphasis ? 24 : 16, fontWeight: 700,
        color: "var(--admin-text-primary)", lineHeight: 1
      }}>
        {order.slot}
      </div>
      <div style={{ fontSize: 11, color: "var(--admin-text-faint)", marginTop: 4, fontWeight: 500 }}>
        slot
      </div>
    </div>

    {/* Customer name — focal */}
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: density === "compact" ? 18 : 22, fontWeight: 700,
        color: "var(--admin-text-primary)", letterSpacing: -0.01,
        lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
      }}>
        {order.customer}
      </div>
      <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 4 }}>
        {order.code} · czeka {order.since} min
      </div>
    </div>

    {/* Pozycje — kompaktowa lista produktów */}
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 12, color: "var(--admin-text-body)", lineHeight: 1.35,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden"
      }} title={(order.itemsList || []).map(it => `${it.qty}× ${it.name}${it.size ? ` ${it.size}` : ""}`).join(", ")}>
        {fmtItemsBrief(order.itemsList)}
      </div>
    </div>

    {/* Telefon */}
    <div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--admin-text-body)", fontWeight: 600
      }}>
        {order.phone || "—"}
      </div>
    </div>

    {/* Total */}
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--admin-text-primary)" }}>
        {window.A.zl(order.total)}
      </div>
      <div style={{ fontSize: 11, color: order.paid ? "var(--status-ready)" : "var(--admin-text-muted)", marginTop: 2, fontWeight: 600 }}>
        {order.paid ? "✓ Opłacone" : "Gotówka"}
      </div>
    </div>

    {/* Action — Szczegóły */}
    <button style={{
      height: 44, borderRadius: 8,
      border: "1px solid var(--admin-card-border)",
      background: "var(--admin-card)",
      color: "var(--admin-text-primary)",
      fontSize: 14, fontWeight: 600, cursor: "pointer"
    }}>
      Szczegóły →
    </button>
  </div>
);

const PickupFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false, newCount = 6 }) => {
  const fakeReady = [
    { id: 1037, code: "#1037", customer: "Ewa Dąbrowska",   total: 64.00, items: 2, since: 3, slot: "16:30", paid: true,  phone: "+48 502 110 887",
      itemsList: [
        { qty: 2, name: "Margherita", size: "32 cm" },
        { qty: 1, name: "Coca-Cola 0,5 L" }
      ] },
    { id: 1036, code: "#1036", customer: "Marcin Wójcik",   total: 92.00, items: 4, since: 1, slot: "16:45", paid: false, phone: "+48 600 778 102",
      itemsList: [
        { qty: 1, name: "Capricciosa", size: "32 cm" },
        { qty: 1, name: "Diavola", size: "40 cm" },
        { qty: 1, name: "Frytki belgijskie" },
        { qty: 2, name: "Coca-Cola 0,5 L" }
      ] },
    { id: 1033, code: "#1033", customer: "Aleksandra Kowal", total: 48.50, items: 2, since: 0, slot: "17:00", paid: true,  phone: "+48 793 220 119",
      itemsList: [
        { qty: 1, name: "Hawajska", size: "32 cm" },
        { qty: 1, name: "Zapiekanka klasyczna" }
      ] }
  ];

  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <window.A.Sidebar active="pickup" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title="Wydanie"
          subtitle="3 zamówienia gotowe do odbioru"
          breadcrumb="Operacyjne"
          soundOn={soundOn}
          density={density}
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Search bar */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 20, alignItems: "center"
          }}>
            <div style={{
              flex: 1, position: "relative",
              background: "var(--admin-card)", border: "1px solid var(--admin-card-border)",
              borderRadius: 8, height: 42, display: "flex", alignItems: "center"
            }}>
              <span style={{ position: "absolute", left: 12, color: "var(--admin-text-faint)", display: "inline-flex" }}>
                {window.A.Icons.search}
              </span>
              <input
                type="text"
                placeholder="Szukaj po imieniu klienta lub numerze zamówienia…"
                style={{
                  width: "100%", height: "100%", border: "none", background: "transparent",
                  outline: "none", padding: "0 14px 0 40px", fontSize: 14,
                  color: "var(--admin-text-primary)"
                }}
              />
            </div>
            <span style={{
              fontSize: 13, color: "var(--admin-text-muted)", padding: "0 8px"
            }}>
              {fakeReady.length} czeka
            </span>
          </div>

          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.04, textTransform: "uppercase",
                       color: "var(--admin-text-muted)", margin: "0 0 10px" }}>
            Gotowe do wydania
          </h2>

          <div style={{
            background: "var(--admin-card)",
            border: "1px solid var(--admin-card-border)",
            borderRadius: "var(--admin-radius-card)",
            overflow: "hidden"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: density === "compact"
                ? "70px 1.1fr 1.4fr 130px 100px 120px"
                : "84px 1.1fr 1.6fr 150px 110px 140px",
              gap: 16,
              padding: density === "compact" ? "10px 16px" : "12px 20px",
              background: "var(--admin-row-hover)",
              borderBottom: "1px solid var(--admin-divider)",
              fontSize: 11, color: "var(--admin-text-muted)", letterSpacing: 0.04, textTransform: "uppercase",
              fontWeight: 700
            }}>
              <span>Slot</span>
              <span>Klient</span>
              <span>Pozycje</span>
              <span>Telefon</span>
              <span style={{ textAlign: "right" }}>Kwota</span>
              <span></span>
            </div>
            {fakeReady.map(o => (
              <PickupRow key={o.id} order={o} density={density} />
            ))}
          </div>

          {/* Empty state hint */}
          <div style={{
            marginTop: 24, padding: "16px 20px",
            background: "var(--admin-shell)",
            border: "1px dashed var(--admin-card-border)",
            borderRadius: 10,
            fontSize: 13, color: "var(--admin-text-muted)",
            display: "flex", gap: 12, alignItems: "center"
          }}>
            <span style={{ color: "var(--admin-text-faint)", display: "inline-flex" }}>{window.A.Icons.kitchen}</span>
            <span>
              <strong style={{ color: "var(--admin-text-body)" }}>5 zamówień</strong> jest jeszcze w&nbsp;przygotowaniu — pojawią się tutaj automatycznie.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

window.PickupFrame = PickupFrame;
