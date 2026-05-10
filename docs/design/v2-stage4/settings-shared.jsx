/* settings-shared.jsx
   Shared primitives for Stage 4 Settings: master-detail shell, form fields,
   switch, sticky save bar, stub layout. All exposed via window.S.
*/

const S = {};
const { useState } = React;

/* ───────── 8 sections registry (single source of truth)
   Flat list — separator inserted between MVP (5 real) and stubs (3). */
S.SECTIONS = [
  { id: "general",     label: "Ogólne",                stub: false },
  { id: "hours",       label: "Godziny otwarcia",      stub: false },
  { id: "content",     label: "Treści strony",         stub: false },
  { id: "zones",       label: "Strefy dostawy",        stub: false },
  { id: "operations",  label: "Operacje",              stub: false },
  { id: "notifications", label: "Powiadomienia",       stub: true  },
  { id: "capacity",    label: "Limity zamówień",       stub: true  },
  { id: "legal",       label: "RODO i regulaminy",     stub: true  }
];

/* ───────── Field primitives ───────── */
S.FieldLabel = ({ children, hint, required }) => (
  <div style={{ marginBottom: 6, display: "flex", alignItems: "baseline", gap: 6 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-body)" }}>
      {children}
      {required && <span style={{ color: "var(--color-primary)", marginLeft: 2 }}>*</span>}
    </span>
    {hint && (
      <span style={{ fontSize: 12, color: "var(--admin-text-faint)" }}>· {hint}</span>
    )}
  </div>
);

S.HelpText = ({ children }) => (
  <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 6, lineHeight: 1.5 }}>
    {children}
  </div>
);

S.TextInput = ({ value, mono, prefix, suffix, ...props }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    {prefix && (
      <span style={{
        position: "absolute", left: 12, fontSize: 13, color: "var(--admin-text-muted)",
        fontFamily: mono ? "var(--font-mono)" : "inherit", pointerEvents: "none"
      }}>{prefix}</span>
    )}
    <input
      defaultValue={value}
      style={{
        width: "100%", height: 40,
        padding: prefix ? "0 12px 0 36px" : (suffix ? "0 36px 0 12px" : "0 12px"),
        borderRadius: 8, border: "1px solid var(--admin-card-border)",
        background: "var(--admin-card)",
        fontSize: 14, color: "var(--admin-text-primary)",
        fontFamily: mono ? "var(--font-mono)" : "inherit",
        outline: "none", boxSizing: "border-box"
      }}
      {...props}
    />
    {suffix && (
      <span style={{
        position: "absolute", right: 12, fontSize: 13, color: "var(--admin-text-muted)",
        fontFamily: mono ? "var(--font-mono)" : "inherit", pointerEvents: "none"
      }}>{suffix}</span>
    )}
  </div>
);

S.Textarea = ({ value, rows = 3, ...props }) => (
  <textarea
    defaultValue={value}
    rows={rows}
    style={{
      width: "100%", padding: "10px 12px",
      borderRadius: 8, border: "1px solid var(--admin-card-border)",
      background: "var(--admin-card)", fontSize: 14, fontFamily: "inherit",
      color: "var(--admin-text-primary)",
      resize: "vertical", outline: "none", boxSizing: "border-box",
      lineHeight: 1.55, minHeight: 24 * rows + 20
    }}
    {...props}
  />
);

S.Switch = ({ value, size = "md" }) => {
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 22;
  const knob = size === "sm" ? 14 : 18;
  return (
    <span style={{
      display: "inline-block", width: w, height: h, borderRadius: 9999,
      background: value ? "var(--status-ready)" : "#D4D0C2",
      position: "relative", flexShrink: 0, transition: "background 180ms",
      cursor: "pointer"
    }}>
      <span style={{
        position: "absolute", top: 2, left: value ? w - knob - 2 : 2,
        width: knob, height: knob, borderRadius: 9999, background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
        transition: "left 180ms"
      }} />
    </span>
  );
};

S.SwitchRow = ({ label, hint, value, children }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "12px 0", gap: 24
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-primary)" }}>{label}</div>
      {hint && <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 2 }}>{hint}</div>}
      {children}
    </div>
    <S.Switch value={value} />
  </div>
);

/* ───────── Card with header ───────── */
S.SectionCard = ({ title, sub, action, children, padding = 22 }) => (
  <window.A.Card style={{ padding }}>
    {(title || action) && (
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: sub ? 4 : 16, gap: 16
      }}>
        {title && <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--admin-text-primary)" }}>{title}</h3>}
        {action}
      </div>
    )}
    {sub && (
      <p style={{
        margin: "0 0 16px", fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.5
      }}>{sub}</p>
    )}
    {children}
  </window.A.Card>
);

/* ───────── Sticky save bar ───────── */
S.SaveBar = ({ dirty }) => (
  <div style={{
    position: "sticky", bottom: 0, zIndex: 5,
    background: dirty ? "var(--admin-card)" : "rgba(250,250,248,0.92)",
    backdropFilter: "blur(8px)",
    borderTop: "1px solid var(--admin-divider)",
    padding: "14px 32px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: dirty ? "0 -8px 24px -16px rgba(15,18,25,0.18)" : "none",
    transition: "background 180ms"
  }}>
    <div style={{ fontSize: 13, color: dirty ? "var(--admin-text-body)" : "var(--admin-text-faint)" }}>
      {dirty ? (
        <>
          <span style={{
            display: "inline-block", width: 8, height: 8, borderRadius: 9999,
            background: "var(--status-new)", marginRight: 8, verticalAlign: "middle"
          }} />
          Niezapisane zmiany
        </>
      ) : (
        "Wszystko zapisane"
      )}
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button style={{
        height: 38, padding: "0 16px", borderRadius: 8,
        border: "1px solid var(--admin-card-border)",
        background: "var(--admin-card)",
        color: "var(--admin-text-body)",
        fontSize: 13, fontWeight: 500,
        cursor: dirty ? "pointer" : "not-allowed",
        opacity: dirty ? 1 : 0.5
      }}>Anuluj</button>
      <button style={{
        height: 38, padding: "0 18px", borderRadius: 8,
        border: "none",
        background: dirty ? "var(--color-primary)" : "#D4D0C2",
        color: "#fff",
        fontSize: 13, fontWeight: 600,
        cursor: dirty ? "pointer" : "not-allowed",
        boxShadow: dirty ? "0 1px 0 rgba(0,0,0,0.04)" : "none"
      }}>Zapisz zmiany</button>
    </div>
  </div>
);

