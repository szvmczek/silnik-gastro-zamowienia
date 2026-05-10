/* section-general.jsx
   Settings → Ogólne (default landing).
   Restaurant info, brand color picker w/ live preview, logo + hero, social. */

const SectionGeneral = ({ dirty = false, showPreview = true }) => {
  const S = window.S;
  const A = window.A;

  const swatches = [
    { name: "Pomidorowy", hex: "#E63946", active: true },
    { name: "Bazylia",    hex: "#2A8A4E", active: false },
    { name: "Dynia",      hex: "#E07A1F", active: false },
    { name: "Oliwka",     hex: "#5A6B3A", active: false },
    { name: "Indygo",     hex: "#3B5BDB", active: false },
    { name: "Grafit",     hex: "#1F2937", active: false }
  ];
  const activeColor = swatches.find(s => s.active).hex;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbox" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px 32px 24px", maxWidth: 1080 }}>
          <S.SectionHeader
            title="Ogólne"
            sub="Podstawowe informacje o restauracji — pokazują się w nagłówku, stopce, na karcie kontaktowej i w wynikach wyszukiwania." />

          <div style={{ display: "grid", gridTemplateColumns: showPreview ? "1fr 360px" : "1fr", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

              {/* Identyfikacja */}
              <S.SectionCard title="Identyfikacja">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <S.FieldLabel required>Nazwa restauracji</S.FieldLabel>
                    <S.TextInput value="Pizza Demo" />
                  </div>
                  <div>
                    <S.FieldLabel hint="1 linia, max 80 znaków">Slogan</S.FieldLabel>
                    <S.TextInput value="Smacznie i szybko. Dostawa do 35 minut." />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <S.FieldLabel hint="Pokazany w meta description, do SEO">Krótki opis</S.FieldLabel>
                  <S.Textarea rows={3} value="Lokalna pizzeria w Łomiankach. Pizza z pieca, kurczaki, zapiekanki. Dostawa w okolicy do 35 minut." />
                </div>
              </S.SectionCard>

              {/* Kontakt */}
              <S.SectionCard title="Kontakt">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <S.FieldLabel required>Email kontaktowy</S.FieldLabel>
                    <S.TextInput value="kontakt@pizzademo.pl" type="email" />
                  </div>
                  <div>
                    <S.FieldLabel required>Telefon</S.FieldLabel>
                    <S.TextInput value="+48 600 100 200" mono />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <S.FieldLabel>Adres</S.FieldLabel>
                  <S.Textarea rows={2} value="ul. Warszawska 24&#10;05-092 Łomianki" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <S.FieldLabel hint="Wklej link Google Maps lub współrzędne">Link Google Maps</S.FieldLabel>
                  <S.TextInput value="https://maps.app.goo.gl/8aBz9X4mNkR2c" mono />
                </div>
              </S.SectionCard>

              {/* Marka — color */}
              <S.SectionCard title="Marka — kolor"
                sub="Kolor główny używany w przyciskach, linkach, badge'ach i wyróżnieniach na całym landingu i panelu klienta."
                padding={22}>
                <div style={{ maxWidth: 360 }}>
                  <S.FieldLabel>Kolor HEX</S.FieldLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: activeColor,
                      border: "1px solid rgba(0,0,0,0.08)",
                      flexShrink: 0
                    }} />
                    <input
                      defaultValue={activeColor}
                      style={{
                        width: 0, flex: 1, minWidth: 0,
                        height: 40, padding: "0 12px",
                        borderRadius: 8, border: "1px solid var(--admin-card-border)",
                        background: "var(--admin-card)",
                        fontFamily: "var(--font-mono)", fontSize: 13,
                        textTransform: "uppercase",
                        color: "var(--admin-text-primary)",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 18, minWidth: 0 }}>
                  <S.FieldLabel hint="Kliknij, aby ustawić">Predefiniowane palety</S.FieldLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12, paddingBottom: 6 }}>
                    {swatches.map((sw, i) => (
                      <button key={i} style={{
                        padding: 0, border: "none", background: "transparent",
                        cursor: "pointer", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 8, minWidth: 0
                      }}>
                        <div style={{
                          width: 56, maxWidth: "100%", aspectRatio: "1 / 1", borderRadius: 8,
                          background: sw.hex,
                          border: sw.active ? `2px solid var(--admin-text-primary)` : "1px solid rgba(0,0,0,0.08)",
                          boxShadow: sw.active ? "inset 0 0 0 2px #fff" : "none",
                          boxSizing: "border-box"
                        }} />
                        <div style={{
                          fontSize: 11, lineHeight: 1.3,
                          color: "var(--admin-text-muted)",
                          fontWeight: sw.active ? 600 : 500,
                          width: "100%", textAlign: "center",
                          whiteSpace: "nowrap"
                        }}>
                          {sw.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live preview */}
                <div style={{
                  marginTop: 22, padding: 18,
                  borderRadius: 10, background: "var(--admin-row-hover)",
                  border: "1px solid var(--admin-divider)"
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                    textTransform: "uppercase", color: "var(--admin-text-muted)",
                    marginBottom: 12
                  }}>Podgląd komponentów na żywo</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <button style={{
                      height: 38, padding: "0 18px", borderRadius: 8,
                      border: "none", background: activeColor, color: "#fff",
                      fontSize: 14, fontWeight: 600, cursor: "pointer"
                    }}>Zamów teraz</button>

                    <a href="#" style={{
                      color: activeColor, fontSize: 14, fontWeight: 600,
                      textDecoration: "underline", textUnderlineOffset: 3
                    }}>Zobacz menu</a>

                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", borderRadius: 9999,
                      background: activeColor + "1F", color: activeColor,
                      fontSize: 12, fontWeight: 700
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 9999, background: activeColor }} />
                      Hit
                    </span>

                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "4px 10px", borderRadius: 9999,
                      border: `1px solid ${activeColor}`,
                      color: activeColor, background: "#fff",
                      fontSize: 12, fontWeight: 700
                    }}>Nowość</span>

                    {/* Mini product card */}
                    <div style={{
                      marginLeft: "auto",
                      width: 220, padding: 12,
                      background: "#fff", borderRadius: 10,
                      border: "1px solid var(--admin-card-border)",
                      display: "flex", gap: 10, alignItems: "center"
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 8,
                        background: `linear-gradient(135deg, ${activeColor}1A, ${activeColor}33)`,
                        display: "grid", placeItems: "center", fontSize: 28
                      }}>🍕</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Margherita</div>
                        <div style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 4 }}>32 cm</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: activeColor }}>32,00 zł</div>
                      </div>
                    </div>
                  </div>
                </div>
              </S.SectionCard>

              {/* Logo + Hero */}
              <S.SectionCard title="Grafiki">
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
                  <div>
                    <S.FieldLabel hint="kwadrat, min. 256×256px, PNG/SVG">Logo URL</S.FieldLabel>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <S.TextInput value="https://cdn.pizzademo.pl/brand/logo-mark.svg" mono />
                      <div style={{
                        width: 96, height: 96, borderRadius: 10,
                        background: activeColor,
                        display: "grid", placeItems: "center",
                        color: "#fff", fontFamily: "ui-serif, Georgia, serif",
                        fontWeight: 700, fontSize: 44, flexShrink: 0,
                        border: "1px solid rgba(0,0,0,0.08)"
                      }}>P</div>
                    </div>
                  </div>
                  <div>
                    <S.FieldLabel hint="16:9, min. 1920×1080px, JPG">Hero image URL</S.FieldLabel>
                    <S.TextInput value="https://cdn.pizzademo.pl/brand/hero-oven.jpg" mono />
                    <div style={{
                      marginTop: 10,
                      width: "100%", aspectRatio: "16 / 9",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, #E63946 120%)",
                      border: "1px solid var(--admin-card-border)",
                      position: "relative", overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute", inset: 0,
                        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)"
                      }} />
                      <div style={{
                        position: "absolute", left: 24, bottom: 20,
                        color: "#fff", fontFamily: "var(--font-mono)", fontSize: 11,
                        opacity: 0.6
                      }}>{`{ hero-oven.jpg }`}</div>
                    </div>
                  </div>
                </div>
              </S.SectionCard>

              {/* Social */}
              <S.SectionCard title="Media społecznościowe" sub="Opcjonalne. Linki pojawiają się w stopce strony.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <S.FieldLabel>Facebook</S.FieldLabel>
                    <S.TextInput value="https://facebook.com/pizzademo" prefix="" mono />
                  </div>
                  <div>
                    <S.FieldLabel>Instagram</S.FieldLabel>
                    <S.TextInput value="https://instagram.com/pizzademo.krk" mono />
                  </div>
                </div>
              </S.SectionCard>
            </div>

            {/* Right: live mini preview */}
            {showPreview && (
              <div style={{ position: "sticky", top: 0, alignSelf: "start" }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                  textTransform: "uppercase", color: "var(--admin-text-muted)",
                  marginBottom: 10
                }}>Podgląd na stronie</div>
                <div style={{
                  borderRadius: 12, overflow: "hidden",
                  border: "1px solid var(--admin-card-border)",
                  background: "#fff"
                }}>
                  {/* fake browser chrome */}
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
                  {/* nav */}
                  <div style={{
                    padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                    borderBottom: "1px solid var(--admin-divider)"
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: activeColor,
                      display: "grid", placeItems: "center", color: "#fff",
                      fontFamily: "ui-serif, Georgia, serif", fontWeight: 700, fontSize: 14
                    }}>P</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Pizza Demo</div>
                    <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--admin-text-muted)" }}>Menu · Kontakt</div>
                  </div>
                  {/* hero */}
                  <div style={{
                    aspectRatio: "16 / 10",
                    background: "linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, " + activeColor + " 130%)",
                    color: "#fff", padding: 20,
                    display: "flex", flexDirection: "column", justifyContent: "flex-end",
                    position: "relative"
                  }}>
                    <div style={{
                      position: "absolute", inset: 0,
                      backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)"
                    }} />
                    <div style={{ position: "relative", fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: 0.08, textTransform: "uppercase", marginBottom: 4 }}>
                      Łomianki · od 2018
                    </div>
                    <div style={{ position: "relative", fontSize: 22, fontWeight: 800, letterSpacing: -0.015, lineHeight: 1.1, marginBottom: 6 }}>
                      Pizza Demo
                    </div>
                    <div style={{ position: "relative", fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 10, maxWidth: 220 }}>
                      Smacznie i szybko. Dostawa do 35 minut.
                    </div>
                    <button style={{
                      position: "relative", alignSelf: "flex-start",
                      height: 30, padding: "0 14px", borderRadius: 8,
                      border: "none", background: activeColor, color: "#fff",
                      fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>Zobacz menu</button>
                  </div>
                  {/* card */}
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 10, color: "var(--admin-text-muted)", letterSpacing: 0.06, textTransform: "uppercase", marginBottom: 6 }}>Z menu</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 6,
                        background: `linear-gradient(135deg, ${activeColor}1A, ${activeColor}33)`,
                        display: "grid", placeItems: "center", fontSize: 18
                      }}>🍕</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Margherita</div>
                        <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>Pomidor, mozzarella, bazylia</div>
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: activeColor }}>32,00 zł</div>
                    </div>
                  </div>
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

window.SectionGeneral = SectionGeneral;
