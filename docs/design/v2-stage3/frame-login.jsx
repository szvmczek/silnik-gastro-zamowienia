/* frame-login.jsx
   /admin/login — desktop + tablet 1024
   Fokus: minimum frykcji, brand spójny z public-facing, error state inline. */

const LoginFrame = ({ tone = "warm", density = "comfortable", error = false }) => (
  <div className="admin" data-tone={tone} data-density={density}
    style={{
      width: "100%", height: "100%",
      display: "grid", gridTemplateColumns: "5fr 7fr",
      background: "var(--admin-canvas)"
    }}>
    {/* LEFT — brand split */}
    <div style={{
      background: "var(--color-bg-dark)", color: "var(--color-text-on-dark)",
      padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "space-between",
      position: "relative", overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: "var(--color-primary)",
          display: "grid", placeItems: "center", fontFamily: "ui-serif, Georgia, serif",
          fontSize: 20, fontWeight: 700
        }}>P</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Pizza Demo</div>
          <div style={{ fontSize: 11, color: "#A8A59C", letterSpacing: 0.06, textTransform: "uppercase" }}>
            Panel admina
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{
          fontSize: 13, color: "#F4A261", letterSpacing: 0.08, textTransform: "uppercase", marginBottom: 14, fontWeight: 600
        }}>
          ŁOMIANKI · OD 2018
        </div>
        <h2 style={{
          fontSize: 44, fontWeight: 800, lineHeight: 1.05, letterSpacing: -0.02,
          margin: 0, color: "#FAFAF8", maxWidth: 360
        }}>
          Smacznie<br />i&nbsp;szybko<span style={{ color: "var(--color-primary)" }}>.</span>
        </h2>
        <p style={{ fontSize: 15, color: "#CFCFC9", marginTop: 16, maxWidth: 380, lineHeight: 1.55 }}>
          Zarządzanie zamówieniami, menu i godzinami otwarcia w&nbsp;jednym miejscu.
        </p>
      </div>

      <div style={{ fontSize: 12, color: "#7A7A75", position: "relative", zIndex: 2 }}>
        Wersja 5.0 · Faza redesign
      </div>

      {/* decorative dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.6, zIndex: 1
      }} />
    </div>

    {/* RIGHT — form */}
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 48, background: "var(--admin-canvas)"
    }}>
      <form style={{ width: "100%", maxWidth: 380 }}
        onSubmit={(e) => e.preventDefault()}>
        <div className="t-kicker" style={{ color: "var(--color-text-muted)", marginBottom: 12 }}>
          ZALOGUJ SIĘ
        </div>
        <h1 style={{
          fontSize: 30, fontWeight: 800, letterSpacing: -0.02, lineHeight: 1.15,
          margin: "0 0 32px", color: "var(--admin-text-primary)"
        }}>
          Witaj z&nbsp;powrotem<span style={{ color: "var(--color-primary)" }}>.</span>
        </h1>

        <label style={{ display: "block", marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-body)", marginBottom: 6 }}>
            E-mail
          </div>
          <input
            type="email"
            defaultValue="kasia@pizzademo.pl"
            style={{
              width: "100%", height: 46, padding: "0 14px",
              border: `1.5px solid ${error ? "var(--status-cancelled)" : "var(--admin-card-border)"}`,
              borderRadius: 8, fontSize: 14, color: "var(--admin-text-primary)",
              background: "var(--admin-card)", outline: "none", boxSizing: "border-box"
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 12 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginBottom: 6
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-body)" }}>
              Hasło
            </span>
            <a href="#" style={{
              fontSize: 12, color: "var(--color-primary)", textDecoration: "none", fontWeight: 600
            }}>
              Nie pamiętasz?
            </a>
          </div>
          <input
            type="password"
            defaultValue={error ? "wrongpass" : "••••••••••"}
            style={{
              width: "100%", height: 46, padding: "0 14px",
              border: `1.5px solid ${error ? "var(--status-cancelled)" : "var(--admin-card-border)"}`,
              borderRadius: 8, fontSize: 14, color: "var(--admin-text-primary)",
              background: "var(--admin-card)", outline: "none", boxSizing: "border-box",
              fontFamily: "var(--font-mono)"
            }}
          />
          {error && (
            <div style={{
              marginTop: 10, padding: "10px 12px",
              background: "var(--status-cancelled-tint)",
              color: "#991B1B",
              border: "1px solid #FCA5A5",
              borderRadius: 6, fontSize: 13, lineHeight: 1.4
            }}>
              <strong>Nieprawidłowy e-mail lub hasło.</strong> Spróbuj ponownie.
            </div>
          )}
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <input type="checkbox" defaultChecked
            style={{ width: 16, height: 16, accentColor: "var(--color-primary)" }} />
          <span style={{ fontSize: 13, color: "var(--admin-text-body)" }}>Zapamiętaj mnie</span>
        </label>

        <button type="submit" style={{
          width: "100%", height: 48, borderRadius: 8,
          background: "var(--color-primary)", color: "#FFFFFF",
          border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer",
          letterSpacing: -0.005
        }}>
          Zaloguj
        </button>

        <div style={{
          marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--admin-divider)",
          fontSize: 12, color: "var(--admin-text-muted)", textAlign: "center"
        }}>
          Tylko dla uprawnionych. Restauracja · single-tenant.<br />
          <a href="#" style={{ color: "var(--admin-text-body)", textDecoration: "none", fontWeight: 500 }}>
            Wróć na pizzademo.pl →
          </a>
        </div>
      </form>
    </div>
  </div>
);

window.LoginFrame = LoginFrame;
