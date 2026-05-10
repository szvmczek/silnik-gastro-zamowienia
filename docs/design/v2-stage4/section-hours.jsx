/* section-hours.jsx
   Settings → Godziny otwarcia.
   Per-day switch + time pickers + copy-to popover (rendered inline). */

const SectionHours = ({ dirty = false }) => {
  const S = window.S;
  const A = window.A;

  const days = [
    { label: "Poniedziałek", short: "Pn", open: true,  from: "11:00", to: "23:00", today: false },
    { label: "Wtorek",       short: "Wt", open: true,  from: "11:00", to: "23:00", today: false },
    { label: "Środa",        short: "Śr", open: true,  from: "11:00", to: "23:00", today: true },
    { label: "Czwartek",     short: "Cz", open: true,  from: "11:00", to: "23:00", today: false },
    { label: "Piątek",       short: "Pt", open: true,  from: "11:00", to: "00:00", today: false },
    { label: "Sobota",       short: "So", open: true,  from: "12:00", to: "00:00", today: false },
    { label: "Niedziela",    short: "Nd", open: false, from: "12:00", to: "22:00", today: false }
  ];

  const TimeBox = ({ value, disabled }) => (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      height: 36, padding: "0 10px",
      borderRadius: 8,
      border: "1px solid var(--admin-card-border)",
      background: disabled ? "var(--admin-row-hover)" : "var(--admin-card)",
      fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
      color: disabled ? "var(--admin-text-faint)" : "var(--admin-text-primary)",
      cursor: disabled ? "not-allowed" : "text",
      minWidth: 78, justifyContent: "space-between"
    }}>
      <span>{value}</span>
      <window.A.Icon d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2" size={12} stroke={1.6} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbox" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px 32px 24px", maxWidth: 1080 }}>
          <S.SectionHeader
            title="Godziny otwarcia"
            sub="Standardowy harmonogram tygodniowy. Dni oznaczone jako zamknięte nie przyjmują zamówień. Wyjątki świąteczne pojawią się w kolejnym wydaniu." />

          {/* Hours table */}
          <S.SectionCard padding={4}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "180px 80px 220px 1fr",
              gap: 12, padding: "12px 18px",
              borderBottom: "1px solid var(--admin-divider)",
              fontSize: 11, color: "var(--admin-text-muted)",
              letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700
            }}>
              <span>Dzień</span><span>Otwarte</span><span>Godziny</span><span></span>
            </div>
            {days.map((d, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "180px 80px 220px 1fr",
                gap: 12, padding: "14px 18px", alignItems: "center",
                borderBottom: i < days.length - 1 ? "1px solid var(--admin-divider)" : "none",
                background: d.today ? "rgba(230,57,70,0.04)" : "transparent"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    display: "grid", placeItems: "center",
                    fontSize: 11, fontWeight: 700,
                    background: d.today ? "var(--color-primary)" : "var(--admin-row-hover)",
                    color: d.today ? "#fff" : "var(--admin-text-muted)",
                    fontFamily: "var(--font-mono)"
                  }}>{d.short}</span>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: d.open ? "var(--admin-text-primary)" : "var(--admin-text-muted)"
                  }}>
                    {d.label}
                    {d.today && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.06,
                        textTransform: "uppercase", color: "var(--color-primary)"
                      }}>· dziś</span>
                    )}
                  </span>
                </div>

                <S.Switch value={d.open} />

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TimeBox value={d.from} disabled={!d.open} />
                  <span style={{ color: "var(--admin-text-faint)", fontSize: 13 }}>—</span>
                  <TimeBox value={d.to} disabled={!d.open} />
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                  {d.open ? (
                    <button style={{
                      height: 30, padding: "0 12px", borderRadius: 6,
                      border: "1px solid var(--admin-card-border)",
                      background: "transparent",
                      fontSize: 12, fontWeight: 500,
                      color: "var(--admin-text-body)",
                      cursor: "pointer"
                    }}>Skopiuj na inne dni</button>
                  ) : (
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: "var(--admin-text-muted)",
                      padding: "4px 10px", borderRadius: 9999,
                      background: "var(--admin-row-hover)"
                    }}>Zamknięte</span>
                  )}
                </div>
              </div>
            ))}
          </S.SectionCard>

          {/* Live preview */}
          <div style={{ marginTop: 24 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
              textTransform: "uppercase", color: "var(--admin-text-muted)",
              marginBottom: 10
            }}>Tak będzie wyglądać na stronie</div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0,
              border: "1px solid var(--admin-card-border)",
              borderRadius: 10, overflow: "hidden",
              background: "#fff", maxWidth: 760
            }}>
              {days.map((d, i) => (
                <div key={i} style={{
                  padding: "14px 10px", textAlign: "center",
                  borderRight: i < days.length - 1 ? "1px solid var(--admin-divider)" : "none",
                  background: d.today ? "var(--color-primary)" : "transparent",
                  color: d.today ? "#fff" : "var(--admin-text-primary)"
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.06,
                    textTransform: "uppercase",
                    color: d.today ? "rgba(255,255,255,0.85)" : "var(--admin-text-muted)",
                    marginBottom: 4
                  }}>{d.short}</div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                    color: d.today ? "#fff" : (d.open ? "var(--admin-text-primary)" : "var(--admin-text-faint)")
                  }}>
                    {d.open ? `${d.from}–${d.to}` : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            marginTop: 24,
            padding: "14px 16px",
            borderRadius: 10,
            background: "rgba(244, 162, 97, 0.08)",
            border: "1px solid rgba(244, 162, 97, 0.25)",
            display: "flex", gap: 12, alignItems: "flex-start", maxWidth: 760
          }}>
            <span style={{ color: "#9A5A1F", marginTop: 2 }}>
              <window.A.Icon d={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z","M12 8v4","M12 16h.01"]} size={16} />
            </span>
            <div style={{ fontSize: 13, color: "#7A4818", lineHeight: 1.5 }}>
              <strong style={{ fontWeight: 700 }}>Wyjątki świąteczne</strong> (np. zamknięcie 25 grudnia, zmiany w okresie świątecznym) — będą dostępne w sekcji <em>Limity zamówień</em> w jednym z kolejnych wydań.
            </div>
          </div>
        </div>
      </div>
      <S.SaveBar dirty={dirty} />
    </div>
  );
};

window.SectionHours = SectionHours;
