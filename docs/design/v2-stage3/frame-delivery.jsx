/* frame-delivery.jsx
   /admin/delivery — Dostawa (właściciel pizzerii, jedno-osobowa obsługa)
   No couriers, no driver assignment. Two states: "Do zabrania" → "W drodze".
   CTA: Wyjechało (do zabrania → w drodze) / Doręczone (w drodze → done).
   Każda karta pokazuje listę pozycji (zwięzłą).
   Mobile: bez bottom-nav. */

const navUrl = (addr, city) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr}${city ? ", " + city : ""}`)}`;

const ItemList = ({ items, compact = false }) => (
  <div style={{
    marginTop: compact ? 8 : 10,
    paddingTop: compact ? 8 : 10,
    borderTop: "1px dashed var(--admin-divider)",
    display: "flex", flexDirection: "column", gap: 4
  }}>
    {items.map((it, i) => (
      <div key={i} style={{
        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8,
        fontSize: 12, color: "var(--admin-text-body)", lineHeight: 1.4
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--admin-text-primary)" }}>
          {it.qty}×
        </span>
        <span style={{ fontWeight: 500 }}>
          {it.name}
          {it.size && <span style={{ color: "var(--admin-text-muted)" }}> · {it.size}</span>}
          {it.note && <span style={{ color: "var(--status-cancelled)", fontStyle: "italic" }}> · „{it.note}"</span>}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--admin-text-muted)" }}>
          {window.A.zl(it.price)}
        </span>
      </div>
    ))}
  </div>
);

const DeliveryFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false, newCount = 6, mobile = false }) => {
  const f = window.A.fixtures;
  const toCollect = f.toCollect;
  const inTransit = f.outForDelivery;

  if (mobile) {
    return (
      <div className="admin" data-tone={tone} data-density="compact"
        style={{
          width: 375, height: 812, background: "var(--admin-canvas)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          fontFamily: "var(--font-sans)", margin: "0 auto",
          border: "1px solid var(--admin-card-border)", borderRadius: 24,
          boxShadow: "var(--shadow-lg)"
        }}>
        {/* Mobile topbar */}
        <div style={{
          padding: "16px 20px 12px",
          borderBottom: "1px solid var(--admin-divider)",
          background: "var(--admin-card)"
        }}>
          <div style={{ fontSize: 11, color: "var(--admin-text-muted)", letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 600 }}>
            Operacyjne
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 0", letterSpacing: -0.01 }}>
            Dostawa
          </h1>
        </div>

        {/* Tabs */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          padding: "12px 16px",
          background: "var(--admin-card)", gap: 8,
          borderBottom: "1px solid var(--admin-divider)"
        }}>
          <button style={{
            padding: "10px 0", borderRadius: 8, border: "none",
            background: "var(--color-primary)", color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer"
          }}>
            Do zabrania · {toCollect.length}
          </button>
          <button style={{
            padding: "10px 0", borderRadius: 8, border: "1px solid var(--admin-card-border)",
            background: "var(--admin-card)", color: "var(--admin-text-body)",
            fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            W drodze · {inTransit.length}
          </button>
        </div>

        {/* List */}
        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 16, background: "var(--admin-shell)" }}>
          {toCollect.map(o => (
            <div key={o.id} style={{
              background: "var(--admin-card)", borderRadius: 12, padding: 16,
              border: "1px solid var(--admin-card-border)", marginBottom: 12
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--admin-text-muted)" }}>
                  {o.code}
                </span>
                <window.A.StatusPill status="READY" size="sm" />
              </div>
              <div style={{
                fontSize: 20, fontWeight: 800, lineHeight: 1.2,
                color: "var(--admin-text-primary)", letterSpacing: -0.01
              }}>
                {o.address}
              </div>
              <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 4 }}>
                {o.city}{o.addressNote ? ` · ${o.addressNote}` : ""}
              </div>
              <div style={{
                marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--admin-divider)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--admin-text-primary)" }}>
                    {o.customer}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                    {o.paid ? "✓ Opłacone" : "Gotówka"} · {window.A.zl(o.total)}
                  </div>
                </div>
                <a href={navUrl(o.address, o.city)} target="_blank" rel="noopener" style={{
                  width: 40, height: 40, borderRadius: 9999,
                  background: "var(--status-out-tint)", color: "var(--status-out)",
                  display: "grid", placeItems: "center", textDecoration: "none",
                  fontSize: 16, fontWeight: 700
                }} title="Nawiguj">
                  🧭
                </a>
                <a href="tel:" style={{
                  width: 40, height: 40, borderRadius: 9999,
                  background: "var(--status-ready-tint)", color: "var(--status-ready)",
                  display: "grid", placeItems: "center", textDecoration: "none"
                }}>
                  {window.A.Icons.phone}
                </a>
              </div>
              <ItemList items={o.items} compact />
              <button style={{
                width: "100%", height: 44, marginTop: 14,
                borderRadius: 8, border: "none",
                background: "var(--color-primary)", color: "#fff",
                fontSize: 14, fontWeight: 700
              }}>
                Wyjechało →
              </button>
            </div>
          ))}

          {inTransit.map(o => (
            <div key={o.id} style={{
              background: "var(--admin-card)", borderRadius: 12, padding: 16,
              border: "1px solid var(--status-out)", borderLeft: "4px solid var(--status-out)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--admin-text-muted)" }}>
                  {o.code}
                </span>
                <window.A.StatusPill status="OUT_FOR_DELIVERY" size="sm" />
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 18, fontWeight: 800, lineHeight: 1.2,
                    color: "var(--admin-text-primary)", letterSpacing: -0.01
                  }}>
                    {o.address}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 4 }}>
                    {o.customer} · w drodze od {o.since} min
                  </div>
                </div>
                <a href={navUrl(o.address, o.city)} target="_blank" rel="noopener" style={{
                  width: 40, height: 40, borderRadius: 9999,
                  background: "var(--status-out-tint)", color: "var(--status-out)",
                  display: "grid", placeItems: "center", textDecoration: "none",
                  fontSize: 16, fontWeight: 700, flexShrink: 0
                }} title="Nawiguj">
                  🧭
                </a>
              </div>
              <ItemList items={o.items} compact />
              <button style={{
                width: "100%", height: 44, marginTop: 14,
                borderRadius: 8, border: "none",
                background: "var(--status-ready)", color: "#fff",
                fontSize: 14, fontWeight: 700
              }}>
                ✓ Doręczone
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop / tablet — admin dashboard view
  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <window.A.Sidebar active="delivery" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title="Dostawa"
          subtitle={`${toCollect.length} do zabrania · ${inTransit.length} w drodze`}
          breadcrumb="Operacyjne"
          soundOn={soundOn}
          density={density}
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Do zabrania */}
            <window.A.Card style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "var(--admin-text-primary)",
                           display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--status-ready)" }} />
                Do zabrania ({toCollect.length})
              </h3>
              {toCollect.map((o, i) => (
                <div key={o.id} style={{
                  padding: "14px 0",
                  borderBottom: i < toCollect.length - 1 ? "1px solid var(--admin-divider)" : "none"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{o.code}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{window.A.zl(o.total)}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--admin-text-primary)", letterSpacing: -0.005 }}>
                    {o.address}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--admin-text-muted)", marginTop: 4 }}>
                    {o.customer} · {o.paid ? "opłacone" : "gotówka"}
                    {o.addressNote && <span> · {o.addressNote}</span>}
                  </div>
                  <ItemList items={o.items} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={{
                      flex: 1, height: 38, borderRadius: 8, border: "none",
                      background: "var(--color-primary)", color: "#fff",
                      fontSize: 13, fontWeight: 700, cursor: "pointer"
                    }}>
                      Wyjechało →
                    </button>
                    <a href={navUrl(o.address, o.city)} target="_blank" rel="noopener" style={{
                      height: 38, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", color: "var(--status-out)",
                      fontSize: 13, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"
                    }} title="Nawiguj">
                      🧭 Nawiguj
                    </a>
                    <a href="tel:" style={{
                      height: 38, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", color: "var(--status-out)",
                      fontSize: 13, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"
                    }} title="Zadzwoń">
                      {window.A.Icons.phone} Zadzwoń
                    </a>
                    <button style={{
                      height: 38, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", color: "var(--admin-text-body)",
                      fontSize: 13, cursor: "pointer", fontWeight: 600
                    }}>
                      Szczegóły
                    </button>
                  </div>
                </div>
              ))}
            </window.A.Card>

            {/* W drodze */}
            <window.A.Card style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px", color: "var(--admin-text-primary)",
                           display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: "var(--status-out)" }} />
                W drodze ({inTransit.length})
              </h3>
              {inTransit.map(o => (
                <div key={o.id} style={{ padding: "8px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{o.code}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>{window.A.zl(o.total)}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "var(--admin-text-primary)", letterSpacing: -0.005 }}>
                    {o.address}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--admin-text-muted)", marginTop: 4 }}>
                    {o.customer} · {o.city} · w drodze od {o.since} min
                  </div>
                  <ItemList items={o.items} />
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button style={{
                      flex: 1, height: 38, borderRadius: 8, border: "none",
                      background: "var(--status-ready)", color: "#fff",
                      fontSize: 13, fontWeight: 700, cursor: "pointer"
                    }}>
                      ✓ Doręczone
                    </button>
                    <a href={navUrl(o.address, o.city)} target="_blank" rel="noopener" style={{
                      height: 38, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", color: "var(--status-out)",
                      fontSize: 13, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"
                    }} title="Nawiguj">
                      🧭 Nawiguj
                    </a>
                    <a href="tel:" style={{
                      height: 38, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", color: "var(--status-out)",
                      fontSize: 13, fontWeight: 600,
                      display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none"
                    }}>
                      {window.A.Icons.phone} Zadzwoń
                    </a>
                  </div>
                </div>
              ))}
            </window.A.Card>
          </div>
        </div>
      </main>
    </div>
  );
};

window.DeliveryFrame = DeliveryFrame;
