// patterns.jsx — Kicker, info-bar, tracking timeline (horizontal + vertical)

const PH = ({ kicker, title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <div className="t-kicker t-kicker--accent" style={{ marginBottom: 10 }}>{kicker}</div>
    <h2 className="t-h2" style={{ margin: '0 0 8px 0' }}>{title}</h2>
    {sub && <p className="t-body" style={{ margin: 0, maxWidth: 720 }}>{sub}</p>}
  </div>
);

// ─────── Kicker pattern ───────
const KickerExample = ({ kicker, headline, color = 'muted' }) => (
  <div>
    <div className="t-kicker" style={{ color: color === 'accent' ? 'var(--color-primary)' : 'var(--color-text-muted)', marginBottom: 12 }}>{kicker}</div>
    <div className="t-h2" style={{ margin: 0 }}>{headline}</div>
  </div>
);

// ─────── Info-bar (signature) ───────
const InfoBar = ({ open = true }) => (
  <div style={{
    background: 'var(--color-bg-dark)', color: 'var(--color-text-on-dark)',
    padding: '20px 32px', borderRadius: 12,
    display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: open ? '#10B981' : '#DC2626' }} className={open ? 'is-pulsing' : ''} />
      <span style={{ font: '600 14px/1 var(--font-sans)' }}>{open ? 'Otwarte teraz · do 22:00' : 'Zamknięte · otwieramy o 11:00'}</span>
    </div>
    <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>🚗</span>
      <span style={{ font: '400 14px/1 var(--font-sans)', color: 'rgba(255,255,255,0.85)' }}>Dostawa <strong style={{ color: '#fff' }}>35 min</strong></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>💰</span>
      <span style={{ font: '400 14px/1 var(--font-sans)', color: 'rgba(255,255,255,0.85)' }}>Min. <strong style={{ color: '#fff' }}>30 zł</strong></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>🛵</span>
      <span style={{ font: '400 14px/1 var(--font-sans)', color: 'rgba(255,255,255,0.85)' }}>Dowóz od <strong style={{ color: '#fff' }}>8 zł</strong></span>
    </div>
  </div>
);

// ─────── Tracking timeline horizontal ───────
const TimelineH = () => {
  const steps = [
    { icon: '⏳', label: 'Złożone', state: 'done', time: '18:12' },
    { icon: '✓', label: 'Przyjęte', state: 'done', time: '18:13' },
    { icon: '👨‍🍳', label: 'W przygotowaniu', state: 'active', time: '18:18' },
    { icon: '🛵', label: 'W drodze', state: 'pending', time: null },
    { icon: '🎉', label: 'Dostarczone', state: 'pending', time: null },
  ];
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, padding: '40px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {/* line */}
        <div style={{ position: 'absolute', top: 24, left: 24, right: 24, height: 2, background: 'var(--color-border-card)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 24, left: 24, width: 'calc((100% - 48px) * 0.5)', height: 2, background: 'var(--color-primary)', zIndex: 0 }} />

        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1, width: 100 }}>
            <div className={s.state === 'active' ? 'is-pulsing' : ''} style={{
              width: s.state === 'pending' ? 36 : 48, height: s.state === 'pending' ? 36 : 48,
              borderRadius: '50%',
              background: s.state === 'pending' ? '#fff' : 'var(--color-primary)',
              border: s.state === 'pending' ? '2px solid var(--color-border-strong)' : 'none',
              color: s.state === 'pending' ? 'var(--color-text-faint)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, transition: 'all 200ms'
            }}>{s.icon}</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: s.state === 'active' ? '700 13px/1.3 var(--font-sans)' : '500 13px/1.3 var(--font-sans)', color: s.state === 'pending' ? 'var(--color-text-faint)' : 'var(--color-text-primary)' }}>{s.label}</div>
              {s.time && <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.time}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────── Tracking timeline vertical (mobile) ───────
