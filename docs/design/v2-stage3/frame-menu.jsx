/* frame-menu.jsx
   /admin/menu — Menu overview, 4 tabs */

const MenuFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false,
                     newCount = 6, activeTab = "products" }) => {
  const tabs = [
    { id: "categories", label: "Kategorie", count: 5 },
    { id: "products",   label: "Produkty",  count: 38 },
    { id: "groups",     label: "Grupy dodatków", count: 6 },
    { id: "addons",     label: "Dodatki",   count: 24 }
  ];

  const products = [
    { name: "Margherita",            cat: "Pizze", variants: 3, price: "od 28 zł", active: true,  img: "🍕", badge: null },
    { name: "Capricciosa",           cat: "Pizze", variants: 3, price: "od 34 zł", active: true,  img: "🍕", badge: "Hit" },
    { name: "Diavola",               cat: "Pizze", variants: 3, price: "od 36 zł", active: true,  img: "🍕", badge: null },
    { name: "Hawajska",              cat: "Pizze", variants: 3, price: "od 34 zł", active: true,  img: "🍕", badge: null },
    { name: "Quattro Formaggi",      cat: "Pizze", variants: 3, price: "od 38 zł", active: false, img: "🍕", badge: null },
    { name: "Kurczak w cieście",     cat: "Kurczaki",      variants: 1, price: "32 zł",   active: true,  img: "🍗", badge: null },
    { name: "Zapiekanka klasyczna",  cat: "Zapiekanki",    variants: 2, price: "od 18 zł", active: true,  img: "🥖", badge: "Nowość" },
    { name: "Frytki belgijskie",     cat: "Frytki",        variants: 2, price: "od 12 zł", active: true,  img: "🍟", badge: null },
    { name: "Coca-Cola 0,5 L",       cat: "Piwo & napoje", variants: 1, price: "9,90 zł", active: true,  img: "🥤", badge: null }
  ];

  const categories = [
    { name: "Pizze", count: 14, sort: 1 },
    { name: "Kurczaki", count: 6, sort: 2 },
    { name: "Zapiekanki", count: 5, sort: 3 },
    { name: "Frytki", count: 4, sort: 4 },
    { name: "Piwo & napoje", count: 9, sort: 5 }
  ];

  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden" }}>
      <window.A.Sidebar active="menu" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title="Menu"
          subtitle="38 produktów · 5 kategorii"
          breadcrumb="Konfiguracja"
          soundOn={soundOn}
          density={density}
          actions={
            <button style={{
              height: 36, padding: "0 16px", borderRadius: 8, border: "none",
              background: "var(--color-primary)", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>
              + Dodaj produkt
            </button>
          }
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Tabs */}
          <div style={{
            display: "flex", gap: 24, borderBottom: "1px solid var(--admin-divider)",
            marginBottom: 20
          }}>
            {tabs.map(t => (
              <button key={t.id} style={{
                padding: "12px 0",
                background: "transparent", border: "none",
                borderBottom: `2px solid ${activeTab === t.id ? "var(--color-primary)" : "transparent"}`,
                marginBottom: -1,
                fontSize: 14, fontWeight: 600,
                color: activeTab === t.id ? "var(--color-primary)" : "var(--admin-text-muted)",
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8
              }}>
                {t.label}
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: activeTab === t.id ? "var(--color-primary-tint)" : "var(--admin-row-hover)",
                  color: activeTab === t.id ? "var(--color-primary)" : "var(--admin-text-muted)",
                  padding: "1px 7px", borderRadius: 9999
                }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {activeTab === "products" && (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{
                  flex: 1, position: "relative",
                  background: "var(--admin-card)", border: "1px solid var(--admin-card-border)",
                  borderRadius: 8, height: 38
                }}>
                  <span style={{ position: "absolute", left: 12, top: 9, color: "var(--admin-text-faint)" }}>
                    {window.A.Icons.search}
                  </span>
                  <input placeholder="Szukaj produktu…" style={{
                    width: "100%", height: "100%", border: "none", background: "transparent",
                    outline: "none", padding: "0 14px 0 40px", fontSize: 14, boxSizing: "border-box"
                  }} />
                </div>
                <select style={{
                  height: 38, padding: "0 12px", borderRadius: 8,
                  border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                  fontSize: 14
                }}>
                  <option>Wszystkie kategorie</option>
                  <option>Pizze</option><option>Kurczaki</option>
                  <option>Zapiekanki</option><option>Frytki</option>
                  <option>Piwo & napoje</option>
                </select>
              </div>

              <div style={{
                background: "var(--admin-card)", border: "1px solid var(--admin-card-border)",
                borderRadius: 10, overflow: "hidden"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "30px 60px 1fr 120px 100px 90px 80px 40px",
                  gap: 12, padding: "12px 16px",
                  background: "var(--admin-row-hover)",
                  borderBottom: "1px solid var(--admin-divider)",
                  fontSize: 11, color: "var(--admin-text-muted)",
                  letterSpacing: 0.04, textTransform: "uppercase", fontWeight: 700
                }}>
                  <span></span><span></span><span>Produkt</span><span>Kategoria</span>
                  <span>Warianty</span><span>Cena</span><span>Aktywny</span><span></span>
                </div>
                {products.map((p, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "30px 60px 1fr 120px 100px 90px 80px 40px",
                    gap: 12, padding: "12px 16px", alignItems: "center",
                    borderBottom: i < products.length - 1 ? "1px solid var(--admin-divider)" : "none",
                    opacity: p.active ? 1 : 0.55
                  }}>
                    <span style={{ color: "var(--admin-text-faint)", cursor: "grab", fontSize: 16 }}>⋮⋮</span>
                    <div style={{
                      width: 44, height: 44, borderRadius: 8,
                      background: "var(--admin-row-hover)", display: "grid", placeItems: "center",
                      fontSize: 22
                    }}>{p.img}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                        {p.name}
                        {p.badge && (
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                            background: p.badge === "Hit" ? "var(--status-new-tint)" : "var(--status-ready-tint)",
                            color: p.badge === "Hit" ? "#92400E" : "#065F46",
                            letterSpacing: 0.04, textTransform: "uppercase"
                          }}>{p.badge}</span>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--admin-text-body)" }}>{p.cat}</span>
                    <span style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>{p.variants} warianty</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>{p.price}</span>
                    <span>
                      <span style={{
                        display: "inline-block", width: 36, height: 20, borderRadius: 9999,
                        background: p.active ? "var(--status-ready)" : "var(--admin-card-border)",
                        position: "relative"
                      }}>
                        <span style={{
                          position: "absolute", top: 2, left: p.active ? 18 : 2,
                          width: 16, height: 16, borderRadius: 9999, background: "#fff",
                          transition: "left 180ms"
                        }} />
                      </span>
                    </span>
                    <button style={{
                      width: 30, height: 30, borderRadius: 6,
                      border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                      cursor: "pointer", color: "var(--admin-text-muted)"
                    }}>···</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "categories" && (
            <div style={{
              background: "var(--admin-card)", border: "1px solid var(--admin-card-border)",
              borderRadius: 10, padding: 8
            }}>
              {categories.map((c, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "30px 1fr 90px 90px 60px",
                  gap: 12, padding: "14px 12px", alignItems: "center",
                  borderBottom: i < categories.length - 1 ? "1px solid var(--admin-divider)" : "none"
                }}>
                  <span style={{ color: "var(--admin-text-faint)", cursor: "grab", fontSize: 16 }}>⋮⋮</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>{c.count} produkty</span>
                  <span style={{ fontSize: 13, color: "var(--admin-text-muted)", fontFamily: "var(--font-mono)" }}>
                    sort: {c.sort}
                  </span>
                  <button style={{
                    height: 30, padding: "0 12px", borderRadius: 6,
                    border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                    fontSize: 12, cursor: "pointer"
                  }}>Edytuj</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "groups" && (
            <div style={{ color: "var(--admin-text-muted)", fontSize: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "var(--admin-text-body)", marginBottom: 6 }}>6 grup dodatków</div>
              Sosy · Składniki extra · Mozzarella · Wegetariańskie · Bez glutenu · Pakowanie
            </div>
          )}
          {activeTab === "addons" && (
            <div style={{ color: "var(--admin-text-muted)", fontSize: 14, padding: 40, textAlign: "center" }}>
              <div style={{ fontWeight: 700, color: "var(--admin-text-body)", marginBottom: 6 }}>24 dodatki</div>
              Mozzarella di bufala · Pieczarki · Salami · Oliwki · Anchois · …
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

window.MenuFrame = MenuFrame;
