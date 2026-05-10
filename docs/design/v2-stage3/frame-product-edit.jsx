/* frame-product-edit.jsx
   /admin/menu/products/:id — Edit product
   Forma: warianty (S/M/L) + grupy dodatków + zdjęcie + flagi. */

const FieldLabel = ({ children, hint }) => (
  <div style={{ marginBottom: 6 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-body)" }}>{children}</span>
    {hint && (
      <span style={{ fontSize: 12, color: "var(--admin-text-faint)", marginLeft: 8 }}>· {hint}</span>
    )}
  </div>
);

const TextInput = ({ value, ...props }) => (
  <input
    defaultValue={value}
    style={{
      width: "100%", height: 40, padding: "0 12px",
      borderRadius: 8, border: "1px solid var(--admin-card-border)",
      background: "var(--admin-card)", fontSize: 14, color: "var(--admin-text-primary)",
      outline: "none", boxSizing: "border-box"
    }}
    {...props}
  />
);

const ProductEditFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false, newCount = 6 }) => {
  const variants = [
    { name: "Mała 28 cm",  price: 28, sku: "MARG-28", active: true },
    { name: "Średnia 32 cm", price: 32, sku: "MARG-32", active: true },
    { name: "Duża 40 cm",  price: 42, sku: "MARG-40", active: true }
  ];
  const groups = [
    { name: "Dodatkowe składniki", required: false, multi: true, count: 12 },
    { name: "Sos do pizzy",        required: false, multi: false, count: 4 },
    { name: "Pakowanie",            required: true,  multi: false, count: 2 }
  ];

  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <window.A.Sidebar active="menu" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title="Margherita"
          subtitle="Edycja produktu"
          breadcrumb="Konfiguracja › Menu › Produkty"
          soundOn={soundOn}
          density={density}
          actions={
            <>
              <button style={{
                height: 36, padding: "0 14px", borderRadius: 8,
                border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>Anuluj</button>
              <button style={{
                height: 36, padding: "0 16px", borderRadius: 8, border: "none",
                background: "var(--color-primary)", color: "#fff",
                fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}>Zapisz zmiany</button>
            </>
          }
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: 16, maxWidth: 1100 }}>
            {/* LEFT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <window.A.Card style={{ padding: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>Podstawowe</h3>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                  <div>
                    <FieldLabel>Nazwa produktu</FieldLabel>
                    <TextInput value="Margherita" />
                  </div>
                  <div>
                    <FieldLabel>Kategoria</FieldLabel>
                    <select style={{
                      width: "100%", height: 40, padding: "0 12px", borderRadius: 8,
                      border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                      fontSize: 14
                    }}>
                      <option>Pizze</option><option>Kurczaki</option>
                      <option>Zapiekanki</option><option>Frytki</option>
                      <option>Piwo & napoje</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <FieldLabel hint="Pokazane na karcie i w modalu produktu">Opis</FieldLabel>
                  <textarea
                    defaultValue="Klasyczna pizza neapolitańska — pomidory San Marzano, mozzarella fior di latte, świeża bazylia, oliwa extra virgin."
                    style={{
                      width: "100%", minHeight: 84, padding: "10px 12px",
                      borderRadius: 8, border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", fontSize: 14, fontFamily: "inherit",
                      resize: "vertical", outline: "none", boxSizing: "border-box",
                      lineHeight: 1.5
                    }}
                  />
                </div>
              </window.A.Card>

              <window.A.Card style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Warianty rozmiaru</h3>
                  <button style={{
                    height: 30, padding: "0 12px", borderRadius: 6,
                    border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>+ Dodaj wariant</button>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "30px 1fr 110px 130px 80px 40px",
                  gap: 10, padding: "8px 4px",
                  borderBottom: "1px solid var(--admin-divider)",
                  fontSize: 11, color: "var(--admin-text-muted)",
                  letterSpacing: 0.04, textTransform: "uppercase", fontWeight: 700
                }}>
                  <span></span><span>Nazwa</span><span>Cena</span><span>SKU</span><span>Aktywny</span><span></span>
                </div>
                {variants.map((v, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "30px 1fr 110px 130px 80px 40px",
                    gap: 10, padding: "10px 4px", alignItems: "center",
                    borderBottom: i < variants.length - 1 ? "1px solid var(--admin-divider)" : "none"
                  }}>
                    <span style={{ color: "var(--admin-text-faint)", cursor: "grab" }}>⋮⋮</span>
                    <TextInput value={v.name} />
                    <div style={{ position: "relative" }}>
                      <input defaultValue={v.price} style={{
                        width: "100%", height: 36, padding: "0 32px 0 12px",
                        borderRadius: 8, border: "1px solid var(--admin-card-border)",
                        background: "var(--admin-card)", fontSize: 14, fontFamily: "var(--font-mono)",
                        outline: "none", boxSizing: "border-box"
                      }} />
                      <span style={{
                        position: "absolute", right: 12, top: 9,
                        fontSize: 12, color: "var(--admin-text-muted)"
                      }}>zł</span>
                    </div>
                    <input defaultValue={v.sku} style={{
                      width: "100%", height: 36, padding: "0 12px",
                      borderRadius: 8, border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)", fontSize: 13, fontFamily: "var(--font-mono)",
                      outline: "none", boxSizing: "border-box", color: "var(--admin-text-muted)"
                    }} />
                    <span>
                      <span style={{
                        display: "inline-block", width: 36, height: 20, borderRadius: 9999,
                        background: v.active ? "var(--status-ready)" : "var(--admin-card-border)",
                        position: "relative"
                      }}>
                        <span style={{
                          position: "absolute", top: 2, left: v.active ? 18 : 2,
                          width: 16, height: 16, borderRadius: 9999, background: "#fff"
                        }} />
                      </span>
                    </span>
                    <button style={{
                      width: 30, height: 30, borderRadius: 6, border: "none",
                      background: "transparent", color: "var(--admin-text-muted)", cursor: "pointer"
                    }}>×</button>
                  </div>
                ))}
              </window.A.Card>

              <window.A.Card style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Grupy dodatków</h3>
                  <button style={{
                    height: 30, padding: "0 12px", borderRadius: 6,
                    border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer"
                  }}>+ Przypisz grupę</button>
                </div>
                {groups.map((g, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 12px", borderRadius: 8,
                    background: "var(--admin-row-hover)",
                    marginBottom: i < groups.length - 1 ? 8 : 0
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--admin-text-primary)" }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginTop: 2 }}>
                        {g.count} dodatków · {g.required ? "wymagane" : "opcjonalne"} · {g.multi ? "wielokrotny wybór" : "jeden wybór"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{
                        height: 30, padding: "0 12px", borderRadius: 6,
                        border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                        fontSize: 12, cursor: "pointer"
                      }}>Edytuj</button>
                      <button style={{
                        width: 30, height: 30, borderRadius: 6, border: "none",
                        background: "transparent", color: "var(--admin-text-muted)", cursor: "pointer"
                      }}>×</button>
                    </div>
                  </div>
                ))}
              </window.A.Card>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Zdjęcie
                </h4>
                <div style={{
                  width: "100%", aspectRatio: "1 / 1", borderRadius: 10,
                  background: "linear-gradient(135deg, #FCEEEF, #F5F2EA)",
                  display: "grid", placeItems: "center", fontSize: 80,
                  border: "1px solid var(--admin-card-border)"
                }}>🍕</div>
                <button style={{
                  width: "100%", height: 36, marginTop: 10, borderRadius: 8,
                  border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}>Zmień zdjęcie</button>
              </window.A.Card>

              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Status
                </h4>
                {[
                  { label: "Produkt aktywny", val: true, hint: "Widoczny w menu" },
                  { label: "Oznacz jako Hit",   val: false, hint: "Badge na karcie" },
                  { label: "Tymczasowo niedostępny", val: false, hint: "Pokaż jako 'Wyprzedane'" }
                ].map((f, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid var(--admin-divider)" : "none"
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</div>
                      <div style={{ fontSize: 11, color: "var(--admin-text-muted)", marginTop: 2 }}>{f.hint}</div>
                    </div>
                    <span style={{
                      display: "inline-block", width: 36, height: 20, borderRadius: 9999,
                      background: f.val ? "var(--status-ready)" : "var(--admin-card-border)",
                      position: "relative", flexShrink: 0, marginTop: 2
                    }}>
                      <span style={{
                        position: "absolute", top: 2, left: f.val ? 18 : 2,
                        width: 16, height: 16, borderRadius: 9999, background: "#fff"
                      }} />
                    </span>
                  </div>
                ))}
              </window.A.Card>

              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Sprzedaż 30 dni
                </h4>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 700 }}>
                  184 szt.
                </div>
                <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                  5&nbsp;888 zł · top #1 w&nbsp;kategorii Pizze
                </div>
              </window.A.Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

window.ProductEditFrame = ProductEditFrame;
