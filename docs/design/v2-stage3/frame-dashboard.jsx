/* frame-dashboard.jsx
   /admin — Pulpit
   First impression po loginie. Dziś · 4 KPI + 2 wykresy + top 5 produktów + 5 status tiles. */

const KPI = ({ label, value, hint, delta, deltaPositive = true }) => (
  <window.A.Card style={{ padding: 18 }}>
    <div className="t-kicker" style={{ color: "var(--admin-text-muted)", marginBottom: 10 }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 30, fontWeight: 600, letterSpacing: -0.01, color: "var(--admin-text-primary)" }}>
        {value}
      </span>
      {delta && (
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: deltaPositive ? "var(--status-ready)" : "var(--status-cancelled)",
          background: deltaPositive ? "var(--status-ready-tint)" : "var(--status-cancelled-tint)",
          padding: "2px 8px", borderRadius: 4
        }}>
          {deltaPositive ? "↑" : "↓"} {delta}
        </span>
      )}
    </div>
    {hint && <div style={{ fontSize: 12, color: "var(--admin-text-faint)", marginTop: 6 }}>{hint}</div>}
  </window.A.Card>
);

const StatusTile = ({ status, count, accent }) => {
  const s = window.A.STATUS[status];
  return (
    <window.A.Card style={{ padding: 16, borderLeft: `3px solid ${s.color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: 9999, background: s.color }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--admin-text-body)" }}>{s.label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 600, color: "var(--admin-text-primary)" }}>
        {count}
      </div>
    </window.A.Card>
  );
};

const TopProductRow = ({ rank, name, qty, revenue, share }) => (
  <div style={{
    display: "grid",
    gridTemplateColumns: "32px 1fr 80px 90px 60px",
    alignItems: "center", gap: 12,
    padding: "12px 4px",
    borderBottom: "1px solid var(--admin-divider)"
  }}>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--admin-text-faint)" }}>
      {String(rank).padStart(2, "0")}
    </span>
    <span style={{ fontSize: 14, fontWeight: 500, color: "var(--admin-text-primary)" }}>
      {name}
    </span>
    <span style={{ fontSize: 13, color: "var(--admin-text-muted)", textAlign: "right" }}>
      {qty} szt.
    </span>
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, textAlign: "right" }}>
      {window.A.zl(revenue)}
    </span>
    <div style={{ width: "100%", height: 6, background: "var(--admin-divider)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${share}%`, height: "100%", background: "var(--color-primary)" }} />
    </div>
  </div>
);

const ChartPlaceholder = ({ title, subtitle, area = false }) => (
  <window.A.Card style={{ padding: 20 }}>
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>{title}</h3>
      <span style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>Ostatnie 7 dni</span>
    </div>
    {subtitle && (
      <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginBottom: 14 }}>{subtitle}</div>
    )}
    <div className="ph-chart" style={{ height: 160, position: "relative" }}>
      {/* fake bars / area */}
      {area ? (
        <svg viewBox="0 0 400 160" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="ar1" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(230,57,70,0.35)" />
              <stop offset="100%" stopColor="rgba(230,57,70,0)" />
            </linearGradient>
          </defs>
          <path d="M 0 130 L 50 90 L 100 110 L 150 60 L 200 80 L 250 40 L 300 70 L 350 30 L 400 50 L 400 160 L 0 160 Z"
            fill="url(#ar1)" />
          <path d="M 0 130 L 50 90 L 100 110 L 150 60 L 200 80 L 250 40 L 300 70 L 350 30 L 400 50"
            fill="none" stroke="var(--color-primary)" strokeWidth="2" />
        </svg>
      ) : (
        <div style={{ position: "absolute", inset: 8, display: "flex", alignItems: "flex-end", gap: 8 }}>
          {[60, 95, 70, 110, 85, 130, 145].map((h, i) => (
            <div key={i} style={{
              flex: 1, height: h, background: "var(--color-primary)",
              opacity: 0.85 - i * 0.04, borderRadius: "2px 2px 0 0"
            }} />
          ))}
        </div>
      )}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
      {["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].map(d => (
        <span key={d} style={{ fontSize: 11, color: "var(--admin-text-faint)", flex: 1, textAlign: "center" }}>{d}</span>
      ))}
    </div>
  </window.A.Card>
);

const DashboardFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false, newCount = 6 }) => (
  <div className="admin" data-tone={tone} data-density={density}
    style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
    <window.A.Sidebar active="dashboard" newCount={newCount} density={density} />
    <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
      <window.A.Topbar
        title="Pulpit"
        subtitle="Piątek · 8 maja 2026"
        breadcrumb="Dziś"
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
              {window.A.Icons.refresh} Odśwież
            </button>
          </>
        }
      />
      {manualClose && <window.A.ManualCloseBanner />}

      <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
          <KPI label="Zamówienia dziś" value="42" delta="+18%" deltaPositive hint="vs. wczoraj o tej porze" />
          <KPI label="Sprzedaż dziś" value="3 184 zł" delta="+12%" deltaPositive hint="śr. wartość 75,80 zł" />
          <KPI label="Czas przygotowania" value="14 min" delta="-2 min" deltaPositive hint="cel: 18 min" />
          <KPI label="Anulowane (24h)" value="2" delta="-50%" deltaPositive hint="0,8% wszystkich zamówień" />
        </div>

        {/* Status tiles row */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--admin-text-primary)", margin: "0 0 12px" }}>
            Aktualnie w&nbsp;systemie
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            <StatusTile status="NEW" count={3} />
            <StatusTile status="CONFIRMED" count={4} />
            <StatusTile status="IN_PREPARATION" count={5} />
            <StatusTile status="READY" count={2} />
            <StatusTile status="OUT_FOR_DELIVERY" count={1} />
          </div>
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 16, marginBottom: 20 }}>
          <ChartPlaceholder
            title="Sprzedaż w&nbsp;tym tygodniu"
            subtitle="Suma: 18 942 zł"
            area
          />
          <ChartPlaceholder
            title="Zamówienia per dzień"
            subtitle="Średnio 38 dziennie"
          />
        </div>

        {/* Top 5 products */}
        <window.A.Card style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--admin-text-primary)" }}>
              Top produkty (7 dni)
            </h3>
            <a href="#" style={{ fontSize: 12, color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>
              Pełen raport →
            </a>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "32px 1fr 80px 90px 60px",
            gap: 12, padding: "0 4px 8px", borderBottom: "1px solid var(--admin-divider)",
            fontSize: 11, color: "var(--admin-text-faint)", letterSpacing: 0.04, textTransform: "uppercase",
            fontWeight: 600
          }}>
            <span>#</span>
            <span>Produkt</span>
            <span style={{ textAlign: "right" }}>Sztuk</span>
            <span style={{ textAlign: "right" }}>Sprzedaż</span>
            <span>Udział</span>
          </div>
          <TopProductRow rank={1} name="Margherita 32 cm" qty={184} revenue={5888} share={92} />
          <TopProductRow rank={2} name="Capricciosa 32 cm" qty={142} revenue={5396} share={84} />
          <TopProductRow rank={3} name="Diavola 40 cm" qty={98} revenue={4802} share={75} />
          <TopProductRow rank={4} name="Hawajska 40 cm" qty={76} revenue={3724} share={58} />
          <TopProductRow rank={5} name="Coca-Cola 0,5 L" qty={245} revenue={2425} share={38} />
        </window.A.Card>
      </div>
    </main>
  </div>
);

window.DashboardFrame = DashboardFrame;
