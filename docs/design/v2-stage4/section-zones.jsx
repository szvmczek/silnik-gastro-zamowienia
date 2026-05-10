/* section-zones.jsx
   Settings → Strefy dostawy.
   List of zones with type badges + expanded zone showing 2 add modes. */

const { useState: useStateZones } = React;

const SectionZones = ({ dirty = false }) => {
  const S = window.S;
  const A = window.A;
  const [expanded, setExpanded] = useStateZones("krakow-centrum");

  const zones = [
    {
      id: "krakow-centrum", name: "Kraków centrum", type: "FREE", fee: 0,
      active: true, areas: 4, areasMode: "codes",
      city: "Kraków",
      codes: ["31-066", "31-067", "31-073", "31-119"]
    },
    {
      id: "krakow-podgorze", name: "Podgórze + Kazimierz", type: "PAID", fee: 7.00,
      active: true, areas: 6, areasMode: "codes",
      city: "Kraków",
      codes: []
    },
    {
      id: "krakow-nh", name: "Nowa Huta", type: "PAID", fee: 12.00,
      active: false, areas: 1, areasMode: "city",
      city: "Kraków-Nowa Huta",
      codes: []
    },
    {
      id: "wieliczka", name: "Wieliczka", type: "UNAVAILABLE", fee: 0,
      active: false, areas: 1, areasMode: "city",
      city: "Wieliczka",
      codes: []
    }
  ];

  const TYPE = {
    FREE:        { label: "Darmowa", color: "var(--status-ready)",     tint: "var(--status-ready-tint)" },
    PAID:        { label: "Płatna",  color: "var(--status-new)",       tint: "var(--status-new-tint)" },
    UNAVAILABLE: { label: "Wstrzymana", color: "var(--status-cancelled)", tint: "var(--status-cancelled-tint)" }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbox" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px 32px 24px", maxWidth: 1080 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24 }}>
            <S.SectionHeader
              title="Strefy dostawy"
              sub="Każda strefa ma jeden tryb opłaty i listę obszarów (cała miejscowość lub konkretne kody pocztowe). Przy zamówieniu klient wpisuje kod i system wybiera strefę." />
            <button style={{
              flexShrink: 0,
              height: 40, padding: "0 18px", borderRadius: 8,
              border: "none", background: "var(--color-primary)", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
              marginBottom: 4
            }}>
              <window.A.Icon d={["M12 5v14","M5 12h14"]} size={16} stroke={2.4} />
              Dodaj strefę
            </button>
          </div>

          <div style={{
            background: "var(--admin-card)",
            border: "1px solid var(--admin-card-border)",
            borderRadius: 10, overflow: "hidden"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 110px 110px 100px 70px 80px",
              gap: 12, padding: "12px 18px",
              background: "var(--admin-row-hover)",
              borderBottom: "1px solid var(--admin-divider)",
              fontSize: 11, color: "var(--admin-text-muted)",
              letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700
            }}>
              <span></span><span>Strefa</span><span>Typ</span><span>Opłata</span><span>Obszary</span><span>Aktywna</span><span></span>
            </div>

            {zones.map((z, i) => {
              const isOpen = expanded === z.id;
              const t = TYPE[z.type];
              return (
                <div key={z.id} style={{
                  borderBottom: i < zones.length - 1 ? "1px solid var(--admin-divider)" : "none"
                }}>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "32px 1fr 110px 110px 100px 70px 80px",
                    gap: 12, padding: "14px 18px", alignItems: "center",
                    background: isOpen ? "rgba(230,57,70,0.03)" : "transparent",
                    cursor: "pointer"
                  }} onClick={() => setExpanded(isOpen ? null : z.id)}>
                    <span style={{
                      color: "var(--admin-text-muted)",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                      transition: "transform 180ms",
                      display: "inline-flex"
                    }}>
                      <window.A.Icon d="M9 6l6 6-6 6" size={14} />
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{z.name}</span>
                    <span>
                      <span className="pill" style={{ background: t.tint, color: t.color, fontSize: 11 }}>
                        {t.label}
                      </span>
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600,
                                   color: z.fee === 0 ? "var(--status-ready)" : "var(--admin-text-primary)" }}>
                      {z.type === "UNAVAILABLE" ? "—" : (z.fee === 0 ? "0,00 zł" : `${z.fee.toFixed(2).replace(".", ",")} zł`)}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>
                      {z.areas} {z.areas === 1 ? "obszar" : "obszary"}
                    </span>
                    <span><S.Switch value={z.active} size="sm" /></span>
                    <span style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                      <button style={{
                        width: 28, height: 28, borderRadius: 6, border: "none",
                        background: "transparent", color: "var(--admin-text-muted)", cursor: "pointer",
                        display: "grid", placeItems: "center"
                      }}><window.A.Icon d={["M4 20h4l11-11-4-4L4 16z","M14 5l5 5"]} size={14} /></button>
                      <button style={{
                        width: 28, height: 28, borderRadius: 6, border: "none",
                        background: "transparent", color: "var(--admin-text-muted)", cursor: "pointer",
                        display: "grid", placeItems: "center"
                      }}><window.A.Icon d={["M4 7h16","M9 7V4h6v3","M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7"]} size={14} /></button>
                    </span>
                  </div>

                  {isOpen && (
                    <div style={{
                      padding: "8px 18px 22px 50px",
                      background: "rgba(230,57,70,0.02)"
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {/* Mode A: cała miejscowość */}
                        <div style={{
                          padding: 16, borderRadius: 10,
                          border: "1px solid var(--admin-card-border)",
                          background: "var(--admin-card)"
                        }}>
                          <div style={{
                            fontSize: 11, fontWeight: 700, letterSpacing: 0.06,
                            textTransform: "uppercase", color: "var(--admin-text-muted)",
                            marginBottom: 12
                          }}>Tryb 1 — cała miejscowość</div>
                          <S.FieldLabel>Miasto</S.FieldLabel>
                          <S.TextInput value="Kraków" />
                          <label style={{
                            display: "flex", alignItems: "center", gap: 10,
                            marginTop: 12, fontSize: 13, color: "var(--admin-text-body)",
                            cursor: "pointer"
                          }}>
                            <span style={{
                              width: 18, height: 18, borderRadius: 4,
                              border: "1.5px solid var(--admin-card-border)",
                              display: "grid", placeItems: "center", flexShrink: 0
                            }} />
                            Wszystkie kody pocztowe w mieście
                          </label>
                        </div>

                        {/* Mode B: konkretne kody */}
                        <div style={{
                          padding: 16, borderRadius: 10,
                          border: "1.5px solid var(--color-primary)",
                          background: "var(--color-primary-tint)"
                        }}>
                          <div style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            marginBottom: 12
                          }}>
                            <div style={{
                              fontSize: 11, fontWeight: 700, letterSpacing: 0.06,
                              textTransform: "uppercase", color: "var(--color-primary)"
                            }}>Tryb 2 — konkretne kody · aktywne</div>
                            <span className="pill" style={{ background: "#fff", color: "var(--color-primary)", fontSize: 10 }}>
                              {z.codes.length} kodów
                            </span>
                          </div>
                          <S.FieldLabel>Miasto</S.FieldLabel>
                          <S.TextInput value="Kraków" />
                          <div style={{ marginTop: 10 }}>
                            <S.FieldLabel hint="po przecinku, spacji lub w nowej linii — auto-format do 00-000">Kody pocztowe</S.FieldLabel>
                            <S.Textarea rows={3} value={z.codes.join(", ")} />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
                        <button style={{
                          height: 32, padding: "0 14px", borderRadius: 6,
                          border: "1px solid var(--admin-card-border)",
                          background: "var(--admin-card)",
                          fontSize: 12, fontWeight: 500, cursor: "pointer"
                        }}>Anuluj edycję</button>
                        <button style={{
                          height: 32, padding: "0 14px", borderRadius: 6,
                          border: "none", background: "var(--color-primary)", color: "#fff",
                          fontSize: 12, fontWeight: 600, cursor: "pointer"
                        }}>Zaktualizuj strefę</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Edge case toasts demo */}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, maxWidth: 540 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
              textTransform: "uppercase", color: "var(--admin-text-muted)"
            }}>Komunikaty edge-case</div>

            <div style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(245,158,11,0.10)",
              border: "1px solid rgba(245,158,11,0.3)",
              display: "flex", gap: 10, alignItems: "center"
            }}>
              <span style={{ color: "#9A5A1F" }}>
                <window.A.Icon d={["M12 3 2 21h20z","M12 10v5","M12 18h.01"]} size={16} />
              </span>
              <div style={{ fontSize: 13, color: "#7A4818", flex: 1 }}>
                <strong>Strefa nie może zostać usunięta</strong> — istnieją zamówienia z tej strefy. Wyłącz ją zamiast usuwać.
              </div>
            </div>

            <div style={{
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.25)",
              display: "flex", gap: 10, alignItems: "center"
            }}>
              <span style={{ color: "#B91C1C" }}>
                <window.A.Icon d={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z","M15 9l-6 6","M9 9l6 6"]} size={16} />
              </span>
              <div style={{ fontSize: 13, color: "#7F1D1D", flex: 1 }}>
                <strong>Wpis już istnieje</strong> — kod 31-066 jest przypisany do strefy <em>Kraków centrum</em>.
              </div>
            </div>
          </div>
        </div>
      </div>
      <S.SaveBar dirty={dirty} />
    </div>
  );
};

window.SectionZones = SectionZones;
