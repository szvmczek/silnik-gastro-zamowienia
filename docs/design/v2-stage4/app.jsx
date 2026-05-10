/* app.jsx — Stage 4 Settings canvas
   12 artboards: 1 hub + 5 real sections + 6 stubs. */

const { useState } = React;

const DEFAULTS = window.__STAGE4_DEFAULTS;

/* Choose which section component to render given an id */
function renderSection(id, opts = {}) {
  switch (id) {
    case "general":      return <window.SectionGeneral {...opts} />;
    case "hours":        return <window.SectionHours {...opts} />;
    case "content":      return <window.SectionContent {...opts} />;
    case "zones":        return <window.SectionZones {...opts} />;
    case "operations":   return <window.SectionOperations {...opts} />;
    case "notifications":return <window.SectionNotifications />;
    case "capacity":     return <window.SectionCapacity />;
    case "legal":        return <window.SectionLegal />;
    default:             return <window.SectionGeneral {...opts} />;
  }
}

const SETTINGS_LABEL = {
  general: "Ogólne",
  hours: "Godziny otwarcia",
  content: "Treści strony",
  zones: "Strefy dostawy",
  operations: "Operacje",
  notifications: "Powiadomienia",
  capacity: "Limity zamówień",
  legal: "RODO i regulaminy"
};

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  const tone = t.tone;
  const density = t.density;
  const soundOn = t.soundOn;
  const dirty = t.dirty;
  const showPreview = t.showPreview;
  const tempClosed = t.tempClosed;
  const active = t.activeSection;
  const newCount = 6;

  const common = { tone, density, soundOn, manualClose: false, newCount };
  const SettingsFrame = window.S.SettingsFrame;

  // Tweakable artboard (1st card, reflects panel state)
  const tweakable = (
    <DCArtboard id="tweakable" label={`/admin/settings · LIVE — sekcja: ${SETTINGS_LABEL[active]}`}
      width={1440} height={1000}>
      <SettingsFrame {...common} active={active}
        topbarTitle="Ustawienia" topbarSub={SETTINGS_LABEL[active]}>
        {renderSection(active, {
          dirty,
          showPreview,
          tempClosed: active === "operations" ? tempClosed : false
        })}
      </SettingsFrame>
    </DCArtboard>
  );

  return (
    <>
      <DesignCanvas
        title="Pizza Demo · Stage 4 — Ustawienia"
        subtitle="8 sekcji w master-detail · 5 realnych (MVP) + 3 stub (przyszłe aktualizacje). Desktop 1440 + mobile 375. Kliknięcie artboardu otwiera fullscreen, panel Tweaks po prawej przełącza sekcje na 1. artboardzie.">

        <DCSection id="hub" title="Hub & live preview">
          {tweakable}
        </DCSection>

        <DCSection id="real" title="5 sekcji realnych — pełny design">
          <DCArtboard id="general" label="/admin/settings · Ogólne (default)" width={1440} height={1480}>
            <SettingsFrame {...common} active="general" topbarTitle="Ustawienia" topbarSub="Ogólne">
              <window.SectionGeneral dirty={false} showPreview={true} />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="general-dirty" label="/admin/settings · Ogólne · stan dirty (zmiany niezapisane)" width={1440} height={1100}>
            <SettingsFrame {...common} active="general" topbarTitle="Ustawienia" topbarSub="Ogólne · niezapisane zmiany">
              <window.SectionGeneral dirty={true} showPreview={true} />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="hours" label="/admin/settings/hours · Godziny otwarcia" width={1440} height={1000}>
            <SettingsFrame {...common} active="hours" topbarTitle="Ustawienia" topbarSub="Godziny otwarcia">
              <window.SectionHours dirty={false} />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="content-hero" label="/admin/settings/content · Treści · tab Hero" width={1440} height={1100}>
            <SettingsFrame {...common} active="content" topbarTitle="Ustawienia" topbarSub="Treści strony · Hero">
              <window.SectionContent dirty={false} showPreview={true} initialTab="hero" />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="content-about" label="/admin/settings/content · Treści · tab About" width={1440} height={1100}>
            <SettingsFrame {...common} active="content" topbarTitle="Ustawienia" topbarSub="Treści strony · O nas">
              <window.SectionContent dirty={false} showPreview={true} initialTab="about" />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="zones" label="/admin/settings/zones · Strefy dostawy (rozwinięta strefa)" width={1440} height={1080}>
            <SettingsFrame {...common} active="zones" topbarTitle="Ustawienia" topbarSub="Strefy dostawy">
              <window.SectionZones dirty={false} />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="operations-open" label="/admin/settings/operations · Operacje · otwarte" width={1440} height={950}>
            <SettingsFrame {...common} active="operations" topbarTitle="Ustawienia" topbarSub="Operacje">
              <window.SectionOperations dirty={false} tempClosed={false} />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="operations-closed" label="/admin/settings/operations · tymczasowo zamknięte (banner + form)" width={1440} height={1100}>
            <SettingsFrame {...common} manualClose={true} active="operations" topbarTitle="Ustawienia" topbarSub="Operacje · zamknięte">
              <window.SectionOperations dirty={true} tempClosed={true} />
            </SettingsFrame>
          </DCArtboard>
        </DCSection>

        <DCSection id="stubs" title="3 sekcje stub — placeholdery z jednolitym layoutem (przyszłe aktualizacje)">
          <DCArtboard id="notifications" label="/admin/settings/notifications · Powiadomienia" width={1440} height={780}>
            <SettingsFrame {...common} active="notifications" topbarTitle="Ustawienia" topbarSub="Powiadomienia · wkrótce">
              <window.SectionNotifications />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="capacity" label="/admin/settings/capacity · Limity zamówień" width={1440} height={780}>
            <SettingsFrame {...common} active="capacity" topbarTitle="Ustawienia" topbarSub="Limity zamówień · wkrótce">
              <window.SectionCapacity />
            </SettingsFrame>
          </DCArtboard>

          <DCArtboard id="legal" label="/admin/settings/legal · RODO i regulaminy" width={1440} height={780}>
            <SettingsFrame {...common} active="legal" topbarTitle="Ustawienia" topbarSub="RODO i regulaminy · wkrótce">
              <window.SectionLegal />
            </SettingsFrame>
          </DCArtboard>
        </DCSection>

        <DCSection id="mobile" title="Mobile (375) — accordion-style nav dla settingsów">
          <DCArtboard id="mobile-hub" label="/admin/settings · mobile 375 · lista sekcji" width={420} height={860}>
            <SettingsMobileHub active={null} />
          </DCArtboard>
          <DCArtboard id="mobile-general" label="/admin/settings · mobile 375 · Ogólne otwarte" width={420} height={1100}>
            <SettingsMobileHub active="general" />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Sekcja na 1. artboardzie" />
        <TweakSelect label="Aktywna sekcja" value={active}
          options={Object.entries(SETTINGS_LABEL).map(([value, label]) => ({ value, label }))}
          onChange={(v) => setTweak("activeSection", v)} />

        <TweakSection label="Stan formularza" />
        <TweakToggle label="Niezapisane zmiany (dirty)" value={dirty}
          onChange={(v) => setTweak("dirty", v)} />
        <TweakToggle label="Live preview (sekcje 1, 3)" value={showPreview}
          onChange={(v) => setTweak("showPreview", v)} />

        <TweakSection label="Operacje" />
        <TweakToggle label="Tymczasowe zamknięcie aktywne" value={tempClosed}
          onChange={(v) => setTweak("tempClosed", v)} />

        <TweakSection label="Wygląd" />
        <TweakRadio label="Tonacja" value={tone}
          options={[{value: "warm", label: "Ciepła"}, {value: "cool", label: "Chłodna"}]}
          onChange={(v) => setTweak("tone", v)} />
        <TweakRadio label="Gęstość" value={density}
          options={[{value: "comfortable", label: "Wygodna"}, {value: "compact", label: "Kompakt"}]}
          onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </>
  );
}

