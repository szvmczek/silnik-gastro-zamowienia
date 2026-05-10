/* frame-order-detail.jsx
   /admin/orders/:id — Detal zamówienia
   Desktop two-column. Item-note jako żółty banner.
   Aside: Klient (bez "klient od X") · Adres · Płatność · Historia (z kto zmienił).
   EtaDialog: brak presetu zaznaczonego domyślnie.
   CancelDialog: presety jako chipy + textarea "inne". */

const OrderDetailFrame = ({ tone = "warm", density = "comfortable", soundOn = true, manualClose = false,
                            newCount = 6, highlightNote = true, dialog = null }) => {
  const order = {
    code: "#1042", customer: "Jan Kowalski", phone: "+48 600 100 200",
    address: "ul. Krakowska 12/4, 31-066 Kraków", note: "Domofon 12, drugie piętro",
    paid: false, type: "DELIVERY", placed: "16:42", confirmed: "16:43",
    paymentMethod: "Gotówka przy odbiorze", paymentStatus: "Nieopłacone"
  };
  const items = [
    { qty: 1, name: "Margherita", size: "32 cm", note: "Bez bazylii proszę", price: 32.00, mods: ["+ Mozzarella di bufala (+8 zł)"] },
    { qty: 1, name: "Capricciosa", size: "32 cm", note: null, price: 38.00, mods: [] },
    { qty: 2, name: "Coca-Cola 0,5 L", size: null, note: null, price: 9.90, mods: [] }
  ];
  const history = [
    { time: "16:42", label: "Zamówienie złożone", done: true, by: "Klient (online)" },
    { time: "16:43", label: "Potwierdzone", done: true, by: "Anna (kuchnia)" },
    { time: "16:46", label: "W przygotowaniu", done: true, current: true, by: "Anna (kuchnia)" },
    { time: "—",    label: "Gotowe", done: false },
    { time: "—",    label: "W dostawie", done: false },
    { time: "—",    label: "Dostarczone", done: false }
  ];

  return (
    <div className="admin" data-tone={tone} data-density={density}
      style={{ width: "100%", height: "100%", display: "flex", overflow: "hidden", position: "relative" }}>
      <window.A.Sidebar active="orders" newCount={newCount} density={density} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--admin-canvas)" }}>
        <window.A.Topbar
          title={`Zamówienie ${order.code}`}
          subtitle={`Złożone ${order.placed} · potwierdzone ${order.confirmed}`}
          breadcrumb="Archiwum › Wszystkie zamówienia"
          soundOn={soundOn}
          density={density}
          actions={
            <button style={{
              height: 36, padding: "0 14px", borderRadius: 8,
              border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
              fontSize: 13, fontWeight: 500, color: "var(--admin-text-body)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6
            }}>{window.A.Icons.printer} Drukuj</button>
          }
        />
        {manualClose && <window.A.ManualCloseBanner />}

        <div className="scrollbox" style={{ flex: 1, overflow: "auto", padding: 24 }}>
          {/* Status strip */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
            <window.A.StatusPill status="IN_PREPARATION" size="lg" />
            <span style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>· od 6 min</span>
            <div style={{ flex: 1 }} />
            <button style={{
              height: 38, padding: "0 14px", borderRadius: 8,
              border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
              fontSize: 13, color: "var(--admin-text-body)", cursor: "pointer"
            }}>Zmień ETA</button>
            <button style={{
              height: 38, padding: "0 14px", borderRadius: 8,
              border: "1px solid #FCA5A5", background: "var(--admin-card)",
              fontSize: 13, color: "var(--status-cancelled)", cursor: "pointer", fontWeight: 600
            }}>Anuluj zamówienie</button>
            <button style={{
              height: 38, padding: "0 18px", borderRadius: 8, border: "none",
              background: "var(--status-ready)", color: "#fff", fontWeight: 700,
              fontSize: 13, cursor: "pointer"
            }}>✓ Gotowe</button>
          </div>

          {/* Item note banner — focal */}
          {highlightNote && order.note && (
            <div style={{
              background: "#FFF8E1", border: "1px solid #FCD34D",
              borderLeft: "4px solid var(--status-new)",
              borderRadius: 8, padding: "14px 18px",
              marginBottom: 20, display: "flex", gap: 12,
              color: "#78350F"
            }}>
              <span style={{ color: "var(--status-new)", flexShrink: 0, marginTop: 2 }}>
                {window.A.Icons.warning}
              </span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                  Notka klienta do zamówienia
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                  {order.note}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 16 }}>
            {/* LEFT — items */}
            <window.A.Card style={{ padding: 0 }}>
              <div style={{
                padding: "16px 20px", borderBottom: "1px solid var(--admin-divider)",
                display: "flex", justifyContent: "space-between", alignItems: "baseline"
              }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Pozycje ({items.length})</h3>
                <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>4 sztuki w sumie</span>
              </div>

              {items.map((it, i) => (
                <div key={i} style={{
                  padding: "16px 20px",
                  borderBottom: i < items.length - 1 ? "1px solid var(--admin-divider)" : "none"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700,
                      color: "var(--admin-text-primary)", minWidth: 28
                    }}>
                      {it.qty}×
                    </span>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--admin-text-primary)" }}>
                        {it.name}
                        {it.size && (
                          <span style={{ fontWeight: 400, color: "var(--admin-text-muted)", marginLeft: 6 }}>
                            · {it.size}
                          </span>
                        )}
                      </div>
                      {it.mods.length > 0 && (
                        <ul style={{ margin: "6px 0 0", padding: "0 0 0 12px", fontSize: 13, color: "var(--admin-text-body)" }}>
                          {it.mods.map((m, j) => <li key={j} style={{ listStyle: "circle" }}>{m}</li>)}
                        </ul>
                      )}
                      {it.note && (
                        <div style={{
                          marginTop: 8, padding: "8px 10px",
                          background: highlightNote ? "#FFF8E1" : "var(--admin-row-hover)",
                          border: highlightNote ? "1px solid #FCD34D" : "1px dashed var(--admin-card-border)",
                          borderRadius: 6, fontSize: 13,
                          color: highlightNote ? "#78350F" : "var(--admin-text-muted)"
                        }}>
                          <strong>Notka:</strong> {it.note}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600,
                      color: "var(--admin-text-primary)"
                    }}>
                      {window.A.zl(it.qty * it.price)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div style={{ padding: "16px 20px", background: "var(--admin-row-hover)" }}>
                {[
                  ["Suma pozycji", "78,00 zł"],
                  ["Dostawa", "11,80 zł"],
                  ["Razem", "89,80 zł", true]
                ].map(([k, v, bold], i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: bold ? 16 : 13,
                    fontWeight: bold ? 700 : 400,
                    color: bold ? "var(--admin-text-primary)" : "var(--admin-text-body)",
                    padding: "4px 0"
                  }}>
                    <span>{k}</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </window.A.Card>

            {/* RIGHT — customer + address + payment + history */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Klient
                </h4>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--admin-text-primary)" }}>
                  {order.customer}
                </div>
                <a href="tel:" style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 14, color: "var(--color-primary)", textDecoration: "none",
                  marginTop: 6, fontWeight: 500
                }}>
                  {window.A.Icons.phone} {order.phone}
                </a>
              </window.A.Card>

              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Adres dostawy
                </h4>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>
                  {order.address}
                </div>
                <div style={{
                  marginTop: 12, padding: 10, background: "var(--admin-row-hover)",
                  borderRadius: 6, fontSize: 12, color: "var(--admin-text-muted)"
                }}>
                  Strefa B · 11,80 zł · ETA 35 min
                </div>
              </window.A.Card>

              {/* Płatność — nowa sekcja */}
              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 10px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Płatność
                </h4>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--admin-text-primary)" }}>
                    {order.paymentMethod}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 9999,
                    background: order.paid ? "var(--status-ready-tint)" : "var(--status-new-tint, #FFF8E1)",
                    color: order.paid ? "#065F46" : "#78350F",
                    letterSpacing: 0.04, textTransform: "uppercase"
                  }}>
                    {order.paymentStatus}
                  </span>
                </div>
                {!order.paid && (
                  <button style={{
                    width: "100%", height: 38, marginTop: 12,
                    borderRadius: 8, border: "1px solid var(--admin-card-border)",
                    background: "var(--admin-card)", color: "var(--admin-text-body)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer"
                  }}>
                    Oznacz jako opłacone
                  </button>
                )}
              </window.A.Card>

              <window.A.Card style={{ padding: 18 }}>
                <h4 style={{ margin: "0 0 14px", fontSize: 12, color: "var(--admin-text-muted)",
                             letterSpacing: 0.06, textTransform: "uppercase", fontWeight: 700 }}>
                  Historia statusu
                </h4>
                {history.map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                    <div style={{
                      width: 16, display: "flex", flexDirection: "column", alignItems: "center"
                    }}>
                      <span style={{
                        width: 10, height: 10, borderRadius: 9999,
                        background: s.done ? (s.current ? "var(--color-primary)" : "var(--status-ready)") : "var(--admin-card-border)",
                        marginTop: 4
                      }} className={s.current ? "is-pulsing" : ""} />
                      {i < arr.length - 1 && (
                        <span style={{
                          flex: 1, width: 2, minHeight: 22,
                          background: s.done ? "var(--status-ready)" : "var(--admin-card-border)"
                        }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < arr.length - 1 ? 12 : 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: s.current ? 700 : 500,
                        color: s.done ? "var(--admin-text-primary)" : "var(--admin-text-faint)"
                      }}>
                        {s.label}
                      </div>
                      <div style={{
                        fontSize: 11, color: "var(--admin-text-muted)",
                        display: "flex", gap: 8, marginTop: 2
                      }}>
                        <span style={{ fontFamily: "var(--font-mono)" }}>{s.time}</span>
                        {s.by && <span>· {s.by}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </window.A.Card>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        {dialog === "eta" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(15,18,25,0.42)",
            display: "grid", placeItems: "center", zIndex: 50
          }}>
            <div style={{
              background: "var(--admin-card)", borderRadius: 12,
              padding: 24, width: 440, boxShadow: "var(--shadow-lg)"
            }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Zmień szacowany czas</h3>
              <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginTop: 4 }}>
                Klient zobaczy zaktualizowane ETA na trackerze.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 16 }}>
                {["+10 min", "+20 min", "+30 min", "Inny…"].map((l, i) => (
                  <button key={i} style={{
                    height: 44, borderRadius: 8,
                    border: "1px solid var(--admin-card-border)",
                    background: "var(--admin-card)",
                    color: "var(--admin-text-body)",
                    fontWeight: 600, fontSize: 13, cursor: "pointer"
                  }}>{l}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                <button style={{
                  height: 38, padding: "0 16px", borderRadius: 8,
                  border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}>Anuluj</button>
                <button style={{
                  height: 38, padding: "0 18px", borderRadius: 8,
                  border: "none", background: "var(--color-primary)", color: "#fff",
                  fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>Zapisz</button>
              </div>
            </div>
          </div>
        )}
        {dialog === "cancel" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(15,18,25,0.42)",
            display: "grid", placeItems: "center", zIndex: 50
          }}>
            <div style={{
              background: "var(--admin-card)", borderRadius: 12,
              padding: 24, width: 480, boxShadow: "var(--shadow-lg)"
            }}>
              <div style={{ display: "flex", gap: 14 }}>
                <span style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--status-cancelled-tint)", color: "var(--status-cancelled)",
                  display: "grid", placeItems: "center", flexShrink: 0
                }}>
                  {window.A.Icons.warning}
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Anulować zamówienie #1042?</h3>
                  <p style={{ fontSize: 13, color: "var(--admin-text-body)", marginTop: 6, lineHeight: 1.5 }}>
                    Operacja jest nieodwracalna.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-text-body)" }}>
                  Powód
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {["Brak składnika", "Klient odwołał", "Brak kierowcy", "Restauracja zamknięta", "Awaria sprzętu", "Złe dane"].map((p, i) => (
                    <button key={i} style={{
                      height: 32, padding: "0 12px", borderRadius: 9999,
                      border: i === 0 ? "1.5px solid var(--color-primary)" : "1px solid var(--admin-card-border)",
                      background: i === 0 ? "var(--color-primary-tint)" : "var(--admin-card)",
                      color: i === 0 ? "var(--color-primary)" : "var(--admin-text-body)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>{p}</button>
                  ))}
                </div>
                <textarea
                  rows={3}
                  placeholder={'Inne (opcjonalnie) — np. „piec się popsuł, przepraszamy”'}
                  style={{
                    width: "100%", marginTop: 10, padding: "10px 12px",
                    borderRadius: 8, border: "1px solid var(--admin-card-border)",
                    background: "var(--admin-card)", fontSize: 13,
                    color: "var(--admin-text-primary)",
                    resize: "vertical", fontFamily: "inherit", lineHeight: 1.4
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
                <button style={{
                  height: 38, padding: "0 16px", borderRadius: 8,
                  border: "1px solid var(--admin-card-border)", background: "var(--admin-card)",
                  fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}>Wróć</button>
                <button style={{
                  height: 38, padding: "0 18px", borderRadius: 8,
                  border: "none", background: "var(--status-cancelled)", color: "#fff",
                  fontSize: 13, fontWeight: 700, cursor: "pointer"
                }}>Tak, anuluj zamówienie</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

window.OrderDetailFrame = OrderDetailFrame;