/* ───────── Settings sidebar (left rail, 240px)
   Flat list — header "USTAWIENIA" + 8 items, single 1px separator
   between item 5 (Operacje) and item 6 (Powiadomienia). */
S.SettingsNav = ({ active = "general", onPick = () => {} }) => {
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: "var(--admin-canvas)",
      borderRight: "1px solid var(--admin-divider)",
      height: "100%", overflow: "auto",
      padding: "20px 12px 24px"
    }} className="scrollbox">
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: 0.08,
        textTransform: "uppercase", color: "var(--admin-text-faint)",
        padding: "4px 12px 12px"
      }}>Ustawienia</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {S.SECTIONS.map((it, idx) => {
          const isActive = active === it.id;
          // Insert visual separator between MVP block and stub block (after Operacje, before Powiadomienia)
          const showSeparator = idx > 0 && S.SECTIONS[idx - 1].stub === false && it.stub === true;
          return (
            <React.Fragment key={it.id}>
              {showSeparator && (
                <div style={{
                  height: 1, background: "var(--admin-divider)",
                  margin: "8px 12px 9px"
                }} />
              )}
              <button
                onClick={() => onPick(it.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: "none",
                  textAlign: "left",
                  fontSize: 13.5, fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--admin-nav-active-text)" : "var(--admin-text-body)",
                  background: isActive ? "var(--admin-nav-active-bg)" : "transparent",
                  cursor: "pointer", fontFamily: "inherit",
                  width: "100%"
                }}
              >
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.stub && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: 0.04,
                    textTransform: "uppercase",
                    padding: "2px 6px", borderRadius: 4,
                    background: "rgba(244, 162, 97, 0.18)",
                    color: "#9A5A1F"
                  }}>Wkrótce</span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
};

/* ───────── Section header (kicker + h1 + sub) ───────── */
S.SectionHeader = ({ kicker = "Konfiguracja", title, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: 0.08,
      textTransform: "uppercase", color: "var(--admin-text-muted)",
      marginBottom: 6
    }}>{kicker}</div>
    <h1 style={{
      margin: "0 0 6px", fontSize: 26, fontWeight: 700,
      letterSpacing: -0.015, color: "var(--admin-text-primary)"
    }}>{title}</h1>
    {sub && (
      <p style={{
        margin: 0, fontSize: 14, color: "var(--admin-text-muted)",
        lineHeight: 1.55, maxWidth: 640
      }}>{sub}</p>
    )}
  </div>
);

/* ───────── Stub section (uniform layout for 6 placeholder sections) ───────── */
S.StubSection = ({ icon, title, body, cta }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <div style={{ flex: 1, padding: 32, overflow: "auto" }} className="scrollbox">
      <S.SectionHeader title={title.label} sub={title.sub} />
      <window.A.Card style={{
        padding: "60px 32px",
        border: "1px dashed var(--admin-card-border)",
        background: "var(--admin-card)"
      }}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          textAlign: "center", maxWidth: 460, margin: "0 auto"
        }}>
          <div style={{ color: "#D4D0C2", marginBottom: 18 }}>{icon}</div>
          <div style={{
            fontSize: 18, fontWeight: 600, color: "var(--admin-text-body)",
            marginBottom: 10, letterSpacing: -0.01
          }}>{body.title}</div>
          <p style={{
            margin: 0, fontSize: 14, color: "var(--admin-text-muted)",
            lineHeight: 1.6
          }}>{body.text}</p>
          {cta && (
            <button style={{
              marginTop: 20,
              height: 36, padding: "0 16px", borderRadius: 8,
              border: "1px solid var(--admin-card-border)",
              background: "var(--admin-card)",
              color: "var(--admin-text-body)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6
            }}>{cta} <window.A.Icon d="M9 6l6 6-6 6" size={14} /></button>
          )}
        </div>
      </window.A.Card>
    </div>
  </div>
);

/* ───────── Settings frame (full chrome: admin sidebar + topbar + master-detail) ───────── */
S.SettingsFrame = ({
  tone = "warm", density = "comfortable", soundOn = true,
  manualClose = false, newCount = 6,
  active = "general",
  children,
  topbarTitle = "Ustawienia",
  topbarSub = "Konfiguracja restauracji"
}) => (
  <div className="admin" data-tone={tone} data-density={density}
    style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
    <window.A.Sidebar active="settings" newCount={newCount} density={density} />
    <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
      <window.A.Topbar
        title={topbarTitle}
        subtitle={topbarSub}
        breadcrumb="Konfiguracja › Ustawienia"
        soundOn={soundOn}
        density={density}
      />
      {manualClose && <window.A.ManualCloseBanner />}

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <S.SettingsNav active={active} />
        <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {children}
        </section>
      </div>
    </main>
  </div>
);

window.S = S;
