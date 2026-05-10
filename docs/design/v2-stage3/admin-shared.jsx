/* admin-shared.jsx
   Shared admin primitives: icons, chrome (sidebar + topbar), status pill,
   sample fixtures, and a couple of small layout helpers used across frames.
   All exposed via window.A so other frame files can pluck what they need. */

const A = {};

/* ───────── Icons (24px stroke=1.6) ───────── */
const Icon = ({ d, size = 18, stroke = 1.7, fill = "none", style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
A.Icon = Icon;

A.Icons = {
  dashboard: <Icon d={["M3 13h8V3H3z","M13 21h8V11h-8z","M3 21h8v-6H3z","M13 9h8V3h-8z"]} />,
  kitchen:   <Icon d={["M6 3v4M10 3v4M14 3v4M18 3v4","M4 7h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z","M9 15v6","M15 15v6"]} />,
  pickup:    <Icon d={["M4 7h16l-1.5 11a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z","M9 7V5a3 3 0 0 1 6 0v2"]} />,
  delivery:  <Icon d={["M3 7h11v9H3z","M14 11h4l3 4v1h-7z","M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z","M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />,
  list:      <Icon d={["M4 6h16","M4 12h16","M4 18h10"]} />,
  menu:      <Icon d={["M4 5h16","M4 12h16","M4 19h16"]} />,
  shop:      <Icon d={["M3 9 5 4h14l2 5","M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9","M3 9h18","M9 14h6"]} />,
  zones:     <Icon d={["M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z","M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />,
  cog:       <Icon d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"]} />,
  bell:      <Icon d={["M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z","M10 21a2 2 0 0 0 4 0"]} />,
  bellOff:   <Icon d={["M3 3l18 18","M9 4.5A6 6 0 0 1 18 8c0 3 .55 5 1.3 6.3","M5.7 10A6 6 0 0 0 6 12c0 5-3 5-3 5h13","M10 21a2 2 0 0 0 4 0"]} />,
  search:    <Icon d={["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z","M21 21l-4.3-4.3"]} />,
  chevronR:  <Icon d="M9 6l6 6-6 6" />,
  chevronD:  <Icon d="M6 9l6 6 6-6" />,
  chevronL:  <Icon d="M15 6l-6 6 6 6" />,
  plus:      <Icon d={["M12 5v14","M5 12h14"]} />,
  minus:     <Icon d="M5 12h14" />,
  check:     <Icon d="M4 12l5 5 11-12" />,
  x:         <Icon d={["M5 5l14 14","M19 5L5 19"]} />,
  edit:      <Icon d={["M4 20h4l11-11-4-4L4 16z","M14 5l5 5"]} />,
  trash:     <Icon d={["M4 7h16","M9 7V4h6v3","M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7","M10 11v7","M14 11v7"]} />,
  drag:      <Icon d={["M9 4h.01M15 4h.01M9 12h.01M15 12h.01M9 20h.01M15 20h.01"]} stroke={2.4} />,
  user:      <Icon d={["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M4 21a8 8 0 0 1 16 0"]} />,
  pin:       <Icon d={["M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z","M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />,
  phone:     <Icon d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" />,
  clock:     <Icon d={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z","M12 7v5l3 2"]} />,
  note:      <Icon d={["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z","M14 3v5h5","M9 13h6","M9 17h4"]} />,
  noteFill:  <Icon d={["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z","M14 3v5h5"]} />,
  motorbike: <Icon d={["M5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M8 16l4-9h4l3 3h2","M9 7h4"]} />,
  flame:     <Icon d="M12 22a7 7 0 0 0 7-7c0-4-3-6-3-10-2 1-4 3-4 6-1-1-1-2-1-4-3 2-6 5-6 9a7 7 0 0 0 7 6z" />,
  sparkle:   <Icon d={["M12 3v4","M12 17v4","M3 12h4","M17 12h4","M5.6 5.6l2.8 2.8","M15.6 15.6l2.8 2.8","M5.6 18.4l2.8-2.8","M15.6 8.4l2.8-2.8"]} />,
  warning:   <Icon d={["M12 3 2 21h20z","M12 10v5","M12 18h.01"]} />,
  signal:    <Icon d={["M5 12a7 7 0 0 1 14 0","M9 12a3 3 0 0 1 6 0","M12 12h.01"]} />,
  trend:     <Icon d={["M3 17l6-6 4 4 8-8","M14 7h7v7"]} />,
  banknote:  <Icon d={["M3 6h18v12H3z","M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M6 9h.01","M18 15h.01"]} />,
  printer:   <Icon d={["M6 9V3h12v6","M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2","M6 14h12v8H6z"]} />,
  refresh:   <Icon d={["M21 12a9 9 0 1 1-3-6.7L21 8","M21 3v5h-5"]} />,
  external:  <Icon d={["M14 4h6v6","M10 14L21 3","M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6"]} />
};

/* ───────── Status (frozen Faza 4.5) ───────── */
A.STATUS = {
  NEW:           { label: "Nowe",           color: "var(--status-new)",       tint: "var(--status-new-tint)" },
  CONFIRMED:     { label: "Potwierdzone",   color: "var(--status-confirmed)", tint: "var(--status-confirmed-tint)" },
  IN_PREPARATION:{ label: "W przygotowaniu",color: "var(--status-prep)",      tint: "var(--status-prep-tint)" },
  READY:         { label: "Gotowe",         color: "var(--status-ready)",     tint: "var(--status-ready-tint)" },
  OUT_FOR_DELIVERY:{ label: "W dostawie",   color: "var(--status-out)",       tint: "var(--status-out-tint)" },
  DELIVERED:     { label: "Dostarczone",    color: "var(--status-delivered)", tint: "var(--status-delivered-tint)" },
  CANCELED:      { label: "Anulowane",      color: "var(--status-cancelled)", tint: "var(--status-cancelled-tint)" }
};

A.StatusPill = ({ status, size = "md" }) => {
  const s = A.STATUS[status] || A.STATUS.NEW;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 13 : 12;
  return (
    <span className="pill" style={{ background: s.tint, color: s.color, fontSize }}>
      <span className="dot" />
      {s.label}
    </span>
  );
};

/* ───────── Currency / time helpers ───────── */
A.zl = n => `${n.toFixed(2).replace(".", ",")} zł`;
A.minAgo = m => m === 0 ? "teraz" : m === 1 ? "1 min temu" : `${m} min temu`;

/* ───────── Sidebar ───────── */
A.Sidebar = ({ active = "kitchen", newCount = 3, manualClose = false, collapsed = false, density = "comfortable" }) => {
  const sections = [
    {
      title: "Operacyjne",
      items: [
        { id: "dashboard", icon: A.Icons.dashboard, label: "Pulpit",   to: "/admin" },
        { id: "kitchen",   icon: A.Icons.kitchen,   label: "Kuchnia",  to: "/admin/kitchen" },
        { id: "pickup",    icon: A.Icons.pickup,    label: "Wydanie",  to: "/admin/pickup" },
        { id: "delivery",  icon: A.Icons.delivery,  label: "Dostawa",  to: "/admin/delivery" }
      ]
    },
    {
      title: "Archiwum",
      items: [
        { id: "orders", icon: A.Icons.list, label: "Wszystkie zamówienia", to: "/admin/orders", badge: newCount }
      ]
    },
    {
      title: "Konfiguracja",
      items: [
        { id: "menu",     icon: A.Icons.menu,  label: "Menu",            to: "/admin/menu" },
        { id: "shop",     icon: A.Icons.shop,  label: "Restauracja",     to: "/admin/shop" },
        { id: "zones",    icon: A.Icons.zones, label: "Strefy dostawy",  to: "/admin/zones" },
        { id: "settings", icon: A.Icons.cog,   label: "Ustawienia",      to: "/admin/settings" }
      ]
    }
  ];

  const itemPad = density === "compact" ? "8px 12px" : "10px 12px";

  return (
    <aside
      className="scrollbox"
      style={{
        width: collapsed ? 72 : 248,
        flexShrink: 0,
        background: "var(--admin-shell)",
        borderRight: "1px solid var(--admin-shell-border)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "auto"
      }}>
      {/* Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "18px 18px 14px",
        borderBottom: "1px solid var(--admin-shell-border)"
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: "var(--color-primary)",
          color: "#fff", display: "grid", placeItems: "center",
          fontFamily: "ui-serif, Georgia, serif", fontWeight: 700, fontSize: 18
        }}>
          P
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.01 }}>Pizza Demo</div>
            <div style={{ fontSize: 11, color: "var(--admin-text-muted)", letterSpacing: 0.04, textTransform: "uppercase" }}>
              Panel admina
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {sections.map((sec, i) => (
          <div key={sec.title} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div style={{
                fontSize: 11, fontWeight: 600, letterSpacing: 0.08,
                textTransform: "uppercase", color: "var(--admin-text-faint)",
                padding: "6px 12px 6px"
              }}>
                {sec.title}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sec.items.map(it => {
                const isActive = active === it.id;
                return (
                  <a
                    key={it.id}
                    href="#"
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: itemPad,
                      borderRadius: 8,
                      textDecoration: "none",
                      fontSize: 14, fontWeight: 500,
                      color: isActive ? "var(--admin-nav-active-text)" : "var(--admin-text-body)",
                      background: isActive ? "var(--admin-nav-active-bg)" : "transparent",
                      position: "relative"
                    }}
                  >
                    <span style={{
                      display: "inline-flex",
                      color: isActive ? "var(--admin-nav-active-text)" : "var(--admin-text-muted)"
                    }}>
                      {it.icon}
                    </span>
                    {!collapsed && <span style={{ flex: 1 }}>{it.label}</span>}
                    {!collapsed && it.badge ? (
                      <span style={{
                        background: "var(--color-primary)",
                        color: "#fff",
                        fontSize: 11, fontWeight: 700,
                        minWidth: 20, height: 20,
                        borderRadius: 9999, padding: "0 6px",
                        display: "inline-flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {it.badge}
                      </span>
                    ) : null}
                    {collapsed && it.badge ? (
                      <span style={{
                        position: "absolute", top: 4, right: 6,
                        width: 8, height: 8, borderRadius: 9999, background: "var(--color-primary)"
                      }} />
                    ) : null}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        padding: 12,
        borderTop: "1px solid var(--admin-shell-border)",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <div className="avatar" style={{ width: 32, height: 32, background: "#1A1A1A", color: "#FAFAF8", fontSize: 12 }}>
          KN
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Kasia Nowak</div>
            <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>admin@pizzademo.pl</div>
          </div>
        )}
        {!collapsed && (
          <button title="Wyloguj" style={{
            border: "1px solid var(--admin-card-border)",
            background: "var(--admin-card)",
            borderRadius: 6,
            padding: 6, color: "var(--admin-text-muted)", cursor: "pointer"
          }}>
            <Icon d={["M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4","M10 17l5-5-5-5","M15 12H3"]} size={14} />
          </button>
        )}
      </div>
    </aside>
  );
};

/* ───────── Topbar ───────── */
A.Topbar = ({ title, subtitle, breadcrumb, actions, soundOn = true, density = "comfortable" }) => (
  <header style={{
    height: density === "compact" ? 56 : 68,
    display: "flex", alignItems: "center",
    padding: "0 24px",
    borderBottom: "1px solid var(--admin-divider)",
    background: "var(--admin-card)",
    flexShrink: 0
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      {breadcrumb && (
        <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginBottom: 2 }}>
          {breadcrumb}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h1 style={{
          margin: 0, fontSize: density === "compact" ? 18 : 22,
          fontWeight: 700, letterSpacing: -0.01,
          color: "var(--admin-text-primary)"
        }}>
          {title}
        </h1>
        {subtitle && (
          <span style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>{subtitle}</span>
        )}
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {actions}
      <button
        title={soundOn ? "Wycisz" : "Włącz dźwięk"}
        style={{
          width: 36, height: 36, borderRadius: 8,
          border: "1px solid var(--admin-card-border)",
          background: soundOn ? "var(--admin-card)" : "#FCEEEF",
          color: soundOn ? "var(--admin-text-body)" : "var(--color-primary)",
          display: "grid", placeItems: "center", cursor: "pointer"
        }}>
        {soundOn ? A.Icons.bell : A.Icons.bellOff}
      </button>
    </div>
  </header>
);

/* ───────── ManualCloseBanner ───────── */
A.ManualCloseBanner = ({ reason = "Awaria pieca — wracamy o 18:00", until = "do 18:00" }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 24px",
    background: "linear-gradient(180deg, #FEE2E2, #FCA5A5)",
    borderBottom: "1px solid #DC2626",
    color: "#7F1D1D"
  }}>
    <span style={{ display: "inline-flex", color: "#B91C1C" }}>{A.Icons.warning}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>
        Restauracja jest tymczasowo zamknięta
      </div>
      <div style={{ fontSize: 13, color: "#991B1B" }}>
        {reason} · {until}
      </div>
    </div>
    <button style={{
      background: "#FFFFFF", color: "#991B1B", border: "1px solid #B91C1C",
      borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer"
    }}>
      Wznów przyjmowanie zamówień
    </button>
  </div>
);

/* ───────── Toast (live updates demo) ───────── */
A.Toast = ({ visible = true, title = "Nowe zamówienie #1042", subtitle = "Jan Kowalski · 89,80 zł" }) => visible && (
  <div style={{
    position: "absolute", bottom: 24, right: 24,
    background: "var(--color-bg-dark)", color: "var(--color-text-on-dark)",
    padding: "12px 16px", borderRadius: 10,
    minWidth: 280,
    boxShadow: "var(--shadow-lg)",
    display: "flex", gap: 12, alignItems: "center"
  }}>
    <span style={{
      width: 32, height: 32, borderRadius: 8,
      background: "var(--status-new)", color: "#1A1A1A",
      display: "grid", placeItems: "center"
    }}>
      {A.Icons.bell}
    </span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#CFCFC9", marginTop: 2 }}>{subtitle}</div>
    </div>
  </div>
);

/* ───────── Card primitive (admin) ───────── */
A.Card = ({ children, style = {}, hover = false, accent = null, urgent = false, flash = false }) => {
  const accentStyle = accent
    ? { borderLeft: `4px solid ${accent}` }
    : {};
  return (
    <div
      className={[
        "admin-card",
        urgent ? "pulse-new" : "",
        flash ? "flash-green" : ""
      ].join(" ")}
      style={{
        background: "var(--admin-card)",
        border: "1px solid var(--admin-card-border)",
        borderRadius: "var(--admin-radius-card)",
        padding: "var(--admin-card-pad, 18px)",
        transition: "border-color 180ms",
        ...accentStyle,
        ...style
      }}>
      {children}
    </div>
  );
};

/* ───────── Fixtures ───────── */
A.fixtures = {
  newOrders: [
    { id: 1042, code: "#1042", customer: "Jan Kowalski",  total: 89.80, time: 0, type: "DELIVERY", phone: "+48 600 100 200", eta: null,
      address: "ul. Krakowska 12/4, Kraków",
      items: [
        { qty: 1, name: "Margherita", size: "32 cm", note: "Bez bazylii proszę", price: 32.00 },
        { qty: 1, name: "Capricciosa", size: "32 cm", note: null, price: 38.00 },
        { qty: 2, name: "Coca-Cola 0,5 L", size: null, note: null, price: 9.90 }
      ]
    },
    { id: 1041, code: "#1041", customer: "Marta Wiśniewska", total: 64.00, time: 1, type: "PICKUP",   phone: "+48 502 333 121", eta: null,
      address: null,
      items: [
        { qty: 1, name: "Hawajska", size: "40 cm", note: null, price: 49.00 },
        { qty: 1, name: "Quattro Formaggi", size: "32 cm", note: "Cienkie ciasto", price: 42.00 }
      ]
    },
    { id: 1040, code: "#1040", customer: "Tomasz Lewandowski", total: 124.50, time: 3, type: "DELIVERY", phone: "+48 793 887 220", eta: "19:50",
      address: "ul. Zwierzyniecka 7/22, Kraków",
      items: [
        { qty: 2, name: "Diavola", size: "40 cm", note: "Ekstra ostro", price: 49.00 },
        { qty: 1, name: "Zapiekanka klasyczna", size: null, note: null, price: 18.00 },
        { qty: 1, name: "Frytki belgijskie", size: null, note: null, price: 12.00 }
      ]
    }
  ],
  inPrep: [
    { id: 1039, code: "#1039", customer: "Anna Krawczyk",  total: 78.00, time: 8,  type: "DELIVERY", since: 4, eta: "19:35",
      items: [
        { qty: 1, name: "Margherita", size: "32 cm", note: null, price: 32.00 },
        { qty: 1, name: "Frytki belgijskie", size: null, note: "Bez soli", price: 12.00 },
        { qty: 2, name: "Coca-Cola 0,5 L", size: null, note: null, price: 9.90 }
      ]
    },
    { id: 1038, code: "#1038", customer: "Krzysztof Mazur", total: 54.00, time: 11, type: "PICKUP",   since: 7, eta: "19:30",
      items: [
        { qty: 1, name: "Kurczak w cieście", size: null, note: null, price: 32.00 },
        { qty: 1, name: "Frytki", size: null, note: null, price: 12.00 },
        { qty: 1, name: "Cola 0.5L", size: null, note: null, price: 9.90 }
      ]
    }
  ],
  confirmed: [
    { id: 1043, code: "#1043", customer: "Paulina Zięba", total: 56.00, time: 2, type: "PICKUP", phone: "+48 600 887 110", eta: "19:45",
      items: [
        { qty: 1, name: "Capricciosa", size: "32 cm", note: null, price: 38.00 },
        { qty: 2, name: "Coca-Cola 0,5 L", size: null, note: null, price: 9.90 }
      ]
    }
  ],
  ready: [
    { id: 1037, code: "#1037", customer: "Ewa Dąbrowska",  total: 64.00, time: 14, type: "PICKUP",   slot: "16:30" },
    { id: 1036, code: "#1036", customer: "Marcin Wójcik",  total: 92.00, time: 16, type: "PICKUP",   slot: "16:45" }
  ],
  outForDelivery: [
    { id: 1035, code: "#1035", customer: "Aleksandra Zielińska",
      address: "ul. Karmelicka 28/9", city: "Kraków",
      phone: "+48 600 110 220",
      total: 112.50, since: 12,
      items: [
        { qty: 1, name: "Diavola", size: "40 cm", note: null, price: 49.00 },
        { qty: 1, name: "Margherita", size: "32 cm", note: null, price: 32.00 },
        { qty: 2, name: "Coca-Cola 0,5 L", size: null, note: null, price: 9.90 }
      ],
      paid: true
    },
    { id: 1033, code: "#1033", customer: "Piotr Nowicki",
      address: "ul. Floriańska 14/2", city: "Kraków",
      phone: "+48 793 552 110",
      total: 67.00, since: 22,
      items: [
        { qty: 1, name: "Capricciosa", size: "40 cm", note: null, price: 49.00 },
        { qty: 1, name: "Frytki belgijskie", size: null, note: null, price: 12.00 }
      ],
      paid: true
    }
  ],
  toCollect: [
    { id: 1034, code: "#1034", customer: "Bartosz Krupa",
      address: "ul. Długa 41, m. 3", city: "Kraków",
      phone: "+48 502 778 992",
      total: 48.00, since: 2,
      addressNote: "Domofon 12, drugie piętro",
      items: [
        { qty: 1, name: "Kurczak w cieście", size: null, note: "Bez ostrego sosu", price: 32.00 },
        { qty: 1, name: "Frytki", size: null, note: null, price: 12.00 },
        { qty: 1, name: "Cola 0.5L", size: null, note: null, price: 9.90 }
      ],
      paid: false
    },
    { id: 1032, code: "#1032", customer: "Magdalena Sosnowska",
      address: "ul. Starowiślna 67/8", city: "Kraków",
      phone: "+48 604 221 887",
      total: 89.80, since: 4,
      items: [
        { qty: 1, name: "Margherita", size: "32 cm", note: null, price: 32.00 },
        { qty: 1, name: "Capricciosa", size: "32 cm", note: null, price: 38.00 },
        { qty: 2, name: "Coca-Cola 0,5 L", size: null, note: null, price: 9.90 }
      ],
      paid: true
    },
    { id: 1031, code: "#1031", customer: "Łukasz Pawelec",
      address: "al. Słowackiego 22/41", city: "Kraków",
      phone: "+48 698 334 002",
      total: 134.00, since: 1,
      addressNote: "Wejście od podwórka",
      items: [
        { qty: 2, name: "Diavola", size: "40 cm", note: "Ekstra ostro", price: 49.00 },
        { qty: 1, name: "Quattro Formaggi", size: "32 cm", note: null, price: 42.00 }
      ],
      paid: false
    }
  ]
};

window.A = A;