/* ───────── Mobile hub (accordion-style nav) ───────── */
function SettingsMobileHub({ active }) {
  const A = window.A;
  const S = window.S;

  return (
    <div className="admin" data-tone="warm" data-density="comfortable" style={{
      width: "100%", height: "100%", overflow: "hidden",
      display: "flex", flexDirection: "column",
      background: "var(--admin-canvas)"
    }}>
      {/* Mobile topbar */}
      <header style={{
        height: 56, padding: "0 16px",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid var(--admin-divider)",
        background: "var(--admin-card)"
      }}>
        <button style={{
          width: 36, height: 36, borderRadius: 8, border: "none",
          background: "transparent", color: "var(--admin-text-body)",
          display: "grid", placeItems: "center", cursor: "pointer"
        }}><A.Icon d="M15 6l-6 6 6 6" size={18} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 2 }}>Konfiguracja</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Ustawienia</div>
        </div>
      </header>

      <div className="scrollbox" style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "16px 16px 80px" }}>
          {S.SECTIONS.map((sec, i) => {
            const open = active === sec.id;
            return (
              <div key={sec.id} style={{
                marginBottom: 8,
                background: "var(--admin-card)",
                border: "1px solid var(--admin-card-border)",
                borderRadius: 10,
                overflow: "hidden"
              }}>
                <button style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "14px 16px",
                  border: "none", background: "transparent",
                  textAlign: "left", cursor: "pointer", fontFamily: "inherit"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600,
                                   color: open ? "var(--admin-nav-active-text)" : "var(--admin-text-primary)" }}>
                      {sec.label}
                      {sec.stub && (
                        <span style={{
                          marginLeft: 6, fontSize: 10, fontWeight: 600, letterSpacing: 0.04,
                          textTransform: "uppercase", padding: "2px 6px", borderRadius: 4,
                          background: "rgba(244, 162, 97, 0.18)", color: "#9A5A1F"
                        }}>Wkrótce</span>
                      )}
                    </div>
                  </div>
                  <span style={{
                    color: "var(--admin-text-muted)",
                    transform: open ? "rotate(90deg)" : "rotate(0)",
                    transition: "transform 180ms"
                  }}>
                    <A.Icon d="M9 6l6 6-6 6" size={16} />
                  </span>
                </button>

                {open && sec.id === "general" && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--admin-divider)" }}>
                    <div style={{ paddingTop: 14 }}>
                      <S.FieldLabel required>Nazwa restauracji</S.FieldLabel>
                      <S.TextInput value="Pizza Demo" />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <S.FieldLabel>Slogan</S.FieldLabel>
                      <S.TextInput value="Smacznie i szybko. Dostawa do 35 minut." />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <S.FieldLabel>Kolor marki</S.FieldLabel>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["#E63946", "#2A8A4E", "#E07A1F", "#5A6B3A", "#3B5BDB", "#1F2937"].map((c, i) => (
                          <div key={i} style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: c,
                            border: i === 0 ? "2px solid var(--admin-text-primary)" : "1px solid rgba(0,0,0,0.08)",
                            outline: i === 0 ? "2px solid #fff" : "none",
                            outlineOffset: -4
                          }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <S.FieldLabel>Telefon</S.FieldLabel>
                      <S.TextInput value="+48 600 100 200" mono />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <S.FieldLabel>Email</S.FieldLabel>
                      <S.TextInput value="kontakt@pizzademo.pl" />
                    </div>
                    <button style={{
                      width: "100%", marginTop: 18,
                      height: 44, borderRadius: 8, border: "none",
                      background: "var(--color-primary)", color: "#fff",
                      fontSize: 14, fontWeight: 600
                    }}>Zapisz zmiany</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
