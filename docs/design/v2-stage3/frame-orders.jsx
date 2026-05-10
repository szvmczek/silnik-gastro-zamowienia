/* frame-orders.jsx
   /admin/orders — Wszystkie zamówienia
   Desktop: tabela + filtry + saved views.
   Plus: itemNote ikona w wierszu, green flash variant pokazujący 'just landed'. */

const StatusFilterChip = ({ status, count, active = false }) => {
  const s = status === "ALL"
    ? { label: "Wszystkie", color: "var(--admin-text-primary)" }
    : window.A.STATUS[status];
  return (
    <button style={{
      padding: "6px 12px", borderRadius: 9999,
      border: `1px solid ${active ? "var(--admin-text-primary)" : "var(--admin-card-border)"}`,
      background: active ? "var(--admin-text-primary)" : "var(--admin-card)",
      color: active ? "#fff" : "var(--admin-text-body)",
      fontSize: 13, fontWeight: 500, cursor: "pointer",
      display: "inline-flex", alignItems: "center", gap: 8
    }}>
      {status !== "ALL" && (
        <span style={{ width: 6, height: 6, borderRadius: 9999, background: s.color }} />
      )}
      {s.label}
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 11,
        opacity: active ? 0.85 : 1,
        color: active ? "#fff" : "var(--admin-text-muted)",
        fontWeight: 600
      }}>
        {count}
      </span>
    </button>
  );
};

const OrdersFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false,
                       newCount = 6, highlightNote = true, flashNew = false }) => {
  const rows = [
    { code: "#1042", customer: "Jan Kowalski",        phone: "+48 600 100 200", time: "16:42", status: "NEW",            type: "DELIVERY", total: 89.80,  hasNote: true,  flash: flashNew },
    { code: "#1041", customer: "Marta Wiśniewska",    phone: "+48 502 333 121", time: "16:41", status: "NEW",            type: "PICKUP",   total: 64.00,  hasNote: false },
    { code: "#1040", customer: "Tomasz Lewandowski",  phone: "+48 793 887 220", time: "16:39", status: "CONFIRMED",      type: "DELIVERY", total: 124.50, hasNote: true },
    { code: "#1039", customer: "Anna Krawczyk",       phone: "+48 605 220 117", time: "16:34", status: "IN_PREPARATION", type: "DELIVERY", total: 78.00,  hasNote: false },
    { code: "#1038", customer: "Krzysztof Mazur",     phone: "+48 502 991 003", time: "16:31", status: "IN_PREPARATION", type: "PICKUP",   total: 54.00,  hasNote: true },
    { code: "#1037", customer: "Ewa Dąbrowska",       phone: "+48 502 110 887", time: "16:28", status: "READY",          type: "PICKUP",   total: 64.00,  hasNote: false },
    { code: "#1036", customer: "Marcin Wójcik",       phone: "+48 600 778 102", time: "16:26", status: "READY",          type: "PICKUP",   total: 92.00,  hasNote: false },
    { code: "#1035", customer: "Aleksandra Zielińska",phone: "+48 600 110 220", time: "16:22", status: "OUT_FOR_DELIVERY", type: "DELIVERY", total: 112.50, hasNote: false },
    { code: "#1034", customer: "Bartosz Krupa",       phone: "+48 502 778 992", time: "16:18", status: "DELIVERED",      type: "DELIVERY", total: 48.00,  hasNote: false },
    { code: "#1033", customer: "Joanna Pawlak",       phone: "+48 605 008 119", time: "16:11", status: "DELIVERED",      type: "PICKUP",   total: 78.50,  hasNote: false },
    { code: "#1032", customer: "Robert Sikora",       phone: "+48 793 442 800", time: "15:58", status: "CANCELED",       type: "DELIVERY", total: 65.00,  hasNote: false }
  ];

  const COLS = "82px 1fr 140px 130px 100px 90px 44px 70px 110px";

  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <window.A.Sidebar active="orders" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title="Wszystkie zamówienia"
          subtitle="Dziś: 42 zamówienia · 3 184 zł"
          breadcrumb="Archiwum"
          soundOn={soundOn}
          density={density}
          actions={
            <>
              <button style={{
                height: 36, padding: "0 14px", borderRadius: 8,
                border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                fontSize: 13, fontWeight: 500, color: "var(--admin-text-body)", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6
              }}>
                {window.A.Icons.printer} Eksport CSV
              </button>
            </>
          }
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Filters bar */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <StatusFilterChip status="ALL" count={42} active />
            <StatusFilterChip status="NEW" count={3} />
            <StatusFilterChip status="CONFIRMED" count={4} />
            <StatusFilterChip status="IN_PREPARATION" count={5} />
            <StatusFilterChip status="READY" count={2} />
            <StatusFilterChip status="OUT_FOR_DELIVERY" count={1} />
            <StatusFilterChip status="DELIVERED" count={26} />
            <StatusFilterChip status="CANCELED" count={1} />
          </div>

          {/* Search + date */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 200px", gap: 12, marginBottom: 16 }}>
            <div style={{
              position: "relative",
              background: "var(--admin-card)", border: "1px solid var(--admin-card-border)",
              borderRadius: 8, height: 38
            }}>
              <span style={{ position: "absolute", left: 12, top: 9, color: "var(--admin-text-faint)" }}>
                {window.A.Icons.search}
              </span>
              <input
                type="text"
                placeholder="Szukaj po numerze, kliencie, telefonie…"
                style={{
                  width: "100%", height: "100%", border: "none", background: "transparent",
                  outline: "none", padding: "0 14px 0 40px", fontSize: 14,
                  boxSizing: "border-box"
                }}
              />
            </div>
            <select style={{
              height: 38, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
              fontSize: 14, color: "var(--admin-text-body)"
            }}>
              <option>Dziś</option>
              <option>Ostatnie 7 dni</option>
              <option>Ten miesiąc</option>
              <option>Wybierz zakres…</option>
            </select>
            <select style={{
              height: 38, padding: "0 12px", borderRadius: 8,
              border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
              fontSize: 14, color: "var(--admin-text-body)"
            }}>
              <option>Wszystkie typy</option>
              <option>Dostawa</option>
              <option>Odbiór osobisty</option>
            </select>
          </div>

          {/* Table */}
          <div style={{
            background: "var(--admin-card)",
            border: "1px solid var(--admin-card-border)",
            borderRadius: 10, overflow: "hidden"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: COLS,
              gap: 12, padding: "12px 16px",
              background: "var(--admin-row-hover)",
              borderBottom: "1px solid var(--admin-divider)",
              fontSize: 11, color: "var(--admin-text-muted)",
              letterSpacing: 0.04, textTransform: "uppercase", fontWeight: 700
            }}>
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
            {rows.map((r, i) => (
              <div key={r.code}
                className={r.flash ? "flash-green" : ""}
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  gap: 12, padding: "14px 16px",
                  borderBottom: i < rows.length - 1 ? "1px solid var(--admin-divider)" : "none",
                  alignItems: "center"
                }}>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                  color: "var(--admin-text-primary)"
                }}>{r.code}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--admin-text-primary)" }}>
                  {r.customer}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  color: "var(--admin-text-body)", fontWeight: 600
                }}>
                  {r.phone}
                </span>
                <window.A.StatusPill status={r.status} size="sm" />
                <span style={{ fontSize: 13, color: "var(--admin-text-body)" }}>
                  {r.type === "DELIVERY" ? "Dostawa" : "Odbiór"}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                  color: "var(--admin-text-primary)", textAlign: "right"
                }}>
                  {window.A.zl(r.total)}
                </span>
                <span style={{ display: "inline-flex", justifyContent: "center" }}>
                  {r.hasNote && (
                    <span title="Zawiera notkę klienta" style={{
                      width: 22, height: 22, borderRadius: 5,
                      background: highlightNote ? "#FEF3C7" : "var(--admin-row-hover)",
                      color: highlightNote ? "#B45309" : "var(--admin-text-muted)",
                      display: "grid", placeItems: "center"
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3 2 21h20z"/><path d="M12 10v5"/><path d="M12 18h.01"/>
                      </svg>
                    </span>
                  )}
                </span>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 12,
                  color: "var(--admin-text-muted)", fontWeight: 600
                }}>
                  {r.time}
                </span>
                <button style={{
                  height: 32, padding: "0 12px", borderRadius: 6,
                  border: "1px solid var(--admin-card-border)",
                  background: "var(--admin-card)",
                  color: "var(--admin-text-primary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer"
                }}>
                  Szczegóły →
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 16, fontSize: 13, color: "var(--admin-text-muted)"
          }}>
            <span>Pokazano <strong style={{ color: "var(--admin-text-body)" }}>1–11</strong> z 42</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                color: "var(--admin-text-faint)", cursor: "not-allowed"
              }}>‹</button>
              <button style={{
                width: 32, height: 32, borderRadius: 6, border: "none",
                background: "var(--admin-text-primary)", color: "#fff", fontWeight: 600
              }}>1</button>
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                border: "1px solid var(--admin-card-border)", background: "var(--admin-card)"
              }}>2</button>
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                border: "1px solid var(--admin-card-border)", background: "var(--admin-card)"
              }}>3</button>
              <button style={{
                width: 32, height: 32, borderRadius: 6,
                border: "1px solid var(--admin-card-border)", background: "var(--admin-card)"
              }}>›</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

window.OrdersFrame = OrdersFrame;