const TimelineV = () => {
  const steps = [
    { icon: '⏳', label: 'Złożone', state: 'done', time: '18:12' },
    { icon: '✓', label: 'Przyjęte', state: 'done', time: '18:13' },
    { icon: '👨‍🍳', label: 'W przygotowaniu', state: 'active', time: '18:18' },
    { icon: '🛵', label: 'W drodze', state: 'pending', time: null },
    { icon: '🎉', label: 'Dostarczone', state: 'pending', time: null },
  ];
  return (
    <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, padding: 24, width: 340 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', position: 'relative' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className={s.state === 'active' ? 'is-pulsing' : ''} style={{
              width: s.state === 'pending' ? 32 : 40, height: s.state === 'pending' ? 32 : 40,
              borderRadius: '50%',
              background: s.state === 'pending' ? '#fff' : 'var(--color-primary)',
              border: s.state === 'pending' ? '2px solid var(--color-border-strong)' : 'none',
              color: s.state === 'pending' ? 'var(--color-text-faint)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, flexShrink: 0
            }}>{s.icon}</div>
            {i < steps.length - 1 && (
              <div style={{
                width: 2, height: 36, marginTop: 4, marginBottom: 4,
                background: s.state === 'done' ? 'var(--color-primary)' : 'var(--color-border-card)'
              }} />
            )}
          </div>
          <div style={{ paddingTop: s.state === 'pending' ? 6 : 10, paddingBottom: 12, flex: 1 }}>
            <div style={{ font: s.state === 'active' ? '700 14px/1.3 var(--font-sans)' : '500 14px/1.3 var(--font-sans)', color: s.state === 'pending' ? 'var(--color-text-faint)' : 'var(--color-text-primary)' }}>{s.label}</div>
            {s.time && <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{s.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

const PatternsArtboard = () => (
  <div style={{ width: 1280, padding: '48px 56px', background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)' }}>

    {/* Kicker pattern */}
    <PH kicker="03a · Kicker" title="Editorial label nad nagłówkiem" sub="Mały tekst uppercase 600/0.06em nad nagłówkiem. Daje natychmiastowy editorial vibe — Cherry Bombe, Stripe Press. Używamy w hero, sekcjach landing, sidebarze admina, modal headers." />
    <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, padding: 32, marginBottom: 40, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
      <KickerExample kicker="PIZZA DEMO" headline="Smacznie i szybko." color="accent" />
      <KickerExample kicker="01 · DOSTAWA" headline="Adres dostawy" />
      <KickerExample kicker="CO DZIŚ JEMY" headline="Pizze klasyczne" />
      <KickerExample kicker="OPERACYJNE" headline="Kuchnia" />
    </div>

    {/* Info-bar */}
    <PH kicker="03b · Info-bar" title="Czarny pasek pod hero · brand signature" sub="#1A1A1A z 4 modułami: status otwarte/zamknięte (z pulse dot zielonym), czas dostawy, min. zamówienie, koszt dowozu. Live data z RestaurantSettings. Kontrast 14.2:1 z białym tekstem (AAA WCAG)." />
    <div style={{ marginBottom: 24 }}><InfoBar open /></div>
    <div style={{ marginBottom: 40 }}><InfoBar open={false} /></div>

    {/* Tracking */}
    <PH kicker="03c · Tracking timeline" title="Stepper z ikonami i pulsem" sub="Horyzontalny desktop, wertykalny mobile. Ikony per status (⏳ ✓ 👨‍🍳 🛵 🎉 ✕), aktywny krok z dot-pulse 1.5 s loop. Zakończone — primary fill. Pending — outline border-strong. Auto-refresh 15 s polling." />
    <div style={{ marginBottom: 24 }}>
      <div className="t-kicker" style={{ marginBottom: 12 }}>Desktop · horyzontalny</div>
      <TimelineH />
    </div>
    <div>
      <div className="t-kicker" style={{ marginBottom: 12 }}>Mobile 375 · wertykalny</div>
      <TimelineV />
    </div>
  </div>
);

window.PatternsArtboard = PatternsArtboard;
window.DSInfoBar = InfoBar;
window.DSTimelineH = TimelineH;
window.DSTimelineV = TimelineV;
