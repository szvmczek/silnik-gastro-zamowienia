/* section-operations.jsx
   Settings → Operacje.
   Prep time + temporary close (with conditional fields) + payment methods. */

const SectionOperations = ({ dirty = false, tempClosed = false }) => {
  const S = window.S;
  const A = window.A;

  // ETA preview math (mock): now + 25 min
  const now = new Date();
  now.setMinutes(now.getMinutes() + 25);
  const eta = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="scrollbox" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "32px 32px 24px", maxWidth: 880 }}>
          <S.SectionHeader
            title="Operacje"
            sub="Ustawienia operacyjne wpływające na przyjmowanie zamówień: domyślne czasy ETA, ręczne wyłączenie restauracji, dostępne metody płatności." />

          {/* Prep time */}
          <S.SectionCard title="Domyślny czas przygotowania"
            sub="Bazowa wartość ETA dla nowych zamówień. Możesz nadpisać per zamówienie w panelu — to tylko punkt startowy.">
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "flex-start" }}>
              <div>
                <S.FieldLabel hint="5–120 min">Minuty</S.FieldLabel>
                <div style={{ position: "relative" }}>
                  <input
                    defaultValue="25"
                    type="number"
                    min={5} max={120} step={5}
                    style={{
                      width: "100%", height: 44, padding: "0 64px 0 16px",
                      borderRadius: 8, border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)",
                      fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600,
                      color: "var(--admin-text-primary)",
                      outline: "none", boxSizing: "border-box"
                    }}
                  />
                  <span style={{
                    position: "absolute", right: 16, top: 12,
                    fontSize: 13, color: "var(--admin-text-muted)",
                    pointerEvents: "none"
                  }}>min</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {[15, 25, 35, 45].map(v => (
                    <button key={v} style={{
                      height: 26, padding: "0 10px", borderRadius: 6,
                      border: "1px solid var(--admin-card-border)",
                      background: v === 25 ? "var(--color-primary-tint)" : "var(--admin-card)",
                      color: v === 25 ? "var(--color-primary)" : "var(--admin-text-muted)",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-mono)"
                    }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Live ETA preview */}
              <div style={{
                padding: "18px 20px", borderRadius: 10,
                background: "linear-gradient(135deg, var(--admin-row-hover), #FFFFFF)",
                border: "1px solid var(--admin-divider)"
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                  textTransform: "uppercase", color: "var(--admin-text-muted)",
                  marginBottom: 8
                }}>Podgląd ETA</div>
                <div style={{ fontSize: 13, color: "var(--admin-text-body)", marginBottom: 8 }}>
                  Nowe zamówienie złożone teraz dostanie ETA:
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700,
                    color: "var(--color-primary)", letterSpacing: -0.01
                  }}>{eta}</span>
                  <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                    (teraz + 25 min)
                  </span>
                </div>
              </div>
            </div>
          </S.SectionCard>

          <div style={{ height: 16 }} />

          {/* Minimum order */}
          <S.SectionCard title="Minimum zamówienia"
            sub="Klient nie może złożyć zamówienia poniżej tej kwoty. Zostaw 0 jeśli bez minimum.">
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, alignItems: "flex-start" }}>
              <div>
                <S.FieldLabel hint="0–500 zł">Kwota minimalna</S.FieldLabel>
                <div style={{ position: "relative" }}>
                  <input
                    defaultValue="35"
                    type="number"
                    min={0} max={500} step={5}
                    style={{
                      width: "100%", height: 44, padding: "0 48px 0 16px",
                      borderRadius: 8, border: "1px solid var(--admin-card-border)",
                      background: "var(--admin-card)",
                      fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600,
                      color: "var(--admin-text-primary)",
                      outline: "none", boxSizing: "border-box"
                    }}
                  />
                  <span style={{
                    position: "absolute", right: 16, top: 12,
                    fontSize: 13, color: "var(--admin-text-muted)",
                    pointerEvents: "none"
                  }}>zł</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {[0, 25, 35, 50].map(v => (
                    <button key={v} style={{
                      height: 26, padding: "0 10px", borderRadius: 6,
                      border: `1px solid ${v === 35 ? "var(--color-primary)" : "var(--admin-card-border)"}`,
                      background: v === 35 ? "var(--color-primary-tint)" : "var(--admin-card)",
                      color: v === 35 ? "var(--color-primary)" : "var(--admin-text-muted)",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--font-mono)"
                    }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Message preview */}
              <div style={{
                padding: "18px 20px", borderRadius: 10,
                background: "linear-gradient(135deg, var(--admin-row-hover), #FFFFFF)",
                border: "1px solid var(--admin-divider)"
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                  textTransform: "uppercase", color: "var(--admin-text-muted)",
                  marginBottom: 8
                }}>Podgląd komunikatu</div>
                <div style={{ fontSize: 13, color: "var(--admin-text-body)", marginBottom: 8, lineHeight: 1.5 }}>
                  Klient z koszykiem 28 zł zobaczy:
                </div>
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "var(--color-primary-tint)",
                  border: "1px solid rgba(230,57,70,0.18)",
                  color: "var(--color-primary)",
                  fontSize: 13, fontWeight: 600, lineHeight: 1.45
                }}>
                  „Brakuje 7 zł do minimalnej kwoty 35 zł.”
                </div>
              </div>
            </div>
          </S.SectionCard>

          <div style={{ height: 16 }} />

          {/* Temporary close */}
          <S.SectionCard padding={0}>
            <div style={{ padding: 22, paddingBottom: tempClosed ? 16 : 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Tymczasowe zamknięcie</h3>
                  <div style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.5 }}>
                    Wstrzymuje przyjmowanie zamówień. Klienci zobaczą banner z powodem na stronie głównej, a przycisk „Zamów” zostanie wyłączony.
                  </div>
                </div>
                <S.Switch value={tempClosed} />
              </div>
            </div>

            {tempClosed && (
              <div style={{
                padding: "20px 22px",
                borderTop: "1px solid var(--admin-divider)",
                background: "rgba(220,38,38,0.04)"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <S.FieldLabel required hint="max 200 znaków">Powód</S.FieldLabel>
                    <S.Textarea rows={2} value="Awaria pieca — wracamy o 18:00. Przepraszamy za niedogodności." />
                  </div>
                  <div>
                    <S.FieldLabel hint="opcjonalne">Otwarcie planowane na</S.FieldLabel>
                    <input
                      type="datetime-local"
                      defaultValue="2026-05-07T18:00"
                      style={{
                        width: "100%", height: 40, padding: "0 12px",
                        borderRadius: 8, border: "1px solid var(--admin-card-border)",
                        background: "var(--admin-card)",
                        fontSize: 14, fontFamily: "var(--font-mono)",
                        color: "var(--admin-text-primary)",
                        outline: "none", boxSizing: "border-box"
                      }}
                    />
                    <S.HelpText>
                      Jeśli zostawisz puste, restauracja będzie zamknięta dopóki nie wyłączysz tego ręcznie.
                    </S.HelpText>
                  </div>
                </div>

                {/* Banner preview */}
                <div style={{ marginTop: 18 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: 0.06,
                    textTransform: "uppercase", color: "var(--admin-text-muted)",
                    marginBottom: 8
                  }}>Tak będzie wyglądać banner w panelu</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 10,
                    background: "linear-gradient(180deg, #FEE2E2, #FCA5A5)",
                    border: "1px solid #DC2626",
                    color: "#7F1D1D"
                  }}>
                    <span style={{ fontSize: 20 }}>🚨</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>
                        Restauracja jest tymczasowo zamknięta
                      </div>
                      <div style={{ fontSize: 12, color: "#991B1B" }}>
                        Awaria pieca — wracamy o 18:00 · do 18:00
                      </div>
                    </div>
                    <button style={{
                      background: "#fff", color: "#991B1B", border: "1px solid #B91C1C",
                      borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
                    }}>Wznów</button>
                  </div>
                </div>
              </div>
            )}
          </S.SectionCard>

          <div style={{ height: 16 }} />

          {/* Payment methods */}
          <S.SectionCard title="Metody płatności"
            sub="W MVP wszystkie zamówienia są opłacane przy odbiorze lub dostawie.">
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 0.06,
              textTransform: "uppercase", color: "var(--admin-text-muted)",
              marginBottom: 10
            }}>Aktywne</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {[
                { label: "Gotówka przy odbiorze", tag: "PICKUP" },
                { label: "Gotówka przy dostawie", tag: "DELIVERY" }
              ].map((m, i) => (
                <div key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 14px", borderRadius: 9999,
                  background: "var(--status-ready-tint)",
                  color: "var(--status-ready)",
                  fontSize: 13, fontWeight: 600,
                  border: "1px solid rgba(16,185,129,0.25)"
                }}>
                  <window.A.Icon d="M4 12l5 5 11-12" size={14} stroke={2.4} />
                  <span style={{ color: "var(--admin-text-primary)" }}>{m.label}</span>
                  <span style={{
                    fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700,
                    padding: "2px 6px", borderRadius: 4,
                    background: "rgba(16,185,129,0.15)",
                    letterSpacing: 0.04
                  }}>{m.tag}</span>
                </div>
              ))}
            </div>

            <p style={{
              margin: 0,
              fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.55
            }}>
              Płatności online (BLIK, Przelewy24, karty) — będą dodane w przyszłej aktualizacji.
            </p>
          </S.SectionCard>
        </div>
      </div>
      <S.SaveBar dirty={dirty} />
    </div>
  );
};

window.SectionOperations = SectionOperations;
