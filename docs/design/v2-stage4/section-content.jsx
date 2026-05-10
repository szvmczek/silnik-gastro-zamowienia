/* section-content.jsx
   Settings → Treści strony.
   HERO / ABOUT tabs + split-screen sticky live preview. */

const { useState: useStateContent } = React;

const SectionContent = ({ dirty = false, showPreview = true, initialTab = "hero" }) => {
  const S = window.S;
  const A = window.A;
  const [tab, setTab] = useStateContent(initialTab);

  const Tab = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      padding: "10px 16px",
      border: "none",
      background: "transparent",
      fontSize: 14, fontWeight: tab === id ? 700 : 500,
      color: tab === id ? "var(--admin-text-primary)" : "var(--admin-text-muted)",
      cursor: "pointer",
      borderBottom: tab === id ? "2px solid var(--color-primary)" : "2px solid transparent",
      marginBottom: -1
    }}>{label}</button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbox" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px 32px 24px" }}>
          <S.SectionHeader
            title="Treści strony"
            sub="Sekcje na landingu publicznym — Hero w nagłówku i About wśród sekcji informacyjnych. Zmiany pojawiają się natychmiast po zapisie." />

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 0,
            borderBottom: "1px solid var(--admin-divider)",
            marginBottom: 20
          }}>
            <Tab id="hero" label="Hero" />
            <Tab id="about" label="O nas" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: showPreview ? "1fr 420px" : "1fr", gap: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
              {tab === "hero" && (
                <>
                  <S.SectionCard title="Sekcja Hero">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Aktywne</div>
                        <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>Po wyłączeniu strona pominie sekcję Hero.</div>
                      </div>
                      <S.Switch value={true} />
                    </div>
                    <hr style={{ border: 0, borderTop: "1px solid var(--admin-divider)", margin: "0 0 16px" }} />

                    <div>
                      <S.FieldLabel required>Title</S.FieldLabel>
                      <S.TextInput value="Pizza Demo" />
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <S.FieldLabel hint="1-2 wiersze, max 160 znaków">Subtitle</S.FieldLabel>
                      <S.Textarea rows={2} value="Smacznie i szybko. Dostawa do 35 minut." />
                    </div>
                  </S.SectionCard>

                  <S.SectionCard title="Call to action">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <S.FieldLabel>Tekst przycisku</S.FieldLabel>
                        <S.TextInput value="Zobacz menu" />
                      </div>
                      <div>
                        <S.FieldLabel>Kierunek</S.FieldLabel>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {[
                            { val: "menu", label: "Menu (przewijanie)", on: true },
                            { val: "phone", label: "Telefon (tel:)", on: false },
                            { val: "url", label: "Custom URL", on: false }
                          ].map(opt => (
                            <label key={opt.val} style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "8px 12px", borderRadius: 8,
                              border: `1px solid ${opt.on ? "var(--color-primary)" : "var(--admin-card-border)"}`,
                              background: opt.on ? "var(--color-primary-tint)" : "var(--admin-card)",
                              cursor: "pointer", fontSize: 13
                            }}>
                              <span style={{
                                width: 16, height: 16, borderRadius: 9999,
                                border: `2px solid ${opt.on ? "var(--color-primary)" : "var(--admin-card-border)"}`,
                                background: opt.on ? "var(--color-primary)" : "transparent",
                                boxShadow: opt.on ? "inset 0 0 0 3px #fff" : "none"
                              }} />
                              <span style={{ fontWeight: opt.on ? 600 : 500 }}>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </S.SectionCard>

                  <S.SectionCard title="Tło">
                    <S.FieldLabel hint="16:9, min. 1920×1080px">Background image URL</S.FieldLabel>
                    <S.TextInput value="https://cdn.pizzademo.pl/hero/oven-flame.jpg" mono />
                    <div style={{
                      marginTop: 12,
                      width: "100%", aspectRatio: "16 / 9", borderRadius: 10,
                      background: "linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, #E63946 130%)",
                      border: "1px solid var(--admin-card-border)",
                      position: "relative", overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)"
                      }} />
                    </div>
                  </S.SectionCard>
                </>
              )}

              {tab === "about" && (
                <>
                  <S.SectionCard title="Sekcja O nas">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>Aktywne</div>
                        <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>Sekcja pojawia się pod menu.</div>
                      </div>
                      <S.Switch value={true} />
                    </div>
                    <hr style={{ border: 0, borderTop: "1px solid var(--admin-divider)", margin: "0 0 16px" }} />
                    <div>
                      <S.FieldLabel required>Title</S.FieldLabel>
                      <S.TextInput value="Nasza historia" />
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <S.FieldLabel hint="5-10 wierszy, plain text">Body</S.FieldLabel>
                      <S.Textarea rows={8} value={"Lokalna pizzeria w Łomiankach od 2018 roku. Robimy pizzę z pieca, kurczaki i zapiekanki — dla osiedla, codziennie.\n\nSkładniki kupujemy lokalnie. Pizzę robi człowiek, nie automat. Dostawa do 35 minut, odbiór w 15."} />
                    </div>
                  </S.SectionCard>

                  <S.SectionCard title="Zdjęcie">
                    <S.FieldLabel hint="4:3, min. 1200×900px">Image URL</S.FieldLabel>
                    <S.TextInput value="https://cdn.pizzademo.pl/about/team-2024.jpg" mono />
                    <div style={{
                      marginTop: 12,
                      width: "100%", aspectRatio: "4 / 3", borderRadius: 10,
                      background: "linear-gradient(135deg, #5A2818 0%, #8B4513 60%, #D4A574 130%)",
                      border: "1px solid var(--admin-card-border)",
                      position: "relative", overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)"
                      }} />
                      <div style={{
                        position: "absolute", left: 18, bottom: 14,
                        color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11,
                        opacity: 0.6
                      }}>{`{ team-2024.jpg }`}</div>
                    </div>
                  </S.SectionCard>
                </>
              )}
            </div>

            {/* Live preview pane */}
            {showPreview && (
              <div style={{ position: "sticky", top: 0, alignSelf: "start" }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                  textTransform: "uppercase", color: "var(--admin-text-muted)",
                  marginBottom: 10
                }}>Live preview · landing</div>
                <div style={{
                  borderRadius: 12, overflow: "hidden",
                  border: "1px solid var(--admin-card-border)",
                  background: "#fff"
                }}>
                  <div style={{
                    height: 28, background: "#F5F2EA",
                    borderBottom: "1px solid var(--admin-divider)",
                    display: "flex", alignItems: "center", gap: 6, padding: "0 10px"
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#E5E1D6" }} />
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#E5E1D6" }} />
                    <span style={{ width: 8, height: 8, borderRadius: 9999, background: "#E5E1D6" }} />
                    <span style={{ marginLeft: 12, fontSize: 11, color: "var(--admin-text-faint)", fontFamily: "var(--font-mono)" }}>pizzademo.pl</span>
                  </div>

                  {tab === "hero" ? (
                    <div style={{
                      aspectRatio: "16 / 11",
                      background: "linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, #E63946 130%)",
                      color: "#fff", padding: 28,
                      display: "flex", flexDirection: "column", justifyContent: "flex-end",
                      position: "relative"
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)"
                      }} />
                      <div style={{ position: "relative", fontSize: 32, fontWeight: 800, letterSpacing: -0.02, lineHeight: 1.05, marginBottom: 10 }}>
                        Pizza Demo
                      </div>
                      <div style={{ position: "relative", fontSize: 11, color: "rgba(255,255,255,0.7)", letterSpacing: 0.08, textTransform: "uppercase", marginBottom: 8 }}>
                        Łomianki · od 2018
                      </div>
                      <div style={{ position: "relative", fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: 18, maxWidth: 280, lineHeight: 1.5 }}>
                        Smacznie i szybko. Dostawa do 35 minut.
                      </div>
                      <button style={{
                        position: "relative", alignSelf: "flex-start",
                        height: 38, padding: "0 18px", borderRadius: 8,
                        border: "none", background: "var(--color-primary)", color: "#fff",
                        fontSize: 14, fontWeight: 600
                      }}>Zobacz menu</button>
                    </div>
                  ) : (
                    <div style={{ padding: 28, background: "#FAFAF8" }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                        textTransform: "uppercase", color: "var(--color-primary)",
                        marginBottom: 8
                      }}>O nas</div>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.015, marginBottom: 12 }}>
                        Nasza historia
                      </div>
                      <div style={{
                        width: "100%", aspectRatio: "4 / 3", borderRadius: 8, marginBottom: 14,
                        background: "linear-gradient(135deg, #5A2818 0%, #8B4513 60%, #D4A574 130%)",
                        position: "relative", overflow: "hidden"
                      }}>
                        <div style={{
                          position: "absolute", inset: 0,
                          backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)"
                        }} />
                      </div>
                      <div style={{ fontSize: 13, color: "var(--admin-text-body)", lineHeight: 1.6 }}>
                        Lokalna pizzeria w Łomiankach od 2018 roku. Robimy pizzę z pieca, kurczaki i zapiekanki — dla osiedla, codziennie…
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <S.SaveBar dirty={dirty} />
    </div>
  );
};

window.SectionContent = SectionContent;
